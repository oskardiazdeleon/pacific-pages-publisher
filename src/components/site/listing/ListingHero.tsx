import { Star } from "lucide-react";
import { ListingActionBar } from "./ListingActionBar";
import listingFallback from "@/assets/listing-restaurant.jpg";

type Props = {
  listing: {
    id: string;
    name: string;
    category: string;
    neighborhood: string;
    short_description?: string | null;
    hero_image?: string | null;
    rating?: number | null;
    price_range?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
  };
  openLabel?: string | null;
  openState?: "open" | "closed" | "unknown";
};

export function ListingHero({ listing, openLabel, openState }: Props) {
  const img = listing.hero_image || listingFallback;
  return (
    <section className="relative isolate">
      <div className="relative h-[64vh] min-h-[460px] w-full overflow-hidden">
        <img
          src={img}
          alt={listing.name}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* gradient scrims for legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent"
        />

        <div className="container-page relative z-10 flex h-full flex-col justify-end pb-10 md:pb-14">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
            <span>{listing.category}</span>
            <span className="opacity-50">·</span>
            <span>{listing.neighborhood}</span>
            {listing.price_range && (
              <>
                <span className="opacity-50">·</span>
                <span>{listing.price_range}</span>
              </>
            )}
            {listing.rating != null && (
              <>
                <span className="opacity-50">·</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white text-white" />
                  {Number(listing.rating).toFixed(1)}
                </span>
              </>
            )}
            {openLabel && (
              <>
                <span className="opacity-50">·</span>
                <span
                  className={`inline-flex items-center gap-1.5 normal-case tracking-normal ${
                    openState === "open" ? "text-emerald-300" : "text-white/80"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      openState === "open" ? "bg-emerald-400" : "bg-white/60"
                    }`}
                  />
                  {openLabel}
                </span>
              </>
            )}
          </div>

          <h1 className="mt-3 max-w-3xl font-display text-4xl md:text-6xl font-semibold text-white drop-shadow-sm">
            {listing.name}
          </h1>

          {listing.short_description && (
            <p className="mt-3 max-w-2xl text-base md:text-lg text-white/85">
              {listing.short_description}
            </p>
          )}

          <div className="mt-6 hidden md:block">
            <ListingActionBar
              listingId={listing.id}
              name={listing.name}
              phone={listing.phone}
              website={listing.website}
              address={listing.address}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
