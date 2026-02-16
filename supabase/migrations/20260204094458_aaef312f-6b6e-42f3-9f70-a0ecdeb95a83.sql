-- =====================================================
-- PHASE 4: CONTENT SUBMISSION & APPROVAL
-- =====================================================

-- 1. Campaign Deliverables (what creators must submit)
CREATE TABLE public.campaign_deliverables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    deliverable_index integer NOT NULL DEFAULT 0,
    deliverable_type text NOT NULL,
    title text NOT NULL,
    description text,
    required_by timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(campaign_id, deliverable_index)
);

-- 2. Creator Submissions
CREATE TABLE public.creator_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    deliverable_id uuid NOT NULL REFERENCES public.campaign_deliverables(id) ON DELETE CASCADE,
    creator_user_id uuid NOT NULL,
    submission_url text NOT NULL,
    submission_type text NOT NULL DEFAULT 'manual' CHECK (submission_type IN ('manual', 'auto_detected')),
    status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'revision_requested', 'rejected')),
    submitted_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(deliverable_id, creator_user_id)
);

-- 3. Submission Reviews
CREATE TABLE public.submission_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL REFERENCES public.creator_submissions(id) ON DELETE CASCADE,
    reviewer_user_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('approved', 'revision_requested', 'rejected')),
    feedback text,
    reviewed_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR CONTENT SUBMISSION
-- =====================================================

-- Campaign Deliverables
CREATE POLICY "Brand owners can manage deliverables"
ON public.campaign_deliverables FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_deliverables.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Participants can view deliverables"
ON public.campaign_deliverables FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaign_participants cp
    WHERE cp.campaign_id = campaign_deliverables.campaign_id AND cp.creator_user_id = auth.uid()
));

CREATE POLICY "Admins can view all deliverables"
ON public.campaign_deliverables FOR SELECT
USING (is_admin(auth.uid()));

-- Creator Submissions
CREATE POLICY "Creators can insert their own submissions"
ON public.creator_submissions FOR INSERT
WITH CHECK (creator_user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.campaign_participants cp
    WHERE cp.campaign_id = creator_submissions.campaign_id AND cp.creator_user_id = auth.uid()
));

CREATE POLICY "Creators can view their own submissions"
ON public.creator_submissions FOR SELECT
USING (creator_user_id = auth.uid());

CREATE POLICY "Creators can update their own pending submissions"
ON public.creator_submissions FOR UPDATE
USING (creator_user_id = auth.uid() AND status IN ('pending_review', 'revision_requested'));

CREATE POLICY "Brand owners can view all submissions for their campaigns"
ON public.creator_submissions FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = creator_submissions.campaign_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Admins can view all submissions"
ON public.creator_submissions FOR SELECT
USING (is_admin(auth.uid()));

-- Submission Reviews
CREATE POLICY "Brand owners can create reviews"
ON public.submission_reviews FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.creator_submissions cs
    JOIN public.campaigns c ON c.id = cs.campaign_id
    WHERE cs.id = submission_reviews.submission_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Brand owners can view reviews for their campaigns"
ON public.submission_reviews FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.creator_submissions cs
    JOIN public.campaigns c ON c.id = cs.campaign_id
    WHERE cs.id = submission_reviews.submission_id AND c.brand_user_id = auth.uid()
));

CREATE POLICY "Creators can view reviews of their submissions"
ON public.submission_reviews FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.creator_submissions cs
    WHERE cs.id = submission_reviews.submission_id AND cs.creator_user_id = auth.uid()
));

CREATE POLICY "Admins can view all reviews"
ON public.submission_reviews FOR SELECT
USING (is_admin(auth.uid()));

-- =====================================================
-- CONTENT SUBMISSION RPCs
-- =====================================================

