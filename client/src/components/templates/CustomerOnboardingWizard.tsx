import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronRight, 
  ChevronLeft, 
  Rocket, 
  Target, 
  Palette, 
  Globe, 
  BookOpen,
  CheckCircle,
  Play,
  Users,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface OnboardingData {
  businessInfo: {
    name: string;
    industry: string;
    description: string;
    website: string;
    targetAudience: string;
  };
  blogGoals: {
    primaryObjective: string;
    contentTypes: string[];
    publishingFrequency: string;
    brandVoice: string;
  };
  designPreferences: {
    colorScheme: string;
    template: string;
    features: string[];
  };
  technicalSetup: {
    domain: string;
    subdomain: string;
    integrations: string[];
  };
}

const CustomerOnboardingWizard = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessInfo: {
      name: '',
      industry: '',
      description: '',
      website: '',
      targetAudience: ''
    },
    blogGoals: {
      primaryObjective: '',
      contentTypes: [],
      publishingFrequency: '',
      brandVoice: ''
    },
    designPreferences: {
      colorScheme: '',
      template: '',
      features: []
    },
    technicalSetup: {
      domain: '',
      subdomain: '',
      integrations: []
    }
  });

  const steps: WizardStep[] = [
    {
      id: 'business',
      title: 'Business Information',
      description: 'Tell us about your business to personalize your blog experience',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: 'goals',
      title: 'Blog Strategy',
      description: 'Define your content goals and publishing strategy',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'design',
      title: 'Design & Features',
      description: 'Choose your blog design and functionality preferences',
      icon: <Palette className="w-5 h-5" />
    },
    {
      id: 'technical',
      title: 'Technical Setup',
      description: 'Configure domain and integrations for your blog',
      icon: <Globe className="w-5 h-5" />
    }
  ];

  const industryOptions = [
    'Healthcare & Wellness',
    'Technology',
    'Finance & Banking',
    'Legal Services',
    'Fitness & Sports',
    'Beauty & Cosmetics',
    'Real Estate',
    'Education',
    'Retail & E-commerce',
    'Professional Services'
  ];

  const contentTypes = [
    'Educational Articles',
    'How-to Guides',
    'Industry News',
    'Case Studies',
    'Product Updates',
    'Company News',
    'Customer Stories',
    'Thought Leadership'
  ];

  const blogFeatures = [
    'Newsletter Signup',
    'Social Media Integration',
    'Comment System',
    'Search Functionality',
    'Related Posts',
    'Author Bios',
    'Categories & Tags',
    'RSS Feed'
  ];

  const integrationOptions = [
    'Google Analytics',
    'Mailchimp',
    'HubSpot',
    'Salesforce',
    'Slack',
    'Zapier',
    'Facebook Pixel',
    'LinkedIn Analytics'
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    toast({
      title: "Setup Complete!",
      description: "Your blog is being configured with your preferences. You'll receive an email when it's ready."
    });
  };

  const updateBusinessInfo = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [field]: value }
    }));
  };

  const updateBlogGoals = (field: string, value: string | string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      blogGoals: { ...prev.blogGoals, [field]: value }
    }));
  };

  const updateDesignPreferences = (field: string, value: string | string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      designPreferences: { ...prev.designPreferences, [field]: value }
    }));
  };

  const updateTechnicalSetup = (field: string, value: string | string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      technicalSetup: { ...prev.technicalSetup, [field]: value }
    }));
  };

  const toggleArrayValue = (array: string[], value: string, updateFunction: (field: string, value: string[]) => void, field: string) => {
    const newArray = array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value];
    updateFunction(field, newArray);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full text-center">
          <CardContent className="py-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to Your Blog!</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Your blog is being set up with all your preferences. We'll send you an email with your login details 
              and next steps within the next few minutes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-muted/50 rounded-lg">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Training Materials</h3>
                <p className="text-sm text-muted-foreground">Access comprehensive guides and tutorials</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Support Team</h3>
                <p className="text-sm text-muted-foreground">Get help from our expert support team</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Getting Started Video
              </Button>
              <Button variant="outline" size="lg">
                Download User Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Blog Setup Wizard</h1>
          <p className="text-muted-foreground">
            Let's configure your blog to perfectly match your business needs
          </p>
          
          {/* Progress */}
          <div className="max-w-md mx-auto space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  index === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : index < currentStep 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.icon}
                  <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Business Information Step */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="business-name">Business Name *</Label>
                    <Input
                      id="business-name"
                      placeholder="Your Business Name"
                      value={onboardingData.businessInfo.name}
                      onChange={(e) => updateBusinessInfo('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={onboardingData.businessInfo.industry} onValueChange={(value) => updateBusinessInfo('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={onboardingData.businessInfo.website}
                    onChange={(e) => updateBusinessInfo('website', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe what your business does..."
                    value={onboardingData.businessInfo.description}
                    onChange={(e) => updateBusinessInfo('description', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="target-audience">Target Audience *</Label>
                  <Textarea
                    id="target-audience"
                    placeholder="Describe your ideal customers and target audience..."
                    value={onboardingData.businessInfo.targetAudience}
                    onChange={(e) => updateBusinessInfo('targetAudience', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Blog Goals Step */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="primary-objective">Primary Blog Objective *</Label>
                  <Select value={onboardingData.blogGoals.primaryObjective} onValueChange={(value) => updateBlogGoals('primaryObjective', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="What's your main goal?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead-generation">Lead Generation</SelectItem>
                      <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                      <SelectItem value="customer-education">Customer Education</SelectItem>
                      <SelectItem value="thought-leadership">Thought Leadership</SelectItem>
                      <SelectItem value="seo-traffic">SEO & Organic Traffic</SelectItem>
                      <SelectItem value="customer-retention">Customer Retention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Content Types (select all that apply) *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {contentTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={onboardingData.blogGoals.contentTypes.includes(type)}
                          onCheckedChange={() => toggleArrayValue(onboardingData.blogGoals.contentTypes, type, updateBlogGoals, 'contentTypes')}
                        />
                        <Label htmlFor={type} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="frequency">Publishing Frequency *</Label>
                    <Select value={onboardingData.blogGoals.publishingFrequency} onValueChange={(value) => updateBlogGoals('publishingFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="How often will you publish?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="as-needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="brand-voice">Brand Voice *</Label>
                    <Select value={onboardingData.blogGoals.brandVoice} onValueChange={(value) => updateBlogGoals('brandVoice', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="empathetic">Empathetic</SelectItem>
                        <SelectItem value="exciting">Exciting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Design Preferences Step */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="color-scheme">Color Scheme *</Label>
                  <Select value={onboardingData.designPreferences.colorScheme} onValueChange={(value) => updateDesignPreferences('colorScheme', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a color theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional-blue">Professional Blue</SelectItem>
                      <SelectItem value="modern-green">Modern Green</SelectItem>
                      <SelectItem value="elegant-purple">Elegant Purple</SelectItem>
                      <SelectItem value="warm-orange">Warm Orange</SelectItem>
                      <SelectItem value="classic-gray">Classic Gray</SelectItem>
                      <SelectItem value="custom">Custom (I'll provide brand colors)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="template">Blog Template *</Label>
                  <Select value={onboardingData.designPreferences.template} onValueChange={(value) => updateDesignPreferences('template', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal & Clean</SelectItem>
                      <SelectItem value="magazine">Magazine Style</SelectItem>
                      <SelectItem value="corporate">Corporate Professional</SelectItem>
                      <SelectItem value="creative">Creative Portfolio</SelectItem>
                      <SelectItem value="news">News & Media</SelectItem>
                      <SelectItem value="personal">Personal Blog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Additional Features (select all you want) *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {blogFeatures.map(feature => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={onboardingData.designPreferences.features.includes(feature)}
                          onCheckedChange={() => toggleArrayValue(onboardingData.designPreferences.features, feature, updateDesignPreferences, 'features')}
                        />
                        <Label htmlFor={feature} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Technical Setup Step */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="domain">Custom Domain</Label>
                    <Input
                      id="domain"
                      placeholder="myblog.com (optional)"
                      value={onboardingData.technicalSetup.domain}
                      onChange={(e) => updateTechnicalSetup('domain', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to use a subdomain of our platform
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="subdomain">Subdomain Preference</Label>
                    <Input
                      id="subdomain"
                      placeholder="blog.yoursite.com"
                      value={onboardingData.technicalSetup.subdomain}
                      onChange={(e) => updateTechnicalSetup('subdomain', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: blog.yourdomain.com
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label>Integrations (select what you'll use)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {integrationOptions.map(integration => (
                      <div key={integration} className="flex items-center space-x-2">
                        <Checkbox
                          id={integration}
                          checked={onboardingData.technicalSetup.integrations.includes(integration)}
                          onCheckedChange={() => toggleArrayValue(onboardingData.technicalSetup.integrations, integration, updateTechnicalSetup, 'integrations')}
                        />
                        <Label htmlFor={integration} className="text-sm">{integration}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm">Setup Assistance Available</h4>
                        <p className="text-xs text-muted-foreground">
                          Our team can help with domain configuration, DNS settings, and integrations setup. 
                          You'll receive detailed instructions and support after completing this wizard.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Rocket className="w-4 h-4" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOnboardingWizard;