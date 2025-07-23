import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Calendar, 
  Mic,
  Type,
  Copy,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  Target,
  Users,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SavedIdea {
  id: string;
  originalText: string;
  transcribed: boolean;
  content: {
    analysis: string;
    facebook_post: string;
    linkedin_post: string;
    blog_post: string;
    hashtags: string[];
    compliance_score: number;
    provider: 'openai' | 'gemini';
  };
  timestamp: string;
  aiInsights?: {
    viabilityScore: number;
    marketPotential: string;
    risks: string[];
    recommendations: string[];
    nextSteps: string[];
  };
}

export default function IdeasLibrary() {
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<SavedIdea | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      // For now, we'll simulate loading ideas from localStorage
      // In a real app, you'd load from Supabase
      const savedIdeas = localStorage.getItem('quick-ideas');
      if (savedIdeas) {
        const parsedIdeas = JSON.parse(savedIdeas);
        setIdeas(parsedIdeas.map((idea: any, index: number) => ({
          ...idea,
          id: idea.id || `idea-${index}`,
          aiInsights: generateAIInsights(idea)
        })));
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = (idea: SavedIdea) => {
    // Simulate AI-generated insights based on the idea content
    const keywords = idea.originalText.toLowerCase();
    
    let viabilityScore = 75;
    let marketPotential = 'Medium';
    let risks = ['Regulatory compliance', 'Market adoption'];
    let recommendations = ['Conduct market research', 'Develop MVP'];
    let nextSteps = ['Validate with target audience', 'Create business plan'];

    // Australian healthcare context
    if (keywords.includes('telehealth') || keywords.includes('digital health')) {
      viabilityScore = 85;
      marketPotential = 'High - Growing demand post-COVID';
      risks = ['Privacy regulations', 'Integration with existing systems'];
      recommendations = ['Ensure AHPRA compliance', 'Focus on user experience'];
      nextSteps = ['Consult healthcare professionals', 'Review TGA requirements'];
    }

    if (keywords.includes('ai') || keywords.includes('machine learning')) {
      viabilityScore = 80;
      marketPotential = 'High - Technology adoption increasing';
      risks = ['Algorithm bias', 'Data privacy concerns'];
      recommendations = ['Transparent AI processes', 'Robust testing protocols'];
    }

    if (keywords.includes('mental health') || keywords.includes('wellbeing')) {
      viabilityScore = 90;
      marketPotential = 'Very High - Critical need in Australia';
      risks = ['Sensitive data handling', 'Professional liability'];
      recommendations = ['Partner with mental health professionals', 'Evidence-based approaches'];
    }

    return {
      viabilityScore,
      marketPotential,
      risks,
      recommendations,
      nextSteps
    };
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied!",
      description: `${type} content copied to clipboard`,
    });
  };

  const getViabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getViabilityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
          <p>Loading your brilliant ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            Ideas Library
          </h1>
          <p className="text-muted-foreground mt-2">
            Your captured ideas with AI-powered insights and analysis
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {ideas.length} Ideas Captured
        </Badge>
      </div>

      {ideas.length === 0 ? (
        <Card className="p-12 text-center bg-muted/30">
          <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Ideas Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start capturing your brilliant healthcare innovations using the Quick Add button
          </p>
          <p className="text-sm text-muted-foreground">
            💡 Say "Hey JB" or click the floating button to get started
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ideas List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold">Your Ideas</h2>
            {ideas.map((idea) => (
              <Card 
                key={idea.id} 
                className={`cursor-pointer transition-all ${
                  selectedIdea?.id === idea.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedIdea(idea)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {idea.transcribed ? (
                        <Mic className="h-4 w-4 text-green-600" />
                      ) : (
                        <Type className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">
                        {idea.originalText}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {idea.content.provider.toUpperCase()}
                        </Badge>
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getViabilityColor(idea.aiInsights?.viabilityScore || 75)}`}>
                          {getViabilityIcon(idea.aiInsights?.viabilityScore || 75)}
                          {idea.aiInsights?.viabilityScore || 75}% Viable
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(idea.timestamp).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed View */}
          <div className="lg:col-span-2">
            {selectedIdea ? (
              <div className="space-y-6">
                {/* Idea Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {selectedIdea.transcribed ? (
                          <Mic className="h-6 w-6 text-primary" />
                        ) : (
                          <Type className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{selectedIdea.originalText}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{selectedIdea.content.provider.toUpperCase()}</Badge>
                          <Badge variant="outline">
                            AHPRA Compliance: {selectedIdea.content.compliance_score}%
                          </Badge>
                          {selectedIdea.transcribed && <Badge variant="outline">Voice Captured</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* AI Insights Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Strategic Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className={`p-4 rounded-lg border ${getViabilityColor(selectedIdea.aiInsights?.viabilityScore || 75)}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {getViabilityIcon(selectedIdea.aiInsights?.viabilityScore || 75)}
                          <h4 className="font-medium">Viability Score</h4>
                        </div>
                        <p className="text-2xl font-bold">{selectedIdea.aiInsights?.viabilityScore || 75}%</p>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium text-blue-800">Market Potential</h4>
                        </div>
                        <p className="text-sm text-blue-700">{selectedIdea.aiInsights?.marketPotential}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Key Risks
                        </h4>
                        <ul className="space-y-1">
                          {selectedIdea.aiInsights?.risks.map((risk, index) => (
                            <li key={index} className="text-sm text-muted-foreground">• {risk}</li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {selectedIdea.aiInsights?.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-muted-foreground">• {rec}</li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Next Steps
                        </h4>
                        <ul className="space-y-1">
                          {selectedIdea.aiInsights?.nextSteps.map((step, index) => (
                            <li key={index} className="text-sm text-muted-foreground">• {step}</li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Generated Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Generated Content
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Social media for engagement • Blog content for SEO • Australian healthcare focused
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="analysis" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        <TabsTrigger value="social">Social Media</TabsTrigger>
                        <TabsTrigger value="blog">Blog Content</TabsTrigger>
                        <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="analysis">
                        <Card className="p-4 bg-blue-50 border-blue-200">
                          <h5 className="font-medium mb-2 text-blue-800">AI Content Analysis:</h5>
                          <p className="text-sm text-blue-700">{selectedIdea.content.analysis}</p>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="social" className="space-y-4">
                        <Card className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-600 rounded"></div>
                              Facebook Post (Engagement Focus)
                            </h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedIdea.content.facebook_post, "Facebook")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-line bg-background p-3 rounded border">
                            {selectedIdea.content.facebook_post}
                          </p>
                        </Card>

                        <Card className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-700 rounded"></div>
                              LinkedIn Post (Professional Network)
                            </h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedIdea.content.linkedin_post, "LinkedIn")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-line bg-background p-3 rounded border">
                            {selectedIdea.content.linkedin_post}
                          </p>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="blog">
                        <Card className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-green-800">Blog Post (SEO Optimized)</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedIdea.content.blog_post, "Blog post")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm whitespace-pre-line bg-background p-4 rounded border max-h-64 overflow-y-auto">
                            {selectedIdea.content.blog_post}
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="hashtags">
                        <Card className="p-4">
                          <h5 className="font-medium mb-3">Suggested Hashtags for Maximum Reach:</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedIdea.content.hashtags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="cursor-pointer hover:bg-primary/10"
                                onClick={() => copyToClipboard(`#${tag}`, "Hashtag")}
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select an Idea</h3>
                <p className="text-muted-foreground">
                  Choose an idea from the left to view detailed AI analysis and generated content
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}