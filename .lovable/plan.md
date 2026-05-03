## Update home page neighborhood links

In `src/routes/index.tsx` (lines 207–211), change each neighborhood image card so it links to that neighborhood's guide page instead of the generic `/neighborhoods` index.

### Change

```tsx
<Link
  key={n.slug}
  to="/neighborhoods/$slug"
  params={{ slug: n.slug }}
  className="group relative overflow-hidden rounded-2xl aspect-[3/4]"
>
```

### Result

| Card | Before | After |
|---|---|---|
| La Jolla | `/neighborhoods` | `/neighborhoods/la-jolla` |
| Gaslamp Quarter | `/neighborhoods` | `/neighborhoods/gaslamp-quarter` |
| Coronado | `/neighborhoods` | `/neighborhoods/coronado` |
| …all 8 | `/neighborhoods` | `/neighborhoods/{slug}` |

Each card now lands on the full neighborhood guide (`src/routes/neighborhoods.$slug.tsx`) — hero image, intro, highlights, FAQs, and top listings in that area.
