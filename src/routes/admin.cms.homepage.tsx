import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Send, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CmsImageUpload } from "@/components/admin/CmsImageUpload";

export const Route = createFileRoute("/admin/cms/homepage")({
  head: () => ({ meta: [{ title: "Homepage — Admin" }, { name: "robots", content: "noindex" }] }),
  component: HomepagePage,
});

type Section = {
  id: string;
  section_key: string;
  section_type: string;
  position: number;
  enabled: boolean;
  draft_content: Record<string, unknown>;
  published_content: Record<string, unknown> | null;
};

const FIELDS_BY_TYPE: Record<string, { name: string; label: string; type?: "text" | "textarea" | "image" }[]> = {
  hero: [
    { name: "eyebrow", label: "Eyebrow" },
    { name: "heading", label: "Heading" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "primary_cta_label", label: "Primary CTA label" },
    { name: "primary_cta_to", label: "Primary CTA link" },
    { name: "secondary_cta_label", label: "Secondary CTA label" },
    { name: "secondary_cta_to", label: "Secondary CTA link" },
    { name: "image_url", label: "Background image (optional override)", type: "image" },
  ],
  featured_listings: [
    { name: "eyebrow", label: "Eyebrow" },
    { name: "heading", label: "Heading" },
    { name: "cta_label", label: "CTA label" },
    { name: "cta_to", label: "CTA link" },
  ],
  editorial: [
    { name: "eyebrow", label: "Eyebrow" },
    { name: "heading", label: "Heading" },
    { name: "cta_label", label: "CTA label" },
    { name: "cta_to", label: "CTA link" },
  ],
  neighborhoods: [
    { name: "eyebrow", label: "Eyebrow" },
    { name: "heading", label: "Heading" },
  ],
  partner_cta: [
    { name: "eyebrow", label: "Eyebrow" },
    { name: "heading", label: "Heading" },
    { name: "body", label: "Body", type: "textarea" },
    { name: "cta_label", label: "CTA label" },
    { name: "cta_to", label: "CTA link" },
  ],
};

function HomepagePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("homepage_sections").select("*").order("position");
    setSections((data ?? []) as Section[]);
  };
  useEffect(() => { load(); }, []);

  const updateField = (id: string, name: string, value: unknown) => {
    setSections((p) => p.map((s) => (s.id === id ? { ...s, draft_content: { ...s.draft_content, [name]: value } } : s)));
  };
  const toggleEnabled = async (s: Section) => {
    await supabase.from("homepage_sections").update({ enabled: !s.enabled }).eq("id", s.id);
    await load();
  };
  const saveDraft = async (s: Section) => {
    setBusy(true); setMsg(null);
    await supabase.from("homepage_sections").update({ draft_content: s.draft_content as never }).eq("id", s.id);
    setBusy(false); setMsg(`Saved draft: ${s.section_key}`);
  };
  const publish = async (s: Section) => {
    setBusy(true); setMsg(null);
    await supabase.from("homepage_sections").update({ draft_content: s.draft_content as never, published_content: s.draft_content as never, published_at: new Date().toISOString() }).eq("id", s.id);
    await load();
    setBusy(false); setMsg(`Published: ${s.section_key}`);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">Homepage</h1>
        <p className="text-sm text-muted-foreground mt-1">Edit each section of the homepage. Disabled sections won't render.</p>
      </div>
      {msg && <div className="rounded-md bg-accent/10 text-accent text-sm px-3 py-2">{msg}</div>}
      {sections.map((s) => {
        const fields = FIELDS_BY_TYPE[s.section_type] || [];
        const dirty = JSON.stringify(s.draft_content) !== JSON.stringify(s.published_content || {});
        return (
          <section key={s.id} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg capitalize">{s.section_key.replace(/_/g, " ")}</h2>
                <p className="text-xs text-muted-foreground">Type: {s.section_type}</p>
              </div>
              <div className="flex items-center gap-2">
                {dirty && <span className="text-[10px] uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 font-semibold">Unpublished</span>}
                <button onClick={() => toggleEnabled(s)} className={`inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2.5 py-1 ${s.enabled ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                  {s.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {s.enabled ? "Enabled" : "Hidden"}
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {fields.map((f) => {
                const val = (s.draft_content?.[f.name] as string) || "";
                if (f.type === "image") return <CmsImageUpload key={f.name} value={val} onChange={(v) => updateField(s.id, f.name, v)} label={f.label} />;
                if (f.type === "textarea") return (
                  <div key={f.name}>
                    <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                    <textarea value={val} onChange={(e) => updateField(s.id, f.name, e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                  </div>
                );
                return (
                  <div key={f.name}>
                    <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                    <input value={val} onChange={(e) => updateField(s.id, f.name, e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => saveDraft(s)} disabled={busy} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary">
                <Save className="h-3.5 w-3.5" /> Save draft
              </button>
              <button onClick={() => publish(s)} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-xs font-semibold hover:opacity-90">
                <Send className="h-3.5 w-3.5" /> Publish
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
