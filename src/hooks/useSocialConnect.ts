import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'meta';

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string | null;
  connected: boolean;
  syncStatus: string;
  lastSync: string | null;
  followers: number | null;
  engagement: number | null;
  isVerified: boolean;
  profileName: string | null;
  profileImageUrl: string | null;
  profileUrl: string | null;
}

interface OAuthInitResponse {
  authUrl: string;
  state: string;
}

interface OAuthCallbackResponse {
  success: boolean;
  account?: {
    id: string;
    platform: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    followers?: number;
  };
  error?: string;
}

/**
 * Hook for managing social platform OAuth connections
 */
export const useSocialConnect = () => {
  const queryClient = useQueryClient();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  // Get all connected accounts for current user
  const { data: connectedAccounts, isLoading, refetch } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async (): Promise<ConnectedAccount[]> => {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select(`
          id,
          platform,
          username,
          connected,
          sync_status,
          last_sync,
          followers,
          engagement,
          is_verified,
          profile_name,
          profile_image_url,
          profile_url
        `)
        .eq('connected', true);

      if (error) throw error;

      return (data || []).map(acc => ({
        id: acc.id,
        platform: acc.platform,
        username: acc.username,
        connected: acc.connected ?? false,
        syncStatus: acc.sync_status ?? 'unknown',
        lastSync: acc.last_sync,
        followers: acc.followers,
        engagement: acc.engagement,
        isVerified: acc.is_verified ?? false,
        profileName: acc.profile_name,
        profileImageUrl: acc.profile_image_url,
        profileUrl: acc.profile_url,
      }));
    },
  });

  // Initialize OAuth flow
  const initOAuth = useMutation({
    mutationFn: async (platform: SocialPlatform): Promise<OAuthInitResponse> => {
      setConnectingPlatform(platform);
      
      // Map platform names to API format
      const apiPlatform = platform === 'instagram' ? 'meta' : platform;
      
      const redirectUri = `${window.location.origin}/oauth/callback`;
      
      const { data, error } = await supabase.functions.invoke('social-connect', {
        body: { 
          action: 'init', 
          platform: apiPlatform,
          redirectUri,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    },
    onSuccess: (data) => {
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.authUrl,
        'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      // Store state for callback validation
      sessionStorage.setItem('oauth_state', data.state);
      
      // Poll for popup closure
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollTimer);
          setConnectingPlatform(null);
          // Refresh accounts list
          queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
          queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
        }
      }, 500);
    },
    onError: (error: Error) => {
      setConnectingPlatform(null);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle OAuth callback (called from callback page)
  const handleCallback = useCallback(async (
    code: string, 
    state: string, 
    platform: string
  ): Promise<OAuthCallbackResponse> => {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    
    const { data, error } = await supabase.functions.invoke('social-connect', {
      body: { 
        action: 'callback', 
        platform,
        code,
        state,
        redirectUri,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });

    return { success: true, account: data.account };
  }, [queryClient]);

  // Disconnect account
  const disconnect = useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase.functions.invoke('social-connect', {
        body: { action: 'disconnect', accountId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      toast({
        title: "Account Disconnected",
        description: "Your social account has been unlinked.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync account data
  const syncAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase.functions.invoke('social-connect', {
        body: { action: 'sync', accountId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      toast({
        title: "Sync Complete",
        description: "Your account data has been updated.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get specific platform status
  const getPlatformStatus = useCallback((platform: SocialPlatform) => {
    const account = connectedAccounts?.find(
      acc => acc.platform === platform || 
             (platform === 'instagram' && acc.platform === 'meta')
    );
    return {
      connected: !!account?.connected,
      account,
    };
  }, [connectedAccounts]);

  return {
    connectedAccounts: connectedAccounts || [],
    isLoading,
    connectingPlatform,
    initOAuth: initOAuth.mutate,
    handleCallback,
    disconnect: disconnect.mutate,
    syncAccount: syncAccount.mutate,
    getPlatformStatus,
    refetch,
    isConnecting: initOAuth.isPending,
    isDisconnecting: disconnect.isPending,
    isSyncing: syncAccount.isPending,
  };
};

/**
 * Hook for platform-specific connection status
 */
export const usePlatformConnection = (platform: SocialPlatform) => {
  const { getPlatformStatus, initOAuth, disconnect, syncAccount, connectingPlatform, isLoading } = useSocialConnect();
  const status = getPlatformStatus(platform);

  return {
    connected: status.connected,
    account: status.account,
    isLoading,
    isConnecting: connectingPlatform === platform,
    connect: () => initOAuth(platform),
    disconnect: () => status.account && disconnect(status.account.id),
    sync: () => status.account && syncAccount(status.account.id),
  };
};
