import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, FileText, Eye, MousePointerClick } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface Stats {
  listings: number;
  articles: number;
  impressions: number;
  clicks: number;
}

function AdminDashboard() {
  const { user, roles, canManageContent, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const [listings, articles, impressions, clicks] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase
          .from("listing_impressions")
          .select("id", { count: "exact", head: true })
          .eq("impression_type", "view"),
        supabase
          .from("listing_impressions")
          .select("id", { count: "exact", head: true })
          .neq("impression_type", "view"),
      ]);
      setStats({
        listings: listings.count ?? 0,
        articles: articles.count ?? 0,
        impressions: impressions.count ?? 0,
        clicks: clicks.count ?? 0,
      });
    };
    load();
  }, []);

  const cards = [
    { label: "Listings", value: stats?.listings ?? "—", icon: Building2, to: "/admin/listings" },
    { label: "Articles", value: stats?.articles ?? "—", icon: FileText, to: "/admin/articles" },
    { label: "Impressions", value: stats?.impressions ?? "—", icon: Eye, to: "/admin/impressions" },
    { label: "Clicks", value: stats?.clicks ?? "—", icon: MousePointerClick, to: "/admin/impressions" },
  ] as const;

  return (
    <div>
      <div className="eyebrow">Welcome back</div>
      <h1 className="mt-2 font-display text-4xl font-semibold">
        Hello, {user?.email?.split("@")[0]}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {canManageContent
          ? "Manage your site's content, listings, and partner reporting."
          : "You're signed in as a viewer. An admin can grant you editor or partner access."}
      </p>

      {roles.length === 0 || (!isAdmin && roles.length === 1 && roles[0] === "user") ? (
        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-sm">
          <strong>No admin role yet.</strong> To promote yourself to admin, run this in the database
          tool:
          <pre className="mt-2 overflow-x-auto rounded-lg bg-background p-3 text-xs">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user?.id}', 'admin');`}
          </pre>
        </div>
      ) : null}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <div className="mt-3 font-display text-3xl font-semibold">{c.value}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
