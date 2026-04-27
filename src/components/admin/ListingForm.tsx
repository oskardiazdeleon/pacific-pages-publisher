import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Megaphone, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { generateEditorialContext } from "@/utils/import.functions";

export interface PartnerSpotlightValues {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
}

export interface ListingFormValues {
  id?: string;
  name: string;
  slug: string;
  category: "Restaurant" | "Hotel" | "Attraction" | "Tour" | "Shopping" | "Nightlife";
  neighborhood: string;
  short_description: string;
  description: string;
  hero_image: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  price_range: string;
  rating: string;
  tier: "free" | "featured" | "premium";
  status: "draft" | "published" | "archived";
  meta_title: string;
  meta_description: string;
  reservation_url: string;
  is_sponsored: boolean;
  sponsor_name: string;
  sponsor_rank: string;
  sponsor_until: string;
  partner_spotlight: PartnerSpotlightValues;
  editor_note: string;
  why_we_picked_it: string; // comma-separated in form, split on save
  insider_tip: string;
  best_time_to_visit: string;
  local_context: string;
  source_url: string;
  verified_visited: boolean;
}

const emptySpotlight: PartnerSpotlightValues = {
  enabled: false,
  eyebrow: "Partner Spotlight",
  title: "",
  description: "",
  image_url: "",
  cta_label: "Learn more",
  cta_url: "",
};

