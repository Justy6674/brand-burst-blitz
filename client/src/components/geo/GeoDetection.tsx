import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Globe } from 'lucide-react';

interface GeoDetectionProps {
  onDismiss?: () => void;
}

export const GeoDetection: React.FC<GeoDetectionProps> = ({ onDismiss }) => {
  const [isNonAustralian, setIsNonAustralian] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [country, setCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('geo-banner-dismissed');
    if (dismissed) {
      setIsLoading(false);
      return;
    }

    // Simple geo-detection using a free service
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        const userCountry = data.country_code;
        setCountry(data.country_name || 'Unknown');
        
        // Show banner if not from Australia (AU)
        if (userCountry && userCountry !== 'AU') {
          setIsNonAustralian(true);
          setShowBanner(true);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.log('Geo-detection failed:', error);
        setIsLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('geo-banner-dismissed', 'true');
    onDismiss?.();
  };

  const handleWaitlist = () => {
    // Open email client with pre-filled waitlist email
    const subject = encodeURIComponent('International Expansion Waitlist - JB-SaaS');
    const body = encodeURIComponent(`Hi JB-SaaS Team,

I'm interested in joining the waitlist for when JB-SaaS expands to serve businesses outside Australia.

Country: ${country}
Business Type: [Please describe your business]
Estimated Team Size: [Number of team members]

I understand JB-SaaS currently focuses on Australian businesses, but I'd love to be notified when you expand to my market.

Best regards,
[Your Name]`);
    
    window.open(`mailto:hello@jb-saas.com?subject=${subject}&body=${body}`);
  };

  if (isLoading || !showBanner || !isNonAustralian) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 p-4">
      <Alert className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  <MapPin className="w-3 h-3 mr-1" />
                  {country}
                </Badge>
                <span className="text-sm font-medium text-blue-900">
                  We noticed you might be outside Australia
                </span>
              </div>
              <AlertDescription className="text-gray-700 mb-3">
                <strong>JB-SaaS currently focuses on Australian businesses</strong> to provide the best 
                local market expertise and compliance. We'd love to serve your market soon!
              </AlertDescription>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleWaitlist}
                  variant="default" 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Join International Waitlist
                </Button>
                <Button 
                  onClick={handleDismiss}
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  I'm an Australian Business
                </Button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
};