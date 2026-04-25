import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Send, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CmsImageUpload } from "@/components/admin/CmsImageUpload";

export const Route = createFileRoute("/admin/cms/pages/$id")({
  head: () => ({ meta: [{ title: "Edit Page — Admin" }, { name: "robots", content: "noindex" }] }),
  component: EditPage,
});

type Page = {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  hero_image: string | null;
  draft_body: { html?: string };
  published_body: { html?: string } | null;
  status: string;
};

function EditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("content_pages").select("*").eq("id", id).maybeSingle();
      setPage(data as Page | null);
    })();
  }, [id]);

  if (!page) return <div className="text-muted-foreground">Loading…</div>;

  const update = (patch: Partial<Page>) => setPage((p) => (p ? { ...p, ...patch } : p));
  const updateBody = (html: string) => setPage((p) => (p ? { ...p, draft_body: { ...p.draft_body, html } } : p));

  const saveDraft = async () => {
    setBusy(true); setMsg(null);
    await supabase.from("content_pages").update({
      title: page.title, slug: page.slug, meta_title: page.meta_title, meta_description: page.meta_description, hero_image: page.hero_image, draft_body: page.draft_body,
    }).eq("id", page.id);
    setBusy(false); setMsg("Draft saved");
  };
  const publish = async () => {
    setBusy(true); setMsg(null);
    await supabase.from("content_pages").update({
      title: page.title, slug: page.slug, meta_title: page.meta_title, meta_description: page.meta_description, hero_image: page.hero_image,
      draft_body: page.draft_body, published_body: page.draft_body, status: "published", published_at: new Date().toISOString(),
    }).eq("id", page.id);
    setBusy(false); setMsg("Published");
  };

  const dirty = JSON.stringify(page.draft_body) !== JSON.stringify(page.published_body || {});

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => navigate({ to: "/admin/cms/pages" })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Edit Page</h1>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[10px] uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 font-semibold">Unpublished</span>}
          {page.status === "published" && (
            <Link to="/pages/$slug" params={{ slug: page.slug }} target="_blank" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
              <ExternalLink className="h-3 w-3" /> Preview live
            </Link>
          )}
        </div>
      </div>
      {msg && <div className="rounded-md bg-accent/10 text-accent text-sm px-3 py-2">{msg}</div>}

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-foreground/70">Title</label>
          <input value={page.title} onChange={(e) => update({ title: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground/70">Slug</label>
          <input value={page.slug} onChange={(e) => update({ slug: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <p className="text-xs text-muted-foreground mt-1">URL: /pages/{page.slug}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground/70">SEO title</label>
            <input value={page.meta_title || ""} onChange={(e) => update({ meta_title: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70">SEO description</label>
            <input value={page.meta_description || ""} onChange={(e) => update({ meta_description: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <CmsImageUpload value={page.hero_image || ""} onChange={(v) => update({ hero_image: v })} label="Hero image" />
        <div>
          <label className="text-xs font-medium text-foreground/70">Body (HTML)</label>
          <textarea value={page.draft_body?.html || ""} onChange={(e) => updateBody(e.target.value)} rows={16} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono" />
          <p className="text-xs text-muted-foreground mt-1">Use HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;a href&gt;, etc.</p>
        </div>
      </div>

      <div className="flex gap-2 sticky bottom-4">
        <button onClick={saveDraft} disabled={busy} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary shadow">
          <Save className="h-4 w-4" /> Save draft
        </button>
        <button onClick={publish} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 shadow">
          <Send className="h-4 w-4" /> Publish
        </button>
      </div>
    </div>
  );
}
