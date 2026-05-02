# Finish Golf → standalone category

Golf is already its own DB category with its own hub at `/golf-courses`. The Things To Do hub stays exactly as it is. The only cleanup left is the orphaned `/things-to-do/golf` sub-page from the old structure.

## What to change

### 1. Delete the legacy sub-route
- Remove `src/routes/things-to-do.golf.tsx` (the old "Things To Do → Golf" filtered list).
- The auto-generated `src/routeTree.gen.ts` will drop the route on the next build.

### 2. Add a 301 redirect for SEO continuity
Any old links / Google index entries pointing at `/things-to-do/golf` should not 404. Add a redirect in `src/routes/things-to-do.golf.tsx` replacement — actually cleaner to handle this in the catch-all by re-creating the file as a redirect-only route:

```tsx
// src/routes/things-to-do.golf.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/things-to-do/golf")({
  beforeLoad: () => {
    throw redirect({ to: "/golf-courses", statusCode: 301 });
  },
  component: () => null,
});
```

This preserves the URL slot so crawlers get a real 301 (not a soft 404) and any internal stale `<Link>` still resolves.

### 3. Sweep for stale internal links
Search the codebase for hard-coded references to `/things-to-do/golf` and repoint them to `/golf-courses`:
- Header nav (`nav_menus` table is already updated, confirmed last turn)
- Footer
- Homepage CMS sections (`homepage_sections.draft_content` / `published_content`)
- Any blog posts / articles bodies (only flag, don't auto-rewrite content)

If any DB-stored links reference the old URL, I'll list them and update via the insert tool.

### 4. Sitemap
`src/routes/sitemap[.]xml.tsx` — make sure it no longer emits `/things-to-do/golf` and does emit `/golf-courses` + each `/golf-courses/{slug}`. I'll check and patch if needed.

## What stays untouched
- `/things-to-do` hub page and its listings
- All Attraction and Tour listings
- The Things To Do nav entry
- The Golf category, `/golf-courses` hub, listing URLs, golf neighborhood pages

## Files affected
- `src/routes/things-to-do.golf.tsx` — replace body with a 301 redirect (or delete if you'd rather rely on the SPA 404 → I recommend the redirect)
- `src/routes/sitemap[.]xml.tsx` — verify/update
- Possible DB updates to `homepage_sections` if any tile still points at `/things-to-do/golf`

## One question
Want the old URL to **301 redirect** to `/golf-courses` (recommended for SEO), or just delete the file and let it 404? Default: 301 redirect.