ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS show_claim_box boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_insider_box boolean NOT NULL DEFAULT true;