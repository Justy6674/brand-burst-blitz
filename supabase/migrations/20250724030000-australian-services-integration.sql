-- Australian Government Services Integration Database Schema
-- Real ABN and AHPRA API integration with caching for performance and offline access

-- ABN validation cache table
CREATE TABLE abn_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abn VARCHAR(11) NOT NULL UNIQUE,
  details JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AHPRA registration cache table
CREATE TABLE ahpra_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number VARCHAR(15) NOT NULL UNIQUE,
  details JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Australian practice verification logs
CREATE TABLE australian_practice_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN (
    'abn_validation', 'ahpra_verification', 'practice_name_check', 'eligibility_assessment'
  )),
  input_data JSONB NOT NULL,
  api_response JSONB,
  verification_result JSONB NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT false,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  api_provider VARCHAR(50) NOT NULL, -- 'ABR', 'AHPRA', 'ASIC'
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Government API usage tracking
CREATE TABLE government_api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_provider VARCHAR(50) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 1,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  average_response_time_ms INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_provider, endpoint, date)
);

-- Healthcare practice compliance status
CREATE TABLE healthcare_practice_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  abn VARCHAR(11) NOT NULL,
  ahpra_registration VARCHAR(15) NOT NULL,
  abn_status VARCHAR(20) NOT NULL, -- 'Active', 'Cancelled', 'Unknown'
  ahpra_status VARCHAR(20) NOT NULL, -- 'Current', 'Expired', 'Suspended', 'Unknown'
  gst_registered BOOLEAN DEFAULT false,
  entity_type VARCHAR(50), -- Company, Sole Trader, Partnership, etc.
  practice_state VARCHAR(3), -- NSW, VIC, QLD, etc.
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_verification_due TIMESTAMP WITH TIME ZONE,
  verification_errors TEXT[],
  verification_warnings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_abn_cache_abn ON abn_cache(abn);
CREATE INDEX idx_abn_cache_expires ON abn_cache(expires_at);
CREATE INDEX idx_ahpra_cache_registration ON ahpra_cache(registration_number);
CREATE INDEX idx_ahpra_cache_expires ON ahpra_cache(expires_at);
CREATE INDEX idx_practice_verifications_user ON australian_practice_verifications(user_id);
CREATE INDEX idx_practice_verifications_business ON australian_practice_verifications(business_profile_id);
CREATE INDEX idx_practice_verifications_type ON australian_practice_verifications(verification_type);
CREATE INDEX idx_practice_verifications_created ON australian_practice_verifications(created_at);
CREATE INDEX idx_api_usage_provider ON government_api_usage(api_provider);
CREATE INDEX idx_api_usage_date ON government_api_usage(date);
CREATE INDEX idx_practice_compliance_business ON healthcare_practice_compliance(business_profile_id);
CREATE INDEX idx_practice_compliance_abn ON healthcare_practice_compliance(abn);
CREATE INDEX idx_practice_compliance_ahpra ON healthcare_practice_compliance(ahpra_registration);
CREATE INDEX idx_practice_compliance_verified ON healthcare_practice_compliance(last_verified);

-- Enable Row Level Security
ALTER TABLE abn_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahpra_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE australian_practice_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_practice_compliance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for abn_cache (public read for performance)
CREATE POLICY "ABN cache is publicly readable"
  ON abn_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ABN cache"
  ON abn_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for ahpra_cache (public read for performance)
CREATE POLICY "AHPRA cache is publicly readable"
  ON ahpra_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert AHPRA cache"
  ON ahpra_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for australian_practice_verifications
CREATE POLICY "Users can view their own practice verifications"
  ON australian_practice_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice verifications"
  ON australian_practice_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business members can view practice verifications"
  ON australian_practice_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.id = australian_practice_verifications.business_profile_id
      AND bp.user_id = auth.uid()
    )
  );

-- RLS Policies for government_api_usage (admin only)
CREATE POLICY "Admins can view API usage"
  ON government_api_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- RLS Policies for healthcare_practice_compliance
CREATE POLICY "Business owners can view their practice compliance"
  ON healthcare_practice_compliance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.id = healthcare_practice_compliance.business_profile_id
      AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage their practice compliance"
  ON healthcare_practice_compliance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.id = healthcare_practice_compliance.business_profile_id
      AND bp.user_id = auth.uid()
    )
  );

