-- Indigenous Health Cultural Safety Migration
-- Cultural safety requirements and validation for Indigenous health content

-- Indigenous Cultural Safety Guidelines Table
CREATE TABLE indigenous_cultural_safety_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('language', 'imagery', 'consultation', 'protocols', 'terminology', 'representation')),
    description TEXT NOT NULL,
    requirement_level TEXT NOT NULL CHECK (requirement_level IN ('mandatory', 'recommended', 'best_practice')),
    applicable_content_types TEXT[] DEFAULT '{}',
    cultural_context TEXT NOT NULL,
    example_violations TEXT[] DEFAULT '{}',
    recommended_approaches TEXT[] DEFAULT '{}',
    consultation_required BOOLEAN DEFAULT false,
    
    -- Guidelines Source and Authority
    source_organization TEXT,
    guideline_reference TEXT,
    last_reviewed DATE,
    next_review_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Indigenous Health Content Table
CREATE TABLE indigenous_health_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content Details
    content_type TEXT NOT NULL CHECK (content_type IN ('social_post', 'blog_article', 'website_content', 'educational_material', 'health_promotion')),
    content_text TEXT NOT NULL,
    content_images TEXT[] DEFAULT '{}',
    content_videos TEXT[] DEFAULT '{}',
    
    -- Cultural Specificity
    target_communities TEXT[] DEFAULT '{}',
    health_topics TEXT[] DEFAULT '{}',
    cultural_themes TEXT[] DEFAULT '{}',
    traditional_knowledge_included BOOLEAN DEFAULT false,
    
    -- Cultural Safety Compliance
    cultural_consultation_completed BOOLEAN DEFAULT false,
    cultural_reviewer_id UUID REFERENCES auth.users(id),
    cultural_safety_compliant BOOLEAN DEFAULT false,
    cultural_safety_score INTEGER DEFAULT 0 CHECK (cultural_safety_score BETWEEN 0 AND 100),
    cultural_safety_notes TEXT,
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Approval and Review
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'requires_cultural_review')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Community Consultation
    community_consultation_required BOOLEAN DEFAULT false,
    community_representatives_consulted TEXT[] DEFAULT '{}',
    consultation_completion_date DATE,
    consultation_outcomes TEXT,
    
    -- Publication
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    published_platforms TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Archival
    archived BOOLEAN DEFAULT false,
    archived_reason TEXT
);

-- Indigenous Health Education Resources Table
CREATE TABLE indigenous_health_education_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_name TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('guideline', 'training_module', 'consultation_service', 'reference_material')),
    description TEXT NOT NULL,
    provider_organization TEXT NOT NULL,
    target_audience TEXT[] DEFAULT '{}',
    
    -- Access Information
    access_url TEXT,
    contact_information TEXT,
    cost_information TEXT,
    prerequisites TEXT[] DEFAULT '{}',
    
    -- Content Details
    topics_covered TEXT[] DEFAULT '{}',
    learning_outcomes TEXT[] DEFAULT '{}',
    duration_hours INTEGER,
    certification_provided BOOLEAN DEFAULT false,
    
    -- Quality and Currency
    last_updated DATE,
    content_review_frequency TEXT,
    accreditation_status TEXT,
    cultural_endorsement TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Cultural Consultation Records Table
