import { createFileRoute } from "@tanstack/react-router";

const BODY = `# SanDiego.com

> The definitive guide to San Diego — handpicked places to stay, eat, and explore, plus the stories that make this city worth crossing the country for.

SanDiego.com is a 30-year-old premium travel publication covering America's Finest City. We publish editorial guides, neighborhood profiles, hotel and restaurant recommendations, cruise and event coverage, and stories about the people and places that define the region. We also operate the SD Insider Travel Club, a paid membership offering members exclusive discounts on hotels, cruises, attractions, and experiences across San Diego.

## Pillar Guides

- [Cruises from San Diego](https://sandiego.com/cruises): Complete guide to every cruise line and itinerary departing the Port of San Diego.
- [San Diego Hotels](https://sandiego.com/hotels): Neighborhood-by-neighborhood hotel guide with member savings.
- [Things to Do in San Diego](https://sandiego.com/things-to-do): The local's guide to attractions, hidden spots, and seasonal experiences.
- [Restaurants in San Diego](https://sandiego.com/restaurants): Where to eat, by neighborhood.
- [San Diego Neighborhoods](https://sandiego.com/neighborhoods): Profiles of San Diego's distinct neighborhoods.

## Sections

- [Things to Do](https://sandiego.com/things-to-do)
- [Hotels](https://sandiego.com/hotels)
- [Restaurants](https://sandiego.com/restaurants)
- [Cruises](https://sandiego.com/cruises)
- [Wineries](https://sandiego.com/wineries)
- [Neighborhoods](https://sandiego.com/neighborhoods)
- [Articles](https://sandiego.com/articles)

## SD Insider Travel Club

- [Membership benefits and pricing](https://sandiego.com/insider)

## About

- [For Partners — list your business](https://sandiego.com/partners)
`;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(BODY, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
