import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RpcResult {
  success: boolean;
  error?: string;
  reservation_id?: string;
  participant_id?: string;
  reserved_amount?: number;
}

export const useInvitationActions = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const acceptInvitation = async (invitationId: string, campaignId: string) => {
    setIsProcessing(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to accept invitations",
          variant: "destructive",
        });
        return false;
      }

      // Call server-side RPC for atomic budget reservation + acceptance
      const { data, error } = await supabase.rpc('accept_campaign_invitation', {
        _invitation_id: invitationId
      });

      if (error) {
        console.error('Accept invitation RPC error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to accept invitation",
          variant: "destructive",
        });
        return false;
      }

      const result = data as unknown as RpcResult;
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to accept invitation",
          variant: "destructive",
        });
        return false;
      }

      // Generate tracking links via edge function
      try {
        const { data: trackingData, error: trackingError } = await supabase.functions
          .invoke('tracking-links', {
            body: {
              action: 'generate-creator-links',
              campaignId: campaignId,
              creatorUserId: user.id,
            },
          });

        if (trackingError) {
          console.error('Error generating tracking links:', trackingError);
          toast({
            title: "Invitation Accepted",
            description: "Your tracking links will be generated shortly.",
          });
        } else {
          console.log('Tracking links generated:', trackingData);
          toast({
            title: "Invitation accepted",
            description: `Budget of $${result.reserved_amount?.toFixed(2) || 'N/A'} reserved. Tracking links available.`,
          });
        }
      } catch (fnError) {
        console.error('Edge function error:', fnError);
        toast({
          title: "Invitation Accepted",
          description: "Budget reserved successfully. Tracking links will be generated shortly.",
        });
      }

      return true;

    } catch (error) {
      console.error('Error in acceptInvitation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const declineInvitation = async (invitationId: string, redistribute: boolean = false) => {
    setIsProcessing(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return false;
      }

      // Call server-side RPC for atomic decline + budget release
      const { data, error } = await supabase.rpc('decline_campaign_invitation', {
        _invitation_id: invitationId,
        _redistribute: redistribute
      });

      if (error) {
        console.error('Decline invitation RPC error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to decline invitation",
          variant: "destructive",
        });
        return false;
      }

      const result = data as unknown as RpcResult;
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to decline invitation",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Invitation Declined",
        description: "The brand has been notified.",
      });

      return true;

    } catch (error) {
      console.error('Error in declineInvitation:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const startNegotiation = async (invitationId: string) => {
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return false;
      }

      // Direct update is OK here since we're just changing status to negotiating
      // The actual negotiation submission goes through the RPC
      const { error: updateError } = await supabase
        .from('campaign_invitations')
        .update({ status: 'negotiating' })
        .eq('id', invitationId)
        .eq('creator_user_id', user.id);

      if (updateError) {
        console.error('Error starting negotiation:', updateError);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error in startNegotiation:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    acceptInvitation,
    declineInvitation,
    startNegotiation,
  };
};
