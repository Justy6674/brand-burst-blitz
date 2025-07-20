import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { useRealHealthcareAnalytics } from '@/hooks/useRealHealthcareAnalytics';
import { HealthcareInstagramAnalytics } from '../social/HealthcareInstagramAnalytics';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Shield, Heart, 
  Eye, Share2, MessageCircle, Calendar, DollarSign,
  FileText, AlertTriangle, CheckCircle, Clock,
  Target, Award, Brain, Activity, RefreshCw, Zap, AlertCircle
} from 'lucide-react';

interface HealthcareAnalyticsDashboardProps {
  practiceId?: string;
}

export function HealthcareAnalyticsDashboard({ practiceId }: HealthcareAnalyticsDashboardProps) {
  const { user, profile } = useHealthcareAuth();
  const {
    loading,
    metrics,
    platformAnalytics,
    contentPerformance,
    complianceAnalytics,
    lastUpdate,
    isCollecting,
    loadAnalytics,
    collectAnalytics,
    hasConnectedAccounts,
    needsSetup,
    overallEngagement,
    patientReach,
    complianceScore
  } = useRealHealthcareAnalytics(practiceId);

  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const handleForceSync = async () => {
    await collectAnalytics(true);
  };

  const handleRefresh = async () => {
    await loadAnalytics();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Healthcare Practice Analytics</h2>
            <p className="text-gray-600">Real-time patient engagement and compliance metrics</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Loading Real Data
          </Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Healthcare Practice Analytics</h2>
          <p className="text-gray-600">
            Real-time patient engagement and AHPRA compliance metrics
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdate.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            AHPRA Compliant
          </Badge>
          
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="12m">12 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={handleForceSync}
            variant="default"
            size="sm"
            disabled={isCollecting || !hasConnectedAccounts}
          >
            <Zap className={`h-4 w-4 mr-2 ${isCollecting ? 'animate-pulse' : ''}`} />
            {isCollecting ? 'Collecting...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Setup Warning */}
      {needsSetup && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Required:</strong> Connect your social media accounts to start collecting real patient engagement data.
            <Button variant="link" className="p-0 ml-2 h-auto">
              Connect Accounts →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* No Connected Accounts Warning */}
      {!needsSetup && !hasConnectedAccounts && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Limited Data:</strong> Connect Facebook and Instagram to get comprehensive patient engagement analytics.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const getTrendIcon = () => {
            if (metric.trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
            if (metric.trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
            return <Activity className="h-4 w-4 text-gray-600" />;
          };

          const getTrendColor = () => {
            if (metric.trend === 'up') return 'text-green-600';
            if (metric.trend === 'down') return 'text-red-600';
            return 'text-gray-600';
          };

          const getMetricIcon = () => {
            if (metric.label.includes('Patient')) return <Users className="h-5 w-5" />;
            if (metric.label.includes('Compliance')) return <Shield className="h-5 w-5" />;
            if (metric.label.includes('Content')) return <FileText className="h-5 w-5" />;
            if (metric.label.includes('Engagement')) return <Heart className="h-5 w-5" />;
            return <BarChart3 className="h-5 w-5" />;
          };

          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    {getMetricIcon()}
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  {metric.healthcareSpecific && (
                    <Badge variant="outline" className="text-xs">
                      Healthcare
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center space-x-1 text-xs">
                    {getTrendIcon()}
                    <span className={getTrendColor()}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className="text-gray-500">{metric.period}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Source: {metric.source}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Platform Performance
          </CardTitle>
          <CardDescription>
            Patient engagement across your connected healthcare platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {platformAnalytics.map((platform) => (
              <div key={platform.platform} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      platform.isConnected ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="font-medium capitalize">{platform.platform}</span>
                  </div>
                  {platform.isConnected ? (
                    <Badge variant="outline" className="text-xs">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Not Connected
                    </Badge>
                  )}
                </div>
                
                {platform.isConnected ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Patient Reach</span>
                      <span className="font-medium">{platform.metrics.reach.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement</span>
                      <span className="font-medium">{platform.metrics.engagement.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Posts</span>
                      <span className="font-medium">{platform.metrics.posts}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Compliance</span>
                      <span className="font-medium">{platform.metrics.complianceScore}%</span>
                    </div>
                    {platform.lastSync && (
                      <div className="text-xs text-gray-500">
                        Last sync: {new Date(platform.lastSync).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Connect this platform to see patient engagement metrics
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AHPRA Compliance Dashboard */}
      {complianceAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              AHPRA/TGA Compliance Dashboard
            </CardTitle>
            <CardDescription>
              Real-time compliance monitoring and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Compliance</span>
                  <Badge variant={complianceAnalytics.overallScore >= 95 ? "default" : "destructive"}>
                    {complianceAnalytics.overallScore}%
                  </Badge>
                </div>
                <Progress value={complianceAnalytics.overallScore} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AHPRA Compliance</span>
                  <Badge variant={complianceAnalytics.ahpraCompliance >= 95 ? "default" : "destructive"}>
                    {complianceAnalytics.ahpraCompliance.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={complianceAnalytics.ahpraCompliance} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">TGA Compliance</span>
                  <Badge variant={complianceAnalytics.tgaCompliance >= 95 ? "default" : "destructive"}>
                    {complianceAnalytics.tgaCompliance.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={complianceAnalytics.tgaCompliance} className="h-2" />
              </div>
            </div>

            {complianceAnalytics.alerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Compliance Alerts</h4>
                {complianceAnalytics.alerts.map((alert) => (
                  <Alert key={alert.id} className={
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    alert.type === 'info' ? 'border-blue-200 bg-blue-50' :
                    'border-green-200 bg-green-50'
                  }>
                    {alert.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                     alert.type === 'info' ? <AlertCircle className="h-4 w-4" /> :
                     <CheckCircle className="h-4 w-4" />}
                    <AlertDescription>
                      <strong>{alert.message}</strong>
                      {alert.action && (
                        <Button variant="link" className="p-0 ml-2 h-auto">
                          {alert.action}
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm text-gray-600">Content Reviewed</span>
                <div className="text-lg font-semibold">{complianceAnalytics.contentReviewed}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Audit</span>
                <div className="text-lg font-semibold">
                  {new Date(complianceAnalytics.lastAudit).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Performance Analysis
          </CardTitle>
          <CardDescription>
            Real patient engagement data for your healthcare content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contentPerformance.length > 0 ? (
            <div className="space-y-4">
              {contentPerformance.slice(0, 5).map((content) => (
                <div key={content.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium">{content.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline">{content.type.replace('_', ' ')}</Badge>
                        <Badge variant="outline">{content.platform}</Badge>
                        <span>{new Date(content.publishedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {content.ahpraCompliant && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {content.tgaCompliant && <Shield className="h-4 w-4 text-blue-600" />}
                      <Badge variant="secondary">{content.complianceScore.toFixed(0)}%</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Views</span>
                      <div className="font-semibold">{content.metrics.views.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Engagement</span>
                      <div className="font-semibold">{content.metrics.engagement.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Patient Inquiries</span>
                      <div className="font-semibold">{content.metrics.patientInquiries}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Shares</span>
                      <div className="font-semibold">{content.metrics.shares}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Educational Value</span>
                      <div className="font-semibold">{content.educationalValue.toFixed(1)}/10</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {contentPerformance.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All {contentPerformance.length} Content Pieces
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Content Data
              </h3>
              <p className="text-gray-600 mb-4">
                Start publishing healthcare content to see performance analytics.
              </p>
              <Button>
                Create First Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Total Patient Reach</span>
            </div>
            <div className="text-2xl font-bold mt-2">{patientReach.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Across all platforms</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">Engagement Rate</span>
            </div>
            <div className="text-2xl font-bold mt-2">{overallEngagement}%</div>
            <div className="text-sm text-gray-600">Patient interaction rate</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Compliance Score</span>
            </div>
            <div className="text-2xl font-bold mt-2">{complianceScore}%</div>
            <div className="text-sm text-gray-600">AHPRA/TGA compliant</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 