import { Megaphone, ArrowUpRight } from "lucide-react";
import { recordImpression } from "@/lib/content-queries";

export type PartnerSpotlightData = {
  enabled?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
};

export function isSpotlightVisible(s: PartnerSpotlightData | null | undefined): boolean {
  if (!s) return false;
  if (s.enabled === false) return false;
  // Need at least a title to show
  return Boolean((s.title ?? "").trim());
}

export function PartnerSpotlight({
  spotlight,
  listingId,
  listingName,
  variant = "sidebar",
}: {
  spotlight: PartnerSpotlightData;
  listingId: string;
  listingName: string;
  variant?: "sidebar" | "inline";
}) {
  const handleClick = () => {
    recordImpression(listingId, "click");
  };

  const eyebrow = (spotlight.eyebrow || "Partner Spotlight").trim();
  const title = (spotlight.title || "").trim();
  const description = (spotlight.description || "").trim();
  const cta = (spotlight.cta_label || "Learn more").trim();
  const url = (spotlight.cta_url || "").trim();

  const inner = (
    <div className="overflow-hidden rounded-3xl border border-accent/40 bg-gradient-to-br from-accent/15 via-card to-card shadow-sm">
      {spotlight.image_url ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
          <img
            src={spotlight.image_url}
            alt={title || listingName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="p-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
          <Megaphone className="h-3 w-3" />
          {eyebrow}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener sponsored"
            onClick={handleClick}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
          >
            {cta}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : null}
        <p className="mt-2 text-[11px] text-muted-foreground/80 text-center">
          Sponsored by {listingName}
        </p>
      </div>
    </div>
  );

  if (variant === "inline") {
    return <div className="lg:hidden mt-6">{inner}</div>;
  }
  return inner;
}
