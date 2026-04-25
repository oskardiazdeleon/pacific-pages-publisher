import { supabase } from "@/integrations/supabase/client";

export type NavItem = {
  label: string;
  to: string;
  children?: NavItem[];
};

export type SiteSettingsMap = {
  brand?: { site_name?: string; tagline?: string; logo_url?: string; footer_tagline?: string };
  contact?: { address?: string; phone?: string; phone_href?: string; email?: string };
  social?: { facebook?: string; instagram?: string; twitter?: string };
  footer_legal?: { copyright?: string; right_text?: string };
};

export async function fetchPublishedSettings(): Promise<SiteSettingsMap> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, published_value")
    .not("published_value", "is", null);
  if (error) return {};
  const map: SiteSettingsMap = {};
  for (const row of data ?? []) {
    (map as Record<string, unknown>)[row.key] = row.published_value;
  }
  return map;
}

export async function fetchPublishedMenu(location: string): Promise<NavItem[]> {
  const { data } = await supabase
    .from("nav_menus")
    .select("published_items")
    .eq("location", location)
    .maybeSingle();
  return (data?.published_items as NavItem[] | null) ?? [];
}

export type HomepageSection = {
  id: string;
  section_key: string;
  section_type: string;
  position: number;
  enabled: boolean;
  published_content: Record<string, unknown> | null;
  draft_content: Record<string, unknown>;
};

export async function fetchPublishedHomepageSections(): Promise<HomepageSection[]> {
  const { data } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("enabled", true)
    .not("published_content", "is", null)
    .order("position");
  return (data ?? []) as HomepageSection[];
}

export type ContentPage = {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  hero_image: string | null;
  published_body: { html?: string } | null;
  status: string;
};

export async function fetchPublishedPage(slug: string): Promise<ContentPage | null> {
  const { data } = await supabase
    .from("content_pages")
    .select("id, slug, title, meta_title, meta_description, hero_image, published_body, status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as ContentPage | null) ?? null;
}

export async function uploadCmsImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("cms-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
  return data.publicUrl;
}
