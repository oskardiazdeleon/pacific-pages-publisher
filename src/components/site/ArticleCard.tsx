import { Link } from "@tanstack/react-router";
import articleFallback from "@/assets/article-foodie.jpg";

export interface ArticleCardData {
  slug: string;
  title: string;
  excerpt?: string | null;
  category: string;
  hero_image?: string | null;
  image?: string | null;
  read_time_minutes?: number | null;
  readTime?: string;
  published_at?: string | null;
  date?: string;
  author?: string;
}

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return "";
  }
}

export function ArticleCard({ article, large = false }: { article: ArticleCardData; large?: boolean }) {
  const img = article.hero_image || article.image || articleFallback;
  const readTime =
    article.readTime ??
    (article.read_time_minutes ? `${article.read_time_minutes} min read` : "");
  const date = article.date ?? formatDate(article.published_at);

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className={`group block ${large ? "md:grid md:grid-cols-2 md:gap-8 md:items-center" : ""}`}
    >
      <div className={`overflow-hidden rounded-2xl ${large ? "aspect-[4/3]" : "aspect-[3/2]"}`}>
        <img
          src={img}
          alt={article.title}
          loading="lazy"
          width={1280}
          height={896}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className={large ? "mt-5 md:mt-0" : "mt-5"}>
        <div className="eyebrow">{article.category}</div>
        <h3
          className={`mt-2 font-display font-semibold tracking-tight ${
            large ? "text-3xl md:text-4xl" : "text-xl"
          }`}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 text-muted-foreground line-clamp-2">{article.excerpt}</p>
        )}
        {(article.author || date || readTime) && (
          <div className="mt-3 text-xs text-muted-foreground">
            {[article.author, date, readTime].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    </Link>
  );
}
