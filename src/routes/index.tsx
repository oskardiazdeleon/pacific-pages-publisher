import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { ArticleCard, type ArticleCardData } from "@/components/site/ArticleCard";
import { EmailCapture } from "@/components/site/EmailCapture";
import { listings as mockListings, articles as mockArticles, neighborhoods } from "@/lib/mock-data";
import { fetchPublishedListings, fetchPublishedArticles } from "@/lib/content-queries";
import { fetchPublishedHomepageSections, type HomepageSection } from "@/lib/cms";
import { supabase } from "@/integrations/supabase/client";
import hero from "@/assets/hero-sandiego.jpg";
import { appendUTMs } from "@/lib/utm";

const HOME_FAQS: { q: string; a: string }[] = [
  {
    q: "When is the best time to visit San Diego?",
    a: "San Diego is a year-round destination thanks to its mild Mediterranean climate, but March through May and September through November offer the best mix of warm weather, lower hotel rates, and thinner crowds. Summer (June–August) is peak season with the warmest ocean temperatures, while winter brings whale-watching season and the lowest prices.",
  },
  {
    q: "How many days do you need in San Diego?",
    a: "Three to four days is enough to cover the highlights — Balboa Park, the beaches of La Jolla and Coronado, the Gaslamp Quarter, and a day at the San Diego Zoo or Safari Park. Five to seven days lets you slow down, explore neighborhoods like Little Italy and North Park, and take a day trip to Temecula wine country or across the border to Tijuana.",
  },
  {
    q: "What is the best neighborhood to stay in?",
    a: "Downtown and the Gaslamp Quarter are best for first-time visitors who want walkable nightlife and dining. La Jolla is ideal for couples and luxury travelers. Coronado suits families wanting a quiet beach base. Little Italy is the sweet spot for food-focused trips, and Pacific Beach is the pick for a younger, surf-and-bar crowd.",
  },
  {
    q: "Is San Diego walkable, or do I need a car?",
    a: "Downtown, the Gaslamp, Little Italy, and Balboa Park are very walkable and connected by the trolley. To reach the beaches, La Jolla, Coronado, or North County, a car or rideshare is much more convenient — public transit between neighborhoods is limited.",
  },
  {
    q: "How do I get from San Diego International Airport to downtown?",
    a: "SAN airport sits just two miles from downtown. A rideshare or taxi runs about 10 minutes and $15–$25. The free Old Town Trolley shuttle and the MTS Route 992 bus also connect the airport to downtown for $2.50.",
  },
  {
    q: "What are the must-see things to do in San Diego?",
    a: "The classics are Balboa Park and the San Diego Zoo, La Jolla Cove and the sea caves, Coronado Beach and the Hotel del Coronado, the USS Midway Museum, sunset at Sunset Cliffs, and tacos in Barrio Logan or Old Town. Add the San Diego Safari Park or a whale-watching cruise if you have extra time.",
  },
];

type HomeNeighborhood = {
  id: string;
  name: string;
  blurb: string | null;
  image_url: string | null;
  link_to: string;
};

type HomeLoaderData = {
  featured: ListingCardData[];
  posts: ArticleCardData[];
  cms: Record<string, Record<string, unknown>>;
  hoods: HomeNeighborhood[];
};

// Server-side loader — runs during SSR so featured listings, editorial posts,
// CMS sections, and home neighborhoods land in the initial HTML.
async function loadHome(): Promise<HomeLoaderData> {
  let featured: ListingCardData[] = [];
  let posts: ArticleCardData[] = [];
  const cms: Record<string, Record<string, unknown>> = {};
  let hoods: HomeNeighborhood[] = [];

  try {
    const [l, a, sections] = await Promise.all([
      fetchPublishedListings({ limit: 6 }),
      fetchPublishedArticles({ limit: 4 }),
      fetchPublishedHomepageSections(),
    ]);
    const paid = l.filter((x) => x.tier !== "free");
    const filler = l.filter((x) => x.tier === "free");
    let feat = [...paid, ...filler].slice(0, 3);
    if (feat.length < 3) {
      const seen = new Set(feat.map((f) => f.slug));
      const mockFill = [
        ...mockListings.filter((m) => m.tier !== "free"),
        ...mockListings.filter((m) => m.tier === "free"),
      ].filter((m) => !seen.has(m.slug));
      feat = [...feat, ...mockFill].slice(0, 3) as typeof feat;
    }
    featured = feat as ListingCardData[];
    posts = (a.length ? a : mockArticles) as ArticleCardData[];
    for (const s of sections as HomepageSection[]) {
      cms[s.section_key] = (s.published_content || {}) as Record<string, unknown>;
    }
  } catch {
    featured = mockListings.filter((m) => m.tier !== "free").slice(0, 3) as ListingCardData[];
    posts = mockArticles as ArticleCardData[];
  }

  try {
    const { data } = await supabase
      .from("home_neighborhoods")
      .select("id, name, blurb, image_url, link_to")
      .eq("enabled", true)
      .order("position");
    if (data && data.length) hoods = data as HomeNeighborhood[];
  } catch {
    // ignore — fall back to hardcoded neighborhoods in the component
  }

  return { featured, posts, cms, hoods };
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "sandiego.com — The Definitive Guide to America's Finest City" },
      {
        name: "description",
        content:
          "The definitive guide to San Diego — handpicked hotels, restaurants, things to do, and neighborhood guides from local experts. Plan your trip with insider picks for La Jolla, Coronado, Gaslamp Quarter, and beyond.",
      },
      { property: "og:title", content: "sandiego.com — The Definitive Guide to San Diego" },
      {
        property: "og:description",
        content:
          "The definitive guide to San Diego — handpicked hotels, restaurants, things to do, and neighborhood guides from local experts.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sandiego.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  loader: () => loadHome(),
  component: HomePage,
});

