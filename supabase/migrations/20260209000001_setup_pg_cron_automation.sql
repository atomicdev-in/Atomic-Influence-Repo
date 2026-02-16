-- =====================================================
-- AUTOMATION: PostgreSQL Cron Setup
-- =====================================================
-- This migration sets up automated jobs for:
-- 1. Campaign lifecycle transitions
-- 2. Social platform data sync
-- 3. Tracking event aggregation

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- =====================================================
-- JOB 1: Campaign Lifecycle Management (Hourly)
-- =====================================================
-- Runs every hour to manage campaign state transitions

SELECT cron.schedule(
    'campaign-lifecycle-hourly',
    '0 * * * *', -- Every hour at minute 0
    $$
    SELECT
      net.http_post(
          url := 'https://gqbnkbcwmwwfecjesany.supabase.co/functions/v1/campaign-lifecycle',
          headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := jsonb_build_object(
              'action', 'process-transitions'
          )
      ) AS request_id;
    $$
);

-- =====================================================
-- JOB 2: Social Platform Data Sync (Every 6 hours)
-- =====================================================
-- Syncs OAuth tokens and platform metrics

SELECT cron.schedule(
    'social-platform-sync',
    '0 */6 * * *', -- Every 6 hours
    $$
    SELECT
      net.http_post(
          url := 'https://gqbnkbcwmwwfecjesany.supabase.co/functions/v1/social-connect',
          headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := jsonb_build_object(
              'action', 'sync-all-platforms'
          )
      ) AS request_id;
    $$
);

-- =====================================================
-- JOB 3: Tracking Event Aggregation (Daily at 2 AM UTC)
-- =====================================================
-- Aggregates tracking events into daily summaries

SELECT cron.schedule(
    'tracking-event-aggregation',
    '0 2 * * *', -- Daily at 2 AM UTC
    $$
    SELECT public.aggregate_tracking_events(CURRENT_DATE - INTERVAL '1 day');
    $$
);

-- =====================================================
-- JOB 4: Token Refresh (Every 4 hours)
-- =====================================================
-- Refreshes expiring OAuth tokens

SELECT cron.schedule(
    'oauth-token-refresh',
    '0 */4 * * *', -- Every 4 hours
    $$
    SELECT
      net.http_post(
          url := 'https://gqbnkbcwmwwfecjesany.supabase.co/functions/v1/social-connect',
          headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := jsonb_build_object(
              'action', 'refresh-expiring-tokens'
          )
      ) AS request_id;
    $$
);

-- =====================================================
-- MONITORING: View Scheduled Jobs
-- =====================================================
-- Query to see all active cron jobs:
-- SELECT * FROM cron.job;

-- Query to see job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 100;

-- =====================================================
-- CONFIGURATION NOTE
-- =====================================================
-- Before running this migration, you must set the service role key:
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key-here';
--
-- Or update the URL to use your actual Supabase project URL instead of the placeholder.
