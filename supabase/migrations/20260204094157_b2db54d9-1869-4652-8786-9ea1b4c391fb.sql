-- =====================================================
-- PHASE 1-3: ENFORCEMENT TABLES AND RPCs
-- =====================================================

-- 1. Campaign Snapshots (frozen contracts on publish)
CREATE TABLE public.campaign_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    snapshot_data jsonb NOT NULL,
    snapshot_type text NOT NULL CHECK (snapshot_type IN ('published', 'completed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL
);

-- 2. Campaign Budget Reservations (escrow)
CREATE TABLE public.campaign_budget_reservations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    invitation_id uuid NOT NULL REFERENCES public.campaign_invitations(id) ON DELETE CASCADE,
    creator_user_id uuid NOT NULL,
    reserved_amount numeric NOT NULL CHECK (reserved_amount > 0),
    reservation_status text NOT NULL DEFAULT 'held' CHECK (reservation_status IN ('held', 'released', 'disbursed')),
    held_at timestamptz NOT NULL DEFAULT now(),
    released_at timestamptz,
    released_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(invitation_id)
);

-- 3. Campaign Participants (active creators)
CREATE TABLE public.campaign_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    creator_user_id uuid NOT NULL,
    invitation_id uuid NOT NULL REFERENCES public.campaign_invitations(id) ON DELETE CASCADE,
    joined_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'completed')),
    final_payout numeric,
    completed_at timestamptz,
    UNIQUE(campaign_id, creator_user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.campaign_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_budget_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Campaign Snapshots: Brand owners can read, system creates
CREATE POLICY "Brand owners can view their campaign snapshots"
ON public.campaign_snapshots FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_snapshots.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Admins can view all campaign snapshots"
ON public.campaign_snapshots FOR SELECT
USING (is_admin(auth.uid()));

-- Budget Reservations: Brand owners can read, system manages
CREATE POLICY "Brand owners can view their campaign reservations"
ON public.campaign_budget_reservations FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_budget_reservations.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Creators can view their own reservations"
ON public.campaign_budget_reservations FOR SELECT
USING (creator_user_id = auth.uid());

CREATE POLICY "Admins can view all reservations"
ON public.campaign_budget_reservations FOR SELECT
USING (is_admin(auth.uid()));

-- Campaign Participants: Brand and creator can read
CREATE POLICY "Brand owners can view their campaign participants"
ON public.campaign_participants FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_participants.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Creators can view their own participation"
ON public.campaign_participants FOR SELECT
USING (creator_user_id = auth.uid());

CREATE POLICY "Admins can view all participants"
ON public.campaign_participants FOR SELECT
USING (is_admin(auth.uid()));

-- =====================================================
-- ENFORCEMENT RPCs (SECURITY DEFINER)
-- =====================================================

-- 1. PUBLISH CAMPAIGN RPC
CREATE OR REPLACE FUNCTION public.publish_campaign(_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_campaign campaigns%ROWTYPE;
    v_snapshot_id uuid;
BEGIN
    -- Get campaign and verify ownership
    SELECT * INTO v_campaign FROM campaigns WHERE id = _campaign_id;
    
    IF v_campaign IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Campaign not found');
    END IF;
    
    IF v_campaign.brand_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;
    
    IF v_campaign.status != 'draft' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Campaign already published');
    END IF;
    
    -- Validate required fields
    IF v_campaign.name IS NULL OR v_campaign.name = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Campaign name required');
    END IF;
    
    IF v_campaign.total_budget <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Budget must be greater than zero');
    END IF;
    
    IF v_campaign.timeline_start IS NULL OR v_campaign.timeline_end IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Timeline dates required');
    END IF;
    
    -- Create snapshot
    INSERT INTO campaign_snapshots (campaign_id, snapshot_data, snapshot_type, created_by)
    VALUES (
        _campaign_id,
        to_jsonb(v_campaign),
        'published',
        auth.uid()
    )
    RETURNING id INTO v_snapshot_id;
    
    -- Update campaign status
    UPDATE campaigns 
    SET status = 'discovery', updated_at = now()
    WHERE id = _campaign_id;
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        auth.uid(),
        'campaign_published',
        'campaign',
        _campaign_id,
        jsonb_build_object('snapshot_id', v_snapshot_id, 'status', 'discovery')
    );
    
    RETURN jsonb_build_object('success', true, 'snapshot_id', v_snapshot_id);
END;
$$;

-- 2. ACCEPT CAMPAIGN INVITATION RPC
CREATE OR REPLACE FUNCTION public.accept_campaign_invitation(_invitation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation campaign_invitations%ROWTYPE;
    v_campaign campaigns%ROWTYPE;
    v_total_payout numeric;
    v_reservation_id uuid;
    v_participant_id uuid;
BEGIN
    -- Get invitation and verify ownership
    SELECT * INTO v_invitation FROM campaign_invitations WHERE id = _invitation_id;
    
    IF v_invitation IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation not found');
    END IF;
    
    IF v_invitation.creator_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;
    
    IF v_invitation.status NOT IN ('pending', 'negotiating') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation cannot be accepted in current status');
    END IF;
    
    -- Get campaign
    SELECT * INTO v_campaign FROM campaigns WHERE id = v_invitation.campaign_id;
    
    IF v_campaign.status NOT IN ('discovery', 'active') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Campaign is not accepting participants');
    END IF;
    
    -- Calculate total payout
    v_total_payout := v_invitation.offered_payout + COALESCE(v_invitation.negotiated_delta, 0);
    
    -- Check budget availability
    IF COALESCE(v_campaign.remaining_budget, v_campaign.total_budget - v_campaign.allocated_budget) < v_total_payout THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient campaign budget');
    END IF;
    
    -- Create budget reservation
    INSERT INTO campaign_budget_reservations (
        campaign_id, invitation_id, creator_user_id, reserved_amount
    ) VALUES (
        v_invitation.campaign_id, _invitation_id, auth.uid(), v_total_payout
    )
    RETURNING id INTO v_reservation_id;
    
    -- Update campaign allocated budget
    UPDATE campaigns SET
        allocated_budget = allocated_budget + v_total_payout,
        remaining_budget = total_budget - (allocated_budget + v_total_payout),
        updated_at = now()
    WHERE id = v_invitation.campaign_id;
    
    -- Update invitation status
    UPDATE campaign_invitations SET
        status = 'accepted',
        responded_at = now(),
        updated_at = now()
    WHERE id = _invitation_id;
    
    -- Create participant record
    INSERT INTO campaign_participants (
        campaign_id, creator_user_id, invitation_id
    ) VALUES (
        v_invitation.campaign_id, auth.uid(), _invitation_id
    )
    RETURNING id INTO v_participant_id;
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        auth.uid(),
        'invitation_accepted',
        'campaign_invitation',
        _invitation_id,
        jsonb_build_object(
            'reservation_id', v_reservation_id,
            'participant_id', v_participant_id,
            'reserved_amount', v_total_payout
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_reservation_id,
        'participant_id', v_participant_id,
        'reserved_amount', v_total_payout
    );
END;
$$;

-- 3. DECLINE CAMPAIGN INVITATION RPC
CREATE OR REPLACE FUNCTION public.decline_campaign_invitation(_invitation_id uuid, _redistribute boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation campaign_invitations%ROWTYPE;
    v_reservation campaign_budget_reservations%ROWTYPE;
BEGIN
    -- Get invitation and verify ownership
    SELECT * INTO v_invitation FROM campaign_invitations WHERE id = _invitation_id;
    
    IF v_invitation IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation not found');
    END IF;
    
    IF v_invitation.creator_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;
    
    IF v_invitation.status NOT IN ('pending', 'negotiating') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation cannot be declined in current status');
    END IF;
    
    -- Check if there's an existing reservation to release
    SELECT * INTO v_reservation FROM campaign_budget_reservations 
    WHERE invitation_id = _invitation_id AND reservation_status = 'held';
    
    IF v_reservation IS NOT NULL THEN
        -- Release the reservation
        UPDATE campaign_budget_reservations SET
            reservation_status = 'released',
            released_at = now(),
            released_reason = 'invitation_declined'
        WHERE id = v_reservation.id;
        
        -- Return budget to campaign
        UPDATE campaigns SET
            allocated_budget = allocated_budget - v_reservation.reserved_amount,
            remaining_budget = remaining_budget + v_reservation.reserved_amount,
            updated_at = now()
        WHERE id = v_invitation.campaign_id;
    END IF;
    
    -- Update invitation status
    UPDATE campaign_invitations SET
        status = 'declined',
        responded_at = now(),
        updated_at = now()
    WHERE id = _invitation_id;
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        auth.uid(),
        'invitation_declined',
        'campaign_invitation',
        _invitation_id,
        jsonb_build_object('redistribute', _redistribute)
    );
    
    RETURN jsonb_build_object('success', true);
END;
$$;

-- 4. SUBMIT NEGOTIATION COUNTER-OFFER RPC
CREATE OR REPLACE FUNCTION public.submit_negotiation_counter_offer(
    _invitation_id uuid,
    _proposed_payout numeric,
    _message text,
    _proposed_deliverables jsonb DEFAULT NULL,
    _proposed_timeline_start date DEFAULT NULL,
    _proposed_timeline_end date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation campaign_invitations%ROWTYPE;
    v_negotiation_id uuid;
BEGIN
    -- Get invitation and verify ownership
    SELECT * INTO v_invitation FROM campaign_invitations WHERE id = _invitation_id;
    
    IF v_invitation IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation not found');
    END IF;
    
    IF v_invitation.creator_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;
    
    IF v_invitation.status NOT IN ('pending', 'negotiating') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot negotiate in current status');
    END IF;
    
    -- Update invitation status to negotiating
    UPDATE campaign_invitations SET
        status = 'negotiating',
        updated_at = now()
    WHERE id = _invitation_id;
    
    -- Create negotiation record
    INSERT INTO campaign_negotiations (
        invitation_id, proposed_by, proposed_payout, message,
        proposed_deliverables, proposed_timeline_start, proposed_timeline_end
    ) VALUES (
        _invitation_id, auth.uid()::text, _proposed_payout, _message,
        _proposed_deliverables, _proposed_timeline_start, _proposed_timeline_end
    )
    RETURNING id INTO v_negotiation_id;
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        auth.uid(),
        'negotiation_submitted',
        'campaign_negotiation',
        v_negotiation_id,
        jsonb_build_object('proposed_payout', _proposed_payout)
    );
    
    RETURN jsonb_build_object('success', true, 'negotiation_id', v_negotiation_id);
END;
$$;

-- 5. RESPOND TO NEGOTIATION RPC (Brand side)
CREATE OR REPLACE FUNCTION public.respond_to_negotiation(
    _negotiation_id uuid,
    _response text,
    _counter_payout numeric DEFAULT NULL,
    _counter_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_negotiation campaign_negotiations%ROWTYPE;
    v_invitation campaign_invitations%ROWTYPE;
    v_campaign campaigns%ROWTYPE;
    v_new_negotiation_id uuid;
    v_delta numeric;
BEGIN
    -- Validate response
    IF _response NOT IN ('accepted', 'rejected', 'countered') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid response type');
    END IF;
    
    -- Get negotiation
    SELECT * INTO v_negotiation FROM campaign_negotiations WHERE id = _negotiation_id;
    
    IF v_negotiation IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Negotiation not found');
    END IF;
    
    IF v_negotiation.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Negotiation already responded');
    END IF;
    
    -- Get invitation and campaign
    SELECT * INTO v_invitation FROM campaign_invitations WHERE id = v_negotiation.invitation_id;
    SELECT * INTO v_campaign FROM campaigns WHERE id = v_invitation.campaign_id;
    
    -- Verify caller is brand owner
    IF v_campaign.brand_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;
    
    -- Update negotiation status
    UPDATE campaign_negotiations SET
        status = _response::negotiation_status,
        responded_at = now()
    WHERE id = _negotiation_id;
    
    IF _response = 'accepted' THEN
        -- Calculate delta and update invitation
        v_delta := COALESCE(v_negotiation.proposed_payout, v_invitation.offered_payout) - v_invitation.offered_payout;
        
        UPDATE campaign_invitations SET
            offered_payout = COALESCE(v_negotiation.proposed_payout, offered_payout),
            negotiated_delta = COALESCE(negotiated_delta, 0) + v_delta,
            deliverables = COALESCE(v_negotiation.proposed_deliverables, deliverables),
            timeline_start = COALESCE(v_negotiation.proposed_timeline_start, timeline_start),
            timeline_end = COALESCE(v_negotiation.proposed_timeline_end, timeline_end),
            updated_at = now()
        WHERE id = v_invitation.id;
        
        -- Update campaign allocated budget if delta > 0
        IF v_delta > 0 THEN
            UPDATE campaigns SET
                allocated_budget = allocated_budget + v_delta,
                remaining_budget = remaining_budget - v_delta,
                updated_at = now()
            WHERE id = v_campaign.id;
        END IF;
        
    ELSIF _response = 'rejected' THEN
        -- Reset invitation to pending
        UPDATE campaign_invitations SET
            status = 'pending',
            updated_at = now()
        WHERE id = v_invitation.id;
        
    ELSIF _response = 'countered' THEN
        -- Create brand counter-proposal
        INSERT INTO campaign_negotiations (
            invitation_id, proposed_by, proposed_payout, message, status
        ) VALUES (
            v_invitation.id, auth.uid()::text, _counter_payout, _counter_message, 'pending'
        )
        RETURNING id INTO v_new_negotiation_id;
    END IF;
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
    VALUES (
        auth.uid(),
        'negotiation_responded',
        'campaign_negotiation',
        _negotiation_id,
        jsonb_build_object('status', 'pending'),
        jsonb_build_object('response', _response, 'counter_negotiation_id', v_new_negotiation_id)
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'response', _response,
        'counter_negotiation_id', v_new_negotiation_id
    );
END;
$$;

-- 6. UPDATE PLATFORM SETTING RPC
CREATE OR REPLACE FUNCTION public.update_platform_setting(_key text, _value jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_value jsonb;
BEGIN
    -- Verify caller is admin
    IF NOT is_admin(auth.uid()) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Admin access required');
    END IF;
    
    -- Get old value for audit
    SELECT value INTO v_old_value FROM admin_settings WHERE key = _key;
    
    -- Upsert setting
    INSERT INTO admin_settings (key, value, updated_by, updated_at)
    VALUES (_key, _value, auth.uid(), now())
    ON CONFLICT (key) DO UPDATE SET
        value = _value,
        updated_by = auth.uid(),
        updated_at = now();
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
    VALUES (
        auth.uid(),
        'setting_updated',
        'admin_setting',
        NULL,
        jsonb_build_object('key', _key, 'value', v_old_value),
        jsonb_build_object('key', _key, 'value', _value)
    );
    
    RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.publish_campaign(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_campaign_invitation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_campaign_invitation(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_negotiation_counter_offer(uuid, numeric, text, jsonb, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_negotiation(uuid, text, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_platform_setting(text, jsonb) TO authenticated;