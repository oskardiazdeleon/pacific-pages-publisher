import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CmsImageUpload } from "@/components/admin/CmsImageUpload";

export const Route = createFileRoute("/admin/cms/home-neighborhoods")({
  head: () => ({
    meta: [
      { title: "Home Neighborhoods — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HomeNeighborhoodsAdmin,
});

type Row = {
  id: string;
  position: number;
  name: string;
  blurb: string | null;
  image_url: string | null;
  link_to: string;
  enabled: boolean;
};

function HomeNeighborhoodsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("home_neighborhoods")
      .select("*")
      .order("position");
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => {
    load();
  }, []);

  const update = (id: string, patch: Partial<Row>) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const saveRow = async (r: Row) => {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("home_neighborhoods")
      .update({
        name: r.name,
        blurb: r.blurb,
        image_url: r.image_url,
        link_to: r.link_to,
        enabled: r.enabled,
        position: r.position,
      })
      .eq("id", r.id);
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : `Saved ${r.name}`);
  };

  const addRow = async () => {
    setBusy(true);
    const nextPos = rows.length ? Math.max(...rows.map((r) => r.position)) + 1 : 0;
    const { error } = await supabase.from("home_neighborhoods").insert({
      position: nextPos,
      name: "New neighborhood",
      blurb: "",
      image_url: "",
      link_to: "/neighborhoods",
      enabled: true,
    });
    setBusy(false);
    if (error) setMsg(`Error: ${error.message}`);
    else await load();
  };

  const removeRow = async (id: string) => {
    if (!confirm("Delete this neighborhood card?")) return;
    await supabase.from("home_neighborhoods").delete().eq("id", id);
    await load();
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= rows.length) return;
    const a = rows[idx];
    const b = rows[swapIdx];
    await Promise.all([
      supabase.from("home_neighborhoods").update({ position: b.position }).eq("id", a.id),
      supabase.from("home_neighborhoods").update({ position: a.position }).eq("id", b.id),
    ]);
    await load();
  };

  const inputCls =
    "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Home Neighborhoods</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            The neighborhood image cards on the home page. Edit the name, blurb, image and where the card links to. Drag-style reorder via the up/down arrows.
          </p>
        </div>
        <button
          onClick={addRow}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> Add card
        </button>
      </div>

      {msg && (
        <div className="rounded-md bg-accent/10 text-accent text-sm px-3 py-2">{msg}</div>
      )}

      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">#{i + 1}</span>
                <button
                  onClick={() => move(r.id, -1)}
                  disabled={i === 0}
                  className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-secondary disabled:opacity-40"
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => move(r.id, 1)}
                  disabled={i === rows.length - 1}
                  className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-secondary disabled:opacity-40"
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) => update(r.id, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-accent"
                  />
                  Enabled
                </label>
                <button
                  onClick={() => removeRow(r.id)}
                  className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-foreground/70">Name</span>
                <input
                  value={r.name}
                  onChange={(e) => update(r.id, { name: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-foreground/70">
                  Link to (URL or path)
                </span>
                <input
                  value={r.link_to}
                  onChange={(e) => update(r.id, { link_to: e.target.value })}
                  placeholder="/neighborhoods/la-jolla"
                  className={inputCls}
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  e.g. <code>/neighborhoods/la-jolla</code> or <code>/restaurants/in/little-italy</code>
                </span>
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-foreground/70">Blurb</span>
              <textarea
                value={r.blurb ?? ""}
                onChange={(e) => update(r.id, { blurb: e.target.value })}
                rows={2}
                className={inputCls}
              />
            </label>

            <CmsImageUpload
              value={r.image_url ?? ""}
              onChange={(v) => update(r.id, { image_url: v })}
              label="Card image"
            />

            <div className="flex justify-end">
              <button
                onClick={() => saveRow(r)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No neighborhood cards yet. Click "Add card" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
