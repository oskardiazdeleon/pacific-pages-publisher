import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export function ComingSoonPage({
  eyebrow,
  headline,
  description,
}: {
  eyebrow: string;
  headline: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-page pt-16 pb-24">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          {headline}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
        <div className="mt-10 rounded-3xl border border-border bg-card p-10 text-center">
          <h2 className="font-display text-2xl font-semibold">Coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is being prepared for launch.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground hover:opacity-90 transition"
          >
            Back to homepage →
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

// Default export only used in a route — disabled lint:
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SanDiego.com | sandiego.com" },
      { name: "description", content: "The definitive guide to San Diego — the people behind it and the standards we hold our recommendations to." },
      { property: "og:title", content: "About SanDiego.com" },
      { property: "og:description", content: "The definitive guide to San Diego — the people behind it." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sandiego.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://sandiego.com/about" }],
  }),
  component: () => (
    <ComingSoonPage
      eyebrow="About"
      headline="About sandiego.com"
      description="The definitive guide to San Diego — the people behind it and the standards we hold our recommendations to."
    />
  ),
});
