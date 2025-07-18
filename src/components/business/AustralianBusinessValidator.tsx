import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Building, AlertTriangle, CheckCircle, Mail } from 'lucide-react';

interface AustralianBusinessValidatorProps {
  onValidationComplete?: (isAustralian: boolean) => void;
  onNonAustralianWaitlist?: () => void;
}

export const AustralianBusinessValidator: React.FC<AustralianBusinessValidatorProps> = ({
  onValidationComplete,
  onNonAustralianWaitlist
}) => {
  const [isAustralianBusiness, setIsAustralianBusiness] = useState<boolean | null>(null);
  const [abn, setAbn] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');

  const handleAustralianSelection = () => {
    setIsAustralianBusiness(true);
    if (onValidationComplete) {
      onValidationComplete(true);
    }
  };

  const handleNonAustralianSelection = () => {
    setIsAustralianBusiness(false);
    if (onValidationComplete) {
      onValidationComplete(false);
    }
  };

  const handleNonAustralianWaitlist = () => {
    // Open email client with pre-filled international waitlist email
    const subject = encodeURIComponent('International Expansion Waitlist - JB-SaaS');
    const body = encodeURIComponent(`Hi JB-SaaS Team,

I'm interested in joining the waitlist for when JB-SaaS expands to serve businesses outside Australia.

Business Name: ${businessName || '[Your Business Name]'}
Email: ${email || '[Your Email]'}
Country: [Your Country]
Business Type: [Please describe your business]

I understand JB-SaaS currently focuses on Australian businesses, but I'd love to be notified when you expand to my market.

Best regards,
[Your Name]`);
    
    window.open(`mailto:hello@jb-saas.com?subject=${subject}&body=${body}`);
    
    if (onNonAustralianWaitlist) {
      onNonAustralianWaitlist();
    }
  };

  if (isAustralianBusiness === false) {
    return (
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
            <AlertTriangle className="w-5 h-5 mr-2" />
            International Business Interest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>JB-SaaS currently serves Australian businesses only.</strong><br />
              We focus on providing specialized local market expertise and compliance for Australian businesses.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-muted-foreground">
              We'd love to serve your market in the future! Join our international waitlist to be notified 
              when we expand globally.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleNonAustralianWaitlist}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Join International Waitlist
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAustralianBusiness(null)}
                className="flex-1"
              >
                I'm Actually Australian
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAustralianBusiness === true) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center text-green-900 dark:text-green-100">
            <CheckCircle className="w-5 h-5 mr-2" />
            Australian Business Verified
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-900 dark:text-green-100">
              <strong>Welcome!</strong> You're eligible for all JB-SaaS services including our specialized Australian business features.
            </AlertDescription>
          </Alert>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="abn">
                <Building className="w-4 h-4 inline mr-1" />
                Australian Business Number (Optional)
              </Label>
              <Input
                id="abn"
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                placeholder="12 345 678 901"
                className="bg-white dark:bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                ABN validation provides access to specialized Australian services
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Pty Ltd"
                className="bg-white dark:bg-muted"
              />
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="font-semibold mb-2 text-primary">🇦🇺 Australian Business Benefits</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Local business support during Australian hours</li>
              <li>• Compliance with Australian advertising standards</li>
              <li>• GST-inclusive pricing and invoicing</li>
              <li>• Access to Australian-specific services and templates</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setIsAustralianBusiness(null)}
            className="w-full"
          >
            Change Selection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary" />
          Business Location Verification
        </CardTitle>
        <p className="text-muted-foreground">
          JB-SaaS provides specialized services for Australian businesses with local expertise and compliance.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
          <Checkbox 
            id="australian-business"
            checked={isAustralianBusiness === true}
            onCheckedChange={(checked) => {
              if (checked) {
                handleAustralianSelection();
              }
            }}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <div className="flex-1">
            <Label 
              htmlFor="australian-business" 
              className="text-base font-medium cursor-pointer flex items-center"
            >
              <span className="mr-2">🇦🇺</span>
              Yes, I represent an Australian business
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Australian businesses get access to all features, local support, and specialized services.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
          <Checkbox 
            id="non-australian-business"
            checked={isAustralianBusiness === false}
            onCheckedChange={(checked) => {
              if (checked) {
                handleNonAustralianSelection();
              }
            }}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <div className="flex-1">
            <Label 
              htmlFor="non-australian-business" 
              className="text-base font-medium cursor-pointer flex items-center"
            >
              <span className="mr-2">🌍</span>
              No, I'm from outside Australia
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Join our international waitlist to be notified when we expand to your market.
            </p>
          </div>
        </div>

        {isAustralianBusiness === null && (
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="mr-2">
                Why Australian-only?
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              We focus exclusively on Australian businesses to provide specialized local market knowledge, 
              compliance with Australian regulations, and support during Australian business hours.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};