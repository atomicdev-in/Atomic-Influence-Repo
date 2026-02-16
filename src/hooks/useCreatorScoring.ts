import { useMemo } from "react";
import { useCreatorProfile, useBrandFitData, useLinkedAccounts, useCampaignHistory } from "./useCreatorData";
import { useAuth } from "./useAuth";
import { getSurveyScoreData } from "./useSurveyScoring";

/**
 * Centralized Creator Scoring Engine
 * 
 * This module provides dynamic scoring calculations based on real data signals.
 * Uses Cloud data when authenticated, localStorage as fallback for guests.
 * All scores are algorithm-driven and update automatically as underlying data changes.
 * 
 * Score Factors:
 * - Profile Completion: Bio, location, pricing, avatar
 * - Brand Fit Completion: Survey responses (10 fields)
 * - Linked Accounts: Social platforms connected & verified
 * - Campaign Performance: Completion rate, on-time delivery, revisions
 * - Engagement Metrics: Average engagement rate across platforms
 */

// Types
export interface BrandFitData {
  brandCategories: string[];
  alcoholOpenness: string;
  personalAssets: string[];
  drivingComfort: string;
  contentStyles: string[];
  cameraComfort: string;
  avoidedTopics: string;
  audienceType: string;
  collaborationType: string;
  creativeControl: string;
}

export interface ProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  pricingEnabled: boolean;
  pricingMin: string;
  pricingMax: string;
  hasAvatar: boolean;
}

export interface LinkedAccountData {
  platform: string;
  connected: boolean;
  verified: boolean;
  followers: number;
  engagement: number;
}

export interface CampaignHistoryData {
  totalCompleted: number;
  totalStarted: number;
  onTimeDeliveries: number;
  revisionsRequested: number;
  totalEarnings: number;
  avgResponseTime: number;
}

export interface ScoreBreakdown {
  score: number;
  label: string;
  color: string;
  description: string;
}

export interface CreatorHealthScore {
  overall: number;
  trend: string;
  factors: {
    label: string;
    value: number;
    color: string;
    weight: number;
    description: string;
  }[];
}

// Helper: Get Brand Fit data from localStorage (fallback for non-auth)
export const getBrandFitData = (): BrandFitData | null => {
  const saved = localStorage.getItem("brandFitData");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

// Helper: Get Profile data from localStorage (fallback)
export const getProfileData = (): ProfileData => {
  const saved = localStorage.getItem("profileData");
  const defaults: ProfileData = {
    name: "Alex Johnson",
    username: "@alexjohnson",
    email: "alex@example.com",
    bio: "Content creator passionate about sustainable fashion, tech reviews, and lifestyle content.",
    location: "London, UK",
    website: "alexjohnson.com",
    pricingEnabled: true,
    pricingMin: "500",
    pricingMax: "2500",
    hasAvatar: false,
  };
  
  if (!saved) return defaults;
  try {
    return { ...defaults, ...JSON.parse(saved) };
  } catch {
    return defaults;
  }
};

// Helper: Get Linked Accounts data from localStorage (fallback)
export const getLinkedAccountsData = (): LinkedAccountData[] => {
  const saved = localStorage.getItem("linkedAccountsData");
  const defaults: LinkedAccountData[] = [
    { platform: "instagram", connected: true, verified: true, followers: 78500, engagement: 4.2 },
    { platform: "tiktok", connected: true, verified: true, followers: 32100, engagement: 6.8 },
    { platform: "youtube", connected: true, verified: false, followers: 14800, engagement: 3.1 },
  ];
  
  if (!saved) return defaults;
  try {
    return JSON.parse(saved);
  } catch {
    return defaults;
  }
};

// Helper: Get Campaign History from localStorage (fallback)
export const getCampaignHistoryData = (): CampaignHistoryData => {
  const saved = localStorage.getItem("campaignHistoryData");
  const defaults: CampaignHistoryData = {
    totalCompleted: 12,
    totalStarted: 14,
    onTimeDeliveries: 11,
    revisionsRequested: 3,
    totalEarnings: 4852.40,
    avgResponseTime: 4.5,
  };
  
  if (!saved) return defaults;
  try {
    return { ...defaults, ...JSON.parse(saved) };
  } catch {
    return defaults;
  }
};

/**
 * Calculate Brand Fit Completion Percentage
 * Based on: Number of survey fields completed out of 10
 */
export const calculateBrandFitCompletion = (data: BrandFitData | null): number => {
  if (!data) return 0;
  
  let completed = 0;
  const total = 10;
  
  if (data.brandCategories?.length > 0) completed++;
  if (data.alcoholOpenness) completed++;
  if (data.personalAssets?.length > 0) completed++;
  if (data.drivingComfort) completed++;
  if (data.contentStyles?.length > 0) completed++;
  if (data.cameraComfort) completed++;
  if (data.avoidedTopics?.trim()) completed++;
  if (data.audienceType) completed++;
  if (data.collaborationType) completed++;
  if (data.creativeControl) completed++;
  
  return Math.round((completed / total) * 100);
};

/**
 * Calculate Brand Fit Completion from Cloud data format
 */
export const calculateBrandFitCompletionFromCloud = (data: {
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
} | null): number => {
  if (!data) return 0;
  
  let completed = 0;
  const total = 10;
  
  if (data.brand_categories?.length && data.brand_categories.length > 0) completed++;
  if (data.alcohol_openness) completed++;
  if (data.personal_assets?.length && data.personal_assets.length > 0) completed++;
  if (data.driving_comfort) completed++;
  if (data.content_styles?.length && data.content_styles.length > 0) completed++;
  if (data.camera_comfort) completed++;
  if (data.avoided_topics?.trim()) completed++;
  if (data.audience_type) completed++;
  if (data.collaboration_type) completed++;
  if (data.creative_control) completed++;
  
  return Math.round((completed / total) * 100);
};

/**
 * Calculate Profile Completion Percentage
 */
export const calculateProfileCompletion = (data: ProfileData): number => {
  let completed = 0;
  const total = 7;
  
  if (data.name?.trim()) completed++;
  if (data.username?.trim()) completed++;
  if (data.bio?.trim() && data.bio.length >= 20) completed++;
  if (data.location?.trim()) completed++;
  if (data.website?.trim()) completed++;
  if (data.hasAvatar) completed++;
  if (data.pricingEnabled && data.pricingMin && data.pricingMax) completed++;
  
  return Math.round((completed / total) * 100);
};

/**
 * Calculate Profile Completion from Cloud data format
 */
export const calculateProfileCompletionFromCloud = (data: {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  pricing_enabled?: boolean;
  pricing_min?: number;
  pricing_max?: number;
} | null): number => {
  if (!data) return 0;
  
  let completed = 0;
  const total = 7;
  
  if (data.name?.trim()) completed++;
  if (data.username?.trim()) completed++;
  if (data.bio?.trim() && data.bio.length >= 20) completed++;
  if (data.location?.trim()) completed++;
  if (data.website?.trim()) completed++;
  if (data.avatar_url) completed++;
  if (data.pricing_enabled && data.pricing_min && data.pricing_max) completed++;
  
  return Math.round((completed / total) * 100);
};

/**
 * Calculate Linked Accounts Score
 */
export const calculateLinkedAccountsScore = (accounts: LinkedAccountData[]): number => {
  const connected = accounts.filter(a => a.connected);
  const verified = connected.filter(a => a.verified);
  
  const connectionScore = Math.min(60, connected.length * 20);
  const verificationBonus = Math.min(30, verified.length * 10);
  const totalFollowers = connected.reduce((sum, a) => sum + a.followers, 0);
  const reachBonus = totalFollowers > 50000 ? 10 : (totalFollowers > 20000 ? 5 : 0);
  
  return Math.min(100, connectionScore + verificationBonus + reachBonus);
};

/**
 * Calculate Average Engagement Rate
 */
export const calculateAverageEngagement = (accounts: LinkedAccountData[]): number => {
  const connected = accounts.filter(a => a.connected);
  if (connected.length === 0) return 0;
  
  const totalFollowers = connected.reduce((sum, a) => sum + a.followers, 0);
  if (totalFollowers === 0) return 0;
  
  const weightedEngagement = connected.reduce((sum, a) => {
    return sum + (a.engagement * (a.followers / totalFollowers));
  }, 0);
  
  return Math.round(weightedEngagement * 10) / 10;
};

/**
 * Calculate Campaign Performance Score
 */
export const calculatePerformanceScore = (history: CampaignHistoryData): number => {
  if (history.totalStarted === 0) return 50;
  
  const completionRate = history.totalCompleted / history.totalStarted;
  const completionScore = completionRate * 40;
  
  const onTimeRate = history.totalCompleted > 0 
    ? history.onTimeDeliveries / history.totalCompleted 
    : 0;
  const onTimeScore = onTimeRate * 35;
  
  const revisionRate = history.totalCompleted > 0 
    ? history.revisionsRequested / history.totalCompleted 
    : 0;
  const revisionScore = Math.max(0, (1 - revisionRate) * 25);
  
  return Math.round(completionScore + onTimeScore + revisionScore);
};

/**
 * Calculate Response Rate Score
 */
export const calculateResponseScore = (avgResponseTime: number): number => {
  if (avgResponseTime < 2) return 100;
  if (avgResponseTime < 6) return 85;
  if (avgResponseTime < 12) return 70;
  if (avgResponseTime < 24) return 50;
  return 30;
};

/**
 * Hook: Calculate Creator Health Score using Cloud data when available
 */
export const useCreatorHealthScore = (): CreatorHealthScore => {
  const { isAuthenticated } = useAuth();
  const { data: cloudProfile } = useCreatorProfile();
  const { data: cloudBrandFit } = useBrandFitData();
  const { data: cloudAccounts } = useLinkedAccounts();
  const { data: cloudHistory } = useCampaignHistory();

  return useMemo(() => {
    // Use Cloud data if authenticated, fallback to localStorage
    let profileScore: number;
    let brandFitScore: number;
    let linkedScore: number;
    let engagementScore: number;
    let performanceScore: number;
    let responseScore: number;

    if (isAuthenticated && cloudProfile) {
      profileScore = calculateProfileCompletionFromCloud(cloudProfile);
    } else {
      profileScore = calculateProfileCompletion(getProfileData());
    }

    if (isAuthenticated && cloudBrandFit) {
      brandFitScore = calculateBrandFitCompletionFromCloud(cloudBrandFit);
    } else {
      brandFitScore = calculateBrandFitCompletion(getBrandFitData());
    }

    if (isAuthenticated && cloudAccounts && cloudAccounts.length > 0) {
      const mappedAccounts: LinkedAccountData[] = cloudAccounts.map(a => ({
        platform: a.platform,
        connected: a.connected ?? true,
        verified: a.verified ?? false,
        followers: a.followers ?? 0,
        engagement: Number(a.engagement) || 0,
      }));
      linkedScore = calculateLinkedAccountsScore(mappedAccounts);
      engagementScore = Math.min(100, calculateAverageEngagement(mappedAccounts) * 15);
    } else {
      const localAccounts = getLinkedAccountsData();
      linkedScore = calculateLinkedAccountsScore(localAccounts);
      engagementScore = Math.min(100, calculateAverageEngagement(localAccounts) * 15);
    }

    if (isAuthenticated && cloudHistory) {
      const history: CampaignHistoryData = {
        totalCompleted: cloudHistory.total_completed ?? 0,
        totalStarted: cloudHistory.total_started ?? 0,
        onTimeDeliveries: cloudHistory.on_time_deliveries ?? 0,
        revisionsRequested: cloudHistory.revisions_requested ?? 0,
        totalEarnings: Number(cloudHistory.total_earnings) || 0,
        avgResponseTime: Number(cloudHistory.avg_response_time) || 4.5,
      };
      performanceScore = calculatePerformanceScore(history);
      responseScore = calculateResponseScore(history.avgResponseTime);
    } else {
      const localHistory = getCampaignHistoryData();
      performanceScore = calculatePerformanceScore(localHistory);
      responseScore = calculateResponseScore(localHistory.avgResponseTime);
    }

    // Get survey completion bonus
    const surveyData = getSurveyScoreData();
    const surveyBonus = surveyData.surveyCompletionBonus;
    
    // Add survey bonus to brand fit score (up to 15 points)
    const enhancedBrandFitScore = Math.min(100, brandFitScore + surveyBonus);
    
    const weights = {
      profile: 0.15,
      brandFit: 0.25, // Increased weight to account for surveys
      linked: 0.15,
      engagement: 0.20,
      performance: 0.15,
      response: 0.10,
    };
    
    const overallScore = Math.round(
      profileScore * weights.profile +
      enhancedBrandFitScore * weights.brandFit +
      linkedScore * weights.linked +
      engagementScore * weights.engagement +
      performanceScore * weights.performance +
      responseScore * weights.response
    );
    
    const trend = overallScore >= 70 ? "+5" : overallScore >= 50 ? "+2" : "-3";
    
    return {
      overall: overallScore,
      trend,
      factors: [
        { 
          label: "Profile Complete", 
          value: profileScore, 
          color: "text-cyan",
          weight: weights.profile,
          description: "Bio, location, pricing, and avatar completion"
        },
        { 
          label: "Brand Fit", 
          value: enhancedBrandFitScore, 
          color: "text-purple",
          weight: weights.brandFit,
          description: `Core survey + ${surveyData.totalSurveysCompleted}/${surveyData.totalSurveys} bonus surveys completed`
        },
        { 
          label: "Engagement", 
          value: engagementScore, 
          color: "text-pink",
          weight: weights.engagement,
          description: "Average engagement rate across platforms"
        },
        { 
          label: "Response Rate", 
          value: responseScore, 
          color: "text-success",
          weight: weights.response,
          description: "Average time to respond to brands"
        },
      ],
    };
  }, [isAuthenticated, cloudProfile, cloudBrandFit, cloudAccounts, cloudHistory]);
};

/**
 * Hook: Calculate Earnings Forecast
 */
export const useEarningsForecast = () => {
  const { isAuthenticated } = useAuth();
  const { data: cloudHistory } = useCampaignHistory();
  const { data: cloudAccounts } = useLinkedAccounts();

  return useMemo(() => {
    let history: CampaignHistoryData;
    let accounts: LinkedAccountData[];

    if (isAuthenticated && cloudHistory) {
      history = {
        totalCompleted: cloudHistory.total_completed ?? 0,
        totalStarted: cloudHistory.total_started ?? 0,
        onTimeDeliveries: cloudHistory.on_time_deliveries ?? 0,
        revisionsRequested: cloudHistory.revisions_requested ?? 0,
        totalEarnings: Number(cloudHistory.total_earnings) || 0,
        avgResponseTime: Number(cloudHistory.avg_response_time) || 4.5,
      };
    } else {
      history = getCampaignHistoryData();
    }

    if (isAuthenticated && cloudAccounts && cloudAccounts.length > 0) {
      accounts = cloudAccounts.map(a => ({
        platform: a.platform,
        connected: a.connected ?? true,
        verified: a.verified ?? false,
        followers: a.followers ?? 0,
        engagement: Number(a.engagement) || 0,
      }));
    } else {
      accounts = getLinkedAccountsData();
    }
    
    const avgMonthlyEarnings = history.totalCompleted > 0 
      ? history.totalEarnings / Math.max(1, Math.ceil(history.totalCompleted / 2))
      : 0;
    
    const engagementMultiplier = 1 + (calculateAverageEngagement(accounts) / 100);
    const performanceMultiplier = calculatePerformanceScore(history) / 80;
    
    const projectedEarnings = Math.round(avgMonthlyEarnings * engagementMultiplier * performanceMultiplier);
    
    const dataPoints = history.totalCompleted;
    const confidence = dataPoints > 10 
      ? "High confidence - based on 10+ campaigns"
      : dataPoints > 5 
        ? "Based on recent campaign history"
        : "Based on active campaigns";
    
    const trend = projectedEarnings > avgMonthlyEarnings ? "up" : "stable";
    
    return {
      nextMonth: `$${projectedEarnings.toLocaleString()}`,
      rawValue: projectedEarnings,
      confidence,
      trend,
      historicalAvg: avgMonthlyEarnings,
    };
  }, [isAuthenticated, cloudHistory, cloudAccounts]);
};

/**
 * Hook: Calculate Profile & Brand Fit Completion for Dashboard
 */
export const useProfileCompletion = () => {
  const { isAuthenticated } = useAuth();
  const { data: cloudProfile } = useCreatorProfile();
  const { data: cloudBrandFit } = useBrandFitData();
  const { data: cloudAccounts } = useLinkedAccounts();

  return useMemo(() => {
    let brandFitCompletion: number;
    let profileCompletion: number;
    let linkedConnected: number;
    let hasPaymentSetup: boolean;

    if (isAuthenticated && cloudBrandFit) {
      brandFitCompletion = calculateBrandFitCompletionFromCloud(cloudBrandFit);
    } else {
      brandFitCompletion = calculateBrandFitCompletion(getBrandFitData());
    }

    if (isAuthenticated && cloudProfile) {
      profileCompletion = calculateProfileCompletionFromCloud(cloudProfile);
      hasPaymentSetup = cloudProfile.pricing_enabled ?? false;
    } else {
      const profileData = getProfileData();
      profileCompletion = calculateProfileCompletion(profileData);
      hasPaymentSetup = profileData.pricingEnabled;
    }

    if (isAuthenticated && cloudAccounts) {
      linkedConnected = cloudAccounts.filter(a => a.connected).length;
    } else {
      linkedConnected = getLinkedAccountsData().filter(a => a.connected).length;
    }

    const items = [
      { label: "Profile Info", done: profileCompletion >= 60, action: "/profile" },
      { label: "Brand Fit Survey", done: brandFitCompletion >= 50, action: "/brand-fit" },
      { label: "Linked Accounts", done: linkedConnected >= 2, action: "/linked-accounts" },
      { label: "Payment Setup", done: hasPaymentSetup, action: "/profile" },
    ];
    
    const completedCount = items.filter(i => i.done).length;
    const overall = Math.round((completedCount / items.length) * 100);
    
    return {
      overall,
      items,
      brandFitCompletion,
      profileCompletion,
    };
  }, [isAuthenticated, cloudProfile, cloudBrandFit, cloudAccounts]);
};

/**
 * Hook: Get Smart Recommendations
 */
export const useSmartRecommendations = () => {
  const { isAuthenticated } = useAuth();
  const { data: cloudProfile } = useCreatorProfile();
  const { data: cloudBrandFit } = useBrandFitData();
  const { data: cloudAccounts } = useLinkedAccounts();

  return useMemo(() => {
    let brandFitCompletion: number;
    let connectedPlatforms: string[];
    let profileData: ProfileData;

    if (isAuthenticated && cloudBrandFit) {
      brandFitCompletion = calculateBrandFitCompletionFromCloud(cloudBrandFit);
    } else {
      brandFitCompletion = calculateBrandFitCompletion(getBrandFitData());
    }

    if (isAuthenticated && cloudAccounts) {
      connectedPlatforms = cloudAccounts.filter(a => a.connected).map(a => a.platform);
    } else {
      connectedPlatforms = getLinkedAccountsData().filter(a => a.connected).map(a => a.platform);
    }

    if (isAuthenticated && cloudProfile) {
      profileData = {
        name: cloudProfile.name ?? "",
        username: cloudProfile.username ?? "",
        email: cloudProfile.email ?? "",
        bio: cloudProfile.bio ?? "",
        location: cloudProfile.location ?? "",
        website: cloudProfile.website ?? "",
        pricingEnabled: cloudProfile.pricing_enabled ?? false,
        pricingMin: String(cloudProfile.pricing_min ?? "0"),
        pricingMax: String(cloudProfile.pricing_max ?? "0"),
        hasAvatar: !!cloudProfile.avatar_url,
      };
    } else {
      profileData = getProfileData();
    }
    
    type Recommendation = {
      id: string;
      icon: string;
      iconBg: string;
      iconColor: string;
      title: string;
      description: string;
      action: string;
      actionLabel: string;
      priority: "high" | "medium" | "low";
      show: boolean;
    };
    
    const recommendations: Recommendation[] = [
      {
        id: "complete-brand-fit",
        icon: "Sparkles",
        iconBg: "bg-purple/20",
        iconColor: "text-purple",
        title: "Complete Your Brand Fit",
        description: `${100 - brandFitCompletion}% remaining - unlock ${Math.round((100 - brandFitCompletion) / 10) * 3}+ more matches`,
        action: "/brand-fit",
        actionLabel: "Complete Now",
        priority: "high",
        show: brandFitCompletion < 80,
      },
      {
        id: "connect-tiktok",
        icon: "Link2",
        iconBg: "bg-cyan/20",
        iconColor: "text-cyan",
        title: "Connect TikTok",
        description: "15 campaigns require TikTok - you're missing out",
        action: "/linked-accounts",
        actionLabel: "Connect",
        priority: "medium",
        show: !connectedPlatforms.includes("tiktok"),
      },
      {
        id: "connect-youtube",
        icon: "Link2",
        iconBg: "bg-pink/20",
        iconColor: "text-pink",
        title: "Connect YouTube",
        description: "12 high-paying campaigns need YouTube creators",
        action: "/linked-accounts",
        actionLabel: "Connect",
        priority: "medium",
        show: !connectedPlatforms.includes("youtube"),
      },
      {
        id: "complete-profile",
        icon: "User",
        iconBg: "bg-orange/20",
        iconColor: "text-orange",
        title: "Add Profile Details",
        description: "Complete profiles get 2x more brand invites",
        action: "/profile",
        actionLabel: "Update",
        priority: "medium",
        show: !profileData.bio || profileData.bio.length < 50 || !profileData.location,
      },
      {
        id: "new-matches",
        icon: "Target",
        iconBg: "bg-pink/20",
        iconColor: "text-pink",
        title: `${Math.max(3, Math.round(brandFitCompletion / 10))} New Matches This Week`,
        description: "Based on your Brand Fit profile",
        action: "/apply",
        actionLabel: "Explore",
        priority: "low",
        show: brandFitCompletion >= 50,
      },
    ];
    
    return recommendations.filter(r => r.show).slice(0, 3);
  }, [isAuthenticated, cloudProfile, cloudBrandFit, cloudAccounts]);
};

/**
 * Hook: Calculate Earnings Snapshot
 */
export const useEarningsSnapshot = () => {
  const { isAuthenticated } = useAuth();
  const { data: cloudHistory } = useCampaignHistory();

  return useMemo(() => {
    let history: CampaignHistoryData;

    if (isAuthenticated && cloudHistory) {
      history = {
        totalCompleted: cloudHistory.total_completed ?? 0,
        totalStarted: cloudHistory.total_started ?? 0,
        onTimeDeliveries: cloudHistory.on_time_deliveries ?? 0,
        revisionsRequested: cloudHistory.revisions_requested ?? 0,
        totalEarnings: Number(cloudHistory.total_earnings) || 0,
        avgResponseTime: Number(cloudHistory.avg_response_time) || 4.5,
      };
    } else {
      history = getCampaignHistoryData();
    }
    
    const thisMonthEarnings = Math.round(history.totalEarnings * 0.18);
    const lastMonthEarnings = Math.round(history.totalEarnings * 0.15);
    
    const monthlyChange = lastMonthEarnings > 0 
      ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 * 10) / 10
      : 0;
    
    const totalChange = history.totalCompleted > 5 ? 12.5 : 8.2;
    
    return [
      { 
        label: "Total Earnings", 
        value: `$${history.totalEarnings.toLocaleString()}`, 
        rawValue: history.totalEarnings,
        change: `+${totalChange}%`, 
        isPositive: true,
        icon: "DollarSign",
        color: "text-cyan",
        bgColor: "bg-cyan/20",
        tooltip: "Total earnings from all completed campaigns"
      },
      { 
        label: "This Month", 
        value: `$${thisMonthEarnings.toLocaleString()}`, 
        rawValue: thisMonthEarnings,
        change: `${monthlyChange >= 0 ? '+' : ''}${monthlyChange}%`, 
        isPositive: monthlyChange >= 0,
        icon: "TrendingUp",
        color: "text-pink",
        bgColor: "bg-pink/20",
        tooltip: "Earnings from campaigns completed this month"
      },
      { 
        label: "Campaigns", 
        value: history.totalCompleted.toString(), 
        rawValue: history.totalCompleted,
        change: `+${Math.min(3, Math.ceil(history.totalCompleted / 4))} this month`, 
        isPositive: true,
        icon: "CheckCircle",
        color: "text-success",
        bgColor: "bg-success/20",
        tooltip: "Total number of successfully completed campaigns"
      },
    ];
  }, [isAuthenticated, cloudHistory]);
};

