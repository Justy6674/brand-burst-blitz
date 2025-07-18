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

      {/* Critical Problems Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-8 bg-destructive/10 text-destructive border-destructive/20 text-lg px-6 py-3">
              <DollarSign className="w-5 h-5 mr-2" />
              5 Critical Business Problems
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Why You Desperately <span className="text-gradient-primary">Need This Platform</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Five critical business problems destroying your growth every day you remain invisible.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-8">
            {[
              {
                title: "🔍 Google Invisibility Crisis",
                description: "Without regular, SEO-optimized content, Google doesn't rank your business. 70% of clicks go to the first 5 search results.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "🤖 AI Agent Exclusion",
                description: "ChatGPT and AI assistants only recommend businesses with quality online content. You're invisible.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "⚖️ Compliance Nightmares",
                description: "Generic content violates regulations: TGA fines ($50K+), ASIC action, professional standards breaches.",
                gradient: "from-yellow-500/10 to-yellow-600/10",
                border: "border-yellow-500/20"
              },
              {
                title: "👀 Competitor Blindness",
                description: "Your competitors use content strategies you can't see. They capture customers with unknown approaches.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "⏰ Content Bottleneck",
                description: "Quality content takes 20+ hours weekly. You're either neglecting marketing or paying $8,000+/month.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              }
            ].map((problem, index) => (
              <Card key={index} className={`p-8 hover-lift ${problem.border} bg-gradient-to-br ${problem.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-xl font-bold mb-4 leading-tight">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-8 bg-primary/10 text-primary border-primary/20 text-lg px-6 py-3">
              <Brain className="w-5 h-5 mr-2" />
              Complete Platform Features
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Our Business Intelligence <span className="text-gradient-primary">Automation Engine</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {[
              {
                icon: Brain,
                title: "AI Content Intelligence",
                description: "Advanced AI generates industry-specific, compliant content that converts.",
                features: ["Industry-specific generation", "Compliance safeguards", "Brand voice learning", "Quality scoring"]
              },
              {
                icon: BarChart3,
                title: "Competitor Analysis Engine", 
                description: "Automated competitor monitoring reveals winning strategies and market gaps.",
                features: ["Automated scanning", "Strategy analysis", "Gap identification", "Performance benchmarking"]
              },
              {
                icon: Target,
                title: "SEO & AI Optimization",
                description: "Content optimized for Google rankings and AI agent recommendations.",
                features: ["Real-time SEO scoring", "AI agent optimization", "Keyword automation", "Meta optimization"]
              },
              {
                icon: Calendar,
                title: "Advanced Scheduling",
                description: "Intelligent publishing calendar with cross-platform automation.",
                features: ["Calendar publishing", "Multi-platform automation", "Performance analytics", "Queue management"]
              }
            ].map((feature, index) => (
              <Card key={index} className="p-10 hover-lift border-primary/20">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check className="w-5 h-5 text-success mr-3" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
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