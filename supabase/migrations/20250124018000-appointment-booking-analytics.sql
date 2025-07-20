-- Appointment Booking Analytics for Healthcare Practices
-- Migration: 20250124018000-appointment-booking-analytics.sql

-- Appointment Booking Funnel Tracking Table
CREATE TABLE IF NOT EXISTS appointment_booking_funnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    session_id TEXT NOT NULL,
    patient_identifier TEXT, -- Anonymized patient identifier for privacy
    
    -- Funnel Stage Tracking
    funnel_stage TEXT NOT NULL CHECK (funnel_stage IN (
        'website_visit', 'appointment_page_view', 'booking_form_start', 
        'booking_form_complete', 'appointment_requested', 'appointment_confirmed',
        'appointment_attended', 'appointment_cancelled', 'appointment_rescheduled'
    )),
    
    -- Appointment Details
    appointment_type TEXT,
    healthcare_specialty TEXT CHECK (healthcare_specialty IN (
        'general_practice', 'mental_health', 'preventive_care', 'chronic_disease_management',
        'specialist_referral', 'emergency_care', 'telehealth', 'home_visit'
    )),
    preferred_date DATE,
    preferred_time TIME,
    urgency_level TEXT CHECK (urgency_level IN ('routine', 'urgent', 'emergency')) DEFAULT 'routine',
    
    -- Source & Channel Information
    referral_source TEXT,
    booking_channel TEXT CHECK (booking_channel IN (
        'direct_website', 'practice_management_system', 'third_party_booking',
        'phone_call', 'walk_in', 'patient_portal', 'mobile_app'
    )),
    
    -- Patient Demographics (Anonymized)
    patient_age_group TEXT CHECK (patient_age_group IN (
        '0-17', '18-30', '31-45', '46-60', '61-75', '75+'
    )),
    patient_type TEXT CHECK (patient_type IN ('new', 'returning', 'transferred')) DEFAULT 'new',
    patient_location_postcode TEXT, -- For geographic analysis
    
    -- Booking Experience Metrics
    form_completion_time INTEGER, -- Time in seconds to complete booking
    pages_visited_before_booking INTEGER DEFAULT 0,
    previous_attempts INTEGER DEFAULT 0,
    booking_abandonment_reason TEXT,
    
    -- Appointment Outcome
    appointment_outcome TEXT CHECK (appointment_outcome IN (
        'pending', 'confirmed', 'attended', 'cancelled_patient', 'cancelled_practice',
        'no_show', 'rescheduled', 'completed'
    )) DEFAULT 'pending',
    
    -- Healthcare Context
    presenting_concern TEXT, -- General category, not specific medical info
    healthcare_priority BOOLEAN DEFAULT false,
    requires_interpreter BOOLEAN DEFAULT false,
    accessibility_needs BOOLEAN DEFAULT false,
    
    -- Privacy & Compliance
    data_anonymized BOOLEAN DEFAULT true,
    consent_to_track BOOLEAN DEFAULT false,
    privacy_policy_version TEXT,
    ahpra_compliant BOOLEAN DEFAULT true,
    
    -- Timestamps
    funnel_entry_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    funnel_completed_at TIMESTAMP WITH TIME ZONE,
    appointment_scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    UNIQUE(session_id, funnel_stage, created_at)
);

