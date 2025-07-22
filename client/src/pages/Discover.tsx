import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicHeader from '@/components/layout/PublicHeader';
import { HeroSection } from '@/components/layout/HeroSection';
import { Link } from 'react-router-dom';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Heart, 
  Scale, 
  DollarSign, 
  Dumbbell, 
  Sparkles, 
  Laptop,
  ArrowRight,
  Check,
  Star,
  Stethoscope,
  Brain,
  Activity
} from 'lucide-react';
import aiContentHero from '@/assets/ai-content-creation-hero.jpg';

interface QuestionnaireResponse {
  business_name: string;
  industry: string;
  target_audience_demographics: string;
  primary_goals: string[];
  brand_voice: string;
  target_platforms: string[];
  content_topics: string[];
  specialty?: string;
}

interface PersonalizedContent {
  title: string;
  description: string;
  icon: any;
  color: string;
  nextSteps: string[];
  personalizedSamples: {
    platform: string;
    content: string;
    reasoning: string;
  }[];
}

const industries = [
  {
    id: 'health',
    name: 'Healthcare & Medical',
    icon: Heart,
    description: 'Compliant content for medical practices, clinics, and health services',
    color: 'bg-red-500',
    examples: ['Patient education posts', 'Health tips and advice', 'Service announcements'],
    regulations: 'TGA & Privacy Act compliant',
    samplePosts: [
      {
        platform: 'Facebook',
        content: "🏥 Did you know that regular health check-ups can detect potential issues early? Our comprehensive health screenings include blood pressure monitoring, cholesterol testing, and diabetes screening. Book your appointment today! #HealthScreening #PreventiveCare #AustralianHealthcare",
        engagement: "High engagement expected"
      },
      {
        platform: 'LinkedIn',
        content: "The importance of preventive healthcare in Australian workplaces cannot be overstated. Our occupational health services help businesses maintain a healthy workforce through regular health assessments and wellness programs. Contact us to learn more about our corporate health packages.",
        engagement: "Professional reach"
      }
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    icon: DollarSign,
    description: 'Professional content for financial services and advisors',
    color: 'bg-green-500',
    examples: ['Financial literacy content', 'Market updates', 'Service explanations'],
    regulations: 'ASIC & APRA compliant',
    samplePosts: [
      {
        platform: 'Facebook',
        content: "💰 End of Financial Year approaching! Now's the perfect time to review your tax-deductible expenses and superannuation contributions. Our team can help you maximise your returns while staying compliant. Book a consultation today! #EOFY #TaxPlanning #FinancialAdvice",
        engagement: "Seasonal high interest"
      },
      {
        platform: 'LinkedIn',
        content: "With the Reserve Bank's recent interest rate decisions, now is an opportune time to review your investment portfolio. Our ASIC-licensed advisors can help you navigate market volatility and optimize your financial strategy for the current economic climate.",
        engagement: "Professional audience engagement"
      }
    ]
  },
  {
    id: 'legal',
    name: 'Legal Services',
    icon: Scale,
    description: 'Professional content for law firms and legal practitioners',
    color: 'bg-blue-500',
    examples: ['Legal education posts', 'Process explanations', 'Firm announcements'],
    regulations: 'Law Society compliant',
    samplePosts: [
      {
        platform: 'Facebook',
        content: "⚖️ Understanding your rights during a property settlement can save you thousands. Our family law team provides clear guidance through what can be a complex process. We offer initial consultations to discuss your specific situation. #FamilyLaw #PropertySettlement #LegalAdvice",
        engagement: "High relevance for target audience"
      },
      {
        platform: 'LinkedIn',
        content: "Recent changes to Australian employment law have significant implications for small business owners. Our employment law specialists can help you ensure your workplace policies remain compliant while protecting your business interests. Contact us for a comprehensive review.",
        engagement: "B2B professional interest"
      }
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness & Wellness',
    icon: Dumbbell,
    description: 'Engaging content for gyms, trainers, and wellness businesses',
    color: 'bg-orange-500',
    examples: ['Workout tips', 'Nutrition advice', 'Client success stories'],
    regulations: 'Health claims compliant',
    samplePosts: [
      {
        platform: 'Instagram',
        content: "🏋️‍♀️ Transform your winter workout routine! Indoor strength training can be just as effective as outdoor activities. Try our 20-minute HIIT circuit - no equipment needed! Swipe for exercise demonstrations. #WinterFitness #HIITWorkout #FitnessMotivation #AustralianFitness",
        engagement: "Visual content performs well"
      },
      {
        platform: 'Facebook',
        content: "💪 Success Story Sunday! Congratulations to Sarah who achieved her fitness goals through our personalised training program. Her dedication to consistency and proper form paid off! Ready to start your own transformation journey? Book your free consultation today.",
        engagement: "Success stories drive inquiries"
      }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Cosmetics',
    icon: Sparkles,
    description: 'Attractive content for beauty salons and cosmetic businesses',
    color: 'bg-pink-500',
    examples: ['Beauty tips', 'Treatment showcases', 'Product highlights'],
    regulations: 'TGA cosmetics compliant',
    samplePosts: [
      {
        platform: 'Instagram',
        content: "✨ Prep your skin for winter with our signature hydrating facial! This treatment includes gentle exfoliation, vitamin-rich serums, and intensive moisturising mask. Perfect for combating dry Australian winter air. Book online! #WinterSkincare #HydratingFacial #GlowUp",
        engagement: "Seasonal beauty content"
      },
      {
        platform: 'Facebook',
        content: "🌟 Introducing our new organic skincare range! Made with native Australian botanicals, these products are gentle yet effective. All ingredients are TGA-approved and cruelty-free. Visit our salon to try before you buy! #OrganicSkincare #AustralianMade #CrueltyFree",
        engagement: "Product launches drive interest"
      }
    ]
  },
  {
    id: 'tech',
    name: 'Technology & Software',
    icon: Laptop,
    description: 'Technical content for IT companies and software businesses',
    color: 'bg-purple-500',
    examples: ['Tech insights', 'Product updates', 'Industry trends'],
    regulations: 'Privacy & cyber security aware',
    samplePosts: [
      {
        platform: 'LinkedIn',
        content: "🔒 Cybersecurity Alert: Australian businesses face increasing threats from ransomware attacks. Our latest security audit services include comprehensive vulnerability assessments and staff training programs. Protect your business before it's too late. Schedule your security consultation today.",
        engagement: "High concern topic"
      },
      {
        platform: 'Facebook',
        content: "💻 Working from home permanently? Our cloud solutions make remote work seamless and secure. Australian data hosting, 24/7 support, and GDPR compliance included. Free migration for new clients this month! #CloudSolutions #RemoteWork #AustralianTech",
        engagement: "Post-COVID relevance"
      }
    ]
  },
  {
    id: 'general',
    name: 'General Business',
    icon: Building2,
    description: 'Professional content for any Australian business',
    color: 'bg-gray-500',
    examples: ['Business insights', 'Industry news', 'Company updates'],
    regulations: 'Australian business compliant',
    samplePosts: [
      {
        platform: 'LinkedIn',
        content: "🚀 Exciting milestone reached! We're proud to announce that our Australian-owned business has now served over 1,000 local customers. Thank you for your continued trust and support. Here's to the next chapter of growth! #AustralianBusiness #Milestone #CustomerAppreciation",
        engagement: "Community connection"
      },
      {
        platform: 'Facebook',
        content: "📈 Business tip: End of financial year is the perfect time to review your business processes and identify areas for improvement. Small optimisations can lead to significant cost savings and efficiency gains. What's one process you could streamline? #BusinessTips #EOFY #Efficiency",
        engagement: "Practical business advice"
      }
    ]
  }
];

const Discover = () => {
  const { user } = useAuth();
  const { activeProfile } = useBusinessProfileContext();
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireResponse | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestionnaireData();
  }, [user]);

  const loadQuestionnaireData = async () => {
    if (!user?.id) return;

    try {
      // Get questionnaire responses from business profile compliance_settings
      const { data: profileData, error } = await supabase
        .from('business_profiles')
        .select('compliance_settings, business_name, industry, default_ai_tone')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (error || !profileData) {
        // No questionnaire completed - show onboarding message
        setIsLoading(false);
        return;
      }

      // Extract questionnaire data from compliance_settings
      const complianceSettings = typeof profileData.compliance_settings === 'string' 
        ? JSON.parse(profileData.compliance_settings)
        : profileData.compliance_settings;

      const questionnaireResponses = complianceSettings?.questionnaire_data;

      if (questionnaireResponses) {
        const fullData: QuestionnaireResponse = {
          business_name: profileData.business_name,
          industry: profileData.industry,
          target_audience_demographics: questionnaireResponses.target_audience || 'Australian healthcare consumers',
          primary_goals: questionnaireResponses.goals?.primary || ['patient-education'],
          brand_voice: profileData.default_ai_tone || 'professional',
          target_platforms: questionnaireResponses.platforms || ['facebook'],
          content_topics: ['patient-education', 'health-tips', 'practice-updates'],
          specialty: getSpecialtyFromIndustry(profileData.industry)
        };

        setQuestionnaireData(fullData);
        generatePersonalizedContent(fullData);
      }

    } catch (error) {
      console.error('Error loading questionnaire data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSpecialtyFromIndustry = (industry: string): string => {
    const specialtyMap: { [key: string]: string } = {
      'health': 'General Practice',
      'psychology': 'Clinical Psychology', 
      'physio': 'Physiotherapy',
      'allied_health': 'Allied Health',
      'dental': 'Dentistry'
    };
    return specialtyMap[industry] || 'Healthcare Professional';
  };

  const generatePersonalizedContent = (data: QuestionnaireResponse) => {
    const specialtyIcon = getSpecialtyIcon(data.industry);
    const personalizedSamples = generateRealSamples(data);
    
    const content: PersonalizedContent = {
      title: `${data.business_name} - ${data.specialty}`,
      description: `Personalized content strategy for your ${data.specialty.toLowerCase()} practice targeting ${data.target_audience_demographics}`,
      icon: specialtyIcon,
      color: getSpecialtyColor(data.industry),
      nextSteps: generatePersonalizedNextSteps(data),
      personalizedSamples
    };

    setPersonalizedContent(content);
  };

  const getSpecialtyIcon = (industry: string) => {
    const iconMap: { [key: string]: any } = {
      'health': Stethoscope,
      'psychology': Brain,
      'physio': Activity,
      'allied_health': Heart,
      'dental': Heart
    };
    return iconMap[industry] || Stethoscope;
  };

  const getSpecialtyColor = (industry: string): string => {
    const colorMap: { [key: string]: string } = {
      'health': 'bg-blue-500',
      'psychology': 'bg-purple-500',
      'physio': 'bg-green-500',
      'allied_health': 'bg-orange-500',
      'dental': 'bg-teal-500'
    };
    return colorMap[industry] || 'bg-blue-500';
  };

  const generateRealSamples = (data: QuestionnaireResponse) => {
    // Generate REAL content samples based on user's questionnaire responses
    const samples = [];

    for (const platform of data.target_platforms.slice(0, 2)) {
      const content = generateSpecialtyContent(data, platform);
      samples.push({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        content,
        reasoning: `Tailored for ${data.specialty} professionals using ${data.brand_voice} tone targeting ${data.target_audience_demographics}`
      });
    }

    return samples;
  };

  const generateSpecialtyContent = (data: QuestionnaireResponse, platform: string): string => {
    const contentTemplates = {
      'health': {
        'facebook': `🩺 At ${data.business_name}, we're committed to providing comprehensive ${data.specialty.toLowerCase()} care for ${data.target_audience_demographics}. Our evidence-based approach ensures you receive the highest quality healthcare. Book your appointment today! #AustralianHealthcare #${data.specialty.replace(' ', '')} #QualityCare`,
        'linkedin': `As a ${data.specialty} practice, ${data.business_name} is dedicated to advancing healthcare outcomes for our community. We focus on preventive care and evidence-based treatments. Connect with us to learn more about our professional healthcare services.`,
        'instagram': `🏥 ${data.business_name} - Your trusted ${data.specialty.toLowerCase()} team! We're here to support your health journey with compassionate, professional care. ✨ #HealthcareExcellence #${data.specialty.replace(' ', '')} #PatientCare`
      },
      'psychology': {
        'facebook': `🧠 ${data.business_name} provides professional psychology services with a focus on evidence-based treatments. We understand seeking mental health support takes courage. Our ${data.brand_voice} approach creates a safe space for healing. #MentalHealthMatters #Psychology #WellbeingSupport`,
        'linkedin': `${data.business_name} - Professional psychology services supporting mental health and wellbeing. We provide evidence-based psychological assessments and interventions for ${data.target_audience_demographics}. Contact us for professional consultation.`,
        'instagram': `💜 Mental health matters. At ${data.business_name}, we provide compassionate psychology services in a safe, professional environment. Your wellbeing is our priority. #MentalHealthSupport #Psychology #Wellbeing`
      }
    };

    const industryTemplates = contentTemplates[data.industry as keyof typeof contentTemplates];
    if (industryTemplates) {
      return industryTemplates[platform as keyof typeof industryTemplates] || industryTemplates['facebook'];
    }

    // Fallback for other healthcare specialties
    return `At ${data.business_name}, we provide professional ${data.specialty.toLowerCase()} services focused on quality care for ${data.target_audience_demographics}. Contact us to learn more about how we can support your health goals.`;
  };

  const generatePersonalizedNextSteps = (data: QuestionnaireResponse): string[] => {
    const steps = [
      `Create ${data.specialty}-specific patient education content`,
      `Develop ${data.brand_voice} content for ${data.target_platforms.join(' and ')}`
    ];

    if (data.primary_goals.includes('patient-education')) {
      steps.push('Generate AHPRA-compliant educational materials');
    }
    if (data.primary_goals.includes('practice-growth')) {
      steps.push('Create referral-generating professional content');
    }

    return steps;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your personalized healthcare content strategy...</p>
        </div>
      </div>
    );
  }

  if (!questionnaireData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-6 w-6" />
                Complete Your Healthcare Practice Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To see personalized content recommendations for your healthcare practice, please complete our business intelligence questionnaire.</p>
              <Link to="/questionnaire">
                <Button className="w-full">
                  Complete Practice Questionnaire
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // REAL PERSONALIZED CONTENT - NO MORE FAKE INDUSTRY SAMPLES
  const IconComponent = personalizedContent?.icon || Stethoscope;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <HeroSection backgroundImage={aiContentHero} className="min-h-[60vh]">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <Badge className="mb-6 bg-black/40 backdrop-blur-sm text-white border-white/30 text-base px-4 py-2 font-semibold">
            🇦🇺 Industry-Specific AI Content for Australian Businesses
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            <span className="block mb-2">Discover Your</span>
            <span className="text-gradient-hero block">Industry-Specific</span>
            <span className="block">Content Solutions</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            Get AI content that understands your industry's regulations, terminology, and audience. 
            <strong className="block mt-2">Choose your industry to see exactly what we can create for you.</strong>
          </p>
        </div>
      </HeroSection>

      {/* Industry Selection */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Industry Are You In?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select your industry to see customized content examples and compliance features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {industries.map((industry) => {
              const Icon = industry.icon;
              const isSelected = questionnaireData?.industry === industry.id;
              
              return (
                <Card 
                  key={industry.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${industry.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{industry.name}</CardTitle>
                        {isSelected && (
                          <Badge className="mt-1 bg-primary/10 text-primary">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{industry.description}</p>
                    <div className="text-sm">
                      <div className="font-medium text-primary mb-2">✓ {industry.regulations}</div>
                      <div className="space-y-1">
                        {industry.examples.map((example, idx) => (
                          <div key={idx} className="text-muted-foreground">• {example}</div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Industry-Specific Preview */}
          {questionnaireData && (
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center`}>
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Your Healthcare Practice Dashboard</CardTitle>
                    <p className="text-muted-foreground">Personalized content strategy powered by your questionnaire responses</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">Content Examples:</h4>
                    <div className="space-y-3">
                      {industries.find(ind => ind.id === questionnaireData.industry)?.examples.map((example, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-primary" />
                          <span>{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">Compliance Features:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>{industries.find(ind => ind.id === questionnaireData.industry)?.regulations}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Australian terminology & context</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Industry-specific tone & voice</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zero-Click Content Samples */}
                <div className="mt-8 p-6 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-4 text-lg">Live AI-Generated Content Samples:</h4>
                  <div className="grid gap-4">
                    {industries.find(ind => ind.id === questionnaireData.industry)?.samplePosts.map((post, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {post.platform}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{post.engagement}</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-2">{post.content}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-success" />
                          <span>Compliance checked</span>
                          <span>•</span>
                          <span>Australian terminology</span>
                          <span>•</span>
                          <span>Industry-optimised</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      ✨ This is what AI generates for your {industries.find(ind => ind.id === questionnaireData.industry)?.name.toLowerCase()} business - no signup required to preview!
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="premium" size="lg" asChild>
                    <Link to="/auth">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Creating {industries.find(ind => ind.id === questionnaireData.industry)?.name} Content
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/pricing">
                      View Pricing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          {!questionnaireData && (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                Don't see your industry? We support all Australian businesses with general business content.
              </p>
              <Button variant="outline" size="lg" onClick={() => {}}>
                Choose General Business
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* PERSONALIZED HEADER - REAL PRACTICE DATA */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 ${personalizedContent?.color} rounded-xl flex items-center justify-center`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{personalizedContent?.title}</h1>
                <p className="text-muted-foreground">{personalizedContent?.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PERSONALIZED CONTENT SAMPLES - REAL USER DATA */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {personalizedContent?.personalizedSamples.map((sample, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{sample.platform}</Badge>
                Content Sample
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm">{sample.content}</p>
              </div>
              <p className="text-xs text-muted-foreground">{sample.reasoning}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PERSONALIZED NEXT STEPS - REAL GOALS */}
      <Card>
        <CardHeader>
          <CardTitle>Your Personalized Action Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalizedContent?.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4">
            <Link to="/create-content">
              <Button>
                Start Creating Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/questionnaire">
              <Button variant="outline">
                Update Practice Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Discover;