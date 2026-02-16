import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBudgetRedistribution } from "./useBudgetRedistribution";

interface InviteCreatorParams {
  campaignId: string;
  creatorUserId: string;
  basePayout: number;
  offeredPayout: number;
  deliverables?: any[];
  timelineStart?: string;
  timelineEnd?: string;
  specialRequirements?: string;
}

export const useBrandInvitations = () => {
  const [isInviting, setIsInviting] = useState(false);
  const { calculateBudgetImpact } = useBudgetRedistribution();

  const inviteCreator = async (params: InviteCreatorParams) => {
    setIsInviting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return null;
      }

      // Check budget impact before inviting
      const impact = await calculateBudgetImpact(params.campaignId, params.offeredPayout);
      if (impact?.isOverBudget) {
        toast.error("This invitation would exceed your campaign budget", {
          description: `Remaining budget: $${impact.remainingAfter.toLocaleString()}`,
        });
        return null;
      }

      // Check if invitation already exists
      const { data: existing } = await supabase
        .from('campaign_invitations')
        .select('id, status')
        .eq('campaign_id', params.campaignId)
        .eq('creator_user_id', params.creatorUserId)
        .single();

      if (existing) {
        toast.error("This creator has already been invited to this campaign");
        return null;
      }

      // Create the invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('campaign_invitations')
        .insert({
          campaign_id: params.campaignId,
          creator_user_id: params.creatorUserId,
          base_payout: params.basePayout,
          offered_payout: params.offeredPayout,
          deliverables: params.deliverables || [],
          timeline_start: params.timelineStart || null,
          timeline_end: params.timelineEnd || null,
          special_requirements: params.specialRequirements || null,
          status: 'pending',
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Error creating invitation:', inviteError);
        toast.error("Failed to send invitation");
        return null;
      }

      // Update campaign allocated budget
      const { error: budgetError } = await supabase
        .from('campaigns')
        .update({
          allocated_budget: (impact?.afterAllocation || params.offeredPayout),
        })
        .eq('id', params.campaignId);

      if (budgetError) {
        console.error('Error updating campaign budget:', budgetError);
      }

      toast.success("Invitation dispatched", { description: "Creator has been notified of the campaign opportunity." });
      return invitation;

    } catch (error) {
      console.error('Error inviting creator:', error);
      toast.error("An error occurred");
      return null;
    } finally {
      setIsInviting(false);
    }
  };

  const withdrawInvitation = async (invitationId: string, campaignId?: string) => {
    try {
      // Get invitation details first for budget adjustment
      const { data: invitation } = await supabase
        .from('campaign_invitations')
        .select('offered_payout, negotiated_delta')
        .eq('id', invitationId)
        .single();

      const { error } = await supabase
        .from('campaign_invitations')
        .update({ status: 'withdrawn' })
        .eq('id', invitationId);

      if (error) throw error;

      // Adjust campaign budget if campaignId provided
      if (campaignId && invitation) {
        const freedAmount = invitation.offered_payout + (invitation.negotiated_delta || 0);
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('allocated_budget')
          .eq('id', campaignId)
          .single();

        if (campaign) {
          await supabase
            .from('campaigns')
            .update({
              allocated_budget: Math.max(0, (campaign.allocated_budget || 0) - freedAmount),
            })
            .eq('id', campaignId);
        }
      }

      toast.success("Invitation withdrawn", { description: "The invitation has been cancelled." });
      return true;
    } catch (error) {
      console.error('Error withdrawing invitation:', error);
      toast.error("Failed to withdraw invitation");
      return false;
    }
  };

  const updateInvitationPayout = async (invitationId: string, newPayout: number, campaignId?: string) => {
    try {
      // Get old payout for budget adjustment
      const { data: oldInvitation } = await supabase
        .from('campaign_invitations')
        .select('offered_payout')
        .eq('id', invitationId)
        .single();

      const { error } = await supabase
        .from('campaign_invitations')
        .update({ offered_payout: newPayout })
        .eq('id', invitationId);

      if (error) throw error;

      // Adjust campaign budget
      if (campaignId && oldInvitation) {
        const delta = newPayout - oldInvitation.offered_payout;
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('allocated_budget')
          .eq('id', campaignId)
          .single();

        if (campaign) {
          await supabase
            .from('campaigns')
            .update({
              allocated_budget: (campaign.allocated_budget || 0) + delta,
            })
            .eq('id', campaignId);
        }
      }

      toast.success("Payout updated", { description: "The offered amount has been recorded." });
      return true;
    } catch (error) {
      console.error('Error updating payout:', error);
      toast.error("Failed to update payout");
      return false;
    }
  };

  return {
    isInviting,
    inviteCreator,
    withdrawInvitation,
    updateInvitationPayout,
  };
};
