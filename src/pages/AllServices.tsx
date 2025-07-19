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
  Building
} from 'lucide-react';
import featuresImage from '@/assets/features-image.jpg';

const AllServices = () => {
  // Core Platform Features - What's in the Dashboard
  const platformFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Content Creation",
      description: "Generate professional, compliant content at scale",
      features: [
        "Industry-specific AI content generation",
        "Blog posts, social media, marketing copy",
        "Australian compliance built-in",
        "Brand voice training and consistency",
        "SEO optimization for Google visibility",
        "Multiple content formats and styles"
      ],
      route: "/dashboard/create",
      gradient: "from-blue-500/10 to-blue-600/10",
      border: "border-blue-500/20",
      color: "blue-500"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Content Management",
      description: "Organize, edit, and optimize all your content",
      features: [
        "Draft, scheduled, and published content library",
        "Content versioning and revision history",
        "Bulk editing and batch operations",
        "Content performance tracking",
        "Tag and category organization",
        "Search and filter functionality"
      ],
      route: "/dashboard/posts",
      gradient: "from-green-500/10 to-green-600/10",
      border: "border-green-500/20",
      color: "green-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Social Media Management",
      description: "Unified social media control center",
      features: [
        "Facebook, Instagram, LinkedIn integration",
        "Multi-account management",
        "Cross-platform publishing",
        "Social media account setup service",
        "Automated posting schedules",
        "Social media analytics"
      ],
      route: "/dashboard/social",
      gradient: "from-purple-500/10 to-purple-600/10",
      border: "border-purple-500/20",
      color: "purple-500"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Content Calendar",
      description: "Strategic content planning and scheduling",
      features: [
        "Visual content calendar interface",
        "Drag-and-drop scheduling",
        "Multi-platform publishing",
        "Campaign planning and coordination",
        "Automated posting queues",
        "Content gap identification"
      ],
      route: "/dashboard/calendar",
      gradient: "from-orange-500/10 to-orange-600/10",
      border: "border-orange-500/20",
      color: "orange-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Competitor Intelligence",
      description: "AI-powered competitor analysis and monitoring",
      features: [
        "Automated competitor content tracking",
        "Market gap analysis and opportunities",
        "Content performance comparisons",
        "Strategic recommendations",
        "Industry trend identification",
        "Competitive advantage insights"
      ],
      route: "/dashboard/competitors",
      gradient: "from-red-500/10 to-red-600/10",
      border: "border-red-500/20",
      color: "red-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Comprehensive performance insights",
      features: [
        "Real-time content performance metrics",
        "Social media engagement analytics",
        "SEO ranking and visibility tracking",
        "ROI and conversion reporting",
        "Custom dashboard widgets",
        "Automated performance alerts"
      ],
      route: "/dashboard/analytics",
      gradient: "from-cyan-500/10 to-cyan-600/10",
      border: "border-cyan-500/20",
      color: "cyan-500"
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Content Templates",
      description: "Professional templates for every industry",
      features: [
        "Industry-specific content templates",
        "Custom template creation",
        "Template library and sharing",
        "Variable placeholders and automation",
        "Brand-consistent formatting",
        "Template performance tracking"
      ],
      route: "/dashboard/templates",
      gradient: "from-emerald-500/10 to-emerald-600/10",
      border: "border-emerald-500/20",
      color: "emerald-500"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Prompt Library",
      description: "Advanced AI prompts for superior content",
      features: [
        "Professional prompt engineering",
        "Industry-specific prompt collections",
        "Custom prompt creation and testing",
        "Prompt performance optimization",
        "Community prompt sharing",
        "A/B testing for prompts"
      ],
      route: "/dashboard/prompts",
      gradient: "from-violet-500/10 to-violet-600/10",
      border: "border-violet-500/20",
      color: "violet-500"
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Business Management",
      description: "Multi-business profile management",
      features: [
        "Multiple business profile support",
        "Cross-business content sharing",
        "Brand-specific customization",
        "Business compliance settings",
        "Team collaboration tools",
        "Business performance comparison"
      ],
      route: "/dashboard/business-settings",
      gradient: "from-indigo-500/10 to-indigo-600/10",
      border: "border-indigo-500/20",
      color: "indigo-500"
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
              <span style={{color: '#ffd700', fontWeight: 700}}>Members</span> <span className="text-gradient-primary">Dashboard Features</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Your complete AI marketing command center. Every tool you need to dominate your market.
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

      {/* Professional Services */}
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
              <span style={{color: '#ffd700', fontWeight: 700}}>Professional</span> <span className="text-gradient-primary">Setup Services</span>
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
                  <Link to={service.route}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
                      <Settings className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </Link>
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
              <div className="text-2xl font-bold text-yellow-400">9</div>
              <div className="text-sm text-gray-400">Core Features</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-4">
              <div className="text-2xl font-bold text-cyan-400">2</div>
              <div className="text-sm text-gray-400">Pro Services</div>
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