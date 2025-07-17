-- Fix security warnings by setting search_path for all functions

-- Update update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update has_role function with secure search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.user_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$function$;

-- Update is_admin function with secure search_path
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT public.has_role(_user_id, 'admin')
$function$;

-- Update handle_updated_at function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update handle_new_user_role function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.user_roles (user_id, role, assigned_at)
    VALUES (NEW.id, 'trial', now());
    RETURN NEW;
END;
$function$;

-- Update increment_prompt_usage function with secure search_path
CREATE OR REPLACE FUNCTION public.increment_prompt_usage(prompt_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.prompts 
  SET usage_count = COALESCE(usage_count, 0) + 1,
      updated_at = now()
  WHERE id = prompt_id;
END;
$function$;

-- Update calculate_questionnaire_score function with secure search_path
CREATE OR REPLACE FUNCTION public.calculate_questionnaire_score(responses jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
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
$function$;

-- Update generate_questionnaire_insights function with secure search_path
CREATE OR REPLACE FUNCTION public.generate_questionnaire_insights(user_id_param uuid, responses_param jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;