-- Healthcare Calendar System
-- Migration: 20250124020000-healthcare-calendar-system.sql

-- Healthcare Calendar Events
CREATE TABLE IF NOT EXISTS healthcare_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Event Details
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    
    -- Event Classification
    event_type TEXT NOT NULL CHECK (event_type IN (
        'appointment', 'content_post', 'practice_task', 'training', 'admin', 
        'marketing', 'patient_follow_up', 'compliance_review', 'consultation',
        'surgery', 'telehealth', 'home_visit', 'emergency', 'screening'
    )),
    event_category TEXT NOT NULL CHECK (event_category IN (
        'patient_care', 'content_creation', 'practice_management', 
        'professional_development', 'compliance', 'marketing', 'administration'
    )),
    
    -- Healthcare Specific
    patient_type TEXT CHECK (patient_type IN ('new', 'returning', 'follow_up', 'urgent', 'emergency')),
    appointment_type TEXT,
    healthcare_specialty TEXT CHECK (healthcare_specialty IN (
        'general_practice', 'mental_health', 'cardiology', 'dermatology', 'orthopedics',
        'pediatrics', 'obstetrics_gynecology', 'neurology', 'oncology', 'radiology',
        'pathology', 'surgery', 'emergency_medicine', 'anesthesiology', 'psychiatry',
        'psychology', 'physiotherapy', 'occupational_therapy', 'speech_therapy',
        'dietetics', 'pharmacy', 'nursing', 'dentistry', 'optometry', 'podiatry'
    )),
    
    -- Content Specific
    content_platform TEXT CHECK (content_platform IN (
        'facebook', 'instagram', 'linkedin', 'twitter', 'website', 'blog', 
        'newsletter', 'youtube', 'tiktok', 'google_my_business'
    )),
    content_type TEXT CHECK (content_type IN (
        'patient_education', 'practice_update', 'health_tip', 'preventive_care',
        'seasonal_health', 'community_health', 'professional_update', 'testimonial',
        'service_announcement', 'health_awareness', 'emergency_notice'
    )),
    
    -- Event Management
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'emergency')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN (
        'draft', 'scheduled', 'confirmed', 'in_progress', 'completed', 
        'cancelled', 'rescheduled', 'no_show', 'postponed'
    )) DEFAULT 'scheduled',
    
    -- Location & Logistics
    location TEXT,
    is_telehealth BOOLEAN DEFAULT false,
    is_home_visit BOOLEAN DEFAULT false,
    requires_preparation BOOLEAN DEFAULT false,
    preparation_notes TEXT,
    equipment_needed TEXT[],
    
    -- Participants
    attendees TEXT[], -- Array of user IDs or email addresses
    patient_count INTEGER DEFAULT 0,
    max_participants INTEGER,
    
    -- Follow-up & Compliance
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    compliance_notes TEXT,
    ahpra_considerations TEXT,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- RRULE format
    recurrence_parent_id UUID REFERENCES healthcare_calendar_events(id),
    
    -- Integration
    external_event_id TEXT,
    external_calendar_id TEXT,
    sync_status TEXT CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict')) DEFAULT 'pending',
    
    -- Automation
    auto_generated BOOLEAN DEFAULT false,
    ai_suggested BOOLEAN DEFAULT false,
    ai_confidence_score DECIMAL,
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT false,
    reminder_type TEXT CHECK (reminder_type IN ('email', 'sms', 'push', 'phone')) DEFAULT 'email',
    reminder_timing INTEGER DEFAULT 1440, -- minutes before event
    
    -- Performance Tracking
    booking_source TEXT,
    referral_source TEXT,
    marketing_campaign TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_datetime_range CHECK (end_datetime IS NULL OR end_datetime > start_datetime)
);

