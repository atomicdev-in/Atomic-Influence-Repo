import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook to fetch and manage Creator Profile data from Cloud
 */
export const useCreatorProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["creator-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateCreatorProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (profile: {
      name?: string;
      username?: string;
      bio?: string;
      location?: string;
      website?: string;
      avatar_url?: string;
      pricing_enabled?: boolean;
      pricing_min?: number;
      pricing_max?: number;
      pricing_currency?: string;
      pricing_note?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("creator_profiles")
        .update(profile)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-profile"] });
    },
  });
};

/**
 * Hook to fetch and manage Brand Fit data from Cloud
 */
export const useBrandFitData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["brand-fit-data", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("brand_fit_data")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching brand fit data:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateBrandFitData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (brandFit: {
      brand_categories?: string[];
      alcohol_openness?: string;
      personal_assets?: string[];
      driving_comfort?: string;
      content_styles?: string[];
      camera_comfort?: string;
      avoided_topics?: string;
      audience_type?: string;
      collaboration_type?: string;
      creative_control?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("brand_fit_data")
        .update(brandFit)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-fit-data"] });
    },
  });
};

/**
 * Hook to fetch and manage Linked Accounts from Cloud
 */
export const useLinkedAccounts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["linked-accounts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("linked_accounts")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching linked accounts:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });
};

export const useAddLinkedAccount = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (account: {
      platform: string;
      username?: string;
      followers?: number;
      engagement?: number;
      verified?: boolean;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("linked_accounts")
        .upsert({
          user_id: user.id,
          platform: account.platform,
          username: account.username || "",
          followers: account.followers || 0,
          engagement: account.engagement || 0,
          verified: account.verified || false,
          connected: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linked-accounts"] });
    },
  });
};

export const useRemoveLinkedAccount = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (platform: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("linked_accounts")
        .delete()
        .eq("user_id", user.id)
        .eq("platform", platform);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linked-accounts"] });
    },
  });
};

/**
 * Hook to fetch and manage Campaign History from Cloud
 */
export const useCampaignHistory = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["campaign-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("campaign_history")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching campaign history:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateCampaignHistory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (history: {
      total_completed?: number;
      total_started?: number;
      on_time_deliveries?: number;
      revisions_requested?: number;
      total_earnings?: number;
      avg_response_time?: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("campaign_history")
        .update(history)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-history"] });
    },
  });
};
