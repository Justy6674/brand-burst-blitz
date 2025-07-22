-- Healthcare Hashtag Generation System
-- AHPRA-compliant hashtag generation with analytics and compliance tracking

-- Hashtag generation requests tracking
CREATE TABLE healthcare_hashtag_generation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    practice_id UUID REFERENCES healthcare_practices(id),
    topic TEXT NOT NULL,
    specialty TEXT NOT NULL CHECK (specialty IN (
        'gp', 'specialist', 'allied_health', 'psychology', 'dentistry', 'nursing'
    )),
    content_type TEXT NOT NULL CHECK (content_type IN (
        'educational', 'awareness', 'promotional', 'community', 'preventive'
    )),
    target_platform TEXT NOT NULL CHECK (target_platform IN (
        'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok'
    )),
    audience TEXT NOT NULL CHECK (audience IN (
        'patients', 'professionals', 'community', 'mixed'
    )),
    location_context TEXT,
    generated_hashtags JSONB NOT NULL DEFAULT '{}',
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN (
        'compliant', 'needs_review', 'non_compliant', 'pending'
    )),
    flagged_terms TEXT[] DEFAULT '{}',
    generation_metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Healthcare hashtag analytics and performance tracking
CREATE TABLE healthcare_hashtag_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hashtag TEXT NOT NULL,
    specialty TEXT[] DEFAULT '{}',
    content_type TEXT[] DEFAULT '{}',
    platform TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    reach_score INTEGER DEFAULT 0,
    compliance_score INTEGER DEFAULT 100 CHECK (compliance_score >= 0 AND compliance_score <= 100),
    trending_score INTEGER DEFAULT 0,
    effectiveness_rating DECIMAL(3,1) DEFAULT 5.0 CHECK (effectiveness_rating >= 1.0 AND effectiveness_rating <= 10.0),
    ahpra_approved BOOLEAN DEFAULT false,
    tga_approved BOOLEAN DEFAULT false,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(hashtag)
);

-- AHPRA prohibited terms library for hashtag validation
CREATE TABLE healthcare_hashtag_prohibited_terms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    term TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN (
        'therapeutic_claims', 'comparative_claims', 'drug_names', 
        'exaggerated_outcomes', 'promotional_terms', 'misleading_claims'
    )),
    severity TEXT DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ahpra_reference TEXT,
    tga_reference TEXT,
    suggested_alternatives TEXT[] DEFAULT '{}',
    violation_description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Healthcare hashtag recommendations based on specialty and content
CREATE TABLE healthcare_hashtag_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    specialty TEXT NOT NULL CHECK (specialty IN (
        'gp', 'specialist', 'allied_health', 'psychology', 'dentistry', 'nursing'
    )),
    content_type TEXT NOT NULL CHECK (content_type IN (
        'educational', 'awareness', 'promotional', 'community', 'preventive'
    )),
    recommended_hashtags JSONB NOT NULL DEFAULT '[]',
    priority_level INTEGER DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
    effectiveness_score DECIMAL(3,1) DEFAULT 5.0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES auth.users(id),
    approved_by_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(specialty, content_type)
);

-- Hashtag usage tracking for analytics
CREATE TABLE healthcare_hashtag_usage_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    practice_id UUID REFERENCES healthcare_practices(id),
    hashtag TEXT NOT NULL,
    content_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    specialty TEXT NOT NULL,
    usage_context TEXT, -- Brief description of how hashtag was used
    performance_metrics JSONB DEFAULT '{}', -- Engagement, reach, etc.
    compliance_validated BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for hashtag generation system

-- Users can access their own hashtag generation requests
ALTER TABLE healthcare_hashtag_generation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own hashtag requests"
    ON healthcare_hashtag_generation_requests
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Hashtag analytics are public for all healthcare users
ALTER TABLE healthcare_hashtag_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare hashtag analytics are public"
    ON healthcare_hashtag_analytics
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can modify hashtag analytics
CREATE POLICY "Only admins can modify hashtag analytics"
    ON healthcare_hashtag_analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND u.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Prohibited terms are public for validation
ALTER TABLE healthcare_hashtag_prohibited_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prohibited terms are public for validation"
    ON healthcare_hashtag_prohibited_terms
    FOR SELECT
    TO authenticated
    USING (active = true);

