import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/listings/")({
  component: AdminListings,
});

interface Row {
  id: string;
  name: string;
  slug: string;
  category: string;
  neighborhood: string;
  tier: string;
  status: string;
  rating: number | null;
  updated_at: string;
}

function AdminListings() {
  const { canManageContent } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, name, slug, category, neighborhood, tier, status, rating, updated_at")
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
          <div className="eyebrow">Directory</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">Listings</h1>
        </div>
        {canManageContent && (
          <Link
            to="/admin/listings/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New listing
          </Link>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Neighborhood</th>
              <th className="text-left px-5 py-3 font-medium">Tier</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No listings yet. Create your first one.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-5 py-3 font-medium">{r.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.neighborhood}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    r.tier === "premium" ? "bg-primary text-primary-foreground" :
                    r.tier === "featured" ? "bg-accent text-accent-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>{r.tier}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    r.status === "published" ? "bg-teal-soft/30 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{r.status}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to="/admin/listings/$id"
                    params={{ id: r.id }}
                    className="inline-flex items-center gap-1 text-accent text-xs font-medium"
                  >
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
