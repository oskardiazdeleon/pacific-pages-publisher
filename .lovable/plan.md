## Goal

Generate a downloadable **Brand Guidelines PDF** for sandiego.com that documents the visual system (colors, typography, logo) and brand positioning (voice, tagline, audience) — pulled directly from your live site so it stays accurate.

This is a one-off artifact (not a feature added to the app). It will be delivered to `/mnt/documents/sandiego-brand-guidelines.pdf` for download.

## What the document will contain

**1. Cover** — Logo, "Brand Guidelines", site name, tagline.

**2. Brand Positioning**
- Tagline: *"The Definitive Guide to America's Finest City"*
- Mission/voice: definitive, local-insider, editorial — *"places to stay, eat, explore and the stories behind them"*
- Audience: visitors planning trips + locals looking for what's actually good
- Tone of voice: confident, curated, warm, knowledgeable (with do/don't examples)
- Pillars: Hotels · Restaurants · Things to Do · Nightlife · Shopping · Cruises · Neighborhoods · Wineries

**3. Logo**
- The existing `sandiego-logo.svg` (rendered on light + dark backgrounds)
- Clear-space and minimum-size rules
- Misuse examples (don't stretch, recolor, place on busy photos, etc.)

**4. Color System** — pulled from `src/styles.css` "Ocean Deep" palette:
- Ocean Deep `#0c2340` (primary)
- Ocean `#1a4a6e`
- Teal `#2d8a9e` (accent)
- Teal Soft `#5cbdb9`
- Sand `#faf8f3`
- Plus neutrals (background, foreground, border, muted) and the dark-mode variants
- Each swatch shown with HEX + OKLCH + role/usage

**5. Typography**
- Display: **Outfit** (100–900) — headings, hero copy
- Body: **Figtree** (300–900) — paragraphs, UI
- Type scale samples (H1 → caption), letter-spacing rule (`-0.02em` on headings), eyebrow style (`0.72rem`, `0.18em` tracking, accent color, uppercase)

**6. Imagery & Photography**
- Style direction: editorial coastal, golden-hour warmth, wide horizons, authentic San Diego (not stock-y)
- Subject matter: ocean/coastline, neighborhoods, food close-ups, people in places
- Treatment rules: no heavy filters, avoid oversaturation, prefer natural light
- A grid of 6 representative hero images sampled from current category hubs (Things to Do, Hotels, Restaurants, Wineries, Nightlife, Shopping)

**7. UI Patterns** (brief)
- Border radius `0.75rem`
- Eyebrow + heading + accent-line pattern (e.g. *"San Diego Wineries / from vine to glass."*)
- Card/listing visual conventions

**8. Contact / Stewardship**
- Phone, address, social handles from site settings
- Note on where the live tokens are maintained (Admin → CMS → Settings)

## How it's built

- A Python script using **ReportLab** (Platypus) renders the PDF.
- Color values are read directly from `src/styles.css` and the `homepage_sections` / `site_settings` tables so the doc reflects the live brand.
- The logo is embedded from `src/assets/sandiego-logo.svg` (converted to PNG for ReportLab).
- 6 hero images are pulled from the seeded `category_hub_hero` rows and downloaded for the imagery grid.
- After generation, every page is rasterized to JPEG and visually QA'd before delivery.

Output: `/mnt/documents/sandiego-brand-guidelines.pdf` (~10–14 pages, US Letter).

## What I'll need from you

Nothing — I have all the source data. If you'd like, after I generate v1 you can ask for tweaks like:
- Add a **competitor / "anti-brand"** section (what we're *not*)
- Add **example headlines** in your voice
- Swap to a different cover image
- Produce a **.docx** or **.pptx** version in addition to PDF

Approve and I'll generate the PDF.