-- Bulk Patient Education Content Generation System
-- Campaign-based bulk content creation with AHPRA compliance and patient education focus

-- Health awareness campaigns
CREATE TABLE health_awareness_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_id UUID NOT NULL REFERENCES healthcare_practices(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    health_topic TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_content INTEGER DEFAULT 0,
    generated_content INTEGER DEFAULT 0,
    platforms TEXT[] DEFAULT '{}',
    target_demographics JSONB DEFAULT '[]',
    content_types JSONB DEFAULT '[]',
    campaign_duration INTEGER DEFAULT 30,
    content_frequency TEXT DEFAULT 'weekly' CHECK (content_frequency IN (
        'daily', 'every_2_days', 'weekly', 'bi_weekly'
    )),
    awareness_focus TEXT DEFAULT 'education' CHECK (awareness_focus IN (
        'prevention', 'education', 'early_detection', 'management', 'support'
    )),
    cultural_considerations TEXT[] DEFAULT '{}',
    compliance_level TEXT DEFAULT 'standard' CHECK (compliance_level IN (
        'standard', 'strict', 'pediatric', 'elderly'
    )),
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN (
        'pending', 'approved', 'needs_review', 'rejected'
    )),
    campaign_metrics JSONB DEFAULT '{
        "contentGenerated": 0,
        "complianceRate": 0,
        "averageReadabilityScore": 0,
        "averageEducationalValue": 0,
        "demographicCoverage": 0,
        "platformOptimization": 0
    }',
    status TEXT DEFAULT 'planning' CHECK (status IN (
        'planning', 'generating', 'review', 'active', 'completed', 'paused'
    )),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bulk generated patient education content
CREATE TABLE bulk_patient_education_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES health_awareness_campaigns(id) ON DELETE CASCADE,
    content_sequence INTEGER NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN (
        'facebook', 'instagram', 'linkedin', 'twitter', 'website', 'email', 'print'
    )),
    demographic JSONB NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'educational_post', 'myth_buster', 'prevention_tips', 'awareness_facts', 
        'support_resources', 'lifestyle_guide'
    )),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    disclaimers TEXT[] DEFAULT '{}',
    call_to_action TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ,
    ahpra_compliant BOOLEAN DEFAULT false,
    tga_compliant BOOLEAN DEFAULT false,
    culturally_sensitive BOOLEAN DEFAULT false,
    readability_score INTEGER CHECK (readability_score >= 1 AND readability_score <= 10),
    engagement_prediction INTEGER CHECK (engagement_prediction >= 1 AND engagement_prediction <= 10),
    compliance_notes TEXT[] DEFAULT '{}',
    educational_value INTEGER CHECK (educational_value >= 1 AND educational_value <= 10),
    patient_safety_checked BOOLEAN DEFAULT false,
    review_status TEXT DEFAULT 'pending' CHECK (review_status IN (
        'pending', 'approved', 'needs_revision', 'rejected'
    )),
    used_in_calendar BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    effectiveness_rating DECIMAL(3,1) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(campaign_id, content_sequence)
);

-- Health topic templates for bulk generation
CREATE TABLE health_topic_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'chronic_disease', 'mental_health', 'preventive_care', 'women_health', 
        'men_health', 'child_health', 'elderly_care'
    )),
    key_messages TEXT[] DEFAULT '{}',
    common_myths TEXT[] DEFAULT '{}',
    prevention_strategies TEXT[] DEFAULT '{}',
    support_resources TEXT[] DEFAULT '{}',
    compliance_considerations TEXT[] DEFAULT '{}',
    cultural_sensitivities TEXT[] DEFAULT '{}',
    evidence_base TEXT[] DEFAULT '{}',
    relevant_specialties TEXT[] DEFAULT '{}',
    target_demographics TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    effectiveness_rating DECIMAL(3,1) DEFAULT 5.0,
    ahpra_approved BOOLEAN DEFAULT false,
    tga_approved BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bulk content generation jobs tracking
CREATE TABLE bulk_generation_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES health_awareness_campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    job_status TEXT DEFAULT 'queued' CHECK (job_status IN (
        'queued', 'processing', 'completed', 'failed', 'cancelled'
    )),
    total_content_requested INTEGER NOT NULL,
    content_generated INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    generation_parameters JSONB NOT NULL,
    error_log TEXT[] DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_completion TIMESTAMPTZ,
    processing_time_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign performance analytics
