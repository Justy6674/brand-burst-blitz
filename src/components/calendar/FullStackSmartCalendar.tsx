import React, { useState, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Search,
  Download,
  Settings,
  Zap,
  Building2,
  Eye,
  Edit,
  Trash2,
  Copy,
  Clock,
  Users,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { useBusinessProfiles } from '@/hooks/useBusinessProfiles';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EventCreateDialog } from './EventCreateDialog';
import { EventDetailsDialog } from './EventDetailsDialog';
import { BulkActionsDialog } from './BulkActionsDialog';
import { AutomationRulesDialog } from './AutomationRulesDialog';

const PLATFORM_CONFIGS = {
  instagram: { color: '#E4405F', name: 'Instagram', icon: '📷' },
  facebook: { color: '#1877F2', name: 'Facebook', icon: '👥' },
  tiktok: { color: '#000000', name: 'TikTok', icon: '🎵' },
  linkedin: { color: '#0A66C2', name: 'LinkedIn', icon: '💼' },
  reddit: { color: '#FF4500', name: 'Reddit', icon: '🤖' },
  blog: { color: '#8B5CF6', name: 'Blog', icon: '📝' },
  email: { color: '#059669', name: 'Email', icon: '✉️' },
  youtube: { color: '#FF0000', name: 'YouTube', icon: '📺' },
  twitter: { color: '#1DA1F2', name: 'Twitter', icon: '🐦' },
};

const EVENT_TYPE_CONFIGS = {
  general: { color: '#6B7280', name: 'General', icon: '📋' },
  post: { color: '#3B82F6', name: 'Post', icon: '📝' },
  blog: { color: '#8B5CF6', name: 'Blog', icon: '📖' },
  campaign: { color: '#F59E0B', name: 'Campaign', icon: '🚀' },
  meeting: { color: '#10B981', name: 'Meeting', icon: '👥' },
  deadline: { color: '#EF4444', name: 'Deadline', icon: '⏰' },
  review: { color: '#06B6D4', name: 'Review', icon: '👁️' },
  analysis: { color: '#8B5CF6', name: 'Analysis', icon: '📊' },
};

