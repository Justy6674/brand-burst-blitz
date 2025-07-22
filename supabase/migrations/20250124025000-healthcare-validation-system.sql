-- Healthcare Input Validation System Database Schema
-- Comprehensive validation tracking for AHPRA compliance, security monitoring, and data sanitization

-- Healthcare validation logs table
CREATE TABLE healthcare_validation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  validation_type VARCHAR(50) NOT NULL CHECK (validation_type IN (
    'ahpra_registration', 'practice_details', 'patient_content', 
    'team_member', 'appointment_info', 'email', 'phone', 'security'
  )),
  input_data JSONB NOT NULL,
  sanitized_data JSONB,
  validation_result JSONB NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT false,
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  security_risk VARCHAR(20) CHECK (security_risk IN ('low', 'medium', 'high', 'critical')),
  errors TEXT[],
  warnings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AHPRA compliance monitoring table
CREATE TABLE healthcare_compliance_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  content_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for content identification
  content_type VARCHAR(50) NOT NULL,
  compliance_check_result JSONB NOT NULL,
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  violations TEXT[],
  suggestions TEXT[],
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  has_prohibited_terms BOOLEAN DEFAULT false,
  has_therapeutic_claims BOOLEAN DEFAULT false,
  has_patient_testimonials BOOLEAN DEFAULT false,
  missing_disclaimers BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security alerts and monitoring table
CREATE TABLE healthcare_security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
    'xss', 'injection', 'malicious_content', 'suspicious_pattern'
  )),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  content_sample TEXT,
  action_taken VARCHAR(20) CHECK (action_taken IN ('blocked', 'sanitized', 'flagged')),
  detection_method VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data sanitization tracking table
CREATE TABLE healthcare_data_sanitization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  original_length INTEGER NOT NULL,
  sanitized_length INTEGER NOT NULL,
  changes_detected BOOLEAN NOT NULL DEFAULT false,
  sanitization_type VARCHAR(50) NOT NULL,
  patterns_removed TEXT[],
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Healthcare validation analytics table
CREATE TABLE healthcare_validation_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_validations INTEGER DEFAULT 0,
  successful_validations INTEGER DEFAULT 0,
  failed_validations INTEGER DEFAULT 0,
  compliance_checks INTEGER DEFAULT 0,
  security_alerts INTEGER DEFAULT 0,
  data_sanitizations INTEGER DEFAULT 0,
  average_compliance_score DECIMAL(5,2),
  total_violations INTEGER DEFAULT 0,
  critical_violations INTEGER DEFAULT 0,
  processing_time_avg_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_profile_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_healthcare_validation_logs_user ON healthcare_validation_logs(user_id);
CREATE INDEX idx_healthcare_validation_logs_business ON healthcare_validation_logs(business_profile_id);
CREATE INDEX idx_healthcare_validation_logs_type ON healthcare_validation_logs(validation_type);
CREATE INDEX idx_healthcare_validation_logs_valid ON healthcare_validation_logs(is_valid);
CREATE INDEX idx_healthcare_validation_logs_created ON healthcare_validation_logs(created_at);

CREATE INDEX idx_healthcare_compliance_user ON healthcare_compliance_monitoring(user_id);
CREATE INDEX idx_healthcare_compliance_business ON healthcare_compliance_monitoring(business_profile_id);
CREATE INDEX idx_healthcare_compliance_risk ON healthcare_compliance_monitoring(risk_level);
CREATE INDEX idx_healthcare_compliance_created ON healthcare_compliance_monitoring(created_at);
CREATE INDEX idx_healthcare_compliance_hash ON healthcare_compliance_monitoring(content_hash);

CREATE INDEX idx_healthcare_security_user ON healthcare_security_alerts(user_id);
CREATE INDEX idx_healthcare_security_business ON healthcare_security_alerts(business_profile_id);
CREATE INDEX idx_healthcare_security_type ON healthcare_security_alerts(alert_type);
CREATE INDEX idx_healthcare_security_severity ON healthcare_security_alerts(severity);
CREATE INDEX idx_healthcare_security_resolved ON healthcare_security_alerts(resolved);
CREATE INDEX idx_healthcare_security_created ON healthcare_security_alerts(created_at);

CREATE INDEX idx_healthcare_sanitization_user ON healthcare_data_sanitization(user_id);
CREATE INDEX idx_healthcare_sanitization_business ON healthcare_data_sanitization(business_profile_id);
CREATE INDEX idx_healthcare_sanitization_created ON healthcare_data_sanitization(created_at);

CREATE INDEX idx_healthcare_validation_analytics_business ON healthcare_validation_analytics(business_profile_id);
CREATE INDEX idx_healthcare_validation_analytics_date ON healthcare_validation_analytics(date);

-- Enable Row Level Security
ALTER TABLE healthcare_validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_compliance_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_data_sanitization ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_validation_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for healthcare_validation_logs
CREATE POLICY "Users can view their own validation logs"
  ON healthcare_validation_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own validation logs"
  ON healthcare_validation_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business members can view validation logs"
  ON healthcare_validation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.id = healthcare_validation_logs.business_profile_id
      AND bp.user_id = auth.uid()
    )
  );

-- RLS Policies for healthcare_compliance_monitoring
CREATE POLICY "Users can view their own compliance monitoring"
  ON healthcare_compliance_monitoring FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance monitoring"
  ON healthcare_compliance_monitoring FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business members can view compliance monitoring"
  ON healthcare_compliance_monitoring FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.id = healthcare_compliance_monitoring.business_profile_id
      AND bp.user_id = auth.uid()
    )
  );

-- RLS Policies for healthcare_security_alerts
CREATE POLICY "Users can view their own security alerts"
  ON healthcare_security_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security alerts"
  ON healthcare_security_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all security alerts"
  ON healthcare_security_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- RLS Policies for healthcare_data_sanitization
CREATE POLICY "Users can view their own sanitization logs"
  ON healthcare_data_sanitization FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sanitization logs"
  ON healthcare_data_sanitization FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for healthcare_validation_analytics
CREATE POLICY "Business owners can view their validation analytics"
  ON healthcare_validation_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.id = healthcare_validation_analytics.business_profile_id
      AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their validation analytics"
  ON healthcare_validation_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.id = healthcare_validation_analytics.business_profile_id
      AND bp.user_id = auth.uid()
    )
  );

-- Create functions for analytics updates
CREATE OR REPLACE FUNCTION update_healthcare_validation_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO healthcare_validation_analytics (
    business_profile_id,
    date,
    total_validations,
    successful_validations,
    failed_validations
  )
  VALUES (
    NEW.business_profile_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.is_valid THEN 1 ELSE 0 END,
    CASE WHEN NOT NEW.is_valid THEN 1 ELSE 0 END
  )
  ON CONFLICT (business_profile_id, date)
  DO UPDATE SET
    total_validations = healthcare_validation_analytics.total_validations + 1,
    successful_validations = healthcare_validation_analytics.successful_validations + 
      CASE WHEN NEW.is_valid THEN 1 ELSE 0 END,
    failed_validations = healthcare_validation_analytics.failed_validations + 
      CASE WHEN NOT NEW.is_valid THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for analytics
CREATE TRIGGER update_validation_analytics_trigger
  AFTER INSERT ON healthcare_validation_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_healthcare_validation_analytics();

-- Create function for compliance analytics
CREATE OR REPLACE FUNCTION update_compliance_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO healthcare_validation_analytics (
    business_profile_id,
    date,
    compliance_checks,
    total_violations,
    critical_violations,
    average_compliance_score
  )
  VALUES (
    NEW.business_profile_id,
    CURRENT_DATE,
    1,
    array_length(NEW.violations, 1),
    CASE WHEN NEW.risk_level = 'critical' THEN 1 ELSE 0 END,
    NEW.compliance_score
  )
  ON CONFLICT (business_profile_id, date)
  DO UPDATE SET
    compliance_checks = healthcare_validation_analytics.compliance_checks + 1,
    total_violations = healthcare_validation_analytics.total_violations + 
      COALESCE(array_length(NEW.violations, 1), 0),
    critical_violations = healthcare_validation_analytics.critical_violations + 
      CASE WHEN NEW.risk_level = 'critical' THEN 1 ELSE 0 END,
    average_compliance_score = (
      COALESCE(healthcare_validation_analytics.average_compliance_score, 0) * 
      (healthcare_validation_analytics.compliance_checks - 1) + NEW.compliance_score
    ) / healthcare_validation_analytics.compliance_checks,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_analytics_trigger
  AFTER INSERT ON healthcare_compliance_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_analytics();

-- Create function for security analytics
CREATE OR REPLACE FUNCTION update_security_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO healthcare_validation_analytics (
    business_profile_id,
    date,
    security_alerts
  )
  VALUES (
    NEW.business_profile_id,
    CURRENT_DATE,
    1
  )
  ON CONFLICT (business_profile_id, date)
  DO UPDATE SET
    security_alerts = healthcare_validation_analytics.security_alerts + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_analytics_trigger
  AFTER INSERT ON healthcare_security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_security_analytics();

-- Add comments for documentation
COMMENT ON TABLE healthcare_validation_logs IS 'Comprehensive logging of all healthcare input validation activities';
COMMENT ON TABLE healthcare_compliance_monitoring IS 'AHPRA compliance monitoring and violation tracking';
COMMENT ON TABLE healthcare_security_alerts IS 'Security threats and alerts for healthcare content';
COMMENT ON TABLE healthcare_data_sanitization IS 'Data sanitization tracking and patterns removed';
COMMENT ON TABLE healthcare_validation_analytics IS 'Aggregated analytics for healthcare validation performance';

COMMENT ON COLUMN healthcare_validation_logs.validation_type IS 'Type of validation performed (ahpra_registration, patient_content, etc.)';
COMMENT ON COLUMN healthcare_validation_logs.compliance_score IS 'AHPRA compliance score from 0-100';
COMMENT ON COLUMN healthcare_compliance_monitoring.content_hash IS 'SHA-256 hash for content deduplication and tracking';
COMMENT ON COLUMN healthcare_security_alerts.action_taken IS 'Action taken when security issue detected';
COMMENT ON COLUMN healthcare_data_sanitization.patterns_removed IS 'Array of patterns that were sanitized from content'; 