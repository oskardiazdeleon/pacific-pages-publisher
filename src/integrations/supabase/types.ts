export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          ai_generated: boolean
          ai_prompt: string | null
          author_avatar: string | null
          author_bio: string | null
          author_id: string | null
          author_name: string | null
          author_title: string | null
          body: string | null
          canonical_url: string | null
          category: string
          created_at: string
          excerpt: string | null
          faqs: Json
          hero_caption: string | null
          hero_credit: string | null
          hero_image: string | null
          id: string
          key_takeaways: Json
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          pull_quote: string | null
          read_time_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          ai_prompt?: string | null
          author_avatar?: string | null
          author_bio?: string | null
          author_id?: string | null
          author_name?: string | null
          author_title?: string | null
          body?: string | null
          canonical_url?: string | null
          category: string
          created_at?: string
          excerpt?: string | null
          faqs?: Json
          hero_caption?: string | null
          hero_credit?: string | null
          hero_image?: string | null
          id?: string
          key_takeaways?: Json
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          pull_quote?: string | null
          read_time_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          ai_prompt?: string | null
          author_avatar?: string | null
          author_bio?: string | null
          author_id?: string | null
          author_name?: string | null
          author_title?: string | null
          body?: string | null
          canonical_url?: string | null
          category?: string
          created_at?: string
          excerpt?: string | null
          faqs?: Json
          hero_caption?: string | null
          hero_credit?: string | null
          hero_image?: string | null
          id?: string
          key_takeaways?: Json
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          pull_quote?: string | null
          read_time_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          created_at: string
          created_by: string | null
          draft_body: Json
          hero_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          published_body: Json | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          draft_body?: Json
          hero_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          published_body?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          draft_body?: Json
          hero_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          published_body?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cruise_lines: {
        Row: {
          best_for: string | null
          booking_url: string | null
          created_at: string
          description: string | null
          enabled: boolean
          hero_image: string | null
          highlights: Json
          home_port: string | null
          id: string
          logo_letter: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          position: number
          price_from: string | null
          seasonality: string | null
          ships_from_sd: string[]
          slug: string
          tagline: string | null
          typical_itineraries: string[]
          updated_at: string
        }
        Insert: {
          best_for?: string | null
          booking_url?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          hero_image?: string | null
          highlights?: Json
          home_port?: string | null
          id?: string
          logo_letter?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          position?: number
          price_from?: string | null
          seasonality?: string | null
          ships_from_sd?: string[]
          slug: string
          tagline?: string | null
          typical_itineraries?: string[]
          updated_at?: string
        }
        Update: {
          best_for?: string | null
          booking_url?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          hero_image?: string | null
          highlights?: Json
          home_port?: string | null
          id?: string
          logo_letter?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          position?: number
          price_from?: string | null
          seasonality?: string | null
          ships_from_sd?: string[]
          slug?: string
          tagline?: string | null
          typical_itineraries?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      home_neighborhoods: {
        Row: {
          blurb: string | null
          created_at: string
          enabled: boolean
          id: string
          image_url: string | null
          link_to: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          link_to?: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          blurb?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          link_to?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          draft_content: Json
          enabled: boolean
          id: string
          position: number
          published_at: string | null
          published_content: Json | null
          section_key: string
          section_type: string
          updated_at: string
        }
        Insert: {
          draft_content?: Json
          enabled?: boolean
          id?: string
          position?: number
          published_at?: string | null
          published_content?: Json | null
          section_key: string
          section_type: string
          updated_at?: string
        }
        Update: {
          draft_content?: Json
          enabled?: boolean
          id?: string
          position?: number
          published_at?: string | null
          published_content?: Json | null
          section_key?: string
          section_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      import_job_items: {
        Row: {
          attempts: number
          created_at: string
          id: string
          job_id: string
          last_error: string | null
          result_kind: string | null
          result_slug: string | null
          status: Database["public"]["Enums"]["import_item_status"]
          updated_at: string
          url: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          job_id: string
          last_error?: string | null
          result_kind?: string | null
          result_slug?: string | null
          status?: Database["public"]["Enums"]["import_item_status"]
          updated_at?: string
          url: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          job_id?: string
          last_error?: string | null
          result_kind?: string | null
          result_slug?: string | null
          status?: Database["public"]["Enums"]["import_item_status"]
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_job_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          created_at: string
          created_by: string
          done_count: number
          error: string | null
          failed_count: number
          id: string
          kind: string
          publish: boolean
          search: string | null
          section_url: string
          status: Database["public"]["Enums"]["import_job_status"]
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          done_count?: number
          error?: string | null
          failed_count?: number
          id?: string
          kind: string
          publish?: boolean
          search?: string | null
          section_url: string
          status?: Database["public"]["Enums"]["import_job_status"]
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          done_count?: number
          error?: string | null
          failed_count?: number
          id?: string
          kind?: string
          publish?: boolean
          search?: string | null
          section_url?: string
          status?: Database["public"]["Enums"]["import_job_status"]
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      insider_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          tier: Database["public"]["Enums"]["insider_tier"]
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          tier: Database["public"]["Enums"]["insider_tier"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          tier?: Database["public"]["Enums"]["insider_tier"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      listing_claims: {
        Row: {
          claimant_email: string
          claimant_name: string
          claimant_role: Database["public"]["Enums"]["claimant_role"]
          created_at: string
          email_domain_match: boolean
          id: string
          listing_id: string
          notes: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          claimant_email: string
          claimant_name: string
          claimant_role?: Database["public"]["Enums"]["claimant_role"]
          created_at?: string
          email_domain_match?: boolean
          id?: string
          listing_id: string
          notes?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          claimant_email?: string
          claimant_name?: string
          claimant_role?: Database["public"]["Enums"]["claimant_role"]
          created_at?: string
          email_domain_match?: boolean
          id?: string
          listing_id?: string
          notes?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listing_impressions: {
        Row: {
          created_at: string
          id: string
          impression_type: Database["public"]["Enums"]["impression_type"]
          listing_id: string
          referrer: string | null
          session_hash: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          impression_type?: Database["public"]["Enums"]["impression_type"]
          listing_id: string
          referrer?: string | null
          session_hash?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          impression_type?: Database["public"]["Enums"]["impression_type"]
          listing_id?: string
          referrer?: string | null
          session_hash?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_impressions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string | null
          best_time_to_visit: string | null
          category: Database["public"]["Enums"]["listing_category"]
          created_at: string
          curator_id: string | null
          description: string | null
          editor_note: string | null
          email: string | null
          faqs: Json
          gallery: string[] | null
          hero_image: string | null
          hours: Json | null
          id: string
          insider_tip: string | null
          is_sponsored: boolean
          local_context: string | null
          member_discount: Json | null
          meta_description: string | null
          meta_title: string | null
          name: string
          neighborhood: string
          originality_score: number | null
          partner_id: string | null
          partner_spotlight: Json | null
          phone: string | null
          price_range: string | null
          published_at: string | null
          rating: number | null
          reservation_url: string | null
          short_description: string | null
          show_claim_box: boolean
          show_insider_box: boolean
          slug: string
          source_url: string | null
          sponsor_name: string | null
          sponsor_rank: number
          sponsor_until: string | null
          status: Database["public"]["Enums"]["content_status"]
          tier: Database["public"]["Enums"]["listing_tier"]
          updated_at: string
          verified_at: string | null
          verified_visited: boolean
          website: string | null
          wedding_details: Json | null
          why_we_picked_it: string[]
        }
        Insert: {
          address?: string | null
          best_time_to_visit?: string | null
          category: Database["public"]["Enums"]["listing_category"]
          created_at?: string
          curator_id?: string | null
          description?: string | null
          editor_note?: string | null
          email?: string | null
          faqs?: Json
          gallery?: string[] | null
          hero_image?: string | null
          hours?: Json | null
          id?: string
          insider_tip?: string | null
          is_sponsored?: boolean
          local_context?: string | null
          member_discount?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          neighborhood: string
          originality_score?: number | null
          partner_id?: string | null
          partner_spotlight?: Json | null
          phone?: string | null
          price_range?: string | null
          published_at?: string | null
          rating?: number | null
          reservation_url?: string | null
          short_description?: string | null
          show_claim_box?: boolean
          show_insider_box?: boolean
          slug: string
          source_url?: string | null
          sponsor_name?: string | null
          sponsor_rank?: number
          sponsor_until?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tier?: Database["public"]["Enums"]["listing_tier"]
          updated_at?: string
          verified_at?: string | null
          verified_visited?: boolean
          website?: string | null
          wedding_details?: Json | null
          why_we_picked_it?: string[]
        }
        Update: {
          address?: string | null
          best_time_to_visit?: string | null
          category?: Database["public"]["Enums"]["listing_category"]
          created_at?: string
          curator_id?: string | null
          description?: string | null
          editor_note?: string | null
          email?: string | null
          faqs?: Json
          gallery?: string[] | null
          hero_image?: string | null
          hours?: Json | null
          id?: string
          insider_tip?: string | null
          is_sponsored?: boolean
          local_context?: string | null
          member_discount?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          neighborhood?: string
          originality_score?: number | null
          partner_id?: string | null
          partner_spotlight?: Json | null
          phone?: string | null
          price_range?: string | null
          published_at?: string | null
          rating?: number | null
          reservation_url?: string | null
          short_description?: string | null
          show_claim_box?: boolean
          show_insider_box?: boolean
          slug?: string
          source_url?: string | null
          sponsor_name?: string | null
          sponsor_rank?: number
          sponsor_until?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tier?: Database["public"]["Enums"]["listing_tier"]
          updated_at?: string
          verified_at?: string | null
          verified_visited?: boolean
          website?: string | null
          wedding_details?: Json | null
          why_we_picked_it?: string[]
        }
        Relationships: []
      }
      nav_menus: {
        Row: {
          draft_items: Json
          id: string
          label: string
          location: string
          published_at: string | null
          published_items: Json | null
          updated_at: string
        }
        Insert: {
          draft_items?: Json
          id?: string
          label: string
          location: string
          published_at?: string | null
          published_items?: Json | null
          updated_at?: string
        }
        Update: {
          draft_items?: Json
          id?: string
          label?: string
          location?: string
          published_at?: string | null
          published_items?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      neighborhood_pages: {
        Row: {
          category_slug: string
          created_at: string
          created_by: string | null
          faqs: Json
          hero_image: string | null
          id: string
          insider_tip: string | null
          intro: string | null
          meta_description: string | null
          meta_title: string | null
          neighborhood_name: string
          neighborhood_slug: string
          published_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          category_slug: string
          created_at?: string
          created_by?: string | null
          faqs?: Json
          hero_image?: string | null
          id?: string
          insider_tip?: string | null
          intro?: string | null
          meta_description?: string | null
          meta_title?: string | null
          neighborhood_name: string
          neighborhood_slug: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          category_slug?: string
          created_at?: string
          created_by?: string | null
          faqs?: Json
          hero_image?: string | null
          id?: string
          insider_tip?: string | null
          intro?: string | null
          meta_description?: string | null
          meta_title?: string | null
          neighborhood_name?: string
          neighborhood_slug?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          headshot_url: string | null
          id: string
          instagram: string | null
          partner_company: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          headshot_url?: string | null
          id?: string
          instagram?: string | null
          partner_company?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          headshot_url?: string | null
          id?: string
          instagram?: string | null
          partner_company?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      seo_neighborhoods: {
        Row: {
          blurb: string | null
          categories: string[]
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          lat: number | null
          lng: number | null
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          blurb?: string | null
          categories?: string[]
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          blurb?: string | null
          categories?: string[]
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          draft_value: Json
          id: string
          key: string
          published_at: string | null
          published_value: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          draft_value?: Json
          id?: string
          key: string
          published_at?: string | null
          published_value?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          draft_value?: Json
          id?: string
          key?: string
          published_at?: string | null
          published_value?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venue_inquiries: {
        Row: {
          created_at: string
          email: string
          event_date: string | null
          guest_count: number | null
          id: string
          listing_id: string
          message: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          listing_id: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          listing_id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "partner" | "user"
      claim_status: "pending" | "approved" | "rejected"
      claimant_role: "owner" | "manager" | "marketing" | "other"
      content_status: "draft" | "published" | "archived"
      import_item_status: "pending" | "processing" | "done" | "failed"
      import_job_status:
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
      impression_type:
        | "view"
        | "click"
        | "phone_click"
        | "website_click"
        | "reservation_click"
      insider_tier: "trial" | "explorer" | "premier" | "plus" | "elite"
      listing_category:
        | "Restaurant"
        | "Hotel"
        | "Attraction"
        | "Tour"
        | "Shopping"
        | "Nightlife"
        | "Golf"
        | "WeddingVenue"
        | "Winery"
      listing_tier: "free" | "featured" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "partner", "user"],
      claim_status: ["pending", "approved", "rejected"],
      claimant_role: ["owner", "manager", "marketing", "other"],
      content_status: ["draft", "published", "archived"],
      import_item_status: ["pending", "processing", "done", "failed"],
      import_job_status: [
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
      ],
      impression_type: [
        "view",
        "click",
        "phone_click",
        "website_click",
        "reservation_click",
      ],
      insider_tier: ["trial", "explorer", "premier", "plus", "elite"],
      listing_category: [
        "Restaurant",
        "Hotel",
        "Attraction",
        "Tour",
        "Shopping",
        "Nightlife",
        "Golf",
        "WeddingVenue",
        "Winery",
      ],
      listing_tier: ["free", "featured", "premium"],
    },
  },
} as const
