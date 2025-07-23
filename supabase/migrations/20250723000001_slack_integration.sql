-- Add Slack integration fields to business_profiles table
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS slack_settings JSONB DEFAULT '{}'::jsonb;

-- Create index for faster Slack configuration lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_slack_webhook 
ON business_profiles(user_id) 
WHERE slack_webhook_url IS NOT NULL;

-- Add Slack notification preferences to notification_preferences table
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS slack_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_channels JSONB DEFAULT '{
  "content_approvals": "#content-approvals",
  "compliance_alerts": "#compliance-alerts", 
  "marketing_reports": "#marketing-reports",
  "general": "#general"
}'::jsonb;

-- Create table for Slack notification history and analytics
CREATE TABLE IF NOT EXISTS slack_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notification_queue(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL,
  channel TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  webhook_response TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for slack_notifications table
ALTER TABLE slack_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own slack notifications"
ON slack_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own slack notifications"
ON slack_notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_slack_notifications_user_sent_at 
ON slack_notifications(user_id, sent_at DESC);

-- Function to get Slack notification analytics
CREATE OR REPLACE FUNCTION get_slack_analytics(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_notifications BIGINT,
  successful_notifications BIGINT,
  failed_notifications BIGINT,
  success_rate NUMERIC,
  popular_channels TEXT[],
  notification_types JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE success = true) as successful_notifications,
    COUNT(*) FILTER (WHERE success = false) as failed_notifications,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*) * 100), 2)
      ELSE 0 
    END as success_rate,
    ARRAY_AGG(DISTINCT channel ORDER BY channel) FILTER (WHERE channel IS NOT NULL) as popular_channels,
    jsonb_object_agg(
      message_type, 
      COUNT(*)
    ) as notification_types
  FROM slack_notifications 
  WHERE user_id = p_user_id 
    AND sent_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$;

-- Function to clean up old notification queue entries
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Delete notifications older than 90 days that are completed or failed
  DELETE FROM notification_queue 
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('sent', 'failed');
    
  -- Delete old Slack notification history older than 1 year
  DELETE FROM slack_notifications 
  WHERE sent_at < NOW() - INTERVAL '1 year';
END;
$$;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- Note: This will need to be enabled manually in Supabase dashboard
-- SELECT cron.schedule('cleanup-old-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications();');

-- Sample data for testing (optional - remove in production)
-- INSERT INTO notification_queue (user_id, notification_type, message_data, scheduled_for, status)
-- VALUES (
--   auth.uid(),
--   'slack',
--   '{
--     "type": "content_approval",
--     "message": "New blog post requires AHPRA review",
--     "content_type": "Blog Post",
--     "compliance_score": 85,
--     "channel": "#content-approvals"
--   }'::jsonb,
--   NOW(),
--   'pending'
-- );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON slack_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_slack_analytics(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications() TO service_role;