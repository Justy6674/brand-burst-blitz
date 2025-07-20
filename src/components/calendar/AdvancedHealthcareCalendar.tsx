import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { supabase } from '../../integrations/supabase/client';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Clock,
  Users,
  MapPin,
  Stethoscope,
  FileText,
  Share2,
  Settings,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  Zap,
  Brain,
  Mic,
  MessageSquare,
  Lightbulb,
  Target,
  Activity,
  Heart,
  CheckCircle,
  AlertTriangle,
  Phone,
  Video,
  Mail,
  Bell,
  Eye,
  ArrowRight
} from 'lucide-react';

// Calendar Event Types for Healthcare
interface HealthcareCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime?: string;
  event_type: 'appointment' | 'content_post' | 'practice_task' | 'training' | 'admin' | 'marketing' | 'patient_follow_up' | 'compliance_review';
  event_category: 'patient_care' | 'content_creation' | 'practice_management' | 'professional_development' | 'compliance' | 'marketing';
  practice_id?: string;
  patient_type?: 'new' | 'returning' | 'follow_up' | 'urgent';
  appointment_type?: string;
  healthcare_specialty?: string;
  content_platform?: 'facebook' | 'instagram' | 'website' | 'blog' | 'newsletter';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'draft';
  attendees?: string[];
  location?: string;
  is_telehealth?: boolean;
  requires_preparation?: boolean;
  preparation_notes?: string;
  follow_up_required?: boolean;
  compliance_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  date: Date;
}

interface SmartIdeaCapture {
  id: string;
  content: string;
  source: 'voice' | 'text' | 'image';
  suggested_type: 'facebook_post' | 'instagram_post' | 'blog_post' | 'patient_education' | 'newsletter';
  ai_analysis?: string;
  scheduled_date?: string;
  status: 'captured' | 'analyzed' | 'scheduled' | 'published';
  created_at: string;
}

interface AdvancedHealthcareCalendarProps {
  practiceId?: string;
  defaultView?: 'month' | 'week' | 'day' | 'agenda';
  enableMultiPractice?: boolean;
  enableVoiceCapture?: boolean;
}

