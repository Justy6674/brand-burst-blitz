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

interface AHPRAComplianceResult {
  isCompliant: boolean;
  complianceScore: number;
  violations: string[];
  warnings: string[];
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

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
    practiceType: string,
    contentType: string
  ): Promise<AHPRAComplianceResult> => {
    setIsValidating(true);
    
    try {
      const contentLower = content.toLowerCase();
      const violations: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Check for prohibited terms
      const prohibitedFound = PROHIBITED_TERMS.filter(term => 
        contentLower.includes(term.toLowerCase())
      );

      // Check for therapeutic claims
      const therapeuticFound = TGA_THERAPEUTIC_CLAIMS.filter(term => 
        contentLower.includes(term.toLowerCase())
      );

      // Check for patient testimonials
      const testimonialFound = TESTIMONIAL_INDICATORS.filter(term => 
        contentLower.includes(term.toLowerCase())
      );

      // Add violations
      if (prohibitedFound.length > 0) {
        violations.push(`Prohibited advertising terms found: ${prohibitedFound.join(', ')}`);
        suggestions.push('Remove exaggerated claims and use evidence-based language');
      }

      if (therapeuticFound.length > 0) {
        violations.push(`TGA therapeutic claims detected: ${therapeuticFound.join(', ')}`);
        suggestions.push('Avoid making direct therapeutic claims without proper evidence');
      }

      if (testimonialFound.length > 0) {
        violations.push(`Potential patient testimonials detected: ${testimonialFound.join(', ')}`);
        suggestions.push('Remove patient testimonials as they are prohibited by AHPRA');
      }

      // Check for missing disclaimers
      const hasHealthAdvice = /should|must|recommend|advise|treatment|diagnosis/i.test(content);
      const hasDisclaimer = /disclaimer|consult|seek professional|individual circumstances/i.test(content);
      const missingDisclaimers = hasHealthAdvice && !hasDisclaimer;

      if (missingDisclaimers) {
        warnings.push('Health advice provided without appropriate disclaimer');
        suggestions.push('Add disclaimer: "This information is general. Consult your healthcare provider for advice specific to your situation."');
      }

      // Check content length appropriateness
      if (content.length < 50) {
        warnings.push('Content may be too brief to be educational');
        suggestions.push('Consider adding more educational value while maintaining compliance');
      }

      // Check for professional language
      if (!/\b(evidence|research|study|clinical)\b/i.test(content) && contentType === 'patient_education') {
        warnings.push('Consider referencing evidence-based information');
        suggestions.push('Include references to research or clinical evidence where appropriate');
      }

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      
      if (testimonialFound.length > 0) {
        riskLevel = 'critical';
      } else if (therapeuticFound.length > 0 || missingDisclaimers) {
        riskLevel = 'high';
      } else if (prohibitedFound.length > 0) {
        riskLevel = 'medium';
      }

      // Calculate compliance score
      const totalIssues = violations.length + (warnings.length * 0.5);
      const complianceScore = Math.max(0, Math.min(100, 100 - (totalIssues * 15)));

      const result: AHPRAComplianceResult = {
        isCompliant: violations.length === 0,
        complianceScore: Math.round(complianceScore),
        violations,
        warnings,
        suggestions,
        riskLevel
      };

      // Show compliance alerts for critical issues
      if (riskLevel === 'critical') {
        toast({
          title: "CRITICAL AHPRA Violation",
          description: "Content violates AHPRA guidelines and cannot be published",
          variant: "destructive"
        });
      } else if (riskLevel === 'high') {
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
        complianceScore: 0,
        violations: ['Validation error occurred'],
        warnings: [],
        suggestions: ['Please try again or contact support'],
        riskLevel: 'critical'
      };
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const getComplianceGuidelines = useCallback((practiceType: string, contentType: string) => {
    const guidelines = {
      patient_education: [
        'Focus on general health information, not specific medical advice',
        'Include appropriate disclaimers about consulting healthcare providers',
        'Use evidence-based language and avoid exaggerated claims',
        'Maintain professional boundaries and avoid patient testimonials'
      ],
      practice_update: [
        'Share practice news and general information',
        'Avoid therapeutic claims about services',
        'Include contact information for appointments',
        'Maintain professional and educational tone'
      ],
      health_tip: [
        'Provide general wellness advice, not medical recommendations',
        'Include disclaimers about individual circumstances',
        'Use evidence-based information where possible',
        'Encourage consultation with healthcare providers'
      ]
    };

    return guidelines[contentType as keyof typeof guidelines] || guidelines.patient_education;
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