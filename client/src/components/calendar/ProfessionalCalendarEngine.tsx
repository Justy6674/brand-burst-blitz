import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { SmartIdeasSketchboard } from './SmartIdeasSketchboard';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { supabase } from '../../integrations/supabase/client';
import { 
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Grid3X3,
  List,
  Clock,
  Users,
  Search,
  Filter,
  Settings,
  Download,
  Upload,
  Zap,
  Brain,
  Building2,
  Stethoscope,
  Activity,
  Target,
  Bell,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  Sparkles,
  CalendarDays,
  CalendarX,
  Repeat,
  MapPin,
  Phone,
  Video,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Minimize2,
  Move,
  RotateCcw,
  Save,
  X,
  Heart,
  Star,
  Bookmark,
  Tag,
  Paperclip,
  Link,
  ExternalLink,
  Palette,
  MousePointer,
  Grab,
  GripVertical
} from 'lucide-react';
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth,
  addWeeks, 
  subWeeks,
  addHours,
  startOfDay,
  endOfDay,
  parseISO,
  differenceInMinutes,
  isSameMonth,
  getDay,
  addMinutes
} from 'date-fns';
import { cn } from '../../lib/utils';

// Professional Calendar Event Interface - Google/Apple Quality
interface ProfessionalCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  
  // Healthcare-specific properties
  practiceId: string;
  practiceColor: string;
  eventType: 'content_creation' | 'social_post' | 'blog_article' | 'patient_education' | 'appointment' | 'campaign' | 'compliance_review' | 'team_meeting' | 'smart_capture';
  platform?: 'facebook' | 'instagram' | 'linkedin' | 'all' | 'blog' | 'email';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // AI & Content properties
  aiGenerated: boolean;
  complianceScore?: number;
  ahpraCompliant: boolean;
  contentType?: 'patient_education' | 'practice_marketing' | 'professional_communication';
  targetAudience?: 'patients' | 'professionals' | 'referrers' | 'community';
  
  // Collaboration & workflow
  assignedTo?: string;
  attendees: string[];
  location?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  reminders: { type: 'email' | 'push' | 'sms'; minutes: number }[];
  
  // Metadata
  tags: string[];
  attachments: { name: string; url: string; type: string }[];
  notes?: string;
  externalId?: string;
  lastModified: Date;
  createdBy: string;
  
  // Drag & Drop properties
  isDragging?: boolean;
  isResizing?: boolean;
  dragStartX?: number;
  dragStartY?: number;
}

// Practice Management Interface
interface HealthcarePractice {
  id: string;
  name: string;
  type: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry' | 'pharmacy';
  specialty: string;
  color: string;
  isActive: boolean;
  ahpraNumber?: string;
  settings: {
    workingHours: { start: string; end: string; days: number[] };
    notifications: boolean;
    autoScheduling: boolean;
    complianceLevel: 'basic' | 'advanced' | 'enterprise';
  };
  teamMembers: { id: string; name: string; role: string; permissions: string[] }[];
  integrations: {
    googleCalendar: boolean;
    outlookCalendar: boolean;
    appleCalendar: boolean;
    practiceManagement: string | null;
  };
}

// Calendar View Types
type CalendarView = 'month' | 'week' | 'day' | 'agenda' | 'year';
type CalendarMode = 'calendar' | 'ideas' | 'analytics' | 'settings';

// Smart Suggestions Interface
interface SmartSuggestion {
  id: string;
  type: 'scheduling' | 'content' | 'compliance' | 'automation';
  title: string;
  description: string;
  confidence: number;
  action: () => void;
  priority: 'low' | 'medium' | 'high';
}

interface ProfessionalCalendarEngineProps {
  embedded?: boolean;
  defaultView?: CalendarView;
  defaultPractice?: string;
  showPracticeSwitcher?: boolean;
  enableSmartSuggestions?: boolean;
  enableVoiceCapture?: boolean;
  enableDragDrop?: boolean;
  enableRealTimeSync?: boolean;
  maxEventsPerView?: number;
}

