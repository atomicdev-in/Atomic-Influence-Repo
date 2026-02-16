import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubmissionPayload {
  campaignId: string;
  deliverableId: string;
  submissionUrl: string;
  metadata?: Record<string, unknown>;
}

interface ReviewPayload {
  submissionId: string;
  action: 'approved' | 'revision_requested' | 'rejected';
  feedback?: string;
}

interface RpcResult {
  success: boolean;
  error?: string;
  submission_id?: string;
  review_id?: string;
  all_deliverables_approved?: boolean;
}

export const useContentSubmission = () => {
  const queryClient = useQueryClient();

  const submitDeliverable = useMutation({
    mutationFn: async (payload: SubmissionPayload) => {
      const { data, error } = await supabase.rpc('submit_deliverable', {
        _campaign_id: payload.campaignId,
        _deliverable_id: payload.deliverableId,
        _submission_url: payload.submissionUrl,
        _metadata: (payload.metadata || {}) as unknown as Record<string, never>,
      });

      if (error) throw new Error(error.message);
      const result = data as unknown as RpcResult;
      if (!result.success) throw new Error(result.error || 'Submission failed');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submissions', variables.campaignId] });
      toast.success("Content submitted", { description: "Your submission is now pending review." });
    },
    onError: (error: Error) => {
      toast.error("Submission failed", { description: error.message });
    },
  });

  const reviewSubmission = useMutation({
    mutationFn: async (payload: ReviewPayload) => {
      const { data, error } = await supabase.rpc('review_submission', {
        _submission_id: payload.submissionId,
        _action: payload.action,
        _feedback: payload.feedback || null,
      });

      if (error) throw new Error(error.message);
      const result = data as unknown as RpcResult;
      if (!result.success) throw new Error(result.error || 'Review failed');
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      if (result.all_deliverables_approved) {
        toast.success("All deliverables approved!", { description: "Creator payment is now eligible." });
      } else {
        toast.success("Review submitted", { description: "The creator has been notified." });
      }
    },
    onError: (error: Error) => {
      toast.error("Review failed", { description: error.message });
    },
  });

  return {
    submitDeliverable: submitDeliverable.mutate,
    isSubmitting: submitDeliverable.isPending,
    reviewSubmission: reviewSubmission.mutate,
    isReviewing: reviewSubmission.isPending,
  };
};

export const useCampaignDeliverables = (campaignId: string | undefined) => {
  return useQuery({
    queryKey: ['deliverables', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from('campaign_deliverables')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('deliverable_index', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!campaignId,
  });
};

export const useCampaignSubmissions = (campaignId: string | undefined) => {
  return useQuery({
    queryKey: ['submissions', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from('creator_submissions')
        .select(`*, deliverable:campaign_deliverables(id, title, deliverable_type)`)
        .eq('campaign_id', campaignId)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!campaignId,
  });
};