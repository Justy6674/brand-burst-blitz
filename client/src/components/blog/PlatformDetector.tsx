import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllPlatforms } from '@/lib/platformCapabilities';

interface PlatformDetectorProps {
  selectedPlatform: string | null;
  onPlatformChange: (platformId: string) => void;
}

export const PlatformDetector: React.FC<PlatformDetectorProps> = ({
  selectedPlatform,
  onPlatformChange
}) => {
  const platforms = getAllPlatforms();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Your Website Platform</h3>
      <Select value={selectedPlatform || ''} onValueChange={onPlatformChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose your platform..." />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(platforms).map(([key, platform]) => (
            <SelectItem key={key} value={key}>
              {platform.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};