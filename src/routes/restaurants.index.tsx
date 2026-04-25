import { createFileRoute } from "@tanstack/react-router";
import { CategoryHubPage } from "@/components/site/CategoryHubPage";
import { hubForSlug } from "@/lib/listing-categories";

const HUB = hubForSlug("restaurants")!;

export const Route = createFileRoute("/restaurants/")({
  head: () => ({
    meta: [
      { title: HUB.metaTitle },
      { name: "description", content: HUB.metaDescription },
      { property: "og:title", content: HUB.metaTitle },
      { property: "og:description", content: HUB.metaDescription },
      { rel: "canonical", href: `https://sandiego.com/${HUB.slug}` },
    ],
  }),
  component: () => <CategoryHubPage hub={HUB} />,
});
