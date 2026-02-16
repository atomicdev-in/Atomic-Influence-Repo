import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreatorActiveCampaign {
  id: string;
  campaignName: string;
  brandName: string;
  brandLogo: string | null;
  imageUrl: string | null;
  status: 'active' | 'in_progress' | 'pending_review' | 'completed' | 'revision_requested';
  commission: number;
  paymentStatus: 'pending' | 'eligible' | 'paid';
  deadline: string | null;
  startDate: string | null;
  categories: string[];
  socials: string[];
  progress: number;
  deliverablesDone: number;
  deliverablesTotal: number;
  hasUnreadMessages: boolean;
  participantId: string;
  invitationId: string;
}

export const useCreatorActiveCampaigns = () => {
  return useQuery({
    queryKey: ['creator-active-campaigns'],
    queryFn: async (): Promise<CreatorActiveCampaign[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch participant records for this creator
      const { data: participants, error: partError } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          status,
          joined_at,
          completed_at,
          final_payout,
          invitation_id,
          campaign:campaigns(
            id,
            name,
            category,
            timeline_start,
            timeline_end,
            required_platforms,
            thumbnail_url,
            brand_user_id
          )
        `)
        .eq('creator_user_id', user.id)
        .order('joined_at', { ascending: false });

      if (partError) {
        console.error('Error fetching participants:', partError);
        return [];
      }

      if (!participants || participants.length === 0) return [];

      // Get brand profiles
      const brandUserIds = [...new Set(participants.map(p => p.campaign?.brand_user_id).filter(Boolean))];
      let brandProfiles: Record<string, any> = {};
      if (brandUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('brand_profiles')
          .select('user_id, company_name, logo_url')
          .in('user_id', brandUserIds);
        if (profiles) {
          brandProfiles = profiles.reduce((acc, p) => ({ ...acc, [p.user_id]: p }), {});
        }
      }

      // Get invitations for payout info
      const invitationIds = participants.map(p => p.invitation_id).filter(Boolean);
      let invitations: Record<string, any> = {};
      if (invitationIds.length > 0) {
        const { data: invData } = await supabase
          .from('campaign_invitations')
          .select('id, offered_payout, negotiated_delta')
          .in('id', invitationIds);
        if (invData) {
          invitations = invData.reduce((acc, i) => ({ ...acc, [i.id]: i }), {});
        }
      }

      // Get deliverables and submissions for each campaign
      const campaignIds = participants.map(p => p.campaign?.id).filter(Boolean);
      
      let deliverablesByC: Record<string, number> = {};
      let submissionsByC: Record<string, number> = {};
      
      if (campaignIds.length > 0) {
        const { data: deliverables } = await supabase
          .from('campaign_deliverables')
          .select('campaign_id')
          .in('campaign_id', campaignIds);
        
        if (deliverables) {
          deliverables.forEach(d => {
            deliverablesByC[d.campaign_id] = (deliverablesByC[d.campaign_id] || 0) + 1;
          });
        }

        const { data: submissions } = await supabase
          .from('creator_submissions')
          .select('campaign_id, status')
          .in('campaign_id', campaignIds)
          .eq('creator_user_id', user.id)
          .eq('status', 'approved');

        if (submissions) {
          submissions.forEach(s => {
            submissionsByC[s.campaign_id] = (submissionsByC[s.campaign_id] || 0) + 1;
          });
        }
      }

      // Get earnings status
      let earningsByInv: Record<string, string> = {};
      if (invitationIds.length > 0) {
        const { data: earnings } = await supabase
          .from('creator_earnings')
          .select('invitation_id, status')
          .in('invitation_id', invitationIds);
        if (earnings) {
          earningsByInv = earnings.reduce((acc, e) => ({ ...acc, [e.invitation_id]: e.status }), {});
        }
      }

      // Get unread messages count
      let unreadByC: Record<string, boolean> = {};
      if (campaignIds.length > 0) {
        const { data: messages } = await supabase
          .from('campaign_messages')
          .select('campaign_id, read_at')
          .in('campaign_id', campaignIds)
          .neq('sender_user_id', user.id)
          .is('read_at', null);
        
        if (messages) {
          messages.forEach(m => {
            unreadByC[m.campaign_id] = true;
          });
        }
      }

      // Transform to expected format
      return participants.map(p => {
        const campaign = p.campaign;
        const brand = campaign?.brand_user_id ? brandProfiles[campaign.brand_user_id] : null;
        const invitation = p.invitation_id ? invitations[p.invitation_id] : null;
        const totalDeliverables = deliverablesByC[campaign?.id || ''] || 0;
        const doneDeliverables = submissionsByC[campaign?.id || ''] || 0;
        const progress = totalDeliverables > 0 ? Math.round((doneDeliverables / totalDeliverables) * 100) : 0;
        const earningStatus = p.invitation_id ? earningsByInv[p.invitation_id] : null;

        // Map participant status to display status
        let displayStatus: CreatorActiveCampaign['status'] = 'in_progress';
        if (p.status === 'completed') displayStatus = 'completed';
        else if (progress === 100 && p.status !== 'completed') displayStatus = 'pending_review';
        else if (p.status === 'active' && progress > 0) displayStatus = 'in_progress';
        else displayStatus = 'active';

        return {
          id: campaign?.id || '',
          campaignName: campaign?.name || 'Unknown Campaign',
          brandName: brand?.company_name || 'Brand',
          brandLogo: brand?.logo_url,
          imageUrl: campaign?.thumbnail_url,
          status: displayStatus,
          commission: (invitation?.offered_payout || 0) + (invitation?.negotiated_delta || 0),
          paymentStatus: (earningStatus === 'paid' ? 'paid' : earningStatus === 'eligible' ? 'eligible' : 'pending') as 'pending' | 'eligible' | 'paid',
          deadline: campaign?.timeline_end,
          startDate: campaign?.timeline_start,
          categories: [campaign?.category].filter(Boolean) as string[],
          socials: campaign?.required_platforms || [],
          progress,
          deliverablesDone: doneDeliverables,
          deliverablesTotal: totalDeliverables,
          hasUnreadMessages: unreadByC[campaign?.id || ''] || false,
          participantId: p.id,
          invitationId: p.invitation_id,
        };
      });
    },
    staleTime: 30000,
  });
};