function HomePage() {
  const { featured, posts, cms, hoods } = Route.useLoaderData();

  const c = (key: string, field: string, fallback: string): string => (cms[key]?.[field] as string) || fallback;
  const heroCms = cms["hero"] || {};
  const sponsorActive = heroCms["sponsor_active"] === true || heroCms["sponsor_active"] === "true";
  const sponsorName = (heroCms["sponsor_name"] as string) || "";
  const sponsorLogo = (heroCms["sponsor_logo_url"] as string) || "";
  const sponsorLink = (heroCms["sponsor_link_url"] as string) || "";

  // Default Insider-promoting hero — used when no sponsor takeover is active.
  const DEFAULT_HERO = {
    eyebrow: "America's Finest City",
    heading: "San Diego, distilled.",
    subheading:
      "Handpicked places to stay, eat and explore — alongside the stories that make this city worth crossing the country for.",
    primary_cta_label: "Join Insider — from $19/mo",
    primary_cta_to: "/insider",
    secondary_cta_label: "Explore San Diego",
    secondary_cta_to: "/listings",
    image_url: hero,
  };

  // Pick the active hero values: sponsor overrides win, otherwise defaults.
  const heroVal = (field: keyof typeof DEFAULT_HERO): string => {
    if (sponsorActive) {
      return ((heroCms[field] as string) || "").trim() || (DEFAULT_HERO[field] as string);
    }
    return DEFAULT_HERO[field] as string;
  };
  const heroImg = heroVal("image_url");

  const [leadArticle, ...moreArticles] = posts;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt={sponsorActive && sponsorName ? `Presented by ${sponsorName}` : "San Diego coastline at golden hour"}
            width={1920}
            height={1280}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary/35 to-background" />
        </div>
        <div className="relative container-page pt-24 pb-32 md:pt-36 md:pb-48 text-primary-foreground">
          {sponsorActive && sponsorName && (
            <a
              href={sponsorLink || "#"}
              target={sponsorLink ? "_blank" : undefined}
              rel={sponsorLink ? "noreferrer noopener" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/95 hover:bg-primary-foreground/20 transition mb-5"
            >
              <span className="opacity-70">Presented by</span>
              {sponsorLogo ? (
                <img
                  src={sponsorLogo}
                  alt={sponsorName}
                  className="h-4 w-auto object-contain"
                  loading="lazy"
                />
              ) : (
                <span>{sponsorName}</span>
              )}
            </a>
          )}
          <span className="eyebrow text-teal-soft">{heroVal("eyebrow")}</span>
          <h1 className="mt-4 max-w-3xl font-display text-5xl md:text-7xl font-semibold leading-[1.05]">
            {heroVal("heading")}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
            {heroVal("subheading")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={appendUTMs(heroVal("primary_cta_to"), "site", "hero", "insider")}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
            >
              {!sponsorActive && <Sparkles className="h-4 w-4" />} {heroVal("primary_cta_label")}
            </a>
            <a
              href={heroVal("secondary_cta_to")}
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/20 transition"
            >
              {heroVal("secondary_cta_label")} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="container-page -mt-20 md:-mt-28 relative">
        <div className="rounded-3xl bg-card border border-border shadow-2xl p-6 md:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> {c("featured", "eyebrow", "Featured this week")}</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">{c("featured", "heading", "Where San Diego is going")}</h2>
            </div>
            <a href={c("featured", "cta_to", "/listings")} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-accent">
              {c("featured", "cta_label", "View all")} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((l) => <ListingCard key={l.slug} listing={l} />)}
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="container-page mt-24">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">{c("editorial", "eyebrow", "Local Dispatch")}</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">{c("editorial", "heading", "Postcards from San Diego")}</h2>
          </div>
          <a href={c("editorial", "cta_to", "/articles")} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-accent">
            {c("editorial", "cta_label", "All articles")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {leadArticle && <ArticleCard article={leadArticle} />}
          </div>
          <div className="lg:col-span-5 space-y-8">
            {moreArticles.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="container-page mt-24">
        <div className="eyebrow flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {c("neighborhoods", "eyebrow", "Neighborhoods")}</div>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">{c("neighborhoods", "heading", "Eight cities in one")}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(hoods.length
            ? hoods.map((n) => ({
                key: n.id,
                name: n.name,
                blurb: n.blurb || "",
                image: n.image_url || "",
                href: n.link_to || "/neighborhoods",
              }))
            : neighborhoods.map((n) => {
                const seoDefault: Record<string, string> = {
                  "la-jolla": "/things-to-do/in/la-jolla",
                  "gaslamp-quarter": "/nightlife/in/gaslamp-quarter",
                  "coronado": "/hotels/in/coronado",
                  "balboa-park": "/things-to-do/in/balboa-park",
                  "little-italy": "/restaurants/in/little-italy",
                  "pacific-beach": "/things-to-do/in/pacific-beach",
                  "ocean-beach": "/restaurants/in/ocean-beach",
                  "mission-beach": "/things-to-do/in/mission-beach",
                };
                return {
                  key: n.slug,
                  name: n.name,
                  blurb: n.blurb,
                  image: n.image,
                  href: seoDefault[n.slug] || `/neighborhoods/${n.slug}`,
                };
              })
          ).map((n) => (
            <a
              key={n.key}
              href={n.href}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4]"
            >
              <img
                src={n.image}
                alt={n.name}
                loading="lazy"
                width={1024}
                height={1280}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                <h3 className="font-display text-2xl font-semibold">{n.name}</h3>
                <p className="mt-1 text-sm text-primary-foreground/80">{n.blurb}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Insider lead magnet */}
      <section className="container-page mt-24">
        <EmailCapture source="home_lead_magnet" />
      </section>

      {/* SEO intro — long-form prose for crawlers and first-time visitors */}
      <section className="container-page mt-24">
        <div className="mx-auto max-w-3xl">
          <div className="eyebrow">{c("seo_intro", "eyebrow", "About San Diego")}</div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
            {c("seo_intro", "heading", "The definitive guide to San Diego")}
          </h2>
          <div className="mt-6 space-y-4 text-base md:text-lg text-foreground/80 leading-relaxed">
            <p>
              {c(
                "seo_intro",
                "p1",
                "San Diego is America's Finest City for a reason: 70 miles of Pacific coastline, eight wildly different neighborhoods, a year-round Mediterranean climate, and a food scene that quietly rivals any major US city. From the sea caves of La Jolla to the craft breweries of North Park, the boutique hotels of the Gaslamp Quarter to the surf breaks of Pacific Beach, this is a city built for slow afternoons and long weekends."
              )}
            </p>
            <p>
              {c(
                "seo_intro",
                "p2",
                "Our editors live here. We update sandiego.com every week with handpicked hotels, restaurants worth a detour, things to do beyond the obvious, and neighborhood guides written by people who actually walk these blocks. Whether you're planning your first three days in San Diego or your tenth weekend in Coronado, start here."
              )}
            </p>
            <p>
              {c(
                "seo_intro",
                "p3",
                "Looking for the inside track? Insider members get curated itineraries, member-only discounts at partner hotels and restaurants, and our weekly dispatch on what's actually worth your time this month in San Diego."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ — paired with FAQPage JSON-LD in head() for rich results */}
      <section className="container-page mt-24">
        <div className="mx-auto max-w-3xl">
          <div className="eyebrow">{c("faq", "eyebrow", "Trip planning")}</div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
            {c("faq", "heading", "Frequently asked questions about visiting San Diego")}
          </h2>
          <dl className="mt-8 divide-y divide-border border-t border-b border-border">
            {HOME_FAQS.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-display text-xl font-semibold">{f.q}</dt>
                <dd className="mt-2 text-foreground/80 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="container-page mt-24">
        <div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="eyebrow text-teal-soft">{c("partner_cta", "eyebrow", "For partners")}</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
              {c("partner_cta", "heading", "Reach high-intent travelers — and Insider members ready to book.")}
            </h2>
            <p className="mt-3 text-primary-foreground/80 max-w-md">
              {c("partner_cta", "body", "Featured and Premium listings put your business in front of 40K+ active US travelers a quarter. Offer an Insider member discount and we send you bookings, too.")}
            </p>
            <a
              href={appendUTMs(c("partner_cta", "cta_to", "/partners"), "site", "partners_page", "b2b")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              {c("partner_cta", "cta_label", "Become a partner")} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { n: "133K", l: "Social followers" },
              { n: "40K", l: "Active US travelers / qtr" },
              { n: "3.7M", l: "Annual organic views" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-primary-foreground/10 p-5">
                <div className="font-display text-3xl font-semibold text-teal-soft">{s.n}</div>
                <div className="mt-1 text-xs text-primary-foreground/70">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
