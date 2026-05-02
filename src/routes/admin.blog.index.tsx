import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Sparkles, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/blog/")({
  component: AdminBlog,
});

interface Row {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  ai_generated: boolean;
  published_at: string | null;
  updated_at: string;
}

function AdminBlog() {
  const { canManageContent } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, category, status, ai_generated, published_at, updated_at")
        .order("updated_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">The Journal</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Modern publishing with AI-assisted drafting.
          </p>
        </div>
        {canManageContent && (
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New post
          </Link>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Title</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Published</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                No posts yet. <Link to="/admin/blog/new" className="text-accent font-medium">Write the first one →</Link>
              </td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-5 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    {r.title}
                    {r.ai_generated && <Sparkles className="h-3.5 w-3.5 text-accent" />}
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{r.category ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    r.status === "published" ? "bg-teal-soft/30 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{r.status}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-xs">
                  {r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to="/admin/blog/$id" params={{ id: r.id }}
                    className="inline-flex items-center gap-1 text-accent text-xs font-medium">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
