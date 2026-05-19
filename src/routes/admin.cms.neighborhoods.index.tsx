import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit3, ExternalLink, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSeoNeighborhoods } from "@/lib/use-seo-neighborhoods";
import { CATEGORY_HUBS } from "@/lib/listing-categories";

export const Route = createFileRoute("/admin/cms/neighborhoods/")({
  head: () => ({
    meta: [
      { title: "Neighborhood Pages — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NeighborhoodPagesIndex,
});

type Row = {
  id: string;
  category_slug: string;
  neighborhood_slug: string;
  neighborhood_name: string;
  title: string | null;
  status: string;
  updated_at: string;
};

function NeighborhoodPagesIndex() {
  const [rows, setRows] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [category, setCategory] = useState<string>(CATEGORY_HUBS[0]?.slug ?? "hotels");
  const [neighborhood, setNeighborhood] = useState<string>(SEO_NEIGHBORHOODS[0]?.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("neighborhood_pages")
      .select("id, category_slug, neighborhood_slug, neighborhood_name, title, status, updated_at")
      .order("updated_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setErr(null);
    const hood = SEO_NEIGHBORHOODS.find((n) => n.slug === neighborhood);
    if (!hood) {
      setErr("Pick a neighborhood.");
      return;
    }
    setBusy(true);
    const exists = rows.find(
      (r) => r.category_slug === category && r.neighborhood_slug === neighborhood,
    );
    if (exists) {
      setBusy(false);
      setErr("That category + neighborhood combo already exists.");
      return;
    }
    const { error } = await supabase.from("neighborhood_pages").insert({
      category_slug: category,
      neighborhood_slug: neighborhood,
      neighborhood_name: hood.name,
      title: null,
      intro: null,
      insider_tip: null,
      status: "draft",
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setCreating(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this neighborhood page override?")) return;
    await supabase.from("neighborhood_pages").delete().eq("id", id);
    await load();
  };

  // Coverage matrix — show which combos still don't have an editorial override
  const missing = SEO_NEIGHBORHOODS.flatMap((n) =>
    n.categories.map((c) => ({
      category_slug: c,
      neighborhood_slug: n.slug,
      neighborhood_name: n.name,
    })),
  ).filter(
    (combo) =>
      !rows.some(
        (r) =>
          r.category_slug === combo.category_slug &&
          r.neighborhood_slug === combo.neighborhood_slug,
      ),
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Neighborhood Pages</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Editorial overrides for the auto-generated <code>/[category]/in/[neighborhood]</code>{" "}
            SEO pages. Add a custom intro, insider tip, hero image, FAQs, or SEO meta — listings
            still auto-fill from your published listings.
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> New override
        </button>
      </div>

      {creating && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {CATEGORY_HUBS.map((h) => (
                  <option key={h.slug} value={h.slug}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Neighborhood</span>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {SEO_NEIGHBORHOODS.filter((n) =>
                  n.categories.includes(category as never),
                ).map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <div className="flex gap-2">
            <button
              onClick={create}
              disabled={busy}
              className="rounded-md bg-accent text-accent-foreground px-3 py-2 text-xs font-semibold"
            >
              {busy ? "Creating…" : "Create override"}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="rounded-md border border-border px-3 py-2 text-xs"
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
              <th className="text-left px-4 py-3">Page</th>
              <th className="text-left px-4 py-3">URL</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {r.title || `${capitalize(r.category_slug)} in ${r.neighborhood_name}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.neighborhood_name} · {capitalize(r.category_slug)}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  /{r.category_slug}/in/{r.neighborhood_slug}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold ${
                      r.status === "published"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    {r.status === "published" && (
                      <Link
                        to="/$category/in/$neighborhood"
                        params={{
                          category: r.category_slug,
                          neighborhood: r.neighborhood_slug,
                        }}
                        target="_blank"
                        className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-secondary"
                        title="Preview live"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <Link
                      to="/admin/cms/neighborhoods/$id"
                      params={{ id: r.id }}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-secondary"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => remove(r.id)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No editorial overrides yet — auto-generated pages are still live for every
                  category/neighborhood combo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {missing.length > 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
          <h2 className="font-display text-base font-semibold">
            Auto-generated pages without overrides ({missing.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            These pages exist publicly with default copy. Add an override to customize.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.slice(0, 30).map((m) => (
              <span
                key={`${m.category_slug}-${m.neighborhood_slug}`}
                className="text-[11px] rounded-full bg-background border border-border px-2 py-0.5 text-foreground/75"
              >
                {capitalize(m.category_slug)} · {m.neighborhood_name}
              </span>
            ))}
            {missing.length > 30 && (
              <span className="text-[11px] text-muted-foreground">
                +{missing.length - 30} more…
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function capitalize(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}
