import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformDetector } from './PlatformDetector';
import { SmartIntegrationOptions } from './SmartIntegrationOptions';
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
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
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
          <SmartIntegrationOptions
            selectedPlatform={selectedPlatform}
            businessId={businessId}
            onSelectIntegration={(type) => {
              setSelectedIntegration(type);
              setActiveTab('instructions');
            }}
          />
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6">
          {selectedIntegration === 'embed' && (
            <EmbedCodeGenerator 
              businessId={businessId}
            />
          )}

          {selectedIntegration === 'api' && (
            <APIIntegrationSetup 
              businessId={businessId}
            />
          )}

          {selectedIntegration === 'manual' && (
            <ManualExportTools 
              blogData={{
                posts: [],
                customization: {}
              }}
            />
          )}

          {selectedIntegration && (
            <PlatformInstructions 
              platform={selectedPlatform as any}
              integrationMethod={selectedIntegration as any}
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