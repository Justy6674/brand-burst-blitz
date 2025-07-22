-- Healthcare MFA System Migration
-- Comprehensive multi-factor authentication for healthcare data security

-- Healthcare MFA Settings Table
CREATE TABLE healthcare_mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT false,
    totp_enabled BOOLEAN DEFAULT false,
    totp_secret TEXT, -- Encrypted TOTP secret
    backup_codes TEXT[], -- Array of backup codes (hashed)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_user_mfa UNIQUE(user_id)
);

-- Healthcare MFA SMS Backup Table
CREATE TABLE healthcare_mfa_sms_backup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    country_code TEXT DEFAULT '+61',
    verified BOOLEAN DEFAULT false,
    verification_code TEXT, -- Temporary verification code
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_user_sms UNIQUE(user_id)
);

-- Healthcare MFA Verification Attempts Table
CREATE TABLE healthcare_mfa_verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    method TEXT NOT NULL CHECK (method IN ('totp', 'sms', 'backup_codes')),
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    compliance_logged BOOLEAN DEFAULT false
);

-- Healthcare MFA Configuration Table (System-wide settings)
CREATE TABLE healthcare_mfa_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enforce_for_healthcare BOOLEAN DEFAULT true,
    totp_window_size INTEGER DEFAULT 1, -- Time window for TOTP validation
    max_failed_attempts INTEGER DEFAULT 5,
    lockout_duration_minutes INTEGER DEFAULT 30,
    backup_codes_count INTEGER DEFAULT 10,
    sms_cooldown_seconds INTEGER DEFAULT 60,
    require_mfa_for_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add MFA requirement flag to healthcare_professionals table
ALTER TABLE healthcare_professionals 
ADD COLUMN IF NOT EXISTS requires_mfa BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS mfa_exemption_reason TEXT,
ADD COLUMN IF NOT EXISTS mfa_exemption_approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS mfa_exemption_expires_at TIMESTAMP WITH TIME ZONE;

-- Insert default MFA configuration
INSERT INTO healthcare_mfa_configuration (enforce_for_healthcare) VALUES (true);

-- Row Level Security Policies

-- Healthcare MFA Settings RLS
ALTER TABLE healthcare_mfa_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MFA settings" ON healthcare_mfa_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own MFA settings" ON healthcare_mfa_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MFA settings" ON healthcare_mfa_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all MFA settings" ON healthcare_mfa_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare MFA SMS Backup RLS
ALTER TABLE healthcare_mfa_sms_backup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own SMS backup" ON healthcare_mfa_sms_backup
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all SMS backup settings" ON healthcare_mfa_sms_backup
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare MFA Verification Attempts RLS
ALTER TABLE healthcare_mfa_verification_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification attempts" ON healthcare_mfa_verification_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert verification attempts" ON healthcare_mfa_verification_attempts
    FOR INSERT WITH CHECK (true); -- Allow system to log all attempts

