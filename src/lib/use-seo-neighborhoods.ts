import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO_NEIGHBORHOODS, type SeoNeighborhood } from "@/lib/seo-neighborhoods";

type DbRow = {
  slug: string;
  name: string;
  blurb: string | null;
  description: string | null;
  categories: string[];
  lat: number | null;
  lng: number | null;
  position: number;
  enabled: boolean;
};

function dbRowToHood(r: DbRow): SeoNeighborhood {
  return {
    slug: r.slug,
    name: r.name,
    blurb: r.blurb ?? "",
    description: r.description ?? "",
    categories: (r.categories ?? []) as SeoNeighborhood["categories"],
    geo: r.lat != null && r.lng != null ? { lat: Number(r.lat), lng: Number(r.lng) } : undefined,
  };
}

export async function fetchSeoNeighborhoods(): Promise<SeoNeighborhood[]> {
  const { data } = await supabase
    .from("seo_neighborhoods")
    .select("slug,name,blurb,description,categories,lat,lng,position,enabled")
    .eq("enabled", true)
    .order("position", { ascending: true });
  const rows = (data ?? []) as DbRow[];
  if (rows.length === 0) return SEO_NEIGHBORHOODS;
  return rows.map(dbRowToHood);
}

/** React hook that returns the live neighborhood list from the database, with the
 *  hardcoded seed as initial/fallback data so picklists never render empty. */
export function useSeoNeighborhoods() {
  return useQuery({
    queryKey: ["seo-neighborhoods"],
    queryFn: fetchSeoNeighborhoods,
    initialData: SEO_NEIGHBORHOODS,
    staleTime: 60_000,
  });
}
