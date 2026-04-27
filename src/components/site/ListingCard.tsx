import { Star, Heart, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { listingUrl } from "@/lib/listing-categories";
import listingFallback from "@/assets/listing-restaurant.jpg";

export interface ListingCardData {
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  short_description?: string | null;
  blurb?: string | null;
  hero_image?: string | null;
  image?: string | null;
  tier: "free" | "featured" | "premium";
  rating?: number | null;
  price_range?: string | null;
  is_sponsored?: boolean | null;
  sponsor_name?: string | null;
  sponsor_until?: string | null;
}

// Lightweight, deterministic "insight" per category to drive engagement
// without requiring extra DB fields. Replace with real data when available.
function ctaFor(category: string): string {
  const c = (category || "").toLowerCase();
  if (c.includes("hotel") || c.includes("resort")) return "Book now";
  if (c.includes("restaurant")) return "Reserve";
  if (c.includes("tour")) return "Book tour";
  if (c.includes("attraction")) return "Get tickets";
  if (c.includes("nightlife") || c.includes("bar")) return "View details";
  if (c.includes("shopping")) return "Visit";
  return "View details";
}

function priceLabel(price?: string | null): string | null {
  if (!price) return null;
  // Accept "$$", "$$$" or numeric-ish strings
  if (/^\$+$/.test(price)) return `${price} · per night`;
  return price;
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const img = listing.hero_image || listing.image || listingFallback;
  const desc = listing.short_description || listing.blurb || "";
  const insight = insightFor(listing.category);
  const price = priceLabel(listing.price_range);
  const sponsored =
    !!listing.is_sponsored &&
    (!listing.sponsor_until || new Date(listing.sponsor_until) > new Date());
  const [saved, setSaved] = useState(false);

  const toggleSave = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
  };

  return (
    <a
      href={listingUrl(listing)}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-3xl"
    >
      {/* Image frame — Airbnb-style fully rounded, no card border around image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
        <img
          src={img}
          alt={listing.name}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {/* subtle bottom gradient for chip legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-foreground/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {/* Sponsored / tier / insight chip — top left */}
        <div className="absolute left-3 top-3 flex items-center gap-2 max-w-[80%]">
          {sponsored ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background shadow-sm backdrop-blur"
              title={listing.sponsor_name ? `Promoted by ${listing.sponsor_name}` : "Sponsored placement"}
            >
              <Sparkles className="h-3 w-3" />
              Sponsored{listing.sponsor_name ? ` · ${listing.sponsor_name}` : ""}
            </span>
          ) : listing.tier !== "free" ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur ${
                listing.tier === "premium"
                  ? "bg-primary/95 text-primary-foreground"
                  : "bg-accent/95 text-accent-foreground"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              {listing.tier === "premium" ? "Premium" : "Featured"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/80 shadow-sm backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" />
              {insight}
            </span>
          )}
        </div>

        {/* Save / heart — top right */}
        <button
          type="button"
          onClick={toggleSave}
          aria-label={saved ? "Remove from saved" : "Save listing"}
          aria-pressed={saved}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 backdrop-blur shadow-sm hover:bg-background hover:scale-105 active:scale-95 transition"
        >
          <Heart
            className={`h-4 w-4 transition ${
              saved ? "fill-accent text-accent" : "text-foreground/70"
            }`}
          />
        </button>

        {/* Hover CTA — bottom right */}
        <div className="absolute right-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-md">
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Text block — minimal, Airbnb-style */}
      <div className="px-1 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[17px] font-semibold leading-tight text-foreground line-clamp-1">
            {listing.name}
          </h3>
          {listing.rating != null && (
            <span className="shrink-0 inline-flex items-center gap-1 text-sm text-foreground">
              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
              {Number(listing.rating).toFixed(1)}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {listing.neighborhood}
            <span className="mx-1.5 opacity-50">·</span>
            {listing.category}
          </span>
        </div>

        {desc && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{desc}</p>
        )}

        <div className="mt-2.5 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            {price ?? <span className="text-accent">Check availability</span>}
          </span>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {insight}
          </span>
        </div>
      </div>
    </a>
  );
}
