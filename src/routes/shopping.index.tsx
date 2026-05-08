import { createFileRoute } from "@tanstack/react-router";
import { CategoryHubPage } from "@/components/site/CategoryHubPage";
import { hubForSlug } from "@/lib/listing-categories";
import { buildHubHead } from "@/lib/seo-head";

const HUB = hubForSlug("shopping")!;

export const Route = createFileRoute("/shopping/")({
  head: () => buildHubHead(HUB),
  component: () => <CategoryHubPage hub={HUB} />,
});
