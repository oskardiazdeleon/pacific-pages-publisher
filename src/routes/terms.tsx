import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "./about";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | sandiego.com" },
      { name: "description", content: "The terms governing your use of SanDiego.com." },
      { property: "og:title", content: "Terms of Service" },
      { property: "og:description", content: "The terms governing your use of SanDiego.com." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sandiego.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://sandiego.com/terms" }],
  }),
  component: () => (
    <ComingSoonPage
      eyebrow="Legal"
      headline="Terms of Service"
      description="The terms governing your use of SanDiego.com."
    />
  ),
});
