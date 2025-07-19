-- Create blog customizations table
CREATE TABLE IF NOT EXISTS public.blog_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  layout_style TEXT NOT NULL DEFAULT 'cards' CHECK (layout_style IN ('grid', 'list', 'cards', 'magazine', 'minimal')),
  color_scheme JSONB NOT NULL DEFAULT '{"primary": "#3b82f6", "secondary": "#64748b", "background": "#ffffff", "text": "#1e293b", "accent": "#f59e0b"}',
  typography JSONB NOT NULL DEFAULT '{"font_family": "Inter, sans-serif", "heading_size": "1.5rem", "body_size": "1rem", "line_height": "1.6"}',
  branding JSONB NOT NULL DEFAULT '{"logo_position": "header", "show_powered_by": true}',
  image_settings JSONB NOT NULL DEFAULT '{"aspect_ratio": "16:9", "position": "top", "overlay_text": false, "auto_logo": false}',
  post_display JSONB NOT NULL DEFAULT '{"show_author": true, "show_date": true, "show_tags": true, "show_excerpt": true, "excerpt_length": 150, "posts_per_page": 9}',
  seo_settings JSONB NOT NULL DEFAULT '{"meta_title_template": "{title} | {business_name}", "meta_description_template": "{excerpt}"}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- Create blog images table
CREATE TABLE IF NOT EXISTS public.blog_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  tags TEXT[] DEFAULT '{}',
  size BIGINT NOT NULL,
  dimensions JSONB NOT NULL,
  folder TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog templates table
CREATE TABLE IF NOT EXISTS public.blog_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  template_data JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  business_id UUID,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website integrations table  
CREATE TABLE IF NOT EXISTS public.website_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('wordpress', 'api', 'rss', 'webhook', 'embed')),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, integration_type, integration_name)
);

-- Enable RLS
ALTER TABLE public.blog_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_customizations
CREATE POLICY "Users can view their business customizations" 
ON public.blog_customizations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_customizations.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their business customizations" 
ON public.blog_customizations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_customizations.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their business customizations" 
ON public.blog_customizations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_customizations.business_id 
    AND bp.user_id = auth.uid()
  )
);

-- Create RLS policies for blog_images
CREATE POLICY "Users can view their business images" 
ON public.blog_images 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_images.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their business images" 
ON public.blog_images 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_images.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their business images" 
ON public.blog_images 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_images.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their business images" 
ON public.blog_images 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_images.business_id 
    AND bp.user_id = auth.uid()
  )
);

-- Create RLS policies for blog_templates
CREATE POLICY "Users can view public templates and their own templates" 
ON public.blog_templates 
FOR SELECT 
USING (
  is_public = true OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_templates.business_id 
    AND bp.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create their business templates" 
ON public.blog_templates 
FOR INSERT 
WITH CHECK (
  business_id IS NULL OR EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_templates.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their business templates" 
ON public.blog_templates 
FOR UPDATE 
USING (
  business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = blog_templates.business_id 
    AND bp.user_id = auth.uid()
  )
);

-- Create RLS policies for website_integrations
CREATE POLICY "Users can view their business integrations" 
ON public.website_integrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = website_integrations.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their business integrations" 
ON public.website_integrations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = website_integrations.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their business integrations" 
ON public.website_integrations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = website_integrations.business_id 
    AND bp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their business integrations" 
ON public.website_integrations 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles bp 
    WHERE bp.id = website_integrations.business_id 
    AND bp.user_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_blog_customizations_updated_at
  BEFORE UPDATE ON public.blog_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_images_updated_at
  BEFORE UPDATE ON public.blog_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_templates_updated_at
  BEFORE UPDATE ON public.blog_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_integrations_updated_at
  BEFORE UPDATE ON public.website_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_website_integrations_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_customizations_business_id ON public.blog_customizations(business_id);
CREATE INDEX IF NOT EXISTS idx_blog_images_business_id ON public.blog_images(business_id);
CREATE INDEX IF NOT EXISTS idx_blog_images_tags ON public.blog_images USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_templates_category ON public.blog_templates(category);
CREATE INDEX IF NOT EXISTS idx_blog_templates_is_public ON public.blog_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_website_integrations_business_id ON public.website_integrations(business_id);
CREATE INDEX IF NOT EXISTS idx_website_integrations_type ON public.website_integrations(integration_type);

-- Insert some default blog templates
INSERT INTO public.blog_templates (name, description, category, template_data, is_public) VALUES
('Business Announcement', 'Template for announcing company news and updates', 'business', '{"title": "Exciting News: {announcement_title}", "sections": [{"type": "intro", "placeholder": "We are thrilled to announce..."}, {"type": "details", "placeholder": "Here are the key details..."}, {"type": "cta", "placeholder": "Learn more about this exciting development..."}]}', true),
('Product Launch', 'Template for introducing new products or services', 'product', '{"title": "Introducing {product_name}", "sections": [{"type": "hero", "placeholder": "We are excited to introduce our latest innovation..."}, {"type": "features", "placeholder": "Key features and benefits include..."}, {"type": "availability", "placeholder": "Available now at..."}]}', true),
('How-To Guide', 'Template for creating instructional content', 'tutorial', '{"title": "How to {action_description}", "sections": [{"type": "overview", "placeholder": "In this guide, you will learn..."}, {"type": "steps", "placeholder": "Step 1: ...\nStep 2: ...\nStep 3: ..."}, {"type": "conclusion", "placeholder": "By following these steps..."}]}', true),
('Industry Insights', 'Template for sharing industry knowledge and trends', 'insights', '{"title": "{industry} Trends: {topic}", "sections": [{"type": "current_state", "placeholder": "The current state of the industry..."}, {"type": "trends", "placeholder": "Key trends we are seeing include..."}, {"type": "implications", "placeholder": "What this means for businesses..."}]}', true),
('Customer Success Story', 'Template for showcasing customer achievements', 'case_study', '{"title": "How {customer_name} Achieved {result}", "sections": [{"type": "challenge", "placeholder": "The challenge our customer faced..."}, {"type": "solution", "placeholder": "How we helped solve their problem..."}, {"type": "results", "placeholder": "The amazing results they achieved..."}]}', true)
ON CONFLICT DO NOTHING;