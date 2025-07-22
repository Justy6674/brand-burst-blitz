import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Post = Tables<'posts'>;
type PublishingQueue = Tables<'publishing_queue'>;

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'post' | 'scheduled' | 'published';
  status: string;
  post?: Post;
  queueItem?: PublishingQueue;
  color: string;
}

interface CalendarFilters {
  showPosts: boolean;
  showScheduled: boolean;
  showPublished: boolean;
  businessProfileId?: string;
  platforms?: string[];
}

interface UseCalendarReturn {
  events: CalendarEvent[];
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  filters: CalendarFilters;
  isLoading: boolean;
  error: string | null;
  setCurrentDate: (date: Date) => void;
  setView: (view: 'month' | 'week' | 'day') => void;
  setFilters: (filters: Partial<CalendarFilters>) => void;
  schedulePost: (postId: string, date: Date, platforms: string[]) => Promise<boolean>;
  reschedulePost: (queueId: string, newDate: Date) => Promise<boolean>;
  unschedulePost: (queueId: string) => Promise<boolean>;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsForDateRange: (start: Date, end: Date) => CalendarEvent[];
  refreshCalendar: () => Promise<void>;
}

export const useCalendar = (): UseCalendarReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filters, setFilters] = useState<CalendarFilters>({
    showPosts: true,
    showScheduled: true,
    showPublished: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCalendarData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Calculate date range based on current view
      const { start: rangeStart, end: rangeEnd } = getViewDateRange(currentDate, view);

      // Fetch posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .or(`created_at.gte.${rangeStart.toISOString()},updated_at.gte.${rangeStart.toISOString()},scheduled_at.gte.${rangeStart.toISOString()}`)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      // Fetch publishing queue
      const { data: publishingQueue, error: queueError } = await supabase
        .from('publishing_queue')
        .select(`
          *,
          posts (*)
        `)
        .gte('scheduled_for', rangeStart.toISOString())
        .lte('scheduled_for', rangeEnd.toISOString())
        .order('scheduled_for', { ascending: true });

      if (queueError) {
        console.error('Error fetching publishing queue:', queueError);
        // Don't fail completely if queue fetch fails
      }

      // Convert data to calendar events
      const calendarEvents = convertToCalendarEvents(posts || [], publishingQueue || [], filters);
      setEvents(calendarEvents);

    } catch (err: any) {
      console.error('Unexpected error fetching calendar data:', err);
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: 'Failed to load calendar',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getViewDateRange = (date: Date, viewType: string) => {
    const start = new Date(date);
    const end = new Date(date);

    switch (viewType) {
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  };

  const convertToCalendarEvents = (
    posts: Post[], 
    publishingQueue: any[], 
    currentFilters: CalendarFilters
  ): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Add posts as events
    if (currentFilters.showPosts) {
      posts.forEach(post => {
        const eventDate = new Date(post.scheduled_at || post.created_at || new Date());
        
        events.push({
          id: `post-${post.id}`,
          title: post.title || 'Untitled Post',
          start: eventDate,
          end: new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 min duration
          type: 'post',
          status: post.status || 'draft',
          post,
          color: getEventColor('post', post.status || 'draft'),
        });
      });
    }

    // Add publishing queue items as events
    if (currentFilters.showScheduled || currentFilters.showPublished) {
      publishingQueue.forEach(queueItem => {
        const shouldShow = (
          (currentFilters.showScheduled && queueItem.status === 'scheduled') ||
          (currentFilters.showPublished && queueItem.status === 'published')
        );

        if (shouldShow) {
          const eventDate = new Date(queueItem.scheduled_for);
          
          events.push({
            id: `queue-${queueItem.id}`,
            title: queueItem.posts?.title || 'Scheduled Post',
            start: eventDate,
            end: new Date(eventDate.getTime() + 15 * 60 * 1000), // 15 min duration
            type: queueItem.status === 'published' ? 'published' : 'scheduled',
            status: queueItem.status || 'scheduled',
            queueItem,
            post: queueItem.posts,
            color: getEventColor('queue', queueItem.status || 'scheduled'),
          });
        }
      });
    }

    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const getEventColor = (type: string, status: string): string => {
    switch (type) {
      case 'post':
        switch (status) {
          case 'published': return '#10b981'; // green
          case 'scheduled': return '#3b82f6'; // blue
          case 'draft': return '#6b7280'; // gray
          default: return '#6b7280';
        }
      case 'queue':
        switch (status) {
          case 'published': return '#059669'; // dark green
          case 'scheduled': return '#2563eb'; // dark blue
          case 'failed': return '#dc2626'; // red
          default: return '#6b7280';
        }
      default:
        return '#6b7280';
    }
  };

  const schedulePost = async (postId: string, date: Date, platforms: string[]): Promise<boolean> => {
    try {
      // This would integrate with the publishing system
      // For now, we'll update the post's scheduled_at field
      const { error } = await supabase
        .from('posts')
        .update({ 
          scheduled_at: date.toISOString(),
          status: 'scheduled' 
        })
        .eq('id', postId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error scheduling post:', error);
        toast({
          title: 'Failed to schedule post',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Post scheduled',
        description: `Post scheduled for ${date.toLocaleString()}.`,
      });

      await fetchCalendarData(); // Refresh calendar
      return true;
    } catch (err: any) {
      console.error('Unexpected error scheduling post:', err);
      toast({
        title: 'Failed to schedule post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const reschedulePost = async (queueId: string, newDate: Date): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('publishing_queue')
        .update({ scheduled_for: newDate.toISOString() })
        .eq('id', queueId);

      if (error) {
        console.error('Error rescheduling post:', error);
        toast({
          title: 'Failed to reschedule post',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Post rescheduled',
        description: `Post rescheduled to ${newDate.toLocaleString()}.`,
      });

      await fetchCalendarData(); // Refresh calendar
      return true;
    } catch (err: any) {
      console.error('Unexpected error rescheduling post:', err);
      toast({
        title: 'Failed to reschedule post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unschedulePost = async (queueId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('publishing_queue')
        .delete()
        .eq('id', queueId);

      if (error) {
        console.error('Error unscheduling post:', error);
        toast({
          title: 'Failed to unschedule post',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Post unscheduled',
        description: 'Post has been removed from the schedule.',
      });

      await fetchCalendarData(); // Refresh calendar
      return true;
    } catch (err: any) {
      console.error('Unexpected error unscheduling post:', err);
      toast({
        title: 'Failed to unschedule post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter(event => 
      event.start >= startOfDay && event.start <= endOfDay
    );
  };

  const getEventsForDateRange = (start: Date, end: Date): CalendarEvent[] => {
    return events.filter(event => 
      event.start >= start && event.start <= end
    );
  };

  const updateFilters = (newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchCalendarData();
  }, [user, currentDate, view]);

  useEffect(() => {
    // Re-filter events when filters change
    fetchCalendarData();
  }, [filters]);

  return {
    events,
    currentDate,
    view,
    filters,
    isLoading,
    error,
    setCurrentDate,
    setView,
    setFilters: updateFilters,
    schedulePost,
    reschedulePost,
    unschedulePost,
    getEventsForDate,
    getEventsForDateRange,
    refreshCalendar: fetchCalendarData,
  };
};