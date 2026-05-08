// SEO category URL mapping.
// Maps DB enum (listing_category) → URL-friendly plural slug used in /{slug}/{listing-slug}.
// Tours and Attractions both live under /things-to-do/ for cleaner SEO + better keyword match.

export type ListingCategory =
  | "Restaurant"
  | "Hotel"
  | "Attraction"
  | "Tour"
  | "Shopping"
  | "Nightlife"
  | "Golf"
  | "WeddingVenue"
  | "Winery";

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
  schemaType: "LodgingBusiness" | "Restaurant" | "TouristAttraction" | "Store" | "BarOrPub" | "GolfCourse" | "EventVenue" | "Winery";
  /** Optional accent line shown beneath heading (e.g. "where locals eat.") */
  headingAccent?: string;
  /** Hero image URL */
  heroImage?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Popular filter chips */
  popularChips?: { label: string; keyword: string }[];
  /** Floating stat cards */
  stats?: { value: string; label: string }[];
  /** Insider CTA bar */
  insiderCta?: { title: string; body: string };
  /** Hero member benefit pill (e.g. "💳 SD Insider Members Save 15–30% on Hotels") */
  memberBenefit?: string;
};

export const CATEGORY_HUBS: CategoryHub[] = [
  {
    slug: "hotels",
    dbCategories: ["Hotel"],
    label: "Hotels",
    singular: "Hotel",
    metaTitle: "Hotels in San Diego | Insider Members Save 15–40%",
    metaDescription:
      "San Diego hotels by neighborhood, with insider picks and member-exclusive savings on Gaslamp, La Jolla, Coronado, and downtown stays.",
    eyebrow: "Where to stay",
    heading: "San Diego Hotels",
    subheading:
      "Beachfront resorts, downtown boutiques and historic stays — every property reviewed by our editors. Insider members save up to 40%.",
    schemaType: "LodgingBusiness",
    headingAccent: "where to stay.",
    heroImage:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
    searchPlaceholder: "Search hotels, neighborhoods, amenities…",
    popularChips: [
      { label: "Beachfront", keyword: "beach" },
      { label: "Downtown", keyword: "downtown" },
      { label: "Boutique", keyword: "boutique" },
      { label: "Family", keyword: "family" },
    ],
    stats: [
      { value: "200+", label: "Hotels" },
      { value: "40%", label: "Insider Save" },
      { value: "$129", label: "Starting From" },
    ],
    insiderCta: {
      title: "Save up to 40% with Insider",
      body: "Member-only rates, free upgrades and late checkout at participating hotels.",
    },
    memberBenefit: "💳 SD Insider Members Save 15–40% on San Diego Hotels",
  },
  {
    slug: "restaurants",
    dbCategories: ["Restaurant"],
    label: "Restaurants",
    singular: "Restaurant",
    metaTitle: "Top Restaurants in San Diego | Member Exclusive Deals",
    metaDescription:
      "Where to eat in San Diego — neighborhood-by-neighborhood restaurant picks from the people who actually live here.",
    eyebrow: "Where to eat",
    heading: "San Diego Restaurants",
    subheading:
      "From Michelin-starred dining rooms to legendary taco shops — the restaurants locals actually eat at, ranked by what's worth your time.",
    schemaType: "Restaurant",
    headingAccent: "where locals eat.",
    heroImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
    searchPlaceholder: "Search restaurants, cuisines, neighborhoods…",
    popularChips: [
      { label: "Tacos", keyword: "taco" },
      { label: "Waterfront", keyword: "waterfront" },
      { label: "Michelin", keyword: "michelin" },
      { label: "Brunch", keyword: "brunch" },
    ],
    stats: [
      { value: "500+", label: "Restaurants" },
      { value: "30", label: "Neighborhoods" },
      { value: "$$", label: "Avg Price" },
    ],
    insiderCta: {
      title: "Dine smarter with Insider",
      body: "Priority reservations, complimentary courses and chef's-table access at top spots.",
    },
    memberBenefit: "💳 SD Insider Members Save 15–25% at 150+ Restaurants",
  },
  {
    slug: "things-to-do",
    dbCategories: ["Attraction", "Tour"],
    label: "Things To Do",
    singular: "Thing To Do",
    metaTitle: "Things to Do in San Diego | Members Save at 200+ Places",
    metaDescription:
      "Things to do in San Diego, curated by locals — beaches, museums, hidden gems, and seasonal experiences.",
    eyebrow: "What to do",
    heading: "Things To Do in San Diego",
    subheading:
      "Iconic attractions, hidden coves, hands-on tours and one-of-a-kind experiences — the only San Diego itinerary you'll need.",
    schemaType: "TouristAttraction",
    headingAccent: "things to do.",
    heroImage:
      "https://images.unsplash.com/photo-1538397956038-5b30aea4f88a?w=1600&q=80",
    searchPlaceholder: "Search attractions, tours, beaches…",
    popularChips: [
      { label: "Beaches", keyword: "beach" },
      { label: "Museums", keyword: "museum" },
      { label: "Family", keyword: "family" },
      { label: "Outdoor", keyword: "outdoor" },
    ],
    stats: [
      { value: "1,200+", label: "Things To Do" },
      { value: "70", label: "Miles of Coast" },
      { value: "266", label: "Sunny Days" },
    ],
    insiderCta: {
      title: "Skip the line with Insider",
      body: "Front-of-line passes, member discounts and exclusive tours at top attractions.",
    },
    memberBenefit: "💳 SD Insider Members Save Up to 30% at 200+ San Diego Attractions",
  },
  {
    slug: "shopping",
    dbCategories: ["Shopping"],
    label: "Shopping",
    singular: "Shop",
    metaTitle: "Shopping in San Diego | Member Discounts at Local Boutiques",
    metaDescription:
      "Independent boutiques, vintage finds and farmers markets — handpicked by locals. SD Insider members save 10–20% at participating shops. Join & save »",
    eyebrow: "Where to shop",
    heading: "San Diego Shopping",
    subheading:
      "From La Jolla boutiques to North Park vintage and Liberty Station artisans — the shops locals send their visiting friends to.",
    schemaType: "Store",
    headingAccent: "where to shop.",
    heroImage:
      "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1600&q=80",
    searchPlaceholder: "Search shops, boutiques, markets…",
    popularChips: [
      { label: "Boutiques", keyword: "boutique" },
      { label: "Vintage", keyword: "vintage" },
      { label: "Markets", keyword: "market" },
      { label: "Outlets", keyword: "outlet" },
    ],
    stats: [
      { value: "150+", label: "Shops" },
      { value: "12", label: "Districts" },
      { value: "Daily", label: "Markets" },
    ],
    insiderCta: {
      title: "Shop smarter with Insider",
      body: "Member-only discounts and early access at participating boutiques and markets.",
    },
    memberBenefit: "💳 SD Insider Members Save 10–20% at Local Boutiques & Markets",
  },
  {
    slug: "nightlife",
    dbCategories: ["Nightlife"],
    label: "Nightlife",
    singular: "Nightlife Spot",
    metaTitle: "San Diego Nightlife | Member Perks at Top Bars & Clubs",
    metaDescription:
      "Rooftop bars, craft cocktails, live music and dance clubs. SD Insider members get VIP entry and complimentary drinks at participating venues. Join & save »",
    eyebrow: "After dark",
    heading: "San Diego Nightlife",
    subheading:
      "Rooftop sunsets in Little Italy, dive bars in Ocean Beach, late-night cocktails Downtown — the spots worth staying out for.",
    schemaType: "BarOrPub",
    headingAccent: "after dark.",
    heroImage:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80",
    searchPlaceholder: "Search bars, clubs, lounges…",
    popularChips: [
      { label: "Rooftops", keyword: "rooftop" },
      { label: "Cocktails", keyword: "cocktail" },
      { label: "Live Music", keyword: "music" },
      { label: "Dive Bars", keyword: "dive" },
    ],
    stats: [
      { value: "120+", label: "Venues" },
      { value: "Late", label: "Open Til 2am" },
      { value: "$12", label: "Avg Cocktail" },
    ],
    insiderCta: {
      title: "Skip the line with Insider",
      body: "VIP entry, complimentary drinks and table reservations at top venues.",
    },
    memberBenefit: "💳 SD Insider Members Get VIP Entry & Drink Perks at Top Venues",
  },
  {
    slug: "golf-courses",
    dbCategories: ["Golf"],
    label: "Golf Courses",
    singular: "Golf Course",
    metaTitle: "Best Golf Courses in San Diego | Insider Members Save on Tee Times",
    metaDescription:
      "Play San Diego's best golf courses — from Torrey Pines to hidden municipal gems. SD Insider members save on tee times at participating courses. Join & save »",
    eyebrow: "Where to play",
    heading: "San Diego Golf Courses",
    subheading:
      "Championship layouts, ocean-view fairways and walkable munis — every course rated by our editors. Insider members save on tee times.",
    schemaType: "GolfCourse",
    headingAccent: "where to tee it up.",
    heroImage:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1600&q=80",
    searchPlaceholder: "Search courses, neighborhoods, designers…",
    popularChips: [
      { label: "Ocean View", keyword: "ocean" },
      { label: "Public", keyword: "public" },
      { label: "Championship", keyword: "championship" },
      { label: "Municipal", keyword: "muni" },
    ],
    stats: [
      { value: "90+", label: "Courses" },
      { value: "$45+", label: "Twilight Rates" },
      { value: "266", label: "Sunny Days" },
    ],
    insiderCta: {
      title: "Tee off for less with Insider",
      body: "Member rates, priority tee times and twilight upgrades at participating courses.",
    },
    memberBenefit: "💳 SD Insider Members Save on Tee Times at Top San Diego Courses",
  },
  {
    slug: "weddings",
    dbCategories: ["WeddingVenue"],
    label: "Weddings",
    singular: "Wedding Venue",
    metaTitle: "Best Wedding Venues in San Diego | Insider Members Save on Bookings",
    metaDescription:
      "Discover San Diego's most stunning wedding venues — beachfront estates, garden ballrooms, vineyard barns and rooftop ceremonies. SD Insider members save on bookings at participating venues. Join & save »",
    eyebrow: "Say I do",
    heading: "San Diego Wedding Venues",
    subheading:
      "Beachfront estates, garden ballrooms, vineyard barns and rooftop ceremonies — every venue toured by our editors. Insider members save on premium bookings.",
    schemaType: "EventVenue",
    headingAccent: "where forever begins.",
    heroImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
    searchPlaceholder: "Search venues, neighborhoods, styles…",
    popularChips: [
      { label: "Beachfront", keyword: "beach" },
      { label: "Garden", keyword: "garden" },
      { label: "Vineyard", keyword: "vineyard" },
      { label: "Rooftop", keyword: "rooftop" },
    ],
    stats: [
      { value: "80+", label: "Venues" },
      { value: "20%", label: "Insider Save" },
      { value: "300", label: "Max Capacity" },
    ],
    insiderCta: {
      title: "Save on your big day with Insider",
      body: "Member-only rates, complimentary upgrades and priority dates at participating wedding venues.",
    },
    memberBenefit: "💳 SD Insider Members Save 10–20% at Top San Diego Wedding Venues",
  },
  {
    slug: "wineries",
    dbCategories: ["Winery"],
    label: "Wineries",
    singular: "Winery",
    metaTitle: "Best Wineries in San Diego | Insider Members Save on Tastings",
    metaDescription:
      "Discover San Diego's best wineries — boutique tasting rooms, hillside vineyards and urban wineries. SD Insider members save on tastings and bottles at participating wineries. Join & save »",
    eyebrow: "Sip & swirl",
    heading: "San Diego Wineries",
    subheading:
      "Boutique tasting rooms, hillside vineyards and urban wineries — every label vetted by our editors. Insider members save on tastings and bottles.",
    schemaType: "Winery",
    headingAccent: "where good times pour.",
    heroImage:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80",
    searchPlaceholder: "Search wineries, varietals, neighborhoods…",
    popularChips: [
      { label: "Tasting Room", keyword: "tasting" },
      { label: "Vineyard", keyword: "vineyard" },
      { label: "Urban", keyword: "urban" },
      { label: "Reserve", keyword: "reserve" },
    ],
    stats: [
      { value: "60+", label: "Wineries" },
      { value: "20%", label: "Insider Save" },
      { value: "$15", label: "Avg Tasting" },
    ],
    insiderCta: {
      title: "Sip smarter with Insider",
      body: "Member-only flights, complimentary upgrades and reserved tastings at participating wineries.",
    },
    memberBenefit: "💳 SD Insider Members Save 10–20% at Top San Diego Wineries",
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