CREATE TABLE campaign_performance_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES health_awareness_campaigns(id) ON DELETE CASCADE,
    practice_id UUID NOT NULL REFERENCES healthcare_practices(id),
    analytics_period_start TIMESTAMPTZ NOT NULL,
    analytics_period_end TIMESTAMPTZ NOT NULL,
    content_performance JSONB DEFAULT '{}',
    platform_metrics JSONB DEFAULT '{}',
    demographic_engagement JSONB DEFAULT '{}',
    compliance_metrics JSONB DEFAULT '{}',
    educational_effectiveness JSONB DEFAULT '{}',
    roi_indicators JSONB DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content usage tracking across platforms
CREATE TABLE bulk_content_usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL REFERENCES bulk_patient_education_content(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES health_awareness_campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    platform TEXT NOT NULL,
    usage_type TEXT NOT NULL CHECK (usage_type IN (
        'copied', 'scheduled', 'posted', 'shared', 'modified'
    )),
    usage_date TIMESTAMPTZ DEFAULT NOW(),
    external_engagement_metrics JSONB DEFAULT '{}',
    modifications_made TEXT,
    effectiveness_feedback INTEGER CHECK (effectiveness_feedback >= 1 AND effectiveness_feedback <= 10),
    patient_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for bulk content generation

-- Practice team can manage their campaigns
ALTER TABLE health_awareness_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can manage their campaigns"
    ON health_awareness_campaigns
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

-- Practice team can access campaign content
ALTER TABLE bulk_patient_education_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can access campaign content"
    ON bulk_patient_education_content
    FOR ALL
    TO authenticated
    USING (
        campaign_id IN (
            SELECT hac.id FROM health_awareness_campaigns hac
            WHERE hac.practice_id IN (
                SELECT hp.id FROM healthcare_practices hp
                WHERE hp.owner_id = auth.uid()
                OR hp.id IN (
                    SELECT htm.practice_id FROM healthcare_team_members htm
                    WHERE htm.user_id = auth.uid()
                    AND htm.status = 'active'
                )
            )
        )
    );

-- Health topic templates are public for all healthcare users
ALTER TABLE health_topic_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Health topic templates are public"
    ON health_topic_templates
    FOR SELECT
    TO authenticated
    USING (active = true);

-- Template creators and admins can modify templates
CREATE POLICY "Template creators and admins can modify templates"
    ON health_topic_templates
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

-- Users can access their own generation jobs
ALTER TABLE bulk_generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own generation jobs"
    ON bulk_generation_jobs
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Practice team can access campaign analytics
ALTER TABLE campaign_performance_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can access campaign analytics"
    ON campaign_performance_analytics
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

-- Users can track their own content usage
ALTER TABLE bulk_content_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can track their own content usage"
    ON bulk_content_usage_tracking
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_health_campaigns_practice ON health_awareness_campaigns(practice_id);
CREATE INDEX idx_health_campaigns_topic ON health_awareness_campaigns(health_topic);
CREATE INDEX idx_health_campaigns_status ON health_awareness_campaigns(status);
CREATE INDEX idx_health_campaigns_dates ON health_awareness_campaigns(start_date, end_date);
CREATE INDEX idx_health_campaigns_created_by ON health_awareness_campaigns(created_by);

CREATE INDEX idx_bulk_content_campaign ON bulk_patient_education_content(campaign_id);
CREATE INDEX idx_bulk_content_platform ON bulk_patient_education_content(platform);
CREATE INDEX idx_bulk_content_type ON bulk_patient_education_content(content_type);
CREATE INDEX idx_bulk_content_compliance ON bulk_patient_education_content(ahpra_compliant, tga_compliant);
CREATE INDEX idx_bulk_content_sequence ON bulk_patient_education_content(content_sequence);

CREATE INDEX idx_health_templates_topic ON health_topic_templates(topic);
CREATE INDEX idx_health_templates_category ON health_topic_templates(category);
CREATE INDEX idx_health_templates_active ON health_topic_templates(active);
CREATE INDEX idx_health_templates_specialties ON health_topic_templates USING GIN (relevant_specialties);

CREATE INDEX idx_generation_jobs_campaign ON bulk_generation_jobs(campaign_id);
CREATE INDEX idx_generation_jobs_user ON bulk_generation_jobs(user_id);
CREATE INDEX idx_generation_jobs_status ON bulk_generation_jobs(job_status);
CREATE INDEX idx_generation_jobs_created_at ON bulk_generation_jobs(created_at);

CREATE INDEX idx_campaign_analytics_campaign ON campaign_performance_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_practice ON campaign_performance_analytics(practice_id);
CREATE INDEX idx_campaign_analytics_period ON campaign_performance_analytics(analytics_period_start, analytics_period_end);

CREATE INDEX idx_content_usage_content ON bulk_content_usage_tracking(content_id);
CREATE INDEX idx_content_usage_campaign ON bulk_content_usage_tracking(campaign_id);
CREATE INDEX idx_content_usage_user ON bulk_content_usage_tracking(user_id);
CREATE INDEX idx_content_usage_platform ON bulk_content_usage_tracking(platform);
CREATE INDEX idx_content_usage_date ON bulk_content_usage_tracking(usage_date);

-- Functions for bulk content generation

-- Function to calculate campaign metrics
CREATE OR REPLACE FUNCTION calculate_campaign_metrics(
    p_campaign_id UUID
) RETURNS JSONB AS $$
DECLARE
    total_content INTEGER;
    compliant_content INTEGER;
    avg_readability DECIMAL(3,1);
    avg_educational_value DECIMAL(3,1);
    unique_demographics INTEGER;
    high_engagement_content INTEGER;
    metrics JSONB;
BEGIN
    -- Get total content count
    SELECT COUNT(*) INTO total_content
    FROM bulk_patient_education_content
    WHERE campaign_id = p_campaign_id;
    
    -- Get compliant content count
    SELECT COUNT(*) INTO compliant_content
    FROM bulk_patient_education_content
    WHERE campaign_id = p_campaign_id
    AND ahpra_compliant = true
    AND tga_compliant = true;
    
    -- Get average scores
    SELECT 
        ROUND(AVG(readability_score), 1),
        ROUND(AVG(educational_value), 1),
        COUNT(DISTINCT (demographic->>'ageGroup')),
        COUNT(*) FILTER (WHERE engagement_prediction >= 7)
    INTO avg_readability, avg_educational_value, unique_demographics, high_engagement_content
    FROM bulk_patient_education_content
    WHERE campaign_id = p_campaign_id;
    
    -- Build metrics object
    metrics := jsonb_build_object(
        'contentGenerated', total_content,
        'complianceRate', CASE 
            WHEN total_content > 0 THEN ROUND((compliant_content::DECIMAL / total_content) * 100, 1)
            ELSE 0
        END,
        'averageReadabilityScore', COALESCE(avg_readability, 0),
        'averageEducationalValue', COALESCE(avg_educational_value, 0),
        'demographicCoverage', COALESCE(unique_demographics, 0),
        'platformOptimization', CASE 
            WHEN total_content > 0 THEN ROUND((high_engagement_content::DECIMAL / total_content) * 100, 1)
            ELSE 0
        END
    );
    
    -- Update campaign with new metrics
    UPDATE health_awareness_campaigns
    SET 
        generated_content = total_content,
        campaign_metrics = metrics,
        updated_at = NOW()
    WHERE id = p_campaign_id;
    
    RETURN metrics;
END;
$$ LANGUAGE plpgsql;

-- Function to track content usage
CREATE OR REPLACE FUNCTION track_content_usage(
    p_content_id UUID,
    p_user_id UUID,
    p_platform TEXT,
    p_usage_type TEXT
) RETURNS UUID AS $$
DECLARE
    tracking_id UUID;
    campaign_id UUID;
BEGIN
    -- Get campaign ID from content
    SELECT bpec.campaign_id INTO campaign_id
    FROM bulk_patient_education_content bpec
    WHERE bpec.id = p_content_id;
    
    -- Insert tracking record
    INSERT INTO bulk_content_usage_tracking (
        content_id,
        campaign_id,
        user_id,
        platform,
        usage_type
    ) VALUES (
        p_content_id,
        campaign_id,
        p_user_id,
        p_platform,
        p_usage_type
    ) RETURNING id INTO tracking_id;
    
    -- Update content usage count
    UPDATE bulk_patient_education_content
    SET 
        usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = p_content_id;
    
    RETURN tracking_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update generation job progress
CREATE OR REPLACE FUNCTION update_generation_job_progress(
    p_job_id UUID,
    p_content_generated INTEGER,
    p_status TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    total_requested INTEGER;
    new_progress INTEGER;
BEGIN
    -- Get total content requested
    SELECT total_content_requested INTO total_requested
    FROM bulk_generation_jobs
    WHERE id = p_job_id;
    
    -- Calculate progress percentage
    new_progress := CASE 
        WHEN total_requested > 0 THEN (p_content_generated * 100) / total_requested
        ELSE 0
    END;
    
    -- Update job record
    UPDATE bulk_generation_jobs
    SET 
        content_generated = p_content_generated,
        progress_percentage = new_progress,
        job_status = COALESCE(p_status, job_status),
        updated_at = NOW(),
        completed_at = CASE 
            WHEN p_status = 'completed' THEN NOW()
            ELSE completed_at
        END
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update campaign metrics when content is added
CREATE OR REPLACE FUNCTION trigger_update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate campaign metrics
    PERFORM calculate_campaign_metrics(NEW.campaign_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic metric updates
CREATE TRIGGER update_campaign_metrics_trigger
    AFTER INSERT OR UPDATE ON bulk_patient_education_content
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_campaign_metrics();

-- Create updated_at triggers
CREATE TRIGGER update_health_awareness_campaigns_updated_at
    BEFORE UPDATE ON health_awareness_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_patient_education_content_updated_at
    BEFORE UPDATE ON bulk_patient_education_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_topic_templates_updated_at
    BEFORE UPDATE ON health_topic_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_generation_jobs_updated_at
    BEFORE UPDATE ON bulk_generation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default health topic templates
INSERT INTO health_topic_templates (
    topic, category, key_messages, common_myths, prevention_strategies, 
    support_resources, compliance_considerations, cultural_sensitivities, 
    evidence_base, relevant_specialties, ahpra_approved, tga_approved
) VALUES 
(
    'Mental Health Awareness',
    'mental_health',
    ARRAY[
        'Mental health is as important as physical health',
        'Professional help is available and effective',
        'Early intervention improves outcomes',
        'Mental health conditions are treatable'
    ],
    ARRAY[
        'Mental health problems are a sign of weakness',
        'Therapy is only for severe conditions',
        'Medication is the only treatment option',
        'Mental health issues will resolve on their own'
    ],
    ARRAY[
        'Regular exercise and physical activity',
        'Maintain social connections and support networks',
        'Practice stress management techniques',
        'Seek professional help when needed'
    ],
    ARRAY[
        'Lifeline: 13 11 14',
        'Beyond Blue: 1300 22 4636',
        'Mental Health First Aid',
        'Local community mental health services'
    ],
    ARRAY[
        'Avoid diagnostic language',
        'Include crisis support information',
        'Emphasize professional consultation',
        'Use person-first language'
    ],
    ARRAY[
        'Respect diverse cultural approaches to mental health',
        'Acknowledge barriers to help-seeking',
        'Include culturally appropriate resources',
        'Consider Indigenous perspectives on wellbeing'
    ],
    ARRAY[
        'WHO Mental Health Atlas',
        'Australian Bureau of Statistics Mental Health data',
        'RANZCP Clinical Practice Guidelines'
    ],
    ARRAY['psychology', 'gp', 'specialist'],
    true,
    true
),
(
    'Diabetes Prevention and Management',
    'chronic_disease',
    ARRAY[
        'Type 2 diabetes is largely preventable',
        'Early detection improves long-term outcomes',
        'Lifestyle changes are highly effective',
        'Regular monitoring is essential for management'
    ],
    ARRAY[
        'Diabetes is caused only by eating too much sugar',
        'People with diabetes cannot eat any carbohydrates',
        'Insulin is only for type 1 diabetes',
        'Diabetes medication means you have failed at self-management'
    ],
    ARRAY[
        'Maintain healthy weight through balanced diet',
        'Regular physical activity (150 minutes per week)',
        'Regular health screenings and blood glucose checks',
        'Manage stress and get adequate sleep'
    ],
    ARRAY[
        'Diabetes Australia: 1800 177 055',
        'National Diabetes Services Scheme',
        'Local diabetes education programs',
        'Accredited practicing dietitians'
    ],
    ARRAY[
        'Include disclaimer about individual medical advice',
        'Emphasize importance of professional monitoring',
        'Avoid specific medication recommendations',
        'Reference RACGP Diabetes Guidelines'
    ],
    ARRAY[
        'Acknowledge higher risk in certain ethnic groups',
        'Respect cultural food preferences and practices',
        'Address socioeconomic barriers to healthy eating',
        'Include culturally appropriate lifestyle modifications'
    ],
    ARRAY[
        'Australian Diabetes Guidelines',
        'International Diabetes Federation recommendations',
        'Cochrane systematic reviews on diabetes prevention'
    ],
    ARRAY['gp', 'specialist', 'allied_health'],
    true,
    true
);

COMMENT ON TABLE health_awareness_campaigns IS 'Healthcare awareness campaigns for bulk patient education content generation';
COMMENT ON TABLE bulk_patient_education_content IS 'AHPRA-compliant bulk generated patient education content for campaigns';
COMMENT ON TABLE health_topic_templates IS 'Templates for health topics with compliance guidelines and evidence base';
COMMENT ON TABLE bulk_generation_jobs IS 'Tracking for bulk content generation processing jobs';
COMMENT ON TABLE campaign_performance_analytics IS 'Performance analytics and metrics for healthcare awareness campaigns'; 