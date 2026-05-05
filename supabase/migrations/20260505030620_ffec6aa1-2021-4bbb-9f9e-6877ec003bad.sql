ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS author_title text,
  ADD COLUMN IF NOT EXISTS author_avatar text,
  ADD COLUMN IF NOT EXISTS author_bio text,
  ADD COLUMN IF NOT EXISTS hero_caption text,
  ADD COLUMN IF NOT EXISTS hero_credit text,
  ADD COLUMN IF NOT EXISTS key_takeaways jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS pull_quote text;
