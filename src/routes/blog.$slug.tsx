import { createFileRoute, redirect } from "@tanstack/react-router";

// Blog has been merged into Articles — permanently redirect post URLs.
export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/articles/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
  component: () => null,
});
