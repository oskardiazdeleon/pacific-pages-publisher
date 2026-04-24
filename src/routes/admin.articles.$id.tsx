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
        excerpt: row.excerpt ?? "",
        body: row.body ?? "",
        hero_image: row.hero_image ?? "",
        category: row.category,
        tags: (row.tags ?? []).join(", "),
        status: row.status,
        read_time_minutes: row.read_time_minutes?.toString() ?? "",
        meta_title: row.meta_title ?? "",
        meta_description: row.meta_description ?? "",
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
