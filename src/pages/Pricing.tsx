import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ComingSoonPopup } from "@/components/common/ComingSoonPopup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SystemLockdownBanner } from "@/components/common/SystemLockdownBanner";
import PublicHeader from "@/components/layout/PublicHeader";
import { HeroSection } from "@/components/layout/HeroSection";
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
  Clock
} from "lucide-react";
import roiDataHero from "@/assets/roi-data-driven-hero.jpg";

const Pricing = () => {
  const starterFeatures = [
    'AI Content Generation: 100 posts/month',
    'Social Media Management: 3 accounts',
    'Content Scheduling & Publishing',
    'Basic Analytics Dashboard',
    'Industry-Specific Templates',
    'Australian Compliance Check',
    'Email Support'
  ];

  const professionalFeatures = [
    'Everything in Starter PLUS:',
    'Unlimited AI Content Generation',
    'Social Media Management: 10 accounts',
    'Advanced Analytics & Insights',
    'Competitor Analysis Tools',
    'Brand Voice Training',
    'Custom Content Templates',
    'Priority Support',
    'Business Intelligence Dashboard',
    'Australian Compliance Suite'
  ];

  const enterpriseFeatures = [
    'Everything in Professional',
    'Unlimited team members & accounts',
    'White-label solution',
    'Custom integrations',
    'Dedicated success manager',
    'SLA guarantees',
    'Custom compliance workflows'
  ];

  return (
    <div className="min-h-screen bg-background">
      <SystemLockdownBanner />
      <PublicHeader />
      
      <HeroSection 
        backgroundImage={roiDataHero}
        overlayIntensity="medium"
        className="h-[60vh] sm:h-[70vh]"
      >
        <Badge className="mb-6 bg-primary/20 text-white border-white/20 hover:bg-primary/30">
          💰 Australian Business Pricing
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          Simple, <span className="text-primary-foreground/90">Transparent Pricing</span>
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Choose the plan that fits your business. All prices in AUD, GST included. Cancel anytime.
        </p>
      </HeroSection>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          
          {/* Value Proposition */}
          <section className="mb-20 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
              <DollarSign className="w-4 h-4 mr-2" />
              Replace $11,700/month in agency costs
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              One Platform. <span className="text-gradient-primary">Everything You Need.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AI-powered content creation, social media management, competitor analysis, and Australian compliance - all in one platform.
            </p>
          </section>

          {/* Pricing Cards */}
          <section className="mb-20">
            <div className="grid lg:grid-cols-3 gap-8 mb-12 items-stretch">
              
              {/* Starter Plan */}
              <Card className="relative border-2 border-green-500/30 hover:border-green-500/50 transition-colors h-full">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>Perfect for small businesses</CardDescription>
                  <div className="text-4xl font-bold text-green-600 mt-4">
                    $179<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <Badge variant="secondary" className="mt-2">Limited Time - Then $249/month</Badge>
                  <p className="text-sm text-muted-foreground mt-2">AUD, inc. GST</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {starterFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ComingSoonPopup 
                    trigger={
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white border-0">
                        Get Started - $179/month
                      </Button>
                    } 
                  />
                </CardContent>
              </Card>

              {/* Professional Plan - Most Popular */}
              <Card className="relative border-2 border-blue-500 h-full">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <CardDescription>For growing businesses</CardDescription>
                  <div className="text-4xl font-bold text-blue-600 mt-4">
                    $179<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <Badge variant="secondary" className="mt-2">Limited Time - Then $249/month</Badge>
                  <p className="text-sm text-muted-foreground mt-2">AUD, inc. GST</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {professionalFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className={`text-sm ${index === 0 ? 'font-semibold' : ''}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ComingSoonPopup 
                    trigger={
                      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0">
                        Get Started - $179/month
                      </Button>
                    } 
                  />
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="relative border-2 border-purple-500/30 hover:border-purple-500/50 transition-colors h-full">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription>For large organizations</CardDescription>
                  <div className="text-4xl font-bold text-purple-600 mt-4">
                    Custom<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <Badge variant="outline" className="mt-2 border-purple-500 text-purple-600">Contact Sales</Badge>
                  <p className="text-sm text-muted-foreground mt-2">AUD, inc. GST</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {enterpriseFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ComingSoonPopup 
                    trigger={
                      <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white border-0">
                        Contact Sales
                      </Button>
                    } 
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ROI Calculator */}
          <section className="mb-20">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4">
                    <TrendingUp className="w-8 h-8 inline mr-3 text-green-600" />
                    Your ROI Calculator
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    See how much you save by replacing expensive agencies and freelancers
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="text-center">
                      <CardTitle className="text-red-600">Traditional Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Content Marketing Agency</span>
                          <span className="font-bold">$4,000/month</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Social Media Manager</span>
                          <span className="font-bold">$3,200/month</span>
                        </li>
                        <li className="flex justify-between">
                          <span>SEO Specialist</span>
                          <span className="font-bold">$2,500/month</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Analytics Tools</span>
                          <span className="font-bold">$500/month</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Compliance Consultant</span>
                          <span className="font-bold">$1,500/month</span>
                        </li>
                        <li className="flex justify-between border-t pt-2 font-bold text-lg">
                          <span>Total Monthly Cost</span>
                          <span className="text-red-600">$11,700/month</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="text-center">
                      <CardTitle className="text-green-600">JB-SaaS Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Professional Plan</span>
                          <span className="font-bold">$179/month</span>
                        </li>
                        <li className="flex justify-between text-gray-500">
                          <span>Setup (one-time)</span>
                          <span>$199</span>
                        </li>
                        <li className="flex justify-between border-t pt-2 font-bold text-lg">
                          <span>Monthly Ongoing</span>
                          <span className="text-green-600">$179/month</span>
                        </li>
                        <li className="flex justify-between border-t pt-2 font-bold text-2xl">
                          <span className="text-green-600">You Save</span>
                          <span className="text-green-600">$11,521/month</span>
                        </li>
                        <li className="text-center text-green-600 font-bold">
                          That's $138,252 per year!
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Features Comparison */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                What's Included in Every Plan
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Core features that replace entire teams of specialists
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Brain className="w-8 h-8" />,
                  title: "AI Content Engine",
                  description: "Generate professional, compliant content for any Australian industry"
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Compliance Suite",
                  description: "Australian business compliance built into every piece of content"
                },
                {
                  icon: <BarChart3 className="w-8 h-8" />,
                  title: "Analytics Dashboard",
                  description: "Track performance across all channels with detailed reporting"
                },
                {
                  icon: <Target className="w-8 h-8" />,
                  title: "Competitor Analysis",
                  description: "Monitor competitors and identify opportunities automatically"
                }
              ].map((feature, index) => (
                <Card key={index} className="text-center p-6 hover-scale">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about our pricing
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "Why is the pricing the same for Starter and Professional?",
                  answer: "We're offering limited-time promotional pricing to early adopters. Professional normally costs more but we're giving you full access at the Starter price during our launch period."
                },
                {
                  question: "What happens when prices increase to $249/month?",
                  answer: "Current customers keep their $179/month pricing as long as they remain subscribed. The $249/month rate only applies to new customers after the promotional period ends."
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
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4">
                  Ready to Transform Your Marketing?
                </h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join hundreds of Australian businesses saving thousands while growing their online presence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <ComingSoonPopup 
                    trigger={
                      <Button size="lg" className="bg-gradient-primary">
                        <Zap className="w-5 h-5 mr-2" />
                        Start Your Plan Today
                      </Button>
                    } 
                  />
                  <Link to="/all-services">
                    <Button size="lg" variant="outline">
                      <ArrowRight className="w-5 h-5 mr-2" />
                      View All Services
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Pricing;