import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type ListingCategory = "Restaurant" | "Hotel" | "Attraction" | "Tour" | "Shopping" | "Nightlife" | "WeddingVenue";
type ContentKind = "listing" | "article";
// "curated_listing" reuses the import_jobs table but each item is a *restaurant
// or business name* (stored in the `url` column with a synthetic `curated://`
// prefix). The batch processor handles it by running Firecrawl Search +
// structured JSON extraction instead of a direct page scrape.
type JobKind = ContentKind | "curated_listing";

const NEIGHBORHOODS = [
  "Downtown", "Gaslamp Quarter", "Little Italy", "La Jolla", "Pacific Beach",
  "Mission Beach", "Ocean Beach", "Coronado", "Hillcrest", "North Park",
  "Mission Valley", "Old Town", "Point Loma", "Encinitas", "Carlsbad",
];

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 5;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function absUrl(u: string | undefined | null, base: string): string | null {
  if (!u) return null;
  try { return new URL(u, base).toString(); } catch { return null; }
}

async function firecrawlScrape(url: string) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY is not configured");
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown", "html"], onlyMainContent: true }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Firecrawl scrape failed [${res.status}]: ${t.slice(0, 400)}`);
  }
  const json = await res.json() as any;
  const data = json.data ?? json;
  return {
    markdown: (data.markdown ?? "") as string,
    html: (data.html ?? "") as string,
    metadata: (data.metadata ?? {}) as Record<string, any>,
    links: (data.links ?? []) as string[],
    sourceUrl: url,
  };
}

async function firecrawlMap(url: string, search?: string, limit = 50) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY is not configured");
  const res = await fetch("https://api.firecrawl.dev/v2/map", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, search, limit, includeSubdomains: false }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Firecrawl map failed [${res.status}]: ${t.slice(0, 400)}`);
  }
  const json = await res.json() as any;
  const data = json.data ?? json;
  const links: string[] = data.links ?? [];
  return links.map((l: any) => (typeof l === "string" ? l : l.url)).filter(Boolean);
}

// ---------- Brand voice + per-category prompt rules ----------

const BANNED_PHRASES = [
  "hidden gem", "must-visit", "must visit", "something for everyone",
  "nestled", "boasts", "step back in time", "feast for the senses",
  "world-class", "one-of-a-kind", "off the beaten path", "delight your senses",
];

const BRAND_VOICE = `VOICE & STYLE RULES (mandatory):
- Write as a knowledgeable San Diego local talking to a smart traveler. Second person ("you"), present tense.
- Be specific and concrete. Name dishes, room categories, ride types, eras — not generic adjectives.
- No marketing fluff. Banned phrases (do not use any form of these): ${BANNED_PHRASES.join(", ")}.
- NEVER copy any 8+ word run verbatim from the source. Synthesize, don't paraphrase.
- If a fact isn't in the source, omit it. Don't invent addresses, prices, or hours.`;

const CATEGORY_PROMPTS: Record<ListingCategory, string> = {
  Restaurant: `Structure the description in this exact order (one short paragraph each, separated by blank lines):
1. Hook — what kind of place this is in 1 sentence.
2. Cuisine + vibe — what they cook and the room/feel.
3. Signature dish or thing to order (be specific — name a dish if the source mentions it).
4. Who it's for (date night, group, solo at the bar, family, etc.).
5. Insider tip (best seat, best time, what to skip, reservation strategy).
Set price_range using $/$$/$$$/$$$$ if signal exists.`,
  Hotel: `Structure the description in this exact order:
1. Hook — what kind of stay this is.
2. Room style + standout amenity (rooftop, spa, beach access).
3. Best room category to book and why.
4. On-site dining or notable bar.
5. Insider tip (best view, what to ask for, neighborhood walking radius).`,
  Attraction: `Structure the description in this exact order:
1. Hook — what this is and why it's worth a visit.
2. What you actually see/do (be specific — exhibit names, animal species, ride types).
3. Time needed and best path through.
4. Who it's for.
5. Insider tip (timing, what to skip, parking).`,
  Tour: `Structure: 1) hook, 2) what you'll see/do (route, duration), 3) who it's best for, 4) what's included, 5) insider tip on timing or which version of the tour to pick.`,
  Shopping: `Structure: 1) hook (what kind of shop), 2) what they actually carry (named brands or maker categories), 3) standout item or section, 4) who it's for, 5) insider tip (sale timing, custom orders, parking).`,
  Nightlife: `Structure: 1) hook (kind of bar/club), 2) drink program + room/sound vibe, 3) signature drink or show, 4) crowd + dress, 5) insider tip (best night, cover policy, secret room).`,
  WeddingVenue: `Structure the description in this exact order (one short paragraph each, separated by blank lines):
1. Hook — what kind of wedding venue this is and the overall feel.
2. Setting & spaces — indoor vs outdoor ceremony spots, reception room style, scenic backdrop.
3. Capacity & layout — typical guest count range, ceremony + reception flow, get-ready suites.
4. What's included — catering, in-house coordinator, rentals, accommodations, parking.
5. Insider tip — best season/time, off-peak pricing, photo spots, scheduling note.
Set price_range using $/$$/$$$/$$$$ if signal exists.`,
};

const ORIGINALITY_INSTRUCTION = `\n\nYour previous attempt copied too much from the source. Rewrite from scratch — synthesize the facts, but NEVER reuse 8-word runs from the source text. Vary sentence structure entirely.`;

