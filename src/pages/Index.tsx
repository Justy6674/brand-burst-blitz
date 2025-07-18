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
    setTimeout(() => setClickCount(0), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
      <GeoDetection />
      <PublicHeader />

      {/* Hero Section */}
      <HeroSection backgroundImage={heroImage} overlayIntensity="heavy">
        <div className="max-w-5xl mx-auto animate-fade-in text-center">
          <Badge className="mb-8 bg-primary/10 text-primary border-primary/20 text-lg px-6 py-3">
            🎯 Complete AI Marketing Automation & SEO Platform
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-white">
            Be Found on <span className="text-yellow-400">Google</span><br />
            Recommended by <span className="text-yellow-400">AI Agents</span>
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto">
            Automated content creation, competitor intelligence, and professional setup for Australian businesses across all industries.
          </p>
          
          <div className="mb-12">
            <p className="text-2xl font-bold text-yellow-400 mb-8">
              $149/month replaces $11,700 in agency costs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <ComingSoonPopup 
                trigger={
                  <Button variant="hero" size="xl" className="text-xl px-12 py-6">
                    <Target className="w-6 h-6 mr-3" />
                    Get Started Now
                  </Button>
                } 
              />
              <ComingSoonPopup 
                trigger={
                  <Button variant="outline-white" size="xl" className="text-xl px-12 py-6">
                    <Rocket className="w-6 h-6 mr-3" />
                    View Pricing
                  </Button>
                } 
              />
            </div>
          </div>
        </div>
      </HeroSection>

      {/* WHO Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Who <span className="text-gradient-primary">Desperately Needs This</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Australian business owners trapped in expensive, ineffective marketing solutions who are losing ground to competitors daily.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "🎯 The Frustrated Owner",
                description: "Paying $8,000+ monthly for agencies that don't understand your business. Watching competitors get more visibility with worse products.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "⏰ The Time-Strapped Entrepreneur", 
                description: "Spending 20+ hours weekly on content creation instead of running your business. Missing opportunities while stuck in marketing tasks.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "🚀 The Growth-Ready Business",
                description: "Ready to scale but invisible to Google and ignored by ChatGPT. Knows content marketing is critical but lacks the expertise.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              }
            ].map((audience, index) => (
              <Card key={index} className={`p-8 hover-lift ${audience.border} bg-gradient-to-br ${audience.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight">{audience.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{audience.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY Section */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Why You Desperately <span className="text-gradient-primary">Need This Platform</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Five critical business problems destroying your growth every day you remain invisible.
            </p>
          </div>
          
          <div className="grid gap-8">
            {[
              {
                title: "Google Invisibility Crisis",
                description: "Without regular, SEO-optimized content, Google doesn't rank your business. 70% of clicks go to the first 5 search results - you're nowhere to be found.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "AI Agent Exclusion",
                description: "ChatGPT, Gemini, and AI assistants only recommend businesses with quality online content. Customers increasingly ask AI 'find me a good provider' - you're invisible.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "Compliance Nightmares",
                description: "Generic content creators violate regulations: TGA fines for health ($50K+), ASIC action for finance, professional standards breaches across all industries.",
                gradient: "from-yellow-500/10 to-yellow-600/10",
                border: "border-yellow-500/20"
              },
              {
                title: "Competitor Intelligence Blindness", 
                description: "Your competitors use content strategies you can't see or analyze. They capture customers with approaches you don't know about.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "Content Creation Bottleneck",
                description: "Quality, compliant content takes 20+ hours weekly. You're either neglecting marketing or paying agencies $8,000+/month.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              }
            ].map((problem, index) => (
              <Card key={index} className={`p-8 hover-lift ${problem.border} bg-gradient-to-br ${problem.gradient} transition-all duration-300`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight">{problem.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              What You <span className="text-gradient-primary">Actually Get</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Complete AI-powered marketing automation platform with professional Australian business services.
            </p>
          </div>

          <div className="grid gap-8">
            {[
              {
                title: "AI Content Generation Engine",
                description: "Advanced AI creates SEO-optimized blogs, social posts, and marketing copy that gets you found on Google and recommended by ChatGPT. Industry-specific compliance built into every piece.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "Competitor Intelligence Scanning",
                description: "Automated monitoring reveals exactly what content strategies are working for your competitors. Discover their winning approaches and market gaps you can exploit.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "Advanced Publishing & Scheduling",
                description: "Smart calendar-based publishing across Facebook, Instagram, LinkedIn, and your blog. Performance analytics track what's working and optimize automatically.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "Professional Social Media Setup",
                description: "Expert configuration of Facebook Business Manager, Instagram Business, and LinkedIn with Australian compliance verification. $199-299 value included.",
                gradient: "from-orange-500/10 to-orange-600/10",
                border: "border-orange-500/20"
              },
              {
                title: "Name Scout Research Service",
                description: "ASIC availability, domain research, and trademark screening for your business name. Complete business registration guidance. $69-99 value included.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "Industry Compliance Safeguards",
                description: "Built-in protection for AHPRA, TGA, ASIC, and all Australian industry regulations. Quality review system ensures every piece meets professional standards.",
                gradient: "from-yellow-500/10 to-yellow-600/10",
                border: "border-yellow-500/20"
              }
            ].map((feature, index) => (
              <Card key={index} className={`p-8 hover-lift ${feature.border} bg-gradient-to-br ${feature.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW Section */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              How Our <span className="text-gradient-primary">Subscription Works</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Simple monthly subscription gives you everything you need to dominate your market and eliminate expensive agencies forever.
            </p>
          </div>

          <div className="grid gap-8">
            {[
              {
                title: "Sign Up & Business Analysis",
                description: "Choose your subscription plan and complete our business questionnaire. Our AI immediately analyzes your industry, competitors, and compliance requirements to create your custom strategy.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "Professional Setup & Configuration",
                description: "Our experts configure your social media accounts, set up analytics tracking, and ensure everything meets Australian compliance standards. Complete setup within 48 hours.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "Automated Content Creation & Publishing",
                description: "AI generates and publishes SEO-optimized content daily across all platforms. Competitor intelligence updates automatically, keeping you ahead of market trends.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "Monthly Optimization & Reporting",
                description: "Receive detailed performance reports and strategic recommendations. Our AI continuously learns and optimizes your content for maximum Google visibility and AI agent recommendations.",
                gradient: "from-orange-500/10 to-orange-600/10",
                border: "border-orange-500/20"
              }
            ].map((step, index) => (
              <Card key={index} className={`p-8 hover-lift ${step.border} bg-gradient-to-br ${step.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHEN Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              When You Need <span className="text-gradient-primary">This Subscription</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Critical business situations where this subscription becomes essential for survival and growth in today's digital marketplace.
            </p>
          </div>
          
          <div className="grid gap-8">
            {[
              {
                title: "Right Now - Emergency Visibility Crisis",
                description: "You're invisible on Google, ignored by AI agents, and bleeding customers to competitors. Every day you wait costs you potential revenue and market share.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "Agency Contract Renewal Time", 
                description: "Your current agency wants $8,000+ monthly with no guarantee of results. Our subscription gives you better results for $149/month with full transparency and control.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "Business Scaling Phase",
                description: "You're ready to expand but need consistent, compliant marketing that scales with you. Our AI handles increasing content demands without increasing costs.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "Compliance Deadline Pressure",
                description: "Industry regulations are tightening and generic content puts you at risk. Our built-in compliance safeguards protect you from costly violations and penalties.",
                gradient: "from-yellow-500/10 to-yellow-600/10",
                border: "border-yellow-500/20"
              },
              {
                title: "ROI Justification Required",
                description: "You need to prove marketing ROI to stakeholders or investors. Our detailed analytics and $11,551 monthly savings provide clear, measurable business value.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              }
            ].map((timing, index) => (
              <Card key={index} className={`p-8 hover-lift ${timing.border} bg-gradient-to-br ${timing.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight">{timing.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{timing.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Stop Being Invisible. <span className="text-gradient-primary">Start Dominating.</span>
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Join Australian businesses dominating their markets with AI-powered content.
          </p>
          
          <ComingSoonPopup 
            trigger={
              <Button variant="premium" size="xl" className="text-xl px-12 py-6">
                <Target className="w-6 h-6 mr-3" />
                Start Your Transformation
              </Button>
            } 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-muted/20 border-t">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-6">Product</h3>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Company</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Support</h3>
              <ul className="space-y-3">
                <li><Link to="/common-questions" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Legal</h3>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex justify-between items-center">
            <p className="text-muted-foreground">© 2024 JB-SaaS. All rights reserved.</p>
            <AdminAccess />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;