-- =====================================================
-- Creator Dashboard Database Schema
-- Persists all creator data for the Atomic Influence platform
-- =====================================================

-- Create creator_profiles table for identity information
CREATE TABLE public.creator_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  pricing_enabled BOOLEAN DEFAULT false,
  pricing_min NUMERIC DEFAULT 0,
  pricing_max NUMERIC DEFAULT 0,
  pricing_currency TEXT DEFAULT 'USD',
  pricing_note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brand_fit_data table for AI matching preferences
CREATE TABLE public.brand_fit_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  brand_categories TEXT[] DEFAULT '{}',
  alcohol_openness TEXT DEFAULT '',
  personal_assets TEXT[] DEFAULT '{}',
  driving_comfort TEXT DEFAULT '',
  content_styles TEXT[] DEFAULT '{}',
  camera_comfort TEXT DEFAULT '',
  avoided_topics TEXT DEFAULT '',
  audience_type TEXT DEFAULT '',
  collaboration_type TEXT DEFAULT '',
  creative_control TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create linked_accounts table for social platform connections
CREATE TABLE public.linked_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  username TEXT DEFAULT '',
  followers INTEGER DEFAULT 0,
  engagement NUMERIC DEFAULT 0,
  connected BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now(),
  platform_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create campaign_history table for tracking performance
CREATE TABLE public.campaign_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_completed INTEGER DEFAULT 0,
  total_started INTEGER DEFAULT 0,
  on_time_deliveries INTEGER DEFAULT 0,
  revisions_requested INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  avg_response_time NUMERIC DEFAULT 0,
  last_campaign_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_fit_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_profiles
CREATE POLICY "Users can view their own profile" 
ON public.creator_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.creator_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.creator_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for brand_fit_data
CREATE POLICY "Users can view their own brand fit data" 
ON public.brand_fit_data FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand fit data" 
ON public.brand_fit_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand fit data" 
ON public.brand_fit_data FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for linked_accounts
CREATE POLICY "Users can view their own linked accounts" 
ON public.linked_accounts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own linked accounts" 
ON public.linked_accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own linked accounts" 
ON public.linked_accounts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linked accounts" 
ON public.linked_accounts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for campaign_history
CREATE POLICY "Users can view their own campaign history" 
ON public.campaign_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaign history" 
ON public.campaign_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign history" 
ON public.campaign_history FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_creator_profiles_updated_at
BEFORE UPDATE ON public.creator_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_fit_data_updated_at
BEFORE UPDATE ON public.brand_fit_data
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linked_accounts_updated_at
BEFORE UPDATE ON public.linked_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_history_updated_at
BEFORE UPDATE ON public.campaign_history
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.creator_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.brand_fit_data (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.campaign_history (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();