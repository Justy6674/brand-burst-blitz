-- Healthcare Analytics Processing Pipeline
-- Migration: 20250124019000-healthcare-analytics-processor.sql

-- Processed Healthcare Insights Storage
CREATE TABLE IF NOT EXISTS healthcare_processed_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Processing Information
    processing_date DATE NOT NULL,
    processing_version TEXT DEFAULT '1.0',
    data_sources_processed TEXT[] DEFAULT ARRAY['social_media', 'website', 'appointments', 'content'],
    processing_duration_seconds INTEGER,
    
    -- Summary Metrics
    summary_metrics JSONB NOT NULL DEFAULT '{}',
    total_patient_reach INTEGER DEFAULT 0,
    patient_engagement_rate DECIMAL DEFAULT 0,
    appointment_conversion_rate DECIMAL DEFAULT 0,
    compliance_score INTEGER DEFAULT 0,
    growth_rate DECIMAL DEFAULT 0,
    
    -- Full Insights Data
    insights_data JSONB NOT NULL DEFAULT '{}',
    
    -- Quick Access Fields
    recommendation_count INTEGER DEFAULT 0,
    high_priority_recommendations INTEGER DEFAULT 0,
    alert_count INTEGER DEFAULT 0,
    critical_alert_count INTEGER DEFAULT 0,
    
    -- Performance Indicators
    booking_optimization_score DECIMAL DEFAULT 0,
    content_optimization_score DECIMAL DEFAULT 0,
    engagement_optimization_score DECIMAL DEFAULT 0,
    
    -- Compliance Monitoring
    content_compliance_rate DECIMAL DEFAULT 0,
    advertising_compliance_score DECIMAL DEFAULT 0,
    professional_boundaries_score DECIMAL DEFAULT 0,
    privacy_compliance_score DECIMAL DEFAULT 0,
    
    -- Predictive Analytics
    next_month_booking_prediction INTEGER DEFAULT 0,
    patient_churn_risk_percentage DECIMAL DEFAULT 0,
    content_performance_trend TEXT CHECK (content_performance_trend IN ('improving', 'stable', 'declining')),
    
    -- Processing Quality
    data_quality_score DECIMAL DEFAULT 0,
    prediction_confidence_level DECIMAL DEFAULT 0,
    insights_reliability_score DECIMAL DEFAULT 0,
    
    -- Privacy & Compliance
    data_anonymization_level TEXT CHECK (data_anonymization_level IN ('basic', 'enhanced', 'maximum')) DEFAULT 'enhanced',
    ahpra_compliance_verified BOOLEAN DEFAULT true,
    patient_privacy_protected BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, practice_id, processing_date)
);

-- Healthcare Analytics Recommendations
CREATE TABLE IF NOT EXISTS healthcare_analytics_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    insights_id UUID REFERENCES healthcare_processed_insights(id) ON DELETE CASCADE,
    
    -- Recommendation Details
    recommendation_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'content', 'booking', 'compliance', 'engagement', 'growth', 
        'patient_experience', 'operational', 'marketing', 'revenue'
    )),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_items TEXT[] DEFAULT '{}',
    expected_impact TEXT,
    implementation_difficulty TEXT CHECK (implementation_difficulty IN ('easy', 'medium', 'complex')),
    
    -- Healthcare Specific
    ahpra_considerations TEXT,
    patient_safety_impact TEXT,
    compliance_requirements TEXT[],
    
    -- Implementation Tracking
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed', 'deferred')) DEFAULT 'pending',
    implementation_start_date DATE,
    implementation_target_date DATE,
    implementation_completion_date DATE,
    
    -- Impact Measurement
    baseline_metric_value DECIMAL,
    target_metric_value DECIMAL,
    actual_impact_achieved DECIMAL,
    roi_percentage DECIMAL,
    
    -- User Interaction
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    dismissed_reason TEXT,
    
    -- Automated Tracking
    auto_generated BOOLEAN DEFAULT true,
    confidence_score DECIMAL DEFAULT 0,
    recommendation_source TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, practice_id, insights_id, recommendation_id)
);

-- Healthcare Compliance Monitoring Alerts
CREATE TABLE IF NOT EXISTS healthcare_compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    insights_id UUID REFERENCES healthcare_processed_insights(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'content_compliance', 'advertising_violation', 'privacy_breach', 
        'professional_boundaries', 'therapeutic_claims', 'patient_testimonials',
        'misleading_information', 'inadequate_disclaimers'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Alert Content
    alert_title TEXT NOT NULL,
    alert_message TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    
    -- Source Information
    content_id TEXT,
    content_type TEXT,
    platform TEXT,
    detection_method TEXT,
    
    -- Compliance Framework
    ahpra_guideline_reference TEXT,
    tga_regulation_reference TEXT,
    privacy_law_reference TEXT,
    
    -- Resolution Tracking
    status TEXT CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'dismissed')) DEFAULT 'open',
    resolution_action_taken TEXT,
    resolution_date TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Impact Assessment
    potential_compliance_risk TEXT CHECK (potential_compliance_risk IN ('low', 'medium', 'high', 'severe')),
    patient_safety_impact BOOLEAN DEFAULT false,
    regulatory_reporting_required BOOLEAN DEFAULT false,
    
    -- User Response
    user_acknowledged_at TIMESTAMP WITH TIME ZONE,
    user_response TEXT,
    escalation_required BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Healthcare Performance Optimization Tracking
CREATE TABLE IF NOT EXISTS healthcare_performance_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    insights_id UUID REFERENCES healthcare_processed_insights(id) ON DELETE CASCADE,
    
    -- Optimization Details
    optimization_type TEXT NOT NULL CHECK (optimization_type IN (
        'booking_funnel', 'content_strategy', 'patient_engagement', 
        'appointment_scheduling', 'website_conversion', 'social_media_reach'
    )),
    optimization_area TEXT NOT NULL,
    
    -- Current Performance
    current_metric_name TEXT NOT NULL,
    current_metric_value DECIMAL NOT NULL,
    benchmark_value DECIMAL,
    industry_average DECIMAL,
    
    -- Optimization Potential
    optimization_potential_percentage DECIMAL DEFAULT 0,
    recommended_target_value DECIMAL,
    estimated_timeline_days INTEGER,
    
    -- Action Plan
    recommended_actions TEXT[] DEFAULT '{}',
    implementation_steps TEXT[] DEFAULT '{}',
    required_resources TEXT[],
    
    -- Healthcare Context
    patient_impact_description TEXT,
    compliance_considerations TEXT,
    clinical_workflow_impact TEXT,
    
    -- Implementation Tracking
    implementation_status TEXT CHECK (implementation_status IN (
        'not_started', 'planning', 'in_progress', 'completed', 'on_hold', 'cancelled'
    )) DEFAULT 'not_started',
    implementation_progress_percentage INTEGER DEFAULT 0,
    
    -- Results Measurement
    measurement_start_date DATE,
    measurement_end_date DATE,
    actual_improvement_achieved DECIMAL,
    success_criteria_met BOOLEAN,
    
    -- ROI Calculation
    implementation_cost_estimate DECIMAL,
    expected_revenue_impact DECIMAL,
    time_savings_hours_per_month DECIMAL,
    patient_satisfaction_impact_score DECIMAL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Healthcare Analytics Processing Jobs
CREATE TABLE IF NOT EXISTS healthcare_analytics_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT,
    
    -- Job Details
    job_type TEXT NOT NULL CHECK (job_type IN (
        'full_analytics_processing', 'compliance_monitoring', 'predictive_analytics',
        'performance_optimization', 'insight_generation', 'alert_processing'
    )),
    job_status TEXT NOT NULL CHECK (job_status IN (
        'queued', 'processing', 'completed', 'failed', 'cancelled'
    )) DEFAULT 'queued',
    
    -- Processing Configuration
    processing_config JSONB DEFAULT '{}',
    data_sources TEXT[] DEFAULT '{}',
    time_range_start DATE,
    time_range_end DATE,
    
    -- Execution Details
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_duration_seconds INTEGER,
    
    -- Results
    records_processed INTEGER DEFAULT 0,
    insights_generated INTEGER DEFAULT 0,
    recommendations_created INTEGER DEFAULT 0,
    alerts_generated INTEGER DEFAULT 0,
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Quality Metrics
    data_quality_score DECIMAL DEFAULT 0,
    processing_success_rate DECIMAL DEFAULT 0,
    confidence_score DECIMAL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_healthcare_processed_insights_user_date 
    ON healthcare_processed_insights(user_id, processing_date DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_processed_insights_compliance 
    ON healthcare_processed_insights(user_id, compliance_score DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_analytics_recommendations_user_priority 
    ON healthcare_analytics_recommendations(user_id, priority DESC, status);

CREATE INDEX IF NOT EXISTS idx_healthcare_analytics_recommendations_category 
    ON healthcare_analytics_recommendations(category, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_compliance_alerts_user_severity 
    ON healthcare_compliance_alerts(user_id, severity DESC, status);

CREATE INDEX IF NOT EXISTS idx_healthcare_compliance_alerts_type 
    ON healthcare_compliance_alerts(alert_type, severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_healthcare_performance_optimizations_user_type 
    ON healthcare_performance_optimizations(user_id, optimization_type, implementation_status);

CREATE INDEX IF NOT EXISTS idx_healthcare_analytics_processing_jobs_status 
    ON healthcare_analytics_processing_jobs(job_status, created_at DESC);

-- Row Level Security (RLS) Policies

-- Healthcare Processed Insights
ALTER TABLE healthcare_processed_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own processed insights" ON healthcare_processed_insights
    FOR ALL USING (auth.uid() = user_id);

-- Healthcare Analytics Recommendations
ALTER TABLE healthcare_analytics_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recommendations" ON healthcare_analytics_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- Healthcare Compliance Alerts
ALTER TABLE healthcare_compliance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own compliance alerts" ON healthcare_compliance_alerts
    FOR ALL USING (auth.uid() = user_id);

-- Healthcare Performance Optimizations
ALTER TABLE healthcare_performance_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own performance optimizations" ON healthcare_performance_optimizations
    FOR ALL USING (auth.uid() = user_id);

-- Healthcare Analytics Processing Jobs
ALTER TABLE healthcare_analytics_processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own processing jobs" ON healthcare_analytics_processing_jobs
    FOR ALL USING (auth.uid() = user_id);

-- Functions for Healthcare Analytics Processing

-- Function to calculate healthcare practice performance score
CREATE OR REPLACE FUNCTION calculate_healthcare_practice_score(
    p_user_id UUID,
    p_practice_id TEXT,
    p_date_from DATE,
    p_date_to DATE
)
RETURNS TABLE(
    overall_score DECIMAL,
    patient_reach_score DECIMAL,
    engagement_score DECIMAL,
    booking_score DECIMAL,
    compliance_score DECIMAL,
    growth_score DECIMAL
) AS $$
DECLARE
    latest_insights RECORD;
BEGIN
    -- Get latest processed insights
    SELECT * INTO latest_insights
    FROM healthcare_processed_insights
    WHERE user_id = p_user_id
        AND practice_id = p_practice_id
        AND processing_date BETWEEN p_date_from AND p_date_to
    ORDER BY processing_date DESC
    LIMIT 1;
    
    IF latest_insights IS NULL THEN
        RETURN QUERY SELECT 0::DECIMAL, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL;
        RETURN;
    END IF;
    
    -- Calculate component scores (0-100 scale)
    RETURN QUERY SELECT
        (latest_insights.compliance_score + 
         LEAST(100, latest_insights.patient_engagement_rate * 10) + 
         LEAST(100, latest_insights.appointment_conversion_rate) + 
         LEAST(100, ABS(latest_insights.growth_rate) * 2)) / 4 as overall_score,
        LEAST(100, latest_insights.total_patient_reach / 100.0) as patient_reach_score,
        LEAST(100, latest_insights.patient_engagement_rate * 10) as engagement_score,
        LEAST(100, latest_insights.appointment_conversion_rate) as booking_score,
        latest_insights.compliance_score as compliance_score,
        LEAST(100, ABS(latest_insights.growth_rate) * 2) as growth_score;
END;
$$ LANGUAGE plpgsql;

-- Function to get top healthcare recommendations
CREATE OR REPLACE FUNCTION get_top_healthcare_recommendations(
    p_user_id UUID,
    p_practice_id TEXT,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
    recommendation_id TEXT,
    title TEXT,
    description TEXT,
    priority TEXT,
    category TEXT,
    expected_impact TEXT,
    implementation_difficulty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.recommendation_id,
        r.title,
        r.description,
        r.priority,
        r.category,
        r.expected_impact,
        r.implementation_difficulty
    FROM healthcare_analytics_recommendations r
    WHERE r.user_id = p_user_id
        AND r.practice_id = p_practice_id
        AND r.status = 'pending'
    ORDER BY 
        CASE r.priority
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        r.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to check compliance alert trends
CREATE OR REPLACE FUNCTION analyze_compliance_alert_trends(
    p_user_id UUID,
    p_practice_id TEXT,
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    alert_type TEXT,
    total_alerts BIGINT,
    critical_alerts BIGINT,
    resolved_alerts BIGINT,
    trend_direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH alert_summary AS (
        SELECT 
            hca.alert_type,
            COUNT(*) as total_count,
            COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
            COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count
        FROM healthcare_compliance_alerts hca
        WHERE hca.user_id = p_user_id
            AND hca.practice_id = p_practice_id
            AND hca.created_at >= (CURRENT_DATE - INTERVAL '%s days', p_days_back)
        GROUP BY hca.alert_type
    ),
    previous_period AS (
        SELECT 
            hca.alert_type,
            COUNT(*) as prev_total_count
        FROM healthcare_compliance_alerts hca
        WHERE hca.user_id = p_user_id
            AND hca.practice_id = p_practice_id
            AND hca.created_at >= (CURRENT_DATE - INTERVAL '%s days', p_days_back * 2)
            AND hca.created_at < (CURRENT_DATE - INTERVAL '%s days', p_days_back)
        GROUP BY hca.alert_type
    )
    SELECT 
        COALESCE(a.alert_type, p.alert_type),
        COALESCE(a.total_count, 0),
        COALESCE(a.critical_count, 0),
        COALESCE(a.resolved_count, 0),
        CASE 
            WHEN p.prev_total_count IS NULL THEN 'new'
            WHEN a.total_count > p.prev_total_count THEN 'increasing'
            WHEN a.total_count < p.prev_total_count THEN 'decreasing'
            ELSE 'stable'
        END as trend_direction
    FROM alert_summary a
    FULL OUTER JOIN previous_period p ON a.alert_type = p.alert_type
    ORDER BY COALESCE(a.total_count, 0) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update analytics processing metrics
CREATE OR REPLACE FUNCTION update_analytics_processing_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update job completion metrics
    IF NEW.job_status = 'completed' AND OLD.job_status != 'completed' THEN
        NEW.completed_at = now();
        NEW.processing_duration_seconds = EXTRACT(EPOCH FROM (now() - NEW.started_at));
    END IF;
    
    -- Calculate processing success rate
    IF NEW.records_processed > 0 THEN
        NEW.processing_success_rate = (NEW.insights_generated::DECIMAL / NEW.records_processed::DECIMAL) * 100;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for Analytics Processing

-- Update processing job metrics
CREATE TRIGGER trigger_update_analytics_processing_metrics
    BEFORE UPDATE ON healthcare_analytics_processing_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_processing_metrics();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_healthcare_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_healthcare_processed_insights_timestamp
    BEFORE UPDATE ON healthcare_processed_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_analytics_timestamp();

CREATE TRIGGER update_healthcare_analytics_recommendations_timestamp
    BEFORE UPDATE ON healthcare_analytics_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_analytics_timestamp();

CREATE TRIGGER update_healthcare_compliance_alerts_timestamp
    BEFORE UPDATE ON healthcare_compliance_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_analytics_timestamp();

CREATE TRIGGER update_healthcare_performance_optimizations_timestamp
    BEFORE UPDATE ON healthcare_performance_optimizations
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_analytics_timestamp();

CREATE TRIGGER update_healthcare_analytics_processing_jobs_timestamp
    BEFORE UPDATE ON healthcare_analytics_processing_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_analytics_timestamp();

-- Grant necessary permissions
GRANT ALL ON healthcare_processed_insights TO authenticated;
GRANT ALL ON healthcare_analytics_recommendations TO authenticated;
GRANT ALL ON healthcare_compliance_alerts TO authenticated;
GRANT ALL ON healthcare_performance_optimizations TO authenticated;
GRANT ALL ON healthcare_analytics_processing_jobs TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 