function tokenize(s: string): string[] {
  return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

/** Compute share of generated 5-grams that also appear in the source. 0 = fully original, 1 = identical. */
function originalityOverlap(generated: string, source: string): number {
  const gen = tokenize(generated);
  const src = tokenize(source);
  if (gen.length < 5) return 0;
  const N = 5;
  const srcSet = new Set<string>();
  for (let i = 0; i + N <= src.length; i++) srcSet.add(src.slice(i, i + N).join(" "));
  if (srcSet.size === 0) return 0;
  let hits = 0;
  let total = 0;
  for (let i = 0; i + N <= gen.length; i++) {
    total++;
    if (srcSet.has(gen.slice(i, i + N).join(" "))) hits++;
  }
  return total === 0 ? 0 : hits / total;
}

async function aiNormalize(
  scraped: { markdown: string; metadata: Record<string, any>; sourceUrl: string },
  kind: ContentKind,
): Promise<{ record: any; originality_score: number }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const schema =
    kind === "listing"
      ? {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["listing"] },
            name: { type: "string" },
            category: { type: "string", enum: ["Restaurant", "Hotel", "Attraction", "Tour", "Shopping", "Nightlife", "WeddingVenue"] },
            neighborhood: { type: "string" },
            short_description: { type: "string", description: "1 sentence, max 180 chars, no banned phrases." },
            description: { type: "string", description: "Multi-paragraph editorial description following the per-category structure." },
            editor_note: { type: "string", description: "1–3 sentences: a local-perspective angle (best patio, best Friday night, etc.) — original commentary not in the source." },
            why_we_picked_it: { type: "array", items: { type: "string" }, description: "3–5 short reason chips like 'Date night', 'Outdoor seating', 'Walk-ins welcome'." },
            insider_tip: { type: "string", description: "1 sentence — best seat, what to order, when to go." },
            best_time_to_visit: { type: "string", description: "Short — e.g. 'Weeknights before 6:30pm' or 'Sunday brunch'." },
            local_context: { type: "string", description: "1–2 sentences placing the spot in its neighborhood (what's nearby, walking radius)." },
            address: { type: "string" },
            phone: { type: "string" },
            website: { type: "string" },
            price_range: { type: "string" },
            meta_title: { type: "string", description: "Max 65 chars, includes neighborhood + a signature trait so two listings never share a meta title." },
            meta_description: { type: "string", description: "Max 155 chars, original sentence — not a copy of short_description." },
            wedding_details: {
              type: "object",
              description: "ONLY populate when category is WeddingVenue. Extract from the source page (WeddingWire, The Knot, Zola, the venue's own site).",
              properties: {
                venue_types: { type: "array", items: { type: "string" }, description: "e.g. 'Estate / Private Mansion', 'Beach / Waterfront', 'Garden', 'Ballroom', 'Barn / Farm', 'Hotel / Resort', 'Winery / Vineyard'." },
                settings: { type: "array", items: { type: "string" }, description: "e.g. 'Oceanfront', 'Garden', 'Historic', 'Indoor', 'Outdoor', 'Rooftop'." },
                ceremony_capacity: { type: "number" },
                reception_capacity: { type: "number" },
                min_capacity: { type: "number" },
                max_capacity: { type: "number" },
                get_ready_rooms: { type: "boolean" },
                starting_price: { type: "string", description: "Lowest published price, e.g. '$8,500'." },
                peak_price: { type: "string" },
                off_peak_price: { type: "string" },
                average_price: { type: "string" },
                response_time: { type: "string", description: "Typical vendor response time, e.g. '24 hours'." },
                spaces: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      capacity: { type: "string" },
                      type: { type: "string", description: "Indoor / Outdoor / Covered, etc." },
                      description: { type: "string" },
                    },
                  },
                },
                event_types: { type: "array", items: { type: "string" }, description: "e.g. 'Ceremony', 'Reception', 'Rehearsal dinner', 'Bridal shower'." },
                services: { type: "array", items: { type: "string" }, description: "e.g. 'Catering', 'Bar service', 'Coordinator', 'Cake', 'Setup/cleanup'." },
                items_included: { type: "array", items: { type: "string" }, description: "e.g. 'Tables', 'Chairs', 'Linens', 'Sound system'." },
                accessibility: { type: "array", items: { type: "string" }, description: "e.g. 'Wheelchair accessible', 'Elevator', 'Accessible parking'." },
              },
              additionalProperties: false,
            },
          },
          required: ["kind", "name", "category", "neighborhood", "short_description", "description", "editor_note", "why_we_picked_it", "insider_tip", "local_context", "meta_title", "meta_description"],
          additionalProperties: false,
        }
      : {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["article"] },
            title: { type: "string" },
            category: { type: "string" },
            excerpt: { type: "string" },
            body: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            read_time_minutes: { type: "number" },
            meta_title: { type: "string" },
            meta_description: { type: "string" },
          },
          required: ["kind", "title", "category", "excerpt", "body"],
          additionalProperties: false,
        };

  // Detect category from source for the right per-category prompt
  let detectedCategory: ListingCategory = "Restaurant";
  if (kind === "listing") {
    const blob = `${scraped.metadata?.title ?? ""} ${scraped.metadata?.description ?? ""} ${scraped.sourceUrl} ${scraped.markdown.slice(0, 2000)}`.toLowerCase();
    if (/weddingwire|theknot|zola\.com\/wedding|\bwedding venue|wedding venues|ceremony|reception venue|bridal/.test(blob)) detectedCategory = "WeddingVenue";
    else if (/\bhotel|resort|inn\b/.test(blob)) detectedCategory = "Hotel";
    else if (/\btour|cruise|excursion\b/.test(blob)) detectedCategory = "Tour";
    else if (/\bbar|club|lounge|nightlife\b/.test(blob)) detectedCategory = "Nightlife";
    else if (/\bmuseum|park|zoo|attraction|gallery\b/.test(blob)) detectedCategory = "Attraction";
    else if (/\bshop|store|boutique|market\b/.test(blob)) detectedCategory = "Shopping";
  }

  const baseSys =
    kind === "listing"
      ? `You convert scraped web content into a clean San Diego listing record for sandiego.com — an editorial guide, NOT a directory.
Pick the best matching neighborhood from this list when possible: ${NEIGHBORHOODS.join(", ")}.
Detect the listing category accurately.

${BRAND_VOICE}

CATEGORY-SPECIFIC STRUCTURE (use the structure that matches the detected category — likely ${detectedCategory}):
${CATEGORY_PROMPTS[detectedCategory]}

The editor_note, insider_tip, and local_context fields are PROPRIETARY editorial content — invent them from your knowledge of San Diego, do not copy them from the source.

When category is "WeddingVenue", you MUST also populate the wedding_details object with every field you can extract from the source (capacities, venue types, settings, event spaces, services, items included, accessibility, peak/off-peak pricing, response time). On WeddingWire, The Knot, and Zola pages this data is on the page in labelled sections — read it carefully.`
      : `You convert scraped web content into a clean San Diego editorial article. Preserve the structure with semantic HTML. ${BRAND_VOICE} Estimate read time (~200 wpm).`;

  const userMsg = `Source URL: ${scraped.sourceUrl}
Page title: ${scraped.metadata?.title ?? ""}
Page description: ${scraped.metadata?.description ?? ""}

Scraped content (markdown):
${scraped.markdown.slice(0, 15000)}`;

  async function callOnce(extraSys: string) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: baseSys + extraSys },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_schema", json_schema: { name: "import_record", strict: true, schema } },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI normalization failed [${res.status}]: ${t.slice(0, 400)}`);
    }
    const json = (await res.json()) as any;
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty content");
    return JSON.parse(content);
  }

  let record = await callOnce("");
  let overlap = kind === "listing"
    ? originalityOverlap(`${record.short_description ?? ""} ${record.description ?? ""}`, scraped.markdown)
    : originalityOverlap(`${record.excerpt ?? ""} ${record.body ?? ""}`, scraped.markdown);

  // If too much overlap with the source, regenerate once with a stronger instruction.
  if (overlap > 0.25) {
    try {
      const retry = await callOnce(ORIGINALITY_INSTRUCTION);
      const retryOverlap = kind === "listing"
        ? originalityOverlap(`${retry.short_description ?? ""} ${retry.description ?? ""}`, scraped.markdown)
        : originalityOverlap(`${retry.excerpt ?? ""} ${retry.body ?? ""}`, scraped.markdown);
      if (retryOverlap < overlap) {
        record = retry;
        overlap = retryOverlap;
      }
    } catch {
      // keep first attempt
    }
  }

  const originality_score = Math.max(0, Math.min(1, 1 - overlap));
  return { record, originality_score };
}

