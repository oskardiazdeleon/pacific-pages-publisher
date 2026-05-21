
-- Add AI tracking fields to articles (parity with old blog_posts)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_prompt text;

-- Migrate blog_posts into articles
INSERT INTO public.articles (
  id, slug, title, subtitle, excerpt, body, hero_image, category, tags,
  author_id, author_name, read_time_minutes, status, meta_title, meta_description,
  ai_generated, ai_prompt, published_at, created_at, updated_at
)
SELECT
  id, slug, title, subtitle, excerpt, body, cover_image,
  COALESCE(NULLIF(category, ''), 'Guide'),
  COALESCE(tags, '{}'::text[]),
  author_id, author_name, read_time_minutes, status, meta_title, meta_description,
  ai_generated, ai_prompt, published_at, created_at, updated_at
FROM public.blog_posts
ON CONFLICT (id) DO NOTHING;

-- Drop the old blog_posts table
DROP TABLE public.blog_posts;
