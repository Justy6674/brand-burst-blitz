import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PublicHeader from '@/components/layout/PublicHeader';
import { HeroSection } from '@/components/layout/HeroSection';
import { ComingSoonPopup } from '@/components/common/ComingSoonPopup';
import { 
  Zap, 
  Users, 
  BarChart3, 
  Brain, 
  Target, 
  Shield,
  Building,
  FileSearch,
  Globe,
  ArrowRight,
  CheckCircle,
  Crown,
  Mail,
  Clock,
  Star
} from 'lucide-react';
import featuresImage from '@/assets/features-image.jpg';

const AllServices = () => {
  const starterFeatures = [
    'AI Content Generation: 100 posts/month',
    'Social Media Management: 3 accounts',
    'Content Scheduling & Publishing',
    'Basic Analytics Dashboard',
    'Industry-Specific Templates',
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
    'Business Intelligence Dashboard'
  ];

  const enterpriseFeatures = [
    'Everything in Professional',
    'Unlimited team members & accounts',
    'White-label solution',
    'Custom integrations',
    'Dedicated success manager'
  ];

  const currentTools = [
    {
      name: 'Australian Quick-Start Social Setup',
      price: '$199-299',
      description: 'Complete Facebook Business Manager, Instagram Business profile setup and JBSAAS integration',
      features: [
        'Facebook Business Manager setup',
        'Instagram Business configuration',
        'Meta App setup and verification',
        'Australian business compliance',
        'Full JBSAAS integration',
        'Quality assurance testing'
      ]
    },
    {
      name: 'Name & Domain Scout',
      price: '$69-99',
      description: 'Professional business name research including ASIC availability and domain checking',
      features: [
        'ASIC business name availability',
        'Domain availability checking',
        'Similar name analysis',
        'Optional trademark screening',
        'AI-generated research summary',
        'Professional PDF report'
      ]
    }
  ];

  const futureTools = [
    'ASIC Business Search Tool',
    'Domain Research & Ideas Generator',
    'Website Design Concept Generator',
    'Medicare Provider Tools',
    'Postcode Search for Medicare Telehealth',
    'Industry-Specific Professional Tools',
    'Business Registration Assistant'
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <HeroSection 
        backgroundImage={featuresImage}
        overlayIntensity="medium"
        className="h-[60vh] sm:h-[70vh]"
      >
        <Badge className="mb-6 bg-primary/20 text-white border-white/20 hover:bg-primary/30">
          🇦🇺 Complete Australian Business Solutions
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          Everything Your <span className="text-primary-foreground/90">Business Needs</span>
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Choose our comprehensive SaaS platform for ongoing content management, plus specialized tools for business setup and growth.
        </p>
      </HeroSection>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          
          {/* Main SaaS Platform Section */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary">
                <Zap className="w-4 h-4 mr-2" />
                Core SaaS Platform
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Monthly <span className="text-gradient-primary">Subscriptions</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Access our comprehensive AI-powered content management platform. Choose the plan that fits your business size and needs.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12 items-start">
              {/* Starter Plan - Green Theme */}
              <Card className="relative border-2 hover:border-green-400/50 transition-all duration-300 bg-gradient-to-br from-green-50/50 to-emerald-50/30 h-full">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-green-700">Starter</CardTitle>
                  <CardDescription className="text-green-600">Perfect for small businesses</CardDescription>
                  <div className="text-4xl font-bold text-green-600 mt-4">
                    $49<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {starterFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-800">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ComingSoonPopup 
                    trigger={
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-lg">
                        Start Free Trial
                      </Button>
                    } 
                  />
                </CardContent>
              </Card>

              {/* Professional Plan - Blue Theme */}
              <Card className="relative border-2 border-blue-400 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-xl h-full">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-blue-700">Professional</CardTitle>
                  <CardDescription className="text-blue-600">For growing businesses</CardDescription>
                  <div className="text-4xl font-bold text-blue-600 mt-4">
                    $149<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {professionalFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className={`text-sm text-blue-800 ${index === 0 ? 'font-semibold' : ''}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ComingSoonPopup 
                    trigger={
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-lg">
                        Start Free Trial
                      </Button>
                    } 
                  />
                </CardContent>
              </Card>

              {/* Enterprise Plan - Purple Theme */}
              <Card className="relative border-2 hover:border-purple-400/50 transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-violet-50/30 h-full">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-purple-700">Enterprise</CardTitle>
                  <CardDescription className="text-purple-600">For large organizations</CardDescription>
                  <div className="text-4xl font-bold text-purple-600 mt-4">
                    Custom<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <Badge variant="outline" className="mt-2 border-purple-300 text-purple-600">Coming 2025</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {enterpriseFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-purple-800">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ComingSoonPopup 
                    trigger={
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 border-0 shadow-lg">
                        Contact Sales
                      </Button>
                    } 
                  />
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link to="/pricing">
                <Button variant="outline" size="lg">
                  View Detailed Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Additional Tools Section */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-secondary/10 text-secondary">
                <FileSearch className="w-4 h-4 mr-2" />
                Additional Tools
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Standalone <span className="text-gradient-secondary">Business Tools</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Specialized one-time purchase tools to help with business setup, research, and professional requirements.
              </p>
            </div>

            {/* Current Tools */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-8 text-center">Available Now</h3>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Australian Social Setup - Orange Theme */}
                <Card className="border-2 hover:border-orange-400/50 transition-all duration-300 bg-gradient-to-br from-orange-50/50 to-amber-50/30 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-orange-700">{currentTools[0].name}</CardTitle>
                      <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                        {currentTools[0].price}
                      </Badge>
                    </div>
                    <CardDescription className="text-orange-600">{currentTools[0].description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {currentTools[0].features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-orange-800">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <ComingSoonPopup 
                      trigger={
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 border-0 shadow-lg">
                          Learn More
                        </Button>
                      } 
                    />
                  </CardContent>
                </Card>

                {/* Name & Domain Scout - Teal Theme */}
                <Card className="border-2 hover:border-teal-400/50 transition-all duration-300 bg-gradient-to-br from-teal-50/50 to-cyan-50/30 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-teal-700">{currentTools[1].name}</CardTitle>
                      <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                        {currentTools[1].price}
                      </Badge>
                    </div>
                    <CardDescription className="text-teal-600">{currentTools[1].description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {currentTools[1].features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-teal-800">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <ComingSoonPopup 
                      trigger={
                        <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 border-0 shadow-lg">
                          Learn More
                        </Button>
                      } 
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Future Tools */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-center">Coming Soon</h3>
              <Card className="bg-muted/30 border-dashed border-2">
                <CardHeader className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <CardTitle>Expanding Toolkit</CardTitle>
                  <CardDescription>
                    More specialized tools to support Australian business owners and startups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {futureTools.map((tool, index) => (
                      <div key={index} className="flex items-center p-3 rounded-lg bg-background/50">
                        <Clock className="w-4 h-4 text-muted-foreground mr-3" />
                        <span className="text-sm">{tool}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <ComingSoonPopup 
                      trigger={
                        <Button variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Get Notified of New Tools
                        </Button>
                      } 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4">
                  Ready to Transform Your Business?
                </h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start with our comprehensive platform or choose the specific tools your business needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <ComingSoonPopup 
                    trigger={
                      <Button size="lg" className="bg-gradient-primary">
                        <Zap className="w-5 h-5 mr-2" />
                        Start Platform Trial
                      </Button>
                    } 
                  />
                  <Link to="/australian-services">
                    <Button size="lg" variant="outline">
                      <FileSearch className="w-5 h-5 mr-2" />
                      Browse Business Tools
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

export default AllServices;