import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CmsImageUpload } from "@/components/admin/CmsImageUpload";

export const Route = createFileRoute("/admin/cms/settings")({
  head: () => ({ meta: [{ title: "Site Settings — Admin" }, { name: "robots", content: "noindex" }] }),
  component: SiteSettingsPage,
});

type Row = { id: string; key: string; draft_value: Record<string, string>; published_value: Record<string, string> | null };

const SECTIONS: { key: string; title: string; fields: { name: string; label: string; type?: "text" | "textarea" | "image" | "url" }[] }[] = [
  {
    key: "brand",
    title: "Brand",
    fields: [
      { name: "site_name", label: "Site name" },
      { name: "tagline", label: "Tagline" },
      { name: "logo_url", label: "Logo image", type: "image" },
      { name: "footer_tagline", label: "Footer tagline", type: "textarea" },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    fields: [
      { name: "address", label: "Mailing address" },
      { name: "phone", label: "Phone (display)" },
      { name: "phone_href", label: "Phone link (tel:…)" },
      { name: "email", label: "Email" },
    ],
  },
  {
    key: "social",
    title: "Social Links",
    fields: [
      { name: "facebook", label: "Facebook URL", type: "url" },
      { name: "instagram", label: "Instagram URL", type: "url" },
      { name: "twitter", label: "Twitter / X URL", type: "url" },
    ],
  },
  {
    key: "footer_legal",
    title: "Footer Legal",
    fields: [
      { name: "copyright", label: "Copyright line" },
      { name: "right_text", label: "Right-side text" },
    ],
  },
];

function SiteSettingsPage() {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, Row> = {};
    for (const r of (data ?? []) as Row[]) map[r.key] = r;
    setRows(map);
  };
  useEffect(() => { load(); }, []);

  const update = (key: string, field: string, value: string) => {
    setRows((p) => ({ ...p, [key]: { ...p[key], draft_value: { ...(p[key]?.draft_value || {}), [field]: value } } }));
  };

  const saveDraft = async (key: string) => {
    setBusy(true); setMsg(null);
    const r = rows[key];
    await supabase.from("site_settings").update({ draft_value: r.draft_value }).eq("id", r.id);
    setBusy(false); setMsg(`Draft saved: ${key}`);
  };

  const publish = async (key: string) => {
    setBusy(true); setMsg(null);
    const r = rows[key];
    await supabase.from("site_settings").update({ draft_value: r.draft_value, published_value: r.draft_value, published_at: new Date().toISOString() }).eq("id", r.id);
    await load();
    setBusy(false); setMsg(`Published: ${key}`);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Global brand info, contact details, and footer.</p>
      </div>
      {msg && <div className="rounded-md bg-accent/10 text-accent text-sm px-3 py-2">{msg}</div>}
      {SECTIONS.map((sec) => {
        const r = rows[sec.key];
        if (!r) return null;
        const dirty = JSON.stringify(r.draft_value) !== JSON.stringify(r.published_value || {});
        return (
          <section key={sec.key} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{sec.title}</h2>
              {dirty && <span className="text-[10px] uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 font-semibold">Unpublished changes</span>}
            </div>
            <div className="grid gap-4">
              {sec.fields.map((f) => {
                const val = (r.draft_value?.[f.name] as string) || "";
                if (f.type === "image") return <CmsImageUpload key={f.name} value={val} onChange={(v) => update(sec.key, f.name, v)} label={f.label} />;
                if (f.type === "textarea") return (
                  <div key={f.name}>
                    <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                    <textarea value={val} onChange={(e) => update(sec.key, f.name, e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                  </div>
                );
                return (
                  <div key={f.name}>
                    <label className="text-xs font-medium text-foreground/70">{f.label}</label>
                    <input type={f.type === "url" ? "url" : "text"} value={val} onChange={(e) => update(sec.key, f.name, e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => saveDraft(sec.key)} disabled={busy} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary">
                <Save className="h-3.5 w-3.5" /> Save draft
              </button>
              <button onClick={() => publish(sec.key)} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-xs font-semibold hover:opacity-90">
                <Send className="h-3.5 w-3.5" /> Publish
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
