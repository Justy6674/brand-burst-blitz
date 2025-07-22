import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Healthcare-specific validation schemas and utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedValue?: any;
  complianceScore?: number;
  securityRisk?: 'low' | 'medium' | 'high';
}

export interface AHPRAComplianceCheck {
  hasProhibitedTerms: boolean;
  hasTherapeuticClaims: boolean;
  hasPatientTestimonials: boolean;
  hasMisleadingClaims: boolean;
  missingDisclaimers: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: string[];
  suggestions: string[];
}

// AHPRA Prohibited Terms (Updated 2024)
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

// Patient Testimonial Indicators
const TESTIMONIAL_INDICATORS = [
  'testimonial', 'patient says', 'review', 'cured me', 'healed me',
  'my doctor', 'personal experience', 'success story', 'patient story',
  'before and after', 'transformation', 'changed my life'
];

// Professional Boundary Violations
const BOUNDARY_VIOLATIONS = [
  'personal relationship', 'friendship', 'dating', 'romantic',
  'outside consultation', 'private meeting', 'personal contact',
  'social media friend', 'personal phone', 'home address'
];

// Healthcare Professional Types
export const HEALTHCARE_PROFESSIONS = [
  'general_practice', 'mental_health', 'cardiology', 'dermatology', 'orthopedics',
  'pediatrics', 'obstetrics_gynecology', 'neurology', 'oncology', 'radiology',
  'pathology', 'surgery', 'emergency_medicine', 'anesthesiology', 'psychiatry',
  'psychology', 'physiotherapy', 'occupational_therapy', 'speech_therapy',
  'dietetics', 'pharmacy', 'nursing', 'dentistry', 'optometry', 'podiatry'
] as const;

// Healthcare Form Validation Schemas
export const healthcareValidationSchemas = {
  // AHPRA Registration Validation
  ahpraRegistration: z.object({
    registrationNumber: z.string()
      .min(8, 'AHPRA registration must be at least 8 characters')
      .max(15, 'AHPRA registration number too long')
      .regex(/^[A-Z]{3}\d{10}$/, 'Invalid AHPRA registration format (e.g., MED1234567890)')
      .transform(val => val.toUpperCase()),
    profession: z.enum(HEALTHCARE_PROFESSIONS, {
      errorMap: () => ({ message: 'Please select a valid healthcare profession' })
    }),
    speciality: z.string().optional(),
    practiceState: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'], {
      errorMap: () => ({ message: 'Please select a valid Australian state/territory' })
    }),
    practicePostcode: z.string()
      .regex(/^\d{4}$/, 'Australian postcode must be 4 digits')
      .refine(val => parseInt(val) >= 1000 && parseInt(val) <= 9999, 'Invalid Australian postcode range')
  }),

  // Healthcare Practice Information
  practiceDetails: z.object({
    practiceName: z.string()
      .min(2, 'Practice name must be at least 2 characters')
      .max(100, 'Practice name too long')
      .regex(/^[a-zA-Z0-9\s\-&.,()]+$/, 'Practice name contains invalid characters')
      .transform(val => sanitizeHealthcareText(val)),
    abn: z.string()
      .regex(/^\d{11}$/, 'ABN must be 11 digits')
      .refine(validateABN, 'Invalid ABN checksum'),
    practiceType: z.enum(['solo_practice', 'group_practice', 'healthcare_network', 'hospital', 'clinic']),
    servicesOffered: z.array(z.string()).min(1, 'Please select at least one service'),
    bulkBilling: z.boolean().optional(),
    telehealth: z.boolean().optional()
  }),

  // Patient Content Validation
  patientContent: z.object({
    title: z.string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title too long')
      .transform(val => sanitizeHealthcareText(val)),
    content: z.string()
      .min(10, 'Content must be at least 10 characters')
      .max(5000, 'Content too long')
      .transform(val => sanitizeHealthcareText(val)),
    contentType: z.enum(['patient_education', 'practice_update', 'health_tip', 'appointment_reminder', 'emergency_notice']),
    targetAudience: z.enum(['patients', 'professionals', 'general_public']),
    medicalDisclaimer: z.boolean().refine(val => val === true, 'Medical disclaimer must be acknowledged'),
    ahpraCompliant: z.boolean().refine(val => val === true, 'Content must be AHPRA compliant')
  }),

  // Team Member Invitation
  teamMember: z.object({
    email: z.string()
      .email('Invalid email address')
      .refine(email => !email.includes('+'), 'Plus-sign emails not allowed for healthcare team members')
      .transform(val => val.toLowerCase()),
    role: z.enum(['admin', 'practitioner', 'nurse', 'receptionist', 'practice_manager']),
    permissions: z.array(z.enum(['view', 'edit', 'publish', 'admin'])),
    firstName: z.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name too long')
      .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters'),
    lastName: z.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name too long')
      .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters')
  }),

  // Appointment Details
  appointmentInfo: z.object({
    patientType: z.enum(['new', 'returning', 'follow_up', 'urgent', 'emergency']),
    appointmentType: z.string().min(1, 'Appointment type required'),
    duration: z.number().min(5).max(240, 'Appointment duration must be between 5-240 minutes'),
    notes: z.string()
      .max(1000, 'Notes too long')
      .transform(val => sanitizeHealthcareText(val))
      .optional(),
    requiresPreparation: z.boolean().optional(),
    telehealth: z.boolean().optional(),
    bulkBilled: z.boolean().optional()
  })
};

