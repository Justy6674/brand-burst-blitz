-- Phase 6: Aussie Name & Domain Scout Database Schema
-- Create table for name scout service requests
CREATE TABLE public.name_scout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL,
  
  -- Request details
  requested_name TEXT NOT NULL,
  domain_extensions TEXT[] NOT NULL DEFAULT ARRAY['.com.au', '.com'],
  include_trademark_screening BOOLEAN NOT NULL DEFAULT false,
  trademark_screening_paid BOOLEAN NOT NULL DEFAULT false,
  
  -- Payment tracking
  amount_paid INTEGER NOT NULL, -- in cents (AU$99 = 9900, AU$79 = 7900)
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  
  -- Service status
  request_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Results data
  asic_availability JSONB, -- ASIC business name search results
  domain_availability JSONB, -- WHOIS domain check results  
  trademark_results JSONB, -- IP Australia trademark search results
  ai_summary TEXT, -- AI-generated summary of findings
  
  -- Timestamps
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.name_scout_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own name scout requests" 
ON public.name_scout_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create name scout requests" 
ON public.name_scout_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests (for status tracking)
CREATE POLICY "Users can update their own name scout requests" 
ON public.name_scout_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage all name scout requests" 
ON public.name_scout_requests 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_name_scout_requests_updated_at
BEFORE UPDATE ON public.name_scout_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying
CREATE INDEX idx_name_scout_requests_user_id ON public.name_scout_requests(user_id);
CREATE INDEX idx_name_scout_requests_status ON public.name_scout_requests(request_status);
CREATE INDEX idx_name_scout_requests_assigned ON public.name_scout_requests(assigned_to);