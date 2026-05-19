import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Megaphone, ArrowLeft, ExternalLink, BarChart3, MousePointerClick, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ListingForm, type ListingFormValues } from "@/components/admin/ListingForm";
import { hubForCategory } from "@/lib/listing-categories";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Partner Dashboard — sandiego.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerDashboard,
});

type OwnedListing = {
  id: string;
  name: string;
  slug: string;
  category: string;
  tier: "free" | "featured" | "premium";
  hero_image: string | null;
  partner_spotlight: unknown;
};

type ImpressionRow = { listing_id: string; impression_type: "view" | "click"; created_at: string };
type PerfStat = { views: number; clicks: number; views30: number; clicks30: number };

function PartnerDashboard() {
  const { user, loading, isPartner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<OwnedListing[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<ListingFormValues> | null>(null);
  const [stats, setStats] = useState<Record<string, PerfStat>>({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, name, slug, category, tier, hero_image, partner_spotlight")
        .eq("partner_id", user.id)
        .order("name");
      setListings((data as OwnedListing[] | null) ?? []);
    })();
  }, [user]);

  // Load impressions for the partner's listings. RLS already scopes the
  // listing_impressions table to rows the partner can see (partner_id match
  // or admin role), so we don't need to pass partner_id in the query.
  useEffect(() => {
    if (!user || !listings || listings.length === 0) {
      if (listings && listings.length === 0) setStatsLoading(false);
      return;
    }
    (async () => {
      setStatsLoading(true);
      const ids = listings.map((l) => l.id);
      const { data } = await supabase
        .from("listing_impressions")
        .select("listing_id, impression_type, created_at")
        .in("listing_id", ids)
        .limit(10000);

      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const map: Record<string, PerfStat> = {};
      for (const id of ids) {
        map[id] = { views: 0, clicks: 0, views30: 0, clicks30: 0 };
      }
      for (const r of (data as ImpressionRow[] | null) ?? []) {
        const s = map[r.listing_id];
        if (!s) continue;
        const recent = new Date(r.created_at).getTime() >= cutoff;
        if (r.impression_type === "view") {
          s.views++;
          if (recent) s.views30++;
        } else {
          s.clicks++;
          if (recent) s.clicks30++;
        }
      }
      setStats(map);
      setStatsLoading(false);
    })();
  }, [user, listings]);

  const totals = useMemo(() => {
    const t = { views: 0, clicks: 0, views30: 0, clicks30: 0 };
    for (const s of Object.values(stats)) {
      t.views += s.views;
      t.clicks += s.clicks;
      t.views30 += s.views30;
      t.clicks30 += s.clicks30;
    }
    return t;
  }, [stats]);

  const ctrPct = (clicks: number, views: number) =>
    views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

  const startEdit = async (id: string) => {
    const { data: row } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
    if (!row) return;
    setEditingId(id);
    setEditingData({
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category as ListingFormValues["category"],
      neighborhood: row.neighborhood,
      tier: row.tier,
      status: row.status,
      partner_spotlight: ((row.partner_spotlight ?? {}) as unknown) as ListingFormValues["partner_spotlight"],
    });
  };

  if (loading) {
    return <div className="container-page py-20 text-muted-foreground">Loading…</div>;
  }

  if (!isPartner && !isAdmin) {
    return (
      <div className="container-page py-20">
        <h1 className="font-display text-3xl font-semibold">Partner access required</h1>
        <p className="mt-3 text-muted-foreground">
          This area is for verified partners. Contact us if you believe you should have access.
        </p>
        <Link to="/" className="mt-6 inline-flex items-center gap-1 text-accent">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
    );
  }

  if (editingId && editingData) {
    return (
      <div className="container-page py-12 max-w-3xl">
        <button
          onClick={() => {
            setEditingId(null);
            setEditingData(null);
          }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All my listings
        </button>
        <div className="eyebrow mt-4 flex items-center gap-2">
          <Megaphone className="h-3.5 w-3.5 text-accent" />
          Partner Spotlight
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">{editingData.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit your spotlight module — shown in the sidebar of your listing page.
        </p>
        <div className="mt-8">
          <ListingForm initial={editingData} partnerMode />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="eyebrow flex items-center gap-2">
        <Megaphone className="h-3.5 w-3.5 text-accent" />
        Partner dashboard
      </div>
      <h1 className="mt-2 font-display text-4xl font-semibold">Your listings</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Track how your listing is performing and manage your Partner Spotlight.
      </p>

      {/* Performance summary — totals across this partner's listings */}
      {listings && listings.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <div className="eyebrow flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-accent" />
                Performance
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold">Your traffic at a glance</h2>
            </div>
            <span className="text-xs text-muted-foreground">All-time · last 30 days</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" /> Listing views
              </div>
              <div className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {statsLoading ? "—" : totals.views.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                {statsLoading ? "" : `${totals.views30.toLocaleString()} in last 30 days`}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MousePointerClick className="h-3.5 w-3.5" /> Clicks to your site
              </div>
              <div className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {statsLoading ? "—" : totals.clicks.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                {statsLoading ? "" : `${totals.clicks30.toLocaleString()} in last 30 days`}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" /> Click-through rate
              </div>
              <div className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {statsLoading ? "—" : `${ctrPct(totals.clicks, totals.views)}%`}
              </div>
              <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                {statsLoading ? "" : `${ctrPct(totals.clicks30, totals.views30)}% last 30 days`}
              </div>
            </div>
          </div>

          {/* Per-listing breakdown */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Listing</th>
                  <th className="text-right px-5 py-3 font-medium">Views (30d)</th>
                  <th className="text-right px-5 py-3 font-medium">Clicks (30d)</th>
                  <th className="text-right px-5 py-3 font-medium">CTR</th>
                  <th className="text-right px-5 py-3 font-medium">All-time views</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const s = stats[l.id] ?? { views: 0, clicks: 0, views30: 0, clicks30: 0 };
                  return (
                    <tr key={l.id} className="border-t border-border">
                      <td className="px-5 py-3 font-medium">{l.name}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{s.views30.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{s.clicks30.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                        {ctrPct(s.clicks30, s.views30)}%
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                        {s.views.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="mt-12 mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow flex items-center gap-2">
            <Megaphone className="h-3.5 w-3.5 text-accent" />
            Manage
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold">Your listings</h2>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
          ))
        ) : listings.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">No listings linked to your account yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Find your business in our directory and submit a claim — once approved by our team,
              it'll show up here.
            </p>
            <Link
              to="/listings"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          listings.map((l) => {
            const hub = hubForCategory(l.category);
            const tierAllows = l.tier === "featured" || l.tier === "premium";
            const spot = (l.partner_spotlight ?? {}) as { enabled?: boolean; title?: string };
            const hasSpot = Boolean(spot.enabled && spot.title);
            return (
              <div
                key={l.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div
                  className="aspect-[4/3] bg-muted bg-cover bg-center"
                  style={l.hero_image ? { backgroundImage: `url(${l.hero_image})` } : undefined}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-semibold truncate">{l.name}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        tierAllows
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {l.tier}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {hasSpot ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Spotlight live
                      </span>
                    ) : tierAllows ? (
                      "No spotlight yet"
                    ) : (
                      "Upgrade to Featured to add a spotlight"
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => startEdit(l.id)}
                      disabled={!tierAllows}
                      className="flex-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {hasSpot ? "Edit spotlight" : "Add spotlight"}
                    </button>
                    {hub && (
                      <a
                        href={`/${hub.slug}/${l.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
