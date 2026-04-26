import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";

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
}

const empty: ListingFormValues = {
  name: "", slug: "", category: "Restaurant", neighborhood: "",
  short_description: "", description: "", hero_image: "", address: "",
  phone: "", website: "", email: "", price_range: "", rating: "",
  tier: "free", status: "draft", meta_title: "", meta_description: "",
  reservation_url: "",
  is_sponsored: false, sponsor_name: "", sponsor_rank: "0", sponsor_until: "",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function ListingForm({ initial }: { initial?: Partial<ListingFormValues> }) {
  const navigate = useNavigate();
  const [v, setV] = useState<ListingFormValues>({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ListingFormValues>(key: K, val: ListingFormValues[K]) =>
    setV((p) => ({ ...p, [key]: val }));

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
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
        published_at: v.status === "published" ? new Date().toISOString() : null,
      };

      const res = v.id
        ? await supabase.from("listings").update(payload).eq("id", v.id)
        : await supabase.from("listings").insert(payload);

      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success(v.id ? "Listing updated" : "Listing created");
        navigate({ to: "/admin/listings" });
      }
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
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

      <div className="flex gap-3">
        <button type="submit" disabled={busy}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {busy ? "Saving…" : v.id ? "Save changes" : "Create listing"}
        </button>
        <button type="button" onClick={() => navigate({ to: "/admin/listings" })}
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
}
