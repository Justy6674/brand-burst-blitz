-- Real AHPRA Validation Cache System
-- Improves performance and reduces Australian Health Practitioner Regulation Agency API calls
-- Migration: 20250127031000-real-ahpra-validation-cache

-- Create AHPRA validation cache table
CREATE TABLE IF NOT EXISTS ahpra_validation_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    practitioner_name TEXT NOT NULL,
    profession VARCHAR(50) NOT NULL,
    speciality TEXT,
    registration_status VARCHAR(20) NOT NULL DEFAULT 'current',
    registration_expiry DATE,
    practice_location VARCHAR(10),
    conditions TEXT[] DEFAULT '{}',
    endorsements TEXT[] DEFAULT '{}',
    qualifications TEXT[] DEFAULT '{}',
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(20) DEFAULT 'ahpra_api' CHECK (source IN ('ahpra_api', 'cached', 'fallback')),
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_cache_registration ON ahpra_validation_cache(registration_number);
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_cache_cached_at ON ahpra_validation_cache(cached_at);
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_cache_profession ON ahpra_validation_cache(profession);
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_cache_status ON ahpra_validation_cache(registration_status);
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_cache_location ON ahpra_validation_cache(practice_location);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ahpra_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ahpra_validation_cache_updated_at
    BEFORE UPDATE ON ahpra_validation_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_ahpra_cache_updated_at();

-- Row Level Security (RLS) for AHPRA cache
ALTER TABLE ahpra_validation_cache ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read cached AHPRA data
CREATE POLICY "All authenticated users can read AHPRA cache" ON ahpra_validation_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only service role can insert/update AHPRA cache
CREATE POLICY "Service role can manage AHPRA cache" ON ahpra_validation_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to clean old AHPRA cache entries (older than 7 days)
CREATE OR REPLACE FUNCTION clean_old_ahpra_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ahpra_validation_cache 
    WHERE cached_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled cleanup function (runs daily)
SELECT cron.schedule('clean-ahpra-cache', '0 3 * * *', 'SELECT clean_old_ahpra_cache();');

-- Create AHPRA validation statistics table
CREATE TABLE IF NOT EXISTS ahpra_validation_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registration_number VARCHAR(20) NOT NULL,
    profession VARCHAR(50) NOT NULL,
    validation_result BOOLEAN NOT NULL,
    source VARCHAR(20) NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Indexes for AHPRA stats table
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_stats_user_id ON ahpra_validation_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_stats_validated_at ON ahpra_validation_stats(validated_at);
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_stats_result ON ahpra_validation_stats(validation_result);
CREATE INDEX IF NOT EXISTS idx_ahpra_validation_stats_profession ON ahpra_validation_stats(profession);

-- RLS for AHPRA stats table
ALTER TABLE ahpra_validation_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own AHPRA validation stats
CREATE POLICY "Users can view own AHPRA validation stats" ON ahpra_validation_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can insert AHPRA validation stats
CREATE POLICY "Service role can insert AHPRA validation stats" ON ahpra_validation_stats
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create function to get AHPRA validation analytics
CREATE OR REPLACE FUNCTION get_ahpra_validation_analytics(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_validations BIGINT,
    successful_validations BIGINT,
    failed_validations BIGINT,
    average_response_time_ms FLOAT,
    cache_hit_rate FLOAT,
    unique_practitioners BIGINT,
    validations_by_profession JSONB,
    top_error_messages TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_validations,
        COUNT(*) FILTER (WHERE validation_result = true) as successful_validations,
        COUNT(*) FILTER (WHERE validation_result = false) as failed_validations,
        AVG(response_time_ms) as average_response_time_ms,
        (COUNT(*) FILTER (WHERE source = 'cached')::FLOAT / COUNT(*)::FLOAT * 100) as cache_hit_rate,
        COUNT(DISTINCT registration_number) as unique_practitioners,
        jsonb_object_agg(
            profession, 
            COUNT(*) FILTER (WHERE profession IS NOT NULL)
        ) as validations_by_profession,
        ARRAY_AGG(DISTINCT error_message) FILTER (WHERE error_message IS NOT NULL) as top_error_messages
    FROM ahpra_validation_stats
    WHERE validated_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check practitioner registration expiry alerts
CREATE OR REPLACE FUNCTION get_ahpra_expiry_alerts(
    days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
    registration_number VARCHAR(20),
    practitioner_name TEXT,
    profession VARCHAR(50),
    registration_expiry DATE,
    days_until_expiry INTEGER,
    practice_location VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.registration_number,
        c.practitioner_name,
        c.profession,
        c.registration_expiry,
        (c.registration_expiry - CURRENT_DATE)::INTEGER as days_until_expiry,
        c.practice_location
    FROM ahpra_validation_cache c
    WHERE c.registration_status = 'current'
      AND c.registration_expiry IS NOT NULL
      AND c.registration_expiry BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
    ORDER BY c.registration_expiry ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate AHPRA registration format
CREATE OR REPLACE FUNCTION validate_ahpra_registration_format(
    registration_number VARCHAR(20),
    profession VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    pattern VARCHAR(50);
BEGIN
    -- Define patterns for each profession
    pattern := CASE profession
        WHEN 'medical' THEN '^MED\d{10}$'
        WHEN 'nursing' THEN '^NMW\d{10}$'
        WHEN 'dental' THEN '^DEN\d{10}$'
        WHEN 'pharmacy' THEN '^PHA\d{10}$'
        WHEN 'physiotherapy' THEN '^PHY\d{10}$'
        WHEN 'psychology' THEN '^PSY\d{10}$'
        WHEN 'optometry' THEN '^OPT\d{10}$'
        WHEN 'osteopathy' THEN '^OST\d{10}$'
        WHEN 'chiropractic' THEN '^CHI\d{10}$'
        WHEN 'podiatry' THEN '^POD\d{10}$'
        WHEN 'occupational_therapy' THEN '^OCC\d{10}$'
        WHEN 'chinese_medicine' THEN '^CMR\d{10}$'
        WHEN 'aboriginal_health' THEN '^AHP\d{10}$'
        WHEN 'paramedicine' THEN '^PAR\d{10}$'
        ELSE NULL
    END;
    
    IF pattern IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN registration_number ~ pattern;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- Grant appropriate permissions
GRANT SELECT ON ahpra_validation_cache TO authenticated;
GRANT ALL ON ahpra_validation_cache TO service_role;
GRANT SELECT ON ahpra_validation_stats TO authenticated;
GRANT INSERT ON ahpra_validation_stats TO service_role;
GRANT EXECUTE ON FUNCTION get_ahpra_validation_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_ahpra_expiry_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION validate_ahpra_registration_format TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_ahpra_cache TO service_role;

-- Insert comment for migration tracking
COMMENT ON TABLE ahpra_validation_cache IS 'Cache for Australian Health Practitioner Regulation Agency validation results';
COMMENT ON TABLE ahpra_validation_stats IS 'Analytics and tracking for AHPRA validation requests';
COMMENT ON FUNCTION get_ahpra_validation_analytics IS 'Returns analytics data for AHPRA validation performance';
COMMENT ON FUNCTION get_ahpra_expiry_alerts IS 'Returns practitioners with upcoming registration expiry';
COMMENT ON FUNCTION validate_ahpra_registration_format IS 'Validates AHPRA registration number format for specific professions';
COMMENT ON FUNCTION clean_old_ahpra_cache IS 'Removes AHPRA cache entries older than 7 days'; 