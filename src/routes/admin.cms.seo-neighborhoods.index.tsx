import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Trash2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_HUBS } from "@/lib/listing-categories";

export const Route = createFileRoute("/admin/cms/seo-neighborhoods/")({
  head: () => ({
    meta: [
      { title: "Neighborhoods — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SeoNeighborhoodsAdmin,
});

type Row = {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  description: string | null;
  categories: string[];
  lat: number | null;
  lng: number | null;
  position: number;
  enabled: boolean;
};

const EMPTY: Omit<Row, "id"> = {
  slug: "",
  name: "",
  blurb: "",
  description: "",
  categories: [],
  lat: null,
  lng: null,
  position: 100,
  enabled: true,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function SeoNeighborhoodsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | (Omit<Row, "id"> & { id?: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editing && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editing]);

  const load = async () => {
    const { data } = await supabase
      .from("seo_neighborhoods")
      .select("*")
      .order("position", { ascending: true });
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    setErr(null);
    if (!editing.name.trim()) {
      setErr("Name is required.");
      return;
    }
    const slug = editing.slug.trim() || slugify(editing.name);
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setErr("Slug must be lowercase letters, numbers, and hyphens only.");
      return;
    }
    setBusy(true);
    const payload = {
      slug,
      name: editing.name.trim(),
      blurb: editing.blurb || null,
      description: editing.description || null,
      categories: editing.categories,
      lat: editing.lat,
      lng: editing.lng,
      position: editing.position,
      enabled: editing.enabled,
    };
    const { error } = "id" in editing && editing.id
      ? await supabase.from("seo_neighborhoods").update(payload).eq("id", editing.id)
      : await supabase.from("seo_neighborhoods").insert(payload);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setEditing(null);
    await load();
    queryClient.invalidateQueries({ queryKey: ["seo-neighborhoods"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this neighborhood? Listings tagged with it will keep their tag, but it will disappear from picklists.")) return;
    const { error } = await supabase.from("seo_neighborhoods").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    await load();
    queryClient.invalidateQueries({ queryKey: ["seo-neighborhoods"] });
  };


  const toggleCategory = (cat: string) => {
    if (!editing) return;
    const next = editing.categories.includes(cat)
      ? editing.categories.filter((c) => c !== cat)
      : [...editing.categories, cat];
    setEditing({ ...editing, categories: next });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Neighborhoods</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            The master list of neighborhoods used across the site — picklists, listing tags, the
            SEO <code>/[category]/in/[neighborhood]</code> pages, and the sitemap. Add as many as
            you like.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> New neighborhood
        </button>
      </div>

      {editing && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {"id" in editing && editing.id ? "Edit neighborhood" : "New neighborhood"}
            </h2>
            <button
              onClick={() => setEditing(null)}
              className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Name *</span>
              <input
                value={editing.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditing({
                    ...editing,
                    name,
                    slug:
                      !("id" in editing && editing.id) && !editing.slug
                        ? slugify(name)
                        : editing.slug,
                  });
                }}
                placeholder="North Park"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">URL slug *</span>
              <input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="north-park"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Short blurb (1 line, used on cards)
            </span>
            <input
              value={editing.blurb ?? ""}
              onChange={(e) => setEditing({ ...editing, blurb: e.target.value })}
              placeholder="Craft beer, indie shops, and muralled streets."
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Description (2-3 sentences, used as default intro on the SEO page)
            </span>
            <textarea
              value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={4}
              placeholder="North Park is San Diego's hippest urban neighborhood…"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Show in these category hubs
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_HUBS.map((h) => {
                const active = editing.categories.includes(h.slug);
                return (
                  <button
                    key={h.slug}
                    type="button"
                    onClick={() => toggleCategory(h.slug)}
                    className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                      active
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-background border-border text-foreground/75 hover:bg-secondary"
                    }`}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Latitude</span>
              <input
                type="number"
                step="0.0001"
                value={editing.lat ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, lat: e.target.value === "" ? null : Number(e.target.value) })
                }
                placeholder="32.7475"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Longitude</span>
              <input
                type="number"
                step="0.0001"
                value={editing.lng ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, lng: e.target.value === "" ? null : Number(e.target.value) })
                }
                placeholder="-117.1297"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Sort position</span>
              <input
                type="number"
                value={editing.position}
                onChange={(e) =>
                  setEditing({ ...editing, position: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.enabled}
              onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
            />
            Enabled (visible across the site)
          </label>

          {err && <p className="text-xs text-destructive">{err}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-sm font-semibold"
            >
              <Save className="h-4 w-4" /> {busy ? "Saving…" : "Save neighborhood"}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-left px-4 py-3">Categories</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{r.slug}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {r.categories.length === 0 ? "—" : r.categories.join(", ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold ${
                      r.enabled
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.enabled ? "Live" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => setEditing(r)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-secondary"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No neighborhoods yet. Click "New neighborhood" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
