import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type CruiseLineFormValues = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  hero_image: string;
  logo_letter: string;
  booking_url: string;
  home_port: string;
  ships_from_sd: string[];
  typical_itineraries: string[];
  best_for: string;
  seasonality: string;
  price_from: string;
  description: string;
  highlights: { title: string; body: string }[];
  meta_title: string;
  meta_description: string;
  position: number;
  enabled: boolean;
};

export const emptyCruiseLine: CruiseLineFormValues = {
  slug: "",
  name: "",
  tagline: "",
  hero_image: "",
  logo_letter: "",
  booking_url: "",
  home_port: "",
  ships_from_sd: [],
  typical_itineraries: [],
  best_for: "",
  seasonality: "",
  price_from: "",
  description: "",
  highlights: [],
  meta_title: "",
  meta_description: "",
  position: 0,
  enabled: true,
};

export function CruiseLineForm({ initial }: { initial: CruiseLineFormValues }) {
  const navigate = useNavigate();
  const [v, setV] = useState<CruiseLineFormValues>(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof CruiseLineFormValues>(k: K, val: CruiseLineFormValues[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  const save = async () => {
    if (!v.slug || !v.name) {
      toast.error("Slug and name are required");
      return;
    }
    setSaving(true);
    const payload = { ...v };
    delete (payload as { id?: string }).id;
    const res = v.id
      ? await supabase.from("cruise_lines").update(payload).eq("id", v.id)
      : await supabase.from("cruise_lines").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved");
    navigate({ to: "/admin/cruises" });
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <input className={inputCls} value={v.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Slug (URL)">
          <input
            className={inputCls}
            value={v.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          />
        </Field>
      </div>

      <Field label="Tagline (card subtitle)">
        <input className={inputCls} value={v.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </Field>

      <Field label="Hero image URL">
        <input className={inputCls} value={v.hero_image} onChange={(e) => set("hero_image", e.target.value)} />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Logo letter">
          <input className={inputCls} value={v.logo_letter} onChange={(e) => set("logo_letter", e.target.value)} />
        </Field>
        <Field label="Price from">
          <input className={inputCls} value={v.price_from} onChange={(e) => set("price_from", e.target.value)} />
        </Field>
        <Field label="Position">
          <input
            type="number"
            className={inputCls}
            value={v.position}
            onChange={(e) => set("position", Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Booking URL">
        <input className={inputCls} value={v.booking_url} onChange={(e) => set("booking_url", e.target.value)} />
      </Field>

      <Field label="Home port">
        <input className={inputCls} value={v.home_port} onChange={(e) => set("home_port", e.target.value)} />
      </Field>

      <Field label="Best for">
        <input className={inputCls} value={v.best_for} onChange={(e) => set("best_for", e.target.value)} />
      </Field>

      <Field label="Seasonality">
        <input className={inputCls} value={v.seasonality} onChange={(e) => set("seasonality", e.target.value)} />
      </Field>

      <Field label="Ships sailing from SD (one per line)">
        <textarea
          rows={3}
          className={inputCls}
          value={v.ships_from_sd.join("\n")}
          onChange={(e) => set("ships_from_sd", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
        />
      </Field>

      <Field label="Typical itineraries (one per line)">
        <textarea
          rows={4}
          className={inputCls}
          value={v.typical_itineraries.join("\n")}
          onChange={(e) =>
            set("typical_itineraries", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))
          }
        />
      </Field>

      <Field label="Description (intro paragraph)">
        <textarea
          rows={5}
          className={inputCls}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div>
        <div className="text-sm font-medium mb-2">Highlights (insider notes)</div>
        <div className="space-y-3">
          {v.highlights.map((h, i) => (
            <div key={i} className="rounded-xl border border-border p-3 space-y-2">
              <input
                placeholder="Title"
                className={inputCls}
                value={h.title}
                onChange={(e) => {
                  const next = [...v.highlights];
                  next[i] = { ...h, title: e.target.value };
                  set("highlights", next);
                }}
              />
              <textarea
                rows={2}
                placeholder="Body"
                className={inputCls}
                value={h.body}
                onChange={(e) => {
                  const next = [...v.highlights];
                  next[i] = { ...h, body: e.target.value };
                  set("highlights", next);
                }}
              />
              <button
                type="button"
                className="text-xs text-destructive"
                onClick={() => set("highlights", v.highlights.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("highlights", [...v.highlights, { title: "", body: "" }])}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            + Add highlight
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Meta title (SEO)">
          <input className={inputCls} value={v.meta_title} onChange={(e) => set("meta_title", e.target.value)} />
        </Field>
        <Field label="Meta description (SEO)">
          <input
            className={inputCls}
            value={v.meta_description}
            onChange={(e) => set("meta_description", e.target.value)}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={v.enabled}
          onChange={(e) => set("enabled", e.target.checked)}
        />
        Enabled (visible on the site)
      </label>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => navigate({ to: "/admin/cruises" })}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1.5">{label}</div>
      {children}
    </label>
  );
}