-- Create functions for API usage tracking
CREATE OR REPLACE FUNCTION track_government_api_usage(
  provider_name VARCHAR(50),
  endpoint_name VARCHAR(255),
  success BOOLEAN,
  response_time INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO government_api_usage (
    api_provider,
    endpoint,
    request_count,
    success_count,
    error_count,
    average_response_time_ms,
    date
  )
  VALUES (
    provider_name,
    endpoint_name,
    1,
    CASE WHEN success THEN 1 ELSE 0 END,
    CASE WHEN NOT success THEN 1 ELSE 0 END,
    response_time,
    CURRENT_DATE
  )
  ON CONFLICT (api_provider, endpoint, date)
  DO UPDATE SET
    request_count = government_api_usage.request_count + 1,
    success_count = government_api_usage.success_count + 
      CASE WHEN success THEN 1 ELSE 0 END,
    error_count = government_api_usage.error_count + 
      CASE WHEN NOT success THEN 1 ELSE 0 END,
    average_response_time_ms = (
      government_api_usage.average_response_time_ms * 
      (government_api_usage.request_count - 1) + response_time
    ) / government_api_usage.request_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function for automatic cache cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS VOID AS $$
BEGIN
  -- Clean up expired ABN cache
  DELETE FROM abn_cache 
  WHERE expires_at < NOW();
  
  -- Clean up expired AHPRA cache
  DELETE FROM ahpra_cache 
  WHERE expires_at < NOW();
  
  -- Clean up old verification logs (keep last 6 months)
  DELETE FROM australian_practice_verifications 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Clean up old API usage logs (keep last 2 years)
  DELETE FROM government_api_usage 
  WHERE date < CURRENT_DATE - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic practice compliance updates
CREATE OR REPLACE FUNCTION update_practice_compliance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update compliance status when verification is successful
  IF NEW.verification_type = 'eligibility_assessment' AND NEW.is_valid THEN
    INSERT INTO healthcare_practice_compliance (
      business_profile_id,
      abn,
      ahpra_registration,
      abn_status,
      ahpra_status,
      compliance_score,
      last_verified,
      next_verification_due
    )
    SELECT 
      NEW.business_profile_id,
      (NEW.input_data->>'abn')::VARCHAR(11),
      (NEW.input_data->>'ahpraRegistration')::VARCHAR(15),
      (NEW.verification_result->>'abnStatus')::VARCHAR(20),
      (NEW.verification_result->>'ahpraStatus')::VARCHAR(20),
      NEW.confidence_score,
      NOW(),
      NOW() + INTERVAL '3 months'
    ON CONFLICT (business_profile_id)
    DO UPDATE SET
      abn = EXCLUDED.abn,
      ahpra_registration = EXCLUDED.ahpra_registration,
      abn_status = EXCLUDED.abn_status,
      ahpra_status = EXCLUDED.ahpra_status,
      compliance_score = EXCLUDED.compliance_score,
      last_verified = EXCLUDED.last_verified,
      next_verification_due = EXCLUDED.next_verification_due,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_practice_compliance_trigger
  AFTER INSERT ON australian_practice_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_compliance();

-- Create scheduled job for cache cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cache-cleanup', '0 2 * * *', 'SELECT cleanup_expired_cache();');

-- Add comments for documentation
COMMENT ON TABLE abn_cache IS 'Cache for Australian Business Number validation results from ABR API';
COMMENT ON TABLE ahpra_cache IS 'Cache for AHPRA registration verification results';
COMMENT ON TABLE australian_practice_verifications IS 'Log of all Australian practice verification attempts and results';
COMMENT ON TABLE government_api_usage IS 'Tracking usage and performance of Australian government APIs';
COMMENT ON TABLE healthcare_practice_compliance IS 'Current compliance status for healthcare practices';

COMMENT ON COLUMN abn_cache.details IS 'Full ABN details from Australian Business Register';
COMMENT ON COLUMN ahpra_cache.details IS 'Full AHPRA registration details from public register';
COMMENT ON COLUMN australian_practice_verifications.confidence_score IS 'Verification confidence score from 0-100%';
COMMENT ON COLUMN healthcare_practice_compliance.compliance_score IS 'Overall practice compliance score from 0-100%'; 