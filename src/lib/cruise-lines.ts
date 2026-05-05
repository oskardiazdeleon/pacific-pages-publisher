// Cruise lines — now backed by the `cruise_lines` table in the database.
// Manage them at /admin/cruises.

import { supabase } from "@/integrations/supabase/client";

export type CruiseLineHighlight = { title: string; body: string };

export type CruiseLine = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  heroImage: string;
  logoLetter: string;
  bookingUrl: string;
  homePort: string;
  shipsFromSD: string[];
  typicalItineraries: string[];
  bestFor: string;
  seasonality: string;
  priceFrom: string;
  description: string;
  highlights: CruiseLineHighlight[];
  metaTitle: string;
  metaDescription: string;
  enabled?: boolean;
  position?: number;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  hero_image: string | null;
  logo_letter: string | null;
  booking_url: string | null;
  home_port: string | null;
  ships_from_sd: string[] | null;
  typical_itineraries: string[] | null;
  best_for: string | null;
  seasonality: string | null;
  price_from: string | null;
  description: string | null;
  highlights: unknown;
  meta_title: string | null;
  meta_description: string | null;
  enabled: boolean;
  position: number;
};

function rowToCruiseLine(r: Row): CruiseLine {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? "",
    heroImage: r.hero_image ?? "",
    logoLetter: r.logo_letter ?? "",
    bookingUrl: r.booking_url ?? "",
    homePort: r.home_port ?? "",
    shipsFromSD: r.ships_from_sd ?? [],
    typicalItineraries: r.typical_itineraries ?? [],
    bestFor: r.best_for ?? "",
    seasonality: r.seasonality ?? "",
    priceFrom: r.price_from ?? "",
    description: r.description ?? "",
    highlights: Array.isArray(r.highlights) ? (r.highlights as CruiseLineHighlight[]) : [],
    metaTitle: r.meta_title ?? "",
    metaDescription: r.meta_description ?? "",
    enabled: r.enabled,
    position: r.position,
  };
}

export async function fetchCruiseLines(opts: { includeDisabled?: boolean } = {}): Promise<CruiseLine[]> {
  let query = supabase.from("cruise_lines").select("*").order("position", { ascending: true });
  if (!opts.includeDisabled) query = query.eq("enabled", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data as Row[]).map(rowToCruiseLine);
}

export async function fetchCruiseLineBySlug(slug: string): Promise<CruiseLine | null> {
  const { data, error } = await supabase.from("cruise_lines").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToCruiseLine(data as Row) : null;
}
