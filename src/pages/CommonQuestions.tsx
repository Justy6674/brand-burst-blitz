import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
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
  Globe
} from "lucide-react";

const CommonQuestions = () => {
  const questionCategories = [
    {
      title: "Platform & Technology",
      icon: Brain,
      color: "text-primary",
      questions: [
        {
          question: "How does the AI content generation actually work?",
          answer: "Our AI uses advanced language models trained specifically for business content creation. It learns your brand voice, analyzes your industry, and generates content that matches your style and messaging. The AI considers factors like your target audience, brand guidelines, and content performance data to create highly relevant posts."
        },
        {
          question: "What social media platforms does JB-SaaS integrate with?",
          answer: "JB-SaaS currently supports Facebook, Instagram, LinkedIn, and Twitter. We provide content creation and scheduling instructions for all platforms. For Australian customers, we offer full setup and management services for an additional fee."
        },
        {
          question: "How secure is my business data on the JB-SaaS platform?",
          answer: "We use enterprise-grade security with end-to-end encryption, SOC 2 compliance, and regular security audits. Your data is stored in secure, geo-redundant servers with 99.9% uptime guarantee. We never share your data with third parties and you maintain full ownership of all content created."
        },
        {
          question: "Can I export my content and data if I decide to leave?",
          answer: "Absolutely. You have full data portability rights. You can export all your content, analytics data, and account information in standard formats (CSV, JSON) at any time. There are no lock-in contracts or data retention fees."
        },
        {
          question: "What makes JB-SaaS different from other AI content tools?",
          answer: "JB-SaaS is specifically designed for business growth, not just content creation. We combine AI content generation with competitor analysis, business intelligence, and strategic recommendations. Our system learns and adapts to your business outcomes, not just content metrics."
        },
        {
          question: "How often is the AI model updated and improved?",
          answer: "Our AI models are continuously updated with the latest advancements in language technology. We deploy improvements monthly and major updates quarterly. The system also learns from your feedback and performance data to improve personalized recommendations."
        },
        {
          question: "Does JB-SaaS work for all industries and business types?",
          answer: "Yes, JB-SaaS is industry-agnostic and works for B2B, B2C, e-commerce, professional services, healthcare, finance, and more. The AI adapts to your specific industry language, compliance requirements, and audience preferences."
        },
        {
          question: "What API integrations are available?",
          answer: "We offer REST APIs for content management, analytics, and scheduling. Popular integrations include CRM systems (Salesforce, HubSpot), email marketing tools (Mailchimp, ConvertKit), and analytics platforms (Google Analytics, Facebook Insights)."
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
          answer: "Google's AI algorithms now prioritize helpful, original content that demonstrates expertise. Regular blogging with strategic keywords helps establish topical authority, increases indexed pages, and provides fresh content signals. Businesses with active blogs get 55% more website visitors and 97% more inbound links."
        },
        {
          question: "How does competitor analysis actually help my business grow?",
          answer: "Our competitor analysis reveals content gaps, successful strategies, and market opportunities. You'll see what content performs best in your industry, optimal posting times, trending topics, and messaging that resonates. This intelligence helps you stay ahead rather than playing catch-up."
        },
        {
          question: "What's the ROI of consistent social media marketing?",
          answer: "Consistent social media marketing typically delivers 3-5x ROI within 6 months. Benefits include increased brand awareness (2.5x), website traffic (3x), lead generation (2x), and customer retention (40% improvement). JB-SaaS customers see results 60% faster due to AI optimization."
        },
        {
          question: "How will AI agents discover my business in the future?",
          answer: "AI agents like ChatGPT and future AI assistants will recommend businesses based on comprehensive online presence, content quality, and relevance. Having consistent, high-quality content across platforms ensures your business appears in AI recommendations when customers ask for solutions."
        },
        {
          question: "Should I focus more on SEO or social media marketing?",
          answer: "Both are essential and work synergistically. SEO provides long-term organic traffic, while social media offers immediate engagement and brand building. JB-SaaS creates content optimized for both, ensuring your message reaches audiences through multiple channels for maximum impact."
        },
        {
          question: "How much should a business spend on content marketing?",
          answer: "Most successful businesses allocate 6-10% of revenue to marketing, with 25-30% of that on content. JB-SaaS reduces content costs by 80-90% compared to agencies while improving quality and consistency. You get enterprise-level content strategy at a fraction of traditional costs."
        },
        {
          question: "What content types perform best for B2B vs B2C?",
          answer: "B2B audiences prefer educational content, case studies, and industry insights that demonstrate expertise. B2C audiences engage more with entertaining, emotional, and visual content. JB-SaaS automatically adapts content style, tone, and format based on your target audience and industry."
        },
        {
          question: "How do I measure content marketing success?",
          answer: "Key metrics include engagement rates, website traffic, lead generation, conversion rates, and brand mention growth. JB-SaaS provides comprehensive analytics showing content performance, audience growth, competitor comparisons, and ROI tracking across all platforms."
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
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <HelpCircle className="w-4 h-4 mr-2" />
            Everything You Need to Know
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-primary">Common Questions</span>
            <br />About JB-SaaS
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Get answers to the most frequently asked questions about our AI-powered content creation platform.
          </p>
        </div>
      </section>

      {/* Questions by Category */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {questionCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                {/* Category Header */}
                <div className="flex items-center mb-8">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mr-4`}>
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{category.title}</h2>
                    <p className="text-muted-foreground">
                      {category.questions.length} questions answered
                    </p>
                  </div>
                </div>

                {/* Questions Accordion */}
                <Card className="border-2 border-muted/50 shadow-lg">
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((qa, index) => (
                        <AccordionItem key={index} value={`${categoryIndex}-${index}`} className="border-b border-muted/30">
                          <AccordionTrigger className="text-left hover:no-underline py-6">
                            <span className="font-semibold pr-4">{qa.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                            {qa.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <Users className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our team is here to help you succeed. Get personalized answers about how JB-SaaS can transform your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary shadow-glow">
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Contact Sales Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-primary mb-2">30</div>
              <div className="text-sm text-muted-foreground">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-primary mb-2">4</div>
              <div className="text-sm text-muted-foreground">Key Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Goal</div>
            </div>
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