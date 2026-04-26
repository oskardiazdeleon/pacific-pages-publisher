// San Diego cruise lines — curated editorial data.
// Kept as static content (no DB) so the section is self-contained and SEO-stable.

export type CruiseLine = {
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
  highlights: { title: string; body: string }[];
  metaTitle: string;
  metaDescription: string;
};

export const CRUISE_LINES: CruiseLine[] = [
  {
    slug: "holland-america-line",
    name: "Holland America Line",
    tagline: "The classic San Diego repositioning and Mexican Riviera operator.",
    heroImage:
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=80",
    logoLetter: "H",
    bookingUrl: "https://www.hollandamerica.com/en/us/find-a-cruise?DEPARTUREPORT=SAN",
    homePort: "B Street Pier, Port of San Diego",
    shipsFromSD: ["Koningsdam", "Zuiderdam", "Eurodam"],
    typicalItineraries: [
      "7-night Mexican Riviera (Cabo, Mazatlán, Puerto Vallarta)",
      "10–17-night Panama Canal repositioning",
      "California Coast & Pacific Coastal voyages",
    ],
    bestFor: "Mature travelers, classic cruise experience, longer itineraries",
    seasonality: "October through April (peak winter season)",
    priceFrom: "$799 per person",
    description:
      "Holland America has called San Diego home for decades and runs the most consistent slate of Mexican Riviera and Panama Canal sailings out of the city. Expect refined ships, attentive Indonesian and Filipino crew, the Lincoln Center Stage classical ensemble and a calmer onboard atmosphere than the megaships down the dock.",
    highlights: [
      {
        title: "Why locals like it",
        body: "Sails from B Street Pier — a 10-minute walk to Little Italy for a pre-cruise dinner.",
      },
      {
        title: "Best itinerary",
        body: "The 17-day Panama Canal repositioning between San Diego and Fort Lauderdale is the bucket-list run.",
      },
      {
        title: "Insider tip",
        body: "Book a Vista Suite for a private veranda and access to the Neptune Lounge concierge.",
      },
    ],
    metaTitle: "Holland America Cruises from San Diego — Ships, Itineraries & Booking",
    metaDescription:
      "Holland America Line departs San Diego October–April with Mexican Riviera, California Coast and Panama Canal sailings. Ships, itineraries and booking guide.",
  },
  {
    slug: "disney-cruise-line",
    name: "Disney Cruise Line",
    tagline: "Family-first sailings to Baja, Mexico and the Mexican Riviera.",
    heroImage:
      "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=1600&q=80",
    logoLetter: "D",
    bookingUrl: "https://disneycruise.disney.go.com/cruises-destinations/baja/",
    homePort: "Broadway Pier / B Street Pier",
    shipsFromSD: ["Disney Wonder", "Disney Magic"],
    typicalItineraries: [
      "3–5-night Baja (Ensenada, Cabo San Lucas)",
      "7-night Mexican Riviera (Cabo, Mazatlán, Puerto Vallarta)",
      "Pacific Coast repositioning to Vancouver",
    ],
    bestFor: "Families with kids, first-time cruisers, Disney superfans",
    seasonality: "Year-round, with expanded sailings through 2031",
    priceFrom: "$1,299 per person",
    description:
      "Disney just renewed its San Diego deal through 2031 and roughly doubled the number of sailings out of the city. Disney Wonder is the resident ship, with rotational dining (Animator's Palate is the must-do), Broadway-quality shows, dedicated kids' clubs, and adults-only spaces like Cove Café and Senses Spa.",
    highlights: [
      {
        title: "Why locals like it",
        body: "The 3-night Baja weekend cruise is the easiest no-passport-needed escape from San Diego.",
      },
      {
        title: "Best itinerary",
        body: "The 5-night Baja with two sea days lets you experience the ship without a packed port schedule.",
      },
      {
        title: "Insider tip",
        body: "Book a concierge-level stateroom for private sundeck access and dedicated booking host.",
      },
    ],
    metaTitle: "Disney Cruises from San Diego — Disney Wonder Baja & Mexican Riviera",
    metaDescription:
      "Disney Cruise Line sails the Disney Wonder from San Diego year-round to Baja and the Mexican Riviera. Itineraries, what to expect and booking tips.",
  },
  {
    slug: "princess-cruises",
    name: "Princess Cruises",
    tagline: "Premium sailings to the Mexican Riviera, Hawaii and Panama Canal.",
    heroImage:
      "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=1600&q=80",
    logoLetter: "P",
    bookingUrl: "https://www.princess.com/en-us/find-a-cruise?departurePorts=SAN",
    homePort: "B Street Pier, Port of San Diego",
    shipsFromSD: ["Royal Princess", "Ruby Princess", "Discovery Princess"],
    typicalItineraries: [
      "7–10-night Mexican Riviera",
      "15-night Hawaiian Islands round-trip",
      "California Coastal & Panama Canal repositioning",
    ],
    bestFor: "Couples, longer itineraries, Hawaii without flying",
    seasonality: "Fall through spring",
    priceFrom: "$899 per person",
    description:
      "Princess is the go-to line for San Diego–to–Hawaii sailings — a 15-day round-trip that spends 4 days in the Hawaiian Islands without ever boarding a plane. The MedallionClass technology means truly keyless staterooms and pre-ordered drinks delivered anywhere on the ship.",
    highlights: [
      {
        title: "Why locals like it",
        body: "The Hawaii round-trip avoids the dreaded LAX or San Diego–Honolulu flight entirely.",
      },
      {
        title: "Best itinerary",
        body: "15-day Hawaiian Islands with stops in Honolulu, Kauai, Maui and the Big Island.",
      },
      {
        title: "Insider tip",
        body: "The Princess Plus package bundles wifi, drinks and gratuities — usually pays off on a 7+ night trip.",
      },
    ],
    metaTitle: "Princess Cruises from San Diego — Mexican Riviera, Hawaii & More",
    metaDescription:
      "Princess Cruises sails from San Diego to the Mexican Riviera, Hawaii and through the Panama Canal. Ships, itineraries and how to book.",
  },
  {
    slug: "norwegian-cruise-line",
    name: "Norwegian Cruise Line",
    tagline: "Freestyle cruising with flexible dining and casual vibes.",
    heroImage:
      "https://images.unsplash.com/photo-1566375638485-7b40d4ac7619?w=1600&q=80",
    logoLetter: "N",
    bookingUrl: "https://www.ncl.com/cruises-from/san-diego",
    homePort: "B Street Pier, Port of San Diego",
    shipsFromSD: ["Norwegian Bliss", "Norwegian Jewel", "Norwegian Spirit"],
    typicalItineraries: [
      "7-night Mexican Riviera",
      "Panama Canal full transits",
      "Pacific Coastal to Vancouver / Alaska repositioning",
    ],
    bestFor: "Younger couples, flexible dining, no-formal-night cruisers",
    seasonality: "October through April",
    priceFrom: "$749 per person",
    description:
      "Norwegian invented Freestyle Cruising — no fixed dining times, no assigned tablemates, no formal nights. The Bliss, when she's in town, brings the largest competitive go-kart track at sea, a laser tag arena and a two-deck Aqua Park.",
    highlights: [
      {
        title: "Why locals like it",
        body: "The most casual onboard dress code of any cruise line out of San Diego.",
      },
      {
        title: "Best itinerary",
        body: "Norwegian Bliss 7-night Mexican Riviera — the biggest, newest ship sailing out of San Diego in winter.",
      },
      {
        title: "Insider tip",
        body: "The Free at Sea promo (drinks + dining + wifi included) is almost always worth it.",
      },
    ],
    metaTitle: "Norwegian Cruise Line from San Diego — Bliss, Jewel & Mexican Riviera",
    metaDescription:
      "Norwegian Cruise Line sails from San Diego to the Mexican Riviera and through the Panama Canal. Ships, itineraries and Free at Sea booking tips.",
  },
  {
    slug: "carnival-cruise-line",
    name: "Carnival Cruise Line",
    tagline: "Affordable, fun-first short cruises to Baja and Mexico.",
    heroImage:
      "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=1600&q=80",
    logoLetter: "C",
    bookingUrl: "https://www.carnival.com/cruise-from/san-diego",
    homePort: "B Street Pier, Port of San Diego",
    shipsFromSD: ["Carnival Firenze", "Carnival Radiance", "Carnival Panorama"],
    typicalItineraries: [
      "3–4-night Baja (Ensenada)",
      "5-night Cabo San Lucas",
      "7-night Mexican Riviera",
    ],
    bestFor: "First-time cruisers, weekend getaways, value-focused travelers",
    seasonality: "Year-round",
    priceFrom: "$229 per person",
    description:
      "Carnival is the value and short-cruise king out of San Diego — 3-night Ensenada weekenders start under $250 per person. Carnival Firenze brings the Fun Italian Style concept (think Lido pizza and Cucina del Capitano) with year-round sailings.",
    highlights: [
      {
        title: "Why locals like it",
        body: "The cheapest way to get on a cruise ship from San Diego — under $250 per person for 3 nights.",
      },
      {
        title: "Best itinerary",
        body: "The 4-night Cabo run on Carnival Panorama — best ratio of sea days to port time for the price.",
      },
      {
        title: "Insider tip",
        body: "Carnival's CHEERS! drink package is the best value at sea if you'll have 5+ drinks per day.",
      },
    ],
    metaTitle: "Carnival Cruises from San Diego — Cheap Baja & Mexican Riviera Cruises",
    metaDescription:
      "Carnival Cruise Line sails year-round from San Diego with 3–7 night Baja, Cabo and Mexican Riviera trips from $229. Ships, itineraries and booking.",
  },
  {
    slug: "royal-caribbean",
    name: "Royal Caribbean",
    tagline: "Selective seasonal sailings on Royal's biggest West Coast ships.",
    heroImage:
      "https://images.unsplash.com/photo-1612392061787-2d078b3e573b?w=1600&q=80",
    logoLetter: "R",
    bookingUrl: "https://www.royalcaribbean.com/cruise-from/san-diego",
    homePort: "B Street Pier, Port of San Diego",
    shipsFromSD: ["Navigator of the Seas", "Quantum of the Seas (seasonal)"],
    typicalItineraries: [
      "3–4-night Baja",
      "7-night Mexican Riviera",
      "Pacific Coastal repositioning to Vancouver",
    ],
    bestFor: "Active cruisers, families wanting big-ship amenities",
    seasonality: "Limited — peak winter and spring repositioning",
    priceFrom: "$399 per person",
    description:
      "Royal isn't a year-round San Diego operator, but when Navigator or Quantum class ships reposition through the West Coast it's the best chance to sail Royal's signature features — FlowRider surf simulator, RipCord by iFly skydiving, and the North Star observation pod — without a flight to Florida.",
    highlights: [
      {
        title: "Why locals like it",
        body: "The only chance to experience Quantum-class amenities without a cross-country flight.",
      },
      {
        title: "Best itinerary",
        body: "Spring repositioning sailings up the Pacific Coast to Vancouver — scenic and uncrowded.",
      },
      {
        title: "Insider tip",
        body: "Royal's Key program (wifi + reserved seating + first-on/last-off) is worth it on shorter sailings.",
      },
    ],
    metaTitle: "Royal Caribbean from San Diego — Navigator, Quantum & Repositioning Cruises",
    metaDescription:
      "Royal Caribbean sails seasonally from San Diego with Navigator and Quantum-class ships. Mexican Riviera, Baja and Pacific Coastal itineraries.",
  },
  {
    slug: "celebrity-cruises",
    name: "Celebrity Cruises",
    tagline: "Modern luxury sailings with Michelin-pedigree dining.",
    heroImage:
      "https://images.unsplash.com/photo-1591016543133-7f256bbb9c91?w=1600&q=80",
    logoLetter: "X",
    bookingUrl: "https://www.celebritycruises.com/cruises-from/san-diego",
    homePort: "B Street Pier, Port of San Diego",
    shipsFromSD: ["Celebrity Solstice", "Celebrity Eclipse"],
    typicalItineraries: [
      "Hawaii round-trip (12–15 nights)",
      "Pacific Coastal & Panama Canal",
      "Mexican Riviera",
    ],
    bestFor: "Premium cruisers, foodies, couples on milestone trips",
    seasonality: "Fall and spring repositioning windows",
    priceFrom: "$1,099 per person",
    description:
      "Celebrity sits in the premium bracket — better dining, smaller crowds, Michelin-decorated chef Daniel Boulud as culinary ambassador, and adults-leaning ships. The Solstice-class Lawn Club has actual real grass on the top deck.",
    highlights: [
      {
        title: "Why locals like it",
        body: "Quality of food and service is a clear step above mass-market lines without going full luxury.",
      },
      {
        title: "Best itinerary",
        body: "Hawaiian Islands round-trip on Celebrity Solstice — premium service for a 2-week trip.",
      },
      {
        title: "Insider tip",
        body: "AquaClass staterooms get exclusive access to Blu restaurant — best food on the ship.",
      },
    ],
    metaTitle: "Celebrity Cruises from San Diego — Solstice, Hawaii & Premium Sailings",
    metaDescription:
      "Celebrity Cruises sails from San Diego with Solstice-class ships to Hawaii, the Mexican Riviera and Panama Canal. Premium cruise booking guide.",
  },
];

export function getCruiseLine(slug: string): CruiseLine | null {
  return CRUISE_LINES.find((c) => c.slug === slug) ?? null;
}
