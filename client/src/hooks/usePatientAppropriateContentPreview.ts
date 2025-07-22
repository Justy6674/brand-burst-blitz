import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface ContentPreviewRequest {
  content: string;
  contentType: 'blog_post' | 'social_media' | 'newsletter' | 'patient_education' | 'website_content';
  specialty: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry' | 'nursing';
  targetAudience: 'current_patients' | 'potential_patients' | 'general_public' | 'professional_network';
  platform: 'website' | 'facebook' | 'instagram' | 'linkedin' | 'email' | 'print';
  includePracticeInfo: boolean;
}

interface ProfessionalBoundaryCheck {
  category: 'patient_relationship' | 'confidentiality' | 'professional_distance' | 'therapeutic_relationship' | 'duty_of_care';
  isCompliant: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  foundText: string;
  ahpraReference: string;
  recommendation: string;
}

interface PatientAppropriatePreview {
  isPatientAppropriate: boolean;
  professionalBoundariesScore: number; // 0-100
  readabilityScore: number; // 0-100
  appropriatenessScore: number; // 0-100
  overallScore: number; // 0-100
  boundaryChecks: ProfessionalBoundaryCheck[];
  contentWarnings: ContentWarning[];
  patientSafetyFlags: PatientSafetyFlag[];
  recommendations: string[];
  previewContent: {
    title: string;
    summary: string;
    keyPoints: string[];
    callToAction: string;
    disclaimers: string[];
  };
}

interface ContentWarning {
  type: 'language_complexity' | 'medical_jargon' | 'cultural_sensitivity' | 'age_appropriateness' | 'accessibility';
  severity: 'info' | 'warning' | 'error';
  description: string;
  foundText: string;
  suggestion: string;
}

interface PatientSafetyFlag {
  type: 'diagnostic_advice' | 'treatment_recommendation' | 'medication_guidance' | 'emergency_situation' | 'self_diagnosis';
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  foundText: string;
  requiredDisclaimer: string;
  ahpraImplication: string;
}

interface ProfessionalBoundaryRule {
  id: string;
  category: string;
  rule: string;
  triggers: string[];
  severity: string;
  ahpraCode: string;
  description: string;
  recommendation: string;
}

