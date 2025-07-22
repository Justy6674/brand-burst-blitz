-- Phase 1A: Security Foundation - User Roles & RLS Enhancement

-- Create user_roles table for proper role management (avoiding recursive RLS)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'trial',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Create prompts table for prompt library management
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'content_generation', 'competitor_analysis', 'hashtag_research', etc.
    category TEXT, -- 'social', 'blog', 'ad', etc.
    platform TEXT, -- 'facebook', 'instagram', 'linkedin', etc.
    version INTEGER DEFAULT 1,
    prompt_text TEXT NOT NULL,
    variables JSONB, -- for dynamic prompt variables
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (name, type, version)
);

-- Enable RLS on prompts
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Create error_logs table for comprehensive error tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    function_name TEXT,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB,
    request_data JSONB,
    stack_trace TEXT,
    severity TEXT DEFAULT 'error', -- 'info', 'warning', 'error', 'critical'
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table for tracking important actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for prompts
CREATE POLICY "Users can view public prompts"
ON public.prompts
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own prompts"
ON public.prompts
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all prompts"
ON public.prompts
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all prompts"
ON public.prompts
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can create prompts"
ON public.prompts
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own prompts"
ON public.prompts
FOR UPDATE
USING (auth.uid() = created_by);

-- RLS Policies for error_logs
CREATE POLICY "Users can view their own errors"
ON public.error_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all errors"
ON public.error_logs
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Enhanced RLS for existing tables using new role system
DROP POLICY IF EXISTS "Users can manage their business profiles" ON public.business_profiles;
CREATE POLICY "Users can manage their business profiles"
ON public.business_profiles
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all business profiles"
ON public.business_profiles
FOR ALL
USING (public.is_admin(auth.uid()));

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default prompts for the system
INSERT INTO public.prompts (name, type, category, platform, prompt_text, is_public, is_active, variables) VALUES
('Content Generation - Facebook', 'content_generation', 'social', 'facebook', 
 'Create an engaging Facebook post for a {{industry}} business. Target audience: {{target_audience}}. Brand voice: {{brand_voice}}. Topic: {{topic}}. Include relevant hashtags and call-to-action. Keep it under 240 characters for optimal engagement.',
 true, true, '{"industry": "string", "target_audience": "string", "brand_voice": "string", "topic": "string"}'::jsonb),

('Content Generation - Instagram', 'content_generation', 'social', 'instagram',
 'Write an Instagram caption for {{industry}} targeting {{target_audience}}. Brand voice should be {{brand_voice}}. Topic: {{topic}}. Include 5-10 relevant hashtags. Make it engaging and include a call-to-action. Use emojis appropriately.',
 true, true, '{"industry": "string", "target_audience": "string", "brand_voice": "string", "topic": "string"}'::jsonb),

('Content Generation - LinkedIn', 'content_generation', 'social', 'linkedin',
 'Create a professional LinkedIn post for {{industry}} business. Target audience: {{target_audience}}. Tone: {{brand_voice}}. Topic: {{topic}}. Focus on value-driven content, include industry insights, and end with a question to encourage engagement.',
 true, true, '{"industry": "string", "target_audience": "string", "brand_voice": "string", "topic": "string"}'::jsonb),

('Competitor Analysis', 'competitor_analysis', 'research', 'general',
 'Analyze the following competitor content for a {{industry}} business: {{competitor_content}}. Identify: 1) Content themes and topics, 2) Engagement strategies, 3) Brand voice and tone, 4) Posting frequency patterns, 5) Strengths and weaknesses, 6) Opportunities for differentiation.',
 true, true, '{"industry": "string", "competitor_content": "string"}'::jsonb),

('Blog Post Generation', 'content_generation', 'blog', 'general',
 'Write a comprehensive blog post about {{topic}} for {{industry}} targeting {{target_audience}}. Brand voice: {{brand_voice}}. Include: SEO-optimized title, meta description, introduction, 3-5 main sections with subheadings, conclusion with CTA. Word count: 1200-1500 words.',
 true, true, '{"topic": "string", "industry": "string", "target_audience": "string", "brand_voice": "string"}'::jsonb)
ON CONFLICT (name, type, version) DO NOTHING;

-- Function to automatically assign trial role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, assigned_at)
    VALUES (NEW.id, 'trial', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to assign role when user is created
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_role();