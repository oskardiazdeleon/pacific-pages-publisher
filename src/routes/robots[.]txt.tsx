import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = process.env.SITE_URL || "https://sandiego.com";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const host = request.headers.get("host") || "";
        const isProd = host === "sandiego.com" || host === "www.sandiego.com" ||
          SITE_URL.includes("sandiego.com");
        const isStaging = !isProd;

        const body = isStaging
          ? `User-agent: *\nDisallow: /\n`
          : `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://sandiego.com/sitemap.xml
`;

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