function pickHeroImage(html: string, metadata: Record<string, any>, base: string): string | null {
  const fromMeta = metadata?.ogImage ?? metadata?.og?.image ?? metadata?.["og:image"];
  if (fromMeta) {
    const u = absUrl(typeof fromMeta === "string" ? fromMeta : fromMeta?.[0], base);
    if (u) return u;
  }
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return absUrl(m[1], base);
  return null;
}

const RESERVATION_HOSTS = [
  "opentable.com", "resy.com", "exploretock.com", "tockify.com",
  "sevenrooms.com", "yelp.com/reservations", "tablein.com",
  "booking.com", "expedia.com", "hotels.com",
  "getyourguide.com", "viator.com",
];

/** Scan scraped page for an OpenTable/Resy/Tock/etc. booking link. */
function pickReservationUrl(html: string, links: string[] = []): string | null {
  const candidates: string[] = [...(links ?? [])];
  // Also scrape <a href="..."> from HTML in case Firecrawl didn't return links.
  const hrefRe = /<a[^>]+href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(html)) !== null) candidates.push(m[1]);
  for (const raw of candidates) {
    if (!raw || typeof raw !== "string") continue;
    const lower = raw.toLowerCase();
    if (RESERVATION_HOSTS.some((h) => lower.includes(h))) {
      try { return new URL(raw).toString(); } catch { /* skip */ }
    }
  }
  return null;
}

/** Quality gate: returns the reason a listing should NOT auto-publish, or null if OK. */
function listingPublishBlock(payload: {
  description: string | null;
  editor_note: string | null;
  hero_image: string | null;
  originality_score: number | null;
}): string | null {
  if (!payload.description || payload.description.trim().length < 300) return "description shorter than 300 chars";
  if (!payload.editor_note || !payload.editor_note.trim()) return "missing editor_note";
  if (!payload.hero_image) return "missing hero image";
  if ((payload.originality_score ?? 0) < 0.6) return `originality score below threshold (${(payload.originality_score ?? 0).toFixed(2)})`;
  return null;
}

async function insertListing(
  record: any,
  hero: string | null,
  autoPublish: boolean,
  reservationUrl: string | null = null,
  ctx: { sourceUrl?: string | null; originalityScore?: number | null; curatorId?: string | null } = {},
): Promise<{ id: string; slug: string; status: "published" | "draft"; blockedReason: string | null }> {
  const slug = slugify(record.name);
  const description = record.description ?? null;
  const editorNote = record.editor_note ?? null;
  const blockedReason = listingPublishBlock({
    description,
    editor_note: editorNote,
    hero_image: hero,
    originality_score: ctx.originalityScore ?? null,
  });
  const shouldPublish = autoPublish && !blockedReason;

  const payload = {
    name: record.name,
    slug,
    category: record.category as ListingCategory,
    neighborhood: record.neighborhood || "San Diego",
    short_description: record.short_description ?? null,
    description,
    editor_note: editorNote,
    why_we_picked_it: Array.isArray(record.why_we_picked_it) ? record.why_we_picked_it.slice(0, 6) : [],
    insider_tip: record.insider_tip ?? null,
    best_time_to_visit: record.best_time_to_visit ?? null,
    local_context: record.local_context ?? null,
    hero_image: hero,
    gallery: Array.isArray(record.gallery) ? record.gallery.slice(0, 12) : [],
    address: record.address ?? null,
    phone: record.phone ?? null,
    website: record.website ?? null,
    reservation_url: reservationUrl,
    price_range: record.price_range ?? null,
    meta_title: record.meta_title ?? null,
    meta_description: record.meta_description ?? null,
    source_url: ctx.sourceUrl ?? null,
    originality_score: ctx.originalityScore ?? null,
    curator_id: ctx.curatorId ?? null,
    wedding_details:
      record.category === "WeddingVenue" && record.wedding_details && typeof record.wedding_details === "object"
        ? record.wedding_details
        : null,
    tier: "free" as const,
    status: (shouldPublish ? "published" : "draft") as "published" | "draft",
    published_at: shouldPublish ? new Date().toISOString() : null,
  };
  const { data, error } = await supabaseAdmin
    .from("listings").upsert(payload, { onConflict: "slug" }).select("id, slug").single();
  if (error) throw new Error(error.message);
  return { id: data.id, slug: data.slug, status: payload.status, blockedReason };
}

async function insertArticle(record: any, hero: string | null, autoPublish: boolean) {
  const slug = slugify(record.title);
  const payload = {
    title: record.title,
    slug,
    category: record.category || "Features",
    excerpt: record.excerpt ?? null,
    body: record.body ?? null,
    hero_image: hero,
    tags: Array.isArray(record.tags) ? record.tags : [],
    read_time_minutes: record.read_time_minutes ?? null,
    meta_title: record.meta_title ?? null,
    meta_description: record.meta_description ?? null,
    status: (autoPublish ? "published" : "draft") as "published" | "draft",
    published_at: autoPublish ? new Date().toISOString() : null,
  };
  const { data, error } = await supabaseAdmin
    .from("articles").upsert(payload, { onConflict: "slug" }).select("id, slug").single();
  if (error) throw new Error(error.message);
  return { id: data.id, slug: data.slug, status: payload.status, blockedReason: null as string | null };
}

async function processOneUrl(
  url: string,
  kind: ContentKind,
  publish: boolean,
  curatorId: string | null = null,
) {
  const scraped = await firecrawlScrape(url);
  const { record, originality_score } = await aiNormalize(scraped, kind);
  const hero = pickHeroImage(scraped.html, scraped.metadata, url);
  const reservation = kind === "listing" ? pickReservationUrl(scraped.html, scraped.links) : null;
  if (kind === "listing" && record.category === "WeddingVenue") {
    const gallery = extractGallery(scraped.html, url, hero);
    if (gallery.length) (record as any).gallery = gallery;
  }
  return kind === "listing"
    ? await insertListing(record, hero, publish, reservation, { sourceUrl: url, originalityScore: originality_score, curatorId })
    : await insertArticle(record, hero, publish);
}

function extractGallery(html: string, base: string, hero: string | null): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const u = absUrl(m[1], base);
    if (!u) continue;
    if (!/^https?:\/\//i.test(u)) continue;
    if (/\.(svg|gif)(\?|$)/i.test(u)) continue;
    if (/sprite|icon|logo|avatar|favicon/i.test(u)) continue;
    if (u === hero) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length >= 12) break;
  }
  return out;
}

// ---------- Curated (search-based) listing import ----------

const CURATED_PREFIX = "curated://";

