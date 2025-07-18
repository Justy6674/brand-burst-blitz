import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  Crown, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Shield,
  HeadphonesIcon,
  Calendar,
  Zap,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface PricingPlan {
  name: string;
  icon: React.ElementType;
  originalPrice: number;
  setupPrice: number;
  discount?: string;
  description: string;
  features: string[];
  setupIncludes: string[];
  deliveryTime: string;
  support: string;
  badge?: string;
  badgeColor?: string;
}

const AustralianSetupPricing = () => {
  const [abnNumber, setAbnNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [businessName, setBusinessName] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const { toast } = useToast();

  const validateABN = async () => {
    if (!abnNumber.trim() || abnNumber.length !== 11) return;
    
    setIsValidating(true);
    setValidationError('');
    setBusinessName('');
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-australian-business', {
        body: { abn: abnNumber }
      });

      if (error) {
        console.error('Validation error:', error);
        setValidationError('Unable to validate ABN. Please try again.');
        setIsEligible(false);
        toast({
          title: "Validation Error",
          description: "Unable to validate ABN. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.isValid) {
        setIsEligible(true);
        setBusinessName(data.businessName || '');
        toast({
          title: "ABN Verified ✅",
          description: `Welcome ${data.businessName}! Your business qualifies for our setup service.`,
        });
      } else {
        setIsEligible(false);
        setValidationError(data?.error || 'ABN not found or inactive');
        toast({
          title: "Validation Failed",
          description: data?.error || 'ABN not found in Australian Business Register',
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setValidationError('Unexpected error occurred. Please try again.');
      setIsEligible(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const pricingPlans: PricingPlan[] = [
    {
      name: 'Starter Setup',
      icon: Users,
      originalPrice: 399,
      setupPrice: 299,
      discount: 'AU$100 OFF',
      description: 'Perfect for small Australian businesses getting started',
      features: [
        'Up to 100 AI posts/month',
        '3 Social media accounts',
        'Basic analytics',
        'Email support'
      ],
      setupIncludes: [
        'Facebook Business Manager setup',
        'Instagram Business profile creation',
        'Basic Meta App configuration',
        'Account connection to JBSAAS platform',
        'Initial content calendar (1 week)',
        'Setup guide and training video'
      ],
      deliveryTime: '3-5 business days',
      support: 'Email support'
    },
    {
      name: 'Professional Setup',
      icon: Star,
      originalPrice: 399,
      setupPrice: 199,
      discount: 'AU$200 OFF',
      description: 'For established businesses ready to scale',
      features: [
        'Unlimited AI content',
        '10 Social media accounts',
        'Advanced analytics',
        'Priority support'
      ],
      setupIncludes: [
        'Complete Facebook Business Manager setup',
        'Instagram Business + Creator tools',
        'LinkedIn Business Page optimization',
        'Advanced Meta App configuration',
        'Custom audience setup',
        'Pixel installation and configuration',
        'Content strategy consultation (30 min)',
        'Two weeks of content calendar',
        'Team training session'
      ],
      deliveryTime: '2-3 business days',
      support: 'Priority email + phone',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500'
    },
    {
      name: 'Enterprise Setup',
      icon: Crown,
      originalPrice: 0,
      setupPrice: 0,
      description: 'White-glove service for large organizations',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Custom integrations',
        'Dedicated manager'
      ],
      setupIncludes: [
        'Full multi-platform setup',
        'Custom business verification',
        'Advanced analytics configuration',
        'Team permission management',
        'Custom workflow creation',
        'Brand guidelines implementation',
        'Monthly strategy consultation',
        'Dedicated success manager',
        'Priority phone support'
      ],
      deliveryTime: '1-2 business days',
      support: 'Dedicated success manager',
      badge: 'Included',
      badgeColor: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Eligibility Check */}
      <Card className="border-2 border-dashed border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary" />
            Australian Business Eligibility Check
          </CardTitle>
          <p className="text-muted-foreground">
            Verify your Australian business to access our exclusive setup service
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter your ABN (11 digits)"
              value={abnNumber}
              onChange={(e) => setAbnNumber(e.target.value)}
              className="flex-1"
              maxLength={11}
            />
            <Button 
              onClick={validateABN}
              disabled={isValidating || abnNumber.length !== 11}
              className="bg-gradient-primary"
            >
              {isValidating ? 'Validating...' : 'Check Eligibility'}
            </Button>
          </div>
          
          {isEligible === true && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="w-5 h-5" />
                <div className="flex-1">
                  <span className="font-medium">✅ ABN Verified!</span>
                  {businessName && (
                    <div className="text-sm mt-1">
                      Business: <span className="font-medium">{businessName}</span>
                    </div>
                  )}
                  <div className="text-sm mt-1">
                    Your Australian business qualifies for our setup service.
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isEligible === false && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <div className="flex-1">
                  <span className="font-medium">ABN Validation Failed</span>
                  {validationError && (
                    <div className="text-sm mt-1">{validationError}</div>
                  )}
                  <div className="text-sm mt-1">
                    This service is only available for registered Australian businesses.
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Overview */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">
              🇦🇺 Australian Quick-Start Social Setup Service
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our team personally configures your Facebook Business Manager, Instagram Business profile, 
              and connects everything to your JBSAAS platform. Exclusively for Australian businesses.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid lg:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => {
          const Icon = plan.icon;
          const isEnterprise = plan.name === 'Enterprise Setup';
          
          return (
            <Card 
              key={index} 
              className={`relative h-full flex flex-col ${
                plan.badge === 'Most Popular' ? 'border-2 border-primary shadow-xl' : ''
              }`}
            >
              {plan.badge && (
                <Badge className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white`}>
                  {plan.badge}
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Icon className="w-6 h-6 text-primary" />
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Pricing */}
                <div className="text-center mb-6">
                  {isEnterprise ? (
                    <div>
                      <div className="text-4xl font-bold text-green-600">
                        Included
                      </div>
                      <p className="text-sm text-muted-foreground">
                        In your Enterprise plan
                      </p>
                    </div>
                  ) : (
                    <div>
                      {plan.discount && (
                        <Badge className="mb-2 bg-red-500 text-white">
                          {plan.discount}
                        </Badge>
                      )}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl text-muted-foreground line-through">
                          AU${plan.originalPrice}
                        </span>
                        <span className="text-4xl font-bold text-primary">
                          AU${plan.setupPrice}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        One-time setup fee
                      </p>
                    </div>
                  )}
                </div>

                {/* Current Plan Features */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Your Current Plan Includes:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Setup Service Includes */}
                <div className="mb-6 flex-1">
                  <h4 className="font-medium mb-3">Setup Service Includes:</h4>
                  <ul className="space-y-2">
                    {plan.setupIncludes.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Service Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Delivery: {plan.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HeadphonesIcon className="w-4 h-4 text-muted-foreground" />
                    <span>Support: {plan.support}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span>100% satisfaction guarantee</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full h-12 ${
                    isEnterprise 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gradient-primary'
                  }`}
                  disabled={!isEligible}
                >
                  {isEnterprise ? 'Contact Success Manager' : `Order Setup - AU$${plan.setupPrice}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* What Happens Next */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium">1. Payment</h3>
              <p className="text-sm text-muted-foreground">
                Secure payment processed. You'll receive confirmation and our team will be notified.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium">2. Setup</h3>
              <p className="text-sm text-muted-foreground">
                Our Australian team configures your social media accounts and connects them to JBSAAS.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium">3. Launch</h3>
              <p className="text-sm text-muted-foreground">
                You're ready to start creating and scheduling content across all your connected platforms!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Why is this service only for Australian businesses?</h4>
            <p className="text-sm text-muted-foreground">
              Our team has specialized knowledge of Australian business regulations, Facebook's Australian 
              business verification requirements, and local market best practices.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">What if I already have some social media accounts set up?</h4>
            <p className="text-sm text-muted-foreground">
              No problem! We'll audit your existing setup, optimize configurations, and ensure everything 
              is properly connected to JBSAAS for maximum efficiency.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Do you provide ongoing management?</h4>
            <p className="text-sm text-muted-foreground">
              This is a setup service only. Once complete, you'll use JBSAAS to manage your content. 
              However, we do offer optional monthly strategy consultations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AustralianSetupPricing;