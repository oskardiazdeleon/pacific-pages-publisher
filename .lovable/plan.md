# Embeddable content cards in the editor — starting with cruise cards

You want to drop visual "cards" (cruise lines, listings, hotels, restaurants…) into the body of blog posts and articles directly from the editor, so the published post renders them inline as rich blocks instead of plain links.

We'll start with **cruise cards** (data already lives in the `cruise_lines` table) and ship a foundation that makes adding `listings`, `restaurants`, `hotels`, etc. trivial later.

---

## The three insertion options (pick one or combine)

I recommend we ship **Option A as the primary UX**, with **Option C as a power-user shortcut**. Option B is shown for completeness.

### Option A — "Insert Cruise Card" toolbar button + picker modal (recommended)

A new button in the RichTextEditor toolbar opens a searchable modal listing all enabled cruise lines with thumbnail + name + tagline. Click one → it gets inserted at the cursor as a card block.

```text
┌─ Editor toolbar ────────────────────────────────────┐
│ B  I  S  H2  H3  ”  •  1.  —   🔗  🖼  🚢 ▾  ↶ ↷ │
└─────────────────────────────────────────────────────┘
                                          │
                                          ▼
                          ┌──────────────────────────────┐
                          │ Insert card                  │
                          │ ┌──────────────────────────┐ │
                          │ │ 🔍 Search cruise lines…  │ │
                          │ └──────────────────────────┘ │
                          │  [img] Princess Cruises      │
                          │        From San Diego year…  │
                          │  [img] Holland America       │
                          │  [img] Disney Cruise Line    │
                          │  …                           │
                          │ Style: ◉ Full  ○ Compact     │
                          └──────────────────────────────┘
```

Inserted card preview inside the editor (Full style):

```text
┌──────────────────────────────────────────────────────┐
│ [Hero image — 16:9]                                  │
│                                                      │
│ CRUISE LINE · From San Diego                         │
│ Princess Cruises                                     │
│ Relaxed Pacific itineraries from the Embarcadero.    │
│                                                      │
│ From $499 · 7-night Mexican Riviera                  │
│ [ Book cruise → ]   [ View details ]                 │
└──────────────────────────────────────────────────────┘
```

Compact style (for inline placement between paragraphs):

```text
┌──────────────────────────────────────────┐
│ [thumb] Princess Cruises                 │
│         7-night Mexican Riviera · $499 → │
└──────────────────────────────────────────┘
```

### Option B — Slash menu (`/cruise…`)

Type `/` in the editor to open a command menu: `/cruise`, `/listing`, `/hotel`. Same picker, just keyboard-first. Nice but more work and overlaps with Option A. Skip for v1.

### Option C — Paste-a-link auto-embed

If the author pastes a URL like `https://…/cruises/princess-cruises`, the editor recognizes the slug and converts the link into a cruise card automatically. Great power-user shortcut once Option A exists.

---

## What this looks like end-to-end

1. **Admin editor**: new toolbar button → picker → card appears inline (live preview matches the public site).
2. **Stored content**: card is a small placeholder in the markdown body, e.g.
   ```
   :::cruise-card{slug="princess-cruises" variant="full"}
   :::
   ```
   This survives the HTML ↔ Markdown round-trip cleanly.
3. **Public blog page** (`/blog/$slug`): a custom ReactMarkdown renderer detects the directive and renders a real `<CruiseCard>` React component fetched from `cruise_lines` at load time.

---

## Technical plan

**New files**
- `src/components/site/CruiseCard.tsx` — the public card component (Full + Compact variants), reused on the blog page and inside the editor preview.
- `src/components/admin/editor/CruiseCardNode.tsx` — TipTap custom Node (atom, `draggable`, `selectable`) wrapping `<CruiseCard>` in a `NodeViewWrapper` for the in-editor preview.
- `src/components/admin/editor/InsertCruiseCardDialog.tsx` — searchable modal listing cruise lines (uses existing `fetchCruiseLines`).
- `src/lib/embed-directives.ts` — shared serialize/parse helpers for the `:::cruise-card{slug="…"}` directive.

**Edited files**
- `src/components/admin/RichTextEditor.tsx`
  - Register the new `CruiseCardNode` extension.
  - Add a "Cruise" toolbar button (lucide `Ship` icon) that opens `InsertCruiseCardDialog`.
  - Configure Turndown (passed in by `BlogPostForm`) to convert the node's HTML back into the `:::cruise-card{slug="…"}` directive.
- `src/components/admin/BlogPostForm.tsx`
  - Extend the `TurndownService` with a custom rule for the cruise-card node.
  - Extend `marked` with a tokenizer (or pre-process step) that converts the directive back to the node's HTML on load.
- `src/routes/blog.$slug.tsx`
  - Pre-scan `post.body` for `:::cruise-card{…}` directives, fetch the referenced cruise lines once, and pass a `components` override to `<ReactMarkdown>` that renders `<CruiseCard>` in place of the directive.

**Why a markdown directive (not raw HTML)**
- Keeps the body human-editable and safe (no XSS surface from arbitrary HTML).
- Round-trips cleanly through Turndown ↔ marked.
- Trivial to extend: `:::listing-card{slug="…"}`, `:::hotel-card{…}`, etc. all share the same machinery.

**Designed to extend**
After cruise cards land, adding listing / hotel / restaurant cards is just:
1. New data fetcher + card component (most exist already, e.g. `ListingCard`).
2. Register a sibling TipTap node + dialog (or one unified "Insert card" dialog with a type tab).
3. Add the directive name to the shared parser.

---

## What I will NOT touch
- Existing markdown content (no migration needed — current posts just don't have directives).
- Auth, RLS, or DB schema (cruise data already exists).
- The cruise admin UI.

---

## Open questions before I build

1. **Card variants** — ship both **Full** and **Compact** from day one, or just **Full** first?
2. **Click target** — should the card link to the cruise line's detail page (`/cruises/$slug`), open the external `bookingUrl` in a new tab, or show both buttons (recommended)?
3. **Picker scope for v1** — cruise lines only, or should I also wire up generic **listings** (hotels/restaurants/etc.) in the same pass since the plumbing is shared?
