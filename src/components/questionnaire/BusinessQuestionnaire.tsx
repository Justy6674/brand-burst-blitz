import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle, Building2, Target, MessageSquare, DollarSign, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

// Comprehensive form schema for business questionnaire
const businessQuestionnaireSchema = z.object({
  // Step 1: Business Basics
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  website_url: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  industry: z.enum(['health', 'finance', 'legal', 'general', 'fitness', 'beauty', 'tech'], {
    required_error: 'Please select your industry',
  }),
  business_size: z.enum(['solo', 'small', 'medium', 'large'], {
    required_error: 'Please select your business size',
  }),
  business_stage: z.enum(['startup', 'growth', 'established', 'enterprise'], {
    required_error: 'Please select your business stage',
  }),
  
  // Step 2: Target Audience & Goals
  target_audience_demographics: z.string().min(10, 'Please provide more detail about your target audience'),
  target_audience_psychographics: z.string().min(10, 'Please describe your audience\'s interests and behaviors'),
  primary_goals: z.array(z.string()).min(1, 'Please select at least one primary goal'),
  secondary_goals: z.array(z.string()).optional(),
  success_metrics: z.array(z.string()).min(1, 'Please select at least one success metric'),
  
  // Step 3: Brand Voice & Content Preferences
  brand_voice: z.enum(['professional', 'friendly', 'casual', 'authoritative', 'empathetic', 'exciting'], {
    required_error: 'Please select your preferred brand voice',
  }),
  brand_personality: z.array(z.string()).min(1, 'Please select at least one brand personality trait'),
  content_topics: z.array(z.string()).min(1, 'Please select at least one content topic'),
  content_formats: z.array(z.string()).min(1, 'Please select at least one content format'),
  posting_frequency: z.enum(['daily', 'few-times-week', 'weekly', 'bi-weekly', 'monthly'], {
    required_error: 'Please select your desired posting frequency',
  }),
  
  // Step 4: Platforms & Budget
  target_platforms: z.array(z.string()).min(1, 'Please select at least one platform'),
  platform_priorities: z.object({
    facebook: z.enum(['high', 'medium', 'low', 'none']).optional(),
    instagram: z.enum(['high', 'medium', 'low', 'none']).optional(),
    linkedin: z.enum(['high', 'medium', 'low', 'none']).optional(),
    twitter: z.enum(['high', 'medium', 'low', 'none']).optional(),
  }),
  monthly_budget: z.enum(['under-500', '500-1000', '1000-2500', '2500-5000', 'over-5000'], {
    required_error: 'Please select your monthly budget range',
  }),
  content_creation_time: z.enum(['under-5', '5-10', '10-20', '20-40', 'over-40'], {
    required_error: 'Please select how much time you can dedicate to content creation',
  }),
  
  // Step 5: Competition & Strategy
  main_competitors: z.string().min(5, 'Please list at least a few main competitors'),
  competitive_advantages: z.string().min(10, 'Please describe what sets you apart'),
  content_challenges: z.array(z.string()).min(1, 'Please select at least one content challenge'),
  automation_preferences: z.array(z.string()).min(1, 'Please select your automation preferences'),
});

type BusinessQuestionnaireForm = z.infer<typeof businessQuestionnaireSchema>;

interface QuestionnaireStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: (keyof BusinessQuestionnaireForm)[];
}

