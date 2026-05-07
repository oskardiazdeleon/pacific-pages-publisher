
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS wedding_details jsonb;

CREATE TABLE IF NOT EXISTS public.venue_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  event_date date,
  guest_count integer,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.venue_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a venue inquiry"
  ON public.venue_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins and editors can view venue inquiries"
  ON public.venue_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can update venue inquiries"
  ON public.venue_inquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can delete venue inquiries"
  ON public.venue_inquiries FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_venue_inquiries_updated_at
  BEFORE UPDATE ON public.venue_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_venue_inquiries_listing ON public.venue_inquiries(listing_id);
