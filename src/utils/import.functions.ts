import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type ListingCategory = "Restaurant" | "Hotel" | "Attraction" | "Tour" | "Shopping" | "Nightlife";
type ContentKind = "listing" | "article";

const NEIGHBORHOODS = [
  "Downtown", "Gaslamp Quarter", "Little Italy", "La Jolla", "Pacific Beach",
  "Mission Beach", "Ocean Beach", "Coronado", "Hillcrest", "North Park",
  "Mission Valley", "Old Town", "Point Loma", "Encinitas", "Carlsbad",
];

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
    body: JSON.stringify({
      url,
      formats: ["markdown", "html"],
      onlyMainContent: true,
    }),
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

async function aiNormalize(scraped: { markdown: string; metadata: Record<string, any>; sourceUrl: string }, kind: ContentKind) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const schema =
    kind === "listing"
      ? {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["listing"] },
            name: { type: "string" },
            category: { type: "string", enum: ["Restaurant", "Hotel", "Attraction", "Tour", "Shopping", "Nightlife"] },
            neighborhood: { type: "string" },
            short_description: { type: "string" },
            description: { type: "string", description: "Full markdown description, 2-4 paragraphs" },
            address: { type: "string" },
            phone: { type: "string" },
            website: { type: "string" },
            price_range: { type: "string", description: "$, $$, $$$ or $$$$" },
            meta_title: { type: "string" },
            meta_description: { type: "string" },
          },
          required: ["kind", "name", "category", "neighborhood", "short_description", "description"],
          additionalProperties: false,
        }
      : {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["article"] },
            title: { type: "string" },
            category: { type: "string", description: "Editorial category, e.g. Food, Hotels, Things To Do, Travel" },
            excerpt: { type: "string", description: "1-2 sentence summary" },
            body: { type: "string", description: "Full article body in HTML, with <h2>, <p>, <ul>, etc." },
            tags: { type: "array", items: { type: "string" } },
            read_time_minutes: { type: "number" },
            meta_title: { type: "string" },
            meta_description: { type: "string" },
          },
          required: ["kind", "title", "category", "excerpt", "body"],
          additionalProperties: false,
        };

  const sys =
    kind === "listing"
      ? `You convert scraped web content into a clean San Diego listing record. Pick the best matching neighborhood from this list when possible: ${NEIGHBORHOODS.join(", ")}. Write original, concise editorial-quality copy — do not copy verbatim marketing text. Detect the listing category accurately.`
      : `You convert scraped web content into a clean San Diego editorial article. Preserve the structure with semantic HTML (<h2>, <p>, <ul>, <blockquote>). Write original, concise editorial copy. Estimate read time based on body length (~200 wpm).`;

  const user = `Source URL: ${scraped.sourceUrl}
Page title: ${scraped.metadata?.title ?? ""}
Page description: ${scraped.metadata?.description ?? ""}

Scraped content (markdown):
${scraped.markdown.slice(0, 15000)}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "import_record", strict: true, schema },
      },
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

async function insertListing(record: any, hero: string | null, autoPublish: boolean) {
  const slug = slugify(record.name);
  const payload = {
    name: record.name,
    slug,
    category: record.category as ListingCategory,
    neighborhood: record.neighborhood || "San Diego",
    short_description: record.short_description ?? null,
    description: record.description ?? null,
    hero_image: hero,
    address: record.address ?? null,
    phone: record.phone ?? null,
    website: record.website ?? null,
    price_range: record.price_range ?? null,
    meta_title: record.meta_title ?? null,
    meta_description: record.meta_description ?? null,
    tier: "free" as const,
    status: (autoPublish ? "published" : "draft") as "published" | "draft",
    published_at: autoPublish ? new Date().toISOString() : null,
  };
  const { data, error } = await supabaseAdmin
    .from("listings")
    .upsert(payload, { onConflict: "slug" })
    .select("id, slug")
    .single();
  if (error) throw new Error(error.message);
  return data;
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
    .from("articles")
    .upsert(payload, { onConflict: "slug" })
    .select("id, slug")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: any) => r.role);
  if (!roles.includes("admin") && !roles.includes("editor")) {
    throw new Error("Forbidden: admin or editor role required");
  }
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

    const scraped = await firecrawlScrape(data.url);

    let kind: ContentKind = data.kind === "auto" ? guessKind(data.url) : data.kind;
    const record = await aiNormalize(scraped, kind);
    if (record.kind && (record.kind === "listing" || record.kind === "article")) {
      kind = record.kind;
    }

    const hero = pickHeroImage(scraped.html, scraped.metadata, data.url);

    const result =
      kind === "listing"
        ? await insertListing(record, hero, data.publish)
        : await insertArticle(record, hero, data.publish);

    return { kind, slug: result.slug, id: result.id };
  });

function guessKind(url: string): ContentKind {
  const u = url.toLowerCase();
  if (/\b(blog|article|news|story|guide|stories)\b/.test(u)) return "article";
  return "listing";
}

const BulkInput = z.object({
  sectionUrl: z.string().url(),
  kind: z.enum(["listing", "article"]),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(15),
  publish: z.boolean().default(true),
});

export const bulkImportSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BulkInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const links = await firecrawlMap(data.sectionUrl, data.search, data.limit * 3);

    // Filter to plausible detail pages on same host
    const base = new URL(data.sectionUrl);
    const candidates = Array.from(
      new Set(
        links
          .filter((l) => {
            try {
              const u = new URL(l);
              if (u.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) return false;
              return u.pathname.length > base.pathname.length;
            } catch {
              return false;
            }
          })
      )
    ).slice(0, data.limit);

    const results: Array<{ url: string; ok: boolean; slug?: string; error?: string }> = [];
    for (const link of candidates) {
      try {
        const scraped = await firecrawlScrape(link);
        const record = await aiNormalize(scraped, data.kind);
        const hero = pickHeroImage(scraped.html, scraped.metadata, link);
        const r =
          data.kind === "listing"
            ? await insertListing(record, hero, data.publish)
            : await insertArticle(record, hero, data.publish);
        results.push({ url: link, ok: true, slug: r.slug });
      } catch (e: any) {
        results.push({ url: link, ok: false, error: String(e?.message ?? e).slice(0, 200) });
      }
    }

    return { attempted: candidates.length, results };
  });
