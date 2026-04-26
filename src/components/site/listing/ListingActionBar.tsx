import { useState } from "react";
import { Phone, Globe, Navigation, Heart, Share2, Check, CalendarCheck } from "lucide-react";
import { recordImpression } from "@/lib/content-queries";

type Props = {
  listingId: string;
  name: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  reservationUrl?: string | null;
  /** When true, render the compact mobile sticky bottom bar; otherwise the desktop chip row. */
  variant?: "inline" | "sticky";
};

function directionsUrl(address?: string | null) {
  if (!address) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function ListingActionBar({
  listingId,
  name,
  phone,
  website,
  address,
  reservationUrl,
  variant = "inline",
}: Props) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const dirs = directionsUrl(address);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: name,
          url,
        });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const base =
    variant === "sticky"
      ? "flex items-center justify-around gap-1 px-3 py-2 text-[11px]"
      : "flex flex-wrap items-center gap-2";
  const btn =
    variant === "sticky"
      ? "flex flex-col items-center gap-0.5 px-2 py-1 text-foreground/80 hover:text-foreground"
      : "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/95 backdrop-blur px-3.5 py-2 text-sm font-medium hover:bg-secondary transition";
  const primaryBtn =
    variant === "sticky"
      ? btn
      : "inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition";

  return (
    <div className={base}>
      {reservationUrl && (
        <a
          href={reservationUrl}
          target="_blank"
          rel="noreferrer noopener"
          className={primaryBtn}
          onClick={() => recordImpression(listingId, "reservation_click")}
        >
          <CalendarCheck className={variant === "sticky" ? "h-5 w-5" : "h-4 w-4"} />
          <span>Reserve</span>
        </a>
      )}
      {dirs && (
        <a
          href={dirs}
          target="_blank"
          rel="noreferrer"
          className={reservationUrl ? btn : primaryBtn}
          onClick={() => recordImpression(listingId, "click")}
        >
          <Navigation className={variant === "sticky" ? "h-5 w-5" : "h-4 w-4"} />
          <span>Directions</span>
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className={btn}
          onClick={() => recordImpression(listingId, "phone_click")}
        >
          <Phone className={variant === "sticky" ? "h-5 w-5" : "h-4 w-4"} />
          <span>{variant === "sticky" ? "Call" : "Call"}</span>
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className={btn}
          onClick={() => recordImpression(listingId, "website_click")}
        >
          <Globe className={variant === "sticky" ? "h-5 w-5" : "h-4 w-4"} />
          <span>Website</span>
        </a>
      )}
      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        className={btn}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save"}
      >
        <Heart
          className={`${variant === "sticky" ? "h-5 w-5" : "h-4 w-4"} ${saved ? "fill-accent text-accent" : ""}`}
        />
        <span>{saved ? "Saved" : "Save"}</span>
      </button>
      <button type="button" onClick={handleShare} className={btn} aria-label="Share">
        {copied ? (
          <Check className={variant === "sticky" ? "h-5 w-5" : "h-4 w-4"} />
        ) : (
          <Share2 className={variant === "sticky" ? "h-5 w-5" : "h-4 w-4"} />
        )}
        <span>{copied ? "Copied" : "Share"}</span>
      </button>
    </div>
  );
}