const CURATED_LISTING_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string", description: "Two-sentence editorial summary of cuisine, vibe, and what makes it notable." },
    neighborhood: { type: "string", description: "San Diego neighborhood like La Jolla, Little Italy, Gaslamp Quarter, North Park, etc." },
    address: { type: "string" },
    phone: { type: "string" },
    website: { type: "string" },
    price_range: { type: "string", enum: ["$", "$$", "$$$", "$$$$"] },
    cuisine: { type: "string" },
    image_url: { type: "string", description: "A high-quality public image URL of the business or its food/interior." },
  },
  required: ["name", "description", "neighborhood"],
} as const;

async function firecrawlSearchExtract(query: string) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY is not configured");
  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      limit: 3,
      scrapeOptions: {
        formats: [{ type: "json", schema: CURATED_LISTING_SCHEMA, prompt: `Extract structured details for the San Diego business mentioned in the query. Use information consistent with the official site or reputable reviews. Do not invent addresses or phone numbers — leave fields blank if not stated on the page.` }],
        onlyMainContent: true,
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Firecrawl search failed [${res.status}]: ${t.slice(0, 400)}`);
  }
  const json = (await res.json()) as any;
  const web: any[] = json?.data?.web ?? [];
  return web;
}

function isJunkValue(v: unknown): boolean {
  if (!v) return true;
  const s = String(v).trim().toLowerCase();
  if (!s) return true;
  return s.startsWith("not specified") || s.startsWith("not available") || s.startsWith("n/a") || s === "unknown" || /\b555-\d{4}\b/.test(s) || /1234\s+culinary|placeholder|example\.com/.test(s);
}

function mergeCuratedResults(name: string, web: any[]): {
  name: string;
  description: string;
  neighborhood: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  price_range: "$" | "$$" | "$$$" | "$$$$";
  cuisine: string | null;
  image_url: string | null;
} {
  const out: any = { name, description: "", neighborhood: "", address: null, phone: null, website: null, price_range: "$$$", cuisine: null, image_url: null };
  const ogImages: string[] = [];
  for (const entry of web) {
    const j = entry?.json ?? {};
    for (const k of ["name", "description", "neighborhood", "address", "phone", "website", "cuisine", "image_url"]) {
      const v = j?.[k];
      if (!out[k] && v && !isJunkValue(v)) out[k] = String(v).trim();
    }
    const pr = j?.price_range;
    if (pr && ["$", "$$", "$$$", "$$$$"].includes(pr)) out.price_range = pr;
    const meta = entry?.metadata ?? {};
    const og = meta?.ogImage ?? meta?.["og:image"];
    if (og && typeof og === "string" && og.startsWith("http")) ogImages.push(og);
    if (!out.website) {
      const url: string = entry?.url ?? "";
      const blocked = ["yelp.com", "tripadvisor", "opentable", "michelin", "reddit", "facebook", "instagram", "google.com/", "wikipedia", "eater.com", "sandiegomagazine", "sdfoodiefan"];
      if (url && !blocked.some((b) => url.includes(b))) out.website = url;
    }
  }
  if (!out.image_url && ogImages.length) out.image_url = ogImages[0];
  // Normalize neighborhood
  if (!out.neighborhood || /^san diego$/i.test(out.neighborhood)) out.neighborhood = "San Diego";
  return out;
}

async function processCuratedListing(name: string, category: ListingCategory, publish: boolean) {
  const query = `${name} ${category.toLowerCase()} San Diego`;
  const web = await firecrawlSearchExtract(query);
  if (!web.length) throw new Error("No search results");
  const rec = mergeCuratedResults(name, web);
  if (!rec.description) throw new Error("Could not extract a description");
  const shortDesc = rec.description.split(/(?<=[.!?])\s+/)[0]?.slice(0, 200) ?? null;
  const payload = {
    name: rec.name,
    slug: slugify(rec.name),
    category,
    neighborhood: rec.neighborhood,
    short_description: shortDesc,
    description: rec.description,
    address: rec.address,
    phone: rec.phone,
    website: rec.website,
    price_range: rec.price_range,
    hero_image: rec.image_url,
    meta_title: `${rec.name} in ${rec.neighborhood} | sandiego.com`.slice(0, 70),
    meta_description: shortDesc ?? `Discover ${rec.name}, a top ${category.toLowerCase()} in ${rec.neighborhood}, San Diego.`,
    tier: "free" as const,
    status: (publish ? "published" : "draft") as "published" | "draft",
    published_at: publish ? new Date().toISOString() : null,
  };
  const { data, error } = await supabaseAdmin
    .from("listings").upsert(payload, { onConflict: "slug" }).select("id, slug").single();
  if (error) throw new Error(error.message);
  return data;
}

// Decode the curated synthetic URL back into { name, category }
function decodeCurated(url: string): { name: string; category: ListingCategory } {
  const raw = url.startsWith(CURATED_PREFIX) ? url.slice(CURATED_PREFIX.length) : url;
  const [catRaw, ...rest] = raw.split("/");
  const cat = (catRaw || "Restaurant") as ListingCategory;
  const name = decodeURIComponent(rest.join("/"));
  return { name, category: cat };
}

async function processItemForJob(item: { url: string }, jobKind: JobKind, publish: boolean): Promise<{ slug: string; id: string }> {
  if (jobKind === "curated_listing") {
    const { name, category } = decodeCurated(item.url);
    return processCuratedListing(name, category, publish);
  }
  return processOneUrl(item.url, jobKind as ContentKind, publish);
}

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: any) => r.role);
  if (!roles.includes("admin") && !roles.includes("editor")) {
    throw new Error("Forbidden: admin or editor role required");
  }
}

function guessKind(url: string): ContentKind {
  const u = url.toLowerCase();
  if (/\b(blog|article|news|story|guide|stories)\b/.test(u)) return "article";
  return "listing";
}

const ImportInput = z.object({
  url: z.string().url(),
  kind: z.enum(["listing", "article", "auto"]).default("auto"),
  publish: z.boolean().default(true),
});

export const importFromUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ImportInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const kind: ContentKind = data.kind === "auto" ? guessKind(data.url) : data.kind;
    const result = await processOneUrl(data.url, kind, data.publish, context.userId);
    return {
      kind,
      slug: result.slug,
      id: result.id,
      status: result.status,
      blockedReason: result.blockedReason,
    };
  });

// ============= Re-enrich an existing listing with the new editorial pipeline =============

const EnrichInput = z.object({
  listingId: z.string().uuid(),
  publish: z.boolean().default(false),
});

export const enrichExistingListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EnrichInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from("listings")
      .select("id, slug, name, source_url, website, hero_image, curator_id")
      .eq("id", data.listingId)
      .single();
    if (fetchErr || !listing) throw new Error(fetchErr?.message ?? "Listing not found");

    const sourceUrl = listing.source_url || listing.website;
    if (!sourceUrl) throw new Error("This listing has no source_url or website to re-enrich from.");

    const scraped = await firecrawlScrape(sourceUrl);
    const { record, originality_score } = await aiNormalize(scraped, "listing");
    const hero = listing.hero_image || pickHeroImage(scraped.html, scraped.metadata, sourceUrl);
    const reservation = pickReservationUrl(scraped.html, scraped.links);

    const blockedReason = listingPublishBlock({
      description: record.description ?? null,
      editor_note: record.editor_note ?? null,
      hero_image: hero,
      originality_score,
    });
    const shouldPublish = data.publish && !blockedReason;

    const baseUpdate = {
      short_description: record.short_description ?? null,
      description: record.description ?? null,
      editor_note: record.editor_note ?? null,
      why_we_picked_it: Array.isArray(record.why_we_picked_it) ? record.why_we_picked_it.slice(0, 6) : [],
      insider_tip: record.insider_tip ?? null,
      best_time_to_visit: record.best_time_to_visit ?? null,
      local_context: record.local_context ?? null,
      meta_title: record.meta_title ?? null,
      meta_description: record.meta_description ?? null,
      reservation_url: reservation,
      hero_image: hero,
      source_url: sourceUrl,
      originality_score,
      curator_id: listing.curator_id ?? context.userId,
    };
    const update = data.publish
      ? {
          ...baseUpdate,
          status: (shouldPublish ? "published" : "draft") as "published" | "draft",
          published_at: shouldPublish ? new Date().toISOString() : null,
        }
      : baseUpdate;

    const { error: updErr } = await supabaseAdmin
      .from("listings")
      .update(update)
      .eq("id", listing.id);
    if (updErr) throw new Error(updErr.message);

    return { id: listing.id, slug: listing.slug, originality_score, blockedReason };
  });

// ============= AI-generate just the editorial context fields (no scrape) =============

const EditorialGenInput = z.object({
  name: z.string().min(1),
  category: z.enum(["Restaurant", "Hotel", "Attraction", "Tour", "Shopping", "Nightlife"]),
  neighborhood: z.string().min(1),
  address: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const generateEditorialContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EditorialGenInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const sys = `You write proprietary editorial context for sandiego.com listings — an editorial guide, NOT a directory.
${BRAND_VOICE}

CATEGORY-SPECIFIC GUIDANCE (${data.category}):
${CATEGORY_PROMPTS[data.category]}

You will produce ORIGINAL editorial commentary based on your knowledge of San Diego and the ${data.neighborhood} neighborhood. Do not copy phrases from the provided description — synthesize a local-perspective angle.`;

    const userMsg = `Listing: ${data.name}
Category: ${data.category}
Neighborhood: ${data.neighborhood}
${data.address ? `Address: ${data.address}` : ""}
${data.website ? `Website: ${data.website}` : ""}
${data.short_description ? `Short description: ${data.short_description}` : ""}
${data.description ? `Existing description (for context only — do NOT copy): ${data.description.slice(0, 2000)}` : ""}

Generate the editorial context fields for this listing.`;

    const schema = {
      type: "object",
      properties: {
        editor_note: { type: "string", description: "1–2 sentences in our voice — what makes this place worth a visit." },
        why_we_picked_it: { type: "array", items: { type: "string" }, description: "3–5 short reason chips like 'Date night', 'Outdoor seating', 'Walk-ins welcome'." },
        insider_tip: { type: "string", description: "1 sentence — best seat, what to order, when to go." },
        best_time_to_visit: { type: "string", description: "Short — e.g. 'Weeknights before 6:30pm' or 'Sunday brunch'." },
        local_context: { type: "string", description: "1–2 sentences placing the spot in its neighborhood." },
        short_description: { type: "string", description: "1 sentence card teaser, ~140 chars. Hook + specific detail." },
        description: { type: "string", description: "3–5 paragraph editorial overview in our voice (~300–450 words). Markdown OK. No marketing fluff." },
        meta_title: { type: "string", description: `SEO title <60 chars including the listing name and "${data.neighborhood}".` },
        meta_description: { type: "string", description: "SEO meta description ~155 chars with a benefit hook and the city/neighborhood." },
        faqs: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          description: "3–5 FAQs visitors actually ask (parking, reservations, dress code, kids, hours, etc.).",
          items: {
            type: "object",
            properties: { q: { type: "string" }, a: { type: "string" } },
            required: ["q", "a"],
            additionalProperties: false,
          },
        },
      },
      required: [
        "editor_note", "why_we_picked_it", "insider_tip", "best_time_to_visit", "local_context",
        "short_description", "description", "meta_title", "meta_description", "faqs",
      ],
      additionalProperties: false,
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_schema", json_schema: { name: "editorial_context", strict: true, schema } },
        max_tokens: 4000,
      }),
    });
    if (res.status === 429) throw new Error("Rate limit hit. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI generation failed [${res.status}]: ${t.slice(0, 300)}`);
    }
    const json = (await res.json()) as any;
    const choice = json.choices?.[0];
    const finishReason = choice?.finish_reason ?? choice?.native_finish_reason;
    if (finishReason === "length" || finishReason === "MAX_TOKENS") {
      throw new Error("AI response was cut off. Try again with a shorter listing description.");
    }
    const msg = choice?.message;
    const argsStr = msg?.tool_calls?.[0]?.function?.arguments;
    let parsed: any = null;
    if (argsStr) {
      if (typeof argsStr === "string") {
        try { parsed = JSON.parse(argsStr); } catch { parsed = null; }
      } else if (typeof argsStr === "object") {
        parsed = argsStr;
      }
    }
    // Fallback: some models return JSON in content instead of tool_calls
    if (!parsed && typeof msg?.content === "string" && msg.content.trim()) {
      try {
        const cleaned = msg.content.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        parsed = JSON.parse(cleaned);
      } catch { parsed = null; }
    }
    if (!parsed) {
      console.error("[generateEditorialContext] unexpected AI response", JSON.stringify(json).slice(0, 1000));
      throw new Error("AI returned no structured content");
    }
    const normalized = {
      editor_note: String(parsed.editor_note ?? "").trim(),
      why_we_picked_it: Array.isArray(parsed.why_we_picked_it) ? parsed.why_we_picked_it.slice(0, 6).map(String).map((s: string) => s.trim()).filter(Boolean) : [],
      insider_tip: String(parsed.insider_tip ?? "").trim(),
      best_time_to_visit: String(parsed.best_time_to_visit ?? "").trim(),
      local_context: String(parsed.local_context ?? "").trim(),
      short_description: String(parsed.short_description ?? "").trim(),
      description: String(parsed.description ?? "").trim(),
      meta_title: String(parsed.meta_title ?? "").trim(),
      meta_description: String(parsed.meta_description ?? "").trim(),
      faqs: Array.isArray(parsed.faqs)
        ? parsed.faqs
            .map((f: any) => ({ q: String(f?.q ?? "").trim(), a: String(f?.a ?? "").trim() }))
            .filter((f: { q: string; a: string }) => f.q && f.a)
            .slice(0, 5)
        : [],
    };
    if (!normalized.editor_note || normalized.why_we_picked_it.length === 0 || !normalized.insider_tip || !normalized.best_time_to_visit || !normalized.local_context) {
      console.error("[generateEditorialContext] incomplete AI response", JSON.stringify(parsed).slice(0, 1000));
      throw new Error("AI returned incomplete editorial fields. Please try again.");
    }
    return normalized;
  });

// ============= Queued bulk import =============

const EnqueueInput = z.object({
  sectionUrl: z.string().url(),
  kind: z.enum(["listing", "article"]),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(25),
  publish: z.boolean().default(true),
});

export const enqueueBulkImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EnqueueInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const links = await firecrawlMap(data.sectionUrl, data.search, data.limit * 3);
    const base = new URL(data.sectionUrl);
    const candidates = Array.from(new Set(
      links.filter((l) => {
        try {
          const u = new URL(l);
          if (u.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) return false;
          return u.pathname.length > base.pathname.length;
        } catch { return false; }
      })
    )).slice(0, data.limit);

    const { data: job, error: jobErr } = await supabaseAdmin
      .from("import_jobs")
      .insert({
        created_by: context.userId,
        section_url: data.sectionUrl,
        kind: data.kind,
        search: data.search ?? null,
        publish: data.publish,
        status: "pending",
        total: candidates.length,
      })
      .select("id").single();
    if (jobErr) throw new Error(jobErr.message);

    if (candidates.length > 0) {
      const rows = candidates.map((url) => ({ job_id: job.id, url }));
      const { error: itemsErr } = await supabaseAdmin.from("import_job_items").insert(rows);
      if (itemsErr) throw new Error(itemsErr.message);
    }

    return { jobId: job.id, total: candidates.length };
  });

