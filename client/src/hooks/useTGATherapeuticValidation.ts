import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface TGAValidationRequest {
  content: string;
  contentType: 'blog_post' | 'social_media' | 'newsletter' | 'website' | 'advertisement';
  specialty: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry' | 'nursing';
  targetAudience: 'patients' | 'professionals' | 'general_public';
  includesMedicalClaims: boolean;
  mentionsMedications: boolean;
  includesDeviceClaims: boolean;
}

interface TGAValidationResult {
  isCompliant: boolean;
  overallScore: number; // 0-100
  violations: TGAViolation[];
  warnings: TGAWarning[];
  recommendations: string[];
  requiresReview: boolean;
  validationCategories: {
    therapeuticClaims: TGACategoryResult;
    drugMentions: TGACategoryResult;
    medicalDevices: TGACategoryResult;
    advertisingCompliance: TGACategoryResult;
    evidenceRequirements: TGACategoryResult;
  };
}

interface TGAViolation {
  type: 'critical' | 'major' | 'minor';
  category: 'therapeutic_claims' | 'drug_advertising' | 'device_claims' | 'evidence_requirements' | 'misleading_claims';
  description: string;
  foundText: string;
  tgaReference: string;
  penalty: number; // Score reduction
  suggestedFix: string;
}

interface TGAWarning {
  category: string;
  description: string;
  foundText: string;
  recommendation: string;
}

interface TGACategoryResult {
  compliant: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

interface TGAProhibitedClaim {
  claim: string;
  category: string;
  severity: 'critical' | 'major' | 'minor';
  tgaCode: string;
  description: string;
  alternatives: string[];
}

interface TGAMedicationRule {
  drugName: string;
  brandNames: string[];
  restrictionLevel: 'prohibited' | 'restricted' | 'prescription_only' | 'schedule_specific';
  allowedClaims: string[];
  prohibitedClaims: string[];
  requiresDisclaimer: boolean;
}

export function useTGATherapeuticValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<TGAValidationResult[]>([]);
  const [tgaRulesLibrary, setTGARulesLibrary] = useState<{
    prohibitedClaims: TGAProhibitedClaim[];
    medicationRules: TGAMedicationRule[];
  }>({ prohibitedClaims: [], medicationRules: [] });

  // TGA prohibited therapeutic claims database
  const tgaProhibitedClaims: TGAProhibitedClaim[] = [
    // Critical therapeutic claims
    {
      claim: 'cure',
      category: 'therapeutic_outcome',
      severity: 'critical',
      tgaCode: 'TGA-TC-001',
      description: 'Claims to cure diseases without therapeutic approval',
      alternatives: ['may help manage', 'supports treatment of', 'assists in managing']
    },
    {
      claim: 'treat',
      category: 'therapeutic_action',
      severity: 'major',
      tgaCode: 'TGA-TC-002',
      description: 'Treatment claims require therapeutic approval',
      alternatives: ['may support', 'can assist with', 'helps maintain']
    },
    {
      claim: 'prevent',
      category: 'preventive_claim',
      severity: 'major',
      tgaCode: 'TGA-TC-003',
      description: 'Prevention claims require substantial evidence',
      alternatives: ['may reduce risk of', 'supports healthy', 'contributes to']
    },
    {
      claim: 'heal',
      category: 'therapeutic_outcome',
      severity: 'critical',
      tgaCode: 'TGA-TC-004',
      description: 'Healing claims are therapeutic and regulated',
      alternatives: ['supports recovery', 'aids healing process', 'assists recovery']
    },
    {
      claim: 'diagnose',
      category: 'medical_diagnosis',
      severity: 'critical',
      tgaCode: 'TGA-TC-005',
      description: 'Diagnostic claims are medical device claims',
      alternatives: ['may indicate', 'could suggest', 'provides information about']
    },

    // Drug efficacy claims
    {
      claim: 'most effective',
      category: 'efficacy_comparison',
      severity: 'major',
      tgaCode: 'TGA-EC-001',
      description: 'Comparative efficacy claims require clinical evidence',
      alternatives: ['effective', 'clinically proven', 'evidence-based']
    },
    {
      claim: 'guaranteed results',
      category: 'outcome_guarantee',
      severity: 'critical',
      tgaCode: 'TGA-EC-002',
      description: 'Outcome guarantees are prohibited in therapeutic advertising',
      alternatives: ['clinically shown', 'studies indicate', 'may provide']
    },
    {
      claim: 'side effect free',
      category: 'safety_claim',
      severity: 'major',
      tgaCode: 'TGA-SC-001',
      description: 'Absolute safety claims are misleading',
      alternatives: ['generally well tolerated', 'low incidence of side effects', 'consult healthcare provider']
    },

    // Medical device claims
    {
      claim: 'medical grade',
      category: 'device_classification',
      severity: 'major',
      tgaCode: 'TGA-MD-001',
      description: 'Medical grade claims imply TGA classification',
      alternatives: ['professional standard', 'clinical quality', 'healthcare standard']
    },
    {
      claim: 'clinically proven',
      category: 'evidence_claim',
      severity: 'minor',
      tgaCode: 'TGA-EV-001',
      description: 'Clinical evidence claims must be substantiated',
      alternatives: ['studies suggest', 'research indicates', 'evidence supports']
    }
  ];

  // TGA medication advertising rules
  const tgaMedicationRules: TGAMedicationRule[] = [
    {
      drugName: 'botulinum_toxin',
      brandNames: ['botox', 'dysport', 'xeomin', 'jeuveau'],
      restrictionLevel: 'prescription_only',
      allowedClaims: [],
      prohibitedClaims: ['cosmetic enhancement', 'anti-aging', 'wrinkle removal'],
      requiresDisclaimer: true
    },
    {
      drugName: 'hyaluronic_acid',
      brandNames: ['juvederm', 'restylane', 'belotero', 'teosyal'],
      restrictionLevel: 'prescription_only',
      allowedClaims: [],
      prohibitedClaims: ['permanent results', 'fountain of youth', 'age reversal'],
      requiresDisclaimer: true
    },
    {
      drugName: 'cannabis_products',
      brandNames: ['cbd', 'thc', 'medical cannabis', 'medicinal cannabis'],
      restrictionLevel: 'restricted',
      allowedClaims: ['approved therapeutic uses only'],
      prohibitedClaims: ['cure all', 'miracle medicine', 'natural cure'],
      requiresDisclaimer: true
    }
  ];

  // Validate content against TGA therapeutic advertising requirements
  const validateTGACompliance = useCallback(async (request: TGAValidationRequest) => {
    setIsValidating(true);
    
    try {
      // Initialize validation result
      const result: TGAValidationResult = {
        isCompliant: true,
        overallScore: 100,
        violations: [],
        warnings: [],
        recommendations: [],
        requiresReview: false,
        validationCategories: {
          therapeuticClaims: { compliant: true, score: 100, issues: [], recommendations: [] },
          drugMentions: { compliant: true, score: 100, issues: [], recommendations: [] },
          medicalDevices: { compliant: true, score: 100, issues: [], recommendations: [] },
          advertisingCompliance: { compliant: true, score: 100, issues: [], recommendations: [] },
          evidenceRequirements: { compliant: true, score: 100, issues: [], recommendations: [] }
        }
      };

      // 1. Validate therapeutic claims
      await validateTherapeuticClaims(request.content, result);
      
      // 2. Validate drug mentions and brand names
      await validateDrugMentions(request.content, result);
      
      // 3. Validate medical device claims
      await validateMedicalDeviceClaims(request.content, result);
      
      // 4. Validate advertising compliance
      await validateAdvertisingCompliance(request.content, request.contentType, result);
      
      // 5. Validate evidence requirements
      await validateEvidenceRequirements(request.content, result);
      
      // 6. Calculate overall compliance score
      calculateOverallScore(result);
      
      // 7. Generate recommendations
      generateTGARecommendations(result);
      
      // Store validation result for audit
      await storeTGAValidationResult(request, result);
      
      setValidationResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      
      return { success: true, result };
    } catch (error) {
      console.error('Error validating TGA compliance:', error);
      return { success: false, error: error.message };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate therapeutic claims against TGA requirements
  const validateTherapeuticClaims = async (content: string, result: TGAValidationResult) => {
    const contentLower = content.toLowerCase();
    let categoryScore = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for prohibited therapeutic claims
    tgaProhibitedClaims.forEach(claim => {
      const claimPattern = new RegExp(`\\b${claim.claim}\\b`, 'gi');
      const matches = content.match(claimPattern);
      
      if (matches) {
        const violation: TGAViolation = {
          type: claim.severity,
          category: 'therapeutic_claims',
          description: claim.description,
          foundText: matches.join(', '),
          tgaReference: claim.tgaCode,
          penalty: claim.severity === 'critical' ? 30 : claim.severity === 'major' ? 20 : 10,
          suggestedFix: `Replace "${claim.claim}" with: ${claim.alternatives.join(' or ')}`
        };
        
        result.violations.push(violation);
        categoryScore -= violation.penalty;
        issues.push(claim.description);
        recommendations.push(violation.suggestedFix);
      }
    });

    // Check for unsubstantiated therapeutic claims
    const therapeuticWords = ['effective', 'treatment', 'therapy', 'remedy', 'relief'];
    therapeuticWords.forEach(word => {
      if (contentLower.includes(word)) {
        const hasEvidence = contentLower.includes('study') || 
                           contentLower.includes('research') || 
                           contentLower.includes('clinical');
        
        if (!hasEvidence) {
          result.warnings.push({
            category: 'evidence_support',
            description: `Therapeutic claim "${word}" may require evidence citation`,
            foundText: word,
            recommendation: 'Consider adding references to supporting evidence or qualifying language'
          });
        }
      }
    });

    result.validationCategories.therapeuticClaims = {
      compliant: categoryScore >= 70,
      score: Math.max(0, categoryScore),
      issues,
      recommendations
    };
  };

  // Validate drug mentions and brand names
  const validateDrugMentions = async (content: string, result: TGAValidationResult) => {
    const contentLower = content.toLowerCase();
    let categoryScore = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for prohibited drug brand names
    tgaMedicationRules.forEach(drug => {
      drug.brandNames.forEach(brandName => {
        if (contentLower.includes(brandName.toLowerCase())) {
          const violation: TGAViolation = {
            type: 'critical',
            category: 'drug_advertising',
            description: `Brand name "${brandName}" requires prescription drug advertising compliance`,
            foundText: brandName,
            tgaReference: 'TGA-DA-001',
            penalty: 40,
            suggestedFix: `Remove brand name or ensure full TGA prescription drug advertising compliance`
          };
          
          result.violations.push(violation);
          categoryScore -= violation.penalty;
          issues.push(violation.description);
          recommendations.push(violation.suggestedFix);
        }
      });
      
      // Check for prohibited claims about drugs
      drug.prohibitedClaims.forEach(claim => {
        if (contentLower.includes(claim.toLowerCase())) {
          issues.push(`Prohibited claim about ${drug.drugName}: "${claim}"`);
          recommendations.push(`Remove claim "${claim}" or provide appropriate medical disclaimers`);
          categoryScore -= 25;
        }
      });
    });

    result.validationCategories.drugMentions = {
      compliant: categoryScore >= 70,
      score: Math.max(0, categoryScore),
      issues,
      recommendations
    };
  };

  // Validate medical device claims
  const validateMedicalDeviceClaims = async (content: string, result: TGAValidationResult) => {
    const contentLower = content.toLowerCase();
    let categoryScore = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Medical device keywords that trigger TGA requirements
    const deviceKeywords = [
      'laser', 'ultrasound', 'radiofrequency', 'ipl', 'led therapy',
      'medical device', 'therapeutic device', 'diagnostic'
    ];

    const deviceClaims = [
      'fda approved', 'tga approved', 'medical grade', 'hospital grade',
      'clinically proven', 'scientifically tested'
    ];

    deviceKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        // Check if there are associated therapeutic claims
        deviceClaims.forEach(claim => {
          if (contentLower.includes(claim)) {
            result.warnings.push({
              category: 'device_claims',
              description: `Medical device claim "${claim}" with "${keyword}" may require TGA approval`,
              foundText: `${keyword} + ${claim}`,
              recommendation: 'Verify TGA approval status or add appropriate disclaimers'
            });
          }
        });
      }
    });

    result.validationCategories.medicalDevices = {
      compliant: categoryScore >= 70,
      score: Math.max(0, categoryScore),
      issues,
      recommendations
    };
  };