-- Healthcare Appointment Types Configuration
CREATE TABLE IF NOT EXISTS healthcare_appointment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Appointment Type Details
    appointment_type_name TEXT NOT NULL,
    healthcare_specialty TEXT NOT NULL,
    appointment_category TEXT CHECK (appointment_category IN (
        'consultation', 'procedure', 'follow_up', 'screening', 'vaccination',
        'mental_health', 'chronic_care', 'emergency', 'telehealth'
    )),
    
    -- Scheduling Parameters
    default_duration INTEGER NOT NULL, -- Duration in minutes
    advance_booking_days INTEGER DEFAULT 7, -- How far in advance can be booked
    same_day_booking_allowed BOOLEAN DEFAULT false,
    online_booking_enabled BOOLEAN DEFAULT true,
    requires_referral BOOLEAN DEFAULT false,
    
    -- Pricing & Billing
    consultation_fee DECIMAL(10,2),
    bulk_billing_available BOOLEAN DEFAULT true,
    medicare_item_number TEXT,
    health_fund_coverage BOOLEAN DEFAULT false,
    
    -- Patient Requirements
    new_patient_allowed BOOLEAN DEFAULT true,
    age_restrictions TEXT, -- e.g., "18+", "paediatric only"
    preparation_required TEXT,
    fasting_required BOOLEAN DEFAULT false,
    
    -- Performance Metrics
    average_booking_lead_time DECIMAL DEFAULT 0, -- Days
    typical_wait_time DECIMAL DEFAULT 0, -- Days
    cancellation_rate DECIMAL DEFAULT 0, -- Percentage
    no_show_rate DECIMAL DEFAULT 0, -- Percentage
    patient_satisfaction_score DECIMAL DEFAULT 0, -- 1-10 scale
    
    -- Content & Descriptions
    patient_description TEXT, -- Patient-facing description
    internal_notes TEXT, -- Staff notes
    booking_instructions TEXT,
    preparation_instructions TEXT,
    
    -- Status & Availability
    is_active BOOLEAN DEFAULT true,
    online_booking_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, practice_id, appointment_type_name)
);

-- Practice Management System Integrations
CREATE TABLE IF NOT EXISTS practice_management_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- PM System Details
    pm_system_name TEXT NOT NULL CHECK (pm_system_name IN (
        'MedicalDirector', 'Best Practice', 'Genie Solutions', 'Power Diary',
        'AppointmentGuru', 'HotDoc', 'HealthEngine', 'Cliniko', 'MyHealth1st',
        'BookMyMed', 'Pracsoft', 'Zedmed', 'Other'
    )),
    pm_system_version TEXT,
    integration_type TEXT CHECK (integration_type IN (
        'api_integration', 'webhook', 'file_export', 'manual_sync', 'read_only'
    )),
    
    -- Connection Details
    connection_status TEXT CHECK (connection_status IN (
        'connected', 'disconnected', 'error', 'pending', 'expired'
    )) DEFAULT 'pending',
    api_endpoint TEXT,
    authentication_method TEXT CHECK (authentication_method IN (
        'api_key', 'oauth2', 'basic_auth', 'certificate', 'token'
    )),
    
    -- Integration Configuration
    sync_frequency TEXT CHECK (sync_frequency IN (
        'real_time', 'hourly', 'daily', 'weekly', 'manual'
    )) DEFAULT 'daily',
    data_sync_enabled BOOLEAN DEFAULT true,
    appointment_sync_enabled BOOLEAN DEFAULT true,
    patient_sync_enabled BOOLEAN DEFAULT false, -- Usually false for privacy
    
    -- Sync Metrics
    last_successful_sync TIMESTAMP WITH TIME ZONE,
    last_sync_attempt TIMESTAMP WITH TIME ZONE,
    total_appointments_synced INTEGER DEFAULT 0,
    sync_error_count INTEGER DEFAULT 0,
    last_sync_error TEXT,
    
    -- Features Enabled
    online_booking_integration BOOLEAN DEFAULT false,
    calendar_sync BOOLEAN DEFAULT false,
    patient_reminders BOOLEAN DEFAULT false,
    waitlist_management BOOLEAN DEFAULT false,
    
    -- Security & Compliance
    encryption_enabled BOOLEAN DEFAULT true,
    audit_logging_enabled BOOLEAN DEFAULT true,
    patient_consent_verified BOOLEAN DEFAULT false,
    ahpra_compliance_verified BOOLEAN DEFAULT false,
    
    -- Integration Health
    health_score DECIMAL DEFAULT 100, -- 0-100 score based on reliability
    uptime_percentage DECIMAL DEFAULT 0,
    average_response_time INTEGER DEFAULT 0, -- milliseconds
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, practice_id, pm_system_name)
);

