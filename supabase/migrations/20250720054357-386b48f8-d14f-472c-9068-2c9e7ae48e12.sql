-- Create comprehensive calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_profile_id UUID REFERENCES business_profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  event_type TEXT NOT NULL DEFAULT 'general', -- 'meeting', 'content', 'reminder', 'deadline', 'general'
  status TEXT DEFAULT 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
  priority INTEGER DEFAULT 3, -- 1-5 (1 highest, 5 lowest)
  location TEXT,
  attendees JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  color TEXT DEFAULT '#3b82f6',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB, -- Store RRULE data
  parent_event_id UUID REFERENCES calendar_events(id),
  notifications JSONB DEFAULT '[]'::jsonb, -- Reminder settings
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create calendar event attendees table
CREATE TABLE public.calendar_event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'tentative'
  role TEXT DEFAULT 'attendee', -- 'organizer', 'attendee', 'optional'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create calendar integrations table
CREATE TABLE public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_profile_id UUID REFERENCES business_profiles(id),
  integration_type TEXT NOT NULL, -- 'google', 'outlook', 'apple'
  external_calendar_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_events
CREATE POLICY "Users can manage their calendar events" 
ON public.calendar_events 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for calendar_event_attendees
CREATE POLICY "Users can manage attendees for their events" 
ON public.calendar_event_attendees 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM calendar_events 
    WHERE calendar_events.id = calendar_event_attendees.event_id 
    AND calendar_events.user_id = auth.uid()
  )
);

-- RLS policies for calendar_integrations
CREATE POLICY "Users can manage their calendar integrations" 
ON public.calendar_integrations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, start_datetime);
CREATE INDEX idx_calendar_events_business ON calendar_events(business_profile_id);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_event_attendees_event ON calendar_event_attendees(event_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();