-- Fix the search_path security issue for the function
CREATE OR REPLACE FUNCTION public.update_ideas_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;