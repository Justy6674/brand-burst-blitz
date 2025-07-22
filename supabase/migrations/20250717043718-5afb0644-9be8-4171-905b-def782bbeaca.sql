-- Create function to increment prompt usage count
CREATE OR REPLACE FUNCTION public.increment_prompt_usage(prompt_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.prompts 
  SET usage_count = COALESCE(usage_count, 0) + 1,
      updated_at = now()
  WHERE id = prompt_id;
END;
$$;