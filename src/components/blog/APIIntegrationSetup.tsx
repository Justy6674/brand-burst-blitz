import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Key, Link, TestTube } from 'lucide-react';
import type { PlatformCapability } from '@/lib/platformCapabilities';

interface APIIntegrationSetupProps {
  businessId: string;
  platform: PlatformCapability;
}

export const APIIntegrationSetup: React.FC<APIIntegrationSetupProps> = ({
  businessId,
  platform
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

  const testConnection = async () => {
    setIsConnecting(true);
    try {
      // Mock API test - in real implementation, this would call an edge function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setConnectionStatus('success');
        toast({
          title: "Connection successful!",
          description: `Successfully connected to your ${platform.name} site`,
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection failed",
          description: "Please check your credentials and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection error",
        description: "Unable to connect to your site",
        variant: "destructive",
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
  };

  const getCredentialFields = () => {
    switch (platform.id) {
      case 'wordpress':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">WordPress Site URL *</Label>
              <Input
                id="siteUrl"
                placeholder="https://yourwebsite.com"
                value={credentials.siteUrl}
                onChange={(e) => setCredentials(prev => ({ ...prev, siteUrl: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Your WordPress site's main URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">WordPress Username *</Label>
              <Input
                id="username"
                placeholder="your-username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Application Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Need an Application Password?</strong><br />
                  Go to WordPress Admin → Users → Your Profile → Application Passwords. 
                  Create a new password specifically for JBSAAS.
                </AlertDescription>
              </Alert>
            </div>
          </>
        );

      case 'webflow':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Webflow Site ID *</Label>
              <Input
                id="siteUrl"
                placeholder="5c5f5b5f5b5f5b5f5b5f5b5f"
                value={credentials.siteUrl}
                onChange={(e) => setCredentials(prev => ({ ...prev, siteUrl: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Found in your Webflow site settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">Webflow API Token *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="your-webflow-api-token"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              />
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Get your API Token:</strong><br />
                  Go to Webflow Dashboard → Project Settings → Integrations → API Access
                </AlertDescription>
              </Alert>
            </div>
          </>
        );

      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              API integration for {platform.name} is coming soon. 
              For now, please use the Copy & Paste method.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚡ API Integration for {platform.name}
        </CardTitle>
        <CardDescription>
          Connect directly to your {platform.name} site for automatic publishing
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
            <li>• Full integration with {platform.name} features</li>
          </ul>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4">
          <h4 className="font-medium">Connection Details</h4>
          {getCredentialFields()}
        </div>

        {/* Test Connection */}
        <div className="space-y-4">
          <Button 
            onClick={testConnection}
            disabled={isConnecting || !credentials.siteUrl || (platform.id === 'wordpress' && (!credentials.username || !credentials.password))}
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
                Your {platform.name} site is now connected. You can start publishing directly from JBSAAS.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Connection Failed</strong><br />
                Please check your credentials and ensure your {platform.name} site is accessible.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* API Documentation */}
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
                  Generate Key
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Available Endpoints:</h5>
              <div className="space-y-1 text-sm font-mono">
                <div>GET /api/v1/businesses/{businessId}/posts</div>
                <div>POST /api/v1/businesses/{businessId}/posts</div>
                <div>PUT /api/v1/businesses/{businessId}/posts/:id</div>
                <div>DELETE /api/v1/businesses/{businessId}/posts/:id</div>
              </div>
            </div>
          </div>
        )}

        {/* Platform-Specific Notes */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium text-amber-900 mb-2">
            📋 {platform.name} Integration Notes:
          </h4>
          <ul className="text-sm text-amber-800 space-y-1">
            {platform.instructions.api?.map((note, index) => (
              <li key={index}>• {note}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};