import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BrandProfileReadiness {
  isReady: boolean;
  hasLogo: boolean;
  hasCompanyName: boolean;
  hasBillingContact: boolean;
  hasDescription: boolean;
  hasWebsite: boolean;
  completionPercentage: number;
  missingFields: string[];
  isLoading: boolean;
}

/**
 * Hook to check if a brand's profile is ready for full platform access.
 * Brands must complete: logo, company name, and billing contact (email) to be considered ready.
 */
export const useBrandProfileReadiness = (): BrandProfileReadiness => {
  const { user, loading: authLoading } = useAuth();

  const { data: brandProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["brand-profile-readiness", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching brand profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  return useMemo(() => {
    const isLoading = authLoading || profileLoading;

    if (!brandProfile) {
      return {
        isReady: false,
        hasLogo: false,
        hasCompanyName: false,
        hasBillingContact: false,
        hasDescription: false,
        hasWebsite: false,
        completionPercentage: 0,
        missingFields: ["Company Logo", "Company Name", "Billing Contact Email"],
        isLoading,
      };
    }

    // Required fields for legitimacy
    const hasLogo = !!brandProfile.logo_url && brandProfile.logo_url.trim() !== "";
    const hasCompanyName = !!brandProfile.company_name && 
      brandProfile.company_name.trim() !== "" && 
      brandProfile.company_name !== "Unnamed Brand";
    const hasBillingContact = !!brandProfile.email && brandProfile.email.trim() !== "";

    // Optional fields for completion percentage
    const hasDescription = !!brandProfile.description && brandProfile.description.trim() !== "";
    const hasWebsite = !!brandProfile.website && brandProfile.website.trim() !== "";

    // Calculate missing required fields
    const missingFields: string[] = [];
    if (!hasLogo) missingFields.push("Company Logo");
    if (!hasCompanyName) missingFields.push("Company Name");
    if (!hasBillingContact) missingFields.push("Billing Contact Email");

    // Ready if all required fields are complete
    const isReady = hasLogo && hasCompanyName && hasBillingContact;

    // Calculate completion percentage (required + optional fields)
    const fields = [
      hasLogo,
      hasCompanyName,
      hasBillingContact,
      hasDescription,
      hasWebsite,
      !!brandProfile.industry,
      !!brandProfile.company_size,
    ];
    const completedFields = fields.filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / fields.length) * 100);

    return {
      isReady,
      hasLogo,
      hasCompanyName,
      hasBillingContact,
      hasDescription,
      hasWebsite,
      completionPercentage,
      missingFields,
      isLoading,
    };
  }, [brandProfile, authLoading, profileLoading]);
};
