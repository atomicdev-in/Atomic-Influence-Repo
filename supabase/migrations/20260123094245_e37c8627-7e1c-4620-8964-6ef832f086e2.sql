-- Fix views to use SECURITY INVOKER (default for views that should respect RLS)
-- Drop and recreate with explicit security invoker

DROP VIEW IF EXISTS public.admin_creators_view;
DROP VIEW IF EXISTS public.admin_brands_view;
DROP VIEW IF EXISTS public.admin_campaigns_view;
DROP VIEW IF EXISTS public.admin_surveys_view;

-- Recreate admin_creators_view with SECURITY INVOKER
CREATE VIEW public.admin_creators_view
WITH (security_invoker = true)
AS
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

-- Recreate admin_brands_view with SECURITY INVOKER
CREATE VIEW public.admin_brands_view
WITH (security_invoker = true)
AS
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

-- Recreate admin_campaigns_view with SECURITY INVOKER
CREATE VIEW public.admin_campaigns_view
WITH (security_invoker = true)
AS
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

-- Recreate admin_surveys_view with SECURITY INVOKER
CREATE VIEW public.admin_surveys_view
WITH (security_invoker = true)
AS
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

-- Now we need to add RLS policies to allow admin access to the underlying tables for these views
-- Add admin SELECT policies to creator_profiles
CREATE POLICY "Admins can view all creator profiles"
ON public.creator_profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to brand_profiles
CREATE POLICY "Admins can view all brand profiles"
ON public.brand_profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to campaigns
CREATE POLICY "Admins can view all campaigns"
ON public.campaigns
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to campaign_invitations
CREATE POLICY "Admins can view all invitations"
ON public.campaign_invitations
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to linked_accounts
CREATE POLICY "Admins can view all linked accounts"
ON public.linked_accounts
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to brand_memberships
CREATE POLICY "Admins can view all brand memberships"
ON public.brand_memberships
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to surveys
CREATE POLICY "Admins can view all surveys"
ON public.surveys
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to survey_responses
CREATE POLICY "Admins can view all survey responses"
ON public.survey_responses
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to survey_questions
CREATE POLICY "Admins can view all survey questions"
ON public.survey_questions
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to user_roles (for system overview)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to audit_logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add admin SELECT policies to notifications (for system oversight)
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (public.is_admin(auth.uid()));