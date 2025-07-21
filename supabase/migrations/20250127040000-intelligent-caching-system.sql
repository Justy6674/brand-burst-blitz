-- Intelligent Caching System for Healthcare Platform Performance
-- Comprehensive application-level caching with TTL and intelligent invalidation
-- Migration: 20250127040000-intelligent-caching-system

-- Create application cache table for frequently accessed data
CREATE TABLE IF NOT EXISTS application_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    cache_category VARCHAR(50) NOT NULL CHECK (cache_category IN (
        'user_session', 'content_generation', 'analytics_result', 'compliance_check',
        'healthcare_template', 'government_api', 'image_metadata', 'user_preferences'
    )),
    cached_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 1,
    data_size_bytes INTEGER DEFAULT 0,
    cache_hit_rate DECIMAL(5,2) DEFAULT 0.0
);

-- Create indexes for intelligent caching
CREATE INDEX IF NOT EXISTS idx_app_cache_key ON application_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_app_cache_category ON application_cache(cache_category);
CREATE INDEX IF NOT EXISTS idx_app_cache_user_id ON application_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_app_cache_expires_at ON application_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_app_cache_accessed ON application_cache(last_accessed);
CREATE INDEX IF NOT EXISTS idx_app_cache_composite ON application_cache(cache_category, user_id, expires_at);

-- Create healthcare content cache table for generated content
CREATE TABLE IF NOT EXISTS healthcare_content_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 of input parameters
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'social_media_post', 'blog_article', 'patient_education', 'practice_update',
        'appointment_reminder', 'health_tip', 'compliance_check_result'
    )),
    platform VARCHAR(50),
    specialty VARCHAR(50),
    generated_content JSONB NOT NULL,
    input_parameters JSONB NOT NULL,
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    ahpra_compliant BOOLEAN DEFAULT true,
    tga_compliant BOOLEAN DEFAULT true,
    generation_time_ms INTEGER,
    reuse_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_reused TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for content cache
CREATE INDEX IF NOT EXISTS idx_content_cache_hash ON healthcare_content_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_content_cache_user ON healthcare_content_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_content_cache_type ON healthcare_content_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_content_cache_platform ON healthcare_content_cache(platform);
CREATE INDEX IF NOT EXISTS idx_content_cache_specialty ON healthcare_content_cache(specialty);
CREATE INDEX IF NOT EXISTS idx_content_cache_expires ON healthcare_content_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_cache_compliance ON healthcare_content_cache(ahpra_compliant, tga_compliant);

-- Create analytics cache table for expensive queries
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    query_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    query_type VARCHAR(50) NOT NULL CHECK (query_type IN (
        'practice_performance', 'patient_engagement', 'content_analytics',
        'compliance_report', 'revenue_analytics', 'appointment_analytics'
    )),
    query_parameters JSONB NOT NULL,
    result_data JSONB NOT NULL,
    data_freshness_score INTEGER CHECK (data_freshness_score >= 0 AND data_freshness_score <= 100),
    computation_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    cache_priority INTEGER DEFAULT 50 CHECK (cache_priority >= 1 AND cache_priority <= 100)
);

-- Create indexes for analytics cache
CREATE INDEX IF NOT EXISTS idx_analytics_cache_hash ON analytics_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_user ON analytics_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_business ON analytics_cache(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_type ON analytics_cache(query_type);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_priority ON analytics_cache(cache_priority);

-- Create cache performance monitoring table
CREATE TABLE IF NOT EXISTS cache_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_date DATE DEFAULT CURRENT_DATE,
    cache_category VARCHAR(50) NOT NULL,
    total_requests BIGINT DEFAULT 0,
    cache_hits BIGINT DEFAULT 0,
    cache_misses BIGINT DEFAULT 0,
    cache_hit_rate DECIMAL(5,2) DEFAULT 0.0,
    average_response_time_ms INTEGER DEFAULT 0,
    memory_usage_mb DECIMAL(10,2) DEFAULT 0.0,
    eviction_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(metric_date, cache_category)
);

-- Create indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_cache_metrics_date ON cache_performance_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_cache_metrics_category ON cache_performance_metrics(cache_category);
CREATE INDEX IF NOT EXISTS idx_cache_metrics_hit_rate ON cache_performance_metrics(cache_hit_rate);

