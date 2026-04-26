import { supabase } from "@/integrations/supabase/client";

export async function fetchPublishedListings(opts?: { category?: string; limit?: number }) {
  const nowIso = new Date().toISOString();
  let q = supabase
    .from("listings")
    .select(
      "id, slug, name, category, neighborhood, short_description, hero_image, tier, rating, price_range, published_at, is_sponsored, sponsor_name, sponsor_rank, sponsor_until",
    )
    .eq("status", "published");
  if (opts?.category && opts.category !== "All") {
    q = q.eq("category", opts.category as never);
  }
  // Sponsored listings (with no expiry, or not yet expired) float to the top,
  // ordered by sponsor_rank desc. Then tier, then recency.
  q = q
    .order("is_sponsored", { ascending: false })
    .order("sponsor_rank", { ascending: false })
    .order("tier", { ascending: false })
    .order("published_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  // Filter out expired sponsorships client-side (Postgres can't cleanly mix
  // "null OR > now" inside the boost ordering above).
  const filtered = (data ?? []).map((l: any) => {
    if (l.is_sponsored && l.sponsor_until && new Date(l.sponsor_until) < new Date(nowIso)) {
      return { ...l, is_sponsored: false };
    }
    return l;
  });
  return filtered;
}

export async function fetchGolfCourses(opts?: { limit?: number }) {
  let q = supabase
    .from("listings")
    .select(
      "id, slug, name, category, neighborhood, short_description, hero_image, tier, rating, price_range, published_at, is_sponsored, sponsor_name, sponsor_rank, sponsor_until, reservation_url",
    )
    .eq("status", "published")
    .like("slug", "golf-%")
    .order("tier", { ascending: false })
    .order("rating", { ascending: false });
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

export async function recordImpression(listingId: string, type: "view" | "click" | "phone_click" | "website_click" | "reservation_click" = "view") {
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
