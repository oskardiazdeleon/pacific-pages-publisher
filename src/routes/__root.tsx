import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
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
  head: () => {
    const allowIndexing = import.meta.env.VITE_ALLOW_INDEXING === "true";
    const description =
      "Handpicked San Diego hotels, restaurants, things to do, and editorial guides from local experts. Insider members save up to 40%.";
    const ogDescription =
      "Handpicked listings, neighborhood guides, and editorial stories from local experts.";
    const title = "sandiego.com — The Definitive Guide to America's Finest City";
    const meta = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: "sandiego.com Editorial Team" },
      { property: "og:title", content: title },
      { property: "og:description", content: ogDescription },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "sandiego.com" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: "https://sandiego.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@sandiegodotcom" },
      { name: "twitter:creator", content: "@sandiegodotcom" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: ogDescription },
    ];
    if (!allowIndexing) {
      meta.push({ name: "robots", content: "noindex, nofollow" });
    }
    return {
      meta,
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://images.unsplash.com", crossOrigin: "" },
        { rel: "dns-prefetch", href: "https://images.unsplash.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "SanDiego.com",
            alternateName: "San Diego Insider",
            url: "https://sandiego.com",
            logo: "https://sandiego.com/assets/logo.png",
            description,
            foundingDate: "1996",
            sameAs: [
              "https://www.facebook.com/sandiego.com",
              "https://www.instagram.com/sandiego.com",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              email: "hello@sandiego.com",
              availableLanguage: "English",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SanDiego.com",
            url: "https://sandiego.com",
            description: "The definitive guide to San Diego.",
            publisher: { "@type": "Organization", name: "SanDiego.com" },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://sandiego.com/search?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        },
      ],
    };
  },
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
