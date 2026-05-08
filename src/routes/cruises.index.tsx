import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Anchor } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { fetchCruiseLines, type CruiseLine } from "@/lib/cruise-lines";
import { fetchPublishedHomepageSections, type HomepageSection } from "@/lib/cms";

const SITE_URL = "https://sandiego.com";
const META_TITLE = "Cruises from San Diego — Every Cruise Line Sailing the Port | sandiego.com";
const META_DESC =
  "Cruises from the Port of San Diego — every line, every itinerary, plus member savings on Mexican Riviera, Hawaii, and Baja sailings.";

export const Route = createFileRoute("/cruises/")({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: "description", content: META_DESC },
      { property: "og:title", content: META_TITLE },
      { property: "og:description", content: META_DESC },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=80",
      },
      { rel: "canonical", href: `${SITE_URL}/cruises` },
    ],
  }),
  component: CruisesHub,
});

function CruisesHub() {
  const [cms, setCms] = useState<Record<string, Record<string, unknown>>>({});
  const [cruiseLines, setCruiseLines] = useState<CruiseLine[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const sections = await fetchPublishedHomepageSections();
        const map: Record<string, Record<string, unknown>> = {};
        for (const s of sections as HomepageSection[]) {
          map[s.section_key] = (s.published_content || {}) as Record<string, unknown>;
        }
        setCms(map);
      } catch {
        // ignore — fall through to defaults
      }
    })();
    (async () => {
      try {
        setCruiseLines(await fetchCruiseLines());
      } catch {
        // ignore
      }
    })();
  }, []);

  const heroCms = cms["cruises_hero"] || {};
  const sponsorActive =
    heroCms["sponsor_active"] === true || heroCms["sponsor_active"] === "true";
  const sponsorName = (heroCms["sponsor_name"] as string) || "";
  const sponsorLogo = (heroCms["sponsor_logo_url"] as string) || "";
  const sponsorLink = (heroCms["sponsor_link_url"] as string) || "";

  const DEFAULT_HERO = {
    eyebrow: "Set sail from the port",
    heading: "Cruises from San Diego",
    heading_accent: "from the Port.",
    subheading:
      "Seven major cruise lines homeport in San Diego — from 3-night Baja weekenders under $250 to 17-day Panama Canal transits. Here's every line sailing from B Street Pier, and which one fits your trip.",
    hero_image_url:
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=80",
  };
  const DEFAULT_CHIPS = [
    { label: "Mexican Riviera", to: "/cruises/princess" },
    { label: "Baja Weekenders", to: "/cruises/carnival" },
    { label: "Family Cruises", to: "/cruises/disney" },
    { label: "Panama Canal", to: "/cruises/holland-america" },
  ];
  const DEFAULT_STATS = [
    { value: "7", label: "Cruise Lines" },
    { value: "20+", label: "Ships Sailing" },
    { value: "$199", label: "Starting From" },
  ];

  // CMS overrides win when present, regardless of sponsor mode.
  const heroVal = (field: keyof typeof DEFAULT_HERO): string => {
    const v = ((heroCms[field] as string) || "").trim();
    return v || DEFAULT_HERO[field];
  };
  const chips = (() => {
    const raw = heroCms["popular_chips"];
    if (Array.isArray(raw) && raw.length) {
      return raw
        .map((c: Record<string, unknown>) => ({
          label: (c.label as string) || "",
          to: (c.to as string) || "",
        }))
        .filter((c) => c.label && c.to);
    }
    return DEFAULT_CHIPS;
  })();
  const stats = (() => {
    const raw = heroCms["stats"];
    if (Array.isArray(raw) && raw.length) {
      return raw
        .map((s: Record<string, unknown>) => ({
          value: (s.value as string) || "",
          label: (s.label as string) || "",
        }))
        .filter((s) => s.value && s.label);
    }
    return DEFAULT_STATS;
  })();

  const breadcrumbs = [{ label: "Home", to: "/" }, { label: "Cruises" }];
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cruise Lines Sailing from San Diego",
    itemListElement: cruiseLines.map((c: CruiseLine, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/cruises/${c.slug}`,
      name: c.name,
    })),
  };
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cruises from San Diego",
    description: META_DESC,
    url: `${SITE_URL}/cruises`,
  };
  const jsonLd = [collectionJsonLd, itemListJsonLd, breadcrumbJsonLd(breadcrumbs)];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — split layout with image + floating stat cards */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/40 via-background to-background">
        <div className="container-page pt-10 md:pt-14 pb-12 md:pb-20">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            {/* Left: copy + search + chips */}
            <div>
              {sponsorActive && sponsorName ? (
                <a
                  href={sponsorLink || "#"}
                  target={sponsorLink ? "_blank" : undefined}
                  rel={sponsorLink ? "noreferrer noopener" : undefined}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/70 transition"
                >
                  <span className="opacity-70">Presented by</span>
                  {sponsorLogo ? (
                    <img src={sponsorLogo} alt={sponsorName} className="h-4 w-auto object-contain" loading="lazy" />
                  ) : (
                    <span>{sponsorName}</span>
                  )}
                </a>
              ) : (
                <div className="eyebrow mb-5 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  {heroVal("eyebrow")}
                </div>
              )}

              <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.02] text-foreground">
                {heroVal("heading")}
                {heroVal("heading_accent") ? (
                  <span className="block text-accent">{heroVal("heading_accent")}</span>
                ) : null}
              </h1>

              <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground">
                {heroVal("subheading")}
              </p>

              {/* Search */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-8 flex w-full max-w-xl items-center rounded-full border border-border bg-card shadow-sm overflow-hidden"
              >
                <div className="pl-5 pr-2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="search"
                  placeholder="Search cruise lines, ships, itineraries…"
                  className="flex-1 bg-transparent px-2 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="submit"
                  className="m-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                >
                  Search
                </button>
              </form>

              {/* Popular chips */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground mr-1">Popular:</span>
                {chips.map((chip) => (
                  <a
                    key={chip.label}
                    href={chip.to}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/85 hover:bg-secondary transition"
                  >
                    {chip.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: image with floating stat cards */}
            <div className="relative">
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl bg-muted shadow-xl">
                <img
                  src={heroVal("hero_image_url")}
                  alt="Cruise ship sailing from the Port of San Diego"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
              </div>

              {/* Floating stat cards */}
              <div className="absolute -bottom-6 left-4 right-4 hidden md:flex gap-3">
                {stats.slice(0, 3).map((s) => (
                  <div
                    key={s.label}
                    className="flex-1 rounded-2xl border border-border bg-card/95 backdrop-blur px-4 py-4 text-center shadow-lg"
                  >
                    <div className="font-display text-2xl font-semibold text-foreground">{s.value}</div>
                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary CTA bar — Insider-style */}
          <div className="mt-16 md:mt-20 rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4 md:px-7 md:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Anchor className="h-4 w-4 text-accent" />
                Sail smarter with Insider
              </div>
              <p className="text-sm text-muted-foreground">
                Member-only fares, onboard credit and pre-cruise hotel deals at participating partners.
              </p>
            </div>
            <Link
              to="/insider"
              className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
            >
              Join Insider
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cruiseLines.map((c: CruiseLine) => (
            <Link
              key={c.slug}
              to="/cruises/$slug"
              params={{ slug: c.slug }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card hover:shadow-lg transition-shadow"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: `url('${c.heroImage}')` }}
              />
              <div className="p-5">
                <div className="eyebrow text-xs">{c.seasonality}</div>
                <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
                  {c.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.tagline}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">From {c.priceFrom}</span>
                  <span className="font-medium text-accent group-hover:translate-x-0.5 transition-transform">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="rounded-3xl border border-border bg-secondary/30 p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-semibold">
            Cruising from San Diego — what to know
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3 text-sm">
            <div>
              <div className="font-semibold">The port</div>
              <p className="mt-1 text-muted-foreground">
                Almost all ships sail from B Street Pier and Broadway Pier — both walking distance
                to Little Italy, the Gaslamp and Seaport Village.
              </p>
            </div>
            <div>
              <div className="font-semibold">Best season</div>
              <p className="mt-1 text-muted-foreground">
                October–April is peak — most lines reposition here for winter Mexican Riviera
                runs. Carnival and Disney sail year-round.
              </p>
            </div>
            <div>
              <div className="font-semibold">Where to stay before</div>
              <p className="mt-1 text-muted-foreground">
                Book a Downtown or Little Italy hotel with a port shuttle.{" "}
                <Link to="/hotels" className="text-accent underline">
                  See our top picks →
                </Link>
              </p>
            </div>
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
