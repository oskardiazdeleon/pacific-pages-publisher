-- =====================================================
-- ROLES (separate table to prevent privilege escalation)
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'partner', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Roles are viewable by the user themselves"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  headshot_url TEXT,
  twitter TEXT,
  instagram TEXT,
  website TEXT,
  partner_company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- LISTINGS
-- =====================================================
CREATE TYPE public.listing_category AS ENUM ('Restaurant', 'Hotel', 'Attraction', 'Tour', 'Shopping', 'Nightlife');
CREATE TYPE public.listing_tier AS ENUM ('free', 'featured', 'premium');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category listing_category NOT NULL,
  neighborhood TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  hero_image TEXT,
  gallery TEXT[] DEFAULT '{}',
  address TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  hours JSONB,
  price_range TEXT,
  rating NUMERIC(2,1),
  tier listing_tier NOT NULL DEFAULT 'free',
  status content_status NOT NULL DEFAULT 'draft',
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  meta_title TEXT,
  meta_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_neighborhood ON public.listings(neighborhood);
CREATE INDEX idx_listings_partner ON public.listings(partner_id);

CREATE POLICY "Published listings are public"
  ON public.listings FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor') OR auth.uid() = partner_id);

CREATE POLICY "Admins and editors can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins, editors, and owning partners can update listings"
  ON public.listings FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'editor')
    OR (auth.uid() = partner_id AND public.has_role(auth.uid(), 'partner'))
  );

CREATE POLICY "Only admins can delete listings"
  ON public.listings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ARTICLES
-- =====================================================
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  hero_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status content_status NOT NULL DEFAULT 'draft',
  read_time_minutes INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);

CREATE POLICY "Published articles are public"
  ON public.articles FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor') OR auth.uid() = author_id);

CREATE POLICY "Admins and editors can create articles"
  ON public.articles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins, editors, and authors can update articles"
  ON public.articles FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'editor')
    OR auth.uid() = author_id
  );

CREATE POLICY "Only admins can delete articles"
  ON public.articles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- LISTING IMPRESSIONS (analytics for partners)
-- =====================================================
CREATE TYPE public.impression_type AS ENUM ('view', 'click', 'phone_click', 'website_click');

CREATE TABLE public.listing_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  impression_type impression_type NOT NULL DEFAULT 'view',
  source TEXT,
  referrer TEXT,
  user_agent TEXT,
  session_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_impressions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_impressions_listing ON public.listing_impressions(listing_id);
CREATE INDEX idx_impressions_created_at ON public.listing_impressions(created_at DESC);
CREATE INDEX idx_impressions_type ON public.listing_impressions(impression_type);

-- Anyone (including anonymous) can record an impression
CREATE POLICY "Anyone can record an impression"
  ON public.listing_impressions FOR INSERT
  WITH CHECK (true);

-- Only admins and the listing owner can read impression rows
CREATE POLICY "Admins and listing owners can read impressions"
  ON public.listing_impressions FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_impressions.listing_id
        AND listings.partner_id = auth.uid()
    )
  );

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-media', 'listing-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('article-media', 'article-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Public read for all three buckets
CREATE POLICY "Listing media is publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-media');

CREATE POLICY "Article media is publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-media');

CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Listing/article media: admins and editors can upload/manage
CREATE POLICY "Admins and editors can upload listing media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-media'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'partner'))
  );

CREATE POLICY "Admins and editors can update listing media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-media'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

CREATE POLICY "Admins can delete listing media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-media'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins and editors can upload article media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'article-media'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

CREATE POLICY "Admins and editors can update article media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'article-media'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

CREATE POLICY "Admins can delete article media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'article-media'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Avatars: users manage their own (folder name = user id)
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );