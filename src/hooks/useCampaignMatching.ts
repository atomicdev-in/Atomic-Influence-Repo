import { useMemo } from "react";
import { calculateBrandFitCompletion, getBrandFitData } from "./useCreatorScoring";
import { getSurveyScoreData } from "./useSurveyScoring";

/**
 * Campaign Matching Hook
 * 
 * Calculates AI-powered match scores between creator Brand Fit profiles and campaigns.
 * 
 * Score Breakdown (up to 100 points):
 * - Category matching: up to 40 points (based on brand preferences)
 * - Content style matching: up to 20 points (based on content type alignment)
 * - Regulated brand compatibility: up to 15 points (alcohol/regulated brands)
 * - Vehicle/driving content: up to 10 points (if campaign requires vehicle)
 * - Asset matching: up to 15 points (gym, home, studio, etc.)
 * - Avoided topics penalty: -40 points (if campaign contains avoided keywords)
 * 
 * Campaigns with 70%+ are marked as "top matches"
 * Campaigns with <40% are filtered out when Brand Fit is complete
 */

interface BrandFitData {
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

interface Campaign {
  id: string;
  imageUrl: string;
  commission: number;
  categories: string[];
  campaignName: string;
  isNew: boolean;
  requirementMet: boolean;
  language: string;
  country: string;
  countryFlag: string;
  socials: string[];
  // Additional campaign metadata for matching
  isRegulated?: boolean;
  requiresVehicle?: boolean;
  contentType?: string[];
  cameraRequirement?: string;
  audienceTarget?: string;
  collaborationLength?: string;
  creativeControlLevel?: string;
}

interface MatchedCampaign extends Campaign {
  matchScore: number;
  matchReasons: string[];
  isTopMatch: boolean;
}

// Category mapping from Brand Fit to Campaign categories
const categoryMapping: Record<string, string[]> = {
  "Fashion & Apparel": ["Fashion", "Streetwear", "Jewelry", "Apparel"],
  "Beauty & Skincare": ["Beauty", "Skincare", "Fragrances", "Cosmetics"],
  "Tech & Gadgets": ["Tech", "Audio", "Photography", "Digital Marketing", "Business"],
  "Health & Wellness": ["Health", "Wellness", "Fitness", "Sports"],
  "Food & Beverage": ["Food", "Beverage", "Cooking", "Nutrition"],
  "Travel & Hospitality": ["Travel", "Hospitality", "Adventure"],
  "Fitness & Sports": ["Fitness", "Sports", "Athletic"],
  "Home & Lifestyle": ["Home", "Lifestyle", "Interior"],
  "Finance & Banking": ["Finance", "Banking", "Investment", "Business"],
  "Automotive": ["Automotive", "Cars", "Vehicles"],
  "Gaming & Entertainment": ["Gaming", "Entertainment", "Media"],
  "Education & Learning": ["Education", "Learning", "Courses"],
  "Sustainable & Eco-friendly": ["Sustainability", "Eco", "Green", "Ethical"],
  "Luxury & Premium": ["Luxury", "Premium", "High-end"],
  "Family & Parenting": ["Family", "Parenting", "Kids", "Children"],
};

// Content style mapping
const contentStyleMapping: Record<string, string[]> = {
  "Educational": ["educational", "tutorial", "how-to"],
  "Entertaining": ["entertaining", "fun", "engaging"],
  "Storytelling": ["storytelling", "narrative", "story"],
  "Reviews": ["review", "unboxing", "comparison"],
  "Lifestyle": ["lifestyle", "daily", "vlog"],
  "Comedy": ["comedy", "funny", "humor"],
  "Tutorials": ["tutorial", "how-to", "guide"],
  "Trends": ["trends", "trending", "viral"],
  "Behind-the-scenes": ["bts", "behind-the-scenes", "making-of"],
  "Day-in-the-life": ["day-in-the-life", "routine", "daily"],
};

export const useCampaignMatching = (campaigns: Campaign[]) => {
  // Use centralized Brand Fit data retrieval
  const brandFitData = useMemo(() => getBrandFitData(), []);
  
  // Get survey scoring data for enhanced matching
  const surveyData = useMemo(() => getSurveyScoreData(), []);
  
  // Use centralized completion calculation + survey bonus
  const brandFitCompletion = useMemo(() => {
    const baseCompletion = calculateBrandFitCompletion(brandFitData);
    // Add survey bonus (each completed survey adds 5% to effective completion)
    const surveyBonus = surveyData.totalSurveysCompleted * 5;
    return Math.min(100, baseCompletion + surveyBonus);
  }, [brandFitData, surveyData]);

  const matchedCampaigns = useMemo((): MatchedCampaign[] => {
    if (!brandFitData || brandFitCompletion < 30) {
      // Return all campaigns without scoring if Brand Fit is incomplete
      return campaigns.map(campaign => ({
        ...campaign,
        matchScore: 0,
        matchReasons: [],
        isTopMatch: false,
      }));
    }

    const scoredCampaigns = campaigns.map(campaign => {
      let score = 0;
      const matchReasons: string[] = [];

      // 1. Category matching (up to 40 points)
      const categoryScore = calculateCategoryMatch(
        brandFitData.brandCategories,
        campaign.categories
      );
      score += categoryScore.score;
      if (categoryScore.matched.length > 0) {
        matchReasons.push(`Matches your ${categoryScore.matched.slice(0, 2).join(", ")} interests`);
      }

      // 2. Content style matching (up to 20 points)
      if (brandFitData.contentStyles.length > 0 && campaign.contentType) {
        const styleMatch = calculateContentStyleMatch(
          brandFitData.contentStyles,
          campaign.contentType
        );
        score += styleMatch;
        if (styleMatch > 10) {
          matchReasons.push("Matches your content style");
        }
      } else if (brandFitData.contentStyles.length > 0) {
        // Default bonus if campaign doesn't specify content type
        score += 10;
      }

      // 3. Regulated brand filtering (up to 15 points or disqualify)
      // Enhanced with survey data
      if (campaign.isRegulated) {
        // First check survey alcohol preference
        if (surveyData.alcoholComfort === "no") {
          score -= 60; // Strong penalty from explicit survey answer
          matchReasons.push("Conflicts with your alcohol preference");
        } else if (surveyData.alcoholComfort === "restricted" || surveyData.alcoholComfort === "limited") {
          score += 5;
        } else if (surveyData.alcoholComfort === "yes") {
          score += 15;
          matchReasons.push("Matches your regulated brand preference");
        } else if (brandFitData.alcoholOpenness === "no") {
          score -= 50; // Fallback to Brand Fit data
        } else if (brandFitData.alcoholOpenness === "yes_guidelines") {
          score += 10;
          matchReasons.push("Regulated brand (within your guidelines)");
        } else if (brandFitData.alcoholOpenness === "yes") {
          score += 15;
        }
      } else {
        score += 10; // Bonus for non-regulated brands
      }

      // 4. Vehicle/driving content matching (up to 10 points)
      if (campaign.requiresVehicle) {
        if (brandFitData.drivingComfort === "not_comfortable") {
          score -= 30;
        } else if (brandFitData.drivingComfort === "very_comfortable") {
          score += 10;
          matchReasons.push("Fits your driving content comfort");
        } else if (brandFitData.drivingComfort === "somewhat_comfortable") {
          score += 5;
        }
      }

      // 5. Asset matching bonus (up to 15 points)
      const assetBonus = calculateAssetMatch(brandFitData.personalAssets, campaign);
      score += assetBonus.score;
      if (assetBonus.reason) {
        matchReasons.push(assetBonus.reason);
      }

      // 6. Survey-based content affinity bonuses (up to 15 points)
      const campaignText = `${campaign.campaignName} ${campaign.categories.join(" ")}`.toLowerCase();
      
      if (surveyData.contentAffinities.foodContent && 
          (campaignText.includes("food") || campaignText.includes("cooking") || campaignText.includes("beverage"))) {
        score += 10;
        matchReasons.push("Matches your food content focus");
      }
      
      if (surveyData.contentAffinities.fitnessContent && 
          (campaignText.includes("fitness") || campaignText.includes("wellness") || campaignText.includes("health"))) {
        score += 10;
        matchReasons.push("Aligns with your fitness focus");
      }
      
      if (surveyData.contentAffinities.sustainabilityContent && 
          (campaignText.includes("sustainable") || campaignText.includes("eco") || campaignText.includes("green"))) {
        score += 10;
        matchReasons.push("Matches your sustainability values");
      }

      // 7. Sustainability stance from survey (up to 10 points)
      if (surveyData.sustainabilityStance === "strict" || surveyData.sustainabilityStance === "preferred") {
        if (campaignText.includes("sustainable") || campaignText.includes("eco") || campaignText.includes("ethical")) {
          score += 10;
        }
        // Penalty for fast fashion if strict
        if (surveyData.sustainabilityStance === "strict" && campaignText.includes("fast fashion")) {
          score -= 20;
        }
      }

      // 8. Avoided topics check (can disqualify)
      if (brandFitData.avoidedTopics.trim()) {
        const avoidedKeywords = brandFitData.avoidedTopics
          .toLowerCase()
          .split(/[,\n]/)
          .map(k => k.trim())
          .filter(k => k.length > 2);
        
        const hasAvoidedTopic = avoidedKeywords.some(keyword => 
          campaignText.includes(keyword)
        );
        
        if (hasAvoidedTopic) {
          score -= 40;
        }
      }

      // 9. Survey completion bonus (encourages completing more surveys)
      if (surveyData.totalSurveysCompleted > 0) {
        score += surveyData.totalSurveysCompleted * 2; // 2 points per completed survey
      }

      // Ensure score is between 0-100
      const normalizedScore = Math.max(0, Math.min(100, score));

      return {
        ...campaign,
        matchScore: normalizedScore,
        matchReasons: matchReasons.slice(0, 3), // Limit to 3 reasons
        isTopMatch: normalizedScore >= 70,
      };
    });

    // Sort by match score (highest first), then by isNew
    return scoredCampaigns.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    });
  }, [campaigns, brandFitData, brandFitCompletion, surveyData]);

  // Filter to show only good matches (score >= 40) or all if no Brand Fit data
  const filteredCampaigns = useMemo(() => {
    if (!brandFitData || brandFitCompletion < 30) {
      return matchedCampaigns;
    }
    return matchedCampaigns.filter(c => c.matchScore >= 40);
  }, [matchedCampaigns, brandFitData, brandFitCompletion]);

  return {
    matchedCampaigns: filteredCampaigns,
    allCampaigns: matchedCampaigns,
    hasBrandFitData: !!brandFitData && brandFitCompletion >= 30,
    brandFitCompletion,
    topMatchCount: matchedCampaigns.filter(c => c.isTopMatch).length,
  };
};

