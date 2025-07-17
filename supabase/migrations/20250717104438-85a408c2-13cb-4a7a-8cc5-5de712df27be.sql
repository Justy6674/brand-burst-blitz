-- Fix the search_path security issue for the blog function
CREATE OR REPLACE FUNCTION public.update_blog_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;