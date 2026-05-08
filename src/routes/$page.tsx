import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { buildPageHead } from "@/lib/seo-head";

const PAGES = {
  about: {
    title: "About SanDiego.com",
    description: "The definitive guide to San Diego — the people behind it and the standards we hold our recommendations to.",
    headline: "About sandiego.com",
  },
  contact: {
    title: "Contact SanDiego.com",
    description: "Get in touch with the SanDiego.com editorial and partnerships team.",
    headline: "Contact us",
  },
  privacy: {
    title: "Privacy Policy",
    description: "How SanDiego.com handles your information.",
    headline: "Privacy Policy",
  },
  terms: {
    title: "Terms of Service",
    description: "The terms governing your use of SanDiego.com.",
    headline: "Terms of Service",
  },
} as const;

type Slug = keyof typeof PAGES;

export const Route = createFileRoute("/$page")({
  beforeLoad: ({ params }) => {
    if (!(params.page in PAGES)) {
      throw new Error("NOT_FOUND");
    }
  },
  head: ({ params }) => {
    const meta = PAGES[params.page as Slug];
    if (!meta) return { meta: [{ title: "sandiego.com" }] };
    return buildPageHead({
      path: `/${params.page}`,
      title: `${meta.title} | sandiego.com`,
      description: meta.description,
    });
  },
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-accent">Back home</Link>
      </div>
    </div>
  ),
  component: StaticPage,
});

function StaticPage() {
  const { page } = Route.useParams();
  const meta = PAGES[page as Slug];
  if (!meta) return null;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-page pt-16 pb-24">
        <div className="eyebrow">{meta.headline}</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          {meta.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{meta.description}</p>
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
