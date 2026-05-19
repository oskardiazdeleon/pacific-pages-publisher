-- Editable master list of neighborhoods (drives the SEO /[category]/in/[neighborhood] pages)
CREATE TABLE public.seo_neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  blurb text,
  description text,
  categories text[] NOT NULL DEFAULT '{}',
  lat numeric,
  lng numeric,
  position integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seo neighborhoods public read"
  ON public.seo_neighborhoods FOR SELECT
  USING (enabled = true OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors insert seo neighborhoods"
  ON public.seo_neighborhoods FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors update seo neighborhoods"
  ON public.seo_neighborhoods FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete seo neighborhoods"
  ON public.seo_neighborhoods FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_seo_neighborhoods_updated_at
  BEFORE UPDATE ON public.seo_neighborhoods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with the current hardcoded list
INSERT INTO public.seo_neighborhoods (slug, name, blurb, description, categories, lat, lng, position) VALUES
('gaslamp-quarter','Gaslamp Quarter','Historic downtown after dark.','The Gaslamp Quarter is downtown San Diego''s 16-block historic core — Victorian-era brick buildings now filled with rooftop bars, chef-driven restaurants, live-music venues and the city''s busiest nightlife scene.', ARRAY['hotels','restaurants','things-to-do','nightlife','shopping'], 32.7106, -117.1602, 10),
('pacific-beach','Pacific Beach','Boardwalk, sunsets, and beach-bar energy.','Pacific Beach (PB) is San Diego''s quintessential beach town — a 3-mile boardwalk, surf-and-burrito lifestyle, and a young, lively scene of taco shops, taprooms and sunset spots along Mission Boulevard.', ARRAY['hotels','restaurants','things-to-do','nightlife'], 32.7989, -117.2554, 20),
('little-italy','Little Italy','Restaurants, design shops, Saturday market.','Little Italy is downtown San Diego''s most walkable foodie neighborhood — a tight grid of acclaimed restaurants, indie design boutiques, the city''s best Saturday farmers market, and a pedestrian piazza at its center.', ARRAY['hotels','restaurants','shopping','nightlife','things-to-do'], 32.7233, -117.1690, 30),
('la-jolla','La Jolla','Sea cliffs, coves, and the famous sea lions.','La Jolla — Spanish for ''the jewel'' — is San Diego''s most iconic stretch of coastline. Sandstone cliffs drop into clear Pacific water, sea lions sun on the rocks, and an upscale village of galleries and seafood restaurants sits just blocks from the beach.', ARRAY['hotels','restaurants','things-to-do','shopping'], 32.8328, -117.2713, 40),
('mission-beach','Mission Beach','Roller coasters, the bay, and the boardwalk.','Mission Beach is a narrow strip of sand wedged between the Pacific Ocean and Mission Bay — home to Belmont Park''s vintage roller coaster, miles of boardwalk, and rental cottages a short walk from the surf.', ARRAY['hotels','restaurants','things-to-do'], 32.7706, -117.2519, 50),
('balboa-park','Balboa Park','Museums, gardens, and the world-famous Zoo.','Balboa Park is San Diego''s 1,200-acre cultural heart — 17 museums, the world-famous San Diego Zoo, Spanish Colonial Revival pavilions from the 1915 Panama-California Exposition, and gardens you could wander for a week.', ARRAY['hotels','restaurants','things-to-do'], 32.7341, -117.1446, 60),
('downtown','Downtown','Convention center, bayfront, and skyline.','Downtown San Diego stitches together the Gaslamp, East Village, Marina District and the Embarcadero — high-rise hotels with bay views, Petco Park, the city''s biggest convention venues, and waterfront dining within easy walking distance.', ARRAY['hotels','restaurants','things-to-do','nightlife','shopping'], 32.7157, -117.1611, 70),
('ocean-beach','Ocean Beach','Pier, dive bars, and bohemian beach-town vibes.','Ocean Beach (OB) is San Diego''s bohemian beach-town holdout — a half-mile pier, antique shops on Newport Avenue, dog-friendly sand, and dive bars where locals have been on first-name terms for decades.', ARRAY['hotels','restaurants','things-to-do','nightlife'], 32.7494, -117.2486, 80),
('coronado','Coronado','White-sand beaches and the iconic Hotel Del.','Coronado is a peninsula across the bay from downtown — a small-town village with one of America''s most decorated beaches and the legendary Hotel del Coronado, a Victorian beach resort that''s been hosting presidents and movie stars since 1888.', ARRAY['hotels','restaurants','things-to-do','shopping'], 32.6859, -117.1831, 90),
('old-town','Old Town','Where California began — adobe, mariachis, margaritas.','Old Town is the birthplace of California — six blocks of restored adobes, working blacksmiths and stagecoaches, surrounded by family-run Mexican restaurants where the margaritas are huge and the mariachis play through dinner.', ARRAY['restaurants','things-to-do','shopping','hotels'], 32.7549, -117.1969, 100);