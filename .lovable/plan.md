# Wedding Venue Cards in Articles

Mirror the existing cruise-card embed system so editors can drop a wedding venue into any article/blog body, with the same full + compact variants and the same insert flow.

## What the cards will look like

Same visual language as cruise cards (so the article body stays consistent), but tuned to wedding-venue info instead of cruise info.

**Full variant** (default — used inline as a feature block):

```text
┌─────────────────────────────────────────────────┐
│ ╔═══ hero photo of venue (16:9) ════════════╗   │
│ ║  [💍 Wedding venue]  ← pill, top-left      ║  │
│ ╚═══════════════════════════════════════════╝   │
│                                                 │
│  Venue Name                          (h3)       │
│  Tagline / short description                    │
│                                                 │
│  📍 Neighborhood   👥 Capacity   💲 From        │
│  La Jolla          250 guests    $$$            │
│                                                 │
│  [ Inquire ▸ ]   [ View venue ]                 │
└─────────────────────────────────────────────────┘
```

**Compact variant** (for sidebars / inline mentions, same shape as cruise compact):

```text
┌──────┬──────────────────────────────────────┬──┐
│ img  │ 💍 WEDDING VENUE                     │ →│
│ 4:3  │ Venue Name                           │  │
│      │ Neighborhood · Capacity              │  │
└──────┴──────────────────────────────────────┴──┘
```

Three info chips on full variant, sourced from the listing record:
- **Location** — neighborhood / area
- **Capacity** — guest count (falls back to "Indoor + outdoor" or similar tag if unknown)
- **Price tier** — `$ / $$ / $$$ / $$$$` from listing data

CTAs:
- Primary: **Inquire** → links to the venue's booking/contact URL if present, else to the detail page
- Secondary: **View venue** → `/weddings/{slug}`

## Editor UX

In the rich-text toolbar, the existing "Insert cruise card" button becomes a small dropdown:

```text
[ + Embed ▾ ]
   ├─ 🚢 Cruise card
   └─ 💍 Wedding venue
```

Clicking "Wedding venue" opens a search dialog identical to `InsertCruiseCardDialog` but listing wedding venues (DB category `WeddingVenue`), with the same Full / Compact toggle.

In the editor the embedded card renders the real `<WeddingVenueCard>`, with the same hover toolbar (toggle variant / delete) the cruise card already has.

## Storage format

Same directive pattern as cruise cards, new kind `venue-card`:

```text
:::venue-card{slug="hotel-del-coronado-weddings" variant="full"}
:::
```

Round-trips through the same marked → HTML → turndown pipeline using a `data-embed-card data-kind="venue"` element.

## Technical changes

- `src/lib/embed-directives.ts` — extend `EmbedCardKind` to `"cruise" | "venue"`, add `venue-card` to the directive maps and regex.
- `src/lib/wedding-venues.ts` (new) — `fetchWeddingVenues()` and `fetchWeddingVenueBySlug()` querying `listings` where `category = 'WeddingVenue'`. Shape mirrors `CruiseLine` (name, slug, heroImage, tagline, neighborhood, capacity, priceTier, bookingUrl).
- `src/components/site/WeddingVenueCard.tsx` (new) — full + compact variants + skeleton, styled to match `CruiseCard.tsx`.
- `src/components/admin/editor/EmbedCardNode.tsx` — branch on `kind`: render `CruiseCard` or `WeddingVenueCard`, fetch the right loader.
- `src/components/admin/editor/InsertWeddingVenueDialog.tsx` (new) — clone of `InsertCruiseCardDialog` for venues.
- `src/components/admin/RichTextEditor.tsx` — replace single insert button with a small dropdown (Cruise / Wedding venue), wire each to its dialog and `insertEmbedCard({ kind, slug, variant })`.
- `src/components/admin/BlogPostForm.tsx` — extend the `blankReplacement` Turndown override to also emit `:::venue-card{…}` when `data-kind="venue"`.
- `src/components/site/BlogBody.tsx` — render `<WeddingVenueCard>` for `embed.kind === "venue"`, prefetch slugs.

No DB migrations needed — venues already live in `listings` with `category = 'WeddingVenue'`.

## Out of scope (let me know if you want any of these)

- New embed kinds beyond cruises + venues (restaurants, hotels, golf courses) — easy to add later using the same pattern.
- Editing venue fields from inside the article editor — the card just reflects the venue record.

Once you approve, I'll build it and you can preview a wedding venue embedded in this same article.
