import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Settings,
  Download,
  Upload,
  Bell,
  Users,
  BarChart3,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { useAdvancedCalendar } from '@/hooks/useAdvancedCalendar';
import { AdvancedCalendarGrid } from './AdvancedCalendarGrid';
import { EventCreateDialog } from './EventCreateDialog';
import { EventDetailsDialog } from './EventDetailsDialog';

export const AdvancedCalendarDashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    events,
    isLoading,
    error,
    currentDate,
    view,
    filters,
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    getEventsForDate,
    setCurrentDate,
    setView,
    updateFilters,
  } = useAdvancedCalendar();

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'month':
        setCurrentDate(direction === 'next' ? addMonths(newDate, 1) : subMonths(newDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'next' ? addWeeks(newDate, 1) : subWeeks(newDate, 1));
        break;
      case 'day':
        setCurrentDate(direction === 'next' ? addDays(newDate, 1) : subDays(newDate, 1));
        break;
      case 'agenda':
        // For agenda view, move by week
        setCurrentDate(direction === 'next' ? addWeeks(newDate, 1) : subWeeks(newDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatCurrentDateLabel = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'agenda':
        return 'Agenda View';
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  // Event handlers
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
    setShowCreateDialog(true);
  };

  const handleCreateEvent = (date: Date, time?: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowCreateDialog(true);
  };

  const handleEventMove = async (eventId: string, newStart: Date, newEnd: Date) => {
    try {
      await moveEvent(eventId, newStart, newEnd);
    } catch (error) {
      console.error('Failed to move event:', error);
    }
  };

  // Filter events based on search
  const filteredEvents = events.filter(event => 
    searchQuery === '' || 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculations
  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events.filter(event => 
    new Date(event.start_datetime) > new Date() && 
    new Date(event.start_datetime) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const eventTypeStats = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow text-transparent bg-clip-text">
            Calendar
          </h1>
          <p className="text-muted-foreground">Manage your schedule and events with advanced features</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => handleCreateEvent(new Date())}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground">events scheduled today</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">upcoming events</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{events.length}</div>
            <p className="text-xs text-muted-foreground">in current view</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <Bell className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{eventTypeStats.meeting || 0}</div>
            <p className="text-xs text-muted-foreground">scheduled meetings</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Interface */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card className="glass-card border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                {/* Navigation */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateDate('prev')}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToToday}
                      className="border-secondary/30 hover:bg-secondary/10"
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateDate('next')}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 text-transparent bg-clip-text">
                    {formatCurrentDateLabel()}
                  </h2>
                </div>
                
                {/* View Selector */}
                <div className="flex items-center space-x-2">
                  <Tabs value={view} onValueChange={(value: any) => setView(value)}>
                    <TabsList className="bg-muted/50">
                      <TabsTrigger value="month" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Month
                      </TabsTrigger>
                      <TabsTrigger value="week" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="day" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Day
                      </TabsTrigger>
                      <TabsTrigger value="agenda" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Agenda
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-primary/20"
                  />
                </div>
                
                <Button variant="outline" size="sm" className="border-primary/30">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 h-[600px]">
              <AdvancedCalendarGrid
                events={filteredEvents}
                currentDate={currentDate}
                view={view}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
                onEventMove={handleEventMove}
                onCreateEvent={handleCreateEvent}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Filters */}
          <Card className="glass-card border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Filter className="h-5 w-5 mr-2 text-secondary" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {['meeting', 'content', 'reminder', 'deadline', 'general'].map(type => (
                  <div key={type} className="flex items-center justify-between">
                    <Label htmlFor={type} className="font-medium capitalize">
                      {type}
                    </Label>
                    <Switch
                      id={type}
                      checked={filters.event_types.includes(type)}
                      onCheckedChange={(checked) => {
                        const newTypes = checked 
                          ? [...filters.event_types, type]
                          : filters.event_types.filter(t => t !== type);
                        updateFilters({ event_types: newTypes });
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Events */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                Today's Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <div className="text-center py-6">
                  <div className="p-3 rounded-full bg-muted/20 w-fit mx-auto mb-3">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">No events today</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCreateEvent(new Date())}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.slice(0, 5).map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-lg hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 cursor-pointer transition-all duration-300 border-primary/20"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{event.title}</span>
                        <Badge 
                          variant="outline"
                          className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/30 text-xs"
                          style={{ color: event.color }}
                        >
                          {event.event_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {event.all_day ? 'All day' : format(new Date(event.start_datetime), 'h:mm a')}
                      </p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                      )}
                    </div>
                  ))}
                  {todayEvents.length > 5 && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" className="text-primary">
                        View all {todayEvents.length} events
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="glass-card border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-5 w-5 mr-2 text-accent" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming events this week</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-lg hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 cursor-pointer transition-all duration-300 border-accent/20"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{event.title}</span>
                        <Badge 
                          variant="outline"
                          className="bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/30 text-xs"
                          style={{ color: event.color }}
                        >
                          {event.event_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.start_datetime), 'MMM d')} at {format(new Date(event.start_datetime), 'h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <EventCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateEvent={createEvent}
        initialDate={selectedDate || new Date()}
        initialTime={selectedTime}
      />

      <EventDetailsDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        event={selectedEvent}
      />
    </div>
  );
};