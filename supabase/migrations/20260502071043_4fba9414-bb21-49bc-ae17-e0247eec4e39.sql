-- Layer 2 SEO: Neighborhood landing page CMS overrides
CREATE TABLE IF NOT EXISTS public.neighborhood_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL,           -- 'hotels', 'restaurants', 'things-to-do', 'shopping', 'nightlife'
  neighborhood_slug text NOT NULL,       -- 'gaslamp-quarter', 'la-jolla', etc.
  neighborhood_name text NOT NULL,       -- Display + DB filter value, e.g. 'Gaslamp Quarter'
  title text,                            -- Optional H1 override; falls back to default pattern
  intro text,                            -- 2–4 sentences, neighborhood + category context
  insider_tip text,                      -- "Insider Tips" section body
  hero_image text,
  meta_title text,
  meta_description text,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,        -- [{q, a}, ...]
  status content_status NOT NULL DEFAULT 'draft',
  published_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT neighborhood_pages_unique UNIQUE (category_slug, neighborhood_slug)
);

CREATE INDEX IF NOT EXISTS idx_neighborhood_pages_lookup
  ON public.neighborhood_pages (category_slug, neighborhood_slug)
  WHERE status = 'published';

ALTER TABLE public.neighborhood_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published neighborhood pages are public"
  ON public.neighborhood_pages
  FOR SELECT
  USING (
    status = 'published'
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
  );

CREATE POLICY "Admins and editors can create neighborhood pages"
  ON public.neighborhood_pages
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
  );

CREATE POLICY "Admins and editors can update neighborhood pages"
  ON public.neighborhood_pages
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
  );

CREATE POLICY "Only admins can delete neighborhood pages"
  ON public.neighborhood_pages
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_neighborhood_pages_updated_at
  BEFORE UPDATE ON public.neighborhood_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();