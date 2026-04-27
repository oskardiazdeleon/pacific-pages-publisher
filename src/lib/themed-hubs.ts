// Themed Hub registry — drives flexible category landing pages like /wineries.
// Adding a new themed hub = add one entry below + create a 10-line route file.

import type { ListingCategory } from "@/lib/listing-categories";

export type ThemedHub = {
  /** URL slug used at /{slug} */
  slug: string;
  /** Nav + breadcrumb label */
  label: string;
  /** Hero copy */
  eyebrow: string;
  heading: string;
  /** Accent line shown beneath the heading (e.g. "from vine to glass.") */
  headingAccent?: string;
  subheading: string;
  heroImage: string;
  searchPlaceholder: string;
  popularChips: { label: string; keyword: string }[];
  stats: { value: string; label: string }[];
  /** Listings filter — combined OR */
  listingFilter: {
    dbCategories: ListingCategory[];
    /** Match any of these against name/short_description (case-insensitive) */
    keywords: string[];
  };
  /** Used to match articles.category / blog_posts.category */
  contentTag: string;
  /** Additional accepted tag/category aliases (case-insensitive) */
  tagAliases: string[];
  /** SEO */
  metaTitle: string;
  metaDescription: string;
  /** CMS hero override key in homepage_sections (defaults to `{slug}_hero`) */
  cmsKey?: string;
  /** Insider CTA bar */
  insiderCta?: { title: string; body: string };
  /** Bottom "what to know" 3-column block */
  knowMore?: {
    heading: string;
    items: { title: string; body: string }[];
  };
};

export const THEMED_HUBS: ThemedHub[] = [
  {
    slug: "wineries",
    label: "Wineries",
    eyebrow: "Wine country",
    heading: "San Diego Wineries",
    headingAccent: "from vine to glass.",
    subheading:
      "Tasting rooms in Ramona Valley, urban wineries in Miramar, coastal pours in Carlsbad — the vintners locals actually visit, ranked by what's pouring this season.",
    heroImage:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80",
    searchPlaceholder: "Search wineries, varietals, regions…",
    popularChips: [
      { label: "Ramona Valley", keyword: "ramona" },
      { label: "Urban Wineries", keyword: "urban" },
      { label: "Reds", keyword: "red" },
      { label: "Tasting Flights", keyword: "tasting" },
    ],
    stats: [
      { value: "40+", label: "Wineries" },
      { value: "3", label: "AVA Regions" },
      { value: "$15", label: "Tastings From" },
    ],
    listingFilter: {
      dbCategories: ["Restaurant", "Attraction"],
      keywords: ["winery", "wineries", "vineyard", "wine bar", "tasting room"],
    },
    contentTag: "wineries",
    tagAliases: ["wine", "vineyard", "winery"],
    metaTitle:
      "Best San Diego Wineries — Tasting Rooms & Vineyards | sandiego.com",
    metaDescription:
      "The best San Diego wineries, hand-picked by locals. Ramona Valley vineyards, urban wineries and coastal tasting rooms — tastings from $15.",
    insiderCta: {
      title: "Sip smarter with Insider",
      body: "Member-only flights, complimentary glasses and pairings at participating wineries.",
    },
    knowMore: {
      heading: "San Diego wine country — what to know",
      items: [
        {
          title: "The regions",
          body: "Ramona Valley AVA is the heart of local winemaking — about 45 minutes inland. Urban wineries cluster in Miramar and North Park.",
        },
        {
          title: "Best season",
          body: "Spring (March–May) for vine-side tastings; fall (Sept–Oct) for harvest crush events. Most rooms are open year-round Thurs–Sun.",
        },
        {
          title: "How to taste",
          body: "Most rooms charge $15–$25 per flight, often waived with a 2-bottle purchase. Reservations recommended on weekends.",
        },
      ],
    },
  },
];

const BY_SLUG = new Map<string, ThemedHub>();
for (const h of THEMED_HUBS) BY_SLUG.set(h.slug, h);

export function themedHubForSlug(slug: string): ThemedHub | null {
  return BY_SLUG.get(slug) ?? null;
}

export function cmsKeyForHub(hub: ThemedHub): string {
  return hub.cmsKey ?? `${hub.slug}_hero`;
}

/** Filter helper applied client-side after fetching by category. */
export function listingMatchesHub(
  l: { name?: string | null; short_description?: string | null; category?: string | null },
  hub: ThemedHub,
): boolean {
  const hay = `${l.name ?? ""} ${l.short_description ?? ""}`.toLowerCase();
  return hub.listingFilter.keywords.some((kw) => hay.includes(kw.toLowerCase()));
}

/** Match an article/blog post against the themed hub by category or tags. */
export function contentMatchesHub(
  c: { category?: string | null; tags?: string[] | null },
  hub: ThemedHub,
): boolean {
  const aliases = new Set(
    [hub.contentTag, hub.label, ...hub.tagAliases].map((s) => s.toLowerCase()),
  );
  if (c.category && aliases.has(c.category.toLowerCase())) return true;
  if (c.tags?.some((t) => aliases.has(t.toLowerCase()))) return true;
  return false;
}
