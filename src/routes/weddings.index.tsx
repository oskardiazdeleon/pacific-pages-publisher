import { createFileRoute } from "@tanstack/react-router";
import { CategoryHubPage } from "@/components/site/CategoryHubPage";
import { hubForSlug } from "@/lib/listing-categories";
import { buildHubHead } from "@/lib/seo-head";
import { loadHubData } from "@/lib/hub-loader";

const HUB = hubForSlug("weddings")!;

export const Route = createFileRoute("/weddings/")({
  head: () => buildHubHead(HUB),
  loader: () => loadHubData(HUB),
  component: () => {
    const data = Route.useLoaderData();
    return <CategoryHubPage hub={HUB} initialItems={data.initialItems} initialCmsHero={data.initialCmsHero} />;
  },
});
