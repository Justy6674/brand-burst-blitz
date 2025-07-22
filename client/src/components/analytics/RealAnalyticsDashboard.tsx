import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar
} from 'lucide-react';

interface AnalyticsData {
  id: string;
  platform: string;
  metrics: any;
  collected_at: string;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  account_name: string;
  is_active: boolean;
  last_sync_at: string | null;
}

export const RealAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadAnalyticsData();
    loadConnectedAccounts();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('collected_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      setAnalyticsData(data || []);
      if (data && data.length > 0) {
        setLastUpdate(new Date(data[0].collected_at));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error loading analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadConnectedAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('id, platform, account_name, is_active, last_sync_at')
        .eq('is_active', true);

      if (error) throw error;
      setConnectedAccounts(data || []);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    }
  };

  const collectAnalytics = async (forceSync: boolean = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collect-social-analytics', {
        body: { forceSync }
      });

      if (error) throw error;

      toast({
        title: "Analytics collection started",
        description: `Processing ${data.accounts} connected accounts.`,
      });

      // Reload data after a short delay
      setTimeout(() => {
        loadAnalyticsData();
        loadConnectedAccounts();
      }, 5000);

    } catch (error) {
      console.error('Error collecting analytics:', error);
      toast({
        title: "Analytics collection failed",
        description: error.message || "Failed to collect analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeSinceLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    
    const diffMs = Date.now() - new Date(lastSync).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m ago`;
    return `${diffMinutes}m ago`;
  };

  const groupAnalyticsByPlatform = () => {
    const grouped: { [platform: string]: AnalyticsData[] } = {};
    analyticsData.forEach(item => {
      if (!grouped[item.platform]) grouped[item.platform] = [];
      grouped[item.platform].push(item);
    });
    return grouped;
  };

  const getMetricIcon = (metricName: string) => {
    const name = metricName.toLowerCase();
    if (name.includes('follower') || name.includes('fan') || name.includes('connection')) return Users;
    if (name.includes('impression') || name.includes('reach') || name.includes('view')) return Eye;
    if (name.includes('engagement') || name.includes('like') || name.includes('favorite')) return Heart;
    if (name.includes('comment') || name.includes('reply')) return MessageCircle;
    if (name.includes('share') || name.includes('retweet')) return Share;
    return TrendingUp;
  };

  const formatMetricValue = (value: any) => {
    if (typeof value === 'number') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    }
    return value?.toString() || '0';
  };

  const groupedAnalytics = groupAnalyticsByPlatform();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Real Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Live data from your connected social media accounts
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdate.toLocaleString()}</span>
            </div>
          )}
          <Button
            onClick={() => collectAnalytics(false)}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Analytics
          </Button>
          <Button
            onClick={() => collectAnalytics(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Collecting...
              </>
            ) : (
              'Force Sync All'
            )}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Connected Accounts</span>
          </CardTitle>
          <CardDescription>
            Status of your social media account connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedAccounts.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No social media accounts connected. Go to Social Media settings to connect your accounts.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{account.platform}</div>
                    <div className="text-sm text-muted-foreground">{account.account_name}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      Active
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {getTimeSinceLastSync(account.last_sync_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Data */}
      {Object.keys(groupedAnalytics).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No analytics data available yet. Connect your social media accounts and click "Sync Analytics" to start collecting data.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAnalytics).map(([platform, platformData]) => (
            <Card key={platform}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>{platform} Analytics</span>
                </CardTitle>
                <CardDescription>
                  Latest metrics from your {platform} account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {platformData.slice(0, 8).map((item) => {
                    const metrics = item.metrics;
                    return Object.entries(metrics).map(([metricName, metricValue]) => {
                      const IconComponent = getMetricIcon(metricName);
                      return (
                        <div key={`${item.id}-${metricName}`} className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <IconComponent className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium capitalize">
                              {metricName.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-2xl font-bold">
                            {formatMetricValue(metricValue)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.collected_at).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
                
                {platformData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No analytics data available for {platform}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Development Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Real Analytics Active:</strong> This dashboard shows actual data from your connected social media accounts. 
          Analytics are automatically collected every 6 hours, or you can manually sync using the buttons above.
        </AlertDescription>
      </Alert>
    </div>
  );
};