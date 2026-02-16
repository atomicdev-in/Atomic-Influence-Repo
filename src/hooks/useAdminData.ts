import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for admin views
export interface AdminCreator {
  id: string;
  user_id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  connected_accounts_count: number;
  total_followers: number | null;
  active_campaigns_count: number;
}

export interface AdminBrand {
  id: string;
  user_id: string;
  company_name: string;
  email: string;
  industry: string | null;
  website: string | null;
  company_size: string | null;
  logo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  total_campaigns: number;
  active_campaigns_count: number;
  team_members_count: number;
}

export interface AdminCampaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  category: string;
  total_budget: number;
  allocated_budget: number;
  remaining_budget: number | null;
  influencer_count: number;
  timeline_start: string | null;
  timeline_end: string | null;
  created_at: string;
  updated_at: string;
  brand_name: string | null;
  brand_id: string | null;
  invitations_count: number;
  accepted_invitations_count: number;
}

export interface AdminSurvey {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions_count: number;
  responses_count: number;
}

export interface SystemHealthLog {
  id: string;
  event_type: string;
  severity: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard stats
export interface AdminDashboardStats {
  totalCreators: number;
  totalBrands: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalSurveys: number;
  totalSurveyResponses: number;
}

/**
 * Fetch all creators via admin view
 */
export const useAdminCreators = () => {
  return useQuery({
    queryKey: ["admin", "creators"],
    queryFn: async () => {
      // Views aren't in generated types, use raw SQL via rpc or cast through unknown
      const { data, error } = await supabase
        .from("admin_creators_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AdminCreator[];
    },
  });
};

/**
 * Fetch all brands via admin view
 */
export const useAdminBrands = () => {
  return useQuery({
    queryKey: ["admin", "brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AdminBrand[];
    },
  });
};

/**
 * Fetch all campaigns via admin view (read-only oversight)
 */
export const useAdminCampaigns = () => {
  return useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_campaigns_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AdminCampaign[];
    },
  });
};

/**
 * Fetch all surveys via admin view
 */
export const useAdminSurveys = () => {
  return useQuery({
    queryKey: ["admin", "surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AdminSurvey[];
    },
  });
};

/**
 * Fetch system health logs
 */
export const useSystemHealthLogs = () => {
  return useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_health_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as SystemHealthLog[];
    },
  });
};

/**
 * Fetch admin settings
 */
export const useAdminSettings = () => {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .order("key", { ascending: true });

      if (error) throw error;
      return (data || []) as AdminSetting[];
    },
  });
};

/**
 * Aggregate dashboard stats for admin overview
 */
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      // Fetch counts in parallel
      const [
        creatorsResult,
        brandsResult,
        campaignsResult,
        surveysResult,
      ] = await Promise.all([
        supabase.from("creator_profiles").select("id", { count: "exact", head: true }),
        supabase.from("brand_profiles").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id, status", { count: "exact" }),
        supabase.from("surveys").select("id", { count: "exact", head: true }),
      ]);

      // Get survey responses count separately
      const responsesResult = await supabase
        .from("survey_responses")
        .select("id", { count: "exact", head: true });

      const campaigns = campaignsResult.data || [];
      const activeCampaigns = campaigns.filter(c => c.status === "active").length;

      return {
        totalCreators: creatorsResult.count || 0,
        totalBrands: brandsResult.count || 0,
        totalCampaigns: campaignsResult.count || 0,
        activeCampaigns,
        totalSurveys: surveysResult.count || 0,
        totalSurveyResponses: responsesResult.count || 0,
      } as AdminDashboardStats;
    },
  });
};

/**
 * Fetch audit logs for governance
 */
export const useAdminAuditLogs = (limit = 50) => {
  return useQuery({
    queryKey: ["admin", "audit-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};
