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
      title: "About Our Service",
      icon: Stethoscope,
      color: "text-primary",
      questions: [
        {
          question: "What skin concerns do you help with?",
          answer: "We provide clinical assessment and treatment plans for a range of common skin concerns including acne and congestion, hormonal acne and PCOS-related skin concerns, rosacea and redness, pigmentation and uneven tone, post-weight-loss skin support, skin ageing and sun damage prevention, and skin barrier dysfunction such as eczema and dermatitis where appropriate."
        },
        {
          question: "How does the consultation work?",
          answer: "After booking, you'll complete an intake form sharing your skin history and concerns. If requested, you may upload photos. A qualified clinician reviews your case and provides a personalised assessment and treatment plan. The entire process is conducted via telehealth, meaning you can access care from anywhere in Australia."
        },
        {
          question: "Do you prescribe medications?",
          answer: "Where clinically appropriate following assessment, prescription or compounded topical treatments may be recommended. Prescriptions are only provided when a clinician determines they are suitable for your specific situation. We do not advertise or promote specific prescription medicines."
        },
        {
          question: "Do you use compounded creams?",
          answer: "Where appropriate, treatment plans may include compounded topical formulations arranged through partner pharmacies. These are personalised preparations tailored to your specific skin needs and are only recommended when clinically indicated."
        },
        {
          question: "Is this service suitable for everyone?",
          answer: "Our telehealth service is suitable for many common skin concerns. However, some conditions require in-person assessment. If during your consultation we identify concerns that require face-to-face care, such as suspicious lesions, rapidly changing moles, or severe infections, we will refer you to an appropriate provider."
        },
        {
          question: "What are your red flags for referral?",
          answer: "We recommend in-person care for suspicious lesions or skin cancers, rapidly changing moles, severe skin infections requiring urgent attention, conditions requiring physical examination, or any concern where telehealth assessment would be insufficient. Your safety is our priority."
        }
      ]
    },
    {
      title: "Photos & Privacy",
      icon: Shield,
      color: "text-secondary",
      questions: [
        {
          question: "What photos are required?",
          answer: "Depending on your concern, you may be asked to provide clear photos of the affected areas. We'll provide specific guidance on what's needed. Good lighting and close-up images help our clinicians provide the most accurate assessment."
        },
        {
          question: "How are my photos stored?",
          answer: "All photos and personal information are stored securely in compliance with Australian Privacy Principles. Your data is encrypted and stored in Australian data centres. We never share your information without your consent except as required by law."
        },
        {
          question: "Who sees my information?",
          answer: "Only the clinical team directly involved in your care will access your personal health information and photos. We maintain strict confidentiality and follow healthcare privacy standards."
        }
      ]
    },
    {
      title: "Consultations & Follow-up",
      icon: Heart,
      color: "text-accent",
      questions: [
        {
          question: "How long does it take to receive my treatment plan?",
          answer: "After completing your intake and providing any requested photos, our clinical team typically reviews your case within 1-3 business days. You'll receive your personalised assessment and treatment recommendations via the patient portal."
        },
        {
          question: "Can I book follow-up consultations?",
          answer: "Yes, follow-up consultations are available and often recommended to monitor your progress and adjust your treatment plan as needed. Skin health is a journey, and ongoing support helps achieve the best outcomes."
        },
        {
          question: "What if my treatment isn't working?",
          answer: "If you're not seeing the expected progress, book a follow-up consultation. Our clinicians will reassess your situation and may adjust your treatment plan. Results vary between individuals, and sometimes modifications are needed."
        },
        {
          question: "When will I be referred elsewhere?",
          answer: "We refer patients when their condition requires in-person examination, specialist dermatologist review, or treatment beyond the scope of telehealth. This includes suspicious lesions, complex conditions, or when you're not responding to initial treatment approaches."
        }
      ]
    },
    {
      title: "Important Information",
      icon: Activity,
      color: "text-green-600",
      questions: [
        {
          question: "Is this a substitute for seeing a dermatologist in person?",
          answer: "Our telehealth service is appropriate for many common skin concerns but is not a replacement for in-person dermatology care when that is clinically indicated. We will always recommend face-to-face consultation when necessary."
        },
        {
          question: "What results can I expect?",
          answer: "Results vary between individuals and depend on your specific condition, how consistently you follow your treatment plan, and individual factors. We cannot guarantee specific outcomes. Our clinicians will provide realistic expectations during your consultation."
        },
        {
          question: "Do you offer cosmetic treatments?",
          answer: "Our focus is on clinical skin health rather than cosmetic procedures. We assess and treat skin conditions from a medical perspective, focusing on long-term skin health and function rather than cosmetic enhancement."
        },
        {
          question: "How do I know if my concern is serious?",
          answer: "If you have any concerns about a changing mole, new growth, non-healing wound, or any skin issue that worries you, please see your GP or a dermatologist in person. Do not rely solely on telehealth for potentially serious conditions. When in doubt, seek in-person care."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <HeroSection backgroundImage={aiContentHero}>
        <div className="max-w-5xl mx-auto animate-fade-in text-center">
          <Badge className="mb-6 md:mb-8 bg-[#3f5f55]/80 backdrop-blur-sm text-white border-white/30 text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 font-semibold">
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Frequently Asked Questions
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight text-white">
            Common <span className="text-[#f7f2d3]">Questions</span><br />
            About <span className="text-[#f7f2d3]">Our Service</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-2">
            Everything you need to know about Downscale Derm consultations, treatment plans, and what to expect.
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
                {/* Background */}
                <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3f5f55]/95 via-[#6b8f7a]/90 to-[#3f5f55]/95"></div>
                </div>
                
                {/* Section Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-[#f7f2d3]/10 to-transparent rounded-full blur-3xl z-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-[#6b8f7a]/20 to-transparent rounded-full blur-3xl z-10"></div>
                  
                  <div className="relative z-20 px-6">
                    {/* Category Header */}
                    <div className="flex items-center justify-center mb-12">
                      <div className="text-center">
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center backdrop-blur-sm`}>
                          <category.icon className={`w-10 h-10 text-white`} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                          {category.title === "About Our Service" && (
                            <>About Our <span className="text-[#f7f2d3]">Service</span></>
                          )}
                          {category.title === "Photos & Privacy" && (
                            <>Photos & <span className="text-[#f7f2d3]">Privacy</span></>
                          )}
                          {category.title === "Consultations & Follow-up" && (
                            <>Consultations & <span className="text-[#f7f2d3]">Follow-up</span></>
                          )}
                          {category.title === "Important Information" && (
                            <>Important <span className="text-[#f7f2d3]">Information</span></>
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
      <section className="relative py-16 md:py-24 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-[#3f5f55] to-[#6b8f7a]">
        <div className="relative z-20 container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Still Have Questions?</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed">
              We're here to help. Book a consultation and our clinical team will address your specific concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/pricing">
                <Button size="xl" className="bg-[#f7f2d3] text-[#3f5f55] hover:bg-[#f7f2d3]/90 font-bold text-lg px-12 py-6">
                  <ArrowRight className="w-6 h-6 mr-3" />
                  Book a Consultation
                </Button>
              </Link>
              <ComingSoonPopup 
                trigger={
                  <Button variant="outline" size="xl" className="text-lg px-12 py-6 border-white/30 text-white hover:bg-white/10">
                    Contact Us
                  </Button>
                } 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3f5f55] text-white border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/downscalederm-icon.png" 
                alt="Downscale Derm" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-[#f7f2d3]">Downscale Derm</span>
            </div>
            <p className="text-white/60 text-sm max-w-2xl mx-auto mb-4">
              This website provides general information only and does not replace medical advice. Prescription treatments are only recommended if clinically appropriate following assessment.
            </p>
            <p className="text-white/60">
              © 2025 Downscale Derm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommonQuestions;
