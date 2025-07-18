import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Globe, 
  Shield, 
  Loader2,
  CheckCircle 
} from 'lucide-react';

interface NameScoutWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const NameScoutWizard: React.FC<NameScoutWizardProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [businessName, setBusinessName] = useState('');
  const [domainExtensions, setDomainExtensions] = useState<string[]>(['.com.au', '.com']);
  const [includeTrademarkScreening, setIncludeTrademarkScreening] = useState(false);
  
  // Mock user tier - in real app, get from user subscription
  const [userTier] = useState<'Starter' | 'Professional' | 'Enterprise'>('Starter');

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const domainOptions = [
    { extension: '.com.au', label: '.com.au', description: 'Australian commercial' },
    { extension: '.com', label: '.com', description: 'Global commercial' },
    { extension: '.io', label: '.io', description: 'Tech startups' },
    { extension: '.net.au', label: '.net.au', description: 'Australian network' },
  ];

  const handleDomainExtensionChange = (extension: string, checked: boolean) => {
    if (checked) {
      setDomainExtensions(prev => [...prev, extension]);
    } else {
      setDomainExtensions(prev => prev.filter(ext => ext !== extension));
    }
  };

  const calculatePricing = () => {
    // No free options - all tiers pay
    let basePrice = 99;
    if (userTier === 'Professional') {
      basePrice = 79;
    } else if (userTier === 'Enterprise') {
      basePrice = 69; // Discounted but not free
    }

    let trademarkPrice = 0;
    if (includeTrademarkScreening) {
      trademarkPrice = 50; // All tiers pay for trademark screening
    }

    return { basePrice, trademarkPrice, total: basePrice + trademarkPrice };
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const pricing = calculatePricing();
      
      const { data, error } = await supabase.functions.invoke('name-scout-checkout', {
        body: {
          businessName,
          domainExtensions,
          includeTrademarkScreening,
          userTier
        }
      });

      if (error) throw error;

      if (data.success && data.requestId) {
        // Enterprise plan - request created directly
        toast({
          title: "Request Created!",
          description: data.message,
        });
        onComplete();
      } else if (data.url) {
        // Paid plan - redirect to Stripe checkout
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout in a new tab...",
        });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromStep1 = businessName.trim().length >= 3;
  const canProceedFromStep2 = domainExtensions.length > 0;
  const pricing = calculatePricing();

  return (
    <Card className="glass border-primary/20 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Australian Name & Domain Scout</CardTitle>
              <CardDescription>
                Step {currentStep} of {totalSteps}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
        
        <Progress value={progressPercentage} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Business Name */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Enter Your Business Name</h3>
              <p className="text-muted-foreground">
                What business name would you like to research?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-name">Proposed Business Name</Label>
              <Input
                id="business-name"
                placeholder="e.g., Sydney Tech Solutions"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Enter the exact name you want to register with ASIC
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedFromStep1}
                className="bg-gradient-primary"
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Domain Extensions */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Choose Domain Extensions</h3>
              <p className="text-muted-foreground">
                Select which domain extensions to check for availability
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {domainOptions.map((option) => (
                <div 
                  key={option.extension}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={option.extension}
                    checked={domainExtensions.includes(option.extension)}
                    onCheckedChange={(checked) => 
                      handleDomainExtensionChange(option.extension, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={option.extension}
                      className="font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedFromStep2}
                className="bg-gradient-primary"
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Trademark Screening & Summary */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Trademark Screening</h3>
              <p className="text-muted-foreground">
                Optional IP Australia trademark search and analysis
              </p>
            </div>

            {/* Trademark Option */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <Label className="font-medium">Include Trademark Screening</Label>
                    <p className="text-sm text-muted-foreground">
                      Search IP Australia for potential trademark conflicts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!includeTrademarkScreening && (
                    <Badge variant="outline">+AU$50</Badge>
                  )}
                  <Switch
                    checked={includeTrademarkScreening}
                    onCheckedChange={setIncludeTrademarkScreening}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Business Name Research:</span>
                  <span className="font-medium">"{businessName}"</span>
                </div>
                <div className="flex justify-between">
                  <span>Domain Extensions:</span>
                  <span className="font-medium">{domainExtensions.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trademark Screening:</span>
                  <span className="font-medium">
                    {includeTrademarkScreening ? 'Yes' : 'No'}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Cost:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">AU${pricing.total}</span>
                    {userTier === 'Professional' && (
                      <p className="text-xs text-muted-foreground">Professional pricing</p>
                    )}
                    {userTier === 'Enterprise' && (
                      <p className="text-xs text-muted-foreground">Enterprise pricing</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Cancel subscription anytime</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};