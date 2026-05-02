import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy route — Golf is now its own category at /golf-courses.
// Kept as a 301 redirect to preserve SEO equity from any inbound links
// or stale Google index entries pointing at /things-to-do/golf.
export const Route = createFileRoute("/things-to-do/golf")({
  beforeLoad: () => {
    throw redirect({ to: "/golf-courses", statusCode: 301 });
  },
  component: () => null,
});
