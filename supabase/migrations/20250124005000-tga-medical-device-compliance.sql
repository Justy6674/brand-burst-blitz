-- TGA Medical Device Promotion Compliance Migration
-- Australian Therapeutic Goods Administration medical device advertising compliance

-- TGA Medical Devices Registry Table
CREATE TABLE tga_medical_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name TEXT NOT NULL,
    tga_registration_number TEXT UNIQUE,
    artg_id TEXT, -- Australian Register of Therapeutic Goods ID
    classification TEXT NOT NULL CHECK (classification IN ('Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD')),
    sponsor_name TEXT NOT NULL,
    sponsor_contact TEXT,
    intended_purpose TEXT NOT NULL,
    therapeutic_claims TEXT[] DEFAULT '{}',
    contraindications TEXT[] DEFAULT '{}',
    warnings TEXT[] DEFAULT '{}',
    precautions TEXT[] DEFAULT '{}',
    
    -- Registration Status
    listing_status TEXT NOT NULL DEFAULT 'Listed' CHECK (listing_status IN ('Listed', 'Registered', 'Exempt', 'Under Review', 'Cancelled', 'Suspended')),
    registration_date DATE,
    expiry_date DATE,
    last_updated_tga DATE,
    
    -- Compliance Requirements
    adverse_event_reporting BOOLEAN DEFAULT false,
    post_market_surveillance BOOLEAN DEFAULT false,
    advertising_restrictions TEXT[] DEFAULT '{}',
    consumer_advertising_allowed BOOLEAN DEFAULT true,
    professional_only BOOLEAN DEFAULT false,
    
    -- Device Details
    device_category TEXT,
    manufacturer_name TEXT,
    manufacturer_country TEXT,
    regulatory_pathway TEXT,
    essential_principles_met BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata
    import_source TEXT DEFAULT 'manual',
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'needs_update'))
);

-- TGA Device Promotions Table
CREATE TABLE tga_device_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES tga_medical_devices(id) ON DELETE CASCADE,
    
    -- Content Details
    content_type TEXT NOT NULL CHECK (content_type IN ('social_post', 'blog_article', 'website_content', 'advertisement', 'brochure', 'email_campaign')),
    content_text TEXT NOT NULL,
    content_images TEXT[] DEFAULT '{}',
    content_videos TEXT[] DEFAULT '{}',
    
    -- Targeting and Claims
    target_audience TEXT NOT NULL CHECK (target_audience IN ('healthcare_professionals', 'consumers', 'patients', 'mixed')),
    promotional_claims TEXT[] DEFAULT '{}',
    evidence_references TEXT[] DEFAULT '{}',
    call_to_action TEXT,
    
    -- TGA Compliance
    tga_compliant BOOLEAN DEFAULT false,
    compliance_score INTEGER DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),
    compliance_notes TEXT,
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Required Disclosures
    required_disclosures TEXT[] DEFAULT '{}',
    disclosure_placement TEXT,
    sponsor_identification BOOLEAN DEFAULT false,
    device_classification_disclosed BOOLEAN DEFAULT false,
    
    -- Review and Approval
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'requires_changes')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Publication
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    published_platforms TEXT[] DEFAULT '{}',
    scheduled_publication TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Archival
    archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    archive_reason TEXT
);

