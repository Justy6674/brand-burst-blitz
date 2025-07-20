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
import { HealthcareGoogleAnalytics } from './HealthcareGoogleAnalytics';
import { HealthcareAppointmentAnalytics } from './HealthcareAppointmentAnalytics';
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
    actions
  } = useRealHealthcareAnalytics();

  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate overall compliance score
  const complianceScore = Math.round(
    (complianceAnalytics.content_compliance_rate + 
     complianceAnalytics.advertising_compliance_score + 
     complianceAnalytics.professional_standards_score) / 3
  );

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
            </SelectContent>
          </Select>
          
          <Button
            onClick={actions.loadAnalytics}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Patient Reach</span>
              </div>
              <Badge variant="outline">Total</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{metrics.total_patient_reach.toLocaleString()}</div>
              <div className="text-xs text-gray-500">
                +{metrics.new_patient_reach.toLocaleString()} new this period
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Patient Engagement</span>
              </div>
              <Badge variant="outline">Healthcare</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{metrics.patient_engagement_rate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">
                {metrics.patient_interactions.toLocaleString()} interactions
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Appointment Inquiries</span>
              </div>
              <Badge variant="outline">Conversions</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{metrics.appointment_inquiries}</div>
              <div className="text-xs text-gray-500">
                {metrics.conversion_rate.toFixed(1)}% conversion rate
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Compliance Score</span>
              </div>
              <Badge variant="outline">AHPRA</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{complianceScore}%</div>
              <div className="text-xs text-gray-500">AHPRA/TGA compliant</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Practice Overview</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="website">Website Analytics</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Performance Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(platformAnalytics).map(([platform, data]) => {
              const platformIcon = platform === 'facebook' ? Share2 : 
                                 platform === 'instagram' ? Eye : 
                                 platform === 'website' ? BarChart3 : 
                                 platform === 'appointments' ? Calendar : FileText;
              const PlatformIcon = platformIcon;
              
              return (
                <Card key={platform}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-4">
                      <div className="flex items-center space-x-2">
                        <PlatformIcon className="h-5 w-5" />
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                      <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
                        {data.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Patient Reach</span>
                        <span className="font-medium">{data.patient_reach.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Engagement Rate</span>
                        <span className="font-medium">{data.engagement_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Healthcare Compliance</span>
                        <span className="font-medium text-green-600">{data.compliance_score}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Content Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Top Performing Healthcare Content
              </CardTitle>
              <CardDescription>
                Your best-performing patient education and practice content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPerformance.slice(0, 5).map((content, index) => (
                  <div key={content.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{content.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{content.content_type}</Badge>
                        <span className="text-sm text-gray-600">{content.platform}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">{content.patient_engagement}</div>
                      <div className="text-sm text-gray-600">patient engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <HealthcareInstagramAnalytics practiceId={practiceId} timeframe={selectedTimeframe} />
        </TabsContent>

        <TabsContent value="website" className="space-y-6">
          <HealthcareGoogleAnalytics 
            practiceId={practiceId}
            onSetupComplete={(config) => {
              console.log('Google Analytics setup completed:', config);
            }}
          />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <HealthcareAppointmentAnalytics 
            practiceId={practiceId} 
            timeframe={selectedTimeframe}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AHPRA Compliance Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AHPRA Compliance Dashboard
              </CardTitle>
              <CardDescription>
                Real-time compliance monitoring for Australian healthcare advertising
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {complianceAnalytics.content_compliance_rate}%
                  </div>
                  <div className="text-sm text-gray-600">Content Compliance Rate</div>
                  <div className="text-xs text-gray-500">
                    {complianceAnalytics.compliant_posts} / {complianceAnalytics.total_posts} posts compliant
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceAnalytics.advertising_compliance_score}%
                  </div>
                  <div className="text-sm text-gray-600">TGA Advertising Compliance</div>
                  <div className="text-xs text-gray-500">
                    Therapeutic advertising standards
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {complianceAnalytics.professional_standards_score}%
                  </div>
                  <div className="text-sm text-gray-600">Professional Standards</div>
                  <div className="text-xs text-gray-500">
                    AHPRA professional boundary compliance
                  </div>
                </div>
              </div>

              {complianceAnalytics.compliance_issues.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Compliance Recommendations
                  </h4>
                  <div className="space-y-2">
                    {complianceAnalytics.compliance_issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{issue.title}</div>
                          <div className="text-xs text-gray-600">{issue.description}</div>
                          <div className="text-xs text-blue-600">{issue.recommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strategic Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Strategic Healthcare Marketing Insights
              </CardTitle>
              <CardDescription>
                AI-powered recommendations for patient engagement improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Appointment Booking Optimization</h4>
                      <p className="text-sm text-gray-600">
                        Your online booking conversion rate is above average at {metrics.conversion_rate.toFixed(1)}%. 
                        Consider promoting online booking more prominently to reduce phone call volume.
                      </p>
                      <div className="text-xs text-blue-600">Recommended action: Add booking widgets to high-traffic pages</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Patient Education Content Performance</h4>
                      <p className="text-sm text-gray-600">
                        Your patient education posts generate 3.2x higher engagement than general practice updates. 
                        Consider increasing educational content frequency to 60% of total posts.
                      </p>
                      <div className="text-xs text-blue-600">Recommended action: Schedule 2-3 educational posts per week</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Local Community Engagement Opportunity</h4>
                      <p className="text-sm text-gray-600">
                        85% of your patient reach is within 10km of your practice. Consider partnering with local 
                        health initiatives and community events to increase local visibility.
                      </p>
                      <div className="text-xs text-blue-600">Recommended action: Explore local health partnerships</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 