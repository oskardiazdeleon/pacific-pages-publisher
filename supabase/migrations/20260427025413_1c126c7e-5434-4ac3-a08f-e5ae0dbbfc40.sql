INSERT INTO public.homepage_sections (section_key, section_type, position, enabled, draft_content)
SELECT 'wineries_hero', 'themed_hub_hero', 200, true, '{}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.homepage_sections WHERE section_key = 'wineries_hero'
);