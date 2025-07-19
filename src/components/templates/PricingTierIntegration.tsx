import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  Crown, 
  Sparkles, 
  Zap, 
  Building, 
  Globe, 
  BarChart3,
  Users,
  Shield,
  Headphones
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  popular?: boolean;
  features: string[];
  blogFeatures: string[];
  icon: React.ReactNode;
}

const PricingTierIntegration = () => {
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const pricingTiers: PricingTier[] = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Up to 3 businesses - Opening sale price',
      price: billingInterval === 'month' ? 49 : 490,
      interval: billingInterval,
      popular: true,
      features: [
        'Up to 3 businesses',
        'Unlimited posts',
        'Advanced analytics',
        'AI content generation',
        'Priority support',
        'Content templates'
      ],
      blogFeatures: [
        'Basic blog integration',
        'Unlimited blog posts',
        'SEO optimization'
      ],
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'large',
      name: 'Large',
      description: 'More than 3 businesses - Opening sale price',
      price: billingInterval === 'month' ? 179 : 1790,
      interval: billingInterval,
      features: [
        'Unlimited businesses',
        'Unlimited posts',
        'Advanced analytics',
        'AI content generation',
        'Priority support',
        'Team collaboration',
        'Custom branding',
        'Multi-business management'
      ],
      blogFeatures: [
        'Advanced blog management',
        'Unlimited blog posts',
        'Advanced SEO tools',
        'Content calendar integration'
      ],
      icon: <Crown className="w-6 h-6" />
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Advanced enterprise features - Coming 2026',
      price: 0,
      interval: billingInterval,
      features: [
        'Everything in Large',
        'White-label solution',
        'Custom integrations',
        '24/7 phone support',
        'Dedicated account manager',
        'Custom compliance',
        'SLA guarantees'
      ],
      blogFeatures: [
        'Enterprise blog solutions',
        'Multi-site management',
        'Custom integrations',
        'Dedicated support'
      ],
      icon: <Building className="w-6 h-6" />
    }
  ];

  const blogAddOns = [
    {
      name: 'Blog Builder Pro',
      price: 19,
      description: 'Enhanced blog management with AI-powered content creation',
      features: [
        'AI content generation',
        'Advanced SEO optimization',
        'Custom templates',
        'Analytics dashboard'
      ]
    },
    {
      name: 'Multi-Domain Manager',
      price: 39,
      description: 'Manage multiple customer blogs from one dashboard',
      features: [
        'Unlimited domains',
        'White-label interface',
        'Bulk content management',
        'Cross-domain analytics'
      ]
    },
    {
      name: 'Enterprise Blog Suite',
      price: 99,
      description: 'Complete blog management solution for agencies',
      features: [
        'Custom development',
        'API integration',
        'Dedicated support',
        'Training & consultation'
      ]
    }
  ];

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    toast({
      title: "Plan Selected",
      description: `You've selected the ${pricingTiers.find(t => t.id === tierId)?.name} plan. Proceed to checkout to get started.`
    });
  };

  const handleAddBlogService = (addonName: string) => {
    toast({
      title: "Service Added",
      description: `${addonName} has been added to your plan. This will enhance your blog management capabilities.`
    });
  };

  const yearlyDiscount = billingInterval === 'year' ? 0.17 : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Scale your content marketing with our comprehensive social media and blog management platform
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${billingInterval === 'month' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={billingInterval === 'year'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'year' : 'month')}
            />
            <span className={`text-sm ${billingInterval === 'year' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {billingInterval === 'year' && (
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Main Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-300 hover:shadow-elegant ${
                tier.popular ? 'ring-2 ring-primary' : ''
              } ${selectedTier === tier.id ? 'ring-2 ring-primary' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center text-primary">
                  {tier.icon}
                </div>
                <div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-foreground">
                    {tier.price === 0 ? 'Coming 2026' : `$${tier.price}`}
                    {tier.price > 0 && <span className="text-lg text-muted-foreground">/{tier.interval}</span>}
                  </div>
                  {billingInterval === 'year' && tier.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Billed annually • Save ${Math.round(tier.price * 12 * yearlyDiscount)}
                    </p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Core Features */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Core Features
                  </h4>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Blog Features */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Blog Management
                  </h4>
                  <ul className="space-y-2">
                    {tier.blogFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => handleSelectTier(tier.id)}
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  size="lg"
                >
                  {selectedTier === tier.id ? 'Selected' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Blog Add-ons Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Blog Management Add-ons</h2>
            <p className="text-muted-foreground">
              Enhance your plan with specialized blog management services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogAddOns.map((addon, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-elegant">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{addon.name}</CardTitle>
                    <Badge variant="outline">+${addon.price}/month</Badge>
                  </div>
                  <CardDescription>{addon.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {addon.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleAddBlogService(addon.name)}
                    variant="outline" 
                    className="w-full"
                  >
                    Add to Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enterprise Contact */}
        <Card className="bg-gradient-primary text-white">
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Need a Custom Solution?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              For organizations with unique requirements, we offer custom enterprise solutions 
              with dedicated support, training, and tailored features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                Schedule Consultation
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Users className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingTierIntegration;