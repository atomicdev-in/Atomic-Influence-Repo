-- =====================================================
-- Influencer Account Connection Layer
-- Unified social platform OAuth & data ingestion
-- =====================================================

-- Extended linked_accounts table with OAuth tokens and platform metadata
ALTER TABLE public.linked_accounts
  ADD COLUMN IF NOT EXISTS access_token TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS oauth_scope TEXT,
  ADD COLUMN IF NOT EXISTS platform_user_id TEXT,
  ADD COLUMN IF NOT EXISTS profile_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_url TEXT,
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS data_confidence TEXT DEFAULT 'high',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;

-- Create unique index for platform + user to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_linked_accounts_user_platform 
  ON public.linked_accounts(user_id, platform);

-- Platform-specific audience metrics (followers, demographics, etc.)
CREATE TABLE IF NOT EXISTS public.platform_audience_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  linked_account_id UUID NOT NULL REFERENCES public.linked_accounts(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  followers_count INTEGER,
  following_count INTEGER,
  posts_count INTEGER,
  avg_likes NUMERIC,
  avg_comments NUMERIC,
  avg_shares NUMERIC,
  avg_views NUMERIC,
  engagement_rate NUMERIC,
  audience_demographics JSONB DEFAULT '{}'::jsonb,
  audience_geography JSONB DEFAULT '{}'::jsonb,
  audience_interests JSONB DEFAULT '[]'::jsonb,
  growth_rate NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_account_date UNIQUE (linked_account_id, metric_date)
);

-- Content performance tracking
CREATE TABLE IF NOT EXISTS public.platform_content_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  linked_account_id UUID NOT NULL REFERENCES public.linked_accounts(id) ON DELETE CASCADE,
  platform_post_id TEXT NOT NULL,
  post_type TEXT NOT NULL,
  content_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  posted_at TIMESTAMPTZ,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  video_watch_time INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate NUMERIC,
  sentiment_score NUMERIC,
  is_sponsored BOOLEAN DEFAULT false,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  detected_brand_tags TEXT[],
  disclosure_present BOOLEAN DEFAULT false,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_platform_post UNIQUE (linked_account_id, platform_post_id)
);

-- Campaign content tracking (links posts to campaigns)
CREATE TABLE IF NOT EXISTS public.campaign_content_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL,
  content_post_id UUID REFERENCES public.platform_content_posts(id) ON DELETE CASCADE,
  tracking_link_id UUID REFERENCES public.creator_tracking_links(id),
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  status TEXT DEFAULT 'detected',
  detection_method TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data sync jobs tracking
CREATE TABLE IF NOT EXISTS public.platform_sync_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  linked_account_id UUID NOT NULL REFERENCES public.linked_accounts(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Account health and fraud indicators
CREATE TABLE IF NOT EXISTS public.account_health_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  linked_account_id UUID NOT NULL REFERENCES public.linked_accounts(id) ON DELETE CASCADE,
  check_date DATE NOT NULL,
  follower_authenticity_score INTEGER,
  engagement_authenticity_score INTEGER,
  growth_consistency_score INTEGER,
  content_originality_score INTEGER,
  overall_health_score INTEGER,
  suspicious_indicators JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_account_health_date UNIQUE (linked_account_id, check_date)
);

-- Enable RLS on all new tables
ALTER TABLE public.platform_audience_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_content_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_health_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_audience_metrics
CREATE POLICY "Users can view their own audience metrics"
  ON public.platform_audience_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.linked_accounts la 
    WHERE la.id = linked_account_id AND la.user_id = auth.uid()
  ));

CREATE POLICY "Brands can view creator metrics for campaigns"
  ON public.platform_audience_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.linked_accounts la
    JOIN public.campaign_invitations ci ON ci.creator_user_id = la.user_id
    JOIN public.campaigns c ON c.id = ci.campaign_id
    WHERE la.id = linked_account_id 
    AND c.brand_user_id = auth.uid()
    AND ci.status = 'accepted'
  ));

CREATE POLICY "Admins can view all audience metrics"
  ON public.platform_audience_metrics FOR SELECT
  USING (is_admin(auth.uid()));

-- RLS Policies for platform_content_posts
CREATE POLICY "Users can view their own content"
  ON public.platform_content_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.linked_accounts la 
    WHERE la.id = linked_account_id AND la.user_id = auth.uid()
  ));

CREATE POLICY "Brands can view campaign content"
  ON public.platform_content_posts FOR SELECT
  USING (
    campaign_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.campaigns c 
      WHERE c.id = campaign_id AND c.brand_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all content"
  ON public.platform_content_posts FOR SELECT
  USING (is_admin(auth.uid()));

-- RLS Policies for campaign_content_tracking
CREATE POLICY "Creators can view their campaign content tracking"
  ON public.campaign_content_tracking FOR SELECT
  USING (creator_user_id = auth.uid());

CREATE POLICY "Brands can view campaign content tracking"
  ON public.campaign_content_tracking FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_id AND c.brand_user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage campaign content tracking"
  ON public.campaign_content_tracking FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for platform_sync_jobs
CREATE POLICY "Users can view their own sync jobs"
  ON public.platform_sync_jobs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.linked_accounts la 
    WHERE la.id = linked_account_id AND la.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all sync jobs"
  ON public.platform_sync_jobs FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for account_health_indicators
CREATE POLICY "Users can view their own health indicators"
  ON public.account_health_indicators FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.linked_accounts la 
    WHERE la.id = linked_account_id AND la.user_id = auth.uid()
  ));

CREATE POLICY "Brands can view creator health for campaigns"
  ON public.account_health_indicators FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.linked_accounts la
    JOIN public.campaign_invitations ci ON ci.creator_user_id = la.user_id
    JOIN public.campaigns c ON c.id = ci.campaign_id
    WHERE la.id = linked_account_id 
    AND c.brand_user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all health indicators"
  ON public.account_health_indicators FOR SELECT
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audience_metrics_account ON public.platform_audience_metrics(linked_account_id);
CREATE INDEX IF NOT EXISTS idx_audience_metrics_date ON public.platform_audience_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_content_posts_account ON public.platform_content_posts(linked_account_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_campaign ON public.platform_content_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_posted ON public.platform_content_posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_campaign_tracking_campaign ON public.campaign_content_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON public.platform_sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_health_account ON public.account_health_indicators(linked_account_id);

-- Function to refresh token if expired
CREATE OR REPLACE FUNCTION public.check_token_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.token_expires_at IS NOT NULL AND NEW.token_expires_at < now() THEN
    NEW.sync_status = 'token_expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS check_token_on_update ON public.linked_accounts;
CREATE TRIGGER check_token_on_update
  BEFORE UPDATE ON public.linked_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_token_expiry();

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_content_posts_updated_at ON public.platform_content_posts;
CREATE TRIGGER update_content_posts_updated_at
  BEFORE UPDATE ON public.platform_content_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_tracking_updated_at ON public.campaign_content_tracking;
CREATE TRIGGER update_campaign_tracking_updated_at
  BEFORE UPDATE ON public.campaign_content_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();