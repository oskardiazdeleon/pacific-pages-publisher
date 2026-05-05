import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Megaphone, ExternalLink, Search, X } from "lucide-react";
import { toast } from "sonner";
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
  is_sponsored: boolean;
  sponsor_name: string | null;
  sponsor_rank: number | null;
  sponsor_until: string | null;
}

function AdminListings() {
  const { canManageContent } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase
      .from("listings")
      .select(
        "id, name, slug, category, neighborhood, tier, status, rating, updated_at, is_sponsored, sponsor_name, sponsor_rank, sponsor_until",
      )
      .order("is_sponsored", { ascending: false })
      .order("sponsor_rank", { ascending: false })
      .order("updated_at", { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePromote = async (row: Row) => {
    setBusyId(row.id);
    const next = !row.is_sponsored;
    const { error } = await supabase
      .from("listings")
      .update({
        is_sponsored: next,
        // give it a default rank when first promoted so it floats to top
        sponsor_rank: next && (!row.sponsor_rank || row.sponsor_rank === 0) ? 100 : row.sponsor_rank ?? 0,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next ? `${row.name} is now promoted` : `Promotion removed from ${row.name}`);
    load();
  };

  const isActiveSponsor = (r: Row) =>
    r.is_sponsored && (!r.sponsor_until || new Date(r.sponsor_until) > new Date());

  const categories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).sort();
  const q = query.trim().toLowerCase();
  const filteredRows = rows.filter((r) => {
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      (r.neighborhood ?? "").toLowerCase().includes(q) ||
      (r.category ?? "").toLowerCase().includes(q) ||
      (r.sponsor_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Directory</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">Listings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Promote a sponsor or partner to surface them at the top of every relevant feed.
          </p>
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, neighborhood, category, sponsor…"
            className="w-full rounded-full border border-border bg-card pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <span className="text-xs text-muted-foreground">
          {loading ? "" : `${filteredRows.length} of ${rows.length}`}
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Neighborhood</th>
              <th className="text-left px-5 py-3 font-medium">Tier</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Promotion</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                  No listings yet. Create your first one.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const active = isActiveSponsor(r);
                return (
                  <tr key={r.id} className={`border-t border-border ${active ? "bg-accent/5" : ""}`}>
                    <td className="px-5 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {active && <Megaphone className="h-3.5 w-3.5 text-accent" aria-label="Promoted" />}
                        {r.name}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.neighborhood}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          r.tier === "premium"
                            ? "bg-primary text-primary-foreground"
                            : r.tier === "featured"
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.tier}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          r.status === "published"
                            ? "bg-teal-soft/30 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {active ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                            Sponsored
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {r.sponsor_name ? `${r.sponsor_name} · ` : ""}rank {r.sponsor_rank ?? 0}
                            {r.sponsor_until
                              ? ` · until ${new Date(r.sponsor_until).toLocaleDateString()}`
                              : ""}
                          </span>
                        </div>
                      ) : r.is_sponsored && r.sponsor_until ? (
                        <span className="text-[11px] text-muted-foreground">Expired</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {canManageContent && (
                          <button
                            onClick={() => togglePromote(r)}
                            disabled={busyId === r.id}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                              active
                                ? "bg-foreground text-background hover:opacity-80"
                                : "border border-border hover:bg-secondary"
                            } disabled:opacity-50`}
                            title={active ? "Stop promoting" : "Promote to top"}
                          >
                            <Megaphone className="h-3 w-3" />
                            {active ? "Promoted" : "Promote"}
                          </button>
                        )}
                        <a
                          href={`/listings/${r.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs font-medium"
                          title="View public listing"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </a>
                        <Link
                          to="/admin/listings/$id"
                          params={{ id: r.id }}
                          className="inline-flex items-center gap-1 text-accent text-xs font-medium"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
