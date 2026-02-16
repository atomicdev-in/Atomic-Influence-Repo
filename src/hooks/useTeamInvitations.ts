import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BrandRole } from "@/hooks/useBrandRoles";

export interface TeamInvitation {
  id: string;
  brand_id: string;
  email: string;
  role: BrandRole;
  token: string;
  invited_by: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseTeamInvitationsReturn {
  invitations: TeamInvitation[];
  loading: boolean;
  sendInvitation: (email: string, role: BrandRole) => Promise<{ error: Error | null; invitation?: TeamInvitation }>;
  cancelInvitation: (invitationId: string) => Promise<{ error: Error | null }>;
  resendInvitation: (invitationId: string) => Promise<{ error: Error | null }>;
  acceptInvitation: (token: string) => Promise<{ error: Error | null }>;
  refetch: () => Promise<void>;
}

export const useTeamInvitations = (brandId?: string): UseTeamInvitationsReturn => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
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

  const fetchInvitations = useCallback(async () => {
    if (!user?.id || !brandProfileId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("brand_id", brandProfileId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invitations:", error);
      } else {
        setInvitations((data || []) as TeamInvitation[]);
      }
    } catch (err) {
      console.error("Error in fetchInvitations:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, brandProfileId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const sendInvitation = useCallback(async (email: string, role: BrandRole) => {
    if (!brandProfileId || !user?.id) {
      return { error: new Error("Not authorized") };
    }

    try {
      // Check if there's already a pending invitation for this email
      const { data: existing } = await supabase
        .from("team_invitations")
        .select("id")
        .eq("brand_id", brandProfileId)
        .eq("email", email.toLowerCase())
        .eq("status", "pending")
        .maybeSingle();

      if (existing) {
        return { error: new Error("An invitation has already been sent to this email") };
      }

      const { data, error } = await supabase
        .from("team_invitations")
        .insert({
          brand_id: brandProfileId,
          email: email.toLowerCase(),
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // In production, this would call an edge function to send the email
      // For now, we'll just log the invitation link
      const inviteLink = `${window.location.origin}/accept-invite?token=${data.token}`;
      console.log("📧 Invitation link (email would be sent in production):", inviteLink);
      console.log("📧 Send to:", email);

      await fetchInvitations();
      return { error: null, invitation: data as TeamInvitation };
    } catch (err) {
      console.error("Error sending invitation:", err);
      return { error: err as Error };
    }
  }, [brandProfileId, user?.id, fetchInvitations]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    if (!brandProfileId) {
      return { error: new Error("Not authorized") };
    }

    try {
      const { error } = await supabase
        .from("team_invitations")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", invitationId)
        .eq("brand_id", brandProfileId);

      if (error) throw error;

      await fetchInvitations();
      return { error: null };
    } catch (err) {
      console.error("Error cancelling invitation:", err);
      return { error: err as Error };
    }
  }, [brandProfileId, fetchInvitations]);

  const resendInvitation = useCallback(async (invitationId: string) => {
    if (!brandProfileId) {
      return { error: new Error("Not authorized") };
    }

    try {
      // Reset expiration and get new token
      const { data, error } = await supabase
        .from("team_invitations")
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitationId)
        .eq("brand_id", brandProfileId)
        .select()
        .single();

      if (error) throw error;

      // In production, resend the email
      const inviteLink = `${window.location.origin}/accept-invite?token=${data.token}`;
      console.log("📧 Resent invitation link:", inviteLink);

      await fetchInvitations();
      return { error: null };
    } catch (err) {
      console.error("Error resending invitation:", err);
      return { error: err as Error };
    }
  }, [brandProfileId, fetchInvitations]);

  const acceptInvitation = useCallback(async (token: string) => {
    if (!user?.id) {
      return { error: new Error("Not authenticated") };
    }

    try {
      // Find the invitation by token
      const { data: invitation, error: fetchError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (fetchError || !invitation) {
        return { error: new Error("Invalid or expired invitation") };
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from("team_invitations")
          .update({ status: "expired" })
          .eq("id", invitation.id);
        return { error: new Error("This invitation has expired") };
      }

      // Add user to brand_user_roles
      const { error: roleError } = await supabase
        .from("brand_user_roles")
        .insert({
          user_id: user.id,
          brand_id: invitation.brand_id,
          role: invitation.role as "agency_admin" | "finance" | "campaign_manager",
        });

      if (roleError) throw roleError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({ 
          status: "accepted", 
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      return { error: null };
    } catch (err) {
      console.error("Error accepting invitation:", err);
      return { error: err as Error };
    }
  }, [user?.id]);

  return {
    invitations,
    loading,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    acceptInvitation,
    refetch: fetchInvitations,
  };
};
