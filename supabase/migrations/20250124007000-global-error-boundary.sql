-- Global Error Boundary Migration
-- Error reporting system with healthcare compliance impact tracking

-- Error Reports Table
CREATE TABLE error_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_id TEXT NOT NULL UNIQUE,
    
    -- Error Details
    error_message TEXT NOT NULL,
    error_stack TEXT,
    error_category TEXT NOT NULL CHECK (error_category IN ('javascript', 'network', 'auth', 'compliance', 'data', 'unknown')),
    user_impact TEXT NOT NULL CHECK (user_impact IN ('low', 'medium', 'high', 'critical')),
    
    -- Context Information
    component_stack TEXT,
    user_agent TEXT,
    url TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- User Information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_feedback TEXT,
    
    -- Session Data
    session_data JSONB DEFAULT '{}',
    
    -- Healthcare Compliance Impact
    compliance_impact BOOLEAN DEFAULT false,
    
    -- Resolution Tracking
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    
    -- Error Frequency
    occurrence_count INTEGER DEFAULT 1,
    first_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error Categories Configuration Table
CREATE TABLE error_categories_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color_scheme TEXT,
    severity_mapping JSONB DEFAULT '{}',
    auto_resolution_enabled BOOLEAN DEFAULT false,
    notification_threshold INTEGER DEFAULT 10,
    escalation_rules JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Error Monitoring Table
CREATE TABLE system_error_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitoring_window TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Error Counts by Category
    javascript_errors INTEGER DEFAULT 0,
    network_errors INTEGER DEFAULT 0,
    auth_errors INTEGER DEFAULT 0,
    compliance_errors INTEGER DEFAULT 0,
    data_errors INTEGER DEFAULT 0,
    unknown_errors INTEGER DEFAULT 0,
    
    -- Impact Levels
    critical_errors INTEGER DEFAULT 0,
    high_impact_errors INTEGER DEFAULT 0,
    medium_impact_errors INTEGER DEFAULT 0,
    low_impact_errors INTEGER DEFAULT 0,
    
    -- User Metrics
    affected_users INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Healthcare Specific
    compliance_affected_errors INTEGER DEFAULT 0,
    patient_data_affected BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error Resolution Actions Table
CREATE TABLE error_resolution_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_report_id UUID NOT NULL REFERENCES error_reports(id) ON DELETE CASCADE,
    
    -- Action Details
    action_type TEXT NOT NULL CHECK (action_type IN ('auto_retry', 'manual_fix', 'documentation_update', 'user_guidance', 'system_rollback')),
    action_description TEXT NOT NULL,
    action_taken_by UUID REFERENCES auth.users(id),
    action_taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Results
    action_successful BOOLEAN,
    action_notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default error categories configuration
INSERT INTO error_categories_config (
    category, display_name, description, icon, color_scheme, severity_mapping, 
    auto_resolution_enabled, notification_threshold, escalation_rules
) VALUES 

('javascript', 'Application Error', 'JavaScript runtime errors and exceptions', 'alert-triangle', 'orange',
 '{"low": "minor UI glitches", "medium": "functionality impaired", "high": "major features broken", "critical": "app unusable"}'::jsonb,
 true, 5, '{"critical": {"immediate": true, "notify": ["dev_team"]}, "high": {"within_hours": 2}}'::jsonb),

('network', 'Connection Error', 'Network connectivity and API communication issues', 'wifi-off', 'blue',
 '{"low": "slow loading", "medium": "intermittent failures", "high": "consistent failures", "critical": "complete disconnection"}'::jsonb,
 true, 3, '{"critical": {"immediate": true, "notify": ["ops_team", "dev_team"]}}'::jsonb),

('auth', 'Authentication Error', 'User authentication and authorization failures', 'shield-x', 'red',
 '{"low": "minor permission issues", "medium": "login difficulties", "high": "access denied", "critical": "security breach"}'::jsonb,
 false, 2, '{"critical": {"immediate": true, "notify": ["security_team", "dev_team"]}, "high": {"within_minutes": 15}}'::jsonb),

