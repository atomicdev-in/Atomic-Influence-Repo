import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Hook for campaign-specific realtime updates (invitations + tracking links)
 * Consolidates multiple subscriptions into a single channel per campaign
 */
export const useCampaignRealtime = (
  campaignId: string | undefined,
  callbacks: {
    onInvitationChange?: () => void;
    onTrackingLinkChange?: () => void;
  }
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);
  
  // Keep callbacks ref updated to avoid stale closures
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!campaignId) return;

    // Create a single channel for all campaign-related updates
    const channel = supabase
      .channel(`campaign-realtime-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_invitations',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          callbacksRef.current.onInvitationChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creator_tracking_links',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          callbacksRef.current.onTrackingLinkChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_negotiations',
        },
        () => {
          // Negotiations affect invitations
          callbacksRef.current.onInvitationChange?.();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [campaignId]);
};

/**
 * Hook for brand-wide realtime updates (across all campaigns)
 * Reduces connection count by sharing a single channel per user
 */
export const useBrandRealtime = (
  userId: string | undefined,
  callbacks: {
    onNegotiationChange?: () => void;
    onInvitationChange?: () => void;
  }
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);
  
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`brand-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_invitations',
        },
        () => {
          callbacksRef.current.onInvitationChange?.();
          callbacksRef.current.onNegotiationChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_negotiations',
        },
        () => {
          callbacksRef.current.onNegotiationChange?.();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId]);
};

/**
 * Hook for creator-wide realtime updates
 * Single channel for all creator invitation updates
 */
export const useCreatorRealtime = (
  userId: string | undefined,
  callbacks: {
    onInvitationChange?: () => void;
  }
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);
  
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`creator-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_invitations',
          filter: `creator_user_id=eq.${userId}`,
        },
        () => {
          callbacksRef.current.onInvitationChange?.();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId]);
};
