import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Target, 
  Eye,
  Network,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PreviewAnalysis {
  domain: string;
  potentialSubdomains: {
    subdomain: string;
    type: string;
    estimatedSearches: number;
    opportunity: string;
  }[];
  competitorCount: number;
  seoGap: number;
}

export const FreeSubdomainPreview: React.FC = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<PreviewAnalysis | null>(null);

  const handleFreeAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl.trim()) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis for demo purposes
    setTimeout(() => {
      const domain = extractDomain(websiteUrl);
      const mockAnalysis: PreviewAnalysis = {
        domain,
        potentialSubdomains: [
          {
            subdomain: 'services',
            type: 'Service Hub',
            estimatedSearches: 8500,
            opportunity: 'High - Target all healthcare service searches'
          },
          {
            subdomain: 'conditions',
            type: 'Patient Education',
            estimatedSearches: 12000,
            opportunity: 'Very High - Educational content hub for conditions'
          },
          {
            subdomain: 'telehealth',
            type: 'Virtual Services',
            estimatedSearches: 6800,
            opportunity: 'High - Growing market for virtual consultations'
          }
        ],
        competitorCount: 3,
        seoGap: 75
      };
      
      setAnalysis(mockAnalysis);
      setShowResults(true);
      setIsAnalyzing(false);
    }, 3000);
  };

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30 px-4 py-2 text-lg font-semibold">
          🎯 FREE COMPETITOR ANALYSIS
        </Badge>
        <h2 className="text-3xl font-bold mb-4 text-white">
          Discover Hidden Competitor <span className="text-yellow-400">Subdomain Strategies</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get a preview analysis showing how your competitors dominate search results with strategic subdomains. 
          See your opportunities in under 60 seconds.
        </p>
      </div>

      {!showResults ? (
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Search className="w-6 h-6 text-blue-400" />
              Free Subdomain Analysis Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFreeAnalysis} className="space-y-6">
              <div>
                <Label className="text-base font-medium">Your Healthcare Website</Label>
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://your-clinic.com.au"
                  className="mt-2 text-base"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  We'll analyze your website and compare it to competitor subdomain strategies
                </p>
              </div>

              <div>
                <Label className="text-base font-medium">Email for Results</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-2 text-base"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get detailed report delivered to your inbox
                </p>
              </div>

              <Alert className="border-indigo-200 bg-indigo-50/50">
                <Network className="h-4 w-4 text-indigo-600" />
                <AlertDescription className="text-indigo-800">
                  <strong>What you'll discover:</strong> Hidden competitor subdomain strategies, your SEO opportunity gaps, 
                  and specific subdomain recommendations to multiply your search presence.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={isAnalyzing || !websiteUrl.trim() || !email.trim()}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg py-6"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing Competitor Strategies...
                  </>
                ) : (
                  <>
                    <Eye className="w-6 h-6 mr-3" />
                    Get Free Competitor Analysis
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Free preview • No credit card required • Full analysis available to members
              </p>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-6 h-6" />
                Analysis Complete for {analysis?.domain}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{analysis?.potentialSubdomains.length}</div>
                  <div className="text-sm text-muted-foreground">Subdomain Opportunities</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-3xl font-bold text-orange-400 mb-2">{analysis?.competitorCount}</div>
                  <div className="text-sm text-muted-foreground">Competitors Using Subdomains</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-3xl font-bold text-red-400 mb-2">{analysis?.seoGap}%</div>
                  <div className="text-sm text-muted-foreground">SEO Opportunity Gap</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  Top Subdomain Opportunities
                </h3>
                
                {analysis?.potentialSubdomains.map((subdomain, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {subdomain.type}
                        </Badge>
                        <span className="font-semibold text-yellow-400">
                          {subdomain.subdomain}.{analysis.domain}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-400">
                          {subdomain.estimatedSearches.toLocaleString()} searches/month
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subdomain.opportunity}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              <strong>Preview Analysis Complete!</strong> This is a sample of what our full analysis provides. 
              Members get complete competitor intelligence, implementation roadmaps, and TGA/AHPRA compliant content strategies.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              Want the full analysis with implementation plans and competitor intelligence?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold px-8 py-4">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Get Full Analysis - Join Members
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="px-8 py-4 border-white/30 text-white hover:bg-white/10">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Full analysis includes: Complete competitor mapping • ROI projections • Implementation roadmaps • TGA/AHPRA compliance guidance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeSubdomainPreview;