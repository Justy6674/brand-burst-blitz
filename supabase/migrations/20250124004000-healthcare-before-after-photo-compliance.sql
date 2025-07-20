-- Healthcare Before/After Photo Compliance Migration
-- AHPRA-compliant photo management with consent tracking

-- Healthcare Photo Consent Forms Table
CREATE TABLE healthcare_photo_consent_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    treatment_details TEXT NOT NULL,
    consent_granted BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consent_signature_url TEXT,
    
    -- Specific Consent Types
    photographer_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    social_media_consent BOOLEAN DEFAULT false,
    website_consent BOOLEAN DEFAULT false,
    print_media_consent BOOLEAN DEFAULT false,
    
    -- Consent Duration and Management
    duration_consent_months INTEGER DEFAULT 24,
    consent_renewable BOOLEAN DEFAULT true,
    withdrawal_acknowledged BOOLEAN DEFAULT false,
    privacy_notice_acknowledged BOOLEAN DEFAULT false,
    
    -- Legal and Compliance
    witness_name TEXT,
    witness_signature_url TEXT,
    legal_guardian_consent BOOLEAN DEFAULT false,
    legal_guardian_details TEXT,
    interpreter_used BOOLEAN DEFAULT false,
    interpreter_details TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    withdrawal_reason TEXT
);

-- Healthcare Before/After Photos Table
CREATE TABLE healthcare_before_after_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_consent_id UUID REFERENCES healthcare_photo_consent_forms(id) ON DELETE SET NULL,
    
    -- Photo Details
    before_image_url TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    treatment_type TEXT NOT NULL,
    specialty TEXT NOT NULL,
    treatment_date DATE,
    follow_up_period_weeks INTEGER,
    
    -- Consent and Legal
    consent_verified BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_form_url TEXT,
    
    -- AHPRA Compliance
    disclaimer_text TEXT NOT NULL,
    ahpra_compliant BOOLEAN DEFAULT false,
    compliance_notes TEXT,
    compliance_score INTEGER DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Review and Approval
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'requires_changes')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Publication and Usage
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    published_platforms TEXT[] DEFAULT '{}',
    usage_restrictions TEXT[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Archival
    archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    archive_reason TEXT
);

-- Healthcare Photo Compliance Rules Table
CREATE TABLE healthcare_photo_compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL UNIQUE,
    rule_category TEXT NOT NULL CHECK (rule_category IN ('consent', 'disclaimer', 'privacy', 'quality', 'ahpra')),
    rule_description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    rule_conditions JSONB NOT NULL DEFAULT '{}',
    penalty_score INTEGER DEFAULT 0,
    auto_check BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Healthcare Photo Review History Table
