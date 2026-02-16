import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Admin Brand/Agency Intelligence Layer
 * 
 * Aggregates brand data from multiple sources:
 * - Brand profiles (brand_profiles)
 * - Team structure (brand_memberships, brand_user_roles)
 * - Campaigns (campaigns, campaign_invitations)
 * - Financial patterns (budget allocation, spend)
 * 
 * Provides governance, risk signals, and compliance indicators for admin oversight.
 */

export interface DataSource {
  name: string;
  available: boolean;
  lastUpdated: string | null;
  confidence: "high" | "medium" | "low" | "none";
}

export interface RiskSignal {
  type: "warning" | "info" | "critical";
  category: string;
  message: string;
  details?: string;
}

export interface BrandIntelligence {
  id: string;
  userId: string;
  
  // Basic profile
  companyName: string;
  email: string;
  industry: string | null;
  website: string | null;
  companySize: string | null;
  logoUrl: string | null;
  description: string | null;
  createdAt: string;
  
  // Structure classification
  structure: {
    type: "single_brand" | "agency";
    teamSize: number;
    rolesBreakdown: {
      agency_admin: number;
      campaign_manager: number;
      finance: number;
    };
  };
  
  // Campaign metrics
  campaigns: {
    total: number;
    active: number;
    completed: number;
    draft: number;
    cancelled: number;
    avgDuration: number;
    avgInfluencerCount: number;
  };
  
  // Financial metrics
  financials: {
    totalBudgetAllocated: number;
    totalSpent: number;
    avgCampaignBudget: number;
    avgPayoutPerCreator: number;
    budgetUtilizationRate: number;
  };
  
  // Creator engagement
  creatorEngagement: {
    totalInvitationsSent: number;
    acceptedInvitations: number;
    declinedInvitations: number;
    pendingInvitations: number;
    acceptanceRate: number;
    avgNegotiationRounds: number;
    uniqueCreatorsEngaged: number;
  };
  
  // Compliance & risk signals
  compliance: {
    overallHealth: "healthy" | "attention" | "critical";
    riskScore: number;
    signals: RiskSignal[];
  };
  
  // Activity patterns
  activity: {
    lastCampaignCreated: string | null;
    lastTeamMemberAdded: string | null;
    avgCampaignsPerMonth: number;
    isActive: boolean;
  };
  
  // Data sources
  dataSources: DataSource[];
}

export interface BrandIntelligenceSummary {
  id: string;
  userId: string;
  companyName: string;
  email: string;
  logoUrl: string | null;
  industry: string | null;
  structureType: "single_brand" | "agency";
  teamSize: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  riskScore: number;
  healthStatus: "healthy" | "attention" | "critical";
  createdAt: string;
}

/**
 * Calculate confidence level based on data freshness
 */
function calculateConfidence(lastUpdated: string | null): "high" | "medium" | "low" | "none" {
  if (!lastUpdated) return "none";
  
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceUpdate <= 7) return "high";
  if (daysSinceUpdate <= 30) return "medium";
  return "low";
}

/**
 * Calculate risk signals based on brand behavior patterns
 */