-- Create cache invalidation log table
CREATE TABLE IF NOT EXISTS cache_invalidation_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(255),
    cache_category VARCHAR(50),
    invalidation_reason VARCHAR(100) NOT NULL CHECK (invalidation_reason IN (
        'ttl_expired', 'manual_invalidation', 'data_updated', 'user_logout',
        'compliance_violation', 'system_maintenance', 'memory_pressure'
    )),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    automated BOOLEAN DEFAULT true,
    invalidated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for invalidation log
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_key ON cache_invalidation_log(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_category ON cache_invalidation_log(cache_category);
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_reason ON cache_invalidation_log(invalidation_reason);
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_date ON cache_invalidation_log(invalidated_at);

-- Create function to get cache data with automatic hit tracking
CREATE OR REPLACE FUNCTION get_cached_data(
    p_cache_key VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
    cache_record RECORD;
    current_time TIMESTAMPTZ := NOW();
BEGIN
    -- Get cache record if it exists and hasn't expired
    SELECT * INTO cache_record
    FROM application_cache
    WHERE cache_key = p_cache_key
      AND expires_at > current_time;
    
    IF FOUND THEN
        -- Update access statistics
        UPDATE application_cache
        SET last_accessed = current_time,
            access_count = access_count + 1,
            cache_hit_rate = LEAST(100.0, cache_hit_rate + 1.0)
        WHERE cache_key = p_cache_key;
        
        -- Log cache hit
        INSERT INTO cache_performance_metrics (cache_category, total_requests, cache_hits)
        VALUES (cache_record.cache_category, 1, 1)
        ON CONFLICT (metric_date, cache_category)
        DO UPDATE SET
            total_requests = cache_performance_metrics.total_requests + 1,
            cache_hits = cache_performance_metrics.cache_hits + 1,
            cache_hit_rate = (cache_performance_metrics.cache_hits::DECIMAL / cache_performance_metrics.total_requests::DECIMAL) * 100;
        
        RETURN cache_record.cached_data;
    ELSE
        -- Log cache miss
        INSERT INTO cache_performance_metrics (cache_category, total_requests, cache_misses)
        VALUES ('unknown', 1, 1)
        ON CONFLICT (metric_date, cache_category)
        DO UPDATE SET
            total_requests = cache_performance_metrics.total_requests + 1,
            cache_misses = cache_performance_metrics.cache_misses + 1,
            cache_hit_rate = (cache_performance_metrics.cache_hits::DECIMAL / cache_performance_metrics.total_requests::DECIMAL) * 100;
        
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set cache data with intelligent expiration
CREATE OR REPLACE FUNCTION set_cached_data(
    p_cache_key VARCHAR(255),
    p_cache_category VARCHAR(50),
    p_cached_data JSONB,
    p_user_id UUID DEFAULT NULL,
    p_business_profile_id UUID DEFAULT NULL,
    p_ttl_seconds INTEGER DEFAULT 3600
)
RETURNS BOOLEAN AS $$
DECLARE
    expiry_time TIMESTAMPTZ;
    data_size INTEGER;
BEGIN
    -- Calculate expiry time based on category
    expiry_time := NOW() + INTERVAL '1 second' * p_ttl_seconds;
    
    -- Adjust TTL based on cache category
    CASE p_cache_category
        WHEN 'user_session' THEN expiry_time := NOW() + INTERVAL '24 hours';
        WHEN 'content_generation' THEN expiry_time := NOW() + INTERVAL '1 hour';
        WHEN 'analytics_result' THEN expiry_time := NOW() + INTERVAL '30 minutes';
        WHEN 'compliance_check' THEN expiry_time := NOW() + INTERVAL '15 minutes';
        WHEN 'healthcare_template' THEN expiry_time := NOW() + INTERVAL '7 days';
        WHEN 'government_api' THEN expiry_time := NOW() + INTERVAL '6 hours';
        WHEN 'image_metadata' THEN expiry_time := NOW() + INTERVAL '7 days';
        WHEN 'user_preferences' THEN expiry_time := NOW() + INTERVAL '7 days';
        ELSE expiry_time := NOW() + INTERVAL '1 hour';
    END CASE;
    
    -- Calculate approximate data size
    data_size := LENGTH(p_cached_data::TEXT);
    
    -- Insert or update cache entry
    INSERT INTO application_cache (
        cache_key, cache_category, cached_data, user_id, 
        business_profile_id, expires_at, data_size_bytes
    )
    VALUES (
        p_cache_key, p_cache_category, p_cached_data, p_user_id,
        p_business_profile_id, expiry_time, data_size
    )
    ON CONFLICT (cache_key)
    DO UPDATE SET
        cached_data = p_cached_data,
        expires_at = expiry_time,
        last_accessed = NOW(),
        data_size_bytes = data_size;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to invalidate cache by pattern
CREATE OR REPLACE FUNCTION invalidate_cache_pattern(
    p_pattern VARCHAR(255),
    p_reason VARCHAR(100) DEFAULT 'manual_invalidation'
)
RETURNS INTEGER AS $$
DECLARE
    invalidated_count INTEGER := 0;
    cache_record RECORD;
BEGIN
    -- Find and delete matching cache entries
    FOR cache_record IN
        SELECT cache_key, cache_category FROM application_cache
        WHERE cache_key LIKE p_pattern
    LOOP
        -- Log invalidation
        INSERT INTO cache_invalidation_log (cache_key, cache_category, invalidation_reason)
        VALUES (cache_record.cache_key, cache_record.cache_category, p_reason);
        
        invalidated_count := invalidated_count + 1;
    END LOOP;
    
    -- Delete the cache entries
    DELETE FROM application_cache WHERE cache_key LIKE p_pattern;
    
    RETURN invalidated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    expired_record RECORD;
BEGIN
    -- Log expired entries before deletion
    FOR expired_record IN
        SELECT cache_key, cache_category FROM application_cache
        WHERE expires_at < NOW()
    LOOP
        INSERT INTO cache_invalidation_log (cache_key, cache_category, invalidation_reason)
        VALUES (expired_record.cache_key, expired_record.cache_category, 'ttl_expired');
    END LOOP;
    
    -- Delete expired entries from all cache tables
    DELETE FROM application_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM healthcare_content_cache WHERE expires_at < NOW();
    DELETE FROM analytics_cache WHERE expires_at < NOW();
    
    -- Clean old performance metrics (keep last 90 days)
    DELETE FROM cache_performance_metrics 
    WHERE metric_date < CURRENT_DATE - INTERVAL '90 days';
    
    -- Clean old invalidation logs (keep last 30 days)
    DELETE FROM cache_invalidation_log 
    WHERE invalidated_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get cache statistics
CREATE OR REPLACE FUNCTION get_cache_statistics(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    cache_category VARCHAR(50),
    total_requests BIGINT,
    hit_rate_percentage DECIMAL(5,2),
    avg_response_time_ms INTEGER,
    memory_usage_mb DECIMAL(10,2),
    eviction_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cpm.cache_category,
        SUM(cpm.total_requests) as total_requests,
        AVG(cpm.cache_hit_rate) as hit_rate_percentage,
        AVG(cpm.average_response_time_ms) as avg_response_time_ms,
        AVG(cpm.memory_usage_mb) as memory_usage_mb,
        CASE 
            WHEN SUM(cpm.total_requests) > 0 THEN
                (SUM(cpm.eviction_count)::DECIMAL / SUM(cpm.total_requests)::DECIMAL) * 100
            ELSE 0
        END as eviction_rate
    FROM cache_performance_metrics cpm
    WHERE cpm.metric_date BETWEEN p_start_date AND p_end_date
    GROUP BY cpm.cache_category
    ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled cache cleanup job (runs every hour)
SELECT cron.schedule('clean-expired-cache', '0 * * * *', 'SELECT clean_expired_cache();');

-- Row Level Security (RLS) for cache tables
ALTER TABLE application_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own cache data
CREATE POLICY "Users can access own cache data" ON application_cache
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can access own content cache" ON healthcare_content_cache
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own analytics cache" ON analytics_cache
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Service role can manage all cache data
CREATE POLICY "Service role can manage cache" ON application_cache
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage content cache" ON healthcare_content_cache
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage analytics cache" ON analytics_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Grant appropriate permissions
GRANT SELECT ON cache_performance_metrics TO authenticated;
GRANT SELECT ON cache_invalidation_log TO authenticated;
GRANT EXECUTE ON FUNCTION get_cached_data TO authenticated;
GRANT EXECUTE ON FUNCTION set_cached_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION clean_expired_cache TO service_role;
GRANT EXECUTE ON FUNCTION invalidate_cache_pattern TO service_role; 