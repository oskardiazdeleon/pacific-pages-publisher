import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export interface ArticleFormValues {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  hero_image: string;
  category: string;
  tags: string;
  status: "draft" | "published" | "archived";
  read_time_minutes: string;
  meta_title: string;
  meta_description: string;
}

const empty: ArticleFormValues = {
  title: "", slug: "", excerpt: "", body: "", hero_image: "",
  category: "Food & Drink", tags: "", status: "draft",
  read_time_minutes: "", meta_title: "", meta_description: "",
};

export function ArticleForm({ initial }: { initial?: Partial<ArticleFormValues> }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [v, setV] = useState<ArticleFormValues>({ ...empty, ...initial });
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
        excerpt: v.excerpt || null,
        body: v.body || null,
        hero_image: v.hero_image || null,
        category: v.category,
        tags: v.tags ? v.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: v.status,
        read_time_minutes: v.read_time_minutes ? parseInt(v.read_time_minutes) : null,
        meta_title: v.meta_title || null,
        meta_description: v.meta_description || null,
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

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Article</h2>
        <Field label="Title">
          <input className={inputCls} required value={v.title}
            onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Slug">
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
        <ImageUpload
          label="Hero image"
          bucket="article-media"
          folder={v.slug || "uploads"}
          value={v.hero_image}
          onChange={(url) => set("hero_image", url)}
        />
        <Field label="Excerpt (1–2 sentences shown in cards)">
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
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Visibility & SEO</h2>
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
        <Field label="Meta title">
          <input className={inputCls} maxLength={70} value={v.meta_title}
            onChange={(e) => set("meta_title", e.target.value)} />
        </Field>
        <Field label="Meta description">
          <textarea className={inputCls} maxLength={170} value={v.meta_description}
            onChange={(e) => set("meta_description", e.target.value)} />
        </Field>
      </section>

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
