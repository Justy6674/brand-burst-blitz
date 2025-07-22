-- Create social setup services table for Australian business setup service
CREATE TABLE public.social_setup_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  
  -- Payment & Status
  stripe_payment_intent_id TEXT UNIQUE,
  amount_paid INTEGER, -- cents (29900 or 19900)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  -- Australian Validation
  abn TEXT NOT NULL,
  business_address JSONB,
  domain_verified BOOLEAN DEFAULT false,
  
  -- Operational Tracking
  assigned_to UUID, -- ops team member
  requested_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  
  -- Connected Accounts (populated after setup)
  connected_accounts JSONB DEFAULT '{}',
  qa_checklist JSONB DEFAULT '{}',
  qa_approved_by UUID,
  qa_approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.social_setup_services ENABLE ROW LEVEL SECURITY;

-- Create policies for social setup services
CREATE POLICY "Users can view their own setup services" 
ON public.social_setup_services 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setup requests" 
ON public.social_setup_services 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all setup services" 
ON public.social_setup_services 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_social_setup_services_updated_at
BEFORE UPDATE ON public.social_setup_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_social_setup_services_user_id ON public.social_setup_services(user_id);
CREATE INDEX idx_social_setup_services_status ON public.social_setup_services(status);
CREATE INDEX idx_social_setup_services_abn ON public.social_setup_services(abn);
CREATE INDEX idx_social_setup_services_created_at ON public.social_setup_services(created_at);