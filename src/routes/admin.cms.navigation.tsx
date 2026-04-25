import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Save, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { NavItem } from "@/lib/cms";

export const Route = createFileRoute("/admin/cms/navigation")({
  head: () => ({ meta: [{ title: "Navigation — Admin" }, { name: "robots", content: "noindex" }] }),
  component: NavigationPage,
});

type Menu = { id: string; location: string; label: string; draft_items: NavItem[]; published_items: NavItem[] | null };

function NavigationPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("nav_menus").select("*").order("location");
    setMenus((data ?? []) as Menu[]);
  };
  useEffect(() => { load(); }, []);

  const setMenu = (id: string, items: NavItem[]) => {
    setMenus((p) => p.map((m) => (m.id === id ? { ...m, draft_items: items } : m)));
  };

  const saveDraft = async (m: Menu) => {
    setBusy(true); setMsg(null);
    await supabase.from("nav_menus").update({ draft_items: m.draft_items }).eq("id", m.id);
    setBusy(false); setMsg(`Saved draft: ${m.label}`);
  };
  const publish = async (m: Menu) => {
    setBusy(true); setMsg(null);
    await supabase.from("nav_menus").update({ draft_items: m.draft_items, published_items: m.draft_items, published_at: new Date().toISOString() }).eq("id", m.id);
    await load();
    setBusy(false); setMsg(`Published: ${m.label}`);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">Navigation</h1>
        <p className="text-sm text-muted-foreground mt-1">Header and footer menus. Drag-free editor — use ↑↓ buttons to reorder.</p>
      </div>
      {msg && <div className="rounded-md bg-accent/10 text-accent text-sm px-3 py-2">{msg}</div>}
      {menus.map((m) => {
        const dirty = JSON.stringify(m.draft_items) !== JSON.stringify(m.published_items || []);
        return (
          <section key={m.id} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">{m.label}</h2>
                <p className="text-xs text-muted-foreground">Location: <code className="bg-secondary px-1.5 py-0.5 rounded">{m.location}</code></p>
              </div>
              {dirty && <span className="text-[10px] uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 font-semibold">Unpublished</span>}
            </div>
            <ItemEditor items={m.draft_items} onChange={(items) => setMenu(m.id, items)} allowChildren />
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => saveDraft(m)} disabled={busy} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary">
                <Save className="h-3.5 w-3.5" /> Save draft
              </button>
              <button onClick={() => publish(m)} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-xs font-semibold hover:opacity-90">
                <Send className="h-3.5 w-3.5" /> Publish
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ItemEditor({ items, onChange, allowChildren }: { items: NavItem[]; onChange: (items: NavItem[]) => void; allowChildren?: boolean }) {
  const update = (i: number, patch: Partial<NavItem>) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { label: "New item", to: "/" }]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-border p-3 bg-background space-y-2">
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} className="grid h-6 w-6 place-items-center rounded border border-border hover:bg-secondary"><ChevronUp className="h-3 w-3" /></button>
              <button type="button" onClick={() => move(i, 1)} className="grid h-6 w-6 place-items-center rounded border border-border hover:bg-secondary"><ChevronDown className="h-3 w-3" /></button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input value={it.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
              <input value={it.to} onChange={(e) => update(i, { to: e.target.value })} placeholder="/path or https://…" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
            </div>
            <button type="button" onClick={() => remove(i)} className="grid h-7 w-7 place-items-center rounded border border-border text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {allowChildren && (
            <div className="pl-8">
              <details>
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">{it.children?.length ? `${it.children.length} sub-items` : "+ Add sub-items"}</summary>
                <div className="mt-2">
                  <ItemEditor items={it.children ?? []} onChange={(children) => update(i, { children })} />
                </div>
              </details>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}