('compliance', 'Healthcare Compliance Error', 'AHPRA/TGA compliance and healthcare regulation issues', 'shield-alert', 'purple',
 '{"low": "minor compliance warnings", "medium": "compliance checks failed", "high": "regulatory violations", "critical": "patient safety impact"}'::jsonb,
 false, 1, '{"critical": {"immediate": true, "notify": ["compliance_team", "management"]}, "high": {"within_minutes": 5}}'::jsonb),

('data', 'Data Processing Error', 'Database operations and data integrity issues', 'database', 'green',
 '{"low": "minor data inconsistencies", "medium": "data save failures", "high": "data corruption", "critical": "data loss"}'::jsonb,
 true, 3, '{"critical": {"immediate": true, "notify": ["data_team", "ops_team"]}}'::jsonb),

('unknown', 'Unexpected Error', 'Unclassified or novel error conditions', 'help-circle', 'gray',
 '{"low": "minor unknown issues", "medium": "unidentified problems", "high": "significant unknown errors", "critical": "system instability"}'::jsonb,
 false, 5, '{"critical": {"immediate": true, "notify": ["dev_team"]}}'::jsonb);

-- Row Level Security Policies

-- Error Reports RLS
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own error reports" ON error_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert error reports" ON error_reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update error reports" ON error_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'developer')
        )
    );

CREATE POLICY "Admin can view all error reports" ON error_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'developer')
        )
    );

-- Error Categories Config RLS
ALTER TABLE error_categories_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read error categories" ON error_categories_config
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage error categories" ON error_categories_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- System Error Monitoring RLS
ALTER TABLE system_error_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can view error monitoring" ON system_error_monitoring
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'developer')
        )
    );

CREATE POLICY "System can insert monitoring data" ON system_error_monitoring
    FOR INSERT WITH CHECK (true);

-- Error Resolution Actions RLS
ALTER TABLE error_resolution_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view resolutions for own errors" ON error_resolution_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM error_reports 
            WHERE id = error_report_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Developers can manage resolution actions" ON error_resolution_actions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'developer')
        )
    );

-- Indexes for Performance
CREATE INDEX idx_error_reports_error_id ON error_reports(error_id);
CREATE INDEX idx_error_reports_category ON error_reports(error_category);
CREATE INDEX idx_error_reports_impact ON error_reports(user_impact);
CREATE INDEX idx_error_reports_user ON error_reports(user_id);
CREATE INDEX idx_error_reports_timestamp ON error_reports(timestamp);
CREATE INDEX idx_error_reports_compliance ON error_reports(compliance_impact) WHERE compliance_impact = true;
CREATE INDEX idx_error_reports_unresolved ON error_reports(resolved) WHERE resolved = false;
CREATE INDEX idx_error_reports_url ON error_reports(url);

CREATE INDEX idx_system_monitoring_window ON system_error_monitoring(monitoring_window);
CREATE INDEX idx_system_monitoring_critical ON system_error_monitoring(critical_errors) WHERE critical_errors > 0;

CREATE INDEX idx_resolution_actions_report ON error_resolution_actions(error_report_id);
CREATE INDEX idx_resolution_actions_type ON error_resolution_actions(action_type);
CREATE INDEX idx_resolution_actions_success ON error_resolution_actions(action_successful);

-- Functions for Error Management

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '24 hours',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
    total_errors INTEGER;
    error_by_category JSONB;
    error_by_impact JSONB;
    compliance_errors INTEGER;
    resolution_rate DECIMAL;
    avg_resolution_time INTERVAL;
BEGIN
    -- Total errors in period
    SELECT COUNT(*) INTO total_errors
    FROM error_reports
    WHERE timestamp BETWEEN start_date AND end_date;
    
    -- Errors by category
    SELECT jsonb_object_agg(error_category, error_count)
    INTO error_by_category
    FROM (
        SELECT error_category, COUNT(*) as error_count
        FROM error_reports
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY error_category
    ) category_stats;
    
    -- Errors by impact level
    SELECT jsonb_object_agg(user_impact, impact_count)
    INTO error_by_impact
    FROM (
        SELECT user_impact, COUNT(*) as impact_count
        FROM error_reports
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY user_impact
    ) impact_stats;
    
    -- Compliance-related errors
    SELECT COUNT(*) INTO compliance_errors
    FROM error_reports
    WHERE timestamp BETWEEN start_date AND end_date
    AND compliance_impact = true;
    
    -- Resolution rate
    SELECT 
        CASE 
            WHEN total_errors > 0 
            THEN (COUNT(*) FILTER (WHERE resolved = true)::DECIMAL / total_errors * 100)
            ELSE 0 
        END
    INTO resolution_rate
    FROM error_reports
    WHERE timestamp BETWEEN start_date AND end_date;
    
    -- Average resolution time
    SELECT AVG(resolved_at - timestamp)
    INTO avg_resolution_time
    FROM error_reports
    WHERE timestamp BETWEEN start_date AND end_date
    AND resolved = true;
    
    RETURN jsonb_build_object(
        'period', jsonb_build_object('start', start_date, 'end', end_date),
        'total_errors', total_errors,
        'errors_by_category', COALESCE(error_by_category, '{}'::jsonb),
        'errors_by_impact', COALESCE(error_by_impact, '{}'::jsonb),
        'compliance_errors', compliance_errors,
        'resolution_rate_percent', COALESCE(resolution_rate, 0),
        'avg_resolution_time_hours', EXTRACT(EPOCH FROM COALESCE(avg_resolution_time, '0 seconds'::interval)) / 3600,
        'generated_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for similar errors
CREATE OR REPLACE FUNCTION find_similar_errors(
    error_message_param TEXT,
    error_stack_param TEXT DEFAULT NULL,
    similarity_threshold DECIMAL DEFAULT 0.7
)
RETURNS TABLE(
    error_id TEXT,
    similarity_score DECIMAL,
    occurrence_count INTEGER,
    last_occurrence TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.error_id,
        similarity(er.error_message, error_message_param) as similarity_score,
        er.occurrence_count,
        er.last_occurrence,
        er.resolved
    FROM error_reports er
    WHERE similarity(er.error_message, error_message_param) >= similarity_threshold
    ORDER BY similarity_score DESC, er.last_occurrence DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update error monitoring statistics
CREATE OR REPLACE FUNCTION update_error_monitoring_stats()
RETURNS VOID AS $$
DECLARE
    current_window TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Round to nearest hour for monitoring window
    current_window := date_trunc('hour', NOW());
    
    -- Insert or update monitoring stats for current window
    INSERT INTO system_error_monitoring (
        monitoring_window,
        javascript_errors,
        network_errors,
        auth_errors,
        compliance_errors,
        data_errors,
        unknown_errors,
        critical_errors,
        high_impact_errors,
        medium_impact_errors,
        low_impact_errors,
        affected_users,
        compliance_affected_errors
    )
    SELECT 
        current_window,
        COUNT(*) FILTER (WHERE error_category = 'javascript'),
        COUNT(*) FILTER (WHERE error_category = 'network'),
        COUNT(*) FILTER (WHERE error_category = 'auth'),
        COUNT(*) FILTER (WHERE error_category = 'compliance'),
        COUNT(*) FILTER (WHERE error_category = 'data'),
        COUNT(*) FILTER (WHERE error_category = 'unknown'),
        COUNT(*) FILTER (WHERE user_impact = 'critical'),
        COUNT(*) FILTER (WHERE user_impact = 'high'),
        COUNT(*) FILTER (WHERE user_impact = 'medium'),
        COUNT(*) FILTER (WHERE user_impact = 'low'),
        COUNT(DISTINCT user_id),
        COUNT(*) FILTER (WHERE compliance_impact = true)
    FROM error_reports
    WHERE timestamp >= current_window 
    AND timestamp < current_window + INTERVAL '1 hour'
    
    ON CONFLICT (monitoring_window) DO UPDATE SET
        javascript_errors = EXCLUDED.javascript_errors,
        network_errors = EXCLUDED.network_errors,
        auth_errors = EXCLUDED.auth_errors,
        compliance_errors = EXCLUDED.compliance_errors,
        data_errors = EXCLUDED.data_errors,
        unknown_errors = EXCLUDED.unknown_errors,
        critical_errors = EXCLUDED.critical_errors,
        high_impact_errors = EXCLUDED.high_impact_errors,
        medium_impact_errors = EXCLUDED.medium_impact_errors,
        low_impact_errors = EXCLUDED.low_impact_errors,
        affected_users = EXCLUDED.affected_users,
        compliance_affected_errors = EXCLUDED.compliance_affected_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle duplicate error aggregation
CREATE OR REPLACE FUNCTION aggregate_duplicate_errors()
RETURNS TRIGGER AS $$
DECLARE
    existing_error_id UUID;
BEGIN
    -- Look for existing similar error in last 24 hours
    SELECT id INTO existing_error_id
    FROM error_reports
    WHERE error_message = NEW.error_message
    AND error_category = NEW.error_category
    AND url = NEW.url
    AND timestamp > NOW() - INTERVAL '24 hours'
    AND id != NEW.id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- If similar error found, update it instead of creating new
    IF existing_error_id IS NOT NULL THEN
        UPDATE error_reports
        SET 
            occurrence_count = occurrence_count + 1,
            last_occurrence = NEW.timestamp,
            updated_at = NOW()
        WHERE id = existing_error_id;
        
        -- Delete the new duplicate
        DELETE FROM error_reports WHERE id = NEW.id;
        RETURN NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Trigger for updated_at columns
CREATE TRIGGER update_error_reports_updated_at
    BEFORE UPDATE ON error_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_error_categories_config_updated_at
    BEFORE UPDATE ON error_categories_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for duplicate error aggregation
CREATE TRIGGER trigger_aggregate_duplicate_errors
    AFTER INSERT ON error_reports
    FOR EACH ROW
    EXECUTE FUNCTION aggregate_duplicate_errors();

-- Trigger to update monitoring stats
CREATE OR REPLACE FUNCTION trigger_update_monitoring_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update monitoring stats when new error is inserted
    PERFORM update_error_monitoring_stats();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_error_monitoring
    AFTER INSERT ON error_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_monitoring_stats();

-- Grant necessary permissions
GRANT SELECT, INSERT ON error_reports TO authenticated;
GRANT SELECT ON error_categories_config TO authenticated;
GRANT SELECT ON system_error_monitoring TO authenticated;
GRANT SELECT, INSERT ON error_resolution_actions TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_error_statistics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION find_similar_errors(TEXT, TEXT, DECIMAL) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE error_reports IS 'Global error reporting system with healthcare compliance impact tracking';
COMMENT ON TABLE error_categories_config IS 'Configuration for error categories with severity mapping and escalation rules';
COMMENT ON TABLE system_error_monitoring IS 'Hourly aggregated error monitoring statistics for system health tracking';
COMMENT ON TABLE error_resolution_actions IS 'Tracking of actions taken to resolve reported errors';

COMMENT ON FUNCTION get_error_statistics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) IS 'Returns comprehensive error statistics for a given time period';
COMMENT ON FUNCTION find_similar_errors(TEXT, TEXT, DECIMAL) IS 'Finds similar errors based on message similarity for duplicate detection';
COMMENT ON FUNCTION update_error_monitoring_stats() IS 'Updates hourly error monitoring statistics';

-- Create initial monitoring window
SELECT update_error_monitoring_stats(); 