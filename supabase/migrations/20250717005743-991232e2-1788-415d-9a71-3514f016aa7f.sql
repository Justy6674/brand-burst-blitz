-- JBSAAS: Comprehensive AI-Powered Content & Social Automation Platform
-- Phase 1: Core MVP Database Schema

-- Create custom types
CREATE TYPE public.post_type AS ENUM ('blog', 'social', 'ad');
CREATE TYPE public.post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
CREATE TYPE public.social_platform AS ENUM ('facebook', 'instagram', 'linkedin', 'twitter');
CREATE TYPE public.user_role AS ENUM ('admin', 'subscriber', 'trial');
CREATE TYPE public.industry_type AS ENUM ('health', 'finance', 'legal', 'general', 'fitness', 'beauty', 'tech');
CREATE TYPE public.ai_tone AS ENUM ('professional', 'friendly', 'casual', 'authoritative', 'empathetic', 'exciting');

-- Users table (enhanced for SaaS)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  stripe_customer_id TEXT UNIQUE,
  role public.user_role DEFAULT 'trial',
  trial_posts_used INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Business profiles for multi-brand support
CREATE TABLE public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry public.industry_type DEFAULT 'general',
  website_url TEXT,
  logo_url TEXT,
  brand_colors JSONB, -- {primary: "#hex", secondary: "#hex", accent: "#hex"}
  default_ai_tone public.ai_tone DEFAULT 'professional',
  compliance_settings JSONB, -- Industry-specific compliance rules
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social media account connections
CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  platform public.social_platform NOT NULL,
  account_id TEXT NOT NULL, -- Platform-specific account ID
  account_name TEXT, -- Display name
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  page_id TEXT, -- For Facebook pages
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Content posts (blogs, social media, ads)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  type public.post_type NOT NULL,
  title TEXT,
  content TEXT,
  excerpt TEXT, -- For blog posts
  tags TEXT[], -- Array of tags
  image_urls TEXT[], -- Array of image URLs
  status public.post_status DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  target_platforms public.social_platform[], -- For social posts
  ai_prompt TEXT, -- Original AI prompt used
  ai_tone public.ai_tone,
  metadata JSONB, -- Flexible metadata (word count, hashtags, etc.)
  engagement_data JSONB, -- Likes, shares, comments when published
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content templates for reusability
CREATE TABLE public.content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.post_type NOT NULL,
  template_content TEXT NOT NULL, -- Template with placeholders
  ai_prompt_template TEXT,
  default_tone public.ai_tone,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false, -- For sharing templates
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Image library for brand assets
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  filename TEXT,
  alt_text TEXT,
  tags TEXT[],
  is_logo BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  file_size INTEGER, -- In bytes
  dimensions JSONB, -- {width: number, height: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Scheduled publishing queue
CREATE TABLE public.publishing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  last_error TEXT,
  status public.post_status DEFAULT 'scheduled',
  published_post_id TEXT, -- Platform-specific post ID after publishing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Analytics and insights
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  platform public.social_platform,
  metrics JSONB NOT NULL, -- Flexible metrics storage
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Compliance audit trail
CREATE TABLE public.compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  industry public.industry_type,
  action TEXT NOT NULL, -- 'generated', 'approved', 'published', 'flagged'
  content_preview TEXT,
  compliance_check_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for business_profiles
CREATE POLICY "Users can manage their business profiles" ON public.business_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for social_accounts
CREATE POLICY "Users can manage their social accounts" ON public.social_accounts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for posts
CREATE POLICY "Users can manage their posts" ON public.posts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for content_templates
CREATE POLICY "Users can manage their templates" ON public.content_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON public.content_templates
  FOR SELECT USING (is_public = true);

-- RLS Policies for images
CREATE POLICY "Users can manage their images" ON public.images
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public images" ON public.images
  FOR SELECT USING (is_public = true);

-- RLS Policies for publishing_queue
CREATE POLICY "Users can view their publishing queue" ON public.publishing_queue
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.posts WHERE id = post_id));

-- RLS Policies for analytics
CREATE POLICY "Users can view their analytics" ON public.analytics
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for compliance_logs
CREATE POLICY "Users can view their compliance logs" ON public.compliance_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON public.content_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publishing_queue_updated_at BEFORE UPDATE ON public.publishing_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_posts_user_status ON public.posts(user_id, status);
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_publishing_queue_scheduled ON public.publishing_queue(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_social_accounts_user_platform ON public.social_accounts(user_id, platform);
CREATE INDEX idx_business_profiles_user_primary ON public.business_profiles(user_id, is_primary);