-- Unified Google/Apple Quality Calendar System Database Schema
-- Complete appointment booking, automated reminders, and AHPRA compliance

-- Enhanced calendar events table
CREATE TABLE IF NOT EXISTS unified_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  event_type TEXT NOT NULL CHECK (event_type IN ('appointment', 'content', 'reminder', 'meeting', 'task', 'personal')),
  appointment_type TEXT CHECK (appointment_type IN ('consultation', 'follow_up', 'procedure', 'telehealth', 'emergency')),
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  color TEXT DEFAULT '#3b82f6',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB,
  ahpra_compliance JSONB DEFAULT '{}',
  billing JSONB,
  preparation JSONB,
  follow_up JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Calendar event attendees
CREATE TABLE IF NOT EXISTS calendar_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES unified_calendar_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'colleague', 'staff', 'guest')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'declined', 'tentative')),
  patient_id UUID, -- Reference to patient management system
  special_requirements TEXT,
  emergency_contact JSONB,
  medical_alerts TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Calendar event reminders
CREATE TABLE IF NOT EXISTS calendar_event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES unified_calendar_events(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('email', 'sms', 'push', 'phone')),
  minutes_before INTEGER NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  custom_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Business calendar settings
CREATE TABLE IF NOT EXISTS business_calendar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES business_profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  working_hours JSONB NOT NULL DEFAULT '{}',
  appointment_types JSONB NOT NULL DEFAULT '[]',
  time_zone TEXT NOT NULL DEFAULT 'Australia/Sydney',
  booking_settings JSONB NOT NULL DEFAULT '{}',
  reminder_settings JSONB NOT NULL DEFAULT '{}',
  integrations JSONB DEFAULT '{}',
  auto_scheduling_enabled BOOLEAN DEFAULT false,
  buffer_time_minutes INTEGER DEFAULT 10,
  max_advance_booking_days INTEGER DEFAULT 30,
  online_booking_enabled BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Automated reminder schedule
CREATE TABLE IF NOT EXISTS automated_reminder_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES unified_calendar_events(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('appointment_confirmation', 'appointment_reminder', 'follow_up', 'no_show_follow_up')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  message_template TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push', 'phone')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'delivered', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Patient appointment history
CREATE TABLE IF NOT EXISTS patient_appointment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_email TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  no_show_appointments INTEGER DEFAULT 0,
  last_appointment_date TIMESTAMP WITH TIME ZONE,
  next_appointment_date TIMESTAMP WITH TIME ZONE,
  preferred_appointment_type TEXT,
  communication_preferences JSONB DEFAULT '{}',
  special_requirements TEXT,
  ahpra_consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(patient_email, business_id)
);

-- Calendar conflict detection
CREATE TABLE IF NOT EXISTS calendar_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('double_booking', 'outside_hours', 'insufficient_buffer', 'resource_unavailable')),
  primary_event_id UUID NOT NULL REFERENCES unified_calendar_events(id) ON DELETE CASCADE,
  conflicting_event_id UUID REFERENCES unified_calendar_events(id) ON DELETE CASCADE,
  conflict_details JSONB NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'error', 'critical')),
  resolution_status TEXT DEFAULT 'unresolved' CHECK (resolution_status IN ('unresolved', 'resolved', 'ignored')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- External calendar integrations
CREATE TABLE IF NOT EXISTS external_calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple', 'practice_management')),
  calendar_id TEXT NOT NULL,
  calendar_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('import_only', 'export_only', 'bidirectional')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'connected' CHECK (sync_status IN ('connected', 'error', 'expired', 'disabled')),
  sync_errors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Smart calendar suggestions
CREATE TABLE IF NOT EXISTS smart_calendar_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('appointment_slot', 'content_idea', 'follow_up', 'optimization')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_date TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  ai_confidence DECIMAL(3,2) DEFAULT 0.50 CHECK (ai_confidence BETWEEN 0 AND 1),
  implementation_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'implemented', 'dismissed', 'expired')),
  implemented_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voice capture sessions
CREATE TABLE IF NOT EXISTS voice_capture_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  detected_intent TEXT CHECK (detected_intent IN ('create_appointment', 'reschedule', 'cancel', 'create_content', 'reminder', 'other')),
  extracted_entities JSONB DEFAULT '{}',
  processed_action TEXT,
  action_taken BOOLEAN DEFAULT false,
  audio_duration_seconds INTEGER,
  language_detected TEXT DEFAULT 'en-AU',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Calendar analytics and metrics
CREATE TABLE IF NOT EXISTS calendar_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_appointments INTEGER DEFAULT 0,
  confirmed_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  no_show_appointments INTEGER DEFAULT 0,
  online_bookings INTEGER DEFAULT 0,
  phone_bookings INTEGER DEFAULT 0,
  average_appointment_duration INTERVAL,
  peak_booking_hour INTEGER,
  utilization_rate DECIMAL(5,2) DEFAULT 0.00,
  revenue_generated DECIMAL(10,2) DEFAULT 0.00,
  patient_satisfaction_score DECIMAL(3,2),
  reminders_sent INTEGER DEFAULT 0,
  reminder_effectiveness_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id, metric_date)
);

