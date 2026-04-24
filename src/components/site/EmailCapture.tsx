import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Please enter a valid email").max(255),
});

type Variant = "card" | "inline";

interface EmailCaptureProps {
  source: string;
  variant?: Variant;
  title?: string;
  subtitle?: string;
  cta?: string;
}

export function EmailCapture({
  source,
  variant = "card",
  title = "Get the Free 3-Day San Diego Insider Itinerary",
  subtitle = "The locals-only weekend plan: where to eat, where to stay, and the moments most visitors miss. Sent instantly.",
  cta = "Send me the guide",
}: EmailCaptureProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ name: name || undefined, email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const { error: insertError } = await supabase.from("email_leads").insert({
        email: parsed.data.email,
        name: parsed.data.name ?? null,
        source,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        user_agent: navigator.userAgent,
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
      <div
        className={
          variant === "card"
            ? "rounded-3xl border border-border bg-card p-8 md:p-10 text-center"
            : "rounded-2xl bg-secondary/60 p-6 text-center"
        }
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold">Check your inbox</h3>
        <p className="mt-2 text-sm text-foreground/70">
          Your 3-Day Insider Itinerary is on the way. Watch for an email from sandiego.com.
        </p>
      </div>
    );
  }

  const isCard = variant === "card";

  return (
    <div
      className={
        isCard
          ? "relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-10"
          : ""
      }
    >
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
            <p className="mt-3 text-sm md:text-base text-foreground/70 max-w-lg">{subtitle}</p>
          </div>
        </>
      )}

      <form
        onSubmit={onSubmit}
        className={`${isCard ? "relative mt-6" : ""} grid gap-3 sm:grid-cols-[1fr,1fr,auto]`}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name (optional)"
          autoComplete="given-name"
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
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "Sending…" : cta} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <p className={`${isCard ? "relative" : ""} mt-3 text-xs text-foreground/55`}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
