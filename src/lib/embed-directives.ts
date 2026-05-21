// Shared helpers for inline content-card "directives" inside markdown bodies.
//
// On disk we store cards as a markdown directive that is easy to read and edit:
//
//     :::cruise-card{slug="princess-cruises" variant="full"}
//     :::
//     :::venue-card{slug="hotel-del-coronado-weddings" variant="compact"}
//     :::
//
// In the rich-text editor (TipTap / HTML world) the same block is represented
// by an HTML element:
//
//     <div data-embed-card data-kind="cruise" data-slug="..." data-variant="..."></div>
//     <div data-embed-card data-kind="venue"  data-slug="..." data-variant="..."></div>

export type EmbedCardKind = "cruise" | "venue" | "listing";

export interface EmbedCardDirective {
  kind: EmbedCardKind;
  slug: string;
  variant: "full" | "compact";
}

const DIRECTIVE_RE =
  /:::(cruise-card|venue-card|listing-card)\{([^}]*)\}\s*(?:\r?\n)?:::/g;

const KIND_FROM_DIRECTIVE: Record<string, EmbedCardKind> = {
  "cruise-card": "cruise",
  "venue-card": "venue",
  "listing-card": "listing",
};

const DIRECTIVE_FROM_KIND: Record<EmbedCardKind, string> = {
  cruise: "cruise-card",
  venue: "venue-card",
  listing: "listing-card",
};

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /(\w+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) out[m[1]] = m[2];
  return out;
}

export function directivesToHtml(markdown: string): string {
  return markdown.replace(DIRECTIVE_RE, (_full, name: string, attrs: string) => {
    const kind = KIND_FROM_DIRECTIVE[name];
    if (!kind) return "";
    const a = parseAttrs(attrs);
    const slug = a.slug ?? "";
    const variant = a.variant === "compact" ? "compact" : "full";
    if (!slug) return "";
    return `<div data-embed-card data-kind="${kind}" data-slug="${slug}" data-variant="${variant}"></div>`;
  });
}

export function buildDirective(d: EmbedCardDirective): string {
  const name = DIRECTIVE_FROM_KIND[d.kind];
  return `:::${name}{slug="${d.slug}" variant="${d.variant}"}\n:::`;
}

export type BodySegment =
  | { type: "markdown"; value: string }
  | { type: "embed"; embed: EmbedCardDirective };

export function splitBody(markdown: string): BodySegment[] {
  const out: BodySegment[] = [];
  let lastIdx = 0;
  const re = new RegExp(DIRECTIVE_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    if (m.index > lastIdx) {
      out.push({ type: "markdown", value: markdown.slice(lastIdx, m.index) });
    }
    const kind = KIND_FROM_DIRECTIVE[m[1]];
    const a = parseAttrs(m[2]);
    if (kind && a.slug) {
      out.push({
        type: "embed",
        embed: {
          kind,
          slug: a.slug,
          variant: a.variant === "compact" ? "compact" : "full",
        },
      });
    }
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < markdown.length) {
    out.push({ type: "markdown", value: markdown.slice(lastIdx) });
  }
  return out;
}

export function collectEmbedSlugs(markdown: string, kind: EmbedCardKind): string[] {
  const slugs = new Set<string>();
  for (const seg of splitBody(markdown)) {
    if (seg.type === "embed" && seg.embed.kind === kind) slugs.add(seg.embed.slug);
  }
  return [...slugs];
}
