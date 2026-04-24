import { supabase } from "@/integrations/supabase/client";

export async function fetchPublishedListings(opts?: { category?: string; limit?: number }) {
  let q = supabase
    .from("listings")
    .select("id, slug, name, category, neighborhood, short_description, hero_image, tier, rating, published_at")
    .eq("status", "published");
  if (opts?.category && opts.category !== "All") {
    q = q.eq("category", opts.category as never);
  }
  q = q.order("tier", { ascending: false }).order("published_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchListingBySlug(slug: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPublishedArticles(opts?: { limit?: number }) {
  let q = supabase
    .from("articles")
    .select("id, slug, title, excerpt, category, hero_image, read_time_minutes, published_at, tags")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function recordImpression(listingId: string, type: "view" | "click" | "phone_click" | "website_click" = "view") {
  try {
    await supabase.from("listing_impressions").insert({
      listing_id: listingId,
      impression_type: type,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch {
    // swallow — analytics shouldn't break UX
  }
}
