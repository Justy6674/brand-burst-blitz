-- Create healthcare_professionals table for healthcare-specific authentication
CREATE TABLE public.healthcare_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ahpra_registration TEXT,
  profession_type TEXT,
  practice_type TEXT,
  verification_status TEXT DEFAULT 'pending',
  compliance_training_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.healthcare_professionals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own healthcare profile" 
ON public.healthcare_professionals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own healthcare profile" 
ON public.healthcare_professionals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own healthcare profile" 
ON public.healthcare_professionals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_healthcare_professionals_updated_at
BEFORE UPDATE ON public.healthcare_professionals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample data types if needed
CREATE TYPE public.healthcare_practice_type AS ENUM (
  'general_practice',
  'specialist_clinic', 
  'hospital',
  'allied_health',
  'dental',
  'mental_health'
);

CREATE TYPE public.healthcare_profession_type AS ENUM (
  'gp',
  'specialist',
  'nurse',
  'allied_health',
  'dentist',
  'psychologist',
  'other'
);