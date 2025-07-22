-- Real ABN Validation Cache System
-- Improves performance and reduces Australian Government API calls
-- Migration: 20250127030000-real-abn-validation-cache

-- Create ABN validation cache table
CREATE TABLE IF NOT EXISTS abn_validation_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    abn VARCHAR(11) NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    entity_type TEXT,
    status VARCHAR(50) NOT NULL,
    gst_registered BOOLEAN DEFAULT false,
    postcode_state VARCHAR(10),
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(20) DEFAULT 'ato_api' CHECK (source IN ('ato_api', 'cached', 'fallback')),
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_abn_validation_cache_abn ON abn_validation_cache(abn);
CREATE INDEX IF NOT EXISTS idx_abn_validation_cache_cached_at ON abn_validation_cache(cached_at);
CREATE INDEX IF NOT EXISTS idx_abn_validation_cache_status ON abn_validation_cache(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_abn_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_abn_validation_cache_updated_at
    BEFORE UPDATE ON abn_validation_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_abn_cache_updated_at();

-- Row Level Security (RLS) for ABN cache
ALTER TABLE abn_validation_cache ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read cached ABN data
CREATE POLICY "All authenticated users can read ABN cache" ON abn_validation_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only service role can insert/update ABN cache
CREATE POLICY "Service role can manage ABN cache" ON abn_validation_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to clean old cache entries (older than 30 days)
CREATE OR REPLACE FUNCTION clean_old_abn_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM abn_validation_cache 
    WHERE cached_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled cleanup function (runs weekly)
SELECT cron.schedule('clean-abn-cache', '0 2 * * 1', 'SELECT clean_old_abn_cache();');

-- Create ABN validation statistics table
CREATE TABLE IF NOT EXISTS abn_validation_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    abn VARCHAR(11) NOT NULL,
    validation_result BOOLEAN NOT NULL,
    source VARCHAR(20) NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Indexes for stats table
CREATE INDEX IF NOT EXISTS idx_abn_validation_stats_user_id ON abn_validation_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_abn_validation_stats_validated_at ON abn_validation_stats(validated_at);
CREATE INDEX IF NOT EXISTS idx_abn_validation_stats_result ON abn_validation_stats(validation_result);

-- RLS for stats table
ALTER TABLE abn_validation_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own validation stats
CREATE POLICY "Users can view own ABN validation stats" ON abn_validation_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can insert validation stats
CREATE POLICY "Service role can insert ABN validation stats" ON abn_validation_stats
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create function to get ABN validation analytics
CREATE OR REPLACE FUNCTION get_abn_validation_analytics(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_validations BIGINT,
    successful_validations BIGINT,
    failed_validations BIGINT,
    average_response_time_ms FLOAT,
    cache_hit_rate FLOAT,
    unique_users BIGINT,
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
        COUNT(DISTINCT user_id) as unique_users,
        ARRAY_AGG(DISTINCT error_message) FILTER (WHERE error_message IS NOT NULL) as top_error_messages
    FROM abn_validation_stats
    WHERE validated_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant appropriate permissions
GRANT SELECT ON abn_validation_cache TO authenticated;
GRANT ALL ON abn_validation_cache TO service_role;
GRANT SELECT ON abn_validation_stats TO authenticated;
GRANT INSERT ON abn_validation_stats TO service_role;
GRANT EXECUTE ON FUNCTION get_abn_validation_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_abn_cache TO service_role;

-- Insert comment for migration tracking
COMMENT ON TABLE abn_validation_cache IS 'Cache for Australian Business Register ABN validation results';
COMMENT ON TABLE abn_validation_stats IS 'Analytics and tracking for ABN validation requests';
COMMENT ON FUNCTION get_abn_validation_analytics IS 'Returns analytics data for ABN validation performance';
COMMENT ON FUNCTION clean_old_abn_cache IS 'Removes ABN cache entries older than 30 days'; 