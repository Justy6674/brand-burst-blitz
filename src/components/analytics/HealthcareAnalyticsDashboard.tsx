import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { 
  BarChart3, TrendingUp, Users, Shield, Heart, 
  Eye, Share2, MessageCircle, Calendar, DollarSign,
  FileText, AlertTriangle, CheckCircle, Clock,
  Target, Award, Brain, Activity
} from 'lucide-react';

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface ComplianceAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  action?: string;
}

interface ContentPerformance {
  id: string;
  title: string;
  type: 'patient_education' | 'practice_marketing' | 'professional_content';
  platform: string;
  views: number;
  engagement: number;
  compliance_score: number;
  patient_inquiries: number;
  published_date: string;
}

// Mock data - in production this would come from analytics APIs
const mockMetrics: AnalyticsMetric[] = [
  { label: 'Patient Engagement', value: '2,847', change: 15.2, trend: 'up', period: 'vs last month' },
  { label: 'Content Views', value: '18,392', change: 8.7, trend: 'up', period: 'vs last month' },
  { label: 'AHPRA Compliance Score', value: '96%', change: 3.1, trend: 'up', period: 'vs last quarter' },
  { label: 'Patient Inquiries', value: '127', change: 22.5, trend: 'up', period: 'vs last month' },
  { label: 'Practice ROI', value: '$8,450', change: 18.3, trend: 'up', period: 'vs last quarter' },
  { label: 'Content Pieces', value: '45', change: 12.0, trend: 'up', period: 'vs last month' }
];

const mockComplianceAlerts: ComplianceAlert[] = [
  {
    id: '1',
    type: 'success',
    title: 'Monthly Compliance Review Complete',
    message: 'All 45 content pieces reviewed and maintain AHPRA compliance standards.',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'info',
    title: 'TGA Guidelines Update',
    message: 'New therapeutic advertising guidelines effective March 2024. Review recommended.',
    timestamp: '2024-01-14T14:15:00Z',
    action: 'Review Guidelines'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Content Disclaimer Missing',
    message: '2 social media posts missing required healthcare disclaimers.',
    timestamp: '2024-01-13T09:45:00Z',
    action: 'Fix Now'
  }
];

const mockContentPerformance: ContentPerformance[] = [
  {
    id: '1',
    title: 'Heart Health Awareness: Understanding Risk Factors',
    type: 'patient_education',
    platform: 'Facebook',
    views: 3420,
    engagement: 87,
    compliance_score: 98,
    patient_inquiries: 12,
    published_date: '2024-01-10'
  },
  {
    id: '2',
    title: 'Mental Health: When to Seek Professional Help',
    type: 'patient_education',
    platform: 'LinkedIn',
    views: 2180,
    engagement: 94,
    compliance_score: 96,
    patient_inquiries: 8,
    published_date: '2024-01-08'
  },
  {
    id: '3',
    title: 'Our Practice: Comprehensive Healthcare Services',
    type: 'practice_marketing',
    platform: 'Instagram',
    views: 1650,
    engagement: 72,
    compliance_score: 97,
    patient_inquiries: 18,
    published_date: '2024-01-06'
  }
];

