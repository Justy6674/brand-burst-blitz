import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComingSoonPopup } from "@/components/common/ComingSoonPopup";
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
  ArrowRight,
  Stethoscope,
  Heart,
  Activity
} from "lucide-react";
import aiContentHero from "@/assets/ai-content-creation-hero.jpg";

const CommonQuestions = () => {
  const questionCategories = [
    {
      title: "AHPRA Compliance & Safety",
      icon: Shield,
      color: "text-primary",
      questions: [
        {
          question: "How does AHPRA compliance validation work?",
          answer: "Our AI automatically screens all generated content against AHPRA advertising guidelines. We check for prohibited therapeutic claims, ensure appropriate professional boundaries are maintained, and flag any content that could violate advertising standards. Every piece of content receives a compliance score before publication."
        },
        {
          question: "What TGA guidelines does the platform follow?",
          answer: "We integrate TGA therapeutic goods advertising guidelines into our content generation. The platform automatically prevents claims about treating, curing, or preventing diseases unless you have appropriate TGA approvals. We maintain an updated database of prohibited claims and automatically flag potential violations."
        },
        {
          question: "How do you ensure patient privacy in content creation?",
          answer: "All content generation follows Australian Privacy Principles for health information. We never use patient data in content creation, maintain strict data segregation, and ensure no patient-identifiable information can appear in generated content. All healthcare content focuses on general education rather than specific patient cases."
        },
        {
          question: "Can I use this for multiple practice locations?",
          answer: "Yes, our Group Practice and Healthcare Network plans support multiple locations. Each location can have separate branding, content strategies, and compliance workflows while maintaining centralized oversight. Solo Practitioner plans support up to 5 locations."
        },
        {
          question: "What happens if AHPRA guidelines change?",
          answer: "We continuously monitor AHPRA guideline updates and automatically update our compliance algorithms. Existing content is rescanned against new guidelines, and you'll receive notifications about any content requiring updates. Our healthcare team reviews all guideline changes to ensure ongoing compliance."
        },
        {
          question: "How does this compare to hiring a healthcare compliance consultant?",
          answer: "Traditional healthcare compliance consultants cost $3,000-5,000 monthly and only provide periodic reviews. Our platform provides real-time compliance checking, automated content validation, and continuous monitoring for a fraction of the cost while ensuring 100% of your content is compliant."
        }
      ]
    },
    {
      title: "Healthcare Professional Features",
      icon: Stethoscope,
      color: "text-secondary",
      questions: [
        {
          question: "What healthcare professions are supported?",
          answer: "JB-SaaS supports all AHPRA-registered healthcare professionals including GPs, Specialists (Cardiologists, Dermatologists, etc.), Allied Health (Physiotherapists, Psychologists, Dietitians, Exercise Physiologists), Nurse Practitioners, Dentists, Pharmacists, and other healthcare providers. Content is customized for each profession's specific requirements."
        },
        {
          question: "How does patient education content differ from marketing content?",
          answer: "Patient education content focuses on providing helpful health information without promotional intent, following AHPRA guidelines for educational material. Marketing content promotes your services while maintaining professional boundaries. Our AI understands this distinction and generates appropriate content for each purpose."
        },
        {
          question: "Can I create content for different healthcare specialties?",
          answer: "Yes, our platform includes specialty-specific templates and compliance rules for all major healthcare specialties. Whether you're in mental health, women's health, cardiology, or any other specialty, the AI understands your specific regulatory requirements and professional standards."
        },
        {
          question: "How does the platform handle sensitive health topics?",
          answer: "We maintain strict guidelines for sensitive health topics including mental health, sexual health, weight management, and chronic diseases. Content is generated with appropriate sensitivity, avoids stigmatizing language, and maintains professional therapeutic boundaries at all times."
        },
        {
          question: "What about telehealth and Medicare compliance?",
          answer: "Our platform includes templates and guidelines for telehealth services, Medicare requirements, and bulk billing communications. We help you create compliant content about your telehealth offerings while following Medicare and AHPRA guidelines for remote healthcare services."
        },
        {
          question: "Can I manage content for multiple practitioners?",
          answer: "Group Practice and Healthcare Network plans include multi-practitioner management with role-based permissions. Each practitioner can have personalized content while maintaining practice-wide compliance and branding consistency. You can approve content across your entire healthcare team."
        }
      ]
    },
    {
      title: "Platform Technology & Integration",
      icon: Brain,
      color: "text-accent",
      questions: [
        {
          question: "How does the AI learn healthcare-specific language?",
          answer: "Our AI is trained on healthcare-specific datasets, AHPRA guidelines, medical literature, and Australian healthcare communication standards. It understands medical terminology, professional language requirements, and patient communication best practices specific to Australian healthcare."
        },
        {
          question: "What practice management systems can you integrate with?",
          answer: "We integrate with popular Australian practice management systems including Medical Director, Best Practice, Zedmed, and others. Integration allows for appointment-based content, patient education material coordination, and practice workflow automation while maintaining privacy compliance."
        },
        {
          question: "How secure is patient data and practice information?",
          answer: "We use healthcare-grade security with end-to-end encryption, comply with Australian Privacy Principles for health information, and maintain ISO 27001 certification. All data is stored in Australian data centers with strict access controls and regular security audits."
        },
        {
          question: "Can I customize content for my practice's specialty focus?",
          answer: "Absolutely. The platform learns your practice's specialty focus, target patient demographics, treatment approaches, and communication style. Whether you focus on pediatrics, geriatrics, sports medicine, or any other area, content is tailored to your expertise."
        },
        {
          question: "What social media platforms work with healthcare content?",
          answer: "We support Facebook, Instagram, LinkedIn, and other platforms with healthcare-specific formatting and compliance checking. Each platform has different requirements for healthcare content, and our system automatically adapts content to meet each platform's healthcare advertising policies."
        },
        {
          question: "How does competitor analysis work for healthcare practices?",
          answer: "We analyze other healthcare practices' public content within ethical boundaries, identifying successful patient education strategies, content gaps in your area, and opportunities for professional differentiation while maintaining ethical competitive intelligence practices."
        }
      ]
    },
    {
      title: "Implementation & Support",
      icon: Heart,
      color: "text-success",
      questions: [
        {
          question: "How long does setup take for a healthcare practice?",
          answer: "Basic setup takes 15-30 minutes. Our Healthcare Quick-Start service (available for Australian practices) provides complete setup within 2-5 business days, including social media configuration, compliance setup, and initial content creation. You'll see compliant content within your first week."
        },
        {
          question: "Do I need technical skills to use the platform?",
          answer: "No technical skills required. The platform is designed specifically for busy healthcare professionals. Our intuitive interface guides you through content creation, and our AI handles the complex compliance checking. We provide healthcare-specific training videos and 24/7 support."
        },
        {
          question: "What support is available for healthcare professionals?",
          answer: "All plans include email support with healthcare-experienced staff. Group Practice plans get priority support, and Healthcare Network plans include dedicated account managers with healthcare industry experience. We understand healthcare workflows and time constraints."
        },
        {
          question: "Can you help with existing non-compliant content?",
          answer: "Yes, we can analyze your existing content for AHPRA compliance and provide recommendations for updates. Our platform can identify potential compliance issues in your current social media, website content, and marketing materials, helping you achieve full compliance."
        },
        {
          question: "What training is provided for healthcare teams?",
          answer: "We provide healthcare-specific training covering AHPRA compliance, patient education best practices, and platform usage. Training includes live sessions for larger practices, video tutorials, and ongoing support. We understand healthcare professional schedules and offer flexible training options."
        },
        {
          question: "How do you handle urgent compliance questions?",
          answer: "Healthcare Network plans include priority support for urgent compliance questions. We maintain relationships with healthcare law experts and can provide rapid guidance on complex compliance situations. Our goal is to never leave healthcare professionals uncertain about compliance."
        }
      ]
    },
    {
      title: "Healthcare Business Growth",
      icon: Activity,
      color: "text-green-600",
      questions: [
        {
          question: "How does consistent patient education help practice growth?",
          answer: "Regular patient education builds trust, demonstrates expertise, and improves patient engagement. Healthcare practices with consistent educational content see 60% more patient inquiries, improved patient retention, and increased referrals from both patients and other healthcare professionals."
        },
        {
          question: "What's the ROI for healthcare practice marketing?",
          answer: "Healthcare practices typically see 3-5x ROI within 6 months through increased patient bookings, improved patient retention, and professional referrals. JB-SaaS customers see results 40% faster due to AHPRA-compliant automation and healthcare-specific optimization."
        },
        {
          question: "How do you measure success for healthcare practices?",
          answer: "We track healthcare-specific metrics including patient inquiry rates, appointment bookings from content, professional referral increases, patient engagement with educational content, and compliance score maintenance. Our analytics understand healthcare practice success factors."
        },
        {
          question: "Can this help with professional referral relationships?",
          answer: "Yes, our platform helps create content that demonstrates your expertise to other healthcare professionals, facilitates appropriate professional networking content, and maintains visibility within healthcare communities while respecting professional boundaries and patient privacy."
        },
        {
          question: "How does AI agent discovery work for healthcare practices?",
          answer: "Future AI assistants will recommend healthcare providers based on comprehensive online presence and expertise demonstration. Consistent, high-quality educational content ensures your practice appears when patients ask AI assistants for healthcare provider recommendations in your specialty and location."
        },
        {
          question: "What about patient reviews and reputation management?",
          answer: "While we don't directly manage reviews, our patient education content builds trust and improves patient satisfaction, naturally leading to better reviews. We help create content that addresses common patient concerns and demonstrates your commitment to patient care and education."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <HeroSection backgroundImage={aiContentHero}>
        <div className="max-w-5xl mx-auto animate-fade-in text-center">
          <Badge className="mb-6 md:mb-8 bg-black/40 backdrop-blur-sm text-white border-white/30 text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 font-semibold">
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            🏥 Australian Healthcare Professional Support
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 md:mb-8 leading-tight text-white">
            Healthcare Professional <span className="text-yellow-400">Questions</span><br />
            About <span className="text-yellow-400">AHPRA Compliance</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-2">
            Everything Australian healthcare professionals need to know about AHPRA-compliant content creation and patient education.
          </p>
        </div>
      </HeroSection>

      {/* Questions by Category */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {questionCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                {/* Category Section with Background */}
                <div className="relative py-8 md:py-12 lg:py-16 overflow-hidden mx-2 md:mx-4 lg:mx-8 my-4 md:my-8 rounded-xl md:rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
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
                          {category.title === "AHPRA Compliance & Safety" && (
                            <>AHPRA Compliance & <span className="text-yellow-400">Safety</span></>
                          )}
                          {category.title === "Healthcare Professional Features" && (
                            <>Healthcare Professional <span className="text-yellow-400">Features</span></>
                          )}
                          {category.title === "Platform Technology & Integration" && (
                            <>Platform Technology & <span className="text-yellow-400">Integration</span></>
                          )}
                          {category.title === "Implementation & Support" && (
                            <>Implementation & <span className="text-yellow-400">Support</span></>
                          )}
                          {category.title === "Healthcare Business Growth" && (
                            <>Healthcare Business <span className="text-yellow-400">Growth</span></>
                          )}
                        </h2>
                        <p className="text-white/80 text-lg">
                          {category.questions.length} comprehensive answers for healthcare professionals
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Still Have Healthcare Questions?</h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
              Our Australian healthcare team understands the unique challenges of healthcare practice marketing. Get personalized answers about AHPRA compliance and patient education.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/pricing">
                <Button size="xl" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-12 py-6">
                  <ArrowRight className="w-6 h-6 mr-3" />
                  Get Started Now
                </Button>
              </Link>
              <ComingSoonPopup 
                trigger={
                  <Button variant="outline-white" size="xl" className="text-lg px-12 py-6">
                    Contact Healthcare Team
                  </Button>
                } 
              />
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
