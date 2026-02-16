-- =====================================================
-- TRACKING EVENT AGGREGATION FUNCTION
-- =====================================================
-- Aggregates raw tracking_events into daily tracking_aggregates
-- Called by pg_cron nightly at 2 AM UTC

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracking_events_campaign_creator_date
ON public.tracking_events(campaign_id, creator_user_id, DATE(created_at));

CREATE INDEX IF NOT EXISTS idx_tracking_events_type_date
ON public.tracking_events(event_type, DATE(created_at));

CREATE INDEX IF NOT EXISTS idx_tracking_events_ip_hash
ON public.tracking_events(visitor_ip_hash)
WHERE visitor_ip_hash IS NOT NULL;

-- =====================================================
-- MAIN AGGREGATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.aggregate_tracking_events(target_date DATE)
RETURNS TABLE(
    aggregated_records INTEGER,
    campaigns_affected INTEGER,
    creators_affected INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_aggregated_count INTEGER := 0;
    v_campaign_count INTEGER := 0;
    v_creator_count INTEGER := 0;
BEGIN
    -- Aggregate events into daily summaries
    INSERT INTO tracking_aggregates (
        campaign_id,
        creator_user_id,
        aggregate_date,
        total_clicks,
        unique_clicks,
        total_views,
        total_conversions,
        conversion_value
    )
    SELECT
        te.campaign_id,
        te.creator_user_id,
        target_date AS aggregate_date,

        -- Total clicks
        COUNT(*) FILTER (WHERE te.event_type = 'click') AS total_clicks,

        -- Unique clicks (distinct IP hashes)
        COUNT(DISTINCT te.visitor_ip_hash) FILTER (
            WHERE te.event_type = 'click' AND te.visitor_ip_hash IS NOT NULL
        ) AS unique_clicks,

        -- Total views
        COUNT(*) FILTER (WHERE te.event_type = 'view') AS total_views,

        -- Total conversions
        COUNT(*) FILTER (WHERE te.event_type = 'conversion') AS total_conversions,

        -- Conversion value (sum from metadata)
        COALESCE(
            SUM((te.metadata->>'conversion_value')::NUMERIC) FILTER (
                WHERE te.event_type = 'conversion' AND te.metadata->>'conversion_value' IS NOT NULL
            ),
            0
        ) AS conversion_value

    FROM tracking_events te
    WHERE DATE(te.created_at) = target_date
      AND te.campaign_id IS NOT NULL
      AND te.creator_user_id IS NOT NULL
    GROUP BY te.campaign_id, te.creator_user_id

    -- Upsert on conflict (update existing aggregates if already processed)
    ON CONFLICT (campaign_id, creator_user_id, aggregate_date) DO UPDATE SET
        total_clicks = EXCLUDED.total_clicks,
        unique_clicks = EXCLUDED.unique_clicks,
        total_views = EXCLUDED.total_views,
        total_conversions = EXCLUDED.total_conversions,
        conversion_value = EXCLUDED.conversion_value,
        created_at = now();

    -- Get count of inserted/updated records
    GET DIAGNOSTICS v_aggregated_count = ROW_COUNT;

    -- Count distinct campaigns and creators affected
    SELECT
        COUNT(DISTINCT campaign_id),
        COUNT(DISTINCT creator_user_id)
    INTO v_campaign_count, v_creator_count
    FROM tracking_aggregates
    WHERE aggregate_date = target_date;

    -- Log aggregation to audit_logs
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        NULL, -- System action
        'tracking_aggregated',
        'tracking_aggregates',
        NULL,
        jsonb_build_object(
            'target_date', target_date,
            'records_aggregated', v_aggregated_count,
            'campaigns_affected', v_campaign_count,
            'creators_affected', v_creator_count
        )
    );

    -- Return results
    RETURN QUERY SELECT
        v_aggregated_count AS aggregated_records,
        v_campaign_count AS campaigns_affected,
        v_creator_count AS creators_affected;
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Get Campaign Performance Summary
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_campaign_performance_summary(
    _campaign_id UUID,
    _start_date DATE DEFAULT NULL,
    _end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    total_clicks BIGINT,
    unique_clicks BIGINT,
    total_views BIGINT,
    total_conversions BIGINT,
    conversion_value NUMERIC,
    click_through_rate NUMERIC,
    conversion_rate NUMERIC,
    participating_creators INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM(ta.total_clicks)::BIGINT AS total_clicks,
        SUM(ta.unique_clicks)::BIGINT AS unique_clicks,
        SUM(ta.total_views)::BIGINT AS total_views,
        SUM(ta.total_conversions)::BIGINT AS total_conversions,
        SUM(ta.conversion_value) AS conversion_value,

        -- Click-through rate (clicks / views * 100)
        CASE
            WHEN SUM(ta.total_views) > 0
            THEN ROUND((SUM(ta.total_clicks)::NUMERIC / SUM(ta.total_views)::NUMERIC * 100), 2)
            ELSE 0
        END AS click_through_rate,

        -- Conversion rate (conversions / clicks * 100)
        CASE
            WHEN SUM(ta.total_clicks) > 0
            THEN ROUND((SUM(ta.total_conversions)::NUMERIC / SUM(ta.total_clicks)::NUMERIC * 100), 2)
            ELSE 0
        END AS conversion_rate,

        COUNT(DISTINCT ta.creator_user_id)::INTEGER AS participating_creators

    FROM tracking_aggregates ta
    WHERE ta.campaign_id = _campaign_id
      AND (_start_date IS NULL OR ta.aggregate_date >= _start_date)
      AND (_end_date IS NULL OR ta.aggregate_date <= _end_date);
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Get Creator Performance for Campaign
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_creator_campaign_performance(
    _campaign_id UUID,
    _creator_user_id UUID
)
RETURNS TABLE(
    total_clicks BIGINT,
    unique_clicks BIGINT,
    total_views BIGINT,
    total_conversions BIGINT,
    conversion_value NUMERIC,
    first_event_date DATE,
    last_event_date DATE,
    days_active INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM(ta.total_clicks)::BIGINT AS total_clicks,
        SUM(ta.unique_clicks)::BIGINT AS unique_clicks,
        SUM(ta.total_views)::BIGINT AS total_views,
        SUM(ta.total_conversions)::BIGINT AS total_conversions,
        SUM(ta.conversion_value) AS conversion_value,
        MIN(ta.aggregate_date) AS first_event_date,
        MAX(ta.aggregate_date) AS last_event_date,
        (MAX(ta.aggregate_date) - MIN(ta.aggregate_date))::INTEGER + 1 AS days_active

    FROM tracking_aggregates ta
    WHERE ta.campaign_id = _campaign_id
      AND ta.creator_user_id = _creator_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.aggregate_tracking_events(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_campaign_performance_summary(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_creator_campaign_performance(UUID, UUID) TO authenticated;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================
--
-- Manually run aggregation for yesterday:
-- SELECT * FROM aggregate_tracking_events(CURRENT_DATE - INTERVAL '1 day');
--
-- Get campaign performance:
-- SELECT * FROM get_campaign_performance_summary('campaign-uuid-here');
--
-- Get creator performance for a campaign:
-- SELECT * FROM get_creator_campaign_performance('campaign-uuid', 'creator-uuid');
