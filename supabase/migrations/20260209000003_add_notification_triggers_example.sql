-- =====================================================
-- AUTOMATIC NOTIFICATION TRIGGERS
-- =====================================================
-- This migration demonstrates how to add notification triggers
-- to existing RPCs using database functions.
--
-- NOTE: This is an example pattern. The actual notification calls
-- should be added directly to the TypeScript edge functions since
-- Supabase Edge Functions cannot be reliably called from within
-- PostgreSQL functions due to authentication context.
--
-- RECOMMENDED APPROACH:
-- 1. Call notification edge function from frontend AFTER RPC succeeds
-- 2. OR add notification calls at the end of each RPC in the TypeScript code
-- 3. OR use database triggers on INSERT/UPDATE to call edge functions
-- =====================================================

-- Example trigger function for submission reviews
CREATE OR REPLACE FUNCTION public.notify_on_submission_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_submission creator_submissions%ROWTYPE;
    v_campaign campaigns%ROWTYPE;
    v_campaign_name text;
BEGIN
    -- Get the submission details
    SELECT * INTO v_submission
    FROM creator_submissions
    WHERE id = NEW.submission_id;

    -- Get campaign details
    SELECT * INTO v_campaign
    FROM campaigns
    WHERE id = v_submission.campaign_id;

    v_campaign_name := COALESCE(v_campaign.name, 'Unknown Campaign');

    -- Insert notification into database
    -- The notifications edge function will pick this up and send email
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata, category)
    VALUES (
        v_submission.creator_user_id,
        'submission_reviewed',
        CASE
            WHEN NEW.action = 'approved' THEN 'Submission Approved'
            WHEN NEW.action = 'revision_requested' THEN 'Revision Requested'
            WHEN NEW.action = 'rejected' THEN 'Submission Rejected'
        END,
        CASE
            WHEN NEW.action = 'approved' THEN 'Your submission for "' || v_campaign_name || '" has been approved'
            WHEN NEW.action = 'revision_requested' THEN 'Your submission for "' || v_campaign_name || '" needs revision: ' || COALESCE(NEW.feedback, 'Please review')
            WHEN NEW.action = 'rejected' THEN 'Your submission for "' || v_campaign_name || '" was rejected: ' || COALESCE(NEW.feedback, 'Please see details')
        END,
        '/campaign/' || v_submission.campaign_id::text,
        jsonb_build_object(
            'campaign_id', v_submission.campaign_id,
            'action', NEW.action,
            'feedback', NEW.feedback
        ),
        'content'
    );

    RETURN NEW;
END;
$$;

-- Create trigger on submission_reviews table
DROP TRIGGER IF EXISTS on_submission_review_created ON public.submission_reviews;
CREATE TRIGGER on_submission_review_created
    AFTER INSERT ON public.submission_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_submission_review();

-- =====================================================
-- NOTIFICATION ON INVITATION ACCEPTANCE
-- =====================================================

CREATE OR REPLACE FUNCTION public.notify_on_invitation_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_campaign campaigns%ROWTYPE;
    v_creator_profile creator_profiles%ROWTYPE;
