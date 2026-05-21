import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { fetchEmbedListings, type EmbedListing } from "@/lib/listings-embed";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (slug: string, variant: "full" | "compact") => void;
}

export function InsertListingDialog({ open, onOpenChange, onSelect }: Props) {
  const [listings, setListings] = useState<EmbedListing[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [variant, setVariant] = useState<"full" | "compact">("full");

  useEffect(() => {
    if (!open || listings) return;
    setLoading(true);
    fetchEmbedListings()
      .then(setListings)
      .finally(() => setLoading(false));
  }, [open, listings]);

  const filtered = useMemo(() => {
    const list = listings ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (l) =>
        l.name.toLowerCase().includes(s) ||
        l.category.toLowerCase().includes(s) ||
        l.neighborhood.toLowerCase().includes(s) ||
        l.slug.toLowerCase().includes(s),
    );
  }, [listings, q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            Insert listing
          </DialogTitle>
          <DialogDescription>
            Pick any published listing to embed inline for SEO link building.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search listings by name, category, or neighborhood…"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Style:</span>
            {(["full", "compact"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={`rounded-full border px-3 py-1 font-semibold capitalize transition ${
                  variant === v
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border">
            {loading && (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading listings…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No listings match your search.
              </div>
            )}
            {!loading &&
              filtered.map((l) => (
                <button
                  key={l.slug}
                  type="button"
                  onClick={() => {
                    onSelect(l.slug, variant);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-3 border-b border-border p-3 text-left transition last:border-b-0 hover:bg-secondary"
                >
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {l.heroImage ? (
                      <img src={l.heroImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-primary/10 font-display text-xl font-bold text-primary">
                        {l.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-base font-semibold text-foreground">
                      {l.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {[l.category, l.neighborhood].filter(Boolean).join(" · ") || l.tagline}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
