-- Create campaign status enum
CREATE TYPE public.campaign_status AS ENUM ('draft', 'discovery', 'active', 'reviewing', 'completed', 'cancelled');

-- Create invitation status enum  
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'negotiating', 'withdrawn');

-- Create negotiation status enum
CREATE TYPE public.negotiation_status AS ENUM ('pending', 'accepted', 'rejected', 'countered');

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Budget allocation
  total_budget NUMERIC NOT NULL DEFAULT 0,
  influencer_count INTEGER NOT NULL DEFAULT 1,
  base_payout_per_influencer NUMERIC GENERATED ALWAYS AS (
    CASE WHEN influencer_count > 0 THEN total_budget / influencer_count ELSE 0 END
  ) STORED,
  allocated_budget NUMERIC NOT NULL DEFAULT 0, -- Track actual allocated amount
  remaining_budget NUMERIC GENERATED ALWAYS AS (total_budget - allocated_budget) STORED,
  
  -- Requirements
  deliverables JSONB DEFAULT '[]'::jsonb,
  content_guidelines TEXT,
  timeline_start DATE,
  timeline_end DATE,
  
  -- Targeting
  targeting_criteria JSONB DEFAULT '{}'::jsonb,
  required_platforms TEXT[] DEFAULT '{}',
  min_followers INTEGER DEFAULT 0,
  min_engagement NUMERIC DEFAULT 0,
  target_niches TEXT[] DEFAULT '{}',
  
  status campaign_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create campaign invitations table
CREATE TABLE public.campaign_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL,
  
  -- Payout tracking
  base_payout NUMERIC NOT NULL, -- Original base payout at time of invite
  offered_payout NUMERIC NOT NULL, -- Current offered amount (may differ from base)
  negotiated_delta NUMERIC DEFAULT 0, -- Track how much extra was negotiated
  
  -- Terms
  deliverables JSONB DEFAULT '[]'::jsonb,
  timeline_start DATE,
  timeline_end DATE,
  special_requirements TEXT,
  
  status invitation_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(campaign_id, creator_user_id)
);

-- Create campaign negotiations table (tracks all counter-offers)
CREATE TABLE public.campaign_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.campaign_invitations(id) ON DELETE CASCADE,
  proposed_by TEXT NOT NULL CHECK (proposed_by IN ('brand', 'creator')),
  
  -- Proposed changes
  proposed_payout NUMERIC,
  proposed_deliverables JSONB,
  proposed_timeline_start DATE,
  proposed_timeline_end DATE,
  message TEXT,
  
  status negotiation_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_negotiations ENABLE ROW LEVEL SECURITY;

-- Campaigns policies (brands can manage their own, creators can view campaigns they're invited to)
CREATE POLICY "Brands can manage their own campaigns"
ON public.campaigns
FOR ALL
USING (auth.uid() = brand_user_id);

CREATE POLICY "Creators can view campaigns they are invited to"
ON public.campaigns
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_invitations
    WHERE campaign_id = campaigns.id
    AND creator_user_id = auth.uid()
  )
);

-- Campaign invitations policies
CREATE POLICY "Brands can manage invitations for their campaigns"
ON public.campaign_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_invitations.campaign_id
    AND brand_user_id = auth.uid()
  )
);

CREATE POLICY "Creators can view and respond to their invitations"
ON public.campaign_invitations
FOR SELECT
USING (creator_user_id = auth.uid());

CREATE POLICY "Creators can update their own invitation status"
ON public.campaign_invitations
FOR UPDATE
USING (creator_user_id = auth.uid());

-- Campaign negotiations policies
CREATE POLICY "Brands can manage negotiations for their campaigns"
ON public.campaign_negotiations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_invitations ci
    JOIN public.campaigns c ON c.id = ci.campaign_id
    WHERE ci.id = campaign_negotiations.invitation_id
    AND c.brand_user_id = auth.uid()
  )
);

CREATE POLICY "Creators can view and create negotiations for their invitations"
ON public.campaign_negotiations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_invitations
    WHERE id = campaign_negotiations.invitation_id
    AND creator_user_id = auth.uid()
  )
);

CREATE POLICY "Creators can insert negotiations for their invitations"
ON public.campaign_invitations
FOR INSERT
WITH CHECK (creator_user_id = auth.uid());

CREATE POLICY "Creators can create counter-offers"
ON public.campaign_negotiations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaign_invitations
    WHERE id = campaign_negotiations.invitation_id
    AND creator_user_id = auth.uid()
  )
  AND proposed_by = 'creator'
);

-- Triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_invitations_updated_at
BEFORE UPDATE ON public.campaign_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to recalculate campaign budget when negotiation is accepted
CREATE OR REPLACE FUNCTION public.handle_negotiation_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation campaign_invitations%ROWTYPE;
  v_campaign campaigns%ROWTYPE;
  v_delta NUMERIC;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get the invitation
    SELECT * INTO v_invitation FROM campaign_invitations WHERE id = NEW.invitation_id;
    
    -- Get the campaign
    SELECT * INTO v_campaign FROM campaigns WHERE id = v_invitation.campaign_id;
    
    -- Calculate delta if payout increased
    IF NEW.proposed_payout IS NOT NULL AND NEW.proposed_payout > v_invitation.offered_payout THEN
      v_delta := NEW.proposed_payout - v_invitation.offered_payout;
      
      -- Update the invitation with new payout and delta
      UPDATE campaign_invitations
      SET 
        offered_payout = NEW.proposed_payout,
        negotiated_delta = COALESCE(negotiated_delta, 0) + v_delta,
        deliverables = COALESCE(NEW.proposed_deliverables, deliverables),
        timeline_start = COALESCE(NEW.proposed_timeline_start, timeline_start),
        timeline_end = COALESCE(NEW.proposed_timeline_end, timeline_end)
      WHERE id = NEW.invitation_id;
      
      -- Update campaign allocated budget
      UPDATE campaigns
      SET allocated_budget = allocated_budget + v_delta
      WHERE id = v_invitation.campaign_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_negotiation_status_change
AFTER UPDATE ON public.campaign_negotiations
FOR EACH ROW
EXECUTE FUNCTION public.handle_negotiation_accepted();