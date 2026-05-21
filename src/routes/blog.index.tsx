import { createFileRoute, redirect } from "@tanstack/react-router";

// Blog has been merged into Articles — permanently redirect.
export const Route = createFileRoute("/blog/")({
  beforeLoad: () => {
    throw redirect({ to: "/articles", statusCode: 301 });
  },
  component: () => null,
});
