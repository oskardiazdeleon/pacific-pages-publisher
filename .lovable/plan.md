
## Goal

Make home-page neighborhood cards funnel into SEO Layer 2 pages (`/{category}/in/{neighborhood}`) instead of generic editorial hubs, and replace the free-text link field in admin with a smart dropdown built from `SEO_NEIGHBORHOODS`.

## Background — two page systems

- **`/neighborhoods/{slug}`** — generic editorial hub (intro, FAQs, mixed-category listings). Source: `src/lib/neighborhoods-data.ts`.
- **`/{category}/in/{neighborhood}`** — SEO Layer 2 (e.g. `/hotels/in/balboa-park`). Source: `src/lib/seo-neighborhoods.ts` + CMS overrides in `neighborhood_pages` table + AI generator. **This is what the home should link to.**

## Changes

### 1. Admin: smart link picker (`src/routes/admin.cms.home-neighborhoods.tsx`)

Replace the free-text "Link to" input with **two dropdowns**:

- **Neighborhood** — populated from `SEO_NEIGHBORHOODS` (slug + name).
- **Category** — populated from the selected neighborhood's `categories` array (only valid combos shown). Includes a "Neighborhood overview" option that maps to `/neighborhoods/{slug}`.

On change, compute and store `link_to`:
- Category selected → `/{category}/in/{neighborhoodSlug}`
- "Overview" selected → `/neighborhoods/{neighborhoodSlug}`

Keep a small "Custom URL" escape hatch (collapsed) for edge cases (external links, themed hubs, etc.). Existing rows with non-matching `link_to` values fall through to the custom field automatically.

Also auto-suggest the **name** field from the chosen neighborhood when adding a new card (still editable).

### 2. Seed defaults toward SEO pages

When the admin table is empty, the home page falls back to mock neighborhoods linking at `/neighborhoods/{slug}`. Update the fallback in `src/routes/index.tsx` so each mock card maps to a sensible SEO Layer 2 default:

| Neighborhood | Default destination |
|---|---|
| La Jolla | `/things-to-do/in/la-jolla` |
| Gaslamp Quarter | `/nightlife/in/gaslamp-quarter` |
| Coronado | `/hotels/in/coronado` |
| Little Italy | `/restaurants/in/little-italy` |
| Balboa Park | `/things-to-do/in/balboa-park` |
| Pacific Beach | `/things-to-do/in/pacific-beach` |
| Ocean Beach | `/restaurants/in/ocean-beach` |
| Mission Beach | `/things-to-do/in/mission-beach` |

(These can be overridden any time from admin.)

### 3. No DB changes

The existing `home_neighborhoods.link_to text` column already supports any URL — no migration needed.

## Files touched

- `src/routes/admin.cms.home-neighborhoods.tsx` — replace text input with neighborhood + category dropdowns; add custom-URL fallback.
- `src/routes/index.tsx` — update mock-fallback `href` mapping.

## Out of scope

- Changing the `/neighborhoods/{slug}` editorial hub itself (still useful as a secondary destination).
- Bulk-rewriting existing `home_neighborhoods` rows in the database — admin UI will surface them and let you pick new targets.