-- Smart Idea Captures
CREATE TABLE IF NOT EXISTS smart_idea_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Idea Content
    content TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('voice', 'text', 'image', 'video', 'document')),
    original_language TEXT DEFAULT 'en-AU',
    
    -- AI Analysis
    suggested_type TEXT CHECK (suggested_type IN (
        'facebook_post', 'instagram_post', 'instagram_story', 'linkedin_post',
        'twitter_post', 'blog_post', 'newsletter_content', 'patient_education',
        'health_tip', 'video_script', 'infographic_content', 'email_template'
    )),
    ai_analysis TEXT,
    ai_title_suggestion TEXT,
    ai_keywords TEXT[],
    ai_hashtags TEXT[],
    ai_target_audience TEXT,
    confidence_score DECIMAL DEFAULT 0,
    
    -- Content Suggestions
    suggested_platform TEXT,
    suggested_tone TEXT CHECK (suggested_tone IN ('professional', 'friendly', 'educational', 'urgent', 'casual')),
    suggested_length TEXT CHECK (suggested_length IN ('short', 'medium', 'long')),
    compliance_check_required BOOLEAN DEFAULT true,
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE,
    optimal_posting_time TIMESTAMP WITH TIME ZONE,
    seasonal_relevance TEXT,
    
    -- Processing Status
    status TEXT NOT NULL CHECK (status IN (
        'captured', 'analyzing', 'analyzed', 'approved', 'scheduled', 
        'in_progress', 'published', 'rejected', 'archived'
    )) DEFAULT 'captured',
    
    -- Healthcare Context
    healthcare_topic TEXT,
    patient_education_value INTEGER CHECK (patient_education_value BETWEEN 1 AND 10),
    ahpra_compliance_risk TEXT CHECK (ahpra_compliance_risk IN ('low', 'medium', 'high')),
    requires_medical_review BOOLEAN DEFAULT false,
    
    -- User Interaction
    user_feedback TEXT,
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_modified BOOLEAN DEFAULT false,
    
    -- Linked Events
    calendar_event_id UUID REFERENCES healthcare_calendar_events(id),
    content_post_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- External Calendar Integrations
CREATE TABLE IF NOT EXISTS external_calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Calendar Provider
    provider TEXT NOT NULL CHECK (provider IN (
        'google', 'outlook', 'apple_icloud', 'exchange', 'caldav', 'ics'
    )),
    calendar_id TEXT NOT NULL,
    calendar_name TEXT NOT NULL,
    
    -- Integration Details
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Sync Configuration
    sync_enabled BOOLEAN DEFAULT true,
    sync_direction TEXT CHECK (sync_direction IN ('import', 'export', 'bidirectional')) DEFAULT 'bidirectional',
    sync_frequency TEXT CHECK (sync_frequency IN ('real_time', 'hourly', 'daily', 'manual')) DEFAULT 'hourly',
    
    -- Sync Status
    sync_status TEXT CHECK (sync_status IN ('connected', 'disconnected', 'error', 'pending')) DEFAULT 'pending',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_error TEXT,
    sync_error_count INTEGER DEFAULT 0,
    
    -- Event Filtering
    event_types_to_sync TEXT[],
    exclude_private_events BOOLEAN DEFAULT true,
    sync_only_work_hours BOOLEAN DEFAULT false,
    
    -- Performance
    total_events_synced INTEGER DEFAULT 0,
    sync_success_rate DECIMAL DEFAULT 100,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, provider, calendar_id)
);

-- Calendar Event Reminders
CREATE TABLE IF NOT EXISTS calendar_event_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES healthcare_calendar_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Reminder Details
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push', 'phone', 'in_app')),
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_offset_minutes INTEGER NOT NULL, -- minutes before event
    
    -- Content
    reminder_title TEXT,
    reminder_message TEXT,
    custom_message TEXT,
    
    -- Delivery Status
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_confirmed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    
    -- Recipient
    recipient_email TEXT,
    recipient_phone TEXT,
    recipient_device_token TEXT,
    
    -- Healthcare Specific
    appointment_preparation_info TEXT,
    health_instructions TEXT,
    medication_reminders TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Calendar Workflows & Automation
CREATE TABLE IF NOT EXISTS calendar_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Workflow Details
    workflow_name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        'event_created', 'event_updated', 'event_completed', 'time_based',
        'patient_booked', 'content_scheduled', 'compliance_due'
    )),
    
    -- Trigger Conditions
    trigger_conditions JSONB DEFAULT '{}',
    trigger_event_types TEXT[],
    trigger_schedule TEXT, -- CRON expression
    
    -- Actions
    action_type TEXT NOT NULL CHECK (action_type IN (
        'send_reminder', 'create_follow_up', 'update_status', 'send_notification',
        'generate_content', 'schedule_appointment', 'compliance_check'
    )),
    action_config JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_executed TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    
    -- Healthcare Context
    healthcare_specialty TEXT,
    patient_types TEXT[],
    compliance_requirements TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Calendar Performance Analytics
