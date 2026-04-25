import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { fetchArticleBySlug } from "@/lib/content-queries";
import articleFallback from "@/assets/article-foodie.jpg";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const article = await fetchArticleBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: "Article — sandiego.com" }] };
    const title = a.meta_title || `${a.title} | sandiego.com`;
    const description = a.meta_description || a.excerpt || a.title;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(a.hero_image ? [{ property: "og:image", content: a.hero_image }] : []),
        ...(a.hero_image ? [{ name: "twitter:image", content: a.hero_image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Article not found</h1>
        <Link to="/articles" className="mt-4 inline-block text-accent">Back to magazine</Link>
      </div>
    </div>
  ),
  component: ArticleDetail,
});

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

function ArticleDetail() {
  const { article } = Route.useLoaderData();
  const img = article.hero_image || articleFallback;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.hero_image || undefined,
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || undefined,
    articleSection: article.category,
    keywords: article.tags?.join(", "),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <article className="container-page py-12 max-w-3xl">
        <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Magazine
        </Link>
        <div className="mt-6 eyebrow">{article.category}</div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
        )}
        <div className="mt-4 text-xs text-muted-foreground">
          {[formatDate(article.published_at), article.read_time_minutes ? `${article.read_time_minutes} min read` : ""]
            .filter(Boolean).join(" · ")}
        </div>

        {article.hero_image && (
          <div className="mt-8 overflow-hidden rounded-2xl aspect-[16/9]">
            <img src={img} alt={article.title} className="h-full w-full object-cover" />
          </div>
        )}

        {article.body && (
          <div
            className="prose prose-neutral mt-10 max-w-none text-foreground leading-relaxed prose-headings:font-display prose-a:text-accent prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        )}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Footer />
    </div>
  );
}
