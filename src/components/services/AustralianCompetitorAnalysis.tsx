import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Star,
  MapPin,
  Calendar,
  Target,
  BarChart3,
  Eye,
  Globe
} from 'lucide-react';

interface CompetitorData {
  name: string;
  website: string;
  location: string;
  industry: string;
  socialMetrics: {
    facebook: { followers: number; engagement: number; posts_per_week: number };
    instagram: { followers: number; engagement: number; posts_per_week: number };
    linkedin: { followers: number; engagement: number; posts_per_week: number };
  };
  contentStrategy: {
    top_hashtags: string[];
    posting_times: string[];
    content_types: { type: string; percentage: number }[];
  };
  strengths: string[];
  opportunities: string[];
  threat_level: 'low' | 'medium' | 'high';
}

const AustralianCompetitorAnalysis = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);

  const analyzeCompetitors = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const mockCompetitors: CompetitorData[] = [
      {
        name: 'Aussie Business Solutions',
        website: 'ausbizsolutions.com.au',
        location: 'Sydney, NSW',
        industry: 'Business Consulting',
        socialMetrics: {
          facebook: { followers: 8400, engagement: 4.2, posts_per_week: 5 },
          instagram: { followers: 3200, engagement: 3.8, posts_per_week: 7 },
          linkedin: { followers: 12000, engagement: 6.1, posts_per_week: 3 }
        },
        contentStrategy: {
          top_hashtags: ['#AussieB usiness', '#SME', '#BusinessGrowth', '#Entrepreneurship', '#AustralianBusiness'],
          posting_times: ['9:00 AM', '1:00 PM', '6:00 PM'],
          content_types: [
            { type: 'Educational', percentage: 45 },
            { type: 'Industry News', percentage: 25 },
            { type: 'Case Studies', percentage: 20 },
            { type: 'Company Updates', percentage: 10 }
          ]
        },
        strengths: [
          'Strong LinkedIn presence with high engagement',
          'Consistent posting schedule',
          'Local Australian focus resonates well',
          'Quality educational content'
        ],
        opportunities: [
          'Instagram growth potential',
          'Video content underutilized',
          'Limited customer testimonials',
          'Could expand into TikTok'
        ],
        threat_level: 'high'
      },
      {
        name: 'Melbourne Digital Co',
        website: 'melbournedigital.com.au',
        location: 'Melbourne, VIC',
        industry: 'Digital Marketing',
        socialMetrics: {
          facebook: { followers: 5600, engagement: 3.1, posts_per_week: 4 },
          instagram: { followers: 7800, engagement: 5.2, posts_per_week: 10 },
          linkedin: { followers: 6800, engagement: 4.8, posts_per_week: 2 }
        },
        contentStrategy: {
          top_hashtags: ['#DigitalMarketing', '#Melbourne', '#SocialMedia', '#ContentCreation', '#AussieBiz'],
          posting_times: ['8:00 AM', '12:00 PM', '7:00 PM'],
          content_types: [
            { type: 'Behind the Scenes', percentage: 35 },
            { type: 'Tips & Tricks', percentage: 30 },
            { type: 'Client Work', percentage: 25 },
            { type: 'Team Content', percentage: 10 }
          ]
        },
        strengths: [
          'Excellent Instagram engagement',
          'Strong visual branding',
          'Active story posting',
          'Good use of Australian culture'
        ],
        opportunities: [
          'LinkedIn underperformance',
          'Facebook engagement declining',
          'Limited blog content',
          'No YouTube presence'
        ],
        threat_level: 'medium'
      },
      {
        name: 'Brisbane Business Hub',
        website: 'brisbanebusinesshub.com.au',
        location: 'Brisbane, QLD',
        industry: 'Business Services',
        socialMetrics: {
          facebook: { followers: 3200, engagement: 2.8, posts_per_week: 3 },
          instagram: { followers: 1800, engagement: 2.1, posts_per_week: 4 },
          linkedin: { followers: 4500, engagement: 3.9, posts_per_week: 2 }
        },
        contentStrategy: {
          top_hashtags: ['#Brisbane', '#BusinessHub', '#Networking', '#SmallBusiness', '#Queensland'],
          posting_times: ['10:00 AM', '2:00 PM', '5:00 PM'],
          content_types: [
            { type: 'Local Events', percentage: 40 },
            { type: 'Business Tips', percentage: 30 },
            { type: 'Member Spotlights', percentage: 20 },
            { type: 'News Updates', percentage: 10 }
          ]
        },
        strengths: [
          'Strong local community focus',
          'Good event promotion',
          'Authentic member content'
        ],
        opportunities: [
          'Low overall engagement across platforms',
          'Inconsistent posting schedule',
          'Limited reach beyond Brisbane',
          'Outdated website design'
        ],
        threat_level: 'low'
      }
    ];
    
    setCompetitors(mockCompetitors);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Australian Market Competitor Analysis
          </CardTitle>
          <p className="text-muted-foreground">
            Analyze your competition in the Australian market and discover strategic opportunities
          </p>
        </CardHeader>
        <CardContent>
          {!analysisComplete && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter your industry or competitors (e.g., 'digital marketing Melbourne')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={analyzeCompetitors}
                  disabled={isAnalyzing || !searchQuery.trim()}
                  className="bg-gradient-primary"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
              
              {isAnalyzing && (
                <div className="text-center py-8 space-y-4">
                  <Progress value={75} className="w-full max-w-md mx-auto" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Scanning Australian business directories...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Analyzing social media presence...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Gathering content strategy insights...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {analysisComplete && (
            <div className="space-y-6">
              {/* Analysis Summary */}
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{competitors.length}</div>
                      <p className="text-sm text-muted-foreground">Competitors Found</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {competitors.filter(c => c.threat_level === 'high').length}
                      </div>
                      <p className="text-sm text-muted-foreground">High Threat Level</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">85%</div>
                      <p className="text-sm text-muted-foreground">Market Coverage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competitor Cards */}
              <div className="space-y-6">
                {competitors.map((competitor, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            <Globe className="w-5 h-5" />
                            {competitor.name}
                            <Badge className={getThreatColor(competitor.threat_level)}>
                              {competitor.threat_level} threat
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {competitor.location}
                            </span>
                            <span>{competitor.website}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Social Metrics */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Social Media Performance
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="font-medium">Facebook</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>{competitor.socialMetrics.facebook.followers.toLocaleString()} followers</div>
                              <div>{competitor.socialMetrics.facebook.engagement}% engagement</div>
                              <div>{competitor.socialMetrics.facebook.posts_per_week} posts/week</div>
                            </div>
                          </div>
                          <div className="bg-pink-50 dark:bg-pink-950/20 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                              <span className="font-medium">Instagram</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>{competitor.socialMetrics.instagram.followers.toLocaleString()} followers</div>
                              <div>{competitor.socialMetrics.instagram.engagement}% engagement</div>
                              <div>{competitor.socialMetrics.instagram.posts_per_week} posts/week</div>
                            </div>
                          </div>
                          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
                              <span className="font-medium">LinkedIn</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>{competitor.socialMetrics.linkedin.followers.toLocaleString()} followers</div>
                              <div>{competitor.socialMetrics.linkedin.engagement}% engagement</div>
                              <div>{competitor.socialMetrics.linkedin.posts_per_week} posts/week</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Strategy */}
                      <div>
                        <h4 className="font-medium mb-3">Content Strategy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Top Hashtags</h5>
                            <div className="flex flex-wrap gap-2">
                              {competitor.contentStrategy.top_hashtags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Content Mix</h5>
                            <div className="space-y-2">
                              {competitor.contentStrategy.content_types.map((type, typeIndex) => (
                                <div key={typeIndex} className="flex items-center justify-between text-sm">
                                  <span>{type.type}</span>
                                  <span className="font-medium">{type.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Opportunities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-3 text-green-600 dark:text-green-400">
                            Their Strengths
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {competitor.strengths.map((strength, strengthIndex) => (
                              <li key={strengthIndex} className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3 text-blue-600 dark:text-blue-400">
                            Your Opportunities
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {competitor.opportunities.map((opportunity, oppIndex) => (
                              <li key={oppIndex} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {opportunity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Items */}
              <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Strategic Recommendations for Australian Market
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Immediate Actions</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Increase Instagram posting frequency to match top competitors</li>
                        <li>• Implement Australian-specific hashtags in your content</li>
                        <li>• Focus on educational content during business hours</li>
                        <li>• Add location tags to increase local discoverability</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Long-term Strategy</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Develop unique value proposition vs. high-threat competitors</li>
                        <li>• Invest in video content creation for better engagement</li>
                        <li>• Build partnerships with Australian business communities</li>
                        <li>• Consider paid advertising in underutilized platforms</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Button size="lg" className="bg-gradient-primary">
                      Get Professional Setup - Implement These Strategies
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AustralianCompetitorAnalysis;