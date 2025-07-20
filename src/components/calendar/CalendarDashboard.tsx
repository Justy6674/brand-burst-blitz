import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Clock,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCalendar } from '@/hooks/useCalendar';
import { SchedulePostDialog } from './SchedulePostDialog';
import { CalendarGrid } from './CalendarGrid';
import { EventDetailsDialog } from './EventDetailsDialog';
import { DayDetailDialog } from './DayDetailDialog';

export const CalendarDashboard = () => {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const {
    events,
    currentDate,
    view,
    filters,
    isLoading,
    error,
    setCurrentDate,
    setView,
    setFilters,
    getEventsForDate,
    refreshCalendar,
  } = useCalendar();

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatCurrentDateLabel = () => {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (view) {
      case 'month':
        options.year = 'numeric';
        options.month = 'long';
        break;
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'day':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
    }
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events.filter(event => 
    event.start > new Date() && event.start < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).slice(0, 5);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayDialog(true);
  };

  const handleCreateContent = (date: Date, type: string) => {
    // Navigate to content creation with date and type
    console.log('Create content for:', date, 'Type:', type);
    setShowDayDialog(false);
    // Here you could navigate to content creation page or open content creation dialog
  };

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow text-transparent bg-clip-text">
            Content Calendar
          </h1>
          <p className="text-muted-foreground">Plan and schedule your content publishing with AI-powered assistance</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowScheduleDialog(true)}
            className="border-primary/30 hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Post
          </Button>
          <Button 
            onClick={() => handleDateClick(new Date())}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white shadow-lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateDate('prev')}
                  className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToToday}
                  className="border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50"
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateDate('next')}
                  className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 text-transparent bg-clip-text">
                {formatCurrentDateLabel()}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tabs value={view} onValueChange={(value: any) => setView(value)}>
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="month" className="data-[state=active]:bg-primary data-[state=active]:text-white">Month</TabsTrigger>
                  <TabsTrigger value="week" className="data-[state=active]:bg-primary data-[state=active]:text-white">Week</TabsTrigger>
                  <TabsTrigger value="day" className="data-[state=active]:bg-primary data-[state=active]:text-white">Day</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card className="glass-card border-primary/20 shadow-lg">
            <CardContent className="p-0">
              <CalendarGrid
                currentDate={currentDate}
                view={view}
                events={events}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Filters */}
          <Card className="glass-card border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Filter className="h-5 w-5 mr-2 text-secondary" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-posts" className="font-medium">Posts</Label>
                <Switch
                  id="show-posts"
                  checked={filters.showPosts}
                  onCheckedChange={(checked) => 
                    setFilters({ showPosts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-scheduled" className="font-medium">Scheduled</Label>
                <Switch
                  id="show-scheduled"
                  checked={filters.showScheduled}
                  onCheckedChange={(checked) => 
                    setFilters({ showScheduled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-published" className="font-medium">Published</Label>
                <Switch
                  id="show-published"
                  checked={filters.showPublished}
                  onCheckedChange={(checked) => 
                    setFilters({ showPublished: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Today's Events */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <div className="text-center py-6">
                  <div className="p-3 rounded-full bg-muted/20 w-fit mx-auto mb-3">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">No events scheduled for today</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDateClick(new Date())}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Content
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-lg hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 cursor-pointer transition-all duration-300 border-primary/20"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge 
                          variant="outline"
                          className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/30"
                          style={{ color: event.color }}
                        >
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {event.start.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="glass-card border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-accent" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-lg hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 cursor-pointer transition-all duration-300 border-accent/20"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge 
                          variant="outline"
                          className="bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/30"
                          style={{ color: event.color }}
                        >
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {event.start.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {event.start.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SchedulePostDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
      />

      <EventDetailsDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        eventId={selectedEvent?.id || ''}
        onEventUpdated={() => refreshCalendar()}
        onEventDeleted={() => {
          setShowEventDialog(false);
          refreshCalendar();
        }}
      />

      <DayDetailDialog
        open={showDayDialog}
        onOpenChange={setShowDayDialog}
        selectedDate={selectedDate}
        events={events}
        onCreateContent={handleCreateContent}
      />
    </div>
  );
};