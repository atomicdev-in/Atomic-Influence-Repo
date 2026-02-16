-- Fix the overly permissive WITH CHECK on message status update policy
-- Drop and recreate with proper constraint
DROP POLICY IF EXISTS "Recipients can update message status" ON public.campaign_messages;

CREATE POLICY "Recipients can update message status"
ON public.campaign_messages
FOR UPDATE
USING (
  -- Brand can update status for creator messages
  (sender_role = 'creator' AND EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_messages.campaign_id
    AND campaigns.brand_user_id = auth.uid()
  ))
  OR
  -- Creator can update status for brand messages
  (sender_role = 'brand' AND EXISTS (
    SELECT 1 FROM campaign_invitations ci
    WHERE ci.campaign_id = campaign_messages.campaign_id
    AND ci.creator_user_id = auth.uid()
    AND ci.status = 'accepted'::invitation_status
  ))
)
WITH CHECK (
  -- Brand can update status for creator messages
  (sender_role = 'creator' AND EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_messages.campaign_id
    AND campaigns.brand_user_id = auth.uid()
  ))
  OR
  -- Creator can update status for brand messages
  (sender_role = 'brand' AND EXISTS (
    SELECT 1 FROM campaign_invitations ci
    WHERE ci.campaign_id = campaign_messages.campaign_id
    AND ci.creator_user_id = auth.uid()
    AND ci.status = 'accepted'::invitation_status
  ))
);