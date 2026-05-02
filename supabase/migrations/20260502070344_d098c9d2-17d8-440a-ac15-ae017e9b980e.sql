-- Add member_discount field to listings for "Member Discount Available" badge (SEO Layer 1)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS member_discount jsonb;

COMMENT ON COLUMN public.listings.member_discount IS
  'Optional member discount info shown as a badge on listing cards. Shape: { "label": "15% off", "details": "Insider members only" }. NULL = no discount.';

CREATE INDEX IF NOT EXISTS idx_listings_member_discount
  ON public.listings ((member_discount IS NOT NULL))
  WHERE member_discount IS NOT NULL;