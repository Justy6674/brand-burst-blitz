-- AHPRA-Compliant AI Content Generator
-- Database schema for healthcare content generation with compliance tracking

-- Audit table for all generated healthcare content
CREATE TABLE healthcare_generated_content_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content_text TEXT NOT NULL,
    specialty TEXT NOT NULL CHECK (specialty IN (
        'gp', 'specialist', 'allied_health', 'psychology', 'dentistry', 'nursing'
    )),
    content_type TEXT NOT NULL CHECK (content_type IN (
        'blog_post', 'social_media', 'newsletter', 'patient_education', 'website_content'
    )),
    target_platform TEXT CHECK (target_platform IN (
        'facebook', 'instagram', 'linkedin', 'website', 'email'
    )),
    ahpra_compliant BOOLEAN DEFAULT false,
    tga_compliant BOOLEAN DEFAULT false,
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    content_metadata JSONB DEFAULT '{
        "wordCount": 0,
        "readabilityScore": 0,
        "professionalLanguageScore": 0,
        "patientAppropriateScore": 0
    }',
    practice_specifics JSONB DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    practice_id UUID REFERENCES healthcare_practices(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content generation templates for healthcare specialties
CREATE TABLE healthcare_content_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    specialty TEXT NOT NULL CHECK (specialty IN (
        'gp', 'specialist', 'allied_health', 'psychology', 'dentistry', 'nursing'
    )),
    content_type TEXT NOT NULL CHECK (content_type IN (
        'blog_post', 'social_media', 'newsletter', 'patient_education', 'website_content'
    )),
    template_name TEXT NOT NULL,
    prompt_structure TEXT NOT NULL,
    compliance_instructions TEXT[] DEFAULT '{}',
    tone_guidelines TEXT NOT NULL,
    specialty_requirements TEXT[] DEFAULT '{}',
    example_content TEXT,
    ahpra_approved BOOLEAN DEFAULT false,
    tga_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(specialty, content_type, template_name)
);

-- Compliance validation results for content
CREATE TABLE healthcare_content_compliance_validation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_audit_id UUID NOT NULL REFERENCES healthcare_generated_content_audit(id) ON DELETE CASCADE,
    validation_type TEXT NOT NULL CHECK (validation_type IN (
        'ahpra_guidelines', 'tga_therapeutic', 'professional_boundaries', 
        'patient_testimonials', 'therapeutic_claims', 'medical_disclaimers'
    )),
    is_compliant BOOLEAN DEFAULT false,
    compliance_details JSONB NOT NULL DEFAULT '{}',
    violation_reasons TEXT[] DEFAULT '{}',
    suggested_improvements TEXT[] DEFAULT '{}',
    auto_generated BOOLEAN DEFAULT true,
    manual_review_required BOOLEAN DEFAULT false,
    reviewed_by_user_id UUID REFERENCES auth.users(id),
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content generation requests log
CREATE TABLE healthcare_content_generation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    practice_id UUID REFERENCES healthcare_practices(id),
    request_data JSONB NOT NULL,
    generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN (
        'pending', 'processing', 'completed', 'failed', 'compliance_review'
    )),
    generated_content_id UUID REFERENCES healthcare_generated_content_audit(id),
    error_message TEXT,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Healthcare hashtag library for compliant social media
