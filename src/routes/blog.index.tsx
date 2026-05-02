import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Stories, guides & dispatches from San Diego" },
      { name: "description", content: "Lifestyle stories, weekend guides, and local dispatches from sandiego.com — the people, places, and flavor of the city." },
      { property: "og:title", content: "Blog — Stories, guides & dispatches from San Diego" },
      { property: "og:description", content: "Lifestyle stories, weekend guides, and local dispatches from across San Diego." },
    ],
  }),
  component: BlogIndex,
});

interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  read_time_minutes: number | null;
  ai_generated: boolean;
  published_at: string | null;
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";

function BlogIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, subtitle, excerpt, cover_image, category, tags, author_name, read_time_minutes, ai_generated, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setPosts((data as Post[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[]))];
  const visible = activeCat === "All" ? posts : posts.filter((p) => p.category === activeCat);
  const [hero, ...rest] = visible;

  return (
    <div className="bg-background">
      {/* Hero header */}
      <section className="border-b border-border">
        <div className="container-page py-16 md:py-24">
          <nav className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Blog</span>
          </nav>
          <div className="eyebrow mt-4">The Journal</div>
          <h1 className="mt-3 font-display text-5xl md:text-7xl font-semibold tracking-tight">
            Stories from <span className="text-accent">San Diego</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Weekend itineraries, neighborhood dispatches, food obsessions, and the unforgettable
            details that make this city feel like yours.
          </p>
        </div>
      </section>

      {/* Category chips */}
      {categories.length > 1 && (
        <section className="border-b border-border bg-muted/30">
          <div className="container-page py-4 flex gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  activeCat === c
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >{c}</button>
            ))}
          </div>
        </section>
      )}

      <div className="container-page py-12 md:py-16">
        {loading ? (
          <p className="text-muted-foreground">Loading stories…</p>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="text-lg font-display">No posts yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon for fresh stories.</p>
          </div>
        ) : (
          <>
            {/* Hero post */}
            {hero && (
              <Link
                to="/blog/$slug" params={{ slug: hero.slug }}
                className="group block mb-16"
              >
                <article className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div className="relative aspect-[4/3] md:aspect-[5/4] overflow-hidden rounded-3xl bg-muted">
                    {hero.cover_image ? (
                      <img
                        src={hero.cover_image}
                        alt={hero.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="eager"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-accent/30 to-primary/20" />
                    )}
                    <span className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                  <div>
                    {hero.category && (
                      <div className="text-xs font-semibold uppercase tracking-wider text-accent">{hero.category}</div>
                    )}
                    <h2 className="mt-3 font-display text-3xl md:text-5xl font-semibold leading-tight group-hover:text-accent transition-colors">
                      {hero.title}
                    </h2>
                    {hero.subtitle && (
                      <p className="mt-3 text-lg text-muted-foreground">{hero.subtitle}</p>
                    )}
                    {hero.excerpt && (
                      <p className="mt-4 text-base text-foreground/80 leading-relaxed">{hero.excerpt}</p>
                    )}
                    <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                      {hero.author_name && <span className="font-medium text-foreground/80">{hero.author_name}</span>}
                      {hero.published_at && <span>{formatDate(hero.published_at)}</span>}
                      {hero.read_time_minutes && (
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {hero.read_time_minutes} min</span>
                      )}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-accent">
                      Read story <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid gap-10 md:gap-x-8 md:gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => <BlogCard key={p.id} post={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: Post }) {
  return (
    <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent/20 to-primary/10" />
        )}
        {post.ai_generated && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold">
            <Sparkles className="h-3 w-3 text-accent" /> AI
          </span>
        )}
      </div>
      <div className="mt-5">
        {post.category && (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">{post.category}</div>
        )}
        <h3 className="mt-2 font-display text-2xl font-semibold leading-snug group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.read_time_minutes && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_time_minutes} min</span>
          )}
        </div>
      </div>
    </Link>
  );
}
