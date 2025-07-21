import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  Clock, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useCache } from '@/hooks/useIntelligentCache';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';

interface PerformanceMetrics {
  // Cache Performance
  cacheHitRate: number;
  cacheMemoryUsage: number;
  cacheTotalRequests: number;
  
  // Database Performance
  dbQueryTime: number;
  dbConnectionPool: number;
  dbActiveConnections: number;
  
  // API Performance
  apiResponseTime: number;
  apiErrorRate: number;
  apiThroughput: number;
  
  // Healthcare Specific
  complianceCheckTime: number;
  ahpraValidationTime: number;
  tgaComplianceRate: number;
  
  // System Health
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  
  // User Experience
  pageLoadTime: number;
  contentGenerationTime: number;
  userSatisfactionScore: number;
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'performance' | 'security' | 'compliance' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  impact: 'high' | 'medium' | 'low';
}

export function HealthcarePlatformPerformanceMonitor() {
  const { user } = useAuth();
  const { getCacheMetrics, getPerformanceMetrics, invalidateCache } = useCache();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch performance metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get cache performance
      const cachePerf = getPerformanceMetrics();
      const cacheMetrics = await getCacheMetrics();
      
      // Simulate other metrics (in real implementation, these would come from monitoring APIs)
      const mockMetrics: PerformanceMetrics = {
        // Cache Performance
        cacheHitRate: cachePerf.hitRate,
        cacheMemoryUsage: cachePerf.estimatedMemoryUsage / (1024 * 1024), // MB
        cacheTotalRequests: cachePerf.totalRequests,
        
        // Database Performance
        dbQueryTime: Math.random() * 50 + 20, // 20-70ms
        dbConnectionPool: Math.floor(Math.random() * 20) + 80, // 80-100%
        dbActiveConnections: Math.floor(Math.random() * 30) + 10,
        
        // API Performance
        apiResponseTime: Math.random() * 200 + 100, // 100-300ms
        apiErrorRate: Math.random() * 2, // 0-2%
        apiThroughput: Math.random() * 1000 + 500, // 500-1500 req/min
        
        // Healthcare Specific
        complianceCheckTime: Math.random() * 1000 + 500, // 500-1500ms
        ahpraValidationTime: Math.random() * 2000 + 1000, // 1-3s
        tgaComplianceRate: 95 + Math.random() * 5, // 95-100%
        
        // System Health
        cpuUsage: Math.random() * 40 + 20, // 20-60%
        memoryUsage: Math.random() * 30 + 50, // 50-80%
        diskUsage: Math.random() * 20 + 30, // 30-50%
        uptime: 99.8 + Math.random() * 0.2, // 99.8-100%
        
        // User Experience
        pageLoadTime: Math.random() * 1000 + 500, // 500-1500ms
        contentGenerationTime: Math.random() * 3000 + 2000, // 2-5s
        userSatisfactionScore: 4.2 + Math.random() * 0.8 // 4.2-5.0
      };
      
      setMetrics(mockMetrics);
      setLastUpdated(new Date());
      
      // Generate alerts based on metrics
      generateAlerts(mockMetrics);
      
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to load performance metrics');
    } finally {
      setIsLoading(false);
    }
  }, [getCacheMetrics, getPerformanceMetrics]);

  // Generate system alerts based on metrics
  const generateAlerts = (metrics: PerformanceMetrics) => {
    const newAlerts: SystemAlert[] = [];
    
    // Performance alerts
    if (metrics.cacheHitRate < 70) {
      newAlerts.push({
        id: 'cache-hit-rate-low',
        type: 'warning',
        category: 'performance',
        title: 'Low Cache Hit Rate',
        description: `Cache hit rate is ${metrics.cacheHitRate.toFixed(1)}%. Consider reviewing cache strategies.`,
        timestamp: new Date(),
        resolved: false,
        impact: 'medium'
      });
    }
    
    if (metrics.apiResponseTime > 250) {
      newAlerts.push({
        id: 'api-response-slow',
        type: 'warning',
        category: 'performance',
        title: 'Slow API Response',
        description: `API response time is ${metrics.apiResponseTime.toFixed(0)}ms. May impact user experience.`,
        timestamp: new Date(),
        resolved: false,
        impact: 'medium'
      });
    }
    
    if (metrics.dbQueryTime > 60) {
      newAlerts.push({
        id: 'db-query-slow',
        type: 'critical',
        category: 'performance',
        title: 'Slow Database Queries',
        description: `Database query time is ${metrics.dbQueryTime.toFixed(0)}ms. Review query optimization.`,
        timestamp: new Date(),
        resolved: false,
        impact: 'high'
      });
    }
    
    // Compliance alerts
    if (metrics.tgaComplianceRate < 98) {
      newAlerts.push({
        id: 'tga-compliance-low',
        type: 'critical',
        category: 'compliance',
        title: 'TGA Compliance Rate Below Threshold',
        description: `TGA compliance rate is ${metrics.tgaComplianceRate.toFixed(1)}%. Immediate review required.`,
        timestamp: new Date(),
        resolved: false,
        impact: 'high'
      });
    }
    
    // System health alerts
    if (metrics.cpuUsage > 80) {
      newAlerts.push({
        id: 'cpu-usage-high',
        type: 'critical',
        category: 'system',
        title: 'High CPU Usage',
        description: `CPU usage is ${metrics.cpuUsage.toFixed(1)}%. Consider scaling resources.`,
        timestamp: new Date(),
        resolved: false,
        impact: 'high'
      });
    }
    
    if (metrics.memoryUsage > 85) {
      newAlerts.push({
        id: 'memory-usage-high',
        type: 'warning',
        category: 'system',
        title: 'High Memory Usage',
        description: `Memory usage is ${metrics.memoryUsage.toFixed(1)}%. Monitor for potential issues.`,
        timestamp: new Date(),
        resolved: false,
        impact: 'medium'
      });
    }
    
    setAlerts(newAlerts);
  };

  // Performance status indicator
  const getStatusIndicator = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return { color: 'bg-green-500', text: 'Excellent' };
    if (value >= thresholds.warning) return { color: 'bg-yellow-500', text: 'Good' };
    return { color: 'bg-red-500', text: 'Needs Attention' };
  };

  // Handle alert resolution
  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  // Force cache refresh
  const handleCacheRefresh = async () => {
    try {
      await invalidateCache('*', 'manual_refresh');
      toast.success('Cache refreshed successfully');
      fetchMetrics();
    } catch (error) {
      toast.error('Failed to refresh cache');
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchMetrics]);

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Healthcare Platform Performance Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring for Australian healthcare compliance and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.filter(alert => !alert.resolved).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Active Alerts ({alerts.filter(alert => !alert.resolved).length})
          </h2>
          {alerts.filter(alert => !alert.resolved).map(alert => (
            <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                {alert.title}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveAlert(alert.id)}
                >
                  Mark Resolved
                </Button>
              </AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Performance Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare Metrics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cache Hit Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.cacheHitRate.toFixed(1)}%</div>
                <Progress value={metrics?.cacheHitRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {getStatusIndicator(metrics?.cacheHitRate || 0, { good: 80, warning: 60 }).text}
                </p>
              </CardContent>
            </Card>

            {/* API Response Time */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.apiResponseTime.toFixed(0)}ms</div>
                <Progress value={Math.max(0, 100 - (metrics?.apiResponseTime || 0) / 3)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {(metrics?.apiResponseTime || 0) < 200 ? 'Excellent' : 
                   (metrics?.apiResponseTime || 0) < 300 ? 'Good' : 'Needs Attention'}
                </p>
              </CardContent>
            </Card>

            {/* TGA Compliance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">TGA Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.tgaComplianceRate.toFixed(1)}%</div>
                <Progress value={metrics?.tgaComplianceRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {(metrics?.tgaComplianceRate || 0) >= 98 ? 'Compliant' : 'Review Required'}
                </p>
              </CardContent>
            </Card>

            {/* System Uptime */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.uptime.toFixed(2)}%</div>
                <Progress value={metrics?.uptime} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {(metrics?.uptime || 0) >= 99.5 ? 'Excellent' : 'Monitor'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common performance optimization tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleCacheRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Cache
                </Button>
                <Button variant="outline" onClick={() => fetchMetrics()}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Refresh Metrics
                </Button>
                <Button variant="outline" disabled>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
                <Button variant="outline" disabled>
                  <Users className="h-4 w-4 mr-2" />
                  User Session Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cache Performance Tab */}
        <TabsContent value="cache" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
                <CardDescription>Percentage of requests served from cache</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.cacheHitRate.toFixed(1)}%</div>
                <Progress value={metrics?.cacheHitRate} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Cache memory consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.cacheMemoryUsage.toFixed(1)}MB</div>
                <Progress value={(metrics?.cacheMemoryUsage || 0) / 50 * 100} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Requests</CardTitle>
                <CardDescription>Cache requests in current session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.cacheTotalRequests || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((metrics?.cacheHitRate || 0) * (metrics?.cacheTotalRequests || 0) / 100).toFixed(0)} hits
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Healthcare Metrics Tab */}
        <TabsContent value="healthcare" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>AHPRA Validation Time</CardTitle>
                <CardDescription>Time to validate practitioner registration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.ahpraValidationTime.toFixed(0)}ms</div>
                <Progress 
                  value={Math.max(0, 100 - (metrics?.ahpraValidationTime || 0) / 30)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compliance Check Time</CardTitle>
                <CardDescription>Time to process content compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.complianceCheckTime.toFixed(0)}ms</div>
                <Progress 
                  value={Math.max(0, 100 - (metrics?.complianceCheckTime || 0) / 15)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Content Generation Time</CardTitle>
                <CardDescription>Time to generate healthcare content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(metrics?.contentGenerationTime || 0) / 1000}s</div>
                <Progress 
                  value={Math.max(0, 100 - (metrics?.contentGenerationTime || 0) / 50)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Satisfaction</CardTitle>
                <CardDescription>Average user satisfaction score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.userSatisfactionScore.toFixed(1)}/5.0</div>
                <Progress value={(metrics?.userSatisfactionScore || 0) * 20} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
                <CardDescription>Current CPU utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.cpuUsage.toFixed(1)}%</div>
                <Progress value={metrics?.cpuUsage} className="mt-2" />
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  (metrics?.cpuUsage || 0) < 70 ? 'bg-green-500' : 
                  (metrics?.cpuUsage || 0) < 85 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Current memory utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.memoryUsage.toFixed(1)}%</div>
                <Progress value={metrics?.memoryUsage} className="mt-2" />
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  (metrics?.memoryUsage || 0) < 75 ? 'bg-green-500' : 
                  (metrics?.memoryUsage || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Disk Usage</CardTitle>
                <CardDescription>Current disk utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.diskUsage.toFixed(1)}%</div>
                <Progress value={metrics?.diskUsage} className="mt-2" />
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  (metrics?.diskUsage || 0) < 80 ? 'bg-green-500' : 
                  (metrics?.diskUsage || 0) < 95 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 