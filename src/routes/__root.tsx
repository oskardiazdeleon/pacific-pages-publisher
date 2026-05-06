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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#fef6e4] via-[#fde2c4] to-[#f9a679] px-4">
      {/* Sun */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#ffd27a] to-[#ff8a5b] opacity-90 blur-[2px]"
      />
      {/* Horizon ocean band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-[#1d6fa5] via-[#0f4f7a] to-[#082b46]"
      />
      {/* Sun reflection on water */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-0 h-[42%] w-[420px] -translate-x-1/2 bg-gradient-to-b from-[#ffb46b]/70 to-transparent blur-md"
      />
      {/* Wave layers */}
      <svg
        aria-hidden
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-[42%] h-12 w-full text-[#1d6fa5]"
      >
        <path
          fill="currentColor"
          opacity="0.6"
          d="M0,64 C240,112 480,16 720,48 C960,80 1200,32 1440,64 L1440,120 L0,120 Z"
        />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-[36%] h-10 w-full text-white/70"
      >
        <path
          fill="currentColor"
          opacity="0.5"
          d="M0,80 C200,40 520,104 760,72 C1000,40 1240,96 1440,72 L1440,120 L0,120 Z"
        />
      </svg>
      {/* Palm silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 200 320"
        className="pointer-events-none absolute -left-4 bottom-[40%] hidden h-[55%] w-auto text-[#0a1f33] sm:block"
      >
        <path
          fill="currentColor"
          d="M100 320 C96 240 92 160 86 100 L96 96 C100 160 104 240 108 320 Z"
        />
        <path
          fill="currentColor"
          d="M92 96 C60 80 30 86 8 100 C36 90 64 92 90 104 Z M96 92 C108 56 132 36 168 28 C140 36 116 56 102 96 Z M88 100 C70 120 56 152 50 188 C66 156 80 132 96 108 Z M96 96 C124 108 148 132 168 168 C148 124 124 100 100 92 Z M94 96 C82 70 60 50 28 40 C58 56 78 76 92 100 Z"
        />
      </svg>

      <div className="relative z-10 max-w-xl text-center">
        <div className="font-display text-[140px] leading-none font-black tracking-tighter text-[#0a1f33] drop-shadow-[0_2px_0_rgba(255,255,255,0.4)] sm:text-[180px]">
          404
        </div>
        <div className="mt-2 text-4xl" aria-hidden>
          {pick.emoji}
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-[#0a1f33] sm:text-3xl">
          {pick.headline}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#0a1f33]/75 sm:text-base">
          {pick.sub}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[#0a1f33] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-[#0a1f33]/90"
          >
            Back to the boardwalk
          </Link>
          <Link
            to="/articles"
            className="inline-flex items-center justify-center rounded-full border border-[#0a1f33]/30 bg-white/40 px-6 py-3 text-sm font-semibold text-[#0a1f33] backdrop-blur transition hover:bg-white/70"
          >
            Browse articles
          </Link>
        </div>
        <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-[#0a1f33]/50">
          Lost in San Diego · Error 404
        </p>
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