-- Hashtag recommendations are public
ALTER TABLE healthcare_hashtag_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare hashtag recommendations are public"
    ON healthcare_hashtag_recommendations
    FOR SELECT
    TO authenticated
    USING (approved_by_admin = true);

-- Users can access their own hashtag usage logs
ALTER TABLE healthcare_hashtag_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own hashtag usage"
    ON healthcare_hashtag_usage_log
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_hashtag_requests_user ON healthcare_hashtag_generation_requests(user_id);
CREATE INDEX idx_hashtag_requests_specialty ON healthcare_hashtag_generation_requests(specialty);
CREATE INDEX idx_hashtag_requests_platform ON healthcare_hashtag_generation_requests(target_platform);
CREATE INDEX idx_hashtag_requests_compliance ON healthcare_hashtag_generation_requests(compliance_status);
CREATE INDEX idx_hashtag_requests_generated_at ON healthcare_hashtag_generation_requests(generated_at);

CREATE INDEX idx_hashtag_analytics_hashtag ON healthcare_hashtag_analytics(hashtag);
CREATE INDEX idx_hashtag_analytics_specialty ON healthcare_hashtag_analytics USING GIN (specialty);
CREATE INDEX idx_hashtag_analytics_platform ON healthcare_hashtag_analytics USING GIN (platform);
CREATE INDEX idx_hashtag_analytics_trending ON healthcare_hashtag_analytics(trending_score);
CREATE INDEX idx_hashtag_analytics_effectiveness ON healthcare_hashtag_analytics(effectiveness_rating);
CREATE INDEX idx_hashtag_analytics_approved ON healthcare_hashtag_analytics(ahpra_approved, tga_approved);

CREATE INDEX idx_prohibited_terms_term ON healthcare_hashtag_prohibited_terms(term);
CREATE INDEX idx_prohibited_terms_category ON healthcare_hashtag_prohibited_terms(category);
CREATE INDEX idx_prohibited_terms_severity ON healthcare_hashtag_prohibited_terms(severity);
CREATE INDEX idx_prohibited_terms_active ON healthcare_hashtag_prohibited_terms(active);

CREATE INDEX idx_hashtag_recommendations_specialty ON healthcare_hashtag_recommendations(specialty);
CREATE INDEX idx_hashtag_recommendations_content_type ON healthcare_hashtag_recommendations(content_type);
CREATE INDEX idx_hashtag_recommendations_approved ON healthcare_hashtag_recommendations(approved_by_admin);

CREATE INDEX idx_hashtag_usage_user ON healthcare_hashtag_usage_log(user_id);
CREATE INDEX idx_hashtag_usage_hashtag ON healthcare_hashtag_usage_log(hashtag);
CREATE INDEX idx_hashtag_usage_platform ON healthcare_hashtag_usage_log(platform);
CREATE INDEX idx_hashtag_usage_specialty ON healthcare_hashtag_usage_log(specialty);
CREATE INDEX idx_hashtag_usage_used_at ON healthcare_hashtag_usage_log(used_at);

-- Functions for hashtag compliance validation

-- Function to validate hashtag against prohibited terms
CREATE OR REPLACE FUNCTION validate_hashtag_compliance(
    p_hashtag TEXT
) RETURNS JSONB AS $$
DECLARE
    violation_count INTEGER := 0;
    prohibited_matches TEXT[] := '{}';
    severity_scores INTEGER[] := '{}';
    compliance_result JSONB;
    max_severity TEXT := 'low';
