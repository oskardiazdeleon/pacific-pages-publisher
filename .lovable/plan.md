## Goal

Make it trivial to launch new themed category pages (like **Wineries**, **Breweries**, **Beaches**, **Family**, etc.) that share the same modern look as the Cruises hub: a sponsorable HERO, a curated listings grid, related Articles, and related Blog posts — all driven by config + CMS, no per-page custom code.

## What you'll get

1. A reusable **`ThemedHubPage`** component with the cruise-style split HERO (image + floating stat cards + sponsor override + search + chips), an Articles strip, a Blog strip, and a listings grid.
2. A single **`THEMED_HUBS`** config file. Adding a new category page = adding one entry + one 3-line route file.
3. **Wineries** shipped as the first example at `/wineries`.
4. CMS hero override per hub (sponsor name/logo/link + custom heading/sub) using the existing `homepage_sections` pattern (`{slug}_hero` key), editable from `/admin/cms/homepage`.

## URL & content model

```text
/wineries                  → ThemedHubPage (HERO + Articles + Blog + Listings grid)
/wineries/$slug            → existing ListingDetailPage (reuses listings table)
```

- **Listings**: themed hubs filter the existing `listings` table by **tag match on `short_description`/`name`** OR a configured set of `dbCategories` (e.g. Wineries → `category = Restaurant` + name/desc contains "winery"/"wine"). No DB enum change needed — keeps it instantly extensible.
- **Articles** strip: pulls from `articles` where `category` matches the hub's `contentTag` OR any `tags` overlap. Top 3 shown.
- **Blog** strip: pulls from `blog_posts` where `category = hub.contentTag` OR `tags` overlap. Top 3 shown.
- **Hero CMS override**: same mechanism as cruises — `homepage_sections` row with `section_key = "{slug}_hero"`. Sponsor mode swaps the eyebrow chip for "Presented by {logo}" and lets the sponsor override headline/sub.

## Files to create

- `src/lib/themed-hubs.ts` — config registry (`THEMED_HUBS`), helpers `themedHubForSlug`, `listingsMatchHub`.
- `src/components/site/ThemedHubPage.tsx` — the reusable hub layout (HERO, Articles strip, Blog strip, Listings grid, JSON-LD).
- `src/components/site/HubArticlesStrip.tsx` — 3-card horizontal articles row.
- `src/components/site/HubBlogStrip.tsx` — 3-card lifestyle-style blog row.
- `src/routes/wineries.index.tsx` — 10-line route file using `ThemedHubPage`.
- `src/routes/wineries.$slug.tsx` — listing detail (mirrors `hotels.$slug.tsx`).

## Files to update

- `src/routes/admin.cms.homepage.tsx` — add a `wineries_hero` (and any future themed hub) editor section, mirroring the cruises hero block (sponsor toggle + name/logo/link + heading/sub overrides).
- `src/components/site/Header.tsx` — add "Wineries" to the main nav.
- `src/lib/listing-categories.ts` — leave untouched (themed hubs are a parallel system — they don't replace the 5 main category hubs).

## `THEMED_HUBS` schema

Each entry fully describes a page so adding one is config-only:

```ts
{
  slug: "wineries",
  label: "Wineries",
  eyebrow: "Wine country",
  heading: "San Diego Wineries",
  headingAccent: "from vine to glass.",
  subheading: "Tasting rooms in Ramona, urban wineries in Miramar...",
  heroImage: "https://images.unsplash.com/photo-...",
  searchPlaceholder: "Search wineries, varietals, regions…",
  popularChips: [
    { label: "Ramona Valley", to: "/wineries", search: "ramona" },
    { label: "Urban Wineries", to: "/wineries", search: "urban" },
  ],
  stats: [
    { value: "40+", label: "Wineries" },
    { value: "12", label: "AVA Regions" },
    { value: "$15", label: "Tastings From" },
  ],
  // listings filter
  listingFilter: {
    dbCategories: ["Restaurant", "Attraction"],
    keywords: ["winery", "wine", "vineyard", "tasting"],
  },
  // related content
  contentTag: "wineries",        // matched against articles.category / blog_posts.category
  tagAliases: ["wine", "vineyard"],
  // SEO
  metaTitle: "Best San Diego Wineries — Tasting Rooms & Vineyards",
  metaDescription: "...",
  // Insider CTA bar (optional, default on)
  insiderCta: { icon: "Wine", title: "Sip smarter with Insider", body: "Free tastings..." },
}
```

## Adding a future themed hub (the payoff)

1. Add one entry to `THEMED_HUBS` in `src/lib/themed-hubs.ts`.
2. Create `src/routes/{slug}.index.tsx` (10 lines, copy of wineries route).
3. Create `src/routes/{slug}.$slug.tsx` (10 lines, copy of wineries detail).
4. (Optional) Add a `{slug}_hero` block to the homepage CMS admin for sponsor override.

That's it — HERO, Articles, Blog, and Listings all wire up from config.

## ASCII layout of the new template

```text
┌──────────────────────────────────────────────────────────────┐
│ Header                                                        │
├──────────────────────────────────────────────────────────────┤
│ Breadcrumbs › Wineries                                       │
│                                                               │
│  ┌─ Eyebrow / Sponsor chip                ┌──────────────┐  │
│  │  H1 headline + accent line             │              │  │
│  │  Subheading paragraph                  │  Hero image  │  │
│  │  [🔍 Search ………………………… ] [Search]      │              │  │
│  │  Popular: [chip] [chip] [chip]         │  ┌──┬──┬──┐  │  │
│  │                                         │  │St│St│St│  │  │
│  └────────────────────────────────────────┘  └──┴──┴──┘  │  │
│                                                               │
│  ┌── Insider CTA bar ───────────────────── [Join Insider] ┐  │
├──────────────────────────────────────────────────────────────┤
│ Featured Stories  (Articles strip — 3 cards)                  │
├──────────────────────────────────────────────────────────────┤
│ From the Blog    (Blog strip — 3 lifestyle cards)             │
├──────────────────────────────────────────────────────────────┤
│ All Wineries     (Listings grid — ListingCard, 3 cols)        │
├──────────────────────────────────────────────────────────────┤
│ Footer                                                        │
└──────────────────────────────────────────────────────────────┘
```

## Notes / non-goals

- Not adding a new DB enum value for "Winery" — uses keyword + category filter on existing `listings` so you can publish winery listings today without a migration.
- If later you want strict typed categories (e.g. a real `Winery` enum), that's a small follow-up migration; the template won't need to change.
- Articles/Blog strips gracefully hide when there's no matching content.