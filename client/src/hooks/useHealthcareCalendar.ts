import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';
import { useHealthcareAuth } from './useHealthcareAuth';

export interface HealthcareCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime?: string;
  event_type: 'appointment' | 'content_post' | 'practice_task' | 'training' | 'admin' | 'marketing' | 'patient_follow_up' | 'compliance_review';
  event_category: 'patient_care' | 'content_creation' | 'practice_management' | 'professional_development' | 'compliance' | 'marketing';
  practice_id?: string;
  patient_type?: 'new' | 'returning' | 'follow_up' | 'urgent';
  appointment_type?: string;
  healthcare_specialty?: string;
  content_platform?: 'facebook' | 'instagram' | 'website' | 'blog' | 'newsletter';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'draft';
  attendees?: string[];
  location?: string;
  is_telehealth?: boolean;
  requires_preparation?: boolean;
  preparation_notes?: string;
  follow_up_required?: boolean;
  compliance_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SmartIdeaCapture {
  id: string;
  content: string;
  source: 'voice' | 'text' | 'image';
  suggested_type: string;
  ai_analysis?: string;
  scheduled_date?: string;
  status: 'captured' | 'analyzed' | 'scheduled' | 'published';
  created_at: string;
}

interface CalendarFilters {
  eventType?: string;
  practice?: string;
  priority?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function useHealthcareCalendar(practiceId?: string) {
  const { user } = useHealthcareAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<HealthcareCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smartIdeas, setSmartIdeas] = useState<SmartIdeaCapture[]>([]);
  const [filters, setFilters] = useState<CalendarFilters>({});

  // Load calendar events
  const loadEvents = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('healthcare_calendar_events')
        .select('*')
        .eq('created_by', user.id)
        .order('start_datetime', { ascending: true });

      if (practiceId) {
        query = query.eq('practice_id', practiceId);
      }

      if (dateRange) {
        query = query
          .gte('start_datetime', dateRange.start.toISOString())
          .lte('start_datetime', dateRange.end.toISOString());
      }

