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

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes")
    .optional(),
  subtitle: z.string().max(300).optional(),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(1).max(100_000),
  cover_image: z.string().url().max(2000).optional(),
  category: z.string().max(60).optional(),
  tags: z.array(z.string().min(1).max(40)).max(15).optional(),
  author_name: z.string().max(120).optional(),
  read_time_minutes: z.number().int().min(1).max(120).optional(),
  meta_title: z.string().max(120).optional(),
  meta_description: z.string().max(300).optional(),
  status: z.enum(["draft", "published"]).default("published"),
  ai_generated: z.boolean().optional(),
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
  if (!data.scopes.includes("blog:write"))
    return { error: "API key missing blog:write scope" as const };

  await supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { keyId: data.id };
}

export const Route = createFileRoute("/api/public/blog")({
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

        const parsed = PostSchema.safeParse(payload);
        if (!parsed.success) {
          return json(
            { error: "Validation failed", issues: parsed.error.issues },
            400,
          );
        }
        const d = parsed.data;
        const slug = d.slug ?? `${slugify(d.title)}-${randomUUID().slice(0, 6)}`;

        const { data: existing } = await supabaseAdmin
          .from("blog_posts")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) return json({ error: `Slug "${slug}" already exists` }, 409);

        const now = new Date().toISOString();
        const { data: post, error } = await supabaseAdmin
          .from("blog_posts")
          .insert({
            title: d.title,
            slug,
            subtitle: d.subtitle ?? null,
            excerpt: d.excerpt ?? null,
            body: d.body,
            cover_image: d.cover_image ?? null,
            category: d.category ?? "Lifestyle",
            tags: d.tags ?? [],
            author_name: d.author_name ?? null,
            read_time_minutes:
              d.read_time_minutes ?? Math.max(1, Math.round(d.body.split(/\s+/).length / 220)),
            meta_title: d.meta_title ?? d.title,
            meta_description: d.meta_description ?? d.excerpt ?? null,
            status: d.status,
            ai_generated: d.ai_generated ?? false,
            published_at: d.status === "published" ? now : null,
          })
          .select("id, slug, status, published_at")
          .single();

        if (error) return json({ error: error.message }, 500);

        return json(
          {
            ok: true,
            post: {
              id: post.id,
              slug: post.slug,
              status: post.status,
              published_at: post.published_at,
              url: `/blog/${post.slug}`,
            },
          },
          201,
        );
      },
    },
  },
});
