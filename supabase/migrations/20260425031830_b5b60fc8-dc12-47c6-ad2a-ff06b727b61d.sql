
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsor_name text,
  ADD COLUMN IF NOT EXISTS sponsor_rank integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sponsor_until timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_listings_sponsor
  ON public.listings (is_sponsored, sponsor_rank DESC, sponsor_until)
  WHERE is_sponsored = true;
