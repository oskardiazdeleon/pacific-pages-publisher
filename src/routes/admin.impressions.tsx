import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hubForCategory } from "@/lib/listing-categories";

export const Route = createFileRoute("/admin/impressions")({
  component: ImpressionsPage,
});

interface Row {
  listing_id: string;
  listing_name: string;
  category: string | null;
  neighborhood: string | null;
  views: number;
  clicks: number;
}

function ImpressionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [neighborhood, setNeighborhood] = useState<string>("all");
  const [activity, setActivity] = useState<"all" | "viewed" | "clicked" | "no-clicks">("all");

  useEffect(() => {
    const load = async () => {
      const { data: imps } = await supabase
        .from("listing_impressions")
        .select("listing_id, impression_type, listings(name, category, neighborhood)")
        .limit(10000);

      const map = new Map<string, Row>();
      (imps ?? []).forEach((i) => {
        const l = i.listings as { name: string; category: string | null; neighborhood: string | null } | null;
        const r =
          map.get(i.listing_id) ??
          {
            listing_id: i.listing_id,
            listing_name: l?.name ?? "(unknown)",
            category: l?.category ?? null,
            neighborhood: l?.neighborhood ?? null,
            views: 0,
            clicks: 0,
          };
        if (i.impression_type === "view") r.views++;
        else r.clicks++;
        map.set(i.listing_id, r);
      });

      setRows([...map.values()].sort((a, b) => b.views - a.views));
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter((c): c is string => Boolean(c)))).sort(),
    [rows],
  );
  const neighborhoods = useMemo(
    () => Array.from(new Set(rows.map((r) => r.neighborhood).filter((n): n is string => Boolean(n)))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (neighborhood !== "all" && r.neighborhood !== neighborhood) return false;
      if (activity === "clicked" && r.clicks === 0) return false;
      if (activity === "no-clicks" && r.clicks > 0) return false;
      if (activity === "viewed" && r.views === 0) return false;
      if (q) {
        const hay = `${r.listing_name} ${r.neighborhood ?? ""} ${r.category ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, category, neighborhood, activity]);

  const totalViews = filtered.reduce((s, r) => s + r.views, 0);
  const totalClicks = filtered.reduce((s, r) => s + r.clicks, 0);
  const ctr = totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  const hasFilters =
    query.trim() !== "" || category !== "all" || neighborhood !== "all" || activity !== "all";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setNeighborhood("all");
    setActivity("all");
  };

  const selectClass =
    "h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="eyebrow">Analytics</div>
      <h1 className="mt-2 font-display text-4xl font-semibold">Impressions</h1>
      <p className="mt-2 text-muted-foreground">
        All-time views and clicks per listing. Partners see only their own listings; admins see all.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total views", value: totalViews.toLocaleString() },
          { label: "Total clicks", value: totalClicks.toLocaleString() },
          { label: "Avg CTR", value: `${ctr}%` },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <input
            type="search"
            placeholder="Search by listing, neighborhood, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="all">All categories</option>
            {categories.map((c) => {
              const hub = hubForCategory(c);
              return (
                <option key={c} value={c}>
                  {hub?.label ?? c}
                </option>
              );
            })}
          </select>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className={selectClass}
          >
            <option value="all">All neighborhoods</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as typeof activity)}
            className={selectClass}
          >
            <option value="all">All activity</option>
            <option value="viewed">Has views</option>
            <option value="clicked">Has clicks</option>
            <option value="no-clicks">Views, no clicks</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="h-10 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Showing {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} listings
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Listing</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Neighborhood</th>
              <th className="text-right px-5 py-3 font-medium">Views</th>
              <th className="text-right px-5 py-3 font-medium">Clicks</th>
              <th className="text-right px-5 py-3 font-medium">CTR</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  {rows.length === 0 ? "No impressions recorded yet." : "No listings match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const hub = hubForCategory(r.category);
                return (
                  <tr key={r.listing_id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{r.listing_name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{hub?.label ?? r.category ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.neighborhood ?? "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.views.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.clicks.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {r.views ? ((r.clicks / r.views) * 100).toFixed(1) : "0.0"}%
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
