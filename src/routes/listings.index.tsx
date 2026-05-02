import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { listings as mockListings } from "@/lib/mock-data";
import { fetchPublishedListings } from "@/lib/content-queries";
import { supabase } from "@/integrations/supabase/client";
import listingsHero from "@/assets/listings-hero.jpg";

type ListingsHero = Record<string, string>;
const DEFAULT_HERO: ListingsHero = {
  eyebrow: "The San Diego Directory",
  headline: "The best of San Diego,",
  headline_accent: "editor-vetted.",
  description:
    "Hand-picked restaurants, hotels, beaches, breweries and tours — reviewed by locals, ranked by what's actually worth your time. Insider members save up to 40% at participating partners.",
  hero_image: "",
  stat1_value: "1,200+", stat1_label: "Vetted listings",
  stat2_value: "75", stat2_label: "Neighborhoods",
  stat3_value: "40%", stat3_label: "Avg. Insider savings",
  cta_title: "Unlock member-only deals",
  cta_subtitle: "Save at 200+ partners across the city.",
  cta_button_label: "Join Insider",
  cta_button_url: "/insider",
};

export const Route = createFileRoute("/listings/")({
  head: () => ({
    meta: [
      { title: "Best Things To Do in San Diego — Hotels, Restaurants & Tours | sandiego.com" },
      {
        name: "description",
        content:
          "The definitive San Diego directory: 1,200+ editor-vetted hotels, restaurants, beaches, breweries and tours across 75 neighborhoods. Insider members save up to 40%.",
      },
      { property: "og:title", content: "The Best of San Diego — Editor-Vetted Hotels, Restaurants & Tours" },
      {
        property: "og:description",
        content: "1,200+ hand-picked San Diego listings reviewed by locals. Filter by category, save with Insider.",
      },
      { property: "og:image", content: "https://images.unsplash.com/photo-1538397506994-7e98c54b8a4d?auto=format&fit=crop&w=1600&q=80" },
      { property: "twitter:image", content: "https://images.unsplash.com/photo-1538397506994-7e98c54b8a4d?auto=format&fit=crop&w=1600&q=80" },
    ],
  }),
  component: ListingsPage,
});

const categories = ["All", "Restaurant", "Hotel", "Attraction", "Tour", "Shopping", "Nightlife"] as const;

function ListingsPage() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<ListingsHero>(DEFAULT_HERO);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("published_value")
        .eq("key", "listings_hero")
        .maybeSingle();
      const v = (data?.published_value as ListingsHero | null) || null;
      if (v) setHero({ ...DEFAULT_HERO, ...v });
    })();
  }, []);

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

      {/* SEO + conversion hero */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={hero.hero_image || listingsHero}
          alt={hero.headline}
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        {/* Left-to-right scrim keeps copy legible while letting the image breathe on the right */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="container-page relative pt-16 pb-14 md:pt-20 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <div className="eyebrow flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                {hero.eyebrow}
              </div>
              <h1 className="mt-3 font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02]">
                {hero.headline}
                <span className="block text-accent">{hero.headline_accent}</span>
              </h1>
              <p className="mt-5 max-w-xl text-base md:text-lg text-muted-foreground">
                {hero.description}
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-7 flex w-full max-w-xl items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur px-2 py-2 shadow-lg shadow-foreground/5"
                role="search"
                aria-label="Search San Diego listings"
              >
                <div className="pl-3 text-muted-foreground">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Search hotels, tacos, tide pools…"
                  className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/70"
                  aria-label="Search listings"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                >
                  Search
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">Popular:</span>
                {["Beachfront Hotels", "Rooftop Bars", "Family Attractions", "Taco Spots", "Craft Breweries"].map((tag) => {
                  const map: Record<string, (typeof categories)[number]> = {
                    "Beachfront Hotels": "Hotel",
                    "Rooftop Bars": "Nightlife",
                    "Family Attractions": "Attraction",
                    "Taco Spots": "Restaurant",
                    "Craft Breweries": "Restaurant",
                  };
                  return (
                    <button
                      key={tag}
                      onClick={() => setActive(map[tag] ?? "All")}
                      className="rounded-full border border-border bg-background/70 px-3 py-1 hover:bg-secondary hover:text-foreground transition"
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              {[
                { stat: "1,200+", label: "Vetted listings" },
                { stat: "75", label: "Neighborhoods" },
                { stat: "40%", label: "Avg. Insider savings" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-card/80 backdrop-blur px-4 py-5 text-center shadow-sm"
                >
                  <div className="font-display text-2xl md:text-3xl font-semibold tracking-tight">{s.stat}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
              <div className="col-span-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">Unlock member-only deals</div>
                  <div className="text-xs text-muted-foreground">Save at 200+ partners across the city.</div>
                </div>
                <a
                  href="/insider"
                  className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90 transition"
                >
                  Join Insider
                </a>
              </div>
            </div>
          </div>
        </div>
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
