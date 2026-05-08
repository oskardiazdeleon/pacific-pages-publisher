import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArticleCard, type ArticleCardData } from "@/components/site/ArticleCard";
import { articles as mockArticles } from "@/lib/mock-data";
import { fetchPublishedArticles } from "@/lib/content-queries";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Articles — The San Diego Magazine | sandiego.com" },
      {
        name: "description",
        content:
          "Editorial features, neighborhood deep-dives, food guides and travel stories from San Diego's local experts.",
      },
      { property: "og:title", content: "The San Diego Magazine" },
      {
        property: "og:description",
        content: "Editorial features and travel stories from San Diego's local experts.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sandiego.com/articles" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=80" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=80" },
    ],
    links: [{ rel: "canonical", href: "https://sandiego.com/articles" }],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const [items, setItems] = useState<ArticleCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPublishedArticles();
        setItems(data.length ? (data as ArticleCardData[]) : (mockArticles as ArticleCardData[]));
      } catch {
        setItems(mockArticles as ArticleCardData[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [lead, ...rest] = items;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-page pt-14 pb-10">
        <div className="eyebrow">The Magazine</div>
        <h1 className="mt-2 font-display text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          Stories worth crossing town for.
        </h1>
      </section>

      {loading ? (
        <section className="container-page">
          <div className="aspect-[4/3] md:aspect-[16/7] rounded-2xl bg-card border border-border animate-pulse" />
        </section>
      ) : items.length === 0 ? (
        <section className="container-page pb-20">
          <div className="rounded-3xl border border-border bg-card px-6 py-16 md:px-10 md:py-20 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
              The Magazine — coming soon
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-muted-foreground">
              Long-form features and editorial guides are in production. Our first stories drop soon.
            </p>
            <div className="mt-6 text-sm text-muted-foreground">In the meantime, browse:</div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link to="/things-to-do" className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-accent hover:text-accent transition">Things to Do →</Link>
              <Link to="/hotels" className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-accent hover:text-accent transition">Hotels →</Link>
              <Link to="/cruises" className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-accent hover:text-accent transition">Cruises →</Link>
              <Link to="/neighborhoods" className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-accent hover:text-accent transition">Neighborhoods →</Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="container-page">
            {lead && <ArticleCard article={lead} large />}
          </section>

          {rest.length > 0 && (
            <section className="container-page mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => <ArticleCard key={a.slug} article={a} />)}
            </section>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
