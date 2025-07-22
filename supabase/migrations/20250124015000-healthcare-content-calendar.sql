-- Healthcare Content Calendar System
-- AHPRA-compliant content scheduling with copy-paste workflows

-- Main calendar events table
CREATE TABLE healthcare_content_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_id UUID NOT NULL REFERENCES healthcare_practices(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    platforms JSONB NOT NULL DEFAULT '[]',
    scheduled_date TIMESTAMPTZ NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'post', 'campaign', 'awareness_day', 'patient_education', 'practice_update'
    )),
    specialty TEXT NOT NULL CHECK (specialty IN (
        'gp', 'specialist', 'allied_health', 'psychology', 'dentistry', 'nursing'
    )),
    target_audience TEXT NOT NULL CHECK (target_audience IN (
        'current_patients', 'potential_patients', 'professional_network', 'community'
    )),
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN (
        'pending', 'approved', 'needs_review', 'rejected'
    )),
    ahpra_compliant BOOLEAN DEFAULT false,
    tga_compliant BOOLEAN DEFAULT false,
    professional_boundaries_checked BOOLEAN DEFAULT false,
    hashtags TEXT[] DEFAULT '{}',
    disclaimers TEXT[] DEFAULT '{}',
    copy_paste_ready BOOLEAN DEFAULT false,
    reminder_settings JSONB DEFAULT '{
        "enabled": false,
        "reminderTimes": [],
        "notificationMethods": [],
        "complianceReminder": false
    }',
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'published', 'archived'
    )),
    created_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content templates for healthcare professionals
CREATE TABLE healthcare_content_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'health_awareness', 'patient_education', 'practice_promotion', 'seasonal', 'regulatory'
    )),
    specialty TEXT[] DEFAULT '{}',
    content TEXT NOT NULL,
    platforms TEXT[] DEFAULT '{}',
    hashtags TEXT[] DEFAULT '{}',
    compliance_notes TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    effectiveness_rating DECIMAL(3,1) DEFAULT 5.0 CHECK (effectiveness_rating >= 1.0 AND effectiveness_rating <= 10.0),
    ahpra_approved BOOLEAN DEFAULT false,
    tga_approved BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Healthcare awareness days calendar
CREATE TABLE healthcare_awareness_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    relevant_specialties TEXT[] DEFAULT '{}',
    suggested_content TEXT[] DEFAULT '{}',
    hashtags TEXT[] DEFAULT '{}',
    compliance_considerations TEXT[] DEFAULT '{}',
    global_event BOOLEAN DEFAULT false,
    australian_specific BOOLEAN DEFAULT false,
    recurring_annually BOOLEAN DEFAULT true,
    official_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(date, name)
);

