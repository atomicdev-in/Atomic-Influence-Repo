import { useMemo } from "react";

/**
 * Survey Scoring Integration Hook
 * 
 * Calculates scoring bonuses based on completed survey responses.
 * Survey data feeds into the Brand Fit algorithm for improved campaign matching.
 * 
 * Scoring Impact:
 * - Each completed survey adds up to 10 points to overall Brand Fit score
 * - Specific answers can unlock campaign categories or apply filters
 * - Survey responses are weighted based on their relevance to campaign matching
 */

export interface SurveyResponse {
  surveyId: string;
  questionId: string;
  answer: string;
}

export interface SurveyScoreResult {
  totalSurveysCompleted: number;
  totalSurveys: number;
  surveyCompletionBonus: number;
  dietaryPreference: string | null;
  sustainabilityStance: string | null;
  alcoholComfort: string | null;
  regulatedBrandPreferences: {
    tobacco: boolean;
    gambling: boolean;
    pharma: boolean;
  };
  contentAffinities: {
    foodContent: boolean;
    fitnessContent: boolean;
    sustainabilityContent: boolean;
  };
}

// Get mock survey responses from localStorage
const getMockSurveyResponses = (): Record<string, { answers: Record<string, string>; completedAt: string }> => {
  try {
    const stored = localStorage.getItem("mockSurveyResponses");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Get completed mock survey IDs
const getCompletedMockSurveyIds = (): string[] => {
  try {
    const stored = localStorage.getItem("completedMockSurveys");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Parse diet preference from survey answer
 */
const parseDietaryPreference = (answer: string): string => {
  if (answer.includes("Vegan")) return "vegan";
  if (answer.includes("Vegetarian")) return "vegetarian";
  if (answer.includes("Pescatarian")) return "pescatarian";
  if (answer.includes("Flexitarian")) return "flexitarian";
  if (answer.includes("Keto")) return "keto";
  if (answer.includes("Omnivore")) return "omnivore";
  return "unspecified";
};

/**
 * Parse sustainability stance from survey answer
 */
const parseSustainabilityStance = (answer: string): string => {
  if (answer.includes("Very important")) return "strict";
  if (answer.includes("Important -")) return "preferred";
  if (answer.includes("Somewhat important")) return "flexible";
  if (answer.includes("Not important")) return "neutral";
  return "contextual";
};

/**
 * Parse alcohol comfort level from survey answer
 */
const parseAlcoholComfort = (answer: string): string => {
  if (answer.includes("Very comfortable")) return "yes";
  if (answer.includes("Somewhat comfortable")) return "limited";
  if (answer.includes("Limited")) return "restricted";
  if (answer.includes("Not comfortable")) return "no";
  return "contextual";
};

/**
 * Hook to calculate survey-based scoring data
 */
export const useSurveyScoring = (): SurveyScoreResult => {
  return useMemo(() => {
    const completedIds = getCompletedMockSurveyIds();
    const responses = getMockSurveyResponses();
    
    const totalSurveys = 3; // Total mock surveys
    const totalSurveysCompleted = completedIds.length;
    
    // Calculate completion bonus (up to 15 points total, 5 per survey)
    const surveyCompletionBonus = Math.min(15, totalSurveysCompleted * 5);
    
    // Extract specific preferences from responses
    let dietaryPreference: string | null = null;
    let sustainabilityStance: string | null = null;
    let alcoholComfort: string | null = null;
    
    const regulatedBrandPreferences = {
      tobacco: true, // Default to allowed
      gambling: true,
      pharma: true,
    };
    
    const contentAffinities = {
      foodContent: false,
      fitnessContent: false,
      sustainabilityContent: false,
    };
    
    // Parse Diet & Lifestyle Survey
    const dietSurvey = responses["mock-diet-lifestyle"];
    if (dietSurvey?.answers) {
      const answers = dietSurvey.answers;
      
      // Q1: Dietary preference
      if (answers["q1-diet"]) {
        dietaryPreference = parseDietaryPreference(answers["q1-diet"]);
      }
      
      // Q2: Food content frequency
      if (answers["q2-diet-content"]) {
        const foodAnswer = answers["q2-diet-content"];
        contentAffinities.foodContent = 
          foodAnswer.includes("Very frequently") || 
          foodAnswer.includes("Often");
      }
      
      // Q4: Fitness focus
      if (answers["q4-fitness"]) {
        const fitnessAnswer = answers["q4-fitness"];
        contentAffinities.fitnessContent = 
          fitnessAnswer.includes("central to my brand") || 
          fitnessAnswer.includes("regularly share");
      }
    }
    
    // Parse Climate & Sustainability Survey
    const climateSurvey = responses["mock-climate-sustainability"];
    if (climateSurvey?.answers) {
      const answers = climateSurvey.answers;
      
      // Q1: Sustainability importance
      if (answers["q1-climate"]) {
        sustainabilityStance = parseSustainabilityStance(answers["q1-climate"]);
      }
      
      // Q2: Eco content creation
      if (answers["q2-eco-content"]) {
        const ecoAnswer = answers["q2-eco-content"];
        contentAffinities.sustainabilityContent = 
          ecoAnswer.includes("core part") || 
          ecoAnswer.includes("Occasionally");
      }
    }
    
    // Parse Alcohol & Regulated Brands Survey
    const alcoholSurvey = responses["mock-alcohol-regulated"];
    if (alcoholSurvey?.answers) {
      const answers = alcoholSurvey.answers;
      
      // Q1: Alcohol comfort
      if (answers["q1-alcohol"]) {
        alcoholComfort = parseAlcoholComfort(answers["q1-alcohol"]);
      }
      
      // Q2: Tobacco/vaping/CBD
      if (answers["q2-tobacco"]) {
        const tobaccoAnswer = answers["q2-tobacco"];
        regulatedBrandPreferences.tobacco = !tobaccoAnswer.includes("avoid all");
      }
      
      // Q3: Gambling
      if (answers["q3-gambling"]) {
        const gamblingAnswer = answers["q3-gambling"];
        regulatedBrandPreferences.gambling = !gamblingAnswer.includes("avoid all");
      }
      
      // Q4: Pharma
      if (answers["q4-pharma"]) {
        const pharmaAnswer = answers["q4-pharma"];
        regulatedBrandPreferences.pharma = !pharmaAnswer.includes("avoid");
      }
    }
    
    return {
      totalSurveysCompleted,
      totalSurveys,
      surveyCompletionBonus,
      dietaryPreference,
      sustainabilityStance,
      alcoholComfort,
      regulatedBrandPreferences,
      contentAffinities,
    };
  }, []);
};

/**
 * Get survey scoring data synchronously (for use outside React components)
 */
export const getSurveyScoreData = (): SurveyScoreResult => {
  const completedIds = getCompletedMockSurveyIds();
  const responses = getMockSurveyResponses();
  
  const totalSurveys = 3;
  const totalSurveysCompleted = completedIds.length;
  const surveyCompletionBonus = Math.min(15, totalSurveysCompleted * 5);
  
  let dietaryPreference: string | null = null;
  let sustainabilityStance: string | null = null;
  let alcoholComfort: string | null = null;
  
  const regulatedBrandPreferences = {
    tobacco: true,
    gambling: true,
    pharma: true,
  };
  
  const contentAffinities = {
    foodContent: false,
    fitnessContent: false,
    sustainabilityContent: false,
  };
  
  // Parse responses (same logic as hook)
  const dietSurvey = responses["mock-diet-lifestyle"];
  if (dietSurvey?.answers) {
    if (dietSurvey.answers["q1-diet"]) {
      dietaryPreference = parseDietaryPreference(dietSurvey.answers["q1-diet"]);
    }
    if (dietSurvey.answers["q2-diet-content"]) {
      contentAffinities.foodContent = 
        dietSurvey.answers["q2-diet-content"].includes("Very frequently") || 
        dietSurvey.answers["q2-diet-content"].includes("Often");
    }
    if (dietSurvey.answers["q4-fitness"]) {
      contentAffinities.fitnessContent = 
        dietSurvey.answers["q4-fitness"].includes("central") || 
        dietSurvey.answers["q4-fitness"].includes("regularly");
    }
  }
  
  const climateSurvey = responses["mock-climate-sustainability"];
  if (climateSurvey?.answers) {
    if (climateSurvey.answers["q1-climate"]) {
      sustainabilityStance = parseSustainabilityStance(climateSurvey.answers["q1-climate"]);
    }
    if (climateSurvey.answers["q2-eco-content"]) {
      contentAffinities.sustainabilityContent = 
        climateSurvey.answers["q2-eco-content"].includes("core") || 
        climateSurvey.answers["q2-eco-content"].includes("Occasionally");
    }
  }
  
  const alcoholSurvey = responses["mock-alcohol-regulated"];
  if (alcoholSurvey?.answers) {
    if (alcoholSurvey.answers["q1-alcohol"]) {
      alcoholComfort = parseAlcoholComfort(alcoholSurvey.answers["q1-alcohol"]);
    }
    if (alcoholSurvey.answers["q2-tobacco"]) {
      regulatedBrandPreferences.tobacco = !alcoholSurvey.answers["q2-tobacco"].includes("avoid");
    }
    if (alcoholSurvey.answers["q3-gambling"]) {
      regulatedBrandPreferences.gambling = !alcoholSurvey.answers["q3-gambling"].includes("avoid");
    }
    if (alcoholSurvey.answers["q4-pharma"]) {
      regulatedBrandPreferences.pharma = !alcoholSurvey.answers["q4-pharma"].includes("avoid");
    }
  }
  
  return {
    totalSurveysCompleted,
    totalSurveys,
    surveyCompletionBonus,
    dietaryPreference,
    sustainabilityStance,
    alcoholComfort,
    regulatedBrandPreferences,
    contentAffinities,
  };
};
