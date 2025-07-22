import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Clock,
  Eye,
  EyeOff
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

export const CalendarDashboard = () => {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
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
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground">Plan and schedule your content publishing</p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">{formatCurrentDateLabel()}</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tabs value={view} onValueChange={(value: any) => setView(value)}>
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <CalendarGrid
                currentDate={currentDate}
                view={view}
                events={events}
                onEventClick={handleEventClick}
                onDateClick={(date) => setCurrentDate(date)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-posts">Posts</Label>
                <Switch
                  id="show-posts"
                  checked={filters.showPosts}
                  onCheckedChange={(checked) => 
                    setFilters({ showPosts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-scheduled">Scheduled</Label>
                <Switch
                  id="show-scheduled"
                  checked={filters.showScheduled}
                  onCheckedChange={(checked) => 
                    setFilters({ showScheduled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-published">Published</Label>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No events scheduled for today</p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge 
                          variant="outline"
                          style={{ borderColor: event.color, color: event.color }}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
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
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge 
                          variant="outline"
                          style={{ borderColor: event.color, color: event.color }}
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
        event={selectedEvent}
      />
    </div>
  );
};