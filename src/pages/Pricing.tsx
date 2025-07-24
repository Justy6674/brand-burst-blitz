import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PublicHeader from "@/components/layout/PublicHeader";
import { paddleService, HEALTHCARE_PLANS } from "@/lib/paddle-service";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Check,
  Star,
  ArrowRight,
  DollarSign,
  Users,
  Building,
  Crown,
  Zap,
  Target,
  Shield,
  BarChart3,
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  Rocket,
  Eye,
  Stethoscope,
  Heart,
  Activity
} from "lucide-react";
import roiDataHero from "@/assets/roi-data-driven-hero.jpg";

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const { toast } = useToast();

  // Define missing feature arrays
  const groupPracticeFeatures = [
    "🏥 Multi-practitioner management",
    "📊 Centralised AHPRA compliance dashboard", 
    "👥 Team collaboration tools",
    "📈 Practice-wide analytics",
    "🔐 Secure patient data sharing",
    "📋 Bulk content creation",
    "⚡ Priority support"
  ];

  const healthcareNetworkFeatures = [
    "🏢 Enterprise-grade security",
    "🌐 Multi-location management",
    "📊 Advanced analytics & reporting",
    "🔗 API integrations",
    "👨‍💼 Dedicated account manager",
    "🎯 Custom compliance workflows",
    "⚡ 24/7 priority support",
    "📈 Custom training programs"
  ];

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const { data: userData } = await supabase.auth.getUser();
    setUser(userData.user);
    
    if (userData.user) {
      const subscription = await paddleService.getSubscription();
      setCurrentSubscription(subscription);
    }
  };

  const handleSubscribe = async (planId: string, planName: string) => {
    try {
      setLoading(planId);

      if (!user) {
        // Redirect to auth if not logged in
        toast({
          title: "Sign In Required",
          description: "Please sign in to subscribe to a plan.",
        });
        return;
      }

      const checkoutData = await paddleService.initiateCheckout(
        planId,
        user.email,
        { 
          source: 'pricing_page',
          plan_name: planName 
        }
      );

      if (checkoutData.checkout_url) {
        // Redirect to Paddle checkout
        window.location.href = checkoutData.checkout_url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: `Failed to start subscription: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src={roiDataHero}
            alt="Healthcare pricing and ROI background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-purple-900/60"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto animate-fade-in text-center">
            <Badge className="mb-6 md:mb-8 bg-black/40 backdrop-blur-sm text-white border-white/30 text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 font-semibold">
              🏥 Australian Healthcare Professional Pricing
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 md:mb-8 leading-tight text-white">
              Healthcare Professional <span className="text-yellow-400">Pricing Plans</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-2">
              AHPRA-compliant plans designed specifically for Australian healthcare professionals. All prices in AUD, GST included.
            </p>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Technology success background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-green-900/80 to-blue-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <Badge className="mb-4 md:mb-6 bg-green-500/10 text-green-600 border-green-500/20 text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Replace $16,000/month in healthcare agency costs
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>One Platform.</span> <span className="text-gradient-primary">All Healthcare Compliance.</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              AHPRA-compliant content creation, patient education, TGA compliance screening, and Australian healthcare professional support - all in one platform.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Pricing plans background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-purple-900/80 to-indigo-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Choose</span> <span className="text-gradient-primary">Your Healthcare Plan</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              Specialized pricing for Australian healthcare professionals. All plans include AHPRA compliance and patient education features.
            </p>
          </div>

          {/* Success/Error Messages */}
          {currentSubscription && (
            <Alert className="mb-8">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You currently have an active {paddleService.getPlanDetails(currentSubscription.product_id)?.name} subscription.
                <Link to="/dashboard/billing" className="ml-2 underline">Manage your subscription →</Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 items-stretch">
            {Object.values(HEALTHCARE_PLANS).map((plan, index) => {
              const isPopular = index === 1; // Professional plan
              const isCurrentPlan = currentSubscription?.product_id === plan.id;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative border-2 h-full transition-all duration-300 hover:shadow-lg
                    ${isPopular 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-blue-600/10 scale-105' 
                      : 'border-gray-300/50 hover:border-primary/50 bg-gradient-to-br from-gray-50/10 to-gray-100/10'
                    }
                    ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}
                  `}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4 z-10">
                      <Badge className="bg-green-500 text-white">
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                      ${isPopular ? 'bg-blue-500' : 'bg-primary'}
                    `}>
                      {index === 0 && <Stethoscope className="w-8 h-8 text-white" />}
                      {index === 1 && <Heart className="w-8 h-8 text-white" />}
                      {index === 2 && <Building className="w-8 h-8 text-white" />}
                    </div>
                    
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    
                    <div className="text-4xl font-bold text-primary mt-4">
                      ${plan.price}
                      <span className="text-lg text-muted-foreground">/month</span>
                    </div>
                    
                    <Badge variant="outline" className="mt-2">
                      14-day free trial • {plan.currency}
                    </Badge>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      Australian dollars, GST included
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <Button disabled className="w-full" variant="outline">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${isPopular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                        onClick={() => handleSubscribe(plan.id, plan.name)}
                        disabled={loading === plan.id}
                      >
                        {loading === plan.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Start Free Trial
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Healthcare ROI Calculator Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="ROI calculator background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-emerald-900/80 to-cyan-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Healthcare</span> <span className="text-gradient-primary">ROI Calculator</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              See how much Australian healthcare professionals save by replacing expensive agencies and compliance consultants
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="border-red-200 bg-gradient-to-br from-red-500/10 to-red-600/10 border-2 border-red-500/30">
              <CardHeader className="text-center">
                <CardTitle className="text-red-600 text-lg md:text-xl">Traditional Healthcare Marketing Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 md:space-y-3">
                  <li className="flex justify-between text-sm md:text-base">
                    <span>Healthcare Marketing Agency</span>
                    <span className="font-bold">$5,500/month</span>
                  </li>
                  <li className="flex justify-between text-sm md:text-base">
                    <span>AHPRA Compliance Consultant</span>
                    <span className="font-bold">$3,000/month</span>
                  </li>
                  <li className="flex justify-between text-sm md:text-base">
                    <span>Patient Education Content Writer</span>
                    <span className="font-bold">$4,200/month</span>
                  </li>
                  <li className="flex justify-between text-sm md:text-base">
                    <span>Healthcare Social Media Manager</span>
                    <span className="font-bold">$2,800/month</span>
                  </li>
                  <li className="flex justify-between text-sm md:text-base">
                    <span>Healthcare Analytics Tools</span>
                    <span className="font-bold">$500/month</span>
                  </li>
                  <li className="flex justify-between border-t pt-2 font-bold text-base md:text-lg">
                    <span>Total Monthly Cost</span>
                    <span className="text-red-600">$16,000/month</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/30">
              <CardHeader className="text-center">
                <CardTitle className="text-green-600 text-lg md:text-xl">JB-Health Healthcare Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 md:space-y-3">
                  <li className="flex justify-between text-sm md:text-base">
                    <span>Group Practice Plan</span>
                    <span className="font-bold">$179/month</span>
                  </li>
                  <li className="flex justify-between text-gray-500 text-sm md:text-base">
                    <span>Healthcare Setup (one-time)</span>
                    <span>$299</span>
                  </li>
                  <li className="flex justify-between border-t pt-2 font-bold text-base md:text-lg">
                    <span>Monthly Ongoing</span>
                    <span className="text-green-600">$179/month</span>
                  </li>
                  <li className="flex justify-between border-t pt-2 font-bold text-xl md:text-2xl">
                    <span className="text-green-600">You Save</span>
                    <span className="text-green-600">$15,821/month</span>
                  </li>
                  <li className="text-center text-green-600 font-bold text-sm md:text-base">
                    That's $189,852 per year!
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professional Services Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Professional services background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-orange-900/80 to-red-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Professional</span> <span className="text-gradient-primary">Setup Services</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              One-time professional services to get you started quickly
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            
            {/* Australian Social Setup Service */}
            <Card className="relative border-2 border-orange-500/30 hover:border-orange-500/50 transition-colors bg-gradient-to-br from-orange-500/10 to-orange-600/10 h-full flex flex-col">
              <CardHeader className="text-center pb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <CardTitle className="text-xl md:text-2xl">Australian Social Setup Service</CardTitle>
                <CardDescription className="text-sm md:text-base">Complete social media account setup with Australian compliance</CardDescription>
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mt-4">
                  $199-299<span className="text-base md:text-lg text-muted-foreground">/once</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">AUD, inc. GST</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
                  {[
                    'Facebook Business Manager configuration',
                    'Instagram Business profile setup',
                    'LinkedIn Business page optimisation',
                    'Meta App setup and verification',
                    'Australian business compliance check',
                    'Full platform integration testing',
                    'Quality assurance and handoff'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 text-sm md:text-base py-2 md:py-3">
                    Get Setup Service
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Name & Domain Scout Service */}
            <Card className="relative border-2 border-red-500/30 hover:border-red-500/50 transition-colors bg-gradient-to-br from-red-500/10 to-red-600/10 h-full flex flex-col">
              <CardHeader className="text-center pb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <CardTitle className="text-xl md:text-2xl">Name & Domain Scout Service</CardTitle>
                <CardDescription className="text-sm md:text-base">Professional business name research with ASIC availability and domain analysis</CardDescription>
                <div className="text-3xl md:text-4xl font-bold text-red-600 mt-4">
                  $69-99<span className="text-base md:text-lg text-muted-foreground">/once</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">AUD, inc. GST</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
                  {[
                    'ASIC business name availability check',
                    'Domain availability across extensions',
                    'Similar business name analysis',
                    'Optional trademark screening',
                    'AI-generated business name alternatives',
                    'Professional PDF research report'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white border-0 text-sm md:text-base py-2 md:py-3">
                    Get Scout Service
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="FAQ background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-900/80 to-violet-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Frequently</span> <span className="text-gradient-primary">Asked Questions</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground px-2">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            {[
              {
                question: "Why start at $79/month?",
                answer: "Our Starter plan at $79/month gives small businesses access to professional AI content creation and basic social media management - replacing expensive agencies at a fraction of the cost."
              },
              {
                question: "What's included in the Professional plan?",
                answer: "The Professional plan at $149/month includes unlimited AI content generation, advanced analytics, competitor analysis, and full Australian compliance suite - everything growing businesses need."
              },
              {
                question: "Is GST included in the pricing?",
                answer: "Yes, all prices include GST and are displayed in Australian dollars. No hidden fees or surprise charges."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Absolutely. You can cancel your subscription at any time. No lock-in contracts, no cancellation fees."
              },
              {
                question: "What about setup and onboarding?",
                answer: "Professional setup services are available separately. Our team can configure your entire system, connect social accounts, and train your team for $199-299 one-time."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-4 md:p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/20">
                <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">{faq.question}</h3>
                <p className="text-muted-foreground text-sm md:text-base">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Success transformation background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/85 to-slate-900/90"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 mb-6 md:mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full backdrop-blur-sm">
            <Rocket className="w-4 h-4 md:w-5 md:h-5 mr-2 text-cyan-400 animate-bounce" />
            <span className="text-cyan-300 font-semibold tracking-wide text-xs md:text-sm">START YOUR TRANSFORMATION</span>
            <Zap className="w-4 h-4 md:w-5 md:h-5 ml-2 text-yellow-400 animate-pulse" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Ready to Start
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Dominating?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed px-2">
            Join Australian businesses saving thousands monthly while dominating their markets with AI-powered content.
          </p>
          
          <div className="flex flex-col gap-4 md:gap-6 justify-center px-4">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-red-600 to-blue-600 rounded-lg blur opacity-75 animate-pulse"></div>
              <Link to="/auth">
                <Button className="relative bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-2xl border-0 w-full sm:w-auto">
                  <Target className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                  Start at $79/month
                </Button>
              </Link>
            </div>
            <Link to="/services">
              <Button variant="outline" size="xl" className="text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 w-full sm:w-auto">
                <Eye className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                See All Features
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-12 md:mt-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-yellow-400">$79</div>
              <div className="text-xs md:text-sm text-gray-400">Starting Price</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-cyan-400">$15,821</div>
              <div className="text-xs md:text-sm text-gray-400">Monthly Savings</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-green-400">0</div>
              <div className="text-xs md:text-sm text-gray-400">Setup Fees</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
