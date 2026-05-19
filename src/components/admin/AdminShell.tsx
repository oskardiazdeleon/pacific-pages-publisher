import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, FileText, Building2, BarChart3, Download, Settings, Menu as MenuIcon, Home, FileStack, Sparkles, KeyRound, MapPin, ShieldCheck, Ship, Users, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

type NavItem = {
  to: "/admin" | "/admin/listings" | "/admin/articles" | "/admin/blog" | "/admin/claims" | "/admin/impressions" | "/admin/import" | "/admin/cms/settings" | "/admin/cms/navigation" | "/admin/cms/homepage" | "/admin/cms/home-neighborhoods" | "/admin/cms/pages" | "/admin/cms/neighborhoods" | "/admin/cms/seo-neighborhoods" | "/admin/api-keys" | "/admin/cruises" | "/admin/users";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const navGroups: ReadonlyArray<{ heading?: string; items: ReadonlyArray<NavItem> }> = [
  {
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    heading: "Directory",
    items: [
      { to: "/admin/listings", label: "Listings", icon: Building2 },
      { to: "/admin/cruises", label: "Cruise Lines", icon: Ship },
    ],
  },
  {
    heading: "Editorial",
    items: [
      { to: "/admin/articles", label: "Articles", icon: FileText },
      { to: "/admin/blog", label: "Blog", icon: Sparkles },
    ],
  },
  {
    heading: "People",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/claims", label: "Claims", icon: ShieldCheck },
    ],
  },
  {
    heading: "Insights",
    items: [
      { to: "/admin/impressions", label: "Impressions", icon: BarChart3 },
      { to: "/admin/import", label: "Import", icon: Download },
    ],
  },
  {
    heading: "Site (CMS)",
    items: [
      { to: "/admin/cms/homepage", label: "Homepage", icon: Home },
      { to: "/admin/cms/home-neighborhoods", label: "Home Neighborhoods", icon: MapPin },
      { to: "/admin/cms/navigation", label: "Navigation", icon: MenuIcon },
      { to: "/admin/cms/pages", label: "Pages", icon: FileStack },
      { to: "/admin/cms/seo-neighborhoods", label: "Neighborhoods (master list)", icon: MapPin },
      { to: "/admin/cms/neighborhoods", label: "Neighborhood SEO Pages", icon: MapPin },
    ],
  },
  {
    heading: "System",
    items: [
      { to: "/admin/cms/settings", label: "Site Settings", icon: Settings },
      { to: "/admin/api-keys", label: "API Keys", icon: KeyRound },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Initialize collapsed state — keep group with active route open by default
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const g of navGroups) {
      if (!g.heading) continue;
      const hasActive = g.items.some((i) =>
        i.exact ? pathname === i.to : pathname.startsWith(i.to)
      );
      initial[g.heading] = !hasActive; // collapsed if no active child
    }
    return initial;
  });

  const toggle = (heading: string) =>
    setCollapsed((s) => ({ ...s, [heading]: !s[heading] }));

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-border bg-background md:sticky md:top-0 md:h-screen md:flex md:flex-col">
          <div className="p-6 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-display font-bold text-sm">
                SD
              </span>
              <span className="font-display font-semibold">Admin</span>
            </Link>
          </div>
          <nav className="px-3 pb-4 space-y-2 flex-1 overflow-y-auto">
            {navGroups.map((group, gi) => {
              const isCollapsed = group.heading ? collapsed[group.heading] : false;
              return (
                <div key={gi} className="space-y-1">
                  {group.heading ? (
                    <button
                      type="button"
                      onClick={() => toggle(group.heading!)}
                      className="w-full flex items-center justify-between px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground transition"
                    >
                      <span>{group.heading}</span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                      />
                    </button>
                  ) : null}
                  {!isCollapsed &&
                    group.items.map((item) => {
                      const Icon = item.icon;
                      const active = item.exact
                        ? pathname === item.to
                        : pathname.startsWith(item.to);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                </div>
              );
            })}
          </nav>
          <div className="border-t border-border p-4 hidden md:block bg-background shrink-0">
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {roles.map((r) => (
                <span
                  key={r}
                  className="text-[10px] uppercase tracking-wider rounded-full bg-accent/10 text-accent px-2 py-0.5 font-semibold"
                >
                  {r}
                </span>
              ))}
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </aside>

        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
