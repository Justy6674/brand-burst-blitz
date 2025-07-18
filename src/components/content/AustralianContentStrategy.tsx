import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, TrendingUp, FileText, Target, Lightbulb, BookOpen, Award, MapPin, Users } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useToast } from '@/hooks/use-toast';

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category: 'educational' | 'promotional' | 'seasonal' | 'industry-specific' | 'compliance';
  priority: 'high' | 'medium' | 'low';
  australianContext: string;
  estimatedEngagement: number;
  bestPostingTime: string;
  suggestedPlatforms: string[];
  complianceNotes?: string;
}

interface AustralianEvent {
  name: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  contentOpportunities: string[];
  industryRelevance: string[];
}

interface SEOKeyword {
  keyword: string;
  volume: number;
  difficulty: 'low' | 'medium' | 'high';
  australianFocus: boolean;
  businessRelevance: number;
}

const AUSTRALIAN_BUSINESS_EVENTS: AustralianEvent[] = [
  {
    name: 'End of Financial Year',
    date: 'June 30',
    impact: 'high',
    contentOpportunities: [
      'Tax planning tips',
      'EOFY business reviews',
      'Preparation checklists',
      'Accounting software guides'
    ],
    industryRelevance: ['finance', 'legal', 'general']
  },
  {
    name: 'Tax Time',
    date: 'July-August',
    impact: 'high',
    contentOpportunities: [
      'Tax deduction guides',
      'Small business tax tips',
      'Record keeping advice',
      'BAS preparation'
    ],
    industryRelevance: ['finance', 'legal', 'general']
  },
  {
    name: 'Back to School',
    date: 'February',
    impact: 'medium',
    contentOpportunities: [
      'Education sector targeting',
      'Family business content',
      'Routine establishment tips',
      'New year business planning'
    ],
    industryRelevance: ['health', 'fitness', 'general']
  },
  {
    name: 'Melbourne Cup',
    date: 'First Tuesday in November',
    impact: 'medium',
    contentOpportunities: [
      'Australian culture content',
      'Workplace culture posts',
      'Team building ideas',
      'Local business spotlights'
    ],
    industryRelevance: ['general', 'fitness', 'beauty']
  }
];

const AUSTRALIAN_SEO_KEYWORDS: SEOKeyword[] = [
  {
    keyword: 'Australian business marketing',
    volume: 2400,
    difficulty: 'medium',
    australianFocus: true,
    businessRelevance: 95
  },
  {
    keyword: 'small business Australia',
    volume: 3200,
    difficulty: 'high',
    australianFocus: true,
    businessRelevance: 90
  },
  {
    keyword: 'EOFY preparation',
    volume: 1800,
    difficulty: 'low',
    australianFocus: true,
    businessRelevance: 85
  },
  {
    keyword: 'Australian tax deductions',
    volume: 4500,
    difficulty: 'medium',
    australianFocus: true,
    businessRelevance: 80
  },
  {
    keyword: 'GST registration Australia',
    volume: 1200,
    difficulty: 'low',
    australianFocus: true,
    businessRelevance: 75
  }
];

