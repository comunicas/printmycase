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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string
          neighborhood: string
          number: string
          state: string
          street: string
          user_id: string
          zip_code: string
        }
        Insert: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          neighborhood?: string
          number?: string
          state?: string
          street?: string
          user_id: string
          zip_code?: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          neighborhood?: string
          number?: string
          state?: string
          street?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      ai_filter_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      ai_filters: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          id: string
          model_url: string
          name: string
          preview_css: string | null
          prompt: string
          send_style_image: boolean
          sort_order: number
          style_image_url: string | null
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          id?: string
          model_url?: string
          name: string
          preview_css?: string | null
          prompt: string
          send_style_image?: boolean
          sort_order?: number
          style_image_url?: string | null
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          id?: string
          model_url?: string
          name?: string
          preview_css?: string | null
          prompt?: string
          send_style_image?: boolean
          sort_order?: number
          style_image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_filters_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ai_filter_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_images: {
        Row: {
          created_at: string
          id: string
          image_size: string
          image_urls: string[]
          output_format: string
          prompt: string
          safety_tolerance: number
          seed: number | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_size?: string
          image_urls?: string[]
          output_format?: string
          prompt: string
          safety_tolerance?: number
          seed?: number | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          image_size?: string
          image_urls?: string[]
          output_format?: string
          prompt?: string
          safety_tolerance?: number
          seed?: number | null
          url?: string
        }
        Relationships: []
      }
      coin_packages: {
        Row: {
          active: boolean
          badge: string | null
          coins: number
          created_at: string
          id: string
          price_cents: number
          sort_order: number
        }
        Insert: {
          active?: boolean
          badge?: string | null
          coins: number
          created_at?: string
          id?: string
          price_cents: number
          sort_order?: number
        }
        Update: {
          active?: boolean
          badge?: string | null
          coins?: number
          created_at?: string
          id?: string
          price_cents?: number
          sort_order?: number
        }
        Relationships: []
      }
      coin_settings: {
        Row: {
          description: string | null
          key: string
          value: number
        }
        Insert: {
          description?: string | null
          key: string
          value: number
        }
        Update: {
          description?: string | null
          key?: string
          value?: number
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          expires_at: string
          id: string
          stripe_session_id: string | null
          type: Database["public"]["Enums"]["coin_transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          expires_at: string
          id?: string
          stripe_session_id?: string | null
          type: Database["public"]["Enums"]["coin_transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          stripe_session_id?: string | null
          type?: Database["public"]["Enums"]["coin_transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      collection_designs: {
        Row: {
          active: boolean
          collection_id: string
          created_at: string
          id: string
          image_url: string
          name: string
          price_cents: number
          slug: string
          sort_order: number
          stripe_price_id: string | null
          stripe_product_id: string | null
        }
        Insert: {
          active?: boolean
          collection_id: string
          created_at?: string
          id?: string
          image_url: string
          name: string
          price_cents: number
          slug: string
          sort_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Update: {
          active?: boolean
          collection_id?: string
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_designs_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          active: boolean
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          active: boolean
          answer: string
          category: string
          created_at: string
          featured: boolean
          id: string
          kb_article_id: string | null
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          kb_article_id?: string | null
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          kb_article_id?: string | null
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_kb_article_id_fkey"
            columns: ["kb_article_id"]
            isOneToOne: false
            referencedRelation: "kb_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          active: boolean
          created_at: string
          gallery_id: string
          id: string
          label: string
          sort_order: number
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          gallery_id: string
          id?: string
          label?: string
          sort_order?: number
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          gallery_id?: string
          id?: string
          label?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "image_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      image_galleries: {
        Row: {
          active: boolean
          cover_image: string | null
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          cover_image?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          cover_image?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          active: boolean
          caption: string | null
          created_at: string
          id: string
          post_url: string
          sort_order: number
          thumbnail_url: string | null
        }
        Insert: {
          active?: boolean
          caption?: string | null
          created_at?: string
          id?: string
          post_url: string
          sort_order?: number
          thumbnail_url?: string | null
        }
        Update: {
          active?: boolean
          caption?: string | null
          created_at?: string
          id?: string
          post_url?: string
          sort_order?: number
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      kb_articles: {
        Row: {
          active: boolean
          category_id: string
          content: string
          created_at: string
          id: string
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id: string
          content?: string
          created_at?: string
          id?: string
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "kb_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      model_requests: {
        Row: {
          created_at: string
          id: string
          model_name: string
          phone: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          model_name: string
          phone: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          model_name?: string
          phone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address_id: string | null
          created_at: string
          customization_data: Json | null
          design_id: string | null
          id: string
          product_id: string
          rejection_reason: string | null
          shipping_address: Json | null
          shipping_cents: number | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_session_id: string | null
          total_cents: number
          tracking_code: string | null
          user_id: string
        }
        Insert: {
          address_id?: string | null
          created_at?: string
          customization_data?: Json | null
          design_id?: string | null
          id?: string
          product_id: string
          rejection_reason?: string | null
          shipping_address?: Json | null
          shipping_cents?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          total_cents: number
          tracking_code?: string | null
          user_id: string
        }
        Update: {
          address_id?: string | null
          created_at?: string
          customization_data?: Json | null
          design_id?: string | null
          id?: string
          product_id?: string
          rejection_reason?: string | null
          shipping_address?: Json | null
          shipping_cents?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          total_cents?: number
          tracking_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "collection_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_checkouts: {
        Row: {
          created_at: string
          customization_data: Json
          edited_image_path: string | null
          id: string
          original_image_path: string | null
          product_id: string
          raw_image_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customization_data: Json
          edited_image_path?: string | null
          id?: string
          original_image_path?: string | null
          product_id: string
          raw_image_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customization_data?: Json
          edited_image_path?: string | null
          id?: string
          original_image_path?: string | null
          product_id?: string
          raw_image_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_gallery_images: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          sort_order: number
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          colors: Json | null
          created_at: string | null
          description: string | null
          device_image: string | null
          id: string
          images: string[] | null
          name: string
          price_cents: number
          rating: number | null
          review_count: number | null
          slug: string
          specs: Json | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          colors?: Json | null
          created_at?: string | null
          description?: string | null
          device_image?: string | null
          id?: string
          images?: string[] | null
          name: string
          price_cents: number
          rating?: number | null
          review_count?: number | null
          slug: string
          specs?: Json | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          colors?: Json | null
          created_at?: string | null
          description?: string | null
          device_image?: string | null
          id?: string
          images?: string[] | null
          name?: string
          price_cents?: number
          rating?: number | null
          review_count?: number | null
          slug?: string
          specs?: Json | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          referral_code: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          referral_code?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          referral_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          active: boolean
          address: string
          created_at: string
          id: string
          instagram_url: string | null
          lat: number
          lng: number
          name: string
          slug: string | null
          sort_order: number
          state: string
          state_label: string
        }
        Insert: {
          active?: boolean
          address: string
          created_at?: string
          id?: string
          instagram_url?: string | null
          lat: number
          lng: number
          name: string
          slug?: string | null
          sort_order?: number
          state: string
          state_label: string
        }
        Update: {
          active?: boolean
          address?: string
          created_at?: string
          id?: string
          instagram_url?: string | null
          lat?: number
          lng?: number
          name?: string
          slug?: string | null
          sort_order?: number
          state?: string
          state_label?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_ai_generations: {
        Row: {
          created_at: string
          filter_id: string | null
          filter_name: string | null
          generation_type: string
          id: string
          image_url: string
          public: boolean
          public_image_url: string | null
          session_id: string | null
          source_image_url: string | null
          step_number: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_id?: string | null
          filter_name?: string | null
          generation_type?: string
          id?: string
          image_url: string
          public?: boolean
          public_image_url?: string | null
          session_id?: string | null
          source_image_url?: string | null
          step_number?: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_id?: string | null
          filter_name?: string | null
          generation_type?: string
          id?: string
          image_url?: string
          public?: boolean
          public_image_url?: string | null
          session_id?: string | null
          source_image_url?: string | null
          step_number?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_generations_filter_id_fkey"
            columns: ["filter_id"]
            isOneToOne: false
            referencedRelation: "ai_filters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_referral_code: { Args: never; Returns: string }
      get_coin_balance: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      coin_transaction_type:
        | "signup_bonus"
        | "referral_bonus"
        | "purchase_bonus"
        | "coin_purchase"
        | "ai_usage"
        | "admin_adjustment"
      order_status:
        | "pending"
        | "paid"
        | "analyzing"
        | "rejected"
        | "customizing"
        | "producing"
        | "shipped"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "user"],
      coin_transaction_type: [
        "signup_bonus",
        "referral_bonus",
        "purchase_bonus",
        "coin_purchase",
        "ai_usage",
        "admin_adjustment",
      ],
      order_status: [
        "pending",
        "paid",
        "analyzing",
        "rejected",
        "customizing",
        "producing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