CREATE TABLE healthcare_hashtag_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hashtag TEXT NOT NULL UNIQUE,
    specialty TEXT[] DEFAULT '{}',
    content_type TEXT[] DEFAULT '{}',
    platform TEXT[] DEFAULT '{}',
    ahpra_approved BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    effectiveness_score INTEGER CHECK (effectiveness_score >= 1 AND effectiveness_score <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for content generation

-- Users can access their own generated content
ALTER TABLE healthcare_generated_content_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own generated content"
    ON healthcare_generated_content_audit
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

-- Content templates are public for all healthcare users
ALTER TABLE healthcare_content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare content templates are public"
    ON healthcare_content_templates
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can modify templates
CREATE POLICY "Only admins can modify content templates"
    ON healthcare_content_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND u.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Compliance validation restricted to content owners
ALTER TABLE healthcare_content_compliance_validation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access compliance validation for their content"
    ON healthcare_content_compliance_validation
    FOR ALL
    TO authenticated
    USING (
        content_audit_id IN (
            SELECT hgca.id FROM healthcare_generated_content_audit hgca
            WHERE hgca.user_id = auth.uid()
            OR hgca.practice_id IN (
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

-- Generation requests restricted to requesters
ALTER TABLE healthcare_content_generation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own generation requests"
    ON healthcare_content_generation_requests
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Hashtag library is public for all healthcare users
ALTER TABLE healthcare_hashtag_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare hashtag library is public"
    ON healthcare_hashtag_library
    FOR SELECT
    TO authenticated
    USING (true);

-- Create indexes for performance
CREATE INDEX idx_healthcare_content_audit_user ON healthcare_generated_content_audit(user_id);
CREATE INDEX idx_healthcare_content_audit_practice ON healthcare_generated_content_audit(practice_id);
CREATE INDEX idx_healthcare_content_audit_specialty ON healthcare_generated_content_audit(specialty);
CREATE INDEX idx_healthcare_content_audit_generated_at ON healthcare_generated_content_audit(generated_at);
CREATE INDEX idx_healthcare_content_audit_compliance ON healthcare_generated_content_audit(ahpra_compliant, tga_compliant);

CREATE INDEX idx_healthcare_templates_specialty ON healthcare_content_templates(specialty);
CREATE INDEX idx_healthcare_templates_content_type ON healthcare_content_templates(content_type);
CREATE INDEX idx_healthcare_templates_approved ON healthcare_content_templates(ahpra_approved, tga_approved);

CREATE INDEX idx_healthcare_compliance_validation_content ON healthcare_content_compliance_validation(content_audit_id);
CREATE INDEX idx_healthcare_compliance_validation_type ON healthcare_content_compliance_validation(validation_type);
CREATE INDEX idx_healthcare_compliance_validation_compliant ON healthcare_content_compliance_validation(is_compliant);

CREATE INDEX idx_healthcare_generation_requests_user ON healthcare_content_generation_requests(user_id);
CREATE INDEX idx_healthcare_generation_requests_status ON healthcare_content_generation_requests(generation_status);
CREATE INDEX idx_healthcare_generation_requests_requested_at ON healthcare_content_generation_requests(requested_at);

CREATE INDEX idx_healthcare_hashtags_specialty ON healthcare_hashtag_library USING GIN (specialty);
CREATE INDEX idx_healthcare_hashtags_content_type ON healthcare_hashtag_library USING GIN (content_type);
CREATE INDEX idx_healthcare_hashtags_platform ON healthcare_hashtag_library USING GIN (platform);

-- Create functions for content generation workflow

-- Function to validate content compliance
CREATE OR REPLACE FUNCTION validate_healthcare_content_compliance(
    p_content_text TEXT,
    p_specialty TEXT,
    p_content_type TEXT
) RETURNS JSONB AS $$
DECLARE
    compliance_result JSONB;
    ahpra_violations TEXT[] := '{}';
    tga_violations TEXT[] := '{}';
    suggestions TEXT[] := '{}';
    compliance_score INTEGER := 100;
BEGIN
    -- Initialize compliance result
    compliance_result := jsonb_build_object(
        'isCompliant', true,
        'ahpraCompliant', true,
        'tgaCompliant', true,
        'score', 100,
        'violations', '[]'::jsonb,
        'suggestions', '[]'::jsonb
    );
    
    -- Check for AHPRA violations
    
    -- Patient testimonials check
    IF p_content_text ~* '\b(testimonial|review|patient said|client said|success story)\b' THEN
        ahpra_violations := array_append(ahpra_violations, 'Contains potential patient testimonials');
        compliance_score := compliance_score - 20;
    END IF;
    
    -- Therapeutic claims check
    IF p_content_text ~* '\b(cure|miracle|guarantee|100% effective|painless|risk-free)\b' THEN
        ahpra_violations := array_append(ahpra_violations, 'Contains exaggerated or misleading claims');
        compliance_score := compliance_score - 25;
    END IF;
    
    -- Professional boundaries check
    IF p_content_text ~* '\b(best doctor|top specialist|number one|leading practitioner)\b' THEN
        ahpra_violations := array_append(ahpra_violations, 'Contains comparative or superlative claims');
        compliance_score := compliance_score - 15;
    END IF;
    
    -- Check for TGA violations
    
    -- Drug brand names check
    IF p_content_text ~* '\b(botox|dysport|juvederm|restylane|brotox)\b' THEN
        tga_violations := array_append(tga_violations, 'Contains prohibited drug brand names');
        compliance_score := compliance_score - 30;
    END IF;
    
    -- Medical device claims check
    IF p_content_text ~* '\b(laser|IPL|radiofrequency)\b' AND 
       p_content_text ~* '\b(guaranteed|permanent|completely safe)\b' THEN
        tga_violations := array_append(tga_violations, 'Contains prohibited medical device claims');
        compliance_score := compliance_score - 25;
    END IF;
    
    -- Generate suggestions based on violations
    IF array_length(ahpra_violations, 1) > 0 OR array_length(tga_violations, 1) > 0 THEN
        suggestions := array_append(suggestions, 'Review AHPRA advertising guidelines for healthcare professionals');
        suggestions := array_append(suggestions, 'Include appropriate medical disclaimers');
        suggestions := array_append(suggestions, 'Focus on educational content rather than promotional claims');
    END IF;
    
    -- Check for missing disclaimer
    IF p_content_text !~* '\b(disclaimer|medical advice|consult|professional)\b' THEN
        suggestions := array_append(suggestions, 'Include medical disclaimer about seeking professional advice');
        compliance_score := compliance_score - 10;
    END IF;
    
    -- Update compliance status
    IF array_length(ahpra_violations, 1) > 0 THEN
        compliance_result := jsonb_set(compliance_result, '{ahpraCompliant}', 'false'::jsonb);
        compliance_result := jsonb_set(compliance_result, '{isCompliant}', 'false'::jsonb);
    END IF;
    
    IF array_length(tga_violations, 1) > 0 THEN
        compliance_result := jsonb_set(compliance_result, '{tgaCompliant}', 'false'::jsonb);
        compliance_result := jsonb_set(compliance_result, '{isCompliant}', 'false'::jsonb);
    END IF;
    
    -- Set final score and violations
    compliance_result := jsonb_set(compliance_result, '{score}', to_jsonb(GREATEST(0, compliance_score)));
    compliance_result := jsonb_set(compliance_result, '{violations}', to_jsonb(ahpra_violations || tga_violations));
    compliance_result := jsonb_set(compliance_result, '{suggestions}', to_jsonb(suggestions));
    
    RETURN compliance_result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate healthcare disclaimer
CREATE OR REPLACE FUNCTION generate_healthcare_disclaimer(
    p_specialty TEXT,
    p_content_type TEXT,
    p_practice_specifics JSONB DEFAULT '{}'
) RETURNS TEXT AS $$
DECLARE
    disclaimer TEXT;
    specialty_disclaimer TEXT;
BEGIN
    -- Base disclaimer
    disclaimer := 'This information is general in nature and should not replace professional medical advice. ';
    
    -- Specialty-specific disclaimers
    CASE p_specialty
        WHEN 'gp' THEN
            specialty_disclaimer := 'Always consult with your GP for advice tailored to your individual health circumstances.';
        WHEN 'psychology' THEN
            specialty_disclaimer := 'If you''re experiencing mental health concerns, please seek professional psychological or psychiatric assessment.';
        WHEN 'allied_health' THEN
            specialty_disclaimer := 'Treatment outcomes vary. Please consult with your allied health practitioner for personalised advice.';
        WHEN 'specialist' THEN
            specialty_disclaimer := 'This information should not replace specialist medical consultation and advice.';
        WHEN 'dentistry' THEN
            specialty_disclaimer := 'Dental treatment recommendations vary. Please consult with your dentist for personalised oral health advice.';
        ELSE
            specialty_disclaimer := 'Please consult with your healthcare professional for personalised medical advice.';
    END CASE;
    
    disclaimer := disclaimer || specialty_disclaimer;
    
    -- Add AHPRA registration if provided
    IF p_practice_specifics ? 'ahpraNumber' THEN
        disclaimer := disclaimer || ' AHPRA Registration: ' || (p_practice_specifics->>'ahpraNumber');
    END IF;
    
    RETURN disclaimer;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-validate content compliance
CREATE OR REPLACE FUNCTION trigger_content_compliance_validation()
RETURNS TRIGGER AS $$
DECLARE
    validation_result JSONB;
BEGIN
    -- Perform compliance validation
    validation_result := validate_healthcare_content_compliance(
        NEW.content_text,
        NEW.specialty,
        NEW.content_type
    );
    
    -- Update compliance fields
    NEW.ahpra_compliant := (validation_result->>'ahpraCompliant')::boolean;
    NEW.tga_compliant := (validation_result->>'tgaCompliant')::boolean;
    NEW.compliance_score := (validation_result->>'score')::integer;
    
    -- Insert detailed validation results
    INSERT INTO healthcare_content_compliance_validation (
        content_audit_id,
        validation_type,
        is_compliant,
        compliance_details,
        violation_reasons,
        suggested_improvements,
        auto_generated
    ) VALUES (
        NEW.id,
        'comprehensive_validation',
        (validation_result->>'isCompliant')::boolean,
        validation_result,
        ARRAY(SELECT jsonb_array_elements_text(validation_result->'violations')),
        ARRAY(SELECT jsonb_array_elements_text(validation_result->'suggestions')),
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic compliance validation
CREATE TRIGGER auto_validate_content_compliance
    BEFORE INSERT OR UPDATE ON healthcare_generated_content_audit
    FOR EACH ROW
    EXECUTE FUNCTION trigger_content_compliance_validation();

-- Create updated_at triggers
CREATE TRIGGER update_healthcare_content_templates_updated_at
    BEFORE UPDATE ON healthcare_content_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_hashtag_library_updated_at
    BEFORE UPDATE ON healthcare_hashtag_library
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default healthcare content templates
INSERT INTO healthcare_content_templates (
    specialty,
    content_type,
    template_name,
    prompt_structure,
    compliance_instructions,
    tone_guidelines,
    specialty_requirements,
    ahpra_approved,
    tga_approved
) VALUES 
(
    'gp',
    'patient_education',
    'GP Patient Education Standard',
    'Create patient education content for a General Practice setting that uses clear, accessible language appropriate for general public, focuses on evidence-based health information, encourages patients to seek professional medical advice, maintains appropriate professional boundaries, and includes preventive health messaging where relevant.',
    ARRAY[
        'Do not make therapeutic claims without evidence',
        'Include disclaimer about seeking professional medical advice',
        'Avoid patient testimonials or success stories',
        'Use person-first language',
        'Maintain professional doctor-patient boundaries'
    ],
    'Professional yet approachable, educational, empathetic',
    ARRAY[
        'Focus on whole-person health approach',
        'Include preventive care messaging',
        'Reference Medicare items where appropriate',
        'Mention the importance of regular health checks'
    ],
    true,
    true
),
(
    'psychology',
    'patient_education',
    'Psychology Mental Health Education',
    'Create mental health education content that reduces stigma around mental health seeking help, provides accurate information about mental health conditions, encourages professional help-seeking when appropriate, respects cultural and individual differences, and promotes mental health literacy and self-care.',
    ARRAY[
        'Avoid diagnostic language or self-diagnosis encouragement',
        'Include crisis support information where appropriate',
        'Emphasize importance of professional assessment',
        'Respect cultural considerations in mental health',
        'Include content warnings for sensitive topics'
    ],
    'Empathetic, non-judgmental, hopeful, validating',
    ARRAY[
        'Include mental health first aid information',
        'Reference Medicare mental health plans',
        'Mention importance of therapeutic relationship',
        'Address common myths about mental health treatment'
    ],
    true,
    true
),
(
    'allied_health',
    'patient_education',
    'Allied Health Treatment Education',
    'Create allied health content that explains treatment approaches clearly and simply, emphasizes patient participation in recovery, provides realistic expectations about outcomes, encourages compliance with treatment plans, and supports patient self-management where appropriate.',
    ARRAY[
        'Avoid guaranteeing treatment outcomes',
        'Include realistic recovery timeframes',
        'Emphasize importance of professional assessment',
        'Reference evidence-based treatment approaches',
        'Maintain scope of practice boundaries'
    ],
    'Encouraging, supportive, professional, solution-focused',
    ARRAY[
        'Include information about treatment duration',
        'Mention importance of home exercise compliance',
        'Reference multidisciplinary care approaches',
        'Highlight patient education and self-management'
    ],
    true,
    true
);

-- Insert healthcare-appropriate hashtags
INSERT INTO healthcare_hashtag_library (
    hashtag,
    specialty,
    content_type,
    platform,
    ahpra_approved,
    effectiveness_score
) VALUES 
('#HealthEducation', ARRAY['gp', 'specialist', 'allied_health', 'psychology'], ARRAY['patient_education', 'blog_post'], ARRAY['facebook', 'instagram', 'linkedin'], true, 9),
('#AustralianHealthcare', ARRAY['gp', 'specialist', 'allied_health', 'psychology'], ARRAY['patient_education', 'blog_post', 'social_media'], ARRAY['facebook', 'instagram', 'linkedin'], true, 8),
('#PatientCare', ARRAY['gp', 'specialist', 'allied_health', 'psychology'], ARRAY['patient_education', 'social_media'], ARRAY['facebook', 'instagram'], true, 8),
('#MentalHealth', ARRAY['psychology'], ARRAY['patient_education', 'blog_post', 'social_media'], ARRAY['facebook', 'instagram', 'linkedin'], true, 10),
('#GeneralPractice', ARRAY['gp'], ARRAY['patient_education', 'blog_post'], ARRAY['facebook', 'linkedin'], true, 9),
('#AlliedHealth', ARRAY['allied_health'], ARRAY['patient_education', 'blog_post'], ARRAY['facebook', 'instagram', 'linkedin'], true, 9),
('#HealthTips', ARRAY['gp', 'allied_health'], ARRAY['social_media', 'patient_education'], ARRAY['instagram', 'facebook'], true, 8),
('#PreventiveCare', ARRAY['gp'], ARRAY['patient_education', 'blog_post'], ARRAY['facebook', 'linkedin'], true, 9),
('#MentalWellbeing', ARRAY['psychology'], ARRAY['patient_education', 'social_media'], ARRAY['instagram', 'facebook'], true, 9),
('#HealthyLiving', ARRAY['gp', 'allied_health'], ARRAY['social_media', 'patient_education'], ARRAY['instagram', 'facebook'], true, 7);

COMMENT ON TABLE healthcare_generated_content_audit IS 'Audit trail for all AI-generated healthcare content with compliance tracking';
COMMENT ON TABLE healthcare_content_templates IS 'AHPRA-approved templates for healthcare content generation';
COMMENT ON TABLE healthcare_content_compliance_validation IS 'Detailed compliance validation results for healthcare content';
COMMENT ON TABLE healthcare_content_generation_requests IS 'Log of all content generation requests and their status';
COMMENT ON TABLE healthcare_hashtag_library IS 'Library of AHPRA-approved hashtags for healthcare social media'; 