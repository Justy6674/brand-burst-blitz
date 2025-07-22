import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHealthcareCompetitorAnalysis } from '@/hooks/useHealthcareCompetitorAnalysis';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { 
  Search, MapPin, Star, Shield, TrendingUp, Eye, AlertTriangle,
  Target, Brain, Users, DollarSign, CheckCircle, Zap, 
  BarChart3, Monitor, ExternalLink, Clock, Award, Activity
} from 'lucide-react';

export const HealthcareCompetitorDashboard = () => {
  const { user } = useHealthcareAuth();
  const {
    competitors,
    analysis,
    contentAnalyses,
    selectedCompetitor,
    isLoading,
    discoverCompetitors,
    analyzeCompetitorContent,
    getCompetitorComparison,
    setSelectedCompetitor,
    monitorCompetitor
  } = useHealthcareCompetitorAnalysis();

  const [searchLocation, setSearchLocation] = useState(user?.practice_locations?.[0] || 'Melbourne');
  const [analysisUrl, setAnalysisUrl] = useState('');

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (score: number) => {
    if (score >= 95) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 85) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getPositioningColor = (positioning: string) => {
    switch (positioning) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'mid-market': return 'bg-blue-100 text-blue-800';
      case 'budget': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCompetitorAnalysis = async () => {
    if (!selectedCompetitor || !analysisUrl) return;
    await analyzeCompetitorContent(selectedCompetitor.id, analysisUrl);
  };

  const competitorComparison = selectedCompetitor ? getCompetitorComparison(selectedCompetitor.id) : null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Competitor Analysis</h1>
          <p className="text-gray-600 mt-1">
            AHPRA-compliant competitive intelligence for {user?.practice_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-40"
            />
            <Button
              onClick={() => discoverCompetitors(searchLocation, user?.profession_type || 'medical', 10)}
              disabled={isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? 'Scanning...' : 'Find Competitors'}
            </Button>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Competitors</p>
                  <p className="text-3xl font-bold text-gray-900">{analysis.market_overview.total_competitors}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Market Position</p>
                  <p className="text-lg font-bold text-green-600">{analysis.positioning_insights.your_market_position}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Compliance</p>
                  <p className={`text-3xl font-bold ${getComplianceColor(analysis.compliance_benchmarking.your_score)}`}>
                    {analysis.compliance_benchmarking.your_score}%
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Market Average</p>
                  <p className={`text-3xl font-bold ${getComplianceColor(analysis.compliance_benchmarking.market_average)}`}>
                    {analysis.compliance_benchmarking.market_average}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitor List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Healthcare Competitors
            </CardTitle>
            <CardDescription>
              {user?.profession_type?.replace('_', ' ')} practices in your market
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {competitors.map((competitor) => (
              <Card 
                key={competitor.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCompetitor?.id === competitor.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedCompetitor(competitor)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{competitor.practice_name}</h3>
                        <p className="text-xs text-gray-600">{competitor.specialty}</p>
                      </div>
                      <Badge className={getComplianceBadge(competitor.compliance_score)}>
                        {competitor.compliance_score}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{competitor.location.suburb}, {competitor.location.state}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{competitor.average_rating}</span>
                        <span className="text-xs text-gray-500">({competitor.patient_reviews_count})</span>
                      </div>
                      <Badge className={getPositioningColor(competitor.market_positioning)}>
                        {competitor.market_positioning}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>AHPRA Compliance</span>
                        <span className={getComplianceColor(competitor.compliance_score)}>
                          {competitor.compliance_score}%
                        </span>
                      </div>
                      <Progress value={competitor.compliance_score} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {competitors.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No competitors found</p>
                <p className="text-sm">Try searching in a different location</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedCompetitor ? `${selectedCompetitor.practice_name} Analysis` : 'Select a Competitor'}
            </CardTitle>
            <CardDescription>
              {selectedCompetitor ? 'AHPRA compliance analysis and competitive intelligence' : 'Choose a competitor from the list to view detailed analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCompetitor ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="comparison">Compare</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Practice Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>AHPRA Registration:</span>
                            <span className="font-mono">{selectedCompetitor.ahpra_registration || 'Not found'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Specialty:</span>
                            <span>{selectedCompetitor.specialty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Market Position:</span>
                            <Badge className={getPositioningColor(selectedCompetitor.market_positioning)}>
                              {selectedCompetitor.market_positioning}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Patient Rating:</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{selectedCompetitor.average_rating} ({selectedCompetitor.patient_reviews_count} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Services Offered</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCompetitor.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Competitive Position</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-green-700 mb-1">Strengths</h5>
                            <ul className="text-sm space-y-1">
                              {selectedCompetitor.competitive_strengths.map((strength, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-red-700 mb-1">Gaps</h5>
                            <ul className="text-sm space-y-1">
                              {selectedCompetitor.competitive_gaps.map((gap, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3 text-red-600" />
                                  {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {selectedCompetitor.pricing_insights && (
                        <div>
                          <h4 className="font-semibold mb-2">Pricing Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Consultation Fee:</span>
                              <span>{selectedCompetitor.pricing_insights.consultation_fee}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bulk Billing:</span>
                              <span>{selectedCompetitor.pricing_insights.bulk_billing ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                              <span>Payment Options:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCompetitor.pricing_insights.payment_options.map((option, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => monitorCompetitor(selectedCompetitor.id)}
                      variant="outline"
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      Monitor Changes
                    </Button>
                    {selectedCompetitor.website_url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedCompetitor.website_url, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">AHPRA Compliance Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getComplianceColor(selectedCompetitor.compliance_score)}`}>
                            {selectedCompetitor.compliance_score}%
                          </div>
                          <Badge className={`mt-2 ${getComplianceBadge(selectedCompetitor.compliance_score)}`}>
                            {selectedCompetitor.compliance_score >= 95 ? 'Excellent' :
                             selectedCompetitor.compliance_score >= 85 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-2">
                            Last analyzed: {new Date(selectedCompetitor.last_analyzed).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Content Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Website or social media URL"
                              value={analysisUrl}
                              onChange={(e) => setAnalysisUrl(e.target.value)}
                            />
                            <Button
                              onClick={handleCompetitorAnalysis}
                              disabled={isLoading || !analysisUrl}
                              size="sm"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Analyze
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Analyze competitor content for AHPRA compliance violations
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {analysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Common Market Violations</CardTitle>
                        <CardDescription>
                          AHPRA compliance issues found in your market
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.compliance_benchmarking.common_violations.map((violation, index) => (
                            <Alert key={index} className="border-orange-200 bg-orange-50">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Common Violation:</strong> {violation}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Strategy Analysis</CardTitle>
                      <CardDescription>
                        How {selectedCompetitor.practice_name} approaches content marketing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Content Focus</h4>
                          <div className="space-y-2">
                            {selectedCompetitor.content_strategy.focus.map((focus, index) => (
                              <Badge key={index} variant="outline" className="block text-center">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Posting Schedule</h4>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedCompetitor.content_strategy.posting_frequency}
                            </div>
                            <p className="text-sm text-gray-600">posting frequency</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Engagement Rate</h4>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {selectedCompetitor.content_strategy.engagement_rate}%
                            </div>
                            <p className="text-sm text-gray-600">average engagement</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {contentAnalyses.filter(ca => ca.competitor_id === selectedCompetitor.id).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Content Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {contentAnalyses
                            .filter(ca => ca.competitor_id === selectedCompetitor.id)
                            .map((analysis) => (
                              <div key={analysis.content_id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h5 className="font-semibold text-sm">{analysis.platform} Content</h5>
                                    <p className="text-xs text-gray-500">
                                      {new Date(analysis.analyzed_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge className="text-xs">
                                    {analysis.content_type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-3">{analysis.content_preview}</p>
                                
                                {analysis.compliance_violations.length > 0 && (
                                  <div className="space-y-2">
                                    <h6 className="font-semibold text-xs text-red-700">Compliance Violations:</h6>
                                    {analysis.compliance_violations.map((violation, index) => (
                                      <Alert key={index} className="border-red-200 bg-red-50">
                                        <AlertTriangle className="h-3 w-3" />
                                        <AlertDescription className="text-xs">
                                          <strong>{violation.type}:</strong> {violation.description}
                                        </AlertDescription>
                                      </Alert>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="comparison" className="space-y-6">
                  {competitorComparison && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Head-to-Head Comparison</CardTitle>
                          <CardDescription>
                            Your practice vs {selectedCompetitor.practice_name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-green-700">Your Practice</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Practice Name:</span>
                                  <span className="text-sm font-medium">{competitorComparison.practice_comparison.your_practice.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Compliance Score:</span>
                                  <span className={`text-sm font-bold ${getComplianceColor(competitorComparison.practice_comparison.your_practice.compliance_score)}`}>
                                    {competitorComparison.practice_comparison.your_practice.compliance_score}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Market Position:</span>
                                  <Badge className="bg-green-100 text-green-800">
                                    {competitorComparison.practice_comparison.your_practice.positioning}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-semibold text-blue-700">Competitor</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Practice Name:</span>
                                  <span className="text-sm font-medium">{competitorComparison.practice_comparison.competitor.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Compliance Score:</span>
                                  <span className={`text-sm font-bold ${getComplianceColor(competitorComparison.practice_comparison.competitor.compliance_score)}`}>
                                    {competitorComparison.practice_comparison.competitor.compliance_score}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Market Position:</span>
                                  <Badge className={getPositioningColor(competitorComparison.practice_comparison.competitor.positioning)}>
                                    {competitorComparison.practice_comparison.competitor.positioning}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Competitive Advantages</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-semibold text-green-700 mb-2">Your Strengths</h5>
                                <ul className="space-y-1">
                                  {competitorComparison.strengths_comparison.your_strengths.map((strength, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h5 className="font-semibold text-blue-700 mb-2">Competitor Strengths</h5>
                                <ul className="space-y-1">
                                  {competitorComparison.strengths_comparison.competitor_strengths.map((strength, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="h-3 w-3 text-blue-600" />
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Strategic Recommendations</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {competitorComparison.recommendations.map((recommendation, index) => (
                                <Alert key={index} className="border-blue-200 bg-blue-50">
                                  <Zap className="h-4 w-4" />
                                  <AlertDescription className="text-sm">
                                    {recommendation}
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Competitor Selected</h3>
                <p>Choose a healthcare practice from the list to view detailed competitive analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Market Insights */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Market Intelligence & Opportunities
            </CardTitle>
            <CardDescription>
              Strategic insights for your healthcare practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-700">Market Gaps</h4>
                <div className="space-y-2">
                  {analysis.market_overview.market_gaps.map((gap, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-green-700">Content Opportunities</h4>
                <div className="space-y-2">
                  {analysis.content_opportunities.underserved_topics.map((topic, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">{topic}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-purple-700">Differentiation</h4>
                <div className="space-y-2">
                  {analysis.positioning_insights.competitive_advantages.map((advantage, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-800">{advantage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 