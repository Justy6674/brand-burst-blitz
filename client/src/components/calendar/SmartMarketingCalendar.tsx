import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  TrendingUp,
  Target,
  Zap,
  Eye,
  Users,
  Hash,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { cn } from '@/lib/utils';

interface MarketingEvent {
  id: string;
  title: string;
  type: 'post' | 'blog' | 'campaign' | 'deadline' | 'review' | 'analysis';
  status: 'draft' | 'scheduled' | 'published' | 'pending';
  date: Date;
  platforms?: string[];
  priority: 'high' | 'medium' | 'low';
  color: string;
  data?: any;
}

const EVENT_COLORS = {
  post: '#3b82f6',
  blog: '#8b5cf6', 
  campaign: '#f59e0b',
  deadline: '#ef4444',
  review: '#10b981',
  analysis: '#06b6d4'
};

const MARKETING_SUGGESTIONS = [
  { text: "Winter content season starts soon", type: "seasonal", priority: "high" },
  { text: "Competitor posted 3x this week", type: "competitive", priority: "medium" },
  { text: "Best posting time: 2-4 PM", type: "optimization", priority: "low" },
  { text: "Black Friday campaign prep needed", type: "campaign", priority: "high" }
];

export const SmartMarketingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { currentProfile } = useBusinessProfile();

  // Fetch marketing data from existing tables
  useEffect(() => {
    if (!user) return;
    
    const fetchMarketingData = async () => {
      setIsLoading(true);
      try {
        // Get posts (scheduled and published)
        const { data: posts } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .not('scheduled_at', 'is', null);

        // Get publishing queue
        const { data: queue } = await supabase
          .from('publishing_queue')
          .select(`
            *,
            posts(title, content, target_platforms)
          `)
          .gte('scheduled_for', startOfMonth(currentDate).toISOString())
          .lte('scheduled_for', endOfMonth(currentDate).toISOString());

        // Get blog posts
        const { data: blogPosts } = await supabase
          .from('blog_posts')
          .select('*')
          .not('scheduled_publish_at', 'is', null);

        const marketingEvents: MarketingEvent[] = [];

        // Convert posts to events
        posts?.forEach(post => {
          if (post.scheduled_at) {
            marketingEvents.push({
              id: `post-${post.id}`,
              title: post.title || 'Social Media Post',
              type: 'post',
              status: post.status as any,
              date: new Date(post.scheduled_at),
              platforms: post.target_platforms,
              priority: 'medium',
              color: EVENT_COLORS.post,
              data: post
            });
          }
        });

        // Convert queue items to events  
        queue?.forEach(item => {
          marketingEvents.push({
            id: `queue-${item.id}`,
            title: item.posts?.title || 'Scheduled Post',
            type: 'post',
            status: item.status as any,
            date: new Date(item.scheduled_for),
            platforms: item.posts?.target_platforms,
            priority: 'high',
            color: EVENT_COLORS.post,
            data: item
          });
        });

        // Convert blog posts to events
        blogPosts?.forEach(blog => {
          if (blog.scheduled_publish_at) {
            marketingEvents.push({
              id: `blog-${blog.id}`,
              title: blog.title,
              type: 'blog',
              status: blog.published ? 'published' : 'scheduled',
              date: new Date(blog.scheduled_publish_at),
              priority: 'high',
              color: EVENT_COLORS.blog,
              data: blog
            });
          }
        });

        // Add smart marketing suggestions as events
        const today = new Date();
        marketingEvents.push({
          id: 'review-weekly',
          title: 'Weekly Content Review',
          type: 'review',
          status: 'pending',
          date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          priority: 'medium',
          color: EVENT_COLORS.review
        });

        marketingEvents.push({
          id: 'competitor-analysis',
          title: 'Competitor Analysis',
          type: 'analysis',
          status: 'pending', 
          date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          priority: 'low',
          color: EVENT_COLORS.analysis
        });

        setEvents(marketingEvents);
      } catch (error) {
        console.error('Failed to fetch marketing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketingData();
  }, [user, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
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
                "min-h-[140px] p-2 bg-background cursor-pointer hover:bg-muted/30 transition-all border-r border-b",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                isToday && "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
              )}
              onClick={() => setSelectedDate(day)}
            >
              <div className={cn(
                "text-sm font-bold mb-2",
                isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
              )}>
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded border-l-2 bg-gradient-to-r from-background to-muted/20 hover:from-muted/30 hover:to-muted/10 transition-all cursor-pointer"
                    style={{ borderLeftColor: event.color }}
                  >
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="font-medium truncate">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {event.type}
                      </Badge>
                      {event.platforms && (
                        <span className="text-xs text-muted-foreground">
                          {event.platforms.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center bg-muted/30 rounded p-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {isCurrentMonth && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute bottom-1 right-1 w-5 h-5 p-0 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to content creation
                    window.location.href = '/dashboard/create-content';
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

  const todayEvents = getEventsForDate(new Date());
  const upcomingPosts = events.filter(e => e.type === 'post' && e.date > new Date()).length;
  const pendingReviews = events.filter(e => e.type === 'review' && e.status === 'pending').length;

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow text-transparent bg-clip-text">
            Marketing Calendar
          </h1>
          <p className="text-muted-foreground">Your complete content marketing command center</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard/analytics'}
            className="border-primary/30 hover:bg-primary/10"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button 
            onClick={() => window.location.href = '/dashboard/create-content'}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Marketing Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Content</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground">posts going live today</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{upcomingPosts}</div>
            <p className="text-xs text-muted-foreground">ready to publish</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Eye className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{pendingReviews}</div>
            <p className="text-xs text-muted-foreground">awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">3</div>
            <p className="text-xs text-muted-foreground">running campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h2 className="text-xl font-semibold">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary-glow/10">
                    <Hash className="h-3 w-3 mr-1" />
                    Content Marketing
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {renderCalendarGrid()}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Smart Suggestions */}
          <Card className="glass-card border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="h-5 w-5 mr-2 text-secondary" />
                Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MARKETING_SUGGESTIONS.map((suggestion, index) => (
                <div key={index} className={cn(
                  "p-3 rounded-lg border-l-4 bg-gradient-to-r from-background to-muted/20",
                  suggestion.priority === 'high' && "border-l-red-500",
                  suggestion.priority === 'medium' && "border-l-yellow-500", 
                  suggestion.priority === 'low' && "border-l-green-500"
                )}>
                  <p className="text-sm font-medium">{suggestion.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      suggestion.priority === 'high' && "border-red-500 text-red-600",
                      suggestion.priority === 'medium' && "border-yellow-500 text-yellow-600",
                      suggestion.priority === 'low' && "border-green-500 text-green-600"
                    )}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Today's Content */}
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
                  <p className="text-muted-foreground text-sm mb-3">No content scheduled today</p>
                  <Button 
                    size="sm" 
                    onClick={() => window.location.href = '/dashboard/create-content'}
                    className="bg-gradient-to-r from-primary to-primary-glow text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Content
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <div 
                      key={event.id}
                      className="p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-all"
                      style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge variant="outline" style={{ color: event.color }}>
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(event.date, 'h:mm a')}
                      </p>
                      {event.platforms && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.platforms.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/dashboard/create-content'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Social Post
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/dashboard/blog'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Write Blog Article
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/dashboard/competitors'}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Competitors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};