import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { aiInsertInternalLinks } from "@/utils/import.functions";

export interface BlogFormValues {
  id?: string;
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string;
  category: string;
  tags: string;
  status: "draft" | "published" | "archived";
  read_time_minutes: string;
  meta_title: string;
  meta_description: string;
  ai_generated?: boolean;
  ai_prompt?: string;
}

const empty: BlogFormValues = {
  title: "", subtitle: "", slug: "", excerpt: "", body: "",
  cover_image: "", category: "Lifestyle", tags: "", status: "draft",
  read_time_minutes: "", meta_title: "", meta_description: "",
  ai_generated: false, ai_prompt: "",
};

const CATEGORIES = ["Lifestyle", "Food", "Beaches", "Neighborhoods", "Events", "Outdoors", "Family", "Nightlife", "Culture"];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export function BlogPostForm({ initial }: { initial?: Partial<BlogFormValues> }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [v, setV] = useState<BlogFormValues>({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);
  const [aiOpen, setAiOpen] = useState(!initial?.id);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLength, setAiLength] = useState<"short" | "medium" | "long">("medium");
  const [aiBusy, setAiBusy] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkReport, setLinkReport] = useState<{ applied: { anchor: string; url: string }[]; skipped: { anchor: string; url: string; reason: string }[] } | null>(null);

  const set = <K extends keyof BlogFormValues>(k: K, val: BlogFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) { toast.error("Tell the AI what to write about"); return; }
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: { prompt: aiPrompt, length: aiLength },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const d = data.draft;
      setV((p) => ({
        ...p,
        title: d.title ?? p.title,
        subtitle: d.subtitle ?? p.subtitle,
        slug: p.slug || d.suggested_slug || slugify(d.title || ""),
        excerpt: d.excerpt ?? p.excerpt,
        body: d.body_markdown ?? p.body,
        category: d.category ?? p.category,
        tags: Array.isArray(d.tags) ? d.tags.join(", ") : p.tags,
        meta_title: d.meta_title ?? p.meta_title,
        meta_description: d.meta_description ?? p.meta_description,
        read_time_minutes: d.read_time_minutes ? String(Math.max(1, Math.round(Number(d.read_time_minutes)))) : p.read_time_minutes,
        ai_generated: true,
        ai_prompt: aiPrompt,
      }));
      toast.success("Draft generated — review and refine below");
      setAiOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiBusy(false);
    }
  };

  const handleInsertLinks = async () => {
    if (!v.body.trim() || v.body.trim().length < 100) {
      toast.error("Write the post body first (at least ~100 chars)");
      return;
    }
    setLinkBusy(true);
    setLinkReport(null);
    try {
      const result = await aiInsertInternalLinks({
        data: {
          body: v.body,
          title: v.title || null,
          category: v.category || null,
          maxLinks: 6,
        },
      });
      setV((p) => ({ ...p, body: result.body }));
      setLinkReport({ applied: result.applied, skipped: result.skipped });
      if (result.applied.length === 0) {
        toast.warning("No internal links could be inserted — see report below");
      } else {
        toast.success(`Inserted ${result.applied.length} internal link${result.applied.length === 1 ? "" : "s"}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Internal link generation failed");
    } finally {
      setLinkBusy(false);
    }
  };

  const submit = async (publish: boolean) => {
    if (!v.title.trim()) { toast.error("Title is required"); return; }
    setBusy(true);
    try {
      const slug = v.slug || slugify(v.title);
      const tags = v.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const status = publish ? "published" : v.status;
      const payload = {
        slug,
        title: v.title,
        subtitle: v.subtitle || null,
        excerpt: v.excerpt || null,
        body: v.body || null,
        cover_image: v.cover_image || null,
        category: v.category || null,
        tags,
        status,
        read_time_minutes: v.read_time_minutes ? Math.max(1, Math.round(Number(v.read_time_minutes))) : null,
        meta_title: v.meta_title || null,
        meta_description: v.meta_description || null,
        author_id: user?.id ?? null,
        author_name: user?.email?.split("@")[0] ?? null,
        ai_generated: v.ai_generated ?? false,
        ai_prompt: v.ai_prompt || null,
        published_at: status === "published" ? (initial?.id ? undefined : new Date().toISOString()) : null,
      };

      if (v.id) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", v.id);
        if (error) throw error;
        toast.success(publish ? "Published" : "Saved");
      } else {
        const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
        if (error) throw error;
        toast.success(publish ? "Published" : "Draft saved");
        navigate({ to: "/admin/blog/$id", params: { id: data.id } });
        return;
      }
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Composer */}
      <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-background to-background p-6">
        <button
          type="button"
          onClick={() => setAiOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <Sparkles className="h-4 w-4 text-accent" />
          AI Composer {aiOpen ? "" : "(click to expand)"}
        </button>
        {aiOpen && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Describe the post you want — topic, angle, audience. The AI will draft a full markdown post you can edit.
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. A weekend guide to North Park: best coffee, brunch, vintage shopping, and craft breweries — written for couples visiting for 2 days."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={aiLength}
                onChange={(e) => setAiLength(e.target.value as any)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="short">Short (~400 words)</option>
                <option value="medium">Medium (~700 words)</option>
                <option value="long">Long (~1100 words)</option>
              </select>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={aiBusy}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {aiBusy ? "Drafting…" : "Generate draft"}
              </button>
              {v.ai_generated && (
                <span className="text-xs text-muted-foreground">
                  ✓ Last draft generated by AI
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form fields */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Title</label>
            <input
              value={v.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!v.slug || v.slug === slugify(v.title)) set("slug", slugify(e.target.value));
              }}
              placeholder="An evocative, scroll-stopping title"
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 font-display text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Subtitle</label>
            <input
              value={v.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="One-line dek under the title"
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Excerpt</label>
            <textarea
              value={v.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              placeholder="1–2 sentences that show up in feed cards and previews"
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Body (Markdown)</label>
              <button
                type="button"
                onClick={handleInsertLinks}
                disabled={linkBusy}
                title="Scan the body and insert relevant internal links to listings, neighborhoods, and other posts"
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent hover:bg-accent/20 disabled:opacity-50"
              >
                {linkBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2 className="h-3 w-3" />}
                {linkBusy ? "Inserting links…" : "AI internal links"}
              </button>
            </div>
            <textarea
              value={v.body}
              onChange={(e) => set("body", e.target.value)}
              rows={22}
              placeholder="Write in Markdown. ## Heading, **bold**, [link](url), ![image](url)…"
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Markdown supported — headings, bold/italic, lists, links, images, blockquotes, code.
            </p>
            {linkReport && (
              <div className="mt-3 rounded-xl border border-border bg-card p-4 text-xs">
                <div className="font-semibold text-foreground">Internal link report</div>
                {linkReport.applied.length > 0 && (
                  <div className="mt-2">
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Inserted ({linkReport.applied.length})</div>
                    <ul className="mt-1 space-y-0.5">
                      {linkReport.applied.map((l, i) => (
                        <li key={i} className="text-muted-foreground">
                          <span className="text-foreground">"{l.anchor}"</span> → <code className="text-accent">{l.url}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {linkReport.skipped.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-muted-foreground">Skipped ({linkReport.skipped.length})</summary>
                    <ul className="mt-1 space-y-0.5">
                      {linkReport.skipped.map((l, i) => (
                        <li key={i} className="text-muted-foreground">
                          "{l.anchor}" → {l.url} <span className="opacity-70">— {l.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Cover image</label>
            <div className="mt-1">
              <ImageUpload
                bucket="article-media"
                folder="blog"
                value={v.cover_image}
                onChange={(url) => set("cover_image", url)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Slug</label>
            <input
              value={v.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Category</label>
            <select
              value={v.category}
              onChange={(e) => set("category", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Tags (comma-separated)</label>
            <input
              value={v.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="weekend, north-park, brunch"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Read time (min)</label>
            <input
              type="number"
              value={v.read_time_minutes}
              onChange={(e) => set("read_time_minutes", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <details className="rounded-xl border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold">SEO</summary>
            <div className="mt-3 space-y-3">
              <input
                value={v.meta_title}
                onChange={(e) => set("meta_title", e.target.value)}
                placeholder="Meta title"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <textarea
                value={v.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
                rows={3}
                placeholder="Meta description (~155 chars)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </details>
        </div>
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border bg-background/90 backdrop-blur p-4 shadow-lg">
        <span className="mr-auto text-xs text-muted-foreground">
          Status: <strong className="text-foreground">{v.status}</strong>
        </span>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={busy}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Publish"}
        </button>
      </div>
    </div>
  );
}