export function usePatientAppropriateContentPreview() {
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewResults, setPreviewResults] = useState<PatientAppropriatePreview[]>([]);
  const [boundaryRules, setBoundaryRules] = useState<ProfessionalBoundaryRule[]>([]);

  // AHPRA professional boundary rules
  const professionalBoundaryRules: ProfessionalBoundaryRule[] = [
    // Patient relationship boundaries
    {
      id: 'PB-001',
      category: 'patient_relationship',
      rule: 'No personal relationships with patients',
      triggers: ['personal relationship', 'friendship', 'dating', 'personal contact', 'social media friend'],
      severity: 'critical',
      ahpraCode: 'AHPRA-PR-001',
      description: 'Content suggests inappropriate personal relationships with patients',
      recommendation: 'Maintain professional boundaries and avoid personal relationship references'
    },
    {
      id: 'PB-002',
      category: 'patient_relationship',
      rule: 'No dual relationships',
      triggers: ['business partner', 'family friend', 'neighbor', 'personal services'],
      severity: 'high',
      ahpraCode: 'AHPRA-PR-002',
      description: 'Content suggests dual relationships which compromise professional boundaries',
      recommendation: 'Ensure all patient interactions remain strictly professional'
    },
    
    // Confidentiality boundaries
    {
      id: 'PB-003',
      category: 'confidentiality',
      rule: 'No patient identification',
      triggers: ['patient story', 'case study', 'individual patient', 'my patient', 'this patient'],
      severity: 'critical',
      ahpraCode: 'AHPRA-CF-001',
      description: 'Content may compromise patient confidentiality',
      recommendation: 'Use only de-identified, generalized examples or avoid patient-specific content'
    },
    {
      id: 'PB-004',
      category: 'confidentiality',
      rule: 'No identifiable patient information',
      triggers: ['patient name', 'specific case', 'unique condition', 'rare diagnosis'],
      severity: 'critical',
      ahpraCode: 'AHPRA-CF-002',
      description: 'Content contains potentially identifiable patient information',
      recommendation: 'Remove all potentially identifying information and use general examples only'
    },
    
    // Professional distance
    {
      id: 'PB-005',
      category: 'professional_distance',
      rule: 'Maintain professional language',
      triggers: ['my friend', 'sweetie', 'honey', 'babe', 'love', 'darling'],
      severity: 'medium',
      ahpraCode: 'AHPRA-PD-001',
      description: 'Content uses inappropriate informal or personal language',
      recommendation: 'Use professional, respectful language appropriate for healthcare communication'
    },
    {
      id: 'PB-006',
      category: 'professional_distance',
      rule: 'No personal opinions on non-medical matters',
      triggers: ['personally believe', 'my opinion', 'political view', 'religious belief'],
      severity: 'medium',
      ahpraCode: 'AHPRA-PD-002',
      description: 'Content includes personal opinions on non-medical matters',
      recommendation: 'Focus on evidence-based medical information and professional expertise'
    },
    
    // Therapeutic relationship boundaries
    {
      id: 'PB-007',
      category: 'therapeutic_relationship',
      rule: 'No therapy or counseling in public content',
      triggers: ['therapy session', 'counseling', 'personal advice', 'individual guidance'],
      severity: 'high',
      ahpraCode: 'AHPRA-TR-001',
      description: 'Content attempts to provide therapy or individual counseling',
      recommendation: 'Provide general educational information only, refer to professional consultation'
    },
    {
      id: 'PB-008',
      category: 'therapeutic_relationship',
      rule: 'No diagnostic suggestions',
      triggers: ['you might have', 'sounds like you have', 'could be', 'probably'],
      severity: 'high',
      ahpraCode: 'AHPRA-TR-002',
      description: 'Content suggests diagnoses without proper assessment',
      recommendation: 'Encourage professional medical assessment for individual concerns'
    },
    
    // Duty of care boundaries
    {
      id: 'PB-009',
      category: 'duty_of_care',
      rule: 'No emergency medical advice',
      triggers: ['emergency', 'urgent', 'immediately', 'crisis', 'life threatening'],
      severity: 'critical',
      ahpraCode: 'AHPRA-DC-001',
      description: 'Content provides advice for emergency situations',
      recommendation: 'Direct to emergency services and avoid providing emergency medical guidance'
    },
    {
      id: 'PB-010',
      category: 'duty_of_care',
      rule: 'No treatment recommendations without assessment',
      triggers: ['you should take', 'I recommend', 'best treatment', 'try this medication'],
      severity: 'high',
      ahpraCode: 'AHPRA-DC-002',
      description: 'Content provides treatment recommendations without proper assessment',
      recommendation: 'Provide general information only and encourage professional consultation'
    }
  ];

  // Generate patient-appropriate content preview
  const generatePatientAppropriatePreview = useCallback(async (request: ContentPreviewRequest) => {
    setIsGeneratingPreview(true);
    
    try {
      // Initialize preview result
      const preview: PatientAppropriatePreview = {
        isPatientAppropriate: true,
        professionalBoundariesScore: 100,
        readabilityScore: 100,
        appropriatenessScore: 100,
        overallScore: 100,
        boundaryChecks: [],
        contentWarnings: [],
        patientSafetyFlags: [],
        recommendations: [],
        previewContent: {
          title: '',
          summary: '',
          keyPoints: [],
          callToAction: '',
          disclaimers: []
        }
      };

      // 1. Check professional boundaries
      await checkProfessionalBoundaries(request.content, preview);
      
      // 2. Assess readability for patients
      await assessPatientReadability(request.content, preview);
      
      // 3. Check content appropriateness
      await checkContentAppropriateness(request.content, request, preview);
      
      // 4. Identify patient safety flags
      await identifyPatientSafetyFlags(request.content, preview);
      
      // 5. Generate patient-safe preview content
      await generatePreviewContent(request.content, request, preview);
      
      // 6. Calculate overall scores
      calculatePreviewScores(preview);
      
      // 7. Generate recommendations
      generatePatientSafetyRecommendations(preview);
      
      // Store preview for audit
      await storePreviewAudit(request, preview);
      
      setPreviewResults(prev => [preview, ...prev.slice(0, 9)]); // Keep last 10
      
      return { success: true, preview };
    } catch (error) {
      console.error('Error generating patient-appropriate preview:', error);
      return { success: false, error: error.message };
    } finally {
      setIsGeneratingPreview(false);
    }
  }, []);

  // Check professional boundaries according to AHPRA guidelines
  const checkProfessionalBoundaries = async (content: string, preview: PatientAppropriatePreview) => {
    const contentLower = content.toLowerCase();
    let boundaryScore = 100;

    professionalBoundaryRules.forEach(rule => {
      rule.triggers.forEach(trigger => {
        if (contentLower.includes(trigger.toLowerCase())) {
          const boundaryCheck: ProfessionalBoundaryCheck = {
            category: rule.category as any,
            isCompliant: false,
            severity: rule.severity as any,
            description: rule.description,
            foundText: trigger,
            ahpraReference: rule.ahpraCode,
            recommendation: rule.recommendation
          };
          
          preview.boundaryChecks.push(boundaryCheck);
          
          // Deduct score based on severity
          const penalty = rule.severity === 'critical' ? 30 : 
                         rule.severity === 'high' ? 20 : 
                         rule.severity === 'medium' ? 10 : 5;
          boundaryScore -= penalty;
        }
      });
    });

    preview.professionalBoundariesScore = Math.max(0, boundaryScore);
  };

  // Assess readability for patient audiences
  const assessPatientReadability = async (content: string, preview: PatientAppropriatePreview) => {
    let readabilityScore = 100;
    
    // Check for medical jargon
    const medicalJargon = [
      'pathophysiology', 'etiology', 'contraindication', 'comorbidity',
      'pharmacokinetics', 'differential diagnosis', 'prognosis'
    ];
    
    const complexTerms = medicalJargon.filter(term => 
      content.toLowerCase().includes(term)
    );
    
    if (complexTerms.length > 0) {
      preview.contentWarnings.push({
        type: 'medical_jargon',
        severity: 'warning',
        description: 'Content contains complex medical terminology',
        foundText: complexTerms.join(', '),
        suggestion: 'Use plain language explanations or provide definitions'
      });
      readabilityScore -= complexTerms.length * 10;
    }
    
    // Check sentence length (ideal: 15-20 words for health content)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(sentence => 
      sentence.split(' ').length > 25
    );
    
    if (longSentences.length > 0) {
      preview.contentWarnings.push({
        type: 'language_complexity',
        severity: 'info',
        description: 'Some sentences may be too long for easy reading',
        foundText: `${longSentences.length} long sentences found`,
        suggestion: 'Break long sentences into shorter, clearer statements'
      });
      readabilityScore -= longSentences.length * 5;
    }

    preview.readabilityScore = Math.max(0, readabilityScore);
  };

  // Check content appropriateness for patient audiences
  const checkContentAppropriateness = async (
    content: string, 
    request: ContentPreviewRequest, 
    preview: PatientAppropriatePreview
  ) => {
    let appropriatenessScore = 100;
    
    // Check for age-appropriate content
    const ageInappropriate = [
      'graphic details', 'explicit', 'disturbing images', 'traumatic'
    ];
    
    ageInappropriate.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        preview.contentWarnings.push({
          type: 'age_appropriateness',
          severity: 'warning',
          description: 'Content may not be appropriate for all ages',
          foundText: term,
          suggestion: 'Consider age-appropriate language and content warnings'
        });
        appropriatenessScore -= 15;
      }
    });
    
    // Check cultural sensitivity
    const culturallyInsensitive = [
      'exotic', 'primitive', 'backwards', 'civilized', 'normal families'
    ];
    
    culturallyInsensitive.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        preview.contentWarnings.push({
          type: 'cultural_sensitivity',
          severity: 'warning',
          description: 'Content may not be culturally sensitive',
          foundText: term,
          suggestion: 'Use inclusive, culturally sensitive language'
        });
        appropriatenessScore -= 20;
      }
    });

    preview.appropriatenessScore = Math.max(0, appropriatenessScore);
  };

  // Identify patient safety flags
  const identifyPatientSafetyFlags = async (content: string, preview: PatientAppropriatePreview) => {
    const contentLower = content.toLowerCase();
    
    // Check for diagnostic advice
    const diagnosticTriggers = [
      'you have', 'you might have', 'sounds like', 'probably have',
      'definitely', 'diagnosis is', 'you are suffering from'
    ];
    
    diagnosticTriggers.forEach(trigger => {
      if (contentLower.includes(trigger)) {
        preview.patientSafetyFlags.push({
          type: 'diagnostic_advice',
          risk: 'high',
          description: 'Content appears to provide diagnostic advice',
          foundText: trigger,
          requiredDisclaimer: 'This information is not a diagnosis. Consult a healthcare professional for proper assessment.',
          ahpraImplication: 'Providing diagnoses without proper consultation violates professional standards'
        });
      }
    });
    
    // Check for treatment recommendations
    const treatmentTriggers = [
      'you should take', 'I recommend', 'best treatment is',
      'try this', 'stop taking', 'increase dosage'
    ];
    
    treatmentTriggers.forEach(trigger => {
      if (contentLower.includes(trigger)) {
        preview.patientSafetyFlags.push({
          type: 'treatment_recommendation',
          risk: 'high',
          description: 'Content provides specific treatment recommendations',
          foundText: trigger,
          requiredDisclaimer: 'This is general information only. Treatment decisions should always be made in consultation with a qualified healthcare professional.',
          ahpraImplication: 'Treatment recommendations without proper assessment may breach duty of care'
        });
      }
    });
    
    // Check for emergency situation advice
    const emergencyTriggers = [
      'emergency', 'call ambulance', 'life threatening', 'urgent care',
      'immediately seek', 'rush to hospital'
    ];
    
    emergencyTriggers.forEach(trigger => {
      if (contentLower.includes(trigger)) {
        preview.patientSafetyFlags.push({
          type: 'emergency_situation',
          risk: 'critical',
          description: 'Content addresses emergency medical situations',
          foundText: trigger,
          requiredDisclaimer: 'In medical emergencies, call 000 immediately. This information is not a substitute for emergency medical care.',
          ahpraImplication: 'Emergency medical advice requires immediate professional intervention'
        });
      }
    });
  };

  // Generate patient-safe preview content
  const generatePreviewContent = async (
    content: string, 
    request: ContentPreviewRequest, 
    preview: PatientAppropriatePreview
  ) => {
    // Extract title (first sentence or first 60 characters)
    const firstSentence = content.split(/[.!?]/)[0];
    preview.previewContent.title = firstSentence.slice(0, 60) + (firstSentence.length > 60 ? '...' : '');
    
    // Generate summary (first 150 characters of content)
    preview.previewContent.summary = content.slice(0, 150) + (content.length > 150 ? '...' : '');
    
    // Extract key points (sentences with educational value)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    preview.previewContent.keyPoints = sentences.slice(0, 3).map(s => s.trim());
    
    // Generate appropriate call to action
    preview.previewContent.callToAction = generatePatientSafeCallToAction(request.specialty);
    
    // Generate required disclaimers
    preview.previewContent.disclaimers = generateRequiredDisclaimers(preview, request.specialty);
  };

  // Calculate overall preview scores
  const calculatePreviewScores = (preview: PatientAppropriatePreview) => {
    preview.overallScore = Math.round(
      (preview.professionalBoundariesScore * 0.4) +
      (preview.readabilityScore * 0.3) +
      (preview.appropriatenessScore * 0.3)
    );
    
    preview.isPatientAppropriate = 
      preview.overallScore >= 70 &&
      !preview.patientSafetyFlags.some(flag => flag.risk === 'critical') &&
      !preview.boundaryChecks.some(check => check.severity === 'critical');
  };

  // Generate patient safety recommendations
  const generatePatientSafetyRecommendations = (preview: PatientAppropriatePreview) => {
    const recommendations: string[] = [];
    
    if (preview.patientSafetyFlags.length > 0) {
      recommendations.push('Add appropriate medical disclaimers for patient safety');
    }
    
    if (preview.boundaryChecks.some(check => check.severity === 'critical')) {
      recommendations.push('Review content for AHPRA professional boundary compliance');
    }
    
    if (preview.readabilityScore < 70) {
      recommendations.push('Simplify language for better patient understanding');
    }
    
    if (preview.appropriatenessScore < 70) {
      recommendations.push('Review content for cultural sensitivity and age appropriateness');
    }
    
    if (preview.overallScore < 70) {
      recommendations.push('Content requires significant revision before patient publication');
    }
    
    preview.recommendations = recommendations;
  };

  return {
    // State
    isGeneratingPreview,
    previewResults,
    boundaryRules,
    
    // Actions
    generatePatientAppropriatePreview,
    
    // Utilities
    getProfessionalBoundaryRules: () => professionalBoundaryRules
  };
}

