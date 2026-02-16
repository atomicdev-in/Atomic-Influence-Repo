import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface CampaignMessage {
  id: string;
  campaign_id: string;
  sender_user_id: string;
  sender_role: 'creator' | 'brand';
  content: string;
  status: MessageStatus;
  delivered_at: string | null;
  read_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joined fields
  sender_name?: string;
  sender_avatar?: string;
}

export interface CampaignConversation {
  campaign_id: string;
  campaign_name: string;
  brand_name: string;
  brand_logo?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  status: 'active' | 'completed' | 'paused';
}

interface UseCampaignMessagesOptions {
  campaignId?: string;
  userRole: 'creator' | 'brand';
}

/**
 * Hook for campaign-scoped real-time messaging
 * Handles fetching, sending, and status updates for campaign messages
 */
export const useCampaignMessages = ({ campaignId, userRole }: UseCampaignMessagesOptions) => {
  const [messages, setMessages] = useState<CampaignMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch messages for a specific campaign
  const fetchMessages = useCallback(async () => {
    if (!campaignId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('campaign_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_role: msg.sender_role as 'creator' | 'brand',
        status: msg.status as MessageStatus,
        metadata: msg.metadata as Record<string, any>
      }));

      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching campaign messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  // Send a new message
  const sendMessage = useCallback(async (content: string, metadata?: Record<string, any>) => {
    if (!campaignId || !content.trim()) return null;

    try {
      setIsSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('campaign_messages')
        .insert({
          campaign_id: campaignId,
          sender_user_id: user.id,
          sender_role: userRole,
          content: content.trim(),
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [campaignId, userRole]);

  // Update message status (delivered/read)
  const updateMessageStatus = useCallback(async (messageId: string, status: 'delivered' | 'read') => {
    try {
      const updateData: Record<string, any> = { status };
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'read') {
        updateData.read_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('campaign_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }, []);

  // Mark all messages as read (for when opening a conversation)
  const markAllAsRead = useCallback(async () => {
    if (!campaignId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark messages from the other party as read
      const otherRole = userRole === 'creator' ? 'brand' : 'creator';
      
      const { error } = await supabase
        .from('campaign_messages')
        .update({ 
          status: 'read' as MessageStatus,
          read_at: new Date().toISOString() 
        })
        .eq('campaign_id', campaignId)
        .eq('sender_role', otherRole)
        .neq('status', 'read');

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.sender_role === otherRole && msg.status !== 'read'
          ? { ...msg, status: 'read' as MessageStatus, read_at: new Date().toISOString() }
          : msg
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [campaignId, userRole]);

  // Set up realtime subscription
  useEffect(() => {
    if (!campaignId) return;

    fetchMessages();

    // Subscribe to new messages for this campaign
    const channel = supabase
      .channel(`campaign-messages-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_messages',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          const newMessage = {
            ...payload.new,
            sender_role: payload.new.sender_role as 'creator' | 'brand',
            status: payload.new.status as MessageStatus,
            metadata: payload.new.metadata as Record<string, any>
          } as CampaignMessage;
          
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaign_messages',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id 
              ? { 
                  ...msg, 
                  ...payload.new,
                  sender_role: payload.new.sender_role as 'creator' | 'brand',
                  status: payload.new.status as MessageStatus,
                } 
              : msg
          ));
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
  }, [campaignId, fetchMessages]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    updateMessageStatus,
    markAllAsRead,
    refetch: fetchMessages,
  };
};

/**
 * Hook to fetch all conversations for a user (campaigns with messages)
 */
export const useConversations = (userRole: 'creator' | 'brand') => {
  const [conversations, setConversations] = useState<CampaignConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (userRole === 'creator') {
        // Get campaigns where creator has accepted invitation
        const { data: invitations, error: invError } = await supabase
          .from('campaign_invitations')
          .select(`
            campaign_id,
            campaigns (
              id,
              name,
              status,
              brand_user_id,
              brand_profiles:brand_user_id (
                company_name,
                logo_url
              )
            )
          `)
          .eq('creator_user_id', user.id)
          .eq('status', 'accepted');

        if (invError) throw invError;

        // Get message counts for each campaign
        const campaignIds = invitations?.map(inv => inv.campaign_id) || [];
        
        if (campaignIds.length === 0) {
          setConversations([]);
          return;
        }

        const { data: messages, error: msgError } = await supabase
          .from('campaign_messages')
          .select('campaign_id, content, created_at, sender_role, status')
          .in('campaign_id', campaignIds)
          .order('created_at', { ascending: false });

        if (msgError) throw msgError;

        // Build conversation list
        const convos: CampaignConversation[] = invitations?.map(inv => {
          const campaign = inv.campaigns as any;
          const brandProfile = campaign?.brand_profiles;
          const campaignMessages = messages?.filter(m => m.campaign_id === inv.campaign_id) || [];
          const unreadCount = campaignMessages.filter(
            m => m.sender_role === 'brand' && m.status !== 'read'
          ).length;
          const lastMsg = campaignMessages[0];

          return {
            campaign_id: inv.campaign_id,
            campaign_name: campaign?.name || 'Unknown Campaign',
            brand_name: brandProfile?.company_name || 'Unknown Brand',
            brand_logo: brandProfile?.logo_url,
            last_message: lastMsg?.content,
            last_message_time: lastMsg?.created_at,
            unread_count: unreadCount,
            status: campaign?.status === 'active' ? 'active' : 
                   campaign?.status === 'completed' ? 'completed' : 'paused',
          };
        }) || [];

        // Sort by last message time
        convos.sort((a, b) => {
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });

        setConversations(convos);
      } else {
        // Brand: Get all campaigns they own with accepted invitations
        const { data: campaigns, error: campError } = await supabase
          .from('campaigns')
          .select(`
            id,
            name,
            status,
            campaign_invitations!inner (
              creator_user_id,
              status
            )
          `)
          .eq('brand_user_id', user.id)
          .eq('campaign_invitations.status', 'accepted');

        if (campError) throw campError;

        const campaignIds = campaigns?.map(c => c.id) || [];

        if (campaignIds.length === 0) {
          setConversations([]);
          return;
        }

        const { data: messages, error: msgError } = await supabase
          .from('campaign_messages')
          .select('campaign_id, content, created_at, sender_role, status')
          .in('campaign_id', campaignIds)
          .order('created_at', { ascending: false });

        if (msgError) throw msgError;

        // Get brand profile for logo
        const { data: brandProfile } = await supabase
          .from('brand_profiles')
          .select('company_name, logo_url')
          .eq('user_id', user.id)
          .single();

        const convos: CampaignConversation[] = campaigns?.map(campaign => {
          const campaignMessages = messages?.filter(m => m.campaign_id === campaign.id) || [];
          const unreadCount = campaignMessages.filter(
            m => m.sender_role === 'creator' && m.status !== 'read'
          ).length;
          const lastMsg = campaignMessages[0];

          return {
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            brand_name: brandProfile?.company_name || 'Your Brand',
            brand_logo: brandProfile?.logo_url,
            last_message: lastMsg?.content,
            last_message_time: lastMsg?.created_at,
            unread_count: unreadCount,
            status: campaign.status === 'active' ? 'active' : 
                   campaign.status === 'completed' ? 'completed' : 'paused',
          };
        }) || [];

        convos.sort((a, b) => {
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });

        setConversations(convos);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    refetch: fetchConversations,
  };
};