export function AdvancedHealthcareCalendar({ 
  practiceId, 
  defaultView = 'month',
  enableMultiPractice = true,
  enableVoiceCapture = true
}: AdvancedHealthcareCalendarProps) {
  const { user, profile } = useHealthcareAuth();
  const { toast } = useToast();
  
  // Calendar State
  const [currentView, setCurrentView] = useState<CalendarView>({
    type: defaultView,
    date: new Date()
  });
  const [events, setEvents] = useState<HealthcareCalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<HealthcareCalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedPractice, setSelectedPractice] = useState(practiceId || 'all');
  
  // Smart Ideas Capture State
  const [smartIdeas, setSmartIdeas] = useState<SmartIdeaCapture[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [ideaText, setIdeaText] = useState('');
  const [showIdeasPanel, setShowIdeasPanel] = useState(false);
  const [isAnalyzingIdea, setIsAnalyzingIdea] = useState(false);
  
  // Drag & Drop State
  const [draggedEvent, setDraggedEvent] = useState<HealthcareCalendarEvent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // External Calendar Integration
  const [externalCalendars, setExternalCalendars] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  
  // Voice Recognition Setup
  const recognition = useRef<any>(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);

  useEffect(() => {
    // Initialize voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-AU'; // Australian English
      
      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceIdeaCapture(transcript);
      };
      
      recognition.current.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsVoiceRecording(false);
        toast({
          title: "Voice Recognition Error",
          description: "Unable to process voice input. Please try again.",
          variant: "destructive"
        });
      };
      
      recognition.current.onend = () => {
        setIsVoiceRecording(false);
      };
      
      setIsVoiceSupported(true);
    }
    
    loadCalendarEvents();
    loadSmartIdeas();
    loadExternalCalendars();
  }, [selectedPractice, currentView]);

  const loadCalendarEvents = async () => {
    setIsLoading(true);
    try {
      const startDate = getViewStartDate(currentView);
      const endDate = getViewEndDate(currentView);
      
      let query = supabase
        .from('healthcare_calendar_events')
        .select('*')
        .eq('created_by', user?.id)
        .gte('start_datetime', startDate.toISOString())
        .lte('start_datetime', endDate.toISOString())
        .order('start_datetime', { ascending: true });
      
      if (selectedPractice !== 'all') {
        query = query.eq('practice_id', selectedPractice);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast({
        title: "Calendar Load Error",
        description: "Failed to load calendar events",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSmartIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_idea_captures')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setSmartIdeas(data || []);
    } catch (error) {
      console.error('Error loading smart ideas:', error);
    }
  };

  const loadExternalCalendars = async () => {
    try {
      const { data, error } = await supabase
        .from('external_calendar_integrations')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setExternalCalendars(data || []);
    } catch (error) {
      console.error('Error loading external calendars:', error);
    }
  };

  // Voice Idea Capture Functions
  const startVoiceCapture = () => {
    if (!isVoiceSupported || !recognition.current) {
      toast({
        title: "Voice Not Supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive"
      });
      return;
    }
    
    setIsVoiceRecording(true);
    recognition.current.start();
    
    toast({
      title: "Listening...",
      description: "Speak your content idea now"
    });
  };

  const handleVoiceIdeaCapture = async (transcript: string) => {
    console.log('Voice transcript:', transcript);
    setIdeaText(transcript);
    await processSmartIdea(transcript, 'voice');
  };

  const handleTextIdeaCapture = async () => {
    if (!ideaText.trim()) return;
    await processSmartIdea(ideaText, 'text');
    setIdeaText('');
  };

  const processSmartIdea = async (content: string, source: 'voice' | 'text') => {
    setIsAnalyzingIdea(true);
    
    try {
      // Analyze the idea with AI
      const analysisResponse = await supabase.functions.invoke('analyze-content-idea', {
        body: { 
          content, 
          source,
          healthcare_context: profile?.profession_type || 'general_practice'
        }
      });
      
      if (analysisResponse.error) throw analysisResponse.error;
      
      const analysis = analysisResponse.data;
      
      // Save the idea
      const { data: ideaData, error: saveError } = await supabase
        .from('smart_idea_captures')
        .insert({
          content,
          source,
          suggested_type: analysis.suggested_type,
          ai_analysis: analysis.analysis,
          created_by: user?.id,
          status: 'analyzed'
        })
        .select()
        .single();
      
      if (saveError) throw saveError;
      
      // Add to local state
      setSmartIdeas(prev => [ideaData, ...prev]);
      
      toast({
        title: "Idea Captured! 🧠",
        description: `AI suggests creating a ${analysis.suggested_type.replace('_', ' ')} - "${analysis.title}"`,
      });
      
      // Optionally auto-schedule if AI confidence is high
      if (analysis.confidence > 0.8 && analysis.suggested_schedule_date) {
        await scheduleIdeaAsEvent(ideaData, analysis.suggested_schedule_date);
      }
      
    } catch (error) {
      console.error('Error processing idea:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze your idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingIdea(false);
    }
  };

  const scheduleIdeaAsEvent = async (idea: SmartIdeaCapture, scheduleDate: string) => {
    try {
      const newEvent: Partial<HealthcareCalendarEvent> = {
        title: `Create ${idea.suggested_type.replace('_', ' ')}: ${idea.content.substring(0, 50)}...`,
        description: `AI-generated content idea:\n\n${idea.ai_analysis}\n\nOriginal idea: ${idea.content}`,
        start_datetime: scheduleDate,
        event_type: 'content_post',
        event_category: 'content_creation',
        practice_id: selectedPractice !== 'all' ? selectedPractice : undefined,
        content_platform: idea.suggested_type.includes('facebook') ? 'facebook' : 
                         idea.suggested_type.includes('instagram') ? 'instagram' : 
                         idea.suggested_type.includes('blog') ? 'blog' : 'website',
        priority: 'medium',
        status: 'draft',
        created_by: user?.id
      };
      
      const { data, error } = await supabase
        .from('healthcare_calendar_events')
        .insert(newEvent)
        .select()
        .single();
      
      if (error) throw error;
      
      setEvents(prev => [...prev, data]);
      
      // Update idea status
      await supabase
        .from('smart_idea_captures')
        .update({ status: 'scheduled', scheduled_date: scheduleDate })
        .eq('id', idea.id);
      
      toast({
        title: "Idea Scheduled! 📅",
        description: `Content creation scheduled for ${new Date(scheduleDate).toLocaleDateString()}`,
      });
      
    } catch (error) {
      console.error('Error scheduling idea:', error);
    }
  };

  // Drag & Drop Functions
  const handleEventDragStart = (event: HealthcareCalendarEvent) => {
    setDraggedEvent(event);
    setIsDragging(true);
  };

  const handleEventDrop = async (newDate: Date) => {
    if (!draggedEvent) return;
    
    try {
      const duration = draggedEvent.end_datetime ? 
        new Date(draggedEvent.end_datetime).getTime() - new Date(draggedEvent.start_datetime).getTime() : 
        60 * 60 * 1000; // Default 1 hour
      
      const newEndDate = new Date(newDate.getTime() + duration);
      
      const { error } = await supabase
        .from('healthcare_calendar_events')
        .update({
          start_datetime: newDate.toISOString(),
          end_datetime: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', draggedEvent.id);
      
      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === draggedEvent.id 
          ? { ...event, start_datetime: newDate.toISOString(), end_datetime: newEndDate.toISOString() }
          : event
      ));
      
      toast({
        title: "Event Rescheduled",
        description: `"${draggedEvent.title}" moved to ${newDate.toLocaleDateString()}`
      });
      
    } catch (error) {
      console.error('Error rescheduling event:', error);
      toast({
        title: "Reschedule Error",
        description: "Failed to reschedule event",
        variant: "destructive"
      });
    } finally {
      setDraggedEvent(null);
      setIsDragging(false);
    }
  };

  // Calendar Navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentView.date);
    
    switch (currentView.type) {
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
    
    setCurrentView(prev => ({ ...prev, date: newDate }));
  };

  const goToToday = () => {
    setCurrentView(prev => ({ ...prev, date: new Date() }));
  };

  const changeView = (viewType: 'month' | 'week' | 'day' | 'agenda') => {
    setCurrentView(prev => ({ ...prev, type: viewType }));
  };

  // Helper Functions
  const getViewStartDate = (view: CalendarView): Date => {
    const date = new Date(view.date);
    switch (view.type) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth(), 1);
      case 'week':
        const dayOfWeek = date.getDay();
        const startDate = new Date(date);
        startDate.setDate(date.getDate() - dayOfWeek);
        return startDate;
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      default:
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }
  };

  const getViewEndDate = (view: CalendarView): Date => {
    const date = new Date(view.date);
    switch (view.type) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      case 'week':
        const dayOfWeek = date.getDay();
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + (6 - dayOfWeek));
        return endDate;
      case 'day':
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        dayEnd.setHours(23, 59, 59, 999);
        return dayEnd;
      default:
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
  };

  const getEventColor = (event: HealthcareCalendarEvent): string => {
    switch (event.event_type) {
      case 'appointment': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'content_post': return 'bg-green-100 border-green-300 text-green-800';
      case 'practice_task': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'training': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'compliance_review': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'high': return <ArrowRight className="h-3 w-3 text-orange-600" />;
      case 'medium': return <Clock className="h-3 w-3 text-blue-600" />;
      default: return <CheckCircle className="h-3 w-3 text-gray-600" />;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'appointment': return <Stethoscope className="h-4 w-4" />;
      case 'content_post': return <FileText className="h-4 w-4" />;
      case 'practice_task': return <Settings className="h-4 w-4" />;
      case 'training': return <Brain className="h-4 w-4" />;
      case 'compliance_review': return <Eye className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || event.event_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Healthcare Calendar</h2>
          <Badge variant="secondary" className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Loading
          </Badge>
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Healthcare Calendar
          </h2>
          
          {enableMultiPractice && (
            <Select value={selectedPractice} onValueChange={setSelectedPractice}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Practice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practices</SelectItem>
                <SelectItem value="practice_1">Main Practice</SelectItem>
                <SelectItem value="practice_2">Specialist Clinic</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {enableVoiceCapture && isVoiceSupported && (
            <Button
              onClick={startVoiceCapture}
              disabled={isVoiceRecording || isAnalyzingIdea}
              variant={isVoiceRecording ? "destructive" : "outline"}
              size="sm"
            >
              <Mic className={`h-4 w-4 mr-2 ${isVoiceRecording ? 'animate-pulse' : ''}`} />
              {isVoiceRecording ? 'Listening...' : 'Voice Idea'}
            </Button>
          )}
          
          <Button
            onClick={() => setShowIdeasPanel(!showIdeasPanel)}
            variant="outline"
            size="sm"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Ideas ({smartIdeas.length})
          </Button>
          
          <Button onClick={loadCalendarEvents} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Smart Ideas Panel */}
      {showIdeasPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Smart Ideas Capture
            </CardTitle>
            <CardDescription>
              Capture content ideas with voice or text - AI will analyze and suggest scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Idea Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your content idea... (e.g., 'Write blog on winter flu prevention')"
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleTextIdeaCapture}
                    disabled={!ideaText.trim() || isAnalyzingIdea}
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  {enableVoiceCapture && isVoiceSupported && (
                    <Button
                      onClick={startVoiceCapture}
                      disabled={isVoiceRecording || isAnalyzingIdea}
                      variant="outline"
                      size="sm"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {isAnalyzingIdea && (
                <Alert>
                  <Brain className="h-4 w-4 animate-pulse" />
                  <AlertDescription>
                    AI is analyzing your idea and suggesting the best content format...
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Recent Ideas */}
              {smartIdeas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Ideas</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {smartIdeas.slice(0, 5).map((idea) => (
                      <div key={idea.id} className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{idea.content}</div>
                          <div className="text-xs text-gray-600">
                            AI suggests: {idea.suggested_type?.replace('_', ' ')}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {idea.source} • {idea.status}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => scheduleIdeaAsEvent(idea, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())}
                          size="sm"
                          variant="outline"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Navigation & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => navigateCalendar('prev')} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={goToToday} variant="outline" size="sm">
            Today
          </Button>
          <Button onClick={() => navigateCalendar('next')} variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="ml-4 text-lg font-semibold">
            {currentView.type === 'month' && currentView.date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
            {currentView.type === 'week' && `Week of ${getViewStartDate(currentView).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}`}
            {currentView.type === 'day' && currentView.date.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['month', 'week', 'day', 'agenda'] as const).map((view) => (
              <Button
                key={view}
                onClick={() => changeView(view)}
                variant={currentView.type === view ? 'default' : 'outline'}
                size="sm"
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="content_post">Content</SelectItem>
                <SelectItem value="practice_task">Practice Tasks</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="compliance_review">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {currentView.type === 'month' && (
            <MonthView 
              events={filteredEvents} 
              currentDate={currentView.date}
              onEventClick={setSelectedEvent}
              onEventDragStart={handleEventDragStart}
              onEventDrop={handleEventDrop}
              getEventColor={getEventColor}
              getEventTypeIcon={getEventTypeIcon}
              getPriorityIcon={getPriorityIcon}
            />
          )}
          
          {currentView.type === 'week' && (
            <WeekView 
              events={filteredEvents} 
              currentDate={currentView.date}
              onEventClick={setSelectedEvent}
              onEventDragStart={handleEventDragStart}
              onEventDrop={handleEventDrop}
              getEventColor={getEventColor}
              getEventTypeIcon={getEventTypeIcon}
              getPriorityIcon={getPriorityIcon}
            />
          )}
          
          {currentView.type === 'day' && (
            <DayView 
              events={filteredEvents} 
              currentDate={currentView.date}
              onEventClick={setSelectedEvent}
              onEventDragStart={handleEventDragStart}
              onEventDrop={handleEventDrop}
              getEventColor={getEventColor}
              getEventTypeIcon={getEventTypeIcon}
              getPriorityIcon={getPriorityIcon}
            />
          )}
          
          {currentView.type === 'agenda' && (
            <AgendaView 
              events={filteredEvents}
              onEventClick={setSelectedEvent}
              getEventColor={getEventColor}
              getEventTypeIcon={getEventTypeIcon}
              getPriorityIcon={getPriorityIcon}
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 md:grid-cols-4">
        <Button variant="outline" className="justify-start">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
        <Button variant="outline" className="justify-start">
          <FileText className="h-4 w-4 mr-2" />
          Schedule Content
        </Button>
        <Button variant="outline" className="justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Practice Task
        </Button>
        <Button variant="outline" className="justify-start">
          <Eye className="h-4 w-4 mr-2" />
          Compliance Review
        </Button>
      </div>

      {/* External Calendar Sync Status */}
      {externalCalendars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              External Calendar Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {externalCalendars.map((calendar) => (
                <div key={calendar.id} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{calendar.provider}</Badge>
                    <span className="text-sm">{calendar.calendar_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={calendar.sync_status === 'connected' ? 'default' : 'secondary'}>
                      {calendar.sync_status}
                    </Badge>
                    {calendar.last_sync && (
                      <span className="text-xs text-gray-500">
                        Last: {new Date(calendar.last_sync).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Calendar View Components
function MonthView({ events, currentDate, onEventClick, onEventDragStart, onEventDrop, getEventColor, getEventTypeIcon, getPriorityIcon }: any) {
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDay = startDate.getDay();
  
  const days = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 h-32 border border-gray-100"></div>);
  }
  
  // Add days of the month
  for (let day = 1; day <= endDate.getDate(); day++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = events.filter((event: any) => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === dayDate.toDateString();
    });
    
    days.push(
      <div 
        key={day} 
        className="p-2 h-32 border border-gray-100 hover:bg-gray-50 transition-colors"
        onDrop={(e) => {
          e.preventDefault();
          onEventDrop(dayDate);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="font-medium text-sm text-gray-900 mb-1">{day}</div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event: any) => (
            <div
              key={event.id}
              className={`text-xs p-1 rounded border cursor-pointer ${getEventColor(event)}`}
              draggable
              onDragStart={() => onEventDragStart(event)}
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-center gap-1">
                {getEventTypeIcon(event.event_type)}
                <span className="truncate">{event.title}</span>
                {getPriorityIcon(event.priority)}
              </div>
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-0 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600 border-b">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {days}
      </div>
    </div>
  );
}

function WeekView({ events, currentDate, onEventClick, onEventDragStart, onEventDrop, getEventColor, getEventTypeIcon, getPriorityIcon }: any) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <div className="p-4">
      <div className="grid grid-cols-8 gap-1">
        <div className="p-2"></div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-2 text-center border-b">
            <div className="font-medium">{day.toLocaleDateString('en-AU', { weekday: 'short' })}</div>
            <div className="text-lg">{day.getDate()}</div>
          </div>
        ))}
        
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="p-2 text-right text-sm text-gray-600 border-r">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map(day => {
              const cellDate = new Date(day);
              cellDate.setHours(hour);
              
              const hourEvents = events.filter((event: any) => {
                const eventStart = new Date(event.start_datetime);
                return eventStart.toDateString() === day.toDateString() && 
                       eventStart.getHours() === hour;
              });
              
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="p-1 h-12 border border-gray-100 hover:bg-gray-50"
                  onDrop={(e) => {
                    e.preventDefault();
                    onEventDrop(cellDate);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {hourEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded border cursor-pointer mb-1 ${getEventColor(event)}`}
                      draggable
                      onDragStart={() => onEventDragStart(event)}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="flex items-center gap-1">
                        {getEventTypeIcon(event.event_type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function DayView({ events, currentDate, onEventClick, onEventDragStart, onEventDrop, getEventColor, getEventTypeIcon, getPriorityIcon }: any) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <div className="p-4">
      <div className="space-y-1">
        {hours.map(hour => {
          const cellDate = new Date(currentDate);
          cellDate.setHours(hour);
          
          const hourEvents = events.filter((event: any) => {
            const eventStart = new Date(event.start_datetime);
            return eventStart.toDateString() === currentDate.toDateString() && 
                   eventStart.getHours() === hour;
          });
          
          return (
            <div key={hour} className="flex">
              <div className="w-20 p-2 text-right text-sm text-gray-600 border-r">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div
                className="flex-1 p-2 h-16 border border-gray-100 hover:bg-gray-50"
                onDrop={(e) => {
                  e.preventDefault();
                  onEventDrop(cellDate);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {hourEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className={`text-sm p-2 rounded border cursor-pointer mb-1 ${getEventColor(event)}`}
                    draggable
                    onDragStart={() => onEventDragStart(event)}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-center gap-2">
                      {getEventTypeIcon(event.event_type)}
                      <span className="font-medium">{event.title}</span>
                      {getPriorityIcon(event.priority)}
                    </div>
                    {event.description && (
                      <div className="text-xs mt-1 text-gray-600 truncate">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({ events, onEventClick, getEventColor, getEventTypeIcon, getPriorityIcon }: any) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
  );
  
  return (
    <div className="p-4 space-y-2">
      {sortedEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events found
        </div>
      ) : (
        sortedEvents.map((event: any) => (
          <div
            key={event.id}
            className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getEventColor(event)}`}
            onClick={() => onEventClick(event)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getEventTypeIcon(event.event_type)}
                  <span className="font-medium">{event.title}</span>
                  {getPriorityIcon(event.priority)}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(event.start_datetime).toLocaleDateString('en-AU', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {event.description && (
                  <div className="text-sm text-gray-600">{event.description}</div>
                )}
              </div>
              <Badge variant="outline">
                {event.event_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 