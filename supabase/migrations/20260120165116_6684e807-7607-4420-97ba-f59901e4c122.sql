-- Fix the overly permissive RLS policy by making it more restrictive
-- Drop the permissive policy
DROP POLICY IF EXISTS "Service role can manage tracking links" ON public.creator_tracking_links;

-- Create proper INSERT policy (system inserts via edge function with service role)
-- Edge functions use service role key which bypasses RLS, so we don't need this policy
-- Instead, let's create a policy for brands to insert for their campaigns
CREATE POLICY "System can insert tracking links for campaigns"
ON public.creator_tracking_links
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = creator_tracking_links.campaign_id
    AND brand_user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.campaign_invitations ci
    WHERE ci.campaign_id = creator_tracking_links.campaign_id
    AND ci.creator_user_id = creator_tracking_links.creator_user_id
    AND ci.status = 'accepted'
  )
);

-- Update policy for click tracking
CREATE POLICY "System can update tracking link stats"
ON public.creator_tracking_links
FOR UPDATE
USING (true)
WITH CHECK (true);