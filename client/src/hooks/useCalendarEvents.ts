import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface CalendarEvent {
  id?: string;
  business_id?: string;
  user_id?: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  all_day?: boolean;
  status?: 'confirmed' | 'tentative' | 'cancelled' | 'draft';
  event_type?: 'general' | 'post' | 'blog' | 'campaign' | 'meeting' | 'deadline' | 'review' | 'analysis';
  related_post_id?: string;
  related_blog_id?: string;
  platform?: 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'reddit' | 'blog' | 'email' | 'youtube' | 'twitter';
  priority?: number;
  color?: string;
  location?: string;
  attendees?: any[];
  reminders?: any[];
  recurrence_rule?: any;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  createEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  bulkOperations: (operations: Array<{
    operation: 'create' | 'update' | 'delete';
    id?: string;
    data?: Partial<CalendarEvent>;
  }>) => Promise<{ success: number; errors: number }>;
  refetch: () => Promise<void>;
}

export const useCalendarEvents = (
  businessId?: string,
  startDate?: string,
  endDate?: string
): UseCalendarEventsReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('calendar-api', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          start: startDate,
          end: endDate,
        }),
      });

      if (fetchError) {
        throw fetchError;
      }

      setEvents(data.events || []);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      setError(err.message || 'Failed to fetch events');
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [user, businessId, startDate, endDate]);

  const createEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('calendar-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (error) {
        throw error;
      }

      const newEvent = data.event;
      setEvents(prev => [...prev, newEvent]);
      toast.success('Event created successfully');
      return newEvent;
    } catch (err: any) {
      console.error('Error creating event:', err);
      toast.error('Failed to create event');
      return null;
    }
  }, [user]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    if (!user) return null;

    try {
      // Optimistic update
      setEvents(prev => 
        prev.map(event => 
          event.id === id ? { ...event, ...updates } : event
        )
      );

      const { data, error } = await supabase.functions.invoke('calendar-api', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (error) {
        throw error;
      }

      const updatedEvent = data.event;
      setEvents(prev => 
        prev.map(event => 
          event.id === id ? updatedEvent : event
        )
      );
      
      toast.success('Event updated successfully');
      return updatedEvent;
    } catch (err: any) {
      console.error('Error updating event:', err);
      toast.error('Failed to update event');
      // Revert optimistic update
      await fetchEvents();
      return null;
    }
  }, [user, fetchEvents]);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Optimistic update
      setEvents(prev => prev.filter(event => event.id !== id));

      const { error } = await supabase.functions.invoke('calendar-api', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (error) {
        throw error;
      }

      toast.success('Event deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
      // Revert optimistic update
      await fetchEvents();
      return false;
    }
  }, [user, fetchEvents]);

  const bulkOperations = useCallback(async (operations: Array<{
    operation: 'create' | 'update' | 'delete';
    id?: string;
    data?: Partial<CalendarEvent>;
  }>): Promise<{ success: number; errors: number }> => {
    if (!user) return { success: 0, errors: operations.length };

    try {
      const { data, error } = await supabase.functions.invoke('calendar-bulk-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: operations }),
      });

      if (error) {
        throw error;
      }

      if (data.success > 0) {
        toast.success(`Successfully processed ${data.success} operations`);
        await fetchEvents(); // Refresh to get latest state
      }

      if (data.errors > 0) {
        toast.error(`${data.errors} operations failed`);
      }

      return { success: data.success, errors: data.errors };
    } catch (err: any) {
      console.error('Error with bulk operations:', err);
      toast.error('Failed to process bulk operations');
      return { success: 0, errors: operations.length };
    }
  }, [user, fetchEvents]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('calendar-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time calendar event change:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setEvents(prev => {
                const exists = prev.find(e => e.id === payload.new.id);
                if (exists) return prev;
                return [...prev, payload.new as CalendarEvent];
              });
              break;
              
            case 'UPDATE':
              setEvents(prev => 
                prev.map(event => 
                  event.id === payload.new.id ? payload.new as CalendarEvent : event
                )
              );
              break;
              
            case 'DELETE':
              setEvents(prev => prev.filter(event => event.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    bulkOperations,
    refetch: fetchEvents,
  };
};