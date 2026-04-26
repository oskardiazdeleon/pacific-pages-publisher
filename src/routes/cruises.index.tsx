import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { CRUISE_LINES } from "@/lib/cruise-lines";
import { fetchPublishedHomepageSections, type HomepageSection } from "@/lib/cms";

const SITE_URL = "https://sandiego.com";
const META_TITLE = "Cruises from San Diego — Every Cruise Line Sailing the Port | sandiego.com";
const META_DESC =
  "Every cruise line sailing from the Port of San Diego: Holland America, Disney, Princess, Norwegian, Carnival, Royal Caribbean and Celebrity. Itineraries, ships and booking.";

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
    subheading:
      "Seven major cruise lines homeport in San Diego — from 3-night Baja weekenders under $250 to 17-day Panama Canal transits. Here's every line sailing from B Street Pier, and which one fits your trip.",
  };
  const heroVal = (field: keyof typeof DEFAULT_HERO): string => {
    if (sponsorActive) {
      return ((heroCms[field] as string) || "").trim() || DEFAULT_HERO[field];
    }
    return DEFAULT_HERO[field];
  };

  const breadcrumbs = [{ label: "Home", to: "/" }, { label: "Cruises" }];
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cruise Lines Sailing from San Diego",
    itemListElement: CRUISE_LINES.map((c, i) => ({
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

      <section className="border-b border-border">
        <div className="container-page pt-12 md:pt-16 pb-10">
          <Breadcrumbs items={breadcrumbs} />
          {sponsorActive && sponsorName && (
            <a
              href={sponsorLink || "#"}
              target={sponsorLink ? "_blank" : undefined}
              rel={sponsorLink ? "noreferrer noopener" : undefined}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/70 transition"
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
          <div className="eyebrow mt-4 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            {heroVal("eyebrow")}
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {heroVal("heading")}
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
            {heroVal("subheading")}
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CRUISE_LINES.map((c) => (
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
