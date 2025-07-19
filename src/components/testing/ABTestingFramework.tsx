import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users, 
  Clock, 
  Play, 
  Pause, 
  Square,
  Plus,
  Eye,
  CheckCircle,
  AlertTriangle,
  Zap,
  Trophy,
  ArrowRight,
  Split
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  variants: ABVariant[];
  metrics: string[];
  trafficSplit: number[];
  results?: ABTestResults;
  createdAt: Date;
  platform: string[];
  contentType: string;
}

interface ABVariant {
  id: string;
  name: string;
  content: {
    title?: string;
    description?: string;
    image?: string;
    cta?: string;
    copy?: string;
  };
  isControl: boolean;
}

interface ABTestResults {
  totalViews: number;
  conversions: number;
  conversionRate: number;
  statisticalSignificance: number;
  winnerVariant?: string;
  confidence: number;
  variants: VariantResult[];
}

interface VariantResult {
  variantId: string;
  views: number;
  conversions: number;
  conversionRate: number;
  improvement: number;
}

export const ABTestingFramework: React.FC = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    platform: [] as string[],
    contentType: '',
    metrics: [] as string[],
    variants: [
      { name: 'Control (A)', content: {}, isControl: true },
      { name: 'Variant B', content: {}, isControl: false }
    ] as any[]
  });

  useEffect(() => {
    loadABTests();
  }, []);

  const loadABTests = async () => {
    try {
      // Generate mock A/B tests for demonstration
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Instagram CTA Button Test',
          description: 'Testing different call-to-action buttons for Instagram posts',
          status: 'running',
          startDate: new Date('2024-01-20'),
          variants: [
            {
              id: 'control',
              name: 'Control (A)',
              content: {
                title: 'Transform Your Business Today',
                cta: 'Learn More',
                copy: 'Discover how our platform can revolutionize your social media strategy.'
              },
              isControl: true
            },
            {
              id: 'variant-b',
              name: 'Variant B',
              content: {
                title: 'Transform Your Business Today',
                cta: 'Get Started Free',
                copy: 'Discover how our platform can revolutionize your social media strategy.'
              },
              isControl: false
            }
          ],
          metrics: ['click_rate', 'conversion_rate'],
          trafficSplit: [50, 50],
          platform: ['Instagram'],
          contentType: 'Post',
          createdAt: new Date('2024-01-19'),
          results: {
            totalViews: 15420,
            conversions: 892,
            conversionRate: 5.78,
            statisticalSignificance: 95.2,
            winnerVariant: 'variant-b',
            confidence: 95.2,
            variants: [
              {
                variantId: 'control',
                views: 7710,
                conversions: 401,
                conversionRate: 5.2,
                improvement: 0
              },
              {
                variantId: 'variant-b',
                views: 7710,
                conversions: 491,
                conversionRate: 6.37,
                improvement: 22.5
              }
            ]
          }
        },
        {
          id: '2',
          name: 'LinkedIn Headline Optimization',
          description: 'Testing different headlines for LinkedIn posts',
          status: 'running',
          startDate: new Date('2024-01-22'),
          variants: [
            {
              id: 'control-2',
              name: 'Control (A)',
              content: {
                title: '5 Tips for Better Social Media',
                copy: 'Learn the secrets to engaging your audience'
              },
              isControl: true
            },
            {
              id: 'variant-b-2',
              name: 'Variant B',
              content: {
                title: 'The Social Media Secrets That Actually Work',
                copy: 'Learn the secrets to engaging your audience'
              },
              isControl: false
            }
          ],
          metrics: ['engagement_rate', 'share_rate'],
          trafficSplit: [50, 50],
          platform: ['LinkedIn'],
          contentType: 'Post',
          createdAt: new Date('2024-01-21')
        },
        {
          id: '3',
          name: 'Email Subject Line Test',
          description: 'Testing subject lines for newsletter engagement',
          status: 'completed',
          startDate: new Date('2024-01-10'),
          endDate: new Date('2024-01-17'),
          variants: [
            {
              id: 'control-3',
              name: 'Control (A)',
              content: {
                title: 'Weekly Newsletter - January Edition'
              },
              isControl: true
            },
            {
              id: 'variant-b-3',
              name: 'Variant B',
              content: {
                title: '🚀 Your Weekly Dose of Growth Hacks'
              },
              isControl: false
            }
          ],
          metrics: ['open_rate', 'click_rate'],
          trafficSplit: [50, 50],
          platform: ['Email'],
          contentType: 'Newsletter',
          createdAt: new Date('2024-01-09'),
          results: {
            totalViews: 8540,
            conversions: 1281,
            conversionRate: 15.0,
            statisticalSignificance: 99.1,
            winnerVariant: 'variant-b-3',
            confidence: 99.1,
            variants: [
              {
                variantId: 'control-3',
                views: 4270,
                conversions: 554,
                conversionRate: 12.98,
                improvement: 0
              },
              {
                variantId: 'variant-b-3',
                views: 4270,
                conversions: 727,
                conversionRate: 17.03,
                improvement: 31.2
              }
            ]
          }
        }
      ];

      setTests(mockTests);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
      toast({
        title: "Error Loading Tests",
        description: "Failed to load A/B tests",
        variant: "destructive"
      });
    }
  };

  const createABTest = async () => {
    try {
      const test: ABTest = {
        id: Date.now().toString(),
        name: newTest.name,
        description: newTest.description,
        status: 'draft',
        startDate: new Date(),
        variants: newTest.variants.map((variant, index) => ({
          id: `variant-${index}`,
          name: variant.name,
          content: variant.content,
          isControl: variant.isControl
        })),
        metrics: newTest.metrics,
        trafficSplit: [50, 50], // Default 50/50 split
        platform: newTest.platform,
        contentType: newTest.contentType,
        createdAt: new Date()
      };

      setTests(prev => [test, ...prev]);
      setIsCreateDialogOpen(false);
      resetNewTest();

      toast({
        title: "A/B Test Created",
        description: "Your test has been set up and is ready to run"
      });
    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create A/B test",
        variant: "destructive"
      });
    }
  };

  const resetNewTest = () => {
    setNewTest({
      name: '',
      description: '',
      platform: [],
      contentType: '',
      metrics: [],
      variants: [
        { name: 'Control (A)', content: {}, isControl: true },
        { name: 'Variant B', content: {}, isControl: false }
      ]
    });
  };

  const updateTestStatus = async (testId: string, newStatus: ABTest['status']) => {
    setTests(prev => 
      prev.map(test => test.id === testId ? { ...test, status: newStatus } : test)
    );

    const statusMessages = {
      running: 'Test started successfully',
      paused: 'Test paused',
      completed: 'Test completed'
    };

    toast({
      title: "Status Updated",
      description: statusMessages[newStatus] || 'Status updated'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const runningTests = tests.filter(t => t.status === 'running');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">A/B Testing Framework</h1>
          <p className="text-muted-foreground">
            Test variations of your content to optimize performance and maximize engagement
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create A/B Test
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-green-600">{runningTests.length}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{completedTests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Improvement</p>
                <p className="text-2xl font-bold text-purple-600">+18.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed Tests</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid gap-6">
            {tests.filter(test => test.status !== 'completed').map(test => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        {test.name}
                      </CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                      
                      {test.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateTestStatus(test.id, 'running')}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {test.status === 'running' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateTestStatus(test.id, 'paused')}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      
                      {(test.status === 'running' || test.status === 'paused') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateTestStatus(test.id, 'completed')}
                        >
                          <Square className="w-4 h-4 mr-1" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {test.variants.map(variant => (
                      <div key={variant.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{variant.name}</h4>
                          {variant.isControl && (
                            <Badge variant="outline">Control</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {variant.content.title && (
                            <div>
                              <span className="font-medium">Title:</span> {variant.content.title}
                            </div>
                          )}
                          {variant.content.cta && (
                            <div>
                              <span className="font-medium">CTA:</span> 
                              <Badge variant="secondary" className="ml-2">
                                {variant.content.cta}
                              </Badge>
                            </div>
                          )}
                          {variant.content.copy && (
                            <div>
                              <span className="font-medium">Copy:</span> {variant.content.copy}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Platforms: {test.platform.join(', ')}</span>
                      <span>Type: {test.contentType}</span>
                      <span>Split: {test.trafficSplit.join('/')}</span>
                    </div>
                    
                    {test.results && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTest(test);
                          setIsResultsDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Results
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-6">
            {completedTests.map(test => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {test.name}
                      </CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    
                    {test.results?.winnerVariant && (
                      <div className="text-right">
                        <Badge variant="default" className="mb-1">
                          <Trophy className="w-4 h-4 mr-1" />
                          Winner Determined
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {test.results.confidence.toFixed(1)}% confidence
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {test.results && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{test.results.totalViews.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{test.results.conversions.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          +{test.results.variants.find(v => !v.variantId.includes('control'))?.improvement.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Improvement</p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => {
                      setSelectedTest(test);
                      setIsResultsDialogOpen(true);
                    }}
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Results
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Testing Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Run tests for at least 7-14 days for statistical significance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Test one element at a time for clear results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Ensure adequate sample size (min 1000 views per variant)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Wait for 95%+ confidence before declaring winners</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Elements to Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Headlines and titles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Call-to-action buttons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Images and visual content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Copy and descriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Colors and design elements</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Test Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New A/B Test</DialogTitle>
            <DialogDescription>
              Set up a new test to optimize your content performance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Name</label>
              <Input
                placeholder="e.g., Instagram CTA Button Test"
                value={newTest.name}
                onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe what you're testing and why"
                value={newTest.description}
                onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <Select 
                  value={newTest.platform[0] || ''} 
                  onValueChange={(value) => setNewTest(prev => ({ ...prev, platform: [value] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Select 
                  value={newTest.contentType} 
                  onValueChange={(value) => setNewTest(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Post">Post</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Ad">Ad</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Landing Page">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createABTest}>
                Create Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedTest?.name} - Results</DialogTitle>
            <DialogDescription>
              Detailed performance analysis of your A/B test
            </DialogDescription>
          </DialogHeader>
          
          {selectedTest?.results && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{selectedTest.results.totalViews.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{selectedTest.results.conversions.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getConfidenceColor(selectedTest.results.confidence)}`}>
                    {selectedTest.results.confidence.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {selectedTest.results.variants.map((variant, index) => {
                  const isWinner = selectedTest.results?.winnerVariant === variant.variantId;
                  return (
                    <div key={variant.variantId} className={`border rounded-lg p-4 ${isWinner ? 'border-green-500 bg-green-50' : ''}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          {selectedTest.variants.find(v => v.id === variant.variantId)?.name}
                          {isWinner && <Trophy className="w-4 h-4 text-yellow-600" />}
                        </h4>
                        <div className="text-right">
                          <div className="text-lg font-bold">{variant.conversionRate.toFixed(2)}%</div>
                          <div className="text-sm text-muted-foreground">Conversion Rate</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Views:</span> {variant.views.toLocaleString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conversions:</span> {variant.conversions.toLocaleString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Improvement:</span> 
                          <span className={variant.improvement > 0 ? 'text-green-600' : 'text-gray-600'}>
                            {variant.improvement > 0 ? '+' : ''}{variant.improvement.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <Progress value={(variant.conversionRate / 10) * 100} className="mt-3" />
                    </div>
                  );
                })}
              </div>
              
              {selectedTest.results.confidence >= 95 && selectedTest.results.winnerVariant && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Test Complete!</strong> Variant {selectedTest.variants.find(v => v.id === selectedTest.results?.winnerVariant)?.name} is the winner with {selectedTest.results.confidence.toFixed(1)}% confidence. 
                    Consider implementing this variant for improved performance.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};