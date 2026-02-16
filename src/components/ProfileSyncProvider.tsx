import { useProfileSync } from "@/hooks/useProfileSync";

/**
 * Provider component that syncs user profile data on authentication.
 * This ensures that creator_profiles, brand_fit_data, and campaign_history
 * records exist when a user signs up or logs in.
 */
export function ProfileSyncProvider({ children }: { children: React.ReactNode }) {
  // This hook handles all the profile sync logic
  useProfileSync();
  
  return <>{children}</>;
}
