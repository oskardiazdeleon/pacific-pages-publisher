import { createFileRoute, redirect, notFound } from "@tanstack/react-router";
import { fetchListingBySlug } from "@/lib/content-queries";
import { hubForCategory } from "@/lib/listing-categories";

/**
 * Legacy URL — /listings/{slug}
 *
 * We moved listing detail pages to category-first URLs (/hotels/x, /restaurants/x, etc.)
 * for SEO. This route 301-redirects every legacy URL to its canonical home so search
 * engines transfer link equity to the new URL.
 *
 * For SSR / crawlers (TanStack Start hydrates this on the server), throw redirect()
 * inside beforeLoad — that produces a real 301 HTTP response, which is what Google
 * and LLM crawlers need to consolidate ranking signals.
 */
export const Route = createFileRoute("/listings/$slug")({
  beforeLoad: async ({ params }) => {
    const listing = await fetchListingBySlug(params.slug);
    if (!listing) throw notFound();
    const hub = hubForCategory(listing.category);
    if (!hub) throw notFound();
    throw redirect({
      to: "/$category/$slug" as never,
      params: { category: hub.slug, slug: listing.slug } as never,
      // 301 — permanent. Tells crawlers the canonical URL has moved for good.
      statusCode: 301,
      replace: true,
    });
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Listing not found</h1>
        <a href="/listings" className="mt-4 inline-block text-accent">
          Back to listings
        </a>
      </div>
    </div>
  ),
  component: () => null,
});
