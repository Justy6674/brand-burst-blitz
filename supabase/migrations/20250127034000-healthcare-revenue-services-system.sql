-- Healthcare Revenue Services Delivery System
-- Complete order management, workflow automation, and payment processing for Australian healthcare services
-- Migration: 20250127034000-healthcare-revenue-services-system

-- Create healthcare service orders table
CREATE TABLE IF NOT EXISTS healthcare_service_orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id VARCHAR(100) NOT NULL,
    service_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'AUD',
    status VARCHAR(50) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'in_progress', 'quality_review', 'completed', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
    payment_intent_id VARCHAR(200),
    stripe_session_id VARCHAR(200),
    estimated_delivery TIMESTAMPTZ NOT NULL,
    actual_delivery TIMESTAMPTZ,
    practice_details JSONB,
    delivery_preferences JSONB,
    deliverables JSONB DEFAULT '[]',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
    ordered_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for service orders
CREATE INDEX IF NOT EXISTS idx_healthcare_service_orders_user_id ON healthcare_service_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_service_orders_service_id ON healthcare_service_orders(service_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_service_orders_status ON healthcare_service_orders(status);
CREATE INDEX IF NOT EXISTS idx_healthcare_service_orders_payment_status ON healthcare_service_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_healthcare_service_orders_ordered_at ON healthcare_service_orders(ordered_at);
CREATE INDEX IF NOT EXISTS idx_healthcare_service_orders_estimated_delivery ON healthcare_service_orders(estimated_delivery);

-- Create service workflow steps table
CREATE TABLE IF NOT EXISTS healthcare_service_workflow_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES healthcare_service_orders(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    estimated_duration_hours INTEGER NOT NULL,
    actual_duration_hours INTEGER,
    is_automated BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'pending', 'in_progress', 'completed', 'failed', 'skipped')),
    assigned_to UUID REFERENCES auth.users(id),
    automation_config JSONB,
    results JSONB,
    notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, step_number)
);