const CONTENT_IDEAS_BY_INDUSTRY = {
  health: [
    {
      id: 'h1',
      title: 'AHPRA Compliance Guide for Health Practitioners',
      description: 'Complete guide to Australian health practitioner compliance',
      category: 'compliance' as const,
      priority: 'high' as const,
      australianContext: 'AHPRA regulations specific to Australian health professionals',
      estimatedEngagement: 85,
      bestPostingTime: '9:00 AM AEST',
      suggestedPlatforms: ['LinkedIn', 'Facebook'],
      complianceNotes: 'Ensure all health claims comply with TGA guidelines'
    },
    {
      id: 'h2',
      title: 'Medicare Bulk Billing Explained',
      description: 'Understanding Medicare billing for Australian patients',
      category: 'educational' as const,
      priority: 'high' as const,
      australianContext: 'Medicare is uniquely Australian healthcare system',
      estimatedEngagement: 75,
      bestPostingTime: '1:00 PM AEST',
      suggestedPlatforms: ['Facebook', 'Instagram']
    }
  ],
  finance: [
    {
      id: 'f1',
      title: 'EOFY Tax Strategies for Small Business',
      description: 'Maximise deductions before June 30',
      category: 'seasonal' as const,
      priority: 'high' as const,
      australianContext: 'Australian financial year ends June 30',
      estimatedEngagement: 90,
      bestPostingTime: '8:00 AM AEST',
      suggestedPlatforms: ['LinkedIn', 'Facebook']
    },
    {
      id: 'f2',
      title: 'ASIC Annual Review Requirements',
      description: 'Stay compliant with annual ASIC obligations',
      category: 'compliance' as const,
      priority: 'medium' as const,
      australianContext: 'ASIC is the Australian corporate regulator',
      estimatedEngagement: 70,
      bestPostingTime: '10:00 AM AEST',
      suggestedPlatforms: ['LinkedIn']
    }
  ],
  legal: [
    {
      id: 'l1',
      title: 'Australian Consumer Law Changes',
      description: 'Latest updates to consumer protection laws',
      category: 'industry-specific' as const,
      priority: 'high' as const,
      australianContext: 'Australian Consumer Law is federal legislation',
      estimatedEngagement: 80,
      bestPostingTime: '9:00 AM AEST',
      suggestedPlatforms: ['LinkedIn']
    },
    {
      id: 'l2',
      title: 'Privacy Act 1988 Compliance Checklist',
      description: 'Ensure your business meets privacy obligations',
      category: 'compliance' as const,
      priority: 'high' as const,
      australianContext: 'Australian Privacy Principles under Privacy Act 1988',
      estimatedEngagement: 75,
      bestPostingTime: '2:00 PM AEST',
      suggestedPlatforms: ['LinkedIn', 'Facebook']
    }
  ]
};

