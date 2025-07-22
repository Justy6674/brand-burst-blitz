-- TGA Therapeutic Claims Validation System
-- Comprehensive validation against TGA therapeutic advertising requirements

-- TGA prohibited claims library
CREATE TABLE tga_prohibited_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN (
        'therapeutic_outcome', 'therapeutic_action', 'preventive_claim',
        'medical_diagnosis', 'efficacy_comparison', 'outcome_guarantee',
        'safety_claim', 'device_classification', 'evidence_claim'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'minor')),
    tga_code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    alternatives TEXT[] DEFAULT '{}',
    tga_reference_url TEXT,
    penalty_score INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TGA medication advertising rules
CREATE TABLE tga_medication_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_name TEXT NOT NULL,
    brand_names TEXT[] DEFAULT '{}',
    restriction_level TEXT NOT NULL CHECK (restriction_level IN (
        'prohibited', 'restricted', 'prescription_only', 'schedule_specific'
    )),
    schedule_classification TEXT,
    allowed_claims TEXT[] DEFAULT '{}',
    prohibited_claims TEXT[] DEFAULT '{}',
    requires_disclaimer BOOLEAN DEFAULT true,
    disclaimer_text TEXT,
    tga_approval_required BOOLEAN DEFAULT false,
    advertising_restrictions JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TGA validation audit trail
CREATE TABLE tga_validation_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    practice_id UUID REFERENCES healthcare_practices(id),
    content_hash TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'blog_post', 'social_media', 'newsletter', 'website', 'advertisement'
    )),
    specialty TEXT NOT NULL CHECK (specialty IN (
        'gp', 'specialist', 'allied_health', 'psychology', 'dentistry', 'nursing'
    )),
    target_audience TEXT NOT NULL CHECK (target_audience IN (
        'patients', 'professionals', 'general_public'
    )),
    validation_result JSONB NOT NULL,
    is_compliant BOOLEAN DEFAULT false,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    requires_review BOOLEAN DEFAULT false,
    violation_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    validation_categories JSONB DEFAULT '{
        "therapeuticClaims": {"score": 100, "compliant": true},
        "drugMentions": {"score": 100, "compliant": true},
        "medicalDevices": {"score": 100, "compliant": true},
        "advertisingCompliance": {"score": 100, "compliant": true},
        "evidenceRequirements": {"score": 100, "compliant": true}
    }',
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by_user_id UUID REFERENCES auth.users(id),
    review_status TEXT DEFAULT 'pending' CHECK (review_status IN (
        'pending', 'approved', 'rejected', 'requires_modification'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TGA violation tracking
CREATE TABLE tga_validation_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    validation_audit_id UUID NOT NULL REFERENCES tga_validation_audit(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL CHECK (violation_type IN ('critical', 'major', 'minor')),
    violation_category TEXT NOT NULL CHECK (violation_category IN (
        'therapeutic_claims', 'drug_advertising', 'device_claims', 
        'evidence_requirements', 'misleading_claims'
    )),
    description TEXT NOT NULL,
    found_text TEXT NOT NULL,
    tga_reference TEXT,
    penalty_score INTEGER DEFAULT 0,
    suggested_fix TEXT,
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TGA compliance statistics for reporting
CREATE TABLE tga_compliance_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_id UUID REFERENCES healthcare_practices(id),
    specialty TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_validations INTEGER DEFAULT 0,
    compliant_validations INTEGER DEFAULT 0,
    compliance_rate DECIMAL(5,2) DEFAULT 0.00,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    common_violations JSONB DEFAULT '[]',
    improvement_trends JSONB DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for TGA validation system

-- TGA prohibited claims are public for validation
ALTER TABLE tga_prohibited_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TGA prohibited claims are public for validation"
    ON tga_prohibited_claims
    FOR SELECT
    TO authenticated
    USING (active = true);

-- Only admins can modify TGA claims
CREATE POLICY "Only admins can modify TGA prohibited claims"
    ON tga_prohibited_claims
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND u.raw_app_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND u.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- TGA medication rules are public for validation
ALTER TABLE tga_medication_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TGA medication rules are public for validation"
    ON tga_medication_rules
    FOR SELECT
    TO authenticated
    USING (active = true);

-- Users can access their own TGA validation audits
ALTER TABLE tga_validation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own TGA validation audits"
    ON tga_validation_audit
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid()
        OR practice_id IN (
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
        user_id = auth.uid()
        OR practice_id IN (
            SELECT hp.id FROM healthcare_practices hp
            WHERE hp.owner_id = auth.uid()
            OR hp.id IN (
                SELECT htm.practice_id FROM healthcare_team_members htm
                WHERE htm.user_id = auth.uid()
                AND htm.role IN ('owner', 'admin', 'manager')
                AND htm.status = 'active'
            )
        )
    );

-- Users can access violations for their audits
ALTER TABLE tga_validation_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access violations for their audits"
    ON tga_validation_violations
    FOR ALL
    TO authenticated
    USING (
        validation_audit_id IN (
            SELECT tva.id FROM tga_validation_audit tva
            WHERE tva.user_id = auth.uid()
            OR tva.practice_id IN (
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

-- Practice compliance statistics restricted to practice team
ALTER TABLE tga_compliance_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can access TGA compliance statistics"
    ON tga_compliance_statistics
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
CREATE INDEX idx_tga_prohibited_claims_claim ON tga_prohibited_claims(claim);
CREATE INDEX idx_tga_prohibited_claims_category ON tga_prohibited_claims(category);
CREATE INDEX idx_tga_prohibited_claims_severity ON tga_prohibited_claims(severity);
CREATE INDEX idx_tga_prohibited_claims_active ON tga_prohibited_claims(active);

CREATE INDEX idx_tga_medication_rules_drug_name ON tga_medication_rules(drug_name);
CREATE INDEX idx_tga_medication_rules_brand_names ON tga_medication_rules USING GIN (brand_names);
CREATE INDEX idx_tga_medication_rules_restriction ON tga_medication_rules(restriction_level);
CREATE INDEX idx_tga_medication_rules_active ON tga_medication_rules(active);

CREATE INDEX idx_tga_validation_audit_user ON tga_validation_audit(user_id);
CREATE INDEX idx_tga_validation_audit_practice ON tga_validation_audit(practice_id);
CREATE INDEX idx_tga_validation_audit_specialty ON tga_validation_audit(specialty);
CREATE INDEX idx_tga_validation_audit_compliant ON tga_validation_audit(is_compliant);
CREATE INDEX idx_tga_validation_audit_score ON tga_validation_audit(overall_score);
CREATE INDEX idx_tga_validation_audit_validated_at ON tga_validation_audit(validated_at);

CREATE INDEX idx_tga_violations_audit ON tga_validation_violations(validation_audit_id);
CREATE INDEX idx_tga_violations_type ON tga_validation_violations(violation_type);
CREATE INDEX idx_tga_violations_category ON tga_validation_violations(violation_category);
CREATE INDEX idx_tga_violations_resolved ON tga_validation_violations(resolved);

CREATE INDEX idx_tga_compliance_stats_practice ON tga_compliance_statistics(practice_id);
CREATE INDEX idx_tga_compliance_stats_specialty ON tga_compliance_statistics(specialty);
CREATE INDEX idx_tga_compliance_stats_period ON tga_compliance_statistics(period_start, period_end);

-- Functions for TGA validation

-- Function to validate content against TGA therapeutic claims
CREATE OR REPLACE FUNCTION validate_tga_therapeutic_claims(
    p_content TEXT
) RETURNS JSONB AS $$
DECLARE
    violation_count INTEGER := 0;
    total_penalty INTEGER := 0;
    violations JSONB := '[]'::jsonb;
    claim_record RECORD;
    content_lower TEXT;
BEGIN
    content_lower := LOWER(p_content);
    
    -- Check content against all active prohibited claims
    FOR claim_record IN 
        SELECT * FROM tga_prohibited_claims 
        WHERE active = true
        ORDER BY severity DESC
    LOOP
        -- Check if claim appears in content
        IF content_lower ~ ('\y' || LOWER(claim_record.claim) || '\y') THEN
            violation_count := violation_count + 1;
            total_penalty := total_penalty + claim_record.penalty_score;
            
            violations := violations || jsonb_build_object(
                'claim', claim_record.claim,
                'category', claim_record.category,
                'severity', claim_record.severity,
                'tgaCode', claim_record.tga_code,
                'description', claim_record.description,
                'alternatives', claim_record.alternatives,
                'penalty', claim_record.penalty_score
            );
        END IF;
    END LOOP;
    
    -- Return validation result
    RETURN jsonb_build_object(
        'isCompliant', violation_count = 0,
        'violationCount', violation_count,
        'totalPenalty', total_penalty,
        'complianceScore', GREATEST(0, 100 - total_penalty),
        'violations', violations,
        'validatedAt', NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Function to validate drug mentions
CREATE OR REPLACE FUNCTION validate_tga_drug_mentions(
    p_content TEXT
) RETURNS JSONB AS $$
DECLARE
    violation_count INTEGER := 0;
    total_penalty INTEGER := 0;
    violations JSONB := '[]'::jsonb;
    drug_record RECORD;
    brand_name TEXT;
    content_lower TEXT;
BEGIN
    content_lower := LOWER(p_content);
    
    -- Check content against all active medication rules
    FOR drug_record IN 
        SELECT * FROM tga_medication_rules 
        WHERE active = true
        ORDER BY restriction_level DESC
    LOOP
        -- Check for brand name mentions
        FOREACH brand_name IN ARRAY drug_record.brand_names
        LOOP
            IF content_lower ~ ('\y' || LOWER(brand_name) || '\y') THEN
                violation_count := violation_count + 1;
                total_penalty := total_penalty + 
                    CASE drug_record.restriction_level
                        WHEN 'prohibited' THEN 50
                        WHEN 'prescription_only' THEN 40
                        WHEN 'restricted' THEN 30
                        ELSE 20
                    END;
                
                violations := violations || jsonb_build_object(
                    'drugName', drug_record.drug_name,
                    'brandName', brand_name,
                    'restrictionLevel', drug_record.restriction_level,
                    'requiresDisclaimer', drug_record.requires_disclaimer,
                    'penalty', CASE drug_record.restriction_level
                        WHEN 'prohibited' THEN 50
                        WHEN 'prescription_only' THEN 40
                        WHEN 'restricted' THEN 30
                        ELSE 20
                    END
                );
            END IF;
        END LOOP;
    END LOOP;
    
    -- Return validation result
    RETURN jsonb_build_object(
        'isCompliant', violation_count = 0,
        'violationCount', violation_count,
        'totalPenalty', total_penalty,
        'complianceScore', GREATEST(0, 100 - total_penalty),
        'violations', violations,
        'validatedAt', NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate TGA compliance report
CREATE OR REPLACE FUNCTION generate_tga_compliance_report(
    p_practice_id UUID,
    p_period_days INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
    period_start TIMESTAMPTZ;
    period_end TIMESTAMPTZ;
    total_validations INTEGER;
    compliant_validations INTEGER;
    compliance_rate DECIMAL(5,2);
    average_score DECIMAL(5,2);
    common_violations JSONB;
    report JSONB;
BEGIN
    period_end := NOW();
    period_start := period_end - (p_period_days || ' days')::INTERVAL;
    
    -- Get validation statistics
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE is_compliant = true),
        ROUND(AVG(overall_score), 2)
    INTO total_validations, compliant_validations, average_score
    FROM tga_validation_audit
    WHERE practice_id = p_practice_id
    AND validated_at BETWEEN period_start AND period_end;
    
    -- Calculate compliance rate
    compliance_rate := CASE 
        WHEN total_validations > 0 THEN 
            ROUND((compliant_validations::DECIMAL / total_validations) * 100, 2)
        ELSE 0.00
    END;
    
    -- Get common violations
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', violation_category,
            'count', violation_count,
            'percentage', ROUND((violation_count::DECIMAL / total_validations) * 100, 1)
        )
    )
    INTO common_violations
    FROM (
        SELECT 
            tvv.violation_category,
            COUNT(*) as violation_count
        FROM tga_validation_violations tvv
        JOIN tga_validation_audit tva ON tvv.validation_audit_id = tva.id
        WHERE tva.practice_id = p_practice_id
        AND tva.validated_at BETWEEN period_start AND period_end
        GROUP BY tvv.violation_category
        ORDER BY COUNT(*) DESC
        LIMIT 5
    ) violations_summary;
    
    -- Build report
    report := jsonb_build_object(
        'practiceId', p_practice_id,
        'periodStart', period_start,
        'periodEnd', period_end,
        'totalValidations', total_validations,
        'compliantValidations', compliant_validations,
        'complianceRate', compliance_rate,
        'averageScore', average_score,
        'commonViolations', COALESCE(common_violations, '[]'::jsonb),
        'generatedAt', NOW()
    );
    
    -- Store compliance statistics
    INSERT INTO tga_compliance_statistics (
        practice_id,
        specialty,
        period_start,
        period_end,
        total_validations,
        compliant_validations,
        compliance_rate,
        average_score,
        common_violations
    ) VALUES (
        p_practice_id,
        'general', -- Would be enhanced to track by specialty
        period_start,
        period_end,
        total_validations,
        compliant_validations,
        compliance_rate,
        average_score,
        common_violations
    );
    
    RETURN report;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create violations from audit results
CREATE OR REPLACE FUNCTION create_tga_violations_from_audit()
RETURNS TRIGGER AS $$
DECLARE
    violation JSONB;
BEGIN
    -- Extract violations from validation result and create violation records
    FOR violation IN SELECT jsonb_array_elements(NEW.validation_result->'violations')
    LOOP
        INSERT INTO tga_validation_violations (
            validation_audit_id,
            violation_type,
            violation_category,
            description,
            found_text,
            tga_reference,
            penalty_score,
            suggested_fix
        ) VALUES (
            NEW.id,
            violation->>'type',
            violation->>'category',
            violation->>'description',
            violation->>'foundText',
            violation->>'tgaReference',
            (violation->>'penalty')::INTEGER,
            violation->>'suggestedFix'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic violation creation
CREATE TRIGGER create_violations_from_tga_audit
    AFTER INSERT ON tga_validation_audit
    FOR EACH ROW
    EXECUTE FUNCTION create_tga_violations_from_audit();

-- Create updated_at triggers
CREATE TRIGGER update_tga_prohibited_claims_updated_at
    BEFORE UPDATE ON tga_prohibited_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tga_medication_rules_updated_at
    BEFORE UPDATE ON tga_medication_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert TGA prohibited claims data
INSERT INTO tga_prohibited_claims (
    claim, category, severity, tga_code, description, alternatives, penalty_score
) VALUES 
-- Critical therapeutic claims
('cure', 'therapeutic_outcome', 'critical', 'TGA-TC-001', 'Claims to cure diseases without therapeutic approval', ARRAY['may help manage', 'supports treatment of', 'assists in managing'], 30),
('treat', 'therapeutic_action', 'major', 'TGA-TC-002', 'Treatment claims require therapeutic approval', ARRAY['may support', 'can assist with', 'helps maintain'], 25),
('prevent', 'preventive_claim', 'major', 'TGA-TC-003', 'Prevention claims require substantial evidence', ARRAY['may reduce risk of', 'supports healthy', 'contributes to'], 25),
('heal', 'therapeutic_outcome', 'critical', 'TGA-TC-004', 'Healing claims are therapeutic and regulated', ARRAY['supports recovery', 'aids healing process', 'assists recovery'], 30),
('diagnose', 'medical_diagnosis', 'critical', 'TGA-TC-005', 'Diagnostic claims are medical device claims', ARRAY['may indicate', 'could suggest', 'provides information about'], 35),

-- Efficacy and outcome claims
('most effective', 'efficacy_comparison', 'major', 'TGA-EC-001', 'Comparative efficacy claims require clinical evidence', ARRAY['effective', 'clinically proven', 'evidence-based'], 25),
('guaranteed results', 'outcome_guarantee', 'critical', 'TGA-EC-002', 'Outcome guarantees are prohibited in therapeutic advertising', ARRAY['clinically shown', 'studies indicate', 'may provide'], 40),
('side effect free', 'safety_claim', 'major', 'TGA-SC-001', 'Absolute safety claims are misleading', ARRAY['generally well tolerated', 'low incidence of side effects', 'consult healthcare provider'], 25),

-- Device and quality claims
('medical grade', 'device_classification', 'major', 'TGA-MD-001', 'Medical grade claims imply TGA classification', ARRAY['professional standard', 'clinical quality', 'healthcare standard'], 20),
('clinically proven', 'evidence_claim', 'minor', 'TGA-EV-001', 'Clinical evidence claims must be substantiated', ARRAY['studies suggest', 'research indicates', 'evidence supports'], 15);

-- Insert TGA medication rules data
INSERT INTO tga_medication_rules (
    drug_name, brand_names, restriction_level, prohibited_claims, requires_disclaimer, disclaimer_text
) VALUES 
('botulinum_toxin', 
 ARRAY['botox', 'dysport', 'xeomin', 'jeuveau'], 
 'prescription_only', 
 ARRAY['cosmetic enhancement', 'anti-aging', 'wrinkle removal', 'fountain of youth'],
 true,
 'This is a prescription medicine and requires medical consultation and approval.'),
 
('hyaluronic_acid', 
 ARRAY['juvederm', 'restylane', 'belotero', 'teosyal'], 
 'prescription_only', 
 ARRAY['permanent results', 'fountain of youth', 'age reversal', 'instant transformation'],
 true,
 'Results are temporary and individual results may vary. Medical consultation required.'),
 
('cannabis_products', 
 ARRAY['cbd', 'thc', 'medical cannabis', 'medicinal cannabis'], 
 'restricted', 
 ARRAY['cure all', 'miracle medicine', 'natural cure', 'healing everything'],
 true,
 'Medical cannabis is a controlled substance requiring prescription and medical supervision.');

COMMENT ON TABLE tga_prohibited_claims IS 'Library of therapeutic claims prohibited under TGA advertising guidelines';
COMMENT ON TABLE tga_medication_rules IS 'TGA medication advertising rules and restrictions';
COMMENT ON TABLE tga_validation_audit IS 'Comprehensive audit trail for TGA therapeutic advertising validation';
COMMENT ON TABLE tga_validation_violations IS 'Detailed tracking of TGA compliance violations';
COMMENT ON TABLE tga_compliance_statistics IS 'Practice-level TGA compliance statistics and trends'; 