import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { 
  Check,
  Star,
  ArrowRight,
  Users,
  Building,
  Crown,
  FileSearch,
  Globe,
  Shield,
  Clock,
  Phone,
  Mail
} from "lucide-react";

const AustralianServices = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-green-600 text-white text-lg px-6 py-2">
            🇦🇺 Exclusively for Australian Businesses
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Professional <span className="text-gradient-primary">Australian Services</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Skip the hassle with our specialized Australian business services. From social media setup 
            to business name research, we handle the complex stuff so you can focus on growing your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Building className="w-5 h-5 mr-2" />
              Get Social Setup Service
            </Button>
            <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <FileSearch className="w-5 h-5 mr-2" />
              Try Name Scout Service
            </Button>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Aussie Quick-Start Social Setup */}
            <Card className="p-8 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white dark:from-green-950/10 dark:to-background">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-800 dark:text-green-600">Aussie Quick-Start</h3>
                    <p className="text-green-600 dark:text-green-400">Social Media Setup</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 text-lg">
                  Our Australian team personally sets up your Facebook Business Manager, 
                  Instagram Business profile, and connects everything to JBSAAS. Done professionally in 2-5 business days.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Complete Facebook Business Manager setup</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Instagram Business profile configuration</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Meta App setup and verification</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Australian business compliance verification</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Full integration with JBSAAS platform</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>Quality assurance testing</span>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-muted/20 rounded-lg p-4 mb-6">
                  <h4 className="font-bold mb-2">Tier-Based Pricing:</h4>
                  <div className="space-y-1 text-sm">
                    <div>• <strong>Starter Plan:</strong> AU$299 one-time</div>
                    <div>• <strong>Professional Plan:</strong> AU$199 one-time (33% off)</div>
                    <div>• <strong>Enterprise Plan:</strong> Included free (Save AU$299)</div>
                  </div>
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Building className="w-5 h-5 mr-2" />
                  Start Social Setup Service
                </Button>
              </CardContent>
            </Card>

            {/* Aussie Name & Domain Scout */}
            <Card className="p-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/10 dark:to-background">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <FileSearch className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-600">Aussie Name & Domain</h3>
                    <p className="text-blue-600 dark:text-blue-400">Business Scout Service</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 text-lg">
                  Professional business name research including ASIC availability checking, 
                  domain availability across multiple extensions, and optional trademark screening with AI-generated reports.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-blue-600 mr-3" />
                    <span>ASIC business name availability checking</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-blue-600 mr-3" />
                    <span>Domain availability (.com.au, .com, .net.au, .io)</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-blue-600 mr-3" />
                    <span>Similar name analysis and risk assessment</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-blue-600 mr-3" />
                    <span>Optional trademark screening (AU$50 add-on)</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-blue-600 mr-3" />
                    <span>AI-generated research summary and insights</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-blue-600 mr-3" />
                    <span>Professional PDF report delivered</span>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-muted/20 rounded-lg p-4 mb-6">
                  <h4 className="font-bold mb-2">Tier-Based Pricing:</h4>
                  <div className="space-y-1 text-sm">
                    <div>• <strong>Starter Plan:</strong> AU$99 one-time</div>
                    <div>• <strong>Professional Plan:</strong> AU$79 one-time (20% off)</div>
                    <div>• <strong>Enterprise Plan:</strong> AU$69 one-time (30% off)</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      * Trademark screening: AU$50 (free for Professional+ plans)
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <FileSearch className="w-5 h-5 mr-2" />
                  Start Name Scout Service
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Eligibility Requirements */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-6">Service Eligibility Requirements</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These specialized services are exclusively available to verified Australian businesses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Building className="w-6 h-6 mr-2 text-green-600" />
                Business Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-3" />
                  <span>Valid Australian Business Number (ABN)</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-3" />
                  <span>Australian-registered business address</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-3" />
                  <span>Active JBSAAS subscription (any tier)</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-3" />
                  <span>Valid business contact information</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                Geographic Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-3" />
                  <span>Business must be registered in Australia</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-3" />
                  <span>Services delivered during Australian business hours</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-3" />
                  <span>Support provided by Australian team</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-3" />
                  <span>Compliance with Australian business regulations</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Clock className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-6">Service Delivery Timeline</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our streamlined process ensures fast, professional service delivery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Order Placed</h3>
              <p className="text-muted-foreground">Payment processed and service request created</p>
              <div className="text-sm text-primary font-medium mt-2">Immediate</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Verification</h3>
              <p className="text-muted-foreground">ABN validation and business verification</p>
              <div className="text-sm text-primary font-medium mt-2">Within 24 hours</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Service Delivery</h3>
              <p className="text-muted-foreground">Professional setup and configuration</p>
              <div className="text-sm text-primary font-medium mt-2">2-5 business days</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Check</h3>
              <p className="text-muted-foreground">Testing, verification, and handover</p>
              <div className="text-sm text-primary font-medium mt-2">Same day completion</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Need Help Choosing?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our Australian team is here to help you select the right service for your business needs.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-bold mb-2">Phone Support</h3>
                <p className="text-muted-foreground mb-4">Speak directly with our Australian team</p>
                <Button variant="outline" className="w-full">
                  Request Callback
                </Button>
              </Card>
              
              <Card className="p-6">
                <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-bold mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-4">Get detailed information via email</p>
                <Button variant="outline" className="w-full">
                  Send Enquiry
                </Button>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button size="lg" className="bg-gradient-primary shadow-glow">
                  View All Pricing Plans
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/jbsaaslogo.png" 
                alt="JB-SaaS Logo" 
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

export default AustralianServices;