import { createFileRoute, notFound } from "@tanstack/react-router";
import { ListingDetailPage, listingHeadMeta } from "@/components/site/ListingDetailPage";
import { fetchListingBySlug } from "@/lib/content-queries";
import { hubForSlug } from "@/lib/listing-categories";

const HUB = hubForSlug("restaurants")!;

export const Route = createFileRoute("/restaurants/$slug")({
  loader: async ({ params }) => {
    const listing = await fetchListingBySlug(params.slug);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    if (!l) return { meta: [{ title: "Restaurant — sandiego.com" }] };
    return { meta: listingHeadMeta(l, HUB) };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Restaurant not found</h1>
        <a href="/restaurants" className="mt-4 inline-block text-accent">Back to all restaurants</a>
      </div>
    </div>
  ),
  component: () => {
    const { listing } = Route.useLoaderData();
    return <ListingDetailPage listing={listing} expectedHub={HUB} />;
  },
});
