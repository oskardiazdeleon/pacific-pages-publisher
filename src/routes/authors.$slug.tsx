import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ArticleCard, type ArticleCardData } from "@/components/site/ArticleCard";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createServerFn } from "@tanstack/react-start";

const SITE_URL = "https://sandiego.com";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type AuthorData = {
  name: string;
  slug: string;
  title: string | null;
  bio: string | null;
  avatar: string | null;
  articles: ArticleCardData[];
};

const fetchAuthor = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const slug = (d as { slug?: string })?.slug;
    if (!slug || typeof slug !== "string") throw new Error("slug required");
    return { slug };
  })
  .handler(async ({ data }): Promise<AuthorData | null> => {
    const { data: rows } = await supabaseAdmin
      .from("articles")
      .select(
        "id, slug, title, excerpt, hero_image, category, read_time_minutes, published_at, author_name, author_title, author_bio, author_avatar",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (!rows?.length) return null;
    const matches = rows.filter(
      (r) => r.author_name && slugify(r.author_name) === data.slug,
    );
    if (!matches.length) return null;
    const first = matches[0];
    if (!first.author_name || /lovable/i.test(first.author_name)) return null;
    return {
      name: first.author_name,
      slug: data.slug,
      title: first.author_title,
      bio: first.author_bio,
      avatar: first.author_avatar,
      articles: matches as unknown as ArticleCardData[],
    };
  });

export const Route = createFileRoute("/authors/$slug")({
  loader: async ({ params }) => {
    const author = await fetchAuthor({ data: { slug: params.slug } });
    if (!author) throw notFound();
    return { author };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.author;
    if (!a) return { meta: [{ title: "Author — sandiego.com" }] };
    const title = `${a.name}${a.title ? `, ${a.title}` : ""} | sandiego.com`;
    const description =
      a.bio || `Articles by ${a.name} on sandiego.com.`;
    const url = `${SITE_URL}/authors/${a.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 160) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 160) },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        ...(a.avatar ? [{ property: "og:image", content: a.avatar }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Author not found</h1>
        <Link to="/articles" className="mt-4 inline-block text-accent">
          Back to magazine
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: AuthorPage,
});

function AuthorPage() {
  const { author } = Route.useLoaderData();
  const url = `${SITE_URL}/authors/${author.slug}`;
  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Authors" },
    { label: author.name },
  ];
  const personJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url,
    jobTitle: author.title || undefined,
    image: author.avatar || undefined,
    description: author.bio || undefined,
    worksFor: { "@type": "Organization", name: "SanDiego.com" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-page pt-10 pb-12">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {author.avatar && (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-border"
            />
          )}
          <div>
            <div className="eyebrow">Author</div>
            <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tight">
              {author.name}
            </h1>
            {author.title && (
              <p className="mt-1 text-sm text-muted-foreground">{author.title}</p>
            )}
          </div>
        </div>
        {author.bio && (
          <p className="mt-6 max-w-3xl text-base text-foreground/80">{author.bio}</p>
        )}
      </section>

      <section className="container-page pb-16">
        <h2 className="font-display text-2xl font-semibold">
          Articles by {author.name}
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {author.articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd, breadcrumbJsonLd(breadcrumbs)]),
        }}
      />
    </div>
  );
}
