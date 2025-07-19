import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Eye, 
  Target, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Brain,
  BarChart3
} from 'lucide-react';

interface CompetitorAnalysis {
  id: string;
  competitor_id: string;
  competitor_name: string;
  analysis_results: any;
  created_at: string;
  confidence_score: number;
}

interface CompetitorInsight {
  id: string;
  title: string;
  description: string;
  insight_type: string;
  priority_score: number;
  is_actionable: boolean;
  created_at: string;
}

export function CompetitorIntelligence() {
  const [analyses, setAnalyses] = useState<CompetitorAnalysis[]>([]);
  const [insights, setInsights] = useState<CompetitorInsight[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch competitors
      const { data: competitorData, error: competitorError } = await supabase
        .from('competitor_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (competitorError) throw competitorError;
      setCompetitors(competitorData || []);

      // Fetch analyses
      const { data: analysisData, error: analysisError } = await supabase
        .from('competitive_analysis_results')
        .select(`
          *,
          competitor_data:competitor_id (
            competitor_name,
            competitor_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (analysisError) throw analysisError;
      
      const formattedAnalyses = analysisData?.map(item => ({
        ...item,
        competitor_name: item.competitor_data?.competitor_name || 'Unknown Competitor'
      })) || [];
      
      setAnalyses(formattedAnalyses);

      // Fetch insights
      const { data: insightData, error: insightError } = await supabase
        .from('competitive_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_score', { ascending: false });

      if (insightError) throw insightError;
      setInsights(insightData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Data Fetch Error",
        description: "Failed to load competitor intelligence data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (competitorId: string) => {
    setAnalyzing(competitorId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('analyze-competitor', {
        body: {
          competitorId,
          userId: user.id,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: `Competitor analysis has been completed successfully`,
      });

      await fetchData();
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze competitor",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const markInsightAsImplemented = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('competitive_insights')
        .update({ 
          is_actionable: false,
          implemented_at: new Date().toISOString()
        })
        .eq('id', insightId);

      if (error) throw error;

      toast({
        title: "Insight Implemented",
        description: "Insight has been marked as implemented"
      });

      await fetchData();
    } catch (error: any) {
      console.error('Error updating insight:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update insight",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topInsights = insights.filter(i => i.is_actionable).slice(0, 3);
  const recentAnalyses = analyses.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Competitor Intelligence</h2>
          <p className="text-muted-foreground">Real-time competitive analysis and insights</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Competitors Tracked</p>
                <p className="text-2xl font-bold">{competitors.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analyses Complete</p>
                <p className="text-2xl font-bold">{analyses.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Insights</p>
                <p className="text-2xl font-bold">{topInsights.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {analyses.length > 0 
                    ? Math.round(analyses.reduce((acc, a) => acc + a.confidence_score, 0) / analyses.length * 100)
                    : 0}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
          <TabsTrigger value="analyses">Competitor Analyses</TabsTrigger>
          <TabsTrigger value="competitors">Tracked Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Actionable Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {topInsights.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No actionable insights available.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Run competitor analyses to generate strategic insights.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topInsights.map((insight) => (
                    <Card key={insight.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{insight.title}</h4>
                              <Badge variant="secondary">
                                Priority {insight.priority_score}/10
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {insight.insight_type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {insight.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Generated: {new Date(insight.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => markInsightAsImplemented(insight.id)}
                            variant="outline"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses">
          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No competitor analyses yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Run your first analysis from the Tracked Competitors tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium">{analysis.competitor_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Analyzed: {new Date(analysis.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {Math.round(analysis.confidence_score * 100)}% Confidence
                            </Badge>
                          </div>
                        </div>

                        {analysis.analysis_results?.ai_insights && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium text-green-600 mb-2">Strengths</h5>
                              <ul className="space-y-1">
                                {analysis.analysis_results.ai_insights.strengths?.slice(0, 3).map((strength, i) => (
                                  <li key={i} className="text-muted-foreground">• {strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-red-600 mb-2">Weaknesses</h5>
                              <ul className="space-y-1">
                                {analysis.analysis_results.ai_insights.weaknesses?.slice(0, 3).map((weakness, i) => (
                                  <li key={i} className="text-muted-foreground">• {weakness}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-blue-600 mb-2">Opportunities</h5>
                              <ul className="space-y-1">
                                {analysis.analysis_results.ai_insights.opportunities?.slice(0, 3).map((opp, i) => (
                                  <li key={i} className="text-muted-foreground">• {opp}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Tracked Competitors</CardTitle>
            </CardHeader>
            <CardContent>
              {competitors.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No competitors tracked yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add competitors from the Competitors page to start analyzing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {competitors.map((competitor) => {
                    const isAnalyzing = analyzing === competitor.id;
                    const lastAnalysis = analyses.find(a => a.competitor_id === competitor.id);
                    
                    return (
                      <Card key={competitor.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{competitor.competitor_name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>{competitor.industry}</span>
                                {competitor.competitor_url && (
                                  <a 
                                    href={competitor.competitor_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-primary"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Website
                                  </a>
                                )}
                                {lastAnalysis && (
                                  <span>
                                    Last analyzed: {new Date(lastAnalysis.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => runAnalysis(competitor.id)}
                              disabled={isAnalyzing}
                              size="sm"
                            >
                              {isAnalyzing ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-4 w-4 mr-2" />
                                  Run Analysis
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}