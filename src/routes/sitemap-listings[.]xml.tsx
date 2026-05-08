import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { hubForCategory } from "@/lib/listing-categories";

const SITE_URL = "https://sandiego.com";

function xmlEscape(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string,
  );
}

export const Route = createFileRoute("/sitemap-listings.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data: listings } = await supabaseAdmin
          .from("listings")
          .select("slug, category, updated_at")
          .eq("status", "published");
        const urls: string[] = [];
        for (const l of listings ?? []) {
          const hub = hubForCategory(l.category);
          const path = hub
            ? `/${hub.slug}/${xmlEscape(l.slug)}`
            : `/listings/${xmlEscape(l.slug)}`;
          urls.push(
            `<url><loc>${SITE_URL}${path}</loc><lastmod>${l.updated_at}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`,
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
