import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "./about";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SanDiego.com | sandiego.com" },
      { name: "description", content: "Get in touch with the SanDiego.com editorial and partnerships team." },
      { property: "og:title", content: "Contact SanDiego.com" },
      { property: "og:description", content: "Get in touch with the SanDiego.com team." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sandiego.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://sandiego.com/contact" }],
  }),
  component: () => (
    <ComingSoonPage
      eyebrow="Contact"
      headline="Contact us"
      description="Get in touch with the SanDiego.com editorial and partnerships team."
    />
  ),
});
