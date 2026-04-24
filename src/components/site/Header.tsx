import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import sandiegoLogo from "@/assets/sandiego-logo.svg";

/**
 * Top navigation modeled on sandiego.com's information architecture.
 * Each top-level section maps to listing categories (the "listing types"
 * that live underneath it).
 */
type NavChild = { label: string; to: string; type?: string };
type NavSection = {
  label: string;
  to: string;
  children?: NavChild[];
};

const nav: NavSection[] = [
  {
    label: "Things To Do",
    to: "/listings",
    children: [
      { label: "Attractions", to: "/listings", type: "attraction" },
      { label: "Tours & Experiences", to: "/listings", type: "tour" },
      { label: "Outdoor & Beaches", to: "/listings", type: "outdoor" },
      { label: "Shopping", to: "/listings", type: "shopping" },
      { label: "Family Fun", to: "/listings", type: "family" },
    ],
  },
  {
    label: "Food & Drink",
    to: "/listings",
    children: [
      { label: "Restaurants", to: "/listings", type: "restaurant" },
      { label: "Breweries", to: "/listings", type: "brewery" },
      { label: "Wineries", to: "/listings", type: "winery" },
      { label: "Cafés & Bakeries", to: "/listings", type: "cafe" },
      { label: "Nightlife & Bars", to: "/listings", type: "nightlife" },
    ],
  },
  {
    label: "Places To Stay",
    to: "/listings",
    children: [
      { label: "Hotels", to: "/listings", type: "hotel" },
      { label: "Resorts", to: "/listings", type: "resort" },
      { label: "Boutique & B&Bs", to: "/listings", type: "boutique" },
      { label: "Vacation Rentals", to: "/listings", type: "rental" },
    ],
  },
  {
    label: "Sports & Events",
    to: "/listings",
    children: [
      { label: "Spectator Sports", to: "/listings", type: "spectator" },
      { label: "Water Sports", to: "/listings", type: "water-sports" },
      { label: "Golf", to: "/listings", type: "golf" },
      { label: "Live Events", to: "/listings", type: "event" },
    ],
  },
  {
    label: "Neighborhoods",
    to: "/neighborhoods",
  },
  {
    label: "Articles",
    to: "/articles",
  },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-display font-bold">
            SD
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            sandiego<span className="text-accent">.com</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {nav.map((section) => (
            <div key={section.label} className="group relative">
              <Link
                to={section.to}
                activeProps={{ className: "text-accent" }}
                activeOptions={{ exact: section.to === "/" }}
                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors"
              >
                {section.label}
                {section.children && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
              </Link>
              {section.children && (
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
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-secondary transition"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            to="/partners"
            className="hidden md:inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90 transition"
          >
            For Partners
          </Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-full border border-border"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container-page flex flex-col py-3">
            {nav.map((section) => {
              const isOpen = openSection === section.label;
              return (
                <div key={section.label} className="border-b border-border/60 last:border-0">
                  <div className="flex items-center justify-between">
                    <Link
                      to={section.to}
                      onClick={() => setOpen(false)}
                      className="flex-1 py-3 text-sm font-medium"
                    >
                      {section.label}
                    </Link>
                    {section.children && (
                      <button
                        onClick={() => setOpenSection(isOpen ? null : section.label)}
                        aria-label={`Toggle ${section.label}`}
                        className="grid h-9 w-9 place-items-center"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                  {section.children && isOpen && (
                    <div className="pb-3 pl-3">
                      {section.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.to}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-sm text-foreground/75 hover:text-foreground"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              to="/partners"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              For Partners
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
