import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { neighborhoods } from "@/lib/mock-data";

export const Route = createFileRoute("/neighborhoods")({
  head: () => ({
    meta: [
      { title: "Neighborhoods of San Diego | sandiego.com" },
      {
        name: "description",
        content:
          "From La Jolla's sea cliffs to the Gaslamp Quarter — explore the distinct neighborhoods that make up San Diego.",
      },
      { property: "og:title", content: "Neighborhoods of San Diego" },
      {
        property: "og:description",
        content: "Explore the distinct neighborhoods that make up San Diego.",
      },
    ],
  }),
  component: NeighborhoodsPage,
});

function NeighborhoodsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-page pt-14 pb-12">
        <div className="eyebrow">Neighborhoods</div>
        <h1 className="mt-2 font-display text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          Eight cities, one coastline.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Each neighborhood has its own pace, character and best-kept secrets. Start anywhere — they
          all lead back to the water.
        </p>
      </section>

      <section className="container-page grid gap-6 md:grid-cols-2">
        {neighborhoods.map((n, i) => (
          <Link
            key={n.slug}
            to="/listings"
            className={`group relative overflow-hidden rounded-3xl ${
              i % 3 === 0 ? "aspect-[4/5]" : "aspect-[5/4]"
            }`}
          >
            <img
              src={n.image}
              alt={n.name}
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-primary-foreground">
              <h3 className="font-display text-3xl font-semibold">{n.name}</h3>
              <p className="mt-2 max-w-sm text-primary-foreground/85">{n.blurb}</p>
            </div>
          </Link>
        ))}
      </section>
      <Footer />
    </div>
  );
}