CREATE TABLE healthcare_photo_review_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES healthcare_before_after_photos(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    review_action TEXT NOT NULL CHECK (review_action IN ('submitted', 'approved', 'rejected', 'revision_requested', 'compliance_checked')),
    review_comments TEXT,
    compliance_score INTEGER,
    rule_violations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default compliance rules
INSERT INTO healthcare_photo_compliance_rules (
    rule_name, rule_category, rule_description, severity, rule_conditions, penalty_score
) VALUES 
-- Consent Rules (Critical)
('patient_consent_verified', 'consent', 'Patient consent must be verified before photo use', 'critical', 
 '{"requires": ["consent_verified"], "field": "consent_verified", "value": true}'::jsonb, 50),

('marketing_consent_obtained', 'consent', 'Explicit marketing consent required for promotional use', 'critical',
 '{"requires": ["marketing_consent"], "field": "marketing_consent", "value": true}'::jsonb, 30),

('photography_consent_surgical', 'consent', 'Photography consent required for surgical/cosmetic procedures', 'error',
 '{"conditions": {"treatment_type": ["surgical", "cosmetic surgery", "injectable"]}, "requires": ["photographer_consent"]}'::jsonb, 20),

('withdrawal_rights_acknowledged', 'consent', 'Patient withdrawal rights must be acknowledged', 'error',
 '{"requires": ["withdrawal_acknowledged"], "field": "withdrawal_acknowledged", "value": true}'::jsonb, 20),

-- Disclaimer Rules (Critical)
('disclaimer_minimum_length', 'disclaimer', 'Disclaimer must be comprehensive (minimum 100 characters)', 'error',
 '{"field": "disclaimer_text", "min_length": 100}'::jsonb, 25),

('disclaimer_results_vary', 'disclaimer', 'Disclaimer must include "individual results may vary"', 'error',
 '{"field": "disclaimer_text", "contains": "individual results may vary"}'::jsonb, 15),

('disclaimer_no_guarantee', 'disclaimer', 'Disclaimer must state results are not guaranteed', 'error',
 '{"field": "disclaimer_text", "contains": "not a guarantee"}'::jsonb, 15),

('disclaimer_consultation_required', 'disclaimer', 'Disclaimer must state consultation is required', 'warning',
 '{"field": "disclaimer_text", "contains": "consultation required"}'::jsonb, 10),

('disclaimer_risks_mentioned', 'disclaimer', 'Disclaimer must mention risks are involved', 'warning',
 '{"field": "disclaimer_text", "contains": "risks involved"}'::jsonb, 10),

('disclaimer_qualified_practitioner', 'disclaimer', 'Disclaimer must reference qualified practitioner', 'warning',
 '{"field": "disclaimer_text", "contains": "qualified practitioner"}'::jsonb, 5),

-- Privacy Rules (High)
('consent_duration_valid', 'privacy', 'Consent must be within specified duration period', 'error',
 '{"check": "consent_not_expired"}'::jsonb, 30),

('social_media_consent_platform', 'privacy', 'Social media consent required for social media use', 'warning',
 '{"platforms": ["facebook", "instagram", "linkedin"], "requires": ["social_media_consent"]}'::jsonb, 15),

-- AHPRA Compliance Rules
('ahpra_practitioner_identification', 'ahpra', 'Practitioner must be identified in disclaimer', 'error',
 '{"field": "disclaimer_text", "contains_any": ["practitioner", "doctor", "specialist"]}'::jsonb, 20),

('ahpra_registration_status', 'ahpra', 'AHPRA registration status should be referenced', 'warning',
 '{"field": "disclaimer_text", "contains": "registered"}'::jsonb, 10),

('ahpra_no_misleading_claims', 'ahpra', 'Photos must not contain misleading claims', 'critical',
 '{"check": "no_misleading_claims"}'::jsonb, 40),

-- Quality Rules
('professional_photo_quality', 'quality', 'Photos should meet professional standards', 'info',
 '{"check": "professional_quality"}'::jsonb, 5),

('consistent_lighting_angle', 'quality', 'Before and after photos should have consistent lighting and angles', 'warning',
 '{"check": "lighting_angle_consistency"}'::jsonb, 10);

-- Row Level Security Policies

-- Healthcare Photo Consent Forms RLS
ALTER TABLE healthcare_photo_consent_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can manage own consent forms" ON healthcare_photo_consent_forms
    FOR ALL USING (auth.uid() = practitioner_id);

CREATE POLICY "Admin can view all consent forms" ON healthcare_photo_consent_forms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Before/After Photos RLS
ALTER TABLE healthcare_before_after_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own photos" ON healthcare_before_after_photos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all photos" ON healthcare_before_after_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Photo Compliance Rules RLS
ALTER TABLE healthcare_photo_compliance_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read compliance rules" ON healthcare_photo_compliance_rules
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage compliance rules" ON healthcare_photo_compliance_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Photo Review History RLS
ALTER TABLE healthcare_photo_review_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews of own photos" ON healthcare_photo_review_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM healthcare_before_after_photos 
            WHERE id = photo_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Reviewers can insert reviews" ON healthcare_photo_review_history
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Admin can view all reviews" ON healthcare_photo_review_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Indexes for Performance
CREATE INDEX idx_photo_consent_practitioner ON healthcare_photo_consent_forms(practitioner_id);
CREATE INDEX idx_photo_consent_patient ON healthcare_photo_consent_forms(patient_name);
CREATE INDEX idx_photo_consent_expires ON healthcare_photo_consent_forms(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_before_after_photos_user ON healthcare_before_after_photos(user_id);
CREATE INDEX idx_before_after_photos_consent ON healthcare_before_after_photos(patient_consent_id);
CREATE INDEX idx_before_after_photos_status ON healthcare_before_after_photos(approval_status);
CREATE INDEX idx_before_after_photos_compliance ON healthcare_before_after_photos(ahpra_compliant);
CREATE INDEX idx_before_after_photos_treatment ON healthcare_before_after_photos(treatment_type);

CREATE INDEX idx_compliance_rules_category ON healthcare_photo_compliance_rules(rule_category);
CREATE INDEX idx_compliance_rules_active ON healthcare_photo_compliance_rules(active) WHERE active = true;

CREATE INDEX idx_review_history_photo ON healthcare_photo_review_history(photo_id);
CREATE INDEX idx_review_history_reviewer ON healthcare_photo_review_history(reviewer_id);

-- Functions for Photo Compliance Management

-- Function to check AHPRA compliance for a photo
CREATE OR REPLACE FUNCTION check_photo_ahpra_compliance(photo_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    photo_record healthcare_before_after_photos%ROWTYPE;
    consent_record healthcare_photo_consent_forms%ROWTYPE;
    violations TEXT[] := '{}';
    warnings TEXT[] := '{}';
    compliance_score INTEGER := 100;
    risk_level TEXT := 'low';
BEGIN
    -- Get photo record
    SELECT * INTO photo_record 
    FROM healthcare_before_after_photos 
    WHERE id = photo_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Photo not found');
    END IF;
    
    -- Get consent record if exists
    IF photo_record.patient_consent_id IS NOT NULL THEN
        SELECT * INTO consent_record 
        FROM healthcare_photo_consent_forms 
        WHERE id = photo_record.patient_consent_id;
    END IF;
    
    -- Check critical consent requirements
    IF NOT photo_record.consent_verified OR consent_record IS NULL THEN
        violations := array_append(violations, 'Patient consent not verified or missing');
        compliance_score := compliance_score - 50;
        risk_level := 'critical';
    END IF;
    
    IF consent_record IS NOT NULL AND NOT consent_record.marketing_consent THEN
        violations := array_append(violations, 'Explicit marketing consent not obtained');
        compliance_score := compliance_score - 30;
        risk_level := 'critical';
    END IF;
    
    -- Check disclaimer requirements
    IF photo_record.disclaimer_text IS NULL OR LENGTH(photo_record.disclaimer_text) < 100 THEN
        violations := array_append(violations, 'Inadequate or missing disclaimer text');
        compliance_score := compliance_score - 25;
        IF risk_level != 'critical' THEN risk_level := 'high'; END IF;
    END IF;
    
    -- Check disclaimer content
    IF photo_record.disclaimer_text IS NOT NULL THEN
        IF LOWER(photo_record.disclaimer_text) NOT LIKE '%individual results may vary%' THEN
            warnings := array_append(warnings, 'Disclaimer missing "individual results may vary"');
            compliance_score := compliance_score - 15;
        END IF;
        
        IF LOWER(photo_record.disclaimer_text) NOT LIKE '%not a guarantee%' THEN
            warnings := array_append(warnings, 'Disclaimer missing "not a guarantee"');
            compliance_score := compliance_score - 15;
        END IF;
    END IF;
    
    -- Check consent expiration
    IF consent_record IS NOT NULL THEN
        IF consent_record.expires_at IS NOT NULL AND consent_record.expires_at < NOW() THEN
            violations := array_append(violations, 'Consent has expired');
            compliance_score := compliance_score - 30;
            IF risk_level != 'critical' THEN risk_level := 'high'; END IF;
        END IF;
    END IF;
    
    -- Determine final risk level
    IF array_length(violations, 1) >= 3 THEN risk_level := 'critical';
    ELSIF array_length(violations, 1) >= 2 THEN risk_level := 'high';
    ELSIF array_length(violations, 1) >= 1 OR array_length(warnings, 1) >= 3 THEN risk_level := 'medium';
    END IF;
    
    compliance_score := GREATEST(0, compliance_score);
    
    RETURN jsonb_build_object(
        'is_compliant', array_length(violations, 1) = 0 AND compliance_score >= 80,
        'violations', violations,
        'warnings', warnings,
        'compliance_score', compliance_score,
        'risk_level', risk_level,
        'checked_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate AHPRA-compliant disclaimer
CREATE OR REPLACE FUNCTION generate_ahpra_disclaimer(
    treatment_type_param TEXT,
    specialty_param TEXT,
    practitioner_name_param TEXT DEFAULT 'Healthcare Professional',
    practice_location_param TEXT DEFAULT 'Australia'
)
RETURNS TEXT AS $$
BEGIN
    RETURN 'IMPORTANT DISCLAIMER: These before and after photos show results from ' ||
           treatment_type_param || ' treatment performed by ' || practitioner_name_param ||
           ', a qualified ' || specialty_param || ' practitioner in ' || practice_location_param ||
           '. Individual results may vary significantly and these images do not constitute a guarantee of specific outcomes. ' ||
           'Results depend on individual factors including skin type, medical history, lifestyle, and adherence to post-treatment care. ' ||
           'A thorough consultation and examination are required before any treatment recommendation. ' ||
           'All medical and cosmetic procedures carry risks and potential complications. These will be discussed during your consultation. ' ||
           'These images are published with explicit written patient consent and may not represent typical results. ' ||
           'Treatment should only be performed by qualified, registered healthcare professionals. ' ||
           'This practitioner is registered with AHPRA and adheres to professional advertising standards. ' ||
           'For more information or to discuss your individual needs, please book a consultation. ' ||
           'Results cannot be guaranteed and this content is for educational purposes only.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check consent expiration
CREATE OR REPLACE FUNCTION check_consent_expiration()
RETURNS VOID AS $$
BEGIN
    -- Update expired consent forms
    UPDATE healthcare_photo_consent_forms
    SET expires_at = consent_date + (duration_consent_months || ' months')::INTERVAL
    WHERE expires_at IS NULL AND duration_consent_months IS NOT NULL;
    
    -- Log expiring consents (within 30 days)
    INSERT INTO healthcare_team_audit_log (
        team_id, performed_by, action, action_type, details, compliance_impact
    )
    SELECT 
        NULL,
        practitioner_id,
        'Consent expiring soon',
        'compliance',
        jsonb_build_object(
            'consent_id', id,
            'patient_name', patient_name,
            'expires_at', expires_at,
            'days_until_expiry', EXTRACT(DAYS FROM expires_at - NOW())
        ),
        true
    FROM healthcare_photo_consent_forms
    WHERE expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    AND NOT EXISTS (
        SELECT 1 FROM healthcare_team_audit_log 
        WHERE action = 'Consent expiring soon' 
        AND details->>'consent_id' = healthcare_photo_consent_forms.id::text
        AND created_at > NOW() - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at columns
CREATE TRIGGER update_healthcare_photo_consent_forms_updated_at
    BEFORE UPDATE ON healthcare_photo_consent_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_before_after_photos_updated_at
    BEFORE UPDATE ON healthcare_before_after_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_photo_compliance_rules_updated_at
    BEFORE UPDATE ON healthcare_photo_compliance_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically check compliance when photo is uploaded
CREATE OR REPLACE FUNCTION auto_check_photo_compliance()
RETURNS TRIGGER AS $$
DECLARE
    compliance_result JSONB;
BEGIN
    -- Perform compliance check
    compliance_result := check_photo_ahpra_compliance(NEW.id);
    
    -- Update photo with compliance results
    NEW.compliance_score := (compliance_result->>'compliance_score')::INTEGER;
    NEW.risk_level := compliance_result->>'risk_level';
    NEW.ahpra_compliant := (compliance_result->>'is_compliant')::BOOLEAN;
    NEW.compliance_notes := compliance_result::TEXT;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_check_photo_compliance
    BEFORE INSERT OR UPDATE ON healthcare_before_after_photos
    FOR EACH ROW
    EXECUTE FUNCTION auto_check_photo_compliance();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON healthcare_photo_consent_forms TO authenticated;
GRANT SELECT, INSERT, UPDATE ON healthcare_before_after_photos TO authenticated;
GRANT SELECT ON healthcare_photo_compliance_rules TO authenticated;
GRANT SELECT, INSERT ON healthcare_photo_review_history TO authenticated;

-- Comments for documentation
COMMENT ON TABLE healthcare_photo_consent_forms IS 'Patient consent forms for before/after photo usage with detailed consent tracking';
COMMENT ON TABLE healthcare_before_after_photos IS 'Before and after photos with AHPRA compliance checking and approval workflow';
COMMENT ON TABLE healthcare_photo_compliance_rules IS 'Configurable compliance rules for automated photo checking';
COMMENT ON TABLE healthcare_photo_review_history IS 'Audit trail of photo review and approval actions';

COMMENT ON FUNCTION check_photo_ahpra_compliance(UUID) IS 'Comprehensive AHPRA compliance checking for before/after photos';
COMMENT ON FUNCTION generate_ahpra_disclaimer(TEXT, TEXT, TEXT, TEXT) IS 'Generates AHPRA-compliant disclaimer text for healthcare photos';
COMMENT ON FUNCTION check_consent_expiration() IS 'Checks and alerts for expiring patient consents'; 