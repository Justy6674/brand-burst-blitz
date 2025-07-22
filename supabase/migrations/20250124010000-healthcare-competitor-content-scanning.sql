-- Healthcare Competitor Content Scanning Engine
-- Ethical analysis system respecting professional standards and AHPRA guidelines

-- Competitor practices registry for ethical analysis
CREATE TABLE healthcare_competitor_practices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_name TEXT NOT NULL,
    practice_type TEXT NOT NULL CHECK (practice_type IN (
        'gp', 'specialist', 'allied_health', 'psychology', 'dentistry'
    )),
    location TEXT NOT NULL,
    ahpra_registered BOOLEAN DEFAULT false,
    professional_specialty TEXT,
    public_content_sources JSONB DEFAULT '{}',
    analysis_permission TEXT DEFAULT 'public_only' CHECK (analysis_permission IN (
        'public_only', 'ethical_review', 'professional_development'
    )),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    ethical_review_status TEXT DEFAULT 'pending_review' CHECK (ethical_review_status IN (
        'pending_review', 'approved', 'restricted', 'declined'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content analysis results with professional standards focus
CREATE TABLE healthcare_competitor_content_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_id UUID NOT NULL REFERENCES healthcare_practices(id) ON DELETE CASCADE,
    competitor_practice_id UUID NOT NULL REFERENCES healthcare_competitor_practices(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'blog', 'social', 'website', 'newsletter'
    )),
    content_summary TEXT NOT NULL,
    professional_standards JSONB NOT NULL DEFAULT '{
        "ahpraCompliant": true,
        "ethicalConsiderations": [],
        "professionalTone": "appropriate",
        "patientFocused": true
    }',
    content_quality JSONB NOT NULL DEFAULT '{
        "educationalValue": 5,
        "professionalPresentation": 5,
        "patientEngagement": 5,
        "complianceScore": 5
    }',
    suggested_improvements TEXT[] DEFAULT '{}',
    learning_opportunities TEXT[] DEFAULT '{}',
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    respectful_analysis BOOLEAN DEFAULT true,
    ethical_review_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional insights aggregation for practice development
CREATE TABLE healthcare_professional_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_id UUID NOT NULL REFERENCES healthcare_practices(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN (
        'content_quality_trends', 'professional_standards_benchmarks',
        'educational_opportunities', 'patient_engagement_strategies',
        'compliance_improvements', 'development_plan'
    )),
    insights_data JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ethical scanning audit log for transparency
