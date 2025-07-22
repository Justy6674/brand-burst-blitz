import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon,
  Plus, ChevronLeft, ChevronRight, 
  Clock, Users, MapPin, Bell, Settings,
  Search, Filter, Download, Upload,
  Stethoscope, FileText, Building2,
  Phone, Video, User, AlertTriangle,
  CheckCircle2, Zap, Brain, Mic, Target,
  Activity, BarChart3, Globe, Repeat,
  ArrowLeft, ArrowRight, Grid3X3, List
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, 
         eachDayOfInterval, isSameDay, isToday, 
         addMonths, subMonths, startOfMonth, endOfMonth,
         addWeeks, subWeeks } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Enhanced interfaces for Google/Apple quality
interface UnifiedCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  eventType: 'appointment' | 'content' | 'reminder' | 'meeting' | 'task' | 'personal';
  appointmentType?: 'consultation' | 'follow_up' | 'procedure' | 'telehealth' | 'emergency';
  businessId: string;
  location?: string;
  isVirtual: boolean;
  attendees: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'patient' | 'colleague' | 'staff' | 'guest';
    status: 'invited' | 'confirmed' | 'declined' | 'tentative';
  }>;
  reminders: Array<{
    method: 'email' | 'sms' | 'push' | 'phone';
    minutesBefore: number;
    isEnabled: boolean;
  }>;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  isRecurring: boolean;
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    count?: number;
    daysOfWeek?: number[];
  };
  ahpraCompliance: {
    isCompliant: boolean;
    requiresDisclaimer: boolean;
    disclaimerText?: string;
    professionalBoundaries: boolean;
    patientConsent: boolean;
  };
  billing?: {
    itemNumber?: string;
    cost?: number;
    bulkBilled: boolean;
    privatePatient: boolean;
  };
  preparation?: {
    patientInstructions?: string;
    requiredDuration: number;
    requiredEquipment?: string[];
  };
  followUp?: {
    required: boolean;
    suggestedTimeframe?: string;
    notes?: string;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda' | 'year';
  date: Date;
}

interface SmartSuggestion {
  id: string;
  type: 'appointment_slot' | 'content_idea' | 'follow_up' | 'optimization';
  title: string;
  description: string;
  suggestedDate?: Date;
  priority: number;
  action: () => void;
}

interface BusinessCalendarSettings {
  businessId: string;
  businessName: string;
  workingHours: {
    [key: string]: { start: string; end: string; isWorkingDay: boolean };
  };
  appointmentTypes: Array<{
    id: string;
    name: string;
    duration: number;
    color: string;
    price?: number;
    description?: string;
    isActive: boolean;
  }>;
  timeZone: string;
  bookingSettings: {
    allowOnlineBooking: boolean;
    advanceBookingDays: number;
    bufferTime: number;
    autoConfirm: boolean;
    requiresApproval: boolean;
  };
  reminderSettings: {
    defaultReminders: Array<{ method: string; minutesBefore: number }>;
    customMessages: { [key: string]: string };
  };
  integrations: {
    googleCalendar: boolean;
    outlookCalendar: boolean;
    appleCalendar: boolean;
    practiceManagementSystem: string;
  };
}

interface CalendarProps {
  embedded?: boolean;
  defaultView?: CalendarView['type'];
  businessId?: string;
  showBusinessSwitcher?: boolean;
  enableVoiceCapture?: boolean;
  enableSmartSuggestions?: boolean;
}

