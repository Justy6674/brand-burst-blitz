import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Sparkles, 
  Share2, 
  Image, 
  Video,
  FileText,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  events: any[];
  onCreateContent: (date: Date, type: string) => void;
}

export const DayDetailDialog: React.FC<DayDetailDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
  events,
  onCreateContent,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [contentType, setContentType] = useState('social');

  if (!selectedDate) return null;

  const dayEvents = events.filter(event => 
    event.start.toDateString() === selectedDate.toDateString()
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const contentTypes = [
    { 
      id: 'social', 
      label: 'Social Media Post', 
      icon: Share2, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Create engaging social media content'
    },
    { 
      id: 'blog', 
      label: 'Blog Article', 
      icon: FileText, 
      color: 'from-purple-500 to-pink-500',
      description: 'Write detailed blog content'
    },
    { 
      id: 'visual', 
      label: 'Visual Content', 
      icon: Image, 
      color: 'from-green-500 to-emerald-500',
      description: 'Create images and graphics'
    },
    { 
      id: 'video', 
      label: 'Video Content', 
      icon: Video, 
      color: 'from-red-500 to-orange-500',
      description: 'Plan video content'
    },
    { 
      id: 'analytics', 
      label: 'Analytics Review', 
      icon: BarChart3, 
      color: 'from-indigo-500 to-blue-500',
      description: 'Review performance data'
    },
    { 
      id: 'campaign', 
      label: 'Campaign Planning', 
      icon: Target, 
      color: 'from-yellow-500 to-amber-500',
      description: 'Plan marketing campaigns'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">{formatDate(selectedDate)}</div>
              <div className="text-sm text-muted-foreground font-normal">
                Content planning & management
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Create Content
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    Scheduled Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No events scheduled</p>
                      <p className="text-sm text-muted-foreground mt-1">Perfect day to create new content!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="p-4 rounded-lg border bg-gradient-to-r from-background to-background/50 hover:from-muted/20 hover:to-muted/10 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{event.title}</span>
                            <Badge 
                              variant="outline"
                              className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/30"
                              style={{ color: event.color }}
                            >
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
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

              <Card className="glass-card border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-secondary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start h-auto p-4 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white shadow-lg"
                    onClick={() => setActiveTab('create')}
                  >
                    <Sparkles className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">AI Content Generator</div>
                      <div className="text-xs opacity-90">Create content for this day</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-primary/20 hover:bg-primary/10"
                    onClick={() => setActiveTab('schedule')}
                  >
                    <Clock className="h-5 w-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Schedule Post</div>
                      <div className="text-xs text-muted-foreground">Plan content timing</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contentTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 glass-card border-primary/20",
                    contentType === type.id && "ring-2 ring-primary/50 bg-gradient-to-br from-primary/5 to-primary-glow/5"
                  )}
                  onClick={() => setContentType(type.id)}
                >
                  <CardHeader className="pb-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${type.color} w-fit`}>
                      <type.icon className="h-6 w-6 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">{type.label}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content-topic">Content Topic/Theme</Label>
                  <Input 
                    id="content-topic" 
                    placeholder="e.g., Morning motivation, Product launch, Behind the scenes..."
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-details">Additional Details</Label>
                  <Textarea 
                    id="content-details" 
                    placeholder="Any specific requirements, tone, target audience, etc."
                    className="border-primary/20 focus:border-primary"
                    rows={3}
                  />
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white shadow-lg"
                  onClick={() => onCreateContent(selectedDate, contentType)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate {contentTypes.find(t => t.id === contentType)?.label}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 mt-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Schedule New Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input 
                      id="schedule-time" 
                      type="time"
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schedule-type">Content Type</Label>
                    <select className="w-full p-2 rounded-md border border-primary/20 bg-background">
                      <option>Social Media Post</option>
                      <option>Blog Article</option>
                      <option>Visual Content</option>
                      <option>Video Content</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-title">Title/Description</Label>
                  <Input 
                    id="schedule-title" 
                    placeholder="Brief description of the content"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};