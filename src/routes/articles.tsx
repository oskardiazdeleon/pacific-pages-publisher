import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArticleCard } from "@/components/site/ArticleCard";
import { articles } from "@/lib/mock-data";

export const Route = createFileRoute("/articles")({
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
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const [lead, ...rest] = articles;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-page pt-14 pb-10">
        <div className="eyebrow">The Magazine</div>
        <h1 className="mt-2 font-display text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          Stories worth crossing town for.
        </h1>
      </section>

      <section className="container-page">
        {lead && <ArticleCard article={lead} large />}
      </section>

      <section className="container-page mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {rest.concat(rest).map((a, i) => <ArticleCard key={`${a.slug}-${i}`} article={a} />)}
      </section>

      <Footer />
    </div>
  );
}
