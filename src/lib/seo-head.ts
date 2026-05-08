// SEO head helpers — keep meta + links consistent across routes.
import type { CategoryHub } from "./listing-categories";

export const SITE_URL = "https://sandiego.com";

export function buildHubHead(hub: CategoryHub) {
  const url = `${SITE_URL}/${hub.slug}`;
  const meta = [
    { title: hub.metaTitle },
    { name: "description", content: hub.metaDescription },
    { property: "og:title", content: hub.metaTitle },
    { property: "og:description", content: hub.metaDescription },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    ...(hub.heroImage
      ? [
          { property: "og:image", content: hub.heroImage },
          { name: "twitter:image", content: hub.heroImage },
        ]
      : []),
  ];
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
  };
}

export function buildPageHead(opts: {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "profile";
}) {
  const url = `${SITE_URL}${opts.path}`;
  const type = opts.type ?? "website";
  const meta: Array<Record<string, string>> = [
    { title: opts.title },
    { name: "description", content: opts.description.slice(0, 160) },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description.slice(0, 160) },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
  ];
  if (opts.image) {
    meta.push({ property: "og:image", content: opts.image });
    meta.push({ name: "twitter:image", content: opts.image });
  }
  return { meta, links: [{ rel: "canonical", href: url }] };
}
