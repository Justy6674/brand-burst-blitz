import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Briefcase
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
      
      {/* Hero Section with Background Image */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${featuresImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-purple-900/60"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-6 text-center">
          <Badge className="mb-8 bg-black/40 backdrop-blur-sm text-white border-white/30 text-lg px-6 py-3 font-semibold">
            🇦🇺 15 Platform Features + 2 Professional Services
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white">
            <span className="text-yellow-400">Everything You Get</span><br />
            <span className="text-white">Inside</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto">
            Complete AI-powered marketing platform with professional Australian business services. Here's every feature in your members dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth">
              <Button size="xl" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold text-xl px-12 py-6">
                Join Waitlist
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="xl" variant="outline" className="text-xl px-12 py-6 border-white text-white hover:bg-white/20">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Complete Members Dashboard */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Complete <span className="text-gradient-primary">Members Dashboard</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your complete AI marketing command center. Every tool, feature, and capability in your members area.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover-lift border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, fIndex) => (
                      <li key={fIndex} className="flex items-start text-sm">
                        <ArrowRight className="w-4 h-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">
                      Join Waitlist
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Profession-Specific Bonus Tools */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Profession-Specific <span className="text-gradient-primary">Bonus Tools</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Industry-specific tools and services tailored to your profession's unique requirements and compliance needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {bonusTools.map((tool, index) => (
              <Card key={index} className="p-6 text-center border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-0">
                  <h3 className="text-lg font-bold mb-2">{tool.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">{tool.description}</p>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-medium">Perfect for:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {tool.perfect.map((profession, pIndex) => (
                        <Badge key={pIndex} variant="outline" className="text-xs">
                          {profession}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Join Waitlist
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Start-up Services */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Business <span className="text-gradient-primary">Start-up Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Expert-level business setup services to get you operational fast with full Australian compliance.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {professionalServices.map((service, index) => (
              <Card key={index} className="p-8 hover-lift border-2 border-primary/20">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    {index === 0 ? <Users className="w-8 h-8 text-white" /> : <FileSearch className="w-8 h-8 text-white" />}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-8">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start text-sm">
                        <ArrowRight className="w-4 h-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button className="w-full">
                      Join Waitlist
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Ready to Transform <span className="text-gradient-primary">Your Business?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
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