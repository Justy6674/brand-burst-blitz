-- Healthcare Tech Stack Workflows Migration
-- Practice-specific technology workflow assignment system

-- Healthcare Tech Stack Configurations Table
CREATE TABLE healthcare_tech_stack_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_type TEXT NOT NULL CHECK (practice_type IN ('GP', 'Allied Health', 'Specialist', 'Group Practice', 'Healthcare Network')),
    tech_capability TEXT NOT NULL CHECK (tech_capability IN ('Basic', 'Intermediate', 'Advanced')),
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('automated', 'copy_paste', 'hybrid')),
    platform_integrations TEXT[] NOT NULL DEFAULT '{}',
    automation_features TEXT[] NOT NULL DEFAULT '{}',
    manual_instructions TEXT[] NOT NULL DEFAULT '{}',
    estimated_setup_time INTEGER NOT NULL DEFAULT 60, -- minutes
    complexity_score INTEGER NOT NULL DEFAULT 1 CHECK (complexity_score BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT unique_practice_tech_config UNIQUE(practice_type, tech_capability)
);

-- Healthcare Workflow Assignments Table
CREATE TABLE healthcare_workflow_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_type TEXT NOT NULL,
    tech_capability TEXT NOT NULL,
    assigned_workflow TEXT NOT NULL CHECK (assigned_workflow IN ('automated', 'copy_paste', 'hybrid')),
    platform_connections JSONB NOT NULL DEFAULT '[]',
    workflow_steps JSONB NOT NULL DEFAULT '[]',
    estimated_completion INTEGER NOT NULL DEFAULT 60,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    assessment_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_assignment UNIQUE(user_id)
);

-- Healthcare Platform Connection Status Table
CREATE TABLE healthcare_platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES healthcare_workflow_assignments(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('oauth', 'api_key', 'manual', 'copy_paste')),
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'connected', 'failed', 'manual_required')),
    connection_data JSONB,
    automation_available BOOLEAN DEFAULT false,
    last_tested_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_assignment_platform UNIQUE(assignment_id, platform_name)
);

-- Healthcare Tech Capability Assessments Table
CREATE TABLE healthcare_tech_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    has_website BOOLEAN DEFAULT false,
    website_platform TEXT CHECK (website_platform IN ('WordPress', 'Wix', 'Squarespace', 'Custom', 'None')),
    social_media_experience TEXT NOT NULL CHECK (social_media_experience IN ('None', 'Basic', 'Intermediate', 'Advanced')),
    current_tools TEXT[] DEFAULT '{}',
    technical_comfort TEXT NOT NULL CHECK (technical_comfort IN ('Low', 'Medium', 'High')),
    staff_count INTEGER DEFAULT 1,
    dedicated_marketing_person BOOLEAN DEFAULT false,
    budget_for_automation TEXT NOT NULL CHECK (budget_for_automation IN ('Under $100', '$100-500', '$500-1000', 'Over $1000')),
    calculated_capability TEXT NOT NULL CHECK (calculated_capability IN ('Basic', 'Intermediate', 'Advanced')),
    assessment_score DECIMAL(3,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_assessment UNIQUE(user_id)
);

-- Insert default tech stack configurations
INSERT INTO healthcare_tech_stack_configs (
    practice_type, tech_capability, workflow_type, platform_integrations, 
    automation_features, manual_instructions, estimated_setup_time, complexity_score
) VALUES 
-- GP Basic Configuration
('GP', 'Basic', 'copy_paste', 
 ARRAY['Facebook', 'Instagram', 'Google My Business'], 
 ARRAY[], 
 ARRAY['Manual Facebook posting guide', 'Instagram story templates', 'Google My Business update checklist'],
 90, 2),

-- GP Intermediate Configuration  
('GP', 'Intermediate', 'hybrid',
 ARRAY['Facebook', 'Instagram', 'Google My Business', 'Mailchimp', 'WordPress'],
 ARRAY['Facebook', 'Mailchimp'],
 ARRAY['Instagram manual posting', 'WordPress blog templates'],
 75, 4),

