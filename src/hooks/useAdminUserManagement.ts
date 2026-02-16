import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "creator" | "brand" | "admin";

export interface AdminUser {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  // Joined profile data
  email?: string;
  name?: string;
  avatar_url?: string;
  profile_type?: "creator" | "brand" | null;
}

interface UserWithProfile extends AdminUser {
  creator_profile?: {
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  brand_profile?: {
    company_name: string;
    email: string;
    logo_url: string | null;
  } | null;
}

/**
 * Fetch all users with their roles for admin management
 */
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch creator profiles
      const { data: creators, error: creatorsError } = await supabase
        .from("creator_profiles")
        .select("user_id, name, email, avatar_url");

      if (creatorsError) throw creatorsError;

      // Fetch brand profiles
      const { data: brands, error: brandsError } = await supabase
        .from("brand_profiles")
        .select("user_id, company_name, email, logo_url");

      if (brandsError) throw brandsError;

      // Create lookup maps
      const creatorMap = new Map(creators?.map(c => [c.user_id, c]) || []);
      const brandMap = new Map(brands?.map(b => [b.user_id, b]) || []);

      // Combine data
      const users: AdminUser[] = (roles || []).map(role => {
        const creator = creatorMap.get(role.user_id);
        const brand = brandMap.get(role.user_id);
        
        return {
          id: role.id,
          user_id: role.user_id,
          role: role.role as UserRole,
          created_at: role.created_at,
          updated_at: role.updated_at,
          email: creator?.email || brand?.email || undefined,
          name: creator?.name || brand?.company_name || undefined,
          avatar_url: creator?.avatar_url || brand?.logo_url || undefined,
          profile_type: creator ? "creator" : brand ? "brand" : null,
        };
      });

      return users;
    },
  });
};

/**
 * Update a user's role
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      // First check if role exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      // Log the action to audit_logs
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "update_user_role",
          entity_type: "user_role",
          entity_id: userId,
          new_value: { role: newRole },
          metadata: { target_user_id: userId },
        });
      }

      return { userId, newRole };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
      toast.success(`User role updated to ${data.newRole}`);
    },
    onError: (error) => {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role");
    },
  });
};

/**
 * Get role statistics
 */
export const useRoleStats = () => {
  return useQuery({
    queryKey: ["admin", "role-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        creators: data?.filter(r => r.role === "creator").length || 0,
        brands: data?.filter(r => r.role === "brand").length || 0,
        admins: data?.filter(r => r.role === "admin").length || 0,
      };

      return stats;
    },
  });
};
