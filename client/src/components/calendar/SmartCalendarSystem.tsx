import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Bell, 
  Filter,
  Search,
  Settings,
  Download,
  Zap,
  TrendingUp,
  Users,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useBusinessProfiles } from '@/hooks/useBusinessProfiles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Platform-specific configurations
const PLATFORM_CONFIGS = {
  instagram: { 
    color: '#E4405F', 
    name: 'Instagram',
    types: ['Post', 'Story', 'Reel', 'IGTV'],
    icon: '📷'
  },
  facebook: { 
    color: '#1877F2', 
    name: 'Facebook',
    types: ['Post', 'Story', 'Event', 'Ad'],
    icon: '👥'
  },
  tiktok: { 
    color: '#000000', 
    name: 'TikTok',
    types: ['Video', 'Trend', 'Challenge'],
    icon: '🎵'
  },
  linkedin: { 
    color: '#0A66C2', 
    name: 'LinkedIn',
    types: ['Post', 'Article', 'Company Update'],
    icon: '💼'
  },
  reddit: { 
    color: '#FF4500', 
    name: 'Reddit',
    types: ['Post', 'Comment', 'Community'],
    icon: '🤖'
  },
  blog: { 
    color: '#8B5CF6', 
    name: 'Blog',
    types: ['Article', 'SEO Content', 'Guest Post'],
    icon: '📝'
  },
  email: { 
    color: '#059669', 
    name: 'Email',
    types: ['Newsletter', 'Campaign', 'Sequence'],
    icon: '✉️'
  }
};

interface SmartCalendarEvent {
  id: string;
  title: string;
  platform: keyof typeof PLATFORM_CONFIGS;
  type: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledDate: Date;
  businessId?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  content?: string;
  reminders: string[];
  externalCalendarId?: string;
}

interface SmartCalendarSystemProps {
  embedded?: boolean;
}

