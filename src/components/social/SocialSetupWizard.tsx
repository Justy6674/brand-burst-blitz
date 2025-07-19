import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight, 
  ArrowLeft,
  Lightbulb,
  Users,
  CreditCard,
  Building,
  Camera,
  Settings,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'general';
  complexity: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  requirements: string[];
  instructions: string[];
  completed: boolean;
}

export const SocialSetupWizard = () => {
  const { toast } = useToast();
  const { profile } = useBusinessProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    country: 'Australia',
    hasWebsite: false,
    websiteUrl: '',
    hasPhysicalLocation: false,
    businessDescription: '',
    targetAudience: ''
  });
  const [aiGuidance, setAiGuidance] = useState('');
  const [isGeneratingGuidance, setIsGeneratingGuidance] = useState(false);

  const setupSteps: SetupStep[] = [
    {
      id: 'business-info',
      title: 'Business Information Collection',
      description: 'Gather essential business details for social media setup',
      platform: 'general',
      complexity: 'easy',
      estimatedTime: '5 minutes',
      requirements: ['Business name', 'Business type', 'Target audience'],
      instructions: [
        'Enter your official business name as registered',
        'Select your business category/industry',
        'Describe your target audience',
        'Provide business website if available'
      ],
      completed: false
    },
    {
      id: 'facebook-business',
      title: 'Facebook Business Manager Setup',
      description: 'Create and configure Facebook Business Manager account',
      platform: 'facebook',
      complexity: 'medium',
      estimatedTime: '15-20 minutes',
      requirements: ['Personal Facebook account', 'Business verification documents', 'Phone number'],
      instructions: [
        'Go to business.facebook.com and create Business Manager',
        'Add your business name and details',
        'Verify your business with official documents',
        'Add team members if needed',
        'Create or claim your Facebook Page'
      ],
      completed: false
    },
    {
      id: 'facebook-app',
      title: 'Facebook Developer App Creation',
      description: 'Create Facebook app for API access and permissions',
      platform: 'facebook',
      complexity: 'hard',
      estimatedTime: '20-30 minutes',
      requirements: ['Facebook Business Manager', 'Developer account', 'App review process'],
      instructions: [
        'Go to developers.facebook.com and create app',
        'Choose "Business" app type',
        'Configure Basic Settings with business details',
        'Add Facebook Login product',
        'Request pages_manage_posts permission',
        'Submit for app review (can take 3-7 days)'
      ],
      completed: false
    },
    {
      id: 'instagram-business',
      title: 'Instagram Business Account Setup',
      description: 'Convert to Instagram Business and link to Facebook',
      platform: 'instagram',
      complexity: 'medium',
      estimatedTime: '10-15 minutes',
      requirements: ['Instagram account', 'Facebook Page', 'Business category'],
      instructions: [
        'Open Instagram app and go to Settings',
        'Tap "Account" then "Switch to Professional Account"',
        'Choose "Business" and select category',
        'Connect to your Facebook Page',
        'Add business contact information',
        'Verify the connection in Facebook Business Manager'
      ],
      completed: false
    },
    {
      id: 'ad-account',
      title: 'Facebook Ad Account Setup',
      description: 'Create and configure advertising account for business',
      platform: 'facebook',
      complexity: 'medium',
      estimatedTime: '15-20 minutes',
      requirements: ['Facebook Business Manager', 'Payment method', 'Tax information'],
      instructions: [
        'In Business Manager, go to Business Settings',
        'Click "Ad Accounts" then "Add New Ad Account"',
        'Enter business details and currency',
        'Add payment method (credit card or bank)',
        'Provide tax information if required',
        'Set spending limits and permissions'
      ],
      completed: false
    },
    {
      id: 'linkedin-company',
      title: 'LinkedIn Company Page Creation',
      description: 'Set up professional LinkedIn presence',
      platform: 'linkedin',
      complexity: 'easy',
      estimatedTime: '10 minutes',
      requirements: ['LinkedIn personal account', 'Company logo', 'Business description'],
      instructions: [
        'Go to linkedin.com/company/setup/new',
        'Enter company name and website',
        'Upload company logo and cover image',
        'Write compelling company description',
        'Add company details and specialties',
        'Invite employees to follow page'
      ],
      completed: false
    },
    {
      id: 'linkedin-app',
      title: 'LinkedIn Developer Application',
      description: 'Create LinkedIn app for content publishing',
      platform: 'linkedin',
      complexity: 'hard',
      estimatedTime: '20-30 minutes',
      requirements: ['LinkedIn Company Page', 'Developer agreement', 'Use case approval'],
      instructions: [
        'Go to developer.linkedin.com and create app',
        'Associate with your Company Page',
        'Request w_member_social permission',
        'Describe your use case clearly',
        'Submit for review (marketing use case)',
        'Wait for approval (1-3 business days)'
      ],
      completed: false
    },
    {
      id: 'twitter-business',
      title: 'Twitter Business Setup',
      description: 'Configure Twitter for business use',
      platform: 'twitter',
      complexity: 'medium',
      estimatedTime: '15 minutes',
      requirements: ['Twitter account', 'Phone verification', 'Profile optimization'],
      instructions: [
        'Convert to Twitter Business account',
        'Verify phone number for security',
        'Optimize profile with business info',
        'Add website and location',
        'Set up Twitter Ads account if needed',
        'Apply for Twitter Developer account'
      ],
      completed: false
    },
    {
      id: 'api-integration',
      title: 'API Credentials Integration',
      description: 'Add your developer credentials to the platform',
      platform: 'general',
      complexity: 'medium',
      estimatedTime: '10 minutes',
      requirements: ['All app credentials', 'API keys', 'Secret tokens'],
      instructions: [
        'Collect App IDs and Secrets from each platform',
        'Enter credentials in the API Credentials tab',
        'Test OAuth connections',
        'Verify permissions are working',
        'Complete integration testing'
      ],
      completed: false
    }
  ];

  const [steps, setSteps] = useState(setupSteps);

  const generateAIGuidance = async () => {
    if (!businessInfo.businessName || !businessInfo.businessType) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name and type first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingGuidance(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: `Generate personalized social media setup guidance for:
            Business: ${businessInfo.businessName}
            Type: ${businessInfo.businessType}
            Country: ${businessInfo.country}
            Target Audience: ${businessInfo.targetAudience}
            
            Provide specific, actionable advice for:
            1. Facebook Business Manager setup considerations
            2. Instagram business account optimization
            3. LinkedIn company page strategy
            4. Platform-specific compliance requirements for ${businessInfo.country}
            5. Content strategy recommendations
            6. Common pitfalls to avoid
            
            Keep it concise but comprehensive, focusing on ${businessInfo.businessType} businesses.`,
          tone: 'professional',
          type: 'business_guidance'
        }
      });

      if (error) throw error;
      setAiGuidance(data.content);
    } catch (error) {
      console.error('Error generating guidance:', error);
      toast({
        title: "AI Guidance Error",
        description: "Failed to generate personalized guidance",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingGuidance(false);
    }
  };

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const getCompletionProgress = () => {
    const completed = steps.filter(step => step.completed).length;
    return (completed / steps.length) * 100;
  };

  const getCurrentStepData = () => steps[currentStep];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Building className="h-5 w-5 text-blue-600" />;
      case 'instagram': return <Camera className="h-5 w-5 text-pink-600" />;
      case 'linkedin': return <Users className="h-5 w-5 text-blue-700" />;
      case 'twitter': return <Settings className="h-5 w-5 text-gray-900" />;
      default: return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Social Media Business Setup Wizard</h1>
        <p className="text-muted-foreground">
          AI-guided setup for professional social media business accounts
        </p>
        <Progress value={getCompletionProgress()} className="w-full" />
        <p className="text-sm text-muted-foreground">
          {steps.filter(s => s.completed).length} of {steps.length} steps completed
        </p>
      </div>

      <Tabs defaultValue="wizard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wizard">Setup Wizard</TabsTrigger>
          <TabsTrigger value="overview">All Steps</TabsTrigger>
          <TabsTrigger value="guidance">AI Guidance</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard">
          {currentStep === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Tell us about your business so we can provide personalized setup guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={businessInfo.businessName}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Enter your business name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Input
                      id="businessType"
                      value={businessInfo.businessType}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessType: e.target.value }))}
                      placeholder="e.g., Restaurant, Retail, Consulting"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={businessInfo.websiteUrl}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={businessInfo.country}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    value={businessInfo.businessDescription}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessDescription: e.target.value }))}
                    placeholder="Briefly describe what your business does"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    value={businessInfo.targetAudience}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Describe your ideal customers"
                    rows={2}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={() => {
                      completeStep('business-info');
                      setCurrentStep(1);
                    }}
                    disabled={!businessInfo.businessName || !businessInfo.businessType}
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(getCurrentStepData().platform)}
                    <div>
                      <CardTitle>{getCurrentStepData().title}</CardTitle>
                      <CardDescription>{getCurrentStepData().description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getComplexityColor(getCurrentStepData().complexity)}>
                      {getCurrentStepData().complexity}
                    </Badge>
                    <Badge variant="outline">
                      {getCurrentStepData().estimatedTime}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Requirements
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {getCurrentStepData().requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Step-by-Step Instructions
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {getCurrentStepData().instructions.map((instruction, index) => (
                      <li key={index} className="leading-relaxed">{instruction}</li>
                    ))}
                  </ol>
                </div>

                {getCurrentStepData().platform === 'facebook' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Facebook app review can take 3-7 business days. 
                      Plan accordingly and ensure your use case clearly explains content publishing needs.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => completeStep(getCurrentStepData().id)}
                    >
                      Mark as Complete
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                      disabled={currentStep === steps.length - 1}
                    >
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <Card key={step.id} className={step.completed ? 'bg-green-50 border-green-200' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(step.platform)}
                      <div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                      <Badge className={getComplexityColor(step.complexity)}>
                        {step.complexity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Estimated time: {step.estimatedTime}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep(index)}
                    >
                      {step.completed ? 'Review' : 'Start Step'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guidance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI-Powered Business Guidance
              </CardTitle>
              <CardDescription>
                Get personalized recommendations based on your business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateAIGuidance}
                disabled={isGeneratingGuidance || !businessInfo.businessName}
                className="w-full"
              >
                {isGeneratingGuidance ? (
                  'Generating Personalized Guidance...'
                ) : (
                  'Generate AI Guidance'
                )}
              </Button>

              {aiGuidance && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-900">
                    Personalized Recommendations for {businessInfo.businessName}
                  </h4>
                  <div className="whitespace-pre-wrap text-sm text-blue-800">
                    {aiGuidance}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};