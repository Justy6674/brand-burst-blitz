import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
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
  Shield,
  Settings
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import featuresImage from "@/assets/features-image.jpg";

// Hidden Admin Access Component
const AdminAccess = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      setShowDialog(true);
      setClickCount(0);
    }
    // Reset click count after 3 seconds
    setTimeout(() => setClickCount(0), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "jbsaas2025") {
      window.location.href = "/dashboard/blog-admin";
    } else {
      setPassword("");
    }
  };

  return (
    <>
      <button 
        onClick={handleLogoClick}
        className="p-2 rounded-full hover:bg-muted/20 transition-colors opacity-30 hover:opacity-60"
        title="Admin Access"
      >
        <Settings className="w-4 h-4" />
      </button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full">
              Access Blog Admin
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Use standardized PublicHeader */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/20 to-background/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Badge className="mb-6 sm:mb-8 bg-green-600 text-white border-green-500 hover:bg-green-700 text-sm sm:text-base">
              🇦🇺 Australian Businesses Only
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="text-gradient-hero block mb-2">AI Marketing Content</span> 
              <span className="text-gradient-primary block">for Australian Businesses</span>
            </h1>
            
            {/* Simplified tagline - removed redundant text */}
            
            <p className="text-lg sm:text-xl md:text-2xl text-foreground font-semibold mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto">
              Generate professional social media posts, blogs, and marketing content in seconds. 
              <strong className="text-foreground block mt-2">Plans from $49/month - No more expensive agencies or endless hours writing content.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
              <Button 
                variant="hero" 
                size="xl" 
                className="text-lg px-8 py-4"
                asChild
              >
                <Link to="/auth">
                  <Rocket className="w-5 h-5 mr-3" />
                  Start Free Trial
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base text-muted-foreground">
              <div className="flex items-center">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-2" />
                Australian-Owned & Operated
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-2" />
                Industry-Specific AI Content
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-2" />
                Local Business Support
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-10 bg-gradient-to-b from-muted/40 via-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-primary/40 backdrop-blur-sm shadow-md hover:border-primary/60 transition-colors">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-primary mb-1 sm:mb-2">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">AI-Powered Platform</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-primary/40 backdrop-blur-sm shadow-md hover:border-primary/60 transition-colors">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-primary mb-1 sm:mb-2">10+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Enterprise Features</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-primary/40 backdrop-blur-sm shadow-md hover:border-primary/60 transition-colors">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-primary mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Platform Availability</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-primary/40 backdrop-blur-sm shadow-md hover:border-primary/60 transition-colors">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-primary mb-1 sm:mb-2">Aug</div>
              <div className="text-xs sm:text-sm text-muted-foreground">2025 Launch Date</div>
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
                  <h3 className="text-2xl font-bold text-destructive">Before JB-SaaS</h3>
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
                  <h3 className="text-2xl font-bold text-success">With JB-SaaS</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium">Plans from $49/month for up to 100 posts</span>
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

      {/* Enhanced Features Showcase - Mobile-First Design */}
      <section id="features" className="py-16 sm:py-24 bg-gradient-to-b from-background via-muted/10 to-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 text-sm sm:text-base px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              Complete Business Intelligence Platform
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-8 leading-tight">
              What You Get: <span className="text-gradient-primary block sm:inline">Enterprise-Level Features</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              A sophisticated platform that replaces multiple expensive tools with one comprehensive solution.
            </p>
          </div>

          {/* Enhanced Core Feature Modules - Mobile Optimized */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 mb-12 sm:mb-20">
            {/* Enhanced Business Intelligence Dashboard */}
            <Card className="p-4 sm:p-6 lg:p-8 hover-lift group bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-primary/50">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <BarChart3 className="w-8 h-8 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">Business Intelligence Dashboard</h3>
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

          {/* Australian Services Highlight */}
          <div className="text-center mb-12 sm:mb-16">
            <Card className="p-6 sm:p-8 border-2 border-green-500/30 bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 shadow-xl">
              <CardContent className="p-0">
                <Badge className="mb-4 bg-green-600 text-white">
                  🇦🇺 Australian Businesses Only
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Specialized Australian Services</h3>
                <p className="text-muted-foreground mb-6">
                  Complete social media setup service and business name research designed exclusively for Australian businesses.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">Quick-Start Social Setup</div>
                    <div className="text-sm text-muted-foreground">From AU$199 - Full Facebook & Instagram setup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">Name & Domain Scout</div>
                    <div className="text-sm text-muted-foreground">From AU$79 - ASIC & trademark research</div>
                  </div>
                </div>
                <Link to="/australian-services">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Learn About Australian Services
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Advanced Features Grid - Mobile First */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-16">
            <Card className="p-4 sm:p-6 hover-lift group bg-gradient-to-br from-muted/25 to-muted/5 border-2 border-muted/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-muted/70">
              <CardContent className="p-0">
                <div className="w-14 h-14 sm:w-12 sm:h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <Calendar className="w-7 h-7 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">Content Calendar</h3>
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

      {/* Why This Matters - Education Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Brain className="w-3 h-3 mr-1" />
              Why Content Strategy Matters
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How Businesses <span className="text-gradient-primary">Get Discovered</span> Online
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Most businesses struggle with trial and error in digital marketing. 
              Understanding how search engines, social platforms, and AI agents work is crucial for success.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Search Engine Discovery */}
            <Card className="p-8 hover-lift bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20 shadow-xl">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 shadow-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Search Engine Visibility</h3>
                <p className="text-muted-foreground mb-6">
                  Google and Bing algorithms prioritize websites with fresh, relevant blog content. 
                  Without regular content updates, your business becomes invisible in search results.
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>Regular blog posts improve search rankings</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>SEO-optimized content drives organic traffic</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>Fresh content signals active business to search engines</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Social Media Engagement */}
            <Card className="p-8 hover-lift bg-gradient-to-br from-secondary/5 to-background border-2 border-secondary/20 shadow-xl">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-6 shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Social Media Discovery</h3>
                <p className="text-muted-foreground mb-6">
                  Consistent, creative social media content builds brand awareness and trust. 
                  Platform algorithms favor accounts that post regularly with engaging, authentic content.
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>Regular posting increases algorithm visibility</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>Authentic content builds customer relationships</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>Cross-platform presence expands reach</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Agent Discovery */}
            <Card className="p-8 hover-lift bg-gradient-to-br from-accent/5 to-background border-2 border-accent/20 shadow-xl">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-6 shadow-glow">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">AI Agent Recognition</h3>
                <p className="text-muted-foreground mb-6">
                  The future is AI agents recommending businesses. They analyze content quality, 
                  consistency, and relevance to suggest services. Quality content = AI recommendations.
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>AI agents analyze content for recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>Quality content improves AI trust scores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span>Consistent messaging builds AI understanding</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* The Problem */}
          <div className="text-center bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5 rounded-2xl p-8 mb-12 border border-destructive/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">The Reality Most Businesses Face</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-4xl mx-auto">
              Creating creative, accurate, honest, regular, and relatable content is <strong className="text-foreground">extremely time-consuming and expensive</strong>. 
              Most businesses resort to trial and error, wasting months and thousands of dollars on ineffective strategies.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="text-left">
                <h4 className="font-semibold text-destructive mb-3">Common Struggles:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Inconsistent posting schedules</li>
                  <li>• Generic, boring content that doesn't engage</li>
                  <li>• No understanding of what competitors are doing</li>
                  <li>• Wasting money on agencies that don't understand your business</li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-destructive mb-3">The Cost:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 20+ hours weekly on content creation</li>
                  <li>• $5,000-$15,000 monthly on agencies</li>
                  <li>• Missed opportunities due to poor online presence</li>
                  <li>• Lost customers to competitors with better content</li>
                </ul>
              </div>
            </div>
          </div>

          {/* The Solution */}
          <div className="text-center bg-gradient-to-r from-success/5 via-success/10 to-success/5 rounded-2xl p-8 border border-success/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Our One-Stop Solution</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-4xl mx-auto">
              We provide an <strong className="text-foreground">easy, comprehensive platform</strong> that lets you emulate successful businesses in your industry. 
              Our AI analyzes what works, creates content that converts, and handles the strategy so you can focus on running your business.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-success" />
                </div>
                <h4 className="font-semibold text-success mb-2">Learn from the Best</h4>
                <p className="text-sm text-muted-foreground">Analyze successful competitors and emulate their strategies</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-success" />
                </div>
                <h4 className="font-semibold text-success mb-2">AI-Powered Creation</h4>
                <p className="text-sm text-muted-foreground">Generate creative, accurate content that matches your brand voice</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-success" />
                </div>
                <h4 className="font-semibold text-success mb-2">Automated Strategy</h4>
                <p className="text-sm text-muted-foreground">Regular, consistent posting that builds your online presence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Dashboard Background */}
      <section className="py-20 relative overflow-hidden">
        {/* Dashboard Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${featuresImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-hero opacity-95"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Transform Your Content Strategy
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience a comprehensive platform that combines AI content creation, business intelligence, 
            and competitive analysis in one sophisticated solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              variant="glass" 
              size="xl" 
              className="group cursor-not-allowed opacity-75"
              disabled
            >
              <Rocket className="w-5 h-5 mr-2" />
              Coming August 2025
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm text-white/80">
            <div>Enterprise-Grade Platform</div>
            <div>•</div>
            <div>Professional Content Solutions</div>
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
                  alt="JB-SaaS Logo" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-gradient-primary">JB-SaaS</span>
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
          <div className="border-t border-border/30 mt-8 pt-8 flex justify-between items-center text-muted-foreground">
            <p>&copy; 2024 JB-SaaS. All rights reserved.</p>
            {/* Hidden Admin Access - Click 5 times */}
            <AdminAccess />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
