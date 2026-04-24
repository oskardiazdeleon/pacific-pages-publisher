import { createFileRoute } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Advertise with sandiego.com — Partner Program" },
      {
        name: "description",
        content:
          "Reach millions of travelers planning a San Diego trip. Featured and Premium listings with transparent impression reporting.",
      },
      { property: "og:title", content: "Partner with sandiego.com" },
      {
        property: "og:description",
        content: "Featured and Premium listings with transparent impression reporting.",
      },
    ],
  }),
  component: PartnersPage,
});

const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Get on the map with a verified listing.",
    features: ["Verified listing", "Basic info & one photo", "Indexed for SEO"],
    cta: "Claim listing",
    highlight: false,
  },
  {
    name: "Featured",
    price: "$199",
    suffix: "/mo",
    desc: "Stand out in category and neighborhood pages.",
    features: [
      "Everything in Free",
      "Featured badge & priority placement",
      "Up to 10 photos + gallery",
      "Monthly impression reports",
    ],
    cta: "Start Featured",
    highlight: true,
  },
  {
    name: "Premium",
    price: "$499",
    suffix: "/mo",
    desc: "Hero placement, editorial features and analytics.",
    features: [
      "Everything in Featured",
      "Homepage hero rotation",
      "Editorial sponsored article (1/qtr)",
      "Real-time analytics dashboard",
      "Dedicated account manager",
    ],
    cta: "Go Premium",
    highlight: false,
  },
];

function PartnersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-page pt-14 pb-12">
        <div className="eyebrow">For Partners</div>
        <h1 className="mt-2 font-display text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          Put your business in front of San Diego's high-intent travelers.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
          We pair editorial credibility with real distribution. Choose the listing tier that fits
          your goals — and we'll show you the impressions to prove it's working.
        </p>
      </section>

      <section className="container-page grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-3xl p-8 border ${
              t.highlight
                ? "border-accent bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                Most popular
              </span>
            )}
            <div className={`eyebrow ${t.highlight ? "text-teal-soft" : ""}`}>{t.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-5xl font-semibold">{t.price}</span>
              {t.suffix && <span className="text-sm opacity-70">{t.suffix}</span>}
            </div>
            <p className={`mt-2 text-sm ${t.highlight ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
              {t.desc}
            </p>
            <ul className="mt-6 space-y-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className={`h-4 w-4 mt-0.5 shrink-0 ${t.highlight ? "text-teal-soft" : "text-accent"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                t.highlight
                  ? "bg-accent text-accent-foreground hover:opacity-90"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {t.cta} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <section className="container-page mt-20">
        <div className="rounded-3xl border border-border bg-card p-10 md:p-14">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <div className="eyebrow">Coming soon</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
                A partner dashboard, built for transparency.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Real-time impressions, click-through rates, top referring articles, and downloadable
                monthly reports — all tied to your listing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: "Impressions", v: "184,302" },
                { n: "Clicks", v: "9,418" },
                { n: "CTR", v: "5.1%" },
                { n: "Top source", v: "Best Tacos" },
              ].map((m) => (
                <div key={m.n} className="rounded-2xl border border-border p-5">
                  <div className="text-xs text-muted-foreground">{m.n}</div>
                  <div className="mt-2 font-display text-2xl font-semibold">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
