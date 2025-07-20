import { useState, useCallback } from 'react';

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

export const useAHPRACompliance = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateContent = useCallback(async (
    content: string,
    practiceType: HealthcarePracticeType,
    contentType: 'social_media' | 'blog' | 'advertisement' | 'website'
  ): Promise<ComplianceResult> => {
    setIsValidating(true);
    
    const violations: ComplianceViolation[] = [];
    let score = 100;

    try {
      // 1. TGA Therapeutic Advertising Compliance
      const tgaViolations = validateTGACompliance(content);
      violations.push(...tgaViolations);
      score -= tgaViolations.length * 15;

      // 2. AHPRA Advertising Guidelines Compliance
      const ahpraViolations = validateAHPRAGuidelines(content, practiceType);
      violations.push(...ahpraViolations);
      score -= ahpraViolations.length * 20;

      // 3. Patient Testimonial Detection
      const testimonialViolations = validateTestimonialRestrictions(content);
      violations.push(...testimonialViolations);
      score -= testimonialViolations.length * 25;

      // 4. Professional Boundary Enforcement
      const boundaryViolations = validateProfessionalBoundaries(content, practiceType);
      violations.push(...boundaryViolations);
      score -= boundaryViolations.length * 10;

      // 5. Content Type Specific Validation
      const contentSpecificViolations = validateContentTypeSpecific(content, contentType, practiceType);
      violations.push(...contentSpecificViolations);
      score -= contentSpecificViolations.length * 8;

      const finalScore = Math.max(0, score);
      const isCompliant = finalScore >= 80 && violations.filter(v => v.severity === 'critical').length === 0;

      const recommendedChanges = generateRecommendedChanges(violations);

      return {
        isCompliant,
        violations,
        score: finalScore,
        recommendedChanges
      };

    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateTGACompliance = (content: string): ComplianceViolation[] => {
    const violations: ComplianceViolation[] = [];
    const lowerContent = content.toLowerCase();

    // Check for prohibited drug names
    TGA_PROHIBITED_DRUG_NAMES.forEach(drugName => {
      if (lowerContent.includes(drugName)) {
        violations.push({
          type: 'tga',
          severity: 'critical',
          message: `Prohibited drug name "${drugName}" detected`,
          suggestion: `Remove or replace "${drugName}" with a general description like "cosmetic injectable" or "dermal filler"`,
          regulation: 'TGA Therapeutic Goods Advertising Code Section 4.2'
        });
      }
    });

    // Check for therapeutic claims
    PROHIBITED_THERAPEUTIC_CLAIMS.forEach(claim => {
      if (lowerContent.includes(claim)) {
        violations.push({
          type: 'tga',
          severity: 'high',
          message: `Prohibited therapeutic claim "${claim}" detected`,
          suggestion: `Replace with evidence-based language or add qualifying statements`,
          regulation: 'TGA Therapeutic Goods Advertising Code Section 4.1'
        });
      }
    });

    return violations;
  };

  const validateAHPRAGuidelines = (content: string, practiceType: HealthcarePracticeType): ComplianceViolation[] => {
    const violations: ComplianceViolation[] = [];
    const lowerContent = content.toLowerCase();

    // Check for missing AHPRA registration number in advertisements
    if (!content.includes(practiceType.ahpra_registration) && content.length > 100) {
      violations.push({
        type: 'ahpra',
        severity: 'high',
        message: 'AHPRA registration number not displayed in advertising content',
        suggestion: `Include your AHPRA registration number: ${practiceType.ahpra_registration}`,
        regulation: 'AHPRA National Law Section 133(1)'
      });
    }

    // Check for inappropriate use of "specialist" title
    if (lowerContent.includes('specialist') && practiceType.type !== 'specialist') {
      violations.push({
        type: 'ahpra',
        severity: 'critical',
        message: 'Inappropriate use of protected title "specialist"',
        suggestion: 'Remove "specialist" or replace with "practitioner" or specific profession title',
        regulation: 'AHPRA National Law Section 113-116'
      });
    }

    // Check for risk disclaimers in treatment content
    if (isHealthcareServiceContent(content) && !hasRiskDisclaimer(content)) {
      violations.push({
        type: 'ahpra',
        severity: 'medium',
        message: 'Missing risk disclaimer for healthcare service',
        suggestion: 'Add disclaimer: "Always seek a second opinion from another qualified health practitioner"',
        regulation: 'AHPRA Guidelines for advertising regulated health services'
      });
    }

    return violations;
  };

  const validateTestimonialRestrictions = (content: string): ComplianceViolation[] => {
    const violations: ComplianceViolation[] = [];
    const lowerContent = content.toLowerCase();

    TESTIMONIAL_INDICATORS.forEach(indicator => {
      if (lowerContent.includes(indicator)) {
        violations.push({
          type: 'patient_testimonial',
          severity: 'critical',
          message: `Patient testimonial indicator "${indicator}" detected`,
          suggestion: 'Remove patient testimonials and reviews - AHPRA strictly prohibits all patient testimonials',
          regulation: 'AHPRA Guidelines Section 7.3 - Patient testimonials'
        });
      }
    });

    return violations;
  };

  const validateProfessionalBoundaries = (content: string, practiceType: HealthcarePracticeType): ComplianceViolation[] => {
    const violations: ComplianceViolation[] = [];
    const lowerContent = content.toLowerCase();

    BOUNDARY_VIOLATIONS.forEach(violation => {
      if (lowerContent.includes(violation)) {
        violations.push({
          type: 'professional_boundaries',
          severity: 'high',
          message: `Professional boundary violation: "${violation}"`,
          suggestion: 'Use factual, professional language that doesn\'t make superiority claims',
          regulation: 'AHPRA Code of Conduct - Professional boundaries'
        });
      }
    });

    return violations;
  };

  const validateContentTypeSpecific = (
    content: string, 
    contentType: string, 
    practiceType: HealthcarePracticeType
  ): ComplianceViolation[] => {
    const violations: ComplianceViolation[] = [];

    switch (contentType) {
      case 'social_media':
        // Social media specific checks
        if (content.includes('finance') || content.includes('payment plan')) {
          violations.push({
            type: 'ahpra',
            severity: 'medium',
            message: 'Finance offers detected in social media content',
            suggestion: 'Remove finance offers or ensure proper terms and conditions are included',
            regulation: 'AHPRA Guidelines - Inducements'
          });
        }
        break;

      case 'advertisement':
        // Advertisement specific checks
        if (!hasContactInformation(content)) {
          violations.push({
            type: 'ahpra',
            severity: 'medium',
            message: 'Missing contact information in advertisement',
            suggestion: 'Include practice address and contact details',
            regulation: 'AHPRA Guidelines Section 6.2'
          });
        }
        break;
    }

    return violations;
  };

  const generateRecommendedChanges = (violations: ComplianceViolation[]): string[] => {
    const changes: string[] = [];
    
    if (violations.some(v => v.type === 'tga')) {
      changes.push('Replace prohibited drug names with general descriptions like "cosmetic injectable"');
    }
    
    if (violations.some(v => v.type === 'patient_testimonial')) {
      changes.push('Remove all patient testimonials and reviews - focus on educational content instead');
    }
    
    if (violations.some(v => v.type === 'ahpra')) {
      changes.push('Add AHPRA registration number and appropriate risk disclaimers');
    }
    
    if (violations.some(v => v.type === 'professional_boundaries')) {
      changes.push('Use professional, factual language that maintains appropriate boundaries');
    }

    return changes;
  };

  // Helper functions
  const isHealthcareServiceContent = (content: string): boolean => {
    const serviceIndicators = ['treatment', 'procedure', 'consultation', 'therapy', 'injection', 'surgery'];
    return serviceIndicators.some(indicator => content.toLowerCase().includes(indicator));
  };

  const hasRiskDisclaimer = (content: string): boolean => {
    const disclaimerIndicators = ['seek second opinion', 'consult your doctor', 'risks', 'side effects'];
    return disclaimerIndicators.some(indicator => content.toLowerCase().includes(indicator));
  };

  const hasContactInformation = (content: string): boolean => {
    const contactIndicators = ['phone', 'address', 'contact', 'visit', 'clinic'];
    return contactIndicators.some(indicator => content.toLowerCase().includes(indicator));
  };

  return {
    validateContent,
    isValidating
  };
}; 