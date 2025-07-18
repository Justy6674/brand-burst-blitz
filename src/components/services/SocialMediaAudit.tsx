import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Globe,
  Users,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  Target
} from 'lucide-react';

interface AuditResult {
  platform: string;
  icon: React.ElementType;
  score: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  metrics: {
    followers: number;
    engagement: number;
    posts_last_30d: number;
    avg_likes: number;
    avg_comments: number;
    posting_frequency: string;
  };
  recommendations: string[];
}

const SocialMediaAudit = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);

  const runAudit = async () => {
    setIsAuditing(true);
    
    // Simulate audit process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockResults: AuditResult[] = [
      {
        platform: 'Facebook',
        icon: Facebook,
        score: 72,
        status: 'good',
        metrics: {
          followers: 2840,
          engagement: 3.2,
          posts_last_30d: 12,
          avg_likes: 45,
          avg_comments: 8,
          posting_frequency: '3 times per week'
        },
        recommendations: [
          'Increase posting frequency to daily for better reach',
          'Add more video content to boost engagement',
          'Use more local Australian hashtags',
          'Post during peak hours (7-9pm AEST)'
        ]
      },
      {
        platform: 'Instagram',
        icon: Instagram,
        score: 45,
        status: 'needs-improvement',
        metrics: {
          followers: 890,
          engagement: 2.1,
          posts_last_30d: 6,
          avg_likes: 32,
          avg_comments: 3,
          posting_frequency: 'Twice per week'
        },
        recommendations: [
          'Complete Instagram Business profile setup',
          'Add location tags for local discovery',
          'Use Instagram Stories daily',
          'Create Reels content for better reach',
          'Engage with Australian business community'
        ]
      },
      {
        platform: 'LinkedIn',
        icon: Linkedin,
        score: 88,
        status: 'excellent',
        metrics: {
          followers: 1240,
          engagement: 5.8,
          posts_last_30d: 16,
          avg_likes: 78,
          avg_comments: 12,
          posting_frequency: '4 times per week'
        },
        recommendations: [
          'Continue current strategy - performing well',
          'Share more industry insights',
          'Network with other Australian businesses',
          'Consider LinkedIn advertising for growth'
        ]
      }
    ];
    
    setAuditResults(mockResults);
    setIsAuditing(false);
    setAuditComplete(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'needs-improvement': return AlertTriangle;
      case 'critical': return XCircle;
      default: return AlertTriangle;
    }
  };

  const overallScore = auditResults.length > 0 
    ? Math.round(auditResults.reduce((sum, result) => sum + result.score, 0) / auditResults.length)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Australian Social Media Audit
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive analysis of your social media presence for the Australian market
          </p>
        </CardHeader>
        <CardContent>
          {!auditComplete && (
            <div className="text-center py-8">
              <Button 
                onClick={runAudit} 
                disabled={isAuditing}
                size="lg"
                className="bg-gradient-primary"
              >
                {isAuditing ? 'Running Audit...' : 'Start Social Media Audit'}
              </Button>
              {isAuditing && (
                <div className="mt-4 space-y-2">
                  <Progress value={66} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing your social media accounts...
                  </p>
                </div>
              )}
            </div>
          )}

          {auditComplete && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {overallScore}/100
                    </div>
                    <p className="text-lg font-medium">Overall Social Media Score</p>
                    <Progress value={overallScore} className="mt-4 h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Platform Results */}
              <div className="grid gap-6">
                {auditResults.map((result, index) => {
                  const StatusIcon = getStatusIcon(result.status);
                  const PlatformIcon = result.icon;
                  
                  return (
                    <Card key={index} className="border-l-4" style={{borderLeftColor: `var(--${result.status === 'excellent' ? 'green' : result.status === 'good' ? 'blue' : result.status === 'needs-improvement' ? 'yellow' : 'red'}-500)`}}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <PlatformIcon className="w-6 h-6" />
                            <CardTitle>{result.platform}</CardTitle>
                            <Badge className={getStatusColor(result.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {result.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {result.score}/100
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              <strong>{result.metrics.followers.toLocaleString()}</strong> followers
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              <strong>{result.metrics.engagement}%</strong> engagement
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              <strong>{result.metrics.posts_last_30d}</strong> posts (30d)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              <strong>{result.metrics.avg_likes}</strong> avg likes
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              <strong>{result.metrics.avg_comments}</strong> avg comments
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {result.metrics.posting_frequency}
                            </span>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="font-medium mb-2 text-foreground">
                            Australian Market Recommendations:
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {result.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* CTA */}
              <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    Ready to Optimize Your Australian Social Presence?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Our Australian Quick-Start Social Setup service can implement these recommendations for you.
                  </p>
                  <Button size="lg" className="bg-gradient-primary">
                    Get Professional Setup - From AU$199
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaAudit;