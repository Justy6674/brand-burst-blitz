import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface HealthcareHashtagRequest {
  topic: string;
  specialty: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry' | 'nursing';
  contentType: 'educational' | 'awareness' | 'promotional' | 'community' | 'preventive';
  targetPlatform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok';
  audience: 'patients' | 'professionals' | 'community' | 'mixed';
  locationContext?: string; // e.g., "Melbourne", "Australia"
}

interface GeneratedHashtag {
  hashtag: string;
  category: 'professional' | 'educational' | 'community' | 'awareness' | 'location';
  ahpraCompliant: boolean;
  effectiveness: number; // 1-10 rating
  usage: 'high' | 'medium' | 'low';
  specialtySpecific: boolean;
}

interface HashtagGenerationResult {
  primary: GeneratedHashtag[];
  secondary: GeneratedHashtag[];
  locationBased: GeneratedHashtag[];
  compliance: {
    allCompliant: boolean;
    flaggedTerms: string[];
    suggestions: string[];
  };
  totalCount: number;
}

interface HashtagLibraryEntry {
  id: string;
  hashtag: string;
  specialties: string[];
  contentTypes: string[];
  platforms: string[];
  ahpraApproved: boolean;
  prohibitedTerms: string[];
  effectiveness: number;
  usageGuidelines: string;
}

