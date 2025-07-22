import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { 
  Users, 
  FileSearch, 
  ArrowRight, 
  Building, 
  Heart,
  Zap, 
  Brain, 
  Target, 
  Shield,
  BarChart3,
  Calendar,
  Search,
  Globe,
  Camera,
  Settings,
  Briefcase,
  Crown
} from "lucide-react";
import featuresImage from '@/assets/features-image.jpg';

const AustralianServices = () => {
  const platformFeatures = [
    {
      icon: Brain,
      title: "AI Content Creation Hub",
      description: "Advanced AI content generation with Australian compliance",
      features: [
        "Industry-specific AI content generation",
        "Blog posts, social media, marketing copy", 
        "Australian compliance built-in (AHPRA, TGA, ASIC)",
        "Brand voice training and consistency",
        "SEO optimization for Google visibility"
      ]
    },
    {
      icon: FileSearch,
      title: "Content Management System", 
      description: "Complete content library and publishing workflow",
      features: [
        "Draft, scheduled, and published content library",
        "Content versioning and revision history",
        "Bulk editing and batch operations",
        "Content performance tracking",
        "Tag and category organization"
      ]
    },
    {
      icon: Globe,
      title: "Social Media Command Center",
      description: "Unified social media management platform", 
      features: [
        "Facebook, Instagram, LinkedIn integration",
        "Multi-account management dashboard",
        "Cross-platform publishing",
        "Social media account setup service",
        "Automated posting schedules"
      ]
    },
    {
      icon: Calendar,
      title: "Smart Content Calendar",
      description: "Strategic content planning and automated scheduling",
      features: [
        "Visual content calendar interface",
        "Drag-and-drop scheduling", 
        "Multi-platform publishing calendar",
        "Campaign planning and coordination",
        "Automated posting queues"
      ]
    },
    {
      icon: Target,
      title: "Competitor Intelligence Suite",
      description: "AI-powered competitor analysis and market monitoring",
      features: [
        "Automated competitor content tracking",
        "Market gap analysis and opportunities",
        "Content performance comparisons", 
        "Strategic recommendations engine",
        "Industry trend identification"
      ]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive performance insights and reporting",
      features: [
        "Real-time content performance metrics",
        "Social media engagement analytics",
        "SEO ranking and visibility tracking",
        "ROI and conversion reporting", 
        "Custom dashboard widgets"
      ]
    },
    {
      icon: Settings,
      title: "Professional Content Templates",
      description: "Industry-specific templates for every business need",
      features: [
        "Industry-specific content templates",
        "Custom template creation tools",
        "Template library and sharing",
        "Variable placeholders and automation",
        "Brand-consistent formatting"
      ]
    },
    {
      icon: Search,
      title: "AI-Searchable Template Library", 
      description: "Industry-tailored templates for Australian SMEs",
      features: [
        "Templates organized by industry (Retail, Trades, Hospitality, etc.)",
        "AI-searchable by keywords and hashtags",
        "EOFY, Melbourne Cup, local event templates",
        "Auto-insert city/industry hashtags",
        "One-click template customization"
      ]
    }
  ];

  const bonusTools = [
    {
      title: "Medicare Compliance Suite",
      description: "AHPRA regulations, Medicare rules, and healthcare compliance",
      perfect: ["Doctors", "Specialists", "Allied Health"]
    },
    {
      title: "Postcode Search Tools", 
      description: "Medicare telehealth eligibility and postcode verification",
      perfect: ["Healthcare", "Allied Health", "Psychology"]
    },
    {
      title: "Business Name Generator",
      description: "AI-powered business name creation with ASIC verification", 
      perfect: ["Startups", "New Businesses", "Entrepreneurs"]
    },
    {
      title: "Domain Research Engine",
      description: "Advanced domain availability, pricing, and acquisition tools",
      perfect: ["All Businesses", "Startups", "Tech Companies"]
    }
  ];

  const professionalServices = [
    {
      title: "Australian Social Setup Service",
      description: "Complete Facebook Business Manager, Instagram Business, and LinkedIn setup with Australian compliance",
      features: [
        "Facebook Business Manager configuration",
        "Instagram Business profile setup", 
        "LinkedIn Business page optimization",
        "Meta App setup and verification",
        "Australian business compliance check"
      ]
    },
    {
      title: "Name & Domain Scout Service",
      description: "Professional business name research with ASIC availability and domain analysis",
      features: [
        "ASIC business name availability check",
        "Domain availability across extensions",
        "Similar business name analysis",
        "Optional trademark screening", 
        "AI-generated business name alternatives"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section - Mobile Optimized */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src={featuresImage}
            alt="Platform Features Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-purple-900/60"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto animate-fade-in text-center">
            <Badge className="mb-6 md:mb-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm text-green-400 border-green-500/30 text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 font-semibold animate-pulse">
              🇦🇺 15 Platform Features + 2 Professional Services
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 md:mb-8 leading-tight">
              <span className="text-yellow-400">WHY</span> <span className="text-white">Healthcare Professionals</span><br />
              <span className="text-white">Need This Platform</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-2">
              Complete AI-powered marketing platform with professional Australian business services. Here's every feature in your members dashboard.
            </p>
            
            <div className="flex flex-col gap-4 md:gap-6 justify-center px-4">
              <Link to="/auth">
                <Button size="xl" className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 animate-pulse">
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                  Join Waitlist
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="xl" variant="outline" className="w-full sm:w-auto text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 border-green-500 text-green-400 hover:bg-green-500/20">
                  <Crown className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Members Dashboard */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Platform features background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-purple-900/85"></div>
        </div>
        <div className="relative z-20 container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Complete <span className="text-yellow-400">Members Dashboard</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Your complete AI marketing command center. Every tool, feature, and capability in your members area.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Accordion type="multiple" className="space-y-4">
              {platformFeatures.map((feature, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-white/20 rounded-lg bg-white/10 backdrop-blur-md">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                        <p className="text-white/80 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 border-t border-white/10">
                      <ul className="space-y-3 mb-6">
                        {feature.features.map((item, fIndex) => (
                          <li key={fIndex} className="flex items-start text-white/90">
                            <ArrowRight className="w-4 h-4 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-3">
                        <Link to="/auth" className="flex-1">
                          <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
                            Join Waitlist
                          </Button>
                        </Link>
                        <Link to="/dashboard/diary">
                          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                            📝 Add Ideas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Profession-Specific Bonus Tools */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Bonus tools background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-green-900/80 to-orange-900/85"></div>
        </div>
        <div className="relative z-20 container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Profession-Specific <span className="text-yellow-400">Bonus Tools</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Industry-specific tools and services tailored to your profession's unique requirements and compliance needs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="multiple" className="space-y-4">
              {bonusTools.map((tool, index) => (
                <AccordionItem key={index} value={`bonus-${index}`} className="border border-white/20 rounded-lg bg-white/10 backdrop-blur-md">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{tool.title}</h3>
                        <p className="text-white/80 text-sm">{tool.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 border-t border-white/10">
                      <div className="mb-4">
                        <p className="text-white/90 font-medium mb-2">Perfect for:</p>
                        <div className="flex flex-wrap gap-2">
                          {tool.perfect.map((profession, pIndex) => (
                            <Badge key={pIndex} className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                              {profession}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link to="/auth" className="flex-1">
                          <Button className="w-full bg-green-400 text-black hover:bg-green-300">
                            Join Waitlist
                          </Button>
                        </Link>
                        <Link to="/dashboard/diary">
                          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                            📝 Add Ideas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Business Start-up Services */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Business services background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-purple-900/80 to-pink-900/85"></div>
        </div>
        <div className="relative z-20 container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Business <span className="text-yellow-400">Start-up Services</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Expert-level business setup services to get you operational fast with full Australian compliance.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Accordion type="multiple" className="space-y-4">
              {professionalServices.map((service, index) => (
                <AccordionItem key={index} value={`service-${index}`} className="border border-white/20 rounded-lg bg-white/10 backdrop-blur-md">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        {index === 0 ? <Users className="w-6 h-6 text-white" /> : <FileSearch className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{service.title}</h3>
                        <p className="text-white/80 text-sm">{service.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 border-t border-white/10">
                      <ul className="space-y-3 mb-6">
                        {service.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start text-white/90">
                            <ArrowRight className="w-4 h-4 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-3">
                        <Link to="/auth" className="flex-1">
                          <Button className="w-full bg-purple-400 text-white hover:bg-purple-300">
                            Join Waitlist
                          </Button>
                        </Link>
                        <Link to="/dashboard/diary">
                          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                            📝 Add Ideas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Final CTA background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-cyan-900/85"></div>
        </div>
        <div className="relative z-20 container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
            Ready to Transform <span className="text-yellow-400">Your Business?</span>
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Get access to every feature shown above plus professional setup services. Start dominating your market today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth">
              <Button size="xl" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white font-bold text-xl px-12 py-6">
                Join Waitlist Now
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="xl" variant="outline" className="text-xl px-12 py-6">
                View All Pricing
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-16 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">10</div>
              <div className="text-sm text-muted-foreground">Dashboard Features</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Bonus Tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">$11,521</div>
              <div className="text-sm text-muted-foreground">Monthly Savings</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AustralianServices;