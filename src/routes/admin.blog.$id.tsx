import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPostForm, type BlogFormValues } from "@/components/admin/BlogPostForm";

export const Route = createFileRoute("/admin/blog/$id")({
  component: EditBlogPost,
});

function EditBlogPost() {
  const { id } = useParams({ from: "/admin/blog/$id" });
  const [initial, setInitial] = useState<Partial<BlogFormValues> | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
      if (!data) { setMissing(true); return; }
      setInitial({
        id: data.id,
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        slug: data.slug ?? "",
        excerpt: data.excerpt ?? "",
        body: data.body ?? "",
        cover_image: data.cover_image ?? "",
        category: data.category ?? "Lifestyle",
        tags: (data.tags ?? []).join(", "),
        status: (data.status ?? "draft") as BlogFormValues["status"],
        read_time_minutes: data.read_time_minutes ? String(data.read_time_minutes) : "",
        meta_title: data.meta_title ?? "",
        meta_description: data.meta_description ?? "",
        ai_generated: data.ai_generated ?? false,
        ai_prompt: data.ai_prompt ?? "",
      });
    })();
  }, [id]);

  if (missing) return <div className="text-muted-foreground">Post not found.</div>;
  if (!initial) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div>
      <div className="eyebrow">Edit</div>
      <h1 className="mt-2 mb-8 font-display text-4xl font-semibold">{initial.title || "Untitled"}</h1>
      <BlogPostForm initial={initial} />
    </div>
  );
}
