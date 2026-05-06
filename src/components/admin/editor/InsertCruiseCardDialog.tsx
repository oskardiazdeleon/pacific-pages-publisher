import { useEffect, useMemo, useState } from "react";
import { Search, Ship, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { fetchCruiseLines, type CruiseLine } from "@/lib/cruise-lines";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (slug: string, variant: "full" | "compact") => void;
}

export function InsertCruiseCardDialog({ open, onOpenChange, onSelect }: Props) {
  const [cruises, setCruises] = useState<CruiseLine[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [variant, setVariant] = useState<"full" | "compact">("full");

  useEffect(() => {
    if (!open || cruises) return;
    setLoading(true);
    fetchCruiseLines()
      .then(setCruises)
      .finally(() => setLoading(false));
  }, [open, cruises]);

  const filtered = useMemo(() => {
    const list = cruises ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.tagline.toLowerCase().includes(s) ||
        c.slug.toLowerCase().includes(s),
    );
  }, [cruises, q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-4 w-4 text-accent" />
            Insert cruise card
          </DialogTitle>
          <DialogDescription>
            Pick a cruise line to embed inline in your article.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cruise lines…"
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
                <Loader2 className="h-4 w-4 animate-spin" /> Loading cruise lines…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No cruise lines match your search.
              </div>
            )}
            {!loading &&
              filtered.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    onSelect(c.slug, variant);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-3 border-b border-border p-3 text-left transition last:border-b-0 hover:bg-secondary"
                >
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {c.heroImage ? (
                      <img src={c.heroImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-primary/10 font-display text-xl font-bold text-primary">
                        {c.logoLetter || c.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-base font-semibold text-foreground">
                      {c.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {c.tagline || c.bestFor || c.homePort}
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
