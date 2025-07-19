import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ComingSoonPopup } from "@/components/common/ComingSoonPopup";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertTriangle,
  Construction,
  Clock
} from "lucide-react";
import roiDataHero from "@/assets/roi-data-driven-hero.jpg";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SystemLockdownBanner />
      <PublicHeader />
      
      <HeroSection backgroundImage={roiDataHero}>
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Badge className="mb-6 bg-amber-600 text-white border-amber-500">
            <Construction className="w-4 h-4 mr-2" />
            Early Access Pricing - Platform in Development
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Early Access <span className="text-gradient-hero">Pricing</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            Reserve your spot for when JB-SaaS launches. Early access pricing for Australian businesses joining our development journey.
          </p>
        </div>
      </HeroSection>

      {/* Development Status Alert */}
      <section className="py-12 bg-amber-50/50 border-b border-amber-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Platform Development Status</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-700">15%</div>
                <div className="text-sm text-amber-600">Platform Complete</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">100%</div>
                <div className="text-sm text-green-600">Authentication Working</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">5</div>
                <div className="text-sm text-blue-600">Phases to Launch</div>
              </div>
            </div>
            <p className="text-amber-700 mt-4 max-w-2xl mx-auto">
              JB-SaaS is currently in active development. These prices secure your early access position with significant savings when we launch.
            </p>
          </div>
        </div>
      </section>

      {/* Early Access Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Early Access Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lock in launch pricing now. Full functionality available when platform development completes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Early Bird Starter */}
            <Card className="relative p-8 border-2 border-blue-200 shadow-xl h-full flex flex-col">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                Early Bird
              </Badge>
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Starter (When Live)</h3>
                  <p className="text-muted-foreground mb-6">For small Australian businesses</p>
                   <div className="mb-6">
                     <div className="text-sm text-muted-foreground line-through">Regular: $79/month</div>
                     <span className="text-4xl font-bold text-blue-600">$49</span>
                     <span className="text-muted-foreground">/month</span>
                     <div className="text-sm text-green-600 font-semibold">38% Launch Discount</div>
                     <div className="text-xs text-muted-foreground mt-2">AUD, inc. GST</div>
                   </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-center text-amber-700">
                    <Clock className="w-4 h-4 inline mr-1" />
                    When Platform Launches
                  </h4>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>AI content creation (50 posts/month)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>3 social media accounts</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Basic scheduling</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Content templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Email support</span>
                  </li>
                </ul>
                
                <div className="mt-auto">
                  <ComingSoonPopup 
                    trigger={
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                        Reserve Early Access
                      </Button>
                    } 
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    No payment until platform launches
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Early Bird Professional - Most Popular */}
            <Card className="relative p-8 border-2 border-green-500 shadow-xl h-full flex flex-col bg-green-50/30">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
              
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Professional (When Live)</h3>
                  <p className="text-muted-foreground mb-6">For growing Australian businesses</p>
                 <div className="mb-6">
                   <div className="text-sm text-muted-foreground line-through">Regular: $249/month</div>
                   <span className="text-4xl font-bold text-green-600">$149</span>
                   <span className="text-muted-foreground">/month</span>
                   <div className="text-sm text-green-600 font-semibold">40% Launch Discount</div>
                   <div className="text-xs text-muted-foreground mt-2">AUD, inc. GST</div>
                 </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-center text-amber-700">
                    <Clock className="w-4 h-4 inline mr-1" />
                    When Platform Launches
                  </h4>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Unlimited AI content generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>10 social media accounts</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Competitor analysis tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Brand voice AI training</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Priority support</span>
                  </li>
                   <li className="flex items-center">
                     <Check className="w-5 h-5 text-green-500 mr-3" />
                     <span>Australian compliance tools</span>
                   </li>
                </ul>
                
                <div className="mt-auto">
                  <ComingSoonPopup 
                    trigger={
                      <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                        Reserve Early Access
                      </Button>
                    } 
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    No payment until platform launches
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Early Bird Enterprise */}
            <Card className="relative p-8 border-2 border-purple-200 shadow-xl h-full flex flex-col">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                Enterprise
              </Badge>
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Enterprise (When Live)</h3>
                  <p className="text-muted-foreground mb-6">For large Australian organizations</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-purple-600">Custom</span>
                    <div className="text-sm text-purple-600 font-semibold">Significant Early Bird Savings</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-center text-amber-700">
                    <Clock className="w-4 h-4 inline mr-1" />
                    When Platform Launches
                  </h4>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Everything in Professional</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>White-label solutions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>SLA guarantees</span>
                  </li>
                </ul>
                
                <div className="mt-auto">
                  <ComingSoonPopup 
                    trigger={
                      <Button variant="outline" size="lg" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                        Contact for Early Access
                      </Button>
                    } 
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Custom pricing discussion
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Current Features Available */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What's Available Now</h2>
            <p className="text-muted-foreground">Current functionality for early access members</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Check className="w-6 h-6 text-green-500 mr-3" />
                  <h3 className="text-xl font-semibold">Currently Working</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✅ User authentication & profiles</li>
                  <li>✅ Business profile management</li>
                  <li>✅ Basic content creation interface</li>
                  <li>✅ Content library & templates</li>
                  <li>✅ User dashboard</li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Construction className="w-6 h-6 text-amber-500 mr-3" />
                  <h3 className="text-xl font-semibold">In Development</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>🚧 AI content generation</li>
                  <li>🚧 Social media scheduling</li>
                  <li>🚧 Analytics dashboard</li>
                  <li>🚧 Competitor analysis</li>
                  <li>🚧 Payment processing</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Benefits */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-600 text-white">
              🚀 Early Access Benefits
            </Badge>
            <h2 className="text-4xl font-bold mb-6">Join the Development Journey</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Be part of building Australia's most advanced AI marketing platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center border-2 border-blue-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Significant Savings</h3>
              <p className="text-muted-foreground">
                Lock in 38-40% launch discounts. Price increases to regular rates after public launch.
              </p>
            </Card>

            <Card className="p-6 text-center border-2 border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Shape the Product</h3>
              <p className="text-muted-foreground">
                Your feedback directly influences feature development and platform design.
              </p>
            </Card>

            <Card className="p-6 text-center border-2 border-purple-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Priority Access</h3>
              <p className="text-muted-foreground">
                First access to new features, priority support, and exclusive Australian business resources.
              </p>
            </Card>
          </div>

          <div className="text-center mt-12">
            <ComingSoonPopup 
              trigger={
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Join Early Access Program
                </Button>
              } 
            />
            <p className="text-sm text-muted-foreground mt-4">
              No payment required. Reserve your spot for launch pricing.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about early access</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">When will the platform be fully functional?</h3>
              <p className="text-muted-foreground">
                We're targeting full functionality completion in phases over the coming months. Early access members get updates on progress and can test features as they're released.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Do I pay anything now?</h3>
              <p className="text-muted-foreground">
                No. Early access registration is free. You only pay when the platform launches and you choose to activate your account.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">What if I'm not satisfied at launch?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee after launch. If the platform doesn't meet your expectations, we'll refund your first month.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Is this only for Australian businesses?</h3>
              <p className="text-muted-foreground">
                Yes, JB-SaaS is designed specifically for Australian businesses with local compliance, GST handling, and Australian-focused features.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Early Access?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join the early access program and be part of building Australia's most advanced AI marketing platform.
          </p>
          <ComingSoonPopup 
            trigger={
              <Button size="lg" variant="secondary" className="px-8 py-3">
                <Star className="w-5 h-5 mr-2" />
                Reserve My Spot
              </Button>
            } 
          />
        </div>
      </section>
    </div>
  );
};

export default Pricing;