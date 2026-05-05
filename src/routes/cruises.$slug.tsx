import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { fetchCruiseLineBySlug, fetchCruiseLines, type CruiseLine } from "@/lib/cruise-lines";

const SITE_URL = "https://sandiego.com";

export const Route = createFileRoute("/cruises/$slug")({
  loader: async ({ params }) => {
    const line = await fetchCruiseLineBySlug(params.slug);
    if (!line) throw notFound();
    const all = await fetchCruiseLines();
    const others = all.filter((c) => c.slug !== line.slug).slice(0, 3);
    return { line, others };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.line;
    if (!l) return { meta: [{ title: "Cruise line — sandiego.com" }] };
    return {
      meta: [
        { title: l.metaTitle },
        { name: "description", content: l.metaDescription },
        { property: "og:title", content: l.metaTitle },
        { property: "og:description", content: l.metaDescription },
        { property: "og:image", content: l.heroImage },
        { name: "twitter:image", content: l.heroImage },
        { rel: "canonical", href: `${SITE_URL}/cruises/${l.slug}` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Cruise line not found</h1>
        <Link to="/cruises" className="mt-4 inline-block text-accent">
          Back to all cruise lines
        </Link>
      </div>
    </div>
  ),
  component: CruiseLinePage,
});

function CruiseLinePage() {
  const { line, others } = Route.useLoaderData() as { line: CruiseLine; others: CruiseLine[] };
  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Cruises", to: "/cruises" },
    { label: line.name },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: line.name,
      url: `${SITE_URL}/cruises/${line.slug}`,
      image: line.heroImage,
      description: line.metaDescription,
    },
    breadcrumbJsonLd(breadcrumbs),
  ];


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative">
        <div
          className="aspect-[16/8] md:aspect-[16/6] bg-cover bg-center"
          style={{ backgroundImage: `url('${line.heroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 container-page pb-8 md:pb-12">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            {line.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base md:text-lg text-muted-foreground">
            {line.tagline}
          </p>
        </div>
      </section>

      <section className="container-page py-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="prose prose-neutral max-w-none">
            <p className="text-base md:text-lg text-foreground/85 leading-relaxed">
              {line.description}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Typical itineraries
            </h2>
            <ul className="mt-4 space-y-2">
              {line.typicalItineraries.map((it: string) => (
                <li
                  key={it}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span className="text-sm text-foreground/85">{it}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Local insider notes
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {line.highlights.map((h: any) => (
                <div key={h.title} className="rounded-2xl border border-border bg-card p-5">
                  <div className="eyebrow text-xs">{h.title}</div>
                  <p className="mt-2 text-sm text-foreground/85">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="eyebrow text-xs">Book a sailing</div>
            <div className="mt-1 font-display text-xl font-semibold">From {line.priceFrom}</div>
            <a
              href={line.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              View {line.name} cruises →
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Opens on {line.name}. Prices and availability vary by season.
            </p>
          </div>

          <dl className="rounded-2xl border border-border bg-card p-6 text-sm space-y-3">
            <Row label="Home port" value={line.homePort} />
            <Row label="Ships from SD" value={line.shipsFromSD.join(", ")} />
            <Row label="Best for" value={line.bestFor} />
            <Row label="Season" value={line.seasonality} />
          </dl>
        </aside>
      </section>

      <section className="container-page pb-16">
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
          Other cruise lines from San Diego
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((c) => (
            <Link
              key={c.slug}
              to="/cruises/$slug"
              params={{ slug: c.slug }}
              className="group overflow-hidden rounded-3xl border border-border bg-card hover:shadow-lg transition-shadow"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: `url('${c.heroImage}')` }}
              />
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold tracking-tight">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Footer />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right text-foreground/85">{value}</dd>
    </div>
  );
}
