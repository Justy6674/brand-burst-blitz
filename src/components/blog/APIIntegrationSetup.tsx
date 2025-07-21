import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Key, TestTube } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';

interface APIIntegrationSetupProps {
  businessId: string;
  platform?: string;
  onApiKeyGenerated?: (apiKey: string) => void;
  onConnectionSuccess?: (endpoint: string, headers: Record<string, string>) => void;
}

export const APIIntegrationSetup: React.FC<APIIntegrationSetupProps> = ({ 
  businessId, 
  platform,
  onApiKeyGenerated,
  onConnectionSuccess
}) => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    siteUrl: '',
    username: '',
    password: '',
    apiKey: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const testConnection = async () => {
    if (!credentials.siteUrl.trim()) {
      toast({
        title: "Missing API Endpoint",
        description: "Please provide a valid API endpoint URL",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      // REAL API INTEGRATION TEST - No more simulation
      const { data, error } = await supabase.functions.invoke('test-blog-api-integration', {
        body: {
          endpoint: credentials.siteUrl,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${credentials.apiKey}`,
            'Content-Type': 'application/json'
          },
          practiceId: user?.id
        }
      });

      if (error) {
        throw new Error(error.message || 'API connection failed');
      }

      if (data.success) {
        toast({
          title: "API Connection Successful",
          description: `Connected to ${credentials.siteUrl} successfully`,
        });
        setConnectionStatus('success');
        onConnectionSuccess?.(credentials.siteUrl, {
          Authorization: `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        });
      } else {
        throw new Error(data.error || 'API test failed');
      }

    } catch (error: any) {
      console.error('API connection error:', error);
      setConnectionStatus('error');
      toast({
        title: "API Connection Failed",
        description: error.message || "Failed to connect to API endpoint",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const generateAPIKey = () => {
    const apiKey = `jbsaas_${businessId}_${Date.now()}`;
    setCredentials(prev => ({ ...prev, apiKey }));
    toast({
      title: "API key generated",
      description: "Your new API key is ready to use",
    });
    onApiKeyGenerated?.(apiKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚡ API Integration Setup
        </CardTitle>
        <CardDescription>
          Connect directly to your website for automatic publishing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Benefits */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">⚡ API Integration Benefits:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Publish posts directly from JBSAAS to your website</li>
            <li>• Schedule automatic publishing</li>
            <li>• Update existing posts remotely</li>
            <li>• Sync images and media automatically</li>
          </ul>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4">
          <h4 className="font-medium">Connection Details</h4>
          
          <div className="space-y-2">
            <Label htmlFor="siteUrl">Website URL *</Label>
            <Input
              id="siteUrl"
              placeholder="https://yourwebsite.com"
              value={credentials.siteUrl}
              onChange={(e) => setCredentials(prev => ({ ...prev, siteUrl: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="your-username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">API Key/Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="your-api-key"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
        </div>

        {/* Test Connection */}
        <div className="space-y-4">
          <Button 
            onClick={testConnection}
            disabled={isConnecting || !credentials.siteUrl || !credentials.username || !credentials.password}
            className="w-full"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isConnecting ? 'Testing Connection...' : 'Test Connection'}
          </Button>

          {connectionStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Connection Successful!</strong><br />
                Your website is now connected. You can start publishing directly from JBSAAS.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Connection Failed</strong><br />
                Please check your credentials and ensure your website is accessible.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* API Key Generation */}
        {connectionStatus === 'success' && (
          <div className="space-y-4">
            <h4 className="font-medium">Your API Details</h4>
            
            <div className="space-y-2">
              <Label>JBSAAS API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={credentials.apiKey}
                  readOnly
                  placeholder="Click 'Generate API Key' to create"
                />
                <Button onClick={generateAPIKey} variant="outline">
                  <Key className="h-4 w-4 mr-1" />
                  Generate Key
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Business ID:</h5>
              <code className="text-sm">{businessId}</code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};