const AustralianContentStrategy: React.FC = () => {
  const { businessProfiles } = useBusinessProfile();
  const currentProfile = businessProfiles?.find(p => p.is_primary) || businessProfiles?.[0];
  const { toast } = useToast();
  
  const [selectedEvent, setSelectedEvent] = useState<AustralianEvent | null>(null);
  const [contentPlan, setContentPlan] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const userIndustry = currentProfile?.industry || 'general';
  const industryContentIdeas = CONTENT_IDEAS_BY_INDUSTRY[userIndustry as keyof typeof CONTENT_IDEAS_BY_INDUSTRY] || [];

  useEffect(() => {
    // Generate content plan based on industry and events
    const plan = industryContentIdeas.map(idea => ({
      ...idea,
      id: `${userIndustry}-${idea.id}`
    }));
    setContentPlan(plan);
  }, [userIndustry]);

  const handleGenerateContentPlan = async () => {
    setLoading(true);
    try {
      // Simulate content plan generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Australian Content Plan Generated",
        description: "Your personalised content strategy is ready with Australian market insights.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventsByMonth = () => {
    const eventsByMonth: { [key: string]: AustralianEvent[] } = {};
    AUSTRALIAN_BUSINESS_EVENTS.forEach(event => {
      const month = event.date.includes('-') ? event.date.split('-')[0] : event.date.split(' ')[0];
      if (!eventsByMonth[month]) {
        eventsByMonth[month] = [];
      }
      eventsByMonth[month].push(event);
    });
    return eventsByMonth;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Australian Content Strategy</h2>
          <p className="text-muted-foreground">
            SEO-optimized content planning for Australian business cycles and compliance
          </p>
        </div>
        <Button onClick={handleGenerateContentPlan} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate Content Plan
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="ideas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ideas">Content Ideas</TabsTrigger>
          <TabsTrigger value="calendar">Australian Calendar</TabsTrigger>
          <TabsTrigger value="seo">SEO Keywords</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="space-y-4">
          <div className="grid gap-4">
            {contentPlan.map((idea) => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(idea.priority)}
                      >
                        {idea.priority} priority
                      </Badge>
                      <Badge variant="secondary">
                        {idea.estimatedEngagement}% engagement
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{idea.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Australian Context:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{idea.australianContext}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Best Posting Time:</span>
                        <Badge variant="outline">{idea.bestPostingTime}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Platforms:</span>
                        <div className="flex space-x-1">
                          {idea.suggestedPlatforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {idea.complianceNotes && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Award className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-yellow-800">Compliance Note:</span>
                          <p className="text-sm text-yellow-700">{idea.complianceNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Australian Business Calendar</CardTitle>
              <CardDescription>
                Key dates and events affecting Australian business content performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {AUSTRALIAN_BUSINESS_EVENTS.map((event, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-colors ${
                      selectedEvent?.name === event.name ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {event.date}
                          </Badge>
                          <Badge 
                            variant={event.impact === 'high' ? 'default' : event.impact === 'medium' ? 'secondary' : 'outline'}
                          >
                            {event.impact} impact
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Content Opportunities:</h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {event.contentOpportunities.map((opportunity, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <Lightbulb className="h-3 w-3 text-yellow-500" />
                                <span className="text-sm">{opportunity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Relevant Industries:</h4>
                          <div className="flex flex-wrap gap-1">
                            {event.industryRelevance.map((industry) => (
                              <Badge 
                                key={industry} 
                                variant={industry === userIndustry ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {industry}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Australian SEO Keywords</CardTitle>
              <CardDescription>
                High-value keywords for Australian business targeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {AUSTRALIAN_SEO_KEYWORDS.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{keyword.keyword}</h4>
                        {keyword.australianFocus && (
                          <Badge variant="outline">🇦🇺 AU Focused</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Volume: {keyword.volume.toLocaleString()}/month</span>
                        <span>Difficulty: {keyword.difficulty}</span>
                        <span>Relevance: {keyword.businessRelevance}%</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <Badge variant="secondary">High Opportunity</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Strategy Recommendations</CardTitle>
              <CardDescription>
                Australian-specific SEO tactics for better visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Local SEO Tactics</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <Target className="h-3 w-3 text-green-500" />
                      <span>Include "Australia" in key page titles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Target className="h-3 w-3 text-green-500" />
                      <span>Target city-specific keywords (Sydney, Melbourne)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Target className="h-3 w-3 text-green-500" />
                      <span>Use Australian spelling (optimise, colour)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Target className="h-3 w-3 text-green-500" />
                      <span>Reference Australian regulations and standards</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Content Opportunities</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      <span>Australian business guides and tutorials</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      <span>Local case studies and success stories</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      <span>Industry-specific compliance content</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      <span>EOFY and tax time content series</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Australian Content Compliance Guide</CardTitle>
              <CardDescription>
                Ensure your content meets Australian advertising and industry standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Health Industry Compliance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Award className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">AHPRA Guidelines</span>
                        <p className="text-xs text-muted-foreground">No unsubstantiated health claims</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Award className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">TGA Compliance</span>
                        <p className="text-xs text-muted-foreground">Therapeutic goods advertising restrictions</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Award className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Privacy Act</span>
                        <p className="text-xs text-muted-foreground">Patient confidentiality requirements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Services Compliance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Award className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">ASIC Regulations</span>
                        <p className="text-xs text-muted-foreground">Financial advice disclaimers required</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Award className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">AFS Licence</span>
                        <p className="text-xs text-muted-foreground">Display licence details prominently</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Award className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Consumer Protection</span>
                        <p className="text-xs text-muted-foreground">Avoid misleading financial claims</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">General Advertising Standards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">ACCC Guidelines</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• No false or misleading claims</li>
                        <li>• Substantiate all product claims</li>
                        <li>• Clear pricing and terms</li>
                        <li>• Prominent disclaimers</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Privacy Requirements</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Privacy policy disclosure</li>
                        <li>• Data collection notices</li>
                        <li>• Consent mechanisms</li>
                        <li>• Data breach protocols</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Accessibility Standards</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• WCAG 2.1 AA compliance</li>
                        <li>• Alt text for images</li>
                        <li>• Clear heading structure</li>
                        <li>• Readable font sizes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AustralianContentStrategy;