-- TGA Compliance Rules Table
CREATE TABLE tga_compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code TEXT NOT NULL UNIQUE,
    rule_category TEXT NOT NULL CHECK (rule_category IN ('device_classification', 'advertising', 'claims', 'disclosure', 'safety', 'evidence')),
    rule_description TEXT NOT NULL,
    rule_details TEXT,
    
    -- Applicability
    applicable_classes TEXT[] DEFAULT ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'],
    audience_restrictions TEXT[] DEFAULT '{}',
    content_type_restrictions TEXT[] DEFAULT '{}',
    
    -- Compliance Scoring
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    penalty_score INTEGER DEFAULT 0,
    
    -- Rule Logic
    rule_conditions JSONB NOT NULL DEFAULT '{}',
    auto_check BOOLEAN DEFAULT true,
    manual_review_required BOOLEAN DEFAULT false,
    
    -- Status
    active BOOLEAN DEFAULT true,
    effective_date DATE DEFAULT CURRENT_DATE,
    superseded_by UUID REFERENCES tga_compliance_rules(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TGA Compliance Violations Table
CREATE TABLE tga_compliance_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES tga_device_promotions(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES tga_compliance_rules(id),
    violation_type TEXT NOT NULL CHECK (violation_type IN ('automatic', 'manual', 'reported')),
    violation_description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    
    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert comprehensive TGA compliance rules
INSERT INTO tga_compliance_rules (
    rule_code, rule_category, rule_description, rule_details, applicable_classes, 
    severity, penalty_score, rule_conditions, manual_review_required
) VALUES 

-- Device Classification Rules
('TGA-DEV-001', 'device_classification', 'Class III/AIMD devices cannot be advertised to consumers', 
 'Class III and AIMD devices are high-risk and must only be promoted to healthcare professionals',
 ARRAY['Class III', 'AIMD'], 'critical', 60,
 '{"target_audience": {"not_allowed": ["consumers", "patients", "mixed"]}}'::jsonb, true),

('TGA-DEV-002', 'device_classification', 'Unregistered Class II/III devices cannot be promoted',
 'Class IIa, IIb, III and AIMD devices must be TGA registered before promotion',
 ARRAY['Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'critical', 50,
 '{"requires": ["tga_registration_number"], "listing_status": ["Listed", "Registered"]}'::jsonb, false),

('TGA-DEV-003', 'device_classification', 'Device classification must be disclosed for Class II+ devices',
 'Higher risk devices must clearly state their classification in promotional material',
 ARRAY['Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'error', 25,
 '{"content_requirements": ["classification_disclosed"]}'::jsonb, false),

-- Advertising Rules
('TGA-ADV-001', 'advertising', 'Prohibited therapeutic claims detected',
 'Certain therapeutic terms are prohibited in medical device advertising',
 ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'critical', 40,
 '{"prohibited_terms": ["cure", "miracle", "guaranteed", "completely safe", "no side effects"]}'::jsonb, false),

('TGA-ADV-002', 'advertising', 'Evidence-based claims must be substantiated',
 'Claims about device performance must be supported by appropriate evidence',
 ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'error', 30,
 '{"evidence_claims": ["clinically proven", "studies show", "research demonstrates"], "requires": ["evidence_references"]}'::jsonb, true),

('TGA-ADV-003', 'advertising', 'Device sponsor must be identified',
 'The TGA sponsor of the device must be clearly identified in promotional material',
 ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'warning', 15,
 '{"content_requirements": ["sponsor_identification"]}'::jsonb, false),

('TGA-ADV-004', 'advertising', 'Inappropriate comparative claims',
 'Comparative claims against other devices must be fair and substantiated',
 ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'error', 25,
 '{"comparative_terms": ["better than", "superior to", "more effective"], "requires": ["comparative_evidence"]}'::jsonb, true),

-- Claims Validation Rules
('TGA-CLM-001', 'claims', 'Therapeutic claims exceed approved indications',
 'Promotional claims must not exceed the approved therapeutic indications',
 ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'critical', 45,
 '{"check": "claims_within_indications"}'::jsonb, true),

('TGA-CLM-002', 'claims', 'Unsubstantiated performance claims',
 'Device performance claims must be based on appropriate clinical evidence',
 ARRAY['Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'error', 30,
 '{"performance_claims": true, "requires": ["clinical_evidence"]}'::jsonb, true),

('TGA-CLM-003', 'claims', 'Safety claims without adequate basis',
 'Safety claims must be supported by appropriate safety data',
 ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'error', 25,
 '{"safety_claims": true, "requires": ["safety_evidence"]}'::jsonb, true),

-- Disclosure Requirements
('TGA-DIS-001', 'disclosure', 'Missing medical device identification',
 'Content must clearly identify that the product is a medical device',
 ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'error', 20,
 '{"content_requirements": ["medical_device_identification"]}'::jsonb, false),

('TGA-DIS-002', 'disclosure', 'Inadequate contraindication disclosure',
 'Devices with contraindications must reference this in promotional material',
 ARRAY['Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'warning', 15,
 '{"has_contraindications": true, "content_requirements": ["contraindication_reference"]}'::jsonb, false),

('TGA-DIS-003', 'disclosure', 'Missing adverse event reporting information',
 'High-risk devices must include adverse event reporting information',
 ARRAY['Class IIb', 'Class III', 'AIMD'], 'warning', 10,
 '{"adverse_event_reporting": true, "content_requirements": ["ae_reporting_info"]}'::jsonb, false),

('TGA-DIS-004', 'disclosure', 'Insufficient professional consultation guidance',
 'Higher risk devices must emphasize professional consultation requirement',
 ARRAY['Class IIb', 'Class III', 'AIMD'], 'warning', 15,
 '{"content_requirements": ["professional_consultation"]}'::jsonb, false),

-- Safety Rules
('TGA-SAF-001', 'safety', 'Missing risk information disclosure',
 'Promotional material must not downplay or omit important risk information',
 ARRAY['Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'error', 30,
 '{"risk_disclosure": "required"}'::jsonb, true),

('TGA-SAF-002', 'safety', 'Misleading safety representations',
 'Content must not misleadingly represent the safety profile of the device',
 ARRAY['Class I', 'Class IIa', 'Class IIb', 'Class III', 'AIMD'], 'critical', 35,
 '{"misleading_safety": "prohibited"}'::jsonb, true);

-- Insert sample medical devices for testing
INSERT INTO tga_medical_devices (
    device_name, tga_registration_number, artg_id, classification, sponsor_name, 
    intended_purpose, therapeutic_claims, contraindications, warnings,
    listing_status, adverse_event_reporting, consumer_advertising_allowed
) VALUES 

-- Class I Devices
('Disposable Medical Gloves', NULL, 'ARTG-12345', 'Class I', 'Medical Supplies Australia',
 'Protective barrier for medical procedures', ARRAY['Hand protection', 'Barrier protection'], 
 ARRAY['Latex allergy'], ARRAY['Single use only', 'Check for tears before use'],
 'Listed', false, true),

('Digital Thermometer', 'TGA-THERM-001', 'ARTG-23456', 'Class I', 'Health Devices Pty Ltd',
 'Body temperature measurement', ARRAY['Temperature monitoring'], 
 ARRAY[], ARRAY['Clean after each use', 'Calibrate regularly'],
 'Listed', false, true),

-- Class IIa Devices  
('Blood Pressure Monitor', 'TGA-BP-002', 'ARTG-34567', 'Class IIa', 'CardioTech Australia',
 'Non-invasive blood pressure measurement', ARRAY['Blood pressure monitoring', 'Hypertension management'], 
 ARRAY['Arrhythmia patients'], ARRAY['Not for continuous monitoring', 'Consult doctor for abnormal readings'],
 'Registered', true, true),

('Pulse Oximeter', 'TGA-OX-003', 'ARTG-45678', 'Class IIa', 'Respiratory Solutions Ltd',
 'Non-invasive oxygen saturation measurement', ARRAY['Oxygen saturation monitoring'], 
 ARRAY['Motion artifacts'], ARRAY['Not for continuous monitoring', 'Medical interpretation required'],
 'Registered', true, false),

-- Class IIb Devices
('Laser Therapy Device', 'TGA-LASER-004', 'ARTG-56789', 'Class IIb', 'Advanced Therapeutics Inc',
 'Low-level laser therapy for pain management', ARRAY['Pain relief', 'Tissue healing'], 
 ARRAY['Pregnancy', 'Cancer patients', 'Light sensitivity'], ARRAY['Eye protection required', 'Professional supervision'],
 'Registered', true, false),

-- Class III Devices
('Implantable Heart Monitor', 'TGA-HEART-005', 'ARTG-67890', 'Class III', 'Cardiac Implants Australia',
 'Continuous cardiac rhythm monitoring', ARRAY['Arrhythmia detection', 'Heart monitoring'], 
 ARRAY['MRI incompatibility', 'Infection risk'], ARRAY['Surgical implantation required', 'Regular follow-up needed'],
 'Registered', true, false),

-- AIMD Devices
('Pacemaker System', 'TGA-PACE-006', 'ARTG-78901', 'AIMD', 'Cardiac Devices International',
 'Cardiac rhythm management', ARRAY['Bradycardia treatment', 'Heart rhythm regulation'], 
 ARRAY['Unipolar pacing', 'Lead complications'], ARRAY['MRI restrictions', 'Regular device checks required'],
 'Registered', true, false);

-- Row Level Security Policies

-- TGA Medical Devices RLS
ALTER TABLE tga_medical_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read TGA devices" ON tga_medical_devices
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage TGA devices" ON tga_medical_devices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- TGA Device Promotions RLS
ALTER TABLE tga_device_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own device promotions" ON tga_device_promotions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all device promotions" ON tga_device_promotions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- TGA Compliance Rules RLS
ALTER TABLE tga_compliance_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read TGA compliance rules" ON tga_compliance_rules
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage TGA compliance rules" ON tga_compliance_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- TGA Compliance Violations RLS
ALTER TABLE tga_compliance_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view violations of own promotions" ON tga_compliance_violations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tga_device_promotions 
            WHERE id = promotion_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admin can view all violations" ON tga_compliance_violations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Indexes for Performance
CREATE INDEX idx_tga_devices_classification ON tga_medical_devices(classification);
CREATE INDEX idx_tga_devices_sponsor ON tga_medical_devices(sponsor_name);
CREATE INDEX idx_tga_devices_status ON tga_medical_devices(listing_status);
CREATE INDEX idx_tga_devices_registration ON tga_medical_devices(tga_registration_number) WHERE tga_registration_number IS NOT NULL;
CREATE INDEX idx_tga_devices_artg ON tga_medical_devices(artg_id) WHERE artg_id IS NOT NULL;

CREATE INDEX idx_tga_promotions_user ON tga_device_promotions(user_id);
CREATE INDEX idx_tga_promotions_device ON tga_device_promotions(device_id);
CREATE INDEX idx_tga_promotions_status ON tga_device_promotions(approval_status);
CREATE INDEX idx_tga_promotions_compliance ON tga_device_promotions(tga_compliant);
CREATE INDEX idx_tga_promotions_risk ON tga_device_promotions(risk_level);

CREATE INDEX idx_tga_rules_category ON tga_compliance_rules(rule_category);
CREATE INDEX idx_tga_rules_active ON tga_compliance_rules(active) WHERE active = true;
CREATE INDEX idx_tga_rules_classes ON tga_compliance_rules USING GIN(applicable_classes);

CREATE INDEX idx_tga_violations_promotion ON tga_compliance_violations(promotion_id);
CREATE INDEX idx_tga_violations_rule ON tga_compliance_violations(rule_id);
CREATE INDEX idx_tga_violations_resolved ON tga_compliance_violations(resolved);

-- Functions for TGA Compliance Management

-- Function to validate TGA device promotion compliance
CREATE OR REPLACE FUNCTION validate_tga_device_compliance(promotion_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    promotion_record tga_device_promotions%ROWTYPE;
    device_record tga_medical_devices%ROWTYPE;
    compliance_rules tga_compliance_rules[];
    violations TEXT[] := '{}';
    warnings TEXT[] := '{}';
    compliance_score INTEGER := 100;
    risk_level TEXT := 'low';
    rule RECORD;
BEGIN
    -- Get promotion record
    SELECT * INTO promotion_record 
    FROM tga_device_promotions 
    WHERE id = promotion_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Promotion not found');
    END IF;
    
    -- Get device record
    SELECT * INTO device_record 
    FROM tga_medical_devices 
    WHERE id = promotion_record.device_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Device not found');
    END IF;
    
    -- Check device registration for higher risk classes
    IF device_record.classification IN ('Class IIa', 'Class IIb', 'Class III', 'AIMD') THEN
        IF device_record.tga_registration_number IS NULL THEN
            violations := array_append(violations, 'Device must be TGA registered for ' || device_record.classification);
            compliance_score := compliance_score - 50;
            risk_level := 'critical';
        END IF;
    END IF;
    
    -- Check listing status
    IF device_record.listing_status NOT IN ('Listed', 'Registered') THEN
        violations := array_append(violations, 'Device listing status "' || device_record.listing_status || '" not valid for promotion');
        compliance_score := compliance_score - 40;
        risk_level := 'critical';
    END IF;
    
    -- Check audience restrictions for high-risk devices
    IF device_record.classification IN ('Class III', 'AIMD') AND 
       promotion_record.target_audience IN ('consumers', 'patients', 'mixed') THEN
        violations := array_append(violations, device_record.classification || ' devices cannot be advertised to consumers');
        compliance_score := compliance_score - 60;
        risk_level := 'critical';
    END IF;
    
    -- Check for prohibited terms
    FOR rule IN 
        SELECT * FROM tga_compliance_rules 
        WHERE active = true 
        AND device_record.classification = ANY(applicable_classes)
        AND rule_category = 'advertising'
        AND rule_code = 'TGA-ADV-001'
    LOOP
        -- Check for prohibited therapeutic claims
        IF promotion_record.content_text ~* '(cure|miracle|guaranteed|completely safe|no side effects)' THEN
            violations := array_append(violations, 'Prohibited therapeutic claims detected');
            compliance_score := compliance_score - 40;
            IF risk_level != 'critical' THEN risk_level := 'high'; END IF;
        END IF;
    END LOOP;
    
    -- Check disclosure requirements
    IF NOT promotion_record.content_text ~* 'medical device' THEN
        warnings := array_append(warnings, 'Content should identify product as medical device');
        compliance_score := compliance_score - 15;
    END IF;
    
    IF device_record.classification != 'Class I' AND 
       NOT promotion_record.content_text ~* '(consult|healthcare professional|doctor)' THEN
        warnings := array_append(warnings, 'Higher risk devices should reference professional consultation');
        compliance_score := compliance_score - 20;
    END IF;
    
    -- Check sponsor identification
    IF NOT promotion_record.content_text ~* device_record.sponsor_name THEN
        warnings := array_append(warnings, 'Device sponsor should be identified');
        compliance_score := compliance_score - 10;
    END IF;
    
    -- Final risk assessment
    IF array_length(violations, 1) >= 3 THEN risk_level := 'critical';
    ELSIF array_length(violations, 1) >= 2 THEN risk_level := 'high';
    ELSIF array_length(violations, 1) >= 1 OR array_length(warnings, 1) >= 4 THEN risk_level := 'medium';
    END IF;
    
    compliance_score := GREATEST(0, compliance_score);
    
    RETURN jsonb_build_object(
        'is_compliant', array_length(violations, 1) = 0 AND compliance_score >= 80,
        'violations', violations,
        'warnings', warnings,
        'compliance_score', compliance_score,
        'risk_level', risk_level,
        'device_classification', device_record.classification,
        'device_name', device_record.device_name,
        'checked_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate TGA compliant disclosure
CREATE OR REPLACE FUNCTION generate_tga_device_disclosure(
    device_uuid UUID,
    content_type_param TEXT DEFAULT 'social_post'
)
RETURNS TEXT AS $$
DECLARE
    device_record tga_medical_devices%ROWTYPE;
    disclosure TEXT := '';
BEGIN
    SELECT * INTO device_record 
    FROM tga_medical_devices 
    WHERE id = device_uuid;
    
    IF NOT FOUND THEN
        RETURN 'Error: Device not found';
    END IF;
    
    -- Base device identification
    disclosure := device_record.device_name || ' is a ' || device_record.classification || ' medical device';
    
    IF device_record.tga_registration_number IS NOT NULL THEN
        disclosure := disclosure || ' (TGA: ' || device_record.tga_registration_number || ')';
    END IF;
    
    disclosure := disclosure || ' sponsored by ' || device_record.sponsor_name || '. ';
    
    -- Classification-specific warnings
    CASE device_record.classification
        WHEN 'Class III', 'AIMD' THEN
            disclosure := disclosure || 'This is a high-risk medical device requiring specialist medical supervision. Consult your specialist before use. ';
        WHEN 'Class IIb' THEN
            disclosure := disclosure || 'This medical device requires healthcare professional guidance. ';
        WHEN 'Class IIa' THEN
            disclosure := disclosure || 'Consult your healthcare professional before use. ';
        ELSE
            disclosure := disclosure || 'Read all instructions before use. ';
    END CASE;
    
    -- General warnings
    disclosure := disclosure || 'Individual results may vary. This device is intended for the stated purpose only. ';
    
    -- Contraindications
    IF array_length(device_record.contraindications, 1) > 0 THEN
        disclosure := disclosure || 'See product information for contraindications, warnings and precautions. ';
    END IF;
    
    -- Adverse event reporting
    IF device_record.adverse_event_reporting THEN
        disclosure := disclosure || 'Report any adverse events to TGA and the device sponsor. ';
    END IF;
    
    disclosure := disclosure || 'For more information, consult your healthcare professional.';
    
    RETURN disclosure;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at columns
CREATE TRIGGER update_tga_medical_devices_updated_at
    BEFORE UPDATE ON tga_medical_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tga_device_promotions_updated_at
    BEFORE UPDATE ON tga_device_promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tga_compliance_rules_updated_at
    BEFORE UPDATE ON tga_compliance_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically validate TGA compliance
CREATE OR REPLACE FUNCTION auto_validate_tga_compliance()
RETURNS TRIGGER AS $$
DECLARE
    compliance_result JSONB;
BEGIN
    -- Perform TGA compliance validation
    compliance_result := validate_tga_device_compliance(NEW.id);
    
    -- Update promotion with compliance results
    NEW.compliance_score := (compliance_result->>'compliance_score')::INTEGER;
    NEW.risk_level := compliance_result->>'risk_level';
    NEW.tga_compliant := (compliance_result->>'is_compliant')::BOOLEAN;
    NEW.compliance_notes := compliance_result::TEXT;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_validate_tga_compliance
    BEFORE INSERT OR UPDATE ON tga_device_promotions
    FOR EACH ROW
    EXECUTE FUNCTION auto_validate_tga_compliance();

-- Grant necessary permissions
GRANT SELECT ON tga_medical_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON tga_device_promotions TO authenticated;
GRANT SELECT ON tga_compliance_rules TO authenticated;
GRANT SELECT, INSERT ON tga_compliance_violations TO authenticated;

-- Comments for documentation
COMMENT ON TABLE tga_medical_devices IS 'TGA medical device registry with classification and compliance requirements';
COMMENT ON TABLE tga_device_promotions IS 'Medical device promotional content with TGA compliance validation';
COMMENT ON TABLE tga_compliance_rules IS 'TGA advertising and promotion compliance rules by device classification';
COMMENT ON TABLE tga_compliance_violations IS 'Compliance violations detected in device promotions';

COMMENT ON FUNCTION validate_tga_device_compliance(UUID) IS 'Validates TGA compliance for medical device promotional content';
COMMENT ON FUNCTION generate_tga_device_disclosure(UUID, TEXT) IS 'Generates TGA-compliant disclosure text for medical device promotion'; 