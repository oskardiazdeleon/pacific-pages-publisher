import { MapPin, Heart, ArrowRight, Users, Tag } from "lucide-react";
import type { WeddingVenue } from "@/lib/wedding-venues";

interface Props {
  venue: WeddingVenue;
  variant?: "full" | "compact";
}

export function WeddingVenueCard({ venue, variant = "full" }: Props) {
  if (variant === "compact") {
    return (
      <a
        href={`/weddings/${venue.slug}`}
        className="not-prose group my-4 flex items-stretch gap-4 rounded-2xl border border-border bg-card p-3 no-underline transition hover:border-accent/50 hover:shadow-md"
      >
        <div className="relative aspect-[4/3] w-32 shrink-0 self-stretch overflow-hidden rounded-xl bg-muted sm:w-40">
          {venue.heroImage ? (
            <img
              src={venue.heroImage}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-primary/10 font-display text-2xl font-bold text-primary">
              {venue.name[0]}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <Heart className="h-3 w-3" /> Wedding venue
          </div>
          <div className="mt-0.5 truncate font-display text-base font-semibold text-foreground">
            {venue.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {[venue.neighborhood, venue.priceRange].filter(Boolean).join(" · ") || venue.tagline}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
      </a>
    );
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {venue.heroImage && (
        <a href={`/weddings/${venue.slug}`} className="block">
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={venue.heroImage}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur">
              <Heart className="h-3 w-3 text-accent" />
              Wedding venue
            </div>
          </div>
        </a>
      )}
      <div className="p-5 md:p-6">
        <a href={`/weddings/${venue.slug}`} className="no-underline">
          <h3 className="font-display text-2xl font-semibold leading-tight text-foreground">
            {venue.name}
          </h3>
        </a>
        {venue.tagline && (
          <p className="mt-1.5 text-sm text-muted-foreground">{venue.tagline}</p>
        )}

        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          {venue.neighborhood && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">Location</div>
                <div className="text-foreground">{venue.neighborhood}</div>
              </div>
            </div>
          )}
          {venue.capacity && (
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">Capacity</div>
                <div className="text-foreground">{venue.capacity}</div>
              </div>
            </div>
          )}
          {venue.priceRange && (
            <div className="flex items-start gap-2">
              <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">Price</div>
                <div className="text-foreground">{venue.priceRange}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {venue.bookingUrl && (
            <a
              href={venue.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground no-underline shadow-sm transition hover:opacity-90"
            >
              Inquire <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
          <a
            href={`/weddings/${venue.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground no-underline transition hover:bg-secondary"
          >
            View venue
          </a>
        </div>
      </div>
    </div>
  );
}

export function WeddingVenueCardSkeleton({ slug }: { slug: string }) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
      Loading wedding venue card for <code className="text-foreground">{slug}</code>…
    </div>
  );
}
