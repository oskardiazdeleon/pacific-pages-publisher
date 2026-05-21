import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Quote, Sparkles, Clock, Calendar, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ArticleCard } from "@/components/site/ArticleCard";
import { fetchArticleBySlug } from "@/lib/content-queries";
import { supabase } from "@/integrations/supabase/client";
import articleFallback from "@/assets/article-foodie.jpg";
import { EmailCapture } from "@/components/site/EmailCapture";

const SITE_URL = "https://sandiego.com";

type FaqItem = { q: string; a: string };

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const article = await fetchArticleBySlug(params.slug);
    if (!article) throw notFound();
    // Fetch up to 3 related articles by category, fall back to recent
    const { data: rel } = await supabase
      .from("articles")
      .select("id, slug, title, excerpt, hero_image, category, read_time_minutes, published_at")
      .eq("status", "published")
      .neq("id", article.id)
      .eq("category", article.category)
      .order("published_at", { ascending: false })
      .limit(3);
    return { article, related: rel ?? [] };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: "Article — sandiego.com" }] };
    const title = a.meta_title || `${a.title} | sandiego.com`;
    const description = a.meta_description || a.excerpt || a.subtitle || a.title;
    const image = a.og_image || a.hero_image;
    const url = `${SITE_URL}/articles/${a.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        ...(image ? [{ name: "twitter:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        ...(a.author_name ? [{ name: "author", content: a.author_name }] : []),
        ...(a.published_at ? [{ property: "article:published_time", content: a.published_at }] : []),
        ...(a.updated_at ? [{ property: "article:modified_time", content: a.updated_at }] : []),
        ...(a.category ? [{ property: "article:section", content: a.category }] : []),
        ...((a.tags ?? []).map((t: string) => ({ property: "article:tag", content: t }))),
      ],
      links: [{ rel: "canonical", href: a.canonical_url || url }],
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
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
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

/** Inject id="..." on h2/h3 in raw HTML for in-page TOC anchors. */
function injectHeadingIds(html: string): { html: string; toc: { id: string; text: string; level: 2 | 3 }[] } {
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  const seen = new Set<string>();
  // Inject ids on both h2 and h3 (so deep links still work) but only collect H2s in the TOC.
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvl: string, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return _m;
    let id = slugify(text);
    if (!id) return _m;
    let i = 2;
    while (seen.has(id)) { id = `${slugify(text)}-${i++}`; }
    seen.add(id);
    if (Number(lvl) === 2) toc.push({ id, text, level: 2 });
    if (/\bid=/.test(attrs)) return _m;
    return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
  });
  return { html: out, toc };
}

function ArticleDetail() {
  const { article, related } = Route.useLoaderData();
  const img = article.hero_image || articleFallback;
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLDivElement | null>(null);

  const { bodyHtml, toc } = useMemo(() => {
    if (!article.body) return { bodyHtml: "", toc: [] as { id: string; text: string; level: 2 | 3 }[] };
    const r = injectHeadingIds(article.body);
    return { bodyHtml: r.html, toc: r.toc };
  }, [article.body]);

  // Reading progress
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Magazine", to: "/articles" },
    { label: article.title },
  ];

  const url = `${SITE_URL}/articles/${article.slug}`;
  const takeaways: string[] = Array.isArray(article.key_takeaways)
    ? (article.key_takeaways as unknown[]).filter((x): x is string => typeof x === "string" && x.length > 0)
    : [];
  const faqs: FaqItem[] = Array.isArray(article.faqs)
    ? (article.faqs as unknown[])
        .map((f) => f as { q?: string; a?: string })
        .filter((f) => f && typeof f.q === "string" && typeof f.a === "string")
        .map((f) => ({ q: f.q!, a: f.a! }))
    : [];


  const validAuthor =
    article.author_name &&
    !/lovable/i.test(article.author_name);
  if (!validAuthor && typeof console !== "undefined") {
    console.warn(
      `[seo] Article "${article.slug}" missing valid author_name — Article schema suppressed.`,
    );
  }

  const jsonLd: Record<string, unknown>[] = [breadcrumbJsonLd(breadcrumbs)];
  if (validAuthor) {
    jsonLd.unshift({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.meta_description || article.excerpt || undefined,
      image: article.og_image || article.hero_image || undefined,
      datePublished: article.published_at || undefined,
      dateModified: article.updated_at || undefined,
      articleSection: article.category,
      keywords: article.tags?.join(", "),
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: {
        "@type": "Person",
        name: article.author_name,
        jobTitle: article.author_title || undefined,
      },
      publisher: {
        "@type": "Organization",
        name: "SanDiego.com",
        logo: { "@type": "ImageObject", url: "https://sandiego.com/assets/logo.png" },
      },
    });
  }

  if (faqs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  const share = (net: "twitter" | "facebook" | "linkedin") => {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(article.title);
    const map = {
      twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    } as const;
    window.open(map[net], "_blank", "noopener,noreferrer");
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Reading progress bar */}
      <div className="sticky top-0 z-40 h-0.5 bg-transparent">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>

      <article ref={articleRef}>
        {/* HERO */}
        <header className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/40 via-background to-background">
          <div className="container-page pt-8 md:pt-12 pb-10 md:pb-14">
            <Breadcrumbs items={breadcrumbs} />
            <Link to="/articles" className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Magazine
            </Link>

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
              <div>
                <div className="eyebrow flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  {article.category}
                </div>
                <h1 className="mt-4 font-display text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05]">
                  {article.title}
                </h1>
                {article.subtitle && (
                  <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {article.subtitle}
                  </p>
                )}
                {!article.subtitle && article.excerpt && (
                  <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {article.excerpt}
                  </p>
                )}

                {/* Byline + meta */}
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                  {article.author_name && (
                    <div className="flex items-center gap-3">
                      {article.author_avatar ? (
                        <img
                          src={article.author_avatar}
                          alt={article.author_name}
                          className="h-9 w-9 rounded-full object-cover border border-border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-semibold text-foreground/70">
                          {article.author_name.split(" ").map((p: string) => p[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      <div className="leading-tight">
                        <Link
                          to="/authors/$slug"
                          params={{
                            slug: article.author_name.toLowerCase().trim()
                              .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                          }}
                          className="font-medium text-foreground hover:text-accent"
                        >
                          {article.author_name}
                        </Link>
                        {article.author_title && (
                          <div className="text-xs text-muted-foreground">{article.author_title}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {article.published_at && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(article.published_at)}
                    </span>
                  )}
                  {article.read_time_minutes && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {article.read_time_minutes} min read
                    </span>
                  )}
                </div>

                {/* Share row */}
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground mr-1">
                    <Share2 className="inline h-3.5 w-3.5 mr-1" />
                    Share
                  </span>
                  <button onClick={() => share("twitter")} aria-label="Share on Twitter"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary transition">
                    <Twitter className="h-4 w-4" />
                  </button>
                  <button onClick={() => share("facebook")} aria-label="Share on Facebook"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary transition">
                    <Facebook className="h-4 w-4" />
                  </button>
                  <button onClick={() => share("linkedin")} aria-label="Share on LinkedIn"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary transition">
                    <Linkedin className="h-4 w-4" />
                  </button>
                  <button onClick={copyLink} aria-label="Copy link"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 h-9 text-xs font-medium hover:bg-secondary transition">
                    <LinkIcon className="h-3.5 w-3.5" />
                    {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
              </div>

              {/* Hero image */}
              {article.hero_image && (
                <figure className="relative">
                  <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[5/6] w-full overflow-hidden rounded-3xl bg-muted shadow-xl">
                    <img
                      src={img}
                      alt={article.hero_caption || article.title}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  </div>
                  {(article.hero_caption || article.hero_credit) && (
                    <figcaption className="mt-3 text-xs text-muted-foreground">
                      {article.hero_caption}
                      {article.hero_caption && article.hero_credit ? " · " : ""}
                      {article.hero_credit && <span className="opacity-70">Photo: {article.hero_credit}</span>}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          </div>
        </header>

        {/* BODY + SIDEBAR */}
        <div className="container-page py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* Main column */}
            <div className="max-w-3xl">
              {takeaways.length > 0 && (
                <aside className="mb-10 rounded-2xl border border-accent/30 bg-accent/5 p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    Key takeaways
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {takeaways.map((t, i) => (
                      <li key={i} className="flex gap-3 text-sm md:text-base text-foreground/90 leading-relaxed">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}

              {bodyHtml && (
                <ArticleBodyRenderer
                  html={bodyHtml}
                  className="prose prose-neutral max-w-none text-foreground leading-relaxed
                    prose-headings:font-display prose-headings:tracking-tight prose-headings:scroll-mt-24
                    prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-14 prose-h2:mb-5
                    prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-3
                    prose-p:text-[1.0625rem] md:prose-p:text-lg prose-p:leading-[1.75]
                    prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-img:rounded-2xl prose-img:shadow-md
                    prose-blockquote:border-l-accent prose-blockquote:bg-secondary/40 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:not-italic
                    prose-li:marker:text-accent"
                />
              )}

              {article.pull_quote && (
                <figure className="my-12 border-y border-border py-8 text-center">
                  <Quote className="mx-auto h-7 w-7 text-accent" aria-hidden />
                  <blockquote className="mt-4 font-display text-2xl md:text-3xl font-semibold leading-snug tracking-tight text-foreground">
                    “{article.pull_quote}”
                  </blockquote>
                </figure>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2">
                  {article.tags.map((t: string) => (
                    <span key={t} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* FAQ */}
              {faqs.length > 0 && (
                <section className="mt-16">
                  <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                    Frequently asked
                  </h2>
                  <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
                    {faqs.map((f, i) => (
                      <details key={i} className="group p-5 md:p-6">
                        <summary className="cursor-pointer list-none font-medium flex items-start justify-between gap-4 text-foreground">
                          <span>{f.q}</span>
                          <span className="text-accent text-xl leading-none transition-transform group-open:rotate-45">+</span>
                        </summary>
                        <p className="mt-3 text-sm md:text-base text-foreground/80 leading-relaxed">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Author bio */}
              {article.author_name && article.author_bio && (
                <section className="mt-16 rounded-2xl border border-border bg-secondary/40 p-6 md:p-8 flex gap-5">
                  {article.author_avatar ? (
                    <img
                      src={article.author_avatar}
                      alt={article.author_name}
                      className="h-14 w-14 rounded-full object-cover border border-border shrink-0"
                      loading="lazy"
                    />
                  ) : null}
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Written by</div>
                    <div className="mt-0.5 font-display text-lg font-semibold text-foreground">{article.author_name}</div>
                    {article.author_title && (
                      <div className="text-xs text-muted-foreground">{article.author_title}</div>
                    )}
                    <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{article.author_bio}</p>
                  </div>
                </section>
              )}
            </div>

            {/* Sticky sidebar — TOC */}
            {toc.length > 1 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    In this article
                  </div>
                  <nav className="mt-4 border-l border-border">
                    {toc.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block border-l-2 -ml-px py-1.5 text-sm transition-colors hover:text-foreground hover:border-accent ${
                          h.level === 3 ? "pl-6 text-muted-foreground" : "pl-4 text-foreground/85"
                        } border-transparent`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border bg-secondary/30">
            <div className="container-page py-14">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                  Keep reading
                </h2>
                <Link to="/articles" className="text-sm font-medium text-accent hover:underline">
                  All articles →
                </Link>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r: typeof related[number]) => (
                  <ArticleCard
                    key={r.id}
                    article={{
                      slug: r.slug,
                      title: r.title,
                      excerpt: r.excerpt,
                      hero_image: r.hero_image,
                      category: r.category,
                      read_time_minutes: r.read_time_minutes,
                      published_at: r.published_at,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <section className="container-page max-w-3xl mx-auto pb-16">
        <EmailCapture source="article_footer" variant="inline" />
      </section>


      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Footer />
    </div>
  );
}
