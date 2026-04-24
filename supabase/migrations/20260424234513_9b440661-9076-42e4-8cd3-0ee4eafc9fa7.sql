
-- Email leads (lead magnet capture)
CREATE TABLE public.email_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.email_leads
  ADD CONSTRAINT email_leads_email_format
  CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX idx_email_leads_email ON public.email_leads (email);
CREATE INDEX idx_email_leads_created_at ON public.email_leads (created_at DESC);

ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.email_leads
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view leads"
  ON public.email_leads
  FOR SELECT
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insider signup tier interest
CREATE TYPE public.insider_tier AS ENUM ('trial', 'explorer', 'premier', 'plus', 'elite');

CREATE TABLE public.insider_signups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  tier public.insider_tier NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.insider_signups
  ADD CONSTRAINT insider_signups_email_format
  CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX idx_insider_signups_email ON public.insider_signups (email);
CREATE INDEX idx_insider_signups_tier ON public.insider_signups (tier);
CREATE INDEX idx_insider_signups_created_at ON public.insider_signups (created_at DESC);

ALTER TABLE public.insider_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a signup"
  ON public.insider_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view signups"
  ON public.insider_signups
  FOR SELECT
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));
