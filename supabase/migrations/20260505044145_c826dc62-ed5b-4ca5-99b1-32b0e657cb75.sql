
CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.claimant_role AS ENUM ('owner', 'manager', 'marketing', 'other');

CREATE TABLE public.listing_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  user_id UUID NOT NULL,
  claimant_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  claimant_role public.claimant_role NOT NULL DEFAULT 'owner',
  notes TEXT,
  status public.claim_status NOT NULL DEFAULT 'pending',
  email_domain_match BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX listing_claims_one_pending_per_user
  ON public.listing_claims (listing_id, user_id)
  WHERE status = 'pending';

CREATE INDEX listing_claims_status_idx ON public.listing_claims (status, created_at DESC);
CREATE INDEX listing_claims_listing_idx ON public.listing_claims (listing_id);
CREATE INDEX listing_claims_user_idx ON public.listing_claims (user_id);

ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own claims"
  ON public.listing_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Claimants and admins can view"
  ON public.listing_claims FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update claims"
  ON public.listing_claims FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete claims"
  ON public.listing_claims FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_listing_claims_updated_at
  BEFORE UPDATE ON public.listing_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_claim_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE public.listings
       SET partner_id = NEW.user_id
     WHERE id = NEW.listing_id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'partner')
    ON CONFLICT (user_id, role) DO NOTHING;

    NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER listing_claims_status_change
  BEFORE UPDATE OF status ON public.listing_claims
  FOR EACH ROW EXECUTE FUNCTION public.handle_claim_approved();
