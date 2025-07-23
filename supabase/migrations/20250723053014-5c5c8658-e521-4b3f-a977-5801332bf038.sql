-- Create ideas table for storing user ideas with AI analysis
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  ai_analysis JSONB NOT NULL DEFAULT '{}',
  content_generated JSONB NOT NULL DEFAULT '{}',
  source_type TEXT NOT NULL DEFAULT 'text' CHECK (source_type IN ('text', 'voice', 'sketch')),
  tags TEXT[] DEFAULT ARRAY['idea'],
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status TEXT DEFAULT 'captured' CHECK (status IN ('captured', 'developing', 'implemented', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Create policies for ideas
CREATE POLICY "Users can view their own ideas" 
ON public.ideas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas" 
ON public.ideas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" 
ON public.ideas 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" 
ON public.ideas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON public.ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_ideas_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX idx_ideas_tags ON public.ideas USING GIN(tags);
CREATE INDEX idx_ideas_created_at ON public.ideas(created_at DESC);
CREATE INDEX idx_ideas_status ON public.ideas(status);

-- Update calendar_events table to support idea tagging
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS content_tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for idea references in calendar
CREATE INDEX IF NOT EXISTS idx_calendar_events_idea_id ON public.calendar_events(idea_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_content_tags ON public.calendar_events USING GIN(content_tags);