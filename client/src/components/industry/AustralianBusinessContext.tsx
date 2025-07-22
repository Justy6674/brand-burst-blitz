import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface AustralianEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  businessImpact: string;
  contentSuggestions: string[];
  type: 'tax' | 'holiday' | 'industry' | 'marketing';
}

const AUSTRALIAN_BUSINESS_EVENTS: AustralianEvent[] = [
  {
    id: 'eofy-2025',
    name: 'End of Financial Year',
    date: '2025-06-30',
    description: 'Australian financial year ends June 30th',
    businessImpact: 'Tax preparation, financial planning, and record keeping',
    contentSuggestions: [
      'EOFY tax preparation tips',
      'Financial planning for new year',
      'Record keeping best practices',
      'Professional services for EOFY'
    ],
    type: 'tax'
  },
  {
    id: 'melbourne-cup-2025',
    name: 'Melbourne Cup Day',
    date: '2025-11-04',
    description: 'The race that stops a nation',
    businessImpact: 'Reduced business activity, social media engagement opportunity',
    contentSuggestions: [
      'Melbourne Cup themed content',
      'Australian culture celebration',
      'Office party planning services',
      'Fashion and entertainment content'
    ],
    type: 'holiday'
  },
  {
    id: 'australia-day-2025',
    name: 'Australia Day',
    date: '2025-01-26',
    description: 'National day of Australia',
    businessImpact: 'National pride, local business focus, community engagement',
    contentSuggestions: [
      'Australian business values',
      'Local community support',
      'Australian-made products',
      'National pride content'
    ],
    type: 'holiday'
  },
  {
    id: 'super-contribution-deadline',
    name: 'Superannuation Contribution Deadline',
    date: '2025-06-30',
    description: 'Last day for super contributions to count for current financial year',
    businessImpact: 'Employee benefits, financial planning, tax optimization',
    contentSuggestions: [
      'Super contribution strategies',
      'Employee benefit information',
      'Retirement planning tips',
      'Tax-effective super contributions'
    ],
    type: 'tax'
  },
  {
    id: 'small-business-month',
    name: 'Small Business Month',
    date: '2025-05-01',
    description: 'Month-long celebration of small business in Australia',
    businessImpact: 'Local business promotion, community engagement, networking',
    contentSuggestions: [
      'Small business success stories',
      'Local business partnerships',
      'Community support initiatives',
      'Australian entrepreneurship'
    ],
    type: 'industry'
  }
];

interface TimeZoneInfo {
  city: string;
  timezone: string;
  currentTime: string;
  businessHours: string;
}

const AUSTRALIAN_TIMEZONES: TimeZoneInfo[] = [
  {
    city: 'Sydney/Melbourne',
    timezone: 'AEDT/AEST',
    currentTime: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }),
    businessHours: '9:00 AM - 5:00 PM'
  },
  {
    city: 'Brisbane',
    timezone: 'AEST',
    currentTime: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }),
    businessHours: '9:00 AM - 5:00 PM'
  },
  {
    city: 'Adelaide',
    timezone: 'ACDT/ACST',
    currentTime: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Adelaide' }),
    businessHours: '9:00 AM - 5:00 PM'
  },
  {
    city: 'Perth',
    timezone: 'AWST',
    currentTime: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' }),
    businessHours: '9:00 AM - 5:00 PM'
  }
];

interface AustralianBusinessContextProps {
  showUpcomingEvents?: boolean;
  showTimezoneInfo?: boolean;
  showFullContext?: boolean;
}

