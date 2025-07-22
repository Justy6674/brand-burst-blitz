import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PLATFORM_CAPABILITIES, type PlatformCapability } from '@/lib/platformCapabilities';
import { Globe, Code, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface SmartIntegrationOptionsProps {
  selectedPlatform: string | null;
  businessId: string;
  onSelectIntegration: (type: string) => void;
}

export const SmartIntegrationOptions: React.FC<SmartIntegrationOptionsProps> = ({
  selectedPlatform,
  businessId,
  onSelectIntegration
}) => {
  if (!selectedPlatform) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please select your website platform first to see available integration options.
        </AlertDescription>
      </Alert>
    );
  }

  const platform = PLATFORM_CAPABILITIES[selectedPlatform as keyof typeof PLATFORM_CAPABILITIES];
  if (!platform) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Platform configuration not found. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  const integrationOptions = [
    {
      type: 'embed',
      title: 'Embed Code',
      description: 'Automatically display your blog posts on your website',
      icon: Code,
      available: platform.capabilities.embed,
      reason: platform.capabilities.embed ? null : 'This platform does not support iframe embeds or custom code injection'
    },
    {
      type: 'api',
      title: 'API Integration',
      description: 'Connect directly to your blog system via API',
      icon: Globe,
      available: platform.capabilities.api,
      reason: platform.capabilities.api ? null : 'This platform does not provide API access for third-party integrations'
    },
    {
      type: 'rss',
      title: 'RSS Feed',
      description: 'Syndicate your content via RSS feed',
      icon: FileText,
      available: platform.capabilities.rss,
      reason: platform.capabilities.rss ? null : 'RSS feeds are not supported on this platform'
    },
    {
      type: 'manual',
      title: 'Manual Export',
      description: 'Copy and paste content manually',
      icon: Download,
      available: platform.capabilities.manual,
      reason: null // Manual is always available
    }
  ];

  const availableOptions = integrationOptions.filter(option => option.available);
  const unavailableOptions = integrationOptions.filter(option => !option.available);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Available Integration Methods</h3>
        <p className="text-muted-foreground mb-4">
          Based on your platform ({platform.name}), here are the integration methods that will work:
        </p>
        
        {availableOptions.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No automatic integration methods are available for {platform.name}. 
              Please use the manual export option below.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {availableOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card key={option.type} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{option.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-3">
                      {option.description}
                    </CardDescription>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onSelectIntegration(option.type)}
                    >
                      Set Up {option.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {unavailableOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Why Some Options Aren't Available</h3>
          <p className="text-muted-foreground mb-4">
            These integration methods don't work with {platform.name}:
          </p>
          
          <div className="space-y-3">
            {unavailableOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card key={option.type} className="opacity-60">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{option.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Not Available
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.reason}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Good news:</strong> Manual export always works! You can copy your content and paste it 
          directly into {platform.name}'s editor, giving you complete control over formatting.
        </AlertDescription>
      </Alert>
    </div>
  );
};