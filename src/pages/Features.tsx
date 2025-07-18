import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComingSoonPopup } from "@/components/common/ComingSoonPopup";
import PublicHeader from "@/components/layout/PublicHeader";
import { HeroSection } from "@/components/layout/HeroSection";
import { 
  Brain,
  BarChart3,
  Target,
  Calendar,
  Users,
  Zap,
  Shield,
  Globe,
  Sparkles,
  TrendingUp,
  Clock,
  Check,
  Star,
  Rocket
} from "lucide-react";
import featuresImage from "@/assets/features-image.jpg";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <HeroSection backgroundImage={featuresImage}>
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <Badge className="mb-6 bg-green-600 text-white border-green-500 text-lg px-6 py-2">
            🇦🇺 Built for Australian Businesses
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Everything You Need to <span className="text-gradient-hero">Dominate Digital Marketing</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-8">
            From AI content creation to competitor analysis, our comprehensive platform replaces multiple expensive tools with one powerful solution.
          </p>
          
          <ComingSoonPopup 
            trigger={
              <Button size="xl" className="bg-white text-primary hover:bg-white/90 font-bold">
                <Rocket className="w-6 h-6 mr-3" />
                Start Free Trial - August 2025
              </Button>
            } 
          />
        </div>
      </HeroSection>

      {/* Core Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-gradient-primary">Complete Business Intelligence</span> Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to automate, optimize, and scale your digital marketing efforts.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* AI Content Creation Engine */}
            <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:border-primary/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">AI Content Creation Engine</h3>
                    <p className="text-primary font-medium">Generate professional content in seconds</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Brand voice learning & consistency across all content</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Blog posts, social media content, and ad copy generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Industry-specific content templates and prompts</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>SEO optimization built into every piece of content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Business Intelligence Dashboard */}
            <Card className="p-8 border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-background hover:border-secondary/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Business Intelligence Dashboard</h3>
                    <p className="text-secondary font-medium">Advanced analytics and growth insights</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Growth score tracking with actionable insights</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Cross-platform performance analytics and reporting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Strategic content recommendations based on data</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>ROI tracking and conversion optimization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Competitive Intelligence */}
            <Card className="p-8 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-background hover:border-accent/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Competitive Intelligence</h3>
                    <p className="text-accent font-medium">Stay ahead with competitor insights</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Automated competitor content analysis and tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Market positioning insights and opportunities</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Content gap analysis and strategy recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Industry trends and market intelligence reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Scheduling & Automation */}
            <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:border-primary/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Smart Scheduling & Automation</h3>
                    <p className="text-primary font-medium">Set it and forget it publishing</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Optimal posting time recommendations per platform</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Multi-platform publishing with custom formatting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Content calendar management and planning tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Automated engagement and response management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Plus Everything Else You Need</h2>
            <p className="text-xl text-muted-foreground">Additional powerful features to complete your marketing toolkit</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground">Multi-user access with role-based permissions and approval workflows</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">API Integrations</h3>
                <p className="text-muted-foreground">Connect with your existing tools and workflows seamlessly</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Enterprise Security</h3>
                <p className="text-muted-foreground">Bank-level security with Australian data sovereignty compliance</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Multi-Platform Support</h3>
                <p className="text-muted-foreground">Facebook, Instagram, LinkedIn, Twitter, and more platforms</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Custom Branding</h3>
                <p className="text-muted-foreground">White-label solutions and custom branding for agencies</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">Australian-based support team available around the clock</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Why Australian Businesses Choose JB-SaaS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-4">Save 10+ Hours Weekly</h3>
              <p className="text-muted-foreground">Automate content creation and scheduling to focus on growing your business instead of managing social media</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Professional Results</h3>
              <p className="text-muted-foreground">AI-powered content that maintains your brand voice and drives real engagement and conversions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Australian Compliance</h3>
              <p className="text-muted-foreground">Built with Australian privacy laws and business requirements in mind, with local support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Marketing?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the waitlist and be among the first Australian businesses to access our revolutionary platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ComingSoonPopup 
              trigger={
                <Button size="xl" className="bg-gradient-primary shadow-glow font-bold">
                  <Rocket className="w-6 h-6 mr-3" />
                  Join Priority Waitlist
                </Button>
              } 
            />
            <Button size="xl" variant="outline" asChild>
              <Link to="/pricing">View Pricing Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;