export const AustralianBusinessContext: React.FC<AustralianBusinessContextProps> = ({
  showUpcomingEvents = true,
  showTimezoneInfo = true,
  showFullContext = false
}) => {
  const [upcomingEvents, setUpcomingEvents] = useState<AustralianEvent[]>([]);
  const [currentTimezone, setCurrentTimezone] = useState<TimeZoneInfo | null>(null);

  useEffect(() => {
    // Get upcoming events (next 12 months)
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    const upcoming = AUSTRALIAN_BUSINESS_EVENTS.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= oneYearFromNow;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setUpcomingEvents(upcoming);

    // Detect user's likely timezone based on browser
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const australianTimezone = AUSTRALIAN_TIMEZONES.find(tz => 
      userTimezone.includes(tz.city.split('/')[0]) || 
      userTimezone.includes('Australia')
    );
    
    if (australianTimezone) {
      setCurrentTimezone(australianTimezone);
    } else {
      // Default to Sydney if not detected
      setCurrentTimezone(AUSTRALIAN_TIMEZONES[0]);
    }
  }, []);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tax': return <DollarSign className="w-4 h-4" />;
      case 'holiday': return <Calendar className="w-4 h-4" />;
      case 'industry': return <FileText className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tax': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'holiday': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'industry': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800';
    }
  };

  if (!showFullContext && !showUpcomingEvents && !showTimezoneInfo) {
    return null;
  }

  return (
    <div className="space-y-6">
      {showTimezoneInfo && currentTimezone && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Australian Business Hours
            </CardTitle>
            <CardDescription>
              Optimized content timing for Australian audiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {AUSTRALIAN_TIMEZONES.map((tz, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    tz.city === currentTimezone.city 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                    <span className="font-medium text-sm">{tz.city}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tz.timezone}</p>
                  <p className="text-xs font-mono">{tz.currentTime}</p>
                  <p className="text-xs text-muted-foreground">{tz.businessHours}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 bg-muted/20 rounded-lg p-3 border">
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Optimal Posting Times
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Business Hours:</strong> 9:00 AM - 11:00 AM, 2:00 PM - 4:00 PM</li>
                <li>• <strong>Social Media:</strong> 6:00 PM - 8:00 PM for maximum engagement</li>
                <li>• <strong>Email:</strong> Tuesday-Thursday, 10:00 AM - 12:00 PM</li>
                <li>• <strong>LinkedIn:</strong> Tuesday-Wednesday, 8:00 AM - 10:00 AM</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {showUpcomingEvents && upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Upcoming Australian Business Events
            </CardTitle>
            <CardDescription>
              Plan your content around important Australian business dates and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.slice(0, showFullContext ? upcomingEvents.length : 3).map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <Badge variant="outline" className={`mr-3 ${getEventTypeColor(event.type)}`}>
                        {getEventTypeIcon(event.type)}
                        <span className="ml-1 capitalize">{event.type}</span>
                      </Badge>
                      <div>
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-AU', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Business Impact</p>
                        <p className="text-xs text-muted-foreground">{event.businessImpact}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FileText className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Content Suggestions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.contentSuggestions.map((suggestion, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {!showFullContext && upcomingEvents.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View All {upcomingEvents.length} Upcoming Events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showFullContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              Australian Market Context
            </CardTitle>
            <CardDescription>
              Additional context for Australian business content creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/20 rounded-lg p-4 border">
                <h4 className="font-semibold mb-2">Australian English Preferences</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use Australian spelling (e.g., "colour", "realise", "centre")</li>
                  <li>• Date format: DD/MM/YYYY</li>
                  <li>• Currency: AUD with $ symbol</li>
                  <li>• Phone format: +61 or 0X XXXX XXXX</li>
                </ul>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-4 border">
                <h4 className="font-semibold mb-2">Business Etiquette</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Professional but friendly communication style</li>
                  <li>• Direct communication appreciated</li>
                  <li>• Punctuality highly valued</li>
                  <li>• Casual business culture in many industries</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h4 className="font-semibold mb-2 text-primary">Australian Content Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Reference local events, seasons, and cultural moments</li>
                <li>• Use Australian business hours for scheduling</li>
                <li>• Include local contact information and ABN when relevant</li>
                <li>• Comply with Australian advertising standards</li>
                <li>• Consider state-specific regulations where applicable</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};