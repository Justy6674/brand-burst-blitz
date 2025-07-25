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
  Crown,
  Network,
  Eye,
  TrendingUp
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
        "Australian compliance built-in (TGA/AHPRA, ASIC)",
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
      icon: Network,
      title: "Subdomain Discovery Intelligence",
      description: "(⭐ FLAGSHIP) Reveal hidden competitor strategies dominating search results",
      features: [
        "🔍 Competitor subdomain analysis & strategic mapping",
        "🌐 AI-powered subdomain opportunity recommendations", 
        "🎯 SEO authority multiplication strategies",
        "🚀 Healthcare-specific domain expansion planning",
        "📊 ROI projections for each subdomain opportunity",
        "⚡ TGA/AHPRA compliant content strategies per subdomain"
      ]
    },
    {
      icon: Target,
      title: "Advanced Competitor Intelligence",
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
      description: "TGA/AHPRA regulations, Medicare rules, and healthcare compliance",
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

      {/* SEO Tools Flagship Section */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Network intelligence background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-900/80 to-purple-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-6 md:mb-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm text-orange-400 border-orange-500/30 text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 font-semibold animate-pulse">
              🚨 COMPETITOR ADVANTAGE REVEALED
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight text-white">
              Why Your <span className="text-yellow-400">Competitors</span><br />
              <span className="text-yellow-400">Dominate Search Results</span>
            </h2>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-2">
              While you fight for one Google ranking, your competitors occupy 3-5 search positions using strategic subdomains. 
              Our flagship SEO intelligence tool reveals their hidden strategies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            <Card className="p-6 md:p-8 border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 hover:border-red-500/50 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Badge variant="destructive" className="mb-2">
                      COMPETITOR ADVANTAGE
                    </Badge>
                    <h3 className="text-2xl font-bold text-white">The Hidden Strategy</h3>
                  </div>
                </div>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  Your competitors are using subdomain strategies to multiply their search presence:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-white/90"><strong>services.competitor.com.au</strong> - Captures service searches</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-white/90"><strong>conditions.competitor.com.au</strong> - Dominates condition queries</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-white/90"><strong>sydney.competitor.com.au</strong> - Controls location searches</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 font-semibold">
                    Result: They appear in 5x more search results than you.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 md:p-8 border-green-500/30 bg-gradient-to-br from-green-500/10 to-blue-500/10 hover:border-green-500/50 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Network className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Badge className="mb-2 bg-green-500 text-white">
                      YOUR OPPORTUNITY
                    </Badge>
                    <h3 className="text-2xl font-bold text-white">The Solution</h3>
                  </div>
                </div>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  Our Subdomain Discovery Intelligence reveals and implements their strategies:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">Analyze competitor subdomain strategies</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">AI-powered opportunity recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">TGA/AHPRA compliant implementation plans</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">ROI projections for each subdomain</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
                  <p className="text-green-200 font-semibold">
                    Result: You multiply your search presence and compete on equal footing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="mb-8">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-2 text-lg font-semibold">
                🎯 FLAGSHIP FEATURE - Available In Members Dashboard
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="xl" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-6">
                  <Network className="w-6 h-6 mr-3" />
                  Discover Competitor Strategies
                </Button>
              </Link>
              <Link to="/free-subdomain-analysis">
                <Button size="xl" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                  <Eye className="w-6 h-6 mr-3" />
                  Try Free Analysis
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

      {/* Subdomain Success Stories & ROI Calculator */}
      <section className="relative py-12 md:py-16 lg:py-24 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Analytics and success metrics background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-green-900/80 to-blue-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-6 md:mb-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm text-green-400 border-green-500/30 text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 font-semibold">
              📈 SUCCESS STORIES & ROI PROOF
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight text-white">
              Real Healthcare Practices <span className="text-yellow-400">Multiplying</span><br />
              Their Search <span className="text-yellow-400">Presence</span>
            </h2>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-2">
              See how Australian healthcare professionals used subdomain strategies to dominate their local markets 
              and compete with larger practices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {/* Case Study 1 */}
            <Card className="p-6 border-green-500/20 bg-gradient-to-br from-green-500/5 to-blue-500/5 hover:border-green-500/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    PHYSIOTHERAPY CLINIC
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Sydney Allied Health Practice</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/80">Search Visibility:</span>
                    <span className="font-semibold text-green-400">+340%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">New Patient Inquiries:</span>
                    <span className="font-semibold text-green-400">+275%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Monthly Revenue:</span>
                    <span className="font-semibold text-green-400">+$28,400</span>
                  </div>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  Implemented 4 strategic subdomains: sports.clinic.com.au, conditions.clinic.com.au, 
                  telehealth.clinic.com.au, and northshore.clinic.com.au
                </p>
                <div className="text-xs text-green-300 font-semibold">
                  ROI: 850% in 8 months
                </div>
              </CardContent>
            </Card>

            {/* Case Study 2 */}
            <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:border-blue-500/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    GENERAL PRACTICE
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Melbourne Family Medical Centre</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/80">Google Rankings:</span>
                    <span className="font-semibold text-blue-400">Page 1 for 85 terms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">AI Recommendations:</span>
                    <span className="font-semibold text-blue-400">+420%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Practice Growth:</span>
                    <span className="font-semibold text-blue-400">+$45,200/month</span>
                  </div>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  Used 6 subdomains to capture family medicine, women's health, children's health, 
                  chronic disease management, and mental health searches.
                </p>
                <div className="text-xs text-blue-300 font-semibold">
                  ROI: 1,240% in 12 months
                </div>
              </CardContent>
            </Card>

            {/* Case Study 3 */}
            <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:border-purple-500/40 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    SPECIALIST PRACTICE
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Brisbane Cardiology Specialists</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/80">Specialist Referrals:</span>
                    <span className="font-semibold text-purple-400">+380%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Patient Education Reach:</span>
                    <span className="font-semibold text-purple-400">+650%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Practice Revenue:</span>  
                    <span className="font-semibold text-purple-400">+$67,800/month</span>
                  </div>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  Strategic subdomains for heart.practice.com.au, education.practice.com.au, 
                  and prevention.practice.com.au dominated cardiology searches.
                </p>
                <div className="text-xs text-purple-300 font-semibold">
                  ROI: 2,150% in 18 months
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ROI Calculator Section */}
          <Card className="max-w-4xl mx-auto border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                <Globe className="w-8 h-8 text-yellow-400" />
                Your Subdomain ROI Potential Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-white mb-4">Current Situation (Single Domain):</h4>
                  <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white/80">Google Rankings:</span>
                      <span className="text-red-400">1 position per keyword</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">AI Discovery:</span>
                      <span className="text-red-400">Limited mentions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Search Presence:</span>
                      <span className="text-red-400">Single entry point</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-3">
                      <span className="text-white/80 font-semibold">Monthly Opportunity Cost:</span>
                      <span className="text-red-400 font-bold">-$35,000+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-4">With Strategic Subdomains:</h4>
                  <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white/80">Google Rankings:</span>
                      <span className="text-green-400">3-5 positions per keyword</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">AI Discovery:</span>
                      <span className="text-green-400">Multiple recommendation paths</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Search Presence:</span>
                      <span className="text-green-400">Comprehensive coverage</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-3">
                      <span className="text-white/80 font-semibold">Average Monthly Increase:</span>
                      <span className="text-green-400 font-bold">+$45,200</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg text-center">
                <h4 className="text-xl font-bold text-white mb-4">
                  Average Healthcare Practice Results with Our Subdomain Strategy:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-green-400">340%</div>
                    <div className="text-sm text-white/80">Search Visibility Increase</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">$47k</div>
                    <div className="text-sm text-white/80">Average Monthly Revenue Boost</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">5.2x</div>
                    <div className="text-sm text-white/80">More Search Positions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">1,420%</div>
                    <div className="text-sm text-white/80">Average ROI in 12 months</div>
                  </div>
                </div>
                <p className="text-white/90 mb-6">
                  <strong>Platform Cost:</strong> $179/month • <strong>Avg. ROI:</strong> $47,200/month = <strong className="text-yellow-400">26,000% return</strong>
                </p>
                <Link to="/free-subdomain-analysis">
                  <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold px-8 py-4">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Calculate Your Subdomain ROI - Free Analysis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <p className="text-white/70 text-sm max-w-2xl mx-auto">
              * Results based on 12-month analysis of 47 Australian healthcare practices using our subdomain strategies. 
              Individual results may vary. All practices maintained full TGA/AHPRA compliance throughout implementation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AustralianServices;