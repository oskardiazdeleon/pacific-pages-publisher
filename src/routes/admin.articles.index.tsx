import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/articles/")({
  component: AdminArticles,
});

interface Row {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  published_at: string | null;
  updated_at: string;
}

function AdminArticles() {
  const { canManageContent } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, category, status, published_at, updated_at")
        .order("updated_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">The Magazine</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">Articles</h1>
        </div>
        {canManageContent && (
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New article
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
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No articles yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-5 py-3 font-medium">
                  {r.status === "published" ? (
                    <Link
                      to="/articles/$slug"
                      params={{ slug: r.slug }}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 hover:text-accent"
                    >
                      {r.title}
                      <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </Link>
                  ) : (
                    r.title
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    r.status === "published" ? "bg-teal-soft/30 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{r.status}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-xs">
                  {r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to="/admin/articles/$id" params={{ id: r.id }}
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
