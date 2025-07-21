-- Professional Healthcare Calendar System Database Schema
-- Google/Apple Quality Calendar Engine Support

-- Healthcare Calendar Events Table
CREATE TABLE IF NOT EXISTS healthcare_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT NOT NULL,
    
    -- Event Core Information
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false,
    
    -- Healthcare-Specific Properties
    event_type TEXT NOT NULL DEFAULT 'content_creation' CHECK (event_type IN (
        'content_creation', 'social_post', 'blog_article', 'patient_education', 
        'appointment', 'campaign', 'compliance_review', 'team_meeting', 'smart_capture'
    )),
    platform TEXT CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'all', 'blog', 'email')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    
    -- AI & Compliance Properties
    ai_generated BOOLEAN DEFAULT false,
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    ahpra_compliant BOOLEAN DEFAULT true,
    content_type TEXT CHECK (content_type IN ('patient_education', 'practice_marketing', 'professional_communication')),
    target_audience TEXT CHECK (target_audience IN ('patients', 'professionals', 'referrers', 'community')),
    
    -- Collaboration & Workflow
    assigned_to TEXT,
    attendees JSONB DEFAULT '[]',
    location TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    reminders JSONB DEFAULT '[]',
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    external_id TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by TEXT NOT NULL
);

-- Healthcare Practice Settings Table
CREATE TABLE IF NOT EXISTS healthcare_practice_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT NOT NULL,
    
    -- Practice Information
    practice_name TEXT NOT NULL,
    practice_type TEXT NOT NULL CHECK (practice_type IN ('gp', 'specialist', 'allied_health', 'psychology', 'dentistry', 'pharmacy')),
    specialty TEXT NOT NULL,
    practice_color TEXT DEFAULT '#3b82f6',
    is_active BOOLEAN DEFAULT true,
    ahpra_number TEXT,
    
    -- Working Hours & Settings
    working_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00", "days": [1,2,3,4,5]}',
    notifications BOOLEAN DEFAULT true,
    auto_scheduling BOOLEAN DEFAULT false,
    compliance_level TEXT DEFAULT 'basic' CHECK (compliance_level IN ('basic', 'advanced', 'enterprise')),
    
    -- Team Management
    team_members JSONB DEFAULT '[]',
    
    -- External Integrations
    google_calendar_enabled BOOLEAN DEFAULT false,
    outlook_calendar_enabled BOOLEAN DEFAULT false,
    apple_calendar_enabled BOOLEAN DEFAULT false,
    practice_management_system TEXT,
    
    -- Settings
    calendar_settings JSONB DEFAULT '{}',
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, practice_id)
);

-- Calendar Event Templates Table (for quick event creation)
CREATE TABLE IF NOT EXISTS healthcare_calendar_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT NOT NULL,
    
    -- Template Information
    template_name TEXT NOT NULL,
    template_description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    
    -- Default Event Properties
    default_title TEXT NOT NULL,
    default_description TEXT,
    default_duration INTEGER DEFAULT 60, -- minutes
    default_event_type TEXT NOT NULL,
    default_platform TEXT,
    default_priority TEXT DEFAULT 'medium',
    default_tags JSONB DEFAULT '[]',
    
    -- Healthcare Properties
    default_content_type TEXT,
    default_target_audience TEXT,
    requires_compliance_review BOOLEAN DEFAULT false,
    
    -- Usage Statistics
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, practice_id, template_name)
);

-- External Calendar Sync Table
CREATE TABLE IF NOT EXISTS healthcare_external_calendar_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT NOT NULL,
    
    -- External Calendar Information
    external_provider TEXT NOT NULL CHECK (external_provider IN ('google', 'outlook', 'apple')),
    external_calendar_id TEXT NOT NULL,
    external_calendar_name TEXT,
    
    -- Sync Settings
    is_enabled BOOLEAN DEFAULT true,
    sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('import', 'export', 'bidirectional')),
    
    -- Authentication & Tokens
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- Sync Status
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'paused')),
    sync_error_message TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, practice_id, external_provider, external_calendar_id)
);

