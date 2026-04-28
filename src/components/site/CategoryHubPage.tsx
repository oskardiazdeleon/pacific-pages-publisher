import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { listings as mockListings } from "@/lib/mock-data";
import { fetchPublishedListings } from "@/lib/content-queries";
import { fetchPublishedHomepageSections, type HomepageSection } from "@/lib/cms";
import type { CategoryHub } from "@/lib/listing-categories";

const SITE_URL = "https://sandiego.com";

export function CategoryHubPage({ hub }: { hub: CategoryHub }) {
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cms, setCms] = useState<Record<string, unknown>>({});

  // CMS hero override (sponsor takeover)
  useEffect(() => {
    (async () => {
      try {
        const sections = await fetchPublishedHomepageSections();
        const map: Record<string, Record<string, unknown>> = {};
        for (const s of sections as HomepageSection[]) {
          map[s.section_key] = (s.published_content || {}) as Record<string, unknown>;
        }
        setCms(map[`${hub.slug}_hero`] || {});
      } catch {
        // ignore
      }
    })();
  }, [hub.slug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const buckets = await Promise.all(
          hub.dbCategories.map((c) => fetchPublishedListings({ category: c })),
        );
        if (cancelled) return;
        const merged = buckets.flat();
        if (merged.length) {
          setItems(merged as ListingCardData[]);
        } else {
          const mock = mockListings.filter((l) =>
            hub.dbCategories.includes(l.category as never),
          );
          setItems(mock as ListingCardData[]);
        }
      } catch {
        const mock = mockListings.filter((l) =>
          hub.dbCategories.includes(l.category as never),
        );
        setItems(mock as ListingCardData[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hub.slug]);

  const sponsorActive =
    cms["sponsor_active"] === true || cms["sponsor_active"] === "true";
  const sponsorName = (cms["sponsor_name"] as string) || "";
  const sponsorLogo = (cms["sponsor_logo_url"] as string) || "";
  const sponsorLink = (cms["sponsor_link_url"] as string) || "";

  // CMS overrides win when present; otherwise fall back to the hardcoded hub config.
  const cmsStr = (key: string, fallback: string): string => {
    const v = (cms[key] as string | undefined)?.toString().trim();
    return v && v.length > 0 ? v : fallback;
  };
  const heroVal = (field: "eyebrow" | "heading" | "subheading"): string => {
    return cmsStr(field, hub[field]);
  };
  const headingAccent = cmsStr("heading_accent", hub.headingAccent || "");
  const searchPlaceholder = cmsStr(
    "search_placeholder",
    hub.searchPlaceholder || `Search ${hub.label.toLowerCase()}…`,
  );

  const visibleItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        (l as unknown as { short_description?: string }).short_description
          ?.toLowerCase()
          .includes(q) ||
        (l as unknown as { neighborhood?: string }).neighborhood
          ?.toLowerCase()
          .includes(q),
    );
  }, [items, search]);

  const breadcrumbs = [{ label: "Home", to: "/" }, { label: hub.label }];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: hub.heading,
    itemListElement: visibleItems.slice(0, 20).map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/${hub.slug}/${l.slug}`,
      name: l.name,
    })),
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.heading,
    description: hub.metaDescription,
    url: `${SITE_URL}/${hub.slug}`,
    isPartOf: { "@type": "WebSite", name: "sandiego.com", url: SITE_URL },
    about: { "@type": "City", name: "San Diego", sameAs: "https://en.wikipedia.org/wiki/San_Diego" },
  };

  const jsonLd = [collectionJsonLd, itemListJsonLd, breadcrumbJsonLd(breadcrumbs)];

  const heroImage =
    cmsStr("hero_image_url", hub.heroImage || "") ||
    "https://images.unsplash.com/photo-1538397956038-5b30aea4f88a?w=1600&q=80";

  const cmsChips = Array.isArray(cms["popular_chips"])
    ? ((cms["popular_chips"] as Array<{ label?: string; keyword?: string }>) ?? [])
        .filter((c) => c?.label?.trim())
        .map((c) => ({ label: c.label!.trim(), keyword: (c.keyword || c.label || "").trim() }))
    : [];
  const popularChips = cmsChips.length > 0 ? cmsChips : (hub.popularChips ?? []);

  const cmsStats = Array.isArray(cms["stats"])
    ? ((cms["stats"] as Array<{ value?: string; label?: string }>) ?? [])
        .filter((s) => s?.value?.toString().trim() && s?.label?.toString().trim())
        .map((s) => ({ value: s.value!.toString().trim(), label: s.label!.toString().trim() }))
    : [];
  const stats = cmsStats.length > 0 ? cmsStats : (hub.stats ?? []);

  const insiderTitle = cmsStr("insider_cta_title", hub.insiderCta?.title || "");
  const insiderBody = cmsStr("insider_cta_body", hub.insiderCta?.body || "");
  const showInsiderCta = Boolean(insiderTitle || insiderBody);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO — split layout, sponsor-aware (mirrors /cruises) */}
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
              ) : (
                <div className="eyebrow mb-5 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  {heroVal("eyebrow")}
                </div>
              )}

              <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.02] text-foreground">
                {heroVal("heading")}
                {headingAccent && (
                  <span className="block text-accent">{headingAccent}</span>
                )}
              </h1>

              <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground">
                {heroVal("subheading")}
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-8 flex w-full max-w-xl items-center rounded-full border border-border bg-card shadow-sm overflow-hidden"
              >
                <div className="pl-5 pr-2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    hub.searchPlaceholder || `Search ${hub.label.toLowerCase()}…`
                  }
                  className="flex-1 bg-transparent px-2 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="submit"
                  className="m-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                >
                  Search
                </button>
              </form>

              {popularChips.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground mr-1">Popular:</span>
                  {popularChips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setSearch(chip.keyword)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/85 hover:bg-secondary transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: image with floating stat cards */}
            <div className="relative">
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl bg-muted shadow-xl">
                <img
                  src={heroImage}
                  alt={hub.heading}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
              </div>

              {stats.length > 0 && (
                <div className="absolute -bottom-6 left-4 right-4 hidden md:flex gap-3">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="flex-1 rounded-2xl border border-border bg-card/95 backdrop-blur px-4 py-4 text-center shadow-lg"
                    >
                      <div className="font-display text-2xl font-semibold text-foreground">
                        {s.value}
                      </div>
                      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {hub.insiderCta && (
            <div className="mt-16 md:mt-20 rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4 md:px-7 md:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  {hub.insiderCta.title}
                </div>
                <p className="text-sm text-muted-foreground">{hub.insiderCta.body}</p>
              </div>
              <Link
                to="/insider"
                className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
              >
                Join Insider
              </Link>
            </div>
          )}
        </div>
      </section>

      {hub.slug === "things-to-do" && (
        <section className="container-page pt-10">
          <Link
            to="/things-to-do/golf"
            className="group relative block overflow-hidden rounded-3xl border border-border bg-card"
          >
            <div className="grid md:grid-cols-2">
              <div
                className="aspect-[16/10] md:aspect-auto bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1600&q=80')",
                }}
              />
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="eyebrow flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  Featured collection
                </div>
                <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight">
                  San Diego Golf Courses
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Torrey Pines, Aviara, Maderas, Coronado Muni and 8 more — every course worth
                  your tee time, ranked by locals.
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                  Browse golf courses →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="container-page py-12">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              All {hub.label.toLowerCase()}
            </div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Browse every {hub.singular.toLowerCase()}
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {visibleItems.length} {visibleItems.length === 1 ? "result" : "results"}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-border bg-card aspect-[4/3] animate-pulse"
              />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No {hub.label.toLowerCase()} match your search.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Footer />
    </div>
  );
}
