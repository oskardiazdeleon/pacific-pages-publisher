import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ListingDetailPage, listingHeadMeta } from "@/components/site/ListingDetailPage";
import { fetchListingBySlug } from "@/lib/content-queries";
import { hubForSlug } from "@/lib/listing-categories";

// Wineries reuses the Restaurant detail experience under its own URL space.
// Falls back to the Restaurants hub for breadcrumbs/related lookup.
const FALLBACK_HUB = hubForSlug("restaurants")!;

export const Route = createFileRoute("/wineries/$slug")({
  loader: async ({ params }) => {
    const listing = await fetchListingBySlug(params.slug);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    if (!l) return { meta: [{ title: "Winery — sandiego.com" }] };
    return { meta: listingHeadMeta(l, FALLBACK_HUB) };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Winery not found</h1>
        <Link to="/wineries" className="mt-4 inline-block text-accent">
          Back to all wineries
        </Link>
      </div>
    </div>
  ),
  component: () => {
    const { listing } = Route.useLoaderData();
    return <ListingDetailPage listing={listing} expectedHub={FALLBACK_HUB} />;
  },
});
