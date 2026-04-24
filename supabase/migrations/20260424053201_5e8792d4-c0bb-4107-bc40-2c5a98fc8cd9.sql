-- =====================================================
-- 1. Tighten impression INSERT policy
-- =====================================================
DROP POLICY IF EXISTS "Anyone can record an impression" ON public.listing_impressions;

CREATE POLICY "Anyone can record an impression for a published listing"
  ON public.listing_impressions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_impressions.listing_id
        AND listings.status = 'published'
    )
  );

-- =====================================================
-- 2. Restrict storage bucket SELECT so files remain publicly
--    readable by URL, but contents cannot be enumerated.
--    The trick: scope SELECT to authenticated managers; public
--    URL access goes through the storage CDN and does not hit
--    these RLS policies.
-- =====================================================
DROP POLICY IF EXISTS "Listing media is publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Article media is publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;

-- Listing media: only managers can list/inspect; CDN serves files publicly.
CREATE POLICY "Managers can list listing media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'listing-media'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'editor')
      OR public.has_role(auth.uid(), 'partner')
    )
  );

CREATE POLICY "Managers can list article media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'article-media'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'editor')
    )
  );

-- Avatars: each user can list their own folder; others cannot enumerate.
CREATE POLICY "Users can list their own avatar folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );