import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatorScore {
  id: string;
  campaign_id: string;
  creator_user_id: string;
  overall_score: number;
  dimension_scores: Record<string, number>;
  calculated_at: string;
}

export const useCampaignScores = (campaignId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: scores, isLoading } = useQuery({
    queryKey: ['campaign-scores', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase.functions.invoke('matching-intelligence', {
        body: { action: 'get-campaign-scores', campaignId },
      });
      if (error) throw error;
      return (data?.scores || []) as CreatorScore[];
    },
    enabled: !!campaignId,
    staleTime: 60000,
  });

  const calculateScores = useMutation({
    mutationFn: async () => {
      if (!campaignId) throw new Error('Campaign ID required');
      const { data, error } = await supabase.functions.invoke('matching-intelligence', {
        body: { action: 'calculate-and-store-scores', campaignId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-scores', campaignId] });
      toast.success("Scores calculated", { description: `${data?.scoresCalculated || 0} creators scored.` });
    },
    onError: (error: Error) => {
      toast.error("Score calculation failed", { description: error.message });
    },
  });

  return {
    scores,
    topMatches: scores?.filter((s) => s.overall_score >= 60).slice(0, 20) || [],
    isLoading,
    calculateScores: calculateScores.mutate,
    isCalculating: calculateScores.isPending,
  };
};