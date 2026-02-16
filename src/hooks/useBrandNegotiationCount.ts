import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBrandRealtime } from "@/hooks/useRealtimeSubscription";

export const useBrandNegotiationCount = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();

  const fetchPendingNegotiations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPendingCount(0);
        return;
      }
      
      setUserId(user.id);

      // Get all campaigns owned by this brand
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('brand_user_id', user.id);

      if (!campaigns || campaigns.length === 0) {
        setPendingCount(0);
        return;
      }

      const campaignIds = campaigns.map(c => c.id);

      // Get invitations that are in negotiating status
      const { data: negotiations } = await supabase
        .from('campaign_invitations')
        .select('id')
        .in('campaign_id', campaignIds)
        .eq('status', 'negotiating');

      setPendingCount(negotiations?.length || 0);
    } catch (error) {
      console.error('Error fetching negotiation count:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingNegotiations();
  }, [fetchPendingNegotiations]);

  // Use consolidated realtime subscription
  useBrandRealtime(userId, {
    onNegotiationChange: fetchPendingNegotiations,
  });

  return { pendingCount, loading, refetch: fetchPendingNegotiations };
};
