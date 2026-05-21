import { createFileRoute } from "@tanstack/react-router";
import { neighborhoodHubs } from "@/lib/neighborhoods-data";
import { CATEGORY_HUBS } from "@/lib/listing-categories";
import { allSeoCategoryNeighborhoodPairs } from "@/lib/seo-neighborhoods";
import { allSeoPillarSlugs } from "@/lib/seo-pillars";

const SITE_URL = "https://sandiego.com";
const STATIC = [
  { p: "/", pri: "1.0", freq: "daily" },
  { p: "/articles", pri: "0.8", freq: "daily" },
  { p: "/neighborhoods", pri: "0.8", freq: "weekly" },
  { p: "/partners", pri: "0.6", freq: "monthly" },
  { p: "/insider", pri: "0.8", freq: "monthly" },
  { p: "/listings", pri: "0.6", freq: "weekly" },
];

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString();
        const urls: string[] = [];
        for (const s of STATIC) {
          urls.push(
            `<url><loc>${SITE_URL}${s.p}</loc><lastmod>${now}</lastmod><changefreq>${s.freq}</changefreq><priority>${s.pri}</priority></url>`,
          );
        }
        for (const hub of CATEGORY_HUBS) {
          urls.push(
            `<url><loc>${SITE_URL}/${hub.slug}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
          );
        }
        for (const n of neighborhoodHubs) {
          urls.push(
            `<url><loc>${SITE_URL}/neighborhoods/${n.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
          );
        }
        for (const pair of allSeoCategoryNeighborhoodPairs()) {
          urls.push(
            `<url><loc>${SITE_URL}/${pair.category}/in/${pair.neighborhood}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
          );
        }
        for (const slug of allSeoPillarSlugs()) {
          urls.push(
            `<url><loc>${SITE_URL}/save-on/${slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
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
