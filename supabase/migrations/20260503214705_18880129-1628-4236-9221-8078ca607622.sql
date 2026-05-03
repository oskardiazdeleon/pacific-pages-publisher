CREATE TABLE public.home_neighborhoods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position integer NOT NULL DEFAULT 0,
  name text NOT NULL,
  blurb text,
  image_url text,
  link_to text NOT NULL DEFAULT '/neighborhoods',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.home_neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Home neighborhoods public read"
ON public.home_neighborhoods FOR SELECT
USING (true);

CREATE POLICY "Admins editors insert home neighborhoods"
ON public.home_neighborhoods FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors update home neighborhoods"
ON public.home_neighborhoods FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete home neighborhoods"
ON public.home_neighborhoods FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_home_neighborhoods_updated_at
BEFORE UPDATE ON public.home_neighborhoods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.home_neighborhoods (position, name, blurb, image_url, link_to) VALUES
  (0, 'La Jolla', 'Sea cliffs, coves, and the famous sea lions.', 'https://kyufjwkvhsdfbcvyopjf.supabase.co/storage/v1/object/public/cms-media/seed-lajolla.jpg', '/neighborhoods/la-jolla'),
  (1, 'Gaslamp Quarter', 'Historic downtown after dark.', 'https://kyufjwkvhsdfbcvyopjf.supabase.co/storage/v1/object/public/cms-media/seed-gaslamp.jpg', '/neighborhoods/gaslamp-quarter'),
  (2, 'Coronado', 'White-sand beaches and the iconic Hotel Del.', 'https://kyufjwkvhsdfbcvyopjf.supabase.co/storage/v1/object/public/cms-media/seed-coronado.jpg', '/neighborhoods/coronado'),
  (3, 'Balboa Park', 'Museums, gardens, and Spanish architecture.', 'https://kyufjwkvhsdfbcvyopjf.supabase.co/storage/v1/object/public/cms-media/seed-balboa.jpg', '/neighborhoods/balboa-park');