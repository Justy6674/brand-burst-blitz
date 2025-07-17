import { useState } from 'react';
import { Plus, Search, Eye, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddCompetitorDialog } from './AddCompetitorDialog';
import { useCompetitorData } from '@/hooks/useCompetitorData';

export const CompetitorDashboard = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { competitors, insights, isLoading, analyzeCompetitor } = useCompetitorData();

  const filteredCompetitors = competitors.filter(competitor =>
    competitor.competitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competitor.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isActive: boolean | null) => {
    return isActive ? (
      <Badge variant="default">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getPriorityBadge = (score: number | null) => {
    if (!score) return <Badge variant="outline">Low</Badge>;
    if (score >= 8) return <Badge variant="destructive">High</Badge>;
    if (score >= 5) return <Badge variant="default">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Competitive Intelligence</h1>
          <p className="text-muted-foreground">Monitor and analyze your competitors</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Competitors</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {competitors.filter(c => c.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority Insights</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.filter(i => (i.priority_score || 0) >= 8).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actionable Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.filter(i => i.is_actionable).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="competitors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="competitors" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search competitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredCompetitors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No competitors found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start monitoring your competition by adding your first competitor.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competitor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompetitors.map((competitor) => (
                <Card key={competitor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{competitor.competitor_name}</CardTitle>
                        <CardDescription>{competitor.industry}</CardDescription>
                      </div>
                      {getStatusBadge(competitor.is_active)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>URL:</strong> {competitor.competitor_url || 'Not provided'}</p>
                      <p><strong>Last analyzed:</strong> {formatDate(competitor.last_analyzed_at)}</p>
                      <p><strong>Frequency:</strong> {competitor.analysis_frequency}</p>
                    </div>
                    
                    {competitor.competitor_description && (
                      <p className="text-sm">{competitor.competitor_description}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => analyzeCompetitor(competitor.id)}
                        disabled={!competitor.is_active}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No insights available</h3>
                <p className="text-muted-foreground text-center">
                  Insights will appear here after analyzing your competitors.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.insight_type}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(insight.priority_score)}
                        {insight.is_actionable && (
                          <Badge variant="outline">Actionable</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{insight.description}</p>
                    {insight.recommendations && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Recommendations:</h4>
                        <pre className="text-sm whitespace-pre-wrap">
                          {typeof insight.recommendations === 'string' 
                            ? insight.recommendations 
                            : JSON.stringify(insight.recommendations, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddCompetitorDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
};