// Per-category long-form SEO content for hub pages.
// Provides the intro paragraph, "About …" body, and FAQ used by
// CategoryHubPage. Editors can replace any of this copy in-place;
// generic fallbacks are derived from hub metadata so newly-added
// hubs still ship with valid SEO scaffolding.

import type { CategoryHub } from "./listing-categories";

export type CategoryFaq = { q: string; a: string };

export type CategorySeoContent = {
  /** 100–150 words shown above the listing grid */
  intro: string;
  /** H2 for the long-form section below the grid */
  aboutHeading: string;
  /** 200–300 word body with H3 subheadings (rendered as markdown-like sections) */
  aboutSections: { heading: string; body: string }[];
  /** 4–6 FAQ items — also emitted as FAQPage JSON-LD */
  faqs: CategoryFaq[];
};

const CONTENT: Partial<Record<string, CategorySeoContent>> = {
  hotels: {
    intro:
      "San Diego's hotel scene runs from oceanfront resorts on Coronado and La Jolla's bluffs to boutique stays tucked into the Gaslamp Quarter's Victorian brick. With 70 miles of Pacific coastline and a year-round Mediterranean climate, picking the right neighborhood matters as much as picking the right property — Downtown puts you steps from restaurants and the ballpark, Pacific Beach drops you on the boardwalk, and Coronado's island calm is a short ferry from it all. Our editors stay at every property we recommend, weigh the views against the walkability, and flag the rooms worth the upgrade. Insider members unlock member-only rates and complimentary perks at participating properties — every booking on sandiego.com is curated, never algorithmic.",
    aboutHeading: "About San Diego hotels",
    aboutSections: [
      {
        heading: "How we pick San Diego's best hotels",
        body: "Every hotel on sandiego.com is hand-reviewed by our local editorial team. We weigh location, room quality, on-site dining, service consistency and value — then we add the things only locals know: which floor catches the marine layer, which pool is loudest at brunch, and which spa is actually worth the day pass. Sponsored placements are clearly labeled and never affect editorial rankings.",
      },
      {
        heading: "Best neighborhoods to stay in",
        body: "Gaslamp Quarter and Little Italy are best for first-time visitors who want to walk to dinner. Coronado and La Jolla are best for beach-forward stays with resort amenities. Mission Bay is the family pick — flat, calm water and walkable boardwalks. North Park and South Park are emerging picks for travelers who'd rather sleep near coffee bars and breweries than the convention center.",
      },
      {
        heading: "When to book and how to save",
        body: "Rates climb from Memorial Day through Labor Day and again over Comic-Con week in late July. Book at least 60 days out for summer and over major events; shoulder season (April–May, September–October) consistently delivers the best balance of weather and price. Insider members save 15–40% at participating hotels through member-only rate codes that don't appear on public booking sites.",
      },
    ],
    faqs: [
      { q: "What's the best neighborhood to stay in San Diego?", a: "Gaslamp Quarter and Little Italy are best for walkability and nightlife. La Jolla and Coronado are best for beach and resort amenities. Mission Bay is best for families." },
      { q: "How much does a hotel in San Diego cost?", a: "Rates start around $129/night for downtown 3-star properties in shoulder season. Beachfront resorts and La Jolla properties typically run $300–$650/night, climbing in summer." },
      { q: "Do San Diego hotels include parking?", a: "Most downtown and resort hotels charge $35–$60/night for self or valet parking. A handful of boutique properties and Coronado resorts include it — we flag those on each listing." },
      { q: "When is the cheapest time to visit San Diego?", a: "January through early March and late September through November consistently deliver the lowest hotel rates with the weather still in the 60s and 70s." },
      { q: "Are San Diego hotels walkable to the beach?", a: "Hotels in Pacific Beach, Mission Beach, Coronado and La Jolla Shores are within a few blocks of the sand. Downtown properties are a short rideshare or trolley ride away." },
      { q: "How do Insider members save on San Diego hotels?", a: "SD Insider members get member-only rate codes that save 15–40% at participating hotels, plus complimentary upgrades and late checkout where available." },
    ],
  },
  restaurants: {
    intro:
      "San Diego's food scene quietly rivals any major US city — Michelin stars in Convoy and Carmel Valley, James Beard nods in North Park, and the best fish tacos this side of Ensenada in the strip malls of Barrio Logan. Our editors live and eat here. We update sandiego.com weekly with the restaurants worth a detour, the neighborhood spots locals never name-drop, and the new openings that actually deliver. Whether you're after Little Italy's pasta row, La Jolla's ocean-view tasting menus, or a 2am birria in City Heights, this is the only San Diego restaurant guide written by people who genuinely live a meal away. Insider members get priority reservations and complimentary courses at participating partners.",
    aboutHeading: "About San Diego restaurants",
    aboutSections: [
      {
        heading: "How we rank San Diego restaurants",
        body: "Every restaurant on this list has been visited — usually multiple times — by our editorial team. We score on food quality, service, value, atmosphere and the indefinable factor that makes a meal memorable. We pay our own checks. Sponsorships and partner discounts are always disclosed and never affect rankings.",
      },
      {
        heading: "Best neighborhoods for food",
        body: "Little Italy is the city's most concentrated restaurant row, with Italian classics and modern small plates side by side. Convoy Street is the Asian food corridor — handpulled noodles, omakase, Korean BBQ. North Park is craft-cocktail and chef-driven small plates. Barrio Logan and Logan Heights are where to chase Baja-style tacos, mariscos and birria.",
      },
      {
        heading: "How to score reservations in San Diego",
        body: "The best tables open exactly 30 days out at midnight Pacific. Resy, OpenTable and Tock cover most of the city — set alerts on your shortlist. For weekend dinners at the marquee spots, book the moment your date lands in the window. Insider members get priority booking and chef's-table holds at participating restaurants through our concierge.",
      },
    ],
    faqs: [
      { q: "What's the best restaurant neighborhood in San Diego?", a: "Little Italy for Italian and small plates, Convoy for Asian, North Park for craft cocktails and chef-driven menus, Barrio Logan for Baja-style tacos and mariscos." },
      { q: "Does San Diego have Michelin-starred restaurants?", a: "Yes — San Diego county currently has multiple Michelin-starred restaurants, with concentrations in Carmel Valley, La Jolla and Convoy." },
      { q: "What food is San Diego famous for?", a: "California burritos, Baja-style fish tacos, carne asada fries and a deep Mexican-seafood (mariscos) tradition driven by the city's proximity to Tijuana and Ensenada." },
      { q: "How far in advance should I book dinner in San Diego?", a: "30 days for marquee spots on weekends; 7–14 days for most chef-driven restaurants; same-day is usually fine outside peak hours at neighborhood favorites." },
      { q: "Is San Diego expensive for dining out?", a: "Average dinner check at a mid-range San Diego restaurant runs $35–$60 per person before drinks. The taco shops and food halls keep great-value options under $20." },
      { q: "What's the dress code at most San Diego restaurants?", a: "San Diego is a famously casual dining city — smart-casual is fine almost everywhere. A few La Jolla and Carmel Valley tasting menus prefer business-casual." },
    ],
  },
};

