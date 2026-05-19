
## Why this matters

Right now the homepage is mostly visuals, card grids, and short CTAs. Google has very little prose to associate with `sandiego.com` for terms like "things to do in San Diego," "where to stay in San Diego," or "best San Diego neighborhoods." Adding a real content section — backed by the existing homepage CMS (`fetchPublishedHomepageSections`) — gives crawlers something to rank and gives you a place to keep updating fresh keywords without touching code.

## Recommended sections (pick 1–3)

1. **"About San Diego" intro block** (highest SEO value, lowest effort)
   - 2–4 short paragraphs of editorial prose under an H2 like "The definitive guide to San Diego."
   - Naturally mentions the big head terms: neighborhoods, beaches, hotels, restaurants, things to do, weather, getting around.
   - Placed between Neighborhoods and the Insider lead magnet, or just below the hero.

2. **Internal-linking "Explore by category" block**
   - H2 + 6–10 keyword-rich text links: "Best hotels in San Diego," "Top restaurants in La Jolla," "Things to do in Balboa Park," "San Diego nightlife," "Family-friendly beaches," etc.
   - Pure text links (not just image cards) — crawlers weight these much more than the current image grid.
   - Doubles as a sitemap-style hub that pushes link equity to category and neighborhood pages.

3. **FAQ block with FAQPage JSON-LD**
   - 5–8 Q&As: "When is the best time to visit San Diego?", "How many days do you need in San Diego?", "What's the best neighborhood to stay in?", "Is San Diego walkable?", "How do I get from the airport?"
   - Emit `application/ld+json` of type `FAQPage` in the route's `head().scripts` — eligible for rich results in Google.

4. **"Trending right now" / fresh content strip** (optional)
   - Auto-pulls the 4–6 most recent published articles or listings as text links with short blurbs.
   - Signals freshness to crawlers and gives recurring crawl targets.

5. **LocalBusiness / TravelGuide structured data** (optional, no visible UI)
   - Add a JSON-LD `TouristDestination` or `TravelGuide` block describing sandiego.com to the root or index `head().scripts`.

## How it fits the existing system

- The page already reads CMS-driven sections via `fetchPublishedHomepageSections()` and a `c("section_key", "field", "fallback")` helper. New sections plug into the same pattern — add new `section_key` values like `seo_intro`, `explore_links`, `faq`, each with their own fields (`heading`, `body_md`, `items[]`).
- Editors can update copy from the admin without code deploys.
- The FAQ JSON-LD can be generated from the same CMS data, so editing a question in the admin updates both the visible UI and the structured data.

## Suggested placement order on the homepage

```text
Hero
Featured listings (existing)
SEO intro block            ← new
Editorial (existing)
Neighborhoods (existing)
Explore by category links  ← new
Insider lead magnet (existing)
FAQ + JSON-LD              ← new
Partner CTA (existing)
Footer
```

## What I'd build first if you want a single focused change

Just #1 + #3 (intro block + FAQ with JSON-LD). That gets you indexable long-form copy on the homepage and a shot at FAQ rich results, with minimal layout disruption. #2 can follow once the category/neighborhood URL structure is finalized.

## Next step

Tell me which of these you want (any combination), and whether you'd like the copy seeded with a first draft of San Diego–specific content or left as empty CMS slots for your editors to fill in.