// Helper functions

function generatePatientSafeCallToAction(specialty: string): string {
  const callToActions = {
    gp: 'Book an appointment with your GP to discuss your individual health needs.',
    psychology: 'Contact a qualified psychologist for professional mental health support.',
    allied_health: 'Consult with an allied health professional for personalized treatment advice.',
    specialist: 'Ask your GP for a referral to discuss this with a specialist.',
    dentistry: 'Schedule a dental consultation for personalized oral health advice.',
    nursing: 'Speak with a healthcare professional for guidance specific to your situation.'
  };
  
  return callToActions[specialty] || callToActions.gp;
}

function generateRequiredDisclaimers(preview: PatientAppropriatePreview, specialty: string): string[] {
  const disclaimers: string[] = [];
  
  // Base medical disclaimer
  disclaimers.push('This information is general in nature and should not replace professional medical advice.');
  
  // Safety-specific disclaimers
  if (preview.patientSafetyFlags.some(flag => flag.type === 'emergency_situation')) {
    disclaimers.push('In medical emergencies, call 000 immediately.');
  }
  
  if (preview.patientSafetyFlags.some(flag => flag.type === 'diagnostic_advice')) {
    disclaimers.push('This information is not a diagnosis. Professional assessment is required.');
  }
  
  if (preview.patientSafetyFlags.some(flag => flag.type === 'treatment_recommendation')) {
    disclaimers.push('Treatment decisions should always be made in consultation with qualified healthcare professionals.');
  }
  
  // Specialty-specific disclaimers
  const specialtyDisclaimers = {
    psychology: 'If you are experiencing mental health concerns, please seek professional help.',
    specialist: 'This information should not replace specialist medical consultation.',
    allied_health: 'Individual treatment plans should be developed with your healthcare provider.'
  };
  
  if (specialtyDisclaimers[specialty]) {
    disclaimers.push(specialtyDisclaimers[specialty]);
  }
  
  return disclaimers;
}

async function storePreviewAudit(
  request: ContentPreviewRequest,
  preview: PatientAppropriatePreview
) {
  try {
    await supabase
      .from('patient_content_preview_audit')
      .insert([{
        content_hash: btoa(request.content).slice(0, 50),
        content_type: request.contentType,
        specialty: request.specialty,
        target_audience: request.targetAudience,
        platform: request.platform,
        preview_result: preview,
        is_patient_appropriate: preview.isPatientAppropriate,
        overall_score: preview.overallScore,
        boundary_violations: preview.boundaryChecks.length,
        safety_flags: preview.patientSafetyFlags.length,
        generated_at: new Date().toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);
  } catch (error) {
    console.error('Error storing preview audit:', error);
  }
} 