-- GP Advanced Configuration
('GP', 'Advanced', 'automated',
 ARRAY['Facebook', 'Instagram', 'Google My Business', 'Mailchimp', 'WordPress', 'Hootsuite'],
 ARRAY['Facebook', 'Instagram', 'Google My Business', 'Mailchimp', 'WordPress', 'Hootsuite'],
 ARRAY['Advanced analytics setup'],
 45, 6),

-- Allied Health Basic Configuration
('Allied Health', 'Basic', 'copy_paste',
 ARRAY['Facebook', 'Instagram', 'LinkedIn'],
 ARRAY[],
 ARRAY['Allied health Facebook content guidelines', 'Instagram wellness templates', 'LinkedIn professional posting'],
 100, 3),

-- Allied Health Intermediate Configuration
('Allied Health', 'Intermediate', 'hybrid',
 ARRAY['Facebook', 'Instagram', 'LinkedIn', 'WordPress', 'Canva'],
 ARRAY['Facebook', 'WordPress'],
 ARRAY['Instagram manual posting', 'LinkedIn engagement strategies'],
 80, 5),

-- Allied Health Advanced Configuration
('Allied Health', 'Advanced', 'automated',
 ARRAY['Facebook', 'Instagram', 'LinkedIn', 'WordPress', 'Canva', 'Buffer'],
 ARRAY['Facebook', 'Instagram', 'LinkedIn', 'WordPress', 'Buffer'],
 ARRAY['Advanced content analytics'],
 50, 7),

-- Specialist Basic Configuration
('Specialist', 'Basic', 'copy_paste',
 ARRAY['LinkedIn', 'Google My Business'],
 ARRAY[],
 ARRAY['Professional LinkedIn presence', 'Google My Business for specialists'],
 60, 2),

-- Specialist Intermediate Configuration
('Specialist', 'Intermediate', 'hybrid',
 ARRAY['LinkedIn', 'Google My Business', 'WordPress'],
 ARRAY['LinkedIn', 'WordPress'],
 ARRAY['Professional content guidelines'],
 55, 4),

-- Specialist Advanced Configuration
('Specialist', 'Advanced', 'automated',
 ARRAY['LinkedIn', 'Google My Business', 'WordPress', 'Mailchimp'],
 ARRAY['LinkedIn', 'Google My Business', 'WordPress', 'Mailchimp'],
 ARRAY['Advanced professional networking'],
 40, 6),

-- Group Practice Basic Configuration
('Group Practice', 'Basic', 'copy_paste',
 ARRAY['Facebook', 'Instagram', 'Google My Business', 'LinkedIn'],
 ARRAY[],
 ARRAY['Multi-practitioner content coordination', 'Shared social media guidelines'],
 120, 4),

-- Group Practice Intermediate Configuration
('Group Practice', 'Intermediate', 'hybrid',
 ARRAY['Facebook', 'Instagram', 'Google My Business', 'LinkedIn', 'WordPress', 'Mailchimp'],
 ARRAY['Facebook', 'WordPress', 'Mailchimp'],
 ARRAY['Multi-user workflow coordination'],
 90, 6),

-- Group Practice Advanced Configuration
('Group Practice', 'Advanced', 'automated',
 ARRAY['Facebook', 'Instagram', 'Google My Business', 'LinkedIn', 'WordPress', 'Mailchimp', 'Hootsuite', 'Buffer'],
 ARRAY['Facebook', 'Instagram', 'Google My Business', 'LinkedIn', 'WordPress', 'Mailchimp', 'Hootsuite', 'Buffer'],
 ARRAY['Enterprise analytics dashboard'],
 60, 8),

-- Healthcare Network Basic Configuration
('Healthcare Network', 'Basic', 'copy_paste',
 ARRAY['LinkedIn', 'Google My Business'],
 ARRAY[],
 ARRAY['Network-wide content guidelines', 'Compliance templates'],
 150, 5),

