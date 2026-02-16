-- Campaign assets table (brand uploads at campaign level)
CREATE TABLE public.campaign_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  asset_category TEXT NOT NULL DEFAULT 'general', -- 'image', 'video', 'brand_kit', 'document', 'general'
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign CTA links (brand defines these)
CREATE TABLE public.campaign_cta_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g., "Website", "App Download", "Landing Page"
  original_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Creator-specific tracking links (auto-generated per creator per CTA)
CREATE TABLE public.creator_tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL,
  cta_link_id UUID NOT NULL REFERENCES public.campaign_cta_links(id) ON DELETE CASCADE,
  
  -- Tracking link details
  tracking_code TEXT NOT NULL UNIQUE, -- Short unique code like "abc123"
  short_url TEXT NOT NULL, -- Full short URL
  original_url TEXT NOT NULL, -- Copy of original for quick access
  qr_code_url TEXT, -- URL to generated QR code image
  
  -- Stats (for future use)
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(cta_link_id, creator_user_id)
);

-- Enable RLS
ALTER TABLE public.campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_cta_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_tracking_links ENABLE ROW LEVEL SECURITY;

-- Campaign assets policies
CREATE POLICY "Brands can manage assets for their campaigns"
ON public.campaign_assets
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_assets.campaign_id
    AND brand_user_id = auth.uid()
  )
);

CREATE POLICY "Approved creators can view campaign assets"
ON public.campaign_assets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_invitations ci
    WHERE ci.campaign_id = campaign_assets.campaign_id
    AND ci.creator_user_id = auth.uid()
    AND ci.status = 'accepted'
  )
);

-- Campaign CTA links policies
CREATE POLICY "Brands can manage CTA links for their campaigns"
ON public.campaign_cta_links
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_cta_links.campaign_id
    AND brand_user_id = auth.uid()
  )
);

CREATE POLICY "Approved creators can view CTA links"
ON public.campaign_cta_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_invitations ci
    WHERE ci.campaign_id = campaign_cta_links.campaign_id
    AND ci.creator_user_id = auth.uid()
    AND ci.status = 'accepted'
  )
);

-- Creator tracking links policies
CREATE POLICY "Brands can view tracking links for their campaigns"
ON public.creator_tracking_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = creator_tracking_links.campaign_id
    AND brand_user_id = auth.uid()
  )
);

CREATE POLICY "Creators can view their own tracking links"
ON public.creator_tracking_links
FOR SELECT
USING (creator_user_id = auth.uid());

-- Service role can insert/update tracking links (for edge function)
CREATE POLICY "Service role can manage tracking links"
ON public.creator_tracking_links
FOR ALL
USING (true)
WITH CHECK (true);

-- Create storage bucket for campaign assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-assets', 'campaign-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campaign assets
CREATE POLICY "Brands can upload campaign assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-assets' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view campaign assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'campaign-assets');

CREATE POLICY "Brands can delete their campaign assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'campaign-assets'
  AND auth.uid() IS NOT NULL
);