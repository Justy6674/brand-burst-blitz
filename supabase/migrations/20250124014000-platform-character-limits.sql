-- Platform Character Limits System
-- Healthcare content optimization and validation tracking for social media platforms

-- Platform limits configuration
CREATE TABLE platform_character_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL UNIQUE CHECK (platform IN (
        'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'website', 'email'
    )),
    technical_limits JSONB NOT NULL DEFAULT '{}',
    healthcare_optimal JSONB NOT NULL DEFAULT '{}',
    content_structure JSONB NOT NULL DEFAULT '{}',
    special_considerations TEXT[] DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content validation results tracking
CREATE TABLE platform_content_validation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    practice_id UUID REFERENCES healthcare_practices(id),
    platform TEXT NOT NULL CHECK (platform IN (
        'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'website', 'email'
    )),
    content_hash TEXT NOT NULL,
    character_count INTEGER NOT NULL,
    character_limit INTEGER NOT NULL,
    utilization_percentage INTEGER NOT NULL,
    is_within_limits BOOLEAN NOT NULL,
    is_healthcare_optimal BOOLEAN NOT NULL,
    validation_result JSONB NOT NULL DEFAULT '{}',
    warnings_count INTEGER DEFAULT 0,
    suggestions_count INTEGER DEFAULT 0,
    hashtags_used TEXT[] DEFAULT '{}',
    content_type TEXT CHECK (content_type IN (
        'blog_post', 'social_media', 'newsletter', 'patient_education', 'website_content'
    )),
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content optimization tracking
CREATE TABLE platform_content_optimization (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    validation_id UUID NOT NULL REFERENCES platform_content_validation(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    original_length INTEGER NOT NULL,
    optimized_length INTEGER NOT NULL,
    characters_saved INTEGER NOT NULL,
    optimization_type TEXT DEFAULT 'ai_truncation' CHECK (optimization_type IN (
        'ai_truncation', 'intelligent_summary', 'structure_optimization', 'manual_edit'
    )),
    platform_optimal BOOLEAN DEFAULT false,
    optimization_quality_score INTEGER CHECK (optimization_quality_score >= 1 AND optimization_quality_score <= 10),
    preserved_compliance BOOLEAN DEFAULT true,
    optimization_metadata JSONB DEFAULT '{}',
    optimized_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform performance analytics
CREATE TABLE platform_content_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    validation_id UUID NOT NULL REFERENCES platform_content_validation(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES healthcare_practices(id),
    platform TEXT NOT NULL,
    specialty TEXT NOT NULL,
    content_length INTEGER NOT NULL,
    engagement_metrics JSONB DEFAULT '{}',
    reach_metrics JSONB DEFAULT '{}',
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    patient_appropriateness_score INTEGER CHECK (patient_appropriateness_score >= 0 AND patient_appropriateness_score <= 100),
    performance_period_start TIMESTAMPTZ,
    performance_period_end TIMESTAMPTZ,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform usage statistics for practices
CREATE TABLE practice_platform_usage_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practice_id UUID NOT NULL REFERENCES healthcare_practices(id),
    platform TEXT NOT NULL,
    specialty TEXT NOT NULL,
    total_validations INTEGER DEFAULT 0,
    successful_validations INTEGER DEFAULT 0,
    average_character_utilization DECIMAL(5,2) DEFAULT 0.00,
    healthcare_optimal_rate DECIMAL(5,2) DEFAULT 0.00,
    average_optimization_savings INTEGER DEFAULT 0,
    most_common_warnings JSONB DEFAULT '[]',
    performance_trends JSONB DEFAULT '{}',
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(practice_id, platform, period_start, period_end)
);

-- RLS Policies for platform character limits

-- Platform limits are public for all healthcare users
ALTER TABLE platform_character_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform character limits are public"
    ON platform_character_limits
    FOR SELECT
    TO authenticated
    USING (active = true);

-- Only admins can modify platform limits
CREATE POLICY "Only admins can modify platform limits"
    ON platform_character_limits
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

-- Users can access their own validation results
ALTER TABLE platform_content_validation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own content validation"
    ON platform_content_validation
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

-- Users can access optimization results for their validations
ALTER TABLE platform_content_optimization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own optimization results"
    ON platform_content_optimization
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid()
        OR validation_id IN (
            SELECT pcv.id FROM platform_content_validation pcv
            WHERE pcv.user_id = auth.uid()
            OR pcv.practice_id IN (
                SELECT hp.id FROM healthcare_practices hp
                WHERE hp.owner_id = auth.uid()
                OR hp.id IN (
                    SELECT htm.practice_id FROM healthcare_team_members htm
                    WHERE htm.user_id = auth.uid()
                    AND htm.status = 'active'
                )
            )
        )
    )
    WITH CHECK (user_id = auth.uid());

-- Practice team can access performance analytics
ALTER TABLE platform_content_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can access content performance"
    ON platform_content_performance
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

-- Practice usage statistics restricted to practice team
ALTER TABLE practice_platform_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice team can access platform usage stats"
    ON practice_platform_usage_stats
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
CREATE INDEX idx_platform_content_validation_user ON platform_content_validation(user_id);
CREATE INDEX idx_platform_content_validation_practice ON platform_content_validation(practice_id);
CREATE INDEX idx_platform_content_validation_platform ON platform_content_validation(platform);
CREATE INDEX idx_platform_content_validation_optimal ON platform_content_validation(is_healthcare_optimal);
CREATE INDEX idx_platform_content_validation_validated_at ON platform_content_validation(validated_at);

CREATE INDEX idx_platform_content_optimization_validation ON platform_content_optimization(validation_id);
CREATE INDEX idx_platform_content_optimization_user ON platform_content_optimization(user_id);
CREATE INDEX idx_platform_content_optimization_type ON platform_content_optimization(optimization_type);
CREATE INDEX idx_platform_content_optimization_optimal ON platform_content_optimization(platform_optimal);

CREATE INDEX idx_platform_content_performance_practice ON platform_content_performance(practice_id);
CREATE INDEX idx_platform_content_performance_platform ON platform_content_performance(platform);
CREATE INDEX idx_platform_content_performance_specialty ON platform_content_performance(specialty);
CREATE INDEX idx_platform_content_performance_period ON platform_content_performance(performance_period_start, performance_period_end);

CREATE INDEX idx_practice_platform_usage_practice ON practice_platform_usage_stats(practice_id);
CREATE INDEX idx_practice_platform_usage_platform ON practice_platform_usage_stats(platform);
CREATE INDEX idx_practice_platform_usage_period ON practice_platform_usage_stats(period_start, period_end);

-- Functions for platform optimization analytics

-- Function to calculate optimization effectiveness
CREATE OR REPLACE FUNCTION calculate_optimization_effectiveness(
    p_original_length INTEGER,
    p_optimized_length INTEGER,
    p_character_limit INTEGER,
    p_healthcare_optimal INTEGER
) RETURNS JSONB AS $$
DECLARE
    savings_percentage DECIMAL(5,2);
    optimal_achievement BOOLEAN;
    effectiveness_score INTEGER;
    result JSONB;
BEGIN
    -- Calculate savings percentage
    savings_percentage := CASE 
        WHEN p_original_length > 0 THEN 
            ROUND(((p_original_length - p_optimized_length)::DECIMAL / p_original_length) * 100, 2)
        ELSE 0.00
    END;
    
    -- Check if optimization achieved healthcare optimal range
    optimal_achievement := p_optimized_length <= p_healthcare_optimal;
    
    -- Calculate effectiveness score (1-10)
    effectiveness_score := CASE
        WHEN optimal_achievement AND savings_percentage >= 20 THEN 10
        WHEN optimal_achievement AND savings_percentage >= 10 THEN 9
        WHEN optimal_achievement THEN 8
        WHEN p_optimized_length <= p_character_limit AND savings_percentage >= 15 THEN 7
        WHEN p_optimized_length <= p_character_limit AND savings_percentage >= 5 THEN 6
        WHEN p_optimized_length <= p_character_limit THEN 5
        ELSE 3
    END;
    
    result := jsonb_build_object(
        'savingsPercentage', savings_percentage,
        'achievedOptimal', optimal_achievement,
        'effectivenessScore', effectiveness_score,
        'withinLimits', p_optimized_length <= p_character_limit,
        'originalLength', p_original_length,
        'optimizedLength', p_optimized_length,
        'charactersSaved', p_original_length - p_optimized_length
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate platform usage report
CREATE OR REPLACE FUNCTION generate_platform_usage_report(
    p_practice_id UUID,
    p_period_days INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
    period_start TIMESTAMPTZ;
    period_end TIMESTAMPTZ;
    platform_stats JSONB;
    optimization_stats JSONB;
    overall_stats JSONB;
    report JSONB;
BEGIN
    period_end := NOW();
    period_start := period_end - (p_period_days || ' days')::INTERVAL;
    
    -- Get platform-specific statistics
    SELECT jsonb_agg(
        jsonb_build_object(
            'platform', platform,
            'totalValidations', COUNT(*),
            'successfulValidations', COUNT(*) FILTER (WHERE is_within_limits = true),
            'healthcareOptimalRate', ROUND(
                (COUNT(*) FILTER (WHERE is_healthcare_optimal = true)::DECIMAL / COUNT(*)) * 100, 2
            ),
            'averageUtilization', ROUND(AVG(utilization_percentage), 2),
            'averageLength', ROUND(AVG(character_count), 0)
        )
    )
    INTO platform_stats
    FROM platform_content_validation
    WHERE practice_id = p_practice_id
    AND validated_at BETWEEN period_start AND period_end
    GROUP BY platform;
    
    -- Get optimization statistics
    SELECT jsonb_build_object(
        'totalOptimizations', COUNT(*),
        'averageCharactersSaved', ROUND(AVG(characters_saved), 0),
        'averageOptimizationQuality', ROUND(AVG(optimization_quality_score), 1),
        'platformOptimalAchieved', COUNT(*) FILTER (WHERE platform_optimal = true),
        'compliancePreserved', COUNT(*) FILTER (WHERE preserved_compliance = true)
    )
    INTO optimization_stats
    FROM platform_content_optimization pco
    JOIN platform_content_validation pcv ON pco.validation_id = pcv.id
    WHERE pcv.practice_id = p_practice_id
    AND pco.optimized_at BETWEEN period_start AND period_end;
    
    -- Get overall statistics
    SELECT jsonb_build_object(
        'totalContentValidations', COUNT(*),
        'overallSuccessRate', ROUND(
            (COUNT(*) FILTER (WHERE is_within_limits = true)::DECIMAL / COUNT(*)) * 100, 2
        ),
        'healthcareComplianceRate', ROUND(
            (COUNT(*) FILTER (WHERE is_healthcare_optimal = true)::DECIMAL / COUNT(*)) * 100, 2
        )
    )
    INTO overall_stats
    FROM platform_content_validation
    WHERE practice_id = p_practice_id
    AND validated_at BETWEEN period_start AND period_end;
    
    -- Build comprehensive report
    report := jsonb_build_object(
        'practiceId', p_practice_id,
        'reportPeriod', jsonb_build_object(
            'start', period_start,
            'end', period_end,
            'days', p_period_days
        ),
        'overallStats', COALESCE(overall_stats, '{}'::jsonb),
        'platformStats', COALESCE(platform_stats, '[]'::jsonb),
        'optimizationStats', COALESCE(optimization_stats, '{}'::jsonb),
        'generatedAt', NOW()
    );
    
    RETURN report;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate optimization effectiveness
CREATE OR REPLACE FUNCTION calculate_optimization_metrics()
RETURNS TRIGGER AS $$
DECLARE
    validation_data RECORD;
    platform_limits RECORD;
    effectiveness JSONB;
BEGIN
    -- Get validation data
    SELECT * INTO validation_data
    FROM platform_content_validation
    WHERE id = NEW.validation_id;
    
    -- Get platform limits
    SELECT healthcare_optimal->>'postText' as optimal_length
    INTO platform_limits
    FROM platform_character_limits
    WHERE platform = validation_data.platform;
    
    -- Calculate effectiveness metrics
    effectiveness := calculate_optimization_effectiveness(
        NEW.original_length,
        NEW.optimized_length,
        validation_data.character_limit,
        (platform_limits.optimal_length)::INTEGER
    );
    
    -- Update optimization quality score
    NEW.optimization_quality_score := (effectiveness->>'effectivenessScore')::INTEGER;
    NEW.platform_optimal := (effectiveness->>'achievedOptimal')::BOOLEAN;
    NEW.optimization_metadata := effectiveness;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic optimization metrics calculation
CREATE TRIGGER calculate_optimization_metrics_trigger
    BEFORE INSERT OR UPDATE ON platform_content_optimization
    FOR EACH ROW
    EXECUTE FUNCTION calculate_optimization_metrics();

-- Create updated_at triggers
CREATE TRIGGER update_platform_character_limits_updated_at
    BEFORE UPDATE ON platform_character_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default platform character limits
INSERT INTO platform_character_limits (
    platform, technical_limits, healthcare_optimal, content_structure, special_considerations
) VALUES 
(
    'facebook',
    '{"postText": 63206, "hashtags": 30, "hashtagCharacters": 100}',
    '{"postText": 400, "explanation": "Facebook posts perform best at 400-500 characters for healthcare content", "complianceNote": "Allows space for AHPRA disclaimers and professional language"}',
    '{"introduction": 15, "mainContent": 60, "disclaimer": 15, "callToAction": 5, "hashtags": 5}',
    ARRAY[
        'Include medical disclaimer within first 400 characters',
        'Reserve 100 characters for hashtags and practice information',
        'Use line breaks for readability in health education content',
        'Facebook favors informative posts that generate discussion'
    ]
),
(
    'instagram',
    '{"postText": 2200, "caption": 2200, "hashtags": 30, "hashtagCharacters": 700, "bio": 150, "stories": 2200}',
    '{"postText": 300, "explanation": "Instagram healthcare posts work best at 300-400 characters with visual focus", "complianceNote": "Short, engaging text with detailed compliance info in first comment"}',
    '{"introduction": 20, "mainContent": 50, "disclaimer": 10, "callToAction": 10, "hashtags": 10}',
    ARRAY[
        'Use first comment for detailed medical disclaimers',
        'Keep main post concise and visually appealing',
        'Healthcare hashtags should be front-loaded in caption',
        'Stories allow for longer educational content with disclaimer overlays'
    ]
),
(
    'linkedin',
    '{"postText": 1300, "postTitle": 150, "hashtags": 5, "hashtagCharacters": 100}',
    '{"postText": 800, "explanation": "LinkedIn healthcare content performs well with detailed, professional posts", "complianceNote": "Professional audience allows for more detailed medical information"}',
    '{"introduction": 10, "mainContent": 70, "disclaimer": 10, "callToAction": 5, "hashtags": 5}',
    ARRAY[
        'Professional audience expects detailed, evidence-based content',
        'Include AHPRA registration number for credibility',
        'Use professional healthcare hashtags (#HealthcareProfessional)',
        'Longer posts acceptable for educational medical content'
    ]
),
(
    'twitter',
    '{"postText": 280, "hashtags": 10, "hashtagCharacters": 50}',
    '{"postText": 220, "explanation": "Twitter requires concise healthcare messages with link to detailed content", "complianceNote": "Limited space requires careful AHPRA compliance consideration"}',
    '{"introduction": 10, "mainContent": 70, "disclaimer": 0, "callToAction": 20, "hashtags": 0}',
    ARRAY[
        'Use thread format for complex healthcare topics',
        'Include disclaimer link in bio or thread',
        'Focus on one key health message per tweet',
        'Use Twitter for health awareness, not detailed medical advice'
    ]
),
(
    'website',
    '{"postText": 50000, "postTitle": 60, "bio": 500}',
    '{"postText": 1200, "explanation": "Website content can be comprehensive with full medical disclaimers", "complianceNote": "Ideal platform for complete AHPRA and TGA compliance information"}',
    '{"introduction": 5, "mainContent": 80, "disclaimer": 10, "callToAction": 3, "hashtags": 2}',
    ARRAY[
        'Include full medical disclaimers and AHPRA registration',
        'Structure content with clear headings for readability',
        'SEO optimization important for healthcare content discovery',
        'Can include comprehensive patient education information'
    ]
);

COMMENT ON TABLE platform_character_limits IS 'Configuration for platform-specific character limits optimized for healthcare content';
COMMENT ON TABLE platform_content_validation IS 'Tracking validation results for healthcare content across platforms';
COMMENT ON TABLE platform_content_optimization IS 'Optimization results and effectiveness tracking for healthcare content';
COMMENT ON TABLE platform_content_performance IS 'Performance analytics for platform-optimized healthcare content';
COMMENT ON TABLE practice_platform_usage_stats IS 'Practice-level statistics for platform content optimization usage'; 