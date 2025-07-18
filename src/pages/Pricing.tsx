import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ComingSoonPopup } from "@/components/common/ComingSoonPopup";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { HeroSection } from "@/components/layout/HeroSection";
import { 
  Check,
  Star,
  ArrowRight,
  DollarSign,
  Users,
  Building,
  Crown
} from "lucide-react";
import roiDataHero from "@/assets/roi-data-driven-hero.jpg";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <HeroSection backgroundImage={roiDataHero}>
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Badge className="mb-6 bg-green-600 text-white border-green-500">
            🇦🇺 Australian Businesses Only
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Choose Your <span className="text-gradient-hero">Growth Plan</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            Professional plan replaces $11,700 in monthly agency costs. All plans include our core AI content creation features designed for Australian businesses.
          </p>
        </div>
      </HeroSection>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Starter Plan */}
            <Card className="relative p-8 border-primary shadow-xl h-full flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Starter</h3>
                  <p className="text-muted-foreground mb-6">Perfect for small businesses getting started</p>
                   <div className="mb-12">
                     <span className="text-5xl font-bold text-primary">$49</span>
                     <span className="text-muted-foreground">/month</span>
                     <div className="text-sm text-muted-foreground mt-2">AUD, inc. GST for GST-registered businesses</div>
                   </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Up to 100 AI-generated posts/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>3 Social media accounts</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Basic analytics dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Content scheduling</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Email support</span>
                  </li>
                </ul>
                
                <div className="mt-8">
                  <ComingSoonPopup 
                    trigger={
                      <Button variant="hero" size="lg" className="w-full">
                        Start Free Trial
                      </Button>
                    } 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Plan - Most Popular */}
            <Card className="relative p-8 border-primary shadow-xl h-full flex flex-col">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
              
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Professional</h3>
                  <p className="text-muted-foreground mb-6">For growing businesses that need more power</p>
                 <div className="mb-12">
                   <span className="text-5xl font-bold text-primary">$149</span>
                   <span className="text-muted-foreground">/month</span>
                   <div className="text-sm text-muted-foreground mt-2">AUD, inc. GST for GST-registered businesses</div>
                   <div className="text-xs text-green-600 font-semibold">Replaces $11,700 in agency costs</div>
                 </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Unlimited AI-generated content</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>10 Social media accounts</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Advanced analytics & insights</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Competitor analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Brand voice training</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Priority support</span>
                  </li>
                   <li className="flex items-center">
                     <Check className="w-5 h-5 text-green-500 mr-3" />
                     <span>Custom templates</span>
                   </li>
                   <li className="flex items-center">
                     <Check className="w-5 h-5 text-green-500 mr-3" />
                     <span>Automatic GST compliance for Australian businesses</span>
                   </li>
                </ul>
                
                <div className="mt-8">
                  <ComingSoonPopup 
                    trigger={
                      <Button variant="premium" size="lg" className="w-full">
                        Start Free Trial
                      </Button>
                    } 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative p-8 border-primary shadow-xl h-full flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <p className="text-muted-foreground mb-6">For large organizations with custom needs</p>
                  <div className="mb-12">
                    <span className="text-5xl font-bold text-primary">Custom</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
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
                    <span>White-label solution</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Dedicated success manager</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>SLA guarantees</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Custom training</span>
                  </li>
                </ul>
                
                <div className="mt-8">
                  <ComingSoonPopup 
                    trigger={
                      <Button variant="secondary" size="lg" className="w-full">
                        Contact Sales
                      </Button>
                    } 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Compare All Features</h2>
            <p className="text-muted-foreground">See what's included in each plan</p>
          </div>
          
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6">Features</th>
                  <th className="text-center py-4 px-6">Starter</th>
                  <th className="text-center py-4 px-6">Professional</th>
                  <th className="text-center py-4 px-6">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6">AI Content Generation</td>
                  <td className="text-center py-4 px-6">100/month</td>
                  <td className="text-center py-4 px-6">Unlimited</td>
                  <td className="text-center py-4 px-6">Unlimited</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6">Social Media Accounts</td>
                  <td className="text-center py-4 px-6">3</td>
                  <td className="text-center py-4 px-6">10</td>
                  <td className="text-center py-4 px-6">Unlimited</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6">Analytics Dashboard</td>
                  <td className="text-center py-4 px-6"><Check className="w-4 h-4 text-success mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-4 h-4 text-success mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-4 h-4 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6">Competitor Analysis</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6"><Check className="w-4 h-4 text-success mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="w-4 h-4 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6">Team Members</td>
                  <td className="text-center py-4 px-6">1</td>
                  <td className="text-center py-4 px-6">5</td>
                  <td className="text-center py-4 px-6">Unlimited</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6">Support</td>
                  <td className="text-center py-4 px-6">Email</td>
                  <td className="text-center py-4 px-6">Priority</td>
                  <td className="text-center py-4 px-6">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Australian Services Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-600 text-white">
              🇦🇺 Australian Businesses Only
            </Badge>
            <h2 className="text-4xl font-bold mb-6">Australian Business Services</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Specialized services designed exclusively for Australian businesses, with local expertise and compliance.
            </p>
          </div>

          {/* Aussie Quick-Start Social Setup */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Aussie Quick-Start Social Setup</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our Australian team personally sets up your Facebook Business Manager, Instagram Business profile, and connects everything to JBSAAS.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
              <Card className="p-6 border-2 hover:border-green-500 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">S</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">Starter Plan</h4>
                  <div className="text-3xl font-bold text-primary mb-4">AU$299</div>
                  <p className="text-muted-foreground mb-4">One-time setup fee</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Complete social setup</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />JBSAAS integration</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />ABN verification</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />2-5 day delivery</li>
                  </ul>
                </div>
              </Card>
              
              <Card className="p-6 border-2 border-green-500 bg-green-50 dark:bg-green-950/20">
                <div className="text-center">
                  <Badge className="mb-4 bg-green-600 text-white">Popular</Badge>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">P</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">Professional Plan</h4>
                  <div className="text-3xl font-bold text-green-600 mb-4">AU$199</div>
                  <p className="text-muted-foreground mb-4">One-time setup fee (33% off)</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Everything in Starter</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Priority setup queue</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Advanced optimization</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Dedicated support</li>
                  </ul>
                </div>
              </Card>
              
              <Card className="p-6 border-2 hover:border-primary transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Enterprise Plan</h4>
                  <div className="text-3xl font-bold text-primary mb-4">Included</div>
                  <p className="text-muted-foreground mb-4">No additional cost</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Everything in Professional</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Multi-business setup</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Custom configurations</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />White-glove service</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          {/* Aussie Name & Domain Scout */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Aussie Name & Domain Scout</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional business name research including ASIC availability, domain checking, and optional trademark screening.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
              <Card className="p-6 border-2 hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">S</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">Starter/Professional</h4>
                  <div className="text-3xl font-bold text-blue-600 mb-4">AU$99</div>
                  <p className="text-muted-foreground mb-4">Complete name research</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />ASIC name checking</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Domain availability</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />AI analysis report</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />+AU$50 trademark screening</li>
                  </ul>
                </div>
              </Card>
              
              <Card className="p-6 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <div className="text-center">
                  <Badge className="mb-4 bg-blue-600 text-white">Best Value</Badge>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">P</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">Professional Premium</h4>
                  <div className="text-3xl font-bold text-blue-600 mb-4">AU$79</div>
                  <p className="text-muted-foreground mb-4">Discounted rate (20% off)</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Everything in Standard</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />FREE trademark screening</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Priority processing</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Enhanced reporting</li>
                  </ul>
                </div>
              </Card>
              
              <Card className="p-6 border-2 hover:border-primary transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Enterprise</h4>
                  <div className="text-3xl font-bold text-primary mb-4">AU$69</div>
                  <p className="text-muted-foreground mb-4">Maximum discount (30% off)</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Everything included</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Bulk name research</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Dedicated consultant</li>
                    <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Custom requirements</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          <div className="text-center">
            <Link to="/australian-services">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white mr-4">
                Learn More About Australian Services
              </Button>
            </Link>
            <Link to="/australian-setup-service">
              <Button variant="outline" size="lg">
                Quick-Start Setup Service
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Content Strategy?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using AI to create better content faster.
          </p>
          <ComingSoonPopup 
            trigger={
              <Button size="xl" className="bg-gradient-primary shadow-glow">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            } 
          />
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
              © 2025 JB-Software-As-A-Service. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;