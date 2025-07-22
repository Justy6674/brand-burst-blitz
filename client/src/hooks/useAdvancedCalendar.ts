import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from './useBusinessProfile';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  event_type: 'meeting' | 'content' | 'reminder' | 'deadline' | 'general';
  status: 'confirmed' | 'tentative' | 'cancelled';
  priority: number;
  location?: string;
  attendees: Array<{
    email: string;
    name?: string;
    status: 'pending' | 'accepted' | 'declined' | 'tentative';
    role: 'organizer' | 'attendee' | 'optional';
  }>;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  color: string;
  is_recurring: boolean;
  recurrence_rule?: any;
  parent_event_id?: string;
  notifications: Array<{
    type: 'email' | 'popup' | 'push';
    minutes_before: number;
  }>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_id: string;
  business_profile_id?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start_datetime: Date;
  end_datetime: Date;
  all_day?: boolean;
  event_type?: 'meeting' | 'content' | 'reminder' | 'deadline' | 'general';
  status?: 'confirmed' | 'tentative' | 'cancelled';
  priority?: number;
  location?: string;
  attendees?: Array<{
    email: string;
    name?: string;
    role?: 'organizer' | 'attendee' | 'optional';
  }>;
  color?: string;
  is_recurring?: boolean;
  recurrence_rule?: any;
  notifications?: Array<{
    type: 'email' | 'popup' | 'push';
    minutes_before: number;
  }>;
  metadata?: Record<string, any>;
}

export interface EventFilters {
  event_types: string[];
  date_range: {
    start: Date;
    end: Date;
  };
  business_profile_id?: string;
  status: string[];
}

export const useAdvancedCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [filters, setFilters] = useState<EventFilters>({
    event_types: ['meeting', 'content', 'reminder', 'deadline', 'general'],
    date_range: {
      start: new Date(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    status: ['confirmed', 'tentative'],
  });

  const { user } = useAuth();
  const { currentProfile } = useBusinessProfile();
  const { toast } = useToast();

  // Fetch events from database
  const fetchEvents = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          calendar_event_attendees(*)
        `)
        .eq('user_id', user.id)
        .gte('start_datetime', filters.date_range.start.toISOString())
        .lte('end_datetime', filters.date_range.end.toISOString())
        .in('event_type', filters.event_types)
        .in('status', filters.status)
        .order('start_datetime', { ascending: true });

      if (filters.business_profile_id) {
        query = query.eq('business_profile_id', filters.business_profile_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data to match interface
      const transformedEvents: CalendarEvent[] = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime,
        all_day: event.all_day,
        event_type: event.event_type as 'meeting' | 'content' | 'reminder' | 'deadline' | 'general',
        status: event.status as 'confirmed' | 'tentative' | 'cancelled',
        priority: event.priority,
        location: event.location,
        attendees: (event.calendar_event_attendees || []).map((att: any) => ({
          email: att.email,
          name: att.name,
          status: att.status as 'pending' | 'accepted' | 'declined' | 'tentative',
          role: att.role as 'organizer' | 'attendee' | 'optional',
        })),
        attachments: Array.isArray(event.attachments) ? event.attachments as any[] : [],
        color: event.color,
        is_recurring: event.is_recurring,
        recurrence_rule: event.recurrence_rule,
        parent_event_id: event.parent_event_id,
        notifications: Array.isArray(event.notifications) ? event.notifications as any[] : [],
        metadata: typeof event.metadata === 'object' ? event.metadata as Record<string, any> : {},
        created_at: event.created_at,
        updated_at: event.updated_at,
        user_id: event.user_id,
        business_profile_id: event.business_profile_id,
      }));

      setEvents(transformedEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, toast]);

  // Create new event
  const createEvent = useCallback(async (eventData: CreateEventData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id,
          business_profile_id: currentProfile?.id,
          start_datetime: eventData.start_datetime.toISOString(),
          end_datetime: eventData.end_datetime.toISOString(),
          all_day: eventData.all_day || false,
          event_type: eventData.event_type || 'general',
          status: eventData.status || 'confirmed',
          priority: eventData.priority || 3,
          color: eventData.color || '#3b82f6',
          is_recurring: eventData.is_recurring || false,
          attendees: eventData.attendees || [],
          attachments: [],
          notifications: eventData.notifications || [],
          metadata: eventData.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Add attendees if provided
      if (eventData.attendees && eventData.attendees.length > 0) {
        const attendeesData = eventData.attendees.map(attendee => ({
          event_id: data.id,
          email: attendee.email,
          name: attendee.name,
          role: attendee.role || 'attendee',
          status: 'pending',
        }));

        await supabase
          .from('calendar_event_attendees')
          .insert(attendeesData);
      }

      await fetchEvents();
      
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, currentProfile, fetchEvents, toast]);

  // Update event
  const updateEvent = useCallback(async (eventId: string, updates: Partial<CreateEventData>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updateData: any = { ...updates };
      
      if (updates.start_datetime) {
        updateData.start_datetime = updates.start_datetime.toISOString();
      }
      if (updates.end_datetime) {
        updateData.end_datetime = updates.end_datetime.toISOString();
      }

      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update attendees if provided
      if (updates.attendees) {
        // Delete existing attendees
        await supabase
          .from('calendar_event_attendees')
          .delete()
          .eq('event_id', eventId);

        // Insert new attendees
        if (updates.attendees.length > 0) {
          const attendeesData = updates.attendees.map(attendee => ({
            event_id: eventId,
            email: attendee.email,
            name: attendee.name,
            role: attendee.role || 'attendee',
            status: 'pending',
          }));

          await supabase
            .from('calendar_event_attendees')
            .insert(attendeesData);
        }
      }

      await fetchEvents();
      
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, fetchEvents, toast]);

  // Delete event
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchEvents();
      
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, fetchEvents, toast]);

  // Move event (drag & drop)
  const moveEvent = useCallback(async (eventId: string, newStart: Date, newEnd: Date) => {
    return updateEvent(eventId, {
      start_datetime: newStart,
      end_datetime: newEnd,
    });
  }, [updateEvent]);

  // Get events for specific date
  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === dateStr;
    });
  }, [events]);

  // Get events for date range
  const getEventsForRange = useCallback((start: Date, end: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_datetime);
      const eventEnd = new Date(event.end_datetime);
      return eventStart <= end && eventEnd >= start;
    });
  }, [events]);

  // Create recurring events
  const createRecurringEvent = useCallback(async (eventData: CreateEventData, recurrenceRule: any) => {
    // This would generate multiple events based on recurrence rule
    // For now, create the main event with recurrence flag
    return createEvent({
      ...eventData,
      is_recurring: true,
      recurrence_rule: recurrenceRule,
    });
  }, [createEvent]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Initial load and when dependencies change
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [fetchEvents, user]);

  return {
    // Data
    events,
    isLoading,
    error,
    currentDate,
    view,
    filters,

    // Actions
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    createRecurringEvent,
    fetchEvents,

    // Getters
    getEventsForDate,
    getEventsForRange,

    // State setters
    setCurrentDate,
    setView,
    updateFilters,
  };
};