// Healthcare Text Sanitization
export function sanitizeHealthcareText(input: string): string {
  if (!input) return '';
  
  // Remove any potential XSS
  let sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Remove potentially sensitive patterns
  sanitized = sanitized.replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD_REDACTED]'); // Credit cards
  sanitized = sanitized.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[SSN_REDACTED]'); // SSN pattern
  sanitized = sanitized.replace(/medicare\s*#?\s*\d+/gi, '[MEDICARE_REDACTED]'); // Medicare numbers
  
  return sanitized;
}

// AHPRA Compliance Validation
export function validateAHPRACompliance(content: string): AHPRAComplianceCheck {
  const contentLower = content.toLowerCase();
  const violations: string[] = [];
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
  
  // Check for professional boundary issues
  const boundaryFound = BOUNDARY_VIOLATIONS.filter(term => 
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
  
  if (boundaryFound.length > 0) {
    violations.push(`Professional boundary concerns: ${boundaryFound.join(', ')}`);
    suggestions.push('Maintain appropriate professional boundaries in all communications');
  }
  
  // Check for missing disclaimers
  const hasHealthAdvice = /should|must|recommend|advise|treatment|diagnosis/i.test(content);
  const hasDisclaimer = /disclaimer|consult|seek professional|individual circumstances/i.test(content);
  const missingDisclaimers = hasHealthAdvice && !hasDisclaimer;
  
  if (missingDisclaimers) {
    violations.push('Health advice provided without appropriate disclaimer');
    suggestions.push('Add disclaimer: "This information is general. Consult your healthcare provider for advice specific to your situation."');
  }
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (testimonialFound.length > 0 || boundaryFound.length > 0) {
    riskLevel = 'critical';
  } else if (therapeuticFound.length > 0 || missingDisclaimers) {
    riskLevel = 'high';
  } else if (prohibitedFound.length > 0) {
    riskLevel = 'medium';
  }
  
  return {
    hasProhibitedTerms: prohibitedFound.length > 0,
    hasTherapeuticClaims: therapeuticFound.length > 0,
    hasPatientTestimonials: testimonialFound.length > 0,
    hasMisleadingClaims: prohibitedFound.length > 0 || therapeuticFound.length > 0,
    missingDisclaimers,
    riskLevel,
    violations,
    suggestions
  };
}

// ABN Validation (Australian Business Number)
export function validateABN(abn: string): boolean {
  if (!abn || abn.length !== 11) return false;
  
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const abnArray = abn.split('').map(Number);
  
  // Subtract 1 from the first digit
  abnArray[0] = abnArray[0] - 1;
  
  // Multiply each digit by its weight and sum
  const sum = abnArray.reduce((total, digit, index) => total + (digit * weights[index]), 0);
  
  // Check if sum is divisible by 89
  return sum % 89 === 0;
}

// Healthcare Email Validation
export function validateHealthcareEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  // Check for disposable email domains
  const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    errors.push('Disposable email addresses not allowed for healthcare accounts');
  }
  
  // Check for professional domains
  const commonPersonalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  if (commonPersonalDomains.includes(domain)) {
    warnings.push('Consider using a professional email address for healthcare practice');
  }
  
  // Security checks
  let securityRisk: 'low' | 'medium' | 'high' = 'low';
  if (email.includes('+')) {
    warnings.push('Plus-sign emails may cause delivery issues');
    securityRisk = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedValue: email.toLowerCase().trim(),
    securityRisk
  };
}

// Healthcare Phone Number Validation (Australian)
export function validateAustralianPhone(phone: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Australian phone number patterns
  const mobilePattern = /^04\d{8}$/; // Mobile: 04XXXXXXXX
  const landlinePattern = /^0[2-8]\d{8}$/; // Landline: 0XXXXXXXXX
  const internationalPattern = /^614\d{8}$/; // International mobile: 614XXXXXXXX
  
  let isValid = false;
  let phoneType = '';
  
  if (mobilePattern.test(digitsOnly)) {
    isValid = true;
    phoneType = 'mobile';
  } else if (landlinePattern.test(digitsOnly)) {
    isValid = true;
    phoneType = 'landline';
  } else if (internationalPattern.test(digitsOnly)) {
    isValid = true;
    phoneType = 'international_mobile';
  } else {
    errors.push('Invalid Australian phone number format');
  }
  
  // Format the phone number
  let formattedPhone = '';
  if (isValid) {
    if (phoneType === 'mobile') {
      formattedPhone = digitsOnly.replace(/^(04)(\d{2})(\d{3})(\d{3})$/, '$1 $2 $3 $4');
    } else if (phoneType === 'landline') {
      formattedPhone = digitsOnly.replace(/^(0\d)(\d{4})(\d{4})$/, '$1 $2 $3');
    } else {
      formattedPhone = `+${digitsOnly.replace(/^614/, '61 4 ').replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}`;
    }
  }
  
  return {
    isValid,
    errors,
    warnings,
    sanitizedValue: formattedPhone,
    securityRisk: 'low'
  };
}

