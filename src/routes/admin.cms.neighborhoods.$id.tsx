import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Plus, Save, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CmsImageUpload } from "@/components/admin/CmsImageUpload";

export const Route = createFileRoute("/admin/cms/neighborhoods/$id")({
  head: () => ({
    meta: [
      { title: "Edit Neighborhood Page — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditNeighborhoodPage,
});

type Page = {
  id: string;
  category_slug: string;
  neighborhood_slug: string;
  neighborhood_name: string;
  title: string | null;
  intro: string | null;
  insider_tip: string | null;
  hero_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  faqs: { q: string; a: string }[] | null;
  status: string;
};

function EditNeighborhoodPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("neighborhood_pages")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      const row = (data as Page | null) ?? null;
      if (row && !Array.isArray(row.faqs)) row.faqs = [];
      setPage(row);
    })();
  }, [id]);

  if (!page) return <div className="text-muted-foreground">Loading…</div>;

  const update = (patch: Partial<Page>) => setPage((p) => (p ? { ...p, ...patch } : p));

  const updateFaq = (i: number, key: "q" | "a", value: string) =>
    setPage((p) => {
      if (!p) return p;
      const faqs = [...(p.faqs ?? [])];
      faqs[i] = { ...faqs[i], [key]: value };
      return { ...p, faqs };
    });
  const addFaq = () =>
    setPage((p) => (p ? { ...p, faqs: [...(p.faqs ?? []), { q: "", a: "" }] } : p));
  const removeFaq = (i: number) =>
    setPage((p) =>
      p ? { ...p, faqs: (p.faqs ?? []).filter((_, idx) => idx !== i) } : p,
    );

  const buildPayload = () => ({
    title: page.title?.trim() || null,
    intro: page.intro?.trim() || null,
    insider_tip: page.insider_tip?.trim() || null,
    hero_image: page.hero_image?.trim() || null,
    meta_title: page.meta_title?.trim() || null,
    meta_description: page.meta_description?.trim() || null,
    faqs: (page.faqs ?? [])
      .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
      .filter((f) => f.q && f.a),
  });

  const saveDraft = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("neighborhood_pages")
      .update(buildPayload())
      .eq("id", page.id);
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : "Draft saved");
  };

  const publish = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("neighborhood_pages")
      .update({
        ...buildPayload(),
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", page.id);
    setBusy(false);
    if (!error) update({ status: "published" });
    setMsg(error ? `Error: ${error.message}` : "Published");
  };

  const unpublish = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("neighborhood_pages")
      .update({ status: "draft" })
      .eq("id", page.id);
    setBusy(false);
    if (!error) update({ status: "draft" });
    setMsg(error ? `Error: ${error.message}` : "Unpublished — auto page now serves defaults");
  };

  const inputCls =
    "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => navigate({ to: "/admin/cms/neighborhoods" })}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {capitalize(page.category_slug)} in {page.neighborhood_name}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            URL: /{page.category_slug}/in/{page.neighborhood_slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold ${
              page.status === "published"
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
            }`}
          >
            {page.status}
          </span>
          <Link
            to="/$category/in/$neighborhood"
            params={{
              category: page.category_slug,
              neighborhood: page.neighborhood_slug,
            }}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Preview
          </Link>
        </div>
      </div>
      {msg && (
        <div className="rounded-md bg-accent/10 text-accent text-sm px-3 py-2">{msg}</div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Editorial</h2>
        <p className="text-xs text-muted-foreground">
          Leave any field blank to fall back to the auto-generated default.
        </p>
        <label className="block">
          <span className="text-xs font-medium text-foreground/70">
            Custom H1 / page title
          </span>
          <input
            value={page.title ?? ""}
            onChange={(e) => update({ title: e.target.value })}
            placeholder={`${capitalize(page.category_slug)} in ${page.neighborhood_name}, San Diego`}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/70">Intro / lede (2–3 sentences)</span>
          <textarea
            value={page.intro ?? ""}
            onChange={(e) => update({ intro: e.target.value })}
            rows={4}
            placeholder="What makes this neighborhood special for this category. Locals, atmosphere, what to expect…"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/70">Insider tip</span>
          <textarea
            value={page.insider_tip ?? ""}
            onChange={(e) => update({ insider_tip: e.target.value })}
            rows={3}
            placeholder="A specific tip locals would actually share — best time to visit, parking trick, must-order, etc."
            className={inputCls}
          />
        </label>
        <CmsImageUpload
          value={page.hero_image ?? ""}
          onChange={(v) => update({ hero_image: v })}
          label="Hero image"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">SEO</h2>
        <label className="block">
          <span className="text-xs font-medium text-foreground/70">Meta title (max ~70 chars)</span>
          <input
            value={page.meta_title ?? ""}
            onChange={(e) => update({ meta_title: e.target.value })}
            maxLength={70}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/70">
            Meta description (max ~170 chars)
          </span>
          <textarea
            value={page.meta_description ?? ""}
            onChange={(e) => update({ meta_description: e.target.value })}
            maxLength={170}
            rows={2}
            className={inputCls}
          />
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">FAQs</h2>
          <button
            onClick={addFaq}
            className="inline-flex items-center gap-1 text-xs rounded-md border border-border px-2 py-1 hover:bg-secondary"
          >
            <Plus className="h-3 w-3" /> Add FAQ
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Renders as accordion + FAQPage schema. 3–6 is ideal.
        </p>
        {(page.faqs ?? []).map((f, i) => (
          <div key={i} className="rounded-lg border border-border p-3 space-y-2 bg-background">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Q{i + 1}
              </span>
              <button
                onClick={() => removeFaq(i)}
                className="text-destructive hover:text-destructive/70"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              value={f.q}
              onChange={(e) => updateFaq(i, "q", e.target.value)}
              placeholder="Question"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              value={f.a}
              onChange={(e) => updateFaq(i, "a", e.target.value)}
              placeholder="Answer"
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        ))}
        {(page.faqs ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground italic">No FAQs yet.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 sticky bottom-4">
        <button
          onClick={saveDraft}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary shadow"
        >
          <Save className="h-4 w-4" /> Save draft
        </button>
        <button
          onClick={publish}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 shadow"
        >
          <Send className="h-4 w-4" /> {page.status === "published" ? "Re-publish" : "Publish"}
        </button>
        {page.status === "published" && (
          <button
            onClick={unpublish}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-secondary shadow"
          >
            Unpublish
          </button>
        )}
      </div>
    </div>
  );
}

function capitalize(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}
