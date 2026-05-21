import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Ship, Heart, MapPin, Trash2, ArrowLeftRight } from "lucide-react";
import { CruiseCard, CruiseCardSkeleton } from "@/components/site/CruiseCard";
import { WeddingVenueCard, WeddingVenueCardSkeleton } from "@/components/site/WeddingVenueCard";
import { ListingEmbedCard, ListingEmbedCardSkeleton } from "@/components/site/ListingEmbedCard";
import { fetchCruiseLineBySlug, type CruiseLine } from "@/lib/cruise-lines";
import { fetchWeddingVenueBySlug, type WeddingVenue } from "@/lib/wedding-venues";
import { fetchEmbedListingBySlug, type EmbedListing } from "@/lib/listings-embed";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embedCard: {
      insertEmbedCard: (attrs: {
        kind: "cruise" | "venue" | "listing";
        slug: string;
        variant?: "full" | "compact";
      }) => ReturnType;
    };
  }
}

export const EmbedCardNode = Node.create({
  name: "embedCard",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      kind: { default: "cruise" },
      slug: { default: "" },
      variant: { default: "full" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-embed-card]",
        getAttrs: (el) => {
          const e = el as HTMLElement;
          return {
            kind: e.getAttribute("data-kind") || "cruise",
            slug: e.getAttribute("data-slug") || "",
            variant: e.getAttribute("data-variant") || "full",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-embed-card": "",
        "data-kind": HTMLAttributes.kind,
        "data-slug": HTMLAttributes.slug,
        "data-variant": HTMLAttributes.variant,
      }),
    ];
  },

  addCommands() {
    return {
      insertEmbedCard:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { variant: "full", ...attrs } }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedCardView);
  },
});

function EmbedCardView(props: any) {
  const attrs = props.node.attrs as { kind: "cruise" | "venue" | "listing"; slug: string; variant: "full" | "compact" };
  const { kind, slug, variant } = attrs;
  const [cruise, setCruise] = useState<CruiseLine | null>(null);
  const [venue, setVenue] = useState<WeddingVenue | null>(null);
  const [listing, setListing] = useState<EmbedListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    if (kind === "cruise") {
      fetchCruiseLineBySlug(slug)
        .then((c) => mounted && setCruise(c))
        .finally(() => mounted && setLoading(false));
    } else if (kind === "venue") {
      fetchWeddingVenueBySlug(slug)
        .then((v) => mounted && setVenue(v))
        .finally(() => mounted && setLoading(false));
    } else if (kind === "listing") {
      fetchEmbedListingBySlug(slug)
        .then((l) => mounted && setListing(l))
        .finally(() => mounted && setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [kind, slug]);

  const Icon = kind === "venue" ? Heart : kind === "listing" ? MapPin : Ship;
  const label = kind === "venue" ? "Wedding venue" : kind === "listing" ? "Listing card" : "Cruise card";

  return (
    <NodeViewWrapper
      data-embed-card
      data-kind={kind}
      data-slug={slug}
      data-variant={variant}
      className={`relative my-4 rounded-3xl ${props.selected ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
    >
      <div
        contentEditable={false}
        className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-border bg-background/95 px-1.5 py-1 text-[10px] font-semibold shadow-sm backdrop-blur"
      >
        <span className="inline-flex items-center gap-1 px-1.5 text-muted-foreground">
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <button
          type="button"
          title="Toggle compact / full"
          onClick={() => props.updateAttributes({ variant: variant === "full" ? "compact" : "full" })}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-secondary"
        >
          <ArrowLeftRight className="h-3 w-3" />
        </button>
        <button
          type="button"
          title="Remove card"
          onClick={() => props.deleteNode()}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {kind === "cruise" ? (
        loading || !cruise ? (
          <CruiseCardSkeleton slug={slug || "(no slug)"} />
        ) : (
          <CruiseCard cruise={cruise} variant={variant} />
        )
      ) : kind === "venue" ? (
        loading || !venue ? (
          <WeddingVenueCardSkeleton slug={slug || "(no slug)"} />
        ) : (
          <WeddingVenueCard venue={venue} variant={variant} />
        )
      ) : kind === "listing" ? (
        loading || !listing ? (
          <ListingEmbedCardSkeleton slug={slug || "(no slug)"} />
        ) : (
          <ListingEmbedCard listing={listing} variant={variant} />
        )
      ) : null}
    </NodeViewWrapper>
  );
}
