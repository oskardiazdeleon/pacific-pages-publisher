import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  guest_count: z.string().optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export function VenueInquiryForm({
  listingId,
  venueName,
}: {
  listingId: string;
  venueName: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("venue_inquiries").insert({
      listing_id: listingId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      event_date: parsed.data.event_date || null,
      guest_count: parsed.data.guest_count ? Number(parsed.data.guest_count) : null,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-accent/40 bg-accent/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
        <h3 className="mt-3 font-display text-xl font-semibold">Request sent!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {venueName} will reach out to you shortly with pricing and availability.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-card p-6 grid gap-4 sm:grid-cols-2"
    >
      <Field label="Your name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone (optional)" name="phone" type="tel" />
      <Field label="Estimated event date" name="event_date" type="date" />
      <Field label="Guest count" name="guest_count" type="number" min={1} max={5000} />
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tell us about your wedding
        </label>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Vision, must-haves, vendors you're working with…"
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Request pricing
        </button>
        <p className="text-xs text-muted-foreground">
          We'll share your details with {venueName} only.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
    </div>
  );
}
