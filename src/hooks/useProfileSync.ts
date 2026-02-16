import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to create or ensure a creator profile exists when a user signs up or logs in.
 * This should be used in the App component or a top-level provider.
 */
export const useProfileSync = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const ensureProfileExists = useCallback(async () => {
    if (!user?.id || !user?.email) return;

    try {
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // If profile doesn't exist, create one
      if (fetchError?.code === "PGRST116" || !existingProfile) {
        const defaultUsername = user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "creator";
        const defaultName = user.user_metadata?.full_name || user.user_metadata?.name || "";

        const { error: insertError } = await supabase
          .from("creator_profiles")
          .insert({
            user_id: user.id,
            email: user.email,
            name: defaultName,
            username: defaultUsername,
            bio: "",
            location: "",
            website: "",
            avatar_url: user.user_metadata?.avatar_url || "",
            pricing_enabled: false,
            pricing_min: 0,
            pricing_max: 0,
            pricing_currency: "USD",
            pricing_note: "",
          });

        if (insertError) {
          // If insert fails due to unique constraint, profile was created by another process
          if (insertError.code !== "23505") {
            console.error("Error creating profile:", insertError);
          }
        } else {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["creator-profile"] });
        }
      }

      // Also ensure brand_fit_data record exists
      const { data: existingBrandFit, error: brandFitError } = await supabase
        .from("brand_fit_data")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (brandFitError?.code === "PGRST116" || !existingBrandFit) {
        const { error: insertBrandFitError } = await supabase
          .from("brand_fit_data")
          .insert({
            user_id: user.id,
            brand_categories: [],
            content_styles: [],
            personal_assets: [],
            camera_comfort: "",
            driving_comfort: "",
            alcohol_openness: "",
            avoided_topics: "",
            creative_control: "",
            collaboration_type: "",
            audience_type: "",
          });

        if (insertBrandFitError && insertBrandFitError.code !== "23505") {
          console.error("Error creating brand fit data:", insertBrandFitError);
        } else {
          queryClient.invalidateQueries({ queryKey: ["brand-fit-data"] });
        }
      }

      // Also ensure campaign_history record exists
      const { data: existingHistory, error: historyError } = await supabase
        .from("campaign_history")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (historyError?.code === "PGRST116" || !existingHistory) {
        const { error: insertHistoryError } = await supabase
          .from("campaign_history")
          .insert({
            user_id: user.id,
            total_completed: 0,
            total_started: 0,
            total_earnings: 0,
            on_time_deliveries: 0,
            revisions_requested: 0,
            avg_response_time: 0,
          });

        if (insertHistoryError && insertHistoryError.code !== "23505") {
          console.error("Error creating campaign history:", insertHistoryError);
        } else {
          queryClient.invalidateQueries({ queryKey: ["campaign-history"] });
        }
      }
    } catch (error) {
      console.error("Profile sync error:", error);
    }
  }, [user?.id, user?.email, user?.user_metadata, queryClient]);

  // Run profile sync when user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      ensureProfileExists();
    }
  }, [isAuthenticated, user?.id, ensureProfileExists]);

  return { ensureProfileExists };
};
