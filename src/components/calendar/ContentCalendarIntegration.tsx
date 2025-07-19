import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  Target,
  Repeat,
  AlertCircle,
  CheckCircle,
  Eye,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContentEvent {
  id: string;
  title: string;
  description: string;
  platform: string[];
  postType: string;
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  tags: string[];
  estimatedTime: number;
  campaign?: string;
}

export const ContentCalendarIntegration: React.FC = () => {
  const [events, setEvents] = useState<ContentEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ContentEvent | null>(null);
  const { toast } = useToast();

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    platform: [] as string[],
    postType: '',
    scheduledDate: new Date(),
    priority: 'medium' as const,
    tags: '',
    estimatedTime: 30,
    campaign: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // Generate mock events for demonstration
      const mockEvents: ContentEvent[] = [
        {
          id: '1',
          title: 'Summer Product Launch Post',
          description: 'Announce new product features',
          platform: ['Instagram', 'Facebook'],
          postType: 'Carousel',
          scheduledDate: new Date(),
          status: 'scheduled',
          priority: 'high',
          tags: ['product', 'launch', 'summer'],
          estimatedTime: 45,
          campaign: 'Summer 2024'
        },
        {
          id: '2',
          title: 'Behind the Scenes Content',
          description: 'Team working on new features',
          platform: ['Instagram'],
          postType: 'Story',
          scheduledDate: addDays(new Date(), 1),
          status: 'draft',
          priority: 'medium',
          tags: ['team', 'bts'],
          estimatedTime: 20
        },
        {
          id: '3',
          title: 'Customer Success Story',
          description: 'Feature satisfied customer testimonial',
          platform: ['LinkedIn', 'Twitter'],
          postType: 'Post',
          scheduledDate: addDays(new Date(), 2),
          status: 'scheduled',
          priority: 'medium',
          tags: ['testimonial', 'success'],
          estimatedTime: 30
        },
        {
          id: '4',
          title: 'Industry Insights Blog Share',
          description: 'Share latest blog post about industry trends',
          platform: ['LinkedIn', 'Facebook'],
          postType: 'Link Post',
          scheduledDate: addDays(new Date(), 3),
          status: 'draft',
          priority: 'low',
          tags: ['blog', 'insights', 'industry'],
          estimatedTime: 15
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error Loading Calendar",
        description: "Failed to load calendar events",
        variant: "destructive"
      });
    }
  };

  const handleCreateEvent = async () => {
    try {
      const event: ContentEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        platform: newEvent.platform,
        postType: newEvent.postType,
        scheduledDate: newEvent.scheduledDate,
        status: 'draft',
        priority: newEvent.priority,
        tags: newEvent.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        estimatedTime: newEvent.estimatedTime,
        campaign: newEvent.campaign || undefined
      };

      setEvents(prev => [...prev, event]);
      setIsEventDialogOpen(false);
      resetNewEvent();

      toast({
        title: "Event Created",
        description: "Content event added to calendar"
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create calendar event",
        variant: "destructive"
      });
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      platform: [],
      postType: '',
      scheduledDate: new Date(),
      priority: 'medium',
      tags: '',
      estimatedTime: 30,
      campaign: ''
    });
    setEditingEvent(null);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.scheduledDate, date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  const filteredEvents = events.filter(event => {
    const platformMatch = filterPlatform === 'all' || event.platform.includes(filterPlatform);
    const statusMatch = filterStatus === 'all' || event.status === filterStatus;
    return platformMatch && statusMatch;
  });

  const renderCalendarView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-32 p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                isToday(day) ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className={`text-sm mb-2 ${isToday(day) ? 'font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate ${getStatusColor(event.status)}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Calendar</h1>
          <p className="text-muted-foreground">
            Plan, schedule, and manage your content across all platforms
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={() => setIsEventDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
            size="sm"
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            onClick={() => setViewMode('day')}
            size="sm"
          >
            Day
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{format(selectedDate, 'MMMM yyyy')}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                  >
                    Next
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCalendarView()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-4">
            {filteredEvents.map(event => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPriorityIcon(event.priority)}
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {format(event.scheduledDate, 'MMM d, yyyy HH:mm')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.estimatedTime}min
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {event.platform.map(platform => (
                          <Badge key={platform} variant="secondary">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {events.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {events.filter(e => e.status === 'scheduled').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {events.filter(e => e.status === 'draft').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Edit Content Event' : 'Add New Content Event'}
            </DialogTitle>
            <DialogDescription>
              Schedule content across your social media platforms
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Enter content title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe your content"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Post Type</label>
                <Select 
                  value={newEvent.postType} 
                  onValueChange={(value) => setNewEvent(prev => ({ ...prev, postType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Post">Post</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Reel">Reel</SelectItem>
                    <SelectItem value="Carousel">Carousel</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select 
                  value={newEvent.priority} 
                  onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
              <Input
                placeholder="marketing, launch, product"
                value={newEvent.tags}
                onChange={(e) => setNewEvent(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};