
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS editor_note text,
  ADD COLUMN IF NOT EXISTS why_we_picked_it text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS insider_tip text,
  ADD COLUMN IF NOT EXISTS best_time_to_visit text,
  ADD COLUMN IF NOT EXISTS local_context text,
  ADD COLUMN IF NOT EXISTS curator_id uuid,
  ADD COLUMN IF NOT EXISTS verified_visited boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS originality_score numeric;

CREATE INDEX IF NOT EXISTS idx_listings_curator_id ON public.listings(curator_id);
