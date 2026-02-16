import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorProfile, useBrandFitData, useLinkedAccounts } from "@/hooks/useCreatorData";

export interface ProfileReadiness {
  isReady: boolean;
  isProfileComplete: boolean;
  hasLinkedAccounts: boolean;
  hasBrandFit: boolean;
  hasMultipleAccounts: boolean;
  linkedAccountsCount: number;
  brandFitCompletion: number;
  isLoading: boolean;
}

/**
 * Hook to check if a creator's profile is ready for full platform access.
 * Dashboard is always accessible - no gating based on profile completion.
 * Profile completion metrics are still tracked for optional reminders.
 */
export const useProfileReadiness = (): ProfileReadiness => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: cloudAccounts, isLoading: accountsLoading } = useLinkedAccounts();
  const { data: cloudBrandFit, isLoading: brandFitLoading } = useBrandFitData();

  return useMemo(() => {
    const isLoading = authLoading || accountsLoading || brandFitLoading;

    // Count connected accounts
    const linkedAccountsCount = cloudAccounts?.filter(a => a.connected)?.length || 0;
    const hasLinkedAccounts = linkedAccountsCount >= 1;

    // Calculate Brand Fit completion
    let brandFitCompletion = 0;
    if (cloudBrandFit) {
      const fields = [
        (cloudBrandFit.brand_categories?.length || 0) > 0,
        (cloudBrandFit.content_styles?.length || 0) > 0,
        (cloudBrandFit.personal_assets?.length || 0) > 0,
        !!cloudBrandFit.camera_comfort,
        !!cloudBrandFit.driving_comfort,
        !!cloudBrandFit.alcohol_openness,
        !!cloudBrandFit.avoided_topics,
        !!cloudBrandFit.creative_control,
        !!cloudBrandFit.collaboration_type,
        !!cloudBrandFit.audience_type,
      ];
      const completedFields = fields.filter(Boolean).length;
      brandFitCompletion = Math.round((completedFields / fields.length) * 100);
    }

    const hasBrandFit = brandFitCompletion >= 30;
    const hasMultipleAccounts = linkedAccountsCount >= 2;
    
    // Dashboard is always ready - no gating on first access
    const isReady = true;
    
    // Full profile completion (for optional reminders) requires multiple accounts + Brand Fit
    const isProfileComplete = hasMultipleAccounts && hasBrandFit;

    return {
      isReady,
      isProfileComplete,
      hasLinkedAccounts,
      hasBrandFit,
      hasMultipleAccounts,
      linkedAccountsCount,
      brandFitCompletion,
      isLoading: isLoading && isAuthenticated,
    };
  }, [isAuthenticated, authLoading, cloudAccounts, accountsLoading, cloudBrandFit, brandFitLoading]);
};
