import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hubForCategory } from "@/lib/listing-categories";

type Companion = {
  id: string;
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  hero_image: string | null;
  short_description: string | null;
};

const COMPLEMENT: Record<string, string[]> = {
  Restaurant: ["Nightlife", "Attraction"],
  Hotel: ["Restaurant", "Attraction"],
  Attraction: ["Restaurant", "Shopping"],
  Tour: ["Restaurant", "Hotel"],
  Shopping: ["Restaurant", "Attraction"],
  Nightlife: ["Restaurant", "Attraction"],
};

export function PairThisWith({
  category,
  neighborhood,
  excludeId,
}: {
  category: string;
  neighborhood: string;
  excludeId: string;
}) {
  const [items, setItems] = useState<Companion[]>([]);

  useEffect(() => {
    const targets = COMPLEMENT[category] ?? ["Restaurant", "Attraction"];
    let cancelled = false;
    (async () => {
      const collected: Companion[] = [];
      for (const cat of targets) {
        const { data } = await supabase
          .from("listings")
          .select("id, slug, name, category, neighborhood, hero_image, short_description")
          .eq("status", "published")
          .eq("category", cat as "Restaurant" | "Hotel" | "Attraction" | "Tour" | "Shopping" | "Nightlife")
          .eq("neighborhood", neighborhood)
          .neq("id", excludeId)
          .order("tier", { ascending: false })
          .limit(1);
        if (data && data[0]) collected.push(data[0] as Companion);
        if (collected.length >= 2) break;
      }
      if (!cancelled) setItems(collected);
    })();
    return () => { cancelled = true; };
  }, [category, neighborhood, excludeId]);

  if (!items.length) return null;

  return (
    <section>
      <div className="eyebrow">Make it a day</div>
      <h2 className="mt-1 mb-5 font-display text-2xl md:text-3xl font-semibold">
        Pair this with
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => {
          const hub = hubForCategory(it.category);
          if (!hub) return null;
          return (
            <a
              key={it.id}
              href={`/${hub.slug}/${it.slug}`}
              className="group flex gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-accent/40 hover:shadow-md"
            >
              {it.hero_image && (
                <img
                  src={it.hero_image}
                  alt=""
                  loading="lazy"
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">{hub.singular}</div>
                <div className="mt-0.5 font-display text-base font-semibold leading-tight">{it.name}</div>
                {it.short_description && (
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{it.short_description}</div>
                )}
                <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Visit <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