export const FullStackSmartCalendar: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  const calendarRef = useRef<FullCalendar>(null);
  const { user } = useAuth();
  const { businessProfiles } = useBusinessProfiles();
  
  const { 
    events, 
    loading, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    bulkOperations 
  } = useCalendarEvents(
    selectedBusiness === 'all' ? undefined : selectedBusiness
  );

  const { rules: automationRules } = useAutomationRules(
    selectedBusiness === 'all' ? undefined : selectedBusiness
  );

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (selectedPlatforms.length > 0 && event.platform && !selectedPlatforms.includes(event.platform)) {
      return false;
    }
    
    if (selectedEventTypes.length > 0 && event.event_type && !selectedEventTypes.includes(event.event_type)) {
      return false;
    }
    
    return true;
  });

  // Convert events to FullCalendar format
  const calendarEvents = filteredEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_datetime,
    end: event.end_datetime,
    allDay: event.all_day,
    backgroundColor: event.color || PLATFORM_CONFIGS[event.platform || 'blog']?.color || '#3B82F6',
    borderColor: event.color || PLATFORM_CONFIGS[event.platform || 'blog']?.color || '#3B82F6',
    textColor: '#FFFFFF',
    extendedProps: {
      ...event,
      platformIcon: PLATFORM_CONFIGS[event.platform || 'blog']?.icon || '📝',
      typeIcon: EVENT_TYPE_CONFIGS[event.event_type || 'general']?.icon || '📋'
    }
  }));

  // Calendar event handlers
  const handleDateSelect = useCallback((selectInfo: any) => {
    setSelectedDate(new Date(selectInfo.start));
    setShowCreateDialog(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: any) => {
    setSelectedEventId(clickInfo.event.id);
    setShowDetailsDialog(true);
  }, []);

  const handleEventDrop = useCallback(async (dropInfo: any) => {
    const eventId = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;

    try {
      await updateEvent(eventId, {
        start_datetime: newStart.toISOString(),
        end_datetime: newEnd ? newEnd.toISOString() : new Date(newStart.getTime() + 60 * 60 * 1000).toISOString()
      });
      toast.success('Event rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling event:', error);
      dropInfo.revert();
      toast.error('Failed to reschedule event');
    }
  }, [updateEvent]);

  const handleEventResize = useCallback(async (resizeInfo: any) => {
    const eventId = resizeInfo.event.id;
    const newEnd = resizeInfo.event.end;

    try {
      await updateEvent(eventId, {
        end_datetime: newEnd.toISOString()
      });
      toast.success('Event duration updated');
    } catch (error) {
      console.error('Error resizing event:', error);
      resizeInfo.revert();
      toast.error('Failed to update event duration');
    }
  }, [updateEvent]);

  // Export calendar to ICS
  const exportCalendar = useCallback(() => {
    const icsEvents = filteredEvents.map(event => {
      const start = new Date(event.start_datetime);
      const end = new Date(event.end_datetime);
      
      return [
        'BEGIN:VEVENT',
        `UID:${event.id}@jbsaas.com`,
        `DTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location || ''}`,
        'END:VEVENT'
      ].join('\n');
    });

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JBSAAS//Smart Marketing Calendar//EN',
      ...icsEvents,
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart-marketing-calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Calendar exported successfully!');
  }, [filteredEvents]);

  // Bulk selection handlers
  const handleEventSelect = useCallback((eventId: string, selected: boolean) => {
    setSelectedEvents(prev => 
      selected 
        ? [...prev, eventId]
        : prev.filter(id => id !== eventId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedEvents(filteredEvents.map(e => e.id!));
  }, [filteredEvents]);

  const handleClearSelection = useCallback(() => {
    setSelectedEvents([]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow text-transparent bg-clip-text">
            Smart Marketing Calendar
          </h1>
          <p className="text-muted-foreground">Full-stack calendar with drag & drop, real-time sync, and automation</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAutomationDialog(true)}
            className="border-secondary/30 hover:bg-secondary/10"
          >
            <Zap className="h-4 w-4 mr-2" />
            Automation ({automationRules.length})
          </Button>
          <Button 
            variant="outline" 
            onClick={exportCalendar}
            className="border-primary/30 hover:bg-primary/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{filteredEvents.length}</div>
            <p className="text-xs text-muted-foreground">across all platforms</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {filteredEvents.filter(e => {
                const eventDate = new Date(e.start_datetime);
                const now = new Date();
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                return eventDate >= weekStart && eventDate <= weekEnd;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">scheduled events</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <Tag className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {new Set(filteredEvents.map(e => e.platform).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">in use</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation</CardTitle>
            <Zap className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {automationRules.filter(r => r.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">active rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Businesses</SelectItem>
                {businessProfiles?.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.business_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Platforms
                  {selectedPlatforms.length > 0 && (
                    <Badge variant="secondary">{selectedPlatforms.length}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-medium">Filter by Platform</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={selectedPlatforms.includes(key)}
                          onCheckedChange={(checked) => {
                            setSelectedPlatforms(prev => 
                              checked 
                                ? [...prev, key]
                                : prev.filter(p => p !== key)
                            );
                          }}
                        />
                        <label htmlFor={key} className="text-sm cursor-pointer">
                          {config.icon} {config.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex gap-2">
              <Button
                variant={calendarView === 'dayGridMonth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCalendarView('dayGridMonth')}
              >
                Month
              </Button>
              <Button
                variant={calendarView === 'timeGridWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCalendarView('timeGridWeek')}
              >
                Week
              </Button>
              <Button
                variant={calendarView === 'timeGridDay' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCalendarView('timeGridDay')}
              >
                Day
              </Button>
            </div>

            {selectedEvents.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(true)}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Bulk Actions ({selectedEvents.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Calendar */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={calendarView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            editable={true}
            droppable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="auto"
            eventDisplay="block"
            eventContent={(eventInfo) => (
              <div className="flex items-center gap-1 p-1 truncate">
                <span className="text-xs">{eventInfo.event.extendedProps.platformIcon}</span>
                <span className="text-xs">{eventInfo.event.extendedProps.typeIcon}</span>
                <span className="text-xs font-medium truncate">{eventInfo.event.title}</span>
                {selectedEvents.includes(eventInfo.event.id) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            )}
            dayCellClassNames="hover:bg-muted/30 cursor-pointer transition-colors"
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EventCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        selectedDate={selectedDate}
        onEventCreated={(event) => {
          setShowCreateDialog(false);
          toast.success('Event created successfully');
        }}
      />

      <EventDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        eventId={selectedEventId}
        onEventUpdated={() => {
          toast.success('Event updated successfully');
        }}
        onEventDeleted={() => {
          setShowDetailsDialog(false);
          toast.success('Event deleted successfully');
        }}
      />

      <BulkActionsDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
        selectedEventIds={selectedEvents}
        onBulkComplete={(results) => {
          setSelectedEvents([]);
          setShowBulkDialog(false);
          if (results.success > 0) {
            toast.success(`Successfully processed ${results.success} events`);
          }
          if (results.errors > 0) {
            toast.error(`${results.errors} operations failed`);
          }
        }}
      />

      <AutomationRulesDialog
        open={showAutomationDialog}
        onOpenChange={setShowAutomationDialog}
        businessId={selectedBusiness === 'all' ? undefined : selectedBusiness}
      />
    </div>
  );
};