-- Create indexes for workflow steps
CREATE INDEX IF NOT EXISTS idx_workflow_steps_order_id ON healthcare_service_workflow_steps(order_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON healthcare_service_workflow_steps(status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_assigned_to ON healthcare_service_workflow_steps(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_automated ON healthcare_service_workflow_steps(is_automated);

-- Create service notifications table
CREATE TABLE IF NOT EXISTS healthcare_service_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES healthcare_service_orders(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    subject TEXT,
    content TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_service_notifications_order_id ON healthcare_service_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_service_notifications_type ON healthcare_service_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_service_notifications_status ON healthcare_service_notifications(status);

-- Create service analytics table
CREATE TABLE IF NOT EXISTS healthcare_service_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    service_id VARCHAR(100),
    order_id VARCHAR(50),
    order_value DECIMAL(10,2),
    currency VARCHAR(5) DEFAULT 'AUD',
    event_data JSONB,
    session_id VARCHAR(200),
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_service_analytics_user_id ON healthcare_service_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_service_analytics_event_type ON healthcare_service_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_service_analytics_service_id ON healthcare_service_analytics(service_id);
CREATE INDEX IF NOT EXISTS idx_service_analytics_created_at ON healthcare_service_analytics(created_at);

-- Create service team members table
CREATE TABLE IF NOT EXISTS healthcare_service_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'project_manager', 'compliance_specialist', 'content_creator', 'designer', 'developer')),
    specialties TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(8,2),
    capacity_hours_per_week INTEGER DEFAULT 40,
    ahpra_registration VARCHAR(50),
    certifications TEXT[] DEFAULT '{}',
    bio TEXT,
    profile_image_url TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for team members
CREATE INDEX IF NOT EXISTS idx_service_team_role ON healthcare_service_team_members(role);
CREATE INDEX IF NOT EXISTS idx_service_team_active ON healthcare_service_team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_service_team_specialties ON healthcare_service_team_members USING gin(specialties);

-- Create service deliverables table
CREATE TABLE IF NOT EXISTS healthcare_service_deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES healthcare_service_orders(id) ON DELETE CASCADE,
    deliverable_type VARCHAR(50) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES healthcare_service_team_members(id),
    reviewed_by UUID REFERENCES healthcare_service_team_members(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'delivered')),
    version INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for deliverables
CREATE INDEX IF NOT EXISTS idx_deliverables_order_id ON healthcare_service_deliverables(order_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_type ON healthcare_service_deliverables(deliverable_type);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON healthcare_service_deliverables(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_healthcare_service_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_healthcare_service_orders_updated_at
    BEFORE UPDATE ON healthcare_service_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_service_updated_at();

CREATE TRIGGER update_healthcare_service_workflow_steps_updated_at
    BEFORE UPDATE ON healthcare_service_workflow_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_service_updated_at();

CREATE TRIGGER update_healthcare_service_team_members_updated_at
    BEFORE UPDATE ON healthcare_service_team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_service_updated_at();

CREATE TRIGGER update_healthcare_service_deliverables_updated_at
    BEFORE UPDATE ON healthcare_service_deliverables
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_service_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE healthcare_service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_service_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_service_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_service_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_service_deliverables ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own service orders
CREATE POLICY "Users can view own service orders" ON healthcare_service_orders
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own orders (limited fields)
CREATE POLICY "Users can update own service orders" ON healthcare_service_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service role can manage all orders
CREATE POLICY "Service role can manage all service orders" ON healthcare_service_orders
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Users can view workflow steps for their orders
CREATE POLICY "Users can view workflow steps for own orders" ON healthcare_service_workflow_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM healthcare_service_orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- Policy: Service role can manage all workflow steps
CREATE POLICY "Service role can manage workflow steps" ON healthcare_service_workflow_steps
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON healthcare_service_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM healthcare_service_orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- Policy: Service role can manage all notifications
CREATE POLICY "Service role can manage notifications" ON healthcare_service_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON healthcare_service_analytics
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can manage all analytics
CREATE POLICY "Service role can manage analytics" ON healthcare_service_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Users can view deliverables for their orders
CREATE POLICY "Users can view deliverables for own orders" ON healthcare_service_deliverables
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM healthcare_service_orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- Policy: Service role can manage all deliverables
CREATE POLICY "Service role can manage deliverables" ON healthcare_service_deliverables
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to calculate order progress
CREATE OR REPLACE FUNCTION calculate_order_progress(order_id_param VARCHAR(50))
RETURNS INTEGER AS $$
DECLARE
    total_steps INTEGER;
    completed_steps INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Count total workflow steps
    SELECT COUNT(*) INTO total_steps
    FROM healthcare_service_workflow_steps
    WHERE order_id = order_id_param;
    
    IF total_steps = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count completed steps
    SELECT COUNT(*) INTO completed_steps
    FROM healthcare_service_workflow_steps
    WHERE order_id = order_id_param AND status = 'completed';
    
    -- Calculate progress percentage
    progress_percentage := ROUND((completed_steps::DECIMAL / total_steps::DECIMAL) * 100);
    
    -- Update order progress
    UPDATE healthcare_service_orders
    SET progress_percentage = progress_percentage,
        updated_at = NOW()
    WHERE id = order_id_param;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get service revenue analytics
CREATE OR REPLACE FUNCTION get_service_revenue_analytics(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL(12,2),
    average_order_value DECIMAL(10,2),
    completion_rate FLOAT,
    customer_satisfaction FLOAT,
    popular_services JSONB,
    revenue_by_month JSONB,
    team_utilization JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_orders,
        SUM(price) as total_revenue,
        AVG(price) as average_order_value,
        (COUNT(*) FILTER (WHERE status = 'completed')::FLOAT / COUNT(*)::FLOAT * 100) as completion_rate,
        AVG(customer_satisfaction) as customer_satisfaction,
        jsonb_object_agg(
            service_id,
            COUNT(*) FILTER (WHERE service_id IS NOT NULL)
        ) as popular_services,
        jsonb_object_agg(
            DATE_TRUNC('month', ordered_at),
            SUM(price) FILTER (WHERE ordered_at IS NOT NULL)
        ) as revenue_by_month,
        '{}'::jsonb as team_utilization -- Placeholder for team utilization calculation
    FROM healthcare_service_orders
    WHERE ordered_at BETWEEN start_date AND end_date
      AND payment_status = 'paid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get order fulfillment metrics
CREATE OR REPLACE FUNCTION get_order_fulfillment_metrics(
    service_id_param VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
    service_id VARCHAR(100),
    service_name TEXT,
    total_orders BIGINT,
    average_completion_time_hours FLOAT,
    on_time_delivery_rate FLOAT,
    quality_score FLOAT,
    customer_satisfaction FLOAT,
    revenue_generated DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.service_id,
        o.service_name,
        COUNT(*) as total_orders,
        AVG(EXTRACT(EPOCH FROM (o.completed_at - o.started_at)) / 3600) as average_completion_time_hours,
        (COUNT(*) FILTER (WHERE o.actual_delivery <= o.estimated_delivery)::FLOAT / COUNT(*)::FLOAT * 100) as on_time_delivery_rate,
        AVG(o.quality_score) as quality_score,
        AVG(o.customer_satisfaction) as customer_satisfaction,
        SUM(o.price) as revenue_generated
    FROM healthcare_service_orders o
    WHERE o.payment_status = 'paid'
      AND (service_id_param IS NULL OR o.service_id = service_id_param)
    GROUP BY o.service_id, o.service_name
    ORDER BY revenue_generated DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for automated workflow progression
CREATE OR REPLACE FUNCTION progress_automated_workflow_steps()
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
    step_record RECORD;
BEGIN
    -- Find automated steps that are ready to process
    FOR step_record IN
        SELECT s.*, o.status as order_status
        FROM healthcare_service_workflow_steps s
        JOIN healthcare_service_orders o ON s.order_id = o.id
        WHERE s.is_automated = true 
          AND s.status = 'pending'
          AND o.status IN ('paid', 'in_progress')
    LOOP
        -- Simulate automated step completion
        UPDATE healthcare_service_workflow_steps
        SET status = 'completed',
            started_at = NOW(),
            completed_at = NOW(),
            actual_duration_hours = estimated_duration_hours,
            results = jsonb_build_object(
                'automated', true,
                'completed_by', 'system',
                'completion_time', NOW()
            )
        WHERE id = step_record.id;
        
        processed_count := processed_count + 1;
        
        -- Update order progress
        PERFORM calculate_order_progress(step_record.order_id);
        
        -- Start next step if available
        UPDATE healthcare_service_workflow_steps
        SET status = 'pending'
        WHERE order_id = step_record.order_id
          AND step_number = step_record.step_number + 1
          AND status = 'waiting';
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled job for automated workflow progression (runs every 15 minutes)
SELECT cron.schedule('progress-automated-workflows', '*/15 * * * *', 'SELECT progress_automated_workflow_steps();');

-- Insert sample team members
INSERT INTO healthcare_service_team_members (
    name, email, role, specialties, ahpra_registration, certifications, bio
) VALUES
('Dr. Sarah Mitchell', 'sarah.mitchell@jbsaas.com.au', 'compliance_specialist', 
 ARRAY['AHPRA Compliance', 'TGA Regulations', 'Medical Marketing'], 'MED1234567890',
 ARRAY['AHPRA Compliance Certification', 'Healthcare Marketing Diploma'],
 'AHPRA compliance specialist with 8+ years experience in healthcare marketing regulations'),
('James Robertson', 'james.robertson@jbsaas.com.au', 'project_manager',
 ARRAY['Project Management', 'Healthcare Systems', 'Client Relations'], NULL,
 ARRAY['PMP Certification', 'Agile Scrum Master'],
 'Experienced project manager specializing in healthcare practice digital transformation'),
('Emily Chen', 'emily.chen@jbsaas.com.au', 'content_creator',
 ARRAY['Medical Content Writing', 'Patient Education', 'SEO'], NULL,
 ARRAY['Healthcare Content Certification', 'Medical Writing Diploma'],
 'Medical content specialist creating AHPRA-compliant educational materials'),
('David Kim', 'david.kim@jbsaas.com.au', 'designer',
 ARRAY['Healthcare Branding', 'Medical Graphics', 'UI/UX Design'], NULL,
 ARRAY['Graphic Design Degree', 'Healthcare Design Certification'],
 'Creative designer specializing in professional healthcare practice branding')
ON CONFLICT (email) DO NOTHING;

-- Grant appropriate permissions
GRANT SELECT, UPDATE ON healthcare_service_orders TO authenticated;
GRANT ALL ON healthcare_service_orders TO service_role;
GRANT SELECT ON healthcare_service_workflow_steps TO authenticated;
GRANT ALL ON healthcare_service_workflow_steps TO service_role;
GRANT SELECT ON healthcare_service_notifications TO authenticated;
GRANT ALL ON healthcare_service_notifications TO service_role;
GRANT SELECT ON healthcare_service_analytics TO authenticated;
GRANT ALL ON healthcare_service_analytics TO service_role;
GRANT SELECT ON healthcare_service_deliverables TO authenticated;
GRANT ALL ON healthcare_service_deliverables TO service_role;
GRANT SELECT ON healthcare_service_team_members TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_order_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_service_revenue_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_fulfillment_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION progress_automated_workflow_steps TO service_role;

-- Insert comments for migration tracking
COMMENT ON TABLE healthcare_service_orders IS 'Healthcare professional service orders with payment and delivery tracking';
COMMENT ON TABLE healthcare_service_workflow_steps IS 'Automated workflow steps for service delivery and quality assurance';
COMMENT ON TABLE healthcare_service_notifications IS 'Customer communication and notification tracking for service orders';
COMMENT ON TABLE healthcare_service_analytics IS 'Revenue analytics and service performance tracking for healthcare services';
COMMENT ON TABLE healthcare_service_deliverables IS 'Service deliverables and file management for completed orders';
COMMENT ON TABLE healthcare_service_team_members IS 'Healthcare service delivery team with AHPRA compliance specialists';
COMMENT ON FUNCTION get_service_revenue_analytics IS 'Comprehensive revenue analytics for healthcare professional services';
COMMENT ON FUNCTION get_order_fulfillment_metrics IS 'Service delivery performance metrics and quality tracking';
COMMENT ON FUNCTION progress_automated_workflow_steps IS 'Automated workflow progression for service delivery optimization'; 