  // Validate advertising compliance
  const validateAdvertisingCompliance = async (
    content: string, 
    contentType: string, 
    result: TGAValidationResult
  ) => {
    const contentLower = content.toLowerCase();
    let categoryScore = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for missing disclaimers where required
    const requiresDisclaimer = result.violations.some(v => 
      v.category === 'drug_advertising' || v.category === 'therapeutic_claims'
    );

    if (requiresDisclaimer) {
      const hasDisclaimer = contentLower.includes('disclaimer') ||
                           contentLower.includes('consult') ||
                           contentLower.includes('medical advice');
      
      if (!hasDisclaimer) {
        issues.push('Missing required medical disclaimer for therapeutic claims');
        recommendations.push('Add disclaimer about consulting healthcare professionals');
        categoryScore -= 20;
      }
    }

    // Check for inappropriate audience targeting
    if (contentType === 'advertisement') {
      const hasAgeRestriction = contentLower.includes('18+') || 
                               contentLower.includes('adult only');
      
      if (!hasAgeRestriction && result.violations.some(v => v.category === 'drug_advertising')) {
        issues.push('Prescription drug advertising may require age restrictions');
        recommendations.push('Consider adding age restrictions for prescription drug content');
        categoryScore -= 15;
      }
    }

    result.validationCategories.advertisingCompliance = {
      compliant: categoryScore >= 70,
      score: Math.max(0, categoryScore),
      issues,
      recommendations
    };
  };

