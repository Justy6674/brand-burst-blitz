import { useCallback, useMemo } from 'react';
import { useHealthcareAuth } from './useHealthcareAuth';
import { supabase } from '../integrations/supabase/client';

interface SpecialtyContext {
  profession: string;
  specialty: string;
  targetAudience: string[];
  contentFocus: string[];
  complianceRequirements: string[];
  prohibitedTerms: string[];
  preferredTerminology: Record<string, string>;
  templatePrompts: Record<string, string>;
}

interface SpecialtyAnalysisResult {
  contentType: 'patient_education' | 'professional_development' | 'practice_marketing' | 'referral_communication';
  targetAudience: string;
  complianceScore: number;
  specialtyRelevance: number;
  suggestedImprovements: string[];
  ahpraFlags: string[];
  tgaFlags: string[];
  recommendedActions: string[];
}

export function useHealthcareSpecialtyAI() {
  const { profile } = useHealthcareAuth();

  // Define specialty contexts
  const specialtyContexts: Record<string, SpecialtyContext> = useMemo(() => ({
    general_practice: {
      profession: 'General Practitioner',
      specialty: 'Family Medicine',
      targetAudience: ['adults', 'children', 'elderly', 'families'],
      contentFocus: ['preventive_care', 'chronic_disease_management', 'health_education', 'community_health'],
      complianceRequirements: ['AHPRA_advertising', 'PBS_prescribing', 'Medicare_billing', 'patient_privacy'],
      prohibitedTerms: ['cure', 'guaranteed_results', 'miracle_treatment', 'best_doctor'],
      preferredTerminology: {
        'treatment': 'management approach',
        'cure': 'effective management',
        'best': 'evidence-based',
        'guaranteed': 'clinically proven approaches'
      },
      templatePrompts: {
        patient_education: 'Create patient-friendly educational content about [TOPIC] that explains the condition, management options, and when to seek medical advice. Use simple language and include appropriate medical disclaimers.',
        social_media: 'Generate a Facebook post for a GP practice about [TOPIC] that educates patients while maintaining professional boundaries and AHPRA compliance.',
        blog_post: 'Write a comprehensive blog post about [TOPIC] from a family medicine perspective, including prevention, management, and when patients should consult their GP.'
      }
    },
    cardiology: {
      profession: 'Cardiologist',
      specialty: 'Cardiovascular Medicine',
      targetAudience: ['adults', 'cardiac_patients', 'high_risk_patients'],
      contentFocus: ['heart_health', 'prevention', 'cardiac_procedures', 'lifestyle_modification'],
      complianceRequirements: ['AHPRA_specialist', 'cardiac_device_regulations', 'pharmaceutical_guidelines'],
      prohibitedTerms: ['heart_cure', 'perfect_heart', 'never_have_heart_attack', 'miracle_heart_treatment'],
      preferredTerminology: {
        'heart_attack_prevention': 'cardiovascular risk reduction',
        'heart_cure': 'cardiac management',
        'perfect_heart': 'optimal cardiovascular health'
      },
      templatePrompts: {
        patient_education: 'Create educational content about [TOPIC] for cardiac patients, explaining cardiovascular risks, management strategies, and the importance of specialist care.',
        professional_communication: 'Draft a referral communication about [TOPIC] for GP colleagues, including assessment criteria and management recommendations.',
        procedure_information: 'Develop patient information about [TOPIC] cardiac procedure, including preparation, process, and recovery expectations.'
      }
    },
    psychology: {
      profession: 'Psychologist',
      specialty: 'Mental Health',
      targetAudience: ['adults', 'children', 'adolescents', 'families'],
      contentFocus: ['mental_health_awareness', 'therapy_approaches', 'psychological_wellbeing', 'stigma_reduction'],
      complianceRequirements: ['AHPRA_psychology', 'mental_health_guidelines', 'patient_confidentiality', 'duty_of_care'],
      prohibitedTerms: ['cure_depression', 'fix_anxiety', 'perfect_mental_health', 'guaranteed_therapy'],
      preferredTerminology: {
        'cure': 'effective management strategies',
        'fix': 'therapeutic approaches',
        'perfect': 'improved wellbeing'
      },
      templatePrompts: {
        mental_health_education: 'Create stigma-free educational content about [TOPIC] that promotes understanding and encourages professional help-seeking.',
        therapy_information: 'Develop information about [TOPIC] therapeutic approach, explaining the process and potential benefits without making treatment guarantees.',
        wellbeing_tips: 'Generate practical wellbeing strategies for [TOPIC] that complement professional psychological care.'
      }
    },
    physiotherapy: {
      profession: 'Physiotherapist',
      specialty: 'Musculoskeletal Health',
      targetAudience: ['athletes', 'injury_recovery', 'chronic_pain', 'elderly', 'post_surgery'],
      contentFocus: ['movement_health', 'injury_prevention', 'rehabilitation', 'exercise_therapy'],
      complianceRequirements: ['AHPRA_allied_health', 'exercise_prescription', 'manual_therapy_standards'],
      prohibitedTerms: ['instant_pain_relief', 'permanent_cure', 'miracle_recovery', 'guaranteed_mobility'],
      preferredTerminology: {
        'instant_relief': 'progressive improvement',
        'cure': 'optimal recovery outcomes',
        'guaranteed': 'evidence-based approaches'
      },
      templatePrompts: {
        exercise_education: 'Create safe exercise guidance for [TOPIC] with proper form instructions and safety considerations.',
        injury_prevention: 'Develop injury prevention strategies for [TOPIC] that emphasize proper movement patterns and gradual progression.',
        recovery_information: 'Explain the [TOPIC] recovery process, including realistic timelines and the importance of professional guidance.'
      }
    },
    dentistry: {
      profession: 'Dentist',
      specialty: 'Oral Health',
      targetAudience: ['all_ages', 'families', 'high_risk_patients'],
      contentFocus: ['oral_hygiene', 'preventive_dentistry', 'dental_procedures', 'oral_health_education'],
      complianceRequirements: ['AHPRA_dental', 'dental_materials_safety', 'radiation_safety'],
      prohibitedTerms: ['perfect_smile_guaranteed', 'painless_dentistry', 'instant_whitening', 'permanent_results'],
      preferredTerminology: {
        'perfect_smile': 'improved oral health and aesthetics',
        'painless': 'comfortable dental care',
        'instant': 'effective treatment approaches'
      },
      templatePrompts: {
        oral_health_education: 'Create oral hygiene education about [TOPIC] that promotes preventive care and regular dental visits.',
        procedure_information: 'Explain [TOPIC] dental procedure, including benefits, process, and aftercare requirements.',
        preventive_care: 'Develop preventive dental care strategies for [TOPIC] that emphasize the importance of professional dental care.'
      }
    }
  }), []);

  // Get current specialty context
  const getCurrentSpecialtyContext = useCallback((): SpecialtyContext => {
    const practiceType = profile?.practice_type || 'general_practice';
    return specialtyContexts[practiceType] || specialtyContexts.general_practice;
  }, [profile?.practice_type, specialtyContexts]);

  // Analyze content for specialty relevance and compliance
  const analyzeContentForSpecialty = useCallback(async (
    content: string,
    contentType: 'voice' | 'sketch' | 'text' = 'text'
  ): Promise<SpecialtyAnalysisResult> => {
    const specialtyContext = getCurrentSpecialtyContext();
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-specialty-content', {
        body: {
          content,
          contentType,
          specialtyContext,
          practiceType: profile?.practice_type || 'general_practice'
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error analyzing specialty content:', error);
      
      // Fallback local analysis
      return performLocalSpecialtyAnalysis(content, specialtyContext);
    }
  }, [getCurrentSpecialtyContext, profile?.practice_type]);

  // Local fallback analysis
  const performLocalSpecialtyAnalysis = useCallback((
    content: string,
    specialtyContext: SpecialtyContext
  ): SpecialtyAnalysisResult => {
    const lowercaseContent = content.toLowerCase();
    let complianceScore = 100;
    const ahpraFlags: string[] = [];
    const tgaFlags: string[] = [];
    const suggestedImprovements: string[] = [];

    // Check for prohibited terms
    specialtyContext.prohibitedTerms.forEach(term => {
      if (lowercaseContent.includes(term.toLowerCase())) {
        complianceScore -= 15;
        ahpraFlags.push(`Prohibited term detected: "${term}"`);
        
        if (specialtyContext.preferredTerminology[term]) {
          suggestedImprovements.push(`Replace "${term}" with "${specialtyContext.preferredTerminology[term]}"`);
        }
      }
    });

    // Check specialty relevance
    const relevantTerms = specialtyContext.contentFocus.filter(focus => 
      lowercaseContent.includes(focus.replace('_', ' '))
    );
    const specialtyRelevance = (relevantTerms.length / specialtyContext.contentFocus.length) * 100;

    // Determine content type
    let contentTypeDetected: SpecialtyAnalysisResult['contentType'] = 'patient_education';
    if (lowercaseContent.includes('refer') || lowercaseContent.includes('colleague')) {
      contentTypeDetected = 'referral_communication';
    } else if (lowercaseContent.includes('market') || lowercaseContent.includes('practice')) {
      contentTypeDetected = 'practice_marketing';
    } else if (lowercaseContent.includes('professional') || lowercaseContent.includes('development')) {
      contentTypeDetected = 'professional_development';
    }

    // Generate recommendations
    const recommendedActions: string[] = [];
    if (specialtyRelevance < 50) {
      recommendedActions.push('Consider adding more specialty-specific content');
    }
    if (complianceScore < 80) {
      recommendedActions.push('Review content for AHPRA compliance');
    }
    if (!lowercaseContent.includes('consult') && contentTypeDetected === 'patient_education') {
      recommendedActions.push('Add recommendation to consult healthcare professional');
    }

    return {
      contentType: contentTypeDetected,
      targetAudience: determineTargetAudience(content, specialtyContext),
      complianceScore: Math.max(50, complianceScore),
      specialtyRelevance,
      suggestedImprovements,
      ahpraFlags,
      tgaFlags,
      recommendedActions
    };
  }, []);

  // Determine target audience based on content
  const determineTargetAudience = useCallback((
    content: string,
    specialtyContext: SpecialtyContext
  ): string => {
    const lowercaseContent = content.toLowerCase();
    
    if (lowercaseContent.includes('child') || lowercaseContent.includes('kid') || lowercaseContent.includes('paediatric')) {
      return 'children';
    }
    if (lowercaseContent.includes('elderly') || lowercaseContent.includes('senior') || lowercaseContent.includes('aged')) {
      return 'elderly';
    }
    if (lowercaseContent.includes('teen') || lowercaseContent.includes('adolescent') || lowercaseContent.includes('youth')) {
      return 'adolescents';
    }
    if (lowercaseContent.includes('family') || lowercaseContent.includes('parent')) {
      return 'families';
    }
    
    return 'adults'; // Default
  }, []);

  // Generate specialty-specific content
  const generateSpecialtyContent = useCallback(async (
    idea: string,
    contentType: keyof SpecialtyContext['templatePrompts'],
    platform: 'blog' | 'facebook' | 'instagram' | 'linkedin' = 'blog'
  ): Promise<string> => {
    const specialtyContext = getCurrentSpecialtyContext();
    const template = specialtyContext.templatePrompts[contentType];
    
    if (!template) {
      throw new Error(`Template not found for content type: ${contentType}`);
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-specialty-content', {
        body: {
          idea,
          template,
          platform,
          specialtyContext,
          practiceType: profile?.practice_type || 'general_practice'
        }
      });

      if (error) throw error;

      return data.content;
    } catch (error) {
      console.error('Error generating specialty content:', error);
      
      // Fallback template generation
      const enhancedPrompt = template.replace('[TOPIC]', idea);
      return `${enhancedPrompt}\n\nNote: This content is generated for ${specialtyContext.profession} professionals and should be reviewed for accuracy and compliance before use.`;
    }
  }, [getCurrentSpecialtyContext, profile?.practice_type]);

  // Get specialty-specific suggestions
  const getSpecialtySuggestions = useCallback((idea: string): string[] => {
    const specialtyContext = getCurrentSpecialtyContext();
    const suggestions: string[] = [];
    
    // Content focus suggestions
    specialtyContext.contentFocus.forEach(focus => {
      if (!idea.toLowerCase().includes(focus.replace('_', ' '))) {
        suggestions.push(`Consider adding ${focus.replace('_', ' ')} perspective`);
      }
    });

    // Target audience suggestions
    suggestions.push(`Target content for ${specialtyContext.targetAudience.join(', ')}`);
    
    // Compliance reminders
    suggestions.push('Ensure AHPRA advertising compliance');
    suggestions.push('Include appropriate medical disclaimers');
    suggestions.push('Recommend professional consultation');

    return suggestions.slice(0, 5); // Limit to top 5
  }, [getCurrentSpecialtyContext]);

  // Validate content for specialty compliance
  const validateSpecialtyCompliance = useCallback(async (content: string): Promise<{
    isCompliant: boolean;
    issues: string[];
    suggestions: string[];
    score: number;
  }> => {
    const analysis = await analyzeContentForSpecialty(content);
    
    return {
      isCompliant: analysis.complianceScore >= 80 && analysis.ahpraFlags.length === 0,
      issues: [...analysis.ahpraFlags, ...analysis.tgaFlags],
      suggestions: analysis.suggestedImprovements,
      score: analysis.complianceScore
    };
  }, [analyzeContentForSpecialty]);

  // Get specialty-specific templates
  const getSpecialtyTemplates = useCallback((): Record<string, string> => {
    const specialtyContext = getCurrentSpecialtyContext();
    return specialtyContext.templatePrompts;
  }, [getCurrentSpecialtyContext]);

  return {
    getCurrentSpecialtyContext,
    analyzeContentForSpecialty,
    generateSpecialtyContent,
    getSpecialtySuggestions,
    validateSpecialtyCompliance,
    getSpecialtyTemplates,
    specialtyContexts
  };
} 