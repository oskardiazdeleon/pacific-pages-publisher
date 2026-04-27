import { Link } from "@tanstack/react-router";
import { ArticleCard, type ArticleCardData } from "@/components/site/ArticleCard";

export function HubArticlesStrip({
  articles,
  heading = "Featured Stories",
  eyebrow = "From the editors",
}: {
  articles: ArticleCardData[];
  heading?: string;
  eyebrow?: string;
}) {
  if (!articles.length) return null;
  return (
    <section className="container-page py-14 md:py-16 border-t border-border">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <div className="eyebrow flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            {eyebrow}
          </div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
            {heading}
          </h2>
        </div>
        <Link
          to="/articles"
          className="hidden sm:inline-flex text-sm font-medium text-accent hover:opacity-80 whitespace-nowrap"
        >
          All articles →
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {articles.slice(0, 3).map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
