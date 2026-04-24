import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { listings as mockListings } from "@/lib/mock-data";
import { fetchPublishedListings } from "@/lib/content-queries";

export const Route = createFileRoute("/listings/")({
  head: () => ({
    meta: [
      { title: "Listings — The Best of San Diego | sandiego.com" },
      {
        name: "description",
        content:
          "Browse handpicked San Diego restaurants, hotels, attractions and tours — filtered by category and neighborhood.",
      },
      { property: "og:title", content: "San Diego Listings — Restaurants, Hotels & Attractions" },
      {
        property: "og:description",
        content: "Handpicked San Diego listings filtered by category and neighborhood.",
      },
    ],
  }),
  component: ListingsPage,
});

const categories = ["All", "Restaurant", "Hotel", "Attraction", "Tour", "Shopping", "Nightlife"] as const;

function ListingsPage() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchPublishedListings({ category: active });
        if (cancelled) return;
        if (data.length) {
          setItems(data as ListingCardData[]);
        } else {
          // Fallback to mock data when DB is empty
          const mock = active === "All" ? mockListings : mockListings.filter((l) => l.category === active);
          setItems(mock as ListingCardData[]);
        }
      } catch {
        const mock = active === "All" ? mockListings : mockListings.filter((l) => l.category === active);
        setItems(mock as ListingCardData[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [active]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-page pt-14 pb-10">
        <div className="eyebrow">Directory</div>
        <h1 className="mt-2 font-display text-4xl md:text-6xl font-semibold tracking-tight">
          San Diego, by the listing.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every business here is reviewed by our editors. Featured and Premium partners support
          our independent coverage.
        </p>
      </section>

      <section className="container-page sticky top-16 z-30 bg-background/85 backdrop-blur border-y border-border">
        <div className="flex flex-wrap gap-2 py-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="container-page py-12">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">No listings in this category yet.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => <ListingCard key={l.slug} listing={l} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
