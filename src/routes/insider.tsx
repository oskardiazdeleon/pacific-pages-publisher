import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check, Star, Hotel, Ship, Ticket, Car, CalendarDays,
  Compass, ShoppingBag, Plane, Home as HomeIcon, Wine, ArrowRight, Quote,
} from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EmailCapture } from "@/components/site/EmailCapture";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/insider")({
  head: () => ({
    meta: [
      { title: "sandiego.com Insider — Save on Hotels, Cruises & Experiences" },
      {
        name: "description",
        content:
          "Join sandiego.com Insider for member pricing on hotels, cruises, tickets, rental cars, experiences, and more. From $19/mo. Annual just $149.",
      },
      { property: "og:title", content: "sandiego.com Insider — The Travel Club for America's Finest City" },
      {
        property: "og:description",
        content: "Member-only savings across the San Diego experiences locals book most. Try free for 7 days.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sandiego.com/insider" },
      {
        property: "og:image",
        content: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
      },
      {
        name: "twitter:image",
        content: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
      },
    ],
    links: [{ rel: "canonical", href: "https://sandiego.com/insider" }],
  }),
  component: InsiderPage,
});

type Tier = {
  id: "trial" | "explorer" | "premier" | "plus" | "elite";
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  badge?: string;
  highlighted?: boolean;
  features: string[];
  cta: string;
};

const TIERS: Tier[] = [
  {
    id: "trial",
    name: "Insider Trial",
    price: "Free",
    cadence: "7 days",
    tagline: "Browse member savings risk-free.",
    features: [
      "Preview member pricing on hotels & experiences",
      "Weekly Insider newsletter",
      "Cancel anytime — no card required",
    ],
    cta: "Start free trial",
  },
  {
    id: "explorer",
    name: "Explorer",
    price: "$19",
    cadence: "per month",
    tagline: "Pay-as-you-go member access.",
    features: [
      "All hotel & cruise discounts",
      "Member pricing on tickets & tours",
      "Rental car & flight savings",
      "Cancel anytime",
    ],
    cta: "Join Explorer",
  },
  {
    id: "premier",
    name: "Premier",
    price: "$149",
    cadence: "per year",
    tagline: "One hotel night = your annual membership.",
    badge: "Best Value",
    highlighted: true,
    features: [
      "Everything in Explorer",
      "Save $79 vs monthly",
      "Resort week access",
      "Members-only experiences & events",
      "Wine club enrollment",
      "Priority Concierge response",
    ],
    cta: "Join Premier",
  },
  {
    id: "plus",
    name: "Plus",
    price: "$49",
    cadence: "per month",
    tagline: "For frequent travelers and families.",
    features: [
      "Everything in Explorer",
      "Premium villa & resort week inventory",
      "Up to 4 traveler profiles",
      "Free guest passes (2/month)",
    ],
    cta: "Join Plus",
  },
  {
    id: "elite",
    name: "Elite",
    price: "$99",
    cadence: "per month",
    tagline: "White-glove access to every benefit.",
    features: [
      "Everything in Plus",
      "1:1 trip-planning concierge",
      "Early access to event tickets",
      "Founding-member pricing locked for life",
    ],
    cta: "Join Elite",
  },
];

const BENEFITS: { icon: typeof Hotel; title: string; copy: string; pillar?: string }[] = [
  { icon: Hotel, title: "Hotels", copy: "Member pricing across 200+ San Diego hotels and resorts.", pillar: "hotels" },
  { icon: Ship, title: "Cruises", copy: "Discounts on Hornblower, day cruises and harbor tours.", pillar: "cruises" },
  { icon: Ticket, title: "Tickets", copy: "Save on Padres, theater, attractions and live events.", pillar: "things-to-do" },
  { icon: Car, title: "Rental Cars", copy: "Negotiated rates with national and local agencies." },
  { icon: CalendarDays, title: "Resort Weeks", copy: "Curated weeklong resort getaways at insider rates." },
  { icon: Compass, title: "Experiences", copy: "Tours, tastings and activities chosen by locals.", pillar: "things-to-do" },
  { icon: ShoppingBag, title: "Retail", copy: "Member discounts at independent SD shops and brands.", pillar: "shopping" },
  { icon: Plane, title: "Flights", copy: "Travel-club pricing on getaways in and out of SAN." },
  { icon: HomeIcon, title: "Villas", copy: "Boutique villas in La Jolla, Coronado and beyond." },
  { icon: Wine, title: "Wine", copy: "Quarterly shipments from California's best small producers." },
];

const TESTIMONIALS = [
  { name: "Maria R.", quote: "Saved $180 on a hotel weekend in Coronado — paid for the whole year in one trip.", savings: "$180" },
  { name: "James P.", quote: "Booked a Hornblower sunset cruise for $42 less than the public rate. Took the whole family.", savings: "$240" },
  { name: "Aisha K.", quote: "The wine club alone is worth it. The hotel deals are a bonus.", savings: "$95/qtr" },
];

