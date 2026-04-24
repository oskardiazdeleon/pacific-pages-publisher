import gaslamp from "@/assets/neighborhood-gaslamp.jpg";
import lajolla from "@/assets/neighborhood-lajolla.jpg";
import coronado from "@/assets/neighborhood-coronado.jpg";
import balboa from "@/assets/neighborhood-balboa.jpg";
import foodie from "@/assets/article-foodie.jpg";
import surf from "@/assets/article-surf.jpg";
import hotel from "@/assets/article-hotel.jpg";
import listingRestaurant from "@/assets/listing-restaurant.jpg";
import listingHotel from "@/assets/listing-hotel.jpg";
import listingAttraction from "@/assets/listing-attraction.jpg";

export type Neighborhood = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
};

export const neighborhoods: Neighborhood[] = [
  { slug: "la-jolla", name: "La Jolla", blurb: "Sea cliffs, coves, and the famous sea lions.", image: lajolla },
  { slug: "gaslamp-quarter", name: "Gaslamp Quarter", blurb: "Historic downtown after dark.", image: gaslamp },
  { slug: "coronado", name: "Coronado", blurb: "White-sand beaches and the iconic Hotel Del.", image: coronado },
  { slug: "balboa-park", name: "Balboa Park", blurb: "Museums, gardens, and Spanish architecture.", image: balboa },
];

export type Listing = {
  slug: string;
  name: string;
  category: "Restaurant" | "Hotel" | "Attraction" | "Tour";
  neighborhood: string;
  blurb: string;
  image: string;
  tier: "free" | "featured" | "premium";
  rating: number;
};

export const listings: Listing[] = [
  {
    slug: "marina-table",
    name: "Marina Table",
    category: "Restaurant",
    neighborhood: "Gaslamp Quarter",
    blurb: "Coastal Californian cuisine with sweeping bay views.",
    image: listingRestaurant,
    tier: "premium",
    rating: 4.8,
  },
  {
    slug: "pacific-shores-resort",
    name: "Pacific Shores Resort",
    category: "Hotel",
    neighborhood: "Coronado",
    blurb: "Beachfront luxury with two pools and a private cove.",
    image: listingHotel,
    tier: "featured",
    rating: 4.7,
  },
  {
    slug: "la-jolla-cove-tours",
    name: "La Jolla Cove Tours",
    category: "Attraction",
    neighborhood: "La Jolla",
    blurb: "Guided sea-lion and kayak experiences along the cliffs.",
    image: listingAttraction,
    tier: "free",
    rating: 4.6,
  },
  {
    slug: "harbor-grill",
    name: "Harbor Grill",
    category: "Restaurant",
    neighborhood: "Embarcadero",
    blurb: "Fresh-caught seafood served sundown to midnight.",
    image: listingRestaurant,
    tier: "featured",
    rating: 4.5,
  },
  {
    slug: "balboa-boutique-hotel",
    name: "Balboa Boutique Hotel",
    category: "Hotel",
    neighborhood: "Balboa Park",
    blurb: "An intimate stay steps from the museums.",
    image: listingHotel,
    tier: "free",
    rating: 4.4,
  },
  {
    slug: "sunset-sail-co",
    name: "Sunset Sail Co.",
    category: "Tour",
    neighborhood: "Embarcadero",
    blurb: "Two-hour sailings on a classic 60-foot schooner.",
    image: listingAttraction,
    tier: "premium",
    rating: 4.9,
  },
];

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  readTime: string;
  date: string;
  author: string;
};

export const articles: Article[] = [
  {
    slug: "best-fish-tacos-2026",
    title: "The Best Fish Tacos in San Diego, Ranked",
    excerpt: "We tasted forty-two fish tacos so you don't have to. Here are the eleven worth your trip.",
    category: "Food & Drink",
    image: foodie,
    readTime: "8 min read",
    date: "Apr 18, 2026",
    author: "Maya Alvarez",
  },
  {
    slug: "sunrise-surf-spots",
    title: "Six Sunrise Surf Spots Locals Don't Talk About",
    excerpt: "Skip the Pacific Beach crowds. These quieter breaks deliver glassy mornings year-round.",
    category: "Outdoors",
    image: surf,
    readTime: "6 min read",
    date: "Apr 12, 2026",
    author: "Jordan Kim",
  },
  {
    slug: "boutique-hotel-guide",
    title: "A Boutique Hotel Guide to a Slower San Diego",
    excerpt: "From mid-century revivals to oceanfront ryokans — where to stay when chains won't do.",
    category: "Stays",
    image: hotel,
    readTime: "10 min read",
    date: "Apr 04, 2026",
    author: "Priya Shah",
  },
];
