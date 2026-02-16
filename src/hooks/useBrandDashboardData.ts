import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  activeCampaigns: number;
  totalCreators: number;
  totalSpend: number;
  thisMonthSpend: number;
  engagementRate: number;
  pendingApprovals: number;
}

export interface CampaignSummary {
  id: string;
  name: string;
  category: string;
  status: string;
  budget: number;
  spent: number;
  creatorCount: number;
  thumbnail_url: string | null;
  timeline_start: string | null;
  timeline_end: string | null;
}

export const useBrandDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 0,
    totalCreators: 0,
    totalSpend: 0,
    thisMonthSpend: 0,
    engagementRate: 0,
    pendingApprovals: 0,
  });
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all campaigns for this brand
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_user_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      const allCampaigns = campaignsData || [];

      // Calculate stats from real data
      const activeCampaigns = allCampaigns.filter(c => 
        c.status === 'active' || c.status === 'discovery' || c.status === 'reviewing'
      ).length;

      // Get total unique creators across all campaigns
      const { data: invitations } = await supabase
        .from('campaign_invitations')
        .select('creator_user_id, campaign_id, status')
        .in('campaign_id', allCampaigns.map(c => c.id));

      const uniqueCreators = new Set(
        (invitations || [])
          .filter(i => i.status === 'accepted')
          .map(i => i.creator_user_id)
      );

      const pendingApprovals = (invitations || []).filter(
        i => i.status === 'pending' || i.status === 'negotiating'
      ).length;

      // Calculate spending
      const totalSpend = allCampaigns.reduce((sum, c) => sum + (c.allocated_budget || 0), 0);
      
      // Get this month's spending (campaigns created this month)
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      
      const thisMonthCampaigns = allCampaigns.filter(c => 
        new Date(c.created_at) >= thisMonthStart
      );
      const thisMonthSpend = thisMonthCampaigns.reduce((sum, c) => sum + (c.allocated_budget || 0), 0);

      // Get tracking link clicks for engagement calculation
      const { data: trackingLinks } = await supabase
        .from('creator_tracking_links')
        .select('click_count')
        .in('campaign_id', allCampaigns.map(c => c.id));

      const totalClicks = (trackingLinks || []).reduce((sum, l) => sum + (l.click_count || 0), 0);
      const avgEngagement = uniqueCreators.size > 0 ? 
        Math.min(100, (totalClicks / (uniqueCreators.size * 100)) * 100).toFixed(1) : '0';

      setStats({
        activeCampaigns,
        totalCreators: uniqueCreators.size,
        totalSpend,
        thisMonthSpend,
        engagementRate: parseFloat(avgEngagement),
        pendingApprovals,
      });

      // Map campaigns to summary format
      const campaignSummaries: CampaignSummary[] = allCampaigns.map(c => {
        const campaignInvites = (invitations || []).filter(i => i.campaign_id === c.id);
        return {
          id: c.id,
          name: c.name,
          category: c.category,
          status: c.status,
          budget: c.total_budget,
          spent: c.allocated_budget,
          creatorCount: campaignInvites.filter(i => i.status === 'accepted').length,
          thumbnail_url: c.thumbnail_url,
          timeline_start: c.timeline_start,
          timeline_end: c.timeline_end,
        };
      });

      setCampaigns(campaignSummaries);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activeCampaigns = campaigns.filter(c => 
    c.status === 'active' || c.status === 'discovery' || c.status === 'reviewing'
  );

  const topPerformingCampaigns = [...campaigns]
    .filter(c => c.status === 'active' || c.status === 'completed')
    .sort((a, b) => b.creatorCount - a.creatorCount)
    .slice(0, 3);

  return {
    stats,
    campaigns,
    activeCampaigns,
    topPerformingCampaigns,
    isLoading,
    refetch: fetchDashboardData,
  };
};
