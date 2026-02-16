-- =====================================================
-- PHASE 5: PAYMENTS & ESCROW INFRASTRUCTURE
-- =====================================================

-- 1. Brand Wallets
CREATE TABLE public.brand_wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_user_id uuid NOT NULL UNIQUE,
    balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency text NOT NULL DEFAULT 'USD',
    stripe_customer_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Wallet Transactions (Ledger)
CREATE TABLE public.wallet_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id uuid NOT NULL REFERENCES public.brand_wallets(id) ON DELETE CASCADE,
    transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'reservation', 'release', 'disbursement', 'refund')),
    amount numeric NOT NULL,
    reference_type text CHECK (reference_type IN ('campaign', 'invitation', 'payout', 'manual')),
    reference_id uuid,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    stripe_payment_intent_id text,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Creator Earnings
CREATE TABLE public.creator_earnings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_user_id uuid NOT NULL,
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    invitation_id uuid NOT NULL REFERENCES public.campaign_invitations(id) ON DELETE CASCADE,
    gross_amount numeric NOT NULL CHECK (gross_amount >= 0),
    platform_fee numeric NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    net_amount numeric NOT NULL CHECK (net_amount >= 0),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'eligible', 'processing', 'paid')),
    eligible_at timestamptz,
    paid_at timestamptz,
    payout_batch_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(invitation_id)
);

-- 4. Payout Batches
CREATE TABLE public.payout_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_date date NOT NULL,
    total_amount numeric NOT NULL DEFAULT 0,
    creator_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    stripe_transfer_group text,
    processed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHASE 6: TRACKING & ANALYTICS
-- =====================================================

-- 1. Tracking Events (raw event log)
CREATE TABLE public.tracking_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL CHECK (event_type IN ('click', 'view', 'conversion')),
    tracking_link_id uuid REFERENCES public.creator_tracking_links(id) ON DELETE SET NULL,
    campaign_id uuid,
    creator_user_id uuid,
    visitor_ip_hash text,
    user_agent text,
    referrer text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Tracking Aggregates (daily rollups)
CREATE TABLE public.tracking_aggregates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL,
    creator_user_id uuid NOT NULL,
    aggregate_date date NOT NULL,
    total_clicks integer NOT NULL DEFAULT 0,
    unique_clicks integer NOT NULL DEFAULT 0,
    total_views integer NOT NULL DEFAULT 0,
    total_conversions integer NOT NULL DEFAULT 0,
    conversion_value numeric NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(campaign_id, creator_user_id, aggregate_date)
);

-- 3. Campaign Creator Scores (matching results)
CREATE TABLE public.campaign_creator_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    creator_user_id uuid NOT NULL,
    overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    dimension_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
    calculated_at timestamptz NOT NULL DEFAULT now(),
    calculation_version text NOT NULL DEFAULT 'v1',
    UNIQUE(campaign_id, creator_user_id)
);

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_creator_scores ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PAYMENTS
-- =====================================================

-- Brand Wallets
CREATE POLICY "Brand owners can view their own wallet"
ON public.brand_wallets FOR SELECT
USING (brand_user_id = auth.uid());

CREATE POLICY "Admins can view all wallets"
ON public.brand_wallets FOR SELECT
USING (is_admin(auth.uid()));

-- Wallet Transactions
CREATE POLICY "Brand owners can view their wallet transactions"
ON public.wallet_transactions FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.brand_wallets bw
    WHERE bw.id = wallet_transactions.wallet_id AND bw.brand_user_id = auth.uid()
));

CREATE POLICY "Admins can view all transactions"
ON public.wallet_transactions FOR SELECT
USING (is_admin(auth.uid()));

-- Creator Earnings
CREATE POLICY "Creators can view their own earnings"
ON public.creator_earnings FOR SELECT
USING (creator_user_id = auth.uid());

CREATE POLICY "Brand owners can view earnings for their campaigns"
ON public.creator_earnings FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = creator_earnings.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Admins can view all earnings"
ON public.creator_earnings FOR SELECT
USING (is_admin(auth.uid()));

-- Payout Batches
CREATE POLICY "Admins can view all payout batches"
ON public.payout_batches FOR SELECT
USING (is_admin(auth.uid()));

-- =====================================================
-- RLS POLICIES - TRACKING
-- =====================================================

-- Tracking Events (public insert for redirect tracking, restricted read)
CREATE POLICY "System can insert tracking events"
ON public.tracking_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Brand owners can view tracking events for their campaigns"
ON public.tracking_events FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = tracking_events.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Creators can view their own tracking events"
ON public.tracking_events FOR SELECT
USING (creator_user_id = auth.uid());

CREATE POLICY "Admins can view all tracking events"
ON public.tracking_events FOR SELECT
USING (is_admin(auth.uid()));

-- Tracking Aggregates
CREATE POLICY "Brand owners can view aggregates for their campaigns"
ON public.tracking_aggregates FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = tracking_aggregates.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Creators can view their own aggregates"
ON public.tracking_aggregates FOR SELECT
USING (creator_user_id = auth.uid());

CREATE POLICY "Admins can view all aggregates"
ON public.tracking_aggregates FOR SELECT
USING (is_admin(auth.uid()));

-- Campaign Creator Scores
CREATE POLICY "Brand owners can view scores for their campaigns"
ON public.campaign_creator_scores FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_creator_scores.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Creators can view their own scores"
ON public.campaign_creator_scores FOR SELECT
USING (creator_user_id = auth.uid());

CREATE POLICY "Admins can view all scores"
ON public.campaign_creator_scores FOR SELECT
USING (is_admin(auth.uid()));

-- =====================================================
-- PAYMENT HELPER RPC
-- =====================================================

-- Mark creator earnings as eligible when all deliverables approved
CREATE OR REPLACE FUNCTION public.mark_earnings_eligible(_invitation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation campaign_invitations%ROWTYPE;
    v_reservation campaign_budget_reservations%ROWTYPE;
    v_earnings_id uuid;
    v_gross_amount numeric;
    v_platform_fee numeric;
BEGIN
    -- Get invitation
    SELECT * INTO v_invitation FROM campaign_invitations WHERE id = _invitation_id;
    
    IF v_invitation IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation not found');
    END IF;
    
    -- Get reservation amount
    SELECT * INTO v_reservation FROM campaign_budget_reservations 
    WHERE invitation_id = _invitation_id AND reservation_status = 'held';
    
    IF v_reservation IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No budget reservation found');
    END IF;
    
    v_gross_amount := v_reservation.reserved_amount;
    v_platform_fee := v_gross_amount * 0.10; -- 10% platform fee
    
    -- Create or update earnings record
    INSERT INTO creator_earnings (
        creator_user_id, campaign_id, invitation_id,
        gross_amount, platform_fee, net_amount, status, eligible_at
    ) VALUES (
        v_invitation.creator_user_id, v_invitation.campaign_id, _invitation_id,
        v_gross_amount, v_platform_fee, v_gross_amount - v_platform_fee, 'eligible', now()
    )
    ON CONFLICT (invitation_id) DO UPDATE SET
        status = 'eligible',
        eligible_at = now(),
        updated_at = now()
    RETURNING id INTO v_earnings_id;
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        auth.uid(),
        'earnings_eligible',
        'creator_earnings',
        v_earnings_id,
        jsonb_build_object('gross_amount', v_gross_amount, 'net_amount', v_gross_amount - v_platform_fee)
    );
    
    RETURN jsonb_build_object('success', true, 'earnings_id', v_earnings_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_earnings_eligible(uuid) TO authenticated;