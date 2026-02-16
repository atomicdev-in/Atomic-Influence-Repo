import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NegotiationProposal {
  invitationId: string;
  proposedPayout?: number;
  proposedDeliverables?: any[];
  proposedTimelineStart?: string;
  proposedTimelineEnd?: string;
  message: string;
}

interface RpcResult {
  success: boolean;
  error?: string;
  negotiation_id?: string;
  response?: string;
  counter_negotiation_id?: string;
}

export const useNegotiations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Creator submits counter-offer via server RPC
  const submitCounterOffer = async (proposal: NegotiationProposal) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication required", {
          description: "You must be signed in to perform this action.",
        });
        return false;
      }

      // Call server-side RPC for atomic negotiation creation
      const { data, error } = await supabase.rpc('submit_negotiation_counter_offer', {
        _invitation_id: proposal.invitationId,
        _proposed_payout: proposal.proposedPayout || null,
        _message: proposal.message,
        _proposed_deliverables: proposal.proposedDeliverables || null,
        _proposed_timeline_start: proposal.proposedTimelineStart || null,
        _proposed_timeline_end: proposal.proposedTimelineEnd || null,
      });

      if (error) {
        console.error('Submit counter-offer RPC error:', error);
        toast.error("Submission failed", {
          description: error.message || "Unable to submit counter-offer. Please try again.",
        });
        return false;
      }

      const result = data as unknown as RpcResult;
      
      if (!result.success) {
        toast.error("Submission failed", {
          description: result.error || "Unable to submit counter-offer. Please try again.",
        });
        return false;
      }

      toast.success("Counter-offer submitted", {
        description: "The brand will review your proposal.",
      });
      return true;

    } catch (error) {
      console.error('Error in submitCounterOffer:', error);
      toast.error("Operation failed", { description: "An unexpected error occurred. Please try again." });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Brand responds to negotiation via server RPC
  const respondToNegotiation = async (
    negotiationId: string,
    invitationId: string,
    response: 'accepted' | 'rejected' | 'countered',
    counterProposal?: {
      payout?: number;
      message?: string;
    }
  ) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication required", {
          description: "You must be signed in to perform this action.",
        });
        return false;
      }

      // Call server-side RPC for atomic response + budget adjustment
      const { data, error } = await supabase.rpc('respond_to_negotiation', {
        _negotiation_id: negotiationId,
        _response: response,
        _counter_payout: counterProposal?.payout || null,
        _counter_message: counterProposal?.message || null,
      });

      if (error) {
        console.error('Respond to negotiation RPC error:', error);
        toast.error("Response failed", {
          description: error.message || "Unable to process negotiation response.",
        });
        return false;
      }

      const result = data as unknown as RpcResult;
      
      if (!result.success) {
        toast.error("Response failed", {
          description: result.error || "Unable to process negotiation response.",
        });
        return false;
      }

      if (response === 'accepted') {
        toast.success("Negotiation resolved", {
          description: "Terms have been accepted. The creator has been notified.",
        });
      } else if (response === 'rejected') {
        toast.info("Proposal declined", {
          description: "The counter-offer has been rejected. Creator has been notified.",
        });
      } else if (response === 'countered') {
        toast.success("Counter-proposal sent", {
          description: "Awaiting creator response to revised terms.",
        });
      }

      return true;

    } catch (error) {
      console.error('Error in respondToNegotiation:', error);
      toast.error("Operation failed", { description: "An unexpected error occurred. Please try again." });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get negotiation history for an invitation (read-only, no RPC needed)
  const getNegotiationHistory = async (invitationId: string) => {
    const { data, error } = await supabase
      .from('campaign_negotiations')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching negotiations:', error);
      return [];
    }

    return data || [];
  };

  return {
    isSubmitting,
    submitCounterOffer,
    respondToNegotiation,
    getNegotiationHistory,
  };
};
