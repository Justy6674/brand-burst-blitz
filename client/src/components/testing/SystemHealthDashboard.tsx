import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Loader2,
  Facebook,
  Linkedin,
  Twitter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  testType: string;
  platform: string;
  readinessScore: string;
  status: string;
  systemHealth: any;
  tests: any;
}

export const SystemHealthDashboard = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, TestResult>>({});

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'twitter', name: 'Twitter', icon: Twitter }
  ];

  const runSystemTest = async (platform: string, testType: string) => {
    setTesting(`${platform}-${testType}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('system-health-test', {
        body: {
          platform,
          testType,
          data: {
            redirectUri: window.location.origin
          }
        }
      });

      if (error) throw error;

      setResults(prev => ({
        ...prev,
        [`${platform}-${testType}`]: data
      }));

      toast({
        title: "Test Complete",
        description: `${platform} ${testType} test finished - ${data.status}`,
        variant: data.readinessScore === '100%' ? 'default' : 'destructive'
      });

    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: error.message || "System test encountered an error",
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRODUCTION_READY': return 'bg-green-100 text-green-800';
      case 'MOSTLY_FUNCTIONAL': return 'bg-blue-100 text-blue-800';
      case 'PARTIALLY_WORKING': return 'bg-yellow-100 text-yellow-800';
      case 'NEEDS_MAJOR_FIXES': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (success: boolean | string) => {
    if (success === true) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (success === false) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const renderTestResult = (resultKey: string, result: TestResult) => {
    return (
      <Card key={resultKey} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg capitalize">
              {result.platform} - {result.testType.replace('_', ' ')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(result.status)}>
                {result.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {result.readinessScore}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* System Health Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(result.systemHealth.credentialsConfigured)}
              <span>Credentials</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(result.systemHealth.oauthWorking)}
              <span>OAuth</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(result.systemHealth.accountsConnected)}
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(result.systemHealth.publishingReady)}
              <span>Publishing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(result.systemHealth.analyticsReady)}
              <span>Analytics</span>
            </div>
          </div>

          {/* Detailed Test Results */}
          <div className="space-y-2">
            {Object.entries(result.tests).map(([testName, testData]: [string, any]) => (
              <div key={testName} className="border border-gray-200 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(testData.success)}
                  <span className="font-medium capitalize">{testName.replace('_', ' ')}</span>
                </div>
                
                {testData.error && (
                  <Alert className="mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Error:</strong> {testData.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {testData.recommendation && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    <strong>Recommendation:</strong> {testData.recommendation}
                  </div>
                )}

                {/* Additional test-specific details */}
                {testName === 'credentials' && (
                  <div className="text-xs text-gray-600 mt-1">
                    App ID: {testData.appIdPresent ? '✓' : '✗'} | 
                    App Secret: {testData.appSecretPresent ? '✓' : '✗'}
                  </div>
                )}
                
                {testName === 'social_accounts' && (
                  <div className="text-xs text-gray-600 mt-1">
                    Connected Accounts: {testData.connectedAccounts}
                  </div>
                )}
                
                {testName === 'analytics' && (
                  <div className="text-xs text-gray-600 mt-1">
                    Data Points: {testData.dataPoints}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">System Health Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive testing of social media integration functionality
        </p>
      </div>

      <Tabs defaultValue="quick-test" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-test">Quick Test</TabsTrigger>
          <TabsTrigger value="detailed-results">Detailed Results</TabsTrigger>
          <TabsTrigger value="system-status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-test">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <platform.icon className="h-5 w-5" />
                    <CardTitle>{platform.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => runSystemTest(platform.id, 'oauth_init')}
                    disabled={testing === `${platform.id}-oauth_init`}
                    className="w-full"
                    variant="outline"
                  >
                    {testing === `${platform.id}-oauth_init` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Test OAuth
                  </Button>
                  
                  <Button
                    onClick={() => runSystemTest(platform.id, 'publishing')}
                    disabled={testing === `${platform.id}-publishing`}
                    className="w-full"
                    variant="outline"
                  >
                    {testing === `${platform.id}-publishing` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Test Publishing
                  </Button>
                  
                  <Button
                    onClick={() => runSystemTest(platform.id, 'analytics')}
                    disabled={testing === `${platform.id}-analytics`}
                    className="w-full"
                    variant="outline"
                  >
                    {testing === `${platform.id}-analytics` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Test Analytics
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed-results">
          <div className="space-y-4">
            {Object.keys(results).length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No test results yet. Run some tests to see detailed results here.
                </AlertDescription>
              </Alert>
            ) : (
              Object.entries(results).map(([key, result]) => renderTestResult(key, result))
            )}
          </div>
        </TabsContent>

        <TabsContent value="system-status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(results).map(([key, result]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium capitalize">
                        {result.platform} - {result.testType.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.readinessScore}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(results).map(([key, result]) => (
                    <div key={key}>
                      {Object.entries(result.tests).map(([testName, testData]: [string, any]) => 
                        testData.recommendation && (
                          <div key={`${key}-${testName}`} className="text-sm p-2 bg-blue-50 rounded mb-2">
                            <strong>{result.platform} {testName}:</strong> {testData.recommendation}
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};