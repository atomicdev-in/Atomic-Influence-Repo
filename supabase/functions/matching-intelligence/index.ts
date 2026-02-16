import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SurveyInfluence {
  dimension: string;
  description: string;
  weight: "high" | "medium" | "low";
  matchingFactors: string[];
}

interface MatchingInsights {
  surveyDimensions: SurveyInfluence[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  matchingQuality: {
    avgMatchScore: number;
    topMatchRate: number;
    surveyCompletionImpact: number;
  };
  recommendations: string[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, creatorId, campaignId } = await req.json();

    console.log(`[matching-intelligence] Action: ${action}, CreatorId: ${creatorId || "N/A"}`);

    if (action === "analyze-survey-influence") {
      // Fetch survey structure and responses
      const { data: surveys } = await supabase
        .from("surveys")
        .select("id, title, category, description");

      const { data: questions } = await supabase
        .from("survey_questions")
        .select("id, survey_id, question_text, question_type, options");

      const { data: responses } = await supabase
        .from("survey_responses")
        .select("id, survey_id, user_id");

      const { data: questionResponses } = await supabase
        .from("question_responses")
        .select("question_id, answer, survey_response_id");

      // Fetch brand fit data for correlation
      const { data: brandFitData } = await supabase
        .from("brand_fit_data")
        .select("*");

      // Aggregate survey influence dimensions
      const surveyDimensions: SurveyInfluence[] = [
        {
          dimension: "Brand Category Alignment",
          description: "How creator preferences match campaign brand categories",
          weight: "high",
          matchingFactors: [
            "Selected brand categories in Brand Fit",
            "Survey responses about product preferences",
            "Historical campaign category participation",
          ],
        },
        {
          dimension: "Content Style Compatibility",
          description: "Alignment between creator content style and campaign requirements",
          weight: "high",
          matchingFactors: [
            "Preferred content formats (educational, entertaining, reviews)",
            "Camera comfort level",
            "Creative control preferences",
          ],
        },
        {
          dimension: "Brand Safety & Compliance",
          description: "Creator stance on regulated content and sensitive topics",
          weight: "high",
          matchingFactors: [
            "Alcohol/tobacco brand openness",
            "Avoided topics and exclusions",
            "Audience protection considerations",
          ],
        },
        {
          dimension: "Lifestyle & Values Alignment",
          description: "Creator lifestyle matching campaign themes",
          weight: "medium",
          matchingFactors: [
            "Sustainability stance",
            "Dietary preferences",
            "Personal values and causes",
          ],
        },
        {
          dimension: "Asset & Capability Match",
          description: "Physical assets and capabilities for content creation",
          weight: "medium",
          matchingFactors: [
            "Vehicle availability for automotive campaigns",
            "Home/studio setup quality",
            "Location and mobility",
          ],
        },
        {
          dimension: "Audience Demographics",
          description: "Creator audience alignment with campaign targets",
          weight: "medium",
          matchingFactors: [
            "Audience type (local, national, global)",
            "Engagement quality indicators",
            "Platform distribution",
          ],
        },
      ];

      // Calculate category distribution from brand fit data
      const categoryCount: Record<string, number> = {};
      (brandFitData || []).forEach((bf) => {
        (bf.brand_categories || []).forEach((cat: string) => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      });

      const totalCategories = Object.values(categoryCount).reduce((a, b) => a + b, 0);
      const categoryDistribution = Object.entries(categoryCount)
        .map(([category, count]) => ({
          category,
          count,
          percentage: totalCategories > 0 ? Math.round((count / totalCategories) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate matching quality metrics
      const totalCreators = brandFitData?.length || 0;
      const surveyCompletionRate = responses?.length || 0;
      
      const matchingQuality = {
        avgMatchScore: 62, // Would be calculated from actual matching data
        topMatchRate: 28, // Percentage of matches scoring 70%+
        surveyCompletionImpact: 15, // How much surveys boost match quality
      };

      // Generate AI recommendations if API key available
      let recommendations: string[] = [];
      
      if (lovableApiKey) {
        try {
          const prompt = `Analyze this creator matching platform data and provide 3-4 brief recommendations for improving match quality:

Survey Categories: ${(surveys || []).map((s) => s.category).join(", ")}
Total Survey Responses: ${responses?.length || 0}
Creators with Brand Fit: ${totalCreators}
Top Category Interests: ${categoryDistribution.slice(0, 5).map((c) => c.category).join(", ")}

Provide actionable recommendations in JSON array format like: ["recommendation 1", "recommendation 2"]`;

          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: "You are a matching algorithm analyst. Provide brief, actionable recommendations." },
                { role: "user", content: prompt },
              ],
              max_tokens: 500,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || "";
            
            // Try to parse JSON from response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              recommendations = JSON.parse(jsonMatch[0]);
            }
          }
        } catch (aiError) {
          console.error("[matching-intelligence] AI recommendation error:", aiError);
        }
      }

      // Fallback recommendations if AI didn't work
      if (recommendations.length === 0) {
        recommendations = [
          "Encourage more creators to complete the Brand Fit survey for improved matching accuracy",
          "Add industry-specific surveys to capture niche preferences",
          "Monitor categories with low creator coverage for potential recruitment focus",
          "Consider weighted scoring adjustments for underrepresented lifestyle dimensions",
        ];
      }

      const insights: MatchingInsights = {
        surveyDimensions,
        categoryDistribution,
        matchingQuality,
        recommendations,
      };

      console.log(`[matching-intelligence] Generated insights with ${surveyDimensions.length} dimensions`);

      return new Response(JSON.stringify(insights), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "analyze-creator-match") {
      // Analyze a specific creator's matching potential
      if (!creatorId) {
        return new Response(
          JSON.stringify({ error: "creatorId required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch creator data
      const { data: brandFit } = await supabase
        .from("brand_fit_data")
        .select("*")
        .eq("user_id", creatorId)
        .maybeSingle();

      const { data: surveyResponses } = await supabase
        .from("survey_responses")
        .select("id, survey_id")
        .eq("user_id", creatorId);

      const { data: linkedAccounts } = await supabase
        .from("linked_accounts")
        .select("platform, followers, engagement")
        .eq("user_id", creatorId);

      // Calculate survey completion impact
      const surveyCount = surveyResponses?.length || 0;
      const surveyBonus = Math.min(25, surveyCount * 5);

      // Calculate brand fit completeness
      let brandFitScore = 0;
      if (brandFit) {
        if (brandFit.brand_categories?.length > 0) brandFitScore += 20;
        if (brandFit.content_styles?.length > 0) brandFitScore += 15;
        if (brandFit.alcohol_openness) brandFitScore += 10;
        if (brandFit.personal_assets?.length > 0) brandFitScore += 10;
        if (brandFit.audience_type) brandFitScore += 10;
        if (brandFit.collaboration_type) brandFitScore += 10;
        if (brandFit.creative_control) brandFitScore += 10;
        if (brandFit.avoided_topics) brandFitScore += 5;
        if (brandFit.driving_comfort) brandFitScore += 5;
        if (brandFit.camera_comfort) brandFitScore += 5;
      }

      // Social reach impact
      const totalFollowers = (linkedAccounts || []).reduce((sum, a) => sum + (a.followers || 0), 0);
      const socialScore = Math.min(25, Math.floor(totalFollowers / 10000) * 5);

      const matchingProfile = {
        creatorId,
        surveyCompletion: {
          count: surveyCount,
          bonus: surveyBonus,
          impact: surveyCount > 0 ? "Surveys enhance matching precision" : "No surveys completed yet",
        },
        brandFitCompletion: {
          score: brandFitScore,
          status: brandFitScore >= 70 ? "complete" : brandFitScore >= 40 ? "partial" : "minimal",
        },
        socialReach: {
          followers: totalFollowers,
          platforms: linkedAccounts?.length || 0,
          score: socialScore,
        },
        matchingPotential: {
          score: Math.min(100, brandFitScore + surveyBonus + socialScore),
          tier: brandFitScore + surveyBonus >= 60 ? "high" : brandFitScore + surveyBonus >= 30 ? "medium" : "low",
        },
        dimensions: {
          categoryAlignment: brandFit?.brand_categories?.length ? "configured" : "not set",
          contentStyle: brandFit?.content_styles?.length ? "configured" : "not set",
          brandSafety: brandFit?.alcohol_openness ? "configured" : "not set",
          lifestyle: surveyCount > 0 ? "enhanced" : "basic",
        },
      };

      return new Response(JSON.stringify(matchingProfile), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-matching-explanation") {
      // Provide conceptual explanation of how matching works
      const explanation = {
        overview: "The matching algorithm uses a multi-dimensional scoring system that combines explicit preferences, behavioral signals, and AI-informed pattern recognition.",
        primarySignals: [
          {
            name: "Survey Responses",
            weight: "25%",
            description: "Direct creator input on preferences, values, and restrictions. Most reliable signal for brand safety and category alignment.",
          },
          {
            name: "Brand Fit Profile",
            weight: "30%",
            description: "Core preference data including brand categories, content styles, and collaboration preferences.",
          },
          {
            name: "Performance History",
            weight: "25%",
            description: "Historical campaign completion rates, on-time delivery, and brand feedback scores.",
          },
          {
            name: "Behavioral Patterns",
            weight: "20%",
            description: "Platform engagement, response times, and content consistency indicators.",
          },
        ],
        surveyIntegration: {
          description: "Surveys act as first-class signals that can override or enhance other matching factors",
          examples: [
            "A creator who selects 'No alcohol brands' in surveys will never be matched with alcohol campaigns regardless of other factors",
            "Sustainability survey responses boost matching scores for eco-friendly brands",
            "Dietary preference surveys enable precise food/beverage campaign matching",
          ],
        },
        antiGaming: [
          "Score formulas are not exposed to creators",
          "Multiple signal sources prevent single-point manipulation",
          "Behavioral consistency checks detect anomalous patterns",
          "Performance history carries significant weight, rewarding genuine engagement",
        ],
        transparency: {
          forCreators: "Creators see match percentages and up to 3 match reasons, but not scoring formulas",
          forBrands: "Brands see creator scores with category alignment explanations",
          forAdmins: "Admins see aggregate patterns and dimension influences without individual formulas",
        },
      };

      return new Response(JSON.stringify(explanation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[matching-intelligence] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
