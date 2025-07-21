-- Australian Compliance Audit System Migration
-- Comprehensive tracking for AHPRA, TGA, and ABN compliance validation
-- Created: 2025-01-24

-- AHPRA Registration Validation Audit
CREATE TABLE IF NOT EXISTS ahpra_validation_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registration_number TEXT NOT NULL,
    validation_result TEXT CHECK (validation_result IN ('valid', 'invalid', 'format_error', 'system_error')) NOT NULL,
    practitioner_name TEXT,
    profession TEXT,
    speciality TEXT,
    registration_status TEXT,
    registration_expiry DATE,
    conditions TEXT[],
    practice_location TEXT,
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT ahpra_validation_audit_user_idx UNIQUE (user_id, registration_number, validated_at)
);

-- TGA Compliance Validation Audit  
CREATE TABLE IF NOT EXISTS tga_compliance_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_hash TEXT NOT NULL, -- Hash of content for audit without storing full text
    advertising_type TEXT CHECK (advertising_type IN ('healthcare_service', 'therapeutic_goods', 'medicine', 'device')) NOT NULL,
    target_audience TEXT CHECK (target_audience IN ('general_public', 'healthcare_professionals')) NOT NULL,
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100) NOT NULL,
    is_compliant BOOLEAN NOT NULL,
    violations_count INTEGER DEFAULT 0,
    critical_violations INTEGER DEFAULT 0,
    high_violations INTEGER DEFAULT 0,
    medium_violations INTEGER DEFAULT 0,
    low_violations INTEGER DEFAULT 0,
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for analytics
    INDEX tga_compliance_user_idx (user_id, checked_at),
    INDEX tga_compliance_score_idx (compliance_score, checked_at)
);

-- ABN/Business Validation Audit
CREATE TABLE IF NOT EXISTS abn_validation_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    abn TEXT NOT NULL,
    validation_result TEXT CHECK (validation_result IN ('valid', 'invalid', 'format_error', 'system_error')) NOT NULL,
    business_name TEXT,
    entity_type TEXT,
    gst_registered BOOLEAN,
    business_status TEXT,
    postcode_state TEXT,
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Audit trail
    CONSTRAINT abn_validation_audit_user_idx UNIQUE (user_id, abn, validated_at)
);

-- Comprehensive Compliance Scoring History
CREATE TABLE IF NOT EXISTS compliance_score_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_profile_id UUID, -- Reference to business profile if applicable
    
    -- Overall compliance metrics
    overall_compliance_score INTEGER CHECK (overall_compliance_score >= 0 AND overall_compliance_score <= 100),
    ahpra_compliance_score INTEGER CHECK (ahpra_compliance_score >= 0 AND ahpra_compliance_score <= 100),
    tga_compliance_score INTEGER CHECK (tga_compliance_score >= 0 AND tga_compliance_score <= 100),
    business_validation_score INTEGER CHECK (business_validation_score >= 0 AND business_validation_score <= 100),
    
    -- Registration status
    ahpra_registration_valid BOOLEAN DEFAULT FALSE,
    abn_registration_valid BOOLEAN DEFAULT FALSE,
    
    -- Content compliance metrics  
    content_items_checked INTEGER DEFAULT 0,
    compliant_content_count INTEGER DEFAULT 0,
    non_compliant_content_count INTEGER DEFAULT 0,
    
    -- Violation tracking
    total_violations INTEGER DEFAULT 0,
    critical_violations INTEGER DEFAULT 0,
    resolved_violations INTEGER DEFAULT 0,
    
    -- Risk assessment
    compliance_risk_level TEXT CHECK (compliance_risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    last_risk_assessment TIMESTAMPTZ DEFAULT NOW(),
    
    -- Timestamps
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX compliance_score_user_idx (user_id, calculated_at),
    INDEX compliance_risk_idx (compliance_risk_level, calculated_at)
);

-- Compliance Violation Details
CREATE TABLE IF NOT EXISTS compliance_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Violation details
    violation_type TEXT CHECK (violation_type IN ('ahpra', 'tga', 'abn', 'professional_boundaries', 'patient_testimonial')) NOT NULL,
    severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')) NOT NULL,
    violation_code TEXT NOT NULL,
    description TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    regulation_reference TEXT NOT NULL,
    
    -- Content context
    content_type TEXT,
    content_platform TEXT,
    content_hash TEXT, -- Reference to specific content
    
    -- Resolution tracking
    status TEXT CHECK (status IN ('active', 'resolved', 'acknowledged', 'false_positive')) DEFAULT 'active',
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    
    -- Timestamps
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX violations_user_status_idx (user_id, status, detected_at),
    INDEX violations_severity_idx (severity, detected_at),
    INDEX violations_type_idx (violation_type, detected_at)
);

