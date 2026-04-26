import { createFileRoute } from "@tanstack/react-router";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const Route = createFileRoute("/admin/blog/new")({
  component: NewBlogPost,
});

function NewBlogPost() {
  return (
    <div>
      <div className="eyebrow">New</div>
      <h1 className="mt-2 mb-2 font-display text-4xl font-semibold">Write a post</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Start from scratch or use the AI Composer to generate a draft you can refine.
      </p>
      <BlogPostForm />
    </div>
  );
}
