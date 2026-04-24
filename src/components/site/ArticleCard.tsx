import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/mock-data";

export function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <Link
      to="/articles"
      className={`group block ${large ? "md:grid md:grid-cols-2 md:gap-8 md:items-center" : ""}`}
    >
      <div className={`overflow-hidden rounded-2xl ${large ? "aspect-[4/3]" : "aspect-[3/2]"}`}>
        <img
          src={article.image}
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
        <p className="mt-2 text-muted-foreground line-clamp-2">{article.excerpt}</p>
        <div className="mt-3 text-xs text-muted-foreground">
          {article.author} · {article.date} · {article.readTime}
        </div>
      </div>
    </Link>
  );
}
