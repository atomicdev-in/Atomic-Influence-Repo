-- Create tenant role rules table for configurable role assignment
CREATE TABLE public.tenant_role_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_identifier text NOT NULL UNIQUE,
  email_domain text NOT NULL,
  assigned_role user_role NOT NULL,
  is_locked boolean NOT NULL DEFAULT false,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.tenant_role_rules ENABLE ROW LEVEL SECURITY;

-- Only super admins can view tenant role rules
CREATE POLICY "Only admins can view tenant role rules"
ON public.tenant_role_rules FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can insert (but not duplicate locked rules)
CREATE POLICY "Only admins can insert tenant role rules"
ON public.tenant_role_rules FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Only admins can update unlocked rules
CREATE POLICY "Only admins can update unlocked tenant role rules"
ON public.tenant_role_rules FOR UPDATE
USING (is_admin(auth.uid()) AND is_locked = false);

-- Only admins can delete unlocked rules
CREATE POLICY "Only admins can delete unlocked tenant role rules"
ON public.tenant_role_rules FOR DELETE
USING (is_admin(auth.uid()) AND is_locked = false);

-- Seed the bluecloudai rule (LOCKED - cannot be modified)
INSERT INTO public.tenant_role_rules (tenant_identifier, email_domain, assigned_role, is_locked, priority)
VALUES ('bluecloudai', 'bluecloudai.com', 'admin', true, 100);

-- Create function to check for auto-role assignment based on email domain
CREATE OR REPLACE FUNCTION public.get_auto_assigned_role(_email text)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT assigned_role
  FROM public.tenant_role_rules
  WHERE _email ILIKE '%@' || email_domain
  ORDER BY priority DESC
  LIMIT 1
$$;

-- Modify handle_new_user to auto-assign roles at user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auto_role user_role;
BEGIN
  -- Insert creator profile (still needed for profile data structure)
  INSERT INTO public.creator_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.brand_fit_data (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.campaign_history (user_id)
  VALUES (NEW.id);
  
  -- Check for auto-assigned role based on tenant rules
  SELECT get_auto_assigned_role(NEW.email) INTO auto_role;
  
  IF auto_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, auto_role)
    ON CONFLICT (user_id) DO UPDATE SET role = auto_role, updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger for updated_at on tenant_role_rules
CREATE TRIGGER update_tenant_role_rules_updated_at
BEFORE UPDATE ON public.tenant_role_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();