import { createFileRoute, Link, notFound, useLoaderData } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Clock, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  read_time_minutes: number | null;
  ai_generated: boolean;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, subtitle, excerpt, body, cover_image, category, tags, author_name, read_time_minutes, ai_generated, meta_title, meta_description, published_at")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) throw notFound();
    return data as Post;
  },
  head: ({ loaderData }) => {
    const p = loaderData as Post | undefined;
    if (!p) return { meta: [{ title: "Post not found" }] };
    const title = p.meta_title || `${p.title} — sandiego.com Blog`;
    const desc = p.meta_description || p.excerpt || p.subtitle || "";
    const meta: Array<{ title?: string; name?: string; property?: string; content?: string }> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
    ];
    if (p.cover_image) {
      meta.push(
        { property: "og:image", content: p.cover_image },
        { name: "twitter:image", content: p.cover_image },
      );
    }
    return { meta };
  },
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-3xl">Post not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-accent">← Back to blog</Link>
    </div>
  ),
  component: BlogPostPage,
});

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "";

function BlogPostPage() {
  const post = useLoaderData({ from: "/blog/$slug" });

  return (
    <article className="bg-background">
      {/* Hero */}
      <header className="border-b border-border">
        <div className="container-page max-w-4xl py-12 md:py-20">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All stories
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
            {post.category && (
              <span className="font-semibold uppercase tracking-wider text-accent">{post.category}</span>
            )}
            {post.ai_generated && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3 text-accent" /> AI-assisted
              </span>
            )}
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="mt-5 text-xl md:text-2xl text-muted-foreground leading-snug">
              {post.subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.author_name && (
              <span className="font-medium text-foreground">By {post.author_name}</span>
            )}
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
            {post.read_time_minutes && (
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.read_time_minutes} min read</span>
            )}
          </div>
        </div>
      </header>

      {/* Cover */}
      {post.cover_image && (
        <div className="container-page max-w-5xl pt-10 md:pt-14">
          <div className="overflow-hidden rounded-3xl">
            <img src={post.cover_image} alt={post.title} className="w-full object-cover" loading="eager" />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="container-page max-w-3xl py-12 md:py-16">
        <div className="prose-blog">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.body || ""}
          </ReactMarkdown>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-16 border-t border-border pt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition"
          >
            <ArrowLeft className="h-4 w-4" /> More stories
          </Link>
        </div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || post.subtitle || undefined,
            image: post.cover_image || undefined,
            datePublished: post.published_at,
            author: post.author_name ? { "@type": "Person", name: post.author_name } : undefined,
            keywords: post.tags?.join(", ") || undefined,
          }),
        }}
      />
    </article>
  );
}