CREATE TABLE indigenous_cultural_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES indigenous_health_content(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Consultation Details
    consultation_type TEXT NOT NULL CHECK (consultation_type IN ('content_review', 'community_consultation', 'cultural_guidance', 'terminology_check')),
    consultation_scope TEXT NOT NULL,
    urgency_level TEXT DEFAULT 'standard' CHECK (urgency_level IN ('low', 'standard', 'high', 'urgent')),
    
    -- Consultant Information
    cultural_advisor_id UUID REFERENCES auth.users(id),
    cultural_advisor_name TEXT,
    cultural_advisor_credentials TEXT,
    community_affiliation TEXT,
    
    -- Process and Outcomes
    consultation_status TEXT DEFAULT 'requested' CHECK (consultation_status IN ('requested', 'in_progress', 'completed', 'cancelled')),
    consultation_start_date DATE,
    consultation_completion_date DATE,
    consultation_method TEXT,
    
    -- Results
    cultural_safety_assessment TEXT,
    recommendations TEXT[] DEFAULT '{}',
    required_changes TEXT[] DEFAULT '{}',
    cultural_protocols_identified TEXT[] DEFAULT '{}',
    community_feedback TEXT,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert comprehensive cultural safety guidelines
INSERT INTO indigenous_cultural_safety_guidelines (
    guideline_name, category, description, requirement_level, applicable_content_types,
    cultural_context, example_violations, recommended_approaches, consultation_required,
    source_organization, guideline_reference
) VALUES 

-- Language Guidelines
('Appropriate Terminology for Aboriginal and Torres Strait Islander Peoples', 'terminology', 
 'Use respectful and current terminology when referring to Aboriginal and Torres Strait Islander peoples',
 'mandatory', ARRAY['social_post', 'blog_article', 'website_content', 'educational_material', 'health_promotion'],
 'Terminology reflects respect, self-determination, and avoids colonial or outdated language',
 ARRAY['natives', 'aborigines', 'tribe', 'primitive', 'stone age', 'backwards'],
 ARRAY['Aboriginal and Torres Strait Islander peoples', 'First Nations peoples', 'Traditional Owners', 'community'],
 false, 'NHMRC', 'Ethical conduct in research with Aboriginal and Torres Strait Islander Peoples and communities'),

('Strength-Based Language', 'language',
 'Use strength-based language that emphasizes resilience, capability, and self-determination',
 'recommended', ARRAY['social_post', 'blog_article', 'website_content', 'educational_material', 'health_promotion'],
 'Avoid deficit-focused language that portrays communities as problems to be solved',
 ARRAY['disadvantaged', 'vulnerable', 'at-risk', 'problem communities', 'needy'],
 ARRAY['community strengths', 'resilient', 'self-determining', 'community-led', 'empowered'],
 false, 'AIHW', 'Indigenous health and wellbeing reporting guidelines'),

('Traditional Owner Acknowledgment', 'protocols',
 'Acknowledge Traditional Owners and Country in health-related content',
 'best_practice', ARRAY['blog_article', 'website_content', 'educational_material'],
 'Recognition of connection to Country and Traditional Ownership',
 ARRAY['no acknowledgment', 'generic acknowledgment', 'inappropriate land claims'],
 ARRAY['specific Traditional Owner groups', 'Country connection', 'Elders past, present and emerging'],
 false, 'Reconciliation Australia', 'Acknowledgment protocols'),

-- Consultation Guidelines
('Sensitive Health Topics Consultation', 'consultation',
 'Cultural consultation required for sensitive health topics affecting Indigenous communities',
 'mandatory', ARRAY['social_post', 'blog_article', 'website_content', 'educational_material', 'health_promotion'],
 'Sensitive topics require community input and cultural guidance',
 ARRAY['suicide content without consultation', 'mental health without cultural context', 'cultural healing claims'],
 ARRAY['engage Aboriginal Community Controlled Health Services', 'consult Indigenous health professionals', 'follow Mindframe guidelines'],
 true, 'NACCHO', 'Cultural safety in health service delivery'),

('Community-Specific Content Review', 'consultation',
 'Content targeting specific communities requires consultation with those communities',
 'mandatory', ARRAY['social_post', 'blog_article', 'website_content', 'educational_material', 'health_promotion'],
 'Community self-determination and decision-making authority',
 ARRAY['generic content claiming to represent specific communities', 'unauthorized use of community imagery'],
 ARRAY['community consultation processes', 'representative involvement', 'community approval'],
 true, 'AIATSIS', 'Guidelines for Ethical Research in Australian Indigenous Studies'),

('Traditional Knowledge and Cultural Practices', 'protocols',
 'Traditional knowledge and cultural practices require appropriate permissions and protocols',
 'mandatory', ARRAY['blog_article', 'website_content', 'educational_material'],
 'Cultural intellectual property and traditional knowledge sovereignty',
 ARRAY['sharing sacred or secret knowledge', 'misrepresenting cultural practices', 'commercializing traditional knowledge'],
 ARRAY['appropriate permissions', 'cultural protocols', 'community ownership recognition'],
 true, 'AIATSIS', 'Guidelines for Ethical Research in Australian Indigenous Studies'),

-- Imagery Guidelines
('Culturally Appropriate Imagery', 'imagery',
 'Use culturally appropriate imagery with proper permissions and context',
 'recommended', ARRAY['social_post', 'blog_article', 'website_content', 'educational_material'],
 'Visual representation respects cultural protocols and community consent',
 ARRAY['stereotypical imagery', 'sacred site imagery without permission', 'generic Indigenous imagery'],
 ARRAY['community-approved imagery', 'contemporary representations', 'diverse community representation'],
 false, 'Australia Council for the Arts', 'Protocols for working with Indigenous artists'),

('Deceased Persons Protocol', 'protocols',
 'Consider protocols around imagery or names of deceased persons',
 'best_practice', ARRAY['social_post', 'blog_article', 'website_content', 'educational_material'],
 'Respect for cultural protocols around deceased persons',
 ARRAY['using images of deceased persons without warning', 'naming deceased persons inappropriately'],
 ARRAY['appropriate warnings', 'community consultation', 'cultural guidance'],
 true, 'AIATSIS', 'Traditional cultural expressions protocols'),

-- Representation Guidelines
('Avoiding Generalizations', 'representation',
 'Avoid generalizations about Aboriginal and Torres Strait Islander peoples and cultures',
 'mandatory', ARRAY['social_post', 'blog_article', 'website_content', 'educational_material', 'health_promotion'],
 'Recognition of diversity within and between communities',
 ARRAY['all Aboriginal people', 'Aboriginal culture', 'traditional lifestyle', 'ancient ways'],
 ARRAY['specific communities', 'diverse cultures', 'contemporary diversity', 'individual experiences'],
 false, 'SNAICC', 'Cultural competency guidelines'),

('Self-Determination Recognition', 'representation',
 'Recognize and support self-determination and community leadership',
 'recommended', ARRAY['social_post', 'blog_article', 'website_content', 'educational_material', 'health_promotion'],
 'Community agency and decision-making authority',
 ARRAY['speaking for communities', 'external solutions', 'paternalistic approaches'],
 ARRAY['community-led initiatives', 'self-determination support', 'community expertise recognition'],
 false, 'NACCHO', 'Community control principles');

-- Insert education resources
INSERT INTO indigenous_health_education_resources (
    resource_name, resource_type, description, provider_organization, target_audience,
    access_url, topics_covered, duration_hours, certification_provided
) VALUES 

('Cultural Competency Training for Health Professionals', 'training_module',
 'Comprehensive training on cultural competency in Indigenous health service delivery',
 'National Aboriginal Community Controlled Health Organisation (NACCHO)',
 ARRAY['healthcare professionals', 'health service managers', 'policy makers'],
 'https://www.naccho.org.au/training',
 ARRAY['cultural safety principles', 'historical context', 'communication strategies', 'service delivery'],
 8, true),

('Indigenous Health Guidelines for Content Creators', 'guideline',
 'Guidelines for creating culturally safe and appropriate Indigenous health content',
 'Australian Institute of Aboriginal and Torres Strait Islander Studies (AIATSIS)',
 ARRAY['content creators', 'marketing professionals', 'health communicators'],
 'https://aiatsis.gov.au/research/ethical-research',
 ARRAY['ethical guidelines', 'consultation protocols', 'appropriate terminology', 'visual representation'],
 NULL, false),

('Mindframe Guidelines for Indigenous Suicide Prevention', 'reference_material',
 'Evidence-based guidelines for responsible reporting and communication about Indigenous suicide',
 'Mindframe National Media Initiative',
 ARRAY['media professionals', 'content creators', 'health professionals', 'community workers'],
 'https://mindframe.org.au/indigenous',
 ARRAY['suicide prevention', 'responsible reporting', 'cultural protocols', 'help-seeking promotion'],
 2, false),

('Cultural Safety Consultation Services', 'consultation_service',
 'Professional cultural safety consultation and content review services',
 'Indigenous Health Consulting Network',
 ARRAY['healthcare organizations', 'content creators', 'government agencies'],
 'contact@indigenoushealthconsulting.com.au',
 ARRAY['content review', 'cultural guidance', 'community consultation', 'protocol development'],
 NULL, false),

('NHMRC Indigenous Research Guidelines', 'guideline',
 'National Health and Medical Research Council guidelines for ethical Indigenous research',
 'National Health and Medical Research Council (NHMRC)',
 ARRAY['researchers', 'healthcare professionals', 'policy makers'],
 'https://www.nhmrc.gov.au/about-us/resources/ethical-conduct-research-aboriginal-and-torres-strait-islander-peoples-and-communities',
 ARRAY['ethical research', 'community engagement', 'data sovereignty', 'benefit sharing'],
 NULL, false);

-- Row Level Security Policies

-- Indigenous Cultural Safety Guidelines RLS
ALTER TABLE indigenous_cultural_safety_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read cultural safety guidelines" ON indigenous_cultural_safety_guidelines
    FOR SELECT USING (auth.uid() IS NOT NULL AND active = true);

CREATE POLICY "Admin can manage cultural safety guidelines" ON indigenous_cultural_safety_guidelines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Indigenous Health Content RLS
ALTER TABLE indigenous_health_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own Indigenous health content" ON indigenous_health_content
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Cultural reviewers can view content requiring review" ON indigenous_health_content
    FOR SELECT USING (
        approval_status = 'requires_cultural_review' AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('cultural_advisor', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Admin can view all Indigenous health content" ON indigenous_health_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Indigenous Health Education Resources RLS
ALTER TABLE indigenous_health_education_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read education resources" ON indigenous_health_education_resources
    FOR SELECT USING (auth.uid() IS NOT NULL AND active = true);

CREATE POLICY "Admin can manage education resources" ON indigenous_health_education_resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Indigenous Cultural Consultations RLS
ALTER TABLE indigenous_cultural_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultation requests" ON indigenous_cultural_consultations
    FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Cultural advisors can view assigned consultations" ON indigenous_cultural_consultations
    FOR SELECT USING (auth.uid() = cultural_advisor_id);

CREATE POLICY "Users can create consultation requests" ON indigenous_cultural_consultations
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Cultural advisors can update consultations" ON indigenous_cultural_consultations
    FOR UPDATE USING (auth.uid() = cultural_advisor_id);

CREATE POLICY "Admin can view all consultations" ON indigenous_cultural_consultations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Indexes for Performance
CREATE INDEX idx_cultural_guidelines_category ON indigenous_cultural_safety_guidelines(category);
CREATE INDEX idx_cultural_guidelines_requirement ON indigenous_cultural_safety_guidelines(requirement_level);
CREATE INDEX idx_cultural_guidelines_active ON indigenous_cultural_safety_guidelines(active) WHERE active = true;

CREATE INDEX idx_indigenous_content_user ON indigenous_health_content(user_id);
CREATE INDEX idx_indigenous_content_type ON indigenous_health_content(content_type);
CREATE INDEX idx_indigenous_content_status ON indigenous_health_content(approval_status);
CREATE INDEX idx_indigenous_content_compliance ON indigenous_health_content(cultural_safety_compliant);
CREATE INDEX idx_indigenous_content_topics ON indigenous_health_content USING GIN(health_topics);
CREATE INDEX idx_indigenous_content_communities ON indigenous_health_content USING GIN(target_communities);

CREATE INDEX idx_education_resources_type ON indigenous_health_education_resources(resource_type);
CREATE INDEX idx_education_resources_active ON indigenous_health_education_resources(active) WHERE active = true;
CREATE INDEX idx_education_resources_topics ON indigenous_health_education_resources USING GIN(topics_covered);

CREATE INDEX idx_consultations_content ON indigenous_cultural_consultations(content_id);
CREATE INDEX idx_consultations_requester ON indigenous_cultural_consultations(requester_id);
CREATE INDEX idx_consultations_advisor ON indigenous_cultural_consultations(cultural_advisor_id);
CREATE INDEX idx_consultations_status ON indigenous_cultural_consultations(consultation_status);

-- Functions for Cultural Safety Management

-- Function to validate Indigenous health content cultural safety
CREATE OR REPLACE FUNCTION validate_indigenous_cultural_safety(content_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    content_record indigenous_health_content%ROWTYPE;
    violations TEXT[] := '{}';
    warnings TEXT[] := '{}';
    recommendations TEXT[] := '{}';
    cultural_consultation_required BOOLEAN := false;
    safety_score INTEGER := 100;
    risk_level TEXT := 'low';
BEGIN
    -- Get content record
    SELECT * INTO content_record 
    FROM indigenous_health_content 
    WHERE id = content_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Content not found');
    END IF;
    
    -- Check for problematic terminology
    IF content_record.content_text ~* '\b(natives|aborigines|tribe|primitive|stone age|backwards|savage|civilized)\b' THEN
        violations := array_append(violations, 'Problematic terminology detected');
        safety_score := safety_score - 20;
        risk_level := 'high';
    END IF;
    
    -- Check for sensitive health topics
    IF EXISTS (
        SELECT 1 FROM unnest(content_record.health_topics) AS topic
        WHERE topic ~* '(suicide|mental health|domestic violence|substance abuse|sexual health)'
    ) THEN
        cultural_consultation_required := true;
        IF risk_level = 'low' THEN risk_level := 'medium'; END IF;
    END IF;
    
    -- Specific suicide content checks
    IF EXISTS (
        SELECT 1 FROM unnest(content_record.health_topics) AS topic
        WHERE topic ~* 'suicide'
    ) THEN
        cultural_consultation_required := true;
        risk_level := 'critical';
        safety_score := safety_score - 30;
    END IF;
    
    -- Check for community-specific targeting
    IF array_length(content_record.target_communities, 1) > 0 THEN
        cultural_consultation_required := true;
        IF risk_level = 'low' THEN risk_level := 'medium'; END IF;
    END IF;
    
    -- Check for generalizing language
    IF content_record.content_text ~* '\b(all aboriginal people|all indigenous people|aboriginal culture|traditional lifestyle)\b' THEN
        warnings := array_append(warnings, 'Avoid generalizations about Aboriginal and Torres Strait Islander peoples');
        safety_score := safety_score - 15;
    END IF;
    
    -- Check for deficit language
    IF content_record.content_text ~* '\b(disadvantaged|vulnerable|at-risk|problem|issue)\b' THEN
        warnings := array_append(warnings, 'Consider using strength-based language');
        safety_score := safety_score - 10;
    END IF;
    
    -- Check for traditional knowledge references
    IF content_record.content_text ~* '\b(traditional knowledge|cultural practice)\b' THEN
        recommendations := array_append(recommendations, 'Verify cultural intellectual property permissions');
        cultural_consultation_required := true;
    END IF;
    
    -- Final risk assessment
    IF array_length(violations, 1) >= 2 THEN risk_level := 'critical';
    ELSIF array_length(violations, 1) >= 1 OR cultural_consultation_required THEN risk_level := 'high';
    ELSIF array_length(warnings, 1) >= 3 THEN risk_level := 'medium';
    END IF;
    
    safety_score := GREATEST(0, safety_score);
    
    RETURN jsonb_build_object(
        'is_compliant', array_length(violations, 1) = 0 AND safety_score >= 80,
        'violations', violations,
        'warnings', warnings,
        'recommendations', recommendations,
        'cultural_consultation_required', cultural_consultation_required,
        'safety_score', safety_score,
        'risk_level', risk_level,
        'checked_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate cultural safety recommendations
CREATE OR REPLACE FUNCTION generate_cultural_safety_recommendations(
    content_text_param TEXT,
    health_topics_param TEXT[] DEFAULT '{}',
    target_communities_param TEXT[] DEFAULT '{}'
)
RETURNS TEXT[] AS $$
DECLARE
    recommendations TEXT[] := '{}';
BEGIN
    -- Base recommendations
    recommendations := array_append(recommendations, 'Complete cultural competency training if not already done');
    recommendations := array_append(recommendations, 'Stay updated with current cultural safety guidelines');
    recommendations := array_append(recommendations, 'Build ongoing relationships with local Indigenous health services');
    
    -- Content-specific recommendations
    IF content_text_param ~* '\b(research|data)\b' THEN
        recommendations := array_append(recommendations, 'Follow Indigenous Data Sovereignty principles');
        recommendations := array_append(recommendations, 'Consider CARE principles (Collective benefit, Authority to control, Responsibility, Ethics)');
    END IF;
    
    -- Health topic specific recommendations
    IF EXISTS (
        SELECT 1 FROM unnest(health_topics_param) AS topic
        WHERE topic ~* 'mental health'
    ) THEN
        recommendations := array_append(recommendations, 'Engage with Aboriginal Community Controlled Health Services');
        recommendations := array_append(recommendations, 'Consider cultural factors in mental health service delivery');
    END IF;
    
    -- Community targeting recommendations
    IF array_length(target_communities_param, 1) > 0 THEN
        recommendations := array_append(recommendations, 'Engage with specific community representatives');
        recommendations := array_append(recommendations, 'Respect local protocols and decision-making processes');
        recommendations := array_append(recommendations, 'Allow adequate time for community consultation processes');
    END IF;
    
    -- General cultural protocols
    recommendations := array_append(recommendations, 'Consider acknowledging Traditional Owners and Country');
    recommendations := array_append(recommendations, 'Acknowledge the wisdom of Elders past, present and emerging');
    recommendations := array_append(recommendations, 'Use imagery from appropriate cultural image libraries');
    
    RETURN recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at columns
CREATE TRIGGER update_indigenous_cultural_safety_guidelines_updated_at
    BEFORE UPDATE ON indigenous_cultural_safety_guidelines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indigenous_health_content_updated_at
    BEFORE UPDATE ON indigenous_health_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indigenous_health_education_resources_updated_at
    BEFORE UPDATE ON indigenous_health_education_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indigenous_cultural_consultations_updated_at
    BEFORE UPDATE ON indigenous_cultural_consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically validate cultural safety
CREATE OR REPLACE FUNCTION auto_validate_indigenous_cultural_safety()
RETURNS TRIGGER AS $$
DECLARE
    safety_result JSONB;
BEGIN
    -- Perform cultural safety validation
    safety_result := validate_indigenous_cultural_safety(NEW.id);
    
    -- Update content with validation results
    NEW.cultural_safety_score := (safety_result->>'safety_score')::INTEGER;
    NEW.risk_level := safety_result->>'risk_level';
    NEW.cultural_safety_compliant := (safety_result->>'is_compliant')::BOOLEAN;
    NEW.cultural_safety_notes := safety_result::TEXT;
    NEW.community_consultation_required := (safety_result->>'cultural_consultation_required')::BOOLEAN;
    
    -- Set appropriate approval status
    IF (safety_result->>'cultural_consultation_required')::BOOLEAN THEN
        NEW.approval_status := 'requires_cultural_review';
    ELSIF (safety_result->>'is_compliant')::BOOLEAN THEN
        NEW.approval_status := 'approved';
    ELSE
        NEW.approval_status := 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_validate_indigenous_cultural_safety
    BEFORE INSERT OR UPDATE ON indigenous_health_content
    FOR EACH ROW
    EXECUTE FUNCTION auto_validate_indigenous_cultural_safety();

-- Grant necessary permissions
GRANT SELECT ON indigenous_cultural_safety_guidelines TO authenticated;
GRANT SELECT, INSERT, UPDATE ON indigenous_health_content TO authenticated;
GRANT SELECT ON indigenous_health_education_resources TO authenticated;
GRANT SELECT, INSERT, UPDATE ON indigenous_cultural_consultations TO authenticated;

-- Comments for documentation
COMMENT ON TABLE indigenous_cultural_safety_guidelines IS 'Cultural safety guidelines for Indigenous health content creation and validation';
COMMENT ON TABLE indigenous_health_content IS 'Indigenous health content with cultural safety validation and consultation tracking';
COMMENT ON TABLE indigenous_health_education_resources IS 'Educational resources for cultural competency and safety in Indigenous health';
COMMENT ON TABLE indigenous_cultural_consultations IS 'Cultural consultation requests and outcomes for Indigenous health content';

COMMENT ON FUNCTION validate_indigenous_cultural_safety(UUID) IS 'Validates cultural safety compliance for Indigenous health content';
COMMENT ON FUNCTION generate_cultural_safety_recommendations(TEXT, TEXT[], TEXT[]) IS 'Generates cultural safety recommendations based on content analysis'; 