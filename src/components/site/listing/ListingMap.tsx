import { MapPin, Navigation } from "lucide-react";

/**
 * Renders an embedded OpenStreetMap iframe centered on the listing address (no API key).
 * The iframe takes a search query via OSM's "marker=lat,lon" or via the search-based embed.
 * We use the address-based embed so we don't need geocoding upfront.
 */
export function ListingMap({
  address,
  name,
}: {
  address?: string | null;
  name: string;
}) {
  if (!address) return null;
  const query = encodeURIComponent(`${address}, San Diego, CA`);
  // Google Maps embed (no key required for the q-based URL)
  const embedSrc = `https://www.google.com/maps?q=${query}&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  const openMapHref = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-border">
      <div className="aspect-[16/9] w-full bg-muted">
        <iframe
          title={`Map of ${name}`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background px-5 py-4">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 text-accent" />
          <div>
            <div className="font-medium">{name}</div>
            <a
              href={openMapHref}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              {address}
            </a>
          </div>
        </div>
        <a
          href={directionsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Navigation className="h-4 w-4" /> Get directions
        </a>
      </div>
    </div>
  );
}
