// SEO category URL mapping.
// Maps DB enum (listing_category) → URL-friendly plural slug used in /{slug}/{listing-slug}.
// Tours and Attractions both live under /things-to-do/ for cleaner SEO + better keyword match.

export type ListingCategory =
  | "Restaurant"
  | "Hotel"
  | "Attraction"
  | "Tour"
  | "Shopping"
  | "Nightlife";

export type CategoryHub = {
  /** URL slug, e.g. "hotels" → /hotels */
  slug: string;
  /** DB categories that belong to this hub */
  dbCategories: ListingCategory[];
  /** Display name for nav and breadcrumbs */
  label: string;
  /** Singular for "a Hotel in San Diego" copy */
  singular: string;
  /** SEO meta */
  metaTitle: string;
  metaDescription: string;
  /** Hero copy for hub page */
  eyebrow: string;
  heading: string;
  subheading: string;
  /** Schema.org @type for ItemList breadcrumb context */
  schemaType: "LodgingBusiness" | "Restaurant" | "TouristAttraction" | "Store" | "BarOrPub";
};

export const CATEGORY_HUBS: CategoryHub[] = [
  {
    slug: "hotels",
    dbCategories: ["Hotel"],
    label: "Hotels",
    singular: "Hotel",
    metaTitle: "Best San Diego Hotels — Editor-Vetted Stays | sandiego.com",
    metaDescription:
      "The best hotels in San Diego, hand-picked by locals. Beachfront resorts, downtown boutiques, family-friendly stays — with Insider rates up to 40% off.",
    eyebrow: "Where to stay",
    heading: "San Diego Hotels",
    subheading:
      "Beachfront resorts, downtown boutiques and historic stays — every property reviewed by our editors. Insider members save up to 40%.",
    schemaType: "LodgingBusiness",
  },
  {
    slug: "restaurants",
    dbCategories: ["Restaurant"],
    label: "Restaurants",
    singular: "Restaurant",
    metaTitle: "Best San Diego Restaurants — Where Locals Eat | sandiego.com",
    metaDescription:
      "The definitive guide to San Diego restaurants: tacos, fine dining, waterfront patios and neighborhood gems — all editor-vetted by locals.",
    eyebrow: "Where to eat",
    heading: "San Diego Restaurants",
    subheading:
      "From Michelin-starred dining rooms to legendary taco shops — the restaurants locals actually eat at, ranked by what's worth your time.",
    schemaType: "Restaurant",
  },
  {
    slug: "things-to-do",
    dbCategories: ["Attraction", "Tour"],
    label: "Things To Do",
    singular: "Thing To Do",
    metaTitle: "Best Things To Do in San Diego — Attractions & Tours | sandiego.com",
    metaDescription:
      "1,200+ things to do in San Diego: top attractions, tours, beaches, museums and family activities — curated by locals, updated weekly.",
    eyebrow: "What to do",
    heading: "Things To Do in San Diego",
    subheading:
      "Iconic attractions, hidden coves, hands-on tours and one-of-a-kind experiences — the only San Diego itinerary you'll need.",
    schemaType: "TouristAttraction",
  },
  {
    slug: "shopping",
    dbCategories: ["Shopping"],
    label: "Shopping",
    singular: "Shop",
    metaTitle: "Best Shopping in San Diego — Boutiques & Markets | sandiego.com",
    metaDescription:
      "Where to shop in San Diego: independent boutiques, designer outlets, vintage finds and farmers markets — handpicked by local editors.",
    eyebrow: "Where to shop",
    heading: "San Diego Shopping",
    subheading:
      "From La Jolla boutiques to North Park vintage and Liberty Station artisans — the shops locals send their visiting friends to.",
    schemaType: "Store",
  },
  {
    slug: "nightlife",
    dbCategories: ["Nightlife"],
    label: "Nightlife",
    singular: "Nightlife Spot",
    metaTitle: "Best San Diego Nightlife — Bars, Clubs & Rooftops | sandiego.com",
    metaDescription:
      "San Diego nightlife guide: rooftop bars, craft cocktail lounges, live music venues and dance clubs — vetted by locals who go out.",
    eyebrow: "After dark",
    heading: "San Diego Nightlife",
    subheading:
      "Rooftop sunsets in Little Italy, dive bars in Ocean Beach, late-night cocktails Downtown — the spots worth staying out for.",
    schemaType: "BarOrPub",
  },
];

const BY_DB_CATEGORY = new Map<ListingCategory, CategoryHub>();
for (const hub of CATEGORY_HUBS) {
  for (const c of hub.dbCategories) BY_DB_CATEGORY.set(c, hub);
}

const BY_SLUG = new Map<string, CategoryHub>();
for (const hub of CATEGORY_HUBS) BY_SLUG.set(hub.slug, hub);

export function hubForCategory(category: string | null | undefined): CategoryHub | null {
  if (!category) return null;
  return BY_DB_CATEGORY.get(category as ListingCategory) ?? null;
}

export function hubForSlug(slug: string): CategoryHub | null {
  return BY_SLUG.get(slug) ?? null;
}

/** Canonical detail URL for a listing, e.g. /hotels/hotel-del-coronado */
export function listingUrl(listing: { slug: string; category?: string | null }): string {
  const hub = hubForCategory(listing.category);
  if (!hub) return `/listings/${listing.slug}`;
  return `/${hub.slug}/${listing.slug}`;
}

/** All hub slugs (for sitemap, redirects, etc.) */
export const ALL_HUB_SLUGS = CATEGORY_HUBS.map((h) => h.slug);
