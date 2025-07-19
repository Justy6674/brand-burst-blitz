import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { HeroSection } from "@/components/layout/HeroSection";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Brain,
  Shield,
  Zap,
  HelpCircle,
  Building,
  Clock,
  Users,
  Globe,
  ArrowRight
} from "lucide-react";
import aiContentHero from "@/assets/ai-content-creation-hero.jpg";

const CommonQuestions = () => {
  const questionCategories = [
    {
      title: "Platform & Technology",
      icon: Brain,
      color: "text-primary",
      questions: [
        {
          question: "How does the AI content generation actually work?",
          answer: "Our AI uses advanced language models trained specifically for Australian business content creation. It learns your brand voice, analyzes your industry, and generates content that matches your style and messaging. The AI considers factors like your target audience, brand guidelines, and Australian market context to create highly relevant posts."
        },
        {
          question: "What social media platforms does JB-SaaS integrate with?",
          answer: "JB-SaaS currently supports Facebook, Instagram, LinkedIn, and Twitter. We provide content creation and scheduling specifically optimized for Australian businesses. Our Australian Quick-Start service handles complete setup and integration for local businesses."
        },
        {
          question: "How secure is my business data on the JB-SaaS platform?",
          answer: "We use enterprise-grade security with end-to-end encryption, SOC 2 compliance, and regular security audits. Your data is stored in secure, geo-redundant servers with 99.9% uptime guarantee. We comply with Australian Privacy Principles and never share your data with third parties."
        },
        {
          question: "Can I export my content and data if I decide to leave?",
          answer: "Absolutely. You have full data portability rights under Australian privacy law. You can export all your content, analytics data, and account information in standard formats (CSV, JSON) at any time. There are no lock-in contracts or data retention fees."
        },
        {
          question: "What makes JB-SaaS different from other AI content tools?",
          answer: "JB-SaaS is specifically designed for Australian businesses with local market understanding, compliance features, and industry-specific content. We combine AI content generation with competitor analysis, business intelligence, and strategic recommendations tailored to the Australian market."
        },
        {
          question: "How often is the AI model updated and improved?",
          answer: "Our AI models are continuously updated with the latest advancements in language technology and Australian business context. We deploy improvements monthly and major updates quarterly. The system also learns from your feedback and performance data to improve personalized recommendations."
        },
        {
          question: "Does JB-SaaS work for all industries and business types?",
          answer: "Yes, JB-SaaS is designed for all Australian business types including B2B, B2C, e-commerce, professional services, healthcare, finance, and more. The AI adapts to your specific industry language, Australian compliance requirements, and local audience preferences."
        },
        {
          question: "What API integrations are available?",
          answer: "We offer REST APIs for content management, analytics, and scheduling. Popular integrations include Australian CRM systems, email marketing tools, and analytics platforms. We also provide ABN validation and ASIC business registry integrations for Australian businesses."
        }
      ]
    },
    {
      title: "Business Strategy",
      icon: Building,
      color: "text-secondary",
      questions: [
        {
          question: "Why do blogs matter so much for Google rankings in 2025?",
          answer: "Google's AI algorithms prioritize helpful, original content that demonstrates expertise. Regular blogging with Australian-focused keywords helps establish topical authority, increases indexed pages, and provides fresh content signals. Australian businesses with active blogs get 55% more website visitors and 97% more inbound links."
        },
        {
          question: "How does competitor analysis help Australian businesses grow?",
          answer: "Our competitor analysis reveals content gaps, successful strategies, and market opportunities specific to the Australian market. You'll see what content performs best in your Australian industry, optimal posting times for Australian audiences, trending topics, and messaging that resonates locally."
        },
        {
          question: "What's the ROI of consistent social media marketing for Australian SMEs?",
          answer: "Consistent social media marketing typically delivers 3-5x ROI within 6 months for Australian businesses. Benefits include increased brand awareness (2.5x), website traffic (3x), lead generation (2x), and customer retention (40% improvement). Australian JB-SaaS customers see results 60% faster due to local AI optimization."
        },
        {
          question: "How will AI agents discover my Australian business in the future?",
          answer: "AI agents like ChatGPT and future AI assistants will recommend businesses based on comprehensive online presence, content quality, and local relevance. Having consistent, high-quality Australian-focused content across platforms ensures your business appears in AI recommendations when Australian customers ask for solutions."
        },
        {
          question: "Should Australian businesses focus more on SEO or social media marketing?",
          answer: "Both are essential for Australian businesses and work synergistically. SEO provides long-term organic traffic for Australian searches, while social media offers immediate engagement and local brand building. JB-SaaS creates content optimized for both Australian SEO and social media audiences."
        },
        {
          question: "How much should an Australian business spend on content marketing?",
          answer: "Most successful Australian businesses allocate 6-10% of revenue to marketing, with 25-30% of that on content. JB-SaaS reduces content costs by 80-90% compared to Australian agencies while improving quality and consistency. You get enterprise-level Australian content strategy at a fraction of traditional costs."
        },
        {
          question: "What content types perform best for Australian B2B vs B2C?",
          answer: "Australian B2B audiences prefer educational content, local case studies, and industry insights that demonstrate expertise. Australian B2C audiences engage more with entertaining, emotional, and visual content that reflects local culture. JB-SaaS automatically adapts content style based on your Australian target audience and industry."
        },
        {
          question: "How do I measure content marketing success for my Australian business?",
          answer: "Key metrics include engagement rates, Australian website traffic, local lead generation, conversion rates, and brand mention growth. JB-SaaS provides comprehensive analytics showing content performance, Australian audience growth, local competitor comparisons, and ROI tracking across all platforms."
        }
      ]
    },
    {
      title: "Implementation & Support",
      icon: Zap,
      color: "text-accent",
      questions: [
        {
          question: "How long does it take to set up and start seeing results?",
          answer: "Initial setup takes 15-30 minutes. You'll see your first AI-generated content within minutes. Meaningful results (increased engagement, traffic) typically appear within 2-4 weeks of consistent posting. Full ROI is usually achieved within 3-6 months."
        },
        {
          question: "Do I need any technical skills or training to use JB-SaaS?",
          answer: "No technical skills required. JB-SaaS is designed for business owners and marketers, not developers. Our intuitive interface guides you through content creation, and our AI handles the complex work. We provide video tutorials and 24/7 support for any questions."
        },
        {
          question: "Can JB-SaaS integrate with my existing marketing tools?",
          answer: "Yes, JB-SaaS integrates with popular tools including Google Analytics, Facebook Business Manager, Mailchimp, HubSpot, Salesforce, and more. We also offer Zapier integration for connecting with 3,000+ other applications."
        },
        {
          question: "What support options are available?",
          answer: "All plans include email support. Professional plans get priority support with faster response times. Enterprise customers receive dedicated success managers, phone support, and custom training sessions. Our average response time is under 4 hours."
        },
        {
          question: "Is there a limit to how much content I can create?",
          answer: "Starter plans include 100 AI-generated posts per month. Professional and Enterprise plans offer unlimited content creation. There are no hidden fees or overage charges. You can create as much content as your business needs."
        },
        {
          question: "How does billing work and can I change plans anytime?",
          answer: "We use Stripe for secure billing with monthly or annual payment options. You can upgrade, downgrade, or cancel anytime without penalties. Annual plans receive 20% discount. Enterprise plans can be customized with quarterly or annual billing cycles."
        },
        {
          question: "What happens if I need custom features or integrations?",
          answer: "Enterprise customers can request custom features and integrations. Our development team evaluates requests based on business value and technical feasibility. Custom development is available for strategic partnerships and high-value accounts."
        }
      ]
    },
    {
      title: "Company & Trust",
      icon: Shield,
      color: "text-success",
      questions: [
        {
          question: "Who is behind JB-SaaS and what's your experience?",
          answer: "JB-SaaS is founded by experienced entrepreneurs and technologists with backgrounds in AI, marketing, and business growth. Our team has built and scaled multiple successful SaaS platforms and helped thousands of businesses grow through technology."
        },
        {
          question: "How do you protect my privacy and business information?",
          answer: "Privacy is fundamental to our platform. We use zero-knowledge architecture where possible, encrypt all data in transit and at rest, and never access your content without explicit permission. We're GDPR compliant and follow strict data protection protocols."
        },
        {
          question: "Where is my data stored and processed?",
          answer: "Data is stored in secure, SOC 2 certified data centers with geo-redundancy for reliability. Australian customers can choose local data residency. All processing meets international privacy standards including GDPR, CCPA, and Australian Privacy Principles."
        },
        {
          question: "What's your refund and satisfaction guarantee policy?",
          answer: "We offer a 30-day money-back guarantee for all new customers. If you're not satisfied within the first month, we'll provide a full refund, no questions asked. We're confident in our platform's value and stand behind our service quality."
        },
        {
          question: "Is JB-SaaS an Australian-owned company?",
          answer: "Yes, JB-SaaS is proudly Australian-owned and operated. We understand the unique needs of Australian businesses and provide local support during Australian business hours. We also offer specialized services for Australian customers including full social media setup."
        },
        {
          question: "What's your long-term vision for the platform?",
          answer: "Our vision is to democratize enterprise-level marketing intelligence for businesses of all sizes. We're continuously expanding our AI capabilities, integrations, and features to help businesses compete more effectively in the digital marketplace."
        }
      ]
    },
    {
      title: "Australian Services",
      icon: Globe,
      color: "text-green-600",
      questions: [
        {
          question: "What is the Aussie Name & Domain Scout service?",
          answer: "Our Name & Domain Scout service provides comprehensive business name research specifically for Australian businesses. We check ASIC name availability, domain availability across multiple extensions (.com.au, .com, .net.au), and offer optional trademark screening through IP Australia. You receive a detailed AI-generated report with recommendations and next steps."
        },
        {
          question: "How does ABN validation work for Australian services?",
          answer: "We integrate with official Australian Business Register (ABR) APIs to validate your ABN in real-time. This ensures your business is legitimately registered and eligible for our Australian-specific services. ABN validation is required for both our Quick-Start Social Setup and Name Scout services to maintain compliance with Australian business regulations."
        },
        {
          question: "What does trademark screening include in the Name Scout service?",
          answer: "Trademark screening searches IP Australia's trademark database for existing or pending trademarks that might conflict with your proposed business name. We identify similar marks, assess potential risks, and provide recommendations. Professional plan subscribers get this included free, while others can add it for AU$50."
        },
        {
          question: "How long does the Aussie Quick-Start Social Setup take?",
          answer: "Setup typically takes 2-5 business days from payment to completion. Professional subscribers get priority processing and may see completion in 1-3 days. Enterprise customers receive same-day processing for urgent requests. We'll keep you updated throughout the entire process with regular status updates."
        },
        {
          question: "Do I need to be an Australian business to use these services?",
          answer: "Yes, our Australian services are exclusively for businesses registered in Australia with valid ABNs. This allows us to provide specialized local expertise, comply with Australian business regulations, and offer services tailored to the Australian market. International businesses can still use our core JBSAAS platform."
        },
        {
          question: "What's included in the social media setup service?",
          answer: "We handle complete setup of your Facebook Business Manager, Instagram Business account, Meta App configuration, and integration with JBSAAS. This includes business verification, profile optimization, pixel installation, advertising account setup, and connection of all accounts to your JBSAAS dashboard for seamless content management."
        },
        {
          question: "Can I get refunds for Australian services if I'm not satisfied?",
          answer: "Yes, we offer a 14-day satisfaction guarantee for all Australian services. If the setup doesn't meet your expectations or we can't complete the service as promised, we'll provide a full refund. Our goal is 100% customer satisfaction with our specialized Australian business services."
        },
        {
          question: "What makes your Australian services different from DIY setup?",
          answer: "Our team has specialized expertise in Australian business compliance, local market optimization, and platform best practices. We handle complex configurations, ensure proper business verification, optimize for Australian audiences, and provide ongoing support. This saves you 10-15 hours of setup time and ensures everything is done correctly from the start."
        }
      ]
    },
    {
      title: "Advanced Features",
      icon: Clock,
      color: "text-purple-600",
      questions: [
        {
          question: "How does cross-business management work?",
          answer: "Enterprise customers can manage multiple businesses from a single JBSAAS account. Each business gets its own profile, branding, content strategy, and analytics while sharing templates and insights across businesses. You can switch between businesses instantly and compare performance across your portfolio."
        },
        {
          question: "Can I manage multiple brands in one account?",
          answer: "Yes, our business profile system allows unlimited brands/businesses under Professional and Enterprise plans. Each brand maintains separate social accounts, content calendars, analytics, and brand voice settings. You can create content for specific brands or deploy campaigns across multiple brands simultaneously."
        },
        {
          question: "What competitive analysis features are included?",
          answer: "Our competitive analysis tracks competitor content performance, posting frequency, engagement rates, trending topics, and audience growth. You'll see what content works in your industry, optimal posting times, content gaps to exploit, and strategic recommendations. Professional and Enterprise plans include real-time competitor monitoring."
        },
        {
          question: "How does the business intelligence dashboard work?",
          answer: "The BI dashboard aggregates data from all your social accounts, content performance, competitor analysis, and industry trends. It provides strategic recommendations, ROI tracking, content optimization suggestions, and predictive insights. Enterprise customers get custom reporting and data export capabilities."
        },
        {
          question: "What AI models power the content generation?",
          answer: "We use multiple AI models including GPT-4, Claude, and proprietary models trained specifically for business content. The system combines general language understanding with business-specific training data, your brand voice, and performance feedback to create increasingly relevant content for your audience."
        },
        {
          question: "Can I customize AI prompts and content templates?",
          answer: "Professional and Enterprise customers can create custom AI prompts, modify content templates, and build brand-specific content frameworks. You can save successful prompts, create template libraries, and even share templates across multiple businesses. Enterprise customers get white-label template customization."
        },
        {
          question: "How does the platform learn my brand voice?",
          answer: "The AI analyzes your existing content, website copy, and manual inputs to understand your brand voice, tone, and messaging preferences. Over time, it learns from your edits, approvals, and performance data to create increasingly on-brand content. You can also upload brand guidelines and style documents for training."
        },
        {
          question: "What integrations are available for enterprise customers?",
          answer: "Enterprise customers get access to custom integrations including CRM systems (Salesforce, HubSpot), marketing automation (Marketo, Pardot), analytics platforms (Adobe Analytics, Mixpanel), and custom APIs. We also offer webhook integrations and can build custom connectors for specialized business systems."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <HeroSection backgroundImage={aiContentHero}>
        <div className="max-w-5xl mx-auto animate-fade-in text-center">
          <Badge className="mb-8 bg-primary/10 text-primary border-primary/20 text-lg px-6 py-3">
            <HelpCircle className="w-5 h-5 mr-2" />
            🇦🇺 Complete Australian Business Support
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-white">
            Common <span className="text-yellow-400">Questions</span><br />
            About <span className="text-yellow-400">JB-SaaS</span>
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto">
            Everything Australian businesses need to know about our AI-powered content creation and marketing automation platform.
          </p>
        </div>
      </HeroSection>

      {/* Questions by Category */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {questionCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                {/* Category Section with Background */}
                <div className="relative py-12 md:py-16 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                      alt="Technology support background"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-purple-900/85"></div>
                  </div>
                  
                  {/* Section Background Effects */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse z-10"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse animation-delay-500 z-10"></div>
                  
                  <div className="relative z-20 px-6">
                    {/* Category Header */}
                    <div className="flex items-center justify-center mb-12">
                      <div className="text-center">
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center backdrop-blur-sm`}>
                          <category.icon className={`w-10 h-10 text-white`} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                          {category.title === "Platform & Technology" && (
                            <>Platform & <span className="text-yellow-400">Technology</span></>
                          )}
                          {category.title === "Business Strategy" && (
                            <>Business <span className="text-yellow-400">Strategy</span></>
                          )}
                          {category.title === "Implementation & Support" && (
                            <>Implementation & <span className="text-yellow-400">Support</span></>
                          )}
                          {category.title === "Company & Trust" && (
                            <>Company & <span className="text-yellow-400">Trust</span></>
                          )}
                          {category.title === "Australian Services" && (
                            <>Australian <span className="text-yellow-400">Services</span></>
                          )}
                          {category.title === "Advanced Features" && (
                            <>Advanced <span className="text-yellow-400">Features</span></>
                          )}
                        </h2>
                        <p className="text-white/80 text-lg">
                          {category.questions.length} comprehensive answers to help your business succeed
                        </p>
                      </div>
                    </div>

                    {/* Questions Accordion */}
                    <div className="max-w-4xl mx-auto">
                      <Card className="border-2 border-white/20 shadow-2xl bg-white/10 backdrop-blur-md">
                        <CardContent className="p-8">
                          <Accordion type="single" collapsible className="w-full">
                            {category.questions.map((qa, index) => (
                              <AccordionItem key={index} value={`${categoryIndex}-${index}`} className="border-b border-white/20">
                                <AccordionTrigger className="text-left hover:no-underline py-6 text-white hover:text-white/90 transition-colors">
                                  <span className="font-semibold pr-4 text-lg">{qa.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-white/80 leading-relaxed pb-6 text-base">
                                  {qa.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="relative py-16 md:py-24 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Customer support team background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-green-900/80 to-blue-900/85"></div>
        </div>
        
        {/* Section Background Effects */}
        <div className="absolute top-0 left-0 w-52 h-52 bg-gradient-to-r from-green-500/15 to-transparent rounded-full blur-3xl animate-pulse z-10"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-l from-blue-500/15 to-transparent rounded-full blur-3xl animate-pulse animation-delay-700 z-10"></div>
        
        <div className="relative z-20 container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Still Have Questions?</h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
              Our Australian team is here to help you succeed. Get personalized answers about how JB-SaaS can transform your business with AI-powered marketing automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/pricing">
                <Button size="xl" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-12 py-6">
                  <ArrowRight className="w-6 h-6 mr-3" />
                  Get Started Now
                </Button>
              </Link>
              <Button variant="outline-white" size="xl" className="text-lg px-12 py-6">
                Contact Sales Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative py-16 md:py-20 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Analytics dashboard background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-purple-900/80 to-pink-900/85"></div>
        </div>
        
        <div className="relative z-20 container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Commitment to Australian Businesses</h3>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Comprehensive support and resources designed specifically for the Australian market
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-yellow-400 mb-2">46</div>
                <div className="text-white/80 font-medium">Questions Answered</div>
              </CardContent>
            </Card>
            <Card className="p-6 text-center bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-yellow-400 mb-2">6</div>
                <div className="text-white/80 font-medium">Key Categories</div>
              </CardContent>
            </Card>
            <Card className="p-6 text-center bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-white/80 font-medium">Support Available</div>
              </CardContent>
            </Card>
            <Card className="p-6 text-center bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-yellow-400 mb-2">100%</div>
                <div className="text-white/80 font-medium">Satisfaction Goal</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/jbsaaslogo.png" 
                alt="JB-SaaS Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-gradient-primary">JB-Software-As-A-Service</span>
            </div>
            <p className="text-muted-foreground">
              © 2025 JB-Software-As-A-Service. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommonQuestions;