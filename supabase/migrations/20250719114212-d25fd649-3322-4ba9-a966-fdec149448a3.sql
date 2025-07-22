-- Add blog integration settings to business_profiles table
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS blog_integrations JSONB DEFAULT '{}';

-- Create website_integrations table for managing external website connections
CREATE TABLE IF NOT EXISTS website_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('wordpress', 'api', 'rss', 'webhook', 'embed')),
  integration_name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_profile_id, integration_type, integration_name)
);

-- Enable RLS on website_integrations
ALTER TABLE website_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for website_integrations
CREATE POLICY "Users can manage their website integrations"
ON website_integrations
FOR ALL
USING (auth.uid() = user_id);

-- Create multi_site_publishing table for tracking content publication across platforms
CREATE TABLE IF NOT EXISTS multi_site_publishing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  integration_id UUID REFERENCES website_integrations(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  platform_post_id TEXT,
  publish_status TEXT NOT NULL DEFAULT 'pending' CHECK (publish_status IN ('pending', 'publishing', 'published', 'failed', 'scheduled')),
  published_url TEXT,
  error_message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on multi_site_publishing
ALTER TABLE multi_site_publishing ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for multi_site_publishing
CREATE POLICY "Users can view their publishing status"
ON multi_site_publishing
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage publishing status"
ON multi_site_publishing
FOR ALL
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_website_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for website_integrations updated_at
CREATE TRIGGER update_website_integrations_updated_at
  BEFORE UPDATE ON website_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_website_integrations_updated_at();

-- Create trigger for multi_site_publishing updated_at  
CREATE TRIGGER update_multi_site_publishing_updated_at
  BEFORE UPDATE ON multi_site_publishing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_website_integrations_business_profile ON website_integrations(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_website_integrations_user ON website_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_multi_site_publishing_post ON multi_site_publishing(post_id);
CREATE INDEX IF NOT EXISTS idx_multi_site_publishing_status ON multi_site_publishing(publish_status);
CREATE INDEX IF NOT EXISTS idx_multi_site_publishing_scheduled ON multi_site_publishing(scheduled_for) WHERE scheduled_for IS NOT NULL;