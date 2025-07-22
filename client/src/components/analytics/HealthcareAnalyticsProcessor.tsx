import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { useHealthcareAnalyticsProcessor } from '../../hooks/useHealthcareAnalyticsProcessor';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Zap,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Calendar,
  FileText,
  Award,
  Eye,
  Heart,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  BookOpen,
  MessageSquare,
  DollarSign
} from 'lucide-react';

interface HealthcareAnalyticsProcessorProps {
  practiceId?: string;
}

export function HealthcareAnalyticsProcessor({ practiceId }: HealthcareAnalyticsProcessorProps) {
  const { toast } = useToast();
  
  const {
    processingStatus,
    lastProcessed,
    processedInsights,
    processingErrors,
    complianceAlerts,
    processHealthcareAnalytics,
    startAutomatedProcessing,
    stopAutomatedProcessing,
    config
  } = useHealthcareAnalyticsProcessor();

  const [activeTab, setActiveTab] = useState('overview');
  const [automatedProcessingEnabled, setAutomatedProcessingEnabled] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);

  useEffect(() => {
    // Initial processing
    processHealthcareAnalytics(practiceId);
  }, [practiceId, processHealthcareAnalytics]);

  const handleToggleAutomatedProcessing = () => {
    if (automatedProcessingEnabled) {
      stopAutomatedProcessing();
      setAutomatedProcessingEnabled(false);
      toast({
        title: "Automated Processing Stopped",
        description: "Healthcare analytics processing has been paused"
      });
    } else {
      startAutomatedProcessing();
      setAutomatedProcessingEnabled(true);
      toast({
        title: "Automated Processing Started",
        description: "Healthcare analytics will now process automatically"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Eye className="h-4 w-4 text-yellow-600" />;
      default: return <Eye className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 5) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (value < -5) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  if (!processedInsights) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              Healthcare Analytics Processor
            </h2>
            <p className="text-gray-600">AI-powered insights and intelligent recommendations</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Initializing
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Healthcare Analytics Processor
          </h2>
          <p className="text-gray-600">
            AI-powered insights, compliance monitoring, and intelligent recommendations
          </p>
          {lastProcessed && (
            <p className="text-sm text-gray-500 mt-1">
              Last processed: {lastProcessed.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Auto-processing</span>
            <Switch
              checked={automatedProcessingEnabled}
              onCheckedChange={handleToggleAutomatedProcessing}
            />
          </div>
          
          <Badge 
            variant="secondary" 
            className={`flex items-center gap-1 ${getStatusColor(processingStatus)}`}
          >
            {getStatusIcon(processingStatus)}
            {processingStatus}
          </Badge>
          
          <Button
            onClick={() => processHealthcareAnalytics(practiceId)}
            variant="outline"
            size="sm"
            disabled={processingStatus === 'processing'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${processingStatus === 'processing' ? 'animate-spin' : ''}`} />
            Process Now
          </Button>
        </div>
      </div>

      {/* Processing Errors */}
      {processingErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Processing errors detected: {processingErrors.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Compliance Alerts */}
      {complianceAlerts.length > 0 && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical AHPRA Compliance Alert:</strong> {complianceAlerts.length} critical issue(s) require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Patient Reach</span>
              </div>
              {getTrendIcon(processedInsights.summary.growth_rate)}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{processedInsights.summary.total_patient_reach.toLocaleString()}</div>
              <div className="text-xs text-gray-500">
                {processedInsights.summary.growth_rate.toFixed(1)}% growth rate
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Engagement</span>
              </div>
              <Badge variant="outline">Rate</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{processedInsights.summary.patient_engagement_rate.toFixed(1)}%</div>
              <Progress value={processedInsights.summary.patient_engagement_rate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Appointments</span>
              </div>
              <Badge variant="outline">Conversion</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{processedInsights.summary.appointment_conversion_rate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">booking conversion rate</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Compliance</span>
              </div>
              <Badge variant="outline">AHPRA</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{processedInsights.summary.compliance_score}%</div>
              <Progress value={processedInsights.summary.compliance_score} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">AI Insights</span>
              </div>
              <Badge variant="outline">Count</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{processedInsights.intelligent_recommendations.length}</div>
              <div className="text-xs text-gray-500">
                {processedInsights.intelligent_recommendations.filter(r => r.priority === 'high').length} high priority
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Intelligent Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Monitor</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Practice Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {Math.round((processedInsights.summary.compliance_score + 
                                   processedInsights.summary.patient_engagement_rate * 10 + 
                                   processedInsights.summary.appointment_conversion_rate) / 3)}
                    </div>
                    <div className="text-sm text-gray-600">Overall Practice Score</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Patient Engagement</span>
                      <span>{processedInsights.summary.patient_engagement_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={processedInsights.summary.patient_engagement_rate * 10} />
                    
                    <div className="flex justify-between text-sm">
                      <span>Appointment Conversion</span>
                      <span>{processedInsights.summary.appointment_conversion_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={processedInsights.summary.appointment_conversion_rate} />
                    
                    <div className="flex justify-between text-sm">
                      <span>AHPRA Compliance</span>
                      <span>{processedInsights.summary.compliance_score}%</span>
                    </div>
                    <Progress value={processedInsights.summary.compliance_score} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${processedInsights.summary.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {processedInsights.summary.growth_rate >= 0 ? '+' : ''}{processedInsights.summary.growth_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Monthly Growth Rate</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Patient Reach Growth</span>
                      <span className="font-medium">{processedInsights.summary.growth_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Booking Inquiries</span>
                      <span className="font-medium">+{Math.round(processedInsights.summary.appointment_conversion_rate / 10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content Engagement</span>
                      <span className="font-medium">+{(processedInsights.summary.patient_engagement_rate * 2).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {processedInsights.intelligent_recommendations.slice(0, 3).map((rec, index) => (
                    <Button
                      key={rec.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedRecommendation(rec)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{rec.title}</div>
                        <div className="text-xs text-gray-600">{rec.expected_impact}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Processing Configuration
              </CardTitle>
              <CardDescription>
                Current analytics processing settings and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Processing Interval</span>
                  <div className="text-lg font-semibold">{config.processing_interval} minutes</div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Compliance Checks</span>
                  <div className="text-lg font-semibold">{config.compliance_check_frequency} minutes</div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Privacy Level</span>
                  <div className="text-lg font-semibold capitalize">{config.privacy_anonymization_level}</div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Predictive Analytics</span>
                  <div className="flex items-center gap-2">
                    {config.enable_predictive_analytics ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm">{config.enable_predictive_analytics ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Intelligent Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Generated Healthcare Recommendations
              </CardTitle>
              <CardDescription>
                Intelligent suggestions to improve your practice performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedInsights.intelligent_recommendations.map((recommendation, index) => (
                  <div key={recommendation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h4 className="font-medium">{recommendation.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="outline">{recommendation.category}</Badge>
                          <Badge variant="outline">{recommendation.implementation_difficulty}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Action Items:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {recommendation.action_items.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Expected Impact:</span>
                        <div className="font-medium text-green-600">{recommendation.expected_impact}</div>
                      </div>
                      {recommendation.ahpra_considerations && (
                        <div>
                          <span className="text-gray-600">AHPRA Considerations:</span>
                          <div className="font-medium text-orange-600">{recommendation.ahpra_considerations}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Monitoring Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Real-time AHPRA Compliance Monitoring
              </CardTitle>
              <CardDescription>
                Automated compliance scoring and violation detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">
                    {processedInsights.compliance_monitoring.real_time_score}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Compliance Score</div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {processedInsights.compliance_monitoring.content_compliance_rate}%
                  </div>
                  <div className="text-sm text-gray-600">Content Compliance</div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {processedInsights.compliance_monitoring.advertising_compliance}%
                  </div>
                  <div className="text-sm text-gray-600">TGA Advertising</div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-orange-600">
                    {processedInsights.compliance_monitoring.professional_boundaries_score}%
                  </div>
                  <div className="text-sm text-gray-600">Professional Standards</div>
                </div>
              </div>

              {processedInsights.compliance_monitoring.alerts.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium">Compliance Alerts</h4>
                  <div className="space-y-2">
                    {processedInsights.compliance_monitoring.alerts.map((alert, index) => (
                      <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        {getSeverityIcon(alert.severity)}
                        <AlertDescription>
                          <div className="space-y-1">
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-sm">Recommended action: {alert.recommended_action}</div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          {/* Predictive Analytics Dashboard */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Booking Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {processedInsights.predictive_analytics.next_month_bookings}
                    </div>
                    <div className="text-sm text-gray-600">Predicted Next Month Bookings</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium">Peak Booking Times:</h5>
                    {processedInsights.predictive_analytics.peak_booking_times.map((time, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{time.day} at {time.hour}:00</span>
                        <div className="flex items-center gap-2">
                          <Progress value={time.probability * 100} className="w-16 h-2" />
                          <span>{(time.probability * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Content Performance Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {processedInsights.predictive_analytics.content_performance_forecast.map((forecast, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium capitalize">{forecast.content_type.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-600">Predicted engagement</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{forecast.predicted_engagement}</div>
                        <div className="text-xs text-gray-500">engagement score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Seasonal Healthcare Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {processedInsights.predictive_analytics.seasonal_trends.map((trend, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{trend.activity_forecast}</div>
                    <div className="text-sm text-gray-600">{trend.month} Activity Forecast</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Patient Churn Risk</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {processedInsights.predictive_analytics.patient_churn_risk.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Patients at risk of not returning
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Performance Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Booking Funnel Optimization
              </CardTitle>
              <CardDescription>
                Identify and fix bottlenecks in your appointment booking process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedInsights.performance_optimization.booking_funnel_optimization.map((stage, index) => (
                  <div key={stage.stage} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h4 className="font-medium capitalize">{stage.stage.replace('_', ' ')}</h4>
                        <div className="text-sm text-gray-600">
                          Current: {stage.current_conversion.toFixed(1)}% | 
                          Potential: +{stage.optimization_potential.toFixed(1)}%
                        </div>
                      </div>
                      <Badge variant="outline">
                        {stage.optimization_potential > 10 ? 'High Impact' : 'Medium Impact'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Recommended Actions:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {stage.recommended_actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Strategy Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedInsights.performance_optimization.content_optimization.map((content, index) => (
                  <div key={content.content_type} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h4 className="font-medium capitalize">{content.content_type.replace('_', ' ')}</h4>
                        <div className="text-sm text-gray-600">
                          Current performance: {content.current_performance}/10
                        </div>
                      </div>
                      <Progress value={content.current_performance * 10} className="w-20" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Improvement Suggestions:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {content.improvement_suggestions.map((suggestion, suggestionIndex) => (
                          <li key={suggestionIndex} className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Patient Engagement Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h5 className="font-medium">Optimal Posting Times:</h5>
                  {processedInsights.performance_optimization.patient_engagement_optimization.best_posting_times.map((time, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">{time.day} at {time.hour}:00</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{time.engagement_multiplier.toFixed(1)}x</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium">Recommended Content Mix:</h5>
                  {Object.entries(processedInsights.performance_optimization.patient_engagement_optimization.content_mix_recommendation).map(([type, percentage]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <span>{(percentage * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={percentage * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <h5 className="font-medium">Engagement Tactics:</h5>
                <div className="grid gap-2 md:grid-cols-2">
                  {processedInsights.performance_optimization.patient_engagement_optimization.engagement_tactics.map((tactic, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 border rounded text-sm">
                      <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {tactic}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 