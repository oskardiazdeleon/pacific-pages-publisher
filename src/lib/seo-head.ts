// SEO head helpers — keep meta + links consistent across routes.
// Every page route should use buildPageHead() (or buildHubHead() for category hubs)
// to set its own title, description, canonical, and OG image. Defaults defined in
// __root.tsx fill in any tags a route doesn't override.
import type { CategoryHub } from "./listing-categories";

export const SITE_URL = "https://sandiego.com";

type MetaTag = Record<string, string>;

function twitterAndOg(opts: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: "website" | "article" | "profile";
}): MetaTag[] {
  const desc = opts.description.slice(0, 160);
  const meta: MetaTag[] = [
    { property: "og:title", content: opts.title },
    { property: "og:description", content: desc },
    { property: "og:type", content: opts.type },
    { property: "og:url", content: opts.url },
    { property: "og:site_name", content: "sandiego.com" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@sandiegodotcom" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: desc },
  ];
  if (opts.image) {
    meta.push({ property: "og:image", content: opts.image });
    meta.push({ name: "twitter:image", content: opts.image });
  }
  return meta;
}

export function buildHubHead(hub: CategoryHub) {
  const url = `${SITE_URL}/${hub.slug}`;
  const meta: MetaTag[] = [
    { title: hub.metaTitle },
    { name: "description", content: hub.metaDescription },
    { name: "author", content: "sandiego.com Editorial Team" },
    ...twitterAndOg({
      title: hub.metaTitle,
      description: hub.metaDescription,
      image: hub.heroImage,
      url,
      type: "website",
    }),
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
  const meta: MetaTag[] = [
    { title: opts.title },
    { name: "description", content: opts.description.slice(0, 160) },
    { name: "author", content: "sandiego.com Editorial Team" },
    ...twitterAndOg({
      title: opts.title,
      description: opts.description,
      image: opts.image,
      url,
      type,
    }),
  ];
  return { meta, links: [{ rel: "canonical", href: url }] };
}
