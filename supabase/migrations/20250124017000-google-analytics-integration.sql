-- Google Analytics 4 Integration for Healthcare Practices
-- Migration: 20250124017000-google-analytics-integration.sql

-- Analytics Integrations Table
CREATE TABLE IF NOT EXISTS analytics_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('google_analytics', 'facebook_insights', 'instagram_insights', 'linkedin_analytics')),
    configuration JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure one active integration per platform per user
    UNIQUE(user_id, platform, is_active) WHERE is_active = true
);

-- Healthcare Website Events Table
CREATE TABLE IF NOT EXISTS healthcare_website_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    event_name TEXT NOT NULL,
    event_category TEXT NOT NULL CHECK (event_category IN (
        'patient_journey', 'appointment_inquiry', 'contact_form', 'phone_interaction',
        'location_interaction', 'patient_education', 'service_engagement',
        'practice_information', 'compliance_tracking'
    )),
    event_data JSONB DEFAULT '{}',
    page_path TEXT,
    user_agent TEXT,
    anonymized_ip TEXT, -- Anonymized for healthcare compliance
    session_id TEXT,
    ga_client_id TEXT,
    healthcare_context JSONB DEFAULT '{}', -- Healthcare-specific event context
    patient_privacy_compliant BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Website Analytics Summary Table
CREATE TABLE IF NOT EXISTS website_analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    date DATE NOT NULL,
    analytics_source TEXT NOT NULL CHECK (analytics_source IN ('google_analytics', 'manual_tracking')),
    
    -- Basic Website Metrics
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    unique_page_views INTEGER DEFAULT 0,
    average_session_duration DECIMAL DEFAULT 0,
    bounce_rate DECIMAL DEFAULT 0,
    
    -- Healthcare-Specific Metrics
    appointment_inquiries INTEGER DEFAULT 0,
    contact_form_submissions INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    location_clicks INTEGER DEFAULT 0,
    service_page_views INTEGER DEFAULT 0,
    patient_education_engagement INTEGER DEFAULT 0,
    
    -- Patient Journey Analytics
    patient_journey_completions INTEGER DEFAULT 0,
    appointment_booking_attempts INTEGER DEFAULT 0,
    patient_portal_logins INTEGER DEFAULT 0,
    
    -- Content Performance
    top_landing_pages JSONB DEFAULT '[]',
    top_exit_pages JSONB DEFAULT '[]',
    healthcare_content_performance JSONB DEFAULT '{}',
    
    -- Traffic Sources
    traffic_sources JSONB DEFAULT '{}',
    referral_sources JSONB DEFAULT '{}',
    
    -- Geographic Data
    geographic_distribution JSONB DEFAULT '{}',
    local_vs_remote_patients JSONB DEFAULT '{}',
    
    -- Device & Technical Data
    device_breakdown JSONB DEFAULT '{}',
    browser_data JSONB DEFAULT '{}',
    
    -- Compliance & Privacy
    privacy_mode_enabled BOOLEAN DEFAULT true,
    data_anonymization_applied BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure one record per date per user
    UNIQUE(user_id, practice_id, date, analytics_source)
);

-- Google Analytics Property Configuration Table
CREATE TABLE IF NOT EXISTS ga4_property_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    property_id TEXT NOT NULL,
    measurement_id TEXT NOT NULL,
    stream_id TEXT,
    api_secret TEXT, -- Encrypted in application layer
    
    -- Healthcare-specific configuration
    healthcare_events_enabled BOOLEAN DEFAULT true,
    patient_privacy_mode BOOLEAN DEFAULT true,
    anonymize_ip BOOLEAN DEFAULT true,
    data_retention_period TEXT DEFAULT '26_months' CHECK (
        data_retention_period IN ('14_months', '26_months', '38_months', '50_months')
    ),
    
    -- Custom Healthcare Events Configuration
    custom_events_config JSONB DEFAULT '{
        "appointment_inquiry": {"enabled": true, "conversion": true},
        "contact_form_submission": {"enabled": true, "conversion": true},
        "phone_click": {"enabled": true, "conversion": false},
        "location_click": {"enabled": true, "conversion": false},
        "patient_education_engagement": {"enabled": true, "conversion": false},
        "service_page_view": {"enabled": true, "conversion": false}
    }',
    
    -- Enhanced Measurement Settings
    enhanced_measurement JSONB DEFAULT '{
        "page_views": true,
        "scrolls": true,
        "outbound_clicks": true,
        "site_search": false,
        "video_engagement": false,
        "file_downloads": true
    }',
    
    is_active BOOLEAN DEFAULT true,
    last_data_sync TIMESTAMP WITH TIME ZONE,
    setup_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, property_id) WHERE is_active = true
);

