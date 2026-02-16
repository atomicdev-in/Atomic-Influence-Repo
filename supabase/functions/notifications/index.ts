import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// =====================================================
// EMAIL ADAPTER INTERFACE
// =====================================================

interface EmailAdapter {
  send(to: string, subject: string, body: string, templateData?: Record<string, unknown>): Promise<boolean>;
}

// =====================================================
// RESEND EMAIL ADAPTER (Production)
// =====================================================

class ResendEmailAdapter implements EmailAdapter {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'notifications@atomicinfluence.app';
  }

  async send(to: string, subject: string, body: string, templateData?: Record<string, unknown>) {
    console.log(`[RESEND] Sending email to: ${to}`);
    console.log(`[RESEND] Subject: ${subject}`);

    try {
      const htmlBody = this.formatHtmlEmail(subject, body, templateData);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject: subject,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[RESEND] API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('[RESEND] Email sent successfully:', result.id);
      return true;

    } catch (error) {
      console.error('[RESEND] Send error:', error);
      return false;
    }
  }

  private formatHtmlEmail(subject: string, body: string, templateData?: Record<string, unknown>): string {
    const siteUrl = Deno.env.get('SITE_URL') || 'https://atomicinfluence.app';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #6366f1;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #6366f1;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ Atomic Influence</div>
        </div>
        <div class="content">
            <h2>${subject}</h2>
            <p>${body.replace(/\n/g, '<br>')}</p>
            ${templateData?.actionUrl ? `<a href="${siteUrl}${templateData.actionUrl}" class="button">View Details</a>` : ''}
        </div>
        <div class="footer">
            <p>This is an automated notification from Atomic Influence.</p>
            <p>© ${new Date().getFullYear()} Atomic Influence. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}

// =====================================================
// STUB EMAIL ADAPTER (Development/Testing)
// =====================================================

class StubEmailAdapter implements EmailAdapter {
  async send(to: string, subject: string, body: string, templateData?: Record<string, unknown>) {
    console.log(`[STUB EMAIL] To: ${to}`);
    console.log(`[STUB EMAIL] Subject: ${subject}`);
    console.log(`[STUB EMAIL] Body: ${body}`);
    if (templateData) {
      console.log(`[STUB EMAIL] Template Data:`, JSON.stringify(templateData));
    }
    return true;
  }
}

// =====================================================
// ADAPTER FACTORY
// =====================================================

function getEmailAdapter(): EmailAdapter {
  const resendKey = Deno.env.get('RESEND_API_KEY');

  if (resendKey && resendKey.startsWith('re_')) {
    console.log('[NOTIFICATIONS] Using Resend adapter (production mode)');
    return new ResendEmailAdapter(resendKey);
  }

  console.log('[NOTIFICATIONS] Using stub email adapter (development mode) - Set RESEND_API_KEY for production');
  return new StubEmailAdapter();
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

type NotificationType =
  | 'invitation_received'
  | 'invitation_accepted'
  | 'invitation_declined'
  | 'submission_received'
  | 'submission_reviewed'
  | 'payment_released'
  | 'deadline_reminder'
  | 'campaign_status_changed';

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  sendEmail?: boolean;
}

