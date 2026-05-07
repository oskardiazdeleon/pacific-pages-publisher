import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { splitBody, collectEmbedSlugs } from "@/lib/embed-directives";
import { fetchCruiseLineBySlug, type CruiseLine } from "@/lib/cruise-lines";
import { CruiseCard, CruiseCardSkeleton } from "@/components/site/CruiseCard";

export function BlogBody({ markdown }: { markdown: string }) {
  const segments = splitBody(markdown || "");
  const cruiseSlugs = collectEmbedSlugs(markdown || "", "cruise");
  const [cruises, setCruises] = useState<Record<string, CruiseLine | null>>({});

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
        return null;
      })}
    </>
  );
}
