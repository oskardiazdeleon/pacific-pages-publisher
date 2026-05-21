UPDATE public.homepage_sections
SET
  published_content = jsonb_set(
    jsonb_set(COALESCE(published_content, '{}'::jsonb), '{eyebrow}', '"Local Dispatch"'),
    '{heading}', '"Latest from San Diego"'
  ),
  draft_content = jsonb_set(
    jsonb_set(COALESCE(draft_content, '{}'::jsonb), '{eyebrow}', '"Local Dispatch"'),
    '{heading}', '"Latest from San Diego"'
  )
WHERE section_key = 'editorial';