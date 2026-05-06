# San Diego–Themed 404 Page

Replace the generic "Page not found" screen (currently in `src/routes/__root.tsx` → `NotFoundComponent`) with a sun-soaked, ocean-horizon illustration and a rotating set of playful, locally-flavored messages.

## Message options (a different one shows on each visit)

1. 🌊 **Looks like you missed the wave.** — "This page wiped out somewhere off Black's Beach. Paddle back and we'll find you a cleaner set."
2. 🌮 **This page is on a taco run.** — "It ducked into a shop in Barrio Logan and never came back. Try the homepage — the salsa's better there anyway."
3. 🌅 **Couldn't find your vibe.** — "The page you're looking for is somewhere between Sunset Cliffs and the next golden hour. Let's get you back on the boardwalk."
4. 🦭 **Even the La Jolla seals are confused.** — "This URL slipped past the Cove. Head home and we'll point you toward something worth barking about."
5. 🌴 **Took a wrong turn off the 5.** — "You ended up on a frontage road in the digital desert. Hop back on and we'll get you to the good stuff."
6. 🚤 **Lost in the marine layer.** — "The page is fogged in until about 11am. While you wait, the rest of San Diego is already at the beach."
7. 🏄 **Wipeout.** — "Whatever you were chasing closed out on you. Pop back up and we'll line up the next one from the homepage."
8. 🌮 **404: No tacos at this address.** — "But there are plenty a few clicks away. Let's get you somewhere worth the drive."

On each page load one is picked at random so the 404 always feels fresh.

## Visual design

A single full-screen scene that reads as San Diego at golden hour:

```text
   sky: warm cream → peach → coral gradient
   ┌──────────────────────────────────────────┐
   │   palm                                   │
   │  silhouette       ☀  big soft sun        │
   │   ╱                                      │
   │  ╱        404  (huge navy display)      │
   │           🌊                             │
   │     Looks like you missed the wave.     │
   │     Sub-message in muted navy.          │
   │  [Back to the boardwalk] [Browse articles]│
   │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  │ ← white-foam wave
   │ ░░░░░░░░░░ deep ocean band ░░░░░░░░░░░  │
   └──────────────────────────────────────────┘
   tiny caps label: "Lost in San Diego · Error 404"
```

Layers, all rendered with CSS gradients + inline SVG (no new image assets):
- Sky gradient (cream → peach → coral)
- Soft glowing sun disc behind the headline
- Two-tone ocean band with a sun-reflection shimmer
- Two stacked SVG wave paths (deep blue + white foam) at the horizon
- Palm tree SVG silhouette on the left edge
- Big navy "404" in the display font, with the playful headline + sub copy centered
- Two CTAs: primary "Back to the boardwalk" → `/`, secondary "Browse articles" → `/articles`

## Technical details

- File: `src/routes/__root.tsx`, replacing the current `NotFoundComponent`.
- Add a `SD_404_MESSAGES` array and pick one with `Math.random()` on render.
- Use inline Tailwind utility classes with explicit San Diego palette values (sunset cream/peach/coral + navy ocean) so the scene reads correctly regardless of the active theme tokens.
- Pure SVG + gradients, no new dependencies, no new assets, no migrations.
- Continues to be wired in via `notFoundComponent: NotFoundComponent` on the root route, so it covers every unmatched URL site-wide.

After approval, I'll implement it in one edit to `src/routes/__root.tsx`.