// =====================================================
// EDGE FUNCTION HANDLER
// =====================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    const emailAdapter = getEmailAdapter();

    console.log(`[NOTIFICATIONS] Action: ${action}`);

    switch (action) {
      case 'send': {
        const payload = params as NotificationPayload;

        const { data: notification, error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: payload.userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            action_url: payload.actionUrl,
            metadata: payload.metadata || {},
            category: getCategoryForType(payload.type),
          })
          .select()
          .single();

        if (notifError) {
          console.error('[NOTIFICATIONS] DB insert error:', notifError);
          return new Response(JSON.stringify({ success: false, error: notifError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        if (payload.sendEmail !== false) {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(payload.userId);

          if (!userError && userData?.user?.email) {
            const emailBody = formatEmailBody(payload);
            const emailMetadata = {
              ...payload.metadata,
              actionUrl: payload.actionUrl,
            };
            await emailAdapter.send(userData.user.email, payload.title, emailBody, emailMetadata);
          }
        }

        return new Response(JSON.stringify({ success: true, notification }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'send-batch': {
        const { notifications } = params as { notifications: NotificationPayload[] };

        const results = [];
        for (const payload of notifications) {
          const { data, error } = await supabase
            .from('notifications')
            .insert({
              user_id: payload.userId,
              type: payload.type,
              title: payload.title,
              message: payload.message,
              action_url: payload.actionUrl,
              metadata: payload.metadata || {},
              category: getCategoryForType(payload.type),
            })
            .select()
            .single();

          results.push({ userId: payload.userId, success: !error, id: data?.id });

          // Send emails in batch
          if (!error && payload.sendEmail !== false) {
            const { data: userData } = await supabase.auth.admin.getUserById(payload.userId);
            if (userData?.user?.email) {
              const emailBody = formatEmailBody(payload);
              const emailMetadata = {
                ...payload.metadata,
                actionUrl: payload.actionUrl,
              };
              await emailAdapter.send(userData.user.email, payload.title, emailBody, emailMetadata);
            }
          }
        }

        return new Response(JSON.stringify({ success: true, results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'trigger-invitation-received': {
        const { creatorUserId, campaignId, campaignName, brandName, offeredPayout } = params;

        await sendNotificationInternal(supabase, emailAdapter, {
          userId: creatorUserId,
          type: 'invitation_received',
          title: 'New Campaign Invitation',
          message: `${brandName} has invited you to join "${campaignName}" for $${offeredPayout}`,
          actionUrl: '/invitations',
          metadata: { campaignId, brandName, offeredPayout },
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'trigger-invitation-accepted': {
        const { brandUserId, creatorName, campaignId, campaignName } = params;

        await sendNotificationInternal(supabase, emailAdapter, {
          userId: brandUserId,
          type: 'invitation_accepted',
          title: 'Invitation Accepted',
          message: `${creatorName} has accepted your invitation to "${campaignName}"`,
          actionUrl: `/brand/campaigns/${campaignId}`,
          metadata: { campaignId, creatorName },
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'trigger-submission-received': {
        const { brandUserId, creatorName, campaignId, campaignName, deliverableTitle } = params;

        await sendNotificationInternal(supabase, emailAdapter, {
          userId: brandUserId,
          type: 'submission_received',
          title: 'New Content Submission',
          message: `${creatorName} submitted "${deliverableTitle}" for "${campaignName}"`,
          actionUrl: `/brand/campaigns/${campaignId}`,
          metadata: { campaignId, creatorName, deliverableTitle },
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'trigger-submission-reviewed': {
        const { creatorUserId, campaignId, campaignName, action: reviewAction, feedback } = params;

        const statusText = reviewAction === 'approved' ? 'approved' :
                          reviewAction === 'revision_requested' ? 'needs revision' : 'rejected';

        await sendNotificationInternal(supabase, emailAdapter, {
          userId: creatorUserId,
          type: 'submission_reviewed',
          title: `Submission ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
          message: `Your submission for "${campaignName}" has been ${statusText}${feedback ? `: "${feedback}"` : ''}`,
          actionUrl: `/campaign/${campaignId}`,
          metadata: { campaignId, action: reviewAction, feedback },
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'trigger-payment-released': {
        const { creatorUserId, campaignName, netAmount } = params;

        await sendNotificationInternal(supabase, emailAdapter, {
          userId: creatorUserId,
          type: 'payment_released',
          title: 'Payment Available',
          message: `$${netAmount} is now available for payout from "${campaignName}"`,
          actionUrl: '/commissions',
          metadata: { campaignName, netAmount },
        });

        return new Response(JSON.stringify({ success: true }), {
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
    console.error('[NOTIFICATIONS] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getCategoryForType(type: NotificationType): string {
  switch (type) {
    case 'invitation_received':
    case 'invitation_accepted':
    case 'invitation_declined':
      return 'campaigns';
    case 'submission_received':
    case 'submission_reviewed':
      return 'content';
    case 'payment_released':
      return 'payments';
    case 'deadline_reminder':
      return 'reminders';
    case 'campaign_status_changed':
      return 'campaigns';
    default:
      return 'general';
  }
}

function formatEmailBody(payload: NotificationPayload): string {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://atomicinfluence.app';
  return `
${payload.message}

${payload.actionUrl ? `View details: ${siteUrl}${payload.actionUrl}` : ''}

---
Atomic Influence
  `.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendNotificationInternal(supabase: any, emailAdapter: EmailAdapter, payload: NotificationPayload) {
  await supabase
    .from('notifications')
    .insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      action_url: payload.actionUrl,
      metadata: payload.metadata || {},
      category: getCategoryForType(payload.type),
    });

  const { data: userData } = await supabase.auth.admin.getUserById(payload.userId);
  if (userData?.user?.email) {
    const emailMetadata = {
      ...payload.metadata,
      actionUrl: payload.actionUrl,
    };
    await emailAdapter.send(userData.user.email, payload.title, formatEmailBody(payload), emailMetadata);
  }
}
