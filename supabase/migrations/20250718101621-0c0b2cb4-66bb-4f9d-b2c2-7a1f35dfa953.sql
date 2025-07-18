-- Create interest registrations table to store waitlist signups
CREATE TABLE public.interest_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  industry TEXT,
  is_australian BOOLEAN NOT NULL DEFAULT false,
  current_challenges TEXT[],
  monthly_marketing_spend TEXT,
  team_size TEXT,
  primary_goals TEXT[],
  wants_updates BOOLEAN DEFAULT true,
  heard_about_us TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interest_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for waitlist form)
CREATE POLICY "Anyone can register interest" 
ON public.interest_registrations 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view all registrations
CREATE POLICY "Admins can view all registrations" 
ON public.interest_registrations 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interest_registrations_updated_at
BEFORE UPDATE ON public.interest_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();