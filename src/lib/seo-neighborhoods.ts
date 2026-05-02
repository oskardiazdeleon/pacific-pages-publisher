// Master list of neighborhoods used for the SEO Layer 2 dynamic pages
// at /[category]/in/[neighborhood] (e.g. /hotels/in/gaslamp-quarter).
//
// Each entry has:
// - slug: URL slug
// - name: exact display name AND value used to filter listings.neighborhood
// - blurb: 1-line for cards
// - description: 2-3 sentences for default page intro (when no CMS row)
// - categories: which category hubs SHOULD have a generated page for this hood
// - geo: optional lat/lng (for schema.org)
//
// Listings are auto-filtered by listings.neighborhood ILIKE name.

export type SeoNeighborhood = {
  slug: string;
  name: string;
  blurb: string;
  description: string;
  // Which category slugs make sense for this neighborhood. Used to
  // build the sitemap and the cross-link strip.
  categories: ReadonlyArray<
    "hotels" | "restaurants" | "things-to-do" | "shopping" | "nightlife"
  >;
  geo?: { lat: number; lng: number };
};

export const SEO_NEIGHBORHOODS: SeoNeighborhood[] = [
  {
    slug: "gaslamp-quarter",
    name: "Gaslamp Quarter",
    blurb: "Historic downtown after dark.",
    description:
      "The Gaslamp Quarter is downtown San Diego's 16-block historic core — Victorian-era brick buildings now filled with rooftop bars, chef-driven restaurants, live-music venues and the city's busiest nightlife scene.",
    categories: ["hotels", "restaurants", "things-to-do", "nightlife", "shopping"],
    geo: { lat: 32.7106, lng: -117.1602 },
  },
  {
    slug: "pacific-beach",
    name: "Pacific Beach",
    blurb: "Boardwalk, sunsets, and beach-bar energy.",
    description:
      "Pacific Beach (PB) is San Diego's quintessential beach town — a 3-mile boardwalk, surf-and-burrito lifestyle, and a young, lively scene of taco shops, taprooms and sunset spots along Mission Boulevard.",
    categories: ["hotels", "restaurants", "things-to-do", "nightlife"],
    geo: { lat: 32.7989, lng: -117.2554 },
  },
  {
    slug: "little-italy",
    name: "Little Italy",
    blurb: "Restaurants, design shops, Saturday market.",
    description:
      "Little Italy is downtown San Diego's most walkable foodie neighborhood — a tight grid of acclaimed restaurants, indie design boutiques, the city's best Saturday farmers market, and a pedestrian piazza at its center.",
    categories: ["hotels", "restaurants", "shopping", "nightlife", "things-to-do"],
    geo: { lat: 32.7233, lng: -117.169 },
  },
  {
    slug: "la-jolla",
    name: "La Jolla",
    blurb: "Sea cliffs, coves, and the famous sea lions.",
    description:
      "La Jolla — Spanish for 'the jewel' — is San Diego's most iconic stretch of coastline. Sandstone cliffs drop into clear Pacific water, sea lions sun on the rocks, and an upscale village of galleries and seafood restaurants sits just blocks from the beach.",
    categories: ["hotels", "restaurants", "things-to-do", "shopping"],
    geo: { lat: 32.8328, lng: -117.2713 },
  },
  {
    slug: "mission-beach",
    name: "Mission Beach",
    blurb: "Roller coasters, the bay, and the boardwalk.",
    description:
      "Mission Beach is a narrow strip of sand wedged between the Pacific Ocean and Mission Bay — home to Belmont Park's vintage roller coaster, miles of boardwalk, and rental cottages a short walk from the surf.",
    categories: ["hotels", "restaurants", "things-to-do"],
    geo: { lat: 32.7706, lng: -117.2519 },
  },
  {
    slug: "balboa-park",
    name: "Balboa Park",
    blurb: "Museums, gardens, and the world-famous Zoo.",
    description:
      "Balboa Park is San Diego's 1,200-acre cultural heart — 17 museums, the world-famous San Diego Zoo, Spanish Colonial Revival pavilions from the 1915 Panama-California Exposition, and gardens you could wander for a week.",
    categories: ["hotels", "restaurants", "things-to-do"],
    geo: { lat: 32.7341, lng: -117.1446 },
  },
  {
    slug: "downtown",
    name: "Downtown",
    blurb: "Convention center, bayfront, and skyline.",
    description:
      "Downtown San Diego stitches together the Gaslamp, East Village, Marina District and the Embarcadero — high-rise hotels with bay views, Petco Park, the city's biggest convention venues, and waterfront dining within easy walking distance.",
    categories: ["hotels", "restaurants", "things-to-do", "nightlife", "shopping"],
    geo: { lat: 32.7157, lng: -117.1611 },
  },
  {
    slug: "ocean-beach",
    name: "Ocean Beach",
    blurb: "Pier, dive bars, and bohemian beach-town vibes.",
    description:
      "Ocean Beach (OB) is San Diego's bohemian beach-town holdout — a half-mile pier, antique shops on Newport Avenue, dog-friendly sand, and dive bars where locals have been on first-name terms for decades.",
    categories: ["hotels", "restaurants", "things-to-do", "nightlife"],
    geo: { lat: 32.7494, lng: -117.2486 },
  },
  {
    slug: "coronado",
    name: "Coronado",
    blurb: "White-sand beaches and the iconic Hotel Del.",
    description:
      "Coronado is a peninsula across the bay from downtown — a small-town village with one of America's most decorated beaches and the legendary Hotel del Coronado, a Victorian beach resort that's been hosting presidents and movie stars since 1888.",
    categories: ["hotels", "restaurants", "things-to-do", "shopping"],
    geo: { lat: 32.6859, lng: -117.1831 },
  },
  {
    slug: "old-town",
    name: "Old Town",
    blurb: "Where California began — adobe, mariachis, margaritas.",
    description:
      "Old Town is the birthplace of California — six blocks of restored adobes, working blacksmiths and stagecoaches, surrounded by family-run Mexican restaurants where the margaritas are huge and the mariachis play through dinner.",
    categories: ["restaurants", "things-to-do", "shopping", "hotels"],
    geo: { lat: 32.7549, lng: -117.1969 },
  },
];

const BY_SLUG = new Map<string, SeoNeighborhood>(
  SEO_NEIGHBORHOODS.map((n) => [n.slug, n]),
);

export function getSeoNeighborhood(slug: string): SeoNeighborhood | null {
  return BY_SLUG.get(slug) ?? null;
}

/** All (categorySlug, neighborhoodSlug) pairs we generate by default — used by the sitemap. */
export function allSeoCategoryNeighborhoodPairs(): { category: string; neighborhood: string }[] {
  const pairs: { category: string; neighborhood: string }[] = [];
  for (const n of SEO_NEIGHBORHOODS) {
    for (const c of n.categories) pairs.push({ category: c, neighborhood: n.slug });
  }
  return pairs;
}