const empty: ListingFormValues = {
  name: "", slug: "", category: "Restaurant", neighborhood: "",
  short_description: "", description: "", hero_image: "", address: "",
  phone: "", website: "", email: "", price_range: "", rating: "",
  tier: "free", status: "draft", meta_title: "", meta_description: "",
  reservation_url: "",
  is_sponsored: false, sponsor_name: "", sponsor_rank: "0", sponsor_until: "",
  partner_spotlight: { ...emptySpotlight },
  editor_note: "", why_we_picked_it: "", insider_tip: "",
  best_time_to_visit: "", local_context: "", source_url: "",
  verified_visited: false,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function ListingForm({
  initial,
  partnerMode = false,
}: {
  initial?: Partial<ListingFormValues>;
  /** When true, only the Partner Spotlight section is editable (for /partner dashboard). */
  partnerMode?: boolean;
}) {
  const navigate = useNavigate();
  const [v, setV] = useState<ListingFormValues>({
    ...empty,
    ...initial,
    partner_spotlight: { ...emptySpotlight, ...(initial?.partner_spotlight ?? {}) },
  });
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ListingFormValues>(key: K, val: ListingFormValues[K]) =>
    setV((p) => ({ ...p, [key]: val }));

  const setSpot = <K extends keyof PartnerSpotlightValues>(
    key: K,
    val: PartnerSpotlightValues[K],
  ) => setV((p) => ({ ...p, partner_spotlight: { ...p.partner_spotlight, [key]: val } }));

  const tierAllowsSpotlight = v.tier === "featured" || v.tier === "premium";

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Build the spotlight payload — only persist when enabled AND tier allows
      const spotlightPayload =
        v.partner_spotlight.enabled && tierAllowsSpotlight
          ? {
              enabled: true,
              eyebrow: v.partner_spotlight.eyebrow.trim() || "Partner Spotlight",
              title: v.partner_spotlight.title.trim(),
              description: v.partner_spotlight.description.trim(),
              image_url: v.partner_spotlight.image_url.trim(),
              cta_label: v.partner_spotlight.cta_label.trim() || "Learn more",
              cta_url: v.partner_spotlight.cta_url.trim(),
            }
          : null;

      // Partner mode: only update the spotlight column (and updated_at via trigger).
      if (partnerMode) {
        if (!v.id) {
          toast.error("Missing listing id");
          return;
        }
        const res = await supabase
          .from("listings")
          .update({ partner_spotlight: spotlightPayload })
          .eq("id", v.id);
        if (res.error) {
          toast.error(res.error.message);
        } else {
          toast.success("Spotlight saved");
        }
        return;
      }

      const payload = {
        name: v.name,
        slug: v.slug || slugify(v.name),
        category: v.category,
        neighborhood: v.neighborhood,
        short_description: v.short_description || null,
        description: v.description || null,
        hero_image: v.hero_image || null,
        address: v.address || null,
        phone: v.phone || null,
        website: v.website || null,
        email: v.email || null,
        price_range: v.price_range || null,
        rating: v.rating ? parseFloat(v.rating) : null,
        tier: v.tier,
        status: v.status,
        meta_title: v.meta_title || null,
        meta_description: v.meta_description || null,
        reservation_url: v.reservation_url || null,
        is_sponsored: v.is_sponsored,
        sponsor_name: v.sponsor_name || null,
        sponsor_rank: v.sponsor_rank ? parseInt(v.sponsor_rank, 10) || 0 : 0,
        sponsor_until: v.sponsor_until ? new Date(v.sponsor_until).toISOString() : null,
        partner_spotlight: spotlightPayload,
        published_at: v.status === "published" ? new Date().toISOString() : null,
        editor_note: v.editor_note.trim() || null,
        why_we_picked_it: v.why_we_picked_it
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 6),
        insider_tip: v.insider_tip.trim() || null,
        best_time_to_visit: v.best_time_to_visit.trim() || null,
        local_context: v.local_context.trim() || null,
        source_url: v.source_url.trim() || null,
        verified_visited: v.verified_visited,
        verified_at: v.verified_visited ? new Date().toISOString() : null,
      };

      const res = v.id
        ? await supabase.from("listings").update(payload).eq("id", v.id)
        : await supabase.from("listings").insert(payload);

      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success(v.id ? "Listing updated" : "Listing created");
        if (!partnerMode) navigate({ to: "/admin/listings" });
      }
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      {!partnerMode && (
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Basics</h2>
        <Field label="Name">
          <input className={inputCls} required value={v.name}
            onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Slug (URL)">
          <input className={inputCls} value={v.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder={v.name ? slugify(v.name) : "auto-generated"} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Category">
            <select className={inputCls} value={v.category}
              onChange={(e) => set("category", e.target.value as ListingFormValues["category"])}>
              {["Restaurant", "Hotel", "Attraction", "Tour", "Shopping", "Nightlife"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Neighborhood">
            <input className={inputCls} required value={v.neighborhood}
              onChange={(e) => set("neighborhood", e.target.value)} />
          </Field>
        </div>
        <Field label="Short description (1 sentence)">
          <input className={inputCls} value={v.short_description}
            onChange={(e) => set("short_description", e.target.value)} />
        </Field>
        <Field label="Full description">
          <textarea className={inputCls + " min-h-32"} value={v.description}
            onChange={(e) => set("description", e.target.value)} />
        </Field>
        <ImageUpload
          label="Hero image"
          bucket="listing-media"
          folder={v.slug || "uploads"}
          value={v.hero_image}
          onChange={(url) => set("hero_image", url)}
        />
      </section>
      )}

      {!partnerMode && (
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Contact</h2>
        <Field label="Address">
          <input className={inputCls} value={v.address}
            onChange={(e) => set("address", e.target.value)} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <input className={inputCls} value={v.phone}
              onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={v.email}
              onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>
        <Field label="Website">
          <input className={inputCls} value={v.website}
            onChange={(e) => set("website", e.target.value)} />
        </Field>
        <Field label="Reservation / booking URL (OpenTable, Resy, Tock, etc.)">
          <input
            className={inputCls}
            value={v.reservation_url}
            placeholder="https://www.opentable.com/r/..."
            onChange={(e) => set("reservation_url", e.target.value)}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Price range (e.g. $$)">
            <input className={inputCls} value={v.price_range}
              onChange={(e) => set("price_range", e.target.value)} />
          </Field>
          <Field label="Rating (0–5)">
            <input className={inputCls} type="number" step="0.1" min="0" max="5"
              value={v.rating} onChange={(e) => set("rating", e.target.value)} />
          </Field>
        </div>
      </section>
      )}

      {!partnerMode && (
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Visibility & SEO</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tier">
            <select className={inputCls} value={v.tier}
              onChange={(e) => set("tier", e.target.value as ListingFormValues["tier"])}>
              <option value="free">Free</option>
              <option value="featured">Featured</option>
              <option value="premium">Premium</option>
            </select>
          </Field>
          <Field label="Status">
            <select className={inputCls} value={v.status}
              onChange={(e) => set("status", e.target.value as ListingFormValues["status"])}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>
        <Field label="Meta title (SEO)">
          <input className={inputCls} maxLength={70} value={v.meta_title}
            onChange={(e) => set("meta_title", e.target.value)} />
        </Field>
        <Field label="Meta description (SEO)">
          <textarea className={inputCls} maxLength={170} value={v.meta_description}
            onChange={(e) => set("meta_description", e.target.value)} />
        </Field>
      </section>
      )}

      {!partnerMode && (
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Promotion</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Boost this listing to the top of category and neighborhood feeds. A
              "Sponsored" badge appears on the card.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={v.is_sponsored}
              onChange={(e) => set("is_sponsored", e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm font-medium">Promote</span>
          </label>
        </div>

        {v.is_sponsored && (
          <>
            <Field label="Sponsor name (optional — shown on the card)">
              <input
                className={inputCls}
                value={v.sponsor_name}
                placeholder="e.g. Visit Carlsbad"
                onChange={(e) => set("sponsor_name", e.target.value)}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Boost rank (higher = appears first)">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="1"
                  value={v.sponsor_rank}
                  onChange={(e) => set("sponsor_rank", e.target.value)}
                />
              </Field>
              <Field label="Promotion ends (optional)">
                <input
                  className={inputCls}
                  type="datetime-local"
                  value={v.sponsor_until}
                  onChange={(e) => set("sponsor_until", e.target.value)}
                />
              </Field>
            </div>
          </>
        )}
      </section>
      )}

      {!partnerMode && (
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Editorial context</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Proprietary editorial detail that differentiates this listing from the source. Required for publishing.
          </p>
        </div>
        <Field label="Editor's note (1–2 sentences shown above the description)">
          <textarea className={inputCls + " min-h-20"} value={v.editor_note}
            onChange={(e) => set("editor_note", e.target.value)}
            placeholder="What makes this place worth a visit, in our voice." />
        </Field>
        <Field label="Why we picked it (comma-separated, up to 6 chips)">
          <input className={inputCls} value={v.why_we_picked_it}
            onChange={(e) => set("why_we_picked_it", e.target.value)}
            placeholder="ocean view, walk-in friendly, great for groups" />
        </Field>
        <Field label="Insider tip">
          <textarea className={inputCls + " min-h-20"} value={v.insider_tip}
            onChange={(e) => set("insider_tip", e.target.value)}
            placeholder="Sit at the bar — same menu, no wait." />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Best time to visit">
            <input className={inputCls} value={v.best_time_to_visit}
              onChange={(e) => set("best_time_to_visit", e.target.value)}
              placeholder="Weekday lunch" />
          </Field>
          <Field label="Source URL (provenance)">
            <input className={inputCls} type="url" value={v.source_url}
              onChange={(e) => set("source_url", e.target.value)}
              placeholder="https://..." />
          </Field>
        </div>
        <Field label="Local context (1–2 sentences referencing the neighborhood)">
          <textarea className={inputCls + " min-h-20"} value={v.local_context}
            onChange={(e) => set("local_context", e.target.value)}
            placeholder="In Little Italy, this sits two blocks from Piazza della Famiglia…" />
        </Field>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={v.verified_visited}
            onChange={(e) => set("verified_visited", e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-sm font-medium">Mark as verified visited</span>
        </label>
      </section>
      )}

      {/* Partner Spotlight — featured/premium tier perk */}
      <section className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-card to-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-accent" />
              Partner Spotlight
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {tierAllowsSpotlight
                ? "Promote a special offer, product, or experience. Shown in the sidebar of the listing page."
                : "Available on Featured and Premium tier listings only. Upgrade the tier to enable."}
            </p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={v.partner_spotlight.enabled}
              disabled={!tierAllowsSpotlight}
              onChange={(e) => setSpot("enabled", e.target.checked)}
              className="h-4 w-4 accent-accent disabled:opacity-50"
            />
            <span className="text-sm font-medium">Enable</span>
          </label>
        </div>

        {v.partner_spotlight.enabled && tierAllowsSpotlight && (
          <>
            <Field label="Eyebrow (small label above the title)">
              <input
                className={inputCls}
                value={v.partner_spotlight.eyebrow}
                placeholder="Partner Spotlight"
                onChange={(e) => setSpot("eyebrow", e.target.value)}
              />
            </Field>
            <Field label="Title">
              <input
                className={inputCls}
                value={v.partner_spotlight.title}
                placeholder="e.g. The Country Club at Maderas"
                onChange={(e) => setSpot("title", e.target.value)}
              />
            </Field>
            <Field label="Description">
              <textarea
                className={inputCls + " min-h-24"}
                value={v.partner_spotlight.description}
                placeholder="One or two sentences about what you're promoting."
                onChange={(e) => setSpot("description", e.target.value)}
              />
            </Field>
            <ImageUpload
              label="Spotlight image (optional)"
              bucket="listing-media"
              folder={`${v.slug || "spotlight"}/spotlight`}
              value={v.partner_spotlight.image_url}
              onChange={(url) => setSpot("image_url", url)}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Button label">
                <input
                  className={inputCls}
                  value={v.partner_spotlight.cta_label}
                  placeholder="Learn more"
                  onChange={(e) => setSpot("cta_label", e.target.value)}
                />
              </Field>
              <Field label="Button link (URL)">
                <input
                  className={inputCls}
                  type="url"
                  value={v.partner_spotlight.cta_url}
                  placeholder="https://..."
                  onChange={(e) => setSpot("cta_url", e.target.value)}
                />
              </Field>
            </div>
          </>
        )}
      </section>

      <div className="flex gap-3">
        <button type="submit" disabled={busy}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {busy ? "Saving…" : partnerMode ? "Save spotlight" : v.id ? "Save changes" : "Create listing"}
        </button>
        {!partnerMode && (
          <button type="button" onClick={() => navigate({ to: "/admin/listings" })}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
