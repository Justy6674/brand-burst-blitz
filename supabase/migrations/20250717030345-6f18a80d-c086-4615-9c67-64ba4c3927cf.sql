-- Create competitor_data table for tracking competitor information
CREATE TABLE public.competitor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_profile_id UUID,
  competitor_name TEXT NOT NULL,
  competitor_url TEXT,
  industry TEXT,
  competitor_description TEXT,
  social_platforms JSONB DEFAULT '{}',
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  analysis_frequency TEXT DEFAULT 'weekly',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create competitor_content table for storing competitor's content
CREATE TABLE public.competitor_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID NOT NULL,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_text TEXT,
  content_url TEXT,
  image_urls TEXT[],
  engagement_metrics JSONB DEFAULT '{}',
  post_date TIMESTAMP WITH TIME ZONE,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sentiment_score DECIMAL(3,2),
  topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create competitive_insights table for storing analysis results
CREATE TABLE public.competitive_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_profile_id UUID,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data_points JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '{}',
  priority_score INTEGER DEFAULT 5,
  is_actionable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.competitor_data 
ADD CONSTRAINT competitor_data_business_profile_id_fkey 
FOREIGN KEY (business_profile_id) REFERENCES public.business_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.competitor_content 
ADD CONSTRAINT competitor_content_competitor_id_fkey 
FOREIGN KEY (competitor_id) REFERENCES public.competitor_data(id) ON DELETE CASCADE;

ALTER TABLE public.competitive_insights 
ADD CONSTRAINT competitive_insights_business_profile_id_fkey 
FOREIGN KEY (business_profile_id) REFERENCES public.business_profiles(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.competitor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their competitor data" 
ON public.competitor_data 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their competitor content" 
ON public.competitor_content 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their competitive insights" 
ON public.competitive_insights 
FOR ALL 
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_competitor_data_updated_at
BEFORE UPDATE ON public.competitor_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_competitor_content_updated_at
BEFORE UPDATE ON public.competitor_content
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_competitive_insights_updated_at
BEFORE UPDATE ON public.competitive_insights
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_competitor_data_user_id ON public.competitor_data(user_id);
CREATE INDEX idx_competitor_data_business_profile_id ON public.competitor_data(business_profile_id);
CREATE INDEX idx_competitor_content_competitor_id ON public.competitor_content(competitor_id);
CREATE INDEX idx_competitor_content_user_id ON public.competitor_content(user_id);
CREATE INDEX idx_competitor_content_platform ON public.competitor_content(platform);
CREATE INDEX idx_competitive_insights_user_id ON public.competitive_insights(user_id);
CREATE INDEX idx_competitive_insights_business_profile_id ON public.competitive_insights(business_profile_id);

-- Insert competitor analysis prompts
INSERT INTO public.prompts (name, type, category, prompt_text, platform, is_public, is_active) VALUES
('Competitor Content Analysis', 'analysis', 'competitor', 'Analyze the following competitor content and provide insights on messaging strategy, tone, engagement tactics, and content themes. Content: {content}', 'general', true, true),
('Competitive Gap Analysis', 'analysis', 'competitor', 'Compare our content strategy with competitor analysis data and identify content gaps, opportunities, and areas for improvement. Our focus: {business_focus}, Competitor data: {competitor_data}', 'general', true, true),
('Competitor Trend Identification', 'analysis', 'competitor', 'Analyze competitor content patterns over time and identify emerging trends, seasonal patterns, and content performance indicators. Data: {competitor_timeline}', 'general', true, true);