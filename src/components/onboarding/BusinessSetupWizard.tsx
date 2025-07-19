import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { Building2, Globe, Palette, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface BusinessData {
  business_name: string;
  industry: string;
  website_url: string;
  description: string;
  target_audience: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  default_ai_tone: string;
  goals: string[];
  platforms: string[];
}

interface SetupWizardProps {
  onComplete: () => void;
}

const industries = [
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'hospitality', label: 'Hospitality & Tourism' },
  { value: 'healthcare', label: 'Healthcare & Wellness' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'trades', label: 'Trades & Construction' },
  { value: 'technology', label: 'Technology' },
  { value: 'education', label: 'Education & Training' },
  { value: 'finance', label: 'Finance & Insurance' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'fitness', label: 'Fitness & Sports' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' }
];

const tones = [
  { value: 'professional', label: 'Professional', description: 'Formal, authoritative, expert' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, approachable, conversational' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, informal, personable' },
  { value: 'authoritative', label: 'Authoritative', description: 'Confident, commanding, expert' },
  { value: 'empathetic', label: 'Empathetic', description: 'Understanding, caring, supportive' },
  { value: 'exciting', label: 'Exciting', description: 'Energetic, enthusiastic, dynamic' }
];

const goalOptions = [
  'Increase brand awareness',
  'Generate more leads',
  'Improve customer engagement',
  'Build thought leadership',
  'Drive website traffic',
  'Increase sales',
  'Build community',
  'Educate customers',
  'Launch new products',
  'Establish local presence'
];

const platformOptions = [
  'Facebook',
  'Instagram', 
  'LinkedIn',
  'Twitter',
  'YouTube',
  'TikTok',
  'Pinterest',
  'Website Blog',
  'Email Newsletter',
  'Google My Business'
];

export const BusinessSetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData>({
    business_name: '',
    industry: '',
    website_url: '',
    description: '',
    target_audience: '',
    brand_colors: {
      primary: '#3b82f6',
      secondary: '#64748b', 
      accent: '#f59e0b'
    },
    default_ai_tone: 'professional',
    goals: [],
    platforms: []
  });

  const { createBusinessProfile } = useBusinessProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const profileData = {
        business_name: businessData.business_name,
        industry: businessData.industry as any,
        website_url: businessData.website_url,
        brand_colors: businessData.brand_colors,
        default_ai_tone: businessData.default_ai_tone as any,
        is_primary: true,
        compliance_settings: {
          description: businessData.description,
          target_audience: businessData.target_audience,
          goals: businessData.goals,
          platforms: businessData.platforms
        }
      };

      const success = await createBusinessProfile(profileData);
      
      if (success) {
        toast({
          title: "Business Profile Created!",
          description: "Your business profile has been set up successfully.",
        });
        onComplete();
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create business profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return businessData.business_name && businessData.industry;
      case 2:
        return businessData.description && businessData.target_audience;
      case 3:
        return businessData.goals.length > 0;
      case 4:
        return businessData.platforms.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building2 className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Business Information</h2>
              <p className="text-muted-foreground">Let's start with the basics about your business</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={businessData.business_name}
                  onChange={(e) => setBusinessData({...businessData, business_name: e.target.value})}
                  placeholder="Your Business Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select 
                  value={businessData.industry} 
                  onValueChange={(value) => setBusinessData({...businessData, industry: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL (Optional)</Label>
                <Input
                  id="website_url"
                  value={businessData.website_url}
                  onChange={(e) => setBusinessData({...businessData, website_url: e.target.value})}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Globe className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Tell Us About Your Business</h2>
              <p className="text-muted-foreground">Help us understand your business and audience</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={businessData.description}
                  onChange={(e) => setBusinessData({...businessData, description: e.target.value})}
                  placeholder="Describe what your business does, your services/products, and what makes you unique..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience *</Label>
                <Textarea
                  id="target_audience"
                  value={businessData.target_audience}
                  onChange={(e) => setBusinessData({...businessData, target_audience: e.target.value})}
                  placeholder="Describe your ideal customers: demographics, interests, pain points, where they spend time online..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Marketing Goals</h2>
              <p className="text-muted-foreground">Select your primary marketing objectives</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {goalOptions.map(goal => (
                  <div
                    key={goal}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      businessData.goals.includes(goal)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                    onClick={() => setBusinessData({
                      ...businessData,
                      goals: toggleArrayItem(businessData.goals, goal)
                    })}
                  >
                    <div className="text-sm font-medium">{goal}</div>
                  </div>
                ))}
              </div>
              
              {businessData.goals.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Goals:</Label>
                  <div className="flex flex-wrap gap-2">
                    {businessData.goals.map(goal => (
                      <Badge key={goal} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Globe className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Marketing Platforms</h2>
              <p className="text-muted-foreground">Where do you want to publish content?</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {platformOptions.map(platform => (
                  <div
                    key={platform}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      businessData.platforms.includes(platform)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                    onClick={() => setBusinessData({
                      ...businessData,
                      platforms: toggleArrayItem(businessData.platforms, platform)
                    })}
                  >
                    <div className="text-sm font-medium">{platform}</div>
                  </div>
                ))}
              </div>
              
              {businessData.platforms.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Platforms:</Label>
                  <div className="flex flex-wrap gap-2">
                    {businessData.platforms.map(platform => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Palette className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Brand Voice & Style</h2>
              <p className="text-muted-foreground">Customize your brand's communication style</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Content Tone</Label>
                <div className="grid gap-3">
                  {tones.map(tone => (
                    <div
                      key={tone.value}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        businessData.default_ai_tone === tone.value
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-muted-foreground'
                      }`}
                      onClick={() => setBusinessData({...businessData, default_ai_tone: tone.value})}
                    >
                      <div className="font-medium">{tone.label}</div>
                      <div className="text-sm text-muted-foreground">{tone.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Brand Colors</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={businessData.brand_colors.primary}
                        onChange={(e) => setBusinessData({
                          ...businessData,
                          brand_colors: { ...businessData.brand_colors, primary: e.target.value }
                        })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={businessData.brand_colors.primary}
                        onChange={(e) => setBusinessData({
                          ...businessData,
                          brand_colors: { ...businessData.brand_colors, primary: e.target.value }
                        })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={businessData.brand_colors.secondary}
                        onChange={(e) => setBusinessData({
                          ...businessData,
                          brand_colors: { ...businessData.brand_colors, secondary: e.target.value }
                        })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={businessData.brand_colors.secondary}
                        onChange={(e) => setBusinessData({
                          ...businessData,
                          brand_colors: { ...businessData.brand_colors, secondary: e.target.value }
                        })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Accent</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={businessData.brand_colors.accent}
                        onChange={(e) => setBusinessData({
                          ...businessData,
                          brand_colors: { ...businessData.brand_colors, accent: e.target.value }
                        })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={businessData.brand_colors.accent}
                        onChange={(e) => setBusinessData({
                          ...businessData,
                          brand_colors: { ...businessData.brand_colors, accent: e.target.value }
                        })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-4">
            <div className="text-center">
              <CardTitle className="text-3xl font-bold">Welcome to JBSAAS!</CardTitle>
              <CardDescription>
                Let's set up your business profile to get started
              </CardDescription>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-8">
            {renderStep()}
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
                {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};