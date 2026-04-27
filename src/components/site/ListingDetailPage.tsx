import { useEffect, useState } from "react";
import { Phone, Globe, MapPin, ArrowLeft, Sparkles, CalendarCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { recordImpression } from "@/lib/content-queries";
import { hubForCategory, type CategoryHub } from "@/lib/listing-categories";
import { supabase } from "@/integrations/supabase/client";
import { ListingHero } from "./listing/ListingHero";
import { ListingActionBar } from "./listing/ListingActionBar";
import { ListingHoursPanel, useListingHours } from "./listing/ListingHours";
import { ListingGallery } from "./listing/ListingGallery";
import { ListingMap } from "./listing/ListingMap";
import { RelatedListings } from "./listing/RelatedListings";
import {
  PartnerSpotlight,
  isSpotlightVisible,
  type PartnerSpotlightData,
} from "./listing/PartnerSpotlight";
import {
  EditorNoteCallout,
  WhyWePickedIt,
  InsiderTipCard,
  LocalContextBlock,
  CuratorByline,
} from "./listing/EditorialContext";
import { PairThisWith } from "./listing/PairThisWith";
import { toSchemaOpeningHours } from "@/lib/hours";

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
  gallery?: string[] | null;
  rating?: number | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  reservation_url?: string | null;
  price_range?: string | null;
  hours?: unknown;
  meta_title?: string | null;
  meta_description?: string | null;
  tier?: string | null;
  partner_spotlight?: unknown;
  editor_note?: string | null;
  why_we_picked_it?: string[] | null;
  insider_tip?: string | null;
  best_time_to_visit?: string | null;
  local_context?: string | null;
  curator_id?: string | null;
  verified_visited?: boolean | null;
  updated_at?: string | null;
};

function reservationProvider(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("opentable")) return "OpenTable";
    if (host.includes("resy")) return "Resy";
    if (host.includes("exploretock") || host.includes("tock")) return "Tock";
    if (host.includes("sevenrooms")) return "SevenRooms";
    if (host.includes("yelp")) return "Yelp";
    if (host.includes("booking.com")) return "Booking.com";
    if (host.includes("expedia")) return "Expedia";
    if (host.includes("hotels.com")) return "Hotels.com";
    if (host.includes("getyourguide")) return "GetYourGuide";
    if (host.includes("viator")) return "Viator";
    return host.split(".").slice(-2, -1)[0]?.replace(/^\w/, (c) => c.toUpperCase()) || "their site";
  } catch {
    return "their site";
  }
}

function tagsForListing(l: Listing): string[] {
  const tags: string[] = [];
  if (l.price_range) tags.push(`${l.price_range} price`);
  const c = (l.category || "").toLowerCase();
  if (c.includes("restaurant")) tags.push("Reservations recommended", "Date night", "Group friendly");
  if (c.includes("hotel")) tags.push("Free Wi-Fi", "Walkable area");
  if (c.includes("nightlife")) tags.push("21+", "Late night");
  if (c.includes("attraction")) tags.push("Family friendly", "Photo-worthy");
  if (c.includes("tour")) tags.push("Free cancellation", "Small group");
  if (c.includes("shopping")) tags.push("Local makers");
  return tags;
}

