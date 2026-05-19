import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, X, LogOut, LayoutDashboard, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import sandiegoLogo from "@/assets/sandiego-logo.png";
import { fetchPublishedMenu, fetchPublishedSettings, type NavItem, type SiteSettingsMap } from "@/lib/cms";
import { insiderUTM, partnerUTM } from "@/lib/utm";
import { useAuth } from "@/lib/auth";

const FALLBACK_NAV: NavItem[] = [
  { label: "Things To Do", to: "/things-to-do" },
  { label: "Food & Drink", to: "/restaurants" },
  { label: "Places To Stay", to: "/hotels" },
  { label: "Cruises", to: "/cruises" },
  { label: "Wineries", to: "/wineries" },
  { label: "Neighborhoods", to: "/neighborhoods" },
  { label: "Articles", to: "/articles" },
  { label: "Blog", to: "/blog" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [nav, setNav] = useState<NavItem[]>(FALLBACK_NAV);
  const [settings, setSettings] = useState<SiteSettingsMap>({});
  const accountRef = useRef<HTMLDivElement | null>(null);
  const { user, isAdmin, isEditor, isPartner, signOut } = useAuth();
  const navigate = useNavigate();

  // Where this user's "dashboard" lives — partners land on /partner,
  // editors/admins on /admin. Plain logged-in users get sent home.
  const dashboardTo: "/partner" | "/admin" | "/" = isAdmin || isEditor
    ? "/admin"
    : isPartner
      ? "/partner"
      : "/";
  const dashboardLabel = isAdmin || isEditor ? "Admin" : isPartner ? "Partner dashboard" : "Account";

  useEffect(() => {
    (async () => {
      const [items, s] = await Promise.all([fetchPublishedMenu("header"), fetchPublishedSettings()]);
      if (items.length) setNav(items);
      setSettings(s);
    })();
  }, []);

  // Close the account dropdown when clicking outside.
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [accountOpen]);

  const handleSignOut = async () => {
    setAccountOpen(false);
    await signOut();
    navigate({ to: "/" });
  };

  const siteName = settings.brand?.site_name || "sandiego.com";
  const logoUrl = settings.brand?.logo_url || sandiegoLogo;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label={`${siteName} home`}>
          <img src={logoUrl} alt={siteName} className="h-9 w-auto" />
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5 text-sm font-medium">
          {nav.map((section) => (
            <div key={section.label} className="group relative">
              <Link
                to={section.to}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
              >
                {section.label}
                {section.children?.length ? <ChevronDown className="h-3.5 w-3.5 opacity-60" /> : null}
              </Link>
              {section.children?.length ? (
                <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 absolute left-0 top-full pt-2 min-w-[220px] z-50">
                  <div className="rounded-xl border border-border bg-popover text-popover-foreground shadow-xl p-2">
                    {section.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.to}
                        className="block rounded-md px-3 py-2 text-sm text-foreground/85 hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button aria-label="Search" className="hidden sm:grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-secondary transition">
            <Search className="h-4 w-4" />
          </button>
          <Link to="/partners" search={partnerUTM("header")} className="hidden xl:inline-flex items-center rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground/75 hover:text-foreground hover:bg-secondary transition whitespace-nowrap">
            For Partners
          </Link>

          {user ? (
            <div ref={accountRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Account menu"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-secondary transition"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent">
                  <UserRound className="h-3.5 w-3.5" />
                </span>
                <span className="max-w-[140px] truncate">{user.email}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {accountOpen && (
                <div role="menu" className="absolute right-0 top-full mt-2 min-w-[220px] rounded-xl border border-border bg-popover text-popover-foreground shadow-xl p-2 z-50">
                  <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    Signed in as
                  </div>
                  <div className="px-3 pb-2 text-sm truncate">{user.email}</div>
                  {dashboardTo !== "/" && (
                    <Link
                      to={dashboardTo}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {dashboardLabel}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden md:inline-flex items-center rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground/75 hover:text-foreground hover:bg-secondary transition whitespace-nowrap"
            >
              Sign in
            </Link>
          )}

          <Link to="/insider" search={insiderUTM("header")} className="hidden md:inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90 transition whitespace-nowrap">
            Join Insider
          </Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden grid h-9 w-9 place-items-center rounded-full border border-border"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border bg-background">
          <nav className="container-page flex flex-col py-3">
            {nav.map((section) => {
              const isOpen = openSection === section.label;
              return (
                <div key={section.label} className="border-b border-border/60 last:border-0">
                  <div className="flex items-center justify-between">
                    <Link to={section.to} onClick={() => setOpen(false)} className="flex-1 py-3 text-sm font-medium">
                      {section.label}
                    </Link>
                    {section.children?.length ? (
                      <button onClick={() => setOpenSection(isOpen ? null : section.label)} aria-label={`Toggle ${section.label}`} className="grid h-9 w-9 place-items-center">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    ) : null}
                  </div>
                  {section.children?.length && isOpen ? (
                    <div className="pb-3 pl-3">
                      {section.children.map((child) => (
                        <Link key={child.label} to={child.to} onClick={() => setOpen(false)} className="block py-2 text-sm text-foreground/75 hover:text-foreground">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <Link to="/insider" search={insiderUTM("header")} onClick={() => setOpen(false)} className="mt-3 inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground">
              Join Insider
            </Link>
            <Link to="/partners" search={partnerUTM("header")} onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground/80">
              For Partners
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