/** Generic fallback for any hub without bespoke copy. */
function genericContent(hub: CategoryHub): CategorySeoContent {
  const label = hub.label.toLowerCase();
  const singular = hub.singular.toLowerCase();
  return {
    intro: `San Diego's ${label} scene spans neighborhoods that each play by their own rules — beachfront in La Jolla and Coronado, downtown energy in the Gaslamp Quarter and East Village, walkable indie blocks in North Park and South Park, and a string of coastal towns from Imperial Beach up to Encinitas. Our editors live here and update sandiego.com weekly with handpicked picks for ${label} worth your time. Every recommendation is reviewed, ranked and rotated by people who actually walk these blocks — not by an algorithm. Insider members unlock exclusive savings and access at participating partners across San Diego county.`,
    aboutHeading: `About ${label} in San Diego`,
    aboutSections: [
      {
        heading: `How we curate San Diego ${label}`,
        body: `Every ${singular} on sandiego.com is hand-reviewed by our local editorial team. We weigh quality, location, value and the things only locals know. Sponsored placements are clearly labeled and never override editorial rankings.`,
      },
      {
        heading: `Best neighborhoods for ${label}`,
        body: `Different parts of San Diego specialize in different experiences. Downtown and the Gaslamp Quarter pack the highest concentration into walkable blocks. La Jolla, Coronado and the beach towns lean coastal. North Park, South Park and University Heights are where locals go for the indie scene.`,
      },
      {
        heading: `When to visit and how to save`,
        body: `San Diego's peak season runs Memorial Day through Labor Day, with another spike around Comic-Con and major holidays. Shoulder season (April–May, September–October) delivers the best balance of weather and value. Insider members save at participating ${label} partners through member-only pricing.`,
      },
    ],
    faqs: [
      { q: `What are the best ${label} in San Diego?`, a: `Our editors maintain a curated, ranked list above — refreshed weekly. Top picks span the Gaslamp Quarter, La Jolla, Coronado and the city's emerging neighborhoods.` },
      { q: `Which San Diego neighborhood is best for ${label}?`, a: `Downtown and Gaslamp for walkability and concentration. La Jolla and Coronado for coastal experiences. North Park for the indie, locals-first scene.` },
      { q: `When is the best time to visit San Diego?`, a: `Year-round Mediterranean climate makes any month workable. April–May and September–October offer the best balance of weather, crowds and pricing.` },
      { q: `How do Insider members save on ${label}?`, a: `SD Insider members get member-only pricing, complimentary upgrades and priority access at participating ${label} partners across San Diego county.` },
    ],
  };
}

export function categoryContent(hub: CategoryHub): CategorySeoContent {
  return CONTENT[hub.slug] ?? genericContent(hub);
}
