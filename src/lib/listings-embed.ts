// Thin fetcher for embedding any listing (any category) inline in articles/blogs.
// Mirrors the cruise-lines / wedding-venues modules used by the embed system.

import { supabase } from "@/integrations/supabase/client";
import { listingUrl } from "@/lib/listing-categories";

export type EmbedListing = {
  id: string;
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  tagline: string;
  heroImage: string;
  priceRange: string;
  rating: number | null;
  tier: "free" | "featured" | "premium";
  bookingUrl: string;
  href: string;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  category: string;
  neighborhood: string | null;
  short_description: string | null;
  hero_image: string | null;
  price_range: string | null;
  rating: number | null;
  tier: "free" | "featured" | "premium";
  reservation_url: string | null;
  website: string | null;
};

const SELECT =
  "id, slug, name, category, neighborhood, short_description, hero_image, price_range, rating, tier, reservation_url, website";

function rowTo(r: Row): EmbedListing {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    neighborhood: r.neighborhood ?? "",
    tagline: r.short_description ?? "",
    heroImage: r.hero_image ?? "",
    priceRange: r.price_range ?? "",
    rating: r.rating,
    tier: r.tier,
    bookingUrl: r.reservation_url || r.website || "",
    href: listingUrl({ slug: r.slug, category: r.category }),
  };
}

export async function fetchEmbedListings(): Promise<EmbedListing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("status", "published")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as Row[]).map(rowTo);
}

export async function fetchEmbedListingBySlug(slug: string): Promise<EmbedListing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowTo(data as Row) : null;
}
