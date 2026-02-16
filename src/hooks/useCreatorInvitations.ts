import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCreatorRealtime } from "@/hooks/useRealtimeSubscription";

interface CreatorInvitation {
  id: string;
  campaign_id: string;
  status: string;
  base_payout: number;
  offered_payout: number;
  negotiated_delta: number | null;
  deliverables: any;
  timeline_start: string | null;
  timeline_end: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
  campaign?: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    brand_user_id: string;
    timeline_start: string | null;
    timeline_end: string | null;
    total_budget: number;
  };
  brand_profile?: {
    company_name: string;
    logo_url: string | null;
  };
}

export const useCreatorInvitations = () => {
  const [invitations, setInvitations] = useState<CreatorInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const fetchInvitations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data, error } = await supabase
        .from('campaign_invitations')
        .select(`
          *,
          campaign:campaigns(
            id,
            name,
            category,
            description,
            brand_user_id,
            timeline_start,
            timeline_end,
            total_budget
          )
        `)
        .eq('creator_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      // Fetch brand profiles for each campaign
      const campaignBrandIds = [...new Set(data?.map(inv => inv.campaign?.brand_user_id).filter(Boolean))];
      
      let brandProfiles: Record<string, any> = {};
      if (campaignBrandIds.length > 0) {
        const { data: profiles } = await supabase
          .from('brand_profiles')
          .select('user_id, company_name, logo_url')
          .in('user_id', campaignBrandIds);
        
        if (profiles) {
          brandProfiles = profiles.reduce((acc, p) => ({ ...acc, [p.user_id]: p }), {});
        }
      }

      const enrichedInvitations = data?.map(inv => ({
        ...inv,
        brand_profile: inv.campaign?.brand_user_id 
          ? brandProfiles[inv.campaign.brand_user_id] 
          : null,
      })) || [];

      setInvitations(enrichedInvitations);
    } catch (error) {
      console.error('Error in fetchInvitations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Use consolidated realtime subscription
  useCreatorRealtime(userId, {
    onInvitationChange: useCallback(() => {
      toast.info("Invitation status changed", {
        description: "Your invitations have been updated.",
      });
      fetchInvitations();
      queryClient.invalidateQueries({ queryKey: ['creator-invitations'] });
    }, [fetchInvitations, queryClient]),
  });

  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
  const negotiatingCount = invitations.filter(inv => inv.status === 'negotiating').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;

  return {
    invitations,
    isLoading,
    pendingCount,
    negotiatingCount,
    acceptedCount,
    refetch: fetchInvitations,
  };
};
