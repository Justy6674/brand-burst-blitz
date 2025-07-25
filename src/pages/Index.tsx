import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Settings,
  Globe,
  Network,
  CheckCircle2
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

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
      
      <PublicHeader />

      {/* Hero Section - Mobile Optimized */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src={heroImage}
            alt="AI Marketing Hero Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-purple-900/60"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto animate-fade-in text-center">
            <Badge className="mb-6 md:mb-8 bg-black/40 backdrop-blur-sm text-white border-white/30 text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 font-semibold">
              🏥 TGA/AHPRA-Compliant Healthcare Content Platform
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 md:mb-8 leading-tight text-white">
              Australia's First <span className="text-yellow-400">TGA/AHPRA-Compliant</span><br />
              Content Platform for <span className="text-yellow-400">Healthcare Professionals</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-2">
              AI-powered patient education content and TGA/AHPRA-compliant marketing for GPs, Specialists, Allied Health, and Nurse Practitioners.
            </p>
            
            <div className="mb-8 md:mb-12">
              <p className="text-xl md:text-2xl font-bold text-yellow-400 mb-6 md:mb-8 px-2">
                $149/month replaces $16,000 in healthcare marketing agency costs
              </p>
              
              <div className="flex flex-col gap-4 md:gap-6 justify-center px-4">
                <Link to="/auth">
                  <Button variant="hero" size="xl">
                    <Target className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                    Join Healthcare Professionals Waitlist
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="secondary" size="xl">
                    <Rocket className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO Section - Mobile Optimized */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Circuit board macro technology background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-purple-900/85"></div>
        </div>
        
        {/* Section Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse animation-delay-500 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Who</span> <span className="text-gradient-primary">Desperately Needs This</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              Australian healthcare professionals trapped in non-compliant marketing that risks TGA/AHPRA violations and patient trust.
            </p>
          </div>
          
          <div className="grid gap-8">
            {[
              {
                title: "🩺 The Overwhelmed GP",
                description: "Managing 200+ patients weekly while creating TGA/AHPRA-compliant content. Every social media post risks $13,000+ fines for regulatory violations.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "🦴 The Growing Specialist", 
                description: "Need <span className='text-yellow-highlight'>patient education content</span> demonstrating expertise without making <span style='color: #ffd700; font-weight: 700;'>prohibited therapeutic claims</span>. Building trust while maintaining <span className='text-yellow-highlight'>professional boundaries</span>.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "🧠 The Allied Health Professional",
                description: "<span style='color: #ffd700; font-weight: 700;'>Psychology, Physiotherapy, OT, Dietician, Exercise Physiologist</span> compliance requirements. Need referral-generating content that meets <span className='text-yellow-highlight'>professional standards</span>.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "💉 The Nurse Practitioner",
                description: "<span style='color: #ffd700; font-weight: 700;'>Weight loss, telehealth, alternative medicine, sexual health</span> compliance challenges. Building practice visibility while navigating <span className='text-yellow-highlight'>strict advertising guidelines</span>.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "🏢 The Private Practice Entrepreneur",
                description: "Setting up <span style='color: #ffd700; font-weight: 700;'>private clinics, sole trader practices, or Pty Ltd healthcare businesses</span>. Need compliant marketing from day one while navigating <span className='text-yellow-highlight'>business registration, TGA/AHPRA obligations</span>, and patient acquisition strategies.",
                gradient: "from-orange-500/10 to-orange-600/10",
                border: "border-orange-500/20"
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

      {/* WHY Section - Mobile Optimized */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Colorful programming code technology background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-red-900/80 to-yellow-900/85"></div>
        </div>
        
        {/* Section Background Effects */}
        <div className="absolute top-0 left-0 w-52 h-52 bg-gradient-to-r from-red-500/15 to-transparent rounded-full blur-3xl animate-pulse z-10"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-l from-yellow-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-700 z-10"></div>
        <div className="relative z-20 container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-yellow-400">WHY</span> Healthcare Professionals <span className="text-gradient-primary">Need This Platform</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Five critical compliance and visibility problems threatening your practice every day you remain invisible.
            </p>
          </div>
          
          <div className="grid gap-8">
            {[
              {
                title: "⚖️ TGA/AHPRA Compliance Crisis",
                description: "Generic <span className='text-yellow-400 font-bold'>marketing violates TGA/AHPRA advertising guidelines</span> - risk <span className='text-yellow-400'>$13,000+ fines</span> and professional sanctions. Every social media post could trigger regulatory investigation without <span className='text-yellow-400'>compliant content systems</span>.",
                gradient: "from-red-500/10 to-red-600/10",
                border: "border-red-500/20"
              },
              {
                title: "🚫 TGA Therapeutic Claims",
                description: "Accidentally making <span style='color: #ffd700; font-weight: 700;'>prohibited therapeutic claims</span> without TGA approval. <span className='text-yellow-highlight'>ChatGPT, Gemini</span> and <span style='color: #ffd700; font-weight: 700;'>AI assistants</span> only recommend healthcare professionals with compliant <span style='color: #ffd700; font-weight: 700;'>online content</span>.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "👥 Patient Trust Boundaries",
                description: "Maintaining appropriate <span style='color: #ffd700; font-weight: 700;'>patient-practitioner relationships online</span>. Patient testimonials and reviews are <span className='text-yellow-highlight'>strictly prohibited by TGA/AHPRA</span> - but patients still need to find and trust you.",
                gradient: "from-yellow-500/10 to-yellow-600/10",
                border: "border-yellow-500/20"
              },
              {
                title: "🔍 Hidden Competitor Advantages", 
                description: "Your competitors are using <span style='color: #ffd700; font-weight: 700;'>subdomain strategies</span> to occupy <span className='text-yellow-highlight'>multiple Google search positions</span> for the same keywords. While you fight for one ranking, they dominate 3-5 positions with strategic subdomains.",
                gradient: "from-indigo-500/10 to-indigo-600/10",
                border: "border-indigo-500/20"
              },
              {
                title: "👥 Professional Invisibility", 
                description: "Patients ask <span style='color: #ffd700; font-weight: 700;'>AI for healthcare providers</span> - you're invisible to <span className='text-yellow-highlight'>ChatGPT recommendations</span>. Without quality patient education content, referral sources and patients can't find you.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "⏳ Content Creation Bottleneck",
                description: "TGA/AHPRA-compliant content takes 20+ hours weekly. You're either neglecting patient education or paying healthcare agencies thousands monthly for compliance-focused content creation.",
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

      {/* WHAT Section - Mobile Optimized */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Matrix code digital background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-green-900/80 to-orange-900/85"></div>
        </div>
        
        {/* Section Background Effects */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-l from-green-500/15 to-transparent rounded-full blur-3xl animate-pulse z-10"></div>
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-r from-orange-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-600 z-10"></div>
         <div className="relative z-20 container mx-auto px-4 md:px-6">
           <div className="text-center mb-12 md:mb-20">
             <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
               <span style={{color: '#ffd700', fontWeight: 700}}>What</span> You <span className="text-gradient-primary">Actually Get</span>
             </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
               TGA/AHPRA-compliant patient education platform with healthcare-specific compliance safeguards built into every feature.
             </p>
          </div>

           <div className="grid gap-6 md:gap-8">
             {[
                {
                  title: "🏥 TGA/AHPRA-Compliant Patient Education",
                  description: "Healthcare-trained AI creates <span style='color: #ffd700; font-weight: 700;'>patient education content</span>, condition explainers, and treatment information that builds trust without making <span style='color: #ffd700; font-weight: 700;'>prohibited therapeutic claims</span>. Every piece vetted for TGA/AHPRA compliance.",
                  gradient: "from-blue-500/10 to-blue-600/10",
                  border: "border-blue-500/20"
                },
                {
                  title: "🩺 Healthcare Professional Directory Optimization",
                  description: "<span style='color: #ffd700; font-weight: 700;'>AI optimizes your listings</span> for <span className='text-yellow-highlight'>HealthEngine, HotDoc, and medical directories</span>. Ensures patients and AI agents like <span style='color: #ffd700; font-weight: 700;'>ChatGPT find and recommend you</span> for relevant health conditions.",
                  gradient: "from-purple-500/10 to-purple-600/10",
                  border: "border-purple-500/20"
                },
                {
                  title: "📊 TGA-Compliant Content Monitoring",
                  description: "<span style='color: #ffd700; font-weight: 700;'>Real-time compliance scanning</span> prevents accidental therapeutic claims that could trigger <span className='text-yellow-highlight'>TGA violations</span>. Built-in safeguards for medical device advertising and supplement promotion.",
                  gradient: "from-green-500/10 to-green-600/10",
                  border: "border-green-500/20"
                },
                {
                  title: "🎯 Professional Referral Network Building",
                  description: "Create <span style='color: #ffd700; font-weight: 700;'>professional relationship content</span> that encourages <span className='text-yellow-highlight'>GP referrals and specialist collaboration</span>. Educational content that demonstrates expertise to fellow healthcare professionals.",
                  gradient: "from-orange-500/10 to-orange-600/10",
                  border: "border-orange-500/20"
                },
                {
                  title: "⚕️ Clinical Authority Content Creation",
                  description: "<span style='color: #ffd700; font-weight: 700;'>Evidence-based content</span> that positions you as a trusted healthcare authority. Research citations, clinical guideline references, and <span className='text-yellow-highlight'>professional credential highlighting</span> that builds patient confidence.",
                  gradient: "from-red-500/10 to-red-600/10",
                  border: "border-red-500/20"
                },
                {
                  title: "🛡️ Multi-Platform TGA/AHPRA Protection",
                  description: "Built-in protection across <span style='color: #ffd700; font-weight: 700;'>Facebook, Instagram, LinkedIn, and your website</span>. <span className='text-yellow-highlight'>Compliance review system</span> ensures every post meets TGA/AHPRA advertising guidelines and professional standards.",
                  gradient: "from-yellow-500/10 to-yellow-600/10",
                  border: "border-yellow-500/20"
                },
                {
                  title: "🌐 Competitive Subdomain Intelligence",
                  description: "Discover the <span style='color: #ffd700; font-weight: 700;'>hidden subdomain strategies</span> your competitors use to dominate search results. Our AI analyses competitor websites and suggests <span className='text-yellow-highlight'>powerful subdomain opportunities</span> that multiply your Google visibility and AI discoverability.",
                  gradient: "from-indigo-500/10 to-indigo-600/10",
                  border: "border-indigo-500/20"
                }
             ].map((feature, index) => (
               <Card key={index} className={`p-4 md:p-6 lg:p-8 hover-lift ${feature.border} bg-gradient-to-br ${feature.gradient}`}>
                 <CardContent className="p-0">
                   <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 leading-tight">{feature.title}</h3>
                   <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* The Subdomain Advantage Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Network connectivity background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-900/80 to-purple-900/85"></div>
        </div>
        
        {/* Section Background Effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse z-10"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-l from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse animation-delay-500 z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              The <span style={{color: '#ffd700', fontWeight: 700}}>Subdomain Advantage</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              Multiply your healthcare practice's online presence with strategic subdomains that dominate search results and AI recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 md:p-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Globe className="w-8 h-8 text-indigo-400" />
                  Multiple Entry Points for Patient Discovery
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Transform your single website into a powerful network of specialised patient portals:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <strong className="text-yellow-400">services.yourclinic.com.au</strong>
                      <p className="text-sm text-muted-foreground">Dedicated portal for all your healthcare services</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <strong className="text-yellow-400">conditions.yourclinic.com.au</strong>
                      <p className="text-sm text-muted-foreground">Patient education hub for medical conditions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <strong className="text-yellow-400">telehealth.yourclinic.com.au</strong>
                      <p className="text-sm text-muted-foreground">Virtual consultation booking and information</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <strong className="text-yellow-400">sydney.yourclinic.com.au</strong>
                      <p className="text-sm text-muted-foreground">Location-specific clinic information</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 md:p-8 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  Dominate Search Results & AI Recommendations
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  While competitors fight for one ranking, occupy multiple positions:
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2">Search Engine Benefits:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Each subdomain treated as separate domain by Google
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Multiple listings for same keywords
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Specialised content ranks higher
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2">AI Discovery Enhancement:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        ChatGPT scans multiple subdomains
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Increased recommendation probability
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Authority signals from domain network
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link to="/dashboard/seo-expansion">
              <Button size="xl" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-6 text-lg">
                <Network className="w-6 h-6 mr-3" />
                Discover Your Subdomain Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Colorful programming code background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-cyan-900/80 to-pink-900/85"></div>
        </div>
        
        {/* Section Background Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-l from-cyan-500/15 to-transparent rounded-full blur-3xl animate-pulse z-10"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-gradient-to-r from-pink-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-800 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>How</span> Healthcare <span className="text-gradient-primary">Content Compliance Works</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              Simple TGA/AHPRA-compliant content creation process that protects your practice while building patient trust and authority.
            </p>
          </div>

          <div className="grid gap-8">
            {[
              {
                title: "📋 Healthcare Compliance Assessment",
                description: "Complete our <span style='color: #ffd700; font-weight: 700;'>TGA/AHPRA-specific questionnaire</span> covering your practice type, specialization, and regulatory requirements. Our AI immediately creates your <span style='color: #ffd700; font-weight: 700;'>compliance profile</span> and patient education <span style='color: #ffd700; font-weight: 700;'>content strategy</span>.",
                gradient: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20"
              },
              {
                title: "🛡️ Professional Setup & TGA/AHPRA Verification",
                description: "Our healthcare compliance experts <span style='color: #ffd700; font-weight: 700;'>configure</span> your content systems with built-in <span style='color: #ffd700; font-weight: 700;'>TGA/AHPRA safeguards</span>, TGA compliance checks, and professional boundary <span style='color: #ffd700; font-weight: 700;'>protection</span>. Setup within 48 hours.",
                gradient: "from-green-500/10 to-green-600/10",
                border: "border-green-500/20"
              },
              {
                title: "🧠 AI-Powered Patient Education Content",
                description: "Healthcare-trained AI generates <span style='color: #ffd700; font-weight: 700;'>patient education content</span>, condition explainers, and practice information that builds trust without violating <span style='color: #ffd700; font-weight: 700;'>advertising guidelines</span> or making prohibited therapeutic claims.",
                gradient: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20"
              },
              {
                title: "📊 Compliance Monitoring & AI Visibility",
                description: "Continuous <span style='color: #ffd700; font-weight: 700;'>TGA/AHPRA compliance monitoring</span> ensures all content meets professional standards. Your educational content positions you as the <span style='color: #ffd700; font-weight: 700;'>trusted expert</span> ChatGPT and AI agents recommend to patients.",
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
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Matrix digital code technology background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-violet-900/80 to-emerald-900/85"></div>
        </div>
        
        {/* Section Background Effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-violet-500/15 to-transparent rounded-full blur-3xl animate-pulse z-10"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-l from-emerald-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-900 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>When</span> You Need <span className="text-gradient-primary">This Subscription</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              Critical business situations where this subscription becomes essential for survival and growth in today's digital marketplace.
            </p>
          </div>
          
          <div className="grid gap-6 md:gap-8">
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
              <Card key={index} className={`p-4 md:p-6 lg:p-8 hover-lift ${timing.border} bg-gradient-to-br ${timing.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 leading-tight">{timing.title}</h3>
                  <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">{timing.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Dynamic Tech Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image - Success/Growth Theme */}
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Financial growth charts and technology success background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/85 to-slate-900/90"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          {/* Tech Badge */}
          <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 mb-6 md:mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full backdrop-blur-sm">
            <Rocket className="w-4 h-4 md:w-5 md:h-5 mr-2 text-cyan-400 animate-bounce" />
            <span className="text-cyan-300 font-semibold tracking-wide text-xs md:text-sm">NEXT-GEN AI MARKETING</span>
            <Zap className="w-4 h-4 md:w-5 md:h-5 ml-2 text-yellow-400 animate-pulse" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent animate-fade-in">
              Stop Being Invisible.
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-fade-in animation-delay-300">
              Start Dominating.
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed animate-fade-in animation-delay-500 px-2">
            Join Australian businesses dominating their markets with <span style={{color: '#ffd700', fontWeight: 700}}>AI-powered content</span>.
          </p>
          
          {/* Dynamic CTA Button */}
          <div className="relative inline-block animate-fade-in animation-delay-700">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-red-600 to-blue-600 rounded-lg blur opacity-75 animate-pulse"></div>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                <Target className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                Join Waitlist Now
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
              </Button>
            </Link>
          </div>
          
          {/* Tech Stats */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-12 md:mt-16 animate-fade-in animation-delay-1000">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-yellow-400">98%</div>
              <div className="text-xs md:text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-cyan-400">24/7</div>
              <div className="text-xs md:text-sm text-gray-400">AI Working</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-green-400">$149</div>
              <div className="text-xs md:text-sm text-gray-400">Per Month</div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-12 md:py-16 bg-muted/20 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Product</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/features" className="text-sm md:text-base text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link to="/pricing" className="text-sm md:text-base text-muted-foreground hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Company</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/about" className="text-sm md:text-base text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link to="/blog" className="text-sm md:text-base text-muted-foreground hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Support</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/common-questions" className="text-sm md:text-base text-muted-foreground hover:text-foreground">FAQ</Link></li>
                <li><Link to="/contact" className="text-sm md:text-base text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Legal</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/privacy" className="text-sm md:text-base text-muted-foreground hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-6 md:pt-8 space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refunds" className="text-muted-foreground hover:text-white transition-colors">
                Refund Policy
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm md:text-base text-muted-foreground text-center sm:text-left">© 2024 JB-Health. All rights reserved.</p>
              <AdminAccess />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;