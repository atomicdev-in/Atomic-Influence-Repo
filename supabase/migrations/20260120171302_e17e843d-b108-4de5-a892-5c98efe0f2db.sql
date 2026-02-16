-- Enable realtime for campaign_invitations and creator_tracking_links tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_tracking_links;