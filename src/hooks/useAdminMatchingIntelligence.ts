import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Admin Matching Intelligence Hook
 * 
 * Provides insights into how survey data and other signals
 * influence the creator-campaign matching algorithm.
 */

export interface SurveyInfluence {
  dimension: string;
  description: string;
  weight: "high" | "medium" | "low";
  matchingFactors: string[];
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface MatchingQuality {
  avgMatchScore: number;
  topMatchRate: number;
  surveyCompletionImpact: number;
}

export interface MatchingInsights {
  surveyDimensions: SurveyInfluence[];
  categoryDistribution: CategoryDistribution[];
  matchingQuality: MatchingQuality;
  recommendations: string[];
}

export interface MatchingExplanation {
  overview: string;
  primarySignals: {
    name: string;
    weight: string;
    description: string;
  }[];
  surveyIntegration: {
    description: string;
    examples: string[];
  };
  antiGaming: string[];
  transparency: {
    forCreators: string;
    forBrands: string;
    forAdmins: string;
  };
}

export interface SurveyMatchingStats {
  totalCreators: number;
  creatorsWithBrandFit: number;
  creatorsWithSurveys: number;
  avgSurveysPerCreator: number;
  surveyCompletionRate: number;
  categoryBreakdown: CategoryDistribution[];
  surveyBreakdown: { surveyId: string; title: string; responses: number }[];
}

/**
 * Fetch matching insights from the edge function
 */
export const useMatchingInsights = () => {
  return useQuery({
    queryKey: ["admin", "matching-intelligence", "insights"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("matching-intelligence", {
        body: { action: "analyze-survey-influence" },
      });

      if (error) throw error;
      return data as MatchingInsights;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Fetch matching algorithm explanation
 */
export const useMatchingExplanation = () => {
  return useQuery({
    queryKey: ["admin", "matching-intelligence", "explanation"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("matching-intelligence", {
        body: { action: "get-matching-explanation" },
      });

      if (error) throw error;
      return data as MatchingExplanation;
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes (rarely changes)
  });
};

/**
 * Fetch survey-based matching statistics from database directly
 */
export const useSurveyMatchingStats = () => {
  return useQuery({
    queryKey: ["admin", "matching-intelligence", "survey-stats"],
    queryFn: async () => {
      // Fetch data in parallel
      const [
        creatorsResult,
        brandFitResult,
        surveyResponsesResult,
        surveysResult,
      ] = await Promise.all([
        supabase.from("creator_profiles").select("user_id", { count: "exact" }),
        supabase.from("brand_fit_data").select("user_id, brand_categories"),
        supabase.from("survey_responses").select("user_id, survey_id"),
        supabase.from("surveys").select("id, title, category"),
      ]);

      const creators = creatorsResult.data || [];
      const brandFitData = brandFitResult.data || [];
      const surveyResponses = surveyResponsesResult.data || [];
      const surveys = surveysResult.data || [];

      // Unique users with surveys
      const usersWithSurveys = new Set(surveyResponses.map((r) => r.user_id));
      const usersWithBrandFit = new Set(brandFitData.map((bf) => bf.user_id));

      // Category breakdown from brand fit
      const categoryCount: Record<string, number> = {};
      brandFitData.forEach((bf) => {
        (bf.brand_categories || []).forEach((cat: string) => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      });

      const totalCategoryEntries = Object.values(categoryCount).reduce((a, b) => a + b, 0);
      const categoryBreakdown: CategoryDistribution[] = Object.entries(categoryCount)
        .map(([category, count]) => ({
          category,
          count,
          percentage: totalCategoryEntries > 0 ? Math.round((count / totalCategoryEntries) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Survey response breakdown
      const surveyResponseCounts: Record<string, number> = {};
      surveyResponses.forEach((r) => {
        surveyResponseCounts[r.survey_id] = (surveyResponseCounts[r.survey_id] || 0) + 1;
      });

      const surveyBreakdown = surveys.map((s) => ({
        surveyId: s.id,
        title: s.title,
        responses: surveyResponseCounts[s.id] || 0,
      })).sort((a, b) => b.responses - a.responses);

      const totalCreators = creators.length;

      return {
        totalCreators,
        creatorsWithBrandFit: usersWithBrandFit.size,
        creatorsWithSurveys: usersWithSurveys.size,
        avgSurveysPerCreator: usersWithSurveys.size > 0 
          ? Math.round((surveyResponses.length / usersWithSurveys.size) * 10) / 10 
          : 0,
        surveyCompletionRate: totalCreators > 0 
          ? Math.round((usersWithSurveys.size / totalCreators) * 100) 
          : 0,
        categoryBreakdown,
        surveyBreakdown,
      } as SurveyMatchingStats;
    },
  });
};

/**
 * Fetch creator-level matching profile
 */
export const useCreatorMatchingProfile = (creatorId: string | null) => {
  return useQuery({
    queryKey: ["admin", "matching-intelligence", "creator-profile", creatorId],
    enabled: !!creatorId,
    queryFn: async () => {
      if (!creatorId) return null;

      const { data, error } = await supabase.functions.invoke("matching-intelligence", {
        body: { action: "analyze-creator-match", creatorId },
      });

      if (error) throw error;
      return data;
    },
  });
};
