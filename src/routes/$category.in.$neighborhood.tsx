import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BadgePercent, Lightbulb, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { EmailCapture } from "@/components/site/EmailCapture";
import { hubForSlug, type CategoryHub } from "@/lib/listing-categories";
import { getSeoNeighborhood, SEO_NEIGHBORHOODS, type SeoNeighborhood } from "@/lib/seo-neighborhoods";
import { fetchPublishedListings } from "@/lib/content-queries";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://sandiego.com";

type NeighborhoodPageRow = {
  id: string;
  category_slug: string;
  neighborhood_slug: string;
  neighborhood_name: string;
  title: string | null;
  intro: string | null;
  insider_tip: string | null;
  hero_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  faqs: { q: string; a: string }[] | null;
  status: string;
};

async function fetchPublishedNeighborhoodPage(
  categorySlug: string,
  neighborhoodSlug: string,
): Promise<NeighborhoodPageRow | null> {
  const { data } = await supabase
    .from("neighborhood_pages")
    .select(
      "id, category_slug, neighborhood_slug, neighborhood_name, title, intro, insider_tip, hero_image, meta_title, meta_description, faqs, status",
    )
    .eq("category_slug", categorySlug)
    .eq("neighborhood_slug", neighborhoodSlug)
    .eq("status", "published")
    .maybeSingle();
  return (data as NeighborhoodPageRow | null) ?? null;
}