-- Healthcare Network Intermediate Configuration
('Healthcare Network', 'Intermediate', 'hybrid',
 ARRAY['LinkedIn', 'Google My Business', 'WordPress', 'Mailchimp'],
 ARRAY['LinkedIn', 'WordPress'],
 ARRAY['Multi-location coordination'],
 120, 7),

-- Healthcare Network Advanced Configuration
('Healthcare Network', 'Advanced', 'automated',
 ARRAY['LinkedIn', 'Google My Business', 'WordPress', 'Mailchimp', 'Hootsuite', 'Buffer'],
 ARRAY['LinkedIn', 'Google My Business', 'WordPress', 'Mailchimp', 'Hootsuite', 'Buffer'],
 ARRAY['Enterprise-level automation'],
 90, 9);

-- Row Level Security Policies

-- Healthcare Tech Stack Configs RLS
ALTER TABLE healthcare_tech_stack_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read tech stack configs" ON healthcare_tech_stack_configs
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage tech stack configs" ON healthcare_tech_stack_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Workflow Assignments RLS
ALTER TABLE healthcare_workflow_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workflow assignments" ON healthcare_workflow_assignments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all workflow assignments" ON healthcare_workflow_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Platform Connections RLS
ALTER TABLE healthcare_platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own platform connections" ON healthcare_platform_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM healthcare_workflow_assignments 
            WHERE id = assignment_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admin can view all platform connections" ON healthcare_platform_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Tech Assessments RLS
ALTER TABLE healthcare_tech_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tech assessments" ON healthcare_tech_assessments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all tech assessments" ON healthcare_tech_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Indexes for Performance
CREATE INDEX idx_tech_stack_configs_practice_capability ON healthcare_tech_stack_configs(practice_type, tech_capability);
CREATE INDEX idx_tech_stack_configs_active ON healthcare_tech_stack_configs(is_active) WHERE is_active = true;
CREATE INDEX idx_workflow_assignments_user_id ON healthcare_workflow_assignments(user_id);
CREATE INDEX idx_workflow_assignments_status ON healthcare_workflow_assignments(status);
CREATE INDEX idx_platform_connections_assignment ON healthcare_platform_connections(assignment_id);
CREATE INDEX idx_platform_connections_status ON healthcare_platform_connections(status);
CREATE INDEX idx_tech_assessments_user_id ON healthcare_tech_assessments(user_id);
CREATE INDEX idx_tech_assessments_capability ON healthcare_tech_assessments(calculated_capability);

-- Functions for Workflow Management

-- Function to get recommended workflow configuration
CREATE OR REPLACE FUNCTION get_recommended_workflow_config(
    practice_type_param TEXT,
    tech_capability_param TEXT
)
RETURNS healthcare_tech_stack_configs AS $$
DECLARE
    config_result healthcare_tech_stack_configs;
BEGIN
    -- Try to find exact match
    SELECT * INTO config_result
    FROM healthcare_tech_stack_configs
    WHERE practice_type = practice_type_param
    AND tech_capability = tech_capability_param
    AND is_active = true;
    
    -- If no exact match, fall back to Basic capability
    IF config_result IS NULL THEN
        SELECT * INTO config_result
        FROM healthcare_tech_stack_configs
        WHERE practice_type = practice_type_param
        AND tech_capability = 'Basic'
        AND is_active = true;
    END IF;
    
    RETURN config_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate tech capability score
CREATE OR REPLACE FUNCTION calculate_tech_capability_score(
    has_website_param BOOLEAN,
    website_platform_param TEXT,
    social_media_experience_param TEXT,
    current_tools_param TEXT[],
    technical_comfort_param TEXT,
    staff_count_param INTEGER,
    dedicated_marketing_param BOOLEAN,
    budget_param TEXT
)
RETURNS JSONB AS $$
DECLARE
    score DECIMAL := 0;
    capability TEXT;
