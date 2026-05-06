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

const FaqSchema = z.object({ q: z.string().min(1).max(300), a: z.string().min(1).max(2000) });

const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes")
    .optional(),
  subtitle: z.string().max(300).optional(),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(1).max(200_000),
  hero_image: z.string().url().max(2000).optional(),
  hero_caption: z.string().max(300).optional(),
  hero_credit: z.string().max(200).optional(),
  category: z.string().min(1).max(60),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  author_name: z.string().max(120).optional(),
  author_title: z.string().max(120).optional(),
  author_avatar: z.string().url().max(2000).optional(),
  author_bio: z.string().max(1000).optional(),
  key_takeaways: z.array(z.string().min(1).max(300)).max(10).optional(),
  faqs: z.array(FaqSchema).max(20).optional(),
  pull_quote: z.string().max(500).optional(),
  read_time_minutes: z.number().int().min(1).max(120).optional(),
  meta_title: z.string().max(120).optional(),
  meta_description: z.string().max(300).optional(),
  canonical_url: z.string().url().max(2000).optional(),
  og_image: z.string().url().max(2000).optional(),
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
  if (!data.scopes.includes("articles:write"))
    return { error: "API key missing articles:write scope" as const };

  await supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { keyId: data.id };
}

export const Route = createFileRoute("/api/public/articles")({
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

        const parsed = ArticleSchema.safeParse(payload);
        if (!parsed.success) {
          return json(
            { error: "Validation failed", issues: parsed.error.issues },
            400,
          );
        }
        const d = parsed.data;
        const slug = d.slug ?? `${slugify(d.title)}-${randomUUID().slice(0, 6)}`;

        const { data: existing } = await supabaseAdmin
          .from("articles")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) return json({ error: `Slug "${slug}" already exists` }, 409);

        const now = new Date().toISOString();
        const { data: article, error } = await supabaseAdmin
          .from("articles")
          .insert({
            title: d.title,
            slug,
            subtitle: d.subtitle ?? null,
            excerpt: d.excerpt ?? null,
            body: d.body,
            hero_image: d.hero_image ?? null,
            hero_caption: d.hero_caption ?? null,
            hero_credit: d.hero_credit ?? null,
            category: d.category,
            tags: d.tags ?? [],
            author_name: d.author_name ?? null,
            author_title: d.author_title ?? null,
            author_avatar: d.author_avatar ?? null,
            author_bio: d.author_bio ?? null,
            key_takeaways: d.key_takeaways ?? [],
            faqs: d.faqs ?? [],
            pull_quote: d.pull_quote ?? null,
            read_time_minutes:
              d.read_time_minutes ?? Math.max(1, Math.round(d.body.split(/\s+/).length / 220)),
            meta_title: d.meta_title ?? d.title,
            meta_description: d.meta_description ?? d.excerpt ?? null,
            canonical_url: d.canonical_url ?? null,
            og_image: d.og_image ?? d.hero_image ?? null,
            status: d.status,
            published_at: d.status === "published" ? now : null,
          })
          .select("id, slug, status, published_at")
          .single();

        if (error) return json({ error: error.message }, 500);

        return json(
          {
            ok: true,
            article: {
              id: article.id,
              slug: article.slug,
              status: article.status,
              published_at: article.published_at,
              url: `/articles/${article.slug}`,
            },
          },
          201,
        );
      },
    },
  },
});
