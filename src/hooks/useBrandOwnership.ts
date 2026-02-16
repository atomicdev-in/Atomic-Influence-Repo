import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for Super Admins to transfer brand ownership
 */
export const useTransferBrandOwnership = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      brandId,
      newOwnerUserId,
    }: {
      brandId: string;
      newOwnerUserId: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("transfer_brand_ownership", {
        _brand_id: brandId,
        _new_owner_user_id: newOwnerUserId,
        _performed_by: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
      toast.success("Brand ownership transferred successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to transfer ownership:", error);
      toast.error(error.message || "Failed to transfer brand ownership");
    },
  });
};

/**
 * Fetch potential new owners (users with brand role)
 */
export const usePotentialBrandOwners = () => {
  return {
    fetchPotentialOwners: async (excludeUserId?: string) => {
      // Fetch users with brand role who could become owners
      const { data: brandUsers, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "brand");

      if (error) throw error;

      // Get their profiles
      const userIds = brandUsers?.map((u) => u.user_id) || [];
      const filteredIds = excludeUserId
        ? userIds.filter((id) => id !== excludeUserId)
        : userIds;

      if (filteredIds.length === 0) return [];

      // Get brand profiles (for brands) or creator profiles (for email)
      const { data: brandProfiles } = await supabase
        .from("brand_profiles")
        .select("user_id, email, company_name")
        .in("user_id", filteredIds);

      const { data: creatorProfiles } = await supabase
        .from("creator_profiles")
        .select("user_id, email, name")
        .in("user_id", filteredIds);

      // Merge data
      const profileMap = new Map<
        string,
        { email: string; name: string; user_id: string }
      >();

      brandProfiles?.forEach((p) => {
        profileMap.set(p.user_id, {
          user_id: p.user_id,
          email: p.email,
          name: p.company_name || "",
        });
      });

      creatorProfiles?.forEach((p) => {
        if (!profileMap.has(p.user_id)) {
          profileMap.set(p.user_id, {
            user_id: p.user_id,
            email: p.email,
            name: p.name || "",
          });
        }
      });

      return Array.from(profileMap.values());
    },
  };
};
