import { MapPin, ArrowRight, Star, Tag, Sparkles } from "lucide-react";
import type { EmbedListing } from "@/lib/listings-embed";

interface Props {
  listing: EmbedListing;
  variant?: "full" | "compact";
}

export function ListingEmbedCard({ listing, variant = "full" }: Props) {
  if (variant === "compact") {
    return (
      <a
        href={listing.href}
        className="not-prose group my-4 flex items-stretch gap-4 rounded-2xl border border-border bg-card p-3 no-underline transition hover:border-accent/50 hover:shadow-md"
      >
        <div className="relative aspect-[4/3] w-32 shrink-0 self-stretch overflow-hidden rounded-xl bg-muted sm:w-40">
          {listing.heroImage ? (
            <img
              src={listing.heroImage}
              alt={listing.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-primary/10 font-display text-2xl font-bold text-primary">
              {listing.name[0]}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="h-3 w-3" /> {listing.category}
          </div>
          <div className="mt-0.5 truncate font-display text-base font-semibold text-foreground">
            {listing.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {[listing.neighborhood, listing.priceRange].filter(Boolean).join(" · ") || listing.tagline}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
      </a>
    );
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {listing.heroImage && (
        <a href={listing.href} className="block">
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={listing.heroImage}
              alt={listing.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" />
              {listing.category}
            </div>
          </div>
        </a>
      )}
      <div className="p-5 md:p-6">
        <a href={listing.href} className="no-underline">
          <h3 className="font-display text-2xl font-semibold leading-tight text-foreground">
            {listing.name}
          </h3>
        </a>
        {listing.tagline && (
          <p className="mt-1.5 text-sm text-muted-foreground">{listing.tagline}</p>
        )}

        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          {listing.neighborhood && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">Location</div>
                <div className="text-foreground">{listing.neighborhood}</div>
              </div>
            </div>
          )}
          {listing.rating != null && (
            <div className="flex items-start gap-2">
              <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">Rating</div>
                <div className="text-foreground">{Number(listing.rating).toFixed(1)}</div>
              </div>
            </div>
          )}
          {listing.priceRange && (
            <div className="flex items-start gap-2">
              <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">Price</div>
                <div className="text-foreground">{listing.priceRange}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {listing.bookingUrl && (
            <a
              href={listing.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground no-underline shadow-sm transition hover:opacity-90"
            >
              Book now <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
          <a
            href={listing.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground no-underline transition hover:bg-secondary"
          >
            View listing
          </a>
        </div>
      </div>
    </div>
  );
}

export function ListingEmbedCardSkeleton({ slug }: { slug: string }) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
      Loading listing card for <code className="text-foreground">{slug}</code>…
    </div>
  );
}
