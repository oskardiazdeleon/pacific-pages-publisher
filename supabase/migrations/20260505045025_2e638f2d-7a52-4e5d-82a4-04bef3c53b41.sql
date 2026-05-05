ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'Winery';

INSERT INTO public.homepage_sections (section_key, section_type, position, enabled, draft_content, published_content)
VALUES (
  'wineries_hero',
  'category_hub_hero',
  106,
  true,
  '{"eyebrow":"Sip & swirl","heading":"San Diego Wineries","heading_accent":"where good times pour.","subheading":"Boutique tasting rooms, hillside vineyards and urban wineries — every label vetted by our editors. Insider members save on tastings and bottles.","hero_image_url":"https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80","search_placeholder":"Search wineries, varietals, neighborhoods…","popular_chips":[{"label":"Tasting Room","keyword":"tasting"},{"label":"Vineyard","keyword":"vineyard"},{"label":"Urban","keyword":"urban"},{"label":"Reserve","keyword":"reserve"}],"stats":[{"value":"60+","label":"Wineries"},{"value":"20%","label":"Insider Save"},{"value":"$15","label":"Avg Tasting"}],"insider_cta_title":"Sip smarter with Insider","insider_cta_body":"Member-only flights, complimentary upgrades and reserved tastings at participating wineries."}'::jsonb,
  '{"eyebrow":"Sip & swirl","heading":"San Diego Wineries","heading_accent":"where good times pour.","subheading":"Boutique tasting rooms, hillside vineyards and urban wineries — every label vetted by our editors. Insider members save on tastings and bottles.","hero_image_url":"https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80","search_placeholder":"Search wineries, varietals, neighborhoods…","popular_chips":[{"label":"Tasting Room","keyword":"tasting"},{"label":"Vineyard","keyword":"vineyard"},{"label":"Urban","keyword":"urban"},{"label":"Reserve","keyword":"reserve"}],"stats":[{"value":"60+","label":"Wineries"},{"value":"20%","label":"Insider Save"},{"value":"$15","label":"Avg Tasting"}],"insider_cta_title":"Sip smarter with Insider","insider_cta_body":"Member-only flights, complimentary upgrades and reserved tastings at participating wineries."}'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;