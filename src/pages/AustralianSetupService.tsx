import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicHeader from '@/components/layout/PublicHeader';
import { HeroSection } from '@/components/layout/HeroSection';
import SocialMediaAudit from '@/components/services/SocialMediaAudit';
import AustralianCompetitorAnalysis from '@/components/services/AustralianCompetitorAnalysis';
import AustralianContentTemplates from '@/components/services/AustralianContentTemplates';
import AustralianSetupPricing from '@/components/services/AustralianSetupPricing';
import { 
  MapPin, 
  Shield, 
  Users, 
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import socialMediaStrategyHero from '@/assets/social-media-strategy-hero.jpg';

const AustralianSetupService = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <HeroSection backgroundImage={socialMediaStrategyHero}>
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <Badge className="mb-6 bg-green-600 text-white border-green-500 text-lg px-6 py-2">
            🇦🇺 Exclusively for Australian Businesses
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Australian Quick-Start <span className="text-gradient-hero">Social Setup Service</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            Skip the technical hassle! Our Australian team personally configures your Facebook Business Manager, 
            Instagram Business profile, and connects everything to JBSAAS. Professional setup in 2-5 business days.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
              Get Professional Setup - From AU$199
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
              View Pricing Plans
            </Button>
          </div>
        </div>
      </HeroSection>

      {/* Why Choose Our Service */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Australian Setup Service?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We understand the unique challenges Australian businesses face with social media setup and compliance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-green-200 dark:border-green-800">
              <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Local Expertise</h3>
              <p className="text-muted-foreground">
                Our team understands Australian business regulations, GST requirements, and local market nuances for optimal social media setup.
              </p>
            </Card>
            
            <Card className="text-center p-8 border-blue-200 dark:border-blue-800">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Compliance Ready</h3>
              <p className="text-muted-foreground">
                Ensures your social media accounts meet Australian advertising standards and Facebook's business verification requirements.
              </p>
            </Card>
            
            <Card className="text-center p-8 border-purple-200 dark:border-purple-800">
              <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Fast Turnaround</h3>
              <p className="text-muted-foreground">
                Professional setup completed in 2-5 business days, so you can start creating content immediately without technical delays.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Complete Social Media Setup Service</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to get your Australian business running on social media platforms.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <Facebook className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Facebook Business Setup</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Business Manager account creation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Australian business verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Ad account configuration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Pixel installation & setup
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Custom audience configuration
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <Instagram className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Instagram Business Setup</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Business profile optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Shopping catalog setup
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Creator tools activation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Australian location tagging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Contact information setup
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <Linkedin className="w-8 h-8 text-blue-700 mb-4" />
              <h3 className="text-xl font-bold mb-3">LinkedIn & Integration</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  LinkedIn Business Page setup
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  JBSAAS platform connection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Cross-platform content sync
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Analytics configuration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Training & documentation
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Tabs */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Complete Australian Social Media Solution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Beyond setup, we provide ongoing tools and insights tailored for the Australian market.
            </p>
          </div>

          <Tabs defaultValue="audit" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="audit">Social Audit</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
              <TabsTrigger value="templates">Content Templates</TabsTrigger>
              <TabsTrigger value="pricing">Setup Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="audit">
              <SocialMediaAudit />
            </TabsContent>

            <TabsContent value="competitors">
              <AustralianCompetitorAnalysis />
            </TabsContent>

            <TabsContent value="templates">
              <AustralianContentTemplates />
            </TabsContent>

            <TabsContent value="pricing">
              <AustralianSetupPricing />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Australian Businesses Say</h2>
            <p className="text-muted-foreground">Trusted by businesses across Australia</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The team understood exactly what we needed as an Australian business. Setup was seamless and we were posting within days."
              </p>
              <div className="font-medium">
                Sarah Chen<br />
                <span className="text-sm text-muted-foreground">Melbourne Digital Agency</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Saved us weeks of technical headaches. The Australian compliance setup was perfect and everything just works."
              </p>
              <div className="font-medium">
                Mark Thompson<br />
                <span className="text-sm text-muted-foreground">Brisbane Consulting Services</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Professional service with local knowledge. Our social media reach has increased dramatically since the setup."
              </p>
              <div className="font-medium">
                Lisa Armstrong<br />
                <span className="text-sm text-muted-foreground">Sydney Health Practice</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Your Australian Business Set Up?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of Australian businesses already using our professional setup service.
          </p>
          <Button size="xl" className="bg-gradient-primary shadow-glow">
            Start Your Setup Today - From AU$199
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/jbsaaslogo.png" 
                alt="JBSAAS Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-gradient-primary">JB-Software-As-A-Service</span>
            </div>
            <p className="text-muted-foreground">
              © 2025 JB-Software-As-A-Service. All rights reserved. Australian Business Setup Service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AustralianSetupService;