export const Route = createFileRoute("/$category/in/$neighborhood")({
  loader: async ({ params }) => {
    const hub = hubForSlug(params.category);
    const hood = getSeoNeighborhood(params.neighborhood);
    if (!hub || !hood) throw notFound();
    if (!hood.categories.includes(hub.slug as never)) throw notFound();
    const cms = await fetchPublishedNeighborhoodPage(hub.slug, hood.slug).catch(() => null);
    return { hub, hood, cms };
  },
  head: ({ loaderData }) => {
    const d = loaderData;
    if (!d) return { meta: [{ title: "Page — sandiego.com" }] };
    const { hub, hood, cms } = d;
    const defaultTitle = `${hub.label} in ${hood.name}, San Diego | Members Save at ${hub.label}`;
    const defaultDesc = `Discover ${hub.label.toLowerCase()} in ${hood.name}, San Diego. SD Insider members save 15–30%. ${hood.description.slice(0, 80)}…`;
    const title = cms?.meta_title || defaultTitle;
    const description = cms?.meta_description || defaultDesc;
    const image = cms?.hero_image || hub.heroImage;
    const url = `${SITE_URL}/${hub.slug}/in/${hood.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { rel: "canonical", href: url },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <Header />
      <div className="py-20">
        <h1 className="font-display text-3xl font-semibold">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-accent">Back home</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: NeighborhoodCategoryPage,
});

function NeighborhoodCategoryPage() {
  const { hub, hood, cms } = Route.useLoaderData() as {
    hub: CategoryHub;
    hood: SeoNeighborhood;
    cms: NeighborhoodPageRow | null;
  };

  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const buckets = await Promise.all(
          hub.dbCategories.map((c) => fetchPublishedListings({ category: c, limit: 30 })),
        );
        const merged = buckets.flat() as ListingCardData[];
        const filtered = merged.filter(
          (l) =>
            (l.neighborhood || "").trim().toLowerCase() === hood.name.toLowerCase(),
        );
        if (!cancelled) setItems(filtered);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hub.slug, hood.slug, hub.dbCategories, hood.name]);

  const intro = cms?.intro || hood.description;
  const heroImage = cms?.hero_image || hub.heroImage ||
    "https://images.unsplash.com/photo-1538397956038-5b30aea4f88a?w=1600&q=80";
  const h1 = cms?.title || `${hub.label} in ${hood.name}, San Diego`;
  const insiderTip = cms?.insider_tip;
  const faqs: { q: string; a: string }[] = Array.isArray(cms?.faqs) && cms?.faqs?.length
    ? cms.faqs
    : defaultFaqs(hub, hood);

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: hub.label, to: `/${hub.slug}` },
    { label: hood.name },
  ];

  const otherCategories = hood.categories
    .filter((c) => c !== hub.slug)
    .map((c) => hubForSlug(c))
    .filter((h): h is CategoryHub => !!h);

  const otherNeighborhoods = SEO_NEIGHBORHOODS.filter(
    (n) => n.slug !== hood.slug && n.categories.includes(hub.slug as never),
  ).slice(0, 8);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: h1,
    itemListElement: items.slice(0, 20).map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/${hub.slug}/${l.slug}`,
      name: l.name,
    })),
  };

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${hood.name}, San Diego`,
    description: intro,
    containedInPlace: { "@type": "City", name: "San Diego" },
    ...(hood.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: hood.geo.lat,
            longitude: hood.geo.lng,
          },
        }
      : {}),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    placeJsonLd,
    itemListJsonLd,
    faqJsonLd,
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative isolate">
        <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
          <img
            src={heroImage}
            alt={`${hub.label} in ${hood.name}`}
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
          <div className="container-page relative z-10 flex h-full flex-col justify-end pb-10">
            <Breadcrumbs items={breadcrumbs} variant="dark" />
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
              <MapPin className="h-3.5 w-3.5" />
              <span>{hood.name}</span>
              <span className="opacity-50">·</span>
              <span>San Diego</span>
            </div>
            <h1 className="mt-3 max-w-3xl font-display text-4xl md:text-6xl font-semibold text-white drop-shadow-sm">
              {h1}
            </h1>
            {hub.memberBenefit && (
              <Link
                to="/insider"
                className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-accent px-4 py-2 text-xs md:text-sm font-bold text-accent-foreground shadow-md ring-1 ring-accent-foreground/10 hover:opacity-90 transition"
              >
                <BadgePercent className="h-4 w-4" />
                <span>{hub.memberBenefit}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-80" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">
              Why choose {hood.name}?
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">{intro}</p>
          </div>

          {insiderTip && (
            <aside className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-5 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
                <Lightbulb className="h-4 w-4" />
                Insider Tip
              </div>
              <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{insiderTip}</p>
            </aside>
          )}
        </div>

        <div className="mt-12">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <div className="eyebrow flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                {hub.label} · {hood.name}
              </div>
              <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">
                {items.length > 0
                  ? `${items.length} ${items.length === 1 ? hub.singular.toLowerCase() : hub.label.toLowerCase()} in ${hood.name}`
                  : `${hub.label} in ${hood.name}`}
              </h2>
            </div>
            <Link to="/$category" params={{ category: hub.slug }} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-accent">
              All {hub.label.toLowerCase()} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-border bg-card aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
              <p className="text-muted-foreground">
                We're still curating {hub.label.toLowerCase()} in {hood.name}.{" "}
                <Link to="/$category" params={{ category: hub.slug }} className="text-accent font-medium">
                  Browse all {hub.label.toLowerCase()} in San Diego →
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l) => (
                <ListingCard key={l.slug} listing={l} />
              ))}
            </div>
          )}
        </div>
      </section>

      {otherCategories.length > 0 && (
        <section className="container-page py-12 border-t border-border">
          <div className="eyebrow flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Also in {hood.name}
          </div>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">
            More to discover in {hood.name}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                to="/$category/in/$neighborhood"
                params={{ category: c.slug, neighborhood: hood.slug }}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-accent/60 hover:shadow-md transition"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {hood.name}
                </div>
                <div className="mt-1 font-display text-xl font-semibold flex items-center gap-2">
                  {c.label}
                  <ArrowRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  Top {c.label.toLowerCase()} picks in {hood.name}.
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-14">
        <EmailCapture source={`neighborhood_${hub.slug}_${hood.slug}`} />
      </section>

      {otherNeighborhoods.length > 0 && (
        <section className="container-page py-12 border-t border-border">
          <div className="eyebrow flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Nearby neighborhoods
          </div>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">
            {hub.label} in other San Diego neighborhoods
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {otherNeighborhoods.map((n) => (
              <Link
                key={n.slug}
                to="/$category/in/$neighborhood"
                params={{ category: hub.slug, neighborhood: n.slug }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary hover:border-accent/50 transition"
              >
                {hub.label} in {n.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-20">
        <div className="eyebrow flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> Frequently asked
        </div>
        <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">
          {hub.label} in {hood.name}: questions answered
        </h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-4">
                <span>{f.q}</span>
                <span className="text-accent group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
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

function defaultFaqs(hub: CategoryHub, hood: SeoNeighborhood): { q: string; a: string }[] {
  return [
    {
      q: `What are the best ${hub.label.toLowerCase()} in ${hood.name}?`,
      a: `Our editors hand-pick the top ${hub.label.toLowerCase()} in ${hood.name}, San Diego — every listing on this page is reviewed and worth your time.`,
    },
    {
      q: `Do SD Insider members save on ${hub.label.toLowerCase()} in ${hood.name}?`,
      a: `Yes — SD Insider members save 15–30% at participating ${hub.label.toLowerCase()} across San Diego, including ${hood.name}. Look for the "Members Save" badge on listing cards.`,
    },
    {
      q: `Where is ${hood.name} in San Diego?`,
      a: hood.description,
    },
  ];
}
