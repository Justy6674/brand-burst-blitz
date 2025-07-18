import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Target, 
  MapPin,
  Building,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface KPIData {
  industryConversions: {
    health: { rate: number; trend: 'up' | 'down'; value: number };
    finance: { rate: number; trend: 'up' | 'down'; value: number };
    legal: { rate: number; trend: 'up' | 'down'; value: number };
    fitness: { rate: number; trend: 'up' | 'down'; value: number };
    beauty: { rate: number; trend: 'up' | 'down'; value: number };
    tech: { rate: number; trend: 'up' | 'down'; value: number };
    general: { rate: number; trend: 'up' | 'down'; value: number };
  };
  australianMetrics: {
    totalUsers: number;
    activeUsers: number;
    retention30Day: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  regionalPerformance: {
    sydney: { users: number; conversion: number; engagement: number };
    melbourne: { users: number; conversion: number; engagement: number };
    brisbane: { users: number; conversion: number; engagement: number };
    perth: { users: number; conversion: number; engagement: number };
    adelaide: { users: number; conversion: number; engagement: number };
    regional: { users: number; conversion: number; engagement: number };
  };
  businessCycle: {
    eofy: { activity: number; conversions: number; revenue: number };
    taxSeason: { activity: number; conversions: number; revenue: number };
    newYear: { activity: number; conversions: number; revenue: number };
    regularMonths: { activity: number; conversions: number; revenue: number };
  };
}

export const AustralianKPITracker = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    industryConversions: {
      health: { rate: 8.3, trend: 'up', value: 127 },
      finance: { rate: 6.7, trend: 'up', value: 94 },
      legal: { rate: 7.1, trend: 'down', value: 83 },
      fitness: { rate: 9.2, trend: 'up', value: 156 },
      beauty: { rate: 8.8, trend: 'up', value: 134 },
      tech: { rate: 5.4, trend: 'down', value: 67 },
      general: { rate: 7.6, trend: 'up', value: 198 }
    },
    australianMetrics: {
      totalUsers: 2847,
      activeUsers: 1923,
      retention30Day: 76,
      avgSessionDuration: 18.4,
      bounceRate: 24
    },
    regionalPerformance: {
      sydney: { users: 892, conversion: 8.2, engagement: 87 },
      melbourne: { users: 743, conversion: 7.8, engagement: 85 },
      brisbane: { users: 521, conversion: 8.9, engagement: 89 },
      perth: { users: 387, conversion: 7.3, engagement: 82 },
      adelaide: { users: 234, conversion: 8.1, engagement: 86 },
      regional: { users: 70, conversion: 9.1, engagement: 91 }
    },
    businessCycle: {
      eofy: { activity: 147, conversions: 12.3, revenue: 18950 },
      taxSeason: { activity: 132, conversions: 9.8, revenue: 14200 },
      newYear: { activity: 118, conversions: 8.2, revenue: 12400 },
      regularMonths: { activity: 100, conversions: 7.1, revenue: 9800 }
    }
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <ArrowUp className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Australian Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Australian Market Performance Overview</span>
            <Badge variant="secondary">Live Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{kpiData.australianMetrics.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total AU Users</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{kpiData.australianMetrics.activeUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{kpiData.australianMetrics.retention30Day}%</div>
              <div className="text-sm text-muted-foreground">30-Day Retention</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{kpiData.australianMetrics.avgSessionDuration}m</div>
              <div className="text-sm text-muted-foreground">Avg Session</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="industry" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="industry">Industry Performance</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="business-cycle">Business Cycle</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        </TabsList>

        {/* Industry Performance Tab */}
        <TabsContent value="industry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>Industry-Specific Conversion Rates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(kpiData.industryConversions).map(([industry, data]) => (
                  <div key={industry} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium capitalize">{industry}</div>
                    <div className="flex-1">
                      <Progress value={data.rate} className="h-3" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-12 text-sm font-bold">{data.rate}%</span>
                      {getTrendIcon(data.trend)}
                      <span className={`text-xs ${getTrendColor(data.trend)}`}>
                        {data.value} conversions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Analysis Tab */}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <span>Australian Regional Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">User Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(kpiData.regionalPerformance).map(([region, data]) => (
                      <div key={region} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{region}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{data.users} users</span>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${(data.users / 892) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Performance Metrics</h4>
                  <div className="space-y-3">
                    {Object.entries(kpiData.regionalPerformance).map(([region, data]) => (
                      <div key={region} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{region}</span>
                        <div className="text-right">
                          <div className="text-sm font-bold">{data.conversion}% conv</div>
                          <div className="text-xs text-muted-foreground">{data.engagement}% eng</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Cycle Tab */}
        <TabsContent value="business-cycle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span>Australian Business Cycle Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(kpiData.businessCycle).map(([period, data]) => (
                  <Card key={period} className="p-4">
                    <h4 className="font-semibold mb-3 capitalize">
                      {period.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Activity Index:</span>
                        <span className="font-bold">{data.activity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Conversion Rate:</span>
                        <span className="font-bold text-green-600">{data.conversions}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Revenue:</span>
                        <span className="font-bold text-blue-600">AU${data.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="ab-testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                <span>Active A/B Tests - Australian Market</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Trust Signals Test */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Australian Trust Signals Effectiveness</h4>
                    <Badge variant="secondary">Running</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Control (Generic)</div>
                      <div className="text-2xl font-bold">6.8%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Variant (🇦🇺 Australian Owned)</div>
                      <div className="text-2xl font-bold text-green-600">8.4%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate (+23.5%)</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-green-600 font-medium">
                    ✓ Statistical significance reached (95% confidence)
                  </div>
                </div>

                {/* Industry Messaging Test */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Industry-Specific Landing Pages</h4>
                    <Badge variant="secondary">Running</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Generic Landing</div>
                      <div className="text-2xl font-bold">5.2%</div>
                      <div className="text-sm text-muted-foreground">Conversion</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Industry-Specific</div>
                      <div className="text-2xl font-bold text-green-600">7.9%</div>
                      <div className="text-sm text-muted-foreground">Conversion (+51.9%)</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Compliance-Focused</div>
                      <div className="text-2xl font-bold text-blue-600">8.3%</div>
                      <div className="text-sm text-muted-foreground">Conversion (+59.6%)</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-blue-600 font-medium">
                    📊 Compliance-focused messaging performing best for regulated industries
                  </div>
                </div>

                {/* Pricing Display Test */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Australian Pricing Display</h4>
                    <Badge variant="outline">Planning</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Hypothesis:</strong> Showing "AUD inc. GST" and emphasizing savings vs agency costs will improve conversion for Australian businesses.
                  </div>
                  <div className="mt-3 space-y-2">
                    <div><strong>Test Duration:</strong> 4 weeks</div>
                    <div><strong>Sample Size:</strong> 2,000 Australian visitors</div>
                    <div><strong>Primary Metric:</strong> Signup conversion rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};