-- Patient Journey Tracking Table
CREATE TABLE IF NOT EXISTS patient_journey_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    session_id TEXT NOT NULL,
    ga_client_id TEXT,
    
    -- Journey Stage Tracking
    journey_stage TEXT CHECK (journey_stage IN (
        'awareness', 'consideration', 'intent', 'action', 'retention'
    )),
    
    -- Entry Point
    entry_page TEXT,
    entry_source TEXT,
    entry_medium TEXT,
    entry_campaign TEXT,
    
    -- Key Actions Taken
    actions_taken JSONB DEFAULT '[]', -- Array of action objects
    pages_visited JSONB DEFAULT '[]', -- Array of page visit objects
    
    -- Healthcare-Specific Journey Events
    viewed_services JSONB DEFAULT '[]',
    education_content_consumed JSONB DEFAULT '[]',
    appointment_inquiry_made BOOLEAN DEFAULT false,
    contact_information_accessed BOOLEAN DEFAULT false,
    practice_location_viewed BOOLEAN DEFAULT false,
    
    -- Journey Outcome
    journey_completed BOOLEAN DEFAULT false,
    conversion_type TEXT CHECK (conversion_type IN (
        'appointment_inquiry', 'contact_form', 'phone_call', 'visit_request', 'none'
    )),
    conversion_value DECIMAL DEFAULT 0,
    
    -- Journey Duration & Engagement
    session_duration INTEGER, -- in seconds
    page_views_count INTEGER DEFAULT 0,
    engagement_score DECIMAL DEFAULT 0, -- Healthcare engagement scoring
    
    -- Privacy & Compliance
    patient_data_anonymized BOOLEAN DEFAULT true,
    gdpr_consent_status TEXT DEFAULT 'unknown' CHECK (gdpr_consent_status IN ('granted', 'denied', 'unknown')),
    
    journey_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    journey_ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Healthcare Content Analytics Table
CREATE TABLE IF NOT EXISTS healthcare_content_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Content Identification
    page_path TEXT NOT NULL,
    page_title TEXT,
    content_type TEXT CHECK (content_type IN (
        'service_page', 'patient_education', 'practice_information', 
        'contact_page', 'blog_post', 'resource_page', 'appointment_booking'
    )),
    healthcare_specialty TEXT, -- GP, specialist, allied health, etc.
    
    -- Performance Metrics
    page_views INTEGER DEFAULT 0,
    unique_page_views INTEGER DEFAULT 0,
    average_time_on_page DECIMAL DEFAULT 0,
    bounce_rate DECIMAL DEFAULT 0,
    exit_rate DECIMAL DEFAULT 0,
    
    -- Healthcare-Specific Metrics
    patient_education_value_score DECIMAL DEFAULT 0, -- 0-100 score
    appointment_conversion_rate DECIMAL DEFAULT 0,
    patient_engagement_depth DECIMAL DEFAULT 0,
    medical_authority_score DECIMAL DEFAULT 0,
    
    -- User Interaction Data
    scroll_depth_avg DECIMAL DEFAULT 0,
    clicks_to_contact INTEGER DEFAULT 0,
    clicks_to_appointment INTEGER DEFAULT 0,
    downloads_or_shares INTEGER DEFAULT 0,
    
    -- Content Quality Indicators
    content_freshness_score DECIMAL DEFAULT 0,
    medical_accuracy_verified BOOLEAN DEFAULT false,
    ahpra_compliance_checked BOOLEAN DEFAULT false,
    last_medical_review DATE,
    
    -- Traffic & Sources
    organic_traffic_percentage DECIMAL DEFAULT 0,
    referral_traffic_sources JSONB DEFAULT '{}',
    social_media_traffic JSONB DEFAULT '{}',
    
    date_recorded DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, page_path, date_recorded)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_analytics_integrations_user_platform 
    ON analytics_integrations(user_id, platform, is_active);

