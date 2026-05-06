import { Anchor, Ship, ArrowRight, Calendar, Tag } from "lucide-react";
import type { CruiseLine } from "@/lib/cruise-lines";

interface Props {
  cruise: CruiseLine;
  variant?: "full" | "compact";
}

export function CruiseCard({ cruise, variant = "full" }: Props) {
  if (variant === "compact") {
    return (
      <a
        href={`/cruises/${cruise.slug}`}
        className="not-prose group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 no-underline transition hover:border-accent/50 hover:shadow-md"
      >
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
          {cruise.heroImage ? (
            <img
              src={cruise.heroImage}
              alt={cruise.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-primary/10 font-display text-2xl font-bold text-primary">
              {cruise.logoLetter || cruise.name[0]}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <Ship className="h-3 w-3" /> Cruise line
          </div>
          <div className="mt-0.5 truncate font-display text-base font-semibold text-foreground">
            {cruise.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {cruise.tagline || cruise.bestFor}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
      </a>
    );
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {cruise.heroImage && (
        <a href={`/cruises/${cruise.slug}`} className="block">
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={cruise.heroImage}
              alt={cruise.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur">
              <Ship className="h-3 w-3 text-accent" />
              Cruise line
            </div>
          </div>
        </a>
      )}
      <div className="p-5 md:p-6">
        <a href={`/cruises/${cruise.slug}`} className="no-underline">
          <h3 className="font-display text-2xl font-semibold leading-tight text-foreground">
            {cruise.name}
          </h3>
        </a>
        {cruise.tagline && (
          <p className="mt-1.5 text-sm text-muted-foreground">{cruise.tagline}</p>
        )}

        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          {cruise.homePort && (
            <div className="flex items-start gap-2">
              <Anchor className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">Home port</div>
                <div className="text-foreground">{cruise.homePort}</div>
              </div>
            </div>
          )}
          {cruise.seasonality && (
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">Season</div>
                <div className="text-foreground">{cruise.seasonality}</div>
              </div>
            </div>
          )}
          {cruise.priceFrom && (
            <div className="flex items-start gap-2">
              <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-muted-foreground">From</div>
                <div className="text-foreground">{cruise.priceFrom}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {cruise.bookingUrl && (
            <a
              href={cruise.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground no-underline shadow-sm transition hover:opacity-90"
            >
              Book cruise <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
          <a
            href={`/cruises/${cruise.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground no-underline transition hover:bg-secondary"
          >
            View details
          </a>
        </div>
      </div>
    </div>
  );
}

/** Lightweight skeleton used while data is loading or for unknown slugs. */
export function CruiseCardSkeleton({ slug }: { slug: string }) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
      Loading cruise card for <code className="text-foreground">{slug}</code>…
    </div>
  );
}
