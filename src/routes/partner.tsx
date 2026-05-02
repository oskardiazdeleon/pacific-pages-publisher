import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ListingForm, type ListingFormValues } from "@/components/admin/ListingForm";
import { hubForCategory } from "@/lib/listing-categories";

export const Route = createFileRoute("/partner")({
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

function PartnerDashboard() {
  const { user, loading, isPartner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<OwnedListing[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<ListingFormValues> | null>(null);

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
        Manage your Partner Spotlight — promote a special offer, product, or experience on your
        listing page.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
          ))
        ) : listings.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No listings linked to your account yet.
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
