-- Create surveys table (admin-managed)
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey questions table
CREATE TABLE public.survey_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'single_choice', -- single_choice, multiple_choice, text
  options JSONB, -- Array of options for choice questions
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, survey_id)
);

-- Create question responses table
CREATE TABLE public.question_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL, -- Can be string, array of strings, or other types
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;

-- Surveys are readable by all authenticated users
CREATE POLICY "Surveys are viewable by authenticated users"
ON public.surveys
FOR SELECT
TO authenticated
USING (is_active = true);

-- Survey questions are readable by all authenticated users
CREATE POLICY "Survey questions are viewable by authenticated users"
ON public.survey_questions
FOR SELECT
TO authenticated
USING (true);

-- Users can view their own survey responses
CREATE POLICY "Users can view their own survey responses"
ON public.survey_responses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own survey responses
CREATE POLICY "Users can create their own survey responses"
ON public.survey_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own question responses
CREATE POLICY "Users can view their own question responses"
ON public.question_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.survey_responses sr
    WHERE sr.id = question_responses.survey_response_id
    AND sr.user_id = auth.uid()
  )
);

-- Users can create their own question responses
CREATE POLICY "Users can create their own question responses"
ON public.question_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.survey_responses sr
    WHERE sr.id = survey_response_id
    AND sr.user_id = auth.uid()
  )
);

-- Insert the three initial surveys
INSERT INTO public.surveys (id, title, description, category) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Diet & Lifestyle Survey', 'Help us understand your dietary preferences for better food and health brand matching.', 'lifestyle'),
  ('22222222-2222-2222-2222-222222222222', 'Climate & Sustainability Survey', 'Share your views on sustainability to match with eco-conscious brands.', 'values'),
  ('33333333-3333-3333-3333-333333333333', 'Alcohol & Regulated Brands Survey', 'Let us know your comfort level with regulated product categories.', 'preferences');

-- Insert questions for each survey
INSERT INTO public.survey_questions (survey_id, question_text, question_type, options, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 
   'Which dietary preferences or restrictions best describe you?', 
   'single_choice', 
   '["No restrictions - I''m open to all food content", "Vegetarian - I prefer plant-based content but include dairy/eggs", "Vegan - I only create content for fully plant-based products", "Health-conscious - I focus on organic, low-sugar, or functional foods", "Specific diet - I follow keto, paleo, gluten-free, or similar"]',
   0),
  
  ('22222222-2222-2222-2222-222222222222', 
   'How important is sustainability in your brand partnerships?', 
   'single_choice', 
   '["Essential - I only work with verified eco-friendly brands", "Very important - I strongly prefer sustainable brands but am flexible", "Somewhat important - It''s a nice-to-have but not a dealbreaker", "Not a priority - I focus on other brand qualities first"]',
   0),
  
  ('33333333-3333-3333-3333-333333333333', 
   'What is your comfort level working with alcohol or regulated brands?', 
   'single_choice', 
   '["Fully comfortable - I''m happy to promote alcohol and regulated products", "Comfortable with guidelines - I''ll work with them if content guidelines are clear", "Limited comfort - Only for sophisticated/premium positioning, no party vibes", "Not comfortable - I prefer to avoid alcohol and regulated brand content entirely"]',
   0);

-- Create trigger for updated_at on surveys
CREATE TRIGGER update_surveys_updated_at
BEFORE UPDATE ON public.surveys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();