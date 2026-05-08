import { createFileRoute } from "@tanstack/react-router";
import { CategoryHubPage } from "@/components/site/CategoryHubPage";
import { hubForSlug } from "@/lib/listing-categories";
import { buildHubHead } from "@/lib/seo-head";

const HUB = hubForSlug("nightlife")!;

export const Route = createFileRoute("/nightlife/")({
  head: () => buildHubHead(HUB),
  component: () => <CategoryHubPage hub={HUB} />,
});
