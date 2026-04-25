import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { neighborhoodHubs } from "@/lib/neighborhoods-data";

const SITE_URL = process.env.SITE_URL || "https://sandiego.com";

const STATIC_PATHS = ["/", "/listings", "/articles", "/neighborhoods", "/partners", "/insider"];

function xmlEscape(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string
  );
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [{ data: listings }, { data: articles }] = await Promise.all([
          supabaseAdmin
            .from("listings")
            .select("slug, updated_at")
            .eq("status", "published"),
          supabaseAdmin
            .from("articles")
            .select("slug, updated_at")
            .eq("status", "published"),
        ]);

        const now = new Date().toISOString();
        const urls: string[] = [];

        for (const path of STATIC_PATHS) {
          urls.push(
            `<url><loc>${SITE_URL}${path}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq></url>`,
          );
        }
        for (const n of neighborhoodHubs) {
          urls.push(
            `<url><loc>${SITE_URL}/neighborhoods/${n.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
          );
        }
        for (const l of listings ?? []) {
          urls.push(
            `<url><loc>${SITE_URL}/listings/${xmlEscape(l.slug)}</loc><lastmod>${l.updated_at}</lastmod></url>`,
          );
        }
        for (const a of articles ?? []) {
          urls.push(
            `<url><loc>${SITE_URL}/articles/${xmlEscape(a.slug)}</loc><lastmod>${a.updated_at}</lastmod></url>`,
          );
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