export const SmartCalendarSystem: React.FC<SmartCalendarSystemProps> = ({ embedded = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<SmartCalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SmartCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showInactiveAlert, setShowInactiveAlert] = useState(false);
  
  const { user } = useAuth();
  const { currentProfile } = useBusinessProfile();
  const { businessProfiles } = useBusinessProfiles();

  // Load calendar data from all integrated sources
  useEffect(() => {
    if (!user) return;
    
    const loadCalendarData = async () => {
      setIsLoading(true);
      try {
        // Get all posts with scheduling data
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            *,
            business_profiles(business_name)
          `)
          .eq('user_id', user.id)
          .not('scheduled_at', 'is', null);

        // Get publishing queue
        const { data: publishingQueue } = await supabase
          .from('publishing_queue')
          .select(`
            *,
            posts(title, content, target_platforms, business_profile_id),
            social_accounts(platform)
          `);

        // Get blog posts
        const { data: blogPosts } = await supabase
          .from('blog_posts')
          .select('*')
          .not('scheduled_publish_at', 'is', null);

        // Get calendar events
        const { data: calendarEvents } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id);

        const smartEvents: SmartCalendarEvent[] = [];

        // Convert posts to calendar events
        posts?.forEach(post => {
          if (post.scheduled_at) {
            post.target_platforms?.forEach(platform => {
              smartEvents.push({
                id: `post-${post.id}-${platform}`,
                title: post.title || 'Social Media Post',
                platform: platform as keyof typeof PLATFORM_CONFIGS,
                type: 'Post',
                status: post.status as any,
                scheduledDate: new Date(post.scheduled_at),
                businessId: post.business_profile_id,
                priority: 'medium',
                tags: post.tags || [],
                content: post.content,
                reminders: []
              });
            });
          }
        });

        // Convert publishing queue to events
        publishingQueue?.forEach(item => {
          if (item.posts?.target_platforms) {
            item.posts.target_platforms.forEach(platform => {
              smartEvents.push({
                id: `queue-${item.id}-${platform}`,
                title: item.posts?.title || 'Scheduled Post',
                platform: platform as keyof typeof PLATFORM_CONFIGS,
                type: 'Post',
                status: item.status as any,
                scheduledDate: new Date(item.scheduled_for),
                businessId: item.posts?.business_profile_id,
                priority: 'high',
                tags: [],
                reminders: []
              });
            });
          }
        });

        // Convert blog posts to events
        blogPosts?.forEach(blog => {
          if (blog.scheduled_publish_at) {
            smartEvents.push({
              id: `blog-${blog.id}`,
              title: blog.title,
              platform: 'blog',
              type: 'Article',
              status: blog.published ? 'published' : 'scheduled',
              scheduledDate: new Date(blog.scheduled_publish_at),
              priority: 'high',
              tags: blog.tags || [],
              content: blog.content,
              reminders: []
            });
          }
        });

        // Convert calendar events
        calendarEvents?.forEach(event => {
          smartEvents.push({
            id: `calendar-${event.id}`,
            title: event.title,
            platform: 'blog', // Default platform
            type: event.event_type,
            status: 'scheduled',
            scheduledDate: new Date(event.start_datetime),
            businessId: event.business_profile_id,
            priority: event.priority === 1 ? 'high' : event.priority === 2 ? 'medium' : 'low',
            tags: [],
            reminders: []
          });
        });

        setEvents(smartEvents);
        setFilteredEvents(smartEvents);
        
        // Check for inactivity
        checkForInactivity(smartEvents);
        
      } catch (error) {
        console.error('Failed to load calendar data:', error);
        toast.error('Failed to load calendar data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendarData();
  }, [user, currentDate]);

  // Filter events based on search, platform, and business
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(event => selectedPlatforms.includes(event.platform));
    }

    if (selectedBusiness !== 'all') {
      filtered = filtered.filter(event => event.businessId === selectedBusiness);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedPlatforms, selectedBusiness]);

  const checkForInactivity = (events: SmartCalendarEvent[]) => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentActivity = events.some(event => 
      event.scheduledDate >= lastWeek && event.status === 'published'
    );

    if (!recentActivity) {
      setShowInactiveAlert(true);
      toast.warning('No content published in the last week. Time to get back to creating!');
    }
  };

  const addToCalendar = (event: SmartCalendarEvent) => {
    const startDate = event.scheduledDate;
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const calendarEvent = {
      title: `${PLATFORM_CONFIGS[event.platform].icon} ${event.title}`,
      start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: `${event.platform.toUpperCase()} ${event.type}\n${event.content || ''}`,
      location: PLATFORM_CONFIGS[event.platform].name
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JBSAAS//Smart Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@jbsaas.com`,
      `DTSTART:${calendarEvent.start}`,
      `DTEND:${calendarEvent.end}`,
      `SUMMARY:${calendarEvent.title}`,
      `DESCRIPTION:${calendarEvent.description}`,
      `LOCATION:${calendarEvent.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Calendar event downloaded!');
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.scheduledDate, date));
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const today = new Date();

    return (
      <div className="grid grid-cols-7 gap-px bg-border">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-4 text-center font-semibold text-primary bg-muted/20">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] p-2 bg-background cursor-pointer hover:bg-muted/30 transition-all border-r border-b relative",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                isToday && "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
              )}
            >
              <div className={cn(
                "text-sm font-bold mb-2",
                isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
              )}>
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => {
                  const platformConfig = PLATFORM_CONFIGS[event.platform];
                  return (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded border-l-2 bg-gradient-to-r from-background to-muted/20 hover:from-muted/30 hover:to-muted/10 transition-all cursor-pointer group"
                      style={{ borderLeftColor: platformConfig.color }}
                      onClick={() => addToCalendar(event)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{platformConfig.icon}</span>
                        <span className="font-medium truncate">{event.title}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs px-1 py-0"
                          style={{ color: platformConfig.color, borderColor: platformConfig.color }}
                        >
                          {event.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to add to calendar
                        </span>
                      </div>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center bg-muted/30 rounded p-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>

              {/* Quick Add Button */}
              {isCurrentMonth && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute bottom-1 right-1 w-5 h-5 p-0 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/dashboard/create-content?date=${day.toISOString()}`;
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const exportToCalendar = () => {
    const icsEvents = filteredEvents.map(event => {
      const startDate = event.scheduledDate;
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      return [
        'BEGIN:VEVENT',
        `UID:${event.id}@jbsaas.com`,
        `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `SUMMARY:${PLATFORM_CONFIGS[event.platform].icon} ${event.title}`,
        `DESCRIPTION:${event.platform.toUpperCase()} ${event.type}\\n${event.content || ''}`,
        `LOCATION:${PLATFORM_CONFIGS[event.platform].name}`,
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
    link.download = 'marketing-calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Marketing calendar exported to .ics file!');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inactivity Alert */}
      {showInactiveAlert && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-semibold">Content inactivity detected</p>
                <p className="text-sm text-muted-foreground">No content published in the last week</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/dashboard/create-content'}
              >
                Create Content
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowInactiveAlert(false)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow text-transparent bg-clip-text">
            Smart Marketing Calendar
          </h1>
          <p className="text-muted-foreground">Intelligent content planning across all platforms</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportToCalendar}
            className="border-primary/30 hover:bg-primary/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Calendar
          </Button>
          <Button 
            onClick={() => window.location.href = '/dashboard/create-content'}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Content
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content, tags, or platforms..."
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

            <div className="flex gap-2">
              {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedPlatforms.includes(key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPlatforms(prev => 
                      prev.includes(key) 
                        ? prev.filter(p => p !== key)
                        : [...prev, key]
                    );
                  }}
                  className="text-xs"
                  style={{ 
                    backgroundColor: selectedPlatforms.includes(key) ? config.color : 'transparent',
                    borderColor: config.color,
                    color: selectedPlatforms.includes(key) ? 'white' : config.color
                  }}
                >
                  {config.icon} {config.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {filteredEvents.filter(e => {
                const eventDate = e.scheduledDate;
                const weekStart = startOfWeek(new Date());
                const weekEnd = addDays(weekStart, 6);
                return eventDate >= weekStart && eventDate <= weekEnd;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">scheduled posts</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {new Set(filteredEvents.map(e => e.platform)).size}
            </div>
            <p className="text-xs text-muted-foreground">platforms in use</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {filteredEvents.filter(e => e.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">content pieces</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {filteredEvents.filter(e => e.status === 'scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">upcoming posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                  ←
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                  →
                </Button>
              </div>
              
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            
            <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary-glow/10">
              {filteredEvents.length} events
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {renderCalendarGrid()}
        </CardContent>
      </Card>
    </div>
  );
};