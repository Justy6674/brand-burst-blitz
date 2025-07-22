import React, { useState, useEffect } from 'react';
import { useHealthcareContentCalendar } from '../../hooks/useHealthcareContentCalendar';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Users,
  Share,
  BookOpen,
  Star,
  Bell,
  Eye,
  Edit,
  Shield,
  Heart,
  Globe,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';

interface HealthcareContentCalendarProps {
  practiceId: string;
  defaultSpecialty?: string;
}

export function HealthcareContentCalendar({ 
  practiceId, 
  defaultSpecialty = 'gp' 
}: HealthcareContentCalendarProps) {
  const { user } = useHealthcareAuth();
  const {
    calendarEvents,
    contentTemplates,
    awarenessCalendar,
    currentView,
    isLoading,
    isSaving,
    createCalendarEvent,
    updateCalendarEvent,
    generateCopyPasteContent,
    getEventsForPeriod,
    getAwarenessDaysForPeriod,
    createEventFromTemplate,
    setCurrentView
  } = useHealthcareContentCalendar();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [copyPasteContent, setCopyPasteContent] = useState<any>(null);
  const [viewFilters, setViewFilters] = useState({
    specialty: '',
    platform: '',
    status: '',
    eventType: ''
  });

  const platforms = ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'website', 'email'];
  const specialties = ['gp', 'specialist', 'allied_health', 'psychology', 'dentistry', 'nursing'];
  const eventTypes = ['post', 'campaign', 'awareness_day', 'patient_education', 'practice_update'];

  // Load events for current view
  useEffect(() => {
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    getEventsForPeriod(startDate, endDate, viewFilters);
  }, [selectedDate, viewFilters, getEventsForPeriod]);

  const handleCreateEvent = async (eventData: any) => {
    const result = await createCalendarEvent({
      ...eventData,
      practiceId,
      specialty: eventData.specialty || defaultSpecialty
    });
    
    if (result.success) {
      setShowEventDialog(false);
    }
  };

  const handleCopyPasteGeneration = async (eventId: string, platform: string) => {
    try {
      const content = await generateCopyPasteContent(eventId, platform);
      setCopyPasteContent(content);
    } catch (error) {
      console.error('Error generating copy-paste content:', error);
    }
  };

  const getComplianceColor = (event: any) => {
    if (event.ahpraCompliant && event.tgaCompliant && event.professionalBoundariesChecked) {
      return 'text-green-600 border-green-200 bg-green-50';
    }
    if (event.complianceStatus === 'needs_review') {
      return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    }
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'archived': return <Eye className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold">
          {selectedDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplateDialog(true)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Templates
        </Button>
        
        <Button
          onClick={() => setShowEventDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>
    </div>
  );

  const renderCalendarFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Calendar Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Specialty</label>
            <select
              value={viewFilters.specialty}
              onChange={(e) => setViewFilters({...viewFilters, specialty: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform</label>
            <select
              value={viewFilters.platform}
              onChange={(e) => setViewFilters({...viewFilters, platform: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={viewFilters.status}
              onChange={(e) => setViewFilters({...viewFilters, status: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Type</label>
            <select
              value={viewFilters.eventType}
              onChange={(e) => setViewFilters({...viewFilters, eventType: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEventCard = (event: any) => (
    <Card key={event.id} className={`mb-4 ${getComplianceColor(event)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {getStatusIcon(event.status)}
              {event.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {new Date(event.scheduledDate).toLocaleDateString('en-AU', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {event.specialty.replace('_', ' ')}
            </Badge>
            <Badge variant={event.complianceStatus === 'approved' ? 'default' : 'destructive'} className="text-xs">
              {event.complianceStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {event.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {event.platforms.slice(0, 3).map((platform: any, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {platform.platform}
              </Badge>
            ))}
            {event.platforms.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.platforms.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {event.copyPasteReady && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedEvent(event)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedEvent(event);
                setShowEventDialog(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {(event.ahpraCompliant && event.tgaCompliant && event.professionalBoundariesChecked) && (
          <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 text-xs">
              <Shield className="h-3 w-3" />
              AHPRA & TGA Compliant • Professional Boundaries Checked
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAwarenessCalendar = () => {
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const awarenessDays = getAwarenessDaysForPeriod(startDate, endDate);
    
    return (
      <div className="space-y-4">
        {awarenessDays.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Awareness Days This Month
              </h3>
              <p className="text-gray-600">
                Check other months for healthcare awareness days and events.
              </p>
            </CardContent>
          </Card>
        ) : (
          awarenessDays.map((day, index) => (
            <Card key={index} className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Heart className="h-5 w-5" />
                  {day.name}
                </CardTitle>
                <CardDescription className="text-purple-700">
                  {new Date(day.date).toLocaleDateString('en-AU', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-800 mb-3">{day.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Relevant Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {day.relevantSpecialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-purple-700 border-purple-300">
                          {specialty.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Suggested Content</h4>
                    <ul className="list-disc list-inside text-sm text-purple-700">
                      {day.suggestedContent.slice(0, 3).map((content, idx) => (
                        <li key={idx}>{content}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Recommended Hashtags</h4>
                    <div className="flex flex-wrap gap-1">
                      {day.hashtags.map((hashtag, idx) => (
                        <Badge key={idx} variant="outline" className="text-purple-700 border-purple-300 text-xs">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => {
                      // Create event from awareness day
                      setShowEventDialog(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Create Content for This Day
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderContentTemplates = () => (
    <div className="space-y-4">
      {contentTemplates.map((template) => (
        <Card key={template.id} className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <BookOpen className="h-5 w-5" />
              {template.name}
            </CardTitle>
            <CardDescription className="text-green-700">
              {template.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800 mb-3 line-clamp-3">
              {template.content}
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Platforms</h4>
                <div className="flex flex-wrap gap-1">
                  {template.platforms.map((platform, idx) => (
                    <Badge key={idx} variant="outline" className="text-green-700 border-green-300 text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-green-800 mb-2">Hashtags</h4>
                <div className="flex flex-wrap gap-1">
                  {template.hashtags.slice(0, 5).map((hashtag, idx) => (
                    <Badge key={idx} variant="outline" className="text-green-700 border-green-300 text-xs">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-green-700">{template.effectivenessRating}/10</span>
                  </div>
                  <span className="text-xs text-green-600">
                    Used {template.usageCount} times
                  </span>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => createEventFromTemplate(template.id, selectedDate.toISOString(), practiceId)}
                  disabled={isSaving}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Use Template
                </Button>
              </div>
              
              {(template.ahpraApproved && template.tgaApproved) && (
                <div className="p-2 bg-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 text-xs">
                    <Shield className="h-3 w-3" />
                    AHPRA & TGA Pre-Approved Template
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCopyPasteDialog = () => (
    selectedEvent && (
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Copy-Paste Content: {selectedEvent.title}</DialogTitle>
            <DialogDescription>
              Select a platform to generate optimized copy-paste content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {selectedEvent.platforms.map((platform: any, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPasteGeneration(selectedEvent.id, platform.platform)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-3 w-3" />
                  {platform.platform}
                </Button>
              ))}
            </div>
            
            {copyPasteContent && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">Ready to Copy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-blue-800">Content</label>
                    <div className="p-3 bg-white border rounded-md">
                      <p className="text-sm">{copyPasteContent.content}</p>
                    </div>
                  </div>
                  
                  {copyPasteContent.hashtags && (
                    <div>
                      <label className="text-sm font-medium text-blue-800">Hashtags</label>
                      <div className="p-3 bg-white border rounded-md">
                        <p className="text-sm font-mono">{copyPasteContent.hashtags}</p>
                      </div>
                    </div>
                  )}
                  
                  {copyPasteContent.disclaimers && (
                    <div>
                      <label className="text-sm font-medium text-blue-800">Medical Disclaimers</label>
                      <div className="p-3 bg-white border rounded-md">
                        <p className="text-sm">{copyPasteContent.disclaimers}</p>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => {
                      const fullContent = [
                        copyPasteContent.content,
                        copyPasteContent.hashtags,
                        copyPasteContent.disclaimers
                      ].filter(Boolean).join('\n\n');
                      
                      navigator.clipboard.writeText(fullContent);
                    }}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Content
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Healthcare Content Calendar
          </h2>
          <p className="text-gray-600">
            Schedule AHPRA-compliant content with copy-paste workflows
          </p>
        </div>
      </div>

      {renderCalendarHeader()}
      {renderCalendarFilters()}

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendar Events</TabsTrigger>
          <TabsTrigger value="awareness">Awareness Days</TabsTrigger>
          <TabsTrigger value="templates">Content Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading calendar events...</p>
              </CardContent>
            </Card>
          ) : calendarEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Events Scheduled
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first healthcare content event to get started.
                </p>
                <Button onClick={() => setShowEventDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {calendarEvents.map(renderEventCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="awareness" className="space-y-6">
          {renderAwarenessCalendar()}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {renderContentTemplates()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <MoreHorizontal className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Calendar Analytics
              </h3>
              <p className="text-gray-600">
                Analytics and insights for your healthcare content calendar coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderCopyPasteDialog()}
    </div>
  );
} 