BEGIN
    -- Only notify when status changes to 'accepted'
    IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
        -- Get campaign details
        SELECT * INTO v_campaign FROM campaigns WHERE id = NEW.campaign_id;

        -- Get creator profile
        SELECT * INTO v_creator_profile FROM creator_profiles WHERE user_id = NEW.creator_user_id;

        -- Notify brand owner
        INSERT INTO notifications (user_id, type, title, message, action_url, metadata, category)
        VALUES (
            v_campaign.brand_user_id,
            'invitation_accepted',
            'Invitation Accepted',
            COALESCE(v_creator_profile.name, 'A creator') || ' has accepted your invitation to "' || v_campaign.name || '"',
            '/brand/campaigns/' || NEW.campaign_id::text,
            jsonb_build_object(
                'campaign_id', NEW.campaign_id,
                'creator_user_id', NEW.creator_user_id
            ),
            'campaigns'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_invitation_status_changed ON public.campaign_invitations;
CREATE TRIGGER on_invitation_status_changed
    AFTER UPDATE ON public.campaign_invitations
    FOR EACH ROW
    WHEN (NEW.status IS DISTINCT FROM OLD.status)
    EXECUTE FUNCTION public.notify_on_invitation_accepted();

-- =====================================================
-- NOTIFICATION ON CONTENT SUBMISSION
-- =====================================================

CREATE OR REPLACE FUNCTION public.notify_on_content_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_campaign campaigns%ROWTYPE;
    v_deliverable campaign_deliverables%ROWTYPE;
    v_creator_profile creator_profiles%ROWTYPE;
BEGIN
    -- Only notify on new submissions (not updates)
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status = 'pending_review' AND NEW.status = 'pending_review') THEN
        -- Get campaign details
        SELECT * INTO v_campaign FROM campaigns WHERE id = NEW.campaign_id;

        -- Get deliverable details
        SELECT * INTO v_deliverable FROM campaign_deliverables WHERE id = NEW.deliverable_id;

        -- Get creator profile
        SELECT * INTO v_creator_profile FROM creator_profiles WHERE user_id = NEW.creator_user_id;

        -- Notify brand owner
        INSERT INTO notifications (user_id, type, title, message, action_url, metadata, category)
        VALUES (
            v_campaign.brand_user_id,
            'submission_received',
            'New Content Submission',
            COALESCE(v_creator_profile.name, 'A creator') || ' submitted "' || COALESCE(v_deliverable.title, 'content') || '" for "' || v_campaign.name || '"',
            '/brand/campaigns/' || NEW.campaign_id::text,
            jsonb_build_object(
                'campaign_id', NEW.campaign_id,
                'creator_user_id', NEW.creator_user_id,
                'deliverable_id', NEW.deliverable_id
            ),
            'content'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_content_submitted ON public.creator_submissions;
CREATE TRIGGER on_content_submitted
    AFTER INSERT ON public.creator_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_content_submission();

-- =====================================================
-- EMAIL DISPATCH TRIGGER (Optional)
-- =====================================================
-- This trigger can call the notifications edge function to send emails
-- whenever a new notification is created.
--
-- NOTE: This requires pg_net extension and proper configuration.
-- Comment out if not using pg_net or if handling email dispatch differently.

/*
CREATE OR REPLACE FUNCTION public.dispatch_notification_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_email text;
    v_function_url text;
BEGIN
    -- Get user email
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = NEW.user_id;

    IF v_user_email IS NOT NULL THEN
        -- Call notifications edge function
        v_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notifications';

        PERFORM net.http_post(
            url := v_function_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
            ),
            body := jsonb_build_object(
                'action', 'send',
                'userId', NEW.user_id,
                'type', NEW.type,
                'title', NEW.title,
                'message', NEW.message,
                'actionUrl', NEW.action_url,
                'metadata', NEW.metadata,
                'sendEmail', true
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.dispatch_notification_email();
*/

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.notify_on_submission_review() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_invitation_accepted() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_content_submission() TO authenticated;

-- =====================================================
-- USAGE NOTES
-- =====================================================
--
-- These database triggers will automatically create notification records
-- in the notifications table when key events occur:
--
-- 1. Submission reviewed (approved/revision/rejected)
-- 2. Invitation accepted by creator
-- 3. Content submitted by creator
--
-- For email dispatch, you have two options:
--
-- OPTION A: Frontend calls (recommended for Supabase)
-- - After RPC succeeds, call notifications edge function from frontend
-- - Gives you better error handling and retry logic
--
-- OPTION B: Database triggers with pg_net (advanced)
-- - Uncomment the dispatch_notification_email trigger above
-- - Requires setting up pg_net extension and configuration
-- - Automatically sends emails when notifications are created
--
-- For the Atomic Influence platform, OPTION A is recommended.