  // Validate evidence requirements
  const validateEvidenceRequirements = async (content: string, result: TGAValidationResult) => {
    const contentLower = content.toLowerCase();
    let categoryScore = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Evidence-requiring claims
    const evidenceClaims = [
      'clinically proven', 'scientifically tested', 'research shows',
      'studies demonstrate', 'clinical trials', 'peer reviewed'
    ];

    const hasEvidenceClaims = evidenceClaims.some(claim => 
      contentLower.includes(claim)
    );

    if (hasEvidenceClaims) {
      // Check if references are provided
      const hasReferences = contentLower.includes('reference') ||
                           contentLower.includes('study:') ||
                           contentLower.includes('journal') ||
                           contentLower.includes('pubmed');
      
      if (!hasReferences) {
        result.warnings.push({
          category: 'evidence_citation',
          description: 'Evidence claims should be supported by citations',
          foundText: 'Evidence claims without references',
          recommendation: 'Add citations to peer-reviewed studies or clinical trials'
        });
        recommendations.push('Provide citations for evidence-based claims');
        categoryScore -= 10;
      }
    }

    result.validationCategories.evidenceRequirements = {
      compliant: categoryScore >= 70,
      score: Math.max(0, categoryScore),
      issues,
      recommendations
    };
  };

  // Calculate overall compliance score
  const calculateOverallScore = (result: TGAValidationResult) => {
    const categories = result.validationCategories;
    const weights = {
      therapeuticClaims: 0.3,
      drugMentions: 0.25,
      medicalDevices: 0.2,
      advertisingCompliance: 0.15,
      evidenceRequirements: 0.1
    };

    result.overallScore = Math.round(
      categories.therapeuticClaims.score * weights.therapeuticClaims +
      categories.drugMentions.score * weights.drugMentions +
      categories.medicalDevices.score * weights.medicalDevices +
      categories.advertisingCompliance.score * weights.advertisingCompliance +
      categories.evidenceRequirements.score * weights.evidenceRequirements
    );

    result.isCompliant = result.overallScore >= 70 && 
                        !result.violations.some(v => v.type === 'critical');
    
    result.requiresReview = result.overallScore < 85 || 
                           result.violations.some(v => v.type === 'major');
  };

  // Generate TGA-specific recommendations
  const generateTGARecommendations = (result: TGAValidationResult) => {
    const recommendations: string[] = [];

    if (result.violations.length > 0) {
      recommendations.push('Review and address all TGA violations before publication');
    }

    if (result.overallScore < 70) {
      recommendations.push('Content requires substantial revision for TGA compliance');
    }

    if (result.warnings.length > 0) {
      recommendations.push('Consider addressing warnings to improve compliance confidence');
    }

    // Category-specific recommendations
    Object.entries(result.validationCategories).forEach(([category, data]) => {
      if (!data.compliant) {
        recommendations.push(`Improve ${category.replace(/([A-Z])/g, ' $1').toLowerCase()} compliance`);
      }
    });

    result.recommendations = [...new Set(recommendations)]; // Remove duplicates
  };

  // Load TGA rules library
  const loadTGARules = useCallback(async () => {
    try {
      const { data: claims, error: claimsError } = await supabase
        .from('tga_prohibited_claims')
        .select('*')
        .eq('active', true);

      const { data: drugs, error: drugsError } = await supabase
        .from('tga_medication_rules')
        .select('*')
        .eq('active', true);

      if (claimsError) throw claimsError;
      if (drugsError) throw drugsError;

      setTGARulesLibrary({
        prohibitedClaims: claims || tgaProhibitedClaims,
        medicationRules: drugs || tgaMedicationRules
      });
    } catch (error) {
      console.error('Error loading TGA rules:', error);
      // Fallback to built-in rules
      setTGARulesLibrary({
        prohibitedClaims: tgaProhibitedClaims,
        medicationRules: tgaMedicationRules
      });
    }
  }, []);

  return {
    // State
    isValidating,
    validationResults,
    tgaRulesLibrary,
    
    // Actions
    validateTGACompliance,
    loadTGARules,
    
    // Utilities
    getProhibitedClaims: () => tgaProhibitedClaims,
    getMedicationRules: () => tgaMedicationRules
  };
}

// Helper function to store validation results
async function storeTGAValidationResult(
  request: TGAValidationRequest,
  result: TGAValidationResult
) {
  try {
    await supabase
      .from('tga_validation_audit')
      .insert([{
        content_hash: btoa(request.content).slice(0, 50), // Truncated hash
        content_type: request.contentType,
        specialty: request.specialty,
        target_audience: request.targetAudience,
        validation_result: result,
        is_compliant: result.isCompliant,
        overall_score: result.overallScore,
        requires_review: result.requiresReview,
        violation_count: result.violations.length,
        warning_count: result.warnings.length,
        validated_at: new Date().toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);
  } catch (error) {
    console.error('Error storing TGA validation result:', error);
  }
} 