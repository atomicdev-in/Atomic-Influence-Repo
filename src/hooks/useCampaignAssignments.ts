import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CampaignAssignment {
  id: string;
  user_id: string;
  campaign_id: string;
  assigned_by: string;
  created_at: string;
}

export interface CampaignWithAssignments {
  id: string;
  name: string;
  status: string;
  assignments: CampaignAssignment[];
}

interface UseCampaignAssignmentsReturn {
  campaigns: CampaignWithAssignments[];
  loading: boolean;
  assignCampaign: (userId: string, campaignId: string) => Promise<{ error: Error | null }>;
  unassignCampaign: (userId: string, campaignId: string) => Promise<{ error: Error | null }>;
  getUserAssignments: (userId: string) => CampaignAssignment[];
  refetch: () => Promise<void>;
}

export const useCampaignAssignments = (): UseCampaignAssignmentsReturn => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaignsWithAssignments = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch campaigns owned by the current user
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("id, name, status")
        .eq("brand_user_id", user.id)
        .order("created_at", { ascending: false });

      if (campaignsError) {
        console.error("Error fetching campaigns:", campaignsError);
        return;
      }

      if (!campaignsData || campaignsData.length === 0) {
        setCampaigns([]);
        return;
      }

      // Fetch all assignments for these campaigns
      const campaignIds = campaignsData.map(c => c.id);
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("campaign_manager_assignments")
        .select("*")
        .in("campaign_id", campaignIds);

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError);
      }

      // Combine campaigns with their assignments
      const campaignsWithAssignments: CampaignWithAssignments[] = campaignsData.map(campaign => ({
        ...campaign,
        assignments: (assignmentsData || []).filter(a => a.campaign_id === campaign.id),
      }));

      setCampaigns(campaignsWithAssignments);
    } catch (err) {
      console.error("Error in fetchCampaignsWithAssignments:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCampaignsWithAssignments();
  }, [fetchCampaignsWithAssignments]);

  const assignCampaign = useCallback(async (userId: string, campaignId: string) => {
    if (!user?.id) {
      return { error: new Error("Not authorized") };
    }

    try {
      const { error } = await supabase
        .from("campaign_manager_assignments")
        .insert({
          user_id: userId,
          campaign_id: campaignId,
          assigned_by: user.id,
        });

      if (error) throw error;

      await fetchCampaignsWithAssignments();
      return { error: null };
    } catch (err) {
      console.error("Error assigning campaign:", err);
      return { error: err as Error };
    }
  }, [user?.id, fetchCampaignsWithAssignments]);

  const unassignCampaign = useCallback(async (userId: string, campaignId: string) => {
    if (!user?.id) {
      return { error: new Error("Not authorized") };
    }

    try {
      const { error } = await supabase
        .from("campaign_manager_assignments")
        .delete()
        .eq("user_id", userId)
        .eq("campaign_id", campaignId);

      if (error) throw error;

      await fetchCampaignsWithAssignments();
      return { error: null };
    } catch (err) {
      console.error("Error unassigning campaign:", err);
      return { error: err as Error };
    }
  }, [user?.id, fetchCampaignsWithAssignments]);

  const getUserAssignments = useCallback((userId: string): CampaignAssignment[] => {
    return campaigns.flatMap(c => c.assignments.filter(a => a.user_id === userId));
  }, [campaigns]);

  return {
    campaigns,
    loading,
    assignCampaign,
    unassignCampaign,
    getUserAssignments,
    refetch: fetchCampaignsWithAssignments,
  };
};
