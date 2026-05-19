import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { readIncomingUTMs } from "@/lib/utm";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
});

type Variant = "card" | "inline" | "sidebar";

interface EmailCaptureProps {
  source: string;
  variant?: Variant;
  title?: string;
  subtitle?: string;
  cta?: string;
}

// Configurable lead-capture endpoint (MailerLite / ConvertKit / etc.).
// Leave the env var unset in dev — the form still persists to Supabase
// `email_leads` as a reliable backup of every signup.
const CAPTURE_ENDPOINT =
  (import.meta.env.VITE_EMAIL_CAPTURE_ENDPOINT as string | undefined) ||
  "https://example.com/replace-with-mailerlite-or-convertkit-endpoint";
const ENDPOINT_CONFIGURED = !CAPTURE_ENDPOINT.includes("replace-with-");

function fireGtagSignup(source: string) {
  if (typeof window === "undefined") return;
  // GA4 conversion event — gtag is loaded by GA tag if present.
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", "lead_magnet_signup", { source });
  }
}

export function EmailCapture({
  source,
  variant = "card",
  title = "Get the Free 3-Day San Diego Insider Itinerary",
  subtitle = "The locals-only weekend plan: where to eat, where to stay, and the moments most visitors miss. Sent instantly.",
  cta = "Send me the guide",
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot — bots fill this
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Honeypot: silently accept but do nothing on the backend.
    if (hp.trim().length > 0) {
      setDone(true);
      return;
    }

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const utms = readIncomingUTMs();
      const payload = {
        email: parsed.data.email,
        source,
        utm_source: utms.utm_source ?? null,
        utm_medium: utms.utm_medium ?? null,
        utm_campaign: utms.utm_campaign ?? null,
      };

      // Primary: POST to the configured ESP endpoint (when set).
      if (ENDPOINT_CONFIGURED) {
        const res = await fetch(CAPTURE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Capture endpoint ${res.status}`);
      }

      // Backup: always persist to Supabase so we own the list.
      const { error: insertError } = await supabase.from("email_leads").insert({
        email: payload.email,
        source: payload.source,
        utm_source: payload.utm_source,
        utm_medium: payload.utm_medium,
        utm_campaign: payload.utm_campaign,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      if (insertError && !ENDPOINT_CONFIGURED) throw insertError;

      fireGtagSignup(source);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isCard = variant === "card";
  const isSidebar = variant === "sidebar";

  if (done) {
    return (
      <div
        className={
          isCard
            ? "rounded-3xl border border-border bg-card p-8 md:p-10 text-center"
            : "rounded-2xl bg-secondary/60 p-6 text-center"
        }
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-xl md:text-2xl font-semibold">
          Check your inbox — the guide is on its way.
        </h3>
        <p className="mt-2 text-sm text-foreground/70">
          Watch for an email from sandiego.com.
        </p>
      </div>
    );
  }

  const wrapperClass = isCard
    ? "relative overflow-hidden rounded-3xl border border-border bg-card text-foreground p-8 md:p-10"
    : isSidebar
      ? "rounded-2xl border border-border bg-card text-foreground p-5"
      : "rounded-2xl border border-border bg-card text-foreground p-6 md:p-7";

  return (
    <div className={wrapperClass}>
      {isCard && (
        <>
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <div className="eyebrow flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Free guide
            </div>
            <h3 className="mt-2 font-display text-2xl md:text-3xl font-semibold max-w-xl">
              {title}
            </h3>
            <p className="mt-3 text-sm md:text-base text-foreground/70 max-w-lg">
              {subtitle}
            </p>
          </div>
        </>
      )}

      {!isCard && (
        <div>
          <div className="eyebrow flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Free guide
          </div>
          <h3 className="mt-2 font-display text-lg md:text-xl font-semibold">{title}</h3>
          {!isSidebar && <p className="mt-2 text-sm text-foreground/70">{subtitle}</p>}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={`${isCard ? "relative mt-6" : "mt-4"} grid gap-3 ${
          isSidebar ? "" : "sm:grid-cols-[1fr,auto]"
        }`}
      >
        {/* Honeypot — visually hidden, off-screen; real users never fill this */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          aria-hidden="true"
          name="website"
          className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
        />

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          maxLength={255}
          aria-label="Email address"
          className="min-h-12 rounded-full border border-border bg-background px-5 text-base focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "Sending…" : cta} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className={`${isCard ? "relative" : ""} mt-3 text-xs text-foreground/55`}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