const ProcessInput = z.object({
  jobId: z.string().uuid(),
  batchSize: z.number().int().min(1).max(20).default(BATCH_SIZE),
});

export const processImportBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProcessInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const { data: job, error: jobErr } = await supabaseAdmin
      .from("import_jobs").select("*").eq("id", data.jobId).single();
    if (jobErr || !job) throw new Error(jobErr?.message ?? "Job not found");
    if (job.status === "completed" || job.status === "cancelled") {
      return { processed: 0, remaining: 0, status: job.status };
    }

    // Fetch next batch of pending items (or failed under retry limit)
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("import_job_items")
      .select("*")
      .eq("job_id", data.jobId)
      .in("status", ["pending"])
      .lt("attempts", MAX_ATTEMPTS)
      .order("created_at", { ascending: true })
      .limit(data.batchSize);
    if (itemsErr) throw new Error(itemsErr.message);

    if (!items || items.length === 0) {
      // Mark job complete based on remaining state
      const { count: pendingCount } = await supabaseAdmin
        .from("import_job_items").select("*", { count: "exact", head: true })
        .eq("job_id", data.jobId).eq("status", "pending").lt("attempts", MAX_ATTEMPTS);
      if ((pendingCount ?? 0) === 0) {
        const { count: failedCount } = await supabaseAdmin
          .from("import_job_items").select("*", { count: "exact", head: true })
          .eq("job_id", data.jobId).eq("status", "failed");
        await supabaseAdmin.from("import_jobs").update({
          status: (failedCount ?? 0) > 0 ? "failed" : "completed",
        }).eq("id", data.jobId);
      }
      return { processed: 0, remaining: 0, status: "idle" };
    }

    if (job.status !== "running") {
      await supabaseAdmin.from("import_jobs").update({ status: "running" }).eq("id", data.jobId);
    }

    // Mark items processing
    const ids = items.map((i: any) => i.id);
    await supabaseAdmin.from("import_job_items").update({ status: "processing" }).in("id", ids);

    let done = 0;
    let failed = 0;
    for (const item of items) {
      const attempts = item.attempts + 1;
      try {
        const r = await processItemForJob(item, job.kind as JobKind, job.publish);
        await supabaseAdmin.from("import_job_items").update({
          status: "done",
          attempts,
          last_error: null,
          result_kind: job.kind,
          result_slug: r.slug,
        }).eq("id", item.id);
        done++;
      } catch (e: any) {
        const msg = String(e?.message ?? e).slice(0, 500);
        const finalFail = attempts >= MAX_ATTEMPTS;
        await supabaseAdmin.from("import_job_items").update({
          status: finalFail ? "failed" : "pending",
          attempts,
          last_error: msg,
        }).eq("id", item.id);
        if (finalFail) failed++;
      }
    }

    // Update aggregate counts
    const { count: doneTotal } = await supabaseAdmin
      .from("import_job_items").select("*", { count: "exact", head: true })
      .eq("job_id", data.jobId).eq("status", "done");
    const { count: failedTotal } = await supabaseAdmin
      .from("import_job_items").select("*", { count: "exact", head: true })
      .eq("job_id", data.jobId).eq("status", "failed");
    const { count: remaining } = await supabaseAdmin
      .from("import_job_items").select("*", { count: "exact", head: true })
      .eq("job_id", data.jobId).eq("status", "pending").lt("attempts", MAX_ATTEMPTS);

    const isDone = (remaining ?? 0) === 0;
    await supabaseAdmin.from("import_jobs").update({
      done_count: doneTotal ?? 0,
      failed_count: failedTotal ?? 0,
      status: isDone ? ((failedTotal ?? 0) > 0 ? "failed" : "completed") : "running",
    }).eq("id", data.jobId);

    return { processed: items.length, done, failed, remaining: remaining ?? 0, status: isDone ? "done" : "running" };
  });

const RetryInput = z.object({
  jobId: z.string().uuid(),
  itemId: z.string().uuid().optional(),
});

export const retryFailedItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RetryInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const base = supabaseAdmin.from("import_job_items").update({
      status: "pending" as const, attempts: 0, last_error: null,
    }).eq("job_id", data.jobId);
    const query = data.itemId ? base.eq("id", data.itemId) : base.eq("status", "failed");
    const { data: rows, error } = await query.select("id");
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("import_jobs").update({ status: "pending", error: null }).eq("id", data.jobId);
    return { reset: rows?.length ?? 0 };
  });

const JobIdInput = z.object({ jobId: z.string().uuid() });

export const cancelImportJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => JobIdInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    await supabaseAdmin.from("import_jobs").update({ status: "cancelled" }).eq("id", data.jobId);
    return { ok: true };
  });