-- Smart Suggestions Table
CREATE TABLE IF NOT EXISTS healthcare_calendar_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Suggestion Information
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('scheduling', 'content', 'compliance', 'automation')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Action Data
    action_data JSONB DEFAULT '{}',
    
    -- Status & Response
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'expired')),
    user_response TEXT,
    responded_at TIMESTAMPTZ,
    
    -- Expiration
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_user_practice ON healthcare_calendar_events(user_id, practice_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_start_time ON healthcare_calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_end_time ON healthcare_calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_event_type ON healthcare_calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_status ON healthcare_calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_ahpra_compliant ON healthcare_calendar_events(ahpra_compliant);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_created_at ON healthcare_calendar_events(created_at);

CREATE INDEX IF NOT EXISTS idx_healthcare_practice_settings_user_practice ON healthcare_practice_settings(user_id, practice_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_practice_settings_active ON healthcare_practice_settings(is_active);

CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_templates_user_practice ON healthcare_calendar_templates(user_id, practice_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_templates_category ON healthcare_calendar_templates(category);

CREATE INDEX IF NOT EXISTS idx_healthcare_external_sync_user_practice ON healthcare_external_calendar_sync(user_id, practice_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_external_sync_provider ON healthcare_external_calendar_sync(external_provider);
CREATE INDEX IF NOT EXISTS idx_healthcare_external_sync_enabled ON healthcare_external_calendar_sync(is_enabled);

CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_suggestions_user ON healthcare_calendar_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_suggestions_status ON healthcare_calendar_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_suggestions_expires_at ON healthcare_calendar_suggestions(expires_at);

-- Row Level Security (RLS) Policies
ALTER TABLE healthcare_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_practice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_calendar_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_external_calendar_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_calendar_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for healthcare_calendar_events
CREATE POLICY "Users can manage their own calendar events"
    ON healthcare_calendar_events
    FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for healthcare_practice_settings
CREATE POLICY "Users can manage their own practice settings"
    ON healthcare_practice_settings
    FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for healthcare_calendar_templates
CREATE POLICY "Users can manage their own calendar templates"
    ON healthcare_calendar_templates
    FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for healthcare_external_calendar_sync
CREATE POLICY "Users can manage their own external calendar sync"
    ON healthcare_external_calendar_sync
    FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for healthcare_calendar_suggestions
CREATE POLICY "Users can view and respond to their own suggestions"
    ON healthcare_calendar_suggestions
    FOR ALL
    USING (auth.uid() = user_id);

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_healthcare_calendar_events_updated_at
    BEFORE UPDATE ON healthcare_calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_practice_settings_updated_at
    BEFORE UPDATE ON healthcare_practice_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_calendar_templates_updated_at
    BEFORE UPDATE ON healthcare_calendar_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_external_calendar_sync_updated_at
    BEFORE UPDATE ON healthcare_external_calendar_sync
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_calendar_suggestions_updated_at
    BEFORE UPDATE ON healthcare_calendar_suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Smart Suggestion Generation Function
CREATE OR REPLACE FUNCTION generate_smart_calendar_suggestions(p_user_id UUID, p_practice_id TEXT DEFAULT NULL)
RETURNS TABLE(
    suggestion_type TEXT,
    title TEXT,
    description TEXT,
    confidence DECIMAL,
    priority TEXT,
    action_data JSONB
) AS $$
BEGIN
    -- Clear expired suggestions
    DELETE FROM healthcare_calendar_suggestions 
    WHERE user_id = p_user_id 
    AND expires_at < now();
    
    -- Generate scheduling suggestions
    RETURN QUERY
    WITH event_stats AS (
        SELECT 
            COUNT(*) as total_events,
            COUNT(*) FILTER (WHERE start_time BETWEEN now() AND now() + INTERVAL '7 days') as upcoming_events,
            COUNT(*) FILTER (WHERE end_time < now() AND status NOT IN ('completed', 'cancelled')) as overdue_events,
            COUNT(*) FILTER (WHERE NOT ahpra_compliant) as compliance_issues
        FROM healthcare_calendar_events 
        WHERE user_id = p_user_id 
        AND (p_practice_id IS NULL OR practice_id = p_practice_id)
    )
    SELECT 
        'scheduling'::TEXT,
        'Heavy Schedule Detected'::TEXT,
        'You have ' || upcoming_events || ' events this week. Consider rescheduling non-urgent items.'::TEXT,
        0.8::DECIMAL,
        CASE WHEN upcoming_events > 10 THEN 'high' ELSE 'medium' END::TEXT,
        jsonb_build_object('upcoming_count', upcoming_events)
    FROM event_stats
    WHERE upcoming_events > 5
    
    UNION ALL
    
    SELECT 
        'compliance'::TEXT,
        'AHPRA Compliance Review Needed'::TEXT,
        compliance_issues || ' events need compliance review before publication.'::TEXT,
        0.95::DECIMAL,
        'high'::TEXT,
        jsonb_build_object('compliance_issues_count', compliance_issues)
    FROM event_stats
    WHERE compliance_issues > 0
    
    UNION ALL
    
    SELECT 
        'scheduling'::TEXT,
        'Overdue Events'::TEXT,
        overdue_events || ' events are overdue and need attention.'::TEXT,
        1.0::DECIMAL,
        'high'::TEXT,
        jsonb_build_object('overdue_count', overdue_events)
    FROM event_stats
    WHERE overdue_events > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calendar Analytics Function
CREATE OR REPLACE FUNCTION get_calendar_analytics(p_user_id UUID, p_practice_id TEXT DEFAULT NULL, p_start_date DATE DEFAULT NULL, p_end_date DATE DEFAULT NULL)
RETURNS TABLE(
    total_events INTEGER,
    completed_events INTEGER,
    compliance_score DECIMAL,
    content_breakdown JSONB,
    platform_breakdown JSONB,
    priority_breakdown JSONB
) AS $$
DECLARE
    v_start_date DATE := COALESCE(p_start_date, date_trunc('month', now())::DATE);
    v_end_date DATE := COALESCE(p_end_date, (date_trunc('month', now()) + INTERVAL '1 month - 1 day')::DATE);
BEGIN
    RETURN QUERY
    WITH event_data AS (
        SELECT *
        FROM healthcare_calendar_events 
        WHERE user_id = p_user_id 
        AND (p_practice_id IS NULL OR practice_id = p_practice_id)
        AND start_time::DATE BETWEEN v_start_date AND v_end_date
    ),
    summary AS (
        SELECT 
            COUNT(*)::INTEGER as total_events,
            COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_events,
            ROUND(AVG(compliance_score), 2) as compliance_score
        FROM event_data
    ),
    content_breakdown AS (
        SELECT jsonb_object_agg(event_type, count) as content_breakdown
        FROM (
            SELECT event_type, COUNT(*)
            FROM event_data
            GROUP BY event_type
        ) t
    ),
    platform_breakdown AS (
        SELECT jsonb_object_agg(COALESCE(platform, 'none'), count) as platform_breakdown
        FROM (
            SELECT platform, COUNT(*)
            FROM event_data
            GROUP BY platform
        ) t
    ),
    priority_breakdown AS (
        SELECT jsonb_object_agg(priority, count) as priority_breakdown
        FROM (
            SELECT priority, COUNT(*)
            FROM event_data
            GROUP BY priority
        ) t
    )
    SELECT 
        s.total_events,
        s.completed_events,
        s.compliance_score,
        cb.content_breakdown,
        pb.platform_breakdown,
        prb.priority_breakdown
    FROM summary s
    CROSS JOIN content_breakdown cb
    CROSS JOIN platform_breakdown pb
    CROSS JOIN priority_breakdown prb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample Data for Development (commented out for production)
/*
-- Insert sample practice settings
INSERT INTO healthcare_practice_settings (
    user_id, practice_id, practice_name, practice_type, specialty, practice_color, ahpra_number
) VALUES 
(gen_random_uuid(), 'gp-north-sydney', 'North Sydney GP', 'gp', 'Family Medicine', '#3b82f6', 'MED0001234567'),
(gen_random_uuid(), 'allied-physio', 'Allied Health Physiotherapy', 'allied_health', 'Physiotherapy', '#10b981', 'PHY0007654321'),
(gen_random_uuid(), 'cardiology-specialist', 'Sydney Cardiology Centre', 'specialist', 'Cardiology', '#f59e0b', 'SPC0001111111')
ON CONFLICT (user_id, practice_id) DO NOTHING;

-- Insert sample calendar templates
INSERT INTO healthcare_calendar_templates (
    user_id, practice_id, template_name, template_description, default_title, default_event_type, default_tags
) VALUES 
(auth.uid(), 'gp-north-sydney', 'Patient Education Blog', 'Template for patient education blog posts', 'Patient Education: [Topic]', 'blog_article', '["patient-education", "blog"]'),
(auth.uid(), 'gp-north-sydney', 'Social Media Post', 'Template for social media content', 'Social Post: [Topic]', 'social_post', '["social-media"]'),
(auth.uid(), 'allied-physio', 'Exercise Video', 'Template for exercise demonstration videos', 'Exercise Video: [Exercise]', 'content_creation', '["exercise", "video"]'),
(auth.uid(), 'cardiology-specialist', 'Heart Health Campaign', 'Template for heart health awareness content', 'Heart Health: [Topic]', 'campaign', '["heart-health", "awareness"]')
ON CONFLICT (user_id, practice_id, template_name) DO NOTHING;
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON healthcare_calendar_events TO authenticated;
GRANT ALL ON healthcare_practice_settings TO authenticated;
GRANT ALL ON healthcare_calendar_templates TO authenticated;
GRANT ALL ON healthcare_external_calendar_sync TO authenticated;
GRANT ALL ON healthcare_calendar_suggestions TO authenticated;

-- Comments for documentation
COMMENT ON TABLE healthcare_calendar_events IS 'Professional calendar events for healthcare content planning with AHPRA compliance tracking';
COMMENT ON TABLE healthcare_practice_settings IS 'Practice-specific settings and configurations for calendar management';
COMMENT ON TABLE healthcare_calendar_templates IS 'Reusable event templates for quick calendar event creation';
COMMENT ON TABLE healthcare_external_calendar_sync IS 'External calendar integration settings and sync status';
COMMENT ON TABLE healthcare_calendar_suggestions IS 'AI-generated smart suggestions for calendar optimization';

COMMENT ON FUNCTION generate_smart_calendar_suggestions IS 'Generates intelligent suggestions for calendar optimization and compliance';
COMMENT ON FUNCTION get_calendar_analytics IS 'Provides comprehensive analytics for calendar events and content performance'; 