import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PublicHeader from "@/components/layout/PublicHeader";
import { SystemLockdownBanner } from "@/components/common/SystemLockdownBanner";
import { StandardButton } from "@/components/common/StandardButton";

import { ComingSoonPopup } from "@/components/common/ComingSoonPopup";
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
      <SystemLockdownBanner />
      
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

      {/* Hero Section - Clinical Calm */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3f5f55]/90 via-[#6b8f7a]/80 to-[#3f5f55]/90"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto animate-fade-in text-center">
            <Badge className="mb-6 md:mb-8 bg-white/20 backdrop-blur-sm text-white border-white/30 text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 font-semibold">
              Clinical Dermatology Telehealth
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight text-white">
              Clinical skin health,<br />
              <span className="text-[#f7f2d3]">prescribed with care.</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-2">
              Personalised assessment and treatment plans for common skin concerns. Where clinically appropriate, prescription or compounded topical treatments may be recommended following consultation.
            </p>
            
            <div className="mb-8 md:mb-12">
              <div className="flex flex-col gap-4 md:gap-6 justify-center px-4">
                <StandardButton action="waitlist" variant="primary">
                  <Target className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                  Book a Consultation
                </StandardButton>
                <StandardButton action="pricing" variant="secondary">
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                  Learn More
                </StandardButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skin Concerns Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-primary/20 bg-card backdrop-blur-sm">
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight text-foreground">
              Skin Concerns <span className="text-gradient-primary">We Support</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              Evidence-based assessment and personalised treatment plans for a range of common skin concerns.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Acne & Congestion Support",
                description: "Assessment and management of acne, including hormonal acne. Personalised treatment plans tailored to your skin type and concerns.",
                gradient: "from-primary/10 to-secondary/10",
                border: "border-primary/20"
              },
              {
                title: "Rosacea & Redness Support",
                description: "Comprehensive assessment for rosacea and persistent redness. Evidence-based approaches to manage symptoms and support skin comfort.",
                gradient: "from-secondary/10 to-primary/10",
                border: "border-secondary/20"
              },
              {
                title: "Pigmentation & Uneven Tone",
                description: "Assessment of pigmentation concerns including melasma and sun damage. Personalised plans to support more even skin tone.",
                gradient: "from-primary/10 to-secondary/10",
                border: "border-primary/20"
              },
              {
                title: "Post-Weight-Loss Skin Support",
                description: "Skin quality support following significant weight changes. Addressing friction areas, irritation, and skin barrier concerns.",
                gradient: "from-secondary/10 to-primary/10",
                border: "border-secondary/20"
              },
              {
                title: "Skin Ageing & Sun Damage Prevention",
                description: "Prevention-focused care for long-term skin health. Assessment and plans to support skin longevity and protection.",
                gradient: "from-primary/10 to-secondary/10",
                border: "border-primary/20"
              },
              {
                title: "Skin Barrier Dysfunction",
                description: "Support for eczema, dermatitis, and compromised skin barriers where appropriate. Helping restore and maintain healthy skin function.",
                gradient: "from-secondary/10 to-primary/10",
                border: "border-secondary/20"
              }
            ].map((concern, index) => (
              <Card key={index} className={`p-6 md:p-8 hover-lift ${concern.border} bg-gradient-to-br ${concern.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 leading-tight text-foreground">{concern.title}</h3>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{concern.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-primary/20 bg-gradient-to-br from-[#3f5f55]/95 to-[#6b8f7a]/90">
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight text-white">
              How It <span className="text-[#f7f2d3]">Works</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed px-2">
              A simple, clinical process designed around your needs.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[
              {
                step: "1",
                title: "Book a Consultation",
                description: "Schedule your telehealth appointment at a time that suits you."
              },
              {
                step: "2",
                title: "Complete Intake",
                description: "Share your skin history and upload photos if requested."
              },
              {
                step: "3",
                title: "Clinician Assessment",
                description: "A qualified clinician reviews your case thoroughly."
              },
              {
                step: "4",
                title: "Personalised Plan",
                description: "Receive your tailored treatment recommendations."
              },
              {
                step: "5",
                title: "Optional Follow-up",
                description: "Book follow-up consultations to track progress."
              }
            ].map((item, index) => (
              <Card key={index} className="p-6 hover-lift bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-0 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#f7f2d3] text-[#3f5f55] flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-primary/20 bg-card backdrop-blur-sm">
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight text-foreground">
              Our <span className="text-gradient-primary">Approach</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
              Evidence-based care focused on long-term skin health, not quick fixes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Assessment-Led Care",
                description: "Every treatment plan begins with a thorough clinical assessment. We understand your skin before recommending any approach.",
                gradient: "from-primary/10 to-secondary/10",
                border: "border-primary/20"
              },
              {
                title: "Evidence-Based",
                description: "Our recommendations are grounded in clinical evidence and dermatological best practice, not trends or fads.",
                gradient: "from-secondary/10 to-primary/10",
                border: "border-secondary/20"
              },
              {
                title: "Personalised Plans",
                description: "No two skin types are the same. Your treatment plan is tailored to your specific concerns, history, and goals.",
                gradient: "from-primary/10 to-secondary/10",
                border: "border-primary/20"
              },
              {
                title: "Skin Longevity Focus",
                description: "We prioritise long-term skin health over short-term results. Prevention and maintenance are key to lasting outcomes.",
                gradient: "from-secondary/10 to-primary/10",
                border: "border-secondary/20"
              },
              {
                title: "Telehealth Convenience",
                description: "Access clinical dermatology care from the comfort of your home. No travel, no waiting rooms.",
                gradient: "from-primary/10 to-secondary/10",
                border: "border-primary/20"
              },
              {
                title: "Ongoing Support",
                description: "Skin health is a journey. We offer follow-up consultations to monitor progress and adjust plans as needed.",
                gradient: "from-secondary/10 to-primary/10",
                border: "border-secondary/20"
              }
            ].map((item, index) => (
              <Card key={index} className={`p-6 md:p-8 hover-lift ${item.border} bg-gradient-to-br ${item.gradient}`}>
                <CardContent className="p-0">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 leading-tight text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-primary/20 bg-gradient-to-br from-[#3f5f55] to-[#6b8f7a]">
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight text-white">
            Ready to take control of your <span className="text-[#f7f2d3]">skin health?</span>
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed px-2">
            Book a consultation and receive a personalised assessment from our clinical team.
          </p>
          
          <StandardButton action="waitlist" variant="primary">
            <Target className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
            Book Your Consultation
          </StandardButton>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-12 md:mt-16">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-[#f7f2d3]">TGA</div>
              <div className="text-xs md:text-sm text-white/70">Compliant</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-[#f7f2d3]">Australian</div>
              <div className="text-xs md:text-sm text-white/70">Clinicians</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 md:px-6 py-3 md:py-4">
              <div className="text-xl md:text-2xl font-bold text-[#f7f2d3]">Telehealth</div>
              <div className="text-xs md:text-sm text-white/70">Australia-wide</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-[#3f5f55] text-white border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-[#f7f2d3]">Services</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/all-services" className="text-sm md:text-base text-white/70 hover:text-white">Skin Concerns</Link></li>
                <li><Link to="/features" className="text-sm md:text-base text-white/70 hover:text-white">Our Approach</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-[#f7f2d3]">Resources</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/blog" className="text-sm md:text-base text-white/70 hover:text-white">Skin Health Articles</Link></li>
                <li><Link to="/common-questions" className="text-sm md:text-base text-white/70 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-[#f7f2d3]">Contact</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/contact" className="text-sm md:text-base text-white/70 hover:text-white">Get in Touch</Link></li>
                <li><Link to="/pricing" className="text-sm md:text-base text-white/70 hover:text-white">Consultations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-[#f7f2d3]">Legal</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/privacy" className="text-sm md:text-base text-white/70 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Compliance Statements */}
          <div className="border-t border-white/10 pt-6 md:pt-8 mb-6 md:mb-8">
            <div className="text-xs md:text-sm text-white/60 space-y-2 max-w-4xl">
              <p>This website provides general information only and does not replace medical advice.</p>
              <p>Prescription treatments are only recommended if clinically appropriate following assessment.</p>
              <p>We do not advertise prescription-only medicines. Results vary between individuals and are not guaranteed.</p>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/downscalederm-icon.png" alt="Downscale Derm" className="w-8 h-8" />
              <p className="text-sm md:text-base text-white/70 text-center sm:text-left">© 2025 Downscale Derm. All rights reserved.</p>
            </div>
            <AdminAccess />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;