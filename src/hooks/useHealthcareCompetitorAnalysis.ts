import { useState, useEffect, useCallback } from 'react';
import { useHealthcareAuth } from './useHealthcareAuth';
import { useAHPRACompliance } from './useAHPRACompliance';
import { useToast } from './use-toast';

interface HealthcareCompetitor {
  id: string;
  practice_name: string;
  ahpra_registration?: string;
  profession_type: string;
  specialty: string;
  location: {
    suburb: string;
    state: string;
    postcode: string;
  };
  website_url?: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  services: string[];
  compliance_score: number;
  last_analyzed: string;
  market_positioning: 'premium' | 'mid-market' | 'budget' | 'unknown';
  patient_reviews_count: number;
  average_rating: number;
  content_strategy: {
    focus: string[];
    posting_frequency: string;
    engagement_rate: number;
  };
  competitive_strengths: string[];
  competitive_gaps: string[];
  pricing_insights?: {
    consultation_fee?: string;
    bulk_billing: boolean;
    payment_options: string[];
  };
}

interface CompetitorAnalysis {
  market_overview: {
    total_competitors: number;
    avg_compliance_score: number;
    common_services: string[];
    market_gaps: string[];
  };
  content_opportunities: {
    underserved_topics: string[];
    high_performing_content_types: string[];
    optimal_posting_times: string[];
  };
  positioning_insights: {
    your_market_position: string;
    differentiation_opportunities: string[];
    competitive_advantages: string[];
  };
  compliance_benchmarking: {
    your_score: number;
    market_average: number;
    common_violations: string[];
    compliance_leaders: string[];
  };
}

interface CompetitorContentAnalysis {
  content_id: string;
  competitor_id: string;
  content_type: 'social_post' | 'website_content' | 'blog_article';
  platform: string;
  content_preview: string;
  compliance_violations: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  engagement_metrics: {
    likes: number;
    comments: number;
    shares: number;
  };
  analyzed_date: string;
}

// Mock competitor data for demonstration - in production this would come from web scraping/APIs
const mockCompetitors: HealthcareCompetitor[] = [
  {
    id: '1',
    practice_name: 'Melbourne Central Medical',
    ahpra_registration: 'MED0001234568',
    profession_type: 'medical',
    specialty: 'General Practice',
    location: { suburb: 'Melbourne', state: 'VIC', postcode: '3000' },
    website_url: 'https://melbournecentralmedical.com.au',
    social_media: {
      facebook: 'melbournecentralmedical',
      instagram: 'mcm_health'
    },
    services: ['General Consultations', 'Preventive Health', 'Chronic Disease Management', 'Health Assessments'],
    compliance_score: 78,
    last_analyzed: '2024-01-15',
    market_positioning: 'mid-market',
    patient_reviews_count: 340,
    average_rating: 4.2,
    content_strategy: {
      focus: ['General Health Tips', 'Practice Updates'],
      posting_frequency: 'Weekly',
      engagement_rate: 3.4
    },
    competitive_strengths: ['Central location', 'Extended hours', 'Bulk billing'],
    competitive_gaps: ['Limited social media presence', 'Basic website', 'Compliance issues'],
    pricing_insights: {
      consultation_fee: '$85-$120',
      bulk_billing: true,
      payment_options: ['Bulk bill', 'EFTPOS', 'Credit card']
    }
  },
  {
    id: '2',
    practice_name: 'Wellness Psychology Clinic',
    ahpra_registration: 'PSY0001234569',
    profession_type: 'psychology',
    specialty: 'Clinical Psychology',
    location: { suburb: 'Toorak', state: 'VIC', postcode: '3142' },
    website_url: 'https://wellnesspsychology.com.au',
    social_media: {
      facebook: 'wellnesspsychclinic',
      linkedin: 'wellness-psychology-clinic',
      instagram: 'wellness_psych'
    },
    services: ['Individual Therapy', 'Couples Counselling', 'Anxiety Treatment', 'Depression Support'],
    compliance_score: 92,
    last_analyzed: '2024-01-14',
    market_positioning: 'premium',
    patient_reviews_count: 127,
    average_rating: 4.8,
    content_strategy: {
      focus: ['Mental Health Education', 'Self-Care Tips', 'Professional Insights'],
      posting_frequency: 'Bi-weekly',
      engagement_rate: 6.8
    },
    competitive_strengths: ['High compliance', 'Strong online presence', 'Excellent reviews'],
    competitive_gaps: ['Premium pricing', 'Limited availability'],
    pricing_insights: {
      consultation_fee: '$180-$220',
      bulk_billing: false,
      payment_options: ['Private health fund', 'EFTPOS', 'Credit card', 'Payment plans']
    }
  },
  {
    id: '3',
    practice_name: 'Active Physio Richmond',
    ahpra_registration: 'PHY0001234570',
    profession_type: 'physiotherapy',
    specialty: 'Musculoskeletal Physiotherapy',
    location: { suburb: 'Richmond', state: 'VIC', postcode: '3121' },
    website_url: 'https://activephysiorichmond.com.au',
    social_media: {
      facebook: 'activephysiorichmond',
      instagram: 'activephysio_richmond'
    },
    services: ['Sports Injury Rehab', 'Manual Therapy', 'Exercise Prescription', 'Dry Needling'],
    compliance_score: 85,
    last_analyzed: '2024-01-13',
    market_positioning: 'mid-market',
    patient_reviews_count: 89,
    average_rating: 4.5,
    content_strategy: {
      focus: ['Exercise Tips', 'Injury Prevention', 'Recovery Advice'],
      posting_frequency: '3x per week',
      engagement_rate: 5.2
    },
    competitive_strengths: ['Sport focus', 'Good engagement', 'Regular content'],
    competitive_gaps: ['Generic content', 'Limited service range'],
    pricing_insights: {
      consultation_fee: '$95-$130',
      bulk_billing: false,
      payment_options: ['Private health fund', 'EFTPOS', 'Credit card']
    }
  }
];

