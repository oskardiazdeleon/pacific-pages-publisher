import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Edit3, Plus, Save, Trash2, X } from "lucide-react";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);

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

  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setDraft({ ...r });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const updateDraft = (patch: Partial<Row>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  const saveDraft = async () => {
    if (!draft) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("home_neighborhoods")
      .update({
        name: draft.name,
        blurb: draft.blurb,
        image_url: draft.image_url,
        link_to: draft.link_to,
        enabled: draft.enabled,
        position: draft.position,
      })
      .eq("id", draft.id);
    setBusy(false);
    if (error) {
      setMsg(`Error: ${error.message}`);
      return;
    }
    setMsg(`Saved ${draft.name}`);
    cancelEdit();
    await load();
  };

  const toggleEnabled = async (r: Row, enabled: boolean) => {
    await supabase.from("home_neighborhoods").update({ enabled }).eq("id", r.id);
    await load();
  };

  const addRow = async () => {
    setBusy(true);
    const nextPos = rows.length ? Math.max(...rows.map((r) => r.position)) + 1 : 0;
    const { data, error } = await supabase
      .from("home_neighborhoods")
      .insert({
        position: nextPos,
        name: "New neighborhood",
        blurb: "",
        image_url: "",
        link_to: "/neighborhoods",
        enabled: true,
      })
      .select()
      .single();
    setBusy(false);
    if (error) {
      setMsg(`Error: ${error.message}`);
      return;
    }
    await load();
    if (data) startEdit(data as Row);
  };

  const removeRow = async (id: string) => {
    if (!confirm("Delete this neighborhood card?")) return;
    await supabase.from("home_neighborhoods").delete().eq("id", id);
    if (editingId === id) cancelEdit();
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
            The neighborhood image cards on the home page. Click a row to edit. Use the arrows to reorder.
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

      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
        {rows.map((r, i) => {
          const isEditing = editingId === r.id;
          return (
            <div key={r.id}>
              {/* Collapsed row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground w-6">#{i + 1}</span>

                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => move(r.id, -1)}
                    disabled={i === 0}
                    className="grid h-5 w-5 place-items-center rounded border border-border hover:bg-secondary disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => move(r.id, 1)}
                    disabled={i === rows.length - 1}
                    className="grid h-5 w-5 place-items-center rounded border border-border hover:bg-secondary disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                {r.image_url ? (
                  <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover border border-border" />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted border border-border" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground truncate font-mono">{r.link_to}</div>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) => toggleEnabled(r, e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Enabled
                </label>

                <button
                  onClick={() => (isEditing ? cancelEdit() : startEdit(r))}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  {isEditing ? (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 rotate-180" /> Close
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </>
                  )}
                </button>

                <button
                  onClick={() => removeRow(r.id)}
                  className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Expanded editor */}
              {isEditing && draft && (
                <div className="bg-muted/30 px-4 py-5 space-y-4 border-t border-border">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-foreground/70">Name</span>
                      <input
                        value={draft.name}
                        onChange={(e) => updateDraft({ name: e.target.value })}
                        className={inputCls}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-foreground/70">Link to (URL or path)</span>
                      <input
                        value={draft.link_to}
                        onChange={(e) => updateDraft({ link_to: e.target.value })}
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
                      value={draft.blurb ?? ""}
                      onChange={(e) => updateDraft({ blurb: e.target.value })}
                      rows={2}
                      className={inputCls}
                    />
                  </label>

                  <CmsImageUpload
                    value={draft.image_url ?? ""}
                    onChange={(v) => updateDraft({ image_url: v })}
                    label="Card image"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </button>
                    <button
                      onClick={saveDraft}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90"
                    >
                      <Save className="h-4 w-4" /> Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No neighborhood cards yet. Click "Add card" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
