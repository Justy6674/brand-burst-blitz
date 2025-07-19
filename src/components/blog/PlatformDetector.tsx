import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { PLATFORM_CAPABILITIES, type PlatformCapability } from '@/lib/platformCapabilities';

interface PlatformDetectorProps {
  selectedPlatform: string | null;
  onPlatformChange: (platformId: string) => void;
  className?: string;
}

export const PlatformDetector: React.FC<PlatformDetectorProps> = ({
  selectedPlatform,
  onPlatformChange,
  className = ''
}) => {
  const platforms = Object.values(PLATFORM_CAPABILITIES);
  const currentPlatform = selectedPlatform ? PLATFORM_CAPABILITIES[selectedPlatform] : null;

  const getCapabilityBadges = (platform: PlatformCapability) => {
    const badges = [];
    if (platform.capabilities.embed) badges.push('Embed');
    if (platform.capabilities.api) badges.push('API');
    if (platform.capabilities.rss) badges.push('RSS');
    badges.push('Manual'); // Always available
    
    return badges;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-2">
          What website platform do you use? *
        </label>
        <Select value={selectedPlatform || ''} onValueChange={onPlatformChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your website platform..." />
          </SelectTrigger>
          <SelectContent>
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-medium">{platform.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {platform.description}
                    </span>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {platform.marketShare}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentPlatform && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Available Integration Options:</h3>
            <div className="flex gap-1">
              {getCapabilityBadges(currentPlatform).map((capability) => {
                const isEnabled = capability === 'Manual' || 
                  currentPlatform.capabilities[capability.toLowerCase() as keyof typeof currentPlatform.capabilities];
                
                return (
                  <Badge 
                    key={capability}
                    variant={isEnabled ? "default" : "secondary"}
                    className={isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                  >
                    {capability} {isEnabled ? '✓' : '✗'}
                  </Badge>
                );
              })}
            </div>
          </div>

          {currentPlatform.limitations.length > 0 && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>Platform Limitations:</strong>
                <ul className="mt-1 list-disc list-inside text-sm">
                  {currentPlatform.limitations.map((limitation, index) => (
                    <li key={index}>{limitation}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <strong>Why these options?</strong> We only show integration methods that actually work with {currentPlatform.name}. 
            This prevents setup frustration and ensures your blog integration works perfectly.
          </div>
        </div>
      )}
    </div>
  );
};