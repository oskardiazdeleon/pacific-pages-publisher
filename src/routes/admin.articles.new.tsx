import { createFileRoute } from "@tanstack/react-router";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const Route = createFileRoute("/admin/articles/new")({
  component: NewArticle,
});

function NewArticle() {
  return (
    <div>
      <div className="eyebrow">New</div>
      <h1 className="mt-2 mb-8 font-display text-4xl font-semibold">Write article</h1>
      <ArticleForm />
    </div>
  );
}
