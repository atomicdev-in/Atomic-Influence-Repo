import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrandRoles } from "@/hooks/useBrandRoles";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: 'draft' | 'discovery' | 'active' | 'reviewing' | 'completed' | 'cancelled';
  total_budget: number;
  allocated_budget: number;
  remaining_budget: number | null;
  influencer_count: number;
  base_payout_per_influencer: number | null;
  timeline_start: string | null;
  timeline_end: string | null;
  thumbnail_url: string | null;
  created_at: string;
  required_platforms: string[] | null;
  target_niches: string[] | null;
  min_followers: number | null;
  min_engagement: number | null;
}

interface UseRoleBasedCampaignsReturn {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
}

export const useRoleBasedCampaigns = (): UseRoleBasedCampaignsReturn => {
  const { user } = useAuth();
  const { currentUserRole, isOwner, isAdmin, loading: rolesLoading } = useBrandRoles();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user?.id || rolesLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // If user is owner or admin, fetch all campaigns for the brand
      if (isOwner || isAdmin) {
        const { data, error: fetchError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('brand_user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setCampaigns(data || []);
      } 
      // If user is a campaign manager, only fetch assigned campaigns
      else if (currentUserRole === 'campaign_manager') {
        // First get assigned campaign IDs
        const { data: assignments, error: assignError } = await supabase
          .from('campaign_manager_assignments')
          .select('campaign_id')
          .eq('user_id', user.id);

        if (assignError) throw assignError;

        if (!assignments || assignments.length === 0) {
          setCampaigns([]);
        } else {
          const campaignIds = assignments.map(a => a.campaign_id);
          
          const { data, error: fetchError } = await supabase
            .from('campaigns')
            .select('*')
            .in('id', campaignIds)
            .order('created_at', { ascending: false });

          if (fetchError) throw fetchError;
          setCampaigns(data || []);
        }
      }
      // Finance users don't see campaigns list (they see reports/payments)
      else if (currentUserRole === 'finance') {
        setCampaigns([]);
      }
      // Default: fetch user's own campaigns
      else {
        const { data, error: fetchError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('brand_user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setCampaigns(data || []);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentUserRole, isOwner, isAdmin, rolesLoading]);

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (deleteError) throw deleteError;

      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      return true;
    } catch (err) {
      console.error('Error deleting campaign:', err);
      return false;
    }
  };

  useEffect(() => {
    if (!rolesLoading) {
      fetchCampaigns();
    }
  }, [fetchCampaigns, rolesLoading]);

  return {
    campaigns,
    isLoading: isLoading || rolesLoading,
    error,
    fetchCampaigns,
    deleteCampaign,
  };
};
