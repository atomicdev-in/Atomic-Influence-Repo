import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreatorPerformance {
  creatorUserId: string;
  creatorName: string;
  creatorAvatar: string | null;
  totalClicks: number;
  uniqueLinks: number;
  lastClicked: string | null;
  payout: number;
  costPerClick: number;
  roi: number;
}

interface CampaignAnalytics {
  totalClicks: number;
  totalLinks: number;
  activeCreators: number;
  averageClicksPerCreator: number;
  averageCostPerClick: number;
  totalSpend: number;
  estimatedConversions: number;
  conversionRate: number;
  topPerformer: CreatorPerformance | null;
  creatorPerformance: CreatorPerformance[];
  clicksByDate: { date: string; clicks: number }[];
  clicksByLink: { label: string; clicks: number; isPrimary: boolean }[];
}

export const useCampaignAnalytics = (campaignId: string | undefined) => {
  const [trackingLinks, setTrackingLinks] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [ctaLinks, setCtaLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!campaignId) return;
    
    setIsLoading(true);
    try {
      // Fetch tracking links with creator info
      const { data: trackingData } = await supabase
        .from('creator_tracking_links')
        .select(`
          *,
          campaign_cta_links (label, is_primary)
        `)
        .eq('campaign_id', campaignId);

      setTrackingLinks(trackingData || []);

      // Fetch invitations with creator profiles
      const { data: invitationData } = await supabase
        .from('campaign_invitations')
        .select(`
          *,
          creator_profiles:creator_user_id (
            name,
            avatar_url
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'accepted');

      setInvitations(invitationData || []);

      // Fetch CTA links
      const { data: ctaData } = await supabase
        .from('campaign_cta_links')
        .select('*')
        .eq('campaign_id', campaignId);

      setCtaLinks(ctaData || []);

    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId]);

  const analytics: CampaignAnalytics = useMemo(() => {
    const totalClicks = trackingLinks.reduce((sum, link) => sum + (link.click_count || 0), 0);
    const totalLinks = trackingLinks.length;
    const activeCreators = invitations.length;
    const totalSpend = invitations.reduce((sum, inv) => sum + (inv.offered_payout || 0), 0);
    
    // Calculate per-creator performance
    const creatorMap = new Map<string, CreatorPerformance>();
    
    invitations.forEach(inv => {
      creatorMap.set(inv.creator_user_id, {
        creatorUserId: inv.creator_user_id,
        creatorName: inv.creator_profiles?.name || 'Unknown',
        creatorAvatar: inv.creator_profiles?.avatar_url || null,
        totalClicks: 0,
        uniqueLinks: 0,
        lastClicked: null,
        payout: inv.offered_payout || 0,
        costPerClick: 0,
        roi: 0,
      });
    });

    trackingLinks.forEach(link => {
      const creator = creatorMap.get(link.creator_user_id);
      if (creator) {
        creator.totalClicks += link.click_count || 0;
        creator.uniqueLinks += 1;
        if (link.last_clicked_at && (!creator.lastClicked || link.last_clicked_at > creator.lastClicked)) {
          creator.lastClicked = link.last_clicked_at;
        }
      }
    });

    // Calculate cost per click and ROI for each creator
    const creatorPerformance = Array.from(creatorMap.values()).map(creator => ({
      ...creator,
      costPerClick: creator.totalClicks > 0 ? creator.payout / creator.totalClicks : 0,
      // ROI formula: assume each click is worth $0.50 on average (simplified)
      roi: creator.payout > 0 ? (creator.totalClicks * 0.5) / creator.payout : 0,
    })).sort((a, b) => b.totalClicks - a.totalClicks);

    // Calculate clicks by CTA link
    const clicksByLinkMap = new Map<string, { clicks: number; isPrimary: boolean; label: string }>();
    ctaLinks.forEach(cta => {
      clicksByLinkMap.set(cta.id, { clicks: 0, isPrimary: cta.is_primary || false, label: cta.label });
    });
    
    trackingLinks.forEach(link => {
      const ctaData = clicksByLinkMap.get(link.cta_link_id);
      if (ctaData) {
        ctaData.clicks += link.click_count || 0;
      }
    });

    const clicksByLink = Array.from(clicksByLinkMap.values())
      .sort((a, b) => b.clicks - a.clicks);

    // Estimated conversions (assume 2.5% conversion rate from clicks)
    const estimatedConversionRate = 0.025;
    const estimatedConversions = Math.round(totalClicks * estimatedConversionRate);

    return {
      totalClicks,
      totalLinks,
      activeCreators,
      averageClicksPerCreator: activeCreators > 0 ? Math.round(totalClicks / activeCreators) : 0,
      averageCostPerClick: totalClicks > 0 ? totalSpend / totalClicks : 0,
      totalSpend,
      estimatedConversions,
      conversionRate: totalClicks > 0 ? (estimatedConversions / totalClicks) * 100 : 0,
      topPerformer: creatorPerformance[0] || null,
      creatorPerformance,
      clicksByDate: [], // Would need historical data
      clicksByLink,
    };
  }, [trackingLinks, invitations, ctaLinks]);

  return {
    analytics,
    isLoading,
    refetch: fetchAnalytics,
  };
};