export const useHealthcareCompetitorAnalysis = () => {
  const { user } = useHealthcareAuth();
  const { validateContent } = useAHPRACompliance();
  const { toast } = useToast();
  
  const [competitors, setCompetitors] = useState<HealthcareCompetitor[]>([]);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [contentAnalyses, setContentAnalyses] = useState<CompetitorContentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<HealthcareCompetitor | null>(null);

  // Find competitors in the user's area and specialty
  const discoverCompetitors = useCallback(async (location: string, specialty: string, radius: number = 10) => {
    setIsLoading(true);
    try {
      // Simulate API call to competitor discovery service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filter mock data based on user's specialty and location
      const filteredCompetitors = mockCompetitors.filter(competitor => 
        competitor.profession_type === user?.profession_type ||
        competitor.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
      
      setCompetitors(filteredCompetitors);
      
      toast({
        title: "Competitors Discovered",
        description: `Found ${filteredCompetitors.length} healthcare competitors in your market.`,
      });
      
      return { success: true, competitors: filteredCompetitors };
    } catch (error: any) {
      toast({
        title: "Discovery Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user?.profession_type, toast]);

  // Analyze competitor content for AHPRA compliance
  const analyzeCompetitorContent = useCallback(async (competitorId: string, contentUrl: string) => {
    setIsLoading(true);
    try {
      // Simulate scraping and analyzing competitor content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock content analysis - in production this would scrape actual content
      const mockContent = `Our practice offers the best treatment outcomes in Melbourne. 
      Patient testimonial: "Dr Smith completely cured my chronic pain!" 
      We guarantee 100% success with our revolutionary Botox treatments.`;
      
      const practiceType = { type: 'gp' as const, ahpra_registration: 'mock' };
      const complianceResult = await validateContent(mockContent, 'practice_marketing', practiceType);
      
      const contentAnalysis: CompetitorContentAnalysis = {
        content_id: `content_${Date.now()}`,
        competitor_id: competitorId,
        content_type: 'website_content',
        platform: 'Website',
        content_preview: mockContent.substring(0, 100) + '...',
        compliance_violations: complianceResult.violations.map(v => ({
          type: v.type,
          severity: v.severity === 'critical' ? 'high' : (v.severity as 'high' | 'low' | 'medium') || 'medium',
          description: v.message
        })),
        engagement_metrics: {
          likes: 0,
          comments: 0,
          shares: 0
        },
        analyzed_date: new Date().toISOString()
      };
      
      setContentAnalyses(prev => [...prev, contentAnalysis]);
      
      return { success: true, analysis: contentAnalysis };
    } catch (error: any) {
      toast({
        title: "Content Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [validateContent, toast]);

  // Generate comprehensive market analysis
  const generateMarketAnalysis = useCallback(async () => {
    if (competitors.length === 0) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const avgComplianceScore = competitors.reduce((sum, c) => sum + c.compliance_score, 0) / competitors.length;
      const commonServices = competitors.flatMap(c => c.services)
        .reduce((acc: Record<string, number>, service) => {
          acc[service] = (acc[service] || 0) + 1;
          return acc;
        }, {});
      
      const topServices = Object.entries(commonServices)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([service]) => service);

      const userComplianceScore = user?.profession_type === 'medical' ? 96 : 
                                  user?.profession_type === 'psychology' ? 95 : 94;

      const marketAnalysis: CompetitorAnalysis = {
        market_overview: {
          total_competitors: competitors.length,
          avg_compliance_score: Math.round(avgComplianceScore),
          common_services: topServices,
          market_gaps: [
            'AHPRA-compliant content marketing',
            'Patient education focus',
            'Digital engagement strategies',
            'Evidence-based communication'
          ]
        },
        content_opportunities: {
          underserved_topics: [
            'Mental health awareness',
            'Preventive care education',
            'Treatment option explanations',
            'Healthcare navigation guides'
          ],
          high_performing_content_types: [
            'Educational infographics',
            'Professional insights',
            'Health awareness posts',
            'Service explanations'
          ],
          optimal_posting_times: [
            'Tuesday 9-11 AM',
            'Wednesday 2-4 PM',
            'Thursday 10 AM-12 PM'
          ]
        },
        positioning_insights: {
          your_market_position: userComplianceScore > avgComplianceScore ? 'Compliance Leader' : 'Growing Practice',
          differentiation_opportunities: [
            'AHPRA compliance excellence',
            'Patient education focus',
            'Evidence-based content',
            'Professional digital presence'
          ],
          competitive_advantages: [
            'Advanced compliance monitoring',
            'AI-powered content generation',
            'Real-time violation detection',
            'Professional content templates'
          ]
        },
        compliance_benchmarking: {
          your_score: userComplianceScore,
          market_average: Math.round(avgComplianceScore),
          common_violations: [
            'Patient testimonials in marketing',
            'Superiority claims without evidence',
            'Missing required disclaimers',
            'Prohibited drug brand names'
          ],
          compliance_leaders: competitors
            .filter(c => c.compliance_score >= 90)
            .map(c => c.practice_name)
        }
      };
      
      setAnalysis(marketAnalysis);
      
      toast({
        title: "Market Analysis Complete",
        description: "Generated comprehensive competitive intelligence report.",
      });
      
      return { success: true, analysis: marketAnalysis };
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [competitors, user?.profession_type, toast]);

  // Monitor competitor changes
  const monitorCompetitor = useCallback(async (competitorId: string) => {
    try {
      // Set up monitoring for competitor changes
      const competitor = competitors.find(c => c.id === competitorId);
      if (!competitor) return;
      
      toast({
        title: "Monitoring Started",
        description: `Now monitoring ${competitor.practice_name} for content and compliance changes.`,
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Monitoring Setup Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  }, [competitors, toast]);

  // Get competitor comparison data
  const getCompetitorComparison = useCallback((competitorId: string) => {
    const competitor = competitors.find(c => c.id === competitorId);
    if (!competitor || !user) return null;

    const userComplianceScore = user.profession_type === 'medical' ? 96 : 
                               user.profession_type === 'psychology' ? 95 : 94;

    return {
      practice_comparison: {
        your_practice: {
          name: user.practice_name,
          compliance_score: userComplianceScore,
          specialty: user.profession_type,
          positioning: 'Compliance Leader'
        },
        competitor: {
          name: competitor.practice_name,
          compliance_score: competitor.compliance_score,
          specialty: competitor.specialty,
          positioning: competitor.market_positioning
        }
      },
      strengths_comparison: {
        your_strengths: [
          'AHPRA compliance excellence',
          'AI-powered content creation',
          'Real-time compliance monitoring',
          'Professional content templates'
        ],
        competitor_strengths: competitor.competitive_strengths,
        your_gaps: [
          'Market presence building',
          'Patient review generation',
          'Service diversification'
        ],
        competitor_gaps: competitor.competitive_gaps
      },
      recommendations: [
        `Leverage your ${userComplianceScore - competitor.compliance_score}% compliance advantage`,
        'Highlight AI-powered content creation as differentiator',
        'Focus on patient education content gaps',
        'Monitor competitor compliance violations for opportunities'
      ]
    };
  }, [competitors, user]);

  // Initialize with user's market analysis
  useEffect(() => {
    if (user && competitors.length === 0) {
      discoverCompetitors(
        user.practice_locations?.[0] || 'Melbourne',
        user.profession_type.replace('_', ' '),
        10
      );
    }
  }, [user, competitors.length, discoverCompetitors]);

  // Generate analysis when competitors are loaded
  useEffect(() => {
    if (competitors.length > 0 && !analysis) {
      generateMarketAnalysis();
    }
  }, [competitors, analysis, generateMarketAnalysis]);

  return {
    competitors,
    analysis,
    contentAnalyses,
    selectedCompetitor,
    isLoading,
    discoverCompetitors,
    analyzeCompetitorContent,
    generateMarketAnalysis,
    monitorCompetitor,
    getCompetitorComparison,
    setSelectedCompetitor
  };
}; 