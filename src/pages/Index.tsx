import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ComingSoonPopup } from "@/components/common/ComingSoonPopup";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { GeoDetection } from "@/components/geo/GeoDetection";
import { HeroSection } from "@/components/layout/HeroSection";

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use Supabase edge function to verify admin password securely
      const { data, error } = await supabase.functions.invoke('verify-admin-access', {
        body: { password }
      });
      
      if (error || !data?.isValid) {
        setPassword("");
        return;
      }
      
      window.location.href = "/dashboard/blog-admin";
    } catch (error) {
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
      {/* Geo Detection Banner */}
      <GeoDetection />
      
      {/* Use standardized PublicHeader */}
      <PublicHeader />

      {/* Hero Section */}
      <HeroSection backgroundImage={heroImage}>
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Badge className="mb-6 sm:mb-8 bg-green-600 text-white border-green-500 hover:bg-green-700 text-sm sm:text-base">
            🇦🇺 Australian Businesses Only
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight text-white">
            <span className="block mb-2">Stop Being Invisible</span> 
            <span className="text-gradient-hero block">to Google & ChatGPT</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto">
            Transform your business from invisible to irresistible with AI-powered content that gets you found on Google and recommended by ChatGPT.
            <span className="text-white block mt-4 font-bold">$149/month replaces $11,700 in agency costs.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
            <ComingSoonPopup 
              trigger={
                <Button variant="hero" size="lg">
                  <Target className="w-5 h-5 mr-3" />
                  Get Started
                </Button>
              } 
            />
            <ComingSoonPopup 
              trigger={
                <Button variant="outline-white" size="lg">
                  <Rocket className="w-5 h-5 mr-3" />
                  View Pricing
                </Button>
              } 
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base text-white/80">
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
      </HeroSection>

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
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-primary mb-1 sm:mb-2">90%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Time Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-600 text-white border-green-500">
              <Users className="w-4 h-4 mr-2" />
              WHO This Platform Serves
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Australian Business Owners Who Are <span className="text-gradient-hero">Losing Ground Daily</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ambitious Australian business owners who know they need modern marketing but are trapped in expensive, ineffective solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 hover-lift border-primary/20">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">The Frustrated Owner</h3>
                <p className="text-muted-foreground text-sm">
                  Paying $8,000+ monthly for agencies that don't understand your business. 
                  Watching competitors get more visibility with worse products.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift border-secondary/20">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">The Time-Strapped Entrepreneur</h3>
                <p className="text-muted-foreground text-sm">
                  Spending 20+ hours weekly on content creation instead of running your business. 
                  Missing opportunities while stuck in marketing tasks.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift border-accent/20">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">The Growth-Ready Business</h3>
                <p className="text-muted-foreground text-sm">
                  Ready to scale but invisible to Google and ignored by ChatGPT. 
                  Knows content marketing is critical but lacks the expertise.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* WHY Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-destructive/10 text-destructive border-destructive/20">
              <DollarSign className="w-4 h-4 mr-2" />
              WHY This Costs You $11,700 Monthly
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              The Brutal Economics of <span className="text-gradient-hero">Being Invisible</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every day you're invisible to Google and ignored by ChatGPT, your competitors capture customers who should be yours.
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
                  <h3 className="text-2xl font-bold text-destructive">Your Current Reality</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground"><strong>Agency costs:</strong> $8,000/month for generic content that doesn't convert</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground"><strong>Your lost time:</strong> 20 hours weekly × $200/hour = $3,200/month in earning potential</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground"><strong>Google invisibility:</strong> No fresh content = no search rankings = lost customers</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground"><strong>ChatGPT exclusion:</strong> AI agents won't recommend businesses without quality content</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground"><strong>Compliance risks:</strong> Generic agencies create dangerous content - advertising prescription services inappropriately, promoting unavailable services (e.g., doctor vs nurse practitioner), risking regulatory violations</span>
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
                    <span className="text-foreground font-medium"><strong>Total cost:</strong> $149/month = $11,551 monthly savings</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium"><strong>Time returned:</strong> 80 hours monthly freed up for revenue generation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium"><strong>Google discovery:</strong> Fresh blogs = higher rankings = more customers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium"><strong>AI recommendations:</strong> ChatGPT & Gemini suggest quality businesses</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <span className="text-foreground font-medium"><strong>Industry compliance:</strong> AHPRA, TGA, and sector-specific safeguards built into every piece of content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <ComingSoonPopup 
              trigger={
                <Button variant="premium" size="xl" className="group">
                  <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Stop Losing Money Now
                </Button>
              } 
            />
          </div>
        </div>
      </section>

      {/* HOW Section */}
      <section id="features" className="py-16 sm:py-24 bg-gradient-to-b from-background via-muted/10 to-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 text-sm sm:text-base px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              HOW Our AI-Powered System Works
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-8 leading-tight">
              Our Business Intelligence <span className="text-gradient-primary block sm:inline">Automation Engine</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Advanced AI analyzes your industry, learns your brand voice, monitors competitors, and creates content that gets you discovered by Google and recommended by ChatGPT.
            </p>
          </div>

          {/* Core Intelligence Modules */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 mb-12 sm:mb-20">
            {/* AI Content Intelligence */}
            <Card className="p-4 sm:p-6 lg:p-8 hover-lift group bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-primary/50">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <Brain className="w-8 h-8 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">AI Content Intelligence</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Our AI learns your business, industry, and brand voice to create Google-crawlable blogs and engaging social content that gets you found and recommended.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Creates SEO-optimized blogs for Google discovery</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Generates social content that builds authority</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Learns your brand voice for consistency</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Produces content that ChatGPT can recommend</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Industry-specific compliance (AHPRA, TGA) built into every piece</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Competitor Intelligence Engine */}
            <Card className="p-8 hover-lift group bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/20 shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Competitor Intelligence Engine</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Stop playing catch-up. Our system monitors your top competitors' content, posting patterns, and engagement metrics to identify winning strategies and content gaps.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Tracks competitor posting schedules automatically</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Analyzes their highest-performing content</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Identifies content gaps you can exploit</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Suggests content that outperforms theirs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Calendar Automation */}
            <Card className="p-8 hover-lift group bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20 shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Smart Calendar Automation</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Your content calendar runs itself. AI suggests optimal posting times, automates publishing, and ensures consistent brand presence across all platforms.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">AI determines best posting times for your audience</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Automatically publishes across all platforms</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Visual drag-drop calendar interface</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Never miss a posting deadline again</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Performance Analytics Dashboard */}
            <Card className="p-8 hover-lift group bg-gradient-to-br from-primary/5 to-muted/10 border-2 border-primary/20 shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-glow">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Performance Analytics Dashboard</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Know exactly what's working. Track Google rankings, social engagement, competitor performance, and ROI in real-time dashboards.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Google search ranking improvements</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Social media engagement metrics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">Competitor performance comparisons</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-success mr-3" />
                    <span className="font-medium">ROI calculation and cost savings reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      {/* WHAT Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              WHAT Exactly You Get & What Changes
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your Complete <span className="text-gradient-hero">Digital Transformation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop wondering what you'll actually receive. Here's the complete breakdown of tools, content, and results.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* What You Get */}
            <Card className="p-8 hover-lift border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mr-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">What You Actually Get</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">SEO-Optimized Blog Posts:</strong>
                      <p className="text-sm text-muted-foreground">4-8 monthly blogs targeting your industry keywords, written by AI that understands Google's ranking factors</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Social Media Content:</strong>
                      <p className="text-sm text-muted-foreground">20+ monthly posts optimized for Facebook, Instagram, LinkedIn - all brand-consistent and engagement-focused</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Competitor Intelligence Reports:</strong>
                      <p className="text-sm text-muted-foreground">Weekly analysis of your top 10 competitors' content strategy, posting patterns, and performance metrics</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Automated Publishing Calendar:</strong>
                      <p className="text-sm text-muted-foreground">AI-determined optimal posting times with drag-drop scheduling and automatic publishing</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Performance Analytics Dashboard:</strong>
                      <p className="text-sm text-muted-foreground">Real-time tracking of Google rankings, social engagement, ROI calculations, and competitor comparisons</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* What Changes */}
            <Card className="p-8 hover-lift border-success/20 bg-gradient-to-br from-success/5 to-background">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">What Actually Changes</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Google Visibility:</strong>
                      <p className="text-sm text-muted-foreground">From invisible to page 1 rankings within 3-6 months through consistent, keyword-optimized blog content</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">ChatGPT Recommendations:</strong>
                      <p className="text-sm text-muted-foreground">AI agents start suggesting your business when people ask for industry recommendations in your area</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Your Daily Schedule:</strong>
                      <p className="text-sm text-muted-foreground">20 hours weekly freed up from content creation, planning, and posting - focus on what generates revenue</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Competitive Position:</strong>
                      <p className="text-sm text-muted-foreground">From reactive to proactive - know what works before competitors do, capture market share strategically</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-success mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Monthly Cash Flow:</strong>
                      <p className="text-sm text-muted-foreground">$11,551 monthly savings from eliminated agency costs, tools, and time waste</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <div className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 border border-primary/20 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Replace $11,700 in Monthly Business Costs</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
              Stop paying separately for content agencies, business intelligence tools, competitive analysis services, and social media management platforms. Our $149/month solution replaces them all.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="font-semibold text-destructive">Content Agency</div>
                <div className="text-muted-foreground">$8,000/month</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="font-semibold text-destructive">Your Time Cost</div>
                <div className="text-muted-foreground">$3,200/month</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="font-semibold text-destructive">Multiple Tools</div>
                <div className="text-muted-foreground">$500/month</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="font-semibold text-success">JB-SaaS Total</div>
                <div className="text-success font-bold">$149/month</div>
              </div>
            </div>
            <div className="mt-6 text-xl font-bold text-success">
              Monthly Savings: $11,551 | Yearly Savings: $138,612
            </div>
          </div>

        </div>
      </section>

      {/* WHEN Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">
              <Clock className="w-4 h-4 mr-2" />
              WHEN Your New Reality Starts
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your New <span className="text-gradient-hero">Daily, Weekly & Monthly</span> Reality
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop wondering when you'll see results. Here's exactly when your business transformation happens and what your new schedule looks like.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Search Engine Discovery */}
            <Card className="p-8 hover-lift bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20 shadow-xl">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 shadow-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">1. Google Search Discovery</h3>
                <p className="text-muted-foreground mb-6">
                  <strong>The Reality:</strong> Google crawls websites looking for fresh, relevant content. Businesses with regular blogs rank 434% higher. 
                  <strong className="text-foreground"> No blog content = invisible in search results = lost customers.</strong>
                </p>
                <div className="bg-primary/5 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-primary">What Google's Algorithm Looks For:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Fresh content published regularly (blogs, articles, guides)</li>
                    <li>• Industry expertise demonstrated through valuable content</li>
                    <li>• Active website signals (recent posts, updates, engagement)</li>
                  </ul>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>SEO-optimized blogs</strong> target keywords your customers search for</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Educational content</strong> positions you as the industry expert</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Regular publishing</strong> signals active business to search engines</span>
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
                <h3 className="text-2xl font-bold mb-4 text-foreground">2. Social Media Engagement</h3>
                <p className="text-muted-foreground mb-6">
                  <strong>The Reality:</strong> Social platforms prioritize accounts that post consistently with engaging content. 
                  <strong className="text-foreground"> Irregular posting = algorithm ignores you = followers never see your content.</strong>
                </p>
                <div className="bg-secondary/5 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-secondary">Different Content, Different Purpose:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• <strong>Blogs:</strong> Build authority, answer questions, drive Google rankings</li>
                    <li>• <strong>Social:</strong> Create emotional connection, build community, drive engagement</li>
                    <li>• <strong>Both needed:</strong> Blogs get you found, social media converts browsers into buyers</li>
                  </ul>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Consistent posting</strong> increases algorithm visibility and reach</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Authentic storytelling</strong> builds emotional customer relationships</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Cross-platform presence</strong> captures customers wherever they spend time</span>
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
                <h3 className="text-2xl font-bold mb-4 text-foreground">3. AI Agent Recommendations</h3>
                <p className="text-muted-foreground mb-6">
                  <strong>The Future is Now:</strong> ChatGPT, Gemini, and Grok analyze business content quality when making recommendations. 
                  <strong className="text-foreground"> Poor online presence = excluded from AI suggestions = missed opportunities.</strong>
                </p>
                <div className="bg-accent/5 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-accent">What AI Agents Analyze:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Content quality, accuracy, and helpfulness</li>
                    <li>• Consistency of posting and messaging</li>
                    <li>• Industry expertise demonstrated through valuable content</li>
                    <li>• Customer engagement and satisfaction signals</li>
                  </ul>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Quality content</strong> gets your business recommended by AI assistants</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Expert positioning</strong> through blogs builds AI trust scores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-success mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Consistent messaging</strong> helps AI understand your value proposition</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* The Brutal Reality */}
          <div className="text-center bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5 rounded-2xl p-8 mb-12 border border-destructive/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">The Brutal Truth About "Trial and Error" Marketing</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-4xl mx-auto">
              Most businesses waste months and thousands on <strong className="text-foreground">"let's try this and see what happens"</strong> marketing. 
              Meanwhile, their competitors are using data to know exactly what works BEFORE they post.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="text-left">
                <h4 className="font-semibold text-destructive mb-3">What "Trial and Error" Costs You:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• $3,000+ monthly on content that doesn't convert</li>
                  <li>• 6+ months to discover what messaging actually works</li>
                  <li>• Lost customers to competitors with better strategy</li>
                  <li>• Missed opportunities while you're "experimenting"</li>
                  <li>• No Google rankings because content isn't optimized</li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-success mb-3">What Data-Driven Content Gets You:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Know what works from competitor analysis</li>
                  <li>• Content optimized for Google rankings</li>
                  <li>• Consistent posting that builds authority</li>
                  <li>• AI-recommended content that engages</li>
                  <li>• 20 hours weekly freed up for revenue generation</li>
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
            <ComingSoonPopup 
              trigger={
                <Button variant="glass" size="xl" className="group">
                  <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Your Free Trial
                </Button>
              } 
            />
            <Button 
              variant="outline-white" 
              size="xl" 
              asChild
            >
              <Link to="/pricing">
                <DollarSign className="w-5 h-5 mr-2" />
                View Pricing Plans
              </Link>
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
               <p className="text-muted-foreground mb-4">
                 AI-powered marketing content creation platform designed specifically for Australian businesses.
               </p>
               <div className="space-y-2 text-sm">
                 <div className="flex items-center text-green-600 font-medium">
                   <span className="mr-2">🇦🇺</span>
                   100% Australian Owned & Operated
                 </div>
                 <div className="flex items-center text-muted-foreground">
                   <span className="mr-2">📍</span>
                   Brisbane, Queensland, Australia
                 </div>
                 <div className="flex items-center text-muted-foreground">
                   <span className="mr-2">🛡️</span>
                   Compliant with Australian Privacy Principles
                 </div>
               </div>
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
          <div className="border-t border-border/30 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-muted-foreground space-y-4 sm:space-y-0">
            <p>&copy; 2025 JB-SaaS. All rights reserved. Australian Business Number: [ABN to be added]</p>
            {/* Hidden Admin Access - Click 5 times */}
            <AdminAccess />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
