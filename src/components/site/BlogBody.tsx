import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { splitBody, collectEmbedSlugs } from "@/lib/embed-directives";
import { fetchCruiseLineBySlug, type CruiseLine } from "@/lib/cruise-lines";
import { CruiseCard, CruiseCardSkeleton } from "@/components/site/CruiseCard";
import { fetchWeddingVenueBySlug, type WeddingVenue } from "@/lib/wedding-venues";
import { WeddingVenueCard, WeddingVenueCardSkeleton } from "@/components/site/WeddingVenueCard";
import { fetchEmbedListingBySlug, type EmbedListing } from "@/lib/listings-embed";
import { ListingEmbedCard, ListingEmbedCardSkeleton } from "@/components/site/ListingEmbedCard";

export function BlogBody({ markdown }: { markdown: string }) {
  const segments = splitBody(markdown || "");
  const cruiseSlugs = collectEmbedSlugs(markdown || "", "cruise");
  const venueSlugs = collectEmbedSlugs(markdown || "", "venue");
  const listingSlugs = collectEmbedSlugs(markdown || "", "listing");
  const [cruises, setCruises] = useState<Record<string, CruiseLine | null>>({});
  const [venues, setVenues] = useState<Record<string, WeddingVenue | null>>({});
  const [listings, setListings] = useState<Record<string, EmbedListing | null>>({});

  useEffect(() => {
    if (cruiseSlugs.length === 0) return;
    let mounted = true;
    Promise.all(cruiseSlugs.map((s) => fetchCruiseLineBySlug(s).then((c) => [s, c] as const))).then(
      (entries) => {
        if (!mounted) return;
        setCruises(Object.fromEntries(entries));
      },
    );
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cruiseSlugs.join("|")]);

  useEffect(() => {
    if (venueSlugs.length === 0) return;
    let mounted = true;
    Promise.all(venueSlugs.map((s) => fetchWeddingVenueBySlug(s).then((v) => [s, v] as const))).then(
      (entries) => {
        if (!mounted) return;
        setVenues(Object.fromEntries(entries));
      },
    );
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueSlugs.join("|")]);

  useEffect(() => {
    if (listingSlugs.length === 0) return;
    let mounted = true;
    Promise.all(listingSlugs.map((s) => fetchEmbedListingBySlug(s).then((l) => [s, l] as const))).then(
      (entries) => {
        if (!mounted) return;
        setListings(Object.fromEntries(entries));
      },
    );
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingSlugs.join("|")]);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "markdown") {
          return (
            <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
              {seg.value}
            </ReactMarkdown>
          );
        }
        if (seg.embed.kind === "cruise") {
          const c = cruises[seg.embed.slug];
          if (c === undefined) return <CruiseCardSkeleton key={i} slug={seg.embed.slug} />;
          if (c === null) return null;
          return <CruiseCard key={i} cruise={c} variant={seg.embed.variant} />;
        }
        if (seg.embed.kind === "venue") {
          const v = venues[seg.embed.slug];
          if (v === undefined) return <WeddingVenueCardSkeleton key={i} slug={seg.embed.slug} />;
          if (v === null) return null;
          return <WeddingVenueCard key={i} venue={v} variant={seg.embed.variant} />;
        }
        if (seg.embed.kind === "listing") {
          const l = listings[seg.embed.slug];
          if (l === undefined) return <ListingEmbedCardSkeleton key={i} slug={seg.embed.slug} />;
          if (l === null) return null;
          return <ListingEmbedCard key={i} listing={l} variant={seg.embed.variant} />;
        }
        return null;
      })}
    </>
  );
}
