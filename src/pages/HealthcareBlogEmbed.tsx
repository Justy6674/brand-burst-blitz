import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HealthcareBlogEmbedWizard } from '@/components/blog/HealthcareBlogEmbedWizard';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { QuestionnaireRequired } from '@/components/questionnaire/QuestionnaireRequired';
import { 
  Globe, Code, Zap, Shield, Star, CheckCircle, Monitor, 
  Smartphone, Search, TrendingUp, Clock, Users, Award
} from 'lucide-react';

const benefits = [
  {
    icon: <Shield className="h-6 w-6 text-green-600" />,
    title: "AHPRA Compliant",
    description: "Automatically follows Australian healthcare advertising guidelines with built-in disclaimers and compliance validation."
  },
  {
    icon: <Search className="h-6 w-6 text-blue-600" />,
    title: "SEO Optimized",
    description: "Server-side rendered content with Schema.org markup ensures Google can find and index your healthcare content."
  },
  {
    icon: <Code className="h-6 w-6 text-purple-600" />,
    title: "Copy-Paste Simple",
    description: "No technical skills required. Copy our code and paste it into GoDaddy, WordPress, Wix, or any website platform."
  },
  {
    icon: <Smartphone className="h-6 w-6 text-indigo-600" />,
    title: "Mobile Responsive",
    description: "Looks perfect on all devices with automatic mobile optimization and accessibility features built-in."
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
    title: "Patient Engagement",
    description: "Professional healthcare content that educates patients and builds trust in your practice expertise."
  },
  {
    icon: <Clock className="h-6 w-6 text-teal-600" />,
    title: "Save Time & Money",
    description: "Avoid paying $5,000-15,000 for custom web development. Get professional blog functionality instantly."
  }
];

const platforms = [
  { name: "WordPress", users: "455M+ sites", logo: "🔌" },
  { name: "Wix", users: "200M+ users", logo: "🎨" },
  { name: "GoDaddy", users: "20M+ domains", logo: "🏗️" },
  { name: "Squarespace", users: "4M+ sites", logo: "⬜" },
  { name: "Shopify", users: "4.6M+ stores", logo: "🛒" },
  { name: "Any Website", users: "Works everywhere", logo: "🌐" }
];

const testimonials = [
  {
    quote: "This blog embed saved us thousands in web development costs. Our patients love the educational content!",
    author: "Dr. Sarah Chen",
    specialty: "General Practice",
    location: "Sydney, NSW"
  },
  {
    quote: "AHPRA compliance built-in gave us peace of mind. Professional content that builds patient trust.",
    author: "Dr. Michael Torres",
    specialty: "Psychology",
    location: "Melbourne, VIC"
  },
  {
    quote: "Set up in 10 minutes, no technical knowledge needed. Our website looks so much more professional now.",
    author: "Dr. Emma Wilson",
    specialty: "Allied Health",
    location: "Brisbane, QLD"
  }
];

export const HealthcareBlogEmbed = () => {
  const { user, hasCompletedQuestionnaire } = useHealthcareAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Healthcare Blog Embed</CardTitle>
            <CardDescription>
              Please sign in to access the blog embed wizard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Create professional, AHPRA-compliant blog content for your healthcare website
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasCompletedQuestionnaire) {
    return <QuestionnaireRequired />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Globe className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Healthcare Blog Embed</h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Add professional, AHPRA-compliant blog content to your website in minutes. 
              No technical skills required - just copy and paste!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Shield className="h-4 w-4 mr-1" />
                AHPRA Compliant
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Search className="h-4 w-4 mr-1" />
                SEO Optimized
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Code className="h-4 w-4 mr-1" />
                Zero Code Required
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Healthcare Content for Your Website
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of Australian healthcare professionals using our compliant blog system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Works with All Major Website Platforms
            </h2>
            <p className="text-gray-600">
              Compatible with any website that accepts HTML code
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map((platform, index) => (
              <Card key={index} className="text-center p-4 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{platform.logo}</div>
                <div className="font-semibold text-sm">{platform.name}</div>
                <div className="text-xs text-gray-500">{platform.users}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800 flex items-center justify-center gap-2">
                <Award className="h-6 w-6" />
                Australia's First AHPRA-Compliant Blog Embed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">$15,000+</div>
                  <div className="text-sm text-gray-600">Saved in web development costs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">10 min</div>
                  <div className="text-sm text-gray-600">Setup time for any website</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-sm text-gray-600">AHPRA advertising compliance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Australian Healthcare Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.specialty}</div>
                    <div className="text-xs text-gray-400">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Benefits */}
        <div className="mb-16">
          <Alert className="border-blue-200 bg-blue-50">
            <Monitor className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>SEO & Performance Benefits:</strong> Your blog content is server-side rendered with proper meta tags, 
              Schema.org markup, and healthcare-specific SEO optimization. Google can fully crawl and index your content, 
              improving your practice's online visibility for healthcare searches.
            </AlertDescription>
          </Alert>
        </div>

        {/* Security & Compliance */}
        <div className="mb-16">
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <strong>Healthcare Compliance Guaranteed:</strong> Every blog post is automatically validated against AHPRA advertising 
              guidelines and TGA therapeutic advertising requirements. Built-in disclaimers, professional boundaries, and medical 
              accuracy verification ensure your content maintains professional standards.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Wizard */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Zap className="h-6 w-6" />
              Create Your Healthcare Blog Embed
            </CardTitle>
            <CardDescription className="text-center text-blue-100">
              Follow our step-by-step wizard to generate your compliant blog code
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <HealthcareBlogEmbedWizard />
          </CardContent>
        </Card>

        {/* Support Information */}
        <div className="mt-16 text-center">
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Our healthcare technology specialists are available to help you set up your blog embed
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline">📧 support@jbsaas.com</Badge>
                <Badge variant="outline">📞 1300 JBSAAS</Badge>
                <Badge variant="outline">💬 Live Chat Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 