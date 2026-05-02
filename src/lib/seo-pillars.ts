// Layer 3 SEO: Benefit pillar pages.
// Conversion-focused landing pages targeting "save on X in San Diego" intent,
// each pointing to Insider signup. URL pattern: /save-on/{slug}
//
// Each pillar maps to one or more category hubs so we can pull live, curated
// listings as social proof of the benefit.

export type SeoPillar = {
  slug: string;
  benefit: string; // headline noun, e.g. "San Diego Hotels"
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  // Average / typical member savings — used for stats strip
  avgSavings: string; // e.g. "$120 per night"
  savingsRange: string; // e.g. "15–40% off"
  // What members get specifically for this pillar
  bullets: string[];
  // FAQ block (5 Qs ideal for FAQPage schema)
  faqs: { q: string; a: string }[];
  // Pull listings from these category slugs (matches CategoryHub.slug)
  proofCategories: ReadonlyArray<
    "hotels" | "restaurants" | "things-to-do" | "shopping" | "nightlife"
  >;
};

export const SEO_PILLARS: SeoPillar[] = [
  {
    slug: "hotels",
    benefit: "San Diego Hotels",
    metaTitle: "Save 15–40% on San Diego Hotels | Insider Member Pricing",
    metaDescription:
      "Insider members save $80–$200 per night on 200+ San Diego hotels — Gaslamp, Coronado, La Jolla, Mission Bay. Free 7-day trial. One night pays for the year.",
    eyebrow: "Hotel Savings",
    heading: "Save $80–$200 per night on San Diego hotels.",
    subheading:
      "Insider unlocks negotiated rates at 200+ vetted hotels — from boutique Gaslamp stays to oceanfront Coronado resorts. Most members earn back the annual fee in a single weekend.",
    avgSavings: "$120 per night",
    savingsRange: "15–40% off",
    bullets: [
      "Negotiated member rates at 200+ San Diego hotels and resorts",
      "Includes Coronado, Gaslamp, La Jolla, Mission Bay & Carlsbad",
      "Last-minute and weekday-only deals locals book most",
      "Members average $480 in hotel savings per year",
    ],
    faqs: [
      {
        q: "How much do members really save on hotels?",
        a: "Members average $80–$200 per night off public rates, depending on the property and date. Boutique hotels and resort weeks see the largest discounts — often 30–40% off.",
      },
      {
        q: "Which San Diego hotels are included?",
        a: "Over 200 properties across Coronado, Gaslamp Quarter, La Jolla, Mission Bay, Pacific Beach, Carlsbad and Downtown — including the Hotel del Coronado, Pendry, and most major boutique brands.",
      },
      {
        q: "Is this like a discount code site?",
        a: "No. Insider rates are negotiated directly with each hotel and only available to active members. They don't show up on Expedia, Booking, or hotel websites.",
      },
      {
        q: "What if I only travel once a year?",
        a: "The Premier annual plan ($149/yr) typically pays for itself the first night. After that, every additional booking is pure savings.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes — every plan can be cancelled anytime, and Premier comes with a 30-day full refund.",
      },
    ],
    proofCategories: ["hotels"],
  },
  {
    slug: "things-to-do",
    benefit: "San Diego Tickets & Attractions",
    metaTitle: "Save on San Diego Attractions, Tours & Tickets | Insider",
    metaDescription:
      "Insider members save 10–30% on San Diego Zoo, harbor cruises, whale watching, brewery tours, Padres games and 100+ attractions. Free 7-day trial.",
    eyebrow: "Things to Do",
    heading: "Skip the line. Save on every San Diego ticket.",
    subheading:
      "From Hornblower harbor cruises to Padres games and Balboa Park museums, Insider members get pre-negotiated pricing on the experiences locals actually book.",
    avgSavings: "$32 per ticket",
    savingsRange: "10–30% off",
    bullets: [
      "Member pricing at the Zoo, Safari Park, Birch Aquarium and Belmont Park",
      "Discounted harbor cruises, whale watching and sunset sails",
      "Padres, Wave FC and Gulls ticket pre-sales",
      "Brewery, distillery and food tour rates locals use",
    ],
    faqs: [
      {
        q: "Do members really save on the San Diego Zoo?",
        a: "Yes — members get a small but meaningful discount on Zoo and Safari Park admission, and bigger savings (15–25%) on multi-attraction passes that bundle the Zoo with the Aquarium and other attractions.",
      },
      {
        q: "What about Padres tickets?",
        a: "Members get access to Insider pre-sales, group discounts and discounted tickets on weekday games. Savings are typically $8–$22 per seat.",
      },
      {
        q: "Are tour discounts limited to one operator?",
        a: "No. Insider partners with Hornblower, Flagship, brewery tour operators, whale-watching outfitters and dozens of independent local guides.",
      },
      {
        q: "Can I use these for a one-day visit?",
        a: "Absolutely. The free 7-day trial covers a full weekend's worth of attractions — many one-time visitors save more than the trial would have cost in a single day.",
      },
      {
        q: "How do I redeem ticket savings?",
        a: "After joining, your member dashboard surfaces the live deal and a one-click booking link or unique discount code per partner.",
      },
    ],
    proofCategories: ["things-to-do"],
  },
  {
    slug: "restaurants",
    benefit: "San Diego Restaurants",
    metaTitle: "Save on San Diego Restaurants | Insider Member Dining Perks",
    metaDescription:
      "Insider members get reservation priority, complimentary courses and 10–20% off bills at San Diego's best restaurants — Little Italy, Gaslamp, La Jolla.",
    eyebrow: "Dining",
    heading: "Eat at San Diego's best restaurants — for less.",
    subheading:
      "Reservation priority, comp'd courses, and member-only tasting menus at Little Italy, Gaslamp, La Jolla and the East Village's most-booked tables.",
    avgSavings: "$28 per visit",
    savingsRange: "10–20% off",
    bullets: [
      "Member dining perks at 80+ chef-driven San Diego restaurants",
      "Priority reservations on Friday and Saturday nights",
      "Complimentary courses, glasses of wine and tasting flights",
      "Members-only chef collaboration dinners and tasting events",
    ],
    faqs: [
      {
        q: "How does the dining benefit work?",
        a: "Each partner restaurant offers something different — a complimentary appetizer, a percentage off the food bill, or a comp'd glass of wine. Your member dashboard shows the perk per restaurant before you book.",
      },
      {
        q: "Do I have to book through Insider?",
        a: "Most perks require booking through your Insider dashboard or mentioning your membership at the host stand. We integrate with OpenTable, Resy and Tock where possible.",
      },
      {
        q: "Are tips and alcohol included in discounts?",
        a: "Discounts apply to food only — tax and gratuity are not included. Some members get specific drink credits (e.g., a complimentary glass of bubbles) on top.",
      },
      {
        q: "Are member events extra?",
        a: "Most are free or heavily discounted for Premier and Plus members. Explorer members pay slightly more but still get pre-sale access.",
      },
      {
        q: "Can I bring guests?",
        a: "Yes — the discount applies to your full table at most partner restaurants. Plus and Elite members get extra guest passes.",
      },
    ],
    proofCategories: ["restaurants"],
  },
  {
    slug: "cruises",
    benefit: "San Diego Cruises & Harbor Tours",
    metaTitle: "Save on San Diego Cruises & Harbor Tours | Insider",
    metaDescription:
      "Insider members save 15–25% on Hornblower harbor cruises, whale watching, sunset sails and dinner cruises in San Diego Bay. Free trial.",
    eyebrow: "On the Water",
    heading: "Sunset cruises, whale watching, harbor tours — for less.",
    subheading:
      "Insider unlocks negotiated rates with Hornblower, Flagship, and the small-group sailing charters locals love. Most member cruise bookings save more than the annual fee in one trip.",
    avgSavings: "$42 per cruise",
    savingsRange: "15–25% off",
    bullets: [
      "Discounted Hornblower harbor and dinner cruises",
      "Whale watching at Insider-only group rates (December–April)",
      "Private and small-group sailing charters",
      "Sunset sails and SEAL tour discounts",
    ],
    faqs: [
      {
        q: "How big are the cruise savings?",
        a: "Typical savings are $20–$60 per ticket on harbor cruises and $40–$120 per ticket on dinner and whale-watching cruises. Group rates can save families significantly more.",
      },
      {
        q: "Can I book cruises last-minute?",
        a: "Yes — Insider rates apply to last-minute availability when seats are open, and members often get priority on premium tour windows.",
      },
      {
        q: "Are private charters included?",
        a: "Plus and Elite members get negotiated rates on private sailing charters and yacht rentals. Explorer members get small-group rates.",
      },
      {
        q: "Is whale-watching available year-round?",
        a: "Gray whale season runs December through April; blue whale and dolphin tours run May through November. Insider rates apply year-round.",
      },
      {
        q: "Do I need to bring my membership card?",
        a: "No physical card — your member dashboard generates a one-time booking link or code per cruise.",
      },
    ],
    proofCategories: ["things-to-do"],
  },
  {
    slug: "shopping",
    benefit: "San Diego Shopping",
    metaTitle: "Save at San Diego Shops & Boutiques | Insider Member Discounts",
    metaDescription:
      "Insider members get 10–20% off at San Diego's best independent boutiques, design shops and surf brands — Little Italy, North Park, Coronado, La Jolla.",
    eyebrow: "Shopping",
    heading: "Shop independent San Diego — at member prices.",
    subheading:
      "From Little Italy design shops to North Park record stores and Coronado boutiques, Insider partners with the city's best independent retailers for member-only discounts.",
    avgSavings: "$45 per visit",
    savingsRange: "10–20% off",
    bullets: [
      "Member discounts at 60+ independent San Diego shops",
      "Coronado, Little Italy, La Jolla and North Park boutiques",
      "Surf, skate and outdoor gear from local SD brands",
      "Quarterly member-only trunk shows and product drops",
    ],
    faqs: [
      {
        q: "How does in-store redemption work?",
        a: "Show your digital member badge at checkout — the staff applies the discount or perk. Online partners use a one-time member code.",
      },
      {
        q: "Are sale items included?",
        a: "Most partners apply member discounts to full-price items only. Some run member-exclusive sale events on top.",
      },
      {
        q: "Can I stack discounts with store loyalty programs?",
        a: "Policy varies per shop — many independents allow stacking. Check the per-partner notes in your dashboard.",
      },
      {
        q: "Do online orders qualify?",
        a: "Yes — most partner brands honor Insider rates online via a member-only code or login.",
      },
      {
        q: "Are gift cards eligible?",
        a: "Gift card purchases are not discounted, but using a gift card to pay for a discounted item is fine.",
      },
    ],
    proofCategories: ["shopping"],
  },
  {
    slug: "nightlife",
    benefit: "San Diego Nightlife",
    metaTitle: "Save on San Diego Nightlife & Bars | Insider Member Perks",
    metaDescription:
      "Insider members get cover-free entry, comp'd drinks and reserved tables at top San Diego rooftop bars, breweries and live-music venues.",
    eyebrow: "Nightlife",
    heading: "Skip the cover. Walk straight in.",
    subheading:
      "Reserved tables, comp'd drinks and no-cover entry at the rooftop bars, breweries and live-music venues San Diego is actually going out to.",
    avgSavings: "$36 per night out",
    savingsRange: "Cover-free + comp'd drinks",
    bullets: [
      "Skip-the-line and no-cover entry at 30+ Gaslamp & East Village venues",
      "Complimentary drink on arrival at most partners",
      "Reserved high-tops on Friday and Saturday nights",
      "Member-only brewery flights and distillery tastings",
    ],
    faqs: [
      {
        q: "How does no-cover entry work?",
        a: "Show your digital member badge at the door. Doormen at partner venues are trained on the perk — typically waiving cover for you and one guest.",
      },
      {
        q: "What about the busiest nights?",
        a: "On peak nights (NYE, Comic-Con, big concerts), some venues replace the perk with priority entry — you skip the line but still pay cover.",
      },
      {
        q: "Are breweries and tasting rooms included?",
        a: "Yes — most partner breweries and distilleries offer member flights, comp'd pours or 10–20% off bills.",
      },
      {
        q: "Can I reserve tables in advance?",
        a: "Plus and Elite members can reserve high-tops 48 hours in advance at most partners. Explorer members can usually walk in and get seated.",
      },
      {
        q: "What if I'm visiting from out of town?",
        a: "Perfect — the free 7-day trial covers a weekend trip and most members save the trial's value in one Friday night out.",
      },
    ],
    proofCategories: ["nightlife"],
  },
];

const BY_SLUG = new Map<string, SeoPillar>(SEO_PILLARS.map((p) => [p.slug, p]));

export function getSeoPillar(slug: string): SeoPillar | null {
  return BY_SLUG.get(slug) ?? null;
}

export function allSeoPillarSlugs(): string[] {
  return SEO_PILLARS.map((p) => p.slug);
}
