## What's wrong with the current page

Looking at the Kingfisher screenshot:

1. **Hero is a giant disconnected image** — no name, neighborhood, rating or CTA overlaid; the user has to scroll past it to learn what the place even is.
2. **Description is duplicated** — short_description renders, then almost the same text renders again as the long description. Looks broken.
3. **Contact row floats in dead space** — address / phone / "Visit website" sit alone with no map, no hours, no "Open now" status.
4. **No gallery** — we store a `gallery[]` column but never use it.
5. **No hours** — `hours` JSONB exists; never displayed. Users have to leave the page to know if it's open.
6. **No "what's around"** — dead end. No related restaurants, no neighborhood context, no editorial articles that mention this place.
7. **FAQ is generic filler** — same 3 questions for every listing, last one is a sales pitch. Crawlers will see this as boilerplate and discount it.
8. **No way to act** — no Reserve, Call, Directions, Save, or Share buttons in a sticky way.

## What top sites do (reference)

- **Resy** — sticky right-rail booking widget, big photo gallery grid, "Need to know" chips (dress code, parking), neighborhood map.
- **The Infatuation** — opinionated editorial blurb up top, "Perfect for" tag chips (Date Night, Big Groups), photo strip, "Suggested reading" related articles.
- **Eater** — magazine hero with credit, pull-quote review, embedded map with nearby Eater picks, "More in [Neighborhood]" rail.
- **OpenTable / Google Places** — at-a-glance bar (rating · price · cuisine · open status · neighborhood), tabbed sections (Overview / Photos / Menu / Reviews), embedded map.
- **Yelp** — primary action buttons stuck to the top (Directions, Call, Website, Save, Share), photo lightbox grid.

## Proposed redesign

```text
┌─────────────────────────────────────────────────────────┐
│ HERO (60vh, photo + dark gradient, info OVERLAID)       │
│   Restaurant · Golden Hill · $$ · ★ 4.6                 │
│   Kingfisher                                            │
│   "Vietnamese-leaning seafood in a jewel-box bar."      │
│   [Reserve] [Call] [Directions] [Website]  ♡  ⤴         │
└─────────────────────────────────────────────────────────┘
┌────────────────────────────┬────────────────────────────┐
│ STICKY SUB-NAV (scrolls)   │                            │
│ Overview · Photos · Hours  │  RIGHT RAIL (sticky)       │
│  · Location · Nearby       │  ┌──────────────────────┐  │
│                            │  │ ● Open until 11pm    │  │
│ ## The vibe                │  │  Today 5–11pm   ▾    │  │
│  editorial description     │  ├──────────────────────┤  │
│                            │  │ 📞 619.432.1014      │  │
│ ## Good to know            │  │ 🌐 kingfishersd.com  │  │
│  chips: Date night ·       │  │ 📍 2469 Broadway     │  │
│  Outdoor seating · etc     │  │      Get directions  │  │
│                            │  ├──────────────────────┤  │
│ ## Photos (3-col masonry)  │  │ Insider 30% off      │  │
│  + lightbox                │  │  [Become an Insider] │  │
│                            │  └──────────────────────┘  │
│ ## Where you'll be         │                            │
│  embedded map + address    │                            │
│                            │                            │
│ ## More in Golden Hill     │                            │
│  4-card carousel           │                            │
│                            │                            │
│ ## More restaurants        │                            │
│  4-card carousel           │                            │
└────────────────────────────┴────────────────────────────┘
```

### Mobile
- Hero stays full-bleed with overlaid info.
- Right rail collapses into a **sticky bottom action bar** (Call · Directions · Website · Save) — same pattern Yelp/Google Maps use.
- Hours becomes a collapsible "Open until 11pm ▾" pill at the top of content.

### Concrete UX wins
- **Open / closed status** computed live from `hours` JSON ("Open · closes 11pm" in green, "Closed · opens 5pm" in muted).
- **Photo gallery** with lightbox — uses `gallery[]`; falls back to hero only.
- **Embedded map** (static OpenStreetMap tile, no API key needed) with a "Get Directions" deep link to Google/Apple Maps.
- **Action chips** instead of cards for Call / Directions / Website / Save / Share — always visible, work on hover and on mobile.
- **"More in [neighborhood]" + "More [category]"** carousels — keeps users on site, big SEO internal-linking win.
- **Smarter FAQ** — drop the boilerplate Insider question; auto-generate from real fields (hours, price range, reservations, parking) so each FAQ is unique per listing.
- **Sponsor slot** — right-rail card is the natural place to sell premium placements ("Featured by [Brand]" or Insider perks).

## Technical changes

**New files**
- `src/components/site/listing/ListingHero.tsx` — full-bleed photo, gradient, overlaid title block + action chips.
- `src/components/site/listing/ListingActionBar.tsx` — desktop chip row + mobile sticky bottom bar.
- `src/components/site/listing/ListingHours.tsx` — parses `hours` JSONB, computes open/closed, renders the weekly schedule in a popover.
- `src/components/site/listing/ListingGallery.tsx` — masonry grid + lightbox (use existing `Dialog` from `@/components/ui/dialog`).
- `src/components/site/listing/ListingMap.tsx` — static OSM tile via `staticmap.openstreetmap.de` (no key) + "Get Directions" link.
- `src/components/site/listing/ListingSidebar.tsx` — sticky right-rail card.
- `src/components/site/listing/RelatedListings.tsx` — fetches same-neighborhood and same-category siblings.
- `src/lib/hours.ts` — hours parsing/formatting helpers + open-now computation.

**Changed**
- `src/components/site/ListingDetailPage.tsx` — rewritten to compose the new components in the two-column layout. Keeps the same `Listing` prop shape, the `expectedHub` redirect logic, and the JSON-LD blocks (just enriched with `openingHours`, `geo` if available, `image[]` from gallery).
- `src/lib/content-queries.ts` — add `fetchRelatedListings({ category, neighborhood, excludeId, limit })`.

**Data**
- No schema changes required. `gallery`, `hours`, `rating`, `price_range` already exist; we just start using them. Listings missing these fields gracefully degrade (gallery section hidden, hours pill hidden, etc.).
- Optional follow-up (not in this change): extend the Firecrawl import to also pull `hours` and additional photos so pages get richer over time.

**SEO**
- Replace boilerplate FAQ with field-derived FAQ (only render questions we can actually answer from real data).
- Enrich JSON-LD with `openingHoursSpecification`, `image: gallery`, and `priceRange`.
- Internal links to neighborhood hub + category hub + 4 related listings = stronger crawl graph.

## Out of scope (call out for later)
- Real reservations integration (Resy/OpenTable deep links can be added once we capture a `reservation_url` field).
- User reviews / ratings submission.
- Backfilling hours + extra gallery photos for the 50 imported restaurants — separate enrichment job.