-- Australian Healthcare Practice Profiles
CREATE TABLE IF NOT EXISTS healthcare_practice_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Practice details
    practice_name TEXT NOT NULL,
    practice_type TEXT CHECK (practice_type IN ('gp', 'specialist', 'allied_health', 'psychology', 'dental', 'nursing', 'optometry')) NOT NULL,
    ahpra_registration TEXT NOT NULL,
    abn TEXT,
    
    -- Validation status
    ahpra_validated BOOLEAN DEFAULT FALSE,
    ahpra_validation_date TIMESTAMPTZ,
    abn_validated BOOLEAN DEFAULT FALSE,
    abn_validation_date TIMESTAMPTZ,
    
    -- Practice information
    specialty_area TEXT,
    practice_location TEXT,
    practice_address JSONB,
    contact_information JSONB,
    
    -- Compliance settings
    compliance_monitoring_enabled BOOLEAN DEFAULT TRUE,
    auto_compliance_checking BOOLEAN DEFAULT TRUE,
    compliance_notifications BOOLEAN DEFAULT TRUE,
    
    -- Practice status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_practice UNIQUE (user_id, practice_name),
    CONSTRAINT unique_ahpra_registration UNIQUE (ahpra_registration)
);

-- Compliance Content Generation Audit
CREATE TABLE IF NOT EXISTS compliance_content_generation_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_profile_id UUID REFERENCES healthcare_practice_profiles(id) ON DELETE SET NULL,
    
    -- Content details
    content_title TEXT NOT NULL,
    content_type TEXT NOT NULL,
    content_platform TEXT,
    word_count INTEGER,
    
    -- Generation parameters
    specialty TEXT NOT NULL,
    target_audience TEXT,
    compliance_mode BOOLEAN DEFAULT TRUE,
    
    -- Compliance results
    pre_generation_score INTEGER,
    post_generation_score INTEGER,
    ahpra_compliant BOOLEAN NOT NULL,
    tga_compliant BOOLEAN NOT NULL,
    
    -- Content quality metrics
    readability_score INTEGER,
    professional_language_score INTEGER,
    patient_appropriate_score INTEGER,
    
    -- AI generation details
    ai_model_used TEXT,
    generation_parameters JSONB,
    tokens_used INTEGER,
    
    -- Audit trail
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX content_generation_user_idx (user_id, generated_at),
    INDEX content_generation_compliance_idx (ahpra_compliant, tga_compliant, generated_at)
);

-- Row Level Security Policies

-- AHPRA Validation Audit RLS
ALTER TABLE ahpra_validation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AHPRA validation history" ON ahpra_validation_audit
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AHPRA validation records" ON ahpra_validation_audit
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TGA Compliance Audit RLS
ALTER TABLE tga_compliance_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own TGA compliance history" ON tga_compliance_audit
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TGA compliance records" ON tga_compliance_audit
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ABN Validation Audit RLS
ALTER TABLE abn_validation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ABN validation history" ON abn_validation_audit
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ABN validation records" ON abn_validation_audit
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Compliance Score History RLS
ALTER TABLE compliance_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own compliance scores" ON compliance_score_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance scores" ON compliance_score_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance scores" ON compliance_score_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Compliance Violations RLS
ALTER TABLE compliance_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own violations" ON compliance_violations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own violations" ON compliance_violations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own violations" ON compliance_violations
    FOR UPDATE USING (auth.uid() = user_id);

-- Healthcare Practice Profiles RLS
ALTER TABLE healthcare_practice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own practice profiles" ON healthcare_practice_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Compliance Content Generation Audit RLS
ALTER TABLE compliance_content_generation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content generation history" ON compliance_content_generation_audit
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content generation records" ON compliance_content_generation_audit
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Compliance Analytics Functions