-- Appointment Booking Performance Metrics
CREATE TABLE IF NOT EXISTS appointment_booking_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Date Tracking
    metric_date DATE NOT NULL,
    week_ending DATE,
    month_year TEXT, -- Format: "2024-01"
    
    -- Booking Volume Metrics
    total_booking_inquiries INTEGER DEFAULT 0,
    online_bookings INTEGER DEFAULT 0,
    phone_bookings INTEGER DEFAULT 0,
    walk_in_bookings INTEGER DEFAULT 0,
    pm_system_bookings INTEGER DEFAULT 0,
    
    -- Conversion Funnel Metrics
    website_visitors INTEGER DEFAULT 0,
    appointment_page_views INTEGER DEFAULT 0,
    booking_form_starts INTEGER DEFAULT 0,
    booking_form_completions INTEGER DEFAULT 0,
    booking_requests_submitted INTEGER DEFAULT 0,
    bookings_confirmed INTEGER DEFAULT 0,
    appointments_attended INTEGER DEFAULT 0,
    
    -- Calculated Conversion Rates
    page_view_to_form_rate DECIMAL DEFAULT 0,
    form_start_to_completion_rate DECIMAL DEFAULT 0,
    booking_request_to_confirmation_rate DECIMAL DEFAULT 0,
    booking_to_attendance_rate DECIMAL DEFAULT 0,
    overall_conversion_rate DECIMAL DEFAULT 0,
    
    -- Patient Demographics
    new_patient_bookings INTEGER DEFAULT 0,
    returning_patient_bookings INTEGER DEFAULT 0,
    age_group_0_17 INTEGER DEFAULT 0,
    age_group_18_30 INTEGER DEFAULT 0,
    age_group_31_45 INTEGER DEFAULT 0,
    age_group_46_60 INTEGER DEFAULT 0,
    age_group_61_75 INTEGER DEFAULT 0,
    age_group_75_plus INTEGER DEFAULT 0,
    
    -- Appointment Categories
    general_consultation_bookings INTEGER DEFAULT 0,
    mental_health_bookings INTEGER DEFAULT 0,
    preventive_care_bookings INTEGER DEFAULT 0,
    chronic_disease_bookings INTEGER DEFAULT 0,
    specialist_referral_bookings INTEGER DEFAULT 0,
    emergency_bookings INTEGER DEFAULT 0,
    telehealth_bookings INTEGER DEFAULT 0,
    
    -- Performance Quality Metrics
    average_booking_lead_time DECIMAL DEFAULT 0, -- Days in advance
    average_form_completion_time DECIMAL DEFAULT 0, -- Minutes
    booking_abandonment_rate DECIMAL DEFAULT 0,
    same_day_booking_percentage DECIMAL DEFAULT 0,
    cancellation_rate DECIMAL DEFAULT 0,
    no_show_rate DECIMAL DEFAULT 0,
    rescheduling_rate DECIMAL DEFAULT 0,
    
    -- Revenue Impact
    total_booking_value DECIMAL DEFAULT 0,
    average_booking_value DECIMAL DEFAULT 0,
    bulk_billing_percentage DECIMAL DEFAULT 0,
    private_billing_percentage DECIMAL DEFAULT 0,
    
    -- Source Attribution
    direct_website_bookings INTEGER DEFAULT 0,
    google_search_bookings INTEGER DEFAULT 0,
    social_media_bookings INTEGER DEFAULT 0,
    referral_bookings INTEGER DEFAULT 0,
    hotdoc_bookings INTEGER DEFAULT 0,
    healthengine_bookings INTEGER DEFAULT 0,
    
    -- System Performance
    pm_system_sync_success_rate DECIMAL DEFAULT 0,
    average_booking_system_response_time INTEGER DEFAULT 0, -- milliseconds
    booking_system_downtime_minutes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, practice_id, metric_date)
);

