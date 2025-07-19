import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicHeader from '@/components/layout/PublicHeader';
import { HeroSection } from '@/components/layout/HeroSection';
import { ComingSoonPopup } from '@/components/common/ComingSoonPopup';
import { 
  Brain, 
  Users, 
  BarChart3, 
  Calendar,
  Target,
  Settings,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  PenTool,
  Search,
  TrendingUp,
  Shield,
  Globe,
  Lightbulb,
  Clock,
  Rocket,
  Eye,
  MessageSquare,
  Building,
  MapPin,
  Globe2,
  Palette,
  Code,
  FileCheck,
  Stethoscope,
  Scale,
  Briefcase,
  Phone,
  Mail
} from 'lucide-react';
import featuresImage from '@/assets/features-image.jpg';

const AllServices = () => {
  // Core Platform Features - What's in the Dashboard
  const platformFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Content Creation Hub",
      description: "Advanced AI content generation with Australian compliance",
      features: [
        "Industry-specific AI content generation",
        "Blog posts, social media, marketing copy",
        "Australian compliance built-in (AHPRA, TGA, ASIC)",
        "Brand voice training and consistency",
        "SEO optimization for Google visibility",
        "Multiple content formats and styles",
        "Bulk content generation",
        "Content optimization suggestions"
      ],
      route: "/dashboard/create",
      gradient: "from-blue-500/10 to-blue-600/10",
      border: "border-blue-500/20",
      color: "blue-500"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Content Management System",
      description: "Complete content library and publishing workflow",
      features: [
        "Draft, scheduled, and published content library",
        "Content versioning and revision history",
        "Bulk editing and batch operations",
        "Content performance tracking",
        "Tag and category organization",
        "Search and filter functionality",
        "Content templates and reusable blocks",
        "Publishing status management"
      ],
      route: "/dashboard/posts",
      gradient: "from-green-500/10 to-green-600/10",
      border: "border-green-500/20",
      color: "green-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Social Media Command Center",
      description: "Unified social media management platform",
      features: [
        "Facebook, Instagram, LinkedIn integration",
        "Multi-account management dashboard",
        "Cross-platform publishing",
        "Social media account setup service",
        "Automated posting schedules",
        "Social media analytics and insights",
        "Engagement tracking and reporting",
        "Social media compliance monitoring"
      ],
      route: "/dashboard/social",
      gradient: "from-purple-500/10 to-purple-600/10",
      border: "border-purple-500/20",
      color: "purple-500"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Content Calendar",
      description: "Strategic content planning and automated scheduling",
      features: [
        "Visual content calendar interface",
        "Drag-and-drop scheduling",
        "Multi-platform publishing calendar",
        "Campaign planning and coordination",
        "Automated posting queues",
        "Content gap identification",
        "Editorial calendar planning",
        "Team collaboration on schedules"
      ],
      route: "/dashboard/calendar",
      gradient: "from-orange-500/10 to-orange-600/10",
      border: "border-orange-500/20",
      color: "orange-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Competitor Intelligence Suite",
      description: "AI-powered competitor analysis and market monitoring",
      features: [
        "Automated competitor content tracking",
        "Market gap analysis and opportunities",
        "Content performance comparisons",
        "Strategic recommendations engine",
        "Industry trend identification",
        "Competitive advantage insights",
        "Competitor pricing analysis",
        "Market positioning reports"
      ],
      route: "/dashboard/competitors",
      gradient: "from-red-500/10 to-red-600/10",
      border: "border-red-500/20",
      color: "red-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive performance insights and reporting",
      features: [
        "Real-time content performance metrics",
        "Social media engagement analytics",
        "SEO ranking and visibility tracking",
        "ROI and conversion reporting",
        "Custom dashboard widgets",
        "Automated performance alerts",
        "Audience insights and demographics",
        "Competitive benchmarking"
      ],
      route: "/dashboard/analytics",
      gradient: "from-cyan-500/10 to-cyan-600/10",
      border: "border-cyan-500/20",
      color: "cyan-500"
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Professional Content Templates",
      description: "Industry-specific templates for every business need",
      features: [
        "Industry-specific content templates",
        "Custom template creation tools",
        "Template library and sharing",
        "Variable placeholders and automation",
        "Brand-consistent formatting",
        "Template performance tracking",
        "A/B testing for templates",
        "Template optimization suggestions"
      ],
      route: "/dashboard/templates",
      gradient: "from-emerald-500/10 to-emerald-600/10",
      border: "border-emerald-500/20",
      color: "emerald-500"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Prompt Engineering Library",
      description: "Advanced AI prompts for superior content generation",
      features: [
        "Professional prompt engineering database",
        "Industry-specific prompt collections",
        "Custom prompt creation and testing",
        "Prompt performance optimization",
        "Community prompt sharing",
        "A/B testing for prompts",
        "Prompt version control",
        "Advanced prompt techniques"
      ],
      route: "/dashboard/prompts",
      gradient: "from-violet-500/10 to-violet-600/10",
      border: "border-violet-500/20",
      color: "violet-500"
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Multi-Business Management",
      description: "Complete business profile and team management",
      features: [
        "Multiple business profile support",
        "Cross-business content sharing",
        "Brand-specific customization",
        "Business compliance settings",
        "Team collaboration tools",
        "Business performance comparison",
        "Role-based access control",
        "Business workflow automation"
      ],
      route: "/dashboard/business-settings",
      gradient: "from-indigo-500/10 to-indigo-600/10",
      border: "border-indigo-500/20",
      color: "indigo-500"
    },
    {
      icon: <Globe2 className="w-8 h-8" />,
      title: "Cross-Business Features",
      description: "Enterprise-level business management capabilities",
      features: [
        "Cross-business analytics and reporting",
        "Unified brand management",
        "Business performance comparisons",
        "Consolidated billing and invoicing",
        "Enterprise-level security",
        "Advanced user permissions",
        "Business relationship mapping",
        "Portfolio management tools"
      ],
      route: "/dashboard/cross-business",
      gradient: "from-pink-500/10 to-pink-600/10",
      border: "border-pink-500/20",
      color: "pink-500"
    }
  ];

  // Professional Services
  const professionalServices = [
    {
      name: 'Australian Social Setup Service',
      price: '$199-299',
      description: 'Complete Facebook Business Manager, Instagram Business, and LinkedIn setup with Australian compliance',
      features: [
        'Facebook Business Manager configuration',
        'Instagram Business profile setup',
        'LinkedIn Business page optimization',
        'Meta App setup and verification',
        'Australian business compliance check',
        'Full platform integration testing',
        'Quality assurance and handoff'
      ],
      route: '/australian-setup-service'
    },
    {
      name: 'Name & Domain Scout Service',
      price: '$69-99',
      description: 'Professional business name research with ASIC availability and domain analysis',
      features: [
        'ASIC business name availability check',
        'Domain availability across extensions',
        'Similar business name analysis',
        'Optional trademark screening',
        'AI-generated business name alternatives',
        'Professional PDF research report'
      ],
      route: '/australian-services'
    }
  ];

  // Profession-Specific Bonus Services
  const bonusServices = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Postcode Search Tools",
      description: "Medicare telehealth eligibility and postcode verification",
      professions: ["Healthcare", "Allied Health", "Psychology"],
      gradient: "from-green-500/10 to-emerald-500/10",
      border: "border-green-500/20"
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: "Medicare Compliance Suite",
      description: "AHPRA regulations, Medicare rules, and healthcare compliance",
      professions: ["Doctors", "Specialists", "Allied Health"],
      gradient: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-500/20"
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Legal Industry Tools",
      description: "Legal compliance, court rules, and professional standards",
      professions: ["Lawyers", "Barristers", "Legal Services"],
      gradient: "from-purple-500/10 to-violet-500/10",
      border: "border-purple-500/20"
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Financial Services Kit",
      description: "ASIC compliance, financial product disclosure, and advisory standards",
      professions: ["Financial Advisors", "Accountants", "Brokers"],
      gradient: "from-yellow-500/10 to-orange-500/10",
      border: "border-yellow-500/20"
    },
    {
      icon: <Globe2 className="w-6 h-6" />,
      title: "Domain Research Engine",
      description: "Advanced domain availability, pricing, and acquisition tools",
      professions: ["All Businesses", "Startups", "Tech Companies"],
      gradient: "from-indigo-500/10 to-blue-500/10",
      border: "border-indigo-500/20"
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Business Name Generator",
      description: "AI-powered business name creation with ASIC verification",
      professions: ["Startups", "New Businesses", "Entrepreneurs"],
      gradient: "from-red-500/10 to-pink-500/10",
      border: "border-red-500/20"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Professional Logo Design",
      description: "AI-generated logos with brand guidelines and variations",
      professions: ["All Businesses", "Startups", "Rebranding"],
      gradient: "from-pink-500/10 to-purple-500/10",
      border: "border-pink-500/20"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Website Development",
      description: "Professional website creation with SEO optimization",
      professions: ["All Businesses", "Service Providers", "E-commerce"],
      gradient: "from-cyan-500/10 to-teal-500/10",
      border: "border-cyan-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section - Same style as home page */}
      <section className="relative py-16 md:py-24 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src={featuresImage}
            alt="Platform Features Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-purple-900/60"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-6">
          <div className="max-w-5xl mx-auto animate-fade-in text-center">
            <Badge className="mb-8 bg-primary/10 text-primary border-primary/20 text-lg px-6 py-3">
              🚀 Complete Members Platform & Professional Services
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-white">
              Everything You Get <span className="text-yellow-400">Inside</span>
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto">
              Complete AI-powered marketing platform with professional Australian business services. Here's every feature in your members dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <ComingSoonPopup 
                trigger={
                  <Button variant="hero" size="xl" className="text-xl px-12 py-6">
                    <Rocket className="w-6 h-6 mr-3" />
                    Start Your Membership
                  </Button>
                } 
              />
              <Link to="/pricing">
                <Button variant="outline-white" size="xl" className="text-xl px-12 py-6">
                  <Eye className="w-6 h-6 mr-3" />
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="relative py-16 md:py-24 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Technology dashboard background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-purple-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Complete</span> <span className="text-gradient-primary">Members Dashboard</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Your complete AI marketing command center. Every tool, feature, and capability in your members area.
            </p>
          </div>

          <div className="grid gap-8">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className={`p-8 hover-lift ${feature.border} bg-gradient-to-br ${feature.gradient} transition-all duration-300`}>
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 bg-${feature.color} rounded-full flex items-center justify-center text-white`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground text-lg">{feature.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3 mb-6">
                        {feature.features.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className={`w-4 h-4 text-${feature.color} flex-shrink-0 mt-0.5`} />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="lg:ml-6">
                      <ComingSoonPopup 
                        trigger={
                          <Button className={`bg-${feature.color} hover:bg-${feature.color}/90 text-white border-0 px-6 py-3`}>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Explore Feature
                          </Button>
                        } 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Professional Services */}
      <section className="relative py-16 md:py-24 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Professional services and tools background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-900/80 to-purple-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Profession-Specific</span> <span className="text-gradient-primary">Bonus Tools</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Industry-specific tools and services tailored to your profession's unique requirements and compliance needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {bonusServices.map((service, index) => (
              <Card key={index} className={`p-6 hover-lift ${service.border} bg-gradient-to-br ${service.gradient} transition-all duration-300`}>
                <CardContent className="p-0">
                  <div className={`w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-4`}>
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-primary mb-2">Perfect for:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.professions.map((prof, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-2 py-1">
                          {prof}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ComingSoonPopup 
                    trigger={
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white border-0 text-sm">
                        <Lightbulb className="w-3 h-3 mr-2" />
                        Get Access
                      </Button>
                    } 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Setup Services */}
      <section className="relative py-16 md:py-24 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Professional services background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-green-900/80 to-orange-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span style={{color: '#ffd700', fontWeight: 700}}>Core</span> <span className="text-gradient-primary">Setup Services</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Expert-level business setup services to get you operational fast with full Australian compliance.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {professionalServices.map((service, index) => (
              <Card key={index} className="border-2 border-orange-500/30 hover:border-orange-500/50 transition-colors h-full bg-gradient-to-br from-orange-500/10 to-orange-600/10">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-xl flex-1">{service.name}</CardTitle>
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-4 py-2 font-semibold border-0">
                      {service.price}
                    </Badge>
                  </div>
                  <CardDescription className="text-lg">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ComingSoonPopup 
                    trigger={
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
                        <Settings className="w-4 h-4 mr-2" />
                        Join Waitlist
                      </Button>
                    } 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 md:py-24 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Success transformation background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/85 to-slate-900/90"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center px-6 py-3 mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full backdrop-blur-sm">
            <Star className="w-5 h-5 mr-2 text-cyan-400 animate-bounce" />
            <span className="text-cyan-300 font-semibold tracking-wide">EVERYTHING YOU NEED TO SUCCEED</span>
            <Zap className="w-5 h-5 ml-2 text-yellow-400 animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Ready to Transform
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Your Business?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Get access to every feature shown above plus professional setup services. Start dominating your market today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-red-600 to-blue-600 rounded-lg blur opacity-75 animate-pulse"></div>
              <ComingSoonPopup 
                trigger={
                  <Button className="relative bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold text-xl px-12 py-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-2xl border-0">
                    <Target className="w-6 h-6 mr-3" />
                    Start Membership - $179/month
                  </Button>
                } 
              />
            </div>
            <Link to="/pricing">
              <Button variant="outline-white" size="xl" className="text-xl px-12 py-6">
                <TrendingUp className="w-6 h-6 mr-3" />
                Compare All Plans
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-4">
              <div className="text-2xl font-bold text-yellow-400">10</div>
              <div className="text-sm text-gray-400">Dashboard Features</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-4">
              <div className="text-2xl font-bold text-cyan-400">8</div>
              <div className="text-sm text-gray-400">Bonus Tools</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-4">
              <div className="text-2xl font-bold text-green-400">$11,521</div>
              <div className="text-sm text-gray-400">Monthly Savings</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllServices;