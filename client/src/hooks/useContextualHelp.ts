import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface HelpSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'ahpra' | 'tga' | 'cultural' | 'privacy' | 'advertising' | 'general';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  url: string;
  trigger: string;
  confidence: number; // 0-100
}

interface ContextualHelpState {
  suggestions: HelpSuggestion[];
  isVisible: boolean;
  currentContext: string;
  dismissedSuggestions: Set<string>;
}

interface ContentAnalysis {
  hasProhibitedTerms: string[];
  hasTherapeuticClaims: string[];
  mentionsBeforeAfter: boolean;
  hasTestimonials: boolean;
  mentionsMedicalDevices: string[];
  hasIndigenousContent: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Contextual help rules based on user activity
const HELP_RULES: Array<{
  id: string;
  trigger: RegExp | ((context: any) => boolean);
  suggestion: Omit<HelpSuggestion, 'id' | 'trigger' | 'confidence'>;
  confidence: number;
}> = [
  // AHPRA Triggers
  {
    id: 'ahpra-advertising-general',
    trigger: /marketing|advertis|promot|social.?media|facebook|instagram/i,
    suggestion: {
      title: 'AHPRA Advertising Guidelines',
      description: 'Review professional advertising standards before creating marketing content',
      category: 'ahpra',
      urgency: 'high',
      url: 'https://help.jbsaas.com.au/ahpra-advertising-guidelines'
    },
    confidence: 85
  },
  {
    id: 'ahpra-testimonials',
    trigger: /testimonial|review|patient.?feedback|client.?review|success.?stor/i,
    suggestion: {
      title: 'Patient Testimonial Guidelines',
      description: 'Ensure testimonials comply with AHPRA requirements',
      category: 'ahpra',
      urgency: 'critical',
      url: 'https://help.jbsaas.com.au/ahpra-testimonial-guidelines'
    },
    confidence: 95
  },
  {
    id: 'ahpra-before-after',
    trigger: /before.?after|transformation|result|photo|image/i,
    suggestion: {
      title: 'Before & After Photo Compliance',
      description: 'Critical guidelines for using before/after images',
      category: 'ahpra',
      urgency: 'critical',
      url: 'https://help.jbsaas.com.au/before-after-compliance'
    },
    confidence: 90
  },
  {
    id: 'ahpra-prohibited-terms',
    trigger: (context: ContentAnalysis) => context.hasProhibitedTerms.length > 0,
    suggestion: {
      title: 'Prohibited Terms Detected',
      description: 'Your content contains terms that may violate AHPRA guidelines',
      category: 'ahpra',
      urgency: 'critical',
      url: 'https://help.jbsaas.com.au/prohibited-terms-checker'
    },
    confidence: 100
  },

  // TGA Triggers
  {
    id: 'tga-medical-devices',
    trigger: /medical.?device|equipment|laser|machine|tool|instrument/i,
    suggestion: {
      title: 'TGA Medical Device Advertising',
      description: 'Understand TGA requirements for medical device promotion',
      category: 'tga',
      urgency: 'high',
      url: 'https://help.jbsaas.com.au/tga-device-advertising'
    },
    confidence: 80
  },
  {
    id: 'tga-therapeutic-claims',
    trigger: (context: ContentAnalysis) => context.hasTherapeuticClaims.length > 0,
    suggestion: {
      title: 'Therapeutic Claims Validation',
      description: 'Validate therapeutic claims against TGA requirements',
      category: 'tga',
      urgency: 'critical',
      url: '/tools/tga-claims-validator'
    },
    confidence: 95
  },
  {
    id: 'tga-medicines',
    trigger: /medicine|medication|drug|prescription|supplement|vitamin/i,
    suggestion: {
      title: 'TGA Medicines Advertising Code',
      description: 'Review advertising requirements for medicines and supplements',
      category: 'tga',
      urgency: 'high',
      url: 'https://help.jbsaas.com.au/tga-medicines-code'
    },
    confidence: 85
  },

  // Cultural Safety Triggers
  {
    id: 'cultural-indigenous-health',
    trigger: /indigenous|aboriginal|torres.?strait|first.?nations|native.?title/i,
    suggestion: {
      title: 'Indigenous Health Cultural Safety',
      description: 'Ensure culturally safe and respectful Indigenous health content',
      category: 'cultural',
      urgency: 'high',
      url: 'https://help.jbsaas.com.au/indigenous-cultural-safety'
    },
    confidence: 90
  },
  {
    id: 'cultural-consultation-required',
    trigger: (context: ContentAnalysis) => context.hasIndigenousContent,
    suggestion: {
      title: 'Cultural Consultation Required',
      description: 'This content may require Indigenous health cultural review',
      category: 'cultural',
      urgency: 'high',
      url: '/dashboard/cultural-consultation'
    },
    confidence: 85
  },

  // Privacy Triggers
  {
    id: 'privacy-patient-data',
    trigger: /patient.?data|personal.?information|privacy|consent|confidential/i,
    suggestion: {
      title: 'Privacy Act Compliance',
      description: 'Understand privacy requirements for patient data',
      category: 'privacy',
      urgency: 'medium',
      url: 'https://help.jbsaas.com.au/privacy-act-healthcare'
    },
    confidence: 75
  },
  {
    id: 'privacy-consent-forms',
    trigger: /consent|permission|authoriz|photography|recording/i,
    suggestion: {
      title: 'Patient Consent Requirements',
      description: 'Ensure proper consent for marketing and photography',
      category: 'privacy',
      urgency: 'high',
      url: 'https://help.jbsaas.com.au/consent-requirements'
    },
    confidence: 80
  },

  // General Marketing Triggers
  {
    id: 'advertising-best-practices',
    trigger: /campaign|content.?creat|post|publish|schedul/i,
    suggestion: {
      title: 'Ethical Marketing Best Practices',
      description: 'Follow best practices for healthcare marketing',
      category: 'advertising',
      urgency: 'medium',
      url: 'https://help.jbsaas.com.au/ethical-marketing'
    },
    confidence: 60
  }
];

// Prohibited terms that trigger immediate warnings
const PROHIBITED_TERMS = [
  'miracle', 'cure', 'guaranteed', 'instant', 'immediate',
  'magic', 'revolutionary', 'breakthrough', 'life-changing',
  'permanent', 'forever', 'completely safe', 'no side effects',
  'FDA approved', 'clinically proven', 'scientifically proven',
  'doctor recommended', 'medically necessary'
];

// Therapeutic claims patterns
const THERAPEUTIC_CLAIMS_PATTERNS = [
  /treat(s|ment)?/i, /cure(s|d)?/i, /heal(s|ing)?/i, /prevent(s|ion)?/i,
  /diagnose(s|d)?/i, /remedy/i, /therapeutic/i, /medicinal/i,
  /clinical(ly)?/i, /medical(ly)?/i
];

export const useContextualHelp = () => {
  const [state, setState] = useState<ContextualHelpState>({
    suggestions: [],
    isVisible: false,
    currentContext: '',
    dismissedSuggestions: new Set()
  });

  const router = useRouter();
  const analysisCache = useRef<Map<string, ContentAnalysis>>(new Map());
  const lastAnalysisTime = useRef<number>(0);

  // Analyze content for compliance risks
  const analyzeContent = useCallback((content: string): ContentAnalysis => {
    const cacheKey = content.substring(0, 100); // Use first 100 chars as cache key
    const cached = analysisCache.current.get(cacheKey);
    
    if (cached && Date.now() - lastAnalysisTime.current < 5000) {
      return cached;
    }

    const lowerContent = content.toLowerCase();
    
    const analysis: ContentAnalysis = {
      hasProhibitedTerms: PROHIBITED_TERMS.filter(term => 
        lowerContent.includes(term.toLowerCase())
      ),
      hasTherapeuticClaims: THERAPEUTIC_CLAIMS_PATTERNS.filter(pattern => 
        pattern.test(content)
      ).map(pattern => pattern.source),
      mentionsBeforeAfter: /before.?after|transformation|result/i.test(content),
      hasTestimonials: /testimonial|review|patient.?said|client.?review/i.test(content),
      mentionsMedicalDevices: [],
      hasIndigenousContent: /indigenous|aboriginal|torres.?strait|first.?nations/i.test(content),
      riskLevel: 'low'
    };

    // Detect medical devices
    const devicePatterns = [
      /laser/i, /ultrasound/i, /radiofrequency/i, /ipl/i, /led/i,
      /microneedling/i, /dermaroller/i, /cryotherapy/i, /hifu/i
    ];
    
    analysis.mentionsMedicalDevices = devicePatterns
      .filter(pattern => pattern.test(content))
      .map(pattern => pattern.source);

    // Calculate risk level
    let riskScore = 0;
    riskScore += analysis.hasProhibitedTerms.length * 25;
    riskScore += analysis.hasTherapeuticClaims.length * 20;
    riskScore += analysis.mentionsBeforeAfter ? 15 : 0;
    riskScore += analysis.hasTestimonials ? 10 : 0;
    riskScore += analysis.mentionsMedicalDevices.length * 15;
    riskScore += analysis.hasIndigenousContent ? 20 : 0;

    if (riskScore >= 75) analysis.riskLevel = 'critical';
    else if (riskScore >= 50) analysis.riskLevel = 'high';
    else if (riskScore >= 25) analysis.riskLevel = 'medium';

    analysisCache.current.set(cacheKey, analysis);
    lastAnalysisTime.current = Date.now();

    return analysis;
  }, []);

  // Generate contextual suggestions
  const generateSuggestions = useCallback((
    content: string = '',
    context: string = '',
    route: string = ''
  ): HelpSuggestion[] => {
    const analysis = content ? analyzeContent(content) : null;
    const suggestions: HelpSuggestion[] = [];

    // Evaluate each rule
    for (const rule of HELP_RULES) {
      let matches = false;
      
      if (rule.trigger instanceof RegExp) {
        matches = rule.trigger.test(content) || rule.trigger.test(context) || rule.trigger.test(route);
      } else if (typeof rule.trigger === 'function' && analysis) {
        matches = rule.trigger(analysis);
      }

      if (matches && !state.dismissedSuggestions.has(rule.id)) {
        suggestions.push({
          id: rule.id,
          ...rule.suggestion,
          trigger: content || context || route,
          confidence: rule.confidence
        });
      }
    }

    // Sort by confidence and urgency
    return suggestions.sort((a, b) => {
      const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.confidence - a.confidence;
    }).slice(0, 3); // Limit to top 3 suggestions
  }, [analyzeContent, state.dismissedSuggestions]);

  // Check content for compliance issues
  const checkContent = useCallback((content: string, context?: string) => {
    const suggestions = generateSuggestions(content, context, router.pathname);
    
    setState(prev => ({
      ...prev,
      suggestions,
      isVisible: suggestions.length > 0,
      currentContext: context || 'content-check'
    }));

    return suggestions;
  }, [generateSuggestions, router.pathname]);

  // Check current route for contextual help
  const checkRoute = useCallback((route?: string) => {
    const currentRoute = route || router.pathname;
    const suggestions = generateSuggestions('', '', currentRoute);
    
    setState(prev => ({
      ...prev,
      suggestions,
      isVisible: suggestions.length > 0,
      currentContext: `route-${currentRoute}`
    }));

    return suggestions;
  }, [generateSuggestions, router.pathname]);

  // Dismiss a suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setState(prev => {
      const newDismissed = new Set(prev.dismissedSuggestions);
      newDismissed.add(suggestionId);
      
      const filteredSuggestions = prev.suggestions.filter(s => s.id !== suggestionId);
      
      return {
        ...prev,
        suggestions: filteredSuggestions,
        isVisible: filteredSuggestions.length > 0,
        dismissedSuggestions: newDismissed
      };
    });
  }, []);

  // Hide all suggestions
  const hideSuggestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  // Show suggestions
  const showSuggestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: prev.suggestions.length > 0
    }));
  }, []);

  // Reset dismissed suggestions
  const resetDismissed = useCallback(() => {
    setState(prev => ({
      ...prev,
      dismissedSuggestions: new Set()
    }));
  }, []);

  // Get suggestions for specific categories
  const getSuggestionsForCategory = useCallback((category: HelpSuggestion['category']) => {
    return state.suggestions.filter(s => s.category === category);
  }, [state.suggestions]);

  // Auto-check route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Only auto-check certain routes
      const autoCheckRoutes = ['/content', '/posts', '/marketing', '/compliance', '/patients'];
      
      if (autoCheckRoutes.some(route => url.includes(route))) {
        setTimeout(() => checkRoute(url), 1000); // Delay to allow page to load
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, checkRoute]);

  // Clean up cache periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      analysisCache.current.clear();
    }, 5 * 60 * 1000); // Clean cache every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  return {
    // State
    suggestions: state.suggestions,
    isVisible: state.isVisible,
    currentContext: state.currentContext,
    
    // Actions
    checkContent,
    checkRoute,
    dismissSuggestion,
    hideSuggestions,
    showSuggestions,
    resetDismissed,
    
    // Utilities
    analyzeContent,
    generateSuggestions,
    getSuggestionsForCategory,
    
    // Stats
    totalSuggestions: state.suggestions.length,
    highPrioritySuggestions: state.suggestions.filter(s => s.urgency === 'critical' || s.urgency === 'high').length,
    dismissedCount: state.dismissedSuggestions.size
  };
}; 