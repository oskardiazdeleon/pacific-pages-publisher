import { createFileRoute } from "@tanstack/react-router";
import { createHash, randomUUID } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const HoursDay = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closed: z.boolean().optional(),
});

const ListingSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes")
    .optional(),
  category: z.enum(["Restaurant", "Hotel", "Attraction", "Tour", "Shopping", "Nightlife"]),
  neighborhood: z.string().min(1).max(120),
  short_description: z.string().max(280).optional(),
  description: z.string().max(20_000).optional(),
  hero_image: z.string().url().max(2000).optional(),
  gallery: z.array(z.string().url().max(2000)).max(20).optional(),
  address: z.string().max(300).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().max(255).optional(),
  website: z.string().url().max(2000).optional(),
  reservation_url: z.string().url().max(2000).optional(),
  price_range: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
  rating: z.number().min(0).max(5).optional(),
  hours: z
    .object({
      mon: HoursDay.optional(),
      tue: HoursDay.optional(),
      wed: HoursDay.optional(),
      thu: HoursDay.optional(),
      fri: HoursDay.optional(),
      sat: HoursDay.optional(),
      sun: HoursDay.optional(),
    })
    .optional(),
  faqs: z
    .array(z.object({ question: z.string().min(1).max(300), answer: z.string().min(1).max(2000) }))
    .max(20)
    .optional(),
  why_we_picked_it: z.array(z.string().min(1).max(200)).max(8).optional(),
  insider_tip: z.string().max(500).optional(),
  best_time_to_visit: z.string().max(200).optional(),
  editor_note: z.string().max(1000).optional(),
  local_context: z.string().max(2000).optional(),
  meta_title: z.string().max(120).optional(),
  meta_description: z.string().max(300).optional(),
  source_url: z.string().url().max(2000).optional(),
  tier: z.enum(["free", "featured", "premium"]).default("free"),
  status: z.enum(["draft", "published"]).default("published"),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function authenticate(request: Request) {
  const header =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!header) return { error: "Missing API key" as const };

  const hash = createHash("sha256").update(header).digest("hex");
  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, scopes, revoked_at")
    .eq("key_hash", hash)
    .maybeSingle();

  if (error || !data) return { error: "Invalid API key" as const };
  if (data.revoked_at) return { error: "API key revoked" as const };
  if (!data.scopes.includes("listings:write"))
    return { error: "API key missing listings:write scope" as const };

  await supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { keyId: data.id };
}

export const Route = createFileRoute("/api/public/listings")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const auth = await authenticate(request);
        if ("error" in auth) return json({ error: auth.error }, 401);

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const parsed = ListingSchema.safeParse(payload);
        if (!parsed.success) {
          return json({ error: "Validation failed", issues: parsed.error.issues }, 400);
        }
        const d = parsed.data;
        const slug = d.slug ?? `${slugify(d.name)}-${randomUUID().slice(0, 6)}`;

        const { data: existing } = await supabaseAdmin
          .from("listings")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) return json({ error: `Slug "${slug}" already exists` }, 409);

        const now = new Date().toISOString();
        const { data: row, error } = await supabaseAdmin
          .from("listings")
          .insert({
            name: d.name,
            slug,
            category: d.category,
            neighborhood: d.neighborhood,
            short_description: d.short_description ?? null,
            description: d.description ?? null,
            hero_image: d.hero_image ?? null,
            gallery: d.gallery ?? [],
            address: d.address ?? null,
            phone: d.phone ?? null,
            email: d.email ?? null,
            website: d.website ?? null,
            reservation_url: d.reservation_url ?? null,
            price_range: d.price_range ?? null,
            rating: d.rating ?? null,
            hours: d.hours ?? null,
            faqs: d.faqs ?? [],
            why_we_picked_it: d.why_we_picked_it ?? [],
            insider_tip: d.insider_tip ?? null,
            best_time_to_visit: d.best_time_to_visit ?? null,
            editor_note: d.editor_note ?? null,
            local_context: d.local_context ?? null,
            meta_title: d.meta_title ?? d.name,
            meta_description: d.meta_description ?? d.short_description ?? null,
            source_url: d.source_url ?? null,
            tier: d.tier,
            status: d.status,
            published_at: d.status === "published" ? now : null,
          })
          .select("id, slug, status, published_at, category")
          .single();

        if (error) return json({ error: error.message }, 500);

        return json(
          {
            ok: true,
            listing: {
              id: row.id,
              slug: row.slug,
              status: row.status,
              published_at: row.published_at,
              url: `/listings/${row.slug}`,
            },
          },
          201,
        );
      },
    },
  },
});
