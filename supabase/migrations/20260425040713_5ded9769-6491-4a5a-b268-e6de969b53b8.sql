-- CMS: site settings, navigation menus, homepage sections, content pages

-- 1. Site settings (singleton-style key/value JSONB store with draft/publish)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  draft_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_value jsonb,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings published readable by all"
  ON public.site_settings FOR SELECT
  USING (published_value IS NOT NULL OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors manage settings insert"
  ON public.site_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors manage settings update"
  ON public.site_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete settings"
  ON public.site_settings FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Navigation menus (header/footer) — items stored as JSONB tree
CREATE TABLE public.nav_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL UNIQUE, -- 'header' | 'footer_what_new' | 'footer_company' | etc.
  label text NOT NULL,
  draft_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_items jsonb,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nav menus public read"
  ON public.nav_menus FOR SELECT USING (true);

CREATE POLICY "Admins editors insert nav"
  ON public.nav_menus FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors update nav"
  ON public.nav_menus FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete nav"
  ON public.nav_menus FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_nav_menus_updated
  BEFORE UPDATE ON public.nav_menus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Homepage sections — ordered, typed sections (hero, featured, cta, etc.)
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE, -- 'hero', 'featured', 'editorial', 'neighborhoods', 'insider_cta', 'partner_cta'
  section_type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  draft_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_content jsonb,
  enabled boolean NOT NULL DEFAULT true,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Homepage sections public read"
  ON public.homepage_sections FOR SELECT USING (true);

CREATE POLICY "Admins editors insert homepage"
  ON public.homepage_sections FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors update homepage"
  ON public.homepage_sections FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete homepage"
  ON public.homepage_sections FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_homepage_sections_updated
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Reusable content pages (About, Privacy, etc.)
CREATE TABLE public.content_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_title text,
  meta_description text,
  hero_image text,
  draft_body jsonb NOT NULL DEFAULT '{}'::jsonb,  -- { html, blocks }
  published_body jsonb,
  status content_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published pages public"
  ON public.content_pages FOR SELECT
  USING (status = 'published'::content_status OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors insert pages"
  ON public.content_pages FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors update pages"
  ON public.content_pages FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete pages"
  ON public.content_pages FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_content_pages_updated
  BEFORE UPDATE ON public.content_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Storage bucket for CMS media (per-field uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "CMS media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-media');

CREATE POLICY "Admins editors upload cms media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cms-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)));

CREATE POLICY "Admins editors update cms media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cms-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)));

CREATE POLICY "Admins delete cms media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cms-media' AND has_role(auth.uid(), 'admin'::app_role));