const steps: QuestionnaireStep[] = [
  {
    id: 1,
    title: 'Business Basics',
    description: 'Tell us about your business foundation',
    icon: <Building2 className="h-5 w-5" />,
    fields: ['business_name', 'website_url', 'industry', 'business_size', 'business_stage'],
  },
  {
    id: 2,
    title: 'Target Audience & Goals',
    description: 'Define your audience and objectives',
    icon: <Target className="h-5 w-5" />,
    fields: ['target_audience_demographics', 'target_audience_psychographics', 'primary_goals', 'secondary_goals', 'success_metrics'],
  },
  {
    id: 3,
    title: 'Brand Voice & Content',
    description: 'Shape your brand personality and content strategy',
    icon: <MessageSquare className="h-5 w-5" />,
    fields: ['brand_voice', 'brand_personality', 'content_topics', 'content_formats', 'posting_frequency'],
  },
  {
    id: 4,
    title: 'Platforms & Budget',
    description: 'Choose your platforms and set your investment level',
    icon: <DollarSign className="h-5 w-5" />,
    fields: ['target_platforms', 'platform_priorities', 'monthly_budget', 'content_creation_time'],
  },
  {
    id: 5,
    title: 'Competition & Strategy',
    description: 'Analyze your competitive landscape and define your edge',
    icon: <TrendingUp className="h-5 w-5" />,
    fields: ['main_competitors', 'competitive_advantages', 'content_challenges', 'automation_preferences'],
  },
];

