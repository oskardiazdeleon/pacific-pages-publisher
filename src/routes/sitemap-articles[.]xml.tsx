import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE_URL = "https://sandiego.com";

function xmlEscape(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string,
  );
}

export const Route = createFileRoute("/sitemap-articles.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data: articles } = await supabaseAdmin
          .from("articles")
          .select("slug, updated_at")
          .eq("status", "published");
        const urls: string[] = [];
        for (const a of articles ?? []) {
          urls.push(
            `<url><loc>${SITE_URL}/articles/${xmlEscape(a.slug)}</loc><lastmod>${a.updated_at}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
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
