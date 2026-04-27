import { createFileRoute } from "@tanstack/react-router";
import { ThemedHubPage } from "@/components/site/ThemedHubPage";
import { themedHubForSlug } from "@/lib/themed-hubs";

const HUB = themedHubForSlug("wineries")!;

export const Route = createFileRoute("/wineries/")({
  head: () => ({
    meta: [
      { title: HUB.metaTitle },
      { name: "description", content: HUB.metaDescription },
      { property: "og:title", content: HUB.metaTitle },
      { property: "og:description", content: HUB.metaDescription },
      { property: "og:image", content: HUB.heroImage },
      { rel: "canonical", href: `https://sandiego.com/${HUB.slug}` },
    ],
  }),
  component: () => <ThemedHubPage hub={HUB} />,
});