export function ProfessionalCalendarEngine({
  embedded = false,
  defaultView = 'month',
  defaultPractice,
  showPracticeSwitcher = true,
  enableSmartSuggestions = true,
  enableVoiceCapture = true,
  enableDragDrop = true,
  enableRealTimeSync = true,
  maxEventsPerView = 1000
}: ProfessionalCalendarEngineProps) {
  const { user, profile } = useHealthcareAuth();
  const { toast } = useToast();

  // Core Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>(defaultView);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('calendar');
  const [events, setEvents] = useState<ProfessionalCalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ProfessionalCalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ProfessionalCalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Practice Management State
  const [practices, setPractices] = useState<HealthcarePractice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<string>(defaultPractice || 'all');
  const [practiceSettings, setPracticeSettings] = useState<any>({});

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [viewSettings, setViewSettings] = useState({
    showWeekends: true,
    showAllDay: true,
    showPastEvents: false,
    compactMode: false,
    workingHoursOnly: false
  });

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<ProfessionalCalendarEvent | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dropZone, setDropZone] = useState<Date | null>(null);

  // Smart Features State
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // Real-time sync state
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error' | 'offline'>('connected');
  const [pendingChanges, setPendingChanges] = useState<ProfessionalCalendarEvent[]>([]);

  // Refs for performance and interaction
  const calendarRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize calendar data and features
  useEffect(() => {
    initializeCalendar();
    if (enableRealTimeSync) {
      setupRealTimeSync();
    }
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user?.id]);

  // Filter events based on current view and filters
  useEffect(() => {
    filterAndSortEvents();
  }, [events, selectedPractice, activeFilters, searchQuery, currentView, currentDate]);

  // Generate smart suggestions
  useEffect(() => {
    if (enableSmartSuggestions) {
      generateSmartSuggestions();
    }
  }, [events, selectedPractice, currentDate]);

  const initializeCalendar = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Load healthcare practices
      await loadHealthcarePractices();
      
      // Load calendar events
      await loadCalendarEvents();
      
      // Load practice settings
      await loadPracticeSettings();
      
      // Initialize external calendar integrations
      if (enableRealTimeSync) {
        await initializeExternalCalendars();
      }
      
    } catch (error) {
      console.error('Error initializing calendar:', error);
      toast({
        title: "Calendar Load Error",
        description: "Failed to load calendar data. Please refresh and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealthcarePractices = async () => {
    try {
      // For now, create sample practices - in production this would come from database
      const samplePractices: HealthcarePractice[] = [
        {
          id: 'gp-north-sydney',
          name: 'North Sydney GP',
          type: 'gp',
          specialty: 'Family Medicine',
          color: '#3b82f6',
          isActive: true,
          ahpraNumber: 'MED0001234567',
          settings: {
            workingHours: { start: '08:00', end: '18:00', days: [1, 2, 3, 4, 5] },
            notifications: true,
            autoScheduling: true,
            complianceLevel: 'advanced'
          },
          teamMembers: [
            { id: 'dr-smith', name: 'Dr. Sarah Smith', role: 'GP', permissions: ['full'] },
            { id: 'nurse-jones', name: 'Nurse Mary Jones', role: 'Practice Nurse', permissions: ['view', 'create'] }
          ],
          integrations: {
            googleCalendar: true,
            outlookCalendar: false,
            appleCalendar: false,
            practiceManagement: 'Medical Director'
          }
        },
        {
          id: 'allied-physio',
          name: 'Allied Health Physiotherapy',
          type: 'allied_health',
          specialty: 'Physiotherapy',
          color: '#10b981',
          isActive: true,
          ahpraNumber: 'PHY0007654321',
          settings: {
            workingHours: { start: '07:00', end: '19:00', days: [1, 2, 3, 4, 5, 6] },
            notifications: true,
            autoScheduling: false,
            complianceLevel: 'basic'
          },
          teamMembers: [
            { id: 'physio-brown', name: 'David Brown', role: 'Physiotherapist', permissions: ['full'] }
          ],
          integrations: {
            googleCalendar: false,
            outlookCalendar: true,
            appleCalendar: false,
            practiceManagement: null
          }
        },
        {
          id: 'cardiology-specialist',
          name: 'Sydney Cardiology Centre',
          type: 'specialist',
          specialty: 'Cardiology',
          color: '#f59e0b',
          isActive: false,
          ahpraNumber: 'SPC0001111111',
          settings: {
            workingHours: { start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
            notifications: true,
            autoScheduling: true,
            complianceLevel: 'enterprise'
          },
          teamMembers: [
            { id: 'card-wilson', name: 'Dr. Robert Wilson', role: 'Cardiologist', permissions: ['full'] },
            { id: 'admin-taylor', name: 'Lisa Taylor', role: 'Practice Manager', permissions: ['view', 'create', 'edit'] }
          ],
          integrations: {
            googleCalendar: true,
            outlookCalendar: true,
            appleCalendar: true,
            practiceManagement: 'Best Practice'
          }
        }
      ];

      setPractices(samplePractices);
      
      // Set default practice if not specified
      if (!defaultPractice && samplePractices.length > 0) {
        setSelectedPractice(samplePractices[0].id);
      }
      
    } catch (error) {
      console.error('Error loading practices:', error);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      // Load events from database
      const { data: dbEvents, error } = await supabase
        .from('healthcare_calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', subMonths(new Date(), 2).toISOString())
        .lte('start_time', addMonths(new Date(), 6).toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Convert database events to professional calendar events
      const professionalEvents: ProfessionalCalendarEvent[] = (dbEvents || []).map(event => ({
        ...event,
        startTime: parseISO(event.start_time),
        endTime: parseISO(event.end_time),
        lastModified: parseISO(event.updated_at)
      }));

      // Add sample events for demonstration
      const sampleEvents: ProfessionalCalendarEvent[] = [
        {
          id: 'sample-1',
          title: 'Diabetes Patient Education Blog',
          description: 'Complete AHPRA-compliant blog post about diabetes management during holidays',
          startTime: addDays(new Date(), 1),
          endTime: addDays(addHours(new Date(), 2), 1),
          allDay: false,
          practiceId: 'gp-north-sydney',
          practiceColor: '#3b82f6',
          eventType: 'blog_article',
          platform: 'blog',
          priority: 'high',
          status: 'draft',
          aiGenerated: true,
          complianceScore: 95,
          ahpraCompliant: true,
          contentType: 'patient_education',
          targetAudience: 'patients',
          assignedTo: 'dr-smith',
          attendees: [],
          isRecurring: false,
          reminders: [{ type: 'push', minutes: 60 }],
          tags: ['diabetes', 'patient-education', 'holidays'],
          attachments: [],
          lastModified: new Date(),
          createdBy: user?.id || 'system'
        },
        {
          id: 'sample-2',
          title: 'Heart Health Awareness - Instagram Post',
          description: 'February Heart Month social media campaign - Instagram post with AHPRA compliance',
          startTime: addHours(new Date(), 4),
          endTime: addHours(new Date(), 5),
          allDay: false,
          practiceId: 'cardiology-specialist',
          practiceColor: '#f59e0b',
          eventType: 'social_post',
          platform: 'instagram',
          priority: 'medium',
          status: 'scheduled',
          aiGenerated: true,
          complianceScore: 98,
          ahpraCompliant: true,
          contentType: 'practice_marketing',
          targetAudience: 'community',
          assignedTo: 'card-wilson',
          attendees: ['admin-taylor'],
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
          reminders: [{ type: 'email', minutes: 120 }, { type: 'push', minutes: 30 }],
          tags: ['heart-health', 'awareness', 'february', 'social-media'],
          attachments: [{ name: 'heart-infographic.png', url: '/images/heart-infographic.png', type: 'image' }],
          lastModified: new Date(),
          createdBy: user?.id || 'system'
        },
        {
          id: 'sample-3',
          title: 'Physiotherapy Exercise Video - Facebook',
          description: 'Weekly exercise demonstration video for lower back pain management',
          startTime: addDays(new Date(), 3),
          endTime: addDays(addHours(new Date(), 1), 3),
          allDay: false,
          practiceId: 'allied-physio',
          practiceColor: '#10b981',
          eventType: 'content_creation',
          platform: 'facebook',
          priority: 'medium',
          status: 'in_progress',
          aiGenerated: false,
          complianceScore: 92,
          ahpraCompliant: true,
          contentType: 'patient_education',
          targetAudience: 'patients',
          assignedTo: 'physio-brown',
          attendees: [],
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=WE',
          reminders: [{ type: 'push', minutes: 30 }],
          tags: ['physiotherapy', 'exercise', 'lower-back-pain', 'video'],
          attachments: [],
          lastModified: new Date(),
          createdBy: user?.id || 'system'
        }
      ];

      setEvents([...professionalEvents, ...sampleEvents]);
      
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast({
        title: "Events Load Error",
        description: "Some events may not have loaded correctly.",
        variant: "destructive"
      });
    }
  };

  const loadPracticeSettings = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('healthcare_practice_settings')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const settingsMap = (settings || []).reduce((acc, setting) => {
        acc[setting.practice_id] = setting;
        return acc;
      }, {});

      setPracticeSettings(settingsMap);
    } catch (error) {
      console.error('Error loading practice settings:', error);
    }
  };

  const initializeExternalCalendars = async () => {
    try {
      // Initialize Google Calendar integration if enabled
      // Initialize Outlook Calendar integration if enabled
      // Initialize Apple Calendar integration if enabled
      setSyncStatus('connected');
    } catch (error) {
      console.error('Error initializing external calendars:', error);
      setSyncStatus('error');
    }
  };

  const setupRealTimeSync = () => {
    // Set up real-time subscription for calendar events
    const subscription = supabase
      .channel('healthcare_calendar_events')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'healthcare_calendar_events',
          filter: `user_id=eq.${user?.id}`
        }, 
        (payload) => {
          handleRealTimeUpdate(payload);
        }
      )
      .subscribe();

    // Periodic sync for external calendars
    syncIntervalRef.current = setInterval(() => {
      syncExternalCalendars();
    }, 300000); // Sync every 5 minutes

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleRealTimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setSyncStatus('syncing');
    
    try {
      switch (eventType) {
        case 'INSERT':
          const newEvent: ProfessionalCalendarEvent = {
            ...newRecord,
            startTime: parseISO(newRecord.start_time),
            endTime: parseISO(newRecord.end_time),
            lastModified: parseISO(newRecord.updated_at)
          };
          setEvents(prev => [...prev, newEvent]);
          break;
          
        case 'UPDATE':
          const updatedEvent: ProfessionalCalendarEvent = {
            ...newRecord,
            startTime: parseISO(newRecord.start_time),
            endTime: parseISO(newRecord.end_time),
            lastModified: parseISO(newRecord.updated_at)
          };
          setEvents(prev => prev.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
          ));
          break;
          
        case 'DELETE':
          setEvents(prev => prev.filter(event => event.id !== oldRecord.id));
          break;
      }
      
      setLastSyncTime(new Date());
      setSyncStatus('connected');
      
    } catch (error) {
      console.error('Error handling real-time update:', error);
      setSyncStatus('error');
    }
  };

  const syncExternalCalendars = async () => {
    if (syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    
    try {
      // Sync with Google Calendar
      // Sync with Outlook Calendar
      // Sync with Apple Calendar
      
      setSyncStatus('connected');
      setLastSyncTime(new Date());
      
    } catch (error) {
      console.error('Error syncing external calendars:', error);
      setSyncStatus('error');
    }
  };

  const filterAndSortEvents = () => {
    let filtered = [...events];

    // Filter by selected practice
    if (selectedPractice !== 'all') {
      filtered = filtered.filter(event => event.practiceId === selectedPractice);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by active filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(event => {
        return activeFilters.some(filter => {
          switch (filter) {
            case 'high-priority':
              return event.priority === 'high' || event.priority === 'urgent';
            case 'ai-generated':
              return event.aiGenerated;
            case 'compliance-issues':
              return !event.ahpraCompliant || (event.complianceScore && event.complianceScore < 80);
            case 'social-media':
              return ['facebook', 'instagram', 'linkedin'].includes(event.platform || '');
            case 'content-creation':
              return ['content_creation', 'blog_article', 'social_post'].includes(event.eventType);
            case 'recurring':
              return event.isRecurring;
            default:
              return false;
          }
        });
      });
    }

    // Filter by view settings
    if (!viewSettings.showPastEvents) {
      filtered = filtered.filter(event => event.endTime >= new Date());
    }

    if (!viewSettings.showAllDay) {
      filtered = filtered.filter(event => !event.allDay);
    }

    // Filter by current view date range
    const viewRange = getViewDateRange();
    filtered = filtered.filter(event => 
      event.startTime >= viewRange.start && event.startTime <= viewRange.end
    );

    // Sort by start time
    filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Limit events for performance
    if (filtered.length > maxEventsPerView) {
      filtered = filtered.slice(0, maxEventsPerView);
    }

    setFilteredEvents(filtered);
  };

  const getViewDateRange = () => {
    switch (currentView) {
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate)
        };
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        };
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      case 'year':
        return {
          start: new Date(currentDate.getFullYear(), 0, 1),
          end: new Date(currentDate.getFullYear(), 11, 31)
        };
      case 'agenda':
        return {
          start: currentDate,
          end: addDays(currentDate, 30)
        };
      default:
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
    }
  };

  const generateSmartSuggestions = () => {
    const suggestions: SmartSuggestion[] = [];
    
    // Analyze events for smart suggestions
    const upcomingEvents = filteredEvents.filter(event => 
      event.startTime > new Date() && event.startTime <= addDays(new Date(), 7)
    );
    
    const overdueEvents = filteredEvents.filter(event => 
      event.endTime < new Date() && event.status !== 'completed' && event.status !== 'cancelled'
    );
    
    const complianceIssues = filteredEvents.filter(event => 
      !event.ahpraCompliant || (event.complianceScore && event.complianceScore < 80)
    );

    // Scheduling suggestions
    if (upcomingEvents.length > 5) {
      suggestions.push({
        id: 'busy-week',
        type: 'scheduling',
        title: 'Busy Week Detected',
        description: `You have ${upcomingEvents.length} events this week. Consider rescheduling non-urgent items.`,
        confidence: 0.8,
        action: () => setShowSuggestionsPanel(true),
        priority: 'medium'
      });
    }

    // Compliance suggestions
    if (complianceIssues.length > 0) {
      suggestions.push({
        id: 'compliance-issues',
        type: 'compliance',
        title: 'AHPRA Compliance Review Needed',
        description: `${complianceIssues.length} events need compliance review before publication.`,
        confidence: 0.95,
        action: () => {
          setActiveFilters(['compliance-issues']);
          setShowSuggestionsPanel(true);
        },
        priority: 'high'
      });
    }

    // Overdue events
    if (overdueEvents.length > 0) {
      suggestions.push({
        id: 'overdue-events',
        type: 'scheduling',
        title: 'Overdue Events',
        description: `${overdueEvents.length} events are overdue and need attention.`,
        confidence: 1.0,
        action: () => {
          // Filter to show overdue events
          const overdueFilter = events.filter(event => 
            event.endTime < new Date() && event.status !== 'completed' && event.status !== 'cancelled'
          );
          setFilteredEvents(overdueFilter);
        },
        priority: 'high'
      });
    }

    // Content suggestions
    const socialMediaEvents = filteredEvents.filter(event => 
      ['facebook', 'instagram', 'linkedin'].includes(event.platform || '')
    );
    
    if (socialMediaEvents.length === 0) {
      suggestions.push({
        id: 'social-media-gap',
        type: 'content',
        title: 'Social Media Content Gap',
        description: 'No social media content scheduled. Consider adding patient education posts.',
        confidence: 0.7,
        action: () => {
          setCalendarMode('ideas');
          setIsEventDialogOpen(true);
        },
        priority: 'medium'
      });
    }

    setSmartSuggestions(suggestions);
  };

  // Calendar Navigation Functions
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        direction === 'next' ? newDate.setDate(newDate.getDate() + 1) : newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        direction === 'next' ? newDate.setDate(newDate.getDate() + 7) : newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        direction === 'next' ? newDate.setMonth(newDate.getMonth() + 1) : newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        direction === 'next' ? newDate.setFullYear(newDate.getFullYear() + 1) : newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToDate = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  // Event Management Functions
  const createEvent = async (eventData: Partial<ProfessionalCalendarEvent>) => {
    try {
      const newEvent: ProfessionalCalendarEvent = {
        id: `event_${Date.now()}`,
        title: eventData.title || 'Untitled Event',
        description: eventData.description,
        startTime: eventData.startTime || new Date(),
        endTime: eventData.endTime || addHours(new Date(), 1),
        allDay: eventData.allDay || false,
        practiceId: eventData.practiceId || selectedPractice,
        practiceColor: practices.find(p => p.id === (eventData.practiceId || selectedPractice))?.color || '#3b82f6',
        eventType: eventData.eventType || 'content_creation',
        platform: eventData.platform,
        priority: eventData.priority || 'medium',
        status: eventData.status || 'draft',
        aiGenerated: eventData.aiGenerated || false,
        complianceScore: eventData.complianceScore,
        ahpraCompliant: eventData.ahpraCompliant || true,
        contentType: eventData.contentType,
        targetAudience: eventData.targetAudience,
        assignedTo: eventData.assignedTo,
        attendees: eventData.attendees || [],
        location: eventData.location,
        isRecurring: eventData.isRecurring || false,
        recurrenceRule: eventData.recurrenceRule,
        reminders: eventData.reminders || [],
        tags: eventData.tags || [],
        attachments: eventData.attachments || [],
        notes: eventData.notes,
        lastModified: new Date(),
        createdBy: user?.id || 'system'
      };

      // Save to database
      const { error } = await supabase
        .from('healthcare_calendar_events')
        .insert({
          id: newEvent.id,
          user_id: user?.id,
          practice_id: newEvent.practiceId,
          title: newEvent.title,
          description: newEvent.description,
          start_time: newEvent.startTime.toISOString(),
          end_time: newEvent.endTime.toISOString(),
          all_day: newEvent.allDay,
          event_type: newEvent.eventType,
          platform: newEvent.platform,
          priority: newEvent.priority,
          status: newEvent.status,
          ai_generated: newEvent.aiGenerated,
          compliance_score: newEvent.complianceScore,
          ahpra_compliant: newEvent.ahpraCompliant,
          content_type: newEvent.contentType,
          target_audience: newEvent.targetAudience,
          assigned_to: newEvent.assignedTo,
          attendees: newEvent.attendees,
          location: newEvent.location,
          is_recurring: newEvent.isRecurring,
          recurrence_rule: newEvent.recurrenceRule,
          reminders: newEvent.reminders,
          tags: newEvent.tags,
          attachments: newEvent.attachments,
          notes: newEvent.notes,
          created_by: newEvent.createdBy
        });

      if (error) throw error;

      // Add to local state (real-time subscription will handle this, but add immediately for responsiveness)
      setEvents(prev => [...prev, newEvent]);
      
      toast({
        title: "Event Created",
        description: `${newEvent.title} has been successfully created.`,
      });

      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create the event. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<ProfessionalCalendarEvent>) => {
    try {
      const updatedData = {
        ...updates,
        start_time: updates.startTime?.toISOString(),
        end_time: updates.endTime?.toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('healthcare_calendar_events')
        .update(updatedData)
        .eq('id', eventId);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updates, lastModified: new Date() }
          : event
      ));

      toast({
        title: "Event Updated",
        description: "The event has been successfully updated.",
      });

      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('healthcare_calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // Remove from local state
      setEvents(prev => prev.filter(event => event.id !== eventId));

      toast({
        title: "Event Deleted",
        description: "The event has been successfully deleted.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Drag & Drop Functions
  const handleEventDragStart = (event: ProfessionalCalendarEvent, e: React.DragEvent) => {
    if (!enableDragDrop) return;

    setIsDragging(true);
    setDraggedEvent(event);
    
    // Set drag data
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Calculate drag offset
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleEventDragEnd = () => {
    setIsDragging(false);
    setDraggedEvent(null);
    setDropZone(null);
  };

  const handleDateDrop = async (targetDate: Date, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedEvent || !enableDragDrop) return;

    // Calculate new start and end times
    const duration = differenceInMinutes(draggedEvent.endTime, draggedEvent.startTime);
    const newStartTime = targetDate;
    const newEndTime = addMinutes(newStartTime, duration);

    // Update the event
    const success = await updateEvent(draggedEvent.id, {
      startTime: newStartTime,
      endTime: newEndTime
    });

    if (success) {
      toast({
        title: "Event Moved",
        description: `${draggedEvent.title} has been moved to ${format(newStartTime, 'MMM dd, yyyy')}.`,
      });
    }

    handleEventDragEnd();
  };

  const handleDateDragOver = (date: Date, e: React.DragEvent) => {
    if (!enableDragDrop || !draggedEvent) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropZone(date);
  };

  // Event Type Utilities
  const getEventTypeIcon = (eventType: string) => {
    const iconMap = {
      'content_creation': FileText,
      'social_post': Share2,
      'blog_article': FileText,
      'patient_education': Stethoscope,
      'appointment': Clock,
      'campaign': Target,
      'compliance_review': CheckCircle,
      'team_meeting': Users,
      'smart_capture': Brain
    };
    return iconMap[eventType as keyof typeof iconMap] || CalendarIcon;
  };

  const getEventTypeColor = (eventType: string) => {
    const colorMap = {
      'content_creation': '#3b82f6',
      'social_post': '#f59e0b',
      'blog_article': '#8b5cf6',
      'patient_education': '#10b981',
      'appointment': '#ef4444',
      'campaign': '#f97316',
      'compliance_review': '#22c55e',
      'team_meeting': '#6366f1',
      'smart_capture': '#ec4899'
    };
    return colorMap[eventType as keyof typeof colorMap] || '#6b7280';
  };

  const getPlatformIcon = (platform?: string) => {
    const iconMap = {
      'facebook': '👥',
      'instagram': '📷',
      'linkedin': '💼',
      'blog': '📝',
      'email': '✉️',
      'all': '🌐'
    };
    return platform ? iconMap[platform as keyof typeof iconMap] || '📱' : '';
  };

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      'low': '#6b7280',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'urgent': '#dc2626'
    };
    return colorMap[priority as keyof typeof colorMap] || '#6b7280';
  };

  const formatDateHeader = (date: Date) => {
    switch (currentView) {
      case 'day':
        return format(date, 'EEEE, MMMM dd, yyyy');
      case 'week':
        const weekStart = startOfWeek(date);
        const weekEnd = endOfWeek(date);
        return `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`;
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'year':
        return format(date, 'yyyy');
      case 'agenda':
        return `Agenda - ${format(date, 'MMM dd, yyyy')}`;
      default:
        return format(date, 'MMMM yyyy');
    }
  };

  // Render Functions
  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateCalendar('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-sm font-medium"
          >
            Today
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateCalendar('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Date Header */}
        <h2 className="text-xl font-semibold text-gray-900">
          {formatDateHeader(currentDate)}
        </h2>

        {/* Sync Status */}
        {enableRealTimeSync && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              {
                'bg-green-500': syncStatus === 'connected',
                'bg-yellow-500': syncStatus === 'syncing',
                'bg-red-500': syncStatus === 'error',
                'bg-gray-400': syncStatus === 'offline'
              }
            )} />
            <span className="text-xs text-gray-600">
              {syncStatus === 'connected' && `Last sync: ${format(lastSyncTime, 'HH:mm')}`}
              {syncStatus === 'syncing' && 'Syncing...'}
              {syncStatus === 'error' && 'Sync error'}
              {syncStatus === 'offline' && 'Offline'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Practice Switcher */}
        {showPracticeSwitcher && (
          <Select value={selectedPractice} onValueChange={setSelectedPractice}>
            <SelectTrigger className="w-48">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Practices</SelectItem>
              {practices.map(practice => (
                <SelectItem key={practice.id} value={practice.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: practice.color }}
                    />
                    {practice.name}
                    {!practice.isActive && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* View Switcher */}
        <div className="flex items-center bg-white rounded-lg border p-1">
          {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map(view => (
            <Button
              key={view}
              variant={currentView === view ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView(view)}
              className="text-sm capitalize"
            >
              {view}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsEventDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>

          {enableSmartSuggestions && smartSuggestions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestionsPanel(true)}
              className="relative"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Suggestions
              {smartSuggestions.filter(s => s.priority === 'high').length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                  {smartSuggestions.filter(s => s.priority === 'high').length}
                </Badge>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="flex-1 bg-white">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1">
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const dayEvents = filteredEvents.filter(event => 
                isSameDay(event.startTime, day)
              );
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              const isDropTarget = dropZone && isSameDay(dropZone, day);

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "min-h-32 border-r border-b last:border-r-0 p-2 relative",
                    {
                      'bg-gray-50 text-gray-400': !isCurrentMonth,
                      'bg-blue-50 border-blue-200': isDayToday,
                      'bg-green-50 border-green-300': isDropTarget,
                    }
                  )}
                  onDrop={(e) => handleDateDrop(day, e)}
                  onDragOver={(e) => handleDateDragOver(day, e)}
                  onDragLeave={() => setDropZone(null)}
                  onClick={() => setSelectedDate(day)}
                >
                  {/* Day number */}
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    {
                      'text-blue-600 font-bold': isDayToday,
                      'text-gray-900': isCurrentMonth && !isDayToday,
                    }
                  )}>
                    {format(day, 'd')}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const EventIcon = getEventTypeIcon(event.eventType);
                      return (
                        <div
                          key={event.id}
                          draggable={enableDragDrop}
                          onDragStart={(e) => handleEventDragStart(event, e)}
                          onDragEnd={handleEventDragEnd}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className={cn(
                            "text-xs p-1 rounded cursor-pointer transition-all hover:shadow-sm",
                            "flex items-center gap-1 truncate",
                            {
                              'opacity-50': event.status === 'cancelled',
                              'border-l-2': event.priority === 'high',
                              'shadow-sm scale-105': event.id === draggedEvent?.id,
                            }
                          )}
                          style={{ 
                            backgroundColor: event.practiceColor + '20',
                            borderColor: event.practiceColor,
                            color: event.practiceColor
                          }}
                        >
                          <EventIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate font-medium">{event.title}</span>
                          {event.platform && (
                            <span className="text-xs">{getPlatformIcon(event.platform)}</span>
                          )}
                          {!event.ahpraCompliant && (
                            <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ 
      start: weekStart, 
      end: endOfWeek(currentDate) 
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 bg-white">
        {/* Days header */}
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-3 border-r"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center border-r last:border-r-0">
              <div className="text-sm font-medium text-gray-700">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-lg font-bold mt-1",
                {
                  'text-blue-600': isToday(day),
                  'text-gray-900': !isToday(day)
                }
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <ScrollArea className="h-96">
          <div className="grid grid-cols-8">
            {/* Time column */}
            <div className="border-r">
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b p-2 text-sm text-gray-500">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => (
              <div key={day.toISOString()} className="border-r last:border-r-0 relative">
                {hours.map(hour => (
                  <div 
                    key={hour} 
                    className="h-16 border-b relative"
                    onDrop={(e) => handleDateDrop(addHours(day, hour), e)}
                    onDragOver={(e) => handleDateDragOver(addHours(day, hour), e)}
                  >
                    {/* Events for this hour */}
                    {filteredEvents
                      .filter(event => 
                        isSameDay(event.startTime, day) && 
                        event.startTime.getHours() === hour
                      )
                      .map(event => {
                        const EventIcon = getEventTypeIcon(event.eventType);
                        const duration = differenceInMinutes(event.endTime, event.startTime);
                        const height = Math.max(duration / 60 * 64, 20); // 64px per hour, min 20px
                        
                        return (
                          <div
                            key={event.id}
                            draggable={enableDragDrop}
                            onDragStart={(e) => handleEventDragStart(event, e)}
                            onDragEnd={handleEventDragEnd}
                            onClick={() => setSelectedEvent(event)}
                            className="absolute left-1 right-1 rounded p-1 cursor-pointer text-xs overflow-hidden"
                            style={{
                              backgroundColor: event.practiceColor + '40',
                              borderLeft: `3px solid ${event.practiceColor}`,
                              height: `${height}px`,
                              top: `${(event.startTime.getMinutes() / 60) * 64}px`,
                              zIndex: 10
                            }}
                          >
                            <div className="flex items-center gap-1 font-medium truncate">
                              <EventIcon className="h-3 w-3 flex-shrink-0" />
                              {event.title}
                            </div>
                            <div className="text-xs opacity-75 truncate">
                              {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = filteredEvents.filter(event => 
      isSameDay(event.startTime, currentDate)
    );

    return (
      <div className="flex-1 bg-white">
        {/* Day header */}
        <div className="p-4 border-b bg-gray-50 text-center">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'EEEE, MMMM dd, yyyy')}
          </h3>
          <p className="text-sm text-gray-600">
            {dayEvents.length} events scheduled
          </p>
        </div>

        {/* Time grid */}
        <ScrollArea className="h-96">
          <div className="grid grid-cols-1">
            {hours.map(hour => (
              <div 
                key={hour} 
                className="h-16 border-b relative flex"
                onDrop={(e) => handleDateDrop(addHours(currentDate, hour), e)}
                onDragOver={(e) => handleDateDragOver(addHours(currentDate, hour), e)}
              >
                {/* Time label */}
                <div className="w-20 p-2 text-sm text-gray-500 border-r">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                
                {/* Event area */}
                <div className="flex-1 relative">
                  {dayEvents
                    .filter(event => event.startTime.getHours() === hour)
                    .map((event, index) => {
                      const EventIcon = getEventTypeIcon(event.eventType);
                      const duration = differenceInMinutes(event.endTime, event.startTime);
                      const height = Math.max(duration / 60 * 64, 20);
                      
                      return (
                        <div
                          key={event.id}
                          draggable={enableDragDrop}
                          onDragStart={(e) => handleEventDragStart(event, e)}
                          onDragEnd={handleEventDragEnd}
                          onClick={() => setSelectedEvent(event)}
                          className="absolute left-2 right-2 rounded p-2 cursor-pointer overflow-hidden shadow-sm"
                          style={{
                            backgroundColor: event.practiceColor + '20',
                            borderLeft: `4px solid ${event.practiceColor}`,
                            height: `${height}px`,
                            top: `${(event.startTime.getMinutes() / 60) * 64}px`,
                            zIndex: 10
                          }}
                        >
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <EventIcon className="h-4 w-4 flex-shrink-0" />
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                          </div>
                          {event.description && (
                            <div className="text-xs text-gray-600 mt-1 truncate">
                              {event.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ color: getPriorityColor(event.priority) }}
                            >
                              {event.priority}
                            </Badge>
                            {!event.ahpraCompliant && (
                              <Badge variant="destructive" className="text-xs">
                                Compliance Review
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderAgendaView = () => {
    const agendaEvents = filteredEvents
      .filter(event => event.startTime >= currentDate)
      .slice(0, 50); // Show next 50 events

    return (
      <div className="flex-1 bg-white">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-4">
            {agendaEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-600">Create your first healthcare content event to get started.</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsEventDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            ) : (
              agendaEvents.map(event => {
                const EventIcon = getEventTypeIcon(event.eventType);
                return (
                  <Card
                    key={event.id}
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div 
                            className="h-3 w-3 rounded-full mt-2"
                            style={{ backgroundColor: event.practiceColor }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <EventIcon className="h-4 w-4" style={{ color: event.practiceColor }} />
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              {event.platform && (
                                <span className="text-sm">{getPlatformIcon(event.platform)}</span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              {format(event.startTime, 'EEEE, MMMM dd, yyyy')} at{' '}
                              {format(event.startTime, 'HH:mm')}
                              {!event.allDay && (
                                <> - {format(event.endTime, 'HH:mm')}</>
                              )}
                            </div>
                            
                            {event.description && (
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            )}
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {event.eventType.replace('_', ' ')}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{ color: getPriorityColor(event.priority) }}
                              >
                                {event.priority} priority
                              </Badge>
                              {event.ahpraCompliant ? (
                                <Badge variant="outline" className="text-green-600">
                                  ✓ AHPRA Compliant
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  Compliance Review
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                              setIsEventDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'month':
        return renderMonthView();
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      case 'agenda':
        return renderAgendaView();
      default:
        return renderMonthView();
    }
  };

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your healthcare calendar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-gray-50",
      { "rounded-lg border shadow-sm": embedded }
    )}>
      {/* Main Calendar Interface */}
      <Tabs value={calendarMode} onValueChange={(value) => setCalendarMode(value as CalendarMode)}>
        <div className="border-b bg-white">
          <div className="flex items-center justify-between px-4 py-2">
            <TabsList className="grid w-auto grid-cols-4 bg-gray-100">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="ideas" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Smart Ideas
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Quick filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={activeFilters.includes('high-priority') ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveFilters(prev => 
                    prev.includes('high-priority') 
                      ? prev.filter(f => f !== 'high-priority')
                      : [...prev, 'high-priority']
                  );
                }}
                className="text-xs"
              >
                High Priority
              </Button>
              <Button
                variant={activeFilters.includes('compliance-issues') ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveFilters(prev => 
                    prev.includes('compliance-issues') 
                      ? prev.filter(f => f !== 'compliance-issues')
                      : [...prev, 'compliance-issues']
                  );
                }}
                className="text-xs"
              >
                Compliance Issues
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="calendar" className="m-0 flex-1 flex flex-col">
          <div className="flex flex-col h-full">
            {renderCalendarHeader()}
            {renderCurrentView()}
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="m-0 flex-1">
          <SmartIdeasSketchboard 
            practiceId={selectedPractice === 'all' ? undefined : selectedPractice}
            onIdeaConverted={(idea, contentType) => {
              // Convert idea to calendar event
              createEvent({
                title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${idea.title}`,
                description: idea.content,
                eventType: 'smart_capture',
                aiGenerated: true,
                startTime: addHours(new Date(), 1),
                endTime: addHours(new Date(), 2),
                tags: ['smart-capture', 'ai-generated']
              });
              
              toast({
                title: "Smart Idea Captured!",
                description: `${idea.title} has been added to your calendar.`,
              });
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="m-0 flex-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Calendar Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Events</p>
                      <p className="text-2xl font-bold">{events.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold">
                        {events.filter(e => e.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Compliance Issues</p>
                      <p className="text-2xl font-bold">
                        {events.filter(e => !e.ahpraCompliant).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="m-0 flex-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Calendar Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-weekends">Show Weekends</Label>
                <Switch
                  id="show-weekends"
                  checked={viewSettings.showWeekends}
                  onCheckedChange={(checked) => 
                    setViewSettings(prev => ({ ...prev, showWeekends: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-past">Show Past Events</Label>
                <Switch
                  id="show-past"
                  checked={viewSettings.showPastEvents}
                  onCheckedChange={(checked) => 
                    setViewSettings(prev => ({ ...prev, showPastEvents: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <Switch
                  id="compact-mode"
                  checked={viewSettings.compactMode}
                  onCheckedChange={(checked) => 
                    setViewSettings(prev => ({ ...prev, compactMode: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  {React.createElement(getEventTypeIcon(selectedEvent.eventType), { className: "h-5 w-5" })}
                  {selectedEvent.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm text-gray-600">
                    {format(selectedEvent.startTime, 'EEEE, MMMM dd, yyyy')}
                    <br />
                    {format(selectedEvent.startTime, 'HH:mm')} - {format(selectedEvent.endTime, 'HH:mm')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Practice</Label>
                  <p className="text-sm text-gray-600">
                    {practices.find(p => p.id === selectedEvent.practiceId)?.name || 'Unknown Practice'}
                  </p>
                </div>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline">{selectedEvent.eventType.replace('_', ' ')}</Badge>
                <Badge style={{ color: getPriorityColor(selectedEvent.priority) }}>
                  {selectedEvent.priority} priority
                </Badge>
                {selectedEvent.platform && (
                  <Badge variant="secondary">
                    {getPlatformIcon(selectedEvent.platform)} {selectedEvent.platform}
                  </Badge>
                )}
                {selectedEvent.ahpraCompliant ? (
                  <Badge variant="outline" className="text-green-600">
                    ✓ AHPRA Compliant
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Compliance Review Required
                  </Badge>
                )}
              </div>
              
              {selectedEvent.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedEvent.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsEventDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Duplicate event
                    createEvent({
                      ...selectedEvent,
                      title: `Copy of ${selectedEvent.title}`,
                      startTime: addDays(selectedEvent.startTime, 1),
                      endTime: addDays(selectedEvent.endTime, 1)
                    });
                    setSelectedEvent(null);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Smart Suggestions Panel */}
      {showSuggestionsPanel && smartSuggestions.length > 0 && (
        <Dialog open={showSuggestionsPanel} onOpenChange={setShowSuggestionsPanel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Smart Suggestions
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3">
              {smartSuggestions.map(suggestion => (
                <Card key={suggestion.id} className="cursor-pointer" onClick={suggestion.action}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-2 w-2 rounded-full mt-2",
                        {
                          'bg-gray-400': suggestion.priority === 'low',
                          'bg-yellow-500': suggestion.priority === 'medium',
                          'bg-red-500': suggestion.priority === 'high'
                        }
                      )} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 