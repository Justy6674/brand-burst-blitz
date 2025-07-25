import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Target, 
  Brain, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Building,
  MapPin,
  Stethoscope,
  ExternalLink,
  Copy,
  FileText,
  Lightbulb,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WebsiteAnalysis {
  id: string;
  website_url: string;
  domain_name: string;
  services_identified: string[];
  locations_identified: string[];
  current_subdomain_count: number;
  analysis_status: string;
  scraped_content: any;
}

interface SubdomainOpportunity {
  id: string;
  suggested_subdomain: string;
  full_subdomain_url: string;
  opportunity_type: string;
  target_keywords: string[];
  content_strategy: any;
  estimated_monthly_searches: number;
  competition_level: string;
  implementation_priority: number;
  roi_projection: {
    estimated_traffic: number;
    potential_conversions: number;
    revenue_potential: number;
  };
  implementation_difficulty: string;
  content_suggestions: string[];
}

interface CompetitorAnalysis {
  competitor_url: string;
  competitor_domain: string;
  subdomains_found: string[];
  estimated_traffic: number;
}

export const SEOExpansionWizard: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [opportunities, setOpportunities] = useState<SubdomainOpportunity[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

  const addCompetitorField = () => {
    if (competitorUrls.length < 5) {
      setCompetitorUrls([...competitorUrls, '']);
    }
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  const removeCompetitorField = (index: number) => {
    if (competitorUrls.length > 1) {
      const newUrls = competitorUrls.filter((_, i) => i !== index);
      setCompetitorUrls(newUrls);
    }
  };

  const startAnalysis = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter your website URL');
      return;
    }

    if (!user) {
      toast.error('Please log in to use the SEO scanner');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Start website analysis
      const { data, error } = await supabase.functions.invoke('subdomain-website-analyzer', {
        body: {
          website_url: websiteUrl.trim(),
          competitor_urls: competitorUrls.filter(url => url.trim())
        }
      });

      if (error) throw error;

      // Fetch analysis results
      const { data: analysisData, error: analysisError } = await supabase
        .from('website_analyses')
        .select(`
          *,
          competitor_analyses(*),
          subdomain_opportunities(*)
        `)
        .eq('id', data.analysis_id)
        .single();

      if (analysisError) throw analysisError;

      setAnalysis(analysisData);
      setOpportunities(analysisData.subdomain_opportunities || []);
      setCompetitors(analysisData.competitor_analyses || []);

      // Generate advanced strategies
      const { data: strategiesData, error: strategiesError } = await supabase.functions.invoke('ai-subdomain-strategist', {
        body: {
          analysis_id: data.analysis_id,
          enhancement_level: 'advanced'
        }
      });

      if (strategiesError) throw strategiesError;

      // Refresh opportunities with enhanced data
      const { data: enhancedOpportunities, error: enhancedError } = await supabase
        .from('subdomain_opportunities')
        .select('*')
        .eq('website_analysis_id', data.analysis_id)
        .order('implementation_priority', { ascending: false });

      if (enhancedError) throw enhancedError;

      setOpportunities(enhancedOpportunities || []);
      setStep(2);
      toast.success('Website analysis completed! Found ' + (enhancedOpportunities?.length || 0) + ' subdomain opportunities.');

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleOpportunitySelection = (opportunityId: string) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportImplementationPlan = () => {
    const selectedOps = opportunities.filter(op => selectedOpportunities.includes(op.id));
    
    let plan = `SEO Subdomain Expansion Plan\n`;
    plan += `Generated: ${new Date().toLocaleDateString('en-AU')}\n`;
    plan += `Website: ${analysis?.website_url}\n\n`;
    
    selectedOps.forEach((op, index) => {
      plan += `${index + 1}. ${op.suggested_subdomain}.${analysis?.domain_name}\n`;
      plan += `   Type: ${op.opportunity_type}\n`;
      plan += `   Priority: ${op.implementation_priority}/10\n`;
      plan += `   Monthly Searches: ${op.estimated_monthly_searches.toLocaleString()}\n`;
      plan += `   Revenue Potential: $${op.roi_projection.revenue_potential.toLocaleString()}/year\n`;
      plan += `   Keywords: ${op.target_keywords.join(', ')}\n`;
      plan += `   Difficulty: ${op.implementation_difficulty}\n\n`;
    });

    const blob = new Blob([plan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-expansion-plan-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Implementation plan exported');
  };

  const getOpportunityTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return <Stethoscope className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'specialty_centre': return <Building className="w-4 h-4" />;
      case 'patient_education': return <FileText className="w-4 h-4" />;
      case 'service_portal': return <Globe className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'complex': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SEO Expansion Wizard</h1>
            <p className="text-muted-foreground">Discover subdomain opportunities to expand your healthcare practice's online presence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <Progress value={step === 1 ? 25 : step === 2 ? 75 : 100} className="flex-1" />
          <Badge variant="outline" className="px-3 py-1">
            Step {step} of 3
          </Badge>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Website Analysis Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Your Website URL</Label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://your-practice.com.au"
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Competitor Websites (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCompetitorField}
                  disabled={competitorUrls.length >= 5}
                >
                  Add Competitor
                </Button>
              </div>
              
              {competitorUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={url}
                    onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                    placeholder="https://competitor-practice.com.au"
                  />
                  {competitorUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCompetitorField(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This tool will analyse your website and competitors to identify subdomain opportunities for Australian healthcare practices. 
                All analysis respects robots.txt and follows ethical scraping practices.
              </AlertDescription>
            </Alert>

            <Button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Analysing Website...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && analysis && (
        <div className="space-y-6">
          {/* Analysis Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Opportunities Found</p>
                    <p className="text-2xl font-bold">{opportunities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Search Volume</p>
                    <p className="text-2xl font-bold">
                      {opportunities.reduce((sum, op) => sum + op.estimated_monthly_searches, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Potential</p>
                    <p className="text-2xl font-bold">
                      ${opportunities.reduce((sum, op) => sum + op.roi_projection.revenue_potential, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Website Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Website Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Services Identified ({analysis.services_identified?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.services_identified?.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Locations Identified ({analysis.locations_identified?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.locations_identified?.map((location, index) => (
                      <Badge key={index} variant="outline">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subdomain Opportunities</span>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedOpportunities.length === 0}
                  variant="default"
                >
                  Review Selected ({selectedOpportunities.length})
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities
                  .sort((a, b) => b.implementation_priority - a.implementation_priority)
                  .map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedOpportunities.includes(opportunity.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleOpportunitySelection(opportunity.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {getOpportunityTypeIcon(opportunity.opportunity_type)}
                            <h3 className="font-semibold text-lg">
                              {opportunity.suggested_subdomain}.{analysis.domain_name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(opportunity.full_subdomain_url);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <Badge className={getDifficultyColor(opportunity.implementation_difficulty) + ' text-white'}>
                            {opportunity.implementation_difficulty}
                          </Badge>
                          <Badge className={getCompetitionColor(opportunity.competition_level)}>
                            {opportunity.competition_level} competition
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {opportunity.estimated_monthly_searches.toLocaleString()} searches/month
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              ${opportunity.roi_projection.revenue_potential.toLocaleString()}/year potential
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              Priority: {opportunity.implementation_priority}/10
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-1">Target Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.target_keywords.slice(0, 5).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {opportunity.target_keywords.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{opportunity.target_keywords.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Content Suggestions:</p>
                          <ul className="text-sm space-y-1">
                            {opportunity.content_suggestions.slice(0, 3).map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Lightbulb className="w-3 h-3 mt-1 text-yellow-500 flex-shrink-0" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="ml-4">
                        {selectedOpportunities.includes(opportunity.id) ? (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        ) : (
                          <div className="w-5 h-5 border border-gray-300 rounded" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Analysis */}
          {competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitors.map((competitor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          <span className="font-semibold">{competitor.competitor_domain}</span>
                        </div>
                        <Badge variant="outline">
                          {competitor.estimated_traffic?.toLocaleString() || 0} monthly visits
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Subdomains Found: {competitor.subdomains_found?.length || 0}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {competitor.subdomains_found?.slice(0, 8).map((subdomain, subIndex) => (
                            <Badge key={subIndex} variant="secondary" className="text-xs">
                              {subdomain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Implementation Plan</span>
                <div className="flex gap-2">
                  <Button onClick={() => setStep(2)} variant="outline">
                    Back to Selection
                  </Button>
                  <Button onClick={exportImplementationPlan}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Plan
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {opportunities
                  .filter(op => selectedOpportunities.includes(op.id))
                  .sort((a, b) => b.implementation_priority - a.implementation_priority)
                  .map((opportunity, index) => (
                  <div key={opportunity.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {index + 1}. {opportunity.suggested_subdomain}.{analysis?.domain_name}
                        </h3>
                        <div className="flex items-center gap-4 mb-3">
                          <Badge variant="default">Priority {opportunity.implementation_priority}/10</Badge>
                          <Badge className={getDifficultyColor(opportunity.implementation_difficulty) + ' text-white'}>
                            {opportunity.implementation_difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {opportunity.opportunity_type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="content">Content Strategy</TabsTrigger>
                        <TabsTrigger value="seo">SEO Strategy</TabsTrigger>
                        <TabsTrigger value="implementation">Implementation</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                <p className="text-sm text-muted-foreground">Monthly Searches</p>
                                <p className="text-lg font-semibold">
                                  {opportunity.estimated_monthly_searches.toLocaleString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                <p className="text-sm text-muted-foreground">Expected Traffic</p>
                                <p className="text-lg font-semibold">
                                  {Math.round(opportunity.roi_projection.estimated_traffic).toLocaleString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                                <p className="text-sm text-muted-foreground">Revenue Potential</p>
                                <p className="text-lg font-semibold">
                                  ${opportunity.roi_projection.revenue_potential.toLocaleString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="content" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Content Suggestions</h4>
                          <div className="space-y-2">
                            {opportunity.content_suggestions.map((suggestion, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                                <FileText className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                                <span className="text-sm">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {opportunity.content_strategy && (
                          <div>
                            <h4 className="font-semibold mb-3">Content Strategy Details</h4>
                            <div className="bg-gray-50 p-4 rounded">
                              <pre className="text-sm whitespace-pre-wrap">
                                {JSON.stringify(opportunity.content_strategy, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="seo" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Target Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.target_keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="cursor-pointer"
                                onClick={() => copyToClipboard(keyword)}>
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Competition Analysis</h4>
                          <Badge className={getCompetitionColor(opportunity.competition_level)}>
                            {opportunity.competition_level} competition level
                          </Badge>
                        </div>
                      </TabsContent>

                      <TabsContent value="implementation" className="space-y-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Implementation difficulty: <strong>{opportunity.implementation_difficulty}</strong>. 
                            Consider starting with easier opportunities first to build momentum.
                          </AlertDescription>
                        </Alert>

                        <div>
                          <h4 className="font-semibold mb-3">Next Steps</h4>
                          <ol className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</span>
                              <span className="text-sm">Set up subdomain DNS configuration</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</span>
                              <span className="text-sm">Create content based on suggestions above</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</span>
                              <span className="text-sm">Implement SEO optimisation for target keywords</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">4</span>
                              <span className="text-sm">Monitor traffic and adjust strategy as needed</span>
                            </li>
                          </ol>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SEOExpansionWizard;