-- Submit Deliverable RPC
CREATE OR REPLACE FUNCTION public.submit_deliverable(
    _campaign_id uuid,
    _deliverable_id uuid,
    _submission_url text,
    _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_participant campaign_participants%ROWTYPE;
    v_deliverable campaign_deliverables%ROWTYPE;
    v_submission_id uuid;
BEGIN
    -- Verify caller is a participant
    SELECT * INTO v_participant FROM campaign_participants
    WHERE campaign_id = _campaign_id AND creator_user_id = auth.uid() AND status = 'active';
    
    IF v_participant IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are not an active participant in this campaign');
    END IF;
    
    -- Verify deliverable exists
    SELECT * INTO v_deliverable FROM campaign_deliverables
    WHERE id = _deliverable_id AND campaign_id = _campaign_id;
    
    IF v_deliverable IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deliverable not found');
    END IF;
    
    -- Create or update submission
    INSERT INTO creator_submissions (
        campaign_id, deliverable_id, creator_user_id, submission_url, metadata
    ) VALUES (
        _campaign_id, _deliverable_id, auth.uid(), _submission_url, _metadata
    )
    ON CONFLICT (deliverable_id, creator_user_id) DO UPDATE SET
        submission_url = _submission_url,
        metadata = _metadata,
        status = 'pending_review',
        updated_at = now()
    RETURNING id INTO v_submission_id;
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        auth.uid(),
        'deliverable_submitted',
        'creator_submission',
        v_submission_id,
        jsonb_build_object('campaign_id', _campaign_id, 'deliverable_id', _deliverable_id)
    );
    
    RETURN jsonb_build_object('success', true, 'submission_id', v_submission_id);
END;
$$;

-- Review Submission RPC
CREATE OR REPLACE FUNCTION public.review_submission(
    _submission_id uuid,
    _action text,
    _feedback text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_submission creator_submissions%ROWTYPE;
    v_campaign campaigns%ROWTYPE;
    v_review_id uuid;
    v_all_approved boolean;
    v_participant_id uuid;
BEGIN
    -- Validate action
    IF _action NOT IN ('approved', 'revision_requested', 'rejected') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
    END IF;
    
    -- Get submission
    SELECT * INTO v_submission FROM creator_submissions WHERE id = _submission_id;
    
    IF v_submission IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Submission not found');
    END IF;
    
    -- Get campaign and verify ownership
    SELECT * INTO v_campaign FROM campaigns WHERE id = v_submission.campaign_id;
    
    IF v_campaign.brand_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;
    
    -- Update submission status
    UPDATE creator_submissions SET
        status = _action,
        updated_at = now()
    WHERE id = _submission_id;
    
    -- Create review record
    INSERT INTO submission_reviews (submission_id, reviewer_user_id, action, feedback)
    VALUES (_submission_id, auth.uid(), _action, _feedback)
    RETURNING id INTO v_review_id;
    
    -- Check if all deliverables are approved for this creator
    IF _action = 'approved' THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM campaign_deliverables cd
            LEFT JOIN creator_submissions cs ON cs.deliverable_id = cd.id AND cs.creator_user_id = v_submission.creator_user_id
            WHERE cd.campaign_id = v_submission.campaign_id
            AND (cs.status IS NULL OR cs.status != 'approved')
        ) INTO v_all_approved;
        
        IF v_all_approved THEN
            -- Mark participant as completed
            UPDATE campaign_participants SET
                status = 'completed',
                completed_at = now()
            WHERE campaign_id = v_submission.campaign_id AND creator_user_id = v_submission.creator_user_id;
        END IF;
    END IF;
    
    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        auth.uid(),
        'submission_reviewed',
        'submission_review',
        v_review_id,
        jsonb_build_object('action', _action, 'all_approved', v_all_approved)
    );
    
    RETURN jsonb_build_object('success', true, 'review_id', v_review_id, 'all_deliverables_approved', COALESCE(v_all_approved, false));
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.submit_deliverable(uuid, uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_submission(uuid, text, text) TO authenticated;