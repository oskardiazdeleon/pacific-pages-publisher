// Wedding venues are listings with category = 'WeddingVenue'.
// This module provides a thin shape mirroring CruiseLine for embed-card usage.

import { supabase } from "@/integrations/supabase/client";

export type WeddingVenue = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  heroImage: string;
  neighborhood: string;
  capacity: string;
  priceRange: string;
  bookingUrl: string;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  hero_image: string | null;
  neighborhood: string | null;
  price_range: string | null;
  reservation_url: string | null;
  website: string | null;
};

const SELECT = "id, slug, name, short_description, hero_image, neighborhood, price_range, reservation_url, website";

function rowTo(r: Row): WeddingVenue {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.short_description ?? "",
    heroImage: r.hero_image ?? "",
    neighborhood: r.neighborhood ?? "",
    capacity: "",
    priceRange: r.price_range ?? "",
    bookingUrl: r.reservation_url || r.website || "",
  };
}

export async function fetchWeddingVenues(): Promise<WeddingVenue[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("category", "WeddingVenue")
    .eq("status", "published")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as Row[]).map(rowTo);
}

export async function fetchWeddingVenueBySlug(slug: string): Promise<WeddingVenue | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("slug", slug)
    .eq("category", "WeddingVenue")
    .maybeSingle();
  if (error) throw error;
  return data ? rowTo(data as Row) : null;
}
