import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  Camera,
  Play,
  Copy,
  Download,
  Share2,
  Sparkles,
  Building,
  Wrench,
  Utensils,
  Stethoscope,
  Car,
  Palette,
  Dumbbell,
  Home,
  Plus,
  CheckCircle
} from 'lucide-react';

interface DayInLifeSeries {
  id: string;
  business_name: string;
  industry: string;
  series_title: string;
  posts: DayPost[];
  hashtags: string[];
  created_at: string;
  scheduled_start: string;
}

interface DayPost {
  day: number;
  day_name: string;
  title: string;
  content: string;
  image_suggestion: string;
  best_time: string;
  engagement_tip: string;
  call_to_action: string;
}

const INDUSTRY_TEMPLATES = {
  trades: {
    icon: Wrench,
    label: 'Trades & Construction',
    series_title: 'A Week on the Worksite',
    hashtags: ['#TradesLife', '#Construction', '#Worksite', '#AustralianTrades', '#SkilledWork'],
    days: [
      {
        title: 'Monday Morning Setup',
        theme: 'Getting ready for the week',
        activities: ['tool preparation', 'site safety check', 'team briefing']
      },
      {
        title: 'Tuesday Techniques',
        theme: 'Showcasing skills and expertise',
        activities: ['demonstrating technique', 'quality workmanship', 'problem solving']
      },
      {
        title: 'Wednesday Workmanship',
        theme: 'Progress and precision',
        activities: ['project progress', 'attention to detail', 'team collaboration']
      },
      {
        title: 'Thursday Team Spirit',
        theme: 'Behind the scenes team dynamics',
        activities: ['team lunch', 'apprentice learning', 'workplace culture']
      },
      {
        title: 'Friday Finish Strong',
        theme: 'Completing projects with pride',
        activities: ['project completion', 'client satisfaction', 'weekend plans']
      }
    ]
  },
  hospitality: {
    icon: Utensils,
    label: 'Hospitality & Food Service',
    series_title: 'Behind the Kitchen Doors',
    hashtags: ['#KitchenLife', '#Hospitality', '#AustralianFood', '#ChefLife', '#Restaurant'],
    days: [
      {
        title: 'Monday Prep Day',
        theme: 'Setting up for success',
        activities: ['ingredient sourcing', 'menu planning', 'kitchen prep']
      },
      {
        title: 'Tuesday Service Excellence',
        theme: 'Delivering exceptional experiences',
        activities: ['customer service', 'dish presentation', 'team coordination']
      },
      {
        title: 'Wednesday Innovation',
        theme: 'Creativity and new ideas',
        activities: ['new recipe testing', 'seasonal ingredients', 'chef creativity']
      },
      {
        title: 'Thursday Community',
        theme: 'Connecting with locals',
        activities: ['local suppliers', 'community events', 'customer stories']
      },
      {
        title: 'Friday Celebration',
        theme: 'Weekend energy and atmosphere',
        activities: ['busy service', 'team celebration', 'weekend specials']
      }
    ]
  },
  healthcare: {
    icon: Stethoscope,
    label: 'Healthcare & Medical',
    series_title: 'Caring for Our Community',
    hashtags: ['#Healthcare', '#PatientCare', '#MedicalLife', '#Community', '#Wellness'],
    days: [
      {
        title: 'Monday Motivation',
        theme: 'Starting the week with purpose',
        activities: ['patient appointments', 'health education', 'team meetings']
      },
      {
        title: 'Tuesday Technology',
        theme: 'Modern healthcare tools',
        activities: ['medical equipment', 'digital health', 'treatment innovations']
      },
      {
        title: 'Wednesday Wellness',
        theme: 'Preventive care focus',
        activities: ['health screenings', 'wellness tips', 'lifestyle advice']
      },
      {
        title: 'Thursday Team Care',
        theme: 'Healthcare professionals',
        activities: ['staff training', 'professional development', 'team support']
      },
      {
        title: 'Friday Feel Good',
        theme: 'Positive health outcomes',
        activities: ['patient success stories', 'community health', 'weekend wellness']
      }
    ]
  },
  automotive: {
    icon: Car,
    label: 'Automotive Services',
    series_title: 'Under the Hood',
    hashtags: ['#AutoLife', '#CarCare', '#Mechanics', '#AustralianAuto', '#VehicleService'],
    days: [
      {
        title: 'Monday Motor Maintenance',
        theme: 'Keeping vehicles running smooth',
        activities: ['engine diagnostics', 'routine service', 'safety checks']
      },
      {
        title: 'Tuesday Technical Skills',
        theme: 'Expertise and craftsmanship',
        activities: ['complex repairs', 'technical knowledge', 'problem solving']
      },
      {
        title: 'Wednesday Workshop Life',
        theme: 'Behind the scenes operations',
        activities: ['workshop organisation', 'tool maintenance', 'team workflow']
      },
      {
        title: 'Thursday Customer Care',
        theme: 'Service excellence',
        activities: ['customer consultation', 'honest advice', 'quality guarantee']
      },
      {
        title: 'Friday Fast Lane',
        theme: 'Wrapping up the week',
        activities: ['final inspections', 'customer pickup', 'weekend projects']
      }
    ]
  },
  beauty: {
    icon: Palette,
    label: 'Beauty & Personal Care',
    series_title: 'Beauty Behind the Scenes',
    hashtags: ['#BeautyLife', '#SalonLife', '#BeautyCare', '#Transformation', '#SelfCare'],
    days: [
      {
        title: 'Monday Makeover',
        theme: 'Fresh start transformations',
        activities: ['client consultations', 'trend setting', 'beauty transformations']
      },
      {
        title: 'Tuesday Techniques',
        theme: 'Professional skills showcase',
        activities: ['styling techniques', 'product application', 'artistic flair']
      },
      {
        title: 'Wednesday Wellness',
        theme: 'Self-care and relaxation',
        activities: ['spa treatments', 'relaxation therapy', 'wellness advice']
      },
      {
        title: 'Thursday Trends',
        theme: 'Latest beauty innovations',
        activities: ['new products', 'trending styles', 'seasonal looks']
      },
      {
        title: 'Friday Fabulous',
        theme: 'Weekend ready looks',
        activities: ['special occasion styling', 'confidence boosting', 'weekend glamour']
      }
    ]
  },
  fitness: {
    icon: Dumbbell,
    label: 'Fitness & Sports',
    series_title: 'Training Ground Stories',
    hashtags: ['#FitnessLife', '#Training', '#HealthyLifestyle', '#Motivation', '#AustralianFitness'],
    days: [
      {
        title: 'Monday Motivation',
        theme: 'Starting strong',
        activities: ['goal setting', 'workout planning', 'motivation boost']
      },
      {
        title: 'Tuesday Technique',
        theme: 'Proper form and method',
        activities: ['exercise demonstration', 'form correction', 'safety tips']
      },
      {
        title: 'Wednesday Wellness',
        theme: 'Holistic health approach',
        activities: ['nutrition advice', 'recovery tips', 'mental wellness']
      },
      {
        title: 'Thursday Team Spirit',
        theme: 'Community and support',
        activities: ['group classes', 'member spotlights', 'team challenges']
      },
      {
        title: 'Friday Fitness Fun',
        theme: 'Celebrating progress',
        activities: ['achievement celebration', 'fun workouts', 'weekend activities']
      }
    ]
  }
};

