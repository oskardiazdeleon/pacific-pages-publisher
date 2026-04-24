import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { ArticleCard, type ArticleCardData } from "@/components/site/ArticleCard";
import { EmailCapture } from "@/components/site/EmailCapture";
import { listings as mockListings, articles as mockArticles, neighborhoods } from "@/lib/mock-data";
import { fetchPublishedListings, fetchPublishedArticles } from "@/lib/content-queries";
import hero from "@/assets/hero-sandiego.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "sandiego.com — The Definitive Guide to America's Finest City" },
      {
        name: "description",
        content:
          "Discover the best of San Diego: handpicked restaurants, hotels, attractions and editorial stories from local experts.",
      },
      { property: "og:title", content: "sandiego.com — The Definitive Guide to San Diego" },
      {
        property: "og:description",
        content: "Handpicked listings, neighborhood guides and editorial stories from local experts.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [featured, setFeatured] = useState<ListingCardData[]>([]);
  const [posts, setPosts] = useState<ArticleCardData[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [l, a] = await Promise.all([
          fetchPublishedListings({ limit: 6 }),
          fetchPublishedArticles({ limit: 4 }),
        ]);
        const feat = l.filter((x) => x.tier !== "free").slice(0, 3);
        setFeatured(feat.length ? (feat as ListingCardData[]) : (mockListings.filter((m) => m.tier !== "free").slice(0, 3) as ListingCardData[]));
        setPosts(a.length ? (a as ArticleCardData[]) : (mockArticles as ArticleCardData[]));
      } catch {
        setFeatured(mockListings.filter((m) => m.tier !== "free").slice(0, 3) as ListingCardData[]);
        setPosts(mockArticles as ArticleCardData[]);
      }
    })();
  }, []);

  const [leadArticle, ...moreArticles] = posts;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="San Diego coastline at golden hour"
            width={1920}
            height={1280}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary/35 to-background" />
        </div>
        <div className="relative container-page pt-24 pb-32 md:pt-36 md:pb-48 text-primary-foreground">
          <span className="eyebrow text-teal-soft">America's Finest City</span>
          <h1 className="mt-4 max-w-3xl font-display text-5xl md:text-7xl font-semibold leading-[1.05]">
            San Diego, distilled.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
            Handpicked places to stay, eat and explore — alongside the stories that make this city
            worth crossing the country for.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/insider"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
            >
              <Sparkles className="h-4 w-4" /> Join Insider — from $19/mo
            </Link>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/20 transition"
            >
              Explore San Diego <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="container-page -mt-20 md:-mt-28 relative">
        <div className="rounded-3xl bg-card border border-border shadow-2xl p-6 md:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Featured this week</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Where San Diego is going</h2>
            </div>
            <Link to="/listings" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-accent">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((l) => <ListingCard key={l.slug} listing={l} />)}
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="container-page mt-24">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">The Magazine</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Stories from the coast</h2>
          </div>
          <Link to="/articles" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-accent">
            All articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {leadArticle && <ArticleCard article={leadArticle} large />}
          </div>
          <div className="lg:col-span-2 space-y-10">
            {moreArticles.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="container-page mt-24">
        <div className="eyebrow flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Neighborhoods</div>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Eight cities in one</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {neighborhoods.map((n) => (
            <Link
              key={n.slug}
              to="/neighborhoods"
              className="group relative overflow-hidden rounded-2xl aspect-[3/4]"
            >
              <img
                src={n.image}
                alt={n.name}
                loading="lazy"
                width={1024}
                height={1280}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                <h3 className="font-display text-2xl font-semibold">{n.name}</h3>
                <p className="mt-1 text-sm text-primary-foreground/80">{n.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Partner CTA */}
      <section className="container-page mt-24">
        <div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="eyebrow text-teal-soft">For partners</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
              Reach millions of travelers planning a San Diego trip.
            </h2>
            <p className="mt-3 text-primary-foreground/80 max-w-md">
              Featured and Premium listings put your business in front of high-intent visitors —
              with transparent impression reporting and editorial integrity.
            </p>
            <Link
              to="/partners"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Become a partner <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { n: "2.4M", l: "Monthly visitors" },
              { n: "180k", l: "Avg. impressions" },
              { n: "94%", l: "Renewal rate" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-primary-foreground/10 p-5">
                <div className="font-display text-3xl font-semibold text-teal-soft">{s.n}</div>
                <div className="mt-1 text-xs text-primary-foreground/70">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
