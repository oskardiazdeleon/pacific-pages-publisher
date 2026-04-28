## Goal

Fix the awkward layout of the editorial section on the homepage and replace the generic "The Magazine / Stories from the coast" wording with something with genuine San Diego personality.

## Problem

In `src/routes/index.tsx` (lines 170–189), the editorial section uses a 5-column grid:
- Left (`col-span-3`): one `ArticleCard large` — which itself is a side-by-side image+text card
- Right (`col-span-2`): two stacked standard `ArticleCard`s

Because the lead card is short (image and text sit side-by-side), and the right column stacks two full cards vertically, the left column ends with a large empty void below it (visible in the screenshot).

## Fix — Layout

Rebalance the editorial grid so the lead article visually anchors the section without leaving dead space:

**Option chosen:** Switch to a 12-column layout where:
- Lead article (left, `lg:col-span-7`) renders as a single tall card — image on top (aspect ~16/10), headline + excerpt below. Drop the side-by-side `large` variant here.
- Right column (`lg:col-span-5`) keeps two stacked standard cards but tightens spacing so heights match.

This gives a magazine-style "1 hero + 2 secondary" composition with no empty gap. Update `ArticleCard` only if needed — likely we can keep `large` and just change how it's used (image-on-top instead of side-by-side) by passing a new prop like `orientation="vertical"`, or simpler: render the lead with custom JSX inline in `index.tsx` and remove the `large` prop usage here.

Preferred approach: render the lead card inline with a vertical layout (image top, text bottom) directly in `index.tsx` to keep `ArticleCard` simple. The lead image gets `aspect-[16/10]` so the card height roughly matches two stacked standard cards on the right.

## Fix — Naming

Replace "The Magazine" eyebrow and "Stories from the coast" heading with options that feel San Diego: sun, surf, tacos, neighborhoods, locals.

I'll pick one default and mention alternates in the response. Recommended default:

- **Eyebrow:** `LOCAL DISPATCH`
- **Heading:** `Postcards from San Diego`

Alternates I'll mention so you can pick:
- `THE LOCAL` / `Notes from the 619`
- `FROM THE LOCALS` / `Sun, surf & stories`
- `INSIDER INTEL` / `What locals are talking about`
- `LATEST DROP` / `Tacos, tides & trails`

The defaults are stored in `c("editorial", "eyebrow", ...)` and `c("editorial", "heading", ...)` calls — these are just fallback strings used when no CMS override exists, so changing them is safe and won't affect any saved CMS content.

## Files to change

- `src/routes/index.tsx` — rebuild the editorial section JSX (lines ~170–189) with the new 7/5 grid, vertical lead card, and new eyebrow/heading defaults.

No other files need to change. `ArticleCard` stays as-is.

## Out of scope

- The neighborhoods, partner CTA, and other sections below are unchanged.
- No CMS schema or DB changes — only fallback copy.