export function ListingDetailPage({
  listing,
  expectedHub,
}: {
  listing: Listing;
  /** The category hub the URL claims this listing belongs to. If the listing's actual category
   *  doesn't match, we 301-redirect to the canonical URL for SEO hygiene. */
  expectedHub: CategoryHub;
}) {
  const actualHub = hubForCategory(listing.category);

  useEffect(() => {
    if (actualHub && actualHub.slug !== expectedHub.slug) {
      window.location.replace(`/${actualHub.slug}/${listing.slug}`);
    }
  }, [actualHub, expectedHub.slug, listing.slug]);

  useEffect(() => {
    recordImpression(listing.id, "view");
  }, [listing.id]);

  // Fetch curator profile for byline
  const [curator, setCurator] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  useEffect(() => {
    if (!listing.curator_id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", listing.curator_id!)
        .maybeSingle();
      if (!cancelled && data) setCurator(data);
    })();
    return () => { cancelled = true; };
  }, [listing.curator_id]);

  const hub = actualHub ?? expectedHub;
  const hours = useListingHours(listing.hours);
  const spotlight = listing.partner_spotlight as PartnerSpotlightData | null | undefined;
  const tierAllowsSpotlight = listing.tier === "featured" || listing.tier === "premium";
  const showSpotlight = tierAllowsSpotlight && isSpotlightVisible(spotlight);

  // De-duplicate description: if the long description starts with the short one, only show one.
  const longDesc = (listing.description ?? "").trim();
  const shortDesc = (listing.short_description ?? "").trim();
  const showLong =
    longDesc &&
    longDesc !== shortDesc &&
    !longDesc.toLowerCase().startsWith(shortDesc.toLowerCase());

  // Gallery — drop any duplicates of the hero so we don't repeat the same image.
  const galleryRaw = (listing.gallery ?? []).filter((u) => u && u !== listing.hero_image);

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: hub.label, to: `/${hub.slug}` },
    { label: listing.name },
  ];

  const canonicalUrl = `${SITE_URL}/${hub.slug}/${listing.slug}`;
  const tags = tagsForListing(listing);

  // FAQs — derived from real fields when possible, generic only as fallback.
  const faqs: { q: string; a: string }[] = [
    {
      q: `Where is ${listing.name} located?`,
      a: listing.address
        ? `${listing.name} is at ${listing.address} in ${listing.neighborhood}, San Diego.`
        : `${listing.name} is located in ${listing.neighborhood}, San Diego.`,
    },
  ];
  if (hours.label && hours.state !== "unknown") {
    faqs.push({
      q: `What are ${listing.name}'s hours?`,
      a: `${listing.name} is currently ${hours.label.toLowerCase()}. See the hours panel for the full weekly schedule.`,
    });
  }
  if (listing.phone || listing.website) {
    faqs.push({
      q: `How do I contact ${listing.name}?`,
      a: [
        listing.phone ? `Call ${listing.phone}.` : null,
        listing.website ? `Visit the official website for current details.` : null,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }
  if (listing.price_range) {
    faqs.push({
      q: `How expensive is ${listing.name}?`,
      a: `${listing.name} is in the ${listing.price_range} price range.`,
    });
  }

  const businessJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": hub.schemaType,
    "@id": canonicalUrl,
    name: listing.name,
    image: galleryRaw.length
      ? [listing.hero_image, ...galleryRaw].filter(Boolean)
      : listing.hero_image || undefined,
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
    openingHoursSpecification: toSchemaOpeningHours(hours.days),
    areaServed: { "@type": "City", name: "San Diego" },
    dateModified: listing.updated_at || undefined,
    ...(curator?.display_name
      ? { author: { "@type": "Person", name: curator.display_name } }
      : {}),
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
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header />

      <ListingHero
        listing={listing}
        openLabel={hours.label}
        openState={hours.state}
      />

      <div className="container-page mt-10 md:mt-14">
        <Breadcrumbs items={breadcrumbs} />
        <a
          href={`/${hub.slug}`}
          className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All {hub.label}
        </a>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main content column */}
          <div className="space-y-12">
            {/* Mobile-only spotlight (sidebar version shown on desktop) */}
            {showSpotlight && spotlight && (
              <div className="lg:hidden">
                <PartnerSpotlight
                  spotlight={spotlight}
                  listingId={listing.id}
                  listingName={listing.name}
                  variant="sidebar"
                />
              </div>
            )}
            {/* Overview */}
            <section>
              <div className="eyebrow">The vibe</div>
              <h2 className="mt-1 font-display text-2xl md:text-3xl font-semibold">
                About {listing.name}
              </h2>

              <div className="mt-3">
                <CuratorByline
                  curatorName={curator?.display_name ?? null}
                  curatorAvatar={curator?.avatar_url ?? null}
                  updatedAt={listing.updated_at ?? null}
                  verifiedVisited={listing.verified_visited ?? false}
                />
              </div>

              {listing.editor_note && (
                <div className="mt-5">
                  <EditorNoteCallout note={listing.editor_note} />
                </div>
              )}

              {listing.why_we_picked_it && listing.why_we_picked_it.length > 0 && (
                <div className="mt-4">
                  <WhyWePickedIt reasons={listing.why_we_picked_it} />
                </div>
              )}

              {showLong ? (
                <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-line text-foreground">
                  {longDesc}
                </div>
              ) : (
                <p className="mt-6 max-w-2xl text-muted-foreground">
                  {shortDesc || `${listing.name} is one of our editor-vetted picks in ${listing.neighborhood}.`}
                </p>
              )}

              {listing.local_context && (
                <LocalContextBlock neighborhood={listing.neighborhood} context={listing.local_context} />
              )}

              {tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Pair this with — companion listings in same neighborhood */}
            <PairThisWith
              category={listing.category}
              neighborhood={listing.neighborhood}
              excludeId={listing.id}
            />

            {/* Photos */}
            {galleryRaw.length > 0 && (
              <section>
                <div className="eyebrow">Photos</div>
                <h2 className="mt-1 mb-5 font-display text-2xl md:text-3xl font-semibold">
                  See inside
                </h2>
                <ListingGallery images={galleryRaw} name={listing.name} />
              </section>
            )}

            {/* Location */}
            {listing.address && (
              <section>
                <div className="eyebrow">Where you'll be</div>
                <h2 className="mt-1 mb-5 font-display text-2xl md:text-3xl font-semibold">
                  Location
                </h2>
                <ListingMap address={listing.address} name={listing.name} />
              </section>
            )}

            {/* FAQ */}
            <section>
              <div className="eyebrow">Frequently asked</div>
              <h2 className="mt-1 font-display text-2xl md:text-3xl font-semibold">
                Quick answers
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
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            {showSpotlight && spotlight && (
              <div className="hidden lg:block">
                <PartnerSpotlight
                  spotlight={spotlight}
                  listingId={listing.id}
                  listingName={listing.name}
                  variant="sidebar"
                />
              </div>
            )}
            {listing.reservation_url && (
              <div className="rounded-3xl border border-accent/40 bg-gradient-to-br from-accent/15 via-card to-card p-5 shadow-sm">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  <CalendarCheck className="h-3 w-3" /> Book a table
                </div>
                <p className="mt-3 text-sm font-medium">
                  Reserve at {listing.name} in seconds.
                </p>
                <a
                  href={listing.reservation_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => recordImpression(listing.id, "reservation_click")}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Reserve on {reservationProvider(listing.reservation_url)}
                </a>
                <p className="mt-2 text-[11px] text-muted-foreground text-center">
                  You'll be redirected to {reservationProvider(listing.reservation_url)} to complete your booking.
                </p>
              </div>
            )}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              {hours.label && (
                <div className="mb-4 flex items-center gap-2 text-sm">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      hours.state === "open" ? "bg-emerald-500" : "bg-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      hours.state === "open"
                        ? "font-semibold text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }
                  >
                    {hours.label}
                  </span>
                </div>
              )}
              {hours.days && <ListingHoursPanel days={hours.days} />}

              <div className="mt-4 space-y-3 text-sm">
                {listing.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address + ", San Diego, CA")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-2 hover:text-foreground"
                  >
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                    <span className="text-muted-foreground">{listing.address}</span>
                  </a>
                )}
                {listing.phone && (
                  <a
                    href={`tel:${listing.phone}`}
                    onClick={() => recordImpression(listing.id, "phone_click")}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <Phone className="h-4 w-4 text-accent" />
                    <span>{listing.phone}</span>
                  </a>
                )}
                {listing.website && (
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => recordImpression(listing.id, "website_click")}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <Globe className="h-4 w-4 text-accent" />
                    <span className="truncate">Visit website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Insider perk card — also doubles as a sponsorship slot */}
            <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-background to-background p-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                <Sparkles className="h-3 w-3" /> Insider perk
              </div>
              <p className="mt-3 text-sm font-medium">
                Members save up to 40% at partner {hub.label.toLowerCase()} like {listing.name}.
              </p>
              <a
                href="/insider"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
              >
                Become an Insider
              </a>
            </div>
          </aside>
        </div>

        {/* Related */}
        <div className="mt-20">
          <RelatedListings
            excludeId={listing.id}
            category={listing.category}
            neighborhood={listing.neighborhood}
            hubLabel={hub.label}
            hubSlug={hub.slug}
          />
        </div>
      </div>

      {/* Mobile sticky bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <ListingActionBar
          variant="sticky"
          listingId={listing.id}
          name={listing.name}
          phone={listing.phone}
          website={listing.website}
          address={listing.address}
          reservationUrl={listing.reservation_url}
        />
      </div>

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