BEGIN
    -- Check hashtag against prohibited terms
    SELECT COUNT(*), ARRAY_AGG(term), ARRAY_AGG(
        CASE severity
            WHEN 'critical' THEN 4
            WHEN 'high' THEN 3
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 1
        END
    )
    INTO violation_count, prohibited_matches, severity_scores
    FROM healthcare_hashtag_prohibited_terms
    WHERE active = true
    AND LOWER(p_hashtag) LIKE '%' || LOWER(term) || '%';
    
    -- Determine maximum severity
    IF array_length(severity_scores, 1) > 0 THEN
        CASE (SELECT MAX(score) FROM unnest(severity_scores) AS score)
            WHEN 4 THEN max_severity := 'critical';
            WHEN 3 THEN max_severity := 'high';
            WHEN 2 THEN max_severity := 'medium';
            WHEN 1 THEN max_severity := 'low';
        END CASE;
    END IF;
    
    -- Build compliance result
    compliance_result := jsonb_build_object(
        'isCompliant', violation_count = 0,
        'violationCount', violation_count,
        'prohibitedMatches', prohibited_matches,
        'maxSeverity', max_severity,
        'complianceScore', GREATEST(0, 100 - (violation_count * 25)),
        'recommendations', CASE 
            WHEN violation_count > 0 THEN 
                jsonb_build_array(
                    'Remove prohibited terms from hashtag',
                    'Use professional healthcare terminology',
                    'Focus on educational rather than promotional language'
                )
            ELSE 
                jsonb_build_array('Hashtag is AHPRA compliant')
        END
    );
    
    RETURN compliance_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended hashtags for specialty and content type
CREATE OR REPLACE FUNCTION get_recommended_hashtags(
    p_specialty TEXT,
    p_content_type TEXT,
    p_limit INTEGER DEFAULT 10
) RETURNS JSONB AS $$
DECLARE
    recommendations JSONB;
    hashtag_list JSONB;
BEGIN
    -- Get recommended hashtags from recommendations table
    SELECT recommended_hashtags
    INTO hashtag_list
    FROM healthcare_hashtag_recommendations
    WHERE specialty = p_specialty
    AND content_type = p_content_type
    AND approved_by_admin = true
    ORDER BY priority_level DESC, effectiveness_score DESC
    LIMIT 1;
    
    -- If no specific recommendations, get general ones
    IF hashtag_list IS NULL THEN
        hashtag_list := jsonb_build_array(
            '#HealthEducation', '#PatientCare', '#AustralianHealthcare',
            '#HealthAwareness', '#CommunityHealth', '#HealthTips'
        );
    END IF;
    
    -- Build response
    recommendations := jsonb_build_object(
        'specialty', p_specialty,
        'contentType', p_content_type,
        'recommendedHashtags', hashtag_list,
        'count', jsonb_array_length(hashtag_list)
    );
    
    RETURN recommendations;
END;
$$ LANGUAGE plpgsql;

