import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/impressions")({
  component: ImpressionsPage,
});

interface Row {
  listing_id: string;
  listing_name: string;
  views: number;
  clicks: number;
}

function ImpressionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Aggregate client-side from impressions joined to listings
      const { data: imps } = await supabase
        .from("listing_impressions")
        .select("listing_id, impression_type, listings(name)")
        .limit(5000);

      const map = new Map<string, Row>();
      (imps ?? []).forEach((i) => {
        const name = (i.listings as { name: string } | null)?.name ?? "(unknown)";
        const r = map.get(i.listing_id) ?? { listing_id: i.listing_id, listing_name: name, views: 0, clicks: 0 };
        if (i.impression_type === "view") r.views++;
        else r.clicks++;
        map.set(i.listing_id, r);
      });

      setRows([...map.values()].sort((a, b) => b.views - a.views));
      setLoading(false);
    };
    load();
  }, []);

  const totalViews = rows.reduce((s, r) => s + r.views, 0);
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const ctr = totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div>
      <div className="eyebrow">Analytics</div>
      <h1 className="mt-2 font-display text-4xl font-semibold">Impressions</h1>
      <p className="mt-2 text-muted-foreground">
        All-time views and clicks per listing. Partners see only their own listings; admins see all.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total views", value: totalViews },
          { label: "Total clicks", value: totalClicks },
          { label: "Avg CTR", value: `${ctr}%` },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Listing</th>
              <th className="text-right px-5 py-3 font-medium">Views</th>
              <th className="text-right px-5 py-3 font-medium">Clicks</th>
              <th className="text-right px-5 py-3 font-medium">CTR</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">No impressions recorded yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.listing_id} className="border-t border-border">
                <td className="px-5 py-3 font-medium">{r.listing_name}</td>
                <td className="px-5 py-3 text-right tabular-nums">{r.views.toLocaleString()}</td>
                <td className="px-5 py-3 text-right tabular-nums">{r.clicks.toLocaleString()}</td>
                <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                  {r.views ? ((r.clicks / r.views) * 100).toFixed(1) : "0.0"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