BEGIN
    -- Website sophistication (0-3 points)
    IF website_platform_param = 'Custom' THEN score := score + 3;
    ELSIF website_platform_param = 'WordPress' THEN score := score + 2;
    ELSIF website_platform_param IS NOT NULL AND website_platform_param != 'None' THEN score := score + 1;
    END IF;
    
    -- Social media experience (0-3 points)
    IF social_media_experience_param = 'Advanced' THEN score := score + 3;
    ELSIF social_media_experience_param = 'Intermediate' THEN score := score + 2;
    ELSIF social_media_experience_param = 'Basic' THEN score := score + 1;
    END IF;
    
    -- Technical comfort (0-3 points)
    IF technical_comfort_param = 'High' THEN score := score + 3;
    ELSIF technical_comfort_param = 'Medium' THEN score := score + 2;
    ELSIF technical_comfort_param = 'Low' THEN score := score + 1;
    END IF;
    
    -- Current tools usage (0-2 points)
    score := score + LEAST(array_length(current_tools_param, 1) / 3.0, 2);
    
    -- Staff and resources (0-2 points)
    IF dedicated_marketing_param THEN score := score + 1; END IF;
    IF staff_count_param >= 5 THEN score := score + 1; END IF;
    
    -- Budget for automation (0-2 points)
    IF budget_param = 'Over $1000' THEN score := score + 2;
    ELSIF budget_param = '$500-1000' THEN score := score + 1.5;
    ELSIF budget_param = '$100-500' THEN score := score + 1;
    END IF;
    
    -- Determine capability level
    IF score >= 12 THEN capability := 'Advanced';
    ELSIF score >= 7 THEN capability := 'Intermediate';
    ELSE capability := 'Basic';
    END IF;
    
    RETURN jsonb_build_object(
        'score', score,
        'capability', capability,
        'breakdown', jsonb_build_object(
            'website_score', CASE 
                WHEN website_platform_param = 'Custom' THEN 3
                WHEN website_platform_param = 'WordPress' THEN 2
                WHEN website_platform_param IS NOT NULL AND website_platform_param != 'None' THEN 1
                ELSE 0 END,
            'social_score', CASE 
                WHEN social_media_experience_param = 'Advanced' THEN 3
                WHEN social_media_experience_param = 'Intermediate' THEN 2
                WHEN social_media_experience_param = 'Basic' THEN 1
                ELSE 0 END,
            'technical_score', CASE 
                WHEN technical_comfort_param = 'High' THEN 3
                WHEN technical_comfort_param = 'Medium' THEN 2
                WHEN technical_comfort_param = 'Low' THEN 1
                ELSE 0 END
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at columns
CREATE TRIGGER update_healthcare_tech_stack_configs_updated_at
    BEFORE UPDATE ON healthcare_tech_stack_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_workflow_assignments_updated_at
    BEFORE UPDATE ON healthcare_workflow_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_platform_connections_updated_at
    BEFORE UPDATE ON healthcare_platform_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_tech_assessments_updated_at
    BEFORE UPDATE ON healthcare_tech_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON healthcare_tech_stack_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON healthcare_workflow_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON healthcare_platform_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON healthcare_tech_assessments TO authenticated;

-- Comments for documentation
COMMENT ON TABLE healthcare_tech_stack_configs IS 'Predefined technology stack configurations for different practice types and technical capabilities';
COMMENT ON TABLE healthcare_workflow_assignments IS 'Individual workflow assignments tracking user progress through tech stack setup';
COMMENT ON TABLE healthcare_platform_connections IS 'Status tracking for individual platform connections within workflows';
COMMENT ON TABLE healthcare_tech_assessments IS 'Technical capability assessments for healthcare professionals';

COMMENT ON FUNCTION get_recommended_workflow_config(TEXT, TEXT) IS 'Returns the most appropriate workflow configuration for a practice type and technical capability';
COMMENT ON FUNCTION calculate_tech_capability_score(BOOLEAN, TEXT, TEXT, TEXT[], TEXT, INTEGER, BOOLEAN, TEXT) IS 'Calculates technical capability score and level based on assessment responses'; 