-- Function to calculate overall compliance score
CREATE OR REPLACE FUNCTION calculate_user_compliance_score(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    ahpra_score INTEGER := 0;
    tga_score INTEGER := 0;
    abn_score INTEGER := 0;
    overall_score INTEGER := 0;
BEGIN
    -- Calculate AHPRA compliance score
    SELECT COALESCE(
        CASE 
            WHEN COUNT(*) > 0 AND COUNT(*) FILTER (WHERE validation_result = 'valid') > 0 THEN 100
            WHEN COUNT(*) > 0 THEN 0
            ELSE 50 -- Default if no validation attempts
        END, 50
    ) INTO ahpra_score
    FROM ahpra_validation_audit
    WHERE user_id = user_uuid
    AND validated_at > NOW() - INTERVAL '30 days';
    
    -- Calculate TGA compliance score (average of recent checks)
    SELECT COALESCE(AVG(compliance_score)::INTEGER, 50) INTO tga_score
    FROM tga_compliance_audit
    WHERE user_id = user_uuid
    AND checked_at > NOW() - INTERVAL '30 days';
    
    -- Calculate ABN validation score
    SELECT COALESCE(
        CASE 
            WHEN COUNT(*) > 0 AND COUNT(*) FILTER (WHERE validation_result = 'valid') > 0 THEN 100
            WHEN COUNT(*) > 0 THEN 0
            ELSE 50 -- Default if no validation attempts
        END, 50
    ) INTO abn_score
    FROM abn_validation_audit
    WHERE user_id = user_uuid
    AND validated_at > NOW() - INTERVAL '30 days';
    
    -- Calculate weighted overall score
    overall_score := (ahpra_score * 0.4 + tga_score * 0.4 + abn_score * 0.2)::INTEGER;
    
    result := json_build_object(
        'overall_score', overall_score,
        'ahpra_score', ahpra_score,
        'tga_score', tga_score,
        'abn_score', abn_score,
        'risk_level', 
        CASE 
            WHEN overall_score >= 90 THEN 'low'
            WHEN overall_score >= 70 THEN 'medium'
            WHEN overall_score >= 50 THEN 'high'
            ELSE 'critical'
        END,
        'calculated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get compliance violations summary
CREATE OR REPLACE FUNCTION get_compliance_violations_summary(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_violations', COUNT(*),
        'active_violations', COUNT(*) FILTER (WHERE status = 'active'),
        'critical_violations', COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'active'),
        'high_violations', COUNT(*) FILTER (WHERE severity = 'high' AND status = 'active'),
        'resolved_violations', COUNT(*) FILTER (WHERE status = 'resolved'),
        'violation_types', json_agg(DISTINCT violation_type),
        'last_detection', MAX(detected_at)
    ) INTO result
    FROM compliance_violations
    WHERE user_id = user_uuid
    AND detected_at > NOW() - INTERVAL '90 days';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic compliance score updates
CREATE OR REPLACE FUNCTION update_compliance_score_on_validation()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update compliance score history
    INSERT INTO compliance_score_history (
        user_id,
        overall_compliance_score,
        ahpra_compliance_score,
        tga_compliance_score,
        business_validation_score,
        ahpra_registration_valid,
        abn_registration_valid,
        calculated_at
    )
    SELECT 
        NEW.user_id,
        (compliance_data->>'overall_score')::INTEGER,
        (compliance_data->>'ahpra_score')::INTEGER,
        (compliance_data->>'tga_score')::INTEGER,
        (compliance_data->>'abn_score')::INTEGER,
        EXISTS(SELECT 1 FROM ahpra_validation_audit WHERE user_id = NEW.user_id AND validation_result = 'valid'),
        EXISTS(SELECT 1 FROM abn_validation_audit WHERE user_id = NEW.user_id AND validation_result = 'valid'),
        NOW()
    FROM (SELECT calculate_user_compliance_score(NEW.user_id) as compliance_data) calc_scores
    ON CONFLICT (user_id, calculated_at) 
    DO UPDATE SET
        overall_compliance_score = EXCLUDED.overall_compliance_score,
        ahpra_compliance_score = EXCLUDED.ahpra_compliance_score,
        tga_compliance_score = EXCLUDED.tga_compliance_score,
        business_validation_score = EXCLUDED.business_validation_score;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_compliance_on_ahpra_validation
    AFTER INSERT ON ahpra_validation_audit
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_score_on_validation();

CREATE TRIGGER update_compliance_on_tga_validation
    AFTER INSERT ON tga_compliance_audit
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_score_on_validation();

CREATE TRIGGER update_compliance_on_abn_validation
    AFTER INSERT ON abn_validation_audit
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_score_on_validation();

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 