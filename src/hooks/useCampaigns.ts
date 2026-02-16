import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

interface CampaignStats {
  invitedCount: number;
  acceptedCount: number;
  totalClicks: number;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const getCampaignStats = async (campaignId: string): Promise<CampaignStats> => {
    try {
      // Get invitation counts
      const { data: invitations } = await supabase
        .from('campaign_invitations')
        .select('status')
        .eq('campaign_id', campaignId);

      const invitedCount = invitations?.length || 0;
      const acceptedCount = invitations?.filter(i => i.status === 'accepted').length || 0;

      // Get total clicks from tracking links
      const { data: trackingLinks } = await supabase
        .from('creator_tracking_links')
        .select('click_count')
        .eq('campaign_id', campaignId);

      const totalClicks = trackingLinks?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0;

      return { invitedCount, acceptedCount, totalClicks };
    } catch (err) {
      console.error('Error fetching campaign stats:', err);
      return { invitedCount: 0, acceptedCount: 0, totalClicks: 0 };
    }
  };

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
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    getCampaignStats,
    deleteCampaign,
  };
};

export const useCampaignDetail = (campaignId: string | undefined) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [ctaLinks, setCtaLinks] = useState<any[]>([]);
  const [trackingLinks, setTrackingLinks] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaignDetail = async () => {
    if (!campaignId) return;
    
    setIsLoading(true);
    try {
      // Fetch campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Fetch invitations with creator profile info
      const { data: invitationsData } = await supabase
        .from('campaign_invitations')
        .select(`
          *,
          creator_profiles:creator_user_id (
            name,
            username,
            avatar_url,
            email
          )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      setInvitations(invitationsData || []);

      // Fetch CTA links
      const { data: ctaData } = await supabase
        .from('campaign_cta_links')
        .select('*')
        .eq('campaign_id', campaignId);

      setCtaLinks(ctaData || []);

      // Fetch tracking links with aggregated stats
      const { data: trackingData } = await supabase
        .from('creator_tracking_links')
        .select(`
          *,
          campaign_cta_links (label, is_primary)
        `)
        .eq('campaign_id', campaignId)
        .order('click_count', { ascending: false });

      setTrackingLinks(trackingData || []);

      // Fetch assets
      const { data: assetsData } = await supabase
        .from('campaign_assets')
        .select('*')
        .eq('campaign_id', campaignId);

      setAssets(assetsData || []);

    } catch (err) {
      console.error('Error fetching campaign detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetail();
  }, [campaignId]);

  return {
    campaign,
    invitations,
    ctaLinks,
    trackingLinks,
    assets,
    isLoading,
    refetch: fetchCampaignDetail,
  };
};
