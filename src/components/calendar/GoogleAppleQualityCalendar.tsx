import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
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
  Stethoscope
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
    loadCalendarEvents();
    initializeVoiceRecognition();
  }, []);

  const initializePractices = useCallback(() => {
    const samplePractices: Practice[] = [
      {
        id: 'gp-1',
        name: 'City Medical Centre',
        type: 'General Practice',
        specialty: 'Family Medicine',
        color: '#3B82F6',
        isActive: true
      },
      {
        id: 'physio-1',
        name: 'Active Health Physiotherapy',
        type: 'Allied Health',
        specialty: 'Physiotherapy',
        color: '#10B981',
        isActive: true
      },
      {
        id: 'psych-1',
        name: 'Mindful Psychology',
        type: 'Mental Health',
        specialty: 'Psychology',
        color: '#8B5CF6',
        isActive: false
      }
    ];
    setPractices(samplePractices);
  }, []);

  const loadCalendarEvents = useCallback(() => {
    // Load from localStorage in production would be Supabase
    const saved = localStorage.getItem('healthcare_calendar_events');
    if (saved) {
      const parsedEvents = JSON.parse(saved).map((e: any) => ({
        ...e,
        startDate: new Date(e.startDate),
        endDate: new Date(e.endDate)
      }));
      setEvents(parsedEvents);
    }
  }, []);

  const saveCalendarEvents = useCallback((updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    localStorage.setItem('healthcare_calendar_events', JSON.stringify(updatedEvents));
  }, []);

  // Voice Recognition Setup
  const initializeVoiceRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-AU'; // Australian English
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        handleVoiceCapture(transcript, confidence);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceRecording(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or check your microphone permissions",
          variant: "destructive"
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsVoiceRecording(false);
      };
    }
  }, [toast]);

  // Voice Capture Handler - THE SMART FUNCTIONALITY
  const handleVoiceCapture = useCallback(async (transcript: string, confidence: number) => {
    try {
      // AI Analysis of voice capture
      const analyzedContent = await analyzeVoiceCapture(transcript);
      
      const smartIdea: SmartIdeaCapture = {
        transcript,
        analyzedContent,
        createdAt: new Date()
      };
      
      setSmartIdeas(prev => [smartIdea, ...prev.slice(0, 9)]); // Keep last 10
      
      // Auto-create calendar event from voice capture
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: analyzedContent.suggestedTitle,
        description: `Voice captured: "${transcript}"\n\nAI Analysis:\n- Topic: ${analyzedContent.healthcareTopic}\n- Type: ${analyzedContent.contentType}\n- Keywords: ${analyzedContent.keywords.join(', ')}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        type: 'smart_capture',
        platform: analyzedContent.platform[0] as any || 'facebook',
        practiceId: selectedPractice === 'all' ? practices[0]?.id || 'gp-1' : selectedPractice,
        status: 'draft',
        aiGenerated: true,
        complianceScore: analyzedContent.complianceRisk === 'low' ? 95 : analyzedContent.complianceRisk === 'medium' ? 80 : 65,
        voiceCapture: {
          transcript,
          confidence
        },
        smartSuggestions: [
          `Create ${analyzedContent.contentType} about ${analyzedContent.healthcareTopic}`,
          `Use hashtags: ${analyzedContent.suggestedHashtags.join(' ')}`,
          `Target platforms: ${analyzedContent.platform.join(', ')}`,
          'Review AHPRA compliance before publishing'
        ]
      };
      
      const updatedEvents = [...events, newEvent];
      saveCalendarEvents(updatedEvents);
      
      toast({
        title: "Smart Idea Captured! 🎤",
        description: `"${transcript}" analyzed and added to calendar`,
      });
      
    } catch (error) {
      console.error('Voice capture analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Voice captured but analysis failed. Please try again.",
        variant: "destructive"
      });
    }
  }, [events, selectedPractice, practices, saveCalendarEvents, toast]);

  // AI Analysis of Voice Capture
  const analyzeVoiceCapture = useCallback(async (transcript: string): Promise<SmartIdeaCapture['analyzedContent']> => {
    // This would call OpenAI API in production
    const transcriptLower = transcript.toLowerCase();
    
    // Determine content type
    let contentType: 'blog' | 'social_post' | 'patient_education' | 'practice_update' = 'social_post';
    if (transcriptLower.includes('blog') || transcriptLower.includes('article')) contentType = 'blog';
    if (transcriptLower.includes('education') || transcriptLower.includes('patient')) contentType = 'patient_education';
    if (transcriptLower.includes('practice') || transcriptLower.includes('announcement')) contentType = 'practice_update';
    
    // Determine platforms
    const platforms: string[] = [];
    if (transcriptLower.includes('facebook')) platforms.push('facebook');
    if (transcriptLower.includes('instagram')) platforms.push('instagram');
    if (transcriptLower.includes('linkedin')) platforms.push('linkedin');
    if (platforms.length === 0) platforms.push('facebook'); // Default
    
    // Extract healthcare topics and keywords
    const healthcareKeywords = [
      'diabetes', 'heart', 'blood pressure', 'exercise', 'nutrition', 'mental health',
      'physiotherapy', 'back pain', 'injury', 'prevention', 'wellness', 'checkup',
      'vaccination', 'flu', 'covid', 'telehealth', 'appointment', 'chronic pain',
      'anxiety', 'depression', 'sleep', 'weight', 'cholesterol', 'cancer screening'
    ];
    
    const foundKeywords = healthcareKeywords.filter(keyword => 
      transcriptLower.includes(keyword)
    );
    
    const healthcareTopic = foundKeywords[0] || 'general health';
    
    // Assess compliance risk
    const riskTerms = ['cure', 'miracle', 'guaranteed', 'instant', 'revolutionary'];
    const hasRiskTerms = riskTerms.some(term => transcriptLower.includes(term));
    const complianceRisk: 'low' | 'medium' | 'high' = hasRiskTerms ? 'high' : 'low';
    
    // Generate title and hashtags
    const suggestedTitle = `${contentType === 'blog' ? 'Blog: ' : ''}${transcript.charAt(0).toUpperCase() + transcript.slice(1, 50)}${transcript.length > 50 ? '...' : ''}`;
    
    const suggestedHashtags = [
      '#HealthEducation',
      `#${healthcareTopic.replace(/\s+/g, '')}`,
      '#EvidenceBased',
      '#HealthTips'
    ];
    
    return {
      contentType,
      platform: platforms,
      keywords: foundKeywords.length > 0 ? foundKeywords : ['health', 'wellness'],
      healthcareTopic,
      complianceRisk,
      suggestedTitle,
      suggestedHashtags
    };
  }, []);

  // Voice Recording Controls
  const startVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      setIsVoiceRecording(true);
      recognitionRef.current.start();
      toast({
        title: "Voice Recording Started 🎤",
        description: "Say something like: 'Hey JB, I have a Facebook post idea about diabetes management'",
      });
    } else {
      toast({
        title: "Voice Recognition Not Available",
        description: "Please use a modern browser with microphone access",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsVoiceRecording(false);
  }, []);

  // Drag and Drop Functionality
  const handleDragStart = useCallback((event: CalendarEvent) => {
    setDraggedEvent(event);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedEvent) {
      const updatedEvent = {
        ...draggedEvent,
        startDate: targetDate,
        endDate: new Date(targetDate.getTime() + (draggedEvent.endDate.getTime() - draggedEvent.startDate.getTime()))
      };
      
      const updatedEvents = events.map(event => 
        event.id === draggedEvent.id ? updatedEvent : event
      );
      
      saveCalendarEvents(updatedEvents);
      setDraggedEvent(null);
      
      toast({
        title: "Event Moved",
        description: `"${draggedEvent.title}" moved to ${targetDate.toLocaleDateString()}`,
      });
    }
  }, [draggedEvent, events, saveCalendarEvents, toast]);

  // Calendar Navigation
  const navigateCalendar = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
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
  }, [currentDate, viewMode]);

  // Generate calendar days for month view
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days) for consistent calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Get events for specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString() &&
        (selectedPractice === 'all' || event.practiceId === selectedPractice);
    });
  }, [events, selectedPractice]);

  // Get practice color
  const getPracticeColor = useCallback((practiceId: string) => {
    const practice = practices.find(p => p.id === practiceId);
    return practice?.color || '#6B7280';
  }, [practices]);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'content_idea': return <Brain className="h-3 w-3" />;
      case 'post_scheduled': return <CalendarIcon className="h-3 w-3" />;
      case 'campaign': return <Target className="h-3 w-3" />;
      case 'appointment': return <Stethoscope className="h-3 w-3" />;
      case 'smart_capture': return <Mic className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Voice Capture */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Healthcare Content Calendar
          </h2>
          <p className="text-muted-foreground">
            Google/Apple quality calendar with AI-powered smart ideas capture
          </p>
        </div>
        
        {/* Voice Capture Button */}
        <div className="flex items-center gap-2">
          <Button
            variant={isVoiceRecording ? "destructive" : "default"}
            onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
            className="flex items-center gap-2"
          >
            {isVoiceRecording ? (
              <>
                <MicOff className="h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Voice Capture
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowSmartCapture(!showSmartCapture)}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Smart Ideas ({smartIdeas.length})
          </Button>
        </div>
      </div>

      {/* Practice Switcher */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Building2 className="h-5 w-5 text-gray-600" />
            <span className="font-medium">Practice:</span>
            <div className="flex gap-2">
              <Button
                variant={selectedPractice === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPractice('all')}
              >
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
                    backgroundColor: selectedPractice === practice.id ? practice.color : undefined,
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
          </div>
        </CardContent>
      </Card>

      {/* Smart Ideas Capture Panel */}
      {showSmartCapture && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Smart Ideas Captured
            </CardTitle>
            <CardDescription>
              AI-analyzed content ideas from voice capture
            </CardDescription>
          </CardHeader>
          <CardContent>
            {smartIdeas.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No smart ideas captured yet. Try voice recording!
              </div>
            ) : (
              <div className="space-y-3">
                {smartIdeas.map((idea, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{idea.analyzedContent.suggestedTitle}</div>
                      <Badge variant="outline">
                        {idea.analyzedContent.contentType}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">"{idea.transcript}"</p>
                    <div className="flex flex-wrap gap-1">
                      {idea.analyzedContent.suggestedHashtags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-AU', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
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