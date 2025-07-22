import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

// AHPRA/TGA Compliance Engine for Australian Healthcare Professionals
// Based on 2024 AHPRA advertising guidelines and TGA therapeutic advertising requirements

export interface ComplianceViolation {
  type: 'ahpra' | 'tga' | 'professional_boundaries' | 'patient_testimonial';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  regulation: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: ComplianceViolation[];
  score: number; // 0-100 compliance score
  recommendedChanges: string[];
}

export interface HealthcarePracticeType {
  type: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'social_work' | 'nursing' | 'dental' | 'optometry';
  ahpra_registration: string;
  specialty?: string;
}

// Prohibited terms under TGA therapeutic advertising guidelines
const TGA_PROHIBITED_DRUG_NAMES = [
  'botox', 'dysport', 'xeomin', 'azzalure', 'brotox',
  'juvederm', 'restylane', 'teosyal', 'belotero',
  'botulinum toxin', 'hyaluronic acid', 'collagen'
];

// Prohibited therapeutic claims under AHPRA/TGA guidelines
const PROHIBITED_THERAPEUTIC_CLAIMS = [
  'miracle cure', 'guaranteed results', 'painless treatment', 'totally safe',
  'no side effects', 'instant recovery', 'permanent solution', 'cure',
  'heals', 'treats cancer', 'prevents disease', 'anti-aging miracle'
];

// AHPRA prohibited testimonial indicators
const TESTIMONIAL_INDICATORS = [
  'testimonial', 'review', 'patient says', 'client feedback',
  'customer review', 'before and after story', 'success story',
  'patient experience', 'patient journey', 'recommend'
];

// Professional boundary violation indicators
const BOUNDARY_VIOLATIONS = [
  'best doctor', 'top surgeon', 'australia\'s leading', 'number one',
  'award winning doctor', 'celebrity doctor', 'miracle worker',
  'guaranteed satisfaction', 'money back guarantee'
];

// AHPRA Prohibited Terms (Updated July 2025)
const PROHIBITED_TERMS = [
  'miracle', 'cure', 'guaranteed', 'instant', 'breakthrough', 'revolutionary',
  'amazing results', 'incredible', 'unbelievable', 'life-changing miracle',
  'painless', 'risk-free', 'completely safe', 'no side effects', 'forever',
  'permanent solution', 'magic', 'secret', 'exclusive', 'medically proven'
];

// TGA Restricted Therapeutic Terms
const TGA_THERAPEUTIC_CLAIMS = [
  'treats', 'cures', 'heals', 'eliminates', 'reverses', 'fixes',
  'stops all', 'prevents all', 'diagnoses', 'therapeutic',
  'medical grade', 'clinical strength', 'prescription strength'
];