      if (filters.eventType && filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError(err.message);
      toast({
        title: "Calendar Error",
        description: "Failed to load calendar events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, practiceId, filters, toast]);

  // Create calendar event
  const createEvent = useCallback(async (eventData: Partial<HealthcareCalendarEvent>) => {
    if (!user?.id) return null;

    try {
      // Check for calendar conflicts
      const { data: conflicts } = await supabase
        .rpc('check_calendar_conflicts', {
          p_user_id: user.id,
          p_start_time: eventData.start_datetime,
          p_end_time: eventData.end_datetime || eventData.start_datetime
        });

      if (conflicts && conflicts.length > 0) {
        toast({
          title: "Calendar Conflict",
          description: `Conflict with "${conflicts[0].conflict_title}"`,
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('healthcare_calendar_events')
        .insert({
          ...eventData,
          created_by: user.id,
          practice_id: practiceId
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      
      toast({
        title: "Event Created",
        description: `"${data.title}" has been added to your calendar`
      });

      return data;
    } catch (err) {
      console.error('Error creating event:', err);
      toast({
        title: "Creation Error",
        description: "Failed to create calendar event",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, practiceId, toast]);

  // Update calendar event
  const updateEvent = useCallback(async (eventId: string, updates: Partial<HealthcareCalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from('healthcare_calendar_events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .eq('created_by', user?.id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, ...data } : event
      ));

      toast({
        title: "Event Updated",
        description: `"${data.title}" has been updated`
      });

      return data;
    } catch (err) {
      console.error('Error updating event:', err);
      toast({
        title: "Update Error",
        description: "Failed to update calendar event",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);

  // Delete calendar event
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('healthcare_calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('created_by', user?.id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      toast({
        title: "Event Deleted",
        description: "Calendar event has been removed"
      });

      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      toast({
        title: "Delete Error",
        description: "Failed to delete calendar event",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast]);

  // Reschedule event (drag & drop)
  const rescheduleEvent = useCallback(async (eventId: string, newStartTime: Date, newEndTime?: Date) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return false;

      // Calculate end time if not provided
      const endTime = newEndTime || (event.end_datetime ? 
        new Date(newStartTime.getTime() + (new Date(event.end_datetime).getTime() - new Date(event.start_datetime).getTime())) :
        new Date(newStartTime.getTime() + 60 * 60 * 1000) // Default 1 hour
      );

      // Check for conflicts
      const { data: conflicts } = await supabase
        .rpc('check_calendar_conflicts', {
          p_user_id: user?.id,
          p_start_time: newStartTime.toISOString(),
          p_end_time: endTime.toISOString(),
          p_exclude_event_id: eventId
        });

      if (conflicts && conflicts.length > 0) {
        toast({
          title: "Reschedule Conflict",
          description: `Conflict with "${conflicts[0].conflict_title}"`,
          variant: "destructive"
        });
        return false;
      }

      const { data, error } = await supabase
        .from('healthcare_calendar_events')
        .update({
          start_datetime: newStartTime.toISOString(),
          end_datetime: endTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .eq('created_by', user?.id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => prev.map(e => e.id === eventId ? data : e));
      
      toast({
        title: "Event Rescheduled",
        description: `"${data.title}" moved to ${newStartTime.toLocaleDateString()}`
      });

      return true;
    } catch (err) {
      console.error('Error rescheduling event:', err);
      toast({
        title: "Reschedule Error",
        description: "Failed to reschedule event",
        variant: "destructive"
      });
      return false;
    }
  }, [events, user?.id, toast]);

  // Load smart ideas
  const loadSmartIdeas = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('smart_idea_captures')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSmartIdeas(data || []);
    } catch (err) {
      console.error('Error loading smart ideas:', err);
    }
  }, [user?.id]);

  // Process smart idea with AI
  const processSmartIdea = useCallback(async (content: string, source: 'voice' | 'text' | 'image') => {
    if (!user?.id) return null;

    try {
      // Call AI analysis function
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-content-idea', {
          body: { 
            content, 
            source,
            healthcare_context: 'general_practice' // Could be dynamic based on user profile
          }
        });

      if (analysisError) throw analysisError;

      // Save the analyzed idea
      const { data: ideaData, error: saveError } = await supabase
        .from('smart_idea_captures')
        .insert({
          content,
          source,
          suggested_type: analysisData.analysis.suggested_type,
          ai_analysis: analysisData.analysis.enhanced_content,
          created_by: user.id,
          status: 'analyzed'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setSmartIdeas(prev => [ideaData, ...prev]);

      toast({
        title: "Idea Analyzed! 🧠",
        description: `AI suggests: ${analysisData.analysis.suggested_type.replace('_', ' ')}`,
      });

      return { idea: ideaData, analysis: analysisData.analysis };
    } catch (err) {
      console.error('Error processing smart idea:', err);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze your idea",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);

  // Schedule idea as calendar event
  const scheduleIdeaAsEvent = useCallback(async (idea: SmartIdeaCapture, scheduleDate: Date) => {
    const eventData: Partial<HealthcareCalendarEvent> = {
      title: `Create ${idea.suggested_type.replace('_', ' ')}: ${idea.content.substring(0, 50)}...`,
      description: `AI-generated content idea:\n\n${idea.ai_analysis}\n\nOriginal idea: ${idea.content}`,
      start_datetime: scheduleDate.toISOString(),
      event_type: 'content_post',
      event_category: 'content_creation',
      content_platform: idea.suggested_type.includes('facebook') ? 'facebook' : 
                       idea.suggested_type.includes('instagram') ? 'instagram' : 
                       idea.suggested_type.includes('blog') ? 'blog' : 'website',
      priority: 'medium',
      status: 'draft'
    };

    const createdEvent = await createEvent(eventData);
    
    if (createdEvent) {
      // Update idea status
      await supabase
        .from('smart_idea_captures')
        .update({ 
          status: 'scheduled', 
          scheduled_date: scheduleDate.toISOString(),
          calendar_event_id: createdEvent.id
        })
        .eq('id', idea.id);

      setSmartIdeas(prev => prev.map(i => 
        i.id === idea.id 
          ? { ...i, status: 'scheduled', scheduled_date: scheduleDate.toISOString() }
          : i
      ));
    }

    return createdEvent;
  }, [createEvent]);

  // Get events for specific date range
  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }, [events]);

  // Get events for specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [events]);

  // Get upcoming events
  const getUpcomingEvents = useCallback((limit: number = 5) => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start_datetime) > now)
      .slice(0, limit);
  }, [events]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get calendar statistics
  const getCalendarStats = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const thisWeekEvents = getEventsForDateRange(startOfWeek, endOfWeek);
    
    return {
      totalEvents: events.length,
      thisWeekEvents: thisWeekEvents.length,
      appointments: events.filter(e => e.event_type === 'appointment').length,
      contentScheduled: events.filter(e => e.event_type === 'content_post').length,
      upcomingEvents: getUpcomingEvents().length,
      completedEvents: events.filter(e => e.status === 'completed').length,
      pendingIdeas: smartIdeas.filter(i => i.status === 'analyzed').length
    };
  }, [events, smartIdeas, getEventsForDateRange, getUpcomingEvents]);

  // Initialize calendar
  useEffect(() => {
    if (user?.id) {
      loadEvents();
      loadSmartIdeas();
    }
  }, [user?.id, loadEvents, loadSmartIdeas]);

  return {
    // Data
    events,
    smartIdeas,
    loading,
    error,
    filters,
    
    // Actions
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    rescheduleEvent,
    processSmartIdea,
    scheduleIdeaAsEvent,
    loadSmartIdeas,
    updateFilters,
    
    // Getters
    getEventsForDate,
    getEventsForDateRange,
    getUpcomingEvents,
    getCalendarStats
  };
}

// Hook for external calendar integration
export function useExternalCalendarSync() {
  const { user } = useHealthcareAuth();
  const { toast } = useToast();
  
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const loadIntegrations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('external_calendar_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (err) {
      console.error('Error loading calendar integrations:', err);
    }
  }, [user?.id]);

  const connectCalendar = useCallback(async (provider: string, calendarData: any) => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .from('external_calendar_integrations')
        .insert({
          user_id: user.id,
          provider,
          calendar_id: calendarData.calendar_id,
          calendar_name: calendarData.calendar_name,
          access_token: calendarData.access_token,
          refresh_token: calendarData.refresh_token,
          sync_enabled: true,
          sync_status: 'connected'
        })
        .select()
        .single();

      if (error) throw error;
      
      setIntegrations(prev => [...prev, data]);
      
      toast({
        title: "Calendar Connected",
        description: `${provider} calendar "${calendarData.calendar_name}" connected successfully`
      });

      return true;
    } catch (err) {
      console.error('Error connecting calendar:', err);
      toast({
        title: "Connection Error",
        description: "Failed to connect external calendar",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast]);

  const syncCalendars = useCallback(async () => {
    setSyncing(true);
    
    try {
      for (const integration of integrations) {
        if (integration.sync_enabled && integration.sync_status === 'connected') {
          // Call sync function for each integration
          const { error } = await supabase.functions
            .invoke('sync-external-calendar', {
              body: { integration_id: integration.id }
            });

          if (error) {
            console.error(`Sync error for ${integration.provider}:`, error);
          }
        }
      }
      
      toast({
        title: "Calendars Synced",
        description: "External calendars have been synchronized"
      });
    } catch (err) {
      console.error('Error syncing calendars:', err);
      toast({
        title: "Sync Error",
        description: "Failed to sync external calendars",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  }, [integrations, toast]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  return {
    integrations,
    syncing,
    loadIntegrations,
    connectCalendar,
    syncCalendars
  };
} 