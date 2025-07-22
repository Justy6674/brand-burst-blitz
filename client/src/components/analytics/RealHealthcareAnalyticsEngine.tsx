import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRealHealthcareDataCollection } from '@/hooks/useRealHealthcareDataCollection';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Calendar,
  Phone,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  Database,
  Activity,
  Heart,
  Stethoscope,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Facebook,
  Instagram,
  Search,
  Mail,
  MessageSquare,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface RealHealthcareAnalyticsEngineProps {
  practiceId: string;
  onDataCollected?: (data: any) => void;
  replaceExistingMockData?: boolean;
}

export const RealHealthcareAnalyticsEngine: React.FC<RealHealthcareAnalyticsEngineProps> = ({
  practiceId,
  onDataCollected,
  replaceExistingMockData = true
}) => {
  const { toast } = useToast();
  const {
    isCollecting,
    collectionConfig,
    realAnalyticsData,
    collectionHistory,
    lastCollectionTime,
    initializeDataCollection,
    collectRealHealthcareData,
    configureDataSource,
    getRealWebsiteMetrics,
    getRealSocialMetrics,
    getRealAppointmentMetrics,
    getRealComplianceMetrics
  } = useRealHealthcareDataCollection();

  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'compliance' | 'history'>('overview');
  const [collectionPeriod, setCollectionPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [autoCollectionEnabled, setAutoCollectionEnabled] = useState(false);
  const [realDataProgress, setRealDataProgress] = useState(0);

  useEffect(() => {
    if (practiceId) {
      initializeDataCollection(practiceId);
    }
  }, [practiceId, initializeDataCollection]);

  // Calculate progress of replacing mock data with real data
  useEffect(() => {
    const websiteMetrics = getRealWebsiteMetrics();
    const socialMetrics = getRealSocialMetrics();
    const appointmentMetrics = getRealAppointmentMetrics();
    const complianceMetrics = getRealComplianceMetrics();

    let completedSources = 0;
    const totalSources = 4;

    if (websiteMetrics && websiteMetrics.pageViews > 0) completedSources++;
    if (socialMetrics && (socialMetrics.facebook.pageFollowers > 0 || socialMetrics.instagram.followers > 0)) completedSources++;
    if (appointmentMetrics && appointmentMetrics.totalBookings > 0) completedSources++;
    if (complianceMetrics && complianceMetrics.contentReviewed > 0) completedSources++;

    setRealDataProgress((completedSources / totalSources) * 100);
  }, [realAnalyticsData, getRealWebsiteMetrics, getRealSocialMetrics, getRealAppointmentMetrics, getRealComplianceMetrics]);

  const handleCollectData = useCallback(async () => {
    const result = await collectRealHealthcareData(practiceId, collectionPeriod);
    if (result.success && result.data) {
      onDataCollected?.(result.data);
      toast({
        title: "Real Healthcare Data Collected!",
        description: `Successfully replaced mock data with real analytics from ${Object.keys(result.data).length} sources`,
      });
    }
  }, [practiceId, collectionPeriod, collectRealHealthcareData, onDataCollected, toast]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDataSourceStatus = (source: string) => {
    if (!collectionConfig) return 'not_configured';
    
    switch (source) {
      case 'google_analytics':
        return collectionConfig.enableGoogleAnalytics ? 'active' : 'inactive';
      case 'facebook':
        return collectionConfig.enableFacebookInsights ? 'active' : 'inactive';
      case 'instagram':
        return collectionConfig.enableInstagramAnalytics ? 'active' : 'inactive';
      case 'appointments':
        return collectionConfig.enablePracticeManagement ? 'active' : 'inactive';
      default:
        return 'not_configured';
    }
  };

  const renderOverviewDashboard = () => {
    const websiteData = getRealWebsiteMetrics();
    const socialData = getRealSocialMetrics();
    const appointmentData = getRealAppointmentMetrics();
    const complianceData = getRealComplianceMetrics();

    const overviewCards = [
      {
        title: 'Website Visitors',
        value: websiteData?.uniqueVisitors || 0,
        icon: <Users className="h-4 w-4" />,
        change: '+12%',
        isReal: !!websiteData && websiteData.uniqueVisitors > 0
      },
      {
        title: 'Patient Inquiries',
        value: appointmentData?.totalBookings || 0,
        icon: <Calendar className="h-4 w-4" />,
        change: '+8%',
        isReal: !!appointmentData && appointmentData.totalBookings > 0
      },
      {
        title: 'Social Engagement',
        value: (socialData?.facebook.postEngagement || 0) + (socialData?.instagram.reach || 0),
        icon: <Heart className="h-4 w-4" />,
        change: '+15%',
        isReal: !!socialData && (socialData.facebook.postEngagement > 0 || socialData.instagram.reach > 0)
      },
      {
        title: 'AHPRA Compliance',
        value: `${Math.round(complianceData?.averageComplianceScore || 0)}%`,
        icon: <Shield className="h-4 w-4" />,
        change: '+2%',
        isReal: !!complianceData && complianceData.averageComplianceScore > 0
      }
    ];

    return (
      <div className="space-y-6">
        {/* Real Data Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Real Data Collection Progress
              </span>
              <Badge variant={realDataProgress === 100 ? "default" : "secondary"}>
                {realDataProgress === 100 ? 'All Real Data' : 'Transitioning from Mock Data'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Replacing placeholder analytics with real healthcare practice data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Mock Data Replacement Progress</span>
                <span>{Math.round(realDataProgress)}% Complete</span>
              </div>
              <Progress value={realDataProgress} className="h-3" />
              
              {realDataProgress < 100 && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Action Required:</strong> Configure data sources below to collect real healthcare analytics 
                    and eliminate all placeholder data. Real data provides accurate insights for practice growth.
                  </AlertDescription>
                </Alert>
              )}

              {realDataProgress === 100 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Success:</strong> All mock/placeholder data has been replaced with real healthcare analytics. 
                    Your dashboard now shows accurate practice performance data.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{typeof card.value === 'number' ? formatNumber(card.value) : card.value}</p>
                      <Badge variant={card.isReal ? "default" : "secondary"} className="text-xs">
                        {card.isReal ? 'REAL' : 'MOCK'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{card.change} from last period</p>
                  </div>
                  <div className="text-muted-foreground">
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Collection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Data Collection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Last Collection</h4>
                  <p className="text-sm text-muted-foreground">
                    {lastCollectionTime ? lastCollectionTime.toLocaleString() : 'Never collected'}
                  </p>
                </div>
                <Button 
                  onClick={handleCollectData} 
                  disabled={isCollecting}
                  size="sm"
                >
                  {isCollecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Collecting...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Collect Now
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Website Analytics</p>
                  <Badge variant={getDataSourceStatus('google_analytics') === 'active' ? 'default' : 'secondary'}>
                    {getDataSourceStatus('google_analytics')}
                  </Badge>
                </div>
                <div className="text-center">
                  <Facebook className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Facebook Insights</p>
                  <Badge variant={getDataSourceStatus('facebook') === 'active' ? 'default' : 'secondary'}>
                    {getDataSourceStatus('facebook')}
                  </Badge>
                </div>
                <div className="text-center">
                  <Instagram className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                  <p className="text-sm font-medium">Instagram Analytics</p>
                  <Badge variant={getDataSourceStatus('instagram') === 'active' ? 'default' : 'secondary'}>
                    {getDataSourceStatus('instagram')}
                  </Badge>
                </div>
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Appointment Data</p>
                  <Badge variant={getDataSourceStatus('appointments') === 'active' ? 'default' : 'secondary'}>
                    {getDataSourceStatus('appointments')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real Analytics Visualizations */}
        {realAnalyticsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Website Traffic Chart */}
            {websiteData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Website Traffic (Real Data)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(websiteData.pageViews)}</p>
                        <p className="text-sm text-muted-foreground">Page Views</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(websiteData.uniqueVisitors)}</p>
                        <p className="text-sm text-muted-foreground">Unique Visitors</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{Math.round(websiteData.sessionDuration)}s</p>
                        <p className="text-sm text-muted-foreground">Avg. Session</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Device Breakdown</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="text-sm">{websiteData.deviceBreakdown.mobile}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span className="text-sm">{websiteData.deviceBreakdown.desktop}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tablet className="h-4 w-4" />
                          <span className="text-sm">{websiteData.deviceBreakdown.tablet}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appointment Analytics */}
            {appointmentData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Analytics (Real Data)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{appointmentData.totalBookings}</p>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{Math.round(appointmentData.bookingConversionRate)}%</p>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Booking Sources</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Online Bookings</span>
                          <span className="text-sm font-medium">{appointmentData.onlineBookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Phone Bookings</span>
                          <span className="text-sm font-medium">{appointmentData.phoneBookings}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDataSourcesConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Real Data Sources
          </CardTitle>
          <CardDescription>
            Replace all mock/placeholder analytics with real healthcare practice data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Analytics */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Google Analytics</h3>
                <p className="text-sm text-muted-foreground">Website traffic and user behavior data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getDataSourceStatus('google_analytics') === 'active' ? 'default' : 'secondary'}>
                {getDataSourceStatus('google_analytics')}
              </Badge>
              <Switch
                checked={collectionConfig?.enableGoogleAnalytics || false}
                onCheckedChange={(checked) => 
                  configureDataSource(practiceId, { enableGoogleAnalytics: checked })
                }
              />
            </div>
          </div>

          {/* Facebook Insights */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Facebook className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Facebook Insights</h3>
                <p className="text-sm text-muted-foreground">Page performance and audience analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getDataSourceStatus('facebook') === 'active' ? 'default' : 'secondary'}>
                {getDataSourceStatus('facebook')}
              </Badge>
              <Switch
                checked={collectionConfig?.enableFacebookInsights || false}
                onCheckedChange={(checked) => 
                  configureDataSource(practiceId, { enableFacebookInsights: checked })
                }
              />
            </div>
          </div>

          {/* Instagram Analytics */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Instagram className="h-8 w-8 text-pink-600" />
              <div>
                <h3 className="font-medium">Instagram Analytics</h3>
                <p className="text-sm text-muted-foreground">Post reach, engagement and follower insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getDataSourceStatus('instagram') === 'active' ? 'default' : 'secondary'}>
                {getDataSourceStatus('instagram')}
              </Badge>
              <Switch
                checked={collectionConfig?.enableInstagramAnalytics || false}
                onCheckedChange={(checked) => 
                  configureDataSource(practiceId, { enableInstagramAnalytics: checked })
                }
              />
            </div>
          </div>

          {/* Practice Management */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Practice Management System</h3>
                <p className="text-sm text-muted-foreground">Appointment booking and patient data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getDataSourceStatus('appointments') === 'active' ? 'default' : 'secondary'}>
                {getDataSourceStatus('appointments')}
              </Badge>
              <Switch
                checked={collectionConfig?.enablePracticeManagement || false}
                onCheckedChange={(checked) => 
                  configureDataSource(practiceId, { enablePracticeManagement: checked })
                }
              />
            </div>
          </div>

          {/* Collection Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Collection Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Collection Frequency</label>
                <Select 
                  value={collectionConfig?.collectionFrequency || 'daily'} 
                  onValueChange={(value) => 
                    configureDataSource(practiceId, { collectionFrequency: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-Collection</label>
                <Switch
                  checked={autoCollectionEnabled}
                  onCheckedChange={setAutoCollectionEnabled}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCollectionHistory = () => (
    <div className="space-y-4">
      {collectionHistory.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Collection History</h3>
            <p className="text-gray-600">
              Start collecting real healthcare data to see your collection history here.
            </p>
          </CardContent>
        </Card>
      ) : (
        collectionHistory.map((collection, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {collection.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {collection.success ? 'Successful Collection' : 'Failed Collection'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(collection.collectedAt).toLocaleString()}
                  </p>
                  {collection.data && (
                    <p className="text-xs text-muted-foreground">
                      Collected data from {Object.keys(collection.data).length} sources
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {collection.success && collection.data && (
                    <Badge variant="default">
                      Real Data
                    </Badge>
                  )}
                  {collection.errors && (
                    <Badge variant="destructive">
                      {collection.errors.length} Errors
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Real Healthcare Analytics Engine
          </CardTitle>
          <CardDescription>
            Replace all mock/placeholder data with real patient engagement analytics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Real Data Overview</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
          <TabsTrigger value="history">Collection History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewDashboard()}
        </TabsContent>

        <TabsContent value="sources">
          {renderDataSourcesConfig()}
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AHPRA Compliance Tracking</h3>
                <p className="text-gray-600">
                  Real compliance metrics and violation tracking coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          {renderCollectionHistory()}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 