function calculateRiskSignals(
  campaigns: { status: string; total_budget: number; allocated_budget: number; created_at: string }[],
  invitations: { status: string; offered_payout: number; base_payout: number }[],
  teamSize: number,
  daysSinceCreation: number
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  // Check for high cancellation rate
  const cancelledCount = campaigns.filter(c => c.status === "cancelled").length;
  const totalCampaigns = campaigns.length;
  if (totalCampaigns > 3 && cancelledCount / totalCampaigns > 0.3) {
    signals.push({
      type: "warning",
      category: "Campaign Management",
      message: "High campaign cancellation rate",
      details: `${Math.round((cancelledCount / totalCampaigns) * 100)}% of campaigns were cancelled`,
    });
  }
  
  // Check for budget underutilization
  const totalBudget = campaigns.reduce((sum, c) => sum + c.total_budget, 0);
  const allocatedBudget = campaigns.reduce((sum, c) => sum + c.allocated_budget, 0);
  if (totalBudget > 0 && allocatedBudget / totalBudget < 0.5) {
    signals.push({
      type: "info",
      category: "Financial",
      message: "Low budget utilization",
      details: `Only ${Math.round((allocatedBudget / totalBudget) * 100)}% of total budget has been allocated`,
    });
  }
  
  // Check for low invitation acceptance rate
  const acceptedCount = invitations.filter(i => i.status === "accepted").length;
  const totalInvitations = invitations.length;
  if (totalInvitations > 10 && acceptedCount / totalInvitations < 0.2) {
    signals.push({
      type: "warning",
      category: "Creator Relations",
      message: "Low creator acceptance rate",
      details: `Only ${Math.round((acceptedCount / totalInvitations) * 100)}% of invitations accepted`,
    });
  }
  
  // Check for significant payout modifications
  const payoutMods = invitations.filter(
    i => i.offered_payout !== i.base_payout
  ).length;
  if (totalInvitations > 5 && payoutMods / totalInvitations > 0.5) {
    signals.push({
      type: "info",
      category: "Negotiations",
      message: "Frequent payout negotiations",
      details: `${Math.round((payoutMods / totalInvitations) * 100)}% of invitations have modified payouts`,
    });
  }
  
  // Check for rapid expansion (many campaigns in short time)
  if (daysSinceCreation < 30 && totalCampaigns > 5) {
    signals.push({
      type: "info",
      category: "Growth",
      message: "Rapid campaign creation",
      details: `${totalCampaigns} campaigns created within first month`,
    });
  }
  
  // Check for no team members (solo operation)
  if (teamSize === 0 && totalCampaigns > 10) {
    signals.push({
      type: "info",
      category: "Operations",
      message: "Solo operation with high volume",
      details: "Managing many campaigns without team support",
    });
  }
  
  return signals;
}

/**
 * Fetch all brands with intelligence summaries
 */
export const useAdminBrandIntelligenceSummaries = () => {
  return useQuery({
    queryKey: ["admin", "brand-intelligence", "summaries"],
    queryFn: async () => {
      // Fetch data from optimized views
      const [brandsResult, campaignsResult] = await Promise.all([
        supabase
          .from("admin_brands_view")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("admin_campaigns_view")
          .select("brand_id, total_budget, allocated_budget, status"),
      ]);

      if (brandsResult.error) throw brandsResult.error;
      if (campaignsResult.error) throw campaignsResult.error;

      const brands = brandsResult.data || [];
      const campaigns = campaignsResult.data || [];

      // Create lookup maps
      const campaignsByBrandId = new Map<string, typeof campaigns>();
      campaigns.forEach((campaign) => {
        if (!campaign.brand_id) return;
        const existing = campaignsByBrandId.get(campaign.brand_id) || [];
        existing.push(campaign);
        campaignsByBrandId.set(campaign.brand_id, existing);
      });

      // Build summaries
      const summaries: BrandIntelligenceSummary[] = brands.map((brand) => {
        const brandCampaigns = campaignsByBrandId.get(brand.id) || [];
        
        const totalBudget = brandCampaigns.reduce((sum, c) => sum + (c.total_budget || 0), 0);
        // Use count from view if available, fallback to manual count
        const activeCampaigns = brand.active_campaigns_count ?? brandCampaigns.filter(c => c.status === "active").length;
        const cancelledCampaigns = brandCampaigns.filter(c => c.status === "cancelled").length;
        
        // Determine structure type based on view data or fallback
        const teamSize = brand.team_members_count || 1;
        const structureType = teamSize > 2 ? "agency" : "single_brand";
        
        // Calculate risk score (0-100, lower is better)
        let riskScore = 0;
        
        // High cancellation rate adds risk
        if (brandCampaigns.length > 3) {
          riskScore += (cancelledCampaigns / brandCampaigns.length) * 30;
        }
        
        // Low budget utilization adds risk
        const allocatedBudget = brandCampaigns.reduce((sum, c) => sum + (c.allocated_budget || 0), 0);
        if (totalBudget > 0) {
          const utilizationRate = allocatedBudget / totalBudget;
          if (utilizationRate < 0.5) {
            riskScore += (1 - utilizationRate) * 20;
          }
        }
        
        // Determine health status
        let healthStatus: "healthy" | "attention" | "critical" = "healthy";
        if (riskScore > 50) healthStatus = "critical";
        else if (riskScore > 25) healthStatus = "attention";

        return {
          id: brand.id,
          userId: brand.user_id || "",
          companyName: brand.company_name || "Unnamed Brand",
          email: brand.email || "",
          logoUrl: brand.logo_url,
          industry: brand.industry,
          structureType,
          teamSize,
          totalCampaigns: brand.total_campaigns ?? brandCampaigns.length,
          activeCampaigns,
          totalBudget,
          riskScore: Math.round(riskScore),
          healthStatus,
          createdAt: brand.created_at,
        };
      });

      return summaries;
    },
  });
};

