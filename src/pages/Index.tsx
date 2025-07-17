import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Zap, 
  Calendar, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  Rocket,
  Brain,
  Target,
  Shield
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import featuresImage from "@/assets/features-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/jbsaaslogo.png" 
                alt="JBSAAS Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-gradient-primary leading-none">JB-Software-As-A-Service</span>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-primary shadow-glow">Sign In</Button>
              </Link>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              <Link to="/auth">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-primary shadow-glow">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1
        }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in-up">
              <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-xs sm:text-sm">
                <Rocket className="w-3 h-3 mr-1" />
                Transform Your Business Today
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="text-gradient-hero">AI-Powered Content Creation</span> 
                <span className="text-gradient-primary"> Platform</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 leading-relaxed px-2 sm:px-0">
                Generate professional social media posts, blogs, and marketing content in seconds. 
                <strong className="text-foreground">No more expensive agencies or endless hours writing content.</strong>
              </p>
              
              <p className="text-xs text-muted-foreground mb-6 sm:mb-8 mx-2 sm:mx-0">
                <span className="font-semibold">*Social Media Publishing:</span> We create content and provide setup instructions for your social platforms. 
                For Australian customers, we offer full setup service for an additional fee.
              </p>
              
              <div className="flex justify-center lg:justify-start mb-6 sm:mb-8 px-4 sm:px-0">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full sm:w-auto cursor-not-allowed opacity-75"
                  disabled
                >
                  Coming in August 2025
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
                <div className="flex items-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success mr-1 sm:mr-2" />
                  No Setup Required
                </div>
                <div className="flex items-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success mr-1 sm:mr-2" />
                  Cancel Anytime
                </div>
                <div className="flex items-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success mr-1 sm:mr-2" />
                  Money Back Guarantee
                </div>
              </div>
            </div>
            
            <div className="flex justify-center animate-slide-in-right mt-8 lg:mt-0">
              <div className="relative max-w-sm sm:max-w-md lg:max-w-lg w-full px-4 sm:px-0">
                <img 
                  src={featuresImage} 
                  alt="JBSAAS Dashboard" 
                  className="rounded-xl sm:rounded-2xl shadow-2xl hover-lift w-full h-auto object-cover"
                />
              
                {/* Floating Stats */}
                <div className="absolute -bottom-1 sm:-bottom-2 lg:-bottom-6 -left-1 sm:-left-2 lg:-left-6 glass rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 float">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-1.5 sm:w-2 lg:w-3 h-1.5 sm:h-2 lg:h-3 bg-success rounded-full animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap">2,847 Posts Generated</span>
                  </div>
                </div>
                
                <div className="absolute -top-1 sm:-top-2 lg:-top-6 -left-1 sm:-left-2 lg:-left-6 glass rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 float-delayed">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Clock className="w-2.5 sm:w-3 lg:w-4 h-2.5 sm:h-3 lg:h-4 text-primary" />
                    <span className="text-[10px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap">Saved 94 Hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-muted/40 via-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gradient-primary mb-1 sm:mb-2">$50K+</div>
              <div className="text-xs sm:text-sm lg:text-base text-muted-foreground">Saved in Agency Fees</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gradient-primary mb-1 sm:mb-2">500+</div>
              <div className="text-xs sm:text-sm lg:text-base text-muted-foreground">Hours Automated</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gradient-primary mb-1 sm:mb-2">98%</div>
              <div className="text-xs sm:text-sm lg:text-base text-muted-foreground">Time Reduction</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gradient-primary mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm lg:text-base text-muted-foreground">Automated Publishing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              The <span className="text-gradient-hero">$10,000 Problem</span> Every Business Faces
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Business owners waste thousands on agencies and weeks on content creation. 
              There's a better way.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Before */}
            <Card className="card-premium p-8 border-destructive/20">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mr-4">
                    <DollarSign className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-2xl font-bold text-destructive">Before JBSAAS</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Pay $5,000-$15,000 to agencies monthly</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Wait weeks for content approval</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Spend 20+ hours weekly on social media</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Struggle with brand consistency</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Miss posting schedules constantly</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* After */}
            <Card className="card-premium p-8 border-success/20 bg-gradient-to-br from-success/5 to-primary/5">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mr-4">
                    <Sparkles className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-success">With JBSAAS</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium">Pay just $49/month for unlimited content</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium">Generate posts in under 30 seconds</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium">Spend 5 minutes weekly on content</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium">AI maintains perfect brand voice</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium">Never miss a post with auto-scheduling</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Button variant="premium" size="xl" className="group">
              <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Transform My Business Now
            </Button>
          </div>
        </div>
      </section>

      {/* What You Get - Real Feature Showcase */}
      <section id="features" className="py-20 bg-gradient-to-b from-background via-muted/10 to-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Brain className="w-3 h-3 mr-1" />
              Complete Business Intelligence Platform
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What You Get: <span className="text-gradient-primary">Enterprise-Level Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A sophisticated platform that replaces multiple expensive tools with one comprehensive solution.
            </p>
          </div>

          {/* Core Feature Modules */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Business Intelligence Dashboard */}
            <Card className="p-8 hover-lift group bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Business Intelligence Dashboard</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Advanced analytics with growth scoring, strategic recommendations, and automated insights to drive business decisions.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Growth Score Tracking & Analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Strategic Content Recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Cross-Platform Performance Analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">ROI & Engagement Reporting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Content Creation Engine */}
            <Card className="p-8 hover-lift group bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/20 shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">AI Content Creation Engine</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Generate professional blog posts, social media content, and ad copy with brand voice learning and consistency.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Brand Voice Learning & Consistency</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Blog, Social & Ad Copy Generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Industry-Specific Content Templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">AI Prompt Library Integration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Competitive Intelligence */}
            <Card className="p-8 hover-lift group bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20 shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Competitive Intelligence</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Automated competitor monitoring, content analysis, and actionable insights to stay ahead of your competition.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Automated Competitor Monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Content Performance Analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Actionable Strategic Insights</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Market Gap Identification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Multi-Business Management */}
            <Card className="p-8 hover-lift group bg-gradient-to-br from-primary/5 to-muted/10 border-2 border-primary/20 shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Multi-Business Management</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Manage multiple business profiles, share templates across brands, and get unified reporting for all your ventures.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Business Profile Switching</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Cross-Business Template Sharing</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Unified Analytics & Reporting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Role-Based Team Access Control</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 hover-lift group bg-gradient-to-br from-muted/25 to-muted/5 border-2 border-muted/40 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Content Calendar</h3>
                <p className="text-muted-foreground mb-4">
                  Visual scheduling with timeline management and multi-platform coordination.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="w-3 h-3 text-success mr-2" />
                    Timeline visualization
                  </li>
                  <li className="flex items-center">
                    <Check className="w-3 h-3 text-success mr-2" />
                    Publishing queue management
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover-lift group bg-gradient-to-br from-muted/25 to-muted/5 border-2 border-muted/40 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Template Library</h3>
                <p className="text-muted-foreground mb-4">
                  Public and private templates with AI prompt integration for consistent content.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="w-3 h-3 text-success mr-2" />
                    AI prompt templates
                  </li>
                  <li className="flex items-center">
                    <Check className="w-3 h-3 text-success mr-2" />
                    Usage analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover-lift group bg-gradient-to-br from-muted/25 to-muted/5 border-2 border-muted/40 shadow-lg">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Enterprise Security</h3>
                <p className="text-muted-foreground mb-4">
                  Role-based access control, audit logs, and compliance monitoring for business safety.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="w-3 h-3 text-success mr-2" />
                    User role management
                  </li>
                  <li className="flex items-center">
                    <Check className="w-3 h-3 text-success mr-2" />
                    Activity audit trails
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Value Proposition */}
          <div className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Replace $10,000+ in Business Tools</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
              Our platform combines the functionality of expensive business intelligence tools, content agencies, 
              competitive analysis services, and social media management platforms into one comprehensive solution.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span>• Business Intelligence Tools ($500+/month)</span>
              <span>• Content Agencies ($5,000+/month)</span>
              <span>• Competitive Analysis ($300+/month)</span>
              <span>• Social Media Management ($200+/month)</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Save $50,000+ This Year?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who've eliminated agency fees and automated their content creation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button variant="glass" size="xl" className="group">
              <Rocket className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
              Start Your Free Trial
            </Button>
            <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10">
              Schedule Demo
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm text-white/80">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-current mr-1" />
              4.9/5 Rating
            </div>
            <div>•</div>
            <div>No Credit Card Required</div>
            <div>•</div>
            <div>Setup in Under 5 Minutes</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-muted/20 to-muted/40 border-t border-border/50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/jbsaaslogo.png" 
                  alt="JB SAAS Logo" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-gradient-primary">JBSAAS</span>
              </div>
              <p className="text-muted-foreground">
                Transforming business content creation with AI-powered automation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 JBSAAS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
