-- Create user_status_log table to track status changes with reasons (for audit)
CREATE TABLE public.user_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'disabled')),
  reason text,
  changed_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_status_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view status logs
CREATE POLICY "Admins can view user status logs"
ON public.user_status_log FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can insert status logs (via edge function)
CREATE POLICY "Admins can insert user status logs"
ON public.user_status_log FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Create a view to get current user status (joins with auth.users banned_until)
-- Note: We'll use edge function to check banned_until since we can't query auth.users directly

-- Create function to check if user is disabled (for RLS and app logic)
-- This will be called by the edge function that has access to auth.users
CREATE OR REPLACE FUNCTION public.get_latest_user_status(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status
  FROM public.user_status_log
  WHERE user_id = _user_id
  ORDER BY created_at DESC
  LIMIT 1
$$;

-- Create index for faster lookups
CREATE INDEX idx_user_status_log_user_id ON public.user_status_log(user_id, created_at DESC);