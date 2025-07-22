-- Add favicon_url column to business_profiles table
ALTER TABLE public.business_profiles 
ADD COLUMN favicon_url TEXT;