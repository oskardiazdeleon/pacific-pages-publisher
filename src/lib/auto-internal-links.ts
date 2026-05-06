import { supabase } from "@/integrations/supabase/client";

export type LinkTarget = {
  title: string;
  url: string;
  aliases?: string[];
};

export async function fetchLinkTargets(excludeSlug?: string): Promise<LinkTarget[]> {
  const targets: LinkTarget[] = [];

  const [articles, listings, cruises, blog, neighborhoods] = await Promise.all([
    supabase.from("articles").select("title, slug").eq("status", "published").limit(500),
    supabase.from("listings").select("name, slug").limit(500),
    supabase.from("cruise_lines").select("name, slug").limit(200),
    supabase.from("blog_posts").select("title, slug").eq("status", "published").limit(500),
    supabase.from("neighborhoods").select("name, slug").limit(200),
  ]);

  for (const a of articles.data ?? []) {
    if (a.slug === excludeSlug) continue;
    if (a.title && a.slug) targets.push({ title: a.title, url: `/articles/${a.slug}` });
  }
  for (const l of listings.data ?? []) {
    if (l.name && l.slug) targets.push({ title: l.name, url: `/listings/${l.slug}` });
  }
  for (const c of cruises.data ?? []) {
    if (c.name && c.slug) targets.push({ title: c.name, url: `/cruises/${c.slug}` });
  }
  for (const b of blog.data ?? []) {
    if (b.slug === excludeSlug) continue;
    if (b.title && b.slug) targets.push({ title: b.title, url: `/blog/${b.slug}` });
  }
  for (const n of neighborhoods.data ?? []) {
    if (n.name && n.slug) targets.push({ title: n.name, url: `/neighborhoods/${n.slug}` });
  }

  // Sort by length descending so longer phrases match first ("Balboa Park Museum" before "Balboa Park")
  return targets
    .filter((t) => t.title.trim().length >= 4)
    .sort((a, b) => b.title.length - a.title.length);
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Inserts internal links into HTML. Skips text inside existing <a>, <h1-h6>, <code>, <pre>, and html attributes.
 * Only links the first occurrence of each target. Caps total links to maxLinks (default 8).
 */
export function autoLinkHtml(
  html: string,
  targets: LinkTarget[],
  opts: { maxLinks?: number } = {},
): { html: string; added: { title: string; url: string }[] } {
  const maxLinks = opts.maxLinks ?? 8;
  const added: { title: string; url: string }[] = [];
  const usedUrls = new Set<string>();

  // Extract existing hrefs to avoid duplicate linking to same URL.
  const existingHrefs = new Set<string>();
  html.replace(/href="([^"]+)"/gi, (_m, h) => {
    existingHrefs.add(h);
    return "";
  });

  // Split HTML into segments: tags vs text. Operate only on text segments,
  // and skip text inside protected tags.
  const protectedTags = ["a", "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre"];
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;

  type Seg = { type: "tag" | "text"; value: string; protectedDepth: number };
  const segs: Seg[] = [];
  let lastIdx = 0;
  const protectedStack: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    if (m.index > lastIdx) {
      segs.push({
        type: "text",
        value: html.slice(lastIdx, m.index),
        protectedDepth: protectedStack.length,
      });
    }
    const tag = m[0];
    const name = m[1].toLowerCase();
    const isClose = tag.startsWith("</");
    const isSelfClose = tag.endsWith("/>");
    if (protectedTags.includes(name)) {
      if (isClose) {
        const idx = protectedStack.lastIndexOf(name);
        if (idx >= 0) protectedStack.splice(idx, 1);
      } else if (!isSelfClose) {
        protectedStack.push(name);
      }
    }
    segs.push({ type: "tag", value: tag, protectedDepth: protectedStack.length });
    lastIdx = m.index + tag.length;
  }
  if (lastIdx < html.length) {
    segs.push({ type: "text", value: html.slice(lastIdx), protectedDepth: protectedStack.length });
  }

  for (const target of targets) {
    if (added.length >= maxLinks) break;
    if (usedUrls.has(target.url)) continue;
    if (existingHrefs.has(target.url)) {
      usedUrls.add(target.url);
      continue;
    }
    const phrases = [target.title, ...(target.aliases ?? [])];
    let linked = false;
    for (const phrase of phrases) {
      if (linked) break;
      const re = new RegExp(`(?<![\\w-])(${escapeRegExp(phrase)})(?![\\w-])`, "i");
      for (let i = 0; i < segs.length && !linked; i++) {
        const s = segs[i];
        if (s.type !== "text" || s.protectedDepth > 0) continue;
        if (!re.test(s.value)) continue;
        const replaced = s.value.replace(
          re,
          `<a href="${target.url}" class="text-accent underline underline-offset-2 hover:opacity-80">$1</a>`,
        );
        s.value = replaced;
        added.push({ title: target.title, url: target.url });
        usedUrls.add(target.url);
        linked = true;
      }
    }
  }

  return { html: segs.map((s) => s.value).join(""), added };
}