function TierSignupForm({ defaultTier }: { defaultTier: Tier["id"] }) {
  const [tier, setTier] = useState<Tier["id"]>(defaultTier);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = z
      .object({ email: z.string().trim().email().max(255), name: z.string().trim().max(100).optional() })
      .safeParse({ email, name: name || undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const { error: insertError } = await supabase.from("insider_signups").insert({
        email: parsed.data.email,
        name: parsed.data.name ?? null,
        tier,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold">You're on the list</h3>
        <p className="mt-2 text-sm text-foreground/70">
          We'll email you the moment Insider opens for paid signups. Founding-member pricing will be honored.
        </p>
      </div>
    );
  }

  return (
    <form id="signup" onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="eyebrow">Reserve your spot</div>
      <h3 className="mt-2 font-display text-2xl md:text-3xl font-semibold">
        Founding members get locked-in pricing.
      </h3>
      <p className="mt-2 text-sm text-foreground/70">
        Stripe checkout is rolling out shortly. Reserve your tier now and we'll send your invite first.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          autoComplete="name"
          maxLength={100}
          className="rounded-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          maxLength={255}
          className="rounded-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium text-foreground/70 mb-2">Choose your tier</legend>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition ${
                tier === t.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background text-foreground/75 hover:border-foreground/40"
              }`}
            >
              <input
                type="radio"
                name="tier"
                value={t.id}
                checked={tier === t.id}
                onChange={() => setTier(t.id)}
                className="sr-only"
              />
              {t.name} · {t.price}
              {t.cadence !== "" && t.id !== "trial" ? `/${t.cadence.replace("per ", "")}` : ""}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition disabled:opacity-60"
      >
        {loading ? "Reserving…" : "Reserve my Insider spot"} <ArrowRight className="h-4 w-4" />
      </button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  );
}

function InsiderPage() {
  const [selectedTier] = useState<Tier["id"]>("premier");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,theme(colors.teal-soft.DEFAULT/60%),transparent_60%)]" />
        <div className="relative container-page pt-20 pb-24 md:pt-28 md:pb-32 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <span className="eyebrow text-teal-soft">sandiego.com Insider</span>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold leading-[1.05]">
              Save like a local.<br />Travel like an Insider.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
              Member-only pricing on the hotels, cruises, experiences and getaways San Diego is
              actually known for. One annual membership pays for itself in a single weekend.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
              >
                See pricing <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#signup"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/20 transition"
              >
                Start free 7-day trial
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-primary-foreground/75">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-teal-soft text-teal-soft" /> 500+ founding members
              </span>
              <span>·</span>
              <span>Cancel anytime</span>
              <span>·</span>
              <span>30-day refund</span>
            </div>
          </div>

          {/* Lead magnet card */}
          <div>
            <EmailCapture
              source="insider_hero"
              title="Try Insider free for 7 days"
              subtitle="Get the 3-Day San Diego Insider Itinerary instantly — and a free trial of member pricing."
              cta="Start free trial"
            />
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="container-page mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow">What you unlock</div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
            Ten ways your membership pays for itself
          </h2>
          <p className="mt-3 text-foreground/70">
            Every benefit is negotiated directly with local San Diego operators and national partners
            we already trust.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map((b) => {
            const inner = (
              <>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-foreground/70">{b.copy}</p>
                {b.pillar && (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                    See member savings <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </>
            );
            return b.pillar ? (
              <Link
                key={b.title}
                to="/save-on/$pillar"
                params={{ pillar: b.pillar }}
                className="rounded-2xl border border-border bg-card p-5 hover:border-accent hover:shadow-lg transition"
              >
                {inner}
              </Link>
            ) : (
              <div key={b.title} className="rounded-2xl border border-border bg-card p-5 hover:shadow-lg transition">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-page mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow">Membership</div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
            One night of savings = your annual membership
          </h2>
          <p className="mt-3 text-foreground/70">
            Premier is our most popular plan. Pay annually and the membership pays for itself the
            first time you book a hotel.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={`relative rounded-3xl border p-6 flex flex-col ${
                t.highlighted
                  ? "border-accent bg-card shadow-2xl lg:scale-[1.03]"
                  : "border-border bg-card"
              }`}
            >
              {t.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                  {t.badge}
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">{t.price}</span>
                <span className="text-xs text-foreground/60">/{t.cadence}</span>
              </div>
              <p className="mt-2 text-sm text-foreground/70">{t.tagline}</p>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#signup"
                className={`mt-6 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  t.highlighted
                    ? "bg-accent text-accent-foreground hover:opacity-90"
                    : "border border-border bg-background hover:bg-secondary"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="container-page mt-24">
        <div className="rounded-3xl bg-secondary/40 border border-border p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="eyebrow">Member savings</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
              Real bookings. Real receipts.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl bg-card border border-border p-6">
                <Quote className="h-5 w-5 text-accent" />
                <blockquote className="mt-3 text-sm text-foreground/85 leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-medium">{t.name}</span>
                  <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 font-semibold">
                    Saved {t.savings}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Signup */}
      <section className="container-page mt-24 max-w-3xl">
        <TierSignupForm defaultTier={selectedTier} />
      </section>

      {/* Final CTA */}
      <section className="container-page mt-24 mb-24">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold max-w-2xl mx-auto">
            The travelers who know San Diego best already use Insider.
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Join 500+ founding members. 7-day free trial. Cancel anytime.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="#signup"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
            >
              Reserve my spot <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/20 transition"
            >
              Browse San Diego
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
