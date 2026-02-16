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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_health_indicators: {
        Row: {
          check_date: string
          content_originality_score: number | null
          created_at: string
          engagement_authenticity_score: number | null
          follower_authenticity_score: number | null
          growth_consistency_score: number | null
          id: string
          linked_account_id: string
          overall_health_score: number | null
          suspicious_indicators: Json | null
          verified_at: string | null
        }
        Insert: {
          check_date: string
          content_originality_score?: number | null
          created_at?: string
          engagement_authenticity_score?: number | null
          follower_authenticity_score?: number | null
          growth_consistency_score?: number | null
          id?: string
          linked_account_id: string
          overall_health_score?: number | null
          suspicious_indicators?: Json | null
          verified_at?: string | null
        }
        Update: {
          check_date?: string
          content_originality_score?: number | null
          created_at?: string
          engagement_authenticity_score?: number | null
          follower_authenticity_score?: number | null
          growth_consistency_score?: number | null
          id?: string
          linked_account_id?: string
          overall_health_score?: number | null
          suspicious_indicators?: Json | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_health_indicators_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "linked_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brand_fit_data: {
        Row: {
          alcohol_openness: string | null
          audience_type: string | null
          avoided_topics: string | null
          brand_categories: string[] | null
          camera_comfort: string | null
          collaboration_type: string | null
          content_styles: string[] | null
          created_at: string
          creative_control: string | null
          driving_comfort: string | null
          id: string
          personal_assets: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alcohol_openness?: string | null
          audience_type?: string | null
          avoided_topics?: string | null
          brand_categories?: string[] | null
          camera_comfort?: string | null
          collaboration_type?: string | null
          content_styles?: string[] | null
          created_at?: string
          creative_control?: string | null
          driving_comfort?: string | null
          id?: string
          personal_assets?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alcohol_openness?: string | null
          audience_type?: string | null
          avoided_topics?: string | null
          brand_categories?: string[] | null
          camera_comfort?: string | null
          collaboration_type?: string | null
          content_styles?: string[] | null
          created_at?: string
          creative_control?: string | null
          driving_comfort?: string | null
          id?: string
          personal_assets?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_memberships: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          is_default: boolean
          role: Database["public"]["Enums"]["brand_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          role: Database["public"]["Enums"]["brand_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          role?: Database["public"]["Enums"]["brand_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "admin_brands_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          company_name: string
          company_size: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          industry: string | null
          logo_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      brand_user_roles: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["brand_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["brand_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["brand_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "admin_brands_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_wallets: {
        Row: {
          balance: number
          brand_user_id: string
          created_at: string
          currency: string
          id: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          balance?: number
          brand_user_id: string
          created_at?: string
          currency?: string
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number
          brand_user_id?: string
          created_at?: string
          currency?: string
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      campaign_assets: {
        Row: {
          asset_category: string
          campaign_id: string
          created_at: string
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          asset_category?: string
          campaign_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          asset_category?: string
          campaign_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_budget_reservations: {
        Row: {
          campaign_id: string
          created_at: string
          creator_user_id: string
          held_at: string
          id: string
          invitation_id: string
          released_at: string | null
          released_reason: string | null
          reservation_status: string
          reserved_amount: number
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creator_user_id: string
          held_at?: string
          id?: string
          invitation_id: string
          released_at?: string | null
          released_reason?: string | null
          reservation_status?: string
          reserved_amount: number
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creator_user_id?: string
          held_at?: string
          id?: string
          invitation_id?: string
          released_at?: string | null
          released_reason?: string | null
          reservation_status?: string
          reserved_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_budget_reservations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_budget_reservations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_budget_reservations_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: true
            referencedRelation: "campaign_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_content_tracking: {
        Row: {
          campaign_id: string
          clicks: number | null
          content_post_id: string | null
          content_type: string
          conversions: number | null
          created_at: string
          creator_user_id: string
          detected_at: string | null
          detection_method: string | null
          engagement: number | null
          id: string
          impressions: number | null
          platform: string
          revenue_attributed: number | null
          status: string | null
          tracking_link_id: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          content_post_id?: string | null
          content_type: string
          conversions?: number | null
          created_at?: string
          creator_user_id: string
          detected_at?: string | null
          detection_method?: string | null
          engagement?: number | null
          id?: string
          impressions?: number | null
          platform: string
          revenue_attributed?: number | null
          status?: string | null
          tracking_link_id?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          content_post_id?: string | null
          content_type?: string
          conversions?: number | null
          created_at?: string
          creator_user_id?: string
          detected_at?: string | null
          detection_method?: string | null
          engagement?: number | null
          id?: string
          impressions?: number | null
          platform?: string
          revenue_attributed?: number | null
          status?: string | null
          tracking_link_id?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_content_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_content_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_content_tracking_content_post_id_fkey"
            columns: ["content_post_id"]
            isOneToOne: false
            referencedRelation: "platform_content_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_content_tracking_tracking_link_id_fkey"
            columns: ["tracking_link_id"]
            isOneToOne: false
            referencedRelation: "creator_tracking_links"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_creator_scores: {
        Row: {
          calculated_at: string
          calculation_version: string
          campaign_id: string
          creator_user_id: string
          dimension_scores: Json
          id: string
          overall_score: number
        }
        Insert: {
          calculated_at?: string
          calculation_version?: string
          campaign_id: string
          creator_user_id: string
          dimension_scores?: Json
          id?: string
          overall_score: number
        }
        Update: {
          calculated_at?: string
          calculation_version?: string
          campaign_id?: string
          creator_user_id?: string
          dimension_scores?: Json
          id?: string
          overall_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_creator_scores_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creator_scores_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_cta_links: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          label: string
          original_url: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          label: string
          original_url: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          label?: string
          original_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_cta_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_cta_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_deliverables: {
        Row: {
          campaign_id: string
          created_at: string
          deliverable_index: number
          deliverable_type: string
          description: string | null
          id: string
          required_by: string | null
          title: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          deliverable_index?: number
          deliverable_type: string
          description?: string | null
          id?: string
          required_by?: string | null
          title: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          deliverable_index?: number
          deliverable_type?: string
          description?: string | null
          id?: string
          required_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_history: {
        Row: {
          avg_response_time: number | null
          created_at: string
          id: string
          last_campaign_date: string | null
          on_time_deliveries: number | null
          revisions_requested: number | null
          total_completed: number | null
          total_earnings: number | null
          total_started: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_response_time?: number | null
          created_at?: string
          id?: string
          last_campaign_date?: string | null
          on_time_deliveries?: number | null
          revisions_requested?: number | null
          total_completed?: number | null
          total_earnings?: number | null
          total_started?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_response_time?: number | null
          created_at?: string
          id?: string
          last_campaign_date?: string | null
          on_time_deliveries?: number | null
          revisions_requested?: number | null
          total_completed?: number | null
          total_earnings?: number | null
          total_started?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_invitations: {
        Row: {
          base_payout: number
          campaign_id: string
          created_at: string
          creator_user_id: string
          deliverables: Json | null
          id: string
          negotiated_delta: number | null
          offered_payout: number
          responded_at: string | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          timeline_end: string | null
          timeline_start: string | null
          updated_at: string
        }
        Insert: {
          base_payout: number
          campaign_id: string
          created_at?: string
          creator_user_id: string
          deliverables?: Json | null
          id?: string
          negotiated_delta?: number | null
          offered_payout: number
          responded_at?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          timeline_end?: string | null
          timeline_start?: string | null
          updated_at?: string
        }
        Update: {
          base_payout?: number
          campaign_id?: string
          created_at?: string
          creator_user_id?: string
          deliverables?: Json | null
          id?: string
          negotiated_delta?: number | null
          offered_payout?: number
          responded_at?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          timeline_end?: string | null
          timeline_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_invitations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_invitations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_manager_assignments: {
        Row: {
          assigned_by: string
          campaign_id: string
          created_at: string
          id: string
          permission_level: Database["public"]["Enums"]["campaign_permission_level"]
          user_id: string
        }
        Insert: {
          assigned_by: string
          campaign_id: string
          created_at?: string
          id?: string
          permission_level?: Database["public"]["Enums"]["campaign_permission_level"]
          user_id: string
        }
        Update: {
          assigned_by?: string
          campaign_id?: string
          created_at?: string
          id?: string
          permission_level?: Database["public"]["Enums"]["campaign_permission_level"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_manager_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_manager_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_messages: {
        Row: {
          campaign_id: string
          content: string
          created_at: string
          delivered_at: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          sender_role: string
          sender_user_id: string
          status: Database["public"]["Enums"]["message_status"]
          updated_at: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_role: string
          sender_user_id: string
          status?: Database["public"]["Enums"]["message_status"]
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_role?: string
          sender_user_id?: string
          status?: Database["public"]["Enums"]["message_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_negotiations: {
        Row: {
          created_at: string
          id: string
          invitation_id: string
          message: string | null
          proposed_by: string
          proposed_deliverables: Json | null
          proposed_payout: number | null
          proposed_timeline_end: string | null
          proposed_timeline_start: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["negotiation_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_id: string
          message?: string | null
          proposed_by: string
          proposed_deliverables?: Json | null
          proposed_payout?: number | null
          proposed_timeline_end?: string | null
          proposed_timeline_start?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["negotiation_status"]
        }
        Update: {
          created_at?: string
          id?: string
          invitation_id?: string
          message?: string | null
          proposed_by?: string
          proposed_deliverables?: Json | null
          proposed_payout?: number | null
          proposed_timeline_end?: string | null
          proposed_timeline_start?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["negotiation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "campaign_negotiations_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "campaign_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_participants: {
        Row: {
          campaign_id: string
          completed_at: string | null
          creator_user_id: string
          final_payout: number | null
          id: string
          invitation_id: string
          joined_at: string
          status: string
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          creator_user_id: string
          final_payout?: number | null
          id?: string
          invitation_id: string
          joined_at?: string
          status?: string
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          creator_user_id?: string
          final_payout?: number | null
          id?: string
          invitation_id?: string
          joined_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_participants_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "campaign_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_snapshots: {
        Row: {
          campaign_id: string
          created_at: string
          created_by: string
          id: string
          snapshot_data: Json
          snapshot_type: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          created_by: string
          id?: string
          snapshot_data: Json
          snapshot_type: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          created_by?: string
          id?: string
          snapshot_data?: Json
          snapshot_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_snapshots_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_snapshots_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          allocated_budget: number
          base_payout_per_influencer: number | null
          brand_user_id: string
          category: string
          content_guidelines: string | null
          created_at: string
          deliverables: Json | null
          description: string | null
          id: string
          influencer_count: number
          min_engagement: number | null
          min_followers: number | null
          name: string
          remaining_budget: number | null
          required_platforms: string[] | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_niches: string[] | null
          targeting_criteria: Json | null
          thumbnail_url: string | null
          timeline_end: string | null
          timeline_start: string | null
          total_budget: number
          updated_at: string
        }
        Insert: {
          allocated_budget?: number
          base_payout_per_influencer?: number | null
          brand_user_id: string
          category: string
          content_guidelines?: string | null
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          id?: string
          influencer_count?: number
          min_engagement?: number | null
          min_followers?: number | null
          name: string
          remaining_budget?: number | null
          required_platforms?: string[] | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_niches?: string[] | null
          targeting_criteria?: Json | null
          thumbnail_url?: string | null
          timeline_end?: string | null
          timeline_start?: string | null
          total_budget?: number
          updated_at?: string
        }
        Update: {
          allocated_budget?: number
          base_payout_per_influencer?: number | null
          brand_user_id?: string
          category?: string
          content_guidelines?: string | null
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          id?: string
          influencer_count?: number
          min_engagement?: number | null
          min_followers?: number | null
          name?: string
          remaining_budget?: number | null
          required_platforms?: string[] | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_niches?: string[] | null
          targeting_criteria?: Json | null
          thumbnail_url?: string | null
          timeline_end?: string | null
          timeline_start?: string | null
          total_budget?: number
          updated_at?: string
        }
        Relationships: []
      }
      creator_earnings: {
        Row: {
          campaign_id: string
          created_at: string
          creator_user_id: string
          eligible_at: string | null
          gross_amount: number
          id: string
          invitation_id: string
          net_amount: number
          paid_at: string | null
          payout_batch_id: string | null
          platform_fee: number
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creator_user_id: string
          eligible_at?: string | null
          gross_amount: number
          id?: string
          invitation_id: string
          net_amount: number
          paid_at?: string | null
          payout_batch_id?: string | null
          platform_fee?: number
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creator_user_id?: string
          eligible_at?: string | null
          gross_amount?: number
          id?: string
          invitation_id?: string
          net_amount?: number
          paid_at?: string | null
          payout_batch_id?: string | null
          platform_fee?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_earnings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_earnings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_earnings_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: true
            referencedRelation: "campaign_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          location: string | null
          name: string
          pricing_currency: string | null
          pricing_enabled: boolean | null
          pricing_max: number | null
          pricing_min: number | null
          pricing_note: string | null
          updated_at: string
          user_id: string
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          location?: string | null
          name?: string
          pricing_currency?: string | null
          pricing_enabled?: boolean | null
          pricing_max?: number | null
          pricing_min?: number | null
          pricing_note?: string | null
          updated_at?: string
          user_id: string
          username?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          location?: string | null
          name?: string
          pricing_currency?: string | null
          pricing_enabled?: boolean | null
          pricing_max?: number | null
          pricing_min?: number | null
          pricing_note?: string | null
          updated_at?: string
          user_id?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      creator_submissions: {
        Row: {
          campaign_id: string
          creator_user_id: string
          deliverable_id: string
          id: string
          metadata: Json | null
          status: string
          submission_type: string
          submission_url: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          creator_user_id: string
          deliverable_id: string
          id?: string
          metadata?: Json | null
          status?: string
          submission_type?: string
          submission_url: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          creator_user_id?: string
          deliverable_id?: string
          id?: string
          metadata?: Json | null
          status?: string
          submission_type?: string
          submission_url?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_submissions_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "campaign_deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tracking_links: {
        Row: {
          campaign_id: string
          click_count: number | null
          created_at: string
          creator_user_id: string
          cta_link_id: string
          id: string
          last_clicked_at: string | null
          original_url: string
          qr_code_url: string | null
          short_url: string
          tracking_code: string
        }
        Insert: {
          campaign_id: string
          click_count?: number | null
          created_at?: string
          creator_user_id: string
          cta_link_id: string
          id?: string
          last_clicked_at?: string | null
          original_url: string
          qr_code_url?: string | null
          short_url: string
          tracking_code: string
        }
        Update: {
          campaign_id?: string
          click_count?: number | null
          created_at?: string
          creator_user_id?: string
          cta_link_id?: string
          id?: string
          last_clicked_at?: string | null
          original_url?: string
          qr_code_url?: string | null
          short_url?: string
          tracking_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_tracking_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_tracking_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_tracking_links_cta_link_id_fkey"
            columns: ["cta_link_id"]
            isOneToOne: false
            referencedRelation: "campaign_cta_links"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_job_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          job_name: string
          result: Json | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_name: string
          result?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_name?: string
          result?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      linked_accounts: {
        Row: {
          access_token: string | null
          account_type: string | null
          connected: boolean | null
          created_at: string
          data_confidence: string | null
          engagement: number | null
          error_count: number | null
          followers: number | null
          health_score: number | null
          id: string
          is_verified: boolean | null
          last_error: string | null
          last_sync: string | null
          oauth_scope: string | null
          permissions: Json | null
          platform: string
          platform_data: Json | null
          platform_user_id: string | null
          profile_image_url: string | null
          profile_name: string | null
          profile_url: string | null
          refresh_token: string | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          username: string | null
          verified: boolean | null
        }
        Insert: {
          access_token?: string | null
          account_type?: string | null
          connected?: boolean | null
          created_at?: string
          data_confidence?: string | null
          engagement?: number | null
          error_count?: number | null
          followers?: number | null
          health_score?: number | null
          id?: string
          is_verified?: boolean | null
          last_error?: string | null
          last_sync?: string | null
          oauth_scope?: string | null
          permissions?: Json | null
          platform: string
          platform_data?: Json | null
          platform_user_id?: string | null
          profile_image_url?: string | null
          profile_name?: string | null
          profile_url?: string | null
          refresh_token?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          verified?: boolean | null
        }
        Update: {
          access_token?: string | null
          account_type?: string | null
          connected?: boolean | null
          created_at?: string
          data_confidence?: string | null
          engagement?: number | null
          error_count?: number | null
          followers?: number | null
          health_score?: number | null
          id?: string
          is_verified?: boolean | null
          last_error?: string | null
          last_sync?: string | null
          oauth_scope?: string | null
          permissions?: Json | null
          platform?: string
          platform_data?: Json | null
          platform_user_id?: string | null
          profile_image_url?: string | null
          profile_name?: string | null
          profile_url?: string | null
          refresh_token?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_batches: {
        Row: {
          batch_date: string
          created_at: string
          creator_count: number
          id: string
          processed_at: string | null
          status: string
          stripe_transfer_group: string | null
          total_amount: number
        }
        Insert: {
          batch_date: string
          created_at?: string
          creator_count?: number
          id?: string
          processed_at?: string | null
          status?: string
          stripe_transfer_group?: string | null
          total_amount?: number
        }
        Update: {
          batch_date?: string
          created_at?: string
          creator_count?: number
          id?: string
          processed_at?: string | null
          status?: string
          stripe_transfer_group?: string | null
          total_amount?: number
        }
        Relationships: []
      }
      platform_audience_metrics: {
        Row: {
          audience_demographics: Json | null
          audience_geography: Json | null
          audience_interests: Json | null
          avg_comments: number | null
          avg_likes: number | null
          avg_shares: number | null
          avg_views: number | null
          created_at: string
          engagement_rate: number | null
          followers_count: number | null
          following_count: number | null
          growth_rate: number | null
          id: string
          linked_account_id: string
          metric_date: string
          posts_count: number | null
        }
        Insert: {
          audience_demographics?: Json | null
          audience_geography?: Json | null
          audience_interests?: Json | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_shares?: number | null
          avg_views?: number | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          growth_rate?: number | null
          id?: string
          linked_account_id: string
          metric_date: string
          posts_count?: number | null
        }
        Update: {
          audience_demographics?: Json | null
          audience_geography?: Json | null
          audience_interests?: Json | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_shares?: number | null
          avg_views?: number | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          growth_rate?: number | null
          id?: string
          linked_account_id?: string
          metric_date?: string
          posts_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_audience_metrics_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "linked_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_content_posts: {
        Row: {
          campaign_id: string | null
          caption: string | null
          clicks: number | null
          comments: number | null
          content_url: string | null
          created_at: string
          detected_brand_tags: string[] | null
          disclosure_present: boolean | null
          engagement_rate: number | null
          hashtags: string[] | null
          id: string
          impressions: number | null
          is_sponsored: boolean | null
          likes: number | null
          linked_account_id: string
          mentions: string[] | null
          platform_post_id: string
          post_type: string
          posted_at: string | null
          raw_data: Json | null
          reach: number | null
          saves: number | null
          sentiment_score: number | null
          shares: number | null
          thumbnail_url: string | null
          updated_at: string
          video_views: number | null
          video_watch_time: number | null
        }
        Insert: {
          campaign_id?: string | null
          caption?: string | null
          clicks?: number | null
          comments?: number | null
          content_url?: string | null
          created_at?: string
          detected_brand_tags?: string[] | null
          disclosure_present?: boolean | null
          engagement_rate?: number | null
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          is_sponsored?: boolean | null
          likes?: number | null
          linked_account_id: string
          mentions?: string[] | null
          platform_post_id: string
          post_type: string
          posted_at?: string | null
          raw_data?: Json | null
          reach?: number | null
          saves?: number | null
          sentiment_score?: number | null
          shares?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          video_views?: number | null
          video_watch_time?: number | null
        }
        Update: {
          campaign_id?: string | null
          caption?: string | null
          clicks?: number | null
          comments?: number | null
          content_url?: string | null
          created_at?: string
          detected_brand_tags?: string[] | null
          disclosure_present?: boolean | null
          engagement_rate?: number | null
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          is_sponsored?: boolean | null
          likes?: number | null
          linked_account_id?: string
          mentions?: string[] | null
          platform_post_id?: string
          post_type?: string
          posted_at?: string | null
          raw_data?: Json | null
          reach?: number | null
          saves?: number | null
          sentiment_score?: number | null
          shares?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          video_views?: number | null
          video_watch_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_content_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_content_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_content_posts_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "linked_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          linked_account_id: string
          metadata: Json | null
          records_processed: number | null
          started_at: string | null
          status: string | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          linked_account_id: string
          metadata?: Json | null
          records_processed?: number | null
          started_at?: string | null
          status?: string | null
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          linked_account_id?: string
          metadata?: Json | null
          records_processed?: number | null
          started_at?: string | null
          status?: string | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_sync_jobs_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "linked_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      question_responses: {
        Row: {
          answer: Json
          created_at: string
          id: string
          question_id: string
          survey_response_id: string
        }
        Insert: {
          answer: Json
          created_at?: string
          id?: string
          question_id: string
          survey_response_id: string
        }
        Update: {
          answer?: Json
          created_at?: string
          id?: string
          question_id?: string
          survey_response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_responses_survey_response_id_fkey"
            columns: ["survey_response_id"]
            isOneToOne: false
            referencedRelation: "survey_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_reviews: {
        Row: {
          action: string
          feedback: string | null
          id: string
          reviewed_at: string
          reviewer_user_id: string
          submission_id: string
        }
        Insert: {
          action: string
          feedback?: string | null
          id?: string
          reviewed_at?: string
          reviewer_user_id: string
          submission_id: string
        }
        Update: {
          action?: string
          feedback?: string | null
          id?: string
          reviewed_at?: string
          reviewer_user_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "creator_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          survey_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          question_text: string
          question_type?: string
          survey_id: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "admin_surveys_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          survey_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          survey_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "admin_surveys_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_health_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message: string
          metadata: Json | null
          severity: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message: string
          metadata?: Json | null
          severity?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          brand_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          brand_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role: string
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          brand_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "admin_brands_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "admin_campaigns_view"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "team_invitations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_role_rules: {
        Row: {
          assigned_role: Database["public"]["Enums"]["user_role"]
          created_at: string
          created_by: string | null
          email_domain: string
          id: string
          is_locked: boolean
          priority: number
          tenant_identifier: string
          updated_at: string
        }
        Insert: {
          assigned_role: Database["public"]["Enums"]["user_role"]
          created_at?: string
          created_by?: string | null
          email_domain: string
          id?: string
          is_locked?: boolean
          priority?: number
          tenant_identifier: string
          updated_at?: string
        }
        Update: {
          assigned_role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          created_by?: string | null
          email_domain?: string
          id?: string
          is_locked?: boolean
          priority?: number
          tenant_identifier?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracking_aggregates: {
        Row: {
          aggregate_date: string
          campaign_id: string
          conversion_value: number
          created_at: string
          creator_user_id: string
          id: string
          total_clicks: number
          total_conversions: number
          total_views: number
          unique_clicks: number
        }
        Insert: {
          aggregate_date: string
          campaign_id: string
          conversion_value?: number
          created_at?: string
          creator_user_id: string
          id?: string
          total_clicks?: number
          total_conversions?: number
          total_views?: number
          unique_clicks?: number
        }
        Update: {
          aggregate_date?: string
          campaign_id?: string
          conversion_value?: number
          created_at?: string
          creator_user_id?: string
          id?: string
          total_clicks?: number
          total_conversions?: number
          total_views?: number
          unique_clicks?: number
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          creator_user_id: string | null
          event_type: string
          id: string
          metadata: Json | null
          referrer: string | null
          tracking_link_id: string | null
          user_agent: string | null
          visitor_ip_hash: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          creator_user_id?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          tracking_link_id?: string | null
          user_agent?: string | null
          visitor_ip_hash?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          creator_user_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          tracking_link_id?: string | null
          user_agent?: string | null
          visitor_ip_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_tracking_link_id_fkey"
            columns: ["tracking_link_id"]
            isOneToOne: false
            referencedRelation: "creator_tracking_links"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_status_log: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          reason: string | null
          status: string
          user_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          reason?: string | null
          status: string
          user_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          reason?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string
          stripe_payment_intent_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "brand_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_brands_view: {
        Row: {
          active_campaigns_count: number | null
          company_name: string | null
          company_size: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string | null
          industry: string | null
          logo_url: string | null
          team_members_count: number | null
          total_campaigns: number | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          active_campaigns_count?: never
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          industry?: string | null
          logo_url?: string | null
          team_members_count?: never
          total_campaigns?: never
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          active_campaigns_count?: never
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          industry?: string | null
          logo_url?: string | null
          team_members_count?: never
          total_campaigns?: never
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      admin_campaigns_view: {
        Row: {
          accepted_invitations_count: number | null
          allocated_budget: number | null
          brand_id: string | null
          brand_name: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          influencer_count: number | null
          invitations_count: number | null
          name: string | null
          remaining_budget: number | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          timeline_end: string | null
          timeline_start: string | null
          total_budget: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      admin_creators_view: {
        Row: {
          active_campaigns_count: number | null
          avatar_url: string | null
          bio: string | null
          connected_accounts_count: number | null
          created_at: string | null
          email: string | null
          id: string | null
          location: string | null
          name: string | null
          total_followers: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          active_campaigns_count?: never
          avatar_url?: string | null
          bio?: string | null
          connected_accounts_count?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          location?: string | null
          name?: string | null
          total_followers?: never
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          active_campaigns_count?: never
          avatar_url?: string | null
          bio?: string | null
          connected_accounts_count?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          location?: string | null
          name?: string | null
          total_followers?: never
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      admin_surveys_view: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          questions_count: number | null
          responses_count: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          questions_count?: never
          responses_count?: never
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          questions_count?: never
          responses_count?: never
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cron_job_status: {
        Row: {
          active: boolean | null
          command: string | null
          database: string | null
          jobid: number | null
          jobname: string | null
          nodename: string | null
          nodeport: number | null
          schedule: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_campaign_invitation: {
        Args: { _invitation_id: string }
        Returns: Json
      }
      aggregate_tracking_events: {
        Args: { target_date?: string }
        Returns: Json
      }
      can_manage_campaign: {
        Args: { _campaign_id: string; _user_id: string }
        Returns: boolean
      }
      decline_campaign_invitation: {
        Args: { _invitation_id: string; _redistribute?: boolean }
        Returns: Json
      }
      get_auto_assigned_role: {
        Args: { _email: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_campaign_permission_level: {
        Args: { _campaign_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["campaign_permission_level"]
      }
      get_latest_user_status: { Args: { _user_id: string }; Returns: string }
      get_user_brand_role: {
        Args: { _brand_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["brand_role"]
      }
      get_user_brands: {
        Args: { _user_id: string }
        Returns: {
          brand_id: string
          is_default: boolean
          role: Database["public"]["Enums"]["brand_role"]
        }[]
      }
      get_user_default_brand: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_brand_role: {
        Args: {
          _brand_id: string
          _role: Database["public"]["Enums"]["brand_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_brand_admin: {
        Args: { _brand_id: string; _user_id: string }
        Returns: boolean
      }
      mark_earnings_eligible: {
        Args: { _invitation_id: string }
        Returns: Json
      }
      publish_campaign: { Args: { _campaign_id: string }; Returns: Json }
      respond_to_negotiation: {
        Args: {
          _counter_message?: string
          _counter_payout?: number
          _negotiation_id: string
          _response: string
        }
        Returns: Json
      }
      review_submission: {
        Args: { _action: string; _feedback?: string; _submission_id: string }
        Returns: Json
      }
      submit_deliverable: {
        Args: {
          _campaign_id: string
          _deliverable_id: string
          _metadata?: Json
          _submission_url: string
        }
        Returns: Json
      }
      submit_negotiation_counter_offer: {
        Args: {
          _invitation_id: string
          _message: string
          _proposed_deliverables?: Json
          _proposed_payout: number
          _proposed_timeline_end?: string
          _proposed_timeline_start?: string
        }
        Returns: Json
      }
      transfer_brand_ownership: {
        Args: {
          _brand_id: string
          _new_owner_user_id: string
          _performed_by: string
        }
        Returns: boolean
      }
      update_platform_setting: {
        Args: { _key: string; _value: Json }
        Returns: Json
      }
    }
    Enums: {
      brand_role: "agency_admin" | "finance" | "campaign_manager"
      campaign_permission_level: "view" | "manage" | "full"
      campaign_status:
        | "draft"
        | "discovery"
        | "active"
        | "reviewing"
        | "completed"
        | "cancelled"
      invitation_status:
        | "pending"
        | "accepted"
        | "declined"
        | "negotiating"
        | "withdrawn"
      message_status: "sent" | "delivered" | "read"
      negotiation_status: "pending" | "accepted" | "rejected" | "countered"
      user_role: "creator" | "brand" | "admin"
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
      brand_role: ["agency_admin", "finance", "campaign_manager"],
      campaign_permission_level: ["view", "manage", "full"],
      campaign_status: [
        "draft",
        "discovery",
        "active",
        "reviewing",
        "completed",
        "cancelled",
      ],
      invitation_status: [
        "pending",
        "accepted",
        "declined",
        "negotiating",
        "withdrawn",
      ],
      message_status: ["sent", "delivered", "read"],
      negotiation_status: ["pending", "accepted", "rejected", "countered"],
      user_role: ["creator", "brand", "admin"],
    },
  },
} as const
