-- Create enhanced business intelligence tables for questionnaire responses and competitor analysis

-- Business questionnaire responses table
CREATE TABLE public.business_questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  questionnaire_version INTEGER NOT NULL DEFAULT 1,
  responses JSONB NOT NULL,
  completion_status TEXT DEFAULT 'completed' CHECK (completion_status IN ('completed', 'partial', 'skipped')),
  completion_score INTEGER DEFAULT 0 CHECK (completion_score >= 0 AND completion_score <= 100),
  ai_insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced competitive analysis results table
CREATE TABLE public.competitive_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.competitor_data(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('content_gap', 'sentiment', 'strategy', 'performance', 'comprehensive')),
  analysis_results JSONB NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.85 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Strategic content recommendations table
CREATE TABLE public.strategic_content_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('content_topic', 'posting_time', 'platform_strategy', 'content_format', 'engagement_strategy')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority_score INTEGER DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  implementation_effort TEXT DEFAULT 'medium' CHECK (implementation_effort IN ('low', 'medium', 'high')),
  expected_impact TEXT DEFAULT 'medium' CHECK (expected_impact IN ('low', 'medium', 'high')),
  data_sources JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed', 'archived')),
  implemented_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.business_questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_content_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_questionnaire_responses
CREATE POLICY "Users can manage their questionnaire responses"
ON public.business_questionnaire_responses
FOR ALL
USING (auth.uid() = user_id);

-- RLS policies for competitive_analysis_results
CREATE POLICY "Users can view their competitive analysis"
ON public.competitive_analysis_results
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage competitive analysis"
ON public.competitive_analysis_results
FOR ALL
USING (true);

-- RLS policies for strategic_content_recommendations
CREATE POLICY "Users can manage their content recommendations"
ON public.strategic_content_recommendations
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_questionnaire_responses_user_id ON public.business_questionnaire_responses(user_id);
CREATE INDEX idx_questionnaire_responses_business_profile_id ON public.business_questionnaire_responses(business_profile_id);
CREATE INDEX idx_competitive_analysis_user_id ON public.competitive_analysis_results(user_id);
CREATE INDEX idx_competitive_analysis_competitor_id ON public.competitive_analysis_results(competitor_id);
CREATE INDEX idx_competitive_analysis_type ON public.competitive_analysis_results(analysis_type);
CREATE INDEX idx_strategic_recommendations_user_id ON public.strategic_content_recommendations(user_id);
CREATE INDEX idx_strategic_recommendations_priority ON public.strategic_content_recommendations(priority_score DESC);
CREATE INDEX idx_strategic_recommendations_status ON public.strategic_content_recommendations(status);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_questionnaire_responses_updated_at
  BEFORE UPDATE ON public.business_questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_competitive_analysis_updated_at
  BEFORE UPDATE ON public.competitive_analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_strategic_recommendations_updated_at
  BEFORE UPDATE ON public.strategic_content_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate questionnaire completion score
CREATE OR REPLACE FUNCTION public.calculate_questionnaire_score(responses JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total_fields INTEGER := 0;
  completed_fields INTEGER := 0;
  key TEXT;
  value JSONB;
BEGIN
  -- Count total fields and completed fields
  FOR key, value IN SELECT * FROM jsonb_each(responses)
  LOOP
    total_fields := total_fields + 1;
    
    -- Check if field has meaningful content
    IF value IS NOT NULL AND 
       value != 'null'::jsonb AND 
       value != '""'::jsonb AND 
       value != '[]'::jsonb AND 
       value != '{}'::jsonb THEN
      completed_fields := completed_fields + 1;
    END IF;
  END LOOP;
  
  -- Return percentage
  IF total_fields = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((completed_fields::DECIMAL / total_fields::DECIMAL) * 100);
  END IF;
END;
$$;

-- Function to generate AI insights from questionnaire responses
CREATE OR REPLACE FUNCTION public.generate_questionnaire_insights(
  user_id_param UUID,
  responses_param JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  insights JSONB := '{}';
  business_data JSONB;
  content_strategy JSONB;
  recommendations JSONB;
BEGIN
  -- Extract business fundamentals
  business_data := jsonb_build_object(
    'industry_focus', responses_param->>'industry',
    'business_maturity', responses_param->>'business_stage',
    'target_market_clarity', 
      CASE 
        WHEN length(responses_param->>'target_audience_demographics') > 50 THEN 'high'
        WHEN length(responses_param->>'target_audience_demographics') > 20 THEN 'medium'
        ELSE 'low'
      END,
    'competitive_awareness',
      CASE 
        WHEN length(responses_param->>'main_competitors') > 30 THEN 'high'
        WHEN length(responses_param->>'main_competitors') > 10 THEN 'medium'
        ELSE 'low'
      END
  );

  -- Analyze content strategy maturity
  content_strategy := jsonb_build_object(
    'brand_voice_clarity', responses_param->>'brand_voice',
    'content_diversity', jsonb_array_length(responses_param->'content_formats'),
    'platform_focus', jsonb_array_length(responses_param->'target_platforms'),
    'frequency_commitment', responses_param->>'posting_frequency'
  );

  -- Generate strategic recommendations
  recommendations := jsonb_build_array();
  
  -- Add industry-specific recommendations
  IF responses_param->>'industry' = 'health' THEN
    recommendations := recommendations || jsonb_build_array('Focus on educational content to build trust and authority');
  ELSIF responses_param->>'industry' = 'finance' THEN
    recommendations := recommendations || jsonb_build_array('Emphasize security and compliance in your content strategy');
  END IF;

  -- Combine insights
  insights := jsonb_build_object(
    'business_analysis', business_data,
    'content_strategy', content_strategy,
    'strategic_recommendations', recommendations,
    'overall_readiness_score', 
      CASE 
        WHEN business_data->>'target_market_clarity' = 'high' AND 
             content_strategy->>'brand_voice_clarity' IS NOT NULL THEN 85
        WHEN business_data->>'target_market_clarity' = 'medium' THEN 65
        ELSE 45
      END,
    'generated_at', to_jsonb(now())
  );

  RETURN insights;
END;
$$;