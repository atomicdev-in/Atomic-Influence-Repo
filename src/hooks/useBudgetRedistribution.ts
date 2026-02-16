import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BudgetRedistributionResult {
  success: boolean;
  redistributedAmount: number;
  newBasePayoutPerInfluencer: number;
  remainingInfluencerCapacity: number;
}

export const useBudgetRedistribution = () => {
  
  /**
   * Handle budget redistribution when an invitation is declined
   * - Frees up the allocated budget for that invitation
   * - Can optionally redistribute to remaining creators or keep for new invitations
   */
  const handleDeclinedInvitation = async (
    campaignId: string,
    declinedInvitationId: string,
    redistributeToExisting: boolean = false
  ): Promise<BudgetRedistributionResult | null> => {
    try {
      // Get the campaign and declined invitation details
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        console.error('Error fetching campaign:', campaignError);
        return null;
      }

      const { data: declinedInvitation, error: invError } = await supabase
        .from('campaign_invitations')
        .select('*')
        .eq('id', declinedInvitationId)
        .single();

      if (invError || !declinedInvitation) {
        console.error('Error fetching invitation:', invError);
        return null;
      }

      const freedAmount = declinedInvitation.offered_payout + (declinedInvitation.negotiated_delta || 0);

      // Get count of active invitations (pending, accepted, negotiating)
      const { data: activeInvitations, error: activeError } = await supabase
        .from('campaign_invitations')
        .select('id, offered_payout, negotiated_delta')
        .eq('campaign_id', campaignId)
        .in('status', ['pending', 'accepted', 'negotiating']);

      if (activeError) {
        console.error('Error fetching active invitations:', activeError);
        return null;
      }

      const activeCount = activeInvitations?.length || 0;
      
      // Calculate current allocated budget
      const currentAllocated = activeInvitations?.reduce(
        (sum, inv) => sum + inv.offered_payout + (inv.negotiated_delta || 0),
        0
      ) || 0;

      // Update campaign's allocated budget (reduce by freed amount)
      const newAllocatedBudget = Math.max(0, currentAllocated);
      const remainingBudget = campaign.total_budget - newAllocatedBudget;
      
      // Calculate remaining capacity
      const remainingCapacity = campaign.influencer_count - activeCount;
      const newBasePayoutPerInfluencer = remainingCapacity > 0 
        ? remainingBudget / remainingCapacity 
        : campaign.base_payout_per_influencer || 0;

      // Update campaign with new budget info
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          allocated_budget: newAllocatedBudget,
          remaining_budget: remainingBudget,
        })
        .eq('id', campaignId);

      if (updateError) {
        console.error('Error updating campaign budget:', updateError);
        return null;
      }

      // Optionally redistribute to existing creators
      if (redistributeToExisting && activeCount > 0 && freedAmount > 0) {
        const extraPerCreator = Math.floor(freedAmount / activeCount);
        
        if (extraPerCreator > 0) {
          // Update each active invitation's payout
          for (const inv of activeInvitations || []) {
            await supabase
              .from('campaign_invitations')
              .update({
                offered_payout: inv.offered_payout + extraPerCreator,
              })
              .eq('id', inv.id);
          }

          toast.success(`Budget redistributed: +$${extraPerCreator} per creator`, {
            description: `$${freedAmount} was redistributed among ${activeCount} creators.`,
          });
        }
      }

      return {
        success: true,
        redistributedAmount: freedAmount,
        newBasePayoutPerInfluencer,
        remainingInfluencerCapacity: remainingCapacity,
      };

    } catch (error) {
      console.error('Error in handleDeclinedInvitation:', error);
      return null;
    }
  };

  /**
   * Calculate budget impact for a potential new invitation
   */
  const calculateBudgetImpact = async (campaignId: string, proposedPayout: number) => {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('total_budget, allocated_budget, influencer_count, base_payout_per_influencer')
      .eq('id', campaignId)
      .single();

    if (!campaign) return null;

    const currentAllocated = campaign.allocated_budget || 0;
    const afterAllocation = currentAllocated + proposedPayout;
    const remainingAfter = campaign.total_budget - afterAllocation;
    const utilizationPercent = (afterAllocation / campaign.total_budget) * 100;

    return {
      currentAllocated,
      proposedPayout,
      afterAllocation,
      remainingAfter,
      utilizationPercent,
      isOverBudget: afterAllocation > campaign.total_budget,
      basePayoutPerInfluencer: campaign.base_payout_per_influencer || 0,
    };
  };

  /**
   * Get campaign budget summary
   */
  const getCampaignBudgetSummary = async (campaignId: string) => {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (!campaign) return null;

    const { data: invitations } = await supabase
      .from('campaign_invitations')
      .select('status, offered_payout, negotiated_delta')
      .eq('campaign_id', campaignId);

    const statusCounts = {
      pending: 0,
      accepted: 0,
      declined: 0,
      negotiating: 0,
      withdrawn: 0,
    };

    let allocatedToActive = 0;
    let allocatedToAccepted = 0;

    for (const inv of invitations || []) {
      statusCounts[inv.status as keyof typeof statusCounts]++;
      
      if (['pending', 'accepted', 'negotiating'].includes(inv.status)) {
        allocatedToActive += inv.offered_payout + (inv.negotiated_delta || 0);
      }
      if (inv.status === 'accepted') {
        allocatedToAccepted += inv.offered_payout + (inv.negotiated_delta || 0);
      }
    }

    return {
      totalBudget: campaign.total_budget,
      allocatedBudget: allocatedToActive,
      committedBudget: allocatedToAccepted,
      remainingBudget: campaign.total_budget - allocatedToActive,
      targetInfluencers: campaign.influencer_count,
      basePayoutPerInfluencer: campaign.base_payout_per_influencer,
      statusCounts,
      utilizationPercent: (allocatedToActive / campaign.total_budget) * 100,
    };
  };

  return {
    handleDeclinedInvitation,
    calculateBudgetImpact,
    getCampaignBudgetSummary,
  };
};
