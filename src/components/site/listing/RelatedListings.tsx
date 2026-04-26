import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard, type ListingCardData } from "@/components/site/ListingCard";

type Props = {
  excludeId: string;
  category: string;
  neighborhood: string;
  hubLabel: string;
  hubSlug: string;
};

export function RelatedListings({
  excludeId,
  category,
  neighborhood,
  hubLabel,
  hubSlug,
}: Props) {
  const [neighbors, setNeighbors] = useState<ListingCardData[]>([]);
  const [siblings, setSiblings] = useState<ListingCardData[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cols =
        "id, slug, name, category, neighborhood, short_description, hero_image, tier, rating, price_range, is_sponsored, sponsor_name, sponsor_until";
      const [{ data: n }, { data: s }] = await Promise.all([
        supabase
          .from("listings")
          .select(cols)
          .eq("status", "published")
          .eq("neighborhood", neighborhood)
          .neq("id", excludeId)
          .limit(4),
        supabase
          .from("listings")
          .select(cols)
          .eq("status", "published")
          .eq("category", category as never)
          .neq("id", excludeId)
          .order("rating", { ascending: false, nullsFirst: false })
          .limit(8),
      ]);
      if (cancelled) return;
      setNeighbors((n ?? []) as unknown as ListingCardData[]);
      // de-dupe siblings against neighbors so we don't show the same card twice
      const seen = new Set((n ?? []).map((x: { id: string }) => x.id));
      setSiblings(
        ((s ?? []) as unknown as ListingCardData[]).filter(
          (x) => !seen.has((x as unknown as { id: string }).id),
        ).slice(0, 4),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [excludeId, category, neighborhood]);

  return (
    <div className="space-y-14">
      {neighbors.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Nearby</div>
              <h2 className="mt-1 font-display text-2xl md:text-3xl font-semibold">
                More in {neighborhood}
              </h2>
            </div>
            <a
              href={`/${hubSlug}`}
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              View all {hubLabel.toLowerCase()} →
            </a>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {neighbors.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">More to explore</div>
              <h2 className="mt-1 font-display text-2xl md:text-3xl font-semibold">
                Other {hubLabel.toLowerCase()} worth your time
              </h2>
            </div>
            <a
              href={`/${hubSlug}`}
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              See all →
            </a>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
