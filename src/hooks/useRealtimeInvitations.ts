import { useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCampaignRealtime } from "@/hooks/useRealtimeSubscription";

interface UseRealtimeInvitationsOptions {
  campaignId: string | undefined;
  onInvitationChange: () => void;
}

/**
 * Hook for campaign-specific invitation updates with toast notifications
 * Uses consolidated realtime subscription
 */
export const useRealtimeInvitations = ({ 
  campaignId, 
  onInvitationChange 
}: UseRealtimeInvitationsOptions) => {
  const lastStatusRef = useRef<Map<string, string>>(new Map());

  const handleInvitationChange = useCallback(async () => {
    if (!campaignId) return;
    
    // Fetch current invitations to compare statuses
    const { data: invitations } = await supabase
      .from('campaign_invitations')
      .select('id, status, creator_user_id')
      .eq('campaign_id', campaignId);
    
    if (invitations) {
      for (const inv of invitations) {
        const prevStatus = lastStatusRef.current.get(inv.id);
        
        if (prevStatus && prevStatus !== inv.status) {
          // Status changed - show notification
          let creatorName = 'A creator';
          const { data: profile } = await supabase
            .from('creator_profiles')
            .select('name')
            .eq('user_id', inv.creator_user_id)
            .single();
          
          if (profile?.name) {
            creatorName = profile.name;
          }

          switch (inv.status) {
            case 'accepted':
              toast.success(`${creatorName} accepted the invitation`, {
                description: 'Tracking links have been generated automatically.',
                duration: 5000,
              });
              break;
            case 'declined':
              toast.error(`${creatorName} declined the invitation`, {
                description: 'You may invite other creators to this campaign.',
                duration: 5000,
              });
              break;
            case 'negotiating':
              toast.info(`${creatorName} initiated negotiation`, {
                description: 'Review the proposal and respond.',
                duration: 5000,
              });
              break;
            case 'withdrawn':
              toast.info(`Invitation to ${creatorName} withdrawn`, {
                duration: 3000,
              });
              break;
          }
        }
        
        lastStatusRef.current.set(inv.id, inv.status);
      }
    }
    
    onInvitationChange();
  }, [campaignId, onInvitationChange]);

  // Use consolidated campaign realtime
  const callbacks = useMemo(() => ({
    onInvitationChange: handleInvitationChange,
  }), [handleInvitationChange]);

  useCampaignRealtime(campaignId, callbacks);

  return null;
};

/**
 * Hook for tracking link updates (clicks)
 * Uses consolidated campaign realtime subscription
 */
export const useRealtimeTrackingLinks = ({
  campaignId,
  onLinkUpdate,
}: {
  campaignId: string | undefined;
  onLinkUpdate: () => void;
}) => {
  const callbacks = useMemo(() => ({
    onTrackingLinkChange: () => {
      toast.success('Tracking activity recorded', {
        description: 'New clicks or conversions have been detected.',
        duration: 3000,
      });
      onLinkUpdate();
    },
  }), [onLinkUpdate]);

  useCampaignRealtime(campaignId, callbacks);

  return null;
};