// Content Security Validation
export function validateContentSecurity(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for potential XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(content)) {
      errors.push('Potentially malicious content detected');
      break;
    }
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b).*(\bfrom\b|\binto\b|\bset\b|\bwhere\b)/gi,
    /('|"|`|;|--|\/\*|\*\/)/g
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(content)) {
      warnings.push('Content contains characters that may cause issues');
      break;
    }
  }
  
  // Check content length
  if (content.length > 10000) {
    warnings.push('Content is very long and may impact performance');
  }
  
  const securityRisk = errors.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low';
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedValue: DOMPurify.sanitize(content),
    securityRisk
  };
}

// Comprehensive Healthcare Input Validator
export function validateHealthcareInput(
  input: any,
  type: 'ahpra_registration' | 'practice_details' | 'patient_content' | 'team_member' | 'appointment_info',
  checkCompliance: boolean = true
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue: any = input;
  let complianceScore = 100;
  
  try {
    // Schema validation
    const schema = healthcareValidationSchemas[type];
    if (schema) {
      const result = schema.safeParse(input);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          errors.push(`${issue.path.join('.')}: ${issue.message}`);
        });
      } else {
        sanitizedValue = result.data;
      }
    }
    
    // Additional compliance checking for content
    if (checkCompliance && type === 'patient_content' && sanitizedValue.content) {
      const complianceCheck = validateAHPRACompliance(sanitizedValue.content);
      
      if (complianceCheck.violations.length > 0) {
        errors.push(...complianceCheck.violations);
        complianceScore = Math.max(0, 100 - (complianceCheck.violations.length * 20));
      }
      
      warnings.push(...complianceCheck.suggestions);
      
      if (complianceCheck.riskLevel === 'critical') {
        errors.push('CRITICAL: Content violates AHPRA guidelines and cannot be published');
      }
    }
    
    // Security validation for all text content
    if (typeof sanitizedValue === 'object' && sanitizedValue !== null) {
      for (const [key, value] of Object.entries(sanitizedValue)) {
        if (typeof value === 'string' && value.length > 0) {
          const securityCheck = validateContentSecurity(value);
          if (!securityCheck.isValid) {
            errors.push(`${key}: ${securityCheck.errors.join(', ')}`);
          }
          warnings.push(...securityCheck.warnings.map(w => `${key}: ${w}`));
        }
      }
    }
    
  } catch (error) {
    errors.push('Validation error: ' + error.message);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedValue,
    complianceScore,
    securityRisk: errors.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low'
  };
}

// Healthcare Form Validation Hook-friendly wrapper
export function createHealthcareValidator(type: string) {
  return (value: any) => {
    const result = validateHealthcareInput(value, type as any, true);
    if (!result.isValid) {
      throw new Error(result.errors.join('; '));
    }
    return result.sanitizedValue;
  };
}

// Real-time compliance checker for content editing
export function validateContentInRealTime(content: string): {
  isCompliant: boolean;
  issues: Array<{ type: 'error' | 'warning', message: string }>;
  score: number;
} {
  const complianceCheck = validateAHPRACompliance(content);
  const securityCheck = validateContentSecurity(content);
  
  const issues: Array<{ type: 'error' | 'warning', message: string }> = [];
  
  // Add compliance issues
  complianceCheck.violations.forEach(violation => {
    issues.push({ type: 'error', message: violation });
  });
  
  complianceCheck.suggestions.forEach(suggestion => {
    issues.push({ type: 'warning', message: suggestion });
  });
  
  // Add security issues
  securityCheck.errors.forEach(error => {
    issues.push({ type: 'error', message: error });
  });
  
  securityCheck.warnings.forEach(warning => {
    issues.push({ type: 'warning', message: warning });
  });
  
  const errorCount = issues.filter(i => i.type === 'error').length;
  const score = Math.max(0, 100 - (errorCount * 25));
  
  return {
    isCompliant: errorCount === 0,
    issues,
    score
  };
}

// Export validation utilities
export default {
  schemas: healthcareValidationSchemas,
  sanitizeText: sanitizeHealthcareText,
  validateAHPRA: validateAHPRACompliance,
  validateABN,
  validateEmail: validateHealthcareEmail,
  validatePhone: validateAustralianPhone,
  validateSecurity: validateContentSecurity,
  validateInput: validateHealthcareInput,
  createValidator: createHealthcareValidator,
  realTimeCheck: validateContentInRealTime
}; 