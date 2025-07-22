import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { 
  HelpCircle, 
  Search, 
  Shield, 
  Settings, 
  Phone, 
  Stethoscope,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Book,
  Globe,
  Lock,
  Zap,
  Clock,
  Target,
  Heart,
  Award,
  Eye
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface FAQSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: FAQItem[];
}

export function HealthcareFAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('platform');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqData: FAQSection[] = [
    {
      id: 'platform',
      title: 'Platform Functionality & Features',
      description: 'Understanding how our healthcare-specific platform works for Australian practices',
      icon: <Stethoscope className="h-5 w-5" />,
      questions: [
        {
          id: 'platform-1',
          question: 'How does your platform differ from generic social media management tools like Hootsuite or Buffer?',
          answer: 'Our platform is specifically designed for Australian healthcare professionals with built-in AHPRA compliance checking, healthcare-specific content templates, patient education focus, and integration with Australian practice management systems. Unlike generic tools, every feature understands healthcare regulations and helps you maintain professional standards while engaging patients effectively.',
          category: 'platform',
          tags: ['comparison', 'features', 'healthcare-specific'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-2',
          question: 'What social media platforms does your system integrate with?',
          answer: 'We integrate with Facebook, Instagram, LinkedIn, Google My Business, and website blogs. Each integration is configured with healthcare-appropriate posting guidelines, AHPRA-compliant content formatting, and automatic compliance checks before publication. We focus on platforms most relevant to healthcare practices rather than trying to support every social network.',
          category: 'platform',
          tags: ['social-media', 'integration', 'platforms'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-3',
          question: 'How does the AI content generation work for healthcare practices?',
          answer: 'Our AI is trained specifically on healthcare communication best practices and AHPRA guidelines. It generates patient education content, practice updates, health tips, and seasonal health reminders while automatically checking for prohibited therapeutic claims, ensuring professional tone, and including appropriate medical disclaimers. All content requires your review before publishing.',
          category: 'platform',
          tags: ['ai', 'content-generation', 'compliance'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-4',
          question: 'Can I manage multiple practice locations or businesses in one account?',
          answer: 'Yes, our multi-practice dashboard allows you to manage multiple locations, specialties, or even different healthcare businesses from one account. Each practice has separate branding, content calendars, compliance settings, and team access controls while allowing you to switch between them seamlessly.',
          category: 'platform',
          tags: ['multi-practice', 'account-management', 'locations'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-5',
          question: 'What analytics and insights does the platform provide?',
          answer: 'You receive healthcare-specific analytics including patient engagement rates, appointment inquiry tracking, content performance by health topic, optimal posting times for your patient demographic, and compliance score monitoring. Our reports focus on metrics that matter to healthcare practices: patient education reach, appointment conversions, and professional boundary maintenance.',
          category: 'platform',
          tags: ['analytics', 'insights', 'metrics'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-6',
          question: 'How does the smart calendar and scheduling system work?',
          answer: 'Our healthcare calendar integrates content scheduling, appointment reminders, and practice tasks in one view. It includes voice-activated idea capture ("Hey JB, I have a patient education post idea"), AI-powered optimal posting time suggestions, and integration with your existing practice management calendar. It is designed to be as intuitive as Google Calendar but healthcare-focused.',
          category: 'platform',
          tags: ['calendar', 'scheduling', 'integration'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-7',
          question: 'Can I collaborate with my practice team on content creation?',
          answer: 'Absolutely. Our team collaboration features include role-based access (admin, content creator, viewer), content approval workflows, shared content libraries, team activity feeds, and audit trails. Perfect for practices where reception staff create content but doctors need to approve, or where multiple practitioners contribute to patient education materials.',
          category: 'platform',
          tags: ['collaboration', 'team', 'workflow'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-8',
          question: 'What content templates are available for healthcare practices?',
          answer: 'We provide 200+ healthcare-specific templates including patient education posts, seasonal health reminders, practice announcements, preventive care campaigns, mental health awareness content, and specialty-specific materials. All templates are AHPRA-compliant and can be customised for your practice specialty and patient demographic.',
          category: 'platform',
          tags: ['templates', 'content', 'specialties'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-9',
          question: 'How does competitor analysis work in the healthcare industry?',
          answer: 'Our competitor analysis respects healthcare professional standards by focusing on content trends, posting frequencies, and patient engagement approaches rather than sensitive clinical information. We help you understand what health topics resonate with patients in your area while maintaining professional boundaries and avoiding inappropriate comparisons.',
          category: 'platform',
          tags: ['competitor-analysis', 'professional-standards', 'ethics'],
          priority: 'low',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'platform-10',
          question: 'What mobile capabilities does the platform offer?',
          answer: 'Our platform is fully mobile-responsive with a dedicated mobile app experience. Healthcare professionals can create content, respond to patient inquiries, schedule posts, and monitor analytics on the go. Perfect for busy practitioners who need to manage their digital presence between patients or while on call.',
          category: 'platform',
          tags: ['mobile', 'app', 'accessibility'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        }
      ]
    },
    {
      id: 'compliance',
      title: 'AHPRA Compliance & Professional Standards',
      description: 'Ensuring your content meets Australian healthcare regulatory requirements',
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          id: 'compliance-1',
          question: 'How do you ensure all content complies with AHPRA advertising guidelines?',
          answer: 'Every piece of content goes through our AI-powered AHPRA compliance checker that scans for prohibited therapeutic claims, inappropriate patient testimonials, misleading statements, and missing disclaimers. We maintain an updated database of AHPRA guidelines and automatically flag potential violations before publication. Our system is regularly updated as guidelines change.',
          category: 'compliance',
          tags: ['ahpra', 'advertising', 'compliance-checking'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-2',
          question: 'Can I include patient testimonials or reviews in my content?',
          answer: 'No, AHPRA strictly prohibits patient testimonials in healthcare advertising. Our system automatically detects and prevents any testimonial-style content from being published. Instead, we help you create effective patient education content and practice information that builds trust while remaining compliant with professional standards.',
          category: 'compliance',
          tags: ['testimonials', 'reviews', 'prohibited-content'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-3',
          question: 'What about before/after photos and treatment results?',
          answer: 'Before/after photos require specific patient consent, appropriate disclaimers, and careful presentation to avoid misleading claims. Our system provides templates for compliant before/after content with required consent forms, proper disclaimers, and AHPRA-approved language. We recommend consulting your professional indemnity insurer for specific cases.',
          category: 'compliance',
          tags: ['before-after', 'photos', 'patient-consent'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-4',
          question: 'How do you handle TGA therapeutic goods advertising restrictions?',
          answer: 'Our AI compliance engine understands TGA restrictions on mentioning specific therapeutic goods, medical devices, and prescription medications. Content is automatically checked against TGA guidelines, and we provide alternative language suggestions that maintain your message while staying compliant. This includes restrictions on brand names and therapeutic claims.',
          category: 'compliance',
          tags: ['tga', 'therapeutic-goods', 'medications'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-5',
          question: 'What disclaimers should I include in my healthcare content?',
          answer: 'We automatically suggest appropriate disclaimers based on content type: "This information is general in nature. Please consult your healthcare provider for advice specific to your situation" for health advice, specific disclaimers for procedure information, and treatment-specific warnings where required. All disclaimer templates are AHPRA-compliant.',
          category: 'compliance',
          tags: ['disclaimers', 'health-advice', 'warnings'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-6',
          question: 'How do you ensure professional boundaries are maintained in social media interactions?',
          answer: 'Our platform includes guidelines for appropriate social media engagement, automated responses for appointment requests directing patients to proper channels, and warnings when interactions might cross professional boundaries. We help maintain therapeutic relationships while allowing meaningful patient education and community engagement.',
          category: 'compliance',
          tags: ['professional-boundaries', 'patient-interaction', 'social-media'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-7',
          question: 'What if AHPRA guidelines change after I\'ve published content?',
          answer: 'Our compliance monitoring system continuously scans your published content against updated guidelines. If regulations change, we alert you to content that may need revision and provide updated versions. Our legal team monitors AHPRA updates and pushes compliance updates to all users automatically.',
          category: 'compliance',
          tags: ['guideline-updates', 'monitoring', 'content-revision'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-8',
          question: 'Are there different compliance requirements for different healthcare specialties?',
          answer: 'Yes, our system recognises specialty-specific requirements. For example, mental health practitioners have additional privacy considerations, surgical specialties have specific restrictions on before/after content, and allied health professionals may have different scope-of-practice limitations. We customise compliance checking based on your registered professional category.',
          category: 'compliance',
          tags: ['specialties', 'scope-of-practice', 'custom-compliance'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-9',
          question: 'How do you handle patient privacy and confidentiality in content creation?',
          answer: 'All content creation tools include privacy checks that scan for potential patient identifiers, location-specific information that might compromise anonymity, and inappropriate sharing of clinical information. We provide templates for discussing cases in educational contexts while maintaining complete patient confidentiality.',
          category: 'compliance',
          tags: ['privacy', 'confidentiality', 'patient-protection'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'compliance-10',
          question: 'What documentation do you provide for compliance audits?',
          answer: 'We maintain detailed audit trails of all content creation, compliance checks performed, approvals given, and publication dates. This includes records of AI compliance scanning, manual reviews, and any compliance warnings or corrections made. All documentation is available for professional indemnity or AHPRA audit purposes.',
          category: 'compliance',
          tags: ['audit-trails', 'documentation', 'compliance-records'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        }
      ]
    },
    {
      id: 'practice',
      title: 'Practice Management & Integration',
      description: 'Integrating with your existing practice systems and workflows',
      icon: <Settings className="h-5 w-5" />,
      questions: [
        {
          id: 'practice-1',
          question: 'Which practice management systems do you integrate with?',
          answer: 'We integrate with major Australian practice management systems including Medical Director, Best Practice, Genie, Power Diary, HotDoc, and HealthEngine. Integration allows appointment booking tracking, patient demographic insights (anonymised), and synchronisation of practice schedules with content publishing calendars.',
          category: 'practice',
          tags: ['practice-management', 'integration', 'appointments'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-2',
          question: 'How does appointment booking integration work?',
          answer: 'Our appointment analytics track the patient journey from social media engagement to appointment booking, measuring which content types drive the most inquiries. We provide funnel analysis showing how your digital presence converts to actual appointments, helping you optimise content strategy for practice growth.',
          category: 'practice',
          tags: ['appointment-booking', 'patient-journey', 'conversion-tracking'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-3',
          question: 'Can I sync with my existing calendar systems?',
          answer: 'Yes, our smart calendar system integrates with Google Calendar, Outlook, Apple Calendar, and practice management calendars. This enables unified scheduling of content publication, appointment reminders, and practice tasks while avoiding conflicts and ensuring optimal timing for patient communications.',
          category: 'practice',
          tags: ['calendar-sync', 'scheduling', 'workflow-integration'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-4',
          question: 'How do you measure ROI for healthcare practices?',
          answer: 'We track healthcare-specific ROI metrics including cost per patient inquiry, appointment conversion rates, patient education reach, and practice brand awareness. Our reports show how digital marketing investment translates to new patients, retention rates, and practice growth while maintaining professional standards.',
          category: 'practice',
          tags: ['roi', 'metrics', 'practice-growth'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-5',
          question: 'What patient demographic insights do you provide?',
          answer: 'Our analytics provide anonymised patient demographic insights including age groups engaging with content, geographical reach, peak engagement times, and health topics of interest. All data is aggregated and anonymised to protect patient privacy while helping you understand your community\'s health information needs.',
          category: 'practice',
          tags: ['demographics', 'analytics', 'privacy-protected'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-6',
          question: 'How does the system help with practice reputation management?',
          answer: 'We monitor online mentions of your practice, track patient engagement sentiment, and provide tools for appropriate response to online discussions. Our system helps maintain professional reputation while respecting AHPRA guidelines about responding to reviews and managing online presence appropriately.',
          category: 'practice',
          tags: ['reputation-management', 'monitoring', 'online-presence'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-7',
          question: 'Can I track which content leads to appointment bookings?',
          answer: 'Our appointment attribution system tracks the patient journey from content engagement to booking, showing which posts, health topics, and campaigns drive the most appointments. This helps you focus content creation on topics that genuinely grow your practice while educating patients.',
          category: 'practice',
          tags: ['attribution', 'content-performance', 'appointment-tracking'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-8',
          question: 'What seasonal health campaign tools do you offer?',
          answer: 'We provide automated seasonal health campaigns for flu season, skin cancer awareness, mental health week, and specialty-specific awareness periods. Campaigns include content calendars, patient education materials, booking call-to-actions, and performance tracking to maximise public health impact and practice visibility.',
          category: 'practice',
          tags: ['seasonal-campaigns', 'public-health', 'awareness'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-9',
          question: 'How do you handle emergency communications and urgent practice announcements?',
          answer: 'Our emergency communication system allows immediate publication of urgent practice updates across all platforms, includes templates for common emergency scenarios (closures, health alerts, appointment changes), and provides priority notification systems to ensure patients receive critical information quickly.',
          category: 'practice',
          tags: ['emergency-communications', 'urgent-updates', 'notifications'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'practice-10',
          question: 'What reports can I generate for practice management meetings?',
          answer: 'Our practice management reports include digital presence performance, patient engagement metrics, appointment conversion analysis, content ROI calculations, and compliance adherence summaries. Reports are designed for healthcare practice meetings and include actionable insights for improving patient communication and practice growth.',
          category: 'practice',
          tags: ['reports', 'practice-meetings', 'management-insights'],
          priority: 'low',
          lastUpdated: '2024-01-24'
        }
      ]
    },
    {
      id: 'support',
      title: 'Technical Support & Troubleshooting',
      description: 'Getting help when you need it and resolving technical issues',
      icon: <Phone className="h-5 w-5" />,
      questions: [
        {
          id: 'support-1',
          question: 'What support is available for healthcare professionals who aren\'t tech-savvy?',
          answer: 'We provide healthcare-specific onboarding with dedicated support specialists who understand medical practices, video tutorials designed for busy practitioners, live chat support during business hours, and phone support for urgent issues. Our team is trained in healthcare workflows and AHPRA requirements.',
          category: 'support',
          tags: ['onboarding', 'healthcare-specific', 'non-technical'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-2',
          question: 'How quickly do you respond to support requests?',
          answer: 'Compliance-related queries receive priority response within 2 hours during business hours. General technical support aims for 4-hour response times, with urgent issues addressed immediately. We understand healthcare practices can\'t afford downtime, especially for patient-facing communications.',
          category: 'support',
          tags: ['response-times', 'urgent-support', 'business-hours'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-3',
          question: 'Do you provide training for practice staff?',
          answer: 'Yes, we offer comprehensive training packages including group training sessions for practice staff, role-specific training (admin vs practitioner), recorded webinars for ongoing reference, and certification programs for practices wanting to become content creation experts. Training is tailored to healthcare workflows.',
          category: 'support',
          tags: ['training', 'staff-education', 'certification'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-4',
          question: 'What happens if the platform goes down during critical communications?',
          answer: 'We maintain 99.9% uptime with Australian-based servers and redundant systems. In case of outages, we provide immediate notifications, alternative communication channels, and emergency support. Our status page provides real-time updates, and we maintain backup systems for critical healthcare communications.',
          category: 'support',
          tags: ['uptime', 'reliability', 'emergency-procedures'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-5',
          question: 'How do you handle data security and patient information protection?',
          answer: 'We maintain ISO 27001 security standards, use Australian-based data centres, encrypt all data in transit and at rest, and undergo regular security audits. We never store actual patient information - only anonymised analytics data. All systems comply with Privacy Act 1988 and healthcare data protection requirements.',
          category: 'support',
          tags: ['data-security', 'privacy-protection', 'compliance'],
          priority: 'high',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-6',
          question: 'Can you help migrate content from our existing social media accounts?',
          answer: 'Our migration service includes content audit for AHPRA compliance, transfer of compliant existing content, redesign of non-compliant materials, and setup of new posting workflows. We help practices transition smoothly while improving compliance and effectiveness of their digital presence.',
          category: 'support',
          tags: ['migration', 'content-transfer', 'compliance-audit'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-7',
          question: 'What if I need help with compliance questions outside your platform?',
          answer: 'While we provide platform-specific compliance guidance, we maintain relationships with healthcare legal specialists and can provide referrals for complex compliance questions. We also offer compliance consultation services for practices needing broader digital marketing compliance advice.',
          category: 'support',
          tags: ['compliance-consultation', 'legal-referrals', 'specialist-advice'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-8',
          question: 'Do you offer custom development for specific practice needs?',
          answer: 'Yes, we provide custom development services for larger practices with specific requirements. This includes custom integrations with specialised practice management systems, bespoke reporting requirements, white-label solutions for healthcare networks, and custom compliance workflows for unique practice situations.',
          category: 'support',
          tags: ['custom-development', 'enterprise-solutions', 'white-label'],
          priority: 'low',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-9',
          question: 'How do you handle billing and subscription management?',
          answer: 'Our billing system supports practice preferences including monthly/annual options, multi-location discounts, and GST-inclusive pricing. We accept all major payment methods, provide detailed tax invoices, and offer flexible payment terms for established practices. Billing support is available during business hours.',
          category: 'support',
          tags: ['billing', 'subscriptions', 'payment-methods'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        },
        {
          id: 'support-10',
          question: 'What resources are available for ongoing learning and best practices?',
          answer: 'We provide a comprehensive resource library including AHPRA compliance updates, digital marketing best practices for healthcare, industry benchmarks, monthly webinars with healthcare marketing experts, and a community forum for Australian healthcare professionals to share experiences and advice.',
          category: 'support',
          tags: ['education-resources', 'best-practices', 'community'],
          priority: 'medium',
          lastUpdated: '2024-01-24'
        }
      ]
    }
  ];

  // Filter questions based on search query
  const filterQuestions = (questions: FAQItem[]) => {
    if (!searchQuery.trim()) return questions;
    
    const query = searchQuery.toLowerCase();
    return questions.filter(
      q => 
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.tags.some(tag => tag.toLowerCase().includes(query))
    );
  };

  // Get all filtered questions across all sections
  const getAllFilteredQuestions = () => {
    if (!searchQuery.trim()) return [];
    
    const allQuestions = faqData.flatMap(section => section.questions);
    return filterQuestions(allQuestions);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveCategory('search');
    }
  };

  const currentSection = faqData.find(section => section.id === activeCategory);
  const filteredResults = searchQuery.trim() ? getAllFilteredQuestions() : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <HelpCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Healthcare FAQ</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive answers to common questions from Australian healthcare professionals about our platform, 
          compliance requirements, and practice integration.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search FAQ... (e.g., 'AHPRA compliance', 'appointment booking', 'social media')"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* FAQ Categories and Content */}
      <div className="max-w-5xl mx-auto">
        {searchQuery.trim() ? (
          // Search Results
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Results
              </CardTitle>
              <CardDescription>
                Found {filteredResults.length} result(s) for "{searchQuery}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredResults.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {filteredResults.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="font-medium">{item.question}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {faqData.find(s => s.questions.some(q => q.id === item.id))?.title}
                              </Badge>
                              {item.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">High Priority</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500">
                            Last updated: {item.lastUpdated}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try searching for terms like 'AHPRA', 'appointments', 'compliance', or 'integration'</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Category Tabs
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {faqData.map((section) => (
                <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                  {section.icon}
                  <span className="hidden sm:inline">{section.title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {faqData.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {section.icon}
                      {section.title}
                    </CardTitle>
                    <CardDescription>
                      {section.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {section.questions.length} questions
                      </Badge>
                      <Badge variant="secondary">
                        {section.questions.filter(q => q.priority === 'high').length} high priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {section.questions.map((item) => (
                        <AccordionItem key={item.id} value={item.id}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="font-medium">{item.question}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs">High Priority</Badge>
                                  )}
                                  {item.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3">
                              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500">
                                Last updated: {item.lastUpdated}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Contact Support */}
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Still Need Help?
          </CardTitle>
          <CardDescription>
            Our healthcare specialists are here to help you succeed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Live Chat
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Chat with healthcare specialists
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 font-medium">
                  <Phone className="h-4 w-4" />
                  Phone Support
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  1800 HEALTHCARE (432 584)
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 font-medium">
                  <Book className="h-4 w-4" />
                  Help Centre
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Detailed guides and tutorials
                </div>
              </div>
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">AHPRA Compliance Priority Support</div>
                <div className="text-sm text-blue-700 mt-1">
                  Compliance-related queries receive priority response within 2 hours during business hours. 
                  Our team understands healthcare regulations and can provide immediate guidance.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 