export function useHealthcareHashtagGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHashtags, setGeneratedHashtags] = useState<HashtagGenerationResult | null>(null);
  const [hashtagLibrary, setHashtagLibrary] = useState<HashtagLibraryEntry[]>([]);

  // AHPRA-compliant hashtag categories
  const approvedHashtagCategories = {
    professional: {
      general: ['#HealthcareProfessional', '#MedicalEducation', '#PatientCare', '#HealthServices'],
      gp: ['#GeneralPractice', '#FamilyHealth', '#CommunityHealth', '#PreventiveCare'],
      psychology: ['#MentalHealth', '#MentalWellbeing', '#PsychologicalHealth', '#MentalHealthSupport'],
      allied_health: ['#AlliedHealth', '#Rehabilitation', '#PhysicalTherapy', '#HealthRecovery'],
      specialist: ['#SpecialistCare', '#MedicalSpecialist', '#HealthcareExcellence'],
      dentistry: ['#OralHealth', '#DentalCare', '#DentalHealth', '#SmileHealth'],
      nursing: ['#NursingCare', '#PatientAdvocacy', '#NursingEducation', '#ClinicalCare']
    },
    educational: {
      general: ['#HealthEducation', '#PatientEducation', '#HealthLiteracy', '#MedicalInformation'],
      prevention: ['#PreventiveCare', '#HealthScreening', '#EarlyDetection', '#HealthMaintenance'],
      wellness: ['#HealthyLiving', '#Wellness', '#HealthTips', '#LifestyleMedicine'],
      awareness: ['#HealthAwareness', '#HealthPromotion', '#CommunityHealth', '#PublicHealth']
    },
    community: {
      australian: ['#AustralianHealthcare', '#HealthAustralia', '#AusHealth'],
      location: ['#MelbourneHealth', '#SydneyHealth', '#BrisbaneHealth', '#PerthHealth'],
      support: ['#HealthSupport', '#CommunitySupport', '#PatientSupport', '#CareSupport']
    },
    condition_awareness: {
      mental_health: ['#MentalHealthAwareness', '#MentalHealthMatters', '#EndStigma'],
      chronic_conditions: ['#ChronicIllnessSupport', '#DiabetesAwareness', '#HeartHealth'],
      women_health: ['#WomensHealth', '#MaternalHealth', '#BreastCancerAwareness'],
      mens_health: ['#MensHealth', '#MensWellbeing', '#ProstateCancerAwareness']
    }
  };

  // Prohibited terms that violate AHPRA guidelines
  const prohibitedTerms = [
    // Therapeutic claims
    'cure', 'miracle', 'guaranteed', 'instant', 'permanent', 'painless',
    'riskfree', 'safest', 'best', 'fastest', 'strongest', 'ultimate',
    
    // Comparative claims
    'numberone', 'leading', 'top', 'premier', 'superior', 'advanced',
    'revolutionary', 'breakthrough', 'exclusive', 'unique',
    
    // Drug/treatment names
    'botox', 'fillers', 'lasers', 'cosmetic', 'aesthetic', 'beauty',
    'antiaging', 'rejuvenation', 'enhancement', 'transformation',
    
    // Exaggerated outcomes
    'amazing', 'incredible', 'unbelievable', 'spectacular', 'dramatic',
    'lifechanging', 'magical', 'perfect', 'flawless', 'effortless'
  ];

  // Generate healthcare-appropriate hashtags
  const generateHealthcareHashtags = useCallback(async (request: HealthcareHashtagRequest) => {
    setIsGenerating(true);
    
    try {
      // Validate request for AHPRA compliance
      const complianceCheck = validateHashtagRequest(request);
      if (!complianceCheck.isValid) {
        throw new Error(`AHPRA compliance issue: ${complianceCheck.reason}`);
      }

      // Generate primary hashtags based on specialty and content type
      const primaryHashtags = generatePrimaryHashtags(request);
      
      // Generate secondary supporting hashtags
      const secondaryHashtags = generateSecondaryHashtags(request);
      
      // Generate location-based hashtags if location provided
      const locationHashtags = request.locationContext 
        ? generateLocationHashtags(request.locationContext)
        : [];

      // Validate all generated hashtags for AHPRA compliance
      const allHashtags = [...primaryHashtags, ...secondaryHashtags, ...locationHashtags];
      const complianceValidation = validateHashtagsCompliance(allHashtags);

      // Filter out non-compliant hashtags
      const compliantPrimary = primaryHashtags.filter(h => h.ahpraCompliant);
      const compliantSecondary = secondaryHashtags.filter(h => h.ahpraCompliant);
      const compliantLocation = locationHashtags.filter(h => h.ahpraCompliant);

      const result: HashtagGenerationResult = {
        primary: compliantPrimary.slice(0, 5), // Limit to 5 primary
        secondary: compliantSecondary.slice(0, 8), // Limit to 8 secondary
        locationBased: compliantLocation.slice(0, 3), // Limit to 3 location
        compliance: complianceValidation,
        totalCount: compliantPrimary.length + compliantSecondary.length + compliantLocation.length
      };

      // Store generation request for analytics
      await storeHashtagGenerationRequest(request, result);

      setGeneratedHashtags(result);
      return { success: true, hashtags: result };
    } catch (error) {
      console.error('Error generating healthcare hashtags:', error);
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Validate hashtag request for AHPRA compliance
  const validateHashtagRequest = (request: HealthcareHashtagRequest) => {
    // Check for prohibited terms in topic
    const topicLower = request.topic.toLowerCase();
    for (const term of prohibitedTerms) {
      if (topicLower.includes(term)) {
        return {
          isValid: false,
          reason: `Topic contains prohibited term: "${term}". AHPRA guidelines prohibit therapeutic claims and comparative language.`
        };
      }
    }

    // Check for inappropriate content types
    if (request.contentType === 'promotional' && request.specialty === 'psychology') {
      return {
        isValid: false,
        reason: 'Promotional content for psychology services requires careful AHPRA compliance review.'
      };
    }

    return { isValid: true };
  };

  // Generate primary hashtags based on specialty
  const generatePrimaryHashtags = (request: HealthcareHashtagRequest): GeneratedHashtag[] => {
    const hashtags: GeneratedHashtag[] = [];
    
    // Add specialty-specific hashtags
    const specialtyHashtags = approvedHashtagCategories.professional[request.specialty] || [];
    specialtyHashtags.forEach(hashtag => {
      hashtags.push({
        hashtag,
        category: 'professional',
        ahpraCompliant: true,
        effectiveness: 9,
        usage: 'high',
        specialtySpecific: true
      });
    });

    // Add content-type specific hashtags
    const contentHashtags = getContentTypeHashtags(request.contentType);
    contentHashtags.forEach(hashtag => {
      hashtags.push({
        hashtag,
        category: 'educational',
        ahpraCompliant: true,
        effectiveness: 8,
        usage: 'high',
        specialtySpecific: false
      });
    });

    return hashtags;
  };

  // Generate secondary supporting hashtags
  const generateSecondaryHashtags = (request: HealthcareHashtagRequest): GeneratedHashtag[] => {
    const hashtags: GeneratedHashtag[] = [];
    
    // Add general healthcare hashtags
    approvedHashtagCategories.professional.general.forEach(hashtag => {
      hashtags.push({
        hashtag,
        category: 'professional',
        ahpraCompliant: true,
        effectiveness: 7,
        usage: 'medium',
        specialtySpecific: false
      });
    });

    // Add educational hashtags
    approvedHashtagCategories.educational.general.forEach(hashtag => {
      hashtags.push({
        hashtag,
        category: 'educational',
        ahpraCompliant: true,
        effectiveness: 8,
        usage: 'high',
        specialtySpecific: false
      });
    });

    // Add platform-specific hashtags
    const platformHashtags = getPlatformSpecificHashtags(request.targetPlatform);
    platformHashtags.forEach(hashtag => {
      hashtags.push({
        hashtag,
        category: 'community',
        ahpraCompliant: true,
        effectiveness: 6,
        usage: 'medium',
        specialtySpecific: false
      });
    });

    return hashtags;
  };

  // Generate location-based hashtags
  const generateLocationHashtags = (location: string): GeneratedHashtag[] => {
    const hashtags: GeneratedHashtag[] = [];
    
    // Add Australian healthcare hashtags
    approvedHashtagCategories.community.australian.forEach(hashtag => {
      hashtags.push({
        hashtag,
        category: 'location',
        ahpraCompliant: true,
        effectiveness: 7,
        usage: 'medium',
        specialtySpecific: false
      });
    });

    // Add city-specific hashtags if major Australian city
    const cityHashtag = getCitySpecificHashtag(location);
    if (cityHashtag) {
      hashtags.push({
        hashtag: cityHashtag,
        category: 'location',
        ahpraCompliant: true,
        effectiveness: 8,
        usage: 'high',
        specialtySpecific: false
      });
    }

    return hashtags;
  };

  // Validate all hashtags for AHPRA compliance
  const validateHashtagsCompliance = (hashtags: GeneratedHashtag[]) => {
    const flaggedTerms: string[] = [];
    const suggestions: string[] = [];
    
    hashtags.forEach(hashtagObj => {
      const hashtag = hashtagObj.hashtag.toLowerCase();
      
      // Check for prohibited terms
      prohibitedTerms.forEach(term => {
        if (hashtag.includes(term)) {
          flaggedTerms.push(hashtagObj.hashtag);
          hashtagObj.ahpraCompliant = false;
        }
      });
    });

    if (flaggedTerms.length > 0) {
      suggestions.push('Remove hashtags containing therapeutic claims or comparative language');
      suggestions.push('Focus on educational and informational hashtags');
      suggestions.push('Use professional healthcare terminology');
    }

    return {
      allCompliant: flaggedTerms.length === 0,
      flaggedTerms,
      suggestions
    };
  };

  // Get trending healthcare hashtags
  const getTrendingHealthcareHashtags = useCallback(async (specialty: string) => {
    try {
      const { data, error } = await supabase
        .from('healthcare_hashtag_analytics')
        .select('*')
        .contains('specialties', [specialty])
        .eq('ahpra_approved', true)
        .order('trending_score', { ascending: false })
        .limit(20);

      if (error) throw error;

      return { success: true, hashtags: data };
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Load hashtag library
  const loadHashtagLibrary = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('healthcare_hashtag_library')
        .select('*')
        .eq('ahpra_approved', true)
        .order('effectiveness_score', { ascending: false });

      if (error) throw error;

      const library: HashtagLibraryEntry[] = data.map(item => ({
        id: item.id,
        hashtag: item.hashtag,
        specialties: item.specialty || [],
        contentTypes: item.content_type || [],
        platforms: item.platform || [],
        ahpraApproved: item.ahpra_approved,
        prohibitedTerms: item.prohibited_terms || [],
        effectiveness: item.effectiveness_score || 5,
        usageGuidelines: item.usage_guidelines || ''
      }));

      setHashtagLibrary(library);
    } catch (error) {
      console.error('Error loading hashtag library:', error);
    }
  }, []);

  return {
    // State
    isGenerating,
    generatedHashtags,
    hashtagLibrary,
    
    // Actions
    generateHealthcareHashtags,
    getTrendingHealthcareHashtags,
    loadHashtagLibrary,
    
    // Utilities
    validateHashtagRequest,
    getProhibitedTerms: () => prohibitedTerms,
    getApprovedCategories: () => approvedHashtagCategories
  };
}

// Helper functions

function getContentTypeHashtags(contentType: string): string[] {
  const contentHashtags = {
    educational: ['#HealthEducation', '#PatientEducation', '#HealthLiteracy'],
    awareness: ['#HealthAwareness', '#HealthPromotion', '#CommunityHealth'],
    promotional: ['#HealthServices', '#PatientCare', '#HealthcareExcellence'],
    community: ['#CommunityHealth', '#HealthSupport', '#PatientSupport'],
    preventive: ['#PreventiveCare', '#HealthScreening', '#HealthMaintenance']
  };
  
  return contentHashtags[contentType] || contentHashtags.educational;
}

function getPlatformSpecificHashtags(platform: string): string[] {
  const platformHashtags = {
    instagram: ['#HealthTips', '#Wellness', '#HealthyAustralia'],
    facebook: ['#CommunityHealth', '#HealthAwareness'],
    linkedin: ['#HealthcareProfessional', '#MedicalEducation'],
    twitter: ['#HealthNews', '#HealthUpdate'],
    tiktok: ['#HealthyLiving', '#WellnessTips']
  };
  
  return platformHashtags[platform] || [];
}

function getCitySpecificHashtag(location: string): string | null {
  const cityMap = {
    'melbourne': '#MelbourneHealth',
    'sydney': '#SydneyHealth',
    'brisbane': '#BrisbaneHealth',
    'perth': '#PerthHealth',
    'adelaide': '#AdelaideHealth',
    'canberra': '#CanberraHealth',
    'darwin': '#DarwinHealth',
    'hobart': '#HobartHealth'
  };
  
  const normalizedLocation = location.toLowerCase().trim();
  return cityMap[normalizedLocation] || null;
}

async function storeHashtagGenerationRequest(
  request: HealthcareHashtagRequest, 
  result: HashtagGenerationResult
) {
  try {
    await supabase
      .from('healthcare_hashtag_generation_requests')
      .insert([{
        topic: request.topic,
        specialty: request.specialty,
        content_type: request.contentType,
        target_platform: request.targetPlatform,
        audience: request.audience,
        location_context: request.locationContext,
        generated_hashtags: result,
        compliance_status: result.compliance.allCompliant ? 'compliant' : 'needs_review',
        generated_at: new Date().toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);
  } catch (error) {
    console.error('Error storing hashtag generation request:', error);
  }
} 