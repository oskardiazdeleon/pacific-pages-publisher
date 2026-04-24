import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Listing } from "@/lib/mock-data";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      to="/listings"
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.name}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {listing.tier !== "free" && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              listing.tier === "premium"
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {listing.tier}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{listing.category} · {listing.neighborhood}</span>
          <span className="inline-flex items-center gap-1 text-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {listing.rating}
          </span>
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold">{listing.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{listing.blurb}</p>
      </div>
    </Link>
  );
}