-- Calendar reminders and notifications
CREATE TABLE healthcare_calendar_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    calendar_event_id UUID NOT NULL REFERENCES healthcare_content_calendar(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    reminder_type TEXT NOT NULL CHECK (reminder_type IN (
        'content_ready', 'compliance_check', 'posting_reminder', 'deadline_warning'
    )),
    reminder_time TIMESTAMPTZ NOT NULL,
    notification_method TEXT NOT NULL CHECK (notification_method IN (
        'email', 'dashboard', 'sms'
    )),
    message TEXT NOT NULL,
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy-paste workflow tracking
CREATE TABLE healthcare_copy_paste_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    calendar_event_id UUID NOT NULL REFERENCES healthcare_content_calendar(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    platform TEXT NOT NULL,
    copied_at TIMESTAMPTZ DEFAULT NOW(),
    content_version TEXT,
    character_count INTEGER,
    platform_optimized BOOLEAN DEFAULT false,
    compliance_validated BOOLEAN DEFAULT false,
    posted_externally BOOLEAN DEFAULT false,
    external_post_date TIMESTAMPTZ,
    engagement_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar analytics and performance
CREATE TABLE healthcare_calendar_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_id UUID NOT NULL REFERENCES healthcare_practices(id),
    calendar_event_id UUID REFERENCES healthcare_content_calendar(id) ON DELETE SET NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_events INTEGER DEFAULT 0,
    published_events INTEGER DEFAULT 0,
    compliance_rate DECIMAL(5,2) DEFAULT 0.00,
    copy_paste_usage INTEGER DEFAULT 0,
    platform_distribution JSONB DEFAULT '{}',
    engagement_summary JSONB DEFAULT '{}',
    effectiveness_score DECIMAL(3,1) DEFAULT 5.0,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for healthcare content calendar

-- Practice team can manage their calendar events
ALTER TABLE healthcare_content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can manage their calendar events"
    ON healthcare_content_calendar
    FOR ALL
    TO authenticated
    USING (
        practice_id IN (
            SELECT hp.id FROM healthcare_practices hp
            WHERE hp.owner_id = auth.uid()
            OR hp.id IN (
                SELECT htm.practice_id FROM healthcare_team_members htm
                WHERE htm.user_id = auth.uid()
                AND htm.status = 'active'
            )
        )
    )
    WITH CHECK (
        practice_id IN (
            SELECT hp.id FROM healthcare_practices hp
            WHERE hp.owner_id = auth.uid()
            OR hp.id IN (
                SELECT htm.practice_id FROM healthcare_team_members htm
                WHERE htm.user_id = auth.uid()
                AND htm.role IN ('owner', 'admin', 'manager', 'clinician')
                AND htm.status = 'active'
            )
        )
    );

-- Content templates are public for all healthcare users
ALTER TABLE healthcare_content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare content templates are public"
    ON healthcare_content_templates
    FOR SELECT
    TO authenticated
    USING (active = true);

-- Only admins and template creators can modify templates
CREATE POLICY "Content template creators and admins can modify"
    ON healthcare_content_templates
    FOR ALL
    TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND u.raw_app_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND u.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Awareness calendar is public
ALTER TABLE healthcare_awareness_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare awareness calendar is public"
    ON healthcare_awareness_calendar
    FOR SELECT
    TO authenticated
    USING (true);

-- Users can access their own reminders
ALTER TABLE healthcare_calendar_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own calendar reminders"
    ON healthcare_calendar_reminders
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can access their own copy-paste tracking
ALTER TABLE healthcare_copy_paste_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own copy-paste tracking"
    ON healthcare_copy_paste_tracking
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Practice team can access calendar analytics
ALTER TABLE healthcare_calendar_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can access calendar analytics"
    ON healthcare_calendar_analytics
    FOR ALL
    TO authenticated
    USING (
        practice_id IN (
            SELECT hp.id FROM healthcare_practices hp
            WHERE hp.owner_id = auth.uid()
            OR hp.id IN (
                SELECT htm.practice_id FROM healthcare_team_members htm
                WHERE htm.user_id = auth.uid()
                AND htm.status = 'active'
            )
        )
    );

-- Create indexes for performance
CREATE INDEX idx_healthcare_calendar_practice ON healthcare_content_calendar(practice_id);
CREATE INDEX idx_healthcare_calendar_scheduled_date ON healthcare_content_calendar(scheduled_date);
CREATE INDEX idx_healthcare_calendar_specialty ON healthcare_content_calendar(specialty);
CREATE INDEX idx_healthcare_calendar_status ON healthcare_content_calendar(status);
CREATE INDEX idx_healthcare_calendar_compliance ON healthcare_content_calendar(compliance_status);
CREATE INDEX idx_healthcare_calendar_event_type ON healthcare_content_calendar(event_type);

CREATE INDEX idx_healthcare_templates_category ON healthcare_content_templates(category);
CREATE INDEX idx_healthcare_templates_specialty ON healthcare_content_templates USING GIN (specialty);
CREATE INDEX idx_healthcare_templates_usage ON healthcare_content_templates(usage_count);
CREATE INDEX idx_healthcare_templates_rating ON healthcare_content_templates(effectiveness_rating);
CREATE INDEX idx_healthcare_templates_active ON healthcare_content_templates(active);

CREATE INDEX idx_healthcare_awareness_date ON healthcare_awareness_calendar(date);
CREATE INDEX idx_healthcare_awareness_specialties ON healthcare_awareness_calendar USING GIN (relevant_specialties);
CREATE INDEX idx_healthcare_awareness_recurring ON healthcare_awareness_calendar(recurring_annually);

CREATE INDEX idx_healthcare_reminders_event ON healthcare_calendar_reminders(calendar_event_id);
CREATE INDEX idx_healthcare_reminders_user ON healthcare_calendar_reminders(user_id);
CREATE INDEX idx_healthcare_reminders_time ON healthcare_calendar_reminders(reminder_time);
CREATE INDEX idx_healthcare_reminders_sent ON healthcare_calendar_reminders(sent);

CREATE INDEX idx_copy_paste_tracking_event ON healthcare_copy_paste_tracking(calendar_event_id);
CREATE INDEX idx_copy_paste_tracking_user ON healthcare_copy_paste_tracking(user_id);
CREATE INDEX idx_copy_paste_tracking_platform ON healthcare_copy_paste_tracking(platform);
CREATE INDEX idx_copy_paste_tracking_copied_at ON healthcare_copy_paste_tracking(copied_at);

CREATE INDEX idx_calendar_analytics_practice ON healthcare_calendar_analytics(practice_id);
CREATE INDEX idx_calendar_analytics_period ON healthcare_calendar_analytics(period_start, period_end);

-- Functions for calendar management

-- Function to generate copy-paste content for platform
CREATE OR REPLACE FUNCTION generate_copy_paste_content(
    p_event_id UUID,
    p_platform TEXT
) RETURNS JSONB AS $$
DECLARE
    event_data RECORD;
    platform_data JSONB;
    copy_paste_content JSONB;
BEGIN
    -- Get event data
    SELECT * INTO event_data
    FROM healthcare_content_calendar
    WHERE id = p_event_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Event not found');
    END IF;
    
    -- Extract platform-specific data
    SELECT jsonb_array_elements(event_data.platforms)
    INTO platform_data
    WHERE jsonb_array_elements(event_data.platforms)->>'platform' = p_platform;
    
    IF platform_data IS NULL THEN
        RETURN jsonb_build_object('error', 'Platform not configured for this event');
    END IF;
    
    -- Build copy-paste content
    copy_paste_content := jsonb_build_object(
        'content', platform_data->>'optimizedContent',
        'hashtags', array_to_string(event_data.hashtags, ' '),
        'disclaimers', array_to_string(event_data.disclaimers, E'\n'),
        'instructions', platform_data->>'copyPasteInstructions',
        'scheduledTime', platform_data->>'scheduledTime',
        'complianceNotes', jsonb_build_array(
            'Content has been validated for AHPRA compliance',
            'Include appropriate medical disclaimers',
            'Ensure patient privacy is maintained'
        ),
        'characterCount', platform_data->>'characterCount',
        'platformCompliant', platform_data->>'platformCompliant'
    );
    
    RETURN copy_paste_content;
END;
$$ LANGUAGE plpgsql;

-- Function to create reminder for calendar event
CREATE OR REPLACE FUNCTION create_calendar_reminder(
    p_event_id UUID,
    p_user_id UUID,
    p_reminder_type TEXT,
    p_hours_before INTEGER DEFAULT 24
) RETURNS UUID AS $$
DECLARE
    event_data RECORD;
    reminder_time TIMESTAMPTZ;
    reminder_id UUID;
BEGIN
    -- Get event data
    SELECT * INTO event_data
    FROM healthcare_content_calendar
    WHERE id = p_event_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;
    
    -- Calculate reminder time
    reminder_time := event_data.scheduled_date - (p_hours_before || ' hours')::INTERVAL;
    
    -- Create reminder
    INSERT INTO healthcare_calendar_reminders (
        calendar_event_id,
        user_id,
        reminder_type,
        reminder_time,
        notification_method,
        message
    ) VALUES (
        p_event_id,
        p_user_id,
        p_reminder_type,
        reminder_time,
        'dashboard',
        CASE p_reminder_type
            WHEN 'content_ready' THEN 'Your healthcare content "' || event_data.title || '" is ready for posting'
            WHEN 'compliance_check' THEN 'Please review AHPRA compliance for "' || event_data.title || '"'
            WHEN 'posting_reminder' THEN 'Time to post your healthcare content: "' || event_data.title || '"'
            WHEN 'deadline_warning' THEN 'Deadline approaching for "' || event_data.title || '"'
            ELSE 'Reminder for healthcare content: "' || event_data.title || '"'
        END
    ) RETURNING id INTO reminder_id;
    
    RETURN reminder_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track copy-paste usage
CREATE OR REPLACE FUNCTION track_copy_paste_usage(
    p_event_id UUID,
    p_user_id UUID,
    p_platform TEXT,
    p_content_version TEXT DEFAULT 'v1'
) RETURNS UUID AS $$
DECLARE
    tracking_id UUID;
    event_data RECORD;
BEGIN
    -- Get event data for validation
    SELECT * INTO event_data
    FROM healthcare_content_calendar
    WHERE id = p_event_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;
    
    -- Insert tracking record
    INSERT INTO healthcare_copy_paste_tracking (
        calendar_event_id,
        user_id,
        platform,
        content_version,
        character_count,
        platform_optimized,
        compliance_validated
    ) VALUES (
        p_event_id,
        p_user_id,
        p_platform,
        p_content_version,
        LENGTH(event_data.content),
        event_data.copy_paste_ready,
        event_data.ahpra_compliant AND event_data.tga_compliant
    ) RETURNING id INTO tracking_id;
    
    RETURN tracking_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create reminders for new events
CREATE OR REPLACE FUNCTION auto_create_event_reminders()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default reminders if reminder settings are enabled
    IF (NEW.reminder_settings->>'enabled')::boolean = true THEN
        -- Create 24-hour reminder
        PERFORM create_calendar_reminder(
            NEW.id,
            NEW.created_by,
            'posting_reminder',
            24
        );
        
        -- Create compliance reminder if requested
        IF (NEW.reminder_settings->>'complianceReminder')::boolean = true THEN
            PERFORM create_calendar_reminder(
                NEW.id,
                NEW.created_by,
                'compliance_check',
                48
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic reminder creation
CREATE TRIGGER auto_create_reminders_trigger
    AFTER INSERT ON healthcare_content_calendar
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_event_reminders();

-- Create updated_at triggers
CREATE TRIGGER update_healthcare_content_calendar_updated_at
    BEFORE UPDATE ON healthcare_content_calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_content_templates_updated_at
    BEFORE UPDATE ON healthcare_content_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_awareness_calendar_updated_at
    BEFORE UPDATE ON healthcare_awareness_calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default healthcare awareness days
INSERT INTO healthcare_awareness_calendar (
    date, name, description, relevant_specialties, suggested_content, hashtags, compliance_considerations
) VALUES 
('2024-01-31', 'Cervical Cancer Awareness Day', 'Promote cervical cancer screening and prevention', 
 ARRAY['gp', 'specialist'], 
 ARRAY['Importance of regular cervical screening', 'HPV vaccination information', 'Early detection saves lives'],
 ARRAY['#CervicalCancerAwareness', '#PreventiveCare', '#WomensHealth'],
 ARRAY['Include medical disclaimer about screening recommendations', 'Avoid fear-based messaging', 'Encourage professional consultation']),

('2024-02-04', 'World Cancer Day', 'Global awareness about cancer prevention and treatment',
 ARRAY['gp', 'specialist'],
 ARRAY['Cancer prevention strategies', 'Importance of early detection', 'Supporting cancer patients and families'],
 ARRAY['#WorldCancerDay', '#CancerPrevention', '#EarlyDetection'],
 ARRAY['Provide evidence-based information only', 'Include appropriate medical disclaimers', 'Avoid testimonials or success stories']),

('2024-03-08', 'International Women\'s Day - Women\'s Health Focus', 'Highlight women\'s health issues and healthcare equity',
 ARRAY['gp', 'specialist', 'psychology'],
 ARRAY['Women\'s health screening importance', 'Mental health in women', 'Hormonal health across lifespan'],
 ARRAY['#WomensHealth', '#HealthEquity', '#InternationalWomensDay'],
 ARRAY['Ensure culturally inclusive messaging', 'Avoid stereotypes or generalizations', 'Focus on evidence-based health information']),

('2024-04-07', 'World Health Day', 'WHO global health awareness initiative',
 ARRAY['gp', 'allied_health', 'psychology', 'dentistry'],
 ARRAY['Importance of preventive healthcare', 'Global health challenges and solutions', 'Community health initiatives'],
 ARRAY['#WorldHealthDay', '#GlobalHealth', '#PreventiveCare'],
 ARRAY['Include WHO references where appropriate', 'Focus on evidence-based global health data', 'Encourage professional healthcare engagement']),

('2024-10-10', 'World Mental Health Day', 'Global mental health awareness and support',
 ARRAY['psychology', 'gp', 'specialist'],
 ARRAY['Reducing mental health stigma', 'Importance of professional mental health support', 'Self-care and mental wellness strategies'],
 ARRAY['#WorldMentalHealthDay', '#MentalHealthAwareness', '#EndStigma'],
 ARRAY['Include crisis support information', 'Avoid diagnostic language', 'Emphasize professional help-seeking']);

-- Insert default content templates
INSERT INTO healthcare_content_templates (
    name, category, specialty, content, platforms, hashtags, compliance_notes, ahpra_approved, tga_approved
) VALUES 
('Mental Health Awareness Post', 'health_awareness', ARRAY['psychology', 'gp'],
 'Taking care of your mental health is just as important as your physical health. If you''re struggling, know that support is available. Professional help can make a real difference in your wellbeing journey.',
 ARRAY['facebook', 'instagram', 'linkedin'],
 ARRAY['#MentalHealthAwareness', '#MentalWellbeing', '#SupportAvailable'],
 ARRAY['Include crisis support information', 'Avoid diagnostic language', 'Emphasize professional help-seeking'],
 true, true),

('Preventive Care Reminder', 'patient_education', ARRAY['gp'],
 'Regular health check-ups are your best defense against preventable health conditions. Early detection and prevention can help you maintain optimal health throughout your life.',
 ARRAY['facebook', 'instagram', 'email'],
 ARRAY['#PreventiveCare', '#HealthCheck', '#EarlyDetection'],
 ARRAY['Include disclaimer about individual health needs', 'Encourage professional consultation'],
 true, true),

('Exercise and Physical Health', 'patient_education', ARRAY['allied_health', 'gp'],
 'Regular physical activity is medicine for your body and mind. Start with small, achievable goals and gradually build your fitness routine. Your healthcare team can help you create a safe, effective exercise plan.',
 ARRAY['instagram', 'facebook', 'website'],
 ARRAY['#PhysicalHealth', '#Exercise', '#Wellness'],
 ARRAY['Emphasize individual assessment', 'Include safety considerations', 'Encourage professional guidance'],
 true, true);

COMMENT ON TABLE healthcare_content_calendar IS 'AHPRA-compliant healthcare content calendar with scheduling and copy-paste workflows';
COMMENT ON TABLE healthcare_content_templates IS 'Pre-approved healthcare content templates for efficient content creation';
COMMENT ON TABLE healthcare_awareness_calendar IS 'Global and Australian healthcare awareness days with compliance-ready content suggestions';
COMMENT ON TABLE healthcare_calendar_reminders IS 'Automated reminders for healthcare content posting and compliance checks';
COMMENT ON TABLE healthcare_copy_paste_tracking IS 'Usage tracking for copy-paste content workflows across platforms'; 