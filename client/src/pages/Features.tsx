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
          <Badge className="mb-6 bg-black/40 backdrop-blur-sm text-white border-white/30 text-lg px-6 py-2 font-semibold">
            🏥 AHPRA-Compliant Healthcare Content Platform
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Everything Australian Healthcare Professionals Need to <span className="text-gradient-hero">Stay Compliant & Grow</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-8">
            From AHPRA-compliant content creation to patient education, our comprehensive platform replaces multiple expensive healthcare marketing tools with one powerful solution.
          </p>
          
          <ComingSoonPopup 
            trigger={
              <Button size="xl" className="bg-white text-primary hover:bg-white/90 font-bold">
                <Rocket className="w-6 h-6 mr-3" />
                Join Healthcare Professionals Waitlist
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
              <span className="text-gradient-primary">AHPRA-Compliant Healthcare</span> Content Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything Australian healthcare professionals need to create compliant content, educate patients, and grow their practice.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* AHPRA-Compliant Patient Education Generator */}
            <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:border-primary/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">AHPRA-Compliant Patient Education Generator</h3>
                    <p className="text-primary font-medium">Create compliant educational content in seconds</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Automatic AHPRA advertising guideline compliance validation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Patient education content for all healthcare specialties</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>TGA therapeutic claims screening and prevention</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Professional boundary maintenance in all content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Healthcare Practice Performance Insights */}
            <Card className="p-8 border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-background hover:border-secondary/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Healthcare Practice Performance Insights</h3>
                    <p className="text-secondary font-medium">Analytics designed for healthcare professionals</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Patient engagement tracking across educational content</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Healthcare practice growth metrics and referral tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>AHPRA compliance score monitoring and alerts</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Professional development content recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Ethical Healthcare Practice Intelligence */}
            <Card className="p-8 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-background hover:border-accent/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Ethical Healthcare Practice Intelligence</h3>
                    <p className="text-accent font-medium">Stay ahead with compliant competitor insights</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Healthcare practice content analysis within ethical boundaries</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Patient education trends in your healthcare specialty</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>AHPRA-compliant content gap identification</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Healthcare market positioning within professional standards</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Healthcare Professional Social Presence */}
            <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:border-primary/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Healthcare Professional Social Presence</h3>
                    <p className="text-primary font-medium">Compliant scheduling and patient engagement</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Optimal posting times for healthcare professional audiences</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Multi-platform publishing with AHPRA compliance formatting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Patient education calendar management and planning</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span>Professional boundary-compliant engagement management</span>
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
            <h2 className="text-3xl font-bold mb-6">Plus Everything Healthcare Professionals Need</h2>
            <p className="text-xl text-muted-foreground">Additional powerful features to complete your healthcare practice toolkit</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Healthcare Team Collaboration</h3>
                <p className="text-muted-foreground">Multi-practitioner access with role-based permissions and AHPRA-compliant approval workflows</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Healthcare System Integrations</h3>
                <p className="text-muted-foreground">Connect with Australian practice management systems, patient portals, and healthcare workflows</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-anchor mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Healthcare Privacy & Security</h3>
                <p className="text-muted-foreground">Australian Privacy Principles for health information with patient data protection compliance</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Healthcare Multi-Platform Support</h3>
                <p className="text-muted-foreground">Facebook, Instagram, LinkedIn, Twitter, and more platforms with healthcare compliance</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Healthcare Custom Branding</h3>
                <p className="text-muted-foreground">White-label solutions and custom branding for healthcare marketing agencies</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">24/7 Healthcare Support</h3>
                <p className="text-muted-foreground">Australian-based support team available around the clock for healthcare professionals</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Why Australian Healthcare Professionals Choose JB-SaaS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-4">Save 15+ Hours Weekly</h3>
              <p className="text-muted-foreground">Automate AHPRA-compliant content creation and patient education to focus on patient care instead of compliance paperwork</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Professional Healthcare Results</h3>
              <p className="text-muted-foreground">AI-powered content that maintains professional standards and drives real patient engagement and referrals</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Australian Healthcare Compliance</h3>
              <p className="text-muted-foreground">Built with AHPRA guidelines, TGA regulations, and Australian healthcare privacy requirements with local healthcare support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Healthcare Practice?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the waitlist and be among the first Australian healthcare professionals to access our revolutionary AHPRA-compliant platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ComingSoonPopup 
              trigger={
                <Button size="xl" className="bg-gradient-primary shadow-glow font-bold">
                  <Rocket className="w-6 h-6 mr-3" />
                  Join Healthcare Professionals Waitlist
                </Button>
              } 
            />
            <Button size="xl" variant="outline" asChild>
              <Link to="/pricing">View Healthcare Pricing Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
