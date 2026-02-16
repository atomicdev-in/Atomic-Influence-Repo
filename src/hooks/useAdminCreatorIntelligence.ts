import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  calculateProfileCompletionFromCloud,
  calculateBrandFitCompletionFromCloud,
  calculateLinkedAccountsScore,
  calculatePerformanceScore,
  calculateAverageEngagement,
  calculateResponseScore,
  type CampaignHistoryData,
  type LinkedAccountData,
} from "./useCreatorScoring";

/**
 * Admin Creator Intelligence Layer
 * 
 * Aggregates creator data from multiple sources:
 * - Profile data (creator_profiles)
 * - Brand fit preferences (brand_fit_data)
 * - Connected accounts (linked_accounts)
 * - Campaign history (campaign_history, campaign_invitations)
 * - Survey responses (survey_responses)
 * 
 * Provides scoring, classification, and confidence indicators for admin oversight.
 */

export interface DataSource {
  name: string;
  available: boolean;
  lastUpdated: string | null;
  confidence: "high" | "medium" | "low" | "none";
}

export interface CreatorIntelligence {
  id: string;
  userId: string;
  
  // Basic profile
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  createdAt: string;
  
  // Aggregated scores
  scores: {
    overall: number;
    profile: number;
    brandFit: number;
    socialReach: number;
    engagement: number;
    reliability: number;
    responsiveness: number;
  };
  
  // Classification
  classification: {
    tier: "premium" | "established" | "emerging" | "new";
    categories: string[];
    contentStyles: string[];
    audienceType: string | null;
  };
  
  // Platform metrics
  platforms: {
    platform: string;
    username: string | null;
    followers: number;
    engagement: number;
    verified: boolean;
    connected: boolean;
  }[];
  
  // Campaign performance
  performance: {
    totalCampaigns: number;
    completedCampaigns: number;
    acceptedInvitations: number;
    declinedInvitations: number;
    pendingInvitations: number;
    completionRate: number;
    onTimeRate: number;
    totalEarnings: number;
    avgResponseTime: number;
  };
  
  // Survey engagement
  surveyEngagement: {
    totalCompleted: number;
    totalAvailable: number;
    completionRate: number;
    lastCompletedAt: string | null;
  };
  
  // Preferences (from brand_fit_data)
  preferences: {
    brandCategories: string[];
    alcoholOpenness: string | null;
    personalAssets: string[];
    drivingComfort: string | null;
    avoidedTopics: string | null;
    collaborationType: string | null;
    creativeControl: string | null;
  };
  
  // Data sources with confidence
  dataSources: DataSource[];
}

export interface CreatorIntelligenceSummary {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  overallScore: number;
  tier: "premium" | "established" | "emerging" | "new";
  platformCount: number;
  totalFollowers: number;
  completedCampaigns: number;
  dataCompleteness: number;
  createdAt: string;
}

/**
 * Calculate creator tier based on metrics
 */
