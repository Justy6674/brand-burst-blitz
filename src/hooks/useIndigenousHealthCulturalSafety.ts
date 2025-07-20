import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface CulturalSafetyGuideline {
  id: string;
  guideline_name: string;
  category: 'language' | 'imagery' | 'consultation' | 'protocols' | 'terminology' | 'representation';
  description: string;
  requirement_level: 'mandatory' | 'recommended' | 'best_practice';
  applicable_content_types: string[];
  cultural_context: string;
  example_violations: string[];
  recommended_approaches: string[];
  consultation_required: boolean;
  created_at: string;
  updated_at: string;
}

interface IndigenousHealthContent {
  id: string;
  user_id: string;
  content_type: 'social_post' | 'blog_article' | 'website_content' | 'educational_material' | 'health_promotion';
  content_text: string;
  content_images: string[];
  target_communities: string[];
  health_topics: string[];
  cultural_consultation_completed: boolean;
  cultural_reviewer_id?: string;
  cultural_safety_compliant: boolean;
  cultural_safety_score: number;
  cultural_safety_notes: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'requires_cultural_review';
  created_at: string;
  updated_at: string;
}

interface CulturalSafetyCheck {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
  culturalConsultationRequired: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  safetyScore: number; // 0-100
  requiredActions: string[];
  culturalProtocols: string[];
}

interface CulturalEducationResource {
  id: string;
  resource_name: string;
  resource_type: 'guideline' | 'training_module' | 'consultation_service' | 'reference_material';
  description: string;
  provider_organization: string;
  target_audience: string[];
  access_url?: string;
  contact_information: string;
  last_updated: string;
}

export const useIndigenousHealthCulturalSafety = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [guidelines, setGuidelines] = useState<CulturalSafetyGuideline[]>([]);
  const [content, setContent] = useState<IndigenousHealthContent[]>([]);
  const [educationResources, setEducationResources] = useState<CulturalEducationResource[]>([]);
  const [currentContent, setCurrentContent] = useState<IndigenousHealthContent | null>(null);

  // Load cultural safety guidelines
  const loadGuidelines = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('indigenous_cultural_safety_guidelines')
        .select('*')
        .order('category')
        .order('requirement_level');

      if (error) throw error;
      setGuidelines(data || []);

    } catch (error) {
      console.error('Error loading cultural safety guidelines:', error);
      toast({
        title: "Error Loading Guidelines",
        description: "Could not load cultural safety guidelines. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load cultural education resources
  const loadEducationResources = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('indigenous_health_education_resources')
        .select('*')
        .order('resource_type')
        .order('resource_name');

      if (error) throw error;
      setEducationResources(data || []);

    } catch (error) {
      console.error('Error loading education resources:', error);
    }
  }, []);

  // Load user's Indigenous health content
  const loadContent = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('indigenous_health_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);

    } catch (error) {
      console.error('Error loading content:', error);
    }
  }, []);

  // Validate cultural safety compliance
  const validateCulturalSafety = useCallback((
    contentText: string,
    contentImages: string[],
    healthTopics: string[],
    targetCommunities: string[]
  ): CulturalSafetyCheck => {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];
    const culturalProtocols: string[] = [];
    let culturalConsultationRequired = false;
    let riskLevel: CulturalSafetyCheck['riskLevel'] = 'low';
    let safetyScore = 100;

    const contentLower = contentText.toLowerCase();

    // Critical Language Violations
    const problematicTerms = [
      'aboriginal', // Should use 'Aboriginal and Torres Strait Islander'
      'natives',
      'tribe', 'tribal', // Often inappropriate in Australian context
      'primitive',
      'stone age',
      'backwards',
      'underdeveloped',
      'savage',
      'civilized',
      'discovered' // in context of European arrival
    ];

    problematicTerms.forEach(term => {
      if (contentLower.includes(term.toLowerCase())) {
        violations.push(`Problematic terminology detected: "${term}"`);
        safetyScore -= 20;
        riskLevel = 'high';
      }
    });

    // Preferred Terminology Check
    const preferredTerminology = [
      { incorrect: /\baboriginal\b/gi, correct: 'Aboriginal and Torres Strait Islander' },
      { incorrect: /\bindigenous people\b/gi, correct: 'Aboriginal and Torres Strait Islander peoples' },
      { incorrect: /\btribe\b/gi, correct: 'community' },
      { incorrect: /\btraditional owner\b/gi, correct: 'Traditional Owner' } // Should be capitalized
    ];

    preferredTerminology.forEach(({ incorrect, correct }) => {
      if (incorrect.test(contentText)) {
        warnings.push(`Consider using "${correct}" instead of detected terminology`);
        safetyScore -= 10;
      }
    });

    // Health Topic Specific Requirements
    const sensitiveHealthTopics = [
      'mental health',
      'suicide',
      'domestic violence',
      'substance abuse',
      'sexual health',
      'cultural healing',
      'traditional medicine',
      'women\'s health',
      'men\'s health'
    ];

    const hasSensitiveTopics = healthTopics.some(topic => 
      sensitiveHealthTopics.some(sensitive => 
        topic.toLowerCase().includes(sensitive)
      )
    );

    if (hasSensitiveTopics) {
      culturalConsultationRequired = true;
      requiredActions.push('Cultural consultation required for sensitive health topics');
      culturalProtocols.push('Engage with local Aboriginal Community Controlled Health Services');
      culturalProtocols.push('Follow NHMRC cultural guidelines for Indigenous health research');
      
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Suicide Prevention Specific Protocols
    if (healthTopics.some(topic => topic.toLowerCase().includes('suicide'))) {
      culturalConsultationRequired = true;
      riskLevel = 'critical';
      requiredActions.push('MANDATORY: Follow Mindframe guidelines for Indigenous suicide reporting');
      requiredActions.push('Cultural consultation with local Indigenous mental health services required');
      culturalProtocols.push('Contact Lifeline 13 11 14 or Aboriginal Crisis Line');
      culturalProtocols.push('Review content with Indigenous mental health professionals');
      safetyScore -= 30;
    }

    // Community Specific Considerations
    if (targetCommunities.length > 0) {
      culturalConsultationRequired = true;
      requiredActions.push('Community-specific consultation required');
      culturalProtocols.push('Engage with specific community representatives');
      culturalProtocols.push('Respect local protocols and decision-making processes');
      
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Cultural Imagery Considerations
    if (contentImages.length > 0) {
      warnings.push('Ensure all imagery is culturally appropriate and has proper permissions');
      recommendations.push('Use imagery from appropriate cultural image libraries');
      recommendations.push('Obtain community consent for any community-specific imagery');
      safetyScore -= 5;
    }

    // Generalization and Stereotyping Check
    const generalizingLanguage = [
      'all aboriginal people',
      'all indigenous people',
      'aboriginal culture', // Should be 'cultures' - plural
      'traditional lifestyle',
      'ancient ways'
    ];

    generalizingLanguage.forEach(phrase => {
      if (contentLower.includes(phrase)) {
        warnings.push(`Avoid generalizations: "${phrase}"`);
        recommendations.push('Acknowledge diversity within Aboriginal and Torres Strait Islander communities');
        safetyScore -= 15;
      }
    });

    // Self-Determination and Strength-Based Language
    const deficitLanguage = [
      'disadvantaged',
      'vulnerable',
      'at-risk',
      'problem',
      'issue'
    ];

    let deficitCount = 0;
    deficitLanguage.forEach(term => {
      if (contentLower.includes(term)) {
        deficitCount++;
      }
    });

    if (deficitCount > 2) {
      warnings.push('Consider using strength-based language rather than deficit-focused terms');
      recommendations.push('Emphasize community strengths, resilience, and self-determination');
      safetyScore -= 10;
    }

    // Required Acknowledgments and Protocols
    const requiredElements = [
      'traditional owners',
      'country',
      'elder', // Should acknowledge Elders
      'community'
    ];

    const missingElements = requiredElements.filter(element => 
      !contentLower.includes(element)
    );

    if (missingElements.length > 2) {
      recommendations.push('Consider acknowledging Traditional Owners and Country');
      recommendations.push('Acknowledge the wisdom of Elders past, present and emerging');
      safetyScore -= 10;
    }

    // Copyright and Cultural Intellectual Property
    if (contentText.includes('traditional knowledge') || 
        contentText.includes('cultural practice')) {
      culturalProtocols.push('Respect cultural intellectual property and traditional knowledge');
      culturalProtocols.push('Seek appropriate permissions for sharing traditional knowledge');
      requiredActions.push('Verify cultural intellectual property permissions');
    }

    // Data Sovereignty Considerations
    if (contentText.includes('research') || contentText.includes('data')) {
      culturalProtocols.push('Follow Indigenous Data Sovereignty principles');
      recommendations.push('Consider CARE principles (Collective benefit, Authority to control, Responsibility, Ethics)');
    }

    // Consultation Requirements
    if (culturalConsultationRequired) {
      requiredActions.push('Engage qualified cultural advisor or Indigenous health professional');
      requiredActions.push('Allow adequate time for community consultation processes');
      culturalProtocols.push('Respect community protocols and decision-making timeframes');
    }

    // Educational Requirements
    recommendations.push('Complete cultural competency training if not already done');
    recommendations.push('Stay updated with current cultural safety guidelines');
    recommendations.push('Build ongoing relationships with local Indigenous health services');

    // Final Risk Assessment
    if (violations.length >= 2) riskLevel = 'critical';
    else if (violations.length >= 1 || culturalConsultationRequired) riskLevel = 'high';
    else if (warnings.length >= 3) riskLevel = 'medium';

    const isCompliant = violations.length === 0 && safetyScore >= 80 && 
                       (!culturalConsultationRequired || culturalConsultationRequired);

    return {
      isCompliant,
      violations,
      warnings,
      recommendations,
      culturalConsultationRequired,
      riskLevel,
      safetyScore: Math.max(0, safetyScore),
      requiredActions,
      culturalProtocols
    };
  }, []);

  // Create Indigenous health content with cultural safety checking
  const createIndigenousHealthContent = useCallback(async (
    contentType: IndigenousHealthContent['content_type'],
    contentText: string,
    contentImages: string[],
    targetCommunities: string[],
    healthTopics: string[]
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Perform cultural safety check
      const safetyCheck = validateCulturalSafety(
        contentText, 
        contentImages, 
        healthTopics, 
        targetCommunities
      );

      const contentData = {
        user_id: user.id,
        content_type: contentType,
        content_text: contentText,
        content_images: contentImages,
        target_communities: targetCommunities,
        health_topics: healthTopics,
        cultural_consultation_completed: false,
        cultural_safety_compliant: safetyCheck.isCompliant,
        cultural_safety_score: safetyCheck.safetyScore,
        cultural_safety_notes: JSON.stringify(safetyCheck),
        approval_status: safetyCheck.culturalConsultationRequired ? 
          'requires_cultural_review' as const : 
          (safetyCheck.isCompliant ? 'approved' as const : 'pending' as const)
      };

      const { data, error } = await supabase
        .from('indigenous_health_content')
        .insert(contentData)
        .select()
        .single();

      if (error) throw error;

      await loadContent();

      // Log content creation for compliance
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: 'Indigenous health content created',
          action_type: 'content',
          details: {
            content_id: data.id,
            content_type: contentType,
            target_communities: targetCommunities,
            health_topics: healthTopics,
            cultural_safety_score: safetyCheck.safetyScore,
            consultation_required: safetyCheck.culturalConsultationRequired,
            risk_level: safetyCheck.riskLevel
          },
          compliance_impact: true
        });

      toast({
        title: "Content Created",
        description: `Indigenous health content created. Cultural safety score: ${safetyCheck.safetyScore}%`,
      });

      if (!safetyCheck.isCompliant) {
        toast({
          title: "Cultural Safety Review Required",
          description: `${safetyCheck.violations.length} issues detected. ${safetyCheck.culturalConsultationRequired ? 'Cultural consultation required.' : ''}`,
          variant: "destructive",
        });
      }

      return data;

    } catch (error) {
      console.error('Error creating Indigenous health content:', error);
      toast({
        title: "Creation Failed",
        description: "Could not create Indigenous health content. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [validateCulturalSafety, loadContent, toast]);

  // Request cultural consultation
  const requestCulturalConsultation = useCallback(async (
    contentId: string,
    consultationNotes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update content status
      const { error } = await supabase
        .from('indigenous_health_content')
        .update({
          approval_status: 'requires_cultural_review'
        })
        .eq('id', contentId);

      if (error) throw error;

      // Log consultation request
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: 'Cultural consultation requested',
          action_type: 'compliance',
          details: {
            content_id: contentId,
            consultation_notes: consultationNotes
          },
          compliance_impact: true
        });

      await loadContent();

      toast({
        title: "Consultation Requested",
        description: "Cultural consultation has been requested for this content.",
      });

    } catch (error) {
      console.error('Error requesting consultation:', error);
      toast({
        title: "Request Failed",
        description: "Could not request cultural consultation.",
        variant: "destructive",
      });
    }
  }, [loadContent, toast]);

  // Get cultural safety summary
  const getCulturalSafetySummary = useCallback(() => {
    const totalContent = content.length;
    const compliantContent = content.filter(c => c.cultural_safety_compliant).length;
    const requiresConsultation = content.filter(c => 
      c.approval_status === 'requires_cultural_review'
    ).length;
    const pendingContent = content.filter(c => c.approval_status === 'pending').length;
    const approvedContent = content.filter(c => c.approval_status === 'approved').length;

    const averageSafetyScore = content.length > 0 
      ? content.reduce((sum, c) => sum + c.cultural_safety_score, 0) / content.length
      : 0;

    const highRiskContent = content.filter(c => {
      try {
        const safety = JSON.parse(c.cultural_safety_notes);
        return safety.riskLevel === 'high' || safety.riskLevel === 'critical';
      } catch {
        return false;
      }
    }).length;

    return {
      totalContent,
      compliantContent,
      requiresConsultation,
      pendingContent,
      approvedContent,
      highRiskContent,
      complianceRate: totalContent > 0 ? (compliantContent / totalContent) * 100 : 0,
      averageSafetyScore
    };
  }, [content]);

  // Initialize data loading
  useEffect(() => {
    loadGuidelines();
    loadEducationResources();
    loadContent();
  }, [loadGuidelines, loadEducationResources, loadContent]);

  return {
    // State
    loading,
    guidelines,
    content,
    educationResources,
    currentContent,

    // Actions
    loadGuidelines,
    loadContent,
    createIndigenousHealthContent,
    requestCulturalConsultation,

    // Analysis
    validateCulturalSafety,
    getCulturalSafetySummary,

    // Setters
    setCurrentContent
  };
}; 