import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCachedBrandRole, useCachedCampaignAccess } from "@/hooks/useRoleCache";

// Re-export cached hooks for easy access
export { useCachedBrandRole, useCachedCampaignAccess };

export type BrandRole = "agency_admin" | "finance" | "campaign_manager";

export interface BrandUserRole {
  id: string;
  user_id: string;
  brand_id: string;
  role: BrandRole;
  created_at: string;
  updated_at: string;
  // Joined data
  user_email?: string;
}

export interface CampaignAssignment {
  id: string;
  user_id: string;
  campaign_id: string;
  assigned_by: string;
  created_at: string;
  // Joined data
  campaign_name?: string;
}

interface UseBrandRolesReturn {
  currentUserRole: BrandRole | "owner" | null;
  teamMembers: BrandUserRole[];
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canManageTeam: boolean;
  canViewFinance: boolean;
  canManageCampaigns: boolean;
  addTeamMember: (email: string, role: BrandRole) => Promise<{ error: Error | null }>;
  updateTeamMemberRole: (userId: string, role: BrandRole) => Promise<{ error: Error | null }>;
  removeTeamMember: (userId: string) => Promise<{ error: Error | null }>;
  refetch: () => Promise<void>;
}

export const useBrandRoles = (brandId?: string): UseBrandRolesReturn => {
  const { user } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<BrandRole | "owner" | null>(null);
  const [teamMembers, setTeamMembers] = useState<BrandUserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(brandId || null);

  // Fetch brand profile ID if not provided
  useEffect(() => {
    const fetchBrandProfile = async () => {
      if (!user?.id || brandId) return;
      
      const { data } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setBrandProfileId(data.id);
      }
    };
    
    fetchBrandProfile();
  }, [user?.id, brandId]);

  const fetchRoles = useCallback(async () => {
    if (!user?.id || !brandProfileId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if current user is the brand owner
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("user_id")
        .eq("id", brandProfileId)
        .single();

      if (brandProfile?.user_id === user.id) {
        setCurrentUserRole("owner");
      } else {
        // Check user's role in the brand
        const { data: roleData } = await supabase
          .from("brand_user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("brand_id", brandProfileId)
          .maybeSingle();

        setCurrentUserRole(roleData?.role as BrandRole || null);
      }

      // Fetch all team members
      const { data: members, error } = await supabase
        .from("brand_user_roles")
        .select("*")
        .eq("brand_id", brandProfileId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching team members:", error);
      } else {
        setTeamMembers(members as BrandUserRole[] || []);
      }
    } catch (err) {
      console.error("Error in fetchRoles:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, brandProfileId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const addTeamMember = useCallback(async (email: string, role: BrandRole) => {
    if (!brandProfileId || !user?.id) {
      return { error: new Error("Not authorized") };
    }

    try {
      // First, we need to find the user by email
      // Since we can't query auth.users directly, we'll need to use an edge function
      // For now, we'll store the email and user_id will be set when they accept invitation
      
      // This is a simplified version - in production you'd send an invitation email
      const { error } = await supabase
        .from("brand_user_roles")
        .insert({
          user_id: user.id, // Placeholder - would be the invited user's ID
          brand_id: brandProfileId,
          role,
        });

      if (error) throw error;

      await fetchRoles();
      return { error: null };
    } catch (err) {
      console.error("Error adding team member:", err);
      return { error: err as Error };
    }
  }, [brandProfileId, user?.id, fetchRoles]);

  const updateTeamMemberRole = useCallback(async (userId: string, role: BrandRole) => {
    if (!brandProfileId) {
      return { error: new Error("Not authorized") };
    }

    try {
      const { error } = await supabase
        .from("brand_user_roles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("brand_id", brandProfileId);

      if (error) throw error;

      await fetchRoles();
      return { error: null };
    } catch (err) {
      console.error("Error updating team member role:", err);
      return { error: err as Error };
    }
  }, [brandProfileId, fetchRoles]);

  const removeTeamMember = useCallback(async (userId: string) => {
    if (!brandProfileId) {
      return { error: new Error("Not authorized") };
    }

    try {
      const { error } = await supabase
        .from("brand_user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("brand_id", brandProfileId);

      if (error) throw error;

      await fetchRoles();
      return { error: null };
    } catch (err) {
      console.error("Error removing team member:", err);
      return { error: err as Error };
    }
  }, [brandProfileId, fetchRoles]);

  const isOwner = currentUserRole === "owner";
  const isAdmin = currentUserRole === "agency_admin" || isOwner;
  const canManageTeam = isAdmin;
  const canViewFinance = isOwner || currentUserRole === "agency_admin" || currentUserRole === "finance";
  const canManageCampaigns = isOwner || currentUserRole === "agency_admin" || currentUserRole === "campaign_manager";

  return {
    currentUserRole,
    teamMembers,
    loading,
    isOwner,
    isAdmin,
    canManageTeam,
    canViewFinance,
    canManageCampaigns,
    addTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
    refetch: fetchRoles,
  };
};

// Hook for campaign-specific access
export const useCampaignAccess = (campaignId?: string) => {
  const { user } = useAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id || !campaignId) {
        setLoading(false);
        return;
      }

      try {
        // Check if user owns the campaign
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("brand_user_id")
          .eq("id", campaignId)
          .maybeSingle();

        if (campaign?.brand_user_id === user.id) {
          setCanAccess(true);
          setLoading(false);
          return;
        }

        // Check if user is assigned to this campaign
        const { data: assignment } = await supabase
          .from("campaign_manager_assignments")
          .select("id")
          .eq("user_id", user.id)
          .eq("campaign_id", campaignId)
          .maybeSingle();

        setCanAccess(!!assignment);
      } catch (err) {
        console.error("Error checking campaign access:", err);
        setCanAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user?.id, campaignId]);

  return { canAccess, loading };
};
