import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, HelpCircle, User, Image as ImageIcon, Search, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { fetchLinkTargets, autoLinkHtml } from "@/lib/auto-internal-links";

export interface ArticleFormValues {
  id?: string;
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  body: string;
  hero_image: string;
  hero_caption: string;
  hero_credit: string;
  category: string;
  tags: string;
  status: "draft" | "published" | "archived";
  read_time_minutes: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_image: string;
  pull_quote: string;
  author_name: string;
  author_title: string;
  author_avatar: string;
  author_bio: string;
  key_takeaways: string[];
  faqs: { q: string; a: string }[];
}

const empty: ArticleFormValues = {
  title: "", slug: "", subtitle: "", excerpt: "", body: "",
  hero_image: "", hero_caption: "", hero_credit: "",
  category: "Food & Drink", tags: "", status: "draft",
  read_time_minutes: "", meta_title: "", meta_description: "",
  canonical_url: "", og_image: "", pull_quote: "",
  author_name: "", author_title: "", author_avatar: "", author_bio: "",
  key_takeaways: [], faqs: [],
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground/80">{hint}</p>}
    </label>
  );
}

function SectionCard({
  title, icon: Icon, hint, children,
}: { title: string; icon: React.ComponentType<{ className?: string }>; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent" /> {title}
        </h2>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function ArticleForm({ initial }: { initial?: Partial<ArticleFormValues> }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [v, setV] = useState<ArticleFormValues>({
    ...empty,
    ...initial,
    key_takeaways: initial?.key_takeaways ?? [],
    faqs: initial?.faqs ?? [],
  });
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ArticleFormValues>(k: K, val: ArticleFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title: v.title,
        slug: v.slug || slugify(v.title),
        subtitle: v.subtitle || null,
        excerpt: v.excerpt || null,
        body: v.body || null,
        hero_image: v.hero_image || null,
        hero_caption: v.hero_caption || null,
        hero_credit: v.hero_credit || null,
        category: v.category,
        tags: v.tags ? v.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: v.status,
        read_time_minutes: v.read_time_minutes ? parseInt(v.read_time_minutes) : null,
        meta_title: v.meta_title || null,
        meta_description: v.meta_description || null,
        canonical_url: v.canonical_url || null,
        og_image: v.og_image || null,
        pull_quote: v.pull_quote || null,
        author_name: v.author_name || null,
        author_title: v.author_title || null,
        author_avatar: v.author_avatar || null,
        author_bio: v.author_bio || null,
        key_takeaways: v.key_takeaways.filter((t) => t.trim().length > 0),
        faqs: v.faqs.filter((f) => f.q.trim() && f.a.trim()),
        published_at: v.status === "published" ? new Date().toISOString() : null,
        author_id: v.id ? undefined : user?.id,
      };

      const res = v.id
        ? await supabase.from("articles").update(payload).eq("id", v.id)
        : await supabase.from("articles").insert(payload);

      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success(v.id ? "Article updated" : "Article created");
        navigate({ to: "/admin/articles" });
      }
    } finally {
      setBusy(false);
    }
  };

  // Live SEO preview helpers
  const metaTitlePreview = v.meta_title || (v.title ? `${v.title} | sandiego.com` : "");
  const metaDescPreview = v.meta_description || v.excerpt || v.subtitle || "";

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <SectionCard title="The story" icon={Sparkles} hint="Headline, subtitle, and the article body.">
        <Field label="Title">
          <input className={inputCls} required value={v.title}
            onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle / dek" hint="Shown directly under the title. Sets the tone and helps SEO.">
          <input className={inputCls} value={v.subtitle}
            onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <Field label="Slug" hint="Auto-generated from the title. Edit only if you know what you're doing.">
          <input className={inputCls} value={v.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder={v.title ? slugify(v.title) : "auto"} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Category">
            <input className={inputCls} required value={v.category}
              onChange={(e) => set("category", e.target.value)} />
          </Field>
          <Field label="Tags (comma separated)">
            <input className={inputCls} value={v.tags}
              onChange={(e) => set("tags", e.target.value)} />
          </Field>
        </div>
        <Field label="Excerpt" hint="1–2 sentences shown on cards and as the SEO description fallback.">
          <textarea className={inputCls} rows={2} value={v.excerpt}
            onChange={(e) => set("excerpt", e.target.value)} />
        </Field>
        <Field label="Body">
          <RichTextEditor
            value={v.body}
            uploadFolder={v.slug || "inline"}
            onChange={(html) => set("body", html)}
          />
        </Field>
        <Field label="Pull quote" hint="A standout sentence rendered as a large editorial callout in the article.">
          <textarea className={inputCls} rows={2} value={v.pull_quote}
            onChange={(e) => set("pull_quote", e.target.value)}
            placeholder='e.g. "B Street Pier is the only port on the West Coast where seven major lines homeport."' />
        </Field>
      </SectionCard>

      <SectionCard title="Hero image" icon={ImageIcon} hint="The cover image people see first. Also used as the social share image.">
        <ImageUpload
          label="Hero image"
          bucket="article-media"
          folder={v.slug || "uploads"}
          value={v.hero_image}
          onChange={(url) => set("hero_image", url)}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Hero caption">
            <input className={inputCls} value={v.hero_caption}
              onChange={(e) => set("hero_caption", e.target.value)} />
          </Field>
          <Field label="Photo credit">
            <input className={inputCls} value={v.hero_credit}
              onChange={(e) => set("hero_credit", e.target.value)}
              placeholder="Jane Doe" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Key takeaways" icon={Sparkles} hint="3–6 bullets summarizing the piece. Renders as a highlight box at the top of the article and helps search snippets.">
        <div className="space-y-2">
          {v.key_takeaways.map((t, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={inputCls}
                value={t}
                onChange={(e) => {
                  const next = [...v.key_takeaways];
                  next[i] = e.target.value;
                  set("key_takeaways", next);
                }}
                placeholder="One concrete insight a reader will remember"
              />
              <button
                type="button"
                onClick={() => set("key_takeaways", v.key_takeaways.filter((_, j) => j !== i))}
                className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-destructive shrink-0"
                aria-label="Remove takeaway"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("key_takeaways", [...v.key_takeaways, ""])}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/70"
        >
          <Plus className="h-3.5 w-3.5" /> Add takeaway
        </button>
      </SectionCard>

      <SectionCard title="FAQs" icon={HelpCircle} hint="Reader questions rendered at the bottom and emitted as FAQPage structured data — strong for Google's expandable results.">
        <div className="space-y-4">
          {v.faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3 bg-background/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">FAQ {i + 1}</span>
                <button
                  type="button"
                  onClick={() => set("faqs", v.faqs.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove FAQ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Field label="Question">
                <input
                  className={inputCls}
                  value={f.q}
                  onChange={(e) => {
                    const next = [...v.faqs];
                    next[i] = { ...f, q: e.target.value };
                    set("faqs", next);
                  }}
                />
              </Field>
              <Field label="Answer">
                <textarea
                  className={inputCls}
                  rows={3}
                  value={f.a}
                  onChange={(e) => {
                    const next = [...v.faqs];
                    next[i] = { ...f, a: e.target.value };
                    set("faqs", next);
                  }}
                />
              </Field>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("faqs", [...v.faqs, { q: "", a: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/70"
        >
          <Plus className="h-3.5 w-3.5" /> Add FAQ
        </button>
      </SectionCard>

      <SectionCard title="Author byline" icon={User} hint="Adds a credible byline to the article and the Author schema for SEO.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Author name">
            <input className={inputCls} value={v.author_name}
              onChange={(e) => set("author_name", e.target.value)} />
          </Field>
          <Field label="Author title">
            <input className={inputCls} value={v.author_title}
              onChange={(e) => set("author_title", e.target.value)}
              placeholder="Senior Editor" />
          </Field>
        </div>
        <Field label="Author avatar">
          <ImageUpload
            label="Avatar"
            bucket="article-media"
            folder={`authors/${v.slug || "general"}`}
            value={v.author_avatar}
            onChange={(url) => set("author_avatar", url)}
          />
        </Field>
        <Field label="Author bio">
          <textarea className={inputCls} rows={3} value={v.author_bio}
            onChange={(e) => set("author_bio", e.target.value)} />
        </Field>
      </SectionCard>

      <SectionCard title="SEO & sharing" icon={Search} hint="How this article appears in Google and on social media.">
        {/* Live preview */}
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Google preview</div>
          <div className="text-[#1a0dab] dark:text-blue-400 text-base leading-snug truncate">
            {metaTitlePreview || "Title…"}
          </div>
          <div className="text-[#006621] dark:text-emerald-500 text-xs mt-0.5">
            sandiego.com › articles › {v.slug || slugify(v.title) || "your-slug"}
          </div>
          <div className="text-sm text-foreground/70 mt-1 line-clamp-2">
            {metaDescPreview || "Meta description…"}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Status">
            <select className={inputCls} value={v.status}
              onChange={(e) => set("status", e.target.value as ArticleFormValues["status"])}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Read time (minutes)">
            <input className={inputCls} type="number" min="1" value={v.read_time_minutes}
              onChange={(e) => set("read_time_minutes", e.target.value)} />
          </Field>
        </div>
        <Field label={`Meta title (${v.meta_title.length}/70)`}
               hint="Keep under 60 characters to avoid truncation in Google.">
          <input className={inputCls} maxLength={70} value={v.meta_title}
            onChange={(e) => set("meta_title", e.target.value)} />
        </Field>
        <Field label={`Meta description (${v.meta_description.length}/170)`}
               hint="Aim for 140–160 characters with a clear value proposition.">
          <textarea className={inputCls} maxLength={170} value={v.meta_description}
            onChange={(e) => set("meta_description", e.target.value)} />
        </Field>
        <Field label="Social share image (optional override)" hint="Falls back to the hero image. Recommended 1200×630.">
          <ImageUpload
            label="OG image"
            bucket="article-media"
            folder={`og/${v.slug || "general"}`}
            value={v.og_image}
            onChange={(url) => set("og_image", url)}
          />
        </Field>
        <Field label="Canonical URL" hint="Only set this if the article is also published elsewhere and that URL should be the source of truth.">
          <input className={inputCls} type="url" value={v.canonical_url}
            onChange={(e) => set("canonical_url", e.target.value)}
            placeholder="https://example.com/original-post" />
        </Field>
      </SectionCard>

      <div className="flex gap-3">
        <button type="submit" disabled={busy}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {busy ? "Saving…" : v.id ? "Save changes" : "Create article"}
        </button>
        <button type="button" onClick={() => navigate({ to: "/admin/articles" })}
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
}
