import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { fetchGolfCourses } from "@/lib/content-queries";

const SITE_URL = "https://sandiego.com";
const META_TITLE = "Best Golf Courses in San Diego — Torrey Pines, Aviara & More | sandiego.com";
const META_DESC =
  "The definitive guide to San Diego golf: Torrey Pines, Maderas, Aviara, Coronado Muni and every course worth your tee time — ranked by locals.";

export const Route = createFileRoute("/things-to-do/golf")({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: "description", content: META_DESC },
      { property: "og:title", content: META_TITLE },
      { property: "og:description", content: META_DESC },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1600&q=80",
      },
      { rel: "canonical", href: `${SITE_URL}/things-to-do/golf` },
    ],
  }),
  component: GolfPage,
});

function GolfPage() {
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchGolfCourses();
        if (!cancelled) setItems(data as ListingCardData[]);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Things To Do", to: "/things-to-do" },
    { label: "Golf" },
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Golf Courses in San Diego",
    itemListElement: items.slice(0, 20).map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/things-to-do/${l.slug}`,
      name: l.name,
    })),
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "San Diego Golf Courses",
    description: META_DESC,
    url: `${SITE_URL}/things-to-do/golf`,
    isPartOf: { "@type": "WebSite", name: "sandiego.com", url: SITE_URL },
    about: { "@type": "Sport", name: "Golf" },
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
            Tee it up
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            San Diego Golf Courses
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
            From the legendary cliffs of Torrey Pines to bayfront municipals and Tom Fazio resort
            tracks, San Diego is one of America&rsquo;s great golf cities. Here are the courses
            our editors actually play — ranked by what&rsquo;s worth your time, your money, and
            your tee-time hustle.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Link
              to="/things-to-do"
              className="rounded-full border border-border bg-background px-3 py-1.5 hover:bg-secondary"
            >
              All things to do
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
            No golf courses published yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-secondary/30">
        <div className="container-page py-12 md:py-16 grid gap-8 md:grid-cols-3">
          <div>
            <div className="eyebrow">Insider tip</div>
            <h2 className="mt-2 font-display text-2xl font-semibold">Torrey Pines tee times</h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Non-resident tee times open via lottery 90 days in advance. Locals can book 14
              days out at a fraction of the price. Show up at 5:30am for the singles list if
              you&rsquo;re desperate — it works more often than you&rsquo;d think.
            </p>
          </div>
          <div>
            <div className="eyebrow">Best value</div>
            <h2 className="mt-2 font-display text-2xl font-semibold">Coronado Muni</h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Skyline views, $40 green fees, and a tee sheet that fills the moment it opens.
              Walk-on list at dawn is the move. Bonus: the bayfront halfway house has a great
              breakfast burrito.
            </p>
          </div>
          <div>
            <div className="eyebrow">Stay & play</div>
            <h2 className="mt-2 font-display text-2xl font-semibold">Carlsbad resort circuit</h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Aviara, Omni La Costa (Champions + Legends), and Park Hyatt deals stack two or
              three rounds with lodging. November–February is shoulder season — same weather,
              30% less money.
            </p>
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
