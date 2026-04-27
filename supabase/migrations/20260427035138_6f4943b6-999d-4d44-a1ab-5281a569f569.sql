-- Add partner spotlight content to listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS partner_spotlight jsonb;

-- Trigger: only featured/premium tier listings can save non-empty spotlight content
CREATE OR REPLACE FUNCTION public.enforce_partner_spotlight_tier()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.partner_spotlight IS NOT NULL
     AND NEW.partner_spotlight <> '{}'::jsonb
     AND NEW.tier NOT IN ('featured','premium') THEN
    RAISE EXCEPTION 'Partner Spotlight requires Featured or Premium tier';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_partner_spotlight_tier_trg ON public.listings;
CREATE TRIGGER enforce_partner_spotlight_tier_trg
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.enforce_partner_spotlight_tier();