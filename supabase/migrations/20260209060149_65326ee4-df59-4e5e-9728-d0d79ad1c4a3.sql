-- Fix tracking_aggregates table setup (policy and trigger)

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Creators can view their own aggregates" ON public.tracking_aggregates;

CREATE POLICY "Creators can view their own aggregates"
ON public.tracking_aggregates
FOR SELECT
USING (creator_user_id = auth.uid());

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_tracking_aggregates_updated_at ON public.tracking_aggregates;

CREATE TRIGGER update_tracking_aggregates_updated_at
BEFORE UPDATE ON public.tracking_aggregates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();