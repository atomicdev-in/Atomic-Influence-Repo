-- Create a helper function to check if user is admin (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = 'admin'
    )
$$;

-- Create admin_settings table for system-wide configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin settings
CREATE POLICY "Admins can view admin settings"
ON public.admin_settings
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Only admins can insert admin settings
CREATE POLICY "Admins can insert admin settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update admin settings
CREATE POLICY "Admins can update admin settings"
ON public.admin_settings
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Only admins can delete admin settings
CREATE POLICY "Admins can delete admin settings"
ON public.admin_settings
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Create system_health_logs table for tracking system events
CREATE TABLE IF NOT EXISTS public.system_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_health_logs
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view system health logs
CREATE POLICY "Admins can view system health logs"
ON public.system_health_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Only admins can insert health logs via edge functions only
CREATE POLICY "Edge functions can insert health logs"
ON public.system_health_logs
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Create view for admin to see all creators with their profile data
CREATE OR REPLACE VIEW public.admin_creators_view AS
SELECT 
    cp.id,
    cp.user_id,
    cp.name,
    cp.username,
    cp.email,
    cp.bio,
    cp.location,
    cp.avatar_url,
    cp.created_at,
    cp.updated_at,
    (SELECT COUNT(*) FROM public.linked_accounts la WHERE la.user_id = cp.user_id AND la.connected = true) as connected_accounts_count,
    (SELECT SUM(followers) FROM public.linked_accounts la WHERE la.user_id = cp.user_id AND la.connected = true) as total_followers,
    (SELECT COUNT(*) FROM public.campaign_invitations ci WHERE ci.creator_user_id = cp.user_id AND ci.status = 'accepted') as active_campaigns_count
FROM public.creator_profiles cp;

-- Create view for admin to see all brands with their profile data
CREATE OR REPLACE VIEW public.admin_brands_view AS
SELECT 
    bp.id,
    bp.user_id,
    bp.company_name,
    bp.email,
    bp.industry,
    bp.website,
    bp.company_size,
    bp.logo_url,
    bp.description,
    bp.created_at,
    bp.updated_at,
    (SELECT COUNT(*) FROM public.campaigns c WHERE c.brand_user_id = bp.user_id) as total_campaigns,
    (SELECT COUNT(*) FROM public.campaigns c WHERE c.brand_user_id = bp.user_id AND c.status = 'active') as active_campaigns_count,
    (SELECT COUNT(*) FROM public.brand_memberships bm WHERE bm.brand_id = bp.id) as team_members_count
FROM public.brand_profiles bp;

-- Create view for admin campaigns oversight (read-only)
CREATE OR REPLACE VIEW public.admin_campaigns_view AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.status,
    c.category,
    c.total_budget,
    c.allocated_budget,
    c.remaining_budget,
    c.influencer_count,
    c.timeline_start,
    c.timeline_end,
    c.created_at,
    c.updated_at,
    bp.company_name as brand_name,
    bp.id as brand_id,
    (SELECT COUNT(*) FROM public.campaign_invitations ci WHERE ci.campaign_id = c.id) as invitations_count,
    (SELECT COUNT(*) FROM public.campaign_invitations ci WHERE ci.campaign_id = c.id AND ci.status = 'accepted') as accepted_invitations_count
FROM public.campaigns c
LEFT JOIN public.brand_profiles bp ON bp.user_id = c.brand_user_id;

-- Create view for admin surveys overview
CREATE OR REPLACE VIEW public.admin_surveys_view AS
SELECT 
    s.id,
    s.title,
    s.description,
    s.category,
    s.is_active,
    s.created_at,
    s.updated_at,
    (SELECT COUNT(*) FROM public.survey_questions sq WHERE sq.survey_id = s.id) as questions_count,
    (SELECT COUNT(*) FROM public.survey_responses sr WHERE sr.survey_id = s.id) as responses_count
FROM public.surveys s;