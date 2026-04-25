import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, Phone, MapPin, Star, ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { recordImpression } from "@/lib/content-queries";
import { hubForCategory, type CategoryHub } from "@/lib/listing-categories";
import listingFallback from "@/assets/listing-restaurant.jpg";

const SITE_URL = "https://sandiego.com";

type Listing = {
  id: string;
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  short_description?: string | null;
  description?: string | null;
  hero_image?: string | null;
  rating?: number | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  price_range?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

export function ListingDetailPage({
  listing,
  expectedHub,
}: {
  listing: Listing;
  /** The category hub the URL claims this listing belongs to. If the listing's actual category
   *  doesn't match, we 301-redirect to the canonical URL for SEO hygiene. */
  expectedHub: CategoryHub;
}) {
  const navigate = useNavigate();
  const actualHub = hubForCategory(listing.category);

  useEffect(() => {
    if (actualHub && actualHub.slug !== expectedHub.slug) {
      // Wrong hub URL — send the user (and crawlers, via canonical link) to the right one.
      window.location.replace(`/${actualHub.slug}/${listing.slug}`);
    }
  }, [actualHub, expectedHub.slug, listing.slug, navigate]);

  useEffect(() => {
    recordImpression(listing.id, "view");
  }, [listing.id]);

  const hub = actualHub ?? expectedHub;
  const img = listing.hero_image || listingFallback;

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: hub.label, to: `/${hub.slug}` },
    { label: listing.name },
  ];

  const canonicalUrl = `${SITE_URL}/${hub.slug}/${listing.slug}`;

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
    "@type": hub.schemaType,
    "@id": canonicalUrl,
    name: listing.name,
    image: listing.hero_image || undefined,
    description: listing.short_description || listing.description || undefined,
    address: listing.address
      ? {
          "@type": "PostalAddress",
          streetAddress: listing.address,
          addressLocality: "San Diego",
          addressRegion: "CA",
          addressCountry: "US",
        }
      : undefined,
    telephone: listing.phone || undefined,
    url: listing.website || canonicalUrl,
    aggregateRating: listing.rating
      ? { "@type": "AggregateRating", ratingValue: listing.rating, reviewCount: 1 }
      : undefined,
    priceRange: listing.price_range || undefined,
    areaServed: { "@type": "City", name: "San Diego" },
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
          <Breadcrumbs items={breadcrumbs} />
          <a
            href={`/${hub.slug}`}
            className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All {hub.label}
          </a>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="eyebrow">
                {listing.category} · {listing.neighborhood}
              </div>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">
                {listing.name}
              </h1>
              {listing.short_description && (
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  {listing.short_description}
                </p>
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

      <section className="container-page pb-20 max-w-3xl">
        <div className="eyebrow">Frequently asked</div>
        <h2 className="mt-1 font-display text-2xl md:text-3xl font-semibold">
          About {listing.name}
        </h2>
        <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-4">
                {f.q}
                <span className="text-accent group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
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

export function listingHeadMeta(listing: Listing, hub: CategoryHub) {
  const canonical = `${SITE_URL}/${hub.slug}/${listing.slug}`;
  const title =
    listing.meta_title || `${listing.name} — ${listing.neighborhood} ${hub.singular} | sandiego.com`;
  const description =
    listing.meta_description ||
    listing.short_description ||
    `${listing.name} in ${listing.neighborhood}, San Diego. Reviewed by sandiego.com editors.`;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { rel: "canonical", href: canonical },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:type", content: "place" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (listing.hero_image) {
    meta.push({ property: "og:image", content: listing.hero_image });
    meta.push({ name: "twitter:image", content: listing.hero_image });
  }
  return meta;
}
