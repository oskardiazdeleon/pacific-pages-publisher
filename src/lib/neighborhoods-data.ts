import gaslamp from "@/assets/neighborhood-gaslamp.jpg";
import lajolla from "@/assets/neighborhood-lajolla.jpg";
import coronado from "@/assets/neighborhood-coronado.jpg";
import balboa from "@/assets/neighborhood-balboa.jpg";

export type NeighborhoodHub = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  intro: string;
  bestFor: string[];
  highlights: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  geo?: { lat: number; lng: number };
};

export const neighborhoodHubs: NeighborhoodHub[] = [
  {
    slug: "la-jolla",
    name: "La Jolla",
    image: lajolla,
    blurb: "Sea cliffs, coves, and the famous sea lions.",
    intro:
      "La Jolla — Spanish for 'the jewel' — is San Diego's most iconic stretch of coastline. Sandstone cliffs drop into clear Pacific water, sea lions sun themselves on the rocks, and an upscale village of galleries and seafood restaurants sits just blocks from the beach.",
    bestFor: ["Beachfront hotels", "Snorkeling & kayaking", "Fine dining", "Tide pools"],
    highlights: [
      { title: "La Jolla Cove", body: "Crystal water, protected marine reserve, and resident sea lions." },
      { title: "Mount Soledad", body: "360° views of the coast, downtown San Diego and (on clear days) Mexico." },
      { title: "Children's Pool", body: "Historic seawall beach now home to a harbor-seal colony." },
    ],
    faqs: [
      { q: "Is La Jolla worth visiting in San Diego?", a: "Yes — La Jolla is consistently ranked among California's best coastal towns and is a 20-minute drive from downtown San Diego." },
      { q: "What is the best time to visit La Jolla?", a: "May through October offers the warmest water and clearest skies. June can be foggy ('June gloom'); September is locals' favorite month." },
      { q: "Where should I stay in La Jolla?", a: "Beachfront resorts cluster around La Jolla Shores and the Cove. Boutique hotels line Prospect Street in the village." },
    ],
    geo: { lat: 32.8328, lng: -117.2713 },
  },
  {
    slug: "gaslamp-quarter",
    name: "Gaslamp Quarter",
    image: gaslamp,
    blurb: "Historic downtown after dark.",
    intro:
      "The Gaslamp Quarter is downtown San Diego's 16-block historic core — Victorian-era brick buildings now filled with rooftop bars, chef-driven restaurants, live-music venues and the city's busiest nightlife.",
    bestFor: ["Nightlife", "Rooftop bars", "Convention-center stays", "Padres games"],
    highlights: [
      { title: "Petco Park", body: "Home of the San Diego Padres, a short walk from every Gaslamp hotel." },
      { title: "Fifth Avenue", body: "The main drag — restaurants, clubs, and street performers every weekend." },
      { title: "Historic Walking Tours", body: "Ride a guided trolley through 1880s architecture and speakeasy lore." },
    ],
    faqs: [
      { q: "Is the Gaslamp Quarter safe at night?", a: "Yes — it's well-lit, heavily foot-trafficked, and patrolled. Standard urban precautions apply." },
      { q: "What's the difference between Gaslamp and East Village?", a: "Gaslamp is the historic entertainment core; East Village (just east) is newer, with Petco Park and a quieter craft-beer scene." },
      { q: "Where should I park in the Gaslamp?", a: "Most hotels offer valet ($45+). Public garages on 6th and Market are the best value." },
    ],
    geo: { lat: 32.7106, lng: -117.1602 },
  },
  {
    slug: "coronado",
    name: "Coronado",
    image: coronado,
    blurb: "White-sand beaches and the iconic Hotel Del.",
    intro:
      "Coronado is a peninsula across the bay from downtown — a small-town village with one of America's most decorated beaches and the legendary Hotel del Coronado, a Victorian beach resort that's been hosting presidents and movie stars since 1888.",
    bestFor: ["Family beach trips", "Wide flat sand", "Bike rides", "Iconic resorts"],
    highlights: [
      { title: "Coronado Beach", body: "Repeatedly named a top-10 U.S. beach for its mica-flecked, sparkling sand." },
      { title: "Hotel del Coronado", body: "National Historic Landmark; worth a walk-through even if you're not staying." },
      { title: "Coronado Bridge", body: "The 2.1-mile sweeping arch over San Diego Bay — drive it at sunset." },
    ],
    faqs: [
      { q: "How do you get to Coronado from San Diego?", a: "Either drive across the Coronado Bridge (10 minutes from downtown) or take the Coronado Ferry from the Embarcadero (15 minutes)." },
      { q: "Is Coronado a separate city?", a: "Yes — Coronado is its own incorporated city, technically connected by a sand strand to Imperial Beach." },
      { q: "What's the best beach in Coronado?", a: "Coronado Central Beach in front of the Hotel Del has the widest, flattest sand and the famous sparkle." },
    ],
    geo: { lat: 32.6859, lng: -117.1831 },
  },
  {
    slug: "balboa-park",
    name: "Balboa Park",
    image: balboa,
    blurb: "Museums, gardens, and Spanish architecture.",
    intro:
      "Balboa Park is San Diego's 1,200-acre cultural heart — 17 museums, the world-famous San Diego Zoo, Spanish Colonial Revival pavilions from the 1915 Panama-California Exposition, and gardens you could wander for a week.",
    bestFor: ["Museums", "San Diego Zoo", "Free outdoor concerts", "Architecture lovers"],
    highlights: [
      { title: "San Diego Zoo", body: "World-renowned for conservation and one of the few zoos with giant pandas." },
      { title: "Spanish Village Art Center", body: "Working artist studios in a colorful 1935 plaza — free to visit." },
      { title: "Botanical Building", body: "One of the largest lath structures in the world, full of orchids and ferns." },
    ],
    faqs: [
      { q: "Is Balboa Park free?", a: "Entrance to the park and most gardens is free. Individual museums charge admission; many offer free Tuesdays for residents." },
      { q: "How long do you need at Balboa Park?", a: "A half day for highlights, two full days to do the zoo and 3-4 museums properly." },
      { q: "Is the San Diego Zoo inside Balboa Park?", a: "Yes — the zoo occupies the park's northwest corner and has its own entrance and parking." },
    ],
    geo: { lat: 32.7341, lng: -117.1446 },
  },
];

export function getNeighborhoodHub(slug: string) {
  return neighborhoodHubs.find((n) => n.slug === slug);
}
