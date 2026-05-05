import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArticleForm, type ArticleFormValues } from "@/components/admin/ArticleForm";

export const Route = createFileRoute("/admin/articles/$id")({
  component: EditArticle,
});

function EditArticle() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Partial<ArticleFormValues> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: row } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
      if (!row) return setNotFound(true);
      setData({
        id: row.id,
        title: row.title,
        slug: row.slug,
        subtitle: row.subtitle ?? "",
        excerpt: row.excerpt ?? "",
        body: row.body ?? "",
        hero_image: row.hero_image ?? "",
        hero_caption: row.hero_caption ?? "",
        hero_credit: row.hero_credit ?? "",
        category: row.category,
        tags: (row.tags ?? []).join(", "),
        status: row.status,
        read_time_minutes: row.read_time_minutes?.toString() ?? "",
        meta_title: row.meta_title ?? "",
        meta_description: row.meta_description ?? "",
        canonical_url: row.canonical_url ?? "",
        og_image: row.og_image ?? "",
        pull_quote: row.pull_quote ?? "",
        author_name: row.author_name ?? "",
        author_title: row.author_title ?? "",
        author_avatar: row.author_avatar ?? "",
        author_bio: row.author_bio ?? "",
        key_takeaways: Array.isArray(row.key_takeaways)
          ? (row.key_takeaways as unknown[]).filter((x): x is string => typeof x === "string")
          : [],
        faqs: Array.isArray(row.faqs)
          ? (row.faqs as unknown[])
              .map((f) => f as { q?: string; a?: string })
              .filter((f) => f && typeof f.q === "string" && typeof f.a === "string")
              .map((f) => ({ q: f.q!, a: f.a! }))
          : [],
      });
    };
    load();
  }, [id]);

  if (notFound) return <div className="text-muted-foreground">Article not found.</div>;
  if (!data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div>
      <div className="eyebrow">Edit</div>
      <h1 className="mt-2 mb-8 font-display text-4xl font-semibold">{data.title}</h1>
      <ArticleForm initial={data} />
    </div>
  );
}
