import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { SmartIdeasSketchboard } from './SmartIdeasSketchboard';
import { 
  Calendar as CalendarIcon,
  Plus,
  Mic,
  MicOff,
  Sparkles,
  Users,
  Clock,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  List,
  Search,
  Filter,
  Settings,
  Zap,
  Brain,
  FileText,
  Image,
  Hash,
  Target,
  Activity,
  Building2,
  Stethoscope,
  Palette,
  Lightbulb
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'content_idea' | 'post_scheduled' | 'campaign' | 'appointment' | 'smart_capture';
  platform?: 'facebook' | 'instagram' | 'linkedin' | 'all';
  practiceId: string;
  status: 'draft' | 'scheduled' | 'published' | 'completed';
  aiGenerated?: boolean;
  complianceScore?: number;
  voiceCapture?: {
    transcript: string;
    audioUrl?: string;
    confidence: number;
  };
  smartSuggestions?: string[];
}

interface Practice {
  id: string;
  name: string;
  type: string;
  specialty: string;
  color: string;
  isActive: boolean;
}

interface SmartIdeaCapture {
  transcript: string;
  analyzedContent: {
    contentType: 'blog' | 'social_post' | 'patient_education' | 'practice_update';
    platform: string[];
    keywords: string[];
    healthcareTopic: string;
    complianceRisk: 'low' | 'medium' | 'high';
    suggestedTitle: string;
    suggestedHashtags: string[];
  };
  createdAt: Date;
}

