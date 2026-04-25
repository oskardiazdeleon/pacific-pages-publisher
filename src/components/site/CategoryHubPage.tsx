import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { listings as mockListings } from "@/lib/mock-data";
import { fetchPublishedListings } from "@/lib/content-queries";
import type { CategoryHub } from "@/lib/listing-categories";

const SITE_URL = "https://sandiego.com";

export function CategoryHubPage({ hub }: { hub: CategoryHub }) {
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

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

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: hub.label },
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: hub.heading,
    itemListElement: items.slice(0, 20).map((l, i) => ({
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border">
        <div className="container-page pt-12 md:pt-16 pb-10">
          <Breadcrumbs items={breadcrumbs} />
          <div className="eyebrow mt-4 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            {hub.eyebrow}
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {hub.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
            {hub.subheading}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Link
              to="/listings"
              className="rounded-full border border-border bg-background px-3 py-1.5 hover:bg-secondary"
            >
              All listings
            </Link>
            <Link
              to="/neighborhoods"
              className="rounded-full border border-border bg-background px-3 py-1.5 hover:bg-secondary"
            >
              Browse by neighborhood
            </Link>
            <Link
              to="/insider"
              className="rounded-full bg-accent px-3 py-1.5 text-accent-foreground font-medium hover:opacity-90"
            >
              Save up to 40% with Insider
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-border bg-card aspect-[4/3] animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No {hub.label.toLowerCase()} published yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
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
