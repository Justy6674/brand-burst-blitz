-- Create comprehensive calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled', 'draft')),
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('general', 'post', 'blog', 'campaign', 'meeting', 'deadline', 'review', 'analysis')),
  related_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  related_blog_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  platform TEXT CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'linkedin', 'reddit', 'blog', 'email', 'youtube', 'twitter')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  color TEXT DEFAULT '#3b82f6',
  location TEXT,
  attendees JSONB DEFAULT '[]',
  reminders JSONB DEFAULT '[]',
  recurrence_rule JSONB,
  external_calendar_id TEXT,
  external_event_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create automation_rules table for workflow engine
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

-- Create calendar_integrations table for external calendar sync
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
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

-- Create notification_preferences table
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

-- Create notification_queue table for managing notifications
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

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_events
CREATE POLICY "Users can manage their calendar events"
ON public.calendar_events
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for automation_rules
CREATE POLICY "Users can manage their automation rules"
ON public.automation_rules
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for calendar_integrations
CREATE POLICY "Users can manage their calendar integrations"
ON public.calendar_integrations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their notification preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_queue
CREATE POLICY "Users can view their notifications"
ON public.notification_queue
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage notification queue"
ON public.notification_queue
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_calendar_events_user_business ON public.calendar_events(user_id, business_id);
CREATE INDEX idx_calendar_events_datetime ON public.calendar_events(start_datetime, end_datetime);
CREATE INDEX idx_calendar_events_platform ON public.calendar_events(platform);
CREATE INDEX idx_calendar_events_status ON public.calendar_events(status);
CREATE INDEX idx_calendar_events_related_post ON public.calendar_events(related_post_id);
CREATE INDEX idx_calendar_events_related_blog ON public.calendar_events(related_blog_id);

CREATE INDEX idx_automation_rules_business ON public.automation_rules(business_id, is_active);
CREATE INDEX idx_automation_rules_event_type ON public.automation_rules(event_type);

CREATE INDEX idx_calendar_integrations_user ON public.calendar_integrations(user_id, sync_enabled);
CREATE INDEX idx_calendar_integrations_sync_status ON public.calendar_integrations(sync_status);

CREATE INDEX idx_notification_queue_scheduled ON public.notification_queue(scheduled_for, status);
CREATE INDEX idx_notification_queue_user ON public.notification_queue(user_id);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION public.update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_calendar_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_calendar_events_updated_at();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_automation_rules_updated_at();

CREATE TRIGGER update_calendar_integrations_updated_at
  BEFORE UPDATE ON public.calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_calendar_integrations_updated_at();

-- Enable realtime for calendar events
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_rules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_queue;