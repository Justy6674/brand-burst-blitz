
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PublicHeader from '@/components/layout/PublicHeader';
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

const PricingWithServices = () => {
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
      description: 'Complete Facebook Business Manager, Instagram Business profile setup and JB-Health integration',
      features: [
        'Facebook Business Manager setup',
        'Instagram Business configuration',
        'Meta App setup and verification',
        'Australian business compliance',
        'Full JB-Health integration',
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
      
      {/* Hero Section with Background Image */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${featuresImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-purple-900/60"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-6 text-center">
          <Badge className="mb-8 bg-black/40 backdrop-blur-sm text-white border-white/30 text-lg px-6 py-3 font-semibold">
            🏥 Australian Healthcare Services & Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white">
            Complete <span className="text-yellow-400">Healthcare Platform</span><br />
            & <span className="text-yellow-400">Professional Services</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto">
            AHPRA-compliant content platform plus professional Australian business setup services. Everything you need for healthcare marketing compliance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth">
              <Button size="xl" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold text-xl px-12 py-6">
                <Crown className="w-6 h-6 mr-3" />
                Start Your Trial
              </Button>
            </Link>
            <Link to="/services">
              <Button size="xl" variant="outline" className="text-xl px-12 py-6 border-white text-white hover:bg-white/20">
                <Building className="w-6 h-6 mr-3" />
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Current Professional Services */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-500 text-white text-lg px-6 py-2">
              🇦🇺 Available Now
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Professional <span className="text-gradient-primary">Setup Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Skip the technical setup hassle. Our Australian team handles the complex configuration so you can focus on your healthcare practice.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {currentTools.map((tool, index) => (
              <Card key={index} className="p-8 hover-lift border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    {index === 0 ? <Users className="w-8 h-8 text-white" /> : <FileSearch className="w-8 h-8 text-white" />}
                  </div>
                  <CardTitle className="text-2xl">{tool.name}</CardTitle>
                  <CardDescription className="text-lg">{tool.description}</CardDescription>
                  <div className="text-3xl font-bold text-primary mt-4">{tool.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tool.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button className="w-full text-lg py-3">
                      Get {tool.name}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Subscription Plans */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-500 text-white text-lg px-6 py-2">
              🏥 Healthcare Platform
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              AHPRA-Compliant <span className="text-gradient-primary">Subscription Plans</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose your healthcare content platform subscription. All plans include AHPRA compliance and patient education features.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter Plan */}
            <Card className="relative p-8 border-2 border-green-500/30 hover:border-green-500/50 transition-colors h-full">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Solo Practitioner</CardTitle>
                <CardDescription>Individual healthcare professionals</CardDescription>
                <div className="text-4xl font-bold text-green-600 mt-4">$79<span className="text-lg text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {starterFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    Choose Solo Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan - Most Popular */}
            <Card className="relative p-8 border-2 border-blue-500 h-full bg-gradient-to-br from-blue-500/10 to-blue-600/10">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Group Practice</CardTitle>
                <CardDescription>Multiple practitioners & locations</CardDescription>
                <div className="text-4xl font-bold text-blue-600 mt-4">$179<span className="text-lg text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {professionalFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${index === 0 ? 'font-semibold' : ''}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Choose Group Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative p-8 border-2 border-purple-500/30 hover:border-purple-500/50 transition-colors h-full">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Healthcare Network</CardTitle>
                <CardDescription>Enterprise healthcare organisations</CardDescription>
                <div className="text-4xl font-bold text-purple-600 mt-4">$449<span className="text-lg text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {enterpriseFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coming Soon Tools */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-orange-500 text-white text-lg px-6 py-2">
              🚀 Coming Soon
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Future <span className="text-gradient-primary">Healthcare Tools</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're constantly building new tools and services for Australian healthcare professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {futureTools.map((tool, index) => (
              <Card key={index} className="p-6 text-center opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{tool}</h3>
                  <p className="text-sm text-muted-foreground">In development</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Ready to Start Your <span className="text-gradient-primary">Healthcare Platform?</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth">
              <Button size="xl" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white font-bold text-xl px-12 py-6">
                <Zap className="w-6 h-6 mr-3" />
                Start Free Trial
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="xl" variant="outline" className="text-xl px-12 py-6">
                <Mail className="w-6 h-6 mr-3" />
                Contact Healthcare Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingWithServices;
