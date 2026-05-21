import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { HubArticlesStrip } from "@/components/site/HubArticlesStrip";
import { HubBlogStrip, type HubBlogPost } from "@/components/site/HubBlogStrip";
import {
  cmsKeyForHub,
  contentMatchesHub,
  listingMatchesHub,
  type ThemedHub,
} from "@/lib/themed-hubs";
import { fetchPublishedHomepageSections, type HomepageSection } from "@/lib/cms";
import { fetchPublishedListings, fetchPublishedArticles } from "@/lib/content-queries";
import { supabase } from "@/integrations/supabase/client";
import type { ArticleCardData } from "@/components/site/ArticleCard";

const SITE_URL = "https://sandiego.com";

export function ThemedHubPage({ hub }: { hub: ThemedHub }) {
  const [cms, setCms] = useState<Record<string, unknown>>({});
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [posts, setPosts] = useState<HubBlogPost[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [search, setSearch] = useState("");

  // CMS hero override
  useEffect(() => {
    (async () => {
      try {
        const sections = await fetchPublishedHomepageSections();
        const map: Record<string, Record<string, unknown>> = {};
        for (const s of sections as HomepageSection[]) {
          map[s.section_key] = (s.published_content || {}) as Record<string, unknown>;
        }
        setCms(map[cmsKeyForHub(hub)] || {});
      } catch {
        // ignore
      }
    })();
  }, [hub]);

  // Listings (matched + filtered client-side)
  useEffect(() => {
    let cancelled = false;
    setLoadingListings(true);
    (async () => {
      try {
        const buckets = await Promise.all(
          hub.listingFilter.dbCategories.map((c) => fetchPublishedListings({ category: c })),
        );
        if (cancelled) return;
        const merged = buckets.flat();
        const matched = merged.filter((l) => listingMatchesHub(l as never, hub));
        setListings(matched as ListingCardData[]);
      } catch {
        setListings([]);
      } finally {
        if (!cancelled) setLoadingListings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hub]);

  // Articles
  useEffect(() => {
    (async () => {
      try {
        const all = await fetchPublishedArticles({ limit: 30 });
        setArticles(all.filter((a: any) => contentMatchesHub(a, hub)).slice(0, 3));
      } catch {
        setArticles([]);
      }
    })();
  }, [hub]);

  // Blog merged into Articles — keep posts empty (the strip renders nothing).
  useEffect(() => {
    setPosts([]);
  }, [hub]);

  const sponsorActive = cms["sponsor_active"] === true || cms["sponsor_active"] === "true";
  const sponsorName = (cms["sponsor_name"] as string) || "";
  const sponsorLogo = (cms["sponsor_logo_url"] as string) || "";
  const sponsorLink = (cms["sponsor_link_url"] as string) || "";

  const heroVal = (field: "eyebrow" | "heading" | "subheading"): string => {
    if (sponsorActive) {
      return ((cms[field] as string) || "").trim() || hub[field];
    }
    return hub[field];
  };

  const visibleListings = useMemo(() => {
    if (!search.trim()) return listings;
    const q = search.toLowerCase();
    return listings.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        (l as any).short_description?.toLowerCase().includes(q) ||
        (l as any).neighborhood?.toLowerCase().includes(q),
    );
  }, [listings, search]);

  const breadcrumbs = [{ label: "Home", to: "/" }, { label: hub.label }];
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.heading,
    description: hub.metaDescription,
    url: `${SITE_URL}/${hub.slug}`,
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: hub.heading,
    itemListElement: visibleListings.slice(0, 20).map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/${hub.slug}/${l.slug}`,
      name: l.name,
    })),
  };
  const jsonLd = [collectionJsonLd, itemListJsonLd, breadcrumbJsonLd(breadcrumbs)];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO — split layout, sponsor-aware (mirrors /cruises) */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/40 via-background to-background">
        <div className="container-page pt-10 md:pt-14 pb-12 md:pb-20">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
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
                {hub.headingAccent && (
                  <span className="block text-accent">{hub.headingAccent}</span>
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
                  placeholder={hub.searchPlaceholder}
                  className="flex-1 bg-transparent px-2 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="submit"
                  className="m-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                >
                  Search
                </button>
              </form>

              {hub.popularChips.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground mr-1">Popular:</span>
                  {hub.popularChips.map((chip) => (
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

            <div className="relative">
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl bg-muted shadow-xl">
                <img
                  src={hub.heroImage}
                  alt={hub.heading}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
              </div>

              {hub.stats.length > 0 && (
                <div className="absolute -bottom-6 left-4 right-4 hidden md:flex gap-3">
                  {hub.stats.map((s) => (
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

      {/* Articles strip */}
      <HubArticlesStrip articles={articles} />

      {/* Blog strip */}
      <HubBlogStrip posts={posts} />

      {/* Listings grid */}
      <section className="container-page py-14 md:py-16 border-t border-border">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              All {hub.label.toLowerCase()}
            </div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Browse every {hub.label.toLowerCase().replace(/s$/, "")}
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {visibleListings.length} {visibleListings.length === 1 ? "result" : "results"}
          </span>
        </div>

        {loadingListings ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-border bg-card aspect-[4/3] animate-pulse"
              />
            ))}
          </div>
        ) : visibleListings.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 rounded-3xl border border-dashed border-border">
            <p className="font-display text-xl text-foreground">
              No {hub.label.toLowerCase()} match your search yet.
            </p>
            <p className="mt-2 text-sm">
              Try a different keyword, or{" "}
              <Link to="/listings" className="text-accent underline">
                browse all listings
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleListings.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* "What to know" block */}
      {hub.knowMore && (
        <section className="container-page pb-16">
          <div className="rounded-3xl border border-border bg-secondary/30 p-8 md:p-10">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">
              {hub.knowMore.heading}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3 text-sm">
              {hub.knowMore.items.map((it) => (
                <div key={it.title}>
                  <div className="font-semibold">{it.title}</div>
                  <p className="mt-1 text-muted-foreground">{it.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Footer />
    </div>
  );
}