export function useAHPRACompliance() {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  const validateContent = useCallback(async (
    content: string,
    practiceType: HealthcarePracticeType,
    contentType: 'social_media' | 'blog' | 'advertisement' | 'website'
  ): Promise<ComplianceResult> => {
    setIsValidating(true);
    
    try {
      const contentLower = content.toLowerCase();
      const violations: ComplianceViolation[] = [];
      const recommendedChanges: string[] = [];

      // Check for prohibited terms
      const prohibitedFound = PROHIBITED_TERMS.filter(term => 
        contentLower.includes(term.toLowerCase())
      );

      if (prohibitedFound.length > 0) {
        violations.push({
          type: 'ahpra',
          severity: 'high',
          message: `Prohibited advertising terms found: ${prohibitedFound.join(', ')}`,
          suggestion: 'Remove exaggerated claims and use evidence-based language',
          regulation: 'AHPRA Guidelines Section 9.3 - Advertising Restrictions'
        });
        recommendedChanges.push('Replace exaggerated terms with evidence-based language');
      }

      // Check for TGA therapeutic claims
      const therapeuticFound = TGA_THERAPEUTIC_CLAIMS.filter(term => 
        contentLower.includes(term.toLowerCase())
      );

      if (therapeuticFound.length > 0) {
        violations.push({
          type: 'tga',
          severity: 'critical',
          message: `TGA therapeutic claims detected: ${therapeuticFound.join(', ')}`,
          suggestion: 'Avoid making direct therapeutic claims without proper evidence and registration',
          regulation: 'TGA Therapeutic Goods Advertising Code Section 4'
        });
        recommendedChanges.push('Remove therapeutic claims or ensure proper TGA registration');
      }

      // Check for patient testimonials
      const testimonialFound = TESTIMONIAL_INDICATORS.filter(term => 
        contentLower.includes(term.toLowerCase())
      );

      if (testimonialFound.length > 0) {
        violations.push({
          type: 'patient_testimonial',
          severity: 'critical',
          message: `Patient testimonials detected: ${testimonialFound.join(', ')}`,
          suggestion: 'Remove patient testimonials as they are prohibited by AHPRA',
          regulation: 'AHPRA Guidelines Section 8.12 - Testimonials and Reviews'
        });
        recommendedChanges.push('Remove all patient testimonials and success stories');
      }

      // Check for professional boundary violations
      const boundaryFound = BOUNDARY_VIOLATIONS.filter(term => 
        contentLower.includes(term.toLowerCase())
      );

      if (boundaryFound.length > 0) {
        violations.push({
          type: 'professional_boundaries',
          severity: 'medium',
          message: `Professional boundary violations: ${boundaryFound.join(', ')}`,
          suggestion: 'Use factual language about qualifications and avoid superlative claims',
          regulation: 'AHPRA Guidelines Section 8.5 - Professional Boundaries'
        });
        recommendedChanges.push('Replace superlative claims with factual professional information');
      }

      // Check for missing disclaimers
      const hasHealthAdvice = /should|must|recommend|advise|treatment|diagnosis/i.test(content);
      const hasDisclaimer = /disclaimer|consult|seek professional|individual circumstances/i.test(content);
      
      if (hasHealthAdvice && !hasDisclaimer) {
        violations.push({
          type: 'ahpra',
          severity: 'medium',
          message: 'Health advice provided without appropriate disclaimer',
          suggestion: 'Add disclaimer about seeking professional advice for individual circumstances',
          regulation: 'AHPRA Guidelines Section 8.3 - Professional Advice Disclaimers'
        });
        recommendedChanges.push('Add appropriate health advice disclaimer');
      }

      // Check for AHPRA registration display requirement
      if (contentType === 'advertisement' && !content.includes(practiceType.ahpra_registration)) {
        violations.push({
          type: 'ahpra',
          severity: 'high',
          message: 'AHPRA registration number not displayed in advertisement',
          suggestion: 'Include AHPRA registration number in healthcare advertisements',
          regulation: 'AHPRA Guidelines Section 8.1 - Registration Display Requirements'
        });
        recommendedChanges.push(`Include AHPRA registration: ${practiceType.ahpra_registration}`);
      }

      // Check for drug brand name violations
      const drugNamesFound = TGA_PROHIBITED_DRUG_NAMES.filter(drug => 
        contentLower.includes(drug.toLowerCase())
      );

      if (drugNamesFound.length > 0) {
        violations.push({
          type: 'tga',
          severity: 'critical',
          message: `Prescription drug brand names mentioned: ${drugNamesFound.join(', ')}`,
          suggestion: 'Use generic therapeutic descriptions instead of brand names',
          regulation: 'TGA Therapeutic Goods Advertising Code Section 5.2'
        });
        recommendedChanges.push('Replace drug brand names with generic therapeutic descriptions');
      }

      // Calculate compliance score
      const criticalViolations = violations.filter(v => v.severity === 'critical').length;
      const highViolations = violations.filter(v => v.severity === 'high').length;
      const mediumViolations = violations.filter(v => v.severity === 'medium').length;
      const lowViolations = violations.filter(v => v.severity === 'low').length;

      let score = 100;
      score -= criticalViolations * 30;
      score -= highViolations * 20;
      score -= mediumViolations * 10;
      score -= lowViolations * 5;
      score = Math.max(0, score);

      const result: ComplianceResult = {
        isCompliant: criticalViolations === 0 && highViolations === 0,
        violations,
        score: Math.round(score),
        recommendedChanges
      };

      // Show compliance alerts for critical issues
      if (criticalViolations > 0) {
        toast({
          title: "CRITICAL AHPRA/TGA Violation",
          description: "Content violates mandatory compliance guidelines and cannot be published",
          variant: "destructive"
        });
      } else if (highViolations > 0) {
        toast({
          title: "AHPRA Compliance Warning",
          description: "Content may violate professional guidelines",
          variant: "destructive"
        });
      }

      return result;
      
    } catch (error) {
      console.error('AHPRA validation error:', error);
      return {
        isCompliant: false,
        violations: [{
          type: 'ahpra',
          severity: 'critical',
          message: 'Validation error occurred',
          suggestion: 'Please try again or contact support',
          regulation: 'System Error'
        }],
        score: 0,
        recommendedChanges: ['Please try again or contact support']
      };
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const getComplianceGuidelines = useCallback((practiceType: HealthcarePracticeType, contentType: string) => {
    const guidelines = {
      social_media: [
        'Focus on educational health information, not specific medical advice',
        'Include appropriate disclaimers about consulting healthcare providers',
        'Avoid patient testimonials and success stories',
        'Use evidence-based language and avoid exaggerated claims',
        'Include AHPRA registration number in bio or contact information'
      ],
      blog: [
        'Provide general health information with educational value',
        'Include disclaimers about individual circumstances',
        'Reference evidence-based research where appropriate',
        'Maintain professional boundaries in language and claims',
        'Include author credentials and AHPRA registration'
      ],
      advertisement: [
        'Display AHPRA registration number prominently',
        'Avoid therapeutic claims without proper substantiation',
        'Include contact information and practice location',
        'Use professional language and avoid superlatives',
        'Include appropriate disclaimers and risk information'
      ],
      website: [
        'Provide comprehensive practice and practitioner information',
        'Include detailed AHPRA registration and credentials',
        'Maintain educational focus with appropriate disclaimers',
        'Avoid patient testimonials in prominent locations',
        'Include professional indemnity and privacy information'
      ]
    };

    return guidelines[contentType as keyof typeof guidelines] || guidelines.social_media;
  }, []);

  return {
    validateContent,
    isValidating,
    getComplianceGuidelines,
    prohibitedTerms: PROHIBITED_TERMS,
    therapeuticClaims: TGA_THERAPEUTIC_CLAIMS,
    testimonialIndicators: TESTIMONIAL_INDICATORS
  };
} 