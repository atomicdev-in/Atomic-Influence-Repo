-- Create enum for message status
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Create campaign_messages table for campaign-scoped messaging
CREATE TABLE public.campaign_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('creator', 'brand')),
  content TEXT NOT NULL,
  status message_status NOT NULL DEFAULT 'sent',
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_campaign_messages_campaign_id ON public.campaign_messages(campaign_id);
CREATE INDEX idx_campaign_messages_sender ON public.campaign_messages(sender_user_id);
CREATE INDEX idx_campaign_messages_created_at ON public.campaign_messages(campaign_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Brands can manage messages in their campaigns
CREATE POLICY "Brands can manage messages for their campaigns"
ON public.campaign_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_messages.campaign_id
    AND campaigns.brand_user_id = auth.uid()
  )
);

-- RLS: Creators can view and send messages for campaigns they're invited to (accepted status)
CREATE POLICY "Creators can view messages for accepted campaigns"
ON public.campaign_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaign_invitations ci
    WHERE ci.campaign_id = campaign_messages.campaign_id
    AND ci.creator_user_id = auth.uid()
    AND ci.status = 'accepted'::invitation_status
  )
);

-- RLS: Creators can insert messages for accepted campaigns
CREATE POLICY "Creators can send messages for accepted campaigns"
ON public.campaign_messages
FOR INSERT
WITH CHECK (
  sender_user_id = auth.uid()
  AND sender_role = 'creator'
  AND EXISTS (
    SELECT 1 FROM campaign_invitations ci
    WHERE ci.campaign_id = campaign_messages.campaign_id
    AND ci.creator_user_id = auth.uid()
    AND ci.status = 'accepted'::invitation_status
  )
);

-- RLS: Allow status updates (delivered/read) by recipients
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
  -- Only allow updating status fields
  true
);

-- Trigger for updated_at
CREATE TRIGGER update_campaign_messages_updated_at
BEFORE UPDATE ON public.campaign_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for campaign_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_messages;