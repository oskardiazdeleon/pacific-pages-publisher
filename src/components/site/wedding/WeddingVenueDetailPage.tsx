import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  ArrowLeft,
  Heart,
  Users,
  Tag,
  Calendar,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Globe,
  Phone,
  Building2,
  Trees,
  Sun,
  Music2,
  Utensils,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { recordImpression } from "@/lib/content-queries";
import { hubForCategory, type CategoryHub } from "@/lib/listing-categories";
import { supabase } from "@/integrations/supabase/client";
import { ListingGallery } from "@/components/site/listing/ListingGallery";
import { ListingMap } from "@/components/site/listing/ListingMap";
import { RelatedListings } from "@/components/site/listing/RelatedListings";
import { CuratorByline } from "@/components/site/listing/EditorialContext";
import { VenueInquiryForm } from "./VenueInquiryForm";

const SITE_URL = "https://sandiego.com";

type WeddingDetails = {
  venue_types?: string[];
  settings?: string[];
  ceremony_capacity?: number | string | null;
  reception_capacity?: number | string | null;
  min_capacity?: number | string | null;
  max_capacity?: number | string | null;
  get_ready_rooms?: boolean | null;
  starting_price?: string | null;
  peak_price?: string | null;
  off_peak_price?: string | null;
  average_price?: string | null;
  pricing_notes?: string | null;
  response_time?: string | null;
  spaces?: { name: string; capacity?: string; type?: string; image?: string; description?: string }[];
  event_types?: string[];
  services?: string[];
  items_included?: string[];
  accessibility?: string[];
};

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
  meta_title?: string | null;
  meta_description?: string | null;
  editor_note?: string | null;
  why_we_picked_it?: string[] | null;
  insider_tip?: string | null;
  curator_id?: string | null;
  verified_visited?: boolean | null;
  updated_at?: string | null;
  faqs?: unknown;
  partner_id?: string | null;
  wedding_details?: WeddingDetails | null;
};

function settingIcon(s: string) {
  const t = s.toLowerCase();
  if (t.includes("beach") || t.includes("water")) return Sun;
  if (t.includes("garden") || t.includes("outdoor") || t.includes("vineyard")) return Trees;
  return Building2;
}

