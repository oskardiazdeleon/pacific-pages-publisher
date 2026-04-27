
# Plan — Make imported listings genuinely unique for Google + LLMs

Goal: every imported listing carries proprietary editorial context, structured data, and a quality gate so it can't go live as paraphrased boilerplate.

## What changes

### 1. Stronger AI rewrite contract (`src/utils/import.functions.ts`)
Rebuild `aiNormalize` for listings:
- Per-category prompt templates (Restaurant / Hotel / Attraction / Tour / Shopping / Nightlife) — each enforces its own structure (e.g. restaurants: hook → cuisine/vibe → signature dish → who it's for → reservation tip).
- Brand voice rules baked in: second-person, knowledgeable local, no marketing fluff, banned phrases ("hidden gem", "must-visit", "something for everyone", "nestled").
- Forbid copying any 8-word run verbatim from the source.
- Output expanded schema with new fields: `editor_note`, `why_we_picked_it` (string[]), `insider_tip`, `best_time_to_visit`, `local_context` (1–2 sentences referencing the neighborhood).
- After generation, run a cheap n-gram overlap check vs source markdown; if >25% shared 5-grams, regenerate once with a "more original" instruction.

### 2. Schema additions (migration)
Add to `listings`:
- `editor_note text`
- `why_we_picked_it text[] default '{}'`
- `insider_tip text`
- `best_time_to_visit text`
- `local_context text`
- `curator_id uuid` (references profile / editor)
- `verified_visited boolean default false`
- `verified_at timestamptz`
- `source_url text` (provenance)
- `originality_score numeric` (0–1, computed at import)

No RLS changes needed — same policies cover the new columns.

### 3. Quality gate before publish
In `insertListing` (and curated path):
- If `description` <300 chars, OR `editor_note` empty, OR `hero_image` null, OR `originality_score < 0.6` → force `status = 'draft'` regardless of `autoPublish`. Store reason in a new `import_job_items.last_error`-style note so editors see why it didn't publish.

### 4. Listing detail page upgrades (`src/components/site/ListingDetailPage.tsx`)
- **Editor's note callout** above the description (when present).
- **"Why we picked it"** chip row near the hero.
- **Insider tip** small highlighted block in the sidebar.
- **Best time to visit** inline with hours panel.
- **Local context** paragraph appended to the description.
- **Byline + freshness line**: "Curated by [Curator name] · Updated [date]" + "Verified visited" badge when applicable.
- **Pair this with** module: pick 2 nearby listings of complementary categories (restaurant → bar/coffee, hotel → restaurant + attraction).
- **JSON-LD**: emit `LocalBusiness` / `Restaurant` / `Hotel` / `TouristAttraction` with `name`, `address`, `geo` (if available), `priceRange`, `aggregateRating` (if rating exists), `openingHoursSpecification`, `image`, `url`, `dateModified`. Wired through TanStack `head()` so it ships in SSR HTML.

### 5. Per-listing meta variation (`src/routes/listings.$slug.tsx`)
Title/description templates use neighborhood + category + signature trait so two restaurants never share the same meta. og:image already uses `hero_image` — confirm + add `twitter:image`.

### 6. Admin form additions (`src/components/admin/ListingForm.tsx`)
New "Editorial context" panel exposing all new fields, plus "Mark as visited" toggle and curator dropdown (auto-set to current user on first save).

### 7. Backfill helper
A small server function `enrichExistingListing(id)` that re-runs the new AI rewrite for an already-imported listing using its `source_url`, so older imports can be upgraded without re-importing. Surfaced as a "Re-enrich with AI" button on the admin listing page.

## Files touched

- `src/utils/import.functions.ts` — rewrite contract, n-gram check, quality gate, new fields, enrich function
- `supabase/migrations/<new>.sql` — column additions
- `src/components/site/ListingDetailPage.tsx` — new modules, byline, JSON-LD
- `src/components/site/listing/EditorialContext.tsx` *(new)* — editor note, why-we-picked, insider tip blocks
- `src/components/site/listing/PairThisWith.tsx` *(new)* — companion listings module
- `src/routes/listings.$slug.tsx` — meta templates, twitter:image, loader fetches new fields + curator profile
- `src/components/admin/ListingForm.tsx` — Editorial context panel
- `src/routes/admin.listings.$id.tsx` — "Re-enrich" button

## Out of scope (call out for later)

- Reviews/tips UGC (separate plan from previous turn).
- Author E-E-A-T pages (curator profile pages) — this plan adds the byline; full creator profile pages can come with the Creator Program.
- Auto-composited OG images per listing — defer; we'll use existing hero for now.

## Open questions before I build

1. **Curator default**: when an admin imports, set curator = themselves automatically, or leave blank and force them to assign? (Default I'll use: auto-assign to importer.)
2. **Auto re-enrich**: should I batch-re-enrich existing published listings on first deploy, or leave it as a manual per-listing button? (Default: manual button only — safer.)
3. **Originality threshold**: is 0.6 too strict / too loose? Easy to tune — I'll start at 0.6 and expose it as a setting in `site_settings` so you can adjust without a deploy.

If those defaults look fine, just say "go" and I'll implement. Otherwise tell me what to change.