/**
 * Fetch detailed intelligence for a specific brand
 */
export const useAdminBrandIntelligenceDetail = (brandId: string | null) => {
  return useQuery({
    queryKey: ["admin", "brand-intelligence", "detail", brandId],
    enabled: !!brandId,
    queryFn: async () => {
      if (!brandId) return null;

      // Fetch brand profile
      const { data: brand, error: brandError } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("id", brandId)
        .single();

      if (brandError) throw brandError;

      // Fetch all related data in parallel
      const [
        campaignsResult,
        membershipsResult,
        rolesResult,
        teamInvitationsResult,
      ] = await Promise.all([
        supabase
          .from("campaigns")
          .select("*")
          .eq("brand_user_id", brand.user_id),
        supabase
          .from("brand_memberships")
          .select("*")
          .eq("brand_id", brandId),
        supabase
          .from("brand_user_roles")
          .select("*")
          .eq("brand_id", brandId),
        supabase
          .from("team_invitations")
          .select("*")
          .eq("brand_id", brandId),
      ]);

      const campaigns = campaignsResult.data || [];
      const memberships = membershipsResult.data || [];
      const roles = rolesResult.data || [];
      const teamInvitations = teamInvitationsResult.data || [];

      // Fetch all invitations for these campaigns
      const campaignIds = campaigns.map(c => c.id);
      let invitations: {
        campaign_id: string;
        creator_user_id: string;
        status: string;
        offered_payout: number;
        base_payout: number;
      }[] = [];
      
      if (campaignIds.length > 0) {
        const { data: invData } = await supabase
          .from("campaign_invitations")
          .select("campaign_id, creator_user_id, status, offered_payout, base_payout")
          .in("campaign_id", campaignIds);
        invitations = invData || [];
      }

      // Fetch negotiations for these invitations
      const invitationIds = invitations.map(i => i.campaign_id);
      let negotiations: { invitation_id: string; status: string }[] = [];
      
      if (invitationIds.length > 0) {
        const { data: negData } = await supabase
          .from("campaign_negotiations")
          .select("invitation_id, status");
        negotiations = negData || [];
      }

      // Calculate metrics
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(brand.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Structure
      const rolesBreakdown = {
        agency_admin: roles.filter(r => r.role === "agency_admin").length,
        campaign_manager: roles.filter(r => r.role === "campaign_manager").length,
        finance: roles.filter(r => r.role === "finance").length,
      };
      const teamSize = memberships.length + roles.length;
      const structureType = teamSize > 2 ? "agency" : "single_brand";

      // Campaigns
      const activeCampaigns = campaigns.filter(c => c.status === "active").length;
      const completedCampaigns = campaigns.filter(c => c.status === "completed").length;
      const draftCampaigns = campaigns.filter(c => c.status === "draft").length;
      const cancelledCampaigns = campaigns.filter(c => c.status === "cancelled").length;
      
      const campaignsWithDuration = campaigns.filter(c => c.timeline_start && c.timeline_end);
      const avgDuration = campaignsWithDuration.length > 0
        ? campaignsWithDuration.reduce((sum, c) => {
            const start = new Date(c.timeline_start!);
            const end = new Date(c.timeline_end!);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / campaignsWithDuration.length
        : 0;
      
      const avgInfluencerCount = campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + c.influencer_count, 0) / campaigns.length
        : 0;

      // Financials
      const totalBudgetAllocated = campaigns.reduce((sum, c) => sum + c.total_budget, 0);
      const totalSpent = campaigns.reduce((sum, c) => sum + c.allocated_budget, 0);
      const avgCampaignBudget = campaigns.length > 0 ? totalBudgetAllocated / campaigns.length : 0;
      
      const acceptedInvitations = invitations.filter(i => i.status === "accepted");
      const avgPayoutPerCreator = acceptedInvitations.length > 0
        ? acceptedInvitations.reduce((sum, i) => sum + i.offered_payout, 0) / acceptedInvitations.length
        : 0;
      
      const budgetUtilizationRate = totalBudgetAllocated > 0
        ? (totalSpent / totalBudgetAllocated) * 100
        : 0;

      // Creator engagement
      const uniqueCreators = new Set(invitations.map(i => i.creator_user_id));
      const pendingInvitations = invitations.filter(i => i.status === "pending").length;
      const declinedInvitations = invitations.filter(i => i.status === "declined").length;
      const acceptedCount = acceptedInvitations.length;
      const acceptanceRate = invitations.length > 0
        ? (acceptedCount / invitations.length) * 100
        : 0;
      
      // Count negotiations per invitation
      const avgNegotiationRounds = negotiations.length > 0 && invitations.length > 0
        ? negotiations.length / invitations.length
        : 0;

      // Risk signals
      const riskSignals = calculateRiskSignals(
        campaigns.map(c => ({
          status: c.status,
          total_budget: c.total_budget,
          allocated_budget: c.allocated_budget,
          created_at: c.created_at,
        })),
        invitations.map(i => ({
          status: i.status,
          offered_payout: i.offered_payout,
          base_payout: i.base_payout,
        })),
        teamSize,
        daysSinceCreation
      );

      // Overall health
      let riskScore = riskSignals.filter(s => s.type === "critical").length * 30 +
                      riskSignals.filter(s => s.type === "warning").length * 15 +
                      riskSignals.filter(s => s.type === "info").length * 5;
      riskScore = Math.min(100, riskScore);
      
      let overallHealth: "healthy" | "attention" | "critical" = "healthy";
      if (riskScore > 50 || riskSignals.some(s => s.type === "critical")) {
        overallHealth = "critical";
      } else if (riskScore > 25 || riskSignals.some(s => s.type === "warning")) {
        overallHealth = "attention";
      }

      // Activity
      const sortedCampaigns = [...campaigns].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastCampaignCreated = sortedCampaigns[0]?.created_at || null;
      
      const sortedTeamInvitations = [...teamInvitations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastTeamMemberAdded = sortedTeamInvitations[0]?.created_at || null;
      
      const monthsActive = Math.max(1, daysSinceCreation / 30);
      const avgCampaignsPerMonth = campaigns.length / monthsActive;
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const isActive = campaigns.some(c => new Date(c.updated_at) > thirtyDaysAgo) ||
                       activeCampaigns > 0;

      // Data sources
      const dataSources: DataSource[] = [
        {
          name: "Brand Profile",
          available: true,
          lastUpdated: brand.updated_at,
          confidence: calculateConfidence(brand.updated_at),
        },
        {
          name: "Team Structure",
          available: memberships.length > 0 || roles.length > 0,
          lastUpdated: memberships[0]?.updated_at || roles[0]?.updated_at || null,
          confidence: teamSize > 0 ? calculateConfidence(memberships[0]?.updated_at) : "none",
        },
        {
          name: "Campaigns",
          available: campaigns.length > 0,
          lastUpdated: sortedCampaigns[0]?.updated_at || null,
          confidence: campaigns.length > 0 ? calculateConfidence(sortedCampaigns[0]?.updated_at) : "none",
        },
        {
          name: "Creator Invitations",
          available: invitations.length > 0,
          lastUpdated: null, // Would need to track this
          confidence: invitations.length > 5 ? "high" : invitations.length > 0 ? "medium" : "none",
        },
        {
          name: "Financial Data",
          available: totalBudgetAllocated > 0,
          lastUpdated: sortedCampaigns[0]?.updated_at || null,
          confidence: campaigns.length > 3 ? "high" : campaigns.length > 0 ? "medium" : "none",
        },
      ];

      const intelligence: BrandIntelligence = {
        id: brand.id,
        userId: brand.user_id,
        companyName: brand.company_name || "Unnamed Brand",
        email: brand.email,
        industry: brand.industry,
        website: brand.website,
        companySize: brand.company_size,
        logoUrl: brand.logo_url,
        description: brand.description,
        createdAt: brand.created_at,
        
        structure: {
          type: structureType,
          teamSize,
          rolesBreakdown,
        },
        
        campaigns: {
          total: campaigns.length,
          active: activeCampaigns,
          completed: completedCampaigns,
          draft: draftCampaigns,
          cancelled: cancelledCampaigns,
          avgDuration: Math.round(avgDuration),
          avgInfluencerCount: Math.round(avgInfluencerCount),
        },
        
        financials: {
          totalBudgetAllocated,
          totalSpent,
          avgCampaignBudget: Math.round(avgCampaignBudget),
          avgPayoutPerCreator: Math.round(avgPayoutPerCreator),
          budgetUtilizationRate: Math.round(budgetUtilizationRate),
        },
        
        creatorEngagement: {
          totalInvitationsSent: invitations.length,
          acceptedInvitations: acceptedCount,
          declinedInvitations,
          pendingInvitations,
          acceptanceRate: Math.round(acceptanceRate),
          avgNegotiationRounds: Math.round(avgNegotiationRounds * 10) / 10,
          uniqueCreatorsEngaged: uniqueCreators.size,
        },
        
        compliance: {
          overallHealth,
          riskScore,
          signals: riskSignals,
        },
        
        activity: {
          lastCampaignCreated,
          lastTeamMemberAdded,
          avgCampaignsPerMonth: Math.round(avgCampaignsPerMonth * 10) / 10,
          isActive,
        },
        
        dataSources,
      };

      return intelligence;
    },
  });
};

/**
 * Aggregate brand statistics for overview
 */
export const useAdminBrandStats = () => {
  return useQuery({
    queryKey: ["admin", "brand-intelligence", "stats"],
    queryFn: async () => {
      const [brandsResult, campaignsResult, membershipsResult] = await Promise.all([
        supabase.from("brand_profiles").select("id, created_at"),
        supabase.from("campaigns").select("brand_user_id, status, total_budget, allocated_budget"),
        supabase.from("brand_memberships").select("brand_id"),
      ]);

      const brands = brandsResult.data || [];
      const campaigns = campaignsResult.data || [];
      const memberships = membershipsResult.data || [];

      // Count agencies vs single brands
      const brandMemberCounts = new Map<string, number>();
      memberships.forEach(m => {
        brandMemberCounts.set(m.brand_id, (brandMemberCounts.get(m.brand_id) || 0) + 1);
      });

      const agencyCount = brands.filter(b => (brandMemberCounts.get(b.id) || 0) > 2).length;
      const singleBrandCount = brands.length - agencyCount;

      // Financial totals
      const totalBudget = campaigns.reduce((sum, c) => sum + c.total_budget, 0);
      const totalAllocated = campaigns.reduce((sum, c) => sum + c.allocated_budget, 0);

      // Status breakdown
      const statusCounts = campaigns.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalBrands: brands.length,
        agencyCount,
        singleBrandCount,
        totalCampaigns: campaigns.length,
        activeCampaigns: statusCounts["active"] || 0,
        completedCampaigns: statusCounts["completed"] || 0,
        totalBudget,
        totalAllocated,
        utilizationRate: totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 100) : 0,
      };
    },
  });
};
