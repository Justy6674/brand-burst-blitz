export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          created_at: string
          id: string
          last_changed_at: string
          password_hash: string
          salt: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_changed_at?: string
          password_hash: string
          salt: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_changed_at?: string
          password_hash?: string
          salt?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          collected_at: string | null
          id: string
          metrics: Json
          platform: Database["public"]["Enums"]["social_platform"] | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          collected_at?: string | null
          id?: string
          metrics: Json
          platform?: Database["public"]["Enums"]["social_platform"] | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          collected_at?: string | null
          id?: string
          metrics?: Json
          platform?: Database["public"]["Enums"]["social_platform"] | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          actions: Json
          business_id: string | null
          conditions: Json
          created_at: string | null
          event_type: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json
          business_id?: string | null
          conditions?: Json
          created_at?: string | null
          event_type?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          business_id?: string | null
          conditions?: Json
          created_at?: string | null
          event_type?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_customizations: {
        Row: {
          branding: Json
          business_id: string
          color_scheme: Json
          created_at: string
          id: string
          image_settings: Json
          layout_style: string
          post_display: Json
          seo_settings: Json
          typography: Json
          updated_at: string
        }
        Insert: {
          branding?: Json
          business_id: string
          color_scheme?: Json
          created_at?: string
          id?: string
          image_settings?: Json
          layout_style?: string
          post_display?: Json
          seo_settings?: Json
          typography?: Json
          updated_at?: string
        }
        Update: {
          branding?: Json
          business_id?: string
          color_scheme?: Json
          created_at?: string
          id?: string
          image_settings?: Json
          layout_style?: string
          post_display?: Json
          seo_settings?: Json
          typography?: Json
          updated_at?: string
        }
        Relationships: []
      }
      blog_images: {
        Row: {
          alt_text: string | null
          business_id: string
          created_at: string
          dimensions: Json
          filename: string
          folder: string | null
          id: string
          size: number
          tags: string[] | null
          updated_at: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          business_id: string
          created_at?: string
          dimensions: Json
          filename: string
          folder?: string | null
          id?: string
          size: number
          tags?: string[] | null
          updated_at?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          business_id?: string
          created_at?: string
          dimensions?: Json
          filename?: string
          folder?: string | null
          id?: string
          size?: number
          tags?: string[] | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          id: string
          meta_description: string | null
          published: boolean | null
          scheduled_publish_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published?: boolean | null
          scheduled_publish_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published?: boolean | null
          scheduled_publish_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_templates: {
        Row: {
          business_id: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          template_data: Json
          updated_at: string
          usage_count: number
        }
        Insert: {
          business_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          template_data: Json
          updated_at?: string
          usage_count?: number
        }
        Update: {
          business_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          template_data?: Json
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          blog_integrations: Json | null
          brand_colors: Json | null
          business_name: string
          compliance_settings: Json | null
          created_at: string | null
          default_ai_tone: Database["public"]["Enums"]["ai_tone"] | null
          favicon_url: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          is_primary: boolean | null
          logo_url: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          blog_integrations?: Json | null
          brand_colors?: Json | null
          business_name: string
          compliance_settings?: Json | null
          created_at?: string | null
          default_ai_tone?: Database["public"]["Enums"]["ai_tone"] | null
          favicon_url?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          is_primary?: boolean | null
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          blog_integrations?: Json | null
          brand_colors?: Json | null
          business_name?: string
          compliance_settings?: Json | null
          created_at?: string | null
          default_ai_tone?: Database["public"]["Enums"]["ai_tone"] | null
          favicon_url?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          is_primary?: boolean | null
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      business_questionnaire_responses: {
        Row: {
          ai_insights: Json | null
          business_profile_id: string | null
          completion_score: number | null
          completion_status: string | null
          created_at: string
          id: string
          questionnaire_version: number
          responses: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insights?: Json | null
          business_profile_id?: string | null
          completion_score?: number | null
          completion_status?: string | null
          created_at?: string
          id?: string
          questionnaire_version?: number
          responses: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insights?: Json | null
          business_profile_id?: string | null
          completion_score?: number | null
          completion_status?: string | null
          created_at?: string
          id?: string
          questionnaire_version?: number
          responses?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_questionnaire_responses_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_event_attendees: {
        Row: {
          created_at: string | null
          email: string
          event_id: string
          id: string
          name: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          attachments: Json | null
          attendees: Json | null
          business_profile_id: string | null
          color: string | null
          content_tags: string[] | null
          created_at: string | null
          description: string | null
          end_datetime: string
          event_type: string
          id: string
          idea_id: string | null
          is_recurring: boolean | null
          location: string | null
          metadata: Json | null
          notifications: Json | null
          parent_event_id: string | null
          priority: number | null
          recurrence_rule: Json | null
          start_datetime: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          attachments?: Json | null
          attendees?: Json | null
          business_profile_id?: string | null
          color?: string | null
          content_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          end_datetime: string
          event_type?: string
          id?: string
          idea_id?: string | null
          is_recurring?: boolean | null
          location?: string | null
          metadata?: Json | null
          notifications?: Json | null
          parent_event_id?: string | null
          priority?: number | null
          recurrence_rule?: Json | null
          start_datetime: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          attachments?: Json | null
          attendees?: Json | null
          business_profile_id?: string | null
          color?: string | null
          content_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string
          event_type?: string
          id?: string
          idea_id?: string | null
          is_recurring?: boolean | null
          location?: string | null
          metadata?: Json | null
          notifications?: Json | null
          parent_event_id?: string | null
          priority?: number | null
          recurrence_rule?: Json | null
          start_datetime?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          business_profile_id: string | null
          created_at: string | null
          external_calendar_id: string
          id: string
          integration_type: string
          last_sync_at: string | null
          refresh_token: string | null
          sync_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          external_calendar_id: string
          id?: string
          integration_type: string
          last_sync_at?: string | null
          refresh_token?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          external_calendar_id?: string
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_analysis_results: {
        Row: {
          analysis_results: Json
          analysis_type: string
          business_profile_id: string | null
          competitor_id: string
          confidence_score: number | null
          created_at: string
          id: string
          processing_time_ms: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_results: Json
          analysis_type: string
          business_profile_id?: string | null
          competitor_id: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          processing_time_ms?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json
          analysis_type?: string
          business_profile_id?: string | null
          competitor_id?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          processing_time_ms?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitive_analysis_results_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_analysis_results_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitor_data"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_insights: {
        Row: {
          business_profile_id: string | null
          created_at: string | null
          data_points: Json | null
          description: string | null
          id: string
          insight_type: string
          is_actionable: boolean | null
          priority_score: number | null
          recommendations: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_profile_id?: string | null
          created_at?: string | null
          data_points?: Json | null
          description?: string | null
          id?: string
          insight_type: string
          is_actionable?: boolean | null
          priority_score?: number | null
          recommendations?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_profile_id?: string | null
          created_at?: string | null
          data_points?: Json | null
          description?: string | null
          id?: string
          insight_type?: string
          is_actionable?: boolean | null
          priority_score?: number | null
          recommendations?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitive_insights_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_content: {
        Row: {
          collected_at: string | null
          competitor_id: string
          content_text: string | null
          content_type: string
          content_url: string | null
          created_at: string | null
          engagement_metrics: Json | null
          id: string
          image_urls: string[] | null
          platform: string
          post_date: string | null
          sentiment_score: number | null
          topics: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          collected_at?: string | null
          competitor_id: string
          content_text?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          image_urls?: string[] | null
          platform: string
          post_date?: string | null
          sentiment_score?: number | null
          topics?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          collected_at?: string | null
          competitor_id?: string
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          image_urls?: string[] | null
          platform?: string
          post_date?: string | null
          sentiment_score?: number | null
          topics?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_content_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitor_data"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_data: {
        Row: {
          analysis_frequency: string | null
          business_profile_id: string | null
          competitor_description: string | null
          competitor_name: string
          competitor_url: string | null
          created_at: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          last_analyzed_at: string | null
          social_platforms: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_frequency?: string | null
          business_profile_id?: string | null
          competitor_description?: string | null
          competitor_name: string
          competitor_url?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          last_analyzed_at?: string | null
          social_platforms?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_frequency?: string | null
          business_profile_id?: string | null
          competitor_description?: string | null
          competitor_name?: string
          competitor_url?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          last_analyzed_at?: string | null
          social_platforms?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_data_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_logs: {
        Row: {
          action: string
          compliance_check_results: Json | null
          content_preview: string | null
          created_at: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          compliance_check_results?: Json | null
          content_preview?: string | null
          created_at?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          compliance_check_results?: Json | null
          content_preview?: string | null
          created_at?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          ai_prompt_template: string | null
          business_profile_id: string | null
          created_at: string | null
          default_tone: Database["public"]["Enums"]["ai_tone"] | null
          id: string
          is_public: boolean | null
          name: string
          tags: string[] | null
          template_content: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          ai_prompt_template?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          default_tone?: Database["public"]["Enums"]["ai_tone"] | null
          id?: string
          is_public?: boolean | null
          name: string
          tags?: string[] | null
          template_content: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          ai_prompt_template?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          default_tone?: Database["public"]["Enums"]["ai_tone"] | null
          id?: string
          is_public?: boolean | null
          name?: string
          tags?: string[] | null
          template_content?: string
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_templates_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string
          error_type: string
          function_name: string | null
          id: string
          request_data: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          error_type: string
          function_name?: string | null
          id?: string
          request_data?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          error_type?: string
          function_name?: string | null
          id?: string
          request_data?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      external_calendar_integrations: {
        Row: {
          access_token: string | null
          business_id: string | null
          created_at: string | null
          expires_at: string | null
          external_calendar_id: string
          id: string
          integration_type: string
          last_sync_at: string | null
          refresh_token: string | null
          sync_direction: string | null
          sync_enabled: boolean | null
          sync_error_message: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          business_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          external_calendar_id: string
          id?: string
          integration_type: string
          last_sync_at?: string | null
          refresh_token?: string | null
          sync_direction?: string | null
          sync_enabled?: boolean | null
          sync_error_message?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          business_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          external_calendar_id?: string
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          sync_direction?: string | null
          sync_enabled?: boolean | null
          sync_error_message?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendar_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      healthcare_professionals: {
        Row: {
          ahpra_registration: string | null
          compliance_training_completed: boolean | null
          created_at: string | null
          email: string
          id: string
          practice_type: string | null
          profession_type: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          ahpra_registration?: string | null
          compliance_training_completed?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          practice_type?: string | null
          profession_type?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          ahpra_registration?: string | null
          compliance_training_completed?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          practice_type?: string | null
          profession_type?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      ideas: {
        Row: {
          ai_analysis: Json
          business_profile_id: string | null
          content_generated: Json
          created_at: string
          id: string
          metadata: Json | null
          original_text: string
          priority: number | null
          source_type: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json
          business_profile_id?: string | null
          content_generated?: Json
          created_at?: string
          id?: string
          metadata?: Json | null
          original_text: string
          priority?: number | null
          source_type?: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json
          business_profile_id?: string | null
          content_generated?: Json
          created_at?: string
          id?: string
          metadata?: Json | null
          original_text?: string
          priority?: number | null
          source_type?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          alt_text: string | null
          business_profile_id: string | null
          created_at: string | null
          dimensions: Json | null
          file_size: number | null
          filename: string | null
          id: string
          is_logo: boolean | null
          is_public: boolean | null
          tags: string[] | null
          url: string
          user_id: string | null
        }
        Insert: {
          alt_text?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          filename?: string | null
          id?: string
          is_logo?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          url: string
          user_id?: string | null
        }
        Update: {
          alt_text?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          filename?: string | null
          id?: string
          is_logo?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "images_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_registrations: {
        Row: {
          additional_notes: string | null
          business_name: string
          created_at: string
          current_challenges: string[] | null
          email: string
          heard_about_us: string | null
          id: string
          industry: string | null
          is_australian: boolean
          monthly_marketing_spend: string | null
          name: string
          primary_goals: string[] | null
          team_size: string | null
          updated_at: string
          wants_updates: boolean | null
        }
        Insert: {
          additional_notes?: string | null
          business_name: string
          created_at?: string
          current_challenges?: string[] | null
          email: string
          heard_about_us?: string | null
          id?: string
          industry?: string | null
          is_australian?: boolean
          monthly_marketing_spend?: string | null
          name: string
          primary_goals?: string[] | null
          team_size?: string | null
          updated_at?: string
          wants_updates?: boolean | null
        }
        Update: {
          additional_notes?: string | null
          business_name?: string
          created_at?: string
          current_challenges?: string[] | null
          email?: string
          heard_about_us?: string | null
          id?: string
          industry?: string | null
          is_australian?: boolean
          monthly_marketing_spend?: string | null
          name?: string
          primary_goals?: string[] | null
          team_size?: string | null
          updated_at?: string
          wants_updates?: boolean | null
        }
        Relationships: []
      }
      multi_site_publishing: {
        Row: {
          business_profile_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          integration_id: string | null
          platform_name: string
          platform_post_id: string | null
          post_id: string | null
          publish_status: string
          published_at: string | null
          published_url: string | null
          scheduled_for: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_profile_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          platform_name: string
          platform_post_id?: string | null
          post_id?: string | null
          publish_status?: string
          published_at?: string | null
          published_url?: string | null
          scheduled_for?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_profile_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          platform_name?: string
          platform_post_id?: string | null
          post_id?: string | null
          publish_status?: string
          published_at?: string | null
          published_url?: string | null
          scheduled_for?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "multi_site_publishing_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multi_site_publishing_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "website_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multi_site_publishing_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      name_scout_requests: {
        Row: {
          ai_summary: string | null
          amount_paid: number
          asic_availability: Json | null
          assigned_to: string | null
          business_profile_id: string | null
          completed_at: string | null
          created_at: string
          domain_availability: Json | null
          domain_extensions: string[]
          id: string
          include_trademark_screening: boolean
          payment_status: string
          request_status: string
          requested_at: string
          requested_name: string
          started_at: string | null
          stripe_payment_intent_id: string | null
          trademark_results: Json | null
          trademark_screening_paid: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          amount_paid: number
          asic_availability?: Json | null
          assigned_to?: string | null
          business_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          domain_availability?: Json | null
          domain_extensions?: string[]
          id?: string
          include_trademark_screening?: boolean
          payment_status?: string
          request_status?: string
          requested_at?: string
          requested_name: string
          started_at?: string | null
          stripe_payment_intent_id?: string | null
          trademark_results?: Json | null
          trademark_screening_paid?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          amount_paid?: number
          asic_availability?: Json | null
          assigned_to?: string | null
          business_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          domain_availability?: Json | null
          domain_extensions?: string[]
          id?: string
          include_trademark_screening?: boolean
          payment_status?: string
          request_status?: string
          requested_at?: string
          requested_name?: string
          started_at?: string | null
          stripe_payment_intent_id?: string | null
          trademark_results?: Json | null
          trademark_screening_paid?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "name_scout_requests_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          business_id: string | null
          created_at: string | null
          daily_digest: boolean | null
          email_notifications: boolean | null
          event_reminders: boolean | null
          id: string
          inactivity_alerts: boolean | null
          inactivity_threshold_days: number | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          daily_digest?: boolean | null
          email_notifications?: boolean | null
          event_reminders?: boolean | null
          id?: string
          inactivity_alerts?: boolean | null
          inactivity_threshold_days?: number | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          daily_digest?: boolean | null
          email_notifications?: boolean | null
          event_reminders?: boolean | null
          id?: string
          inactivity_alerts?: boolean | null
          inactivity_threshold_days?: number | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          error_message: string | null
          event_id: string | null
          id: string
          last_attempt_at: string | null
          message_data: Json
          notification_type: string
          scheduled_for: string
          status: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          last_attempt_at?: string | null
          message_data?: Json
          notification_type: string
          scheduled_for: string
          status?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          last_attempt_at?: string | null
          message_data?: Json
          notification_type?: string
          scheduled_for?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          code_verifier: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          platform: string
          redirect_uri: string | null
          state_token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          code_verifier?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform: string
          redirect_uri?: string | null
          state_token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform?: string
          redirect_uri?: string | null
          state_token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          ai_prompt: string | null
          ai_tone: Database["public"]["Enums"]["ai_tone"] | null
          business_profile_id: string | null
          content: string | null
          created_at: string | null
          engagement_data: Json | null
          excerpt: string | null
          id: string
          image_urls: string[] | null
          metadata: Json | null
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          tags: string[] | null
          target_platforms:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          title: string | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_prompt?: string | null
          ai_tone?: Database["public"]["Enums"]["ai_tone"] | null
          business_profile_id?: string | null
          content?: string | null
          created_at?: string | null
          engagement_data?: Json | null
          excerpt?: string | null
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          target_platforms?:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          title?: string | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_prompt?: string | null
          ai_tone?: Database["public"]["Enums"]["ai_tone"] | null
          business_profile_id?: string | null
          content?: string | null
          created_at?: string | null
          engagement_data?: Json | null
          excerpt?: string | null
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          target_platforms?:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          title?: string | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          platform: string | null
          prompt_text: string
          type: string
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          platform?: string | null
          prompt_text: string
          type: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          platform?: string | null
          prompt_text?: string
          type?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
          version?: number | null
        }
        Relationships: []
      }
      publishing_queue: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          id: string
          last_error: string | null
          post_id: string | null
          published_post_id: string | null
          scheduled_for: string
          social_account_id: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          updated_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          post_id?: string | null
          published_post_id?: string | null
          scheduled_for: string
          social_account_id?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          updated_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          post_id?: string | null
          published_post_id?: string | null
          scheduled_for?: string
          social_account_id?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publishing_queue_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publishing_queue_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      publishing_queue_status: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          platform_response: Json | null
          processed_at: string | null
          published_url: string | null
          queue_item_id: string
          retry_count: number | null
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          platform_response?: Json | null
          processed_at?: string | null
          published_url?: string | null
          queue_item_id: string
          retry_count?: number | null
          status?: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          platform_response?: Json | null
          processed_at?: string | null
          published_url?: string | null
          queue_item_id?: string
          retry_count?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "publishing_queue_status_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "publishing_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string
          account_avatar: string | null
          account_id: string
          account_name: string | null
          account_username: string | null
          business_profile_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          oauth_refresh_token: string | null
          oauth_scope: string | null
          page_id: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          refresh_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          account_avatar?: string | null
          account_id: string
          account_name?: string | null
          account_username?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          oauth_refresh_token?: string | null
          oauth_scope?: string | null
          page_id?: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          account_avatar?: string | null
          account_id?: string
          account_name?: string | null
          account_username?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          oauth_refresh_token?: string | null
          oauth_scope?: string | null
          page_id?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      social_setup_services: {
        Row: {
          abn: string
          amount_paid: number | null
          assigned_to: string | null
          business_address: Json | null
          business_profile_id: string | null
          completed_at: string | null
          completion_notes: string | null
          connected_accounts: Json | null
          created_at: string | null
          domain_verified: boolean | null
          id: string
          qa_approved_at: string | null
          qa_approved_by: string | null
          qa_checklist: Json | null
          requested_at: string | null
          started_at: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          abn: string
          amount_paid?: number | null
          assigned_to?: string | null
          business_address?: Json | null
          business_profile_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          connected_accounts?: Json | null
          created_at?: string | null
          domain_verified?: boolean | null
          id?: string
          qa_approved_at?: string | null
          qa_approved_by?: string | null
          qa_checklist?: Json | null
          requested_at?: string | null
          started_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          abn?: string
          amount_paid?: number | null
          assigned_to?: string | null
          business_address?: Json | null
          business_profile_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          connected_accounts?: Json | null
          created_at?: string | null
          domain_verified?: boolean | null
          id?: string
          qa_approved_at?: string | null
          qa_approved_by?: string | null
          qa_checklist?: Json | null
          requested_at?: string | null
          started_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_setup_services_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_content_recommendations: {
        Row: {
          business_profile_id: string | null
          created_at: string
          data_sources: Json | null
          description: string
          expected_impact: string | null
          id: string
          implementation_effort: string | null
          implemented_at: string | null
          metadata: Json | null
          priority_score: number | null
          recommendation_type: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_profile_id?: string | null
          created_at?: string
          data_sources?: Json | null
          description: string
          expected_impact?: string | null
          id?: string
          implementation_effort?: string | null
          implemented_at?: string | null
          metadata?: Json | null
          priority_score?: number | null
          recommendation_type: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_profile_id?: string | null
          created_at?: string
          data_sources?: Json | null
          description?: string
          expected_impact?: string | null
          id?: string
          implementation_effort?: string | null
          implemented_at?: string | null
          metadata?: Json | null
          priority_score?: number | null
          recommendation_type?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_content_recommendations_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_social_credentials: {
        Row: {
          app_id: string
          app_secret: string
          created_at: string
          id: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_id: string
          app_secret: string
          created_at?: string
          id?: string
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_id?: string
          app_secret?: string
          created_at?: string
          id?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          trial_posts_used: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          trial_posts_used?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          trial_posts_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          business_name: string | null
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      website_integrations: {
        Row: {
          business_id: string | null
          business_profile_id: string | null
          configuration: Json
          created_at: string | null
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          business_profile_id?: string | null
          configuration?: Json
          created_at?: string | null
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          business_profile_id?: string | null
          configuration?: Json
          created_at?: string | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_integrations_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_questionnaire_score: {
        Args: { responses: Json }
        Returns: number
      }
      create_admin_session: {
        Args: {
          admin_user_id: string
          ip_addr?: string
          user_agent_str?: string
        }
        Returns: string
      }
      generate_questionnaire_insights: {
        Args: { user_id_param: string; responses_param: Json }
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      increment_prompt_usage: {
        Args: { prompt_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      validate_admin_session: {
        Args: { token: string }
        Returns: boolean
      }
      verify_admin_password: {
        Args: { input_password: string }
        Returns: {
          is_valid: boolean
          user_id: string
        }[]
      }
    }
    Enums: {
      ai_tone:
        | "professional"
        | "friendly"
        | "casual"
        | "authoritative"
        | "empathetic"
        | "exciting"
      healthcare_practice_type:
        | "general_practice"
        | "specialist_clinic"
        | "hospital"
        | "allied_health"
        | "dental"
        | "mental_health"
      healthcare_profession_type:
        | "gp"
        | "specialist"
        | "nurse"
        | "allied_health"
        | "dentist"
        | "psychologist"
        | "other"
      industry_type:
        | "health"
        | "finance"
        | "legal"
        | "general"
        | "fitness"
        | "beauty"
        | "tech"
      post_status: "draft" | "scheduled" | "published" | "failed"
      post_type: "blog" | "social" | "ad"
      social_platform: "facebook" | "instagram" | "linkedin" | "twitter"
      user_role: "admin" | "subscriber" | "trial"
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
      ai_tone: [
        "professional",
        "friendly",
        "casual",
        "authoritative",
        "empathetic",
        "exciting",
      ],
      healthcare_practice_type: [
        "general_practice",
        "specialist_clinic",
        "hospital",
        "allied_health",
        "dental",
        "mental_health",
      ],
      healthcare_profession_type: [
        "gp",
        "specialist",
        "nurse",
        "allied_health",
        "dentist",
        "psychologist",
        "other",
      ],
      industry_type: [
        "health",
        "finance",
        "legal",
        "general",
        "fitness",
        "beauty",
        "tech",
      ],
      post_status: ["draft", "scheduled", "published", "failed"],
      post_type: ["blog", "social", "ad"],
      social_platform: ["facebook", "instagram", "linkedin", "twitter"],
      user_role: ["admin", "subscriber", "trial"],
    },
  },
} as const