export const deleteImportJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => JobIdInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("import_jobs").delete().eq("id", data.jobId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============= Curated (search-driven) import =============
//
// Given a category and a Firecrawl search query, find a list of N business
// names from a "best of" web page, then enqueue each as a curated_listing
// item. Reuses processImportBatch / retryFailedItems / cancel / delete.

const LISTING_CATEGORIES = ["Restaurant", "Hotel", "Attraction", "Tour", "Shopping", "Nightlife"] as const;

const CuratedEnqueueInput = z.object({
  query: z.string().min(3).max(200),
  category: z.enum(LISTING_CATEGORIES),
  limit: z.number().int().min(1).max(100).default(50),
  publish: z.boolean().default(true),
});

async function firecrawlSearchSimple(query: string, limit: number) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY is not configured");
  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Firecrawl search failed [${res.status}]: ${t.slice(0, 400)}`);
  }
  const json = (await res.json()) as any;
  return (json?.data?.web ?? []) as Array<{ url: string; title?: string; description?: string }>;
}

// Use the AI gateway to extract a list of business names from a "best of" page's markdown
async function extractNamesFromMarkdown(markdown: string, category: string, limit: number): Promise<string[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const schema = {
    type: "object",
    properties: {
      names: {
        type: "array",
        items: { type: "string" },
        description: `Up to ${limit} ${category.toLowerCase()} names mentioned on the page, in order of appearance. Names only — no descriptions, no addresses, no editorial wrapping.`,
      },
    },
    required: ["names"],
    additionalProperties: false,
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `Extract a clean list of San Diego ${category.toLowerCase()} business names from the markdown. Skip generic categories, headings like "Best Italian", author bylines, ad copy, and "Related Posts" sections.` },
        { role: "user", content: markdown.slice(0, 30000) },
      ],
      response_format: { type: "json_schema", json_schema: { name: "name_list", strict: true, schema } },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI name extraction failed [${res.status}]: ${t.slice(0, 400)}`);
  }
  const json = (await res.json()) as any;
  const content = json.choices?.[0]?.message?.content;
  if (!content) return [];
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.names) ? parsed.names.slice(0, limit) : [];
}

export const enqueueCuratedImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CuratedEnqueueInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    // 1. Find candidate "best of" pages via Firecrawl Search
    const searchHits = await firecrawlSearchSimple(data.query, 5);
    if (!searchHits.length) throw new Error("No search results for that query");

    // 2. Scrape the top-ranked page and extract business names from it
    let names: string[] = [];
    let sourcePage = "";
    for (const hit of searchHits) {
      try {
        const scraped = await firecrawlScrape(hit.url);
        if (!scraped.markdown) continue;
        const extracted = await extractNamesFromMarkdown(scraped.markdown, data.category, data.limit);
        if (extracted.length >= Math.min(10, data.limit)) {
          names = extracted;
          sourcePage = hit.url;
          break;
        }
      } catch {
        // try next hit
      }
    }
    if (!names.length) throw new Error("Could not extract a list of names from the top search results");

    // Dedupe (case-insensitive)
    const seen = new Set<string>();
    const uniqueNames = names.filter((n) => {
      const k = n.toLowerCase().trim();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, data.limit);

    // 3. Create the import job
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("import_jobs")
      .insert({
        created_by: context.userId,
        section_url: `${sourcePage} (curated: ${data.query})`,
        kind: "curated_listing",
        search: data.query,
        publish: data.publish,
        status: "pending",
        total: uniqueNames.length,
      })
      .select("id").single();
    if (jobErr) throw new Error(jobErr.message);

    // 4. Enqueue items — encode name + category in a synthetic curated:// URL
    const rows = uniqueNames.map((name) => ({
      job_id: job.id,
      url: `${CURATED_PREFIX}${data.category}/${encodeURIComponent(name)}`,
    }));
    const { error: itemsErr } = await supabaseAdmin.from("import_job_items").insert(rows);
    if (itemsErr) throw new Error(itemsErr.message);

    return { jobId: job.id, total: uniqueNames.length, sourcePage };
  });

// ============= AI Internal Linking for blog/article body =============
// Strategy: pull candidate internal URLs from the database (listings, blog
// posts, articles) + static hubs/neighborhoods, hand them to the AI, and ask
// it to pick the best 3-8 anchor phrases already present in the body. We
// then deterministically replace the FIRST occurrence of each phrase with a
// markdown link — never replacing inside existing links, headings, code, or
// images. This keeps output safe and avoids hallucinated URLs.

const InternalLinkInput = z.object({
  body: z.string().min(20),
  title: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  excludeUrls: z.array(z.string()).optional().default([]),
  maxLinks: z.number().int().min(1).max(12).default(6),
});

type LinkCandidate = { url: string; title: string; type: string; description?: string };

const STATIC_HUBS: LinkCandidate[] = [
  { url: "/restaurants", title: "San Diego restaurants", type: "hub", description: "Editor-picked restaurants across San Diego" },
  { url: "/hotels", title: "San Diego hotels", type: "hub", description: "Hand-picked hotels and resorts" },
  { url: "/things-to-do", title: "things to do in San Diego", type: "hub", description: "Attractions, tours, and activities" },
  { url: "/shopping", title: "San Diego shopping", type: "hub", description: "Boutiques, markets, and shopping districts" },
  { url: "/nightlife", title: "San Diego nightlife", type: "hub", description: "Bars, clubs, and live music venues" },
  { url: "/neighborhoods", title: "San Diego neighborhoods", type: "hub", description: "Neighborhood guides" },
  { url: "/insider", title: "Insider membership", type: "hub", description: "Member savings and perks" },
];

function categoryHubSlug(c: string | null | undefined): string | null {
  switch (c) {
    case "Restaurant": return "restaurants";
    case "Hotel": return "hotels";
    case "Attraction":
    case "Tour": return "things-to-do";
    case "Shopping": return "shopping";
    case "Nightlife": return "nightlife";
    default: return null;
  }
}

/**
 * Apply an anchor-phrase → URL link to the body.
 * - Case-insensitive whole-phrase match
 * - Replaces only the FIRST occurrence
 * - Skips matches that are already inside a markdown link [..](..), image
 *   ![..](..), inline code `..`, fenced code block, or markdown heading line.
 */