CREATE TABLE IF NOT EXISTS calendar_performance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Date Tracking
    analytics_date DATE NOT NULL,
    week_ending DATE,
    month_year TEXT,
    
    -- Event Metrics
    total_events_created INTEGER DEFAULT 0,
    total_events_completed INTEGER DEFAULT 0,
    total_events_cancelled INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    total_content_scheduled INTEGER DEFAULT 0,
    
    -- Appointment Metrics
    new_patient_appointments INTEGER DEFAULT 0,
    returning_patient_appointments INTEGER DEFAULT 0,
    telehealth_appointments INTEGER DEFAULT 0,
    in_person_appointments INTEGER DEFAULT 0,
    
    -- Content Metrics
    social_media_posts_scheduled INTEGER DEFAULT 0,
    blog_posts_scheduled INTEGER DEFAULT 0,
    patient_education_content INTEGER DEFAULT 0,
    
    -- Performance Metrics
    average_appointment_duration DECIMAL DEFAULT 0,
    appointment_no_show_rate DECIMAL DEFAULT 0,
    on_time_completion_rate DECIMAL DEFAULT 0,
    patient_satisfaction_score DECIMAL DEFAULT 0,
    
    -- Efficiency Metrics
    calendar_utilization_rate DECIMAL DEFAULT 0,
    double_booking_incidents INTEGER DEFAULT 0,
    last_minute_cancellations INTEGER DEFAULT 0,
    automated_tasks_completed INTEGER DEFAULT 0,
    
    -- Revenue Impact
    billable_hours DECIMAL DEFAULT 0,
    revenue_generated DECIMAL DEFAULT 0,
    cost_per_appointment DECIMAL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, practice_id, analytics_date)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_user_date 
    ON healthcare_calendar_events(created_by, start_datetime DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_practice_date 
    ON healthcare_calendar_events(practice_id, start_datetime DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_type_status 
    ON healthcare_calendar_events(event_type, status, start_datetime);

CREATE INDEX IF NOT EXISTS idx_healthcare_calendar_events_recurring 
    ON healthcare_calendar_events(is_recurring, recurrence_parent_id);

CREATE INDEX IF NOT EXISTS idx_smart_idea_captures_user_status 
    ON smart_idea_captures(created_by, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_smart_idea_captures_type 
    ON smart_idea_captures(suggested_type, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_external_calendar_integrations_user 
    ON external_calendar_integrations(user_id, sync_enabled);

CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_time 
    ON calendar_event_reminders(reminder_time, status);

CREATE INDEX IF NOT EXISTS idx_calendar_workflows_trigger 
    ON calendar_workflows(trigger_type, is_active);

CREATE INDEX IF NOT EXISTS idx_calendar_performance_analytics_date 
    ON calendar_performance_analytics(user_id, analytics_date DESC);

-- Row Level Security (RLS) Policies

-- Healthcare Calendar Events
ALTER TABLE healthcare_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar events" ON healthcare_calendar_events
    FOR ALL USING (auth.uid() = created_by);

-- Smart Idea Captures
ALTER TABLE smart_idea_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own idea captures" ON smart_idea_captures
    FOR ALL USING (auth.uid() = created_by);

-- External Calendar Integrations
ALTER TABLE external_calendar_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar integrations" ON external_calendar_integrations
    FOR ALL USING (auth.uid() = user_id);

-- Calendar Event Reminders
ALTER TABLE calendar_event_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own event reminders" ON calendar_event_reminders
    FOR ALL USING (auth.uid() = user_id);

-- Calendar Workflows
ALTER TABLE calendar_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar workflows" ON calendar_workflows
    FOR ALL USING (auth.uid() = user_id);

-- Calendar Performance Analytics
ALTER TABLE calendar_performance_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own calendar analytics" ON calendar_performance_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Functions for Healthcare Calendar System

-- Function to create recurring events
CREATE OR REPLACE FUNCTION create_recurring_events(
    parent_event_id UUID,
    recurrence_count INTEGER DEFAULT 10
)
RETURNS TABLE(event_id UUID, event_date TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
    parent_event RECORD;
    new_event_id UUID;
    event_date TIMESTAMP WITH TIME ZONE;
    i INTEGER;
BEGIN
    -- Get parent event details
    SELECT * INTO parent_event
    FROM healthcare_calendar_events
    WHERE id = parent_event_id;
    
    IF parent_event IS NULL THEN
        RAISE EXCEPTION 'Parent event not found';
    END IF;
    
    -- Create recurring events
    FOR i IN 1..recurrence_count LOOP
        -- Calculate next occurrence (simplified - weekly recurrence)
        event_date := parent_event.start_datetime + (i * INTERVAL '7 days');
        
        -- Create new event
        INSERT INTO healthcare_calendar_events (
            created_by, practice_id, title, description, start_datetime, end_datetime,
            event_type, event_category, patient_type, appointment_type, healthcare_specialty,
            priority, status, location, is_telehealth, is_recurring, recurrence_parent_id,
            auto_generated
        ) VALUES (
            parent_event.created_by, parent_event.practice_id, parent_event.title, 
            parent_event.description, event_date, 
            CASE WHEN parent_event.end_datetime IS NOT NULL 
                THEN event_date + (parent_event.end_datetime - parent_event.start_datetime)
                ELSE NULL END,
            parent_event.event_type, parent_event.event_category, parent_event.patient_type,
            parent_event.appointment_type, parent_event.healthcare_specialty,
            parent_event.priority, 'scheduled', parent_event.location, parent_event.is_telehealth,
            true, parent_event_id, true
        ) RETURNING id INTO new_event_id;
        
        RETURN QUERY SELECT new_event_id, event_date;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check calendar conflicts
CREATE OR REPLACE FUNCTION check_calendar_conflicts(
    p_user_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_event_id UUID DEFAULT NULL
)
RETURNS TABLE(
    conflict_event_id UUID,
    conflict_title TEXT,
    conflict_start TIMESTAMP WITH TIME ZONE,
    conflict_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hce.id,
        hce.title,
        hce.start_datetime,
        hce.end_datetime
    FROM healthcare_calendar_events hce
    WHERE hce.created_by = p_user_id
        AND hce.status NOT IN ('cancelled', 'completed')
        AND (p_exclude_event_id IS NULL OR hce.id != p_exclude_event_id)
        AND (
            (hce.start_datetime <= p_start_time AND hce.end_datetime > p_start_time) OR
            (hce.start_datetime < p_end_time AND hce.end_datetime >= p_end_time) OR
            (hce.start_datetime >= p_start_time AND hce.end_datetime <= p_end_time)
        );
END;
$$ LANGUAGE plpgsql;

-- Function to get optimal posting times
CREATE OR REPLACE FUNCTION get_optimal_posting_times(
    p_user_id UUID,
    p_content_type TEXT,
    p_platform TEXT
)
RETURNS TABLE(
    optimal_hour INTEGER,
    optimal_day INTEGER,
    engagement_score DECIMAL,
    recommended_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- This would analyze historical performance data
    -- For now, return healthcare-optimized posting times
    RETURN QUERY
    SELECT 
        CASE p_platform
            WHEN 'facebook' THEN 10 -- 10 AM
            WHEN 'instagram' THEN 14 -- 2 PM
            WHEN 'linkedin' THEN 9 -- 9 AM
            ELSE 12 -- Noon default
        END as optimal_hour,
        CASE 
            WHEN EXTRACT(DOW FROM CURRENT_DATE) IN (1,2,3) THEN 2 -- Tuesday for healthcare
            ELSE 3 -- Wednesday backup
        END as optimal_day,
        85.5 as engagement_score,
        (CURRENT_DATE + INTERVAL '1 day' + 
         CASE p_platform
            WHEN 'facebook' THEN INTERVAL '10 hours'
            WHEN 'instagram' THEN INTERVAL '14 hours'
            WHEN 'linkedin' THEN INTERVAL '9 hours'
            ELSE INTERVAL '12 hours'
         END) as recommended_time;
END;
$$ LANGUAGE plpgsql;

-- Function to update calendar analytics
CREATE OR REPLACE FUNCTION update_calendar_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily analytics when events are created/updated
    INSERT INTO calendar_performance_analytics (
        user_id, practice_id, analytics_date, total_events_created
    )
    VALUES (
        NEW.created_by, NEW.practice_id, NEW.start_datetime::DATE, 1
    )
    ON CONFLICT (user_id, practice_id, analytics_date)
    DO UPDATE SET
        total_events_created = calendar_performance_analytics.total_events_created + 1,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update analytics
CREATE TRIGGER trigger_update_calendar_analytics
    AFTER INSERT ON healthcare_calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_analytics();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_calendar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_healthcare_calendar_events_timestamp
    BEFORE UPDATE ON healthcare_calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_timestamp();

CREATE TRIGGER update_smart_idea_captures_timestamp
    BEFORE UPDATE ON smart_idea_captures
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_timestamp();

CREATE TRIGGER update_external_calendar_integrations_timestamp
    BEFORE UPDATE ON external_calendar_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_timestamp();

CREATE TRIGGER update_calendar_workflows_timestamp
    BEFORE UPDATE ON calendar_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_timestamp();

-- Grant necessary permissions
GRANT ALL ON healthcare_calendar_events TO authenticated;
GRANT ALL ON smart_idea_captures TO authenticated;
GRANT ALL ON external_calendar_integrations TO authenticated;
GRANT ALL ON calendar_event_reminders TO authenticated;
GRANT ALL ON calendar_workflows TO authenticated;
GRANT ALL ON calendar_performance_analytics TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 