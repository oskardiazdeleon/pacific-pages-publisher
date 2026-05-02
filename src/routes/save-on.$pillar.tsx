import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgePercent,
  Check,
  Sparkles,
  Star,
  TrendingDown,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { EmailCapture } from "@/components/site/EmailCapture";
import { getSeoPillar, SEO_PILLARS, type SeoPillar } from "@/lib/seo-pillars";
import { CATEGORY_HUBS } from "@/lib/listing-categories";
import { fetchPublishedListings } from "@/lib/content-queries";

const SITE_URL = "https://sandiego.com";

export const Route = createFileRoute("/save-on/$pillar")({
  loader: async ({ params }) => {
    const pillar = getSeoPillar(params.pillar);
    if (!pillar) throw notFound();
    return { pillar };
  },
  head: ({ loaderData }) => {
    const d = loaderData;
    if (!d) return { meta: [{ title: "Save on San Diego — Insider" }] };
    const { pillar } = d;
    const url = `${SITE_URL}/save-on/${pillar.slug}`;
    return {
      meta: [
        { title: pillar.metaTitle },
        { name: "description", content: pillar.metaDescription },
        { property: "og:title", content: pillar.metaTitle },
        { property: "og:description", content: pillar.metaDescription },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: pillar.metaTitle },
        { name: "twitter:description", content: pillar.metaDescription },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <h1 className="font-display text-2xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-foreground/70">{error.message}</p>
        <Link to="/insider" className="mt-4 inline-block text-accent underline">
          Go to Insider
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <h1 className="font-display text-2xl">Page not found</h1>
        <Link to="/insider" className="mt-4 inline-block text-accent underline">
          Explore Insider benefits →
        </Link>
      </div>
    </div>
  ),
  component: PillarPage,
});

function PillarPage() {
  const { pillar } = Route.useLoaderData();
  const [proof, setProof] = useState<ListingCardData[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hubs = CATEGORY_HUBS.filter((h) =>
          pillar.proofCategories.includes(h.slug as never),
        );
        const dbCats = hubs.flatMap((h) => h.dbCategories);
        const buckets = await Promise.all(
          dbCats.map((c) => fetchPublishedListings({ category: c })),
        );
        if (cancelled) return;
        const merged = (buckets.flat() as ListingCardData[]).slice(0, 6);
        setProof(merged);
      } catch {
        // ignore — proof strip is optional
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pillar.slug]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Insider", href: "/insider" },
    { label: pillar.benefit, href: `/save-on/${pillar.slug}` },
  ];

  // FAQPage schema
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pillar.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,theme(colors.teal-soft.DEFAULT/60%),transparent_60%)]" />
        <div className="relative container-page pt-12 pb-20 md:pt-16 md:pb-24">
          <Breadcrumbs items={breadcrumbs} />
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
                <BadgePercent className="h-3.5 w-3.5" /> {pillar.savingsRange}
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
                {pillar.heading}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
                {pillar.subheading}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/insider"
                  hash="signup"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
                >
                  Start free 7-day trial <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/insider"
                  hash="pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/20 transition"
                >
                  See member pricing
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-foreground/75">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-teal-soft text-teal-soft" /> 500+ founding members
                </span>
                <span>·</span>
                <span>Cancel anytime</span>
                <span>·</span>
                <span>30-day refund</span>
              </div>
            </div>

            {/* Stat card */}
            <div className="rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 md:p-8 backdrop-blur">
              <div className="eyebrow text-teal-soft">Average member savings</div>
              <div className="mt-3 flex items-baseline gap-2">
                <TrendingDown className="h-7 w-7 text-accent" />
                <span className="font-display text-4xl md:text-5xl font-semibold">
                  {pillar.avgSavings}
                </span>
              </div>
              <p className="mt-2 text-sm text-primary-foreground/75">
                Most {pillar.benefit.toLowerCase()} members earn back the $149 annual fee in a single booking.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {pillar.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-primary-foreground/90">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Proof strip — live listings */}
      {proof.length > 0 && (
        <section className="container-page mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Where members save</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
                Hand-picked partners across San Diego
              </h2>
            </div>
            <Link
              to="/insider"
              className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              See all benefits <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proof.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="container-page mt-24">
        <div className="rounded-3xl bg-secondary/40 border border-border p-8 md:p-12">
          <div className="eyebrow">How it works</div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold max-w-2xl">
            Three steps to start saving on {pillar.benefit.toLowerCase()}.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Start your free trial",
                d: "7 days, no card required. Browse member rates and lock in founding pricing.",
              },
              {
                n: "2",
                t: "Pick the perk",
                d: `Browse ${pillar.benefit.toLowerCase()} partners and tap "Get member rate" to reveal the deal.`,
              },
              {
                n: "3",
                t: "Book & save",
                d: "Book directly with the partner. Member savings typically pay for the year in one booking.",
              },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-card border border-border p-6">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground font-display text-lg font-semibold">
                  {s.n}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-foreground/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead magnet */}
      <section className="container-page mt-24 max-w-3xl">
        <EmailCapture
          source={`pillar_${pillar.slug}`}
          title={`Try Insider free for 7 days — start saving on ${pillar.benefit}`}
          subtitle="Get the 3-Day San Diego Insider Itinerary instantly, plus a free trial of member pricing."
          cta="Start free trial"
        />
      </section>

      {/* FAQ */}
      <section className="container-page mt-24">
        <div className="max-w-3xl">
          <div className="eyebrow">Common questions</div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
            Questions members ask before joining
          </h2>
          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
            {pillar.faqs.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="cursor-pointer list-none font-medium flex items-start justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-accent transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-link to other pillars */}
      <section className="container-page mt-24">
        <div className="eyebrow">More ways to save</div>
        <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">
          Other Insider benefits
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEO_PILLARS.filter((p) => p.slug !== pillar.slug).map((p) => (
            <Link
              key={p.slug}
              to="/save-on/$pillar"
              params={{ pillar: p.slug }}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-accent transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent">{p.savingsRange}</span>
                <ArrowRight className="h-4 w-4 text-foreground/40 group-hover:text-accent transition" />
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{p.benefit}</h3>
              <p className="mt-1 text-sm text-foreground/70 line-clamp-2">{p.subheading}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page mt-24 mb-24">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold max-w-2xl mx-auto">
            Ready to save on {pillar.benefit.toLowerCase()}?
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            Join 500+ founding members. One booking pays for the year.
          </p>
          <Link
            to="/insider"
            hash="signup"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
          >
            Start free 7-day trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
