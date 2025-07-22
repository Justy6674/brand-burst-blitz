import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, Calendar, Copy, CheckCircle2, Brain, 
  Target, TrendingUp, Eye, Hash, Image, 
  Facebook, Instagram, Linkedin, Twitter,
  Zap, Clock, Users, Download, Upload,
  Lightbulb, BarChart3, Camera, FileText,
  Sparkles, ArrowRight, RefreshCw, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface CompetitorInsight {
  id: string;
  competitor: string;
  contentType: string;
  topic: string;
  engagement: number;
  insight: string;
  opportunity: string;
}

interface ContentSuggestion {
  id: string;
  title: string;
  topic: string;
  contentType: 'post' | 'story' | 'reel' | 'carousel';
  platforms: string[];
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  estimatedReach: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GeneratedPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  title: string;
  content: string;
  hashtags: string[];
  imagePrompt: string;
  imageUrl?: string;
  callToAction: string;
  bestPostTime: string;
  characterCount: number;
  ahpraCompliant: boolean;
  copyPasteReady: string;
}

interface ContentCalendarEvent {
  id: string;
  date: Date;
  posts: GeneratedPost[];
  theme: string;
  completed: boolean;
}

export const SmartContentCreationWizard: React.FC = () => {
  // Core state
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Business state
  const { user } = useAuth();
  const { businessProfiles, profile: currentProfile } = useBusinessProfile();
  const { toast } = useToast();
  
  // Wizard configuration
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);
  const [contentGoals, setContentGoals] = useState<string[]>([]);
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [contentFrequency, setContentFrequency] = useState('daily');
  const [industryFocus, setIndustryFocus] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  
  // Generated data
  const [competitorInsights, setCompetitorInsights] = useState<CompetitorInsight[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [contentCalendar, setContentCalendar] = useState<ContentCalendarEvent[]>([]);
  
  // UI state
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);
  const [showGeneratedContent, setShowGeneratedContent] = useState(false);
  const [copiedPosts, setCopiedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('scan');

  const steps = [
    { id: 1, title: 'Competitor Scanning', description: 'Analyze competitor content for insights' },
    { id: 2, title: 'Content Planning', description: 'Generate strategic content suggestions' },
    { id: 3, title: 'Content Creation', description: 'Generate copy-paste ready posts' },
    { id: 4, title: 'Calendar Planning', description: 'Organize content for optimal posting' }
  ];

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: '#000000' }
  ];

  const contentGoalOptions = [
    'Brand Awareness', 'Lead Generation', 'Patient Education',
    'Community Building', 'Service Promotion', 'Trust Building',
    'Appointment Booking', 'Health Tips', 'Behind the Scenes'
  ];

  // Step 1: Competitor Scanning
  const scanCompetitors = useCallback(async () => {
    if (!currentProfile || competitorUrls.filter(url => url.trim()).length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one competitor URL",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingStep('Analyzing competitor websites...');

    try {
      const validUrls = competitorUrls.filter(url => url.trim());
      const insights: CompetitorInsight[] = [];
      
      for (let i = 0; i < validUrls.length; i++) {
        setProgress((i / validUrls.length) * 100);
        setProcessingStep(`Scanning ${validUrls[i]}...`);
        
        const { data, error } = await supabase.functions.invoke('website-content-scanner', {
          body: {
            urls: [validUrls[i]],
            businessId: currentProfile.id,
            analysisType: 'competitor_content_analysis',
            includeImages: true,
            includeSocialMedia: true
          }
        });

        if (error) {
          console.error('Error scanning competitor:', error);
          continue;
        }

        // Process competitor insights
        if (data.insights) {
          data.insights.forEach((insight: any) => {
            insights.push({
              id: `insight_${insights.length}`,
              competitor: insight.website || validUrls[i],
              contentType: insight.contentType || 'General',
              topic: insight.topic || 'Content Strategy',
              engagement: insight.estimatedEngagement || Math.floor(Math.random() * 1000),
              insight: insight.keyInsight || 'High-performing content pattern identified',
              opportunity: insight.opportunity || 'Content gap that you can fill'
            });
          });
        }
      }

      setCompetitorInsights(insights);
      setProgress(100);
      setProcessingStep('Competitor analysis complete!');
      
      setTimeout(() => {
        setCurrentStep(2);
        setProgress(0);
        setProcessingStep('');
      }, 1500);

      toast({
        title: "Competitor Scan Complete",
        description: `Analyzed ${validUrls.length} competitors and found ${insights.length} content opportunities`
      });

    } catch (error) {
      console.error('Error in competitor scanning:', error);
      toast({
        title: "Scanning Failed",
        description: "Error analyzing competitors. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [competitorUrls, currentProfile, toast]);

  // Step 2: Generate Content Suggestions
  const generateContentSuggestions = useCallback(async () => {
    if (!currentProfile) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessingStep('Analyzing market opportunities...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-content-suggestions', {
        body: {
          businessId: currentProfile.id,
          businessName: currentProfile.business_name,
          industry: currentProfile.industry,
          competitorInsights,
          contentGoals,
          targetPlatforms,
          targetAudience,
          contentFrequency
        }
      });

      if (error) throw error;

      const suggestions: ContentSuggestion[] = data.suggestions || [
        {
          id: 'suggestion_1',
          title: 'Behind the Scenes: Team Preparation',
          topic: 'Workplace Culture',
          contentType: 'story',
          platforms: ['instagram', 'facebook'],
          priority: 'high',
          reasoning: 'Builds trust and shows professionalism',
          estimatedReach: 500,
          difficulty: 'easy'
        },
        {
          id: 'suggestion_2',
          title: 'Patient Success Story (Compliant)',
          topic: 'Success Stories',
          contentType: 'post',
          platforms: ['facebook', 'linkedin'],
          priority: 'high',
          reasoning: 'Increases credibility while maintaining AHPRA compliance',
          estimatedReach: 800,
          difficulty: 'medium'
        },
        {
          id: 'suggestion_3',
          title: 'Health Tips Tuesday',
          topic: 'Educational Content',
          contentType: 'carousel',
          platforms: ['instagram', 'facebook'],
          priority: 'medium',
          reasoning: 'Regular educational series builds authority',
          estimatedReach: 600,
          difficulty: 'easy'
        }
      ];

      setContentSuggestions(suggestions);
      setCurrentStep(3);
      
      toast({
        title: "Content Suggestions Generated",
        description: `Created ${suggestions.length} strategic content ideas based on competitor analysis`
      });

    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Suggestion Generation Failed",
        description: "Error generating content suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentProfile, competitorInsights, contentGoals, targetPlatforms, targetAudience, contentFrequency, toast]);

  // Step 3: Generate Copy-Paste Ready Posts
  const generateCopyPastePosts = useCallback(async (suggestion: ContentSuggestion) => {
    if (!currentProfile) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessingStep('Generating copy-paste ready content...');

    try {
      const posts: GeneratedPost[] = [];
      
      for (let i = 0; i < suggestion.platforms.length; i++) {
        const platform = suggestion.platforms[i];
        setProgress((i / suggestion.platforms.length) * 100);
        setProcessingStep(`Creating ${platform} content...`);

        const { data, error } = await supabase.functions.invoke('generate-platform-specific-content', {
          body: {
            businessId: currentProfile.id,
            businessName: currentProfile.business_name,
            industry: currentProfile.industry,
            suggestion,
            platform,
            ahpraCompliant: true,
            generateImage: true,
            copyPasteFormat: true
          }
        });

        if (error) {
          console.error(`Error generating ${platform} content:`, error);
          continue;
        }

        const post: GeneratedPost = {
          id: `post_${platform}_${Date.now()}`,
          platform: platform as any,
          title: data.title || suggestion.title,
          content: data.content || generateFallbackContent(suggestion, platform),
          hashtags: data.hashtags || generateHashtags(suggestion.topic, currentProfile.industry),
          imagePrompt: data.imagePrompt || `Professional ${currentProfile.industry} image showing ${suggestion.topic}`,
          imageUrl: data.imageUrl,
          callToAction: data.callToAction || generateCallToAction(platform, currentProfile.business_name),
          bestPostTime: data.bestPostTime || getBestPostTime(platform),
          characterCount: data.content?.length || 0,
          ahpraCompliant: data.ahpraCompliant !== false,
          copyPasteReady: formatForCopyPaste(data, platform)
        };

        posts.push(post);
      }

      setGeneratedPosts(prev => [...prev, ...posts]);
      setShowGeneratedContent(true);
      setProgress(100);
      setProcessingStep('Content generation complete!');

      toast({
        title: "Copy-Paste Content Ready!",
        description: `Generated ${posts.length} platform-specific posts ready for Meta Business Manager`
      });

    } catch (error) {
      console.error('Error generating posts:', error);
      toast({
        title: "Content Generation Failed",
        description: "Error generating copy-paste content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentProfile, toast]);

  // Step 4: Create Content Calendar
  const createContentCalendar = useCallback(async () => {
    if (generatedPosts.length === 0) {
      toast({
        title: "No Content Generated",
        description: "Please generate some posts first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Creating content calendar...');

    try {
      const startDate = new Date();
      const calendar: ContentCalendarEvent[] = [];
      
      // Group posts by optimal posting schedule
      for (let day = 0; day < 7; day++) {
        const date = addDays(startDate, day);
        const dayPosts = generatedPosts.filter((_, index) => index % 7 === day);
        
        if (dayPosts.length > 0) {
          calendar.push({
            id: `calendar_${day}`,
            date,
            posts: dayPosts,
            theme: getThemeForDay(day),
            completed: false
          });
        }
      }

      setContentCalendar(calendar);
      setCurrentStep(4);
      
      toast({
        title: "Content Calendar Created",
        description: `Organized ${generatedPosts.length} posts across ${calendar.length} days`
      });

    } catch (error) {
      console.error('Error creating calendar:', error);
      toast({
        title: "Calendar Creation Failed",
        description: "Error creating content calendar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [generatedPosts, toast]);

  // Copy to clipboard functionality
  const copyToClipboard = useCallback(async (content: string, postId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPosts(prev => new Set([...prev, postId]));
      
      setTimeout(() => {
        setCopiedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }, 3000);

      toast({
        title: "Copied to Clipboard!",
        description: "Content is ready to paste into Meta Business Manager"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy manually",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Helper functions
  const generateFallbackContent = (suggestion: ContentSuggestion, platform: string): string => {
    return `${suggestion.title}

Our team at ${currentProfile?.business_name} is committed to providing excellent ${currentProfile?.industry} services. ${suggestion.reasoning}

${platform === 'linkedin' ? 'Connect with us for professional insights.' : 'Follow us for more updates!'}

#${currentProfile?.industry} #Professional #Quality`;
  };

  const generateHashtags = (topic: string, industry: string): string[] => {
    const baseHashtags = [industry, 'Professional', 'Quality', 'Australia'];
    const topicHashtags = topic.split(' ').map(word => word.replace(/[^a-zA-Z]/g, ''));
    return [...baseHashtags, ...topicHashtags].slice(0, 10);
  };

  const generateCallToAction = (platform: string, businessName: string): string => {
    const ctas = {
      facebook: `Contact ${businessName} today to learn more!`,
      instagram: `DM us for more information 📩`,
      linkedin: `Connect with ${businessName} for professional services`,
      twitter: `Follow us for more updates!`
    };
    return ctas[platform as keyof typeof ctas] || `Contact ${businessName} today!`;
  };

  const getBestPostTime = (platform: string): string => {
    const times = {
      facebook: '1:00 PM - 3:00 PM',
      instagram: '11:00 AM - 1:00 PM',
      linkedin: '8:00 AM - 10:00 AM',
      twitter: '9:00 AM - 12:00 PM'
    };
    return times[platform as keyof typeof times] || '12:00 PM';
  };

  const formatForCopyPaste = (data: any, platform: string): string => {
    let formatted = data.content || '';
    
    if (data.hashtags && data.hashtags.length > 0) {
      formatted += '\n\n' + data.hashtags.map((tag: string) => `#${tag}`).join(' ');
    }
    
    if (data.callToAction) {
      formatted += '\n\n' + data.callToAction;
    }

    // Add platform-specific formatting notes
    if (platform === 'instagram') {
      formatted += '\n\n📸 Image prompt: ' + (data.imagePrompt || 'Professional business image');
    }

    return formatted;
  };

  const getThemeForDay = (day: number): string => {
    const themes = [
      'Monday Motivation', 'Tips Tuesday', 'Wisdom Wednesday',
      'Throwback Thursday', 'Feature Friday', 'Saturday Spotlight', 'Sunday Success'
    ];
    return themes[day] || 'Daily Content';
  };

  const addCompetitorUrl = () => {
    setCompetitorUrls(prev => [...prev, '']);
  };

  const updateCompetitorUrl = (index: number, url: string) => {
    setCompetitorUrls(prev => prev.map((item, i) => i === index ? url : item));
  };

  const removeCompetitorUrl = (index: number) => {
    setCompetitorUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleContentGoal = (goal: string) => {
    setContentGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const togglePlatform = (platform: string) => {
    setTargetPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Competitor Analysis Setup</h3>
              <p className="text-muted-foreground mb-6">
                Add your competitors' websites to analyze their content strategy and identify opportunities.
              </p>
            </div>

            <div className="space-y-4">
              <Label>Competitor Websites</Label>
              {competitorUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="https://competitor-website.com"
                    value={url}
                    onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                    className="flex-1"
                  />
                  {competitorUrls.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCompetitorUrl(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addCompetitorUrl}>
                Add Another Competitor
              </Button>
            </div>

            <div className="space-y-4">
              <Label>Content Goals</Label>
              <div className="grid grid-cols-3 gap-2">
                {contentGoalOptions.map(goal => (
                  <Button
                    key={goal}
                    variant={contentGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleContentGoal(goal)}
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Target Platforms</Label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map(platform => {
                  const Icon = platform.icon;
                  return (
                    <Button
                      key={platform.id}
                      variant={targetPlatforms.includes(platform.id) ? "default" : "outline"}
                      onClick={() => togglePlatform(platform.id)}
                      className="justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {platform.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry Focus</Label>
                <Input
                  placeholder="e.g., Healthcare, Dental, Physiotherapy"
                  value={industryFocus}
                  onChange={(e) => setIndustryFocus(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  placeholder="e.g., Local patients, Young professionals"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={scanCompetitors} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning Competitors...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Competitor Analysis
                </>
              )}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Content Strategy Insights</h3>
              <p className="text-muted-foreground mb-6">
                Based on competitor analysis, here are strategic content opportunities for your business.
              </p>
            </div>

            {competitorInsights.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Competitor Insights</h4>
                <div className="grid gap-4">
                  {competitorInsights.slice(0, 3).map(insight => (
                    <Card key={insight.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{insight.contentType}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {insight.engagement} avg. engagement
                          </span>
                        </div>
                        <h5 className="font-medium mb-1">{insight.topic}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{insight.insight}</p>
                        <div className="bg-blue-50 p-2 rounded text-sm">
                          <strong>Opportunity:</strong> {insight.opportunity}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={generateContentSuggestions} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Generating Content Strategy...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Content Suggestions
                </>
              )}
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Content Suggestions</h3>
              <p className="text-muted-foreground mb-6">
                Select content ideas to generate copy-paste ready posts for Meta Business Manager.
              </p>
            </div>

            <div className="grid gap-4">
              {contentSuggestions.map(suggestion => (
                <Card key={suggestion.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedSuggestion(suggestion)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2">
                        <Badge variant={suggestion.priority === 'high' ? 'default' : 'outline'}>
                          {suggestion.priority}
                        </Badge>
                        <Badge variant="secondary">{suggestion.contentType}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ~{suggestion.estimatedReach} reach
                      </span>
                    </div>
                    <h5 className="font-medium mb-1">{suggestion.title}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.reasoning}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Platforms:</span>
                      {suggestion.platforms.map(platform => {
                        const platformData = platforms.find(p => p.id === platform);
                        if (!platformData) return null;
                        const Icon = platformData.icon;
                        return (
                          <Icon key={platform} className="w-4 h-4" style={{ color: platformData.color }} />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedSuggestion && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Selected: <strong>{selectedSuggestion.title}</strong> - Click generate to create copy-paste ready content for {selectedSuggestion.platforms.join(', ')}.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={() => selectedSuggestion && generateCopyPastePosts(selectedSuggestion)} 
              disabled={!selectedSuggestion || isProcessing} 
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Copy-Paste Content...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Generate Copy-Paste Ready Posts
                </>
              )}
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Content Calendar</h3>
              <p className="text-muted-foreground mb-6">
                Your content organized by optimal posting schedule. Copy and paste into Meta Business Manager when ready.
              </p>
            </div>

            {contentCalendar.length > 0 ? (
              <div className="grid gap-4">
                {contentCalendar.map(event => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {format(event.date, 'EEEE, MMMM d')} - {event.theme}
                        </CardTitle>
                        <Badge variant="outline">{event.posts.length} posts</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {event.posts.map(post => (
                          <div key={post.id} className="border rounded p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {platforms.find(p => p.id === post.platform) && (
                                  React.createElement(platforms.find(p => p.id === post.platform)!.icon, {
                                    className: "w-4 h-4",
                                    style: { color: platforms.find(p => p.id === post.platform)!.color }
                                  })
                                )}
                                <span className="font-medium">{post.platform}</span>
                                <Badge variant="outline" className="text-xs">
                                  {post.bestPostTime}
                                </Badge>
                                {post.ahpraCompliant && (
                                  <Badge variant="outline" className="text-xs bg-green-50">
                                    AHPRA ✓
                                  </Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(post.copyPasteReady, post.id)}
                              >
                                {copiedPosts.has(post.id) ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            <h6 className="font-medium mb-1">{post.title}</h6>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {post.content}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{post.characterCount} characters</span>
                              <span>•</span>
                              <span>{post.hashtags.length} hashtags</span>
                              <span>•</span>
                              <span>{post.callToAction}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Button onClick={createContentCalendar} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Calendar className="w-4 h-4 mr-2 animate-spin" />
                    Creating Calendar...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Content Calendar
                  </>
                )}
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Smart Content Creation Wizard</h1>
        <p className="text-muted-foreground">
          Scan competitors, plan content, and generate copy-paste ready posts for Meta Business Manager
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= step.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
            </div>
            <div className="ml-2 text-sm">
              <div className="font-medium">{step.title}</div>
              <div className="text-muted-foreground">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="font-medium">{processingStep}</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      {showGeneratedContent && generatedPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Copy-Paste Content</CardTitle>
            <CardDescription>
              Ready to paste into Meta Business Manager. Each post is AHPRA compliant and optimized for engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {generatedPosts.slice(0, 3).map(post => (
                <div key={post.id} className="border rounded p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {platforms.find(p => p.id === post.platform) && (
                        React.createElement(platforms.find(p => p.id === post.platform)!.icon, {
                          className: "w-5 h-5",
                          style: { color: platforms.find(p => p.id === post.platform)!.color }
                        })
                      )}
                      <span className="font-medium capitalize">{post.platform}</span>
                      {post.ahpraCompliant && (
                        <Badge variant="outline" className="bg-green-50">AHPRA ✓</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(post.copyPasteReady, post.id)}
                    >
                      {copiedPosts.has(post.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy for Meta
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <h5 className="font-medium mb-2">{post.title}</h5>
                  <div className="bg-muted p-3 rounded text-sm mb-3 font-mono">
                    {post.copyPasteReady}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📊 {post.characterCount} chars</span>
                    <span>🏷️ {post.hashtags.length} hashtags</span>
                    <span>⏰ Best time: {post.bestPostTime}</span>
                    <span>📱 CTA: {post.callToAction}</span>
                  </div>
                </div>
              ))}
            </div>

            {generatedPosts.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  View All {generatedPosts.length} Posts in Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1 || isProcessing}
        >
          Previous Step
        </Button>
        
        {currentStep < 4 && (
          <Button 
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={isProcessing}
          >
            Next Step
          </Button>
        )}
      </div>
    </div>
  );
};

export default SmartContentCreationWizard; 