function applyInternalLink(body: string, phrase: string, url: string): { body: string; applied: boolean } {
  if (!phrase || !url) return { body, applied: false };
  const trimmed = phrase.trim();
  if (trimmed.length < 3 || trimmed.length > 80) return { body, applied: false };

  // Build line-by-line so we can safely skip headings / fenced code blocks.
  const lines = body.split("\n");
  let inFence = false;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // \b doesn't always work for phrases with spaces/punctuation; use simple
  // word-boundary lookarounds where possible.
  const re = new RegExp(`(?<![\\w\\[\\(])(${escaped})(?![\\w\\)])`, "i");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^\s{0,3}#{1,6}\s/.test(line)) continue; // headings

    const m = line.match(re);
    if (!m || m.index === undefined) continue;

    // Reject if inside an existing markdown link or image: scan the line up
    // to the match index and check unbalanced [ or ]( bracketing.
    const before = line.slice(0, m.index);
    const lastOpen = before.lastIndexOf("[");
    const lastClose = before.lastIndexOf("](");
    const lastEnd = before.lastIndexOf(")");
    if (lastOpen > lastEnd && lastOpen > -1) continue; // inside [...]
    if (lastClose > lastEnd) continue;                  // inside ](url)

    // Reject if inside a backtick code span on this line.
    const beforeTicks = (before.match(/`/g) ?? []).length;
    if (beforeTicks % 2 === 1) continue;

    const matchedText = m[1];
    const replaced = line.slice(0, m.index) + `[${matchedText}](${url})` + line.slice(m.index + matchedText.length);
    lines[i] = replaced;
    return { body: lines.join("\n"), applied: true };
  }
  return { body, applied: false };
}

export const aiInsertInternalLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InternalLinkInput.parse(d))
  .handler(async ({ data, context }) => {
   try {
    await ensureAdmin(context.supabase, context.userId);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    // 1) Build candidate pool from the database.
    const supabase = supabaseAdmin;
    const [listingsRes, blogRes, articlesRes] = await Promise.all([
      supabase
        .from("listings")
        .select("name,slug,category,neighborhood,short_description")
        .eq("status", "published")
        .limit(300),
      supabase
        .from("blog_posts")
        .select("title,slug,category,excerpt")
        .eq("status", "published")
        .limit(200),
      supabase
        .from("articles")
        .select("title,slug,excerpt")
        .eq("status", "published")
        .limit(200),
    ]);

    const candidates: LinkCandidate[] = [];

    for (const l of listingsRes.data ?? []) {
      const hub = categoryHubSlug(l.category);
      if (!hub) continue;
      candidates.push({
        url: `/${hub}/${l.slug}`,
        title: l.name,
        type: "listing",
        description: [l.neighborhood, l.short_description].filter(Boolean).join(" — "),
      });
    }
    for (const b of blogRes.data ?? []) {
      candidates.push({ url: `/blog/${b.slug}`, title: b.title, type: "blog", description: b.excerpt ?? undefined });
    }
    for (const a of articlesRes.data ?? []) {
      candidates.push({ url: `/articles/${a.slug}`, title: a.title, type: "article", description: a.excerpt ?? undefined });
    }
    candidates.push(...STATIC_HUBS);

    const exclude = new Set((data.excludeUrls ?? []).map((u) => u.toLowerCase()));
    const pool = candidates.filter((c) => !exclude.has(c.url.toLowerCase()));

    if (!pool.length) return { applied: [], skipped: [], body: data.body, message: "No internal link candidates available" };

    // 2) Ask the AI to pick anchor phrases that ALREADY appear in the body
    // and the best matching URL from the pool.
    const sys = `You are an SEO editor inserting internal links into a blog post for sandiego.com (a San Diego travel + dining guide).

RULES (strict):
- Pick anchor phrases that ALREADY appear verbatim in the BODY text. Do not invent or paraphrase.
- Each anchor must be 2–7 words, descriptive (not "click here", "this", "read more").
- Each chosen URL MUST come from the provided CANDIDATES list. Never invent URLs or use external domains.
- Prefer linking proper nouns (restaurant/hotel/neighborhood names) to their detail page when present in candidates.
- Only fall back to category hubs (e.g. /restaurants) when no specific listing fits.
- Never link the same URL twice. Never link inside headings or code blocks (the system will skip those).
- Aim for 4–${data.maxLinks} high-quality links. Fewer is better than forced.
- Return only links that genuinely help the reader.`;

    const candidateList = pool
      .slice(0, 250)
      .map((c, i) => `${i + 1}. [${c.type}] ${c.title} → ${c.url}${c.description ? ` (${c.description.slice(0, 120)})` : ""}`)
      .join("\n");

    const userMsg = `BLOG POST TITLE: ${data.title ?? "(untitled)"}
CATEGORY: ${data.category ?? "(none)"}

BODY (markdown):
"""
${data.body.slice(0, 12000)}
"""

CANDIDATE INTERNAL URLS:
${candidateList}

Choose 4–${data.maxLinks} anchor phrases from the body and the best matching candidate URL for each.`;

    const tool = {
      type: "function",
      function: {
        name: "propose_internal_links",
        description: "Return the chosen anchor phrases and their internal URLs.",
        parameters: {
          type: "object",
          properties: {
            links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  anchor: { type: "string", description: "Exact phrase from the body to turn into a link." },
                  url: { type: "string", description: "Internal path from the candidates list (must start with /)." },
                  reason: { type: "string", description: "Brief justification (max 140 chars)." },
                },
                required: ["anchor", "url"],
                additionalProperties: false,
              },
            },
          },
          required: ["links"],
          additionalProperties: false,
        },
      },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "propose_internal_links" } },
      }),
    });
    if (res.status === 429) throw new Error("Rate limit hit. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI internal-link generation failed [${res.status}]: ${t.slice(0, 300)}`);
    }

    const json = (await res.json()) as any;
    const msg = json.choices?.[0]?.message;
    const argsStr = msg?.tool_calls?.[0]?.function?.arguments;
    let parsed: any = null;
    if (argsStr) { try { parsed = JSON.parse(argsStr); } catch { /* fall through */ } }
    if (!parsed && typeof msg?.content === "string") {
      try {
        const cleaned = msg.content.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        parsed = JSON.parse(cleaned);
      } catch { /* ignore */ }
    }
    if (!parsed || !Array.isArray(parsed.links)) {
      console.error("[aiInsertInternalLinks] unexpected AI response", JSON.stringify(json).slice(0, 800));
      throw new Error("AI returned no link suggestions");
    }

    // 3) Apply each suggestion safely. Reject any URL not in the pool.
    //    URL matching is case-insensitive and tolerates a trailing slash.
    const normalizeUrl = (u: string) => u.trim().toLowerCase().replace(/\/+$/, "") || "/";
    const urlMap = new Map<string, string>(); // normalized -> canonical from pool
    for (const c of pool) urlMap.set(normalizeUrl(c.url), c.url);

    const applied: { anchor: string; url: string; reason?: string }[] = [];
    const skipped: { anchor: string; url: string; reason: string }[] = [];
    const usedUrls = new Set<string>();
    let body = data.body;

    console.log(`[aiInsertInternalLinks] pool=${pool.length} suggestions=${parsed.links.length}`);

    for (const link of parsed.links as Array<{ anchor: string; url: string; reason?: string }>) {
      const anchor = String(link.anchor ?? "").trim();
      const rawUrl = String(link.url ?? "").trim();
      if (!anchor || !rawUrl) continue;
      if (!rawUrl.startsWith("/")) { skipped.push({ anchor, url: rawUrl, reason: "external or invalid URL" }); continue; }
      const canonical = urlMap.get(normalizeUrl(rawUrl));
      if (!canonical) { skipped.push({ anchor, url: rawUrl, reason: "URL not in candidate pool" }); continue; }
      if (usedUrls.has(canonical)) { skipped.push({ anchor, url: canonical, reason: "URL already used" }); continue; }
      const result = applyInternalLink(body, anchor, canonical);
      if (!result.applied) { skipped.push({ anchor, url: canonical, reason: "anchor not found verbatim in body (or inside link/code/heading)" }); continue; }
      body = result.body;
      usedUrls.add(canonical);
      applied.push({ anchor, url: canonical, reason: link.reason });
      if (applied.length >= data.maxLinks) break;
    }

    console.log(`[aiInsertInternalLinks] applied=${applied.length} skipped=${skipped.length}`);
    return { applied, skipped, body };
   } catch (err) {
    console.error("[aiInsertInternalLinks] handler error:", err);
    throw err instanceof Error ? err : new Error(String(err));
   }
  });
