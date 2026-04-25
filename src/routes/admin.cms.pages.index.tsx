import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/cms/pages/")({
  head: () => ({ meta: [{ title: "Pages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: PagesIndex,
});

type Page = { id: string; slug: string; title: string; status: string; updated_at: string };

function PagesIndex() {
  const [pages, setPages] = useState<Page[]>([]);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    const { data } = await supabase.from("content_pages").select("id, slug, title, status, updated_at").order("updated_at", { ascending: false });
    setPages((data ?? []) as Page[]);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newSlug || !newTitle) return;
    await supabase.from("content_pages").insert({ slug: newSlug, title: newTitle, draft_body: { html: "<p>Edit this page…</p>" } });
    setCreating(false); setNewSlug(""); setNewTitle("");
    await load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await supabase.from("content_pages").delete().eq("id", id);
    await load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Content Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">About, Privacy, and any custom marketing pages.</p>
        </div>
        <button onClick={() => setCreating((v) => !v)} className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> New page
        </button>
      </div>

      {creating && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Page title" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <input value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="slug (e.g. about)" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={create} className="rounded-md bg-accent text-accent-foreground px-3 py-2 text-xs font-semibold">Create</button>
            <button onClick={() => setCreating(false)} className="rounded-md border border-border px-3 py-2 text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">/pages/{p.slug}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold ${p.status === "published" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Link to="/admin/cms/pages/$id" params={{ id: p.id }} className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-secondary"><Edit3 className="h-3.5 w-3.5" /></Link>
                    <button onClick={() => remove(p.id)} className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No pages yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
