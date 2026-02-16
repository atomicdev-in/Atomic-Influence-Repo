import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = createClient(supabaseUrl, supabaseServiceKey);

    const { action } = await req.json();
    console.log(`[CAMPAIGN-LIFECYCLE] Action: ${action}`);

    switch (action) {
      case 'check-transitions': {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const transitionResults: { id: string; name: string; from: string; to: string }[] = [];

        // 1. Discovery → Active
        const { data: discoveryToActive, error: error1 } = await supabase
          .from('campaigns')
          .select('id, name, timeline_start, brand_user_id')
          .eq('status', 'discovery')
          .lte('timeline_start', today);

        if (!error1 && discoveryToActive) {
          for (const campaign of discoveryToActive) {
            const { count } = await supabase
              .from('campaign_participants')
              .select('id', { count: 'exact', head: true })
              .eq('campaign_id', campaign.id)
              .eq('status', 'active');

            if (count && count > 0) {
              await transitionCampaign(supabase, campaign.id, 'active', 'Timeline started with active participants');
              transitionResults.push({ id: campaign.id, name: campaign.name, from: 'discovery', to: 'active' });
            }
          }
        }

        // 2. Active → Reviewing
        const { data: activeToReviewing, error: error2 } = await supabase
          .from('campaigns')
          .select('id, name, timeline_end, brand_user_id')
          .eq('status', 'active')
          .lte('timeline_end', today);

        if (!error2 && activeToReviewing) {
          for (const campaign of activeToReviewing) {
            await transitionCampaign(supabase, campaign.id, 'reviewing', 'Timeline ended');
            transitionResults.push({ id: campaign.id, name: campaign.name, from: 'active', to: 'reviewing' });
          }
        }

        // 3. Reviewing → Completed
        const { data: reviewingToCompleted, error: error3 } = await supabase
          .from('campaigns')
          .select('id, name, timeline_end, brand_user_id, updated_at')
          .eq('status', 'reviewing');

        if (!error3 && reviewingToCompleted) {
          for (const campaign of reviewingToCompleted) {
            const reviewingStarted = new Date(campaign.updated_at);
            const daysSinceReview = (now.getTime() - reviewingStarted.getTime()) / (1000 * 60 * 60 * 24);

            const { data: participants } = await supabase
              .from('campaign_participants')
              .select('status')
              .eq('campaign_id', campaign.id);

            const allCompleted = participants && participants.length > 0 && 
                                participants.every((p: { status: string }) => p.status === 'completed');

            if (daysSinceReview >= 14 || allCompleted) {
              await transitionCampaign(supabase, campaign.id, 'completed', 
                allCompleted ? 'All participants completed' : 'Auto-completed after 14 days');
              transitionResults.push({ id: campaign.id, name: campaign.name, from: 'reviewing', to: 'completed' });

              const { data: campaignData } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', campaign.id)
                .single();

              if (campaignData) {
                await supabase.from('campaign_snapshots').insert({
                  campaign_id: campaign.id,
                  snapshot_data: campaignData,
                  snapshot_type: 'completed',
                  created_by: campaign.brand_user_id,
                });
              }
            }
          }
        }

        if (transitionResults.length > 0) {
          await supabase.from('system_health_logs').insert({
            event_type: 'campaign_lifecycle',
            severity: 'info',
            message: `Transitioned ${transitionResults.length} campaigns`,
            metadata: { transitions: transitionResults },
          });
        }

        return new Response(JSON.stringify({ success: true, transitions: transitionResults }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cancel-campaign': {
        const { campaignId, userId, reason } = await req.json();

        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single();

        if (campaignError || !campaign) {
          return new Response(JSON.stringify({ success: false, error: 'Campaign not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }

        if (campaign.brand_user_id !== userId) {
          return new Response(JSON.stringify({ success: false, error: 'Not authorized' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          });
        }

        const { data: reservations } = await supabase
          .from('campaign_budget_reservations')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('reservation_status', 'held');

        if (reservations && reservations.length > 0) {
          for (const reservation of reservations) {
            await supabase
              .from('campaign_budget_reservations')
              .update({
                reservation_status: 'released',
                released_at: new Date().toISOString(),
                released_reason: 'Campaign cancelled',
              })
              .eq('id', reservation.id);
          }
        }

        await transitionCampaign(supabase, campaignId, 'cancelled', reason || 'Cancelled by brand');

        await supabase.from('campaign_snapshots').insert({
          campaign_id: campaignId,
          snapshot_data: campaign,
          snapshot_type: 'cancelled',
          created_by: userId,
        });

        const { data: participants } = await supabase
          .from('campaign_participants')
          .select('creator_user_id')
          .eq('campaign_id', campaignId);

        if (participants) {
          for (const participant of participants) {
            await supabase.functions.invoke('notifications', {
              body: {
                action: 'send',
                userId: participant.creator_user_id,
                type: 'campaign_status_changed',
                title: 'Campaign Cancelled',
                message: `"${campaign.name}" has been cancelled by the brand.`,
                actionUrl: '/dashboard',
                metadata: { campaignId, campaignName: campaign.name },
              },
            });
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check-deadline-reminders': {
        const now = new Date();
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const { data: upcomingDeadlines, error } = await supabase
          .from('campaign_deliverables')
          .select(`id, title, required_by, campaign_id`)
          .gte('required_by', now.toISOString())
          .lte('required_by', in48Hours.toISOString());

        if (error) {
          console.error('[CAMPAIGN-LIFECYCLE] Error fetching deadlines:', error);
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        const remindersSent: { deliverableId: string; creatorUserId: string }[] = [];

        for (const deliverable of upcomingDeadlines || []) {
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('name')
            .eq('id', deliverable.campaign_id)
            .single();

          const { data: participants } = await supabase
            .from('campaign_participants')
            .select('creator_user_id')
            .eq('campaign_id', deliverable.campaign_id)
            .eq('status', 'active');

          if (!participants) continue;

          for (const participant of participants) {
            const { data: submission } = await supabase
              .from('creator_submissions')
              .select('id')
              .eq('deliverable_id', deliverable.id)
              .eq('creator_user_id', participant.creator_user_id)
              .single();

            if (!submission) {
              await supabase.functions.invoke('notifications', {
                body: {
                  action: 'send',
                  userId: participant.creator_user_id,
                  type: 'deadline_reminder',
                  title: 'Deadline Reminder',
                  message: `"${deliverable.title}" for "${campaign?.name || 'Campaign'}" is due in 48 hours`,
                  actionUrl: `/campaign/${deliverable.campaign_id}`,
                  metadata: { deliverableId: deliverable.id, title: deliverable.title },
                },
              });
              remindersSent.push({ deliverableId: deliverable.id, creatorUserId: participant.creator_user_id });
            }
          }
        }

        return new Response(JSON.stringify({ success: true, remindersSent: remindersSent.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }
  } catch (err) {
    const error = err as Error;
    console.error('[CAMPAIGN-LIFECYCLE] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function transitionCampaign(supabase: any, campaignId: string, newStatus: string, reason: string) {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status, brand_user_id')
    .eq('id', campaignId)
    .single();

  const oldStatus = campaign?.status;

  await supabase
    .from('campaigns')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', campaignId);

  await supabase.from('audit_logs').insert({
    user_id: campaign?.brand_user_id,
    action: 'campaign_status_changed',
    entity_type: 'campaign',
    entity_id: campaignId,
    old_value: { status: oldStatus },
    new_value: { status: newStatus },
    metadata: { reason },
  });

  console.log(`[CAMPAIGN-LIFECYCLE] Campaign ${campaignId}: ${oldStatus} → ${newStatus} (${reason})`);
}
