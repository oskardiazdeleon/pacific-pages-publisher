import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ShieldCheck, ExternalLink, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { hubForCategory } from "@/lib/listing-categories";

export const Route = createFileRoute("/admin/claims")({
  component: AdminClaims,
});

type Claim = {
  id: string;
  listing_id: string;
  user_id: string;
  claimant_name: string;
  claimant_email: string;
  claimant_role: "owner" | "manager" | "marketing" | "other";
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  email_domain_match: boolean;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  listing?: {
    name: string;
    slug: string;
    category: string;
    neighborhood: string;
    website: string | null;
    partner_id: string | null;
  };
};

function AdminClaims() {
  const { user, isAdmin } = useAuth();
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [active, setActive] = useState<Claim | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    let q = supabase
      .from("listing_claims")
      .select(
        "id, listing_id, user_id, claimant_name, claimant_email, claimant_role, notes, status, email_domain_match, review_notes, created_at, reviewed_at"
      )
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      toast.error(error.message);
      return;
    }
    const rows = (data as Omit<Claim, "listing">[]) ?? [];
    const ids = Array.from(new Set(rows.map((r) => r.listing_id)));
    let listingMap: Record<string, Claim["listing"]> = {};
    if (ids.length) {
      const { data: ldata, error: lerr } = await supabase
        .from("listings")
        .select("id, name, slug, category, neighborhood, website, partner_id")
        .in("id", ids);
      if (lerr) {
        toast.error(lerr.message);
        return;
      }
      listingMap = Object.fromEntries(
        (ldata ?? []).map((l) => [
          l.id,
          {
            name: l.name,
            slug: l.slug,
            category: l.category as string,
            neighborhood: l.neighborhood,
            website: l.website,
            partner_id: l.partner_id,
          },
        ])
      );
    }
    setClaims(rows.map((r) => ({ ...r, listing: listingMap[r.listing_id] })));
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, filter]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    (claims ?? []).forEach((cl) => {
      c[cl.status] = (c[cl.status] ?? 0) + 1;
    });
    return c;
  }, [claims]);

  if (!isAdmin) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin only</h1>
      </div>
    );
  }

  const approve = async (claim: Claim) => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("listing_claims")
      .update({
        status: "approved",
        reviewed_by: user.id,
        review_notes: reason || null,
      })
      .eq("id", claim.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Claim approved — partner linked");
    setActive(null);
    setReason("");
    load();
  };

  const reject = async (claim: Claim) => {
    if (!user) return;
    if (!reason.trim()) {
      toast.error("Please add a reason");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("listing_claims")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        review_notes: reason,
      })
      .eq("id", claim.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Claim rejected");
    setActive(null);
    setReason("");
    load();
  };

  return (
    <div>
      <div className="eyebrow flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-accent" />
        Listing claims
      </div>
      <h1 className="mt-2 font-display text-4xl font-semibold">Claim review queue</h1>

      <div className="mt-6 flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground/70 hover:bg-secondary/70"
            }`}
          >
            {f}
            {f !== "all" && filter === "all" ? "" : ""}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {claims === null ? (
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        ) : claims.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No {filter} claims.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-left">
                <th className="p-3 font-medium">Listing</th>
                <th className="p-3 font-medium">Claimant</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Submitted</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => {
                    setActive(c);
                    setReason("");
                  }}
                  className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/30"
                >
                  <td className="p-3 font-medium">{c.listing?.name ?? "—"}</td>
                  <td className="p-3">{c.claimant_name}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{c.claimant_email}</span>
                      {c.email_domain_match && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Domain match
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 capitalize">{c.claimant_role}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <StatusPill status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 grid place-items-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="eyebrow">Claim</div>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {active.listing?.name}
                </h2>
                <div className="mt-1 text-xs text-muted-foreground">
                  {active.listing?.neighborhood} · {active.listing?.category}
                </div>
              </div>
              <StatusPill status={active.status} />
            </div>

            {active.listing?.partner_id && active.status === "pending" && (
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
                ⚠️ This listing already has a partner linked. Approving will reassign it.
              </div>
            )}

            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Name">{active.claimant_name}</Row>
              <Row label="Email">
                <span className="flex items-center gap-2">
                  <a
                    href={`mailto:${active.claimant_email}`}
                    className="text-accent inline-flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" /> {active.claimant_email}
                  </a>
                  {active.email_domain_match && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Matches website
                    </span>
                  )}
                </span>
              </Row>
              <Row label="Role">
                <span className="capitalize">{active.claimant_role}</span>
              </Row>
              {active.listing?.website && (
                <Row label="Website">
                  <a
                    href={active.listing.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent inline-flex items-center gap-1"
                  >
                    {active.listing.website} <ExternalLink className="h-3 w-3" />
                  </a>
                </Row>
              )}
              {active.notes && <Row label="Notes">{active.notes}</Row>}
              {active.review_notes && (
                <Row label="Review notes">{active.review_notes}</Row>
              )}
              {active.listing && (
                <Row label="Listing">
                  {(() => {
                    const hub = hubForCategory(active.listing.category);
                    if (!hub) return active.listing.slug;
                    return (
                      <Link
                        to="/$category/$slug"
                        params={{ category: hub.slug, slug: active.listing.slug }}
                        target="_blank"
                        className="text-accent inline-flex items-center gap-1"
                      >
                        View page <ExternalLink className="h-3 w-3" />
                      </Link>
                    );
                  })()}
                </Row>
              )}
            </dl>

            {active.status === "pending" && (
              <div className="mt-5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Review notes (required for reject)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Reason for rejection, or context for approval"
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => approve(active)}
                    disabled={busy}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => reject(active)}
                    disabled={busy}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setActive(null)}
              className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="sr-only">
        Counts — pending {counts.pending}, approved {counts.approved}, rejected {counts.rejected}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    rejected: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${map[status]}`}>
      {status}
    </span>
  );
}
