import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function generateTrackingCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateQRCodeUrl(url: string, size: number = 200): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&format=png`;
}

function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    
    // Handle GET redirect with event logging
    if (req.method === 'GET' && code) {
      const { data: trackingLink, error } = await supabase
        .from('creator_tracking_links')
        .select('*')
        .eq('tracking_code', code)
        .single();

      if (error || !trackingLink) {
        return new Response('Link not found', { status: 404, headers: corsHeaders });
      }

      const userAgent = req.headers.get('user-agent') || '';
      const referrer = req.headers.get('referer') || '';
      const clientIP = req.headers.get('x-forwarded-for') || '';

      // Insert tracking event
      await supabase.from('tracking_events').insert({
        event_type: 'click',
        tracking_link_id: trackingLink.id,
        campaign_id: trackingLink.campaign_id,
        creator_user_id: trackingLink.creator_user_id,
        visitor_ip_hash: clientIP ? hashIP(clientIP) : null,
        user_agent: userAgent.substring(0, 500),
        referrer: referrer.substring(0, 500),
      });

      await supabase.from('creator_tracking_links').update({
        click_count: (trackingLink.click_count || 0) + 1,
        last_clicked_at: new Date().toISOString(),
      }).eq('id', trackingLink.id);

      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': trackingLink.original_url },
      });
    }

    const { action, campaignId, creatorUserId } = await req.json();

    if (action === 'generate-creator-links') {
      if (!campaignId || !creatorUserId) {
        return new Response(
          JSON.stringify({ error: 'campaignId and creatorUserId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: ctaLinks, error: ctaError } = await supabase
        .from('campaign_cta_links')
        .select('*')
        .eq('campaign_id', campaignId);

      if (ctaError) throw ctaError;

      if (!ctaLinks || ctaLinks.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No CTA links to generate', links: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const generatedLinks = [];
      const baseUrl = `${supabaseUrl}/functions/v1/tracking-links`;

      for (const ctaLink of ctaLinks) {
        const { data: existingLink } = await supabase
          .from('creator_tracking_links')
          .select('*')
          .eq('cta_link_id', ctaLink.id)
          .eq('creator_user_id', creatorUserId)
          .single();

        if (existingLink) {
          generatedLinks.push(existingLink);
          continue;
        }

        let trackingCode = generateTrackingCode();
        let attempts = 0;
        while (attempts < 5) {
          const { data: existingCode } = await supabase
            .from('creator_tracking_links')
            .select('id')
            .eq('tracking_code', trackingCode)
            .single();
          if (!existingCode) break;
          trackingCode = generateTrackingCode();
          attempts++;
        }

        const shortUrl = `${baseUrl}?code=${trackingCode}`;
        const qrCodeUrl = generateQRCodeUrl(shortUrl, 300);

        const { data: newLink, error: insertError } = await supabase
          .from('creator_tracking_links')
          .insert({
            campaign_id: campaignId,
            creator_user_id: creatorUserId,
            cta_link_id: ctaLink.id,
            tracking_code: trackingCode,
            short_url: shortUrl,
            original_url: ctaLink.original_url,
            qr_code_url: qrCodeUrl,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        generatedLinks.push(newLink);
      }

      return new Response(
        JSON.stringify({ success: true, links: generatedLinks }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'record-conversion') {
      const { trackingCode, conversionValue, metadata } = await req.json();
      if (!trackingCode) {
        return new Response(
          JSON.stringify({ error: 'trackingCode required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: trackingLink } = await supabase
        .from('creator_tracking_links')
        .select('*')
        .eq('tracking_code', trackingCode)
        .single();

      if (!trackingLink) {
        return new Response(
          JSON.stringify({ error: 'Tracking link not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase.from('tracking_events').insert({
        event_type: 'conversion',
        tracking_link_id: trackingLink.id,
        campaign_id: trackingLink.campaign_id,
        creator_user_id: trackingLink.creator_user_id,
        metadata: { conversion_value: conversionValue || 0, ...metadata },
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const error = err as Error;
    console.error('[TRACKING] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
