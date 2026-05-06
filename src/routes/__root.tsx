import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";

import appCss from "../styles.css?url";

const SD_404_MESSAGES: { headline: string; sub: string; emoji: string }[] = [
  {
    emoji: "🌊",
    headline: "Looks like you missed the wave.",
    sub: "This page wiped out somewhere off Black's Beach. Paddle back and we'll find you a cleaner set.",
  },
  {
    emoji: "🌮",
    headline: "This page is on a taco run.",
    sub: "It ducked into a shop in Barrio Logan and never came back. Try the homepage — the salsa's better there anyway.",
  },
  {
    emoji: "🌅",
    headline: "Couldn't find your vibe.",
    sub: "The page you're looking for is somewhere between Sunset Cliffs and the next golden hour. Let's get you back on the boardwalk.",
  },
  {
    emoji: "🦭",
    headline: "Even the La Jolla seals are confused.",
    sub: "This URL slipped past the Cove. Head home and we'll point you toward something worth barking about.",
  },
  {
    emoji: "🌴",
    headline: "Took a wrong turn off the 5.",
    sub: "You ended up on a frontage road in the digital desert. Hop back on and we'll get you to the good stuff.",
  },
  {
    emoji: "🚤",
    headline: "Lost in the marine layer.",
    sub: "The page is fogged in until about 11am. While you wait, the rest of San Diego is already at the beach.",
  },
  {
    emoji: "🏄",
    headline: "Wipeout.",
    sub: "Whatever you were chasing closed out on you. Pop back up and we'll line up the next one from the homepage.",
  },
  {
    emoji: "🌮",
    headline: "404: No tacos at this address.",
    sub: "But there are plenty a few clicks away. Let's get you somewhere worth the drive.",
  },
];

function NotFoundComponent() {
  const pick = SD_404_MESSAGES[Math.floor(Math.random() * SD_404_MESSAGES.length)];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{pick.headline}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{pick.sub}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "San Diego" },
      { name: "description", content: "San Diego Canvas replicates sandiego.com, featuring articles, blogs, and business listings with a modern design and SEO focus." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "San Diego" },
      { property: "og:description", content: "San Diego Canvas replicates sandiego.com, featuring articles, blogs, and business listings with a modern design and SEO focus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "San Diego" },
      { name: "twitter:description", content: "San Diego Canvas replicates sandiego.com, featuring articles, blogs, and business listings with a modern design and SEO focus." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3184c3da-c9bc-4c7f-8344-d442238f26cf/id-preview-07d4b560--2d11b159-53c2-40cc-b2e7-ced05f2c70cd.lovable.app-1777051318796.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3184c3da-c9bc-4c7f-8344-d442238f26cf/id-preview-07d4b560--2d11b159-53c2-40cc-b2e7-ced05f2c70cd.lovable.app-1777051318796.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