function calculateTier(
  overallScore: number,
  totalFollowers: number,
  completedCampaigns: number
): "premium" | "established" | "emerging" | "new" {
  if (overallScore >= 80 && totalFollowers >= 100000 && completedCampaigns >= 10) {
    return "premium";
  }
  if (overallScore >= 60 && totalFollowers >= 25000 && completedCampaigns >= 5) {
    return "established";
  }
  if (overallScore >= 40 || totalFollowers >= 5000 || completedCampaigns >= 1) {
    return "emerging";
  }
  return "new";
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
 * Fetch all creators with intelligence summaries
 */
export const useAdminCreatorIntelligenceSummaries = () => {
  return useQuery({
    queryKey: ["admin", "creator-intelligence", "summaries"],
    queryFn: async () => {
      // Fetch all creator profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("creator_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all linked accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("linked_accounts")
        .select("*");

      if (accountsError) throw accountsError;

      // Fetch all brand fit data
      const { data: brandFitData, error: brandFitError } = await supabase
        .from("brand_fit_data")
        .select("*");

      if (brandFitError) throw brandFitError;

      // Fetch all campaign history
      const { data: campaignHistory, error: historyError } = await supabase
        .from("campaign_history")
        .select("*");

      if (historyError) throw historyError;

      // Fetch campaign invitations for additional metrics
      const { data: invitations, error: invitationsError } = await supabase
        .from("campaign_invitations")
        .select("creator_user_id, status");

      if (invitationsError) throw invitationsError;

      // Create lookup maps
      const accountsByUser = new Map<string, typeof accounts>();
      accounts?.forEach((account) => {
        const existing = accountsByUser.get(account.user_id) || [];
        existing.push(account);
        accountsByUser.set(account.user_id, existing);
      });

      const brandFitByUser = new Map(brandFitData?.map((bf) => [bf.user_id, bf]) || []);
      const historyByUser = new Map(campaignHistory?.map((h) => [h.user_id, h]) || []);

      // Count invitations by user
      const invitationsByUser = new Map<string, { accepted: number; completed: number }>();
      invitations?.forEach((inv) => {
        const existing = invitationsByUser.get(inv.creator_user_id) || { accepted: 0, completed: 0 };
        if (inv.status === "accepted") existing.accepted++;
        invitationsByUser.set(inv.creator_user_id, existing);
      });

      // Build summaries
      const summaries: CreatorIntelligenceSummary[] = (profiles || []).map((profile) => {
        const userAccounts = accountsByUser.get(profile.user_id) || [];
        const brandFit = brandFitByUser.get(profile.user_id);
        const history = historyByUser.get(profile.user_id);
        const userInvitations = invitationsByUser.get(profile.user_id);

        // Calculate scores
        const profileScore = calculateProfileCompletionFromCloud(profile);
        const brandFitScore = calculateBrandFitCompletionFromCloud(brandFit || null);
        
        const mappedAccounts: LinkedAccountData[] = userAccounts.map((a) => ({
          platform: a.platform,
          connected: a.connected ?? true,
          verified: a.verified ?? false,
          followers: a.followers ?? 0,
          engagement: Number(a.engagement) || 0,
        }));
        
        const socialScore = calculateLinkedAccountsScore(mappedAccounts);
        const engagementScore = Math.min(100, calculateAverageEngagement(mappedAccounts) * 15);
        
        const historyData: CampaignHistoryData = {
          totalCompleted: history?.total_completed ?? 0,
          totalStarted: history?.total_started ?? 0,
          onTimeDeliveries: history?.on_time_deliveries ?? 0,
          revisionsRequested: history?.revisions_requested ?? 0,
          totalEarnings: Number(history?.total_earnings) || 0,
          avgResponseTime: Number(history?.avg_response_time) || 24,
        };
        
        const reliabilityScore = calculatePerformanceScore(historyData);
        const responsivenessScore = calculateResponseScore(historyData.avgResponseTime);

        // Calculate overall score (weighted average)
        const overallScore = Math.round(
          profileScore * 0.15 +
          brandFitScore * 0.20 +
          socialScore * 0.15 +
          engagementScore * 0.20 +
          reliabilityScore * 0.20 +
          responsivenessScore * 0.10
        );

        const totalFollowers = mappedAccounts.reduce((sum, a) => sum + a.followers, 0);
        const completedCampaigns = history?.total_completed ?? 0;

        // Calculate data completeness
        let dataPoints = 0;
        let availablePoints = 0;
        
        if (profile.name) dataPoints++;
        if (profile.bio) dataPoints++;
        if (profile.location) dataPoints++;
        if (profile.avatar_url) dataPoints++;
        availablePoints += 4;
        
        if (brandFit) dataPoints += 5;
        availablePoints += 5;
        
        if (userAccounts.length > 0) dataPoints += Math.min(3, userAccounts.length);
        availablePoints += 3;
        
        const dataCompleteness = Math.round((dataPoints / availablePoints) * 100);

        return {
          id: profile.id,
          userId: profile.user_id,
          name: profile.name || "Unnamed Creator",
          username: profile.username || "",
          email: profile.email,
          avatarUrl: profile.avatar_url,
          overallScore,
          tier: calculateTier(overallScore, totalFollowers, completedCampaigns),
          platformCount: userAccounts.filter((a) => a.connected).length,
          totalFollowers,
          completedCampaigns,
          dataCompleteness,
          createdAt: profile.created_at,
        };
      });

      return summaries;
    },
  });
};

/**
 * Fetch detailed intelligence for a specific creator
 */
export const useAdminCreatorIntelligenceDetail = (userId: string | null) => {
  return useQuery({
    queryKey: ["admin", "creator-intelligence", "detail", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      // Fetch all data in parallel
      const [
        profileResult,
        accountsResult,
        brandFitResult,
        historyResult,
        invitationsResult,
        surveyResponsesResult,
        surveysResult,
      ] = await Promise.all([
        supabase.from("creator_profiles").select("*").eq("user_id", userId).single(),
        supabase.from("linked_accounts").select("*").eq("user_id", userId),
        supabase.from("brand_fit_data").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("campaign_history").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("campaign_invitations").select("*").eq("creator_user_id", userId),
        supabase.from("survey_responses").select("*").eq("user_id", userId),
        supabase.from("surveys").select("id").eq("is_active", true),
      ]);

      if (profileResult.error) throw profileResult.error;
      
      const profile = profileResult.data;
      const accounts = accountsResult.data || [];
      const brandFit = brandFitResult.data;
      const history = historyResult.data;
      const invitations = invitationsResult.data || [];
      const surveyResponses = surveyResponsesResult.data || [];
      const activeSurveys = surveysResult.data || [];

      // Calculate scores
      const profileScore = calculateProfileCompletionFromCloud(profile);
      const brandFitScore = calculateBrandFitCompletionFromCloud(brandFit);
      
      const mappedAccounts: LinkedAccountData[] = accounts.map((a) => ({
        platform: a.platform,
        connected: a.connected ?? true,
        verified: a.verified ?? false,
        followers: a.followers ?? 0,
        engagement: Number(a.engagement) || 0,
      }));
      
      const socialScore = calculateLinkedAccountsScore(mappedAccounts);
      const engagementRate = calculateAverageEngagement(mappedAccounts);
      const engagementScore = Math.min(100, engagementRate * 15);
      
      const historyData: CampaignHistoryData = {
        totalCompleted: history?.total_completed ?? 0,
        totalStarted: history?.total_started ?? 0,
        onTimeDeliveries: history?.on_time_deliveries ?? 0,
        revisionsRequested: history?.revisions_requested ?? 0,
        totalEarnings: Number(history?.total_earnings) || 0,
        avgResponseTime: Number(history?.avg_response_time) || 24,
      };
      
      const reliabilityScore = calculatePerformanceScore(historyData);
      const responsivenessScore = calculateResponseScore(historyData.avgResponseTime);

      const overallScore = Math.round(
        profileScore * 0.15 +
        brandFitScore * 0.20 +
        socialScore * 0.15 +
        engagementScore * 0.20 +
        reliabilityScore * 0.20 +
        responsivenessScore * 0.10
      );

      const totalFollowers = mappedAccounts.reduce((sum, a) => sum + a.followers, 0);

      // Count invitations by status
      const acceptedInvitations = invitations.filter((i) => i.status === "accepted").length;
      const declinedInvitations = invitations.filter((i) => i.status === "declined").length;
      const pendingInvitations = invitations.filter((i) => i.status === "pending").length;

      // Survey stats
      const uniqueSurveyIds = new Set(surveyResponses.map((r) => r.survey_id));
      const lastSurveyResponse = surveyResponses.length > 0
        ? surveyResponses.sort((a, b) => 
            new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
          )[0]
        : null;

      // Build data sources
      const dataSources: DataSource[] = [
        {
          name: "Profile",
          available: true,
          lastUpdated: profile.updated_at,
          confidence: calculateConfidence(profile.updated_at),
        },
        {
          name: "Brand Fit",
          available: !!brandFit,
          lastUpdated: brandFit?.updated_at || null,
          confidence: brandFit ? calculateConfidence(brandFit.updated_at) : "none",
        },
        {
          name: "Social Accounts",
          available: accounts.length > 0,
          lastUpdated: accounts.length > 0 
            ? accounts.sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              )[0].updated_at 
            : null,
          confidence: accounts.length > 0 
            ? calculateConfidence(accounts[0].updated_at) 
            : "none",
        },
        {
          name: "Campaign History",
          available: !!history,
          lastUpdated: history?.updated_at || null,
          confidence: history ? calculateConfidence(history.updated_at) : "none",
        },
        {
          name: "Surveys",
          available: surveyResponses.length > 0,
          lastUpdated: lastSurveyResponse?.completed_at || null,
          confidence: lastSurveyResponse 
            ? calculateConfidence(lastSurveyResponse.completed_at) 
            : "none",
        },
      ];

      const intelligence: CreatorIntelligence = {
        id: profile.id,
        userId: profile.user_id,
        name: profile.name || "Unnamed Creator",
        username: profile.username || "",
        email: profile.email,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        createdAt: profile.created_at,
        
        scores: {
          overall: overallScore,
          profile: profileScore,
          brandFit: brandFitScore,
          socialReach: socialScore,
          engagement: engagementScore,
          reliability: reliabilityScore,
          responsiveness: responsivenessScore,
        },
        
        classification: {
          tier: calculateTier(overallScore, totalFollowers, historyData.totalCompleted),
          categories: brandFit?.brand_categories || [],
          contentStyles: brandFit?.content_styles || [],
          audienceType: brandFit?.audience_type || null,
        },
        
        platforms: accounts.map((a) => ({
          platform: a.platform,
          username: a.username,
          followers: a.followers ?? 0,
          engagement: Number(a.engagement) || 0,
          verified: a.verified ?? false,
          connected: a.connected ?? true,
        })),
        
        performance: {
          totalCampaigns: historyData.totalStarted,
          completedCampaigns: historyData.totalCompleted,
          acceptedInvitations,
          declinedInvitations,
          pendingInvitations,
          completionRate: historyData.totalStarted > 0 
            ? Math.round((historyData.totalCompleted / historyData.totalStarted) * 100) 
            : 0,
          onTimeRate: historyData.totalCompleted > 0
            ? Math.round((historyData.onTimeDeliveries / historyData.totalCompleted) * 100)
            : 0,
          totalEarnings: historyData.totalEarnings,
          avgResponseTime: historyData.avgResponseTime,
        },
        
        surveyEngagement: {
          totalCompleted: uniqueSurveyIds.size,
          totalAvailable: activeSurveys.length,
          completionRate: activeSurveys.length > 0
            ? Math.round((uniqueSurveyIds.size / activeSurveys.length) * 100)
            : 0,
          lastCompletedAt: lastSurveyResponse?.completed_at || null,
        },
        
        preferences: {
          brandCategories: brandFit?.brand_categories || [],
          alcoholOpenness: brandFit?.alcohol_openness || null,
          personalAssets: brandFit?.personal_assets || [],
          drivingComfort: brandFit?.driving_comfort || null,
          avoidedTopics: brandFit?.avoided_topics || null,
          collaborationType: brandFit?.collaboration_type || null,
          creativeControl: brandFit?.creative_control || null,
        },
        
        dataSources,
      };

      return intelligence;
    },
  });
};