CREATE TABLE healthcare_competitor_scanning_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_id UUID NOT NULL REFERENCES healthcare_practices(id) ON DELETE CASCADE,
    competitor_practice_id UUID NOT NULL REFERENCES healthcare_competitor_practices(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL,
    ethical_clearance JSONB NOT NULL,
    professional_purpose TEXT NOT NULL,
    content_types_scanned TEXT[] DEFAULT '{}',
    boundaries_respected BOOLEAN DEFAULT true,
    public_content_only BOOLEAN DEFAULT true,
    scanned_by_user_id UUID REFERENCES auth.users(id),
    audit_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for ethical content scanning

-- Healthcare practices can register competitor practices for ethical analysis
ALTER TABLE healthcare_competitor_practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practices can register competitors for ethical analysis"
    ON healthcare_competitor_practices
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Public competitor practices visible to all healthcare users"
    ON healthcare_competitor_practices
    FOR SELECT
    TO authenticated
    USING (
        analysis_permission = 'public_only' 
        AND ahpra_registered = true
        AND ethical_review_status = 'approved'
    );

-- Content analysis results restricted to practice owners
ALTER TABLE healthcare_competitor_content_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice can manage their competitor analysis"
    ON healthcare_competitor_content_analysis
    FOR ALL
    TO authenticated
    USING (
        practice_id IN (
            SELECT hp.id FROM healthcare_practices hp
            WHERE hp.owner_id = auth.uid()
            OR hp.id IN (
                SELECT htm.practice_id FROM healthcare_team_members htm
                WHERE htm.user_id = auth.uid()
                AND htm.role IN ('owner', 'admin', 'manager')
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
                AND htm.role IN ('owner', 'admin', 'manager')
                AND htm.status = 'active'
            )
        )
    );

-- Professional insights restricted to practice team
ALTER TABLE healthcare_professional_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can access professional insights"
    ON healthcare_professional_insights
    FOR ALL
    TO authenticated
    USING (
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
    )
    WITH CHECK (
        practice_id IN (
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

-- Audit log restricted to practice owners and admins
ALTER TABLE healthcare_competitor_scanning_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice owners can access scanning audit"
    ON healthcare_competitor_scanning_audit
    FOR SELECT
    TO authenticated
    USING (
        practice_id IN (
            SELECT hp.id FROM healthcare_practices hp
            WHERE hp.owner_id = auth.uid()
            OR hp.id IN (
                SELECT htm.practice_id FROM healthcare_team_members htm
                WHERE htm.user_id = auth.uid()
                AND htm.role IN ('owner', 'admin')
                AND htm.status = 'active'
            )
        )
    );

-- Create indexes for performance
CREATE INDEX idx_healthcare_competitor_practices_type ON healthcare_competitor_practices(practice_type);
CREATE INDEX idx_healthcare_competitor_practices_location ON healthcare_competitor_practices(location);
CREATE INDEX idx_healthcare_competitor_practices_ahpra ON healthcare_competitor_practices(ahpra_registered);
CREATE INDEX idx_healthcare_competitor_practices_review_status ON healthcare_competitor_practices(ethical_review_status);

CREATE INDEX idx_healthcare_competitor_analysis_practice ON healthcare_competitor_content_analysis(practice_id);
CREATE INDEX idx_healthcare_competitor_analysis_competitor ON healthcare_competitor_content_analysis(competitor_practice_id);
CREATE INDEX idx_healthcare_competitor_analysis_type ON healthcare_competitor_content_analysis(content_type);
CREATE INDEX idx_healthcare_competitor_analysis_scanned_at ON healthcare_competitor_content_analysis(scanned_at);

CREATE INDEX idx_healthcare_professional_insights_practice ON healthcare_professional_insights(practice_id);
CREATE INDEX idx_healthcare_professional_insights_type ON healthcare_professional_insights(insight_type);
CREATE INDEX idx_healthcare_professional_insights_generated_at ON healthcare_professional_insights(generated_at);

CREATE INDEX idx_healthcare_competitor_audit_practice ON healthcare_competitor_scanning_audit(practice_id);
CREATE INDEX idx_healthcare_competitor_audit_timestamp ON healthcare_competitor_scanning_audit(audit_timestamp);

-- Create functions for automated insights generation
CREATE OR REPLACE FUNCTION generate_professional_insights_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- When new analysis is added, trigger insights generation
    INSERT INTO healthcare_professional_insights (
        practice_id,
        insight_type,
        insights_data
    )
    VALUES (
        NEW.practice_id,
        'content_quality_trends',
        jsonb_build_object(
            'latest_analysis_id', NEW.id,
            'content_type', NEW.content_type,
            'quality_score', (NEW.content_quality->>'educationalValue')::int +
                           (NEW.content_quality->>'professionalPresentation')::int +
                           (NEW.content_quality->>'patientEngagement')::int +
                           (NEW.content_quality->>'complianceScore')::int,
            'generated_from', 'competitor_analysis'
        )
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic insights generation
CREATE TRIGGER generate_professional_insights_on_analysis
    AFTER INSERT ON healthcare_competitor_content_analysis
    FOR EACH ROW
    EXECUTE FUNCTION generate_professional_insights_trigger();

-- Create function for ethical scanning validation
CREATE OR REPLACE FUNCTION validate_ethical_scanning(
    p_practice_id UUID,
    p_competitor_practice_id UUID,
    p_scan_options JSONB
) RETURNS JSONB AS $$
DECLARE
    ethical_clearance JSONB;
    competitor_data RECORD;
BEGIN
    -- Get competitor practice data
    SELECT * INTO competitor_data
    FROM healthcare_competitor_practices
    WHERE id = p_competitor_practice_id;
    
    -- Initialize clearance object
    ethical_clearance := jsonb_build_object(
        'approved', false,
        'reasons', '[]'::jsonb
    );
    
    -- Check ethical requirements
    IF NOT (p_scan_options->>'respectProfessionalBoundaries')::boolean THEN
        ethical_clearance := jsonb_set(
            ethical_clearance,
            '{reasons}',
            (ethical_clearance->'reasons') || '"Must respect professional boundaries"'::jsonb
        );
        RETURN ethical_clearance;
    END IF;
    
    IF NOT (p_scan_options->>'limitToPublicContent')::boolean THEN
        ethical_clearance := jsonb_set(
            ethical_clearance,
            '{reasons}',
            (ethical_clearance->'reasons') || '"Analysis limited to public content only"'::jsonb
        );
        RETURN ethical_clearance;
    END IF;
    
    IF NOT (p_scan_options->>'professionalDevelopmentPurpose')::boolean THEN
        ethical_clearance := jsonb_set(
            ethical_clearance,
            '{reasons}',
            (ethical_clearance->'reasons') || '"Must be for professional development purposes"'::jsonb
        );
        RETURN ethical_clearance;
    END IF;
    
    -- Check competitor practice permissions
    IF competitor_data.analysis_permission != 'public_only' AND 
       competitor_data.analysis_permission != 'professional_development' THEN
        ethical_clearance := jsonb_set(
            ethical_clearance,
            '{reasons}',
            (ethical_clearance->'reasons') || '"Competitor practice has restricted analysis permissions"'::jsonb
        );
        RETURN ethical_clearance;
    END IF;
    
    -- Approve if all checks pass
    ethical_clearance := jsonb_set(ethical_clearance, '{approved}', 'true'::jsonb);
    
    RETURN ethical_clearance;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_healthcare_competitor_practices_updated_at
    BEFORE UPDATE ON healthcare_competitor_practices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_competitor_content_analysis_updated_at
    BEFORE UPDATE ON healthcare_competitor_content_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default competitor practices for demonstration (AHPRA-compliant examples)
INSERT INTO healthcare_competitor_practices (
    practice_name,
    practice_type,
    location,
    ahpra_registered,
    professional_specialty,
    public_content_sources,
    analysis_permission,
    ethical_review_status
) VALUES 
(
    'Melbourne Family Health Centre',
    'gp',
    'Melbourne, VIC',
    true,
    'General Practice',
    '{"website": "https://example-health-centre.com.au", "facebookPage": "MelbourneFamilyHealth"}',
    'public_only',
    'approved'
),
(
    'Physio Plus Allied Health',
    'allied_health',
    'Sydney, NSW',
    true,
    'Physiotherapy',
    '{"website": "https://example-physio.com.au", "instagramHandle": "physioplus"}',
    'professional_development',
    'approved'
),
(
    'Brisbane Psychology Clinic',
    'psychology',
    'Brisbane, QLD',
    true,
    'Clinical Psychology',
    '{"website": "https://example-psychology.com.au", "linkedinPage": "brisbane-psychology"}',
    'public_only',
    'approved'
);

COMMENT ON TABLE healthcare_competitor_practices IS 'Registry of healthcare practices available for ethical content analysis and professional development';
COMMENT ON TABLE healthcare_competitor_content_analysis IS 'Results of ethical content analysis focusing on professional standards and development opportunities';
COMMENT ON TABLE healthcare_professional_insights IS 'Aggregated insights for practice development based on ethical competitor analysis';
COMMENT ON TABLE healthcare_competitor_scanning_audit IS 'Audit trail for all competitor scanning activities ensuring ethical compliance'; 