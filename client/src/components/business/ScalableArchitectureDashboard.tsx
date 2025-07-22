import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Database,
  Shield,
  Zap,
  Globe,
  Settings,
  Server,
  Lock,
  Users,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

interface DatabaseConfig {
  isolation: 'shared' | 'dedicated' | 'hybrid';
  backupFrequency: string;
  retentionDays: number;
  replicationEnabled: boolean;
}

interface PerformanceMetric {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

const ScalableArchitectureDashboard = () => {
  const { toast } = useToast();
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
    isolation: 'hybrid',
    backupFrequency: 'daily',
    retentionDays: 30,
    replicationEnabled: true
  });

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Database Response Time',
      value: '45ms',
      status: 'good',
      description: 'Average query response time across all customer databases'
    },
    {
      name: 'Storage Utilization',
      value: '67%',
      status: 'warning',
      description: 'Current storage usage - approaching 70% threshold'
    },
    {
      name: 'Concurrent Connections',
      value: '234/500',
      status: 'good',
      description: 'Active database connections across all tenants'
    },
    {
      name: 'Backup Success Rate',
      value: '99.8%',
      status: 'good',
      description: 'Successful backup completion rate over the last 30 days'
    },
    {
      name: 'API Response Time',
      value: '120ms',
      status: 'warning',
      description: 'Average API endpoint response time'
    },
    {
      name: 'Cache Hit Rate',
      value: '94.2%',
      status: 'good',
      description: 'Content delivery cache performance'
    }
  ];

  const customerTenants = [
    { name: 'TechCorp Solutions', isolation: 'dedicated', status: 'active', dataSize: '2.4GB', lastBackup: '2h ago' },
    { name: 'HealthWell Clinic', isolation: 'shared', status: 'active', dataSize: '1.8GB', lastBackup: '1h ago' },
    { name: 'FinanceFirst Advisory', isolation: 'hybrid', status: 'active', dataSize: '3.2GB', lastBackup: '3h ago' },
    { name: 'LegalEagle Law Firm', isolation: 'dedicated', status: 'maintenance', dataSize: '4.1GB', lastBackup: '30m ago' },
    { name: 'FitLife Gym Chain', isolation: 'shared', status: 'active', dataSize: '1.2GB', lastBackup: '45m ago' }
  ];

  const integrationServices = [
    { name: 'Mailchimp', status: 'connected', customers: 23, lastSync: '15m ago' },
    { name: 'Google Analytics', status: 'connected', customers: 45, lastSync: '5m ago' },
    { name: 'HubSpot', status: 'connected', customers: 12, lastSync: '22m ago' },
    { name: 'Salesforce', status: 'maintenance', customers: 8, lastSync: '2h ago' },
    { name: 'Slack', status: 'connected', customers: 34, lastSync: '8m ago' },
    { name: 'Zapier', status: 'connected', customers: 67, lastSync: '3m ago' }
  ];

  const webhookEvents = [
    { event: 'blog.post.published', customers: 89, success: 98.7, avgLatency: '45ms' },
    { event: 'customer.signup', customers: 127, success: 99.2, avgLatency: '32ms' },
    { event: 'payment.completed', customers: 127, success: 99.8, avgLatency: '28ms' },
    { event: 'content.generated', customers: 89, success: 97.3, avgLatency: '156ms' },
    { event: 'backup.completed', customers: 127, success: 99.1, avgLatency: '89ms' }
  ];

  const handleConfigUpdate = () => {
    toast({
      title: "Configuration Updated",
      description: "Database architecture settings have been saved successfully."
    });
  };

  const handleScaleOptimization = () => {
    toast({
      title: "Optimization Started",
      description: "Performance optimization process initiated. This may take a few minutes."
    });
  };

  const handleBackupTest = () => {
    toast({
      title: "Backup Test Initiated",
      description: "Testing backup and recovery procedures across all customer tenants."
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active' },
      maintenance: { variant: 'secondary' as const, label: 'Maintenance' },
      connected: { variant: 'default' as const, label: 'Connected' },
      disconnected: { variant: 'destructive' as const, label: 'Disconnected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMetricStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Scalable Architecture</h1>
            <p className="text-muted-foreground">Multi-tenant database design and performance monitoring</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={handleScaleOptimization} variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Optimize Performance
            </Button>
            <Button onClick={handleBackupTest} variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Test Backups
            </Button>
            <Button onClick={handleConfigUpdate}>
              <Settings className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>

        <Tabs defaultValue="database" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="database">Database Design</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="api">API Layer</TabsTrigger>
          </TabsList>

          {/* Database Design Tab */}
          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Multi-Tenant Configuration
                  </CardTitle>
                  <CardDescription>Configure database isolation and backup strategies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="isolation">Tenant Isolation Strategy</Label>
                    <select 
                      id="isolation"
                      value={databaseConfig.isolation}
                      onChange={(e) => setDatabaseConfig(prev => ({ 
                        ...prev, 
                        isolation: e.target.value as 'shared' | 'dedicated' | 'hybrid' 
                      }))}
                      className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                    >
                      <option value="shared">Shared Database</option>
                      <option value="dedicated">Dedicated Databases</option>
                      <option value="hybrid">Hybrid Approach</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <select 
                      id="backup-frequency"
                      value={databaseConfig.backupFrequency}
                      onChange={(e) => setDatabaseConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="retention">Backup Retention (Days)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={databaseConfig.retentionDays}
                      onChange={(e) => setDatabaseConfig(prev => ({ 
                        ...prev, 
                        retentionDays: parseInt(e.target.value) 
                      }))}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="replication">Enable Replication</Label>
                      <p className="text-sm text-muted-foreground">Real-time data replication for disaster recovery</p>
                    </div>
                    <Switch
                      id="replication"
                      checked={databaseConfig.replicationEnabled}
                      onCheckedChange={(checked) => setDatabaseConfig(prev => ({ 
                        ...prev, 
                        replicationEnabled: checked 
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Customer Tenants
                  </CardTitle>
                  <CardDescription>Overview of customer database instances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerTenants.map((tenant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{tenant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tenant.isolation} • {tenant.dataSize} • Last backup: {tenant.lastBackup}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(tenant.status)}
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security & Backup Status
                </CardTitle>
                <CardDescription>Real-time security and backup monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Data Isolation</h3>
                    <p className="text-sm text-muted-foreground">All customer data properly isolated with RLS policies</p>
                  </div>
                  
                  <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <HardDrive className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Backup Health</h3>
                    <p className="text-sm text-muted-foreground">127 customers with successful backups in last 24h</p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <Lock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Encryption</h3>
                    <p className="text-sm text-muted-foreground">AES-256 encryption for data at rest and in transit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {performanceMetrics.map((metric, index) => (
                <Card key={index} className="transition-all duration-300 hover:shadow-elegant">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getMetricStatusIcon(metric.status)}
                        <h3 className="font-semibold text-foreground">{metric.name}</h3>
                      </div>
                      <div className="text-2xl font-bold text-primary">{metric.value}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Performance Optimization Recommendations
                </CardTitle>
                <CardDescription>AI-powered suggestions for improving system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      priority: 'High',
                      title: 'Implement Database Connection Pooling',
                      description: 'Reduce connection overhead by implementing connection pooling for high-traffic customers',
                      impact: '+15% performance',
                      effort: 'Medium'
                    },
                    {
                      priority: 'Medium',
                      title: 'Enable Query Result Caching',
                      description: 'Cache frequently accessed blog content to reduce database load',
                      impact: '+8% performance',
                      effort: 'Low'
                    },
                    {
                      priority: 'Medium',
                      title: 'Optimize Storage Partitioning',
                      description: 'Partition customer data by date ranges for improved query performance',
                      impact: '+12% performance',
                      effort: 'High'
                    }
                  ].map((recommendation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={recommendation.priority === 'High' ? 'destructive' : 'secondary'}>
                            {recommendation.priority} Priority
                          </Badge>
                          <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{recommendation.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Impact: {recommendation.impact}</span>
                          <span>Effort: {recommendation.effort}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Implement
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  Third-Party Integration Status
                </CardTitle>
                <CardDescription>Monitor connection health for external services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrationServices.map((service, index) => (
                    <Card key={index} className="border border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          {getStatusBadge(service.status)}
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div>Connected Customers: {service.customers}</div>
                          <div>Last Sync: {service.lastSync}</div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-3">
                          Manage
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Webhook System Performance
                </CardTitle>
                <CardDescription>Real-time webhook delivery metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhookEvents.map((webhook, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{webhook.event}</div>
                        <div className="text-sm text-muted-foreground">{webhook.customers} customers subscribed</div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{webhook.success}%</div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-primary">{webhook.avgLatency}</div>
                          <div className="text-xs text-muted-foreground">Avg Latency</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Layer Tab */}
          <TabsContent value="api" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    API Endpoints
                  </CardTitle>
                  <CardDescription>Customer blog management API status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { endpoint: '/api/blogs', method: 'GET', usage: '45,230', latency: '120ms', status: 'healthy' },
                    { endpoint: '/api/blogs', method: 'POST', usage: '8,750', latency: '156ms', status: 'healthy' },
                    { endpoint: '/api/posts', method: 'GET', usage: '78,450', latency: '89ms', status: 'healthy' },
                    { endpoint: '/api/posts', method: 'POST', usage: '12,340', latency: '234ms', status: 'warning' },
                    { endpoint: '/api/analytics', method: 'GET', usage: '23,100', latency: '67ms', status: 'healthy' },
                    { endpoint: '/api/templates', method: 'GET', usage: '5,670', latency: '45ms', status: 'healthy' }
                  ].map((api, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{api.method}</Badge>
                          <code className="text-sm font-mono">{api.endpoint}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{api.usage} calls</span>
                        <span>{api.latency}</span>
                        <Badge variant={api.status === 'healthy' ? 'default' : 'secondary'}>
                          {api.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    WordPress Migration Tools
                  </CardTitle>
                  <CardDescription>Migration status and tools for customer onboarding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Migration Queue</h4>
                      <div className="text-2xl font-bold text-primary">7</div>
                      <div className="text-sm text-muted-foreground">Pending migrations</div>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Success Rate</h4>
                      <div className="text-2xl font-bold text-green-600">94.2%</div>
                      <div className="text-sm text-muted-foreground">Last 30 days</div>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Avg. Migration Time</h4>
                      <div className="text-2xl font-bold text-primary">2.4h</div>
                      <div className="text-sm text-muted-foreground">Complete site migration</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button className="w-full">
                    Start New Migration
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Security & Rate Limiting</CardTitle>
                <CardDescription>Monitor API usage and security metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">99.7%</div>
                    <div className="text-sm text-blue-700">API Uptime</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-green-700">Security Breaches</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">2.1%</div>
                    <div className="text-sm text-yellow-700">Rate Limited</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">1.2M</div>
                    <div className="text-sm text-purple-700">Daily Requests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ScalableArchitectureDashboard;