export function GoogleAppleQualityCalendar() {
  const { toast } = useToast();
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [calendarTab, setCalendarTab] = useState<'calendar' | 'ideas'>('calendar');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<string>('all');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [smartIdeas, setSmartIdeas] = useState<SmartIdeaCapture[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [showSmartCapture, setShowSmartCapture] = useState(false);
  
  // Voice recognition refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize practices and sample data
  useEffect(() => {
    initializePractices();
    loadHealthcareEvents();
    initializeVoiceCapture();
  }, []);

  const initializePractices = useCallback(() => {
    const samplePractices: Practice[] = [
      {
        id: 'gp1',
        name: 'North Sydney GP',
        type: 'General Practice',
        specialty: 'Family Medicine',
        color: '#3b82f6',
        isActive: true
      },
      {
        id: 'allied1',
        name: 'Allied Health Centre',
        type: 'Allied Health',
        specialty: 'Physiotherapy',
        color: '#10b981',
        isActive: true
      },
      {
        id: 'specialist1',
        name: 'Cardiology Specialist',
        type: 'Specialist',
        specialty: 'Cardiology',
        color: '#f59e0b',
        isActive: false
      }
    ];
    setPractices(samplePractices);
  }, []);

  const loadHealthcareEvents = useCallback(() => {
    // Sample healthcare content events
    const sampleEvents: CalendarEvent[] = [
      {
        id: 'e1',
        title: 'Diabetes Education Blog Post',
        description: 'Complete blog post about managing diabetes during holidays',
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 86400000),
        type: 'content_idea',
        platform: 'all',
        practiceId: 'gp1',
        status: 'draft',
        aiGenerated: true,
        complianceScore: 95
      },
      {
        id: 'e2',
        title: 'Heart Health Awareness Post',
        description: 'Instagram post for World Heart Day',
        startDate: new Date(Date.now() + 172800000), // Day after tomorrow
        endDate: new Date(Date.now() + 172800000),
        type: 'post_scheduled',
        platform: 'instagram',
        practiceId: 'specialist1',
        status: 'scheduled',
        complianceScore: 92
      }
    ];
    setEvents(sampleEvents);
  }, []);

  const initializeVoiceCapture = useCallback(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-AU'; // Australian English

      recognition.onstart = () => {
        setIsVoiceRecording(true);
        toast({
          title: "Voice Capture Active",
          description: "Say something like 'Hey JB, I have a content idea...'",
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          processVoiceIdea(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceRecording(false);
        toast({
          title: "Voice Capture Error",
          description: "Please try again or check microphone permissions",
          variant: "destructive"
        });
      };

      recognitionRef.current = recognition;
    }
  }, [toast]);

  const processVoiceIdea = useCallback(async (transcript: string) => {
    setIsVoiceRecording(false);
    
    try {
      // Analyze the voice input for healthcare content
      const analyzedContent = await analyzeHealthcareVoiceInput(transcript);
      
      const smartIdea: SmartIdeaCapture = {
        transcript,
        analyzedContent,
        createdAt: new Date()
      };

      setSmartIdeas(prev => [smartIdea, ...prev]);

      // Create a calendar event from the idea
      const newEvent: CalendarEvent = {
        id: `smart_${Date.now()}`,
        title: analyzedContent.suggestedTitle,
        description: transcript,
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 86400000),
        type: 'smart_capture',
        platform: analyzedContent.platform[0] as any || 'all',
        practiceId: selectedPractice === 'all' ? practices[0]?.id || 'gp1' : selectedPractice,
        status: 'draft',
        aiGenerated: true,
        voiceCapture: {
          transcript,
          confidence: 0.85
        },
        smartSuggestions: analyzedContent.suggestedHashtags
      };

      setEvents(prev => [newEvent, ...prev]);

      toast({
        title: "Smart Idea Captured!",
        description: `Created: ${analyzedContent.suggestedTitle}`,
      });

    } catch (error) {
      console.error('Error processing voice idea:', error);
      toast({
        title: "Processing Failed",
        description: "Unable to process voice idea. Please try again.",
        variant: "destructive"
      });
    }
  }, [selectedPractice, practices, toast]);

  const analyzeHealthcareVoiceInput = async (transcript: string) => {
    // Simple AI analysis - in production this would call OpenAI
    const lower = transcript.toLowerCase();
    
    let contentType: 'blog' | 'social_post' | 'patient_education' | 'practice_update' = 'social_post';
    let platform: string[] = ['facebook'];
    let healthcareTopic = 'General Health';
    
    // Analyze content type
    if (lower.includes('blog')) contentType = 'blog';
    else if (lower.includes('education')) contentType = 'patient_education';
    else if (lower.includes('update') || lower.includes('news')) contentType = 'practice_update';
    
    // Analyze platform
    if (lower.includes('instagram')) platform = ['instagram'];
    else if (lower.includes('linkedin')) platform = ['linkedin'];
    else if (lower.includes('facebook')) platform = ['facebook'];
    
    // Analyze healthcare topic
    if (lower.includes('diabetes')) healthcareTopic = 'Diabetes';
    else if (lower.includes('heart')) healthcareTopic = 'Heart Health';
    else if (lower.includes('mental')) healthcareTopic = 'Mental Health';
    else if (lower.includes('exercise')) healthcareTopic = 'Exercise & Fitness';
    
    return {
      contentType,
      platform,
      keywords: extractKeywords(transcript),
      healthcareTopic,
      complianceRisk: 'low' as const,
      suggestedTitle: generateTitle(transcript),
      suggestedHashtags: generateHashtags(healthcareTopic)
    };
  };

  const extractKeywords = (text: string): string[] => {
    const healthcareKeywords = [
      'health', 'wellness', 'prevention', 'education', 'diabetes', 'heart',
      'exercise', 'nutrition', 'mental health', 'patient care', 'treatment'
    ];
    
    return healthcareKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
  };

  const generateTitle = (transcript: string): string => {
    const words = transcript.split(' ').slice(0, 6).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1) + '...';
  };

  const generateHashtags = (topic: string): string[] => {
    const baseHashtags = ['#HealthEducation', '#AustralianHealthcare'];
    
    switch (topic) {
      case 'Diabetes':
        return [...baseHashtags, '#DiabetesAwareness', '#BloodSugar', '#HealthyLiving'];
      case 'Heart Health':
        return [...baseHashtags, '#HeartHealth', '#Cardiology', '#Prevention'];
      case 'Mental Health':
        return [...baseHashtags, '#MentalHealthAwareness', '#Wellbeing', '#Support'];
      default:
        return [...baseHashtags, '#WellnessTips', '#PatientEducation'];
    }
  };

  const startVoiceCapture = useCallback(() => {
    if (recognitionRef.current && !isVoiceRecording) {
      recognitionRef.current.start();
    }
  }, [isVoiceRecording]);

  const stopVoiceCapture = useCallback(() => {
    if (recognitionRef.current && isVoiceRecording) {
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
    }
  }, [isVoiceRecording]);

  // Calendar navigation
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  // Calendar day generation
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  }, [currentDate]);

  // Event management
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [events]);

  const getPracticeColor = useCallback((practiceId: string): string => {
    const practice = practices.find(p => p.id === practiceId);
    return practice?.color || '#6b7280';
  }, [practices]);

  const getEventTypeIcon = useCallback((type: CalendarEvent['type']) => {
    switch (type) {
      case 'content_idea':
        return <Lightbulb className="h-3 w-3" />;
      case 'post_scheduled':
        return <Clock className="h-3 w-3" />;
      case 'smart_capture':
        return <Brain className="h-3 w-3" />;
      case 'campaign':
        return <Target className="h-3 w-3" />;
      case 'appointment':
        return <Stethoscope className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  }, []);

  // Drag and drop
  const handleDragStart = useCallback((event: CalendarEvent) => {
    setDraggedEvent(event);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedEvent) {
      const updatedEvent = {
        ...draggedEvent,
        startDate: date,
        endDate: date
      };
      setEvents(prev => prev.map(event => 
        event.id === draggedEvent.id ? updatedEvent : event
      ));
      setDraggedEvent(null);
      
      toast({
        title: "Event Moved",
        description: `${draggedEvent.title} moved to ${date.toLocaleDateString()}`,
      });
    }
  }, [draggedEvent, toast]);

  // Handle idea conversion from sketchboard
  const handleIdeaConverted = useCallback((idea: any, contentType: string) => {
    // Create a calendar event from the converted idea
    const newEvent: CalendarEvent = {
      id: `converted_${Date.now()}`,
      title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${idea.title}`,
      description: idea.content,
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 86400000),
      type: 'content_idea',
      platform: contentType === 'blog' ? 'all' : contentType as any,
      practiceId: selectedPractice === 'all' ? practices[0]?.id || 'gp1' : selectedPractice,
      status: 'draft',
      aiGenerated: true,
      complianceScore: idea.ahpra_compliance_score
    };

    setEvents(prev => [newEvent, ...prev]);

    toast({
      title: "Idea Added to Calendar!",
      description: `${idea.title} scheduled for content creation`,
    });
  }, [selectedPractice, practices, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Healthcare Content Calendar
          </h1>
          <p className="text-gray-600">
            The engine room for healthcare content planning, scheduling, and idea capture
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isVoiceRecording ? "destructive" : "outline"}
            onClick={isVoiceRecording ? stopVoiceCapture : startVoiceCapture}
            className="flex items-center gap-2"
          >
            {isVoiceRecording ? (
              <>
                <MicOff className="h-4 w-4" />
                Stop Voice
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Voice Capture
              </>
            )}
          </Button>
          
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Main Calendar Tabs */}
      <Tabs value={calendarTab} onValueChange={(value: any) => setCalendarTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar & Events
          </TabsTrigger>
          <TabsTrigger value="ideas" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Smart Ideas Sketchboard
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          {/* Practice Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Active Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={selectedPractice === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPractice('all')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-3 w-3" />
                  All Practices
                </Button>
                {practices.map(practice => (
                  <Button
                    key={practice.id}
                    variant={selectedPractice === practice.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPractice(practice.id)}
                    className="flex items-center gap-2"
                    style={{
                      backgroundColor: selectedPractice === practice.id ? practice.color : 'transparent',
                      borderColor: practice.color
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: practice.color }}
                    />
                    {practice.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'agenda' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('agenda')}
              >
                Agenda
              </Button>
            </div>
          </div>

          {/* Calendar Grid - Month View */}
          {viewMode === 'month' && (
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center font-medium border-r last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7">
                  {generateCalendarDays().map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayEvents = getEventsForDate(date);
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                          !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                        } ${isToday ? 'bg-blue-50' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, date)}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                          {date.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={() => handleDragStart(event)}
                              className="text-xs p-1 rounded cursor-move"
                              style={{ 
                                backgroundColor: getPracticeColor(event.practiceId) + '20',
                                borderLeft: `3px solid ${getPracticeColor(event.practiceId)}`
                              }}
                            >
                              <div className="flex items-center gap-1">
                                {getEventTypeIcon(event.type)}
                                <span className="truncate">{event.title}</span>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Smart Ideas Sketchboard Tab */}
        <TabsContent value="ideas">
          <SmartIdeasSketchboard 
            practiceId={selectedPractice === 'all' ? practices[0]?.id : selectedPractice}
            onIdeaConverted={handleIdeaConverted}
          />
        </TabsContent>
      </Tabs>

      {/* Voice Recording Indicator */}
      {isVoiceRecording && (
        <Alert>
          <Mic className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            <strong>Recording...</strong> Say something like "Hey JB, I have a Facebook post idea about managing diabetes during holiday season"
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 