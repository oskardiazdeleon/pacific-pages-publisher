import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, FileText, Building2, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/listings", label: "Listings", icon: Building2 },
  { to: "/admin/articles", label: "Articles", icon: FileText },
  { to: "/admin/impressions", label: "Impressions", icon: BarChart3 },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-border bg-background md:min-h-screen">
          <div className="p-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-display font-bold text-sm">
                SD
              </span>
              <span className="font-display font-semibold">Admin</span>
            </Link>
          </div>
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
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
          </nav>
          <div className="absolute bottom-0 w-full md:w-[260px] border-t border-border p-4 hidden md:block">
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
