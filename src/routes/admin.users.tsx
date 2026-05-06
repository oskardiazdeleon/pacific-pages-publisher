import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Shield, ShieldCheck, UserCog, ExternalLink, UserPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { hubForCategory } from "@/lib/listing-categories";
import { adminCreateUser } from "@/server/users.functions";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsers,
});

type AppRole = "admin" | "editor" | "partner" | "user";

type Profile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  partner_company: string | null;
  created_at: string;
};

type RoleRow = { user_id: string; role: AppRole };
type ClaimRow = {
  id: string;
  user_id: string;
  listing_id: string;
  status: "pending" | "approved" | "rejected";
  claimant_email: string;
  claimant_role: string;
  created_at: string;
};
type ListingRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  partner_id: string | null;
};

type UserRow = {
  profile: Profile;
  roles: AppRole[];
  claims: ClaimRow[];
  ownedListings: ListingRow[];
};

const ALL_ROLES: AppRole[] = ["admin", "editor", "partner", "user"];

function AdminUsers() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [listingsById, setListingsById] = useState<Record<string, ListingRow>>({});
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const [{ data: profiles, error: pe }, { data: roles, error: re }, { data: claims, error: ce }, { data: listings, error: le }] =
      await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url, partner_company, created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("listing_claims").select("id, user_id, listing_id, status, claimant_email, claimant_role, created_at").order("created_at", { ascending: false }),
        supabase.from("listings").select("id, name, slug, category, partner_id"),
      ]);
    if (pe || re || ce || le) {
      toast.error((pe || re || ce || le)!.message);
      return;
    }
    const lmap: Record<string, ListingRow> = {};
    (listings as ListingRow[] ?? []).forEach((l) => (lmap[l.id] = l));
    setListingsById(lmap);

    const rolesByUser: Record<string, AppRole[]> = {};
    (roles as RoleRow[] ?? []).forEach((r) => {
      (rolesByUser[r.user_id] ??= []).push(r.role);
    });
    const claimsByUser: Record<string, ClaimRow[]> = {};
    (claims as ClaimRow[] ?? []).forEach((c) => {
      (claimsByUser[c.user_id] ??= []).push(c);
    });
    const ownedByUser: Record<string, ListingRow[]> = {};
    (listings as ListingRow[] ?? []).forEach((l) => {
      if (l.partner_id) (ownedByUser[l.partner_id] ??= []).push(l);
    });

    setRows(
      (profiles as Profile[] ?? []).map((p) => ({
        profile: p,
        roles: rolesByUser[p.user_id] ?? [],
        claims: claimsByUser[p.user_id] ?? [],
        ownedListings: ownedByUser[p.user_id] ?? [],
      })),
    );
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const name = r.profile.display_name?.toLowerCase() ?? "";
      const email = r.claims[0]?.claimant_email?.toLowerCase() ?? "";
      const co = r.profile.partner_company?.toLowerCase() ?? "";
      return name.includes(needle) || email.includes(needle) || co.includes(needle);
    });
  }, [rows, q]);

  const toggleRole = async (userId: string, role: AppRole, has: boolean) => {
    setBusyId(userId + role);
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) toast.error(error.message);
      else toast.success(`Removed ${role}`);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) toast.error(error.message);
      else toast.success(`Granted ${role}`);
    }
    setBusyId(null);
    load();
  };

  if (!isAdmin) {
    return <p className="text-sm text-muted-foreground">Admins only.</p>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registered users, their roles, claims, and listings they manage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, company…"
              className="w-72 rounded-full border border-border bg-background pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" /> New user
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {!filtered ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.profile.user_id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                      {u.profile.display_name || "(no name)"}
                    </span>
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] uppercase tracking-wider rounded-full bg-accent/10 text-accent px-2 py-0.5 font-semibold"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  {u.profile.partner_company && (
                    <div className="text-xs text-muted-foreground mt-1">{u.profile.partner_company}</div>
                  )}
                  {u.claims[0]?.claimant_email && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {u.claims[0].claimant_email}
                    </div>
                  )}
                  <div className="text-[11px] text-muted-foreground/70 mt-1">
                    Joined {new Date(u.profile.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ALL_ROLES.map((r) => {
                    const has = u.roles.includes(r);
                    const busy = busyId === u.profile.user_id + r;
                    return (
                      <button
                        key={r}
                        disabled={busy}
                        onClick={() => toggleRole(u.profile.user_id, r, has)}
                        className={`text-xs rounded-full px-3 py-1 border transition ${
                          has
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:bg-secondary"
                        } disabled:opacity-50`}
                      >
                        {has ? "− " : "+ "}{r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(u.ownedListings.length > 0 || u.claims.length > 0) && (
                <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" /> Owned listings ({u.ownedListings.length})
                    </div>
                    {u.ownedListings.length === 0 ? (
                      <p className="text-xs text-muted-foreground">None</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {u.ownedListings.map((l) => (
                          <li key={l.id} className="flex items-center gap-2 text-sm">
                            <Link
                              to="/admin/listings/$id"
                              params={{ id: l.id }}
                              className="hover:underline truncate"
                            >
                              {l.name}
                            </Link>
                            <a
                              href={`/${hubForCategory(l.category)}/${l.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <UserCog className="h-3.5 w-3.5" /> Claims ({u.claims.length})
                    </div>
                    {u.claims.length === 0 ? (
                      <p className="text-xs text-muted-foreground">None</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {u.claims.map((c) => {
                          const l = listingsById[c.listing_id];
                          return (
                            <li key={c.id} className="text-sm flex items-center gap-2">
                              <span
                                className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold ${
                                  c.status === "approved"
                                    ? "bg-emerald-500/15 text-emerald-700"
                                    : c.status === "rejected"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-muted text-foreground/70"
                                }`}
                              >
                                {c.status}
                              </span>
                              <span className="truncate">{l?.name ?? c.listing_id}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <Link to="/admin/claims" className="text-xs text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Manage claims
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
