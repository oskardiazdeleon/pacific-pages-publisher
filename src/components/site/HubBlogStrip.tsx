import { Link } from "@tanstack/react-router";
import { Clock, Sparkles } from "lucide-react";

export type HubBlogPost = {
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  category?: string | null;
  author_name?: string | null;
  read_time_minutes?: number | null;
  ai_generated?: boolean | null;
  published_at?: string | null;
};

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

export function HubBlogStrip({
  posts,
  heading = "From the Blog",
  eyebrow = "The Journal",
}: {
  posts: HubBlogPost[];
  heading?: string;
  eyebrow?: string;
}) {
  if (!posts.length) return null;
  return (
    <section className="bg-muted/30 border-t border-border">
      <div className="container-page py-14 md:py-16">
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
            to="/blog"
            className="hidden sm:inline-flex text-sm font-medium text-accent hover:opacity-80 whitespace-nowrap"
          >
            Read the blog →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group block"
            >
              <div className="overflow-hidden rounded-2xl aspect-[4/5] bg-muted">
                {p.cover_image ? (
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-accent/15 to-secondary" />
                )}
              </div>
              <div className="mt-5">
                {p.category && (
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {p.category}
                  </div>
                )}
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight leading-tight">
                  {p.title}
                </h3>
                {(p.subtitle || p.excerpt) && (
                  <p className="mt-2 text-muted-foreground line-clamp-2">
                    {p.subtitle || p.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  {p.author_name && <span>{p.author_name}</span>}
                  {p.published_at && <span>· {formatDate(p.published_at)}</span>}
                  {p.read_time_minutes && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {p.read_time_minutes} min
                    </span>
                  )}
                  {p.ai_generated && (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Sparkles className="h-3 w-3" /> AI
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
