import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  WeddingVenueDetailPage,
  weddingVenueHeadMeta,
} from "@/components/site/wedding/WeddingVenueDetailPage";
import { fetchListingBySlug } from "@/lib/content-queries";
import { hubForSlug } from "@/lib/listing-categories";

const HUB = hubForSlug("weddings")!;

export const Route = createFileRoute("/weddings/$slug")({
  loader: async ({ params }) => {
    const listing = await fetchListingBySlug(params.slug);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    if (!l) return { meta: [{ title: "Wedding venue — sandiego.com" }] };
    return { meta: weddingVenueHeadMeta(l as any, HUB) };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Wedding venue not found</h1>
        <a href="/weddings" className="mt-4 inline-block text-accent">
          Back to all wedding venues
        </a>
      </div>
    </div>
  ),
  component: () => {
    const { listing } = Route.useLoaderData();
    return <WeddingVenueDetailPage listing={listing as any} />;
  },
});
