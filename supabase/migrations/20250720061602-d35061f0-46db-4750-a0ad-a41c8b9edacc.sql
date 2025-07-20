-- Drop existing policy if it exists and recreate with proper permissions
DROP POLICY IF EXISTS "Users can manage their calendar events" ON public.calendar_events;

-- Create missing tables for full-stack calendar system
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  event_type TEXT,
  conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.external_calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('google', 'outlook', 'apple', 'caldav')),
  external_calendar_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT true,
  sync_direction TEXT DEFAULT 'both' CHECK (sync_direction IN ('import', 'export', 'both')),
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'disabled')),
  sync_error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  event_reminders BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  inactivity_alerts BOOLEAN DEFAULT true,
  inactivity_threshold_days INTEGER DEFAULT 7,
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, business_id)
);

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'push', 'sms', 'in_app')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  message_data JSONB NOT NULL DEFAULT '{}',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
CREATE POLICY "Users can manage their calendar events"
ON public.calendar_events
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their automation rules"
ON public.automation_rules
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their external calendar integrations"
ON public.external_calendar_integrations
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification preferences"
ON public.notification_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their notifications"
ON public.notification_queue
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can manage notification queue"
ON public.notification_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_business ON public.automation_rules(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_event_type ON public.automation_rules(event_type);

CREATE INDEX IF NOT EXISTS idx_external_calendar_integrations_user ON public.external_calendar_integrations(user_id, sync_enabled);
CREATE INDEX IF NOT EXISTS idx_external_calendar_integrations_sync_status ON public.external_calendar_integrations(sync_status);

CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON public.notification_queue(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON public.notification_queue(user_id);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION public.update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_external_calendar_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_automation_rules_updated_at ON public.automation_rules;
CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_automation_rules_updated_at();

DROP TRIGGER IF EXISTS update_external_calendar_integrations_updated_at ON public.external_calendar_integrations;
CREATE TRIGGER update_external_calendar_integrations_updated_at
  BEFORE UPDATE ON public.external_calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_external_calendar_integrations_updated_at();