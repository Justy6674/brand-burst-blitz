import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { 
  Check,
  Star,
  ArrowRight,
  DollarSign,
  Users,
  Building,
  Crown
} from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <DollarSign className="w-4 h-4 mr-2" />
            Simple, Transparent Pricing
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your <span className="text-gradient-primary">Growth Plan</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Start free, scale as you grow. All plans include our core AI content creation features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
            
            {/* Starter Plan */}
            <Card className="relative p-8">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Starter</h3>
                  <p className="text-muted-foreground mb-6">Perfect for small businesses getting started</p>
                  <div className="mb-12">
                    <span className="text-5xl font-bold">$49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
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
                  <Button className="w-full h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 hover:from-purple-600 hover:to-blue-500">
                    Coming August 2025
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Professional Plan - Most Popular */}
            <Card className="relative p-8 scale-105 border-primary shadow-xl">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
              
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Professional</h3>
                  <p className="text-muted-foreground mb-6">For growing businesses that need more power</p>
                  <div className="mb-12">
                    <span className="text-5xl font-bold text-primary">$149</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
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
                </ul>
                
                <div className="mt-8">
                  <Button className="w-full h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 hover:from-purple-600 hover:to-blue-500">
                    Coming August 2025
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative p-8">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <p className="text-muted-foreground mb-6">For large organizations with custom needs</p>
                  <div className="mb-12">
                    <span className="text-5xl font-bold">Custom</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
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
                  <Button variant="outline" className="w-full h-14 rounded-full">
                    Contact Sales
                  </Button>
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Content Strategy?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using AI to create better content faster.
          </p>
          <Link to="/auth">
            <Button size="xl" className="bg-gradient-primary shadow-glow">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
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