-- Appointment Booking Events (Real-time tracking)
CREATE TABLE IF NOT EXISTS appointment_booking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    session_id TEXT,
    
    -- Event Details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'page_view', 'form_start', 'form_field_complete', 'form_submit',
        'booking_confirm', 'booking_cancel', 'appointment_reschedule',
        'payment_process', 'confirmation_email_sent', 'reminder_sent'
    )),
    event_category TEXT NOT NULL CHECK (event_category IN (
        'acquisition', 'engagement', 'conversion', 'retention', 'support'
    )),
    
    -- Event Context
    page_path TEXT,
    form_field TEXT,
    appointment_type TEXT,
    healthcare_specialty TEXT,
    
    -- User Context (Anonymized)
    user_agent TEXT,
    referrer_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Event Metadata
    event_value DECIMAL DEFAULT 0,
    event_properties JSONB DEFAULT '{}',
    
    -- Performance Metrics
    page_load_time INTEGER, -- milliseconds
    time_on_page INTEGER, -- seconds
    
    -- Privacy Compliance
    anonymized_data BOOLEAN DEFAULT true,
    consent_given BOOLEAN DEFAULT false,
    gdpr_compliant BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_appointment_booking_funnel_user_date 
    ON appointment_booking_funnel(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_booking_funnel_stage 
    ON appointment_booking_funnel(funnel_stage, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_booking_funnel_session 
    ON appointment_booking_funnel(session_id, funnel_stage);

CREATE INDEX IF NOT EXISTS idx_healthcare_appointment_types_user_active 
    ON healthcare_appointment_types(user_id, practice_id, is_active);

CREATE INDEX IF NOT EXISTS idx_practice_management_integrations_user_status 
    ON practice_management_integrations(user_id, connection_status);

CREATE INDEX IF NOT EXISTS idx_appointment_booking_metrics_user_date 
    ON appointment_booking_metrics(user_id, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_booking_events_user_date 
    ON appointment_booking_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_booking_events_type 
    ON appointment_booking_events(event_type, event_category, created_at DESC);

-- Row Level Security (RLS) Policies

-- Appointment Booking Funnel
ALTER TABLE appointment_booking_funnel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own appointment funnel data" ON appointment_booking_funnel
    FOR ALL USING (auth.uid() = user_id);

-- Healthcare Appointment Types
ALTER TABLE healthcare_appointment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own appointment types" ON healthcare_appointment_types
    FOR ALL USING (auth.uid() = user_id);

-- Practice Management Integrations
ALTER TABLE practice_management_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own PM integrations" ON practice_management_integrations
    FOR ALL USING (auth.uid() = user_id);

-- Appointment Booking Metrics
ALTER TABLE appointment_booking_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own booking metrics" ON appointment_booking_metrics
    FOR ALL USING (auth.uid() = user_id);

-- Appointment Booking Events
ALTER TABLE appointment_booking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own booking events" ON appointment_booking_events
    FOR ALL USING (auth.uid() = user_id);

-- Functions for Appointment Analytics

-- Function to calculate booking conversion rate
CREATE OR REPLACE FUNCTION calculate_booking_conversion_rate(
    bookings_confirmed INTEGER,
    total_inquiries INTEGER
)
RETURNS DECIMAL AS $$
BEGIN
    IF total_inquiries = 0 THEN
        RETURN 0;
    END IF;
    RETURN (bookings_confirmed::DECIMAL / total_inquiries::DECIMAL) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to determine peak booking hours
CREATE OR REPLACE FUNCTION get_peak_booking_hours(
    p_user_id UUID,
    p_practice_id TEXT,
    p_date_from DATE,
    p_date_to DATE
)
RETURNS TABLE(hour_of_day INTEGER, booking_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM created_at)::INTEGER as hour_of_day,
        COUNT(*) as booking_count
    FROM appointment_booking_funnel
    WHERE user_id = p_user_id
        AND practice_id = p_practice_id
        AND funnel_stage = 'appointment_confirmed'
        AND created_at::DATE BETWEEN p_date_from AND p_date_to
    GROUP BY EXTRACT(HOUR FROM created_at)
    ORDER BY booking_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze appointment booking funnel drop-off
CREATE OR REPLACE FUNCTION analyze_booking_funnel_dropoff(
    p_user_id UUID,
    p_practice_id TEXT,
    p_date_from DATE,
    p_date_to DATE
)
RETURNS TABLE(
    stage TEXT,
    count BIGINT,
    conversion_rate DECIMAL,
    drop_off_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH funnel_stages AS (
        SELECT 
            funnel_stage,
            COUNT(*) as stage_count
        FROM appointment_booking_funnel
        WHERE user_id = p_user_id
            AND practice_id = p_practice_id
            AND created_at::DATE BETWEEN p_date_from AND p_date_to
        GROUP BY funnel_stage
        ORDER BY 
            CASE funnel_stage
                WHEN 'website_visit' THEN 1
                WHEN 'appointment_page_view' THEN 2
                WHEN 'booking_form_start' THEN 3
                WHEN 'booking_form_complete' THEN 4
                WHEN 'appointment_requested' THEN 5
                WHEN 'appointment_confirmed' THEN 6
            END
    ),
    funnel_with_conversion AS (
        SELECT 
            funnel_stage,
            stage_count,
            LAG(stage_count) OVER (ORDER BY 
                CASE funnel_stage
                    WHEN 'website_visit' THEN 1
                    WHEN 'appointment_page_view' THEN 2
                    WHEN 'booking_form_start' THEN 3
                    WHEN 'booking_form_complete' THEN 4
                    WHEN 'appointment_requested' THEN 5
                    WHEN 'appointment_confirmed' THEN 6
                END
            ) as previous_stage_count
        FROM funnel_stages
    )
    SELECT 
        funnel_stage::TEXT,
        stage_count,
        CASE 
            WHEN previous_stage_count IS NULL OR previous_stage_count = 0 THEN 100.0
            ELSE (stage_count::DECIMAL / previous_stage_count::DECIMAL) * 100
        END as conversion_rate,
        CASE 
            WHEN previous_stage_count IS NULL OR previous_stage_count = 0 THEN 0.0
            ELSE ((previous_stage_count - stage_count)::DECIMAL / previous_stage_count::DECIMAL) * 100
        END as drop_off_rate
    FROM funnel_with_conversion;
END;
$$ LANGUAGE plpgsql;

-- Function to update appointment booking metrics
CREATE OR REPLACE FUNCTION update_appointment_booking_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the daily metrics when new appointment booking events occur
    INSERT INTO appointment_booking_metrics (
        user_id, practice_id, metric_date, total_booking_inquiries
    )
    VALUES (
        NEW.user_id, NEW.practice_id, NEW.created_at::DATE, 1
    )
    ON CONFLICT (user_id, practice_id, metric_date)
    DO UPDATE SET
        total_booking_inquiries = appointment_booking_metrics.total_booking_inquiries + 1,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update metrics
CREATE TRIGGER trigger_update_appointment_booking_metrics
    AFTER INSERT ON appointment_booking_funnel
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_booking_metrics();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_appointment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_appointment_booking_funnel_timestamp
    BEFORE UPDATE ON appointment_booking_funnel
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_timestamp();

CREATE TRIGGER update_healthcare_appointment_types_timestamp
    BEFORE UPDATE ON healthcare_appointment_types
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_timestamp();

CREATE TRIGGER update_practice_management_integrations_timestamp
    BEFORE UPDATE ON practice_management_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_timestamp();

CREATE TRIGGER update_appointment_booking_metrics_timestamp
    BEFORE UPDATE ON appointment_booking_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_timestamp();

-- Grant necessary permissions
GRANT ALL ON appointment_booking_funnel TO authenticated;
GRANT ALL ON healthcare_appointment_types TO authenticated;
GRANT ALL ON practice_management_integrations TO authenticated;
GRANT ALL ON appointment_booking_metrics TO authenticated;
GRANT ALL ON appointment_booking_events TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 