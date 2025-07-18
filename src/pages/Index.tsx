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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Modern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
        
        {/* Clean Geometric Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-100/30 to-transparent rounded-full blur-3xl"></div>
        
        {/* Modern Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-noise"></div>
      </div>
      
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
      <section className="relative py-16 md:py-24 bg-background overflow-hidden">
        {/* Section Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse animation-delay-500"></div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Who</span> <span className="text-gradient-primary">Desperately Needs This</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Australian business owners trapped in expensive, ineffective marketing solutions who are losing ground to competitors daily.
            </p>
          </div>
          
          <div className="grid gap-8">
            {[
              {
                title: "🎯 The Frustrated Owner",
                description: "Paying <span className='text-yellow-highlight'>$8,000+ monthly</span> for agencies that don't understand your business. Watching <span className='text-yellow-highlight'>competitors</span> get more <span style='color: #ffd700; font-weight: 700;'>visibility</span> with worse products.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "⏰ The Time-Strapped Entrepreneur", 
                description: "Spending <span className='text-yellow-highlight'>20+ hours weekly</span> on <span style='color: #ffd700; font-weight: 700;'>content creation</span> instead of running your business. Missing <span className='text-yellow-highlight'>opportunities</span> while stuck in <span style='color: #ffd700; font-weight: 700;'>marketing</span> tasks.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "🚀 The Growth-Ready Business",
                description: "Ready to scale but <span className='text-yellow-highlight'>invisible to <span style='color: #ffd700; font-weight: 700;'>Google</span></span> and ignored by <span style='color: #ffd700; font-weight: 700;'>ChatGPT</span>. Knows content <span style='color: #ffd700; font-weight: 700;'>marketing</span> is critical but lacks the expertise.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "💭 The Dreamer",
                description: "Thinking about starting a <span style='color: #ffd700; font-weight: 700;'>business</span> (large or small) but overwhelmed by <span style='color: #ffd700; font-weight: 700;'>marketing complexity</span>. Needs a simple, affordable solution that works from day one.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              }
            ].map((audience, index) => (
              <Card key={index} className={`p-8 hover-lift ${audience.border} bg-gradient-to-br ${audience.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: audience.title }}></h3>
                  <p className="text-muted-foreground text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: audience.description }}></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-muted/20 to-background overflow-hidden">
        {/* Section Background Effects */}
        <div className="absolute top-0 left-0 w-52 h-52 bg-gradient-to-r from-red-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-l from-yellow-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-700"></div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-yellow-highlight">WHY</span> You Desperately <span className="text-gradient-primary">Need This Platform</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Five critical business problems destroying your growth every day you remain invisible.
            </p>
          </div>
          
          <div className="grid gap-8">
            {[
              {
                title: "🔍 Google Invisibility Crisis",
                description: "Without regular, <span style='color: #ffd700; font-weight: 700;'>SEO-optimised</span> <span style='color: #ffd700; font-weight: 700;'>content</span>, Google doesn't rank your business. <span style='color: #ffd700; font-weight: 700;'>Results</span> show that customers can't be <span style='color: #ffd700; font-weight: 700;'>found</span> when they search for your services.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "🤖 AI Agent Exclusion",
                description: "<span style='color: #ffd700; font-weight: 700;'>ChatGPT, Gemini</span> and <span style='color: #ffd700; font-weight: 700;'>AI assistants</span> only recommend businesses with quality <span style='color: #ffd700; font-weight: 700;'>online content</span>. <span className='text-yellow-highlight'>Customers</span> increasingly ask AI to find providers - you're invisible.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "⚖️ Compliance Nightmares",
                description: "Generic content creators violate regulations. <span style='color: #ffd700; font-weight: 700;'>Australian businesses</span> need <span style='color: #ffd700; font-weight: 700;'>compliant marketing</span> that protects your reputation and avoids costly fines.",
                gradient: "from-yellow-500/10 to-yellow-600/10",
                border: "border-yellow-500/20"
              },
              {
                title: "👁️ Competitor Intelligence Blindness", 
                description: "Your <span style='color: #ffd700; font-weight: 700;'>competitors</span> use <span className='text-yellow-highlight'>content</span> strategies you can't see or <span style='color: #ffd700; font-weight: 700;'>analyse</span>. They capture <span className='text-yellow-highlight'>customers</span> and <span className='text-yellow-highlight'>patients</span> with <span style='color: #ffd700; font-weight: 700;'>marketing</span> approaches you don't know about.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "⏳ Content Creation Bottleneck",
                description: "<span style='color: #ffd700; font-weight: 700;'>Quality, compliant content</span> takes 20+ hours weekly. You're either neglecting <span style='color: #ffd700; font-weight: 700;'>marketing</span> or paying agencies thousands monthly for poor <span className='text-yellow-highlight'>results</span>.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              }
            ].map((problem, index) => (
              <Card key={index} className={`p-8 hover-lift ${problem.border} bg-gradient-to-br ${problem.gradient} transition-all duration-300`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: problem.title }}></h3>
                  <p className="text-muted-foreground text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: problem.description }}></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT Section */}
      <section className="relative py-16 md:py-24 bg-background overflow-hidden">
        {/* Section Background Effects */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-l from-green-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-r from-orange-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-600"></div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>What</span> You <span className="text-gradient-primary">Actually Get</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Complete AI-powered marketing automation platform with professional Australian business services.
            </p>
          </div>

          <div className="grid gap-8">
            {[
              {
                title: "🧠 AI Content Generation Engine",
                description: "Advanced AI creates <span style='color: #ffd700; font-weight: 700;'>SEO-optimised blogs</span>, social posts, and <span style='color: #ffd700; font-weight: 700;'>marketing</span> copy that gets you <span style='color: #ffd700; font-weight: 700;'>found</span> on <span style='color: #ffd700; font-weight: 700;'>Google</span> and recommended by <span style='color: #ffd700; font-weight: 700;'>ChatGPT</span>. Industry-specific compliance built into every piece.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "🕵️ Competitor Intelligence Scanning",
                description: "<span style='color: #ffd700; font-weight: 700;'>Automated monitoring</span> reveals exactly what <span className='text-yellow-highlight'>content</span> strategies are working for your competitors. Discover their <span className='text-yellow-highlight'>winning approaches</span> and <span style='color: #ffd700; font-weight: 700;'>market gaps</span> you can exploit.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "📅 Advanced Publishing & Scheduling",
                description: "<span style='color: #ffd700; font-weight: 700;'>Smart calendar-based</span> publishing across <span style='color: #ffd700; font-weight: 700;'>Facebook, Instagram, LinkedIn</span>, and your <span style='color: #ffd700; font-weight: 700;'>blog</span>. Performance <span style='color: #ffd700; font-weight: 700;'>analytics</span> track what's working and optimise automatically.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "⚙️ Professional Social Media Setup",
                description: "Expert <span style='color: #ffd700; font-weight: 700;'>configuration</span> of <span className='text-yellow-highlight'>Facebook Business Manager</span>, Instagram Business, and LinkedIn with <span style='color: #ffd700; font-weight: 700;'>Australian compliance</span> verification. $199-299 value included.",
                gradient: "from-orange-500/10 to-orange-600/10",
                border: "border-orange-500/20"
              },
              {
                title: "🔍 Name Scout Research Service",
                description: "<span style='color: #ffd700; font-weight: 700;'>ASIC</span> availability, <span style='color: #ffd700; font-weight: 700;'>domain</span> research, and <span style='color: #ffd700; font-weight: 700;'>trademark</span> screening for your business name. Complete business registration guidance. $69-99 value included.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "🛡️ Industry Compliance Safeguards",
                description: "Built-in protection for <span style='color: #ffd700; font-weight: 700;'>AHPRA, TGA, ASIC</span>, and all Australian industry <span style='color: #ffd700; font-weight: 700;'>regulations</span>. <span className='text-yellow-highlight'>Quality review system</span> ensures every piece meets professional <span style='color: #ffd700; font-weight: 700;'>standards</span>.",
                gradient: "from-yellow-500/10 to-yellow-600/10",
                border: "border-yellow-500/20"
              }
            ].map((feature, index) => (
              <Card key={index} className={`p-8 hover-lift ${feature.border} bg-gradient-to-br ${feature.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: feature.title }}></h3>
                  <p className="text-muted-foreground text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }}></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-muted/20 to-background overflow-hidden">
        {/* Section Background Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-l from-cyan-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-gradient-to-r from-pink-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-800"></div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>How</span> Our <span className="text-gradient-primary">Subscription Works</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Simple monthly subscription gives you everything you need to dominate your market and eliminate expensive agencies forever.
            </p>
          </div>

          <div className="grid gap-8">
            {[
              {
                title: "📝 Sign Up & Business Analysis",
                description: "Choose your <span style='color: #ffd700; font-weight: 700;'>subscription</span> plan and complete our business questionnaire. Our AI immediately <span style='color: #ffd700; font-weight: 700;'>analyses</span> your industry, <span style='color: #ffd700; font-weight: 700;'>competitors</span>, and <span style='color: #ffd700; font-weight: 700;'>compliance</span> requirements to create your custom <span style='color: #ffd700; font-weight: 700;'>strategy</span>.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "⚙️ Professional Setup & Configuration",
                description: "Our experts <span style='color: #ffd700; font-weight: 700;'>configure</span> your <span style='color: #ffd700; font-weight: 700;'>social media</span> accounts, set up <span style='color: #ffd700; font-weight: 700;'>analytics</span> tracking, and ensure everything meets Australian <span style='color: #ffd700; font-weight: 700;'>compliance</span> standards. Complete setup within 48 hours.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "🤖 Automated Content Creation & Publishing",
                description: "AI generates and publishes <span style='color: #ffd700; font-weight: 700;'>SEO-optimised content</span> daily across all platforms. <span style='color: #ffd700; font-weight: 700;'>Competitor intelligence</span> updates automatically, keeping you ahead of market trends.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "📊 Monthly Optimisation & Reporting",
                description: "Receive detailed <span style='color: #ffd700; font-weight: 700;'>performance reports</span> and strategic recommendations. Our AI continuously <span style='color: #ffd700; font-weight: 700;'>learns and optimises</span> your <span className='text-yellow-highlight'>content</span> for maximum <span style='color: #ffd700; font-weight: 700;'>Google</span> visibility and <span style='color: #ffd700; font-weight: 700;'>AI agent</span> recommendations.",
                gradient: "from-orange-500/10 to-orange-600/10",
                border: "border-orange-500/20"
              }
            ].map((step, index) => (
              <Card key={index} className={`p-8 hover-lift ${step.border} bg-gradient-to-br ${step.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: step.title }}></h3>
                  <p className="text-muted-foreground text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: step.description }}></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHEN Section */}
      <section className="relative py-16 md:py-24 bg-background overflow-hidden">
        {/* Section Background Effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-violet-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-l from-emerald-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-900"></div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>When</span> You Need <span className="text-gradient-primary">This Subscription</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Critical business situations where this subscription becomes essential for survival and growth in today's digital marketplace.
            </p>
          </div>
          
          <div className="grid gap-8">
            {[
              {
                title: "🚨 Right Now - Emergency Visibility Crisis",
                description: "You're <span className='text-yellow-highlight'>invisible on Google</span>, ignored by AI agents, and <span style='color: #ffd700; font-weight: 700;'>bleeding customers</span> to competitors. Every day you wait costs you potential revenue and market share.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "📋 Agency Contract Renewal Time", 
                description: "Your current agency wants <span className='text-yellow-highlight'>$8,000+ monthly</span> with no guarantee of <span className='text-yellow-highlight'>results</span>. Our subscription gives you better <span className='text-yellow-highlight'>results</span> for <span className='text-yellow-highlight'>$149/month</span> with full <span style='color: #ffd700; font-weight: 700;'>transparency and control</span>.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "📈 Business Scaling Phase",
                description: "You're ready to <span style='color: #ffd700; font-weight: 700;'>expand</span> but need consistent, compliant <span style='color: #ffd700; font-weight: 700;'>marketing</span> that scales with you. Our AI handles <span className='text-yellow-highlight'>increasing content demands</span> without increasing costs.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "⚠️ Compliance Deadline Pressure",
                description: "<span style='color: #ffd700; font-weight: 700;'>Industry regulations</span> are tightening and generic <span className='text-yellow-highlight'>content</span> puts you at risk. Our built-in <span className='text-yellow-highlight'>compliance safeguards</span> protect you from costly violations and penalties.",
                gradient: "from-yellow-500/10 to-yellow-600/10",
                border: "border-yellow-500/20"
              },
              {
                title: "💼 ROI Justification Required",
                description: "You need to prove <span className='text-yellow-highlight'>marketing ROI</span> to stakeholders or investors. Our detailed <span className='text-yellow-highlight'>analytics</span> and <span className='text-yellow-highlight'>$11,551 monthly savings</span> provide clear, measurable <span style='color: #ffd700; font-weight: 700;'>business value</span>.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              }
            ].map((timing, index) => (
              <Card key={index} className={`p-8 hover-lift ${timing.border} bg-gradient-to-br ${timing.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: timing.title }}></h3>
                  <p className="text-muted-foreground text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: timing.description }}></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Dynamic Tech Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Tech Particles */}
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-10 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
          
          {/* Firework Burst Effects */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="absolute w-16 h-16 border border-yellow-400/30 rounded-full animate-ping"></div>
              <div className="absolute w-12 h-12 border border-yellow-400/50 rounded-full animate-ping animation-delay-150"></div>
              <div className="absolute w-8 h-8 border border-yellow-400/70 rounded-full animate-ping animation-delay-300"></div>
            </div>
          </div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          {/* Glowing Orbs */}
          <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-full blur-xl animate-pulse animation-delay-500"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Tech Badge */}
          <div className="inline-flex items-center px-6 py-3 mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full backdrop-blur-sm">
            <Rocket className="w-5 h-5 mr-2 text-cyan-400 animate-bounce" />
            <span className="text-cyan-300 font-semibold tracking-wide">NEXT-GEN AI MARKETING</span>
            <Zap className="w-5 h-5 ml-2 text-yellow-400 animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent animate-fade-in">
              Stop Being Invisible.
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-fade-in animation-delay-300">
              Start Dominating.
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in animation-delay-500">
            Join Australian businesses dominating their markets with <span style={{color: '#ffd700', fontWeight: 700}}>AI-powered content</span>.
          </p>
          
          {/* Dynamic CTA Button */}
          <div className="relative inline-block animate-fade-in animation-delay-700">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-red-600 to-blue-600 rounded-lg blur opacity-75 animate-pulse"></div>
            <ComingSoonPopup 
              trigger={
                <Button className="relative bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold text-xl px-12 py-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-2xl border-0">
                  <Target className="w-6 h-6 mr-3 animate-pulse" />
                  Start Your Transformation
                  <Sparkles className="w-6 h-6 ml-3 animate-spin" />
                </Button>
              } 
            />
          </div>
          
          {/* Tech Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in animation-delay-1000">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-4">
              <div className="text-2xl font-bold text-yellow-400">98%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-4">
              <div className="text-2xl font-bold text-cyan-400">24/7</div>
              <div className="text-sm text-gray-400">AI Working</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-4">
              <div className="text-2xl font-bold text-green-400">$149</div>
              <div className="text-sm text-gray-400">Per Month</div>
            </div>
          </div>
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