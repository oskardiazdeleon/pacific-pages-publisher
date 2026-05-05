
CREATE TABLE public.cruise_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  hero_image text,
  logo_letter text,
  booking_url text,
  home_port text,
  ships_from_sd text[] NOT NULL DEFAULT '{}',
  typical_itineraries text[] NOT NULL DEFAULT '{}',
  best_for text,
  seasonality text,
  price_from text,
  description text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_title text,
  meta_description text,
  position integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cruise_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cruise lines public read"
  ON public.cruise_lines FOR SELECT
  USING (enabled = true OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors insert cruise lines"
  ON public.cruise_lines FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors update cruise lines"
  ON public.cruise_lines FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete cruise lines"
  ON public.cruise_lines FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cruise_lines_updated_at
  BEFORE UPDATE ON public.cruise_lines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