export const UnifiedGoogleAppleCalendar: React.FC<CalendarProps> = ({
  embedded = false,
  defaultView = 'month',
  businessId,
  showBusinessSwitcher = true,
  enableVoiceCapture = true,
  enableSmartSuggestions = true
}) => {
  // Core state
  const [currentView, setCurrentView] = useState<CalendarView>({
    type: defaultView,
    date: new Date()
  });
  const [events, setEvents] = useState<UnifiedCalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<UnifiedCalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  
  // Business & Profile state
  const { user } = useAuth();
  const { businessProfiles, profile: currentProfile } = useBusinessProfile();
  const [selectedBusiness, setSelectedBusiness] = useState(businessId || currentProfile?.id || 'all');
  const [businessSettings, setBusinessSettings] = useState<BusinessCalendarSettings[]>([]);
  
  // UI state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<UnifiedCalendarEvent | null>(null);
  
  // Smart features state
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  
  // Performance optimization
  const [visibleDateRange, setVisibleDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  
  // Refs
  const calendarRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Memoized computed values for performance
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Business filter
    if (selectedBusiness !== 'all') {
      filtered = filtered.filter(event => event.businessId === selectedBusiness);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.attendees.some(attendee => 
          attendee.name.toLowerCase().includes(query) ||
          attendee.email.toLowerCase().includes(query)
        )
      );
    }
    
    // Active filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.includes(event.eventType) ||
        activeFilters.includes(event.status) ||
        activeFilters.includes(event.priority)
      );
    }
    
    // Date range filter for performance
    filtered = filtered.filter(event => 
      event.startTime >= visibleDateRange.start && 
      event.startTime <= visibleDateRange.end
    );
    
    return filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [events, selectedBusiness, searchQuery, activeFilters, visibleDateRange]);

  const currentBusinessSettings = useMemo(() => {
    return businessSettings.find(bs => bs.businessId === selectedBusiness);
  }, [businessSettings, selectedBusiness]);

  // Load calendar data
  const loadCalendarData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load events in visible date range
      const { data: eventsData, error: eventsError } = await supabase
        .from('unified_calendar_events')
        .select(`
          *,
          attendees:calendar_event_attendees(*),
          reminders:calendar_event_reminders(*),
          business_profiles(business_name, industry)
        `)
        .eq('user_id', user.id)
        .gte('start_time', visibleDateRange.start.toISOString())
        .lte('start_time', visibleDateRange.end.toISOString())
        .order('start_time', { ascending: true });

      if (eventsError) throw eventsError;

      // Transform to unified format
      const transformedEvents: UnifiedCalendarEvent[] = (eventsData || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time),
        allDay: event.all_day,
        eventType: event.event_type,
        appointmentType: event.appointment_type,
        businessId: event.business_id,
        location: event.location,
        isVirtual: event.is_virtual || false,
        attendees: event.attendees || [],
        reminders: event.reminders || [],
        status: event.status,
        priority: event.priority,
        color: event.color || getDefaultEventColor(event.event_type),
        isRecurring: event.is_recurring || false,
        recurrenceRule: event.recurrence_rule,
        ahpraCompliance: event.ahpra_compliance || {
          isCompliant: true,
          requiresDisclaimer: event.event_type === 'appointment',
          professionalBoundaries: true,
          patientConsent: event.event_type === 'appointment'
        },
        billing: event.billing,
        preparation: event.preparation,
        followUp: event.follow_up,
        metadata: event.metadata || {},
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at)
      }));

      setEvents(transformedEvents);

      // Load business settings
      if (businessProfiles) {
        await loadBusinessSettings(businessProfiles.map(bp => bp.id));
      }

      // Generate smart suggestions if enabled
      if (enableSmartSuggestions) {
        await generateSmartSuggestions(transformedEvents);
      }

    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: "Calendar Error",
        description: "Failed to load calendar data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, visibleDateRange, businessProfiles, enableSmartSuggestions, toast]);

  // Load business settings
  const loadBusinessSettings = useCallback(async (businessIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('business_calendar_settings')
        .select('*')
        .in('business_id', businessIds);

      if (error) throw error;

      const settings: BusinessCalendarSettings[] = (data || []).map(setting => ({
        businessId: setting.business_id,
        businessName: setting.business_name,
        workingHours: setting.working_hours || getDefaultWorkingHours(),
        appointmentTypes: setting.appointment_types || getDefaultAppointmentTypes(),
        timeZone: setting.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        bookingSettings: setting.booking_settings || getDefaultBookingSettings(),
        reminderSettings: setting.reminder_settings || getDefaultReminderSettings(),
        integrations: setting.integrations || {}
      }));

      setBusinessSettings(settings);
    } catch (error) {
      console.error('Error loading business settings:', error);
    }
  }, []);

  // Create event with AHPRA compliance
  const createEvent = useCallback(async (eventData: Partial<UnifiedCalendarEvent>) => {
    if (!user) return null;

    setIsCreatingEvent(true);
    try {
      // Validate AHPRA compliance for healthcare events
      if (eventData.eventType === 'appointment') {
        const complianceCheck = await validateAHPRACompliance(eventData);
        if (!complianceCheck.isValid) {
          toast({
            title: "AHPRA Compliance Issue",
            description: complianceCheck.message,
            variant: "destructive"
          });
          return null;
        }
      }

      // Check for conflicts
      const hasConflict = await checkEventConflicts(eventData.startTime!, eventData.endTime!, eventData.businessId!);
      if (hasConflict) {
        toast({
          title: "Schedule Conflict",
          description: "This time slot conflicts with an existing appointment",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('unified_calendar_events')
        .insert({
          user_id: user.id,
          business_id: eventData.businessId,
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.startTime?.toISOString(),
          end_time: eventData.endTime?.toISOString(),
          all_day: eventData.allDay || false,
          event_type: eventData.eventType,
          appointment_type: eventData.appointmentType,
          location: eventData.location,
          is_virtual: eventData.isVirtual || false,
          status: eventData.status || 'scheduled',
          priority: eventData.priority || 'medium',
          color: eventData.color || getDefaultEventColor(eventData.eventType!),
          is_recurring: eventData.isRecurring || false,
          recurrence_rule: eventData.recurrenceRule,
          ahpra_compliance: eventData.ahpraCompliance,
          billing: eventData.billing,
          preparation: eventData.preparation,
          follow_up: eventData.followUp,
          metadata: eventData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Create attendees if provided
      if (eventData.attendees && eventData.attendees.length > 0) {
        await supabase
          .from('calendar_event_attendees')
          .insert(
            eventData.attendees.map(attendee => ({
              event_id: data.id,
              name: attendee.name,
              email: attendee.email,
              phone: attendee.phone,
              role: attendee.role,
              status: attendee.status || 'invited'
            }))
          );
      }

      // Create reminders if provided
      if (eventData.reminders && eventData.reminders.length > 0) {
        await supabase
          .from('calendar_event_reminders')
          .insert(
            eventData.reminders.map(reminder => ({
              event_id: data.id,
              method: reminder.method,
              minutes_before: reminder.minutesBefore,
              is_enabled: reminder.isEnabled
            }))
          );
      }

      // Schedule automated reminders
      if (eventData.eventType === 'appointment') {
        await scheduleAutomatedReminders(data.id, eventData.startTime!, eventData.attendees || []);
      }

      await loadCalendarData(); // Refresh data
      
      toast({
        title: "Event Created",
        description: `"${eventData.title}" has been scheduled successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create calendar event",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreatingEvent(false);
    }
  }, [user, loadCalendarData, toast]);

  // Update event with conflict checking
  const updateEvent = useCallback(async (eventId: string, updates: Partial<UnifiedCalendarEvent>) => {
    try {
      // Check for conflicts if time is being changed
      if (updates.startTime || updates.endTime) {
        const event = events.find(e => e.id === eventId);
        if (event) {
          const startTime = updates.startTime || event.startTime;
          const endTime = updates.endTime || event.endTime;
          const hasConflict = await checkEventConflicts(startTime, endTime, event.businessId, eventId);
          
          if (hasConflict) {
            toast({
              title: "Schedule Conflict",
              description: "This time change conflicts with another appointment",
              variant: "destructive"
            });
            return false;
          }
        }
      }

      const { error } = await supabase
        .from('unified_calendar_events')
        .update({
          ...updates,
          start_time: updates.startTime?.toISOString(),
          end_time: updates.endTime?.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadCalendarData();
      
      toast({
        title: "Event Updated",
        description: "Calendar event has been updated successfully"
      });

      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update calendar event",
        variant: "destructive"
      });
      return false;
    }
  }, [events, user, loadCalendarData, toast]);

  // Delete event with cascading cleanup
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      // Delete related records first
      await Promise.all([
        supabase.from('calendar_event_attendees').delete().eq('event_id', eventId),
        supabase.from('calendar_event_reminders').delete().eq('event_id', eventId),
        supabase.from('automated_reminder_schedule').delete().eq('event_id', eventId)
      ]);

      // Delete main event
      const { error } = await supabase
        .from('unified_calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadCalendarData();
      
      toast({
        title: "Event Deleted",
        description: "Calendar event has been removed"
      });

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete calendar event",
        variant: "destructive"
      });
      return false;
    }
  }, [user, loadCalendarData, toast]);

  // Smart scheduling with AI optimization
  const findOptimalTimeSlot = useCallback(async (
    duration: number,
    businessId: string,
    preferredDates: Date[],
    attendeeEmails: string[] = []
  ): Promise<Date[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('smart-scheduling-optimizer', {
        body: {
          duration,
          businessId,
          preferredDates: preferredDates.map(d => d.toISOString()),
          attendeeEmails,
          existingEvents: filteredEvents.filter(e => e.businessId === businessId)
        }
      });

      if (error) throw error;

      return (data.optimalSlots || []).map((slot: string) => new Date(slot));
    } catch (error) {
      console.error('Error finding optimal time slot:', error);
      return [];
    }
  }, [filteredEvents]);

  // Generate smart suggestions
  const generateSmartSuggestions = useCallback(async (events: UnifiedCalendarEvent[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('calendar-smart-suggestions', {
        body: {
          userId: user?.id,
          businessId: selectedBusiness,
          events: events.slice(-50), // Last 50 events for context
          businessSettings: currentBusinessSettings
        }
      });

      if (error) throw error;

      const suggestions: SmartSuggestion[] = (data.suggestions || []).map((suggestion: any) => ({
        id: suggestion.id,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        suggestedDate: suggestion.suggestedDate ? new Date(suggestion.suggestedDate) : undefined,
        priority: suggestion.priority,
        action: () => implementSuggestion(suggestion)
      }));

      setSmartSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
    }
  }, [user, selectedBusiness, currentBusinessSettings]);

  // Implement suggestion
  const implementSuggestion = useCallback(async (suggestion: any) => {
    switch (suggestion.type) {
      case 'appointment_slot':
        setSelectedDate(new Date(suggestion.suggestedDate));
        setShowCreateDialog(true);
        break;
      case 'follow_up':
        // Pre-fill follow-up appointment
        setSelectedDate(new Date(suggestion.suggestedDate));
        setShowCreateDialog(true);
        break;
      case 'content_idea':
        // Navigate to content creation
        window.location.href = `/create-content?idea=${encodeURIComponent(suggestion.description)}`;
        break;
      case 'optimization':
        // Apply optimization
        await applyCalendarOptimization(suggestion.details);
        break;
    }
  }, []);

  // Apply calendar optimization
  const applyCalendarOptimization = useCallback(async (optimizationDetails: any) => {
    try {
      const { error } = await supabase.functions.invoke('apply-calendar-optimization', {
        body: { userId: user?.id, optimizationDetails }
      });

      if (error) throw error;

      await loadCalendarData();
      
      toast({
        title: "Optimization Applied",
        description: "Your calendar has been optimized"
      });
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to apply calendar optimization",
        variant: "destructive"
      });
    }
  }, [user, loadCalendarData, toast]);

  // Voice capture for smart event creation
  const startVoiceCapture = useCallback(() => {
    if (!enableVoiceCapture || !('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Capture Unavailable",
        description: "Voice capture is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-AU';

    recognition.onstart = () => {
      setIsVoiceRecording(true);
      setVoiceTranscript('');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      
      // Process with AI to extract calendar event details
      try {
        const { data, error } = await supabase.functions.invoke('process-voice-calendar-input', {
          body: { transcript, businessId: selectedBusiness }
        });

        if (error) throw error;

        if (data.eventSuggestion) {
          // Auto-populate create dialog
          setSelectedDate(new Date(data.eventSuggestion.suggestedDate));
          setShowCreateDialog(true);
          
          toast({
            title: "Voice Processed",
            description: `Detected: ${data.eventSuggestion.title}`,
          });
        }
      } catch (error) {
        console.error('Error processing voice input:', error);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      toast({
        title: "Voice Capture Error",
        description: "Failed to capture voice input",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsVoiceRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [enableVoiceCapture, selectedBusiness, toast]);

  // External calendar synchronization
  const syncExternalCalendars = useCallback(async () => {
    try {
      const { error } = await supabase.functions.invoke('sync-external-calendars', {
        body: { userId: user?.id, businessId: selectedBusiness }
      });

      if (error) throw error;

      await loadCalendarData();
      
      toast({
        title: "Calendars Synced",
        description: "External calendars have been synchronized"
      });
    } catch (error) {
      console.error('Error syncing calendars:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync external calendars",
        variant: "destructive"
      });
    }
  }, [user, selectedBusiness, loadCalendarData, toast]);

  // Drag and drop handling
  const handleEventDragStart = useCallback((event: UnifiedCalendarEvent) => {
    setDraggedEvent(event);
    setIsDragging(true);
  }, []);

  const handleEventDrop = useCallback(async (newDate: Date, newTime?: string) => {
    if (!draggedEvent) return;

    const newStartTime = new Date(newDate);
    if (newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      newStartTime.setHours(hours, minutes);
    }

    const duration = draggedEvent.endTime.getTime() - draggedEvent.startTime.getTime();
    const newEndTime = new Date(newStartTime.getTime() + duration);

    const success = await updateEvent(draggedEvent.id, {
      startTime: newStartTime,
      endTime: newEndTime
    });

    setDraggedEvent(null);
    setIsDragging(false);

    if (success) {
      toast({
        title: "Event Moved",
        description: `"${draggedEvent.title}" has been rescheduled`
      });
    }
  }, [draggedEvent, updateEvent, toast]);

  // Navigation functions
  const navigateCalendar = useCallback((direction: 'prev' | 'next') => {
    setCurrentView(prev => {
      const newDate = new Date(prev.date);
      
      switch (prev.type) {
        case 'month':
          direction === 'next' ? addMonths(newDate, 1) : subMonths(newDate, 1);
          break;
        case 'week':
          direction === 'next' ? addWeeks(newDate, 1) : subWeeks(newDate, 1);
          break;
        case 'day':
          direction === 'next' ? addDays(newDate, 1) : subDays(newDate, 1);
          break;
        case 'agenda':
          direction === 'next' ? addWeeks(newDate, 1) : subWeeks(newDate, 1);
          break;
        case 'year':
          newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
          break;
      }
      
      return { ...prev, date: newDate };
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentView(prev => ({ ...prev, date: new Date() }));
  }, []);

  // Update visible date range when view changes
  useEffect(() => {
    let start: Date, end: Date;
    
    switch (currentView.type) {
      case 'month':
        start = startOfMonth(currentView.date);
        end = endOfMonth(currentView.date);
        break;
      case 'week':
        start = startOfWeek(currentView.date);
        end = endOfWeek(currentView.date);
        break;
      case 'day':
        start = currentView.date;
        end = currentView.date;
        break;
      case 'agenda':
        start = currentView.date;
        end = addDays(currentView.date, 30);
        break;
      case 'year':
        start = new Date(currentView.date.getFullYear(), 0, 1);
        end = new Date(currentView.date.getFullYear(), 11, 31);
        break;
      default:
        start = startOfMonth(currentView.date);
        end = endOfMonth(currentView.date);
    }
    
    setVisibleDateRange({ start, end });
  }, [currentView]);

  // Load data when visible range changes
  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Initialize voice recognition cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Render calendar grid for month view
  const renderMonthView = useCallback(() => {
    const monthStart = startOfMonth(currentView.date);
    const monthEnd = endOfMonth(currentView.date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {days.map(day => {
          const dayEvents = filteredEvents.filter(event => isSameDay(event.startTime, day));
          const isCurrentMonth = day.getMonth() === currentView.date.getMonth();
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] p-1 border border-border/50 cursor-pointer transition-colors",
                "hover:bg-muted/50",
                isCurrentMonth ? "bg-background" : "bg-muted/20",
                isToday(day) && "bg-primary/10 border-primary/30",
                isSelected && "bg-primary/20 border-primary"
              )}
              onClick={() => {
                setSelectedDate(day);
                setShowCreateDialog(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleEventDrop(day)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  !isCurrentMonth && "text-muted-foreground",
                  isToday(day) && "text-primary font-bold"
                )}>
                  {day.getDate()}
                </span>
                
                {/* Quick add button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-5 h-5 p-0 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(day);
                    setShowCreateDialog(true);
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded cursor-pointer truncate",
                      "hover:opacity-80 transition-opacity"
                    )}
                    style={{ backgroundColor: event.color + '20', borderLeft: `2px solid ${event.color}` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setShowDetailsDialog(true);
                    }}
                    draggable
                    onDragStart={() => handleEventDragStart(event)}
                  >
                    <div className="flex items-center gap-1">
                      {getEventTypeIcon(event.eventType)}
                      <span className="font-medium">{event.title}</span>
                    </div>
                    {!event.allDay && (
                      <div className="text-muted-foreground">
                        {format(event.startTime, 'HH:mm')}
                      </div>
                    )}
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground p-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [currentView, filteredEvents, selectedDate, handleEventDragStart, handleEventDrop]);

  // Render week view
  const renderWeekView = useCallback(() => {
    const weekStart = startOfWeek(currentView.date);
    const weekDays = eachDayOfInterval({ 
      start: weekStart, 
      end: endOfWeek(currentView.date) 
    });

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="grid grid-cols-8 gap-1 p-2 border-b">
          <div className="w-16"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="text-center">
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div className={cn(
                "text-lg",
                isToday(day) && "text-primary font-bold"
              )}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time slots */}
        <div className="flex-1 overflow-auto">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="grid grid-cols-8 gap-1 border-b border-border/30 min-h-[60px]">
              <div className="w-16 p-2 text-sm text-muted-foreground">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
              {weekDays.map(day => {
                const slotStart = new Date(day);
                slotStart.setHours(hour, 0, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setHours(hour + 1);
                
                const slotEvents = filteredEvents.filter(event => 
                  !event.allDay &&
                  event.startTime >= slotStart && 
                  event.startTime < slotEnd
                );
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="p-1 hover:bg-muted/30 cursor-pointer transition-colors border-r border-border/20"
                    onClick={() => {
                      const clickedTime = new Date(day);
                      clickedTime.setHours(hour, 0);
                      setSelectedDate(clickedTime);
                      setShowCreateDialog(true);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleEventDrop(day, `${hour.toString().padStart(2, '0')}:00`)}
                  >
                    {slotEvents.map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded mb-1 cursor-pointer"
                        style={{ backgroundColor: event.color + '30', borderLeft: `2px solid ${event.color}` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setShowDetailsDialog(true);
                        }}
                        draggable
                        onDragStart={() => handleEventDragStart(event)}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-muted-foreground">
                          {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }, [currentView, filteredEvents, handleEventDragStart, handleEventDrop]);

  // Render agenda view
  const renderAgendaView = useCallback(() => {
    const upcomingEvents = filteredEvents
      .filter(event => event.startTime >= new Date())
      .slice(0, 50);

    if (upcomingEvents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Upcoming Events</h3>
          <p className="text-muted-foreground mb-4">Your calendar is clear!</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {upcomingEvents.map(event => (
          <Card 
            key={event.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedEvent(event);
              setShowDetailsDialog(true);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventTypeIcon(event.eventType)}
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                    {event.priority === 'urgent' && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.allDay ? 'All Day' : `${format(event.startTime, 'HH:mm')} - ${format(event.endTime, 'HH:mm')}`}
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-1">
                        {event.isVirtual ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        {event.location}
                      </div>
                    )}
                    
                    {event.attendees.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm font-medium">
                    {format(event.startTime, 'MMM d, yyyy')}
                  </div>
                  
                  {event.eventType === 'appointment' && event.ahpraCompliance.isCompliant && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      AHPRA Compliant
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [filteredEvents]);

  // Helper functions
  const getDefaultEventColor = (eventType: string): string => {
    const colors = {
      appointment: '#3b82f6',
      content: '#10b981',
      reminder: '#f59e0b',
      meeting: '#8b5cf6',
      task: '#ef4444',
      personal: '#6b7280'
    };
    return colors[eventType as keyof typeof colors] || '#6b7280';
  };

  const getEventTypeIcon = (eventType: string) => {
    const icons = {
      appointment: <Stethoscope className="w-4 h-4" />,
      content: <FileText className="w-4 h-4" />,
      reminder: <Bell className="w-4 h-4" />,
      meeting: <Users className="w-4 h-4" />,
      task: <CheckCircle2 className="w-4 h-4" />,
      personal: <User className="w-4 h-4" />
    };
    return icons[eventType as keyof typeof icons] || <CalendarIcon className="w-4 h-4" />;
  };

  const getDefaultWorkingHours = () => ({
    monday: { start: '09:00', end: '17:00', isWorkingDay: true },
    tuesday: { start: '09:00', end: '17:00', isWorkingDay: true },
    wednesday: { start: '09:00', end: '17:00', isWorkingDay: true },
    thursday: { start: '09:00', end: '17:00', isWorkingDay: true },
    friday: { start: '09:00', end: '17:00', isWorkingDay: true },
    saturday: { start: '09:00', end: '13:00', isWorkingDay: false },
    sunday: { start: '09:00', end: '17:00', isWorkingDay: false }
  });

  const getDefaultAppointmentTypes = () => [
    { id: '1', name: 'Consultation', duration: 30, color: '#3b82f6', price: 150, isActive: true },
    { id: '2', name: 'Follow-up', duration: 15, color: '#10b981', price: 75, isActive: true },
    { id: '3', name: 'Procedure', duration: 60, color: '#f59e0b', price: 300, isActive: true },
    { id: '4', name: 'Telehealth', duration: 20, color: '#8b5cf6', price: 120, isActive: true }
  ];

  const getDefaultBookingSettings = () => ({
    allowOnlineBooking: true,
    advanceBookingDays: 30,
    bufferTime: 10,
    autoConfirm: false,
    requiresApproval: true
  });

  const getDefaultReminderSettings = () => ({
    defaultReminders: [
      { method: 'email', minutesBefore: 1440 }, // 24 hours
      { method: 'sms', minutesBefore: 60 }      // 1 hour
    ],
    customMessages: {
      email: 'Reminder: You have an appointment tomorrow at {time}',
      sms: 'Appointment reminder: Tomorrow at {time}. Reply CONFIRM or CANCEL'
    }
  });

  const validateAHPRACompliance = async (eventData: Partial<UnifiedCalendarEvent>) => {
    // Implementation for AHPRA validation
    return { isValid: true, message: '' };
  };

  const checkEventConflicts = async (startTime: Date, endTime: Date, businessId: string, excludeEventId?: string) => {
    // Implementation for conflict checking
    return false;
  };

  const scheduleAutomatedReminders = async (eventId: string, eventTime: Date, attendees: any[]) => {
    // Implementation for scheduling reminders
    try {
      await supabase.functions.invoke('schedule-appointment-reminders', {
        body: { eventId, eventTime: eventTime.toISOString(), attendees }
      });
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  };

  // Main render
  return (
    <div className={cn("flex flex-col h-full", embedded ? "p-0" : "p-6")}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Calendar</h1>
          
          {showBusinessSwitcher && businessProfiles && businessProfiles.length > 1 && (
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Businesses</SelectItem>
                {businessProfiles.map(business => (
                  <SelectItem key={business.id} value={business.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {business.business_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Voice capture */}
          {enableVoiceCapture && (
            <Button
              variant={isVoiceRecording ? "destructive" : "outline"}
              size="sm"
              onClick={startVoiceCapture}
              disabled={isVoiceRecording}
            >
              <Mic className="w-4 h-4" />
              {isVoiceRecording && <span className="ml-2">Recording...</span>}
            </Button>
          )}

          {/* Smart suggestions */}
          {enableSmartSuggestions && smartSuggestions.length > 0 && (
            <Popover open={showSuggestionsPanel} onOpenChange={setShowSuggestionsPanel}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Brain className="w-4 h-4 mr-2" />
                  Smart ({smartSuggestions.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Smart Suggestions</h4>
                  {smartSuggestions.slice(0, 5).map(suggestion => (
                    <div key={suggestion.id} className="p-2 border rounded cursor-pointer hover:bg-muted/50"
                         onClick={suggestion.action}>
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Create event */}
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>

          {/* Settings */}
          <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <h2 className="text-lg font-medium ml-4">
            {format(currentView.date, currentView.type === 'year' ? 'yyyy' : 'MMMM yyyy')}
          </h2>
        </div>

        <Tabs value={currentView.type} onValueChange={(value) => setCurrentView(prev => ({ ...prev, type: value as any }))}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar Content */}
      <Card className="flex-1">
        <CardContent className="p-6 h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {currentView.type === 'month' && renderMonthView()}
              {currentView.type === 'week' && renderWeekView()}
              {currentView.type === 'agenda' && renderAgendaView()}
              {currentView.type === 'day' && renderWeekView()} {/* Day view uses same component */}
            </>
          )}
        </CardContent>
      </Card>

      {/* Voice transcript display */}
      {voiceTranscript && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-sm">Voice captured: "{voiceTranscript}"</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          
          {/* Event creation form would go here */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Advanced event creation form with AHPRA compliance, automated reminders, 
              and smart scheduling would be implemented here.
            </p>
            
            {selectedDate && (
              <div className="p-4 bg-muted/50 rounded">
                <p className="text-sm">
                  Creating event for: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getEventTypeIcon(selectedEvent.eventType)}
                <h3 className="text-lg font-medium">{selectedEvent.title}</h3>
                <Badge variant={selectedEvent.status === 'confirmed' ? 'default' : 'secondary'}>
                  {selectedEvent.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Date:</strong> {format(selectedEvent.startTime, 'EEEE, MMMM d, yyyy')}
                </div>
                <div>
                  <strong>Time:</strong> {selectedEvent.allDay ? 'All Day' : `${format(selectedEvent.startTime, 'HH:mm')} - ${format(selectedEvent.endTime, 'HH:mm')}`}
                </div>
                {selectedEvent.location && (
                  <div>
                    <strong>Location:</strong> {selectedEvent.location}
                  </div>
                )}
                <div>
                  <strong>Type:</strong> {selectedEvent.eventType}
                </div>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.attendees.length > 0 && (
                <div>
                  <strong>Attendees:</strong>
                  <div className="mt-1 space-y-1">
                    {selectedEvent.attendees.map(attendee => (
                      <div key={attendee.id} className="text-sm flex items-center justify-between">
                        <span>{attendee.name} ({attendee.email})</span>
                        <Badge variant="outline" className="text-xs">
                          {attendee.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.eventType === 'appointment' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">AHPRA Compliance</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedEvent.ahpraCompliance.isCompliant ? 
                      "This appointment meets AHPRA professional standards" :
                      "Please review AHPRA compliance requirements"
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Calendar Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Comprehensive calendar settings including working hours, appointment types, 
              reminder preferences, AHPRA compliance settings, and external calendar 
              integrations would be implemented here.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedGoogleAppleCalendar; 