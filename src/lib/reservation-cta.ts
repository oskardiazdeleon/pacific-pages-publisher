// Category-aware reservation CTA copy + provider name detection.
// Used on the listing detail page and action bar so a hotel doesn't say
// "Book a table" and a golf course doesn't either.

export type ReservationCtaCopy = {
  /** Small chip / eyebrow above the CTA card */
  eyebrow: string;
  /** Verb-led hint shown above the button, e.g. "Reserve at {name} in seconds." */
  prompt: (name: string) => string;
  /** Main button label, e.g. "Reserve on OpenTable" */
  buttonLabel: (provider: string) => string;
  /** Compact action-bar label, e.g. "Reserve" / "Book" / "Tee Time" */
  shortLabel: string;
};

function isGolf(name: string, neighborhood: string): boolean {
  const blob = `${name} ${neighborhood}`.toLowerCase();
  return /\b(golf|country club|tee time|links|fairway)\b/.test(blob);
}

export function reservationCtaForCategory(
  category: string | null | undefined,
  name: string = "",
  neighborhood: string = "",
): ReservationCtaCopy {
  const c = (category || "").toLowerCase();

  if (c.includes("hotel")) {
    return {
      eyebrow: "Book a stay",
      prompt: (n) => `Check rates and availability at ${n}.`,
      buttonLabel: (p) => `Book on ${p}`,
      shortLabel: "Book stay",
    };
  }

  if (c.includes("restaurant")) {
    return {
      eyebrow: "Book a table",
      prompt: (n) => `Reserve at ${n} in seconds.`,
      buttonLabel: (p) => `Reserve on ${p}`,
      shortLabel: "Reserve",
    };
  }

  if (c.includes("nightlife") || c.includes("bar") || c.includes("club")) {
    return {
      eyebrow: "Reserve a spot",
      prompt: (n) => `Book a table or bottle service at ${n}.`,
      buttonLabel: (p) => `Reserve on ${p}`,
      shortLabel: "Reserve",
    };
  }

  // Golf overrides Tour/Attraction
  if (isGolf(name, neighborhood)) {
    return {
      eyebrow: "Book a tee time",
      prompt: (n) => `Reserve a tee time at ${n}.`,
      buttonLabel: (p) => `Book on ${p}`,
      shortLabel: "Tee time",
    };
  }

  if (c.includes("tour")) {
    return {
      eyebrow: "Book this tour",
      prompt: (n) => `Reserve your spot on ${n}.`,
      buttonLabel: (p) => `Book on ${p}`,
      shortLabel: "Book tour",
    };
  }

  if (c.includes("attraction")) {
    return {
      eyebrow: "Get tickets",
      prompt: (n) => `Buy tickets to ${n}.`,
      buttonLabel: (p) => `Buy on ${p}`,
      shortLabel: "Tickets",
    };
  }

  if (c.includes("shopping")) {
    return {
      eyebrow: "Shop online",
      prompt: (n) => `Shop ${n} online.`,
      buttonLabel: (p) => `Visit ${p}`,
      shortLabel: "Shop",
    };
  }

  // Sensible default
  return {
    eyebrow: "Book online",
    prompt: (n) => `Book ${n} in seconds.`,
    buttonLabel: (p) => `Book on ${p}`,
    shortLabel: "Book",
  };
}

/** Pretty provider name from a reservation URL. */
export function reservationProvider(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("opentable")) return "OpenTable";
    if (host.includes("resy")) return "Resy";
    if (host.includes("exploretock") || host.includes("tock")) return "Tock";
    if (host.includes("sevenrooms")) return "SevenRooms";
    if (host.includes("yelp")) return "Yelp";
    if (host.includes("booking.com")) return "Booking.com";
    if (host.includes("expedia")) return "Expedia";
    if (host.includes("hotels.com")) return "Hotels.com";
    if (host.includes("marriott")) return "Marriott";
    if (host.includes("hilton")) return "Hilton";
    if (host.includes("hyatt")) return "Hyatt";
    if (host.includes("ihg")) return "IHG";
    if (host.includes("getyourguide")) return "GetYourGuide";
    if (host.includes("viator")) return "Viator";
    if (host.includes("teeoff") || host.includes("golfnow") || host.includes("chronogolf")) {
      return "GolfNow";
    }
    if (host.includes("sandiego.com")) return "the partner site";
    return host.split(".").slice(-2, -1)[0]?.replace(/^\w/, (c) => c.toUpperCase()) || "the partner site";
  } catch {
    return "the partner site";
  }
}