const BusinessQuestionnaire: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<BusinessQuestionnaireForm>({
    resolver: zodResolver(businessQuestionnaireSchema),
    mode: 'onChange',
    defaultValues: {
      target_platforms: [],
      primary_goals: [],
      secondary_goals: [],
      success_metrics: [],
      brand_personality: [],
      content_topics: [],
      content_formats: [],
      content_challenges: [],
      automation_preferences: [],
      platform_priorities: {},
    },
  });

  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps.find(step => step.id === currentStep);

  // Check if current step is valid
  const isCurrentStepValid = async () => {
    const fieldsToValidate = currentStepData?.fields || [];
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await isCurrentStepValid();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: BusinessQuestionnaireForm) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform form data to match database schema
      const businessProfileData = {
        user_id: user.id,
        business_name: data.business_name,
        website_url: data.website_url || null,
        industry: data.industry,
        is_primary: true,
        default_ai_tone: data.brand_voice,
        brand_colors: JSON.stringify({
          primary: '#8B5CF6',
          secondary: '#06B6D4',
          accent: '#10B981',
        }),
        compliance_settings: JSON.stringify({
          industry_regulations: true,
          content_guidelines: true,
          approval_workflow: data.business_size !== 'solo',
        }),
      };

      // Create or update business profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing profile:', fetchError);
      }

      let profileResult;
      if (existingProfile) {
        // Update existing profile
        profileResult = await supabase
          .from('business_profiles')
          .update(businessProfileData)
          .eq('id', existingProfile.id)
          .select()
          .single();
      } else {
        // Create new profile
        profileResult = await supabase
          .from('business_profiles')
          .insert(businessProfileData)
          .select()
          .single();
      }

      if (profileResult.error) {
        throw new Error(profileResult.error.message);
      }

      // Call the enhanced business insights generation function
      const { data: insightsResponse, error: insightsError } = await supabase.functions.invoke(
        'generate-business-insights',
        {
          body: {
            questionnaireResponses: data,
            businessProfileId: profileResult.data.id,
          },
        }
      );

      if (insightsError) {
        console.error('Error generating insights:', insightsError);
        // Don't fail the entire process if insights generation fails
      }

      toast({
        title: 'Business questionnaire completed!',
        description: insightsResponse?.success 
          ? 'Your business profile and strategic insights have been generated.' 
          : 'Your business profile has been created. You can now start generating strategic content.',
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: 'Error saving questionnaire',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Business Intelligence Questionnaire
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's create your strategic content intelligence profile
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {currentStepData?.icon}
              <span className="font-medium">
                Step {currentStep} of {steps.length}: {currentStepData?.title}
              </span>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {currentStepData?.description}
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="glass-strong">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {currentStepData?.icon}
                  <span>{currentStepData?.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Business Basics */}
                {currentStep === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourwebsite.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional: We'll analyze your website for content insights
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tech">Technology</SelectItem>
                              <SelectItem value="health">Healthcare</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="fitness">Fitness</SelectItem>
                              <SelectItem value="beauty">Beauty</SelectItem>
                              <SelectItem value="general">General Business</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="business_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Size *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 gap-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="solo" id="solo" />
                                  <Label htmlFor="solo">Solo (Just me)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="small" id="small" />
                                  <Label htmlFor="small">Small (2-10 employees)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="medium" id="medium" />
                                  <Label htmlFor="medium">Medium (11-50 employees)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="large" id="large" />
                                  <Label htmlFor="large">Large (50+ employees)</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="business_stage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Stage *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 gap-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="startup" id="startup" />
                                  <Label htmlFor="startup">Startup (0-2 years)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="growth" id="growth" />
                                  <Label htmlFor="growth">Growth (2-5 years)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="established" id="established" />
                                  <Label htmlFor="established">Established (5+ years)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="enterprise" id="enterprise" />
                                  <Label htmlFor="enterprise">Enterprise (Mature business)</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Step 2: Target Audience & Goals */}
                {currentStep === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="target_audience_demographics"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience Demographics *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your target audience's age, location, income, education, job roles, etc."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Be specific: Age ranges, geographic location, income levels, education, job titles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_audience_psychographics"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience Interests & Behaviors *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What are their interests, values, lifestyle, pain points, and online behaviors?"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Their interests, values, lifestyle choices, pain points, shopping habits, social media usage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primary_goals"
                      render={() => (
                        <FormItem>
                          <FormLabel>Primary Business Goals *</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'increase-brand-awareness',
                              'generate-leads',
                              'drive-sales',
                              'build-community',
                              'establish-thought-leadership',
                              'customer-retention',
                              'website-traffic',
                              'social-media-growth',
                            ].map((goal) => (
                              <FormField
                                key={goal}
                                control={form.control}
                                name="primary_goals"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={goal}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(goal)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, goal])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== goal
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">
                                        {goal.replace('-', ' ')}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="success_metrics"
                      render={() => (
                        <FormItem>
                          <FormLabel>Key Success Metrics *</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'website-visitors',
                              'social-media-followers',
                              'engagement-rate',
                              'lead-generation',
                              'conversion-rate',
                              'email-subscribers',
                              'brand-mentions',
                              'revenue-growth',
                            ].map((metric) => (
                              <FormField
                                key={metric}
                                control={form.control}
                                name="success_metrics"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={metric}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(metric)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, metric])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== metric
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">
                                        {metric.replace('-', ' ')}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Step 3: Brand Voice & Content */}
                {currentStep === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="brand_voice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Voice *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your brand voice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professional">Professional & Corporate</SelectItem>
                              <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                              <SelectItem value="casual">Casual & Conversational</SelectItem>
                              <SelectItem value="authoritative">Authoritative & Expert</SelectItem>
                              <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
                              <SelectItem value="exciting">Exciting & Energetic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand_personality"
                      render={() => (
                        <FormItem>
                          <FormLabel>Brand Personality Traits *</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              'innovative',
                              'trustworthy',
                              'creative',
                              'reliable',
                              'cutting-edge',
                              'traditional',
                              'playful',
                              'serious',
                              'inclusive',
                              'premium',
                              'accessible',
                              'bold',
                            ].map((trait) => (
                              <FormField
                                key={trait}
                                control={form.control}
                                name="brand_personality"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={trait}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(trait)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, trait])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== trait
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">
                                        {trait}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content_topics"
                      render={() => (
                        <FormItem>
                          <FormLabel>Content Topics *</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'industry-news',
                              'how-to-guides',
                              'behind-the-scenes',
                              'customer-stories',
                              'product-updates',
                              'thought-leadership',
                              'company-culture',
                              'educational-content',
                              'trending-topics',
                              'user-generated-content',
                            ].map((topic) => (
                              <FormField
                                key={topic}
                                control={form.control}
                                name="content_topics"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={topic}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(topic)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, topic])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== topic
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">
                                        {topic.replace('-', ' ')}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="posting_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Posting Frequency *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 gap-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="daily" id="daily" />
                                <Label htmlFor="daily">Daily</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="few-times-week" id="few-times-week" />
                                <Label htmlFor="few-times-week">A few times per week</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="weekly" id="weekly" />
                                <Label htmlFor="weekly">Weekly</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="bi-weekly" id="bi-weekly" />
                                <Label htmlFor="bi-weekly">Bi-weekly</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <Label htmlFor="monthly">Monthly</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Step 4: Platforms & Budget */}
                {currentStep === 4 && (
                  <>
                    <FormField
                      control={form.control}
                      name="target_platforms"
                      render={() => (
                        <FormItem>
                          <FormLabel>Target Platforms *</FormLabel>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              'facebook',
                              'instagram', 
                              'linkedin',
                              'twitter',
                              'youtube',
                              'tiktok',
                              'pinterest',
                              'blog',
                            ].map((platform) => (
                              <FormField
                                key={platform}
                                control={form.control}
                                name="target_platforms"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={platform}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(platform)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, platform])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== platform
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">
                                        {platform}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="monthly_budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Content Budget *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 gap-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="under-500" id="under-500" />
                                  <Label htmlFor="under-500">Under $500</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="500-1000" id="500-1000" />
                                  <Label htmlFor="500-1000">$500 - $1,000</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="1000-2500" id="1000-2500" />
                                  <Label htmlFor="1000-2500">$1,000 - $2,500</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="2500-5000" id="2500-5000" />
                                  <Label htmlFor="2500-5000">$2,500 - $5,000</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="over-5000" id="over-5000" />
                                  <Label htmlFor="over-5000">Over $5,000</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content_creation_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weekly Content Creation Time *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 gap-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="under-5" id="under-5" />
                                  <Label htmlFor="under-5">Under 5 hours</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="5-10" id="5-10" />
                                  <Label htmlFor="5-10">5-10 hours</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="10-20" id="10-20" />
                                  <Label htmlFor="10-20">10-20 hours</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="20-40" id="20-40" />
                                  <Label htmlFor="20-40">20-40 hours</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="over-40" id="over-40" />
                                  <Label htmlFor="over-40">Over 40 hours</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Step 5: Competition & Strategy */}
                {currentStep === 5 && (
                  <>
                    <FormField
                      control={form.control}
                      name="main_competitors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Competitors *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List your main competitors and their websites or social media handles"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            List competitor names, websites, or social media handles. We'll analyze their content strategy.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="competitive_advantages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What Sets You Apart? *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your unique value proposition and competitive advantages"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your unique selling points, special expertise, or advantages over competitors
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content_challenges"
                      render={() => (
                        <FormItem>
                          <FormLabel>Current Content Challenges *</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'lack-of-time',
                              'creative-block',
                              'consistency',
                              'engagement',
                              'technical-skills',
                              'measuring-roi',
                              'content-planning',
                              'platform-management',
                            ].map((challenge) => (
                              <FormField
                                key={challenge}
                                control={form.control}
                                name="content_challenges"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={challenge}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(challenge)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, challenge])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== challenge
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">
                                        {challenge.replace('-', ' ')}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="automation_preferences"
                      render={() => (
                        <FormItem>
                          <FormLabel>Automation Preferences *</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'content-generation',
                              'posting-schedule',
                              'hashtag-research',
                              'competitor-monitoring',
                              'performance-tracking',
                              'content-repurposing',
                              'trend-identification',
                              'audience-insights',
                            ].map((automation) => (
                              <FormField
                                key={automation}
                                control={form.control}
                                name="automation_preferences"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={automation}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(automation)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, automation])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== automation
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">
                                        {automation.replace('-', ' ')}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </div>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 bg-gradient-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete Questionnaire</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BusinessQuestionnaire;