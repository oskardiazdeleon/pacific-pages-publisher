import { useEffect, useState, Fragment } from "react";
import { CruiseCard, CruiseCardSkeleton } from "@/components/site/CruiseCard";
import { WeddingVenueCard, WeddingVenueCardSkeleton } from "@/components/site/WeddingVenueCard";
import { ListingEmbedCard, ListingEmbedCardSkeleton } from "@/components/site/ListingEmbedCard";
import { fetchCruiseLineBySlug, type CruiseLine } from "@/lib/cruise-lines";
import { fetchWeddingVenueBySlug, type WeddingVenue } from "@/lib/wedding-venues";
import { fetchEmbedListingBySlug, type EmbedListing } from "@/lib/listings-embed";

type Segment =
  | { type: "html"; html: string }
  | { type: "embed"; kind: "cruise" | "venue" | "listing"; slug: string; variant: "full" | "compact" };

// Match <div data-embed-card ...></div> in any attribute order, with or without
// inner whitespace. TipTap serializes the node as an empty div with data attrs.
const EMBED_RE = /<div\b[^>]*data-embed-card\b[^>]*>\s*<\/div>/gi;

function getAttr(tag: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

function splitHtml(html: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  EMBED_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EMBED_RE.exec(html))) {
    if (m.index > last) out.push({ type: "html", html: html.slice(last, m.index) });
    const tag = m[0];
    const kindRaw = getAttr(tag, "data-kind") || "";
    const slug = getAttr(tag, "data-slug") || "";
    const variant = (getAttr(tag, "data-variant") === "compact" ? "compact" : "full") as
      | "full"
      | "compact";
    const kind: "cruise" | "venue" | "listing" =
      kindRaw === "venue" ? "venue" : kindRaw === "listing" ? "listing" : "cruise";
    if (slug) out.push({ type: "embed", kind, slug, variant });
    last = m.index + tag.length;
  }
  if (last < html.length) out.push({ type: "html", html: html.slice(last) });
  return out;
}

interface Props {
  html: string;
  className?: string;
}

export function ArticleBodyRenderer({ html, className }: Props) {
  const segments = splitHtml(html || "");

  const cruiseSlugs = [
    ...new Set(segments.flatMap((s) => (s.type === "embed" && s.kind === "cruise" ? [s.slug] : []))),
  ];
  const venueSlugs = [
    ...new Set(segments.flatMap((s) => (s.type === "embed" && s.kind === "venue" ? [s.slug] : []))),
  ];
  const listingSlugs = [
    ...new Set(segments.flatMap((s) => (s.type === "embed" && s.kind === "listing" ? [s.slug] : []))),
  ];

  const [cruises, setCruises] = useState<Record<string, CruiseLine | null>>({});
  const [venues, setVenues] = useState<Record<string, WeddingVenue | null>>({});
  const [listings, setListings] = useState<Record<string, EmbedListing | null>>({});

  useEffect(() => {
    if (cruiseSlugs.length === 0) return;
    let alive = true;
    Promise.all(cruiseSlugs.map((s) => fetchCruiseLineBySlug(s).then((c) => [s, c] as const))).then(
      (entries) => alive && setCruises(Object.fromEntries(entries)),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cruiseSlugs.join("|")]);

  useEffect(() => {
    if (venueSlugs.length === 0) return;
    let alive = true;
    Promise.all(venueSlugs.map((s) => fetchWeddingVenueBySlug(s).then((v) => [s, v] as const))).then(
      (entries) => alive && setVenues(Object.fromEntries(entries)),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueSlugs.join("|")]);

  useEffect(() => {
    if (listingSlugs.length === 0) return;
    let alive = true;
    Promise.all(
      listingSlugs.map((s) => fetchEmbedListingBySlug(s).then((l) => [s, l] as const)),
    ).then((entries) => alive && setListings(Object.fromEntries(entries)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingSlugs.join("|")]);

  return (
    <div className={className}>
      {segments.map((seg, i) => {
        if (seg.type === "html") {
          return <div key={i} dangerouslySetInnerHTML={{ __html: seg.html }} />;
        }
        if (seg.kind === "cruise") {
          const c = cruises[seg.slug];
          if (c === undefined) return <CruiseCardSkeleton key={i} slug={seg.slug} />;
          if (c === null) return null;
          return <CruiseCard key={i} cruise={c} variant={seg.variant} />;
        }
        if (seg.kind === "venue") {
          const v = venues[seg.slug];
          if (v === undefined) return <WeddingVenueCardSkeleton key={i} slug={seg.slug} />;
          if (v === null) return null;
          return <WeddingVenueCard key={i} venue={v} variant={seg.variant} />;
        }
        if (seg.kind === "listing") {
          const l = listings[seg.slug];
          if (l === undefined) return <ListingEmbedCardSkeleton key={i} slug={seg.slug} />;
          if (l === null) return null;
          return <ListingEmbedCard key={i} listing={l} variant={seg.variant} />;
        }
        return <Fragment key={i} />;
      })}
    </div>
  );
}
