// Hub data loader — runs in route loaders so card content and the sponsor
// hero land in the initial SSR HTML (instead of fetching client-side after
// hydration). Returns plain serializable DTOs so TanStack can rehydrate them.
import { fetchPublishedListings, fetchGolfCourses } from "@/lib/content-queries";
import { fetchPublishedHomepageSections, type HomepageSection } from "@/lib/cms";
import { listings as mockListings } from "@/lib/mock-data";
import type { CategoryHub } from "@/lib/listing-categories";
import type { ListingCardData } from "@/components/site/ListingCard";

export type HubInitialData = {
  initialItems: ListingCardData[];
  initialCmsHero: Record<string, unknown>;
};

export async function loadHubData(hub: CategoryHub): Promise<HubInitialData> {
  // Listings — golf-courses uses its dedicated fetcher; everything else
  // queries by hub.dbCategories in parallel and concatenates the results.
  let items: ListingCardData[] = [];
  try {
    if (hub.slug === "golf-courses") {
      const data = await fetchGolfCourses();
      items = data as ListingCardData[];
    } else {
      const buckets = await Promise.all(
        hub.dbCategories.map((c) => fetchPublishedListings({ category: c })),
      );
      items = buckets.flat() as ListingCardData[];
    }
    if (!items.length) {
      items = mockListings.filter((l) =>
        hub.dbCategories.includes(l.category as never),
      ) as ListingCardData[];
    }
  } catch {
    items = mockListings.filter((l) =>
      hub.dbCategories.includes(l.category as never),
    ) as ListingCardData[];
  }

  // CMS hero override (sponsor takeover) — fail silently so a CMS outage
  // never blocks the listing grid from rendering.
  let initialCmsHero: Record<string, unknown> = {};
  try {
    const sections = await fetchPublishedHomepageSections();
    for (const s of sections as HomepageSection[]) {
      if (s.section_key === `${hub.slug}_hero`) {
        initialCmsHero = (s.published_content || {}) as Record<string, unknown>;
        break;
      }
    }
  } catch {
    // ignore
  }

  return { initialItems: items, initialCmsHero };
}