export const HealthcareAnalyticsDashboard = () => {
  const { user } = useHealthcareAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('engagement');

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
    return <TrendingUp className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-400';
  };

  const getAlertIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'info': return <Shield className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'info': return 'border-blue-200 bg-blue-50';
    }
  };

  const getContentTypeColor = (type: 'patient_education' | 'practice_marketing' | 'professional_content') => {
    switch (type) {
      case 'patient_education': return 'bg-blue-100 text-blue-800';
      case 'practice_marketing': return 'bg-green-100 text-green-800';
      case 'professional_content': return 'bg-purple-100 text-purple-800';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track patient engagement and AHPRA compliance for {user?.practice_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{metric.period}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AHPRA Compliance Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              AHPRA Compliance Status
            </CardTitle>
            <CardDescription>Real-time compliance monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">96%</div>
              <p className="text-sm text-gray-600">Overall Compliance Score</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Advertising Guidelines</span>
                <div className="flex items-center gap-2">
                  <Progress value={98} className="w-16 h-2" />
                  <span className="text-xs font-medium text-green-600">98%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">TGA Therapeutic Claims</span>
                <div className="flex items-center gap-2">
                  <Progress value={95} className="w-16 h-2" />
                  <span className="text-xs font-medium text-green-600">95%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Professional Boundaries</span>
                <div className="flex items-center gap-2">
                  <Progress value={94} className="w-16 h-2" />
                  <span className="text-xs font-medium text-green-600">94%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Registration Display</span>
                <div className="flex items-center gap-2">
                  <Progress value={100} className="w-16 h-2" />
                  <span className="text-xs font-medium text-green-600">100%</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Award className="mr-2 h-4 w-4" />
              View Compliance Report
            </Button>
          </CardContent>
        </Card>

        {/* Patient Engagement Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Engagement Overview
            </CardTitle>
            <CardDescription>How patients interact with your healthcare content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3.2K</div>
                <p className="text-xs text-gray-600">Total Reach</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">847</div>
                <p className="text-xs text-gray-600">Engaged Patients</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">127</div>
                <p className="text-xs text-gray-600">Practice Inquiries</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">23</div>
                <p className="text-xs text-gray-600">New Appointments</p>
              </div>
            </div>

            {/* Engagement by Content Type */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Engagement by Content Type:</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Patient Education</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={87} className="w-20 h-2" />
                  <span className="text-xs font-medium">87%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Practice Marketing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={72} className="w-20 h-2" />
                  <span className="text-xs font-medium">72%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Professional Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={91} className="w-20 h-2" />
                  <span className="text-xs font-medium">91%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Alerts</TabsTrigger>
          <TabsTrigger value="roi">Practice ROI</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Healthcare Content</CardTitle>
              <CardDescription>
                Your most effective patient education and practice marketing content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockContentPerformance.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{content.title}</h4>
                        <Badge className={getContentTypeColor(content.type)}>
                          {content.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {content.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {content.engagement}% engagement
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {content.patient_inquiries} inquiries
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span className={getComplianceColor(content.compliance_score)}>
                            {content.compliance_score}% compliant
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{content.platform}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(content.published_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AHPRA Compliance Alerts</CardTitle>
              <CardDescription>
                Real-time monitoring of healthcare advertising compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockComplianceAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h4 className="font-semibold text-sm">{alert.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {alert.action && (
                        <Button size="sm" variant="outline">
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Practice ROI Analysis
                </CardTitle>
                <CardDescription>Return on investment from content marketing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">$8,450</div>
                  <p className="text-sm text-gray-600">Total Practice Revenue</p>
                  <p className="text-xs text-gray-500">Attributed to content marketing</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Patient Appointments</span>
                    <span className="font-semibold">$6,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Follow-up Consultations</span>
                    <span className="font-semibold">$1,850</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Referral Revenue</span>
                    <span className="font-semibold">$400</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Content Efficiency Metrics
                </CardTitle>
                <CardDescription>How efficiently your content converts patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost per Patient Inquiry</span>
                    <span className="font-semibold">$12.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inquiry to Appointment Rate</span>
                    <span className="font-semibold text-green-600">18.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Patient Lifetime Value</span>
                    <span className="font-semibold">$2,340</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Marketing ROI</span>
                    <span className="font-semibold text-green-600">450%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Healthcare Insights
              </CardTitle>
              <CardDescription>
                Intelligent recommendations to improve patient engagement and compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📈 Content Opportunity</h4>
                  <p className="text-sm text-blue-700">
                    Your mental health content performs 34% better than practice average. 
                    Consider creating more psychology and wellness-focused patient education materials.
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Compliance Strength</h4>
                  <p className="text-sm text-green-700">
                    Your AHPRA compliance score of 96% is excellent. You consistently include proper disclaimers 
                    and avoid prohibited content. This builds patient trust and professional credibility.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">⚠️ Optimization Suggestion</h4>
                  <p className="text-sm text-orange-700">
                    Patient engagement drops 23% on weekend posts. Consider scheduling patient education 
                    content for Tuesday-Thursday when engagement rates are highest.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 ROI Opportunity</h4>
                  <p className="text-sm text-purple-700">
                    Practice marketing content generates 3.2x more appointment inquiries than patient education. 
                    Balance is key - maintain 70% education, 30% practice promotion for optimal results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 