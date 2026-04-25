import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Globe, Phone, MapPin, Star, ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { fetchListingBySlug, recordImpression } from "@/lib/content-queries";
import listingFallback from "@/assets/listing-restaurant.jpg";

export const Route = createFileRoute("/listings/$slug")({
  loader: async ({ params }) => {
    const listing = await fetchListingBySlug(params.slug);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    if (!l) return { meta: [{ title: "Listing — sandiego.com" }] };
    const title = l.meta_title || `${l.name} — ${l.neighborhood} | sandiego.com`;
    const description =
      l.meta_description || l.short_description || `${l.name} in ${l.neighborhood}, San Diego.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(l.hero_image ? [{ property: "og:image", content: l.hero_image }] : []),
        ...(l.hero_image ? [{ name: "twitter:image", content: l.hero_image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Listing not found</h1>
        <Link to="/listings" className="mt-4 inline-block text-accent">Back to listings</Link>
      </div>
    </div>
  ),
  component: ListingDetail,
});

function ListingDetail() {
  const { listing } = Route.useLoaderData();
  const img = listing.hero_image || listingFallback;

  useEffect(() => {
    recordImpression(listing.id, "view");
  }, [listing.id]);

  const categoryMap: Record<string, string> = {
    Restaurant: "LocalBusiness",
    Hotel: "LodgingBusiness",
    Attraction: "TouristAttraction",
    Tour: "TouristAttraction",
  };
  const schemaType = categoryMap[listing.category as string] || "LocalBusiness";

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Listings", to: "/listings" },
    { label: listing.name },
  ];

  const faqs = [
    {
      q: `Where is ${listing.name} located?`,
      a: listing.address
        ? `${listing.name} is located at ${listing.address} in ${listing.neighborhood}, San Diego.`
        : `${listing.name} is located in ${listing.neighborhood}, San Diego.`,
    },
    {
      q: `How do I contact ${listing.name}?`,
      a: listing.phone
        ? `You can call ${listing.name} at ${listing.phone}${listing.website ? ` or visit their website.` : "."}`
        : `Visit the ${listing.name} website for current contact details and hours.`,
    },
    {
      q: `Do sandiego.com Insider members get a discount at ${listing.name}?`,
      a: `Many of our partner ${listing.category?.toLowerCase() || "businesses"} offer Insider members up to 40% off. Check the Insider perks page for current offers.`,
    },
  ];

  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: listing.name,
    image: listing.hero_image || undefined,
    description: listing.short_description || listing.description || undefined,
    address: listing.address
      ? { "@type": "PostalAddress", streetAddress: listing.address, addressLocality: "San Diego", addressRegion: "CA" }
      : undefined,
    telephone: listing.phone || undefined,
    url: listing.website || undefined,
    aggregateRating: listing.rating
      ? { "@type": "AggregateRating", ratingValue: listing.rating, reviewCount: 1 }
      : undefined,
    priceRange: listing.price_range || undefined,
  };

  const jsonLd = [
    businessJsonLd,
    breadcrumbJsonLd(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative">
        <div className="aspect-[16/7] w-full overflow-hidden">
          <img src={img} alt={listing.name} className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="container-page -mt-16 relative">
        <div className="rounded-3xl bg-card border border-border p-8 md:p-12 shadow-xl">
          <Link to="/listings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All listings
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="eyebrow">{listing.category} · {listing.neighborhood}</div>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">{listing.name}</h1>
              {listing.short_description && (
                <p className="mt-3 max-w-2xl text-muted-foreground">{listing.short_description}</p>
              )}
            </div>
            {listing.rating != null && (
              <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-sm">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {Number(listing.rating).toFixed(1)}
              </div>
            )}
          </div>

          {listing.description && (
            <div className="prose prose-neutral mt-8 max-w-3xl whitespace-pre-line text-foreground">
              {listing.description}
            </div>
          )}

          <div className="mt-10 grid gap-3 sm:grid-cols-3 text-sm">
            {listing.address && (
              <div className="flex items-start gap-2 rounded-xl border border-border p-4">
                <MapPin className="h-4 w-4 mt-0.5 text-accent" />
                <span>{listing.address}</span>
              </div>
            )}
            {listing.phone && (
              <a
                href={`tel:${listing.phone}`}
                onClick={() => recordImpression(listing.id, "phone_click")}
                className="flex items-start gap-2 rounded-xl border border-border p-4 hover:bg-secondary"
              >
                <Phone className="h-4 w-4 mt-0.5 text-accent" />
                <span>{listing.phone}</span>
              </a>
            )}
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noreferrer"
                onClick={() => recordImpression(listing.id, "website_click")}
                className="flex items-start gap-2 rounded-xl border border-border p-4 hover:bg-secondary"
              >
                <Globe className="h-4 w-4 mt-0.5 text-accent" />
                <span className="truncate">Visit website</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Footer />
    </div>
  );
}
