import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/Breadcrumbs";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";
import { getNeighborhoodHub } from "@/lib/neighborhoods-data";
import { fetchPublishedListings } from "@/lib/content-queries";
import { listings as mockListings } from "@/lib/mock-data";

export const Route = createFileRoute("/neighborhoods/$slug")({
  loader: ({ params }) => {
    const hub = getNeighborhoodHub(params.slug);
    if (!hub) throw notFound();
    return { hub };
  },
  head: ({ loaderData }) => {
    const h = loaderData?.hub;
    if (!h) return { meta: [{ title: "Neighborhood — sandiego.com" }] };
    const title = `${h.name} San Diego Guide — Hotels, Restaurants & Things To Do | sandiego.com`;
    const description = `${h.intro.slice(0, 155)}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: h.image },
        { name: "twitter:image", content: h.image },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Neighborhood not found</h1>
        <Link to="/neighborhoods" className="mt-4 inline-block text-accent">
          Back to neighborhoods
        </Link>
      </div>
    </div>
  ),
  component: NeighborhoodDetail,
});

function NeighborhoodDetail() {
  const { hub } = Route.useLoaderData();
  const [items, setItems] = useState<ListingCardData[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublishedListings({ limit: 24 });
        if (cancelled) return;
        const filtered = (data ?? []).filter(
          (l: any) => (l.neighborhood || "").toLowerCase() === hub.name.toLowerCase(),
        );
        if (filtered.length) {
          setItems(filtered as ListingCardData[]);
        } else {
          const mock = mockListings.filter(
            (l) => l.neighborhood.toLowerCase() === hub.name.toLowerCase(),
          );
          setItems(mock as ListingCardData[]);
        }
      } catch {
        const mock = mockListings.filter(
          (l) => l.neighborhood.toLowerCase() === hub.name.toLowerCase(),
        );
        setItems(mock as ListingCardData[]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hub]);

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Neighborhoods", to: "/neighborhoods" },
    { label: hub.name },
  ];

  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: `${hub.name}, San Diego`,
      description: hub.intro,
      image: hub.image,
      touristType: hub.bestFor,
      ...(hub.geo
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: hub.geo.lat,
              longitude: hub.geo.lng,
            },
          }
        : {}),
      containedInPlace: {
        "@type": "City",
        name: "San Diego",
        address: { "@type": "PostalAddress", addressRegion: "CA", addressCountry: "US" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: hub.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative">
        <div className="aspect-[16/7] w-full overflow-hidden">
          <img src={hub.image} alt={`${hub.name}, San Diego`} className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="container-page -mt-16 relative">
        <div className="rounded-3xl bg-card border border-border p-8 md:p-12 shadow-xl">
          <Breadcrumbs items={breadcrumbs} />
          <div className="mt-3 eyebrow">San Diego Neighborhood</div>
          <h1 className="mt-2 font-display text-4xl md:text-6xl font-semibold tracking-tight">
            {hub.name}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{hub.intro}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {hub.bestFor.map((b) => (
              <span
                key={b}
                className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14 grid gap-8 md:grid-cols-3">
        {hub.highlights.map((h) => (
          <div key={h.title} className="rounded-2xl border border-border p-6 bg-card">
            <h3 className="font-display text-xl font-semibold">{h.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{h.body}</p>
          </div>
        ))}
      </section>

      {items.length > 0 && (
        <section className="container-page pb-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">In this neighborhood</div>
              <h2 className="mt-1 font-display text-3xl font-semibold">Top {hub.name} listings</h2>
            </div>
            <Link to="/listings" className="text-sm text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-20">
        <div className="eyebrow">Frequently asked</div>
        <h2 className="mt-1 font-display text-3xl font-semibold">
          Visiting {hub.name}: questions answered
        </h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
          {hub.faqs.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-4">
                {f.q}
                <span className="text-accent group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
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
