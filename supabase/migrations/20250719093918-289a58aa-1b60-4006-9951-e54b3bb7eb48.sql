-- Create table for user-specific social media credentials
CREATE TABLE public.user_social_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'linkedin', 'twitter')),
  app_id TEXT NOT NULL,
  app_secret TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.user_social_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage their own social credentials" 
ON public.user_social_credentials 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_social_credentials_updated_at
BEFORE UPDATE ON public.user_social_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();