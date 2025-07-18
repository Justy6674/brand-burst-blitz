import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  MapPin, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Wifi, 
  Eye,
  Clock,
  Mail,
  Navigation
} from 'lucide-react';

interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  isAustralia: boolean;
  confidence: number;
  vpnDetected: boolean;
  ipAddress: string;
}

interface GeoDetectionResult {
  location: GeoLocation;
  recommendation: 'allow' | 'warn' | 'waitlist';
  message: string;
  reasons: string[];
}

export const EnhancedGeoDetection: React.FC = () => {
  const [geoResult, setGeoResult] = useState<GeoDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [hasUserOverride, setHasUserOverride] = useState(false);

  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    setIsLoading(true);
    
    try {
      // Multi-factor geo-detection
      const detectionResults = await Promise.allSettled([
        getIPGeolocation(),
        getBrowserTimezone(),
        getNavigatorLanguage(),
        checkMobileCarrier()
      ]);

      const [ipResult, timezoneResult, languageResult, carrierResult] = detectionResults;
      
      // Combine results for confidence scoring
      const analysis = analyzeGeoData({
        ip: ipResult.status === 'fulfilled' ? ipResult.value : null,
        timezone: timezoneResult.status === 'fulfilled' ? timezoneResult.value : null,
        language: languageResult.status === 'fulfilled' ? languageResult.value : null,
        carrier: carrierResult.status === 'fulfilled' ? carrierResult.value : null
      });

      setGeoResult(analysis);
    } catch (error) {
      console.error('Geo-detection error:', error);
      // Fallback to basic detection
      setGeoResult(getFallbackDetection());
    } finally {
      setIsLoading(false);
    }
  };

  const getIPGeolocation = async (): Promise<any> => {
    // In production, use a real IP geolocation service
    // For demo, simulate based on common patterns
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          country: 'Australia',
          countryCode: 'AU',
          region: 'NSW',
          city: 'Sydney',
          timezone: 'Australia/Sydney',
          vpnDetected: Math.random() > 0.8, // 20% chance of VPN detection
          confidence: 0.85
        });
      }, 500);
    });
  };

  const getBrowserTimezone = (): Promise<any> => {
    return Promise.resolve({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      confidence: 0.9
    });
  };

  const getNavigatorLanguage = (): Promise<any> => {
    return Promise.resolve({
      language: navigator.language,
      languages: navigator.languages,
      confidence: 0.7
    });
  };

  const checkMobileCarrier = (): Promise<any> => {
    // Placeholder for mobile carrier detection
    return Promise.resolve({
      carrier: null,
      confidence: 0.3
    });
  };

  const analyzeGeoData = (data: any): GeoDetectionResult => {
    const { ip, timezone, language } = data;
    
    let isAustralia = false;
    let confidence = 0;
    let vpnDetected = false;
    let reasons: string[] = [];

    // IP-based detection
    if (ip?.countryCode === 'AU') {
      isAustralia = true;
      confidence += 0.4;
      reasons.push('IP address location: Australia');
    } else if (ip?.country) {
      reasons.push(`IP address location: ${ip.country}`);
    }

    // Timezone-based detection
    if (timezone?.timezone?.includes('Australia/')) {
      isAustralia = true;
      confidence += 0.3;
      reasons.push('Browser timezone: Australian timezone');
    } else if (timezone?.timezone) {
      reasons.push(`Browser timezone: ${timezone.timezone}`);
    }

    // Language-based hints
    if (language?.language?.includes('en-AU')) {
      confidence += 0.2;
      reasons.push('Browser language: Australian English');
    } else if (language?.language?.startsWith('en-')) {
      confidence += 0.1;
      reasons.push(`Browser language: ${language.language}`);
    }

    // VPN detection
    if (ip?.vpnDetected) {
      vpnDetected = true;
      confidence -= 0.2;
      reasons.push('Potential VPN detected - location may not be accurate');
    }

    // Determine recommendation
    let recommendation: 'allow' | 'warn' | 'waitlist' = 'waitlist';
    let message = '';

    if (isAustralia && confidence > 0.6) {
      recommendation = 'allow';
      message = 'Welcome! You appear to be accessing from Australia.';
    } else if (isAustralia && confidence > 0.3) {
      recommendation = 'warn';
      message = 'You appear to be in Australia, but we detected some inconsistencies. You can still access all features.';
    } else if (vpnDetected) {
      recommendation = 'warn';
      message = 'We detected you might be using a VPN. If you\'re an Australian business, you can still access all features.';
    } else {
      recommendation = 'waitlist';
      message = 'We currently serve Australian businesses only. Join our international waitlist for future expansion.';
    }

    return {
      location: {
        country: ip?.country || 'Unknown',
        countryCode: ip?.countryCode || '',
        region: ip?.region || '',
        city: ip?.city || '',
        timezone: timezone?.timezone || '',
        isAustralia,
        confidence,
        vpnDetected,
        ipAddress: 'Hidden for privacy'
      },
      recommendation,
      message,
      reasons
    };
  };

  const getFallbackDetection = (): GeoDetectionResult => {
    return {
      location: {
        country: 'Unknown',
        countryCode: '',
        region: '',
        city: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isAustralia: false,
        confidence: 0.1,
        vpnDetected: false,
        ipAddress: 'Hidden for privacy'
      },
      recommendation: 'warn',
      message: 'Unable to determine your location accurately. If you\'re an Australian business, you can still proceed.',
      reasons: ['Location detection failed - please verify manually']
    };
  };

  const handleUserOverride = (isAustralian: boolean) => {
    setHasUserOverride(true);
    
    if (isAustralian) {
      setGeoResult(prev => prev ? {
        ...prev,
        recommendation: 'allow',
        message: 'Thank you for confirming you\'re an Australian business. Welcome!',
        reasons: [...prev.reasons, 'User confirmed Australian business']
      } : null);
    } else {
      setGeoResult(prev => prev ? {
        ...prev,
        recommendation: 'waitlist',
        message: 'Thank you for your interest! We\'ll notify you when we expand to your region.',
        reasons: [...prev.reasons, 'User confirmed non-Australian location']
      } : null);
    }
  };

  const handleWaitlistSignup = () => {
    const subject = encodeURIComponent('International Expansion Waitlist');
    const body = encodeURIComponent(`Hi JB-SaaS Team,

I'm interested in joining the international waitlist for JB-SaaS.

Location Details:
- Country: ${geoResult?.location.country}
- Region: ${geoResult?.location.region}
- Timezone: ${geoResult?.location.timezone}

I understand JB-SaaS currently focuses on Australian businesses, but I'd love to be notified when you expand to my market.

Best regards,
[Your Name]`);
    
    window.open(`mailto:hello@jb-saas.com?subject=${subject}&body=${body}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Navigation className="w-5 h-5 animate-spin text-primary" />
            <span>Detecting your location...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!geoResult) {
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to detect your location. Please verify your region manually.
        </AlertDescription>
      </Alert>
    );
  }

  const getAlertStyle = () => {
    switch (geoResult.recommendation) {
      case 'allow':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800';
      case 'warn':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800';
      case 'waitlist':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (geoResult.recommendation) {
      case 'allow':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'waitlist':
        return <Globe className="h-4 w-4 text-blue-600" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Alert className={getAlertStyle()}>
        {getIcon()}
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>{geoResult.message}</strong>
            {geoResult.location.vpnDetected && (
              <div className="mt-1 text-sm flex items-center">
                <Wifi className="w-3 h-3 mr-1" />
                VPN detected - location accuracy may be reduced
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(geoResult.location.confidence * 100)}% confidence
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="w-3 h-3 mr-1" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {showDetails && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location Detection Details
            </CardTitle>
            <CardDescription>
              How we determined your location and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Detected Location</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Country: {geoResult.location.country || 'Unknown'}</div>
                  <div>Region: {geoResult.location.region || 'Unknown'}</div>
                  <div>City: {geoResult.location.city || 'Unknown'}</div>
                  <div>Timezone: {geoResult.location.timezone || 'Unknown'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Detection Factors</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {geoResult.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {!hasUserOverride && geoResult.recommendation !== 'allow' && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Not quite right?</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleUserOverride(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    I'm an Australian Business
                  </Button>
                  <Button
                    onClick={() => handleUserOverride(false)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    I'm Outside Australia
                  </Button>
                </div>
              </div>
            )}

            {geoResult.recommendation === 'waitlist' && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Join International Waitlist</h4>
                    <p className="text-sm text-muted-foreground">
                      Be notified when we expand to your region
                    </p>
                  </div>
                  <Button
                    onClick={handleWaitlistSignup}
                    size="sm"
                    className="flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Join Waitlist
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {geoResult.recommendation === 'allow' && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  🇦🇺 Australian Business Access Confirmed
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You have access to all Australian business features, GST compliance, and local support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={detectUserLocation}
          className="text-muted-foreground"
        >
          <Navigation className="w-3 h-3 mr-1" />
          Re-detect Location
        </Button>
      </div>
    </div>
  );
};