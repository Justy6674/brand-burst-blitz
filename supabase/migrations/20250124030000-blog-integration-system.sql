-- Blog Integration System Database Schema
-- Complete backend infrastructure for 25+ platform blog integrations

-- Table for storing blog integration configurations
CREATE TABLE IF NOT EXISTS blog_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('plugin', 'app', 'copy-paste', 'embed', 'code-injection', 'api', 'module')),
  configuration JSONB NOT NULL DEFAULT '{}',
  generated_files JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'deployed', 'verified', 'error')),
  website_url TEXT,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verification_results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id, platform_id)
);

-- Table for API usage logging and rate limiting
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  request_params JSONB DEFAULT '{}',
  response_count INTEGER DEFAULT 0,
  response_size INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address INET,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing generated downloadable files
CREATE TABLE IF NOT EXISTS generated_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES blog_integrations(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  language TEXT,
  mime_type TEXT,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  download_url TEXT,
  download_count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- Table for URL verification results
CREATE TABLE IF NOT EXISTS url_verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES blog_integrations(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  verification_type TEXT NOT NULL DEFAULT 'integration',
  checks_performed JSONB NOT NULL DEFAULT '[]',
  overall_status TEXT NOT NULL CHECK (overall_status IN ('success', 'warning', 'error')),
  performance_metrics JSONB DEFAULT '{}',
  error_details JSONB DEFAULT '{}',
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_verification_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Table for platform definitions cache
CREATE TABLE IF NOT EXISTS platform_definitions_cache (
  platform_id TEXT PRIMARY KEY,
  definition JSONB NOT NULL,
  market_share DECIMAL(5,2),
  active_integrations INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for blog post embedding configurations
CREATE TABLE IF NOT EXISTS blog_embed_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  widget_id TEXT NOT NULL UNIQUE,
  platform_id TEXT NOT NULL,
  display_options JSONB NOT NULL DEFAULT '{}',
  styling_options JSONB NOT NULL DEFAULT '{}',
  content_filters JSONB NOT NULL DEFAULT '{}',
  ahpra_compliance_settings JSONB NOT NULL DEFAULT '{}',
  embed_code TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for real-time blog widget analytics
CREATE TABLE IF NOT EXISTS blog_widget_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id TEXT NOT NULL REFERENCES blog_embed_configs(widget_id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('load', 'view', 'click', 'error')),
  post_id UUID,
  visitor_id TEXT,
  user_agent TEXT,
  ip_address INET,
  referrer_url TEXT,
  page_url TEXT,
  session_duration INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for downloadable plugin/module packages
CREATE TABLE IF NOT EXISTS plugin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('wordpress-plugin', 'joomla-module', 'shopify-app', 'drupal-module')),
  version TEXT NOT NULL DEFAULT '1.0.0',
  package_name TEXT NOT NULL,
  description TEXT,
  files JSONB NOT NULL DEFAULT '[]',
  zip_file_path TEXT,
  zip_file_size INTEGER,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blog_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_embed_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_widget_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_integrations
CREATE POLICY "Users can manage their blog integrations"
ON blog_integrations
FOR ALL
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for api_usage_logs
CREATE POLICY "Users can view their API usage"
ON api_usage_logs
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for generated_files
CREATE POLICY "Users can access their generated files"
ON generated_files
FOR ALL
USING (
  integration_id IN (
    SELECT id FROM blog_integrations 
    WHERE business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies for url_verification_results
CREATE POLICY "Users can view their verification results"
ON url_verification_results
FOR ALL
USING (
  integration_id IN (
    SELECT id FROM blog_integrations 
    WHERE business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies for blog_embed_configs
CREATE POLICY "Users can manage their embed configs"
ON blog_embed_configs
FOR ALL
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for blog_widget_analytics
CREATE POLICY "Public can insert analytics events"
ON blog_widget_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their widget analytics"
ON blog_widget_analytics
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for plugin_packages
CREATE POLICY "Users can manage their plugin packages"
ON plugin_packages
FOR ALL
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_blog_integrations_business_platform ON blog_integrations(business_id, platform_id);
CREATE INDEX idx_blog_integrations_status ON blog_integrations(status);
CREATE INDEX idx_api_usage_logs_business_endpoint ON api_usage_logs(business_id, endpoint);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX idx_generated_files_integration ON generated_files(integration_id);
CREATE INDEX idx_url_verification_integration ON url_verification_results(integration_id);
CREATE INDEX idx_blog_embed_configs_widget ON blog_embed_configs(widget_id);
CREATE INDEX idx_blog_widget_analytics_widget ON blog_widget_analytics(widget_id, created_at);
CREATE INDEX idx_plugin_packages_business_platform ON plugin_packages(business_id, platform_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_blog_integrations_updated_at 
    BEFORE UPDATE ON blog_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_embed_configs_updated_at 
    BEFORE UPDATE ON blog_embed_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_packages_updated_at 
    BEFORE UPDATE ON plugin_packages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired files
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS void AS $$
BEGIN
    DELETE FROM generated_files 
    WHERE expires_at < now() 
    AND download_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to update platform success rates
CREATE OR REPLACE FUNCTION update_platform_success_rates()
RETURNS void AS $$
BEGIN
    INSERT INTO platform_definitions_cache (platform_id, definition, active_integrations, success_rate, updated_at)
    SELECT 
        platform_id,
        '{}' as definition,
        COUNT(*) as active_integrations,
        (COUNT(CASE WHEN status = 'verified' THEN 1 END) * 100.0 / COUNT(*)) as success_rate,
        now() as updated_at
    FROM blog_integrations
    GROUP BY platform_id
    ON CONFLICT (platform_id) DO UPDATE SET
        active_integrations = EXCLUDED.active_integrations,
        success_rate = EXCLUDED.success_rate,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Initial platform data
INSERT INTO platform_definitions_cache (platform_id, definition, market_share) VALUES
('wordpress', '{"name": "WordPress", "category": "cms"}', 43.0),
('godaddy', '{"name": "GoDaddy Website Builder", "category": "traditional"}', 15.0),
('wix', '{"name": "Wix", "category": "traditional"}', 8.0),
('shopify', '{"name": "Shopify", "category": "ecommerce"}', 4.0),
('squarespace', '{"name": "Squarespace", "category": "traditional"}', 3.0),
('bigcommerce', '{"name": "BigCommerce", "category": "ecommerce"}', 2.0),
('joomla', '{"name": "Joomla", "category": "cms"}', 2.0),
('webflow', '{"name": "Webflow", "category": "developer"}', 1.0),
('weebly', '{"name": "Weebly", "category": "traditional"}', 1.0),
('vercel', '{"name": "Vercel", "category": "modern-dev"}', 2.0),
('netlify', '{"name": "Netlify", "category": "modern-dev"}', 2.0),
('firebase-studio', '{"name": "Firebase App Hosting", "category": "modern-dev"}', 3.0),
('windsurf', '{"name": "Windsurf IDE", "category": "modern-dev"}', 0.5),
('cursor', '{"name": "Cursor IDE", "category": "modern-dev"}', 1.0),
('lovable', '{"name": "Lovable", "category": "modern-dev"}', 0.3)
ON CONFLICT (platform_id) DO NOTHING;

-- Create storage bucket for generated files
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-integrations', 'generated-integrations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for generated files
CREATE POLICY "Public can view generated files"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-integrations');

CREATE POLICY "Authenticated users can upload generated files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-integrations' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their generated files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'generated-integrations' AND auth.role() = 'authenticated');

-- Comments for documentation
COMMENT ON TABLE blog_integrations IS 'Stores blog integration configurations for each platform';
COMMENT ON TABLE api_usage_logs IS 'Logs all API requests for monitoring and rate limiting';
COMMENT ON TABLE generated_files IS 'Stores metadata for downloadable integration files';
COMMENT ON TABLE url_verification_results IS 'Results from automated URL verification checks';
COMMENT ON TABLE blog_embed_configs IS 'Configuration for blog embed widgets';
COMMENT ON TABLE blog_widget_analytics IS 'Real-time analytics for blog widget usage';
COMMENT ON TABLE plugin_packages IS 'Downloadable plugin/module packages';
COMMENT ON TABLE platform_definitions_cache IS 'Cached platform definitions and statistics'; 