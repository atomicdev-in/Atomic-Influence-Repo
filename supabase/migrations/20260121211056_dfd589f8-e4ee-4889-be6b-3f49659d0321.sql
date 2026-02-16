-- =============================================
-- MULTI-BRAND & AGENCY ARCHITECTURE EVOLUTION
-- =============================================

-- 1. Create audit log table for permission/role changes
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs are append-only; users can view their own, admins can view all for their brand
CREATE POLICY "Users can view audit logs they created"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Create persistent notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    category TEXT NOT NULL DEFAULT 'general',
    read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Index for fast notification queries
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- 3. Create tiered campaign manager permission levels
CREATE TYPE public.campaign_permission_level AS ENUM ('view', 'manage', 'full');

-- Add permission level to campaign_manager_assignments
ALTER TABLE public.campaign_manager_assignments 
ADD COLUMN IF NOT EXISTS permission_level public.campaign_permission_level NOT NULL DEFAULT 'manage';

-- 4. Create brand memberships table for multi-brand support
-- This allows users to belong to multiple brands (agencies)
CREATE TABLE public.brand_memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    brand_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
    role public.brand_role NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, brand_id)
);

-- Enable RLS on brand_memberships
ALTER TABLE public.brand_memberships ENABLE ROW LEVEL SECURITY;

-- Users can view their own memberships
CREATE POLICY "Users can view their own brand memberships"
ON public.brand_memberships FOR SELECT
USING (user_id = auth.uid());

-- Brand owners and admins can view all memberships for their brand
CREATE POLICY "Brand admins can view all memberships"
ON public.brand_memberships FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.brand_profiles bp
        WHERE bp.id = brand_memberships.brand_id AND bp.user_id = auth.uid()
    )
    OR is_brand_admin(auth.uid(), brand_id)
);

-- Brand owners and admins can manage memberships
CREATE POLICY "Brand admins can manage memberships"
ON public.brand_memberships FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.brand_profiles bp
        WHERE bp.id = brand_memberships.brand_id AND bp.user_id = auth.uid()
    )
    OR is_brand_admin(auth.uid(), brand_id)
);

CREATE POLICY "Brand admins can update memberships"
ON public.brand_memberships FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.brand_profiles bp
        WHERE bp.id = brand_memberships.brand_id AND bp.user_id = auth.uid()
    )
    OR is_brand_admin(auth.uid(), brand_id)
);

CREATE POLICY "Brand admins can delete memberships"
ON public.brand_memberships FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.brand_profiles bp
        WHERE bp.id = brand_memberships.brand_id AND bp.user_id = auth.uid()
    )
    OR is_brand_admin(auth.uid(), brand_id)
);

-- Index for fast membership lookups
CREATE INDEX idx_brand_memberships_user ON public.brand_memberships(user_id);
CREATE INDEX idx_brand_memberships_brand ON public.brand_memberships(brand_id);
CREATE INDEX idx_brand_memberships_default ON public.brand_memberships(user_id, is_default) WHERE is_default = true;

-- 5. Create function to get user's default brand
CREATE OR REPLACE FUNCTION public.get_user_default_brand(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    -- First check brand_memberships for default
    SELECT brand_id FROM public.brand_memberships
    WHERE user_id = _user_id AND is_default = true
    LIMIT 1
$$;

-- 6. Create function to get all brands for a user
CREATE OR REPLACE FUNCTION public.get_user_brands(_user_id uuid)
RETURNS TABLE(brand_id uuid, role brand_role, is_default boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    -- Get from brand_memberships
    SELECT bm.brand_id, bm.role, bm.is_default
    FROM public.brand_memberships bm
    WHERE bm.user_id = _user_id
    
    UNION
    
    -- Also include brands the user directly owns
    SELECT bp.id as brand_id, 'agency_admin'::brand_role as role, true as is_default
    FROM public.brand_profiles bp
    WHERE bp.user_id = _user_id
$$;

-- 7. Create function to check campaign permission level
CREATE OR REPLACE FUNCTION public.get_campaign_permission_level(_user_id uuid, _campaign_id uuid)
RETURNS campaign_permission_level
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        CASE 
            -- Owner has full access
            WHEN EXISTS (
                SELECT 1 FROM public.campaigns c
                WHERE c.id = _campaign_id AND c.brand_user_id = _user_id
            ) THEN 'full'::campaign_permission_level
            -- Agency admin has full access
            WHEN EXISTS (
                SELECT 1 
                FROM public.campaigns c
                JOIN public.brand_profiles bp ON bp.user_id = c.brand_user_id
                WHERE c.id = _campaign_id AND is_brand_admin(_user_id, bp.id)
            ) THEN 'full'::campaign_permission_level
            -- Check campaign manager assignment
            ELSE (
                SELECT cma.permission_level
                FROM public.campaign_manager_assignments cma
                WHERE cma.campaign_id = _campaign_id AND cma.user_id = _user_id
            )
        END
$$;

-- 8. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 9. Migrate existing brand_user_roles to brand_memberships
INSERT INTO public.brand_memberships (user_id, brand_id, role, is_default)
SELECT user_id, brand_id, role, false
FROM public.brand_user_roles
ON CONFLICT (user_id, brand_id) DO NOTHING;

-- 10. Create trigger for audit logging on role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_value)
        VALUES (
            COALESCE(auth.uid(), NEW.user_id),
            'role_assigned',
            'brand_membership',
            NEW.id,
            jsonb_build_object('brand_id', NEW.brand_id, 'role', NEW.role)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.role IS DISTINCT FROM NEW.role THEN
            INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES (
                COALESCE(auth.uid(), NEW.user_id),
                'role_changed',
                'brand_membership',
                NEW.id,
                jsonb_build_object('role', OLD.role),
                jsonb_build_object('role', NEW.role)
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value)
        VALUES (
            COALESCE(auth.uid(), OLD.user_id),
            'role_removed',
            'brand_membership',
            OLD.id,
            jsonb_build_object('brand_id', OLD.brand_id, 'role', OLD.role)
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER brand_membership_audit
AFTER INSERT OR UPDATE OR DELETE ON public.brand_memberships
FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- 11. Create trigger for campaign manager assignment audit
CREATE OR REPLACE FUNCTION public.log_campaign_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_value)
        VALUES (
            NEW.assigned_by,
            'campaign_assigned',
            'campaign_manager_assignment',
            NEW.id,
            jsonb_build_object('campaign_id', NEW.campaign_id, 'user_id', NEW.user_id, 'permission_level', NEW.permission_level)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.permission_level IS DISTINCT FROM NEW.permission_level THEN
            INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES (
                COALESCE(auth.uid(), NEW.assigned_by),
                'permission_changed',
                'campaign_manager_assignment',
                NEW.id,
                jsonb_build_object('permission_level', OLD.permission_level),
                jsonb_build_object('permission_level', NEW.permission_level)
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value)
        VALUES (
            COALESCE(auth.uid(), OLD.assigned_by),
            'campaign_unassigned',
            'campaign_manager_assignment',
            OLD.id,
            jsonb_build_object('campaign_id', OLD.campaign_id, 'user_id', OLD.user_id)
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER campaign_assignment_audit
AFTER INSERT OR UPDATE OR DELETE ON public.campaign_manager_assignments
FOR EACH ROW EXECUTE FUNCTION public.log_campaign_assignment();