-- Enable Row Level Security
ALTER TABLE unified_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_reminder_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_appointment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_calendar_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_capture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their calendar events"
ON unified_calendar_events
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can view attendees for their events"
ON calendar_event_attendees
FOR ALL
USING (
  event_id IN (
    SELECT id FROM unified_calendar_events WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their calendar settings"
ON business_calendar_settings
FOR ALL
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their reminder schedules"
ON automated_reminder_schedule
FOR ALL
USING (
  event_id IN (
    SELECT id FROM unified_calendar_events WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their patient history"
ON patient_appointment_history
FOR ALL
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their calendar conflicts"
ON calendar_conflicts
FOR ALL
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their external integrations"
ON external_calendar_integrations
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can view their smart suggestions"
ON smart_calendar_suggestions
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can view their voice sessions"
ON voice_capture_sessions
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can view their calendar analytics"
ON calendar_analytics
FOR ALL
USING (
  business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_unified_calendar_events_user_date ON unified_calendar_events(user_id, start_time);
CREATE INDEX idx_unified_calendar_events_business_date ON unified_calendar_events(business_id, start_time);
CREATE INDEX idx_unified_calendar_events_type_status ON unified_calendar_events(event_type, status);
CREATE INDEX idx_calendar_attendees_event ON calendar_event_attendees(event_id);
CREATE INDEX idx_calendar_attendees_email ON calendar_event_attendees(email);
CREATE INDEX idx_reminder_schedule_time ON automated_reminder_schedule(scheduled_for, status);
CREATE INDEX idx_patient_history_email_business ON patient_appointment_history(patient_email, business_id);
CREATE INDEX idx_calendar_conflicts_business ON calendar_conflicts(business_id, resolution_status);
CREATE INDEX idx_smart_suggestions_user_status ON smart_calendar_suggestions(user_id, status, expires_at);
CREATE INDEX idx_voice_sessions_user_date ON voice_capture_sessions(user_id, created_at);
CREATE INDEX idx_calendar_analytics_business_date ON calendar_analytics(business_id, metric_date);

-- Functions for calendar operations

-- Check for calendar conflicts
CREATE OR REPLACE FUNCTION check_calendar_conflicts(
  p_user_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_exclude_event_id UUID DEFAULT NULL
)
RETURNS TABLE(
  conflict_title TEXT,
  conflict_start TIMESTAMP WITH TIME ZONE,
  conflict_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.title,
    e.start_time,
    e.end_time
  FROM unified_calendar_events e
  WHERE e.user_id = p_user_id
    AND e.status != 'cancelled'
    AND (p_exclude_event_id IS NULL OR e.id != p_exclude_event_id)
    AND (
      (e.start_time <= p_start_time AND e.end_time > p_start_time) OR
      (e.start_time < p_end_time AND e.end_time >= p_end_time) OR
      (e.start_time >= p_start_time AND e.end_time <= p_end_time)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update calendar analytics
CREATE OR REPLACE FUNCTION update_calendar_analytics()
RETURNS void AS $$
DECLARE
  business_record RECORD;
  analytics_date DATE := CURRENT_DATE;
BEGIN
  FOR business_record IN 
    SELECT DISTINCT business_id FROM unified_calendar_events 
    WHERE DATE(start_time) = analytics_date
  LOOP
    INSERT INTO calendar_analytics (
      business_id,
      metric_date,
      total_appointments,
      confirmed_appointments,
      completed_appointments,
      cancelled_appointments,
      no_show_appointments,
      average_appointment_duration,
      utilization_rate
    )
    SELECT 
      business_record.business_id,
      analytics_date,
      COUNT(*) FILTER (WHERE event_type = 'appointment'),
      COUNT(*) FILTER (WHERE event_type = 'appointment' AND status = 'confirmed'),
      COUNT(*) FILTER (WHERE event_type = 'appointment' AND status = 'completed'),
      COUNT(*) FILTER (WHERE event_type = 'appointment' AND status = 'cancelled'),
      COUNT(*) FILTER (WHERE event_type = 'appointment' AND status = 'no_show'),
      AVG(end_time - start_time) FILTER (WHERE event_type = 'appointment'),
      ROUND(
        (COUNT(*) FILTER (WHERE event_type = 'appointment' AND status IN ('confirmed', 'completed'))::DECIMAL / 
         NULLIF(EXTRACT(HOUR FROM '17:00:00'::TIME - '09:00:00'::TIME) * 60 / 30, 0)) * 100, 2
      )
    FROM unified_calendar_events
    WHERE business_id = business_record.business_id
      AND DATE(start_time) = analytics_date
    ON CONFLICT (business_id, metric_date) 
    DO UPDATE SET
      total_appointments = EXCLUDED.total_appointments,
      confirmed_appointments = EXCLUDED.confirmed_appointments,
      completed_appointments = EXCLUDED.completed_appointments,
      cancelled_appointments = EXCLUDED.cancelled_appointments,
      no_show_appointments = EXCLUDED.no_show_appointments,
      average_appointment_duration = EXCLUDED.average_appointment_duration,
      utilization_rate = EXCLUDED.utilization_rate;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Automatic triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_unified_calendar_events_updated_at 
    BEFORE UPDATE ON unified_calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_attendees_updated_at 
    BEFORE UPDATE ON calendar_event_attendees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_calendar_settings_updated_at 
    BEFORE UPDATE ON business_calendar_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_appointment_history_updated_at 
    BEFORE UPDATE ON patient_appointment_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_calendar_integrations_updated_at 
    BEFORE UPDATE ON external_calendar_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-schedule reminders when appointment is created
CREATE OR REPLACE FUNCTION schedule_appointment_reminders()
RETURNS TRIGGER AS $$
DECLARE
  reminder_record RECORD;
  business_settings RECORD;
BEGIN
  -- Only for appointments
  IF NEW.event_type = 'appointment' AND NEW.status = 'scheduled' THEN
    -- Get business reminder settings
    SELECT reminder_settings INTO business_settings
    FROM business_calendar_settings
    WHERE business_id = NEW.business_id;
    
    -- Schedule default reminders
    FOR reminder_record IN 
      SELECT 
        (reminder->>'method')::TEXT as method,
        (reminder->>'minutesBefore')::INTEGER as minutes_before
      FROM jsonb_array_elements(
        COALESCE(business_settings.reminder_settings->'defaultReminders', '[{"method":"email","minutesBefore":1440},{"method":"sms","minutesBefore":60}]'::jsonb)
      ) AS reminder
    LOOP
      INSERT INTO automated_reminder_schedule (
        event_id,
        reminder_type,
        scheduled_for,
        message_template,
        delivery_method,
        status
      ) VALUES (
        NEW.id,
        'appointment_reminder',
        NEW.start_time - (reminder_record.minutes_before || ' minutes')::INTERVAL,
        'You have an appointment scheduled for {datetime} at {location}',
        reminder_record.method,
        'scheduled'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_schedule_appointment_reminders
  AFTER INSERT ON unified_calendar_events
  FOR EACH ROW EXECUTE FUNCTION schedule_appointment_reminders();

-- Insert default business calendar settings for existing businesses
INSERT INTO business_calendar_settings (
  business_id,
  business_name,
  working_hours,
  appointment_types,
  booking_settings,
  reminder_settings
)
SELECT 
  id,
  business_name,
  '{"monday":{"start":"09:00","end":"17:00","isWorkingDay":true},"tuesday":{"start":"09:00","end":"17:00","isWorkingDay":true},"wednesday":{"start":"09:00","end":"17:00","isWorkingDay":true},"thursday":{"start":"09:00","end":"17:00","isWorkingDay":true},"friday":{"start":"09:00","end":"17:00","isWorkingDay":true},"saturday":{"start":"09:00","end":"13:00","isWorkingDay":false},"sunday":{"start":"09:00","end":"17:00","isWorkingDay":false}}'::jsonb,
  '[{"id":"1","name":"Consultation","duration":30,"color":"#3b82f6","price":150,"isActive":true},{"id":"2","name":"Follow-up","duration":15,"color":"#10b981","price":75,"isActive":true},{"id":"3","name":"Procedure","duration":60,"color":"#f59e0b","price":300,"isActive":true},{"id":"4","name":"Telehealth","duration":20,"color":"#8b5cf6","price":120,"isActive":true}]'::jsonb,
  '{"allowOnlineBooking":true,"advanceBookingDays":30,"bufferTime":10,"autoConfirm":false,"requiresApproval":true}'::jsonb,
  '{"defaultReminders":[{"method":"email","minutesBefore":1440},{"method":"sms","minutesBefore":60}],"customMessages":{"email":"Reminder: You have an appointment tomorrow at {time}","sms":"Appointment reminder: Tomorrow at {time}. Reply CONFIRM or CANCEL"}}'::jsonb
FROM business_profiles
WHERE id NOT IN (SELECT business_id FROM business_calendar_settings);

-- Comments for documentation
COMMENT ON TABLE unified_calendar_events IS 'Unified calendar events with appointment booking and AHPRA compliance';
COMMENT ON TABLE calendar_event_attendees IS 'Event attendees with patient management integration';
COMMENT ON TABLE calendar_event_reminders IS 'Automated reminder system for appointments';
COMMENT ON TABLE business_calendar_settings IS 'Business-specific calendar configuration and rules';
COMMENT ON TABLE automated_reminder_schedule IS 'Scheduled automated reminders and notifications';
COMMENT ON TABLE patient_appointment_history IS 'Patient appointment history and preferences';
COMMENT ON TABLE calendar_conflicts IS 'Automated conflict detection and resolution tracking';
COMMENT ON TABLE external_calendar_integrations IS 'External calendar sync (Google, Outlook, Apple)';
COMMENT ON TABLE smart_calendar_suggestions IS 'AI-powered calendar optimization suggestions';
COMMENT ON TABLE voice_capture_sessions IS 'Voice-to-calendar event processing sessions';
COMMENT ON TABLE calendar_analytics IS 'Calendar performance metrics and analytics'; 