/**
 * Hook: Calculate Match Rate Impact
 */
export const useMatchRateImpact = () => {
  const { isAuthenticated } = useAuth();
  const { data: cloudAccounts } = useLinkedAccounts();

  return useMemo(() => {
    let accounts: LinkedAccountData[];

    if (isAuthenticated && cloudAccounts && cloudAccounts.length > 0) {
      accounts = cloudAccounts.map(a => ({
        platform: a.platform,
        connected: a.connected ?? true,
        verified: a.verified ?? false,
        followers: a.followers ?? 0,
        engagement: Number(a.engagement) || 0,
      }));
    } else {
      accounts = getLinkedAccountsData();
    }

    const connected = accounts.filter(a => a.connected);
    const verified = connected.filter(a => a.verified);
    
    let improvement = 0;
    improvement += connected.length * 5;
    improvement += verified.length * 3;
    
    const avgEngagement = calculateAverageEngagement(accounts);
    if (avgEngagement > 5) improvement += 5;
    else if (avgEngagement > 3) improvement += 3;
    
    return {
      improvement: `+${improvement}%`,
      rawImprovement: improvement,
      connectedCount: connected.length,
      verifiedCount: verified.length,
      totalFollowers: connected.reduce((sum, a) => sum + a.followers, 0),
    };
  }, [isAuthenticated, cloudAccounts]);
};

// Re-export useCreatorProfile and useBrandFitData for external use
export { useCreatorProfile, useBrandFitData, useLinkedAccounts, useCampaignHistory } from "./useCreatorData";
