-- Create brand role enum
CREATE TYPE public.brand_role AS ENUM ('agency_admin', 'finance', 'campaign_manager');

-- Create brand user roles table
CREATE TABLE public.brand_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  role brand_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, brand_id)
);

-- Create campaign assignments table for campaign managers
CREATE TABLE public.campaign_manager_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, campaign_id)
);

-- Enable RLS
ALTER TABLE public.brand_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_manager_assignments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check brand roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_brand_role(_user_id UUID, _brand_id UUID, _role brand_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.brand_user_roles
    WHERE user_id = _user_id
      AND brand_id = _brand_id
      AND role = _role
  )
$$;

-- Function to check if user is agency admin for a brand
CREATE OR REPLACE FUNCTION public.is_brand_admin(_user_id UUID, _brand_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.brand_user_roles
    WHERE user_id = _user_id
      AND brand_id = _brand_id
      AND role = 'agency_admin'
  )
$$;

-- Function to check if user has any role in a brand
CREATE OR REPLACE FUNCTION public.get_user_brand_role(_user_id UUID, _brand_id UUID)
RETURNS brand_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.brand_user_roles
  WHERE user_id = _user_id
    AND brand_id = _brand_id
  LIMIT 1
$$;

-- Function to check if campaign manager can access a campaign
CREATE OR REPLACE FUNCTION public.can_manage_campaign(_user_id UUID, _campaign_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check if user owns the campaign directly
    SELECT 1 FROM public.campaigns c
    WHERE c.id = _campaign_id AND c.brand_user_id = _user_id
  ) OR EXISTS (
    -- Check if user is agency admin for the brand that owns the campaign
    SELECT 1 
    FROM public.campaigns c
    JOIN public.brand_profiles bp ON bp.user_id = c.brand_user_id
    JOIN public.brand_user_roles bur ON bur.brand_id = bp.id
    WHERE c.id = _campaign_id 
      AND bur.user_id = _user_id 
      AND bur.role = 'agency_admin'
  ) OR EXISTS (
    -- Check if user is assigned as campaign manager
    SELECT 1 
    FROM public.campaign_manager_assignments cma
    WHERE cma.campaign_id = _campaign_id 
      AND cma.user_id = _user_id
  )
$$;

-- RLS Policies for brand_user_roles

-- Agency admins can view all roles in their brand
CREATE POLICY "Brand admins can view all roles"
ON public.brand_user_roles FOR SELECT
USING (
  -- User is the brand owner
  EXISTS (
    SELECT 1 FROM public.brand_profiles bp
    WHERE bp.id = brand_user_roles.brand_id AND bp.user_id = auth.uid()
  )
  OR
  -- User is an agency admin for this brand
  public.is_brand_admin(auth.uid(), brand_user_roles.brand_id)
  OR
  -- User can view their own role
  user_id = auth.uid()
);

-- Only brand owners and agency admins can manage roles
CREATE POLICY "Brand owners and admins can manage roles"
ON public.brand_user_roles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.brand_profiles bp
    WHERE bp.id = brand_user_roles.brand_id AND bp.user_id = auth.uid()
  )
  OR
  public.is_brand_admin(auth.uid(), brand_user_roles.brand_id)
);

CREATE POLICY "Brand owners and admins can update roles"
ON public.brand_user_roles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.brand_profiles bp
    WHERE bp.id = brand_user_roles.brand_id AND bp.user_id = auth.uid()
  )
  OR
  public.is_brand_admin(auth.uid(), brand_user_roles.brand_id)
);

CREATE POLICY "Brand owners and admins can delete roles"
ON public.brand_user_roles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.brand_profiles bp
    WHERE bp.id = brand_user_roles.brand_id AND bp.user_id = auth.uid()
  )
  OR
  public.is_brand_admin(auth.uid(), brand_user_roles.brand_id)
);

-- RLS Policies for campaign_manager_assignments

-- Admins and brand owners can view all assignments
CREATE POLICY "Admins can view campaign assignments"
ON public.campaign_manager_assignments FOR SELECT
USING (
  -- User can see their own assignments
  user_id = auth.uid()
  OR
  -- Brand owner can see all assignments for their campaigns
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_manager_assignments.campaign_id 
      AND c.brand_user_id = auth.uid()
  )
  OR
  -- Agency admins can see all assignments
  EXISTS (
    SELECT 1 
    FROM public.campaigns c
    JOIN public.brand_profiles bp ON bp.user_id = c.brand_user_id
    WHERE c.id = campaign_manager_assignments.campaign_id
      AND public.is_brand_admin(auth.uid(), bp.id)
  )
);

-- Only admins can manage assignments
CREATE POLICY "Admins can create campaign assignments"
ON public.campaign_manager_assignments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_manager_assignments.campaign_id 
      AND c.brand_user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 
    FROM public.campaigns c
    JOIN public.brand_profiles bp ON bp.user_id = c.brand_user_id
    WHERE c.id = campaign_manager_assignments.campaign_id
      AND public.is_brand_admin(auth.uid(), bp.id)
  )
);

CREATE POLICY "Admins can delete campaign assignments"
ON public.campaign_manager_assignments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_manager_assignments.campaign_id 
      AND c.brand_user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 
    FROM public.campaigns c
    JOIN public.brand_profiles bp ON bp.user_id = c.brand_user_id
    WHERE c.id = campaign_manager_assignments.campaign_id
      AND public.is_brand_admin(auth.uid(), bp.id)
  )
);