export function WeddingVenueDetailPage({ listing }: { listing: Listing }) {
  const hub = (hubForCategory(listing.category) ?? hubForCategory("WeddingVenue"))!;
  const wd: WeddingDetails = listing.wedding_details ?? {};

  useEffect(() => {
    recordImpression(listing.id, "view");
  }, [listing.id]);

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
    return () => {
      cancelled = true;
    };
  }, [listing.curator_id]);

  const heroImage = listing.hero_image ?? "";
  const galleryAll = useMemo(() => {
    const all = [heroImage, ...(listing.gallery ?? [])].filter(Boolean) as string[];
    return Array.from(new Set(all));
  }, [heroImage, listing.gallery]);
  const heroGrid = galleryAll.slice(0, 5);

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: hub.label, to: `/${hub.slug}` },
    { label: listing.name },
  ];

  const capacityLabel =
    wd.max_capacity
      ? `Up to ${wd.max_capacity} guests`
      : wd.reception_capacity
        ? `${wd.reception_capacity} reception`
        : "Inquire for capacity";

  const startingPrice = wd.starting_price || wd.average_price || listing.price_range || null;

  const quickFacts = [
    { icon: Users, label: "Capacity", value: capacityLabel },
    wd.settings?.length ? { icon: Trees, label: "Setting", value: wd.settings.slice(0, 2).join(", ") } : null,
    wd.ceremony_capacity || wd.reception_capacity
      ? {
          icon: Heart,
          label: "Ceremony + reception",
          value: [
            wd.ceremony_capacity ? `${wd.ceremony_capacity} ceremony` : null,
            wd.reception_capacity ? `${wd.reception_capacity} reception` : null,
          ]
            .filter(Boolean)
            .join(" · "),
        }
      : null,
    wd.get_ready_rooms ? { icon: CheckCircle2, label: "Get-ready rooms", value: "Available on-site" } : null,
    startingPrice ? { icon: Tag, label: "Pricing from", value: startingPrice } : null,
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  const amenityGroups: { title: string; icon: any; items: string[] }[] = [
    { title: "Event types", icon: Heart, items: wd.event_types ?? [] },
    { title: "Services", icon: Sparkles, items: wd.services ?? [] },
    { title: "Settings", icon: Trees, items: wd.settings ?? [] },
    { title: "What's included", icon: CheckCircle2, items: wd.items_included ?? [] },
    { title: "Accessibility", icon: Users, items: wd.accessibility ?? [] },
  ].filter((g) => g.items.length > 0);

  // FAQs
  const customFaqs = Array.isArray(listing.faqs)
    ? (listing.faqs as unknown[]).filter(
        (f): f is { q: string; a: string } =>
          !!f &&
          typeof f === "object" &&
          typeof (f as any).q === "string" &&
          typeof (f as any).a === "string",
      )
    : [];
  const faqs: { q: string; a: string }[] = customFaqs.length
    ? customFaqs
    : [
        {
          q: `How many guests can ${listing.name} accommodate?`,
          a: capacityLabel + (wd.min_capacity ? `. Minimum ${wd.min_capacity} guests.` : "."),
        },
        {
          q: `What's included in the venue rental?`,
          a:
            wd.items_included?.length
              ? `Included: ${wd.items_included.join(", ")}.`
              : `Contact ${listing.name} for a full list of inclusions and add-ons.`,
        },
        {
          q: `What's the typical price range?`,
          a:
            wd.peak_price || wd.off_peak_price
              ? `Peak season from ${wd.peak_price ?? "—"} · off-peak from ${wd.off_peak_price ?? "—"}. Final pricing depends on date, guest count and package.`
              : startingPrice
                ? `Pricing starts around ${startingPrice}. Request a personalized quote for your date.`
                : `Pricing varies by date and guest count — request a quote.`,
        },
        ...(wd.response_time
          ? [{ q: "How quickly will I hear back?", a: `${listing.name} typically responds within ${wd.response_time}.` }]
          : []),
      ];

  const canonicalUrl = `${SITE_URL}/${hub.slug}/${listing.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "EventVenue",
      "@id": canonicalUrl,
      name: listing.name,
      image: galleryAll.length ? galleryAll : undefined,
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
      maximumAttendeeCapacity: wd.max_capacity ? Number(wd.max_capacity) || undefined : undefined,
    },
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

      {/* Hero gallery */}
      <section className="container-page pt-6 md:pt-8">
        <Breadcrumbs items={breadcrumbs} />
        <a
          href={`/${hub.slug}`}
          className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All wedding venues
        </a>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <Heart className="h-3 w-3" /> Wedding venue
              {wd.venue_types?.length ? ` · ${wd.venue_types[0]}` : ""}
              {listing.neighborhood ? ` · ${listing.neighborhood}` : ""}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
              {listing.name}
            </h1>
            {listing.short_description && (
              <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                {listing.short_description}
              </p>
            )}
          </div>
        </div>

        {heroGrid.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-2 overflow-hidden rounded-3xl md:grid-cols-4 md:grid-rows-2 md:h-[480px]">
            <a
              href="#gallery"
              className="group relative overflow-hidden md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto"
            >
              <img
                src={heroGrid[0]}
                alt={`${listing.name} hero`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </a>
            {heroGrid.slice(1, 5).map((src, i) => (
              <a
                key={src + i}
                href="#gallery"
                className="group relative hidden md:block overflow-hidden"
              >
                <img
                  src={src}
                  alt={`${listing.name} ${i + 2}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </a>
            ))}
            {galleryAll.length > 1 && (
              <a
                href="#gallery"
                className="absolute md:static bottom-4 right-4 md:bottom-auto md:right-auto inline-flex items-center gap-1.5 self-end justify-self-end rounded-full bg-background/95 px-3.5 py-2 text-sm font-semibold shadow-md hover:bg-background"
              >
                View all {galleryAll.length} photos
              </a>
            )}
          </div>
        )}

        {/* Quick facts */}
        {quickFacts.length > 0 && (
          <div className="mt-6 grid gap-3 rounded-3xl border border-border bg-card p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {quickFacts.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {f.label}
                    </div>
                    <div className="text-sm font-medium text-foreground">{f.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="container-page mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="space-y-14">
          {/* About */}
          <section>
            <div className="eyebrow">About the venue</div>
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
            {listing.description && (
              <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-line text-foreground">
                {listing.description}
              </div>
            )}

            {listing.why_we_picked_it && listing.why_we_picked_it.length > 0 && (
              <div className="mt-8 rounded-3xl border border-accent/30 bg-accent/5 p-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  <Sparkles className="h-3 w-3" /> Why we picked it
                </div>
                <ul className="mt-4 space-y-2">
                  {listing.why_we_picked_it.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Spaces & capacity */}
          {wd.spaces && wd.spaces.length > 0 && (
            <section>
              <div className="eyebrow">Spaces & capacity</div>
              <h2 className="mt-1 mb-5 font-display text-2xl md:text-3xl font-semibold">
                Event spaces at {listing.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {wd.spaces.map((s) => {
                  const Icon = settingIcon(s.type ?? "");
                  return (
                    <div
                      key={s.name}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      {s.image && (
                        <div className="aspect-[16/10] overflow-hidden bg-muted">
                          <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-accent">
                          <Icon className="h-3.5 w-3.5" />
                          {s.type ?? "Event space"}
                        </div>
                        <h3 className="mt-1 font-display text-lg font-semibold">{s.name}</h3>
                        {s.capacity && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            <Users className="mr-1.5 inline h-3.5 w-3.5 text-accent" />
                            {s.capacity}
                          </div>
                        )}
                        {s.description && (
                          <p className="mt-2 text-sm text-foreground/80">{s.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Pricing */}
          {(wd.peak_price || wd.off_peak_price || wd.average_price || wd.pricing_notes) && (
            <section>
              <div className="eyebrow">Pricing</div>
              <h2 className="mt-1 mb-5 font-display text-2xl md:text-3xl font-semibold">
                What it costs
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {wd.peak_price && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Peak season
                    </div>
                    <div className="mt-2 font-display text-2xl font-semibold">{wd.peak_price}</div>
                    <div className="mt-1 text-xs text-muted-foreground">May–October, Saturdays</div>
                  </div>
                )}
                {wd.off_peak_price && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Off-peak
                    </div>
                    <div className="mt-2 font-display text-2xl font-semibold">{wd.off_peak_price}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Nov–April & weekdays</div>
                  </div>
                )}
              </div>
              {wd.average_price && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Average couples spend around <span className="font-semibold text-foreground">{wd.average_price}</span> here.
                </p>
              )}
              {wd.pricing_notes && (
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{wd.pricing_notes}</p>
              )}
              <a
                href="#inquire"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
              >
                Get a personalized quote
              </a>
            </section>
          )}

          {/* Amenities */}
          {amenityGroups.length > 0 && (
            <section>
              <div className="eyebrow">Amenities & services</div>
              <h2 className="mt-1 mb-5 font-display text-2xl md:text-3xl font-semibold">
                What's offered
              </h2>
              <div className="space-y-6">
                {amenityGroups.map((g) => {
                  const Icon = g.icon;
                  return (
                    <div key={g.title}>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="h-4 w-4 text-accent" />
                        {g.title}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {g.items.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-foreground/80"
                          >
                            <CheckCircle2 className="h-3 w-3 text-accent" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Photo gallery */}
          {galleryAll.length > 1 && (
            <section id="gallery">
              <div className="eyebrow">Photos</div>
              <h2 className="mt-1 mb-5 font-display text-2xl md:text-3xl font-semibold">
                Photo gallery
              </h2>
              <ListingGallery images={galleryAll} name={listing.name} />
            </section>
          )}

          {/* Inquiry */}
          <section id="inquire">
            <div className="eyebrow">Request pricing</div>
            <h2 className="mt-1 mb-2 font-display text-2xl md:text-3xl font-semibold">
              Reach out to {listing.name}
            </h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Tell the venue about your wedding. They'll respond
              {wd.response_time ? ` within ${wd.response_time}` : " soon"} with availability and a custom quote.
            </p>
            <VenueInquiryForm listingId={listing.id} venueName={listing.name} />
          </section>

          {/* FAQ */}
          <section>
            <div className="eyebrow">Frequently asked</div>
            <h2 className="mt-1 font-display text-2xl md:text-3xl font-semibold">Quick answers</h2>
            <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
              {faqs.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-accent group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Location */}
          {listing.address && (
            <section>
              <div className="eyebrow">Where you'll be</div>
              <h2 className="mt-1 mb-5 font-display text-2xl md:text-3xl font-semibold">Location</h2>
              <ListingMap address={listing.address} name={listing.name} />
            </section>
          )}
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <div className="rounded-3xl border border-accent/40 bg-gradient-to-br from-accent/15 via-card to-card p-6 shadow-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <Heart className="h-3 w-3" /> Plan your wedding
            </div>
            {startingPrice && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Starting from</div>
                <div className="font-display text-2xl font-semibold">{startingPrice}</div>
              </div>
            )}
            <div className="mt-1 text-sm text-muted-foreground">{capacityLabel}</div>
            <a
              href="#inquire"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> Request pricing
            </a>
            <a
              href="#inquire"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
            >
              <Calendar className="h-4 w-4" /> Schedule a visit
            </a>
            {wd.response_time && (
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Typically responds within {wd.response_time}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3 text-sm">
            {listing.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address + ", San Diego, CA")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 hover:text-foreground"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
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

          {listing.insider_tip && (
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                <Sparkles className="h-3 w-3" /> Insider tip
              </div>
              <p className="mt-3 text-sm text-foreground/85">{listing.insider_tip}</p>
            </div>
          )}
        </aside>
      </div>

      {/* Related */}
      <div className="container-page mt-20">
        <RelatedListings
          excludeId={listing.id}
          category={listing.category}
          neighborhood={listing.neighborhood}
          hubLabel={hub.label}
          hubSlug={hub.slug}
        />
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs">
            {startingPrice && (
              <>
                <div className="text-muted-foreground">From</div>
                <div className="font-semibold">{startingPrice}</div>
              </>
            )}
          </div>
          <a
            href="#inquire"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Request pricing
          </a>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Footer />
    </div>
  );
}

export function weddingVenueHeadMeta(listing: Listing, hub: CategoryHub) {
  const canonical = `${SITE_URL}/${hub.slug}/${listing.slug}`;
  const title =
    listing.meta_title ||
    `${listing.name} — Wedding Venue in ${listing.neighborhood} | sandiego.com`;
  const description =
    listing.meta_description ||
    listing.short_description ||
    `${listing.name} wedding venue in ${listing.neighborhood}, San Diego. Capacity, pricing, photos and inquiry.`;
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
