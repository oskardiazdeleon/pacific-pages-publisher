import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "./about";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | sandiego.com" },
      { name: "description", content: "How SanDiego.com handles your information." },
      { property: "og:title", content: "Privacy Policy" },
      { property: "og:description", content: "How SanDiego.com handles your information." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sandiego.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://sandiego.com/privacy" }],
  }),
  component: () => (
    <ComingSoonPage
      eyebrow="Legal"
      headline="Privacy Policy"
      description="How SanDiego.com handles your information."
    />
  ),
});