CREATE INDEX IF NOT EXISTS idx_healthcare_website_events_user_date 
    ON healthcare_website_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_website_events_category 
    ON healthcare_website_events(event_category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_website_analytics_summary_user_date 
    ON website_analytics_summary(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_ga4_property_config_user_active 
    ON ga4_property_config(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_patient_journey_tracking_session 
    ON patient_journey_tracking(session_id, journey_started_at);

CREATE INDEX IF NOT EXISTS idx_patient_journey_tracking_user_date 
    ON patient_journey_tracking(user_id, journey_started_at DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_content_analytics_user_date 
    ON healthcare_content_analytics(user_id, date_recorded DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_content_analytics_type 
    ON healthcare_content_analytics(content_type, date_recorded DESC);

-- Row Level Security (RLS) Policies

-- Analytics Integrations
ALTER TABLE analytics_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own analytics integrations" ON analytics_integrations
    FOR ALL USING (auth.uid() = user_id);

-- Healthcare Website Events
ALTER TABLE healthcare_website_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own website events" ON healthcare_website_events
    FOR ALL USING (auth.uid() = user_id);

-- Website Analytics Summary
ALTER TABLE website_analytics_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own analytics summary" ON website_analytics_summary
    FOR ALL USING (auth.uid() = user_id);

-- GA4 Property Config
ALTER TABLE ga4_property_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own GA4 properties" ON ga4_property_config
    FOR ALL USING (auth.uid() = user_id);

-- Patient Journey Tracking
ALTER TABLE patient_journey_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own patient journey data" ON patient_journey_tracking
    FOR ALL USING (auth.uid() = user_id);

-- Healthcare Content Analytics
ALTER TABLE healthcare_content_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own content analytics" ON healthcare_content_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Functions for Healthcare Analytics

-- Function to calculate patient engagement score
CREATE OR REPLACE FUNCTION calculate_patient_engagement_score(
    session_duration INTEGER,
    page_views INTEGER,
    conversion_actions INTEGER
)
RETURNS DECIMAL AS $$
BEGIN
    -- Healthcare-specific engagement scoring algorithm
    RETURN LEAST(100, 
        (session_duration / 60.0) * 0.3 +  -- 30% weight on time spent
        (page_views * 5) * 0.4 +           -- 40% weight on page exploration
        (conversion_actions * 20) * 0.3    -- 30% weight on conversion actions
    );
END;
$$ LANGUAGE plpgsql;

-- Function to determine healthcare content type from URL
CREATE OR REPLACE FUNCTION determine_healthcare_content_type(page_path TEXT)
RETURNS TEXT AS $$
BEGIN
    IF page_path ILIKE '%/services/%' THEN
        RETURN 'service_page';
    ELSIF page_path ILIKE '%/education/%' OR page_path ILIKE '%/health-tips/%' THEN
        RETURN 'patient_education';
    ELSIF page_path ILIKE '%/about/%' OR page_path ILIKE '%/team/%' THEN
        RETURN 'practice_information';
    ELSIF page_path ILIKE '%/contact%' OR page_path ILIKE '%/appointment%' THEN
        RETURN 'contact_page';
    ELSIF page_path ILIKE '%/blog/%' OR page_path ILIKE '%/articles/%' THEN
        RETURN 'blog_post';
    ELSIF page_path ILIKE '%/resources/%' OR page_path ILIKE '%/forms/%' THEN
        RETURN 'resource_page';
    ELSE
        RETURN 'practice_information';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically determine content type
CREATE OR REPLACE FUNCTION set_healthcare_content_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.content_type IS NULL OR NEW.content_type = '' THEN
        NEW.content_type = determine_healthcare_content_type(NEW.page_path);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_healthcare_content_type
    BEFORE INSERT OR UPDATE ON healthcare_content_analytics
    FOR EACH ROW
    EXECUTE FUNCTION set_healthcare_content_type();

-- Function to update analytics summary timestamps
CREATE OR REPLACE FUNCTION update_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_analytics_integrations_timestamp
    BEFORE UPDATE ON analytics_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER update_website_analytics_summary_timestamp
    BEFORE UPDATE ON website_analytics_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER update_ga4_property_config_timestamp
    BEFORE UPDATE ON ga4_property_config
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER update_healthcare_content_analytics_timestamp
    BEFORE UPDATE ON healthcare_content_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

-- Grant necessary permissions
GRANT ALL ON analytics_integrations TO authenticated;
GRANT ALL ON healthcare_website_events TO authenticated;
GRANT ALL ON website_analytics_summary TO authenticated;
GRANT ALL ON ga4_property_config TO authenticated;
GRANT ALL ON patient_journey_tracking TO authenticated;
GRANT ALL ON healthcare_content_analytics TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 