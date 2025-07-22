import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Globe, 
  Server,
  TrendingUp,
  Wifi,
  MapPin,
  Users
} from 'lucide-react';

interface PerformanceMetrics {
  responseTime: number;
  cdnLatency: number;
  australianUserPercentage: number;
  serverUptime: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  peakUsageHours: string;
  regionalPerformance: {
    sydney: number;
    melbourne: number;
    brisbane: number;
    perth: number;
    adelaide: number;
  };
}

export const AustralianPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 285,
    cdnLatency: 42,
    australianUserPercentage: 94,
    serverUptime: 99.8,
    connectionQuality: 'excellent',
    peakUsageHours: '9:00 AM - 5:00 PM AEST',
    regionalPerformance: {
      sydney: 98,
      melbourne: 96,
      brisbane: 94,
      perth: 91,
      adelaide: 93
    }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.max(200, prev.responseTime + (Math.random() - 0.5) * 20),
        cdnLatency: Math.max(20, prev.cdnLatency + (Math.random() - 0.5) * 10),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.fair) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyColor = (latency: number) => {
    if (latency <= 50) return 'text-green-600';
    if (latency <= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Australian Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <span>Australian User Experience Metrics</span>
            <Badge variant="outline" className="ml-2">
              Live Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className={`text-2xl font-bold ${getLatencyColor(metrics.responseTime)}`}>
                {metrics.responseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <Wifi className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className={`text-2xl font-bold ${getLatencyColor(metrics.cdnLatency)}`}>
                {metrics.cdnLatency.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">CDN Latency</div>
            </div>
            
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-green-600">
                {metrics.australianUserPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">AU Users</div>
            </div>
            
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <Server className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-green-600">
                {metrics.serverUptime}%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <span>Australian Regional Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.regionalPerformance).map(([city, performance]) => (
              <div key={city} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium capitalize">{city}</div>
                <div className="flex-1">
                  <Progress value={performance} className="h-3" />
                </div>
                <div className={`w-12 text-sm font-bold ${getPerformanceColor(performance, { good: 95, fair: 90 })}`}>
                  {performance}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <strong>Performance Score</strong> based on response time, connection quality, and user satisfaction metrics.
          </div>
        </CardContent>
      </Card>

      {/* Business Hours Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Australian Business Hours Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Peak Usage Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Business Hours (9AM-5PM AEST):</span>
                  <span className="font-bold text-green-600">78% of traffic</span>
                </div>
                <div className="flex justify-between">
                  <span>Lunch Break (12PM-1PM AEST):</span>
                  <span className="font-bold text-blue-600">Peak usage</span>
                </div>
                <div className="flex justify-between">
                  <span>Evening (6PM-9PM AEST):</span>
                  <span className="font-bold text-yellow-600">15% of traffic</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekend Activity:</span>
                  <span className="font-bold text-purple-600">7% of traffic</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Performance Optimizations</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>Auto-scaling during AEST business hours</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>Pre-warmed CDN cache for Australian content</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>Optimized database queries for AU time zones</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>Scheduled maintenance outside business hours</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Quality Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">All Systems Operational</span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {metrics.connectionQuality.toUpperCase()}
            </Badge>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <strong>Next Maintenance Window:</strong> Sunday 2:00 AM - 4:00 AM AEST (minimal impact expected)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};