-- Function to update hashtag analytics
CREATE OR REPLACE FUNCTION update_hashtag_analytics(
    p_hashtag TEXT,
    p_specialty TEXT,
    p_platform TEXT,
    p_engagement_rate DECIMAL DEFAULT NULL,
    p_reach_score INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO healthcare_hashtag_analytics (
        hashtag,
        specialty,
        platform,
        usage_count,
        engagement_rate,
        reach_score,
        last_used_at
    ) VALUES (
        p_hashtag,
        ARRAY[p_specialty],
        ARRAY[p_platform],
        1,
        COALESCE(p_engagement_rate, 0.00),
        COALESCE(p_reach_score, 0),
        NOW()
    )
    ON CONFLICT (hashtag) DO UPDATE SET
        usage_count = healthcare_hashtag_analytics.usage_count + 1,
        specialty = array_cat(healthcare_hashtag_analytics.specialty, ARRAY[p_specialty]),
        platform = array_cat(healthcare_hashtag_analytics.platform, ARRAY[p_platform]),
        engagement_rate = CASE 
            WHEN p_engagement_rate IS NOT NULL THEN 
                (healthcare_hashtag_analytics.engagement_rate + p_engagement_rate) / 2
            ELSE healthcare_hashtag_analytics.engagement_rate
        END,
        reach_score = CASE 
            WHEN p_reach_score IS NOT NULL THEN 
                GREATEST(healthcare_hashtag_analytics.reach_score, p_reach_score)
            ELSE healthcare_hashtag_analytics.reach_score
        END,
        last_used_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate hashtags when generation requests are created
CREATE OR REPLACE FUNCTION trigger_hashtag_compliance_validation()
RETURNS TRIGGER AS $$
DECLARE
    validation_result JSONB;
    hashtag_text TEXT;
    violation_count INTEGER := 0;
    flagged_hashtags TEXT[] := '{}';
BEGIN
    -- Extract hashtags from generated_hashtags JSON and validate each
    FOR hashtag_text IN 
        SELECT jsonb_array_elements_text(
            NEW.generated_hashtags->'primary'->hashtag->'hashtag'
        )
        UNION ALL
        SELECT jsonb_array_elements_text(
            NEW.generated_hashtags->'secondary'->hashtag->'hashtag'
        )
    LOOP
        validation_result := validate_hashtag_compliance(hashtag_text);
        
        IF NOT (validation_result->>'isCompliant')::boolean THEN
            violation_count := violation_count + 1;
            flagged_hashtags := array_append(flagged_hashtags, hashtag_text);
        END IF;
    END LOOP;
    
    -- Update compliance status and flagged terms
    NEW.compliance_status := CASE 
        WHEN violation_count = 0 THEN 'compliant'
        WHEN violation_count <= 2 THEN 'needs_review'
        ELSE 'non_compliant'
    END;
    
    NEW.flagged_terms := flagged_hashtags;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic hashtag compliance validation
CREATE TRIGGER validate_generated_hashtags_compliance
    BEFORE INSERT OR UPDATE ON healthcare_hashtag_generation_requests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_hashtag_compliance_validation();

-- Create updated_at triggers
CREATE TRIGGER update_healthcare_hashtag_analytics_updated_at
    BEFORE UPDATE ON healthcare_hashtag_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_hashtag_prohibited_terms_updated_at
    BEFORE UPDATE ON healthcare_hashtag_prohibited_terms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_hashtag_recommendations_updated_at
    BEFORE UPDATE ON healthcare_hashtag_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert prohibited terms for AHPRA compliance
INSERT INTO healthcare_hashtag_prohibited_terms (
    term, category, severity, violation_description, suggested_alternatives
) VALUES 
-- Therapeutic claims
('cure', 'therapeutic_claims', 'critical', 'AHPRA prohibits claims about curing conditions', ARRAY['treatment', 'management', 'support']),
('miracle', 'therapeutic_claims', 'critical', 'Exaggerated therapeutic claims violate AHPRA guidelines', ARRAY['effective', 'helpful', 'beneficial']),
('guaranteed', 'therapeutic_claims', 'high', 'Outcome guarantees are prohibited in healthcare advertising', ARRAY['proven', 'evidencebased', 'effective']),
('instant', 'therapeutic_claims', 'high', 'Claims of instant results are misleading', ARRAY['prompt', 'timely', 'effective']),
('painless', 'therapeutic_claims', 'medium', 'Absolute claims about pain levels can be misleading', ARRAY['comfortable', 'gentle', 'minimal discomfort']),

-- Comparative claims
('best', 'comparative_claims', 'high', 'Comparative superiority claims violate AHPRA guidelines', ARRAY['quality', 'professional', 'experienced']),
('leading', 'comparative_claims', 'high', 'Claims of being leading practice are prohibited', ARRAY['experienced', 'professional', 'qualified']),
('numberone', 'comparative_claims', 'critical', 'Ranking claims are strictly prohibited', ARRAY['experienced', 'qualified', 'professional']),
('top', 'comparative_claims', 'high', 'Ranking or superiority claims are not allowed', ARRAY['experienced', 'professional', 'qualified']),
('superior', 'comparative_claims', 'high', 'Comparative superiority claims are prohibited', ARRAY['quality', 'professional', 'effective']),

-- Drug/treatment names (brand names)
('botox', 'drug_names', 'critical', 'Brand drug names cannot be used in advertising without restrictions', ARRAY['treatment', 'procedure', 'injectable']),
('dysport', 'drug_names', 'critical', 'Brand drug names require specific TGA compliance', ARRAY['treatment', 'procedure', 'injectable']),
('fillers', 'drug_names', 'medium', 'Generic treatment terms may require disclaimers', ARRAY['treatment', 'procedure', 'enhancement']),

-- Exaggerated outcomes
('amazing', 'exaggerated_outcomes', 'medium', 'Exaggerated language should be avoided in professional healthcare', ARRAY['effective', 'beneficial', 'helpful']),
('incredible', 'exaggerated_outcomes', 'medium', 'Superlative language inappropriate for healthcare advertising', ARRAY['effective', 'significant', 'beneficial']),
('lifechanging', 'exaggerated_outcomes', 'high', 'Exaggerated outcome claims can be misleading', ARRAY['beneficial', 'helpful', 'supportive']),
('perfect', 'exaggerated_outcomes', 'high', 'Absolute outcome claims are not appropriate', ARRAY['effective', 'suitable', 'appropriate']),

-- Promotional terms
('special', 'promotional_terms', 'medium', 'Promotional language should focus on professional services', ARRAY['service', 'consultation', 'appointment']),
('deal', 'promotional_terms', 'high', 'Commercial promotional terms inappropriate for healthcare', ARRAY['service', 'consultation', 'care']),
('discount', 'promotional_terms', 'high', 'Price-focused promotion may violate professional standards', ARRAY['consultation', 'service', 'care']);

-- Insert healthcare hashtag recommendations
INSERT INTO healthcare_hashtag_recommendations (
    specialty, content_type, recommended_hashtags, priority_level, effectiveness_score, approved_by_admin
) VALUES 
('gp', 'educational', 
 '["#GeneralPractice", "#FamilyHealth", "#HealthEducation", "#PreventiveCare", "#CommunityHealth", "#PatientCare", "#HealthTips", "#WellnessEducation"]',
 5, 9.0, true),
 
('psychology', 'educational',
 '["#MentalHealth", "#MentalWellbeing", "#PsychologicalHealth", "#MentalHealthSupport", "#HealthEducation", "#MentalHealthAwareness", "#PatientCare", "#CommunitySupport"]',
 5, 9.5, true),
 
('allied_health', 'educational',
 '["#AlliedHealth", "#Rehabilitation", "#PhysicalTherapy", "#HealthRecovery", "#PatientCare", "#HealthEducation", "#MovementMedicine", "#RecoverySupport"]',
 5, 8.5, true),
 
('specialist', 'educational',
 '["#SpecialistCare", "#MedicalEducation", "#HealthcareExcellence", "#PatientCare", "#HealthEducation", "#MedicalSpecialist", "#ClinicalCare", "#HealthInformation"]',
 4, 8.0, true),
 
('dentistry', 'educational',
 '["#OralHealth", "#DentalCare", "#DentalHealth", "#SmileHealth", "#PatientCare", "#HealthEducation", "#PreventiveDentistry", "#OralHealthEducation"]',
 5, 8.5, true);

-- Insert initial hashtag analytics for popular healthcare hashtags
INSERT INTO healthcare_hashtag_analytics (
    hashtag, specialty, content_type, platform, usage_count, effectiveness_rating, ahpra_approved, tga_approved
) VALUES 
('#HealthEducation', ARRAY['gp', 'psychology', 'allied_health', 'specialist'], ARRAY['educational'], ARRAY['facebook', 'instagram', 'linkedin'], 150, 9.0, true, true),
('#PatientCare', ARRAY['gp', 'psychology', 'allied_health', 'specialist', 'dentistry'], ARRAY['educational', 'community'], ARRAY['facebook', 'instagram', 'linkedin'], 200, 9.2, true, true),
('#MentalHealth', ARRAY['psychology'], ARRAY['educational', 'awareness'], ARRAY['instagram', 'facebook'], 300, 9.8, true, true),
('#GeneralPractice', ARRAY['gp'], ARRAY['educational', 'promotional'], ARRAY['facebook', 'linkedin'], 100, 8.5, true, true),
('#AlliedHealth', ARRAY['allied_health'], ARRAY['educational'], ARRAY['linkedin', 'facebook'], 80, 8.0, true, true),
('#AustralianHealthcare', ARRAY['gp', 'specialist', 'allied_health', 'psychology'], ARRAY['educational', 'community'], ARRAY['facebook', 'linkedin'], 120, 8.8, true, true);

COMMENT ON TABLE healthcare_hashtag_generation_requests IS 'Tracking all hashtag generation requests with AHPRA compliance validation';
COMMENT ON TABLE healthcare_hashtag_analytics IS 'Analytics and performance tracking for healthcare hashtags';
COMMENT ON TABLE healthcare_hashtag_prohibited_terms IS 'Library of terms prohibited in healthcare hashtags per AHPRA guidelines';
COMMENT ON TABLE healthcare_hashtag_recommendations IS 'Curated hashtag recommendations by specialty and content type';
COMMENT ON TABLE healthcare_hashtag_usage_log IS 'Detailed usage tracking for hashtag performance analysis'; 