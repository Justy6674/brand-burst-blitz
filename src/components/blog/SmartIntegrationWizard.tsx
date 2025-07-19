import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformDetector } from './PlatformDetector';
import { ManualExportTools } from './ManualExportTools';
import { PlatformInstructions } from './PlatformInstructions';
import { EmbedCodeGenerator } from './EmbedCodeGenerator';
import { APIIntegrationSetup } from './APIIntegrationSetup';
import { getAvailableIntegrations, getPlatformCapabilities } from '@/lib/platformCapabilities';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface SmartIntegrationWizardProps {
  businessId: string;
  onComplete?: () => void;
}

export const SmartIntegrationWizard: React.FC<SmartIntegrationWizardProps> = ({
  businessId,
  onComplete
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('detect');
  const { currentProfile } = useBusinessProfile();

  const platform = selectedPlatform ? getPlatformCapabilities(selectedPlatform) : null;
  const availableIntegrations = selectedPlatform ? getAvailableIntegrations(selectedPlatform) : [];

  const handlePlatformChange = (platformId: string) => {
    setSelectedPlatform(platformId);
    // Auto-advance to integration options after platform selection
    setActiveTab('integration');
  };

  const getTabIcon = (integration: string) => {
    switch (integration) {
      case 'embed': return '🔗';
      case 'api': return '⚡';
      case 'rss': return '📡';
      case 'manual': return '📋';
      default: return '•';
    }
  };

  const getTabLabel = (integration: string) => {
    switch (integration) {
      case 'embed': return 'Embed Widget';
      case 'api': return 'API Integration';
      case 'rss': return 'RSS Feed';
      case 'manual': return 'Copy & Paste';
      default: return integration;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Smart Blog Integration</h1>
        <p className="text-muted-foreground">
          Platform-aware setup that only shows what actually works for your website
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detect">1. Platform</TabsTrigger>
          <TabsTrigger value="integration" disabled={!selectedPlatform}>
            2. Integration
          </TabsTrigger>
          <TabsTrigger value="instructions" disabled={!selectedPlatform}>
            3. Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detect" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Platform Detection</CardTitle>
              <CardDescription>
                Tell us your platform so we can show you exactly what integration options will work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformDetector
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
              />
              
              {selectedPlatform && (
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => setActiveTab('integration')}>
                    Continue to Integration Options
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          {platform && (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Platform: {platform.name}</strong> - 
                  Showing {availableIntegrations.length} available integration methods.
                  {platform.limitations.length > 0 && (
                    <span className="block mt-1 text-amber-600">
                      Note: Some features aren't available due to {platform.name} limitations.
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <Tabs defaultValue={availableIntegrations[0]} className="w-full">
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableIntegrations.length}, 1fr)` }}>
                  {availableIntegrations.map((integration) => (
                    <TabsTrigger key={integration} value={integration}>
                      {getTabIcon(integration)} {getTabLabel(integration)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {availableIntegrations.includes('embed') && (
                  <TabsContent value="embed">
                    <EmbedCodeGenerator 
                      businessId={businessId}
                      platform={platform}
                    />
                  </TabsContent>
                )}

                {availableIntegrations.includes('api') && (
                  <TabsContent value="api">
                    <APIIntegrationSetup 
                      businessId={businessId}
                      platform={platform}
                    />
                  </TabsContent>
                )}

                {availableIntegrations.includes('rss') && (
                  <TabsContent value="rss">
                    <Card>
                      <CardHeader>
                        <CardTitle>RSS Feed Integration</CardTitle>
                        <CardDescription>
                          Automatically syndicate your blog content via RSS
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <label className="block text-sm font-medium mb-2">Your RSS Feed URL</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                readOnly 
                                value={`https://api.jbsaas.com/rss/${businessId}`}
                                className="flex-1 p-2 border rounded"
                              />
                              <Button variant="outline">Copy</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="manual">
                  <ManualExportTools 
                    businessId={businessId}
                    platform={platform}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-center">
                <Button onClick={() => setActiveTab('instructions')}>
                  Get Setup Instructions
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6">
          {platform && (
            <PlatformInstructions 
              platform={platform}
              businessId={businessId}
              onComplete={onComplete}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Critical Success Message */}
      {selectedPlatform && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Smart Detection Active:</strong> We're only showing integration options that actually work with {platform?.name}. 
            No more setup frustration or broken integrations!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};