CREATE POLICY "Admin can view all verification attempts" ON healthcare_mfa_verification_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare MFA Configuration RLS
ALTER TABLE healthcare_mfa_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage MFA configuration" ON healthcare_mfa_configuration
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "All authenticated users can read MFA configuration" ON healthcare_mfa_configuration
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Indexes for Performance
CREATE INDEX idx_healthcare_mfa_settings_user_id ON healthcare_mfa_settings(user_id);
CREATE INDEX idx_healthcare_mfa_settings_enabled ON healthcare_mfa_settings(is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_healthcare_mfa_sms_user_id ON healthcare_mfa_sms_backup(user_id);
CREATE INDEX idx_healthcare_mfa_sms_verified ON healthcare_mfa_sms_backup(verified) WHERE verified = true;
CREATE INDEX idx_mfa_verification_attempts_user_id ON healthcare_mfa_verification_attempts(user_id);
CREATE INDEX idx_mfa_verification_attempts_created ON healthcare_mfa_verification_attempts(created_at);
CREATE INDEX idx_healthcare_professionals_mfa ON healthcare_professionals(requires_mfa) WHERE requires_mfa = true;

-- Functions for MFA Management

-- Function to check if user requires MFA
CREATE OR REPLACE FUNCTION check_user_mfa_requirement(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_healthcare BOOLEAN := false;
    config_enforce BOOLEAN := false;
    user_requires BOOLEAN := false;
BEGIN
    -- Check if user is healthcare professional
    SELECT EXISTS(
        SELECT 1 FROM healthcare_professionals 
        WHERE id = user_uuid
    ) INTO is_healthcare;
    
    -- Get system configuration
    SELECT enforce_for_healthcare 
    FROM healthcare_mfa_configuration 
    ORDER BY created_at DESC 
    LIMIT 1 
    INTO config_enforce;
    
    -- Check user-specific requirement
    IF is_healthcare THEN
        SELECT COALESCE(requires_mfa, true) 
        FROM healthcare_professionals 
        WHERE id = user_uuid 
        INTO user_requires;
        
        RETURN config_enforce AND user_requires;
    END IF;
    
    -- Check if user has admin role requiring MFA
    IF EXISTS(
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid 
        AND role IN ('admin', 'super_admin')
    ) THEN
        SELECT require_mfa_for_admin 
        FROM healthcare_mfa_configuration 
        ORDER BY created_at DESC 
        LIMIT 1 
        INTO user_requires;
        
        RETURN user_requires;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log MFA verification attempt
CREATE OR REPLACE FUNCTION log_mfa_verification_attempt(
    user_uuid UUID,
    method_type TEXT,
    is_success BOOLEAN,
    ip_addr INET DEFAULT NULL,
    user_agent_string TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    attempt_id UUID;
BEGIN
    INSERT INTO healthcare_mfa_verification_attempts (
        user_id,
        method,
        success,
        ip_address,
        user_agent
    ) VALUES (
        user_uuid,
        method_type,
        is_success,
        ip_addr,
        user_agent_string
    ) RETURNING id INTO attempt_id;
    
    -- Update failed attempts counter on failure
    IF NOT is_success THEN
        UPDATE healthcare_mfa_settings 
        SET 
            failed_attempts = failed_attempts + 1,
            locked_until = CASE 
                WHEN failed_attempts + 1 >= (
                    SELECT max_failed_attempts 
                    FROM healthcare_mfa_configuration 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) THEN NOW() + INTERVAL '30 minutes'
                ELSE locked_until
            END
        WHERE user_id = user_uuid;
    ELSE
        -- Reset failed attempts on success
        UPDATE healthcare_mfa_settings 
        SET 
            failed_attempts = 0,
            locked_until = NULL,
            last_used_at = NOW()
        WHERE user_id = user_uuid;
    END IF;
    
    RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is MFA locked
CREATE OR REPLACE FUNCTION is_user_mfa_locked(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    lock_time TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT locked_until 
    FROM healthcare_mfa_settings 
    WHERE user_id = user_uuid 
    INTO lock_time;
    
    RETURN lock_time IS NOT NULL AND lock_time > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_healthcare_mfa_settings_updated_at
    BEFORE UPDATE ON healthcare_mfa_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_mfa_sms_backup_updated_at
    BEFORE UPDATE ON healthcare_mfa_sms_backup
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_mfa_configuration_updated_at
    BEFORE UPDATE ON healthcare_mfa_configuration
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically create MFA settings for healthcare professionals
CREATE OR REPLACE FUNCTION create_mfa_settings_for_healthcare()
RETURNS TRIGGER AS $$
BEGIN
    -- Create MFA settings entry for new healthcare professional
    INSERT INTO healthcare_mfa_settings (user_id, is_enabled, totp_enabled)
    VALUES (NEW.id, false, false)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_mfa_settings
    AFTER INSERT ON healthcare_professionals
    FOR EACH ROW
    EXECUTE FUNCTION create_mfa_settings_for_healthcare();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON healthcare_mfa_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON healthcare_mfa_sms_backup TO authenticated;
GRANT SELECT, INSERT ON healthcare_mfa_verification_attempts TO authenticated;
GRANT SELECT ON healthcare_mfa_configuration TO authenticated;

-- Comments for documentation
COMMENT ON TABLE healthcare_mfa_settings IS 'Multi-factor authentication settings for healthcare users';
COMMENT ON TABLE healthcare_mfa_sms_backup IS 'SMS backup configuration for MFA recovery';
COMMENT ON TABLE healthcare_mfa_verification_attempts IS 'Audit log of all MFA verification attempts';
COMMENT ON TABLE healthcare_mfa_configuration IS 'System-wide MFA configuration settings';

COMMENT ON FUNCTION check_user_mfa_requirement(UUID) IS 'Determines if a user is required to use MFA based on their role and system configuration';
COMMENT ON FUNCTION log_mfa_verification_attempt(UUID, TEXT, BOOLEAN, INET, TEXT) IS 'Logs MFA verification attempts for compliance and security monitoring';
COMMENT ON FUNCTION is_user_mfa_locked(UUID) IS 'Checks if a user is currently locked out due to failed MFA attempts'; 