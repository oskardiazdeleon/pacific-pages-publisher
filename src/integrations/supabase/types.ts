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
      articles: {
        Row: {
          author_id: string | null
          body: string | null
          category: string
          created_at: string
          excerpt: string | null
          hero_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          category: string
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          category?: string
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          ai_generated: boolean
          ai_prompt: string | null
          author_id: string | null
          author_name: string | null
          body: string | null
          category: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
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
          author_id?: string | null
          author_name?: string | null
          body?: string | null
          category?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
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
          author_id?: string | null
          author_name?: string | null
          body?: string | null
          category?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
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
          category: Database["public"]["Enums"]["listing_category"]
          created_at: string
          description: string | null
          email: string | null
          gallery: string[] | null
          hero_image: string | null
          hours: Json | null
          id: string
          is_sponsored: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          neighborhood: string
          partner_id: string | null
          phone: string | null
          price_range: string | null
          published_at: string | null
          rating: number | null
          reservation_url: string | null
          short_description: string | null
          slug: string
          sponsor_name: string | null
          sponsor_rank: number
          sponsor_until: string | null
          status: Database["public"]["Enums"]["content_status"]
          tier: Database["public"]["Enums"]["listing_tier"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category: Database["public"]["Enums"]["listing_category"]
          created_at?: string
          description?: string | null
          email?: string | null
          gallery?: string[] | null
          hero_image?: string | null
          hours?: Json | null
          id?: string
          is_sponsored?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          neighborhood: string
          partner_id?: string | null
          phone?: string | null
          price_range?: string | null
          published_at?: string | null
          rating?: number | null
          reservation_url?: string | null
          short_description?: string | null
          slug: string
          sponsor_name?: string | null
          sponsor_rank?: number
          sponsor_until?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tier?: Database["public"]["Enums"]["listing_tier"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["listing_category"]
          created_at?: string
          description?: string | null
          email?: string | null
          gallery?: string[] | null
          hero_image?: string | null
          hours?: Json | null
          id?: string
          is_sponsored?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          neighborhood?: string
          partner_id?: string | null
          phone?: string | null
          price_range?: string | null
          published_at?: string | null
          rating?: number | null
          reservation_url?: string | null
          short_description?: string | null
          slug?: string
          sponsor_name?: string | null
          sponsor_rank?: number
          sponsor_until?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tier?: Database["public"]["Enums"]["listing_tier"]
          updated_at?: string
          website?: string | null
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
      ],
      listing_tier: ["free", "featured", "premium"],
    },
  },
} as const
