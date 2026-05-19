// UTM helpers — every internal CTA that targets a conversion surface
// (/insider, /partners, etc.) should pass through these so GA4 + Stripe
// metadata can attribute the click.

export type UTM = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
};

/**
 * Append (or overwrite) UTM params on a URL. Works for both absolute URLs
 * ("https://sandiego.com/insider") and same-origin paths ("/insider").
 */
export function appendUTMs(
  url: string,
  source: string,
  medium: string,
  campaign: string,
): string {
  const base =
    typeof window !== "undefined" ? window.location.origin : "https://sandiego.com";
  const isAbsolute = /^https?:\/\//i.test(url);
  const u = new URL(url, base);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", campaign);
  return isAbsolute ? u.toString() : `${u.pathname}${u.search}${u.hash}`;
}

/** Search-object form for <Link to="/insider" search={insiderUTM("header")} /> */
export function insiderUTM(medium: string): UTM {
  return { utm_source: "site", utm_medium: medium, utm_campaign: "insider" };
}

export function partnerUTM(medium: string): UTM {
  return { utm_source: "site", utm_medium: medium, utm_campaign: "b2b" };
}

/** Read incoming UTM params off the current URL (browser only). */
export function readIncomingUTMs(): Partial<UTM> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Partial<UTM> = {};
  const s = p.get("utm_source");
  const m = p.get("utm_medium");
  const c = p.get("utm_campaign");
  if (s) out.utm_source = s;
  if (m) out.utm_medium = m;
  if (c) out.utm_campaign = c;
  return out;
}