function calculateCategoryMatch(
  userCategories: string[],
  campaignCategories: string[]
): { score: number; matched: string[] } {
  const matched: string[] = [];
  let score = 0;

  for (const userCat of userCategories) {
    const mappedCategories = categoryMapping[userCat] || [userCat];
    for (const campaignCat of campaignCategories) {
      if (mappedCategories.some(m => 
        campaignCat.toLowerCase().includes(m.toLowerCase()) ||
        m.toLowerCase().includes(campaignCat.toLowerCase())
      )) {
        matched.push(userCat);
        score += 15;
        break;
      }
    }
  }

  return { score: Math.min(40, score), matched: [...new Set(matched)] };
}

function calculateContentStyleMatch(
  userStyles: string[],
  campaignStyles: string[]
): number {
  let matches = 0;
  
  for (const userStyle of userStyles) {
    const mappedStyles = contentStyleMapping[userStyle] || [userStyle.toLowerCase()];
    for (const campaignStyle of campaignStyles) {
      if (mappedStyles.some(m => 
        campaignStyle.toLowerCase().includes(m) ||
        m.includes(campaignStyle.toLowerCase())
      )) {
        matches++;
        break;
      }
    }
  }

  return Math.min(20, matches * 7);
}

function calculateAssetMatch(
  userAssets: string[],
  campaign: Campaign
): { score: number; reason: string | null } {
  // Check campaign name and categories for asset-related keywords
  const campaignText = `${campaign.campaignName} ${campaign.categories.join(" ")}`.toLowerCase();
  
  const assetKeywords: Record<string, string[]> = {
    car: ["car", "vehicle", "driving", "automotive", "road"],
    gym: ["fitness", "gym", "workout", "athletic", "sports"],
    home: ["home", "interior", "lifestyle", "living"],
    studio: ["photography", "creative", "studio", "professional"],
    travel: ["travel", "adventure", "destination", "hospitality"],
    office: ["business", "professional", "corporate", "office"],
  };

  for (const asset of userAssets) {
    const keywords = assetKeywords[asset] || [];
    if (keywords.some(k => campaignText.includes(k))) {
      return {
        score: 15,
        reason: `Uses your ${asset} for content`,
      };
    }
  }

  return { score: 0, reason: null };
}

export type { MatchedCampaign, Campaign };