export default function DayInLifeSocialSeriesCreator() {
  const [series, setSeries] = useState<DayInLifeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [customization, setCustomization] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', '%Day in Life%')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSeries(data?.map(item => ({
        ...JSON.parse(item.template_content),
        id: item.id,
        created_at: item.created_at
      })) || []);

    } catch (error) {
      console.error('Error loading series:', error);
      toast({
        title: "Error",
        description: "Failed to load social series",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSeries = async () => {
    if (!selectedIndustry || !businessName) {
      toast({
        title: "Missing Information",
        description: "Please select an industry and enter your business name",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const template = INDUSTRY_TEMPLATES[selectedIndustry as keyof typeof INDUSTRY_TEMPLATES];
      
      const posts: DayPost[] = template.days.map((day, index) => ({
        day: index + 1,
        day_name: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][index],
        title: day.title,
        content: generatePostContent(businessName, day, template.label),
        image_suggestion: generateImageSuggestion(day.activities),
        best_time: getBestPostTime(index),
        engagement_tip: generateEngagementTip(day.theme),
        call_to_action: generateCallToAction(day.activities, businessName)
      }));

      const newSeries: DayInLifeSeries = {
        id: crypto.randomUUID(),
        business_name: businessName,
        industry: selectedIndustry,
        series_title: template.series_title,
        posts: posts,
        hashtags: template.hashtags,
        created_at: new Date().toISOString(),
        scheduled_start: new Date().toISOString()
      };

      // Save to database
      const { error } = await supabase
        .from('content_templates')
        .insert({
          user_id: user.id,
          name: `Day in Life Series - ${businessName}`,
          type: 'social',
          template_content: JSON.stringify(newSeries),
          tags: [selectedIndustry, 'social-series']
        });

      if (error) throw error;

      toast({
        title: "Series Generated!",
        description: `Created 5-day social series for ${businessName}`
      });

      setBusinessName('');
      setSelectedIndustry('');
      setCustomization('');
      await loadSeries();

    } catch (error) {
      console.error('Error generating series:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate social series",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePostContent = (business: string, day: any, industry: string) => {
    const activities = day.activities.join(', ');
    return `${day.theme} at ${business}! Today we're focusing on ${activities}. As a leading ${industry.toLowerCase()} business, we take pride in showing you what goes on behind the scenes. ${customization ? customization + ' ' : ''}#WorkLife #BehindTheScenes`;
  };

  const generateImageSuggestion = (activities: string[]) => {
    return `Photo/video showing: ${activities[0]} - capture the authentic moment with good lighting and clear focus on the activity`;
  };

  const getBestPostTime = (dayIndex: number) => {
    const times = ['8:00 AM', '12:00 PM', '3:00 PM', '5:00 PM', '7:00 PM'];
    return times[dayIndex] || '12:00 PM';
  };

  const generateEngagementTip = (theme: string) => {
    const tips = [
      'Ask followers about their Monday routine',
      'Share a quick tip or technique',
      'Invite comments about quality work',
      'Encourage team story sharing',
      'Ask about weekend plans'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const generateCallToAction = (activities: string[], business: string) => {
    return `Want to see more of our ${activities[0]}? Follow us for daily updates and contact ${business} for your next project!`;
  };

  const copySeriesContent = async (series: DayInLifeSeries) => {
    const content = series.posts.map(post => 
      `${post.day_name} - ${post.title}\n${post.content}\n\nBest time: ${post.best_time}\nImage: ${post.image_suggestion}\n\n`
    ).join('---\n\n');
    
    await navigator.clipboard.writeText(content);
    toast({
      title: "Series Copied!",
      description: "Complete series content copied to clipboard"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Calendar className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading social series...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">"Day in the Life" Social Series Creator</h1>
          <p className="text-muted-foreground">Generate week-long social media series showcasing your business operations</p>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Create Series</TabsTrigger>
          <TabsTrigger value="library">My Series</TabsTrigger>
          <TabsTrigger value="templates">Industry Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Your Social Series
              </CardTitle>
              <CardDescription>
                Create a 5-day "Day in the Life" social media series for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name *</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Business Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry *</label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INDUSTRY_TEMPLATES).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <template.icon className="h-4 w-4" />
                            {template.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Business Personality (Optional)</label>
                <Textarea
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  placeholder="Tell us about your business personality, unique selling points, or what makes you special..."
                  rows={3}
                />
              </div>

              {selectedIndustry && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Series Preview: {INDUSTRY_TEMPLATES[selectedIndustry as keyof typeof INDUSTRY_TEMPLATES].series_title}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {INDUSTRY_TEMPLATES[selectedIndustry as keyof typeof INDUSTRY_TEMPLATES].days.map((day, index) => (
                      <div key={index} className="text-xs bg-background p-2 rounded">
                        <div className="font-medium">{day.title}</div>
                        <div className="text-muted-foreground">{day.theme}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={generateSeries}
                disabled={isGenerating || !selectedIndustry || !businessName}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Generating Series...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Generate 5-Day Series
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          {series.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Series Created Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first "Day in the Life" social series
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {series.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.series_title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Building className="h-4 w-4" />
                          {item.business_name}
                          <span className="text-muted-foreground">•</span>
                          {INDUSTRY_TEMPLATES[item.industry as keyof typeof INDUSTRY_TEMPLATES]?.label}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copySeriesContent(item)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {item.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {item.posts.map((post, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-medium">{post.day_name}</span>
                            </div>
                            <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                              {post.content}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              📸 {post.image_suggestion.split(':')[0]}
                            </div>
                            <div className="text-xs text-primary mt-1">
                              Best time: {post.best_time}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(INDUSTRY_TEMPLATES).map(([key, template]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <template.icon className="h-5 w-5" />
                    {template.label}
                  </CardTitle>
                  <CardDescription>
                    "{template.series_title}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {template.hashtags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {template.days.map((day, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{day.title}</div>
                        <div className="text-muted-foreground text-xs">{day.theme}</div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedIndustry(key);
                      // Switch to generator tab
                      const generatorTab = document.querySelector('[value="generator"]') as HTMLElement;
                      generatorTab?.click();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}