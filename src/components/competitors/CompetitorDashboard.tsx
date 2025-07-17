import React, { useState } from 'react';
import { Plus, Users, TrendingUp, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompetitorData } from '@/hooks/useCompetitorData';
import { AddCompetitorDialog } from './AddCompetitorDialog';

export const CompetitorDashboard = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { competitors, insights, isLoading, error, analyzeCompetitor } = useCompetitorData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Competitor Analysis</h2>
          <p className="text-muted-foreground">
            Track and analyze your competitors' content strategies
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Competitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors.length}</div>
            <p className="text-xs text-muted-foreground">
              Being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Insights</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis Score</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.length > 0 
                ? Math.round(insights.reduce((acc, insight) => acc + insight.priority_score, 0) / insights.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competitors List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Competitors</h3>
        {competitors.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No competitors added yet</h3>
                  <p className="text-muted-foreground">
                    Start by adding competitors to analyze their content strategies
                  </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Competitor
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competitors.map((competitor) => (
              <Card key={competitor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{competitor.competitor_name}</CardTitle>
                    <Badge variant="secondary">
                      {competitor.analysis_frequency}
                    </Badge>
                  </div>
                  <CardDescription>
                    {competitor.industry && (
                      <span className="text-sm">Industry: {competitor.industry}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {competitor.competitor_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {competitor.competitor_description}
                      </p>
                    )}
                    
                    {competitor.competitor_url && (
                      <a 
                        href={competitor.competitor_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-sm text-muted-foreground">
                        Last analyzed: {
                          competitor.last_analyzed_at 
                            ? new Date(competitor.last_analyzed_at).toLocaleDateString()
                            : 'Never'
                        }
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => analyzeCompetitor(competitor.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Insights</h3>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight) => (
              <Card key={insight.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant="outline">
                          {insight.insight_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(insight.created_at!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={insight.priority_score >= 8 ? "destructive" : 
                              insight.priority_score >= 6 ? "default" : "secondary"}
                    >
                      Priority: {insight.priority_score}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AddCompetitorDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};