import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform OAuth configurations
const PLATFORM_CONFIGS = {
  meta: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    profileUrl: 'https://graph.facebook.com/me',
    instagramUrl: 'https://graph.facebook.com/v18.0/me/accounts',
    scopes: ['instagram_basic', 'instagram_manage_insights', 'pages_show_list', 'pages_read_engagement'],
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    profileUrl: 'https://open.tiktokapis.com/v2/user/info/',
    scopes: ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.list'],
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    profileUrl: 'https://api.twitter.com/2/users/me',
    scopes: ['tweet.read', 'users.read', 'follows.read'],
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    profileUrl: 'https://api.linkedin.com/v2/userinfo',
    scopes: ['openid', 'profile', 'email'],
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://www.googleapis.com/youtube/v3/channels',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
  },
};

interface OAuthRequest {
  action: 'init' | 'callback' | 'refresh' | 'disconnect' | 'sync' | 'status';
  platform: string;
  code?: string;
  redirectUri?: string;
  state?: string;
  accountId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get auth header for user context
    const authHeader = req.headers.get('Authorization');
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || '' } },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Parse request
    const body: OAuthRequest = await req.json();
    const { action, platform } = body;

    console.log(`[social-connect] Action: ${action}, Platform: ${platform}`);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // Allow public actions for callback handling
      if (action !== 'callback') {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    switch (action) {
      case 'init':
        return handleOAuthInit(platform, body.redirectUri!, user!.id);

      case 'callback':
        return handleOAuthCallback(platform, body.code!, body.redirectUri!, body.state!, adminClient);

      case 'refresh':
        return handleTokenRefresh(platform, body.accountId!, adminClient);

      case 'disconnect':
        return handleDisconnect(body.accountId!, user!.id, supabase);

      case 'sync':
        return handleDataSync(body.accountId!, adminClient);

      case 'status':
        return handleGetStatus(user!.id, platform, supabase);

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[social-connect] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Initialize OAuth flow - return auth URL
async function handleOAuthInit(platform: string, redirectUri: string, userId: string) {
  const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
  if (!config) {
    return new Response(
      JSON.stringify({ error: `Unsupported platform: ${platform}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Generate state token for CSRF protection
  const state = btoa(JSON.stringify({ 
    userId, 
    platform, 
    timestamp: Date.now(),
    nonce: crypto.randomUUID()
  }));

  let authUrl: string;
  const scopes = config.scopes.join(' ');

  switch (platform) {
    case 'meta': {
      const appId = Deno.env.get('META_APP_ID');
      authUrl = `${config.authUrl}?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code`;
      break;
    }
    case 'tiktok': {
      const clientKey = Deno.env.get('TIKTOK_API_KEY');
      authUrl = `${config.authUrl}?client_key=${clientKey}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code`;
      break;
    }
    case 'twitter': {
      const consumerKey = Deno.env.get('X_CONSUMER_KEY');
      // Twitter uses PKCE
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      authUrl = `${config.authUrl}?client_id=${consumerKey}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      // Store code verifier for callback
      break;
    }
    case 'linkedin': {
      const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
      authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code`;
      break;
    }
    default:
      return new Response(
        JSON.stringify({ error: 'Platform not implemented' }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }

  console.log(`[social-connect] Generated auth URL for ${platform}`);

  return new Response(
    JSON.stringify({ authUrl, state }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle OAuth callback - exchange code for tokens
async function handleOAuthCallback(
  platform: string, 
  code: string, 
  redirectUri: string, 
  state: string,
  adminClient: ReturnType<typeof createClient>
) {
  // Decode and validate state
  let stateData: { userId: string; platform: string; timestamp: number };
  try {
    stateData = JSON.parse(atob(state));
    
    // Check timestamp (5 minute expiry)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      throw new Error('State expired');
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid state token' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
  let tokenData: TokenResponse;
  let profileData: ProfileData;

  try {
    // Exchange code for tokens
    tokenData = await exchangeCodeForTokens(platform, code, redirectUri, config);
    
    // Fetch user profile
    profileData = await fetchUserProfile(platform, tokenData.access_token, config);

    console.log(`[social-connect] Got profile for ${platform}:`, profileData.username);

    // Store/update linked account
    const { data: linkedAccount, error: upsertError } = await adminClient
      .from('linked_accounts')
      .upsert({
        user_id: stateData.userId,
        platform,
        username: profileData.username,
        platform_user_id: profileData.platformUserId,
        profile_name: profileData.displayName,
        profile_image_url: profileData.avatarUrl,
        profile_url: profileData.profileUrl,
        followers: profileData.followers,
        engagement: profileData.engagement,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        oauth_scope: tokenData.scope,
        connected: true,
        verified: true,
        is_verified: true,
        sync_status: 'connected',
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform',
      })
      .select()
      .single();

    if (upsertError) {
      console.error('[social-connect] Upsert error:', upsertError);
      throw upsertError;
    }

    // Create initial sync job
    await adminClient
      .from('platform_sync_jobs')
      .insert({
        linked_account_id: linkedAccount.id,
        sync_type: 'full',
        status: 'pending',
      });

    // Store initial audience metrics
    await adminClient
      .from('platform_audience_metrics')
      .upsert({
        linked_account_id: linkedAccount.id,
        metric_date: new Date().toISOString().split('T')[0],
        followers_count: profileData.followers,
        engagement_rate: profileData.engagement,
      }, {
        onConflict: 'linked_account_id,metric_date',
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        account: {
          id: linkedAccount.id,
          platform,
          username: profileData.username,
          displayName: profileData.displayName,
          avatarUrl: profileData.avatarUrl,
          followers: profileData.followers,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[social-connect] Callback error for ${platform}:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Token exchange implementation
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

interface ProfileData {
  platformUserId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  profileUrl?: string;
  followers?: number;
  following?: number;
  engagement?: number;
  bio?: string;
}

async function exchangeCodeForTokens(
  platform: string,
  code: string,
  redirectUri: string,
  config: typeof PLATFORM_CONFIGS[keyof typeof PLATFORM_CONFIGS]
): Promise<TokenResponse> {
  let body: URLSearchParams;
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  switch (platform) {
    case 'meta': {
      body = new URLSearchParams({
        client_id: Deno.env.get('META_APP_ID')!,
        client_secret: Deno.env.get('META_APP_SECRET')!,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
      break;
    }
    case 'tiktok': {
      body = new URLSearchParams({
        client_key: Deno.env.get('TIKTOK_API_KEY')!,
        client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET')!,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
      break;
    }
    case 'twitter': {
      const credentials = btoa(`${Deno.env.get('X_CONSUMER_KEY')}:${Deno.env.get('X_CONSUMER_SECRET')}`);
      headers['Authorization'] = `Basic ${credentials}`;
      body = new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        client_id: Deno.env.get('X_CONSUMER_KEY')!,
      });
      break;
    }
    case 'linkedin': {
      body = new URLSearchParams({
        client_id: Deno.env.get('LINKEDIN_CLIENT_ID')!,
        client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET')!,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
      break;
    }
    default:
      throw new Error(`Token exchange not implemented for ${platform}`);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[social-connect] Token exchange failed for ${platform}:`, errorText);
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  return await response.json();
}

// Profile fetching implementation
async function fetchUserProfile(
  platform: string,
  accessToken: string,
  config: typeof PLATFORM_CONFIGS[keyof typeof PLATFORM_CONFIGS]
): Promise<ProfileData> {
  let profileUrl = config.profileUrl;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
  };

  switch (platform) {
    case 'meta': {
      // Get Instagram Business Account via Facebook Pages
      profileUrl = `${config.profileUrl}?fields=id,name,picture&access_token=${accessToken}`;
      delete headers['Authorization'];
      break;
    }
    case 'tiktok': {
      profileUrl = `${config.profileUrl}?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count`;
      break;
    }
    case 'twitter': {
      profileUrl = `${config.profileUrl}?user.fields=id,name,username,profile_image_url,public_metrics,description`;
      break;
    }
    case 'linkedin': {
      // LinkedIn uses OpenID Connect userinfo
      break;
    }
  }

  const response = await fetch(profileUrl, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[social-connect] Profile fetch failed for ${platform}:`, errorText);
    throw new Error(`Profile fetch failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Normalize profile data
  return normalizeProfileData(platform, data);
}

function normalizeProfileData(platform: string, data: Record<string, unknown>): ProfileData {
  switch (platform) {
    case 'meta': {
      return {
        platformUserId: data.id as string,
        username: data.name as string,
        displayName: data.name as string,
        avatarUrl: (data.picture as { data?: { url?: string } })?.data?.url,
        profileUrl: `https://instagram.com/${data.name}`,
      };
    }
    case 'tiktok': {
      const userData = data.data?.user || data;
      return {
        platformUserId: userData.open_id as string,
        username: userData.display_name as string,
        displayName: userData.display_name as string,
        avatarUrl: userData.avatar_url as string,
        profileUrl: `https://tiktok.com/@${userData.display_name}`,
        followers: userData.follower_count as number,
        following: userData.following_count as number,
      };
    }
    case 'twitter': {
      const userData = data.data || data;
      const metrics = userData.public_metrics || {};
      return {
        platformUserId: userData.id as string,
        username: userData.username as string,
        displayName: userData.name as string,
        avatarUrl: userData.profile_image_url as string,
        profileUrl: `https://x.com/${userData.username}`,
        followers: metrics.followers_count as number,
        following: metrics.following_count as number,
        bio: userData.description as string,
      };
    }
    case 'linkedin': {
      return {
        platformUserId: data.sub as string,
        username: data.email as string || data.name as string,
        displayName: data.name as string,
        avatarUrl: data.picture as string,
        profileUrl: `https://linkedin.com/in/${data.sub}`,
      };
    }
    default:
      throw new Error(`Profile normalization not implemented for ${platform}`);
  }
}

// Handle token refresh
async function handleTokenRefresh(
  platform: string,
  accountId: string,
  adminClient: ReturnType<typeof createClient>
) {
  const { data: account, error } = await adminClient
    .from('linked_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error || !account) {
    return new Response(
      JSON.stringify({ error: 'Account not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!account.refresh_token) {
    return new Response(
      JSON.stringify({ error: 'No refresh token available' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
  
  try {
    const tokenData = await refreshAccessToken(platform, account.refresh_token, config);

    await adminClient
      .from('linked_accounts')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || account.refresh_token,
        token_expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        sync_status: 'connected',
        error_count: 0,
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    await adminClient
      .from('linked_accounts')
      .update({
        sync_status: 'token_expired',
        error_count: (account.error_count || 0) + 1,
        last_error: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function refreshAccessToken(
  platform: string,
  refreshToken: string,
  config: typeof PLATFORM_CONFIGS[keyof typeof PLATFORM_CONFIGS]
): Promise<TokenResponse> {
  let body: URLSearchParams;
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  switch (platform) {
    case 'meta': {
      body = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: Deno.env.get('META_APP_ID')!,
        client_secret: Deno.env.get('META_APP_SECRET')!,
        fb_exchange_token: refreshToken,
      });
      break;
    }
    case 'tiktok': {
      body = new URLSearchParams({
        client_key: Deno.env.get('TIKTOK_API_KEY')!,
        client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET')!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      break;
    }
    case 'twitter': {
      const credentials = btoa(`${Deno.env.get('X_CONSUMER_KEY')}:${Deno.env.get('X_CONSUMER_SECRET')}`);
      headers['Authorization'] = `Basic ${credentials}`;
      body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      break;
    }
    case 'linkedin': {
      body = new URLSearchParams({
        client_id: Deno.env.get('LINKEDIN_CLIENT_ID')!,
        client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET')!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      break;
    }
    default:
      throw new Error(`Token refresh not implemented for ${platform}`);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return await response.json();
}

// Handle account disconnect
async function handleDisconnect(
  accountId: string,
  userId: string,
  supabase: ReturnType<typeof createClient>
) {
  const { error } = await supabase
    .from('linked_accounts')
    .update({
      connected: false,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      sync_status: 'disconnected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .eq('user_id', userId);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle data sync request
async function handleDataSync(
  accountId: string,
  adminClient: ReturnType<typeof createClient>
) {
  const { data: account, error } = await adminClient
    .from('linked_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error || !account) {
    return new Response(
      JSON.stringify({ error: 'Account not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create sync job
  const { data: syncJob } = await adminClient
    .from('platform_sync_jobs')
    .insert({
      linked_account_id: accountId,
      sync_type: 'full',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  try {
    const config = PLATFORM_CONFIGS[account.platform as keyof typeof PLATFORM_CONFIGS];
    const profileData = await fetchUserProfile(account.platform, account.access_token, config);

    // Update account with fresh data
    await adminClient
      .from('linked_accounts')
      .update({
        followers: profileData.followers,
        profile_name: profileData.displayName,
        profile_image_url: profileData.avatarUrl,
        last_sync: new Date().toISOString(),
        sync_status: 'connected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId);

    // Store metrics
    await adminClient
      .from('platform_audience_metrics')
      .upsert({
        linked_account_id: accountId,
        metric_date: new Date().toISOString().split('T')[0],
        followers_count: profileData.followers,
        following_count: profileData.following,
        engagement_rate: profileData.engagement,
      }, {
        onConflict: 'linked_account_id,metric_date',
      });

    // Update sync job
    await adminClient
      .from('platform_sync_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_processed: 1,
      })
      .eq('id', syncJob?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        followers: profileData.followers,
        lastSync: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    await adminClient
      .from('platform_sync_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq('id', syncJob?.id);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get account connection status
async function handleGetStatus(
  userId: string,
  platform: string,
  supabase: ReturnType<typeof createClient>
) {
  const { data: account, error } = await supabase
    .from('linked_accounts')
    .select('id, platform, username, connected, sync_status, last_sync, followers, engagement, is_verified')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single();

  if (error && error.code !== 'PGRST116') {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      connected: !!account?.connected,
      account: account || null,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// PKCE helpers for Twitter
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
