import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAHPRACompliance } from './useAHPRACompliance';

interface HealthcareSpecialtyFormat {
  specialty: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry' | 'nursing';
  contentStyle: 'educational' | 'promotional' | 'awareness' | 'referral';
  patientAudience: 'general' | 'chronic_condition' | 'preventive' | 'acute_care';
  professionalTone: 'formal' | 'conversational' | 'empathetic' | 'authoritative';
}

interface ContentGenerationRequest {
  topic: string;
  contentType: 'blog_post' | 'social_media' | 'newsletter' | 'patient_education' | 'website_content';
  specialty: HealthcareSpecialtyFormat['specialty'];
  wordCount: number;
  includeDisclaimer: boolean;
  targetPlatform?: 'facebook' | 'instagram' | 'linkedin' | 'website' | 'email';
  practiceSpecifics?: {
    practiceName: string;
    ahpraNumber: string;
    specialtyArea: string;
    location: string;
  };
}

interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  specialtyFormatted: boolean;
  ahpraCompliant: boolean;
  tgaCompliant: boolean;
  disclaimer: string;
  hashtags: string[];
  professionalTone: string;
  complianceScore: number;
  suggestedImprovements: string[];
  generatedAt: string;
  contentMetadata: {
    wordCount: number;
    readabilityScore: number;
    professionalLanguageScore: number;
    patientAppropriateScore: number;
  };
}

interface HealthcarePromptTemplate {
  specialty: string;
  contentType: string;
  promptStructure: string;
  complianceInstructions: string[];
  toneGuidelines: string;
  specialtySpecificRequirements: string[];
}

export function useAHPRACompliantContentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GeneratedContent[]>([]);
  const { validateContent, getComplianceScore } = useAHPRACompliance();

  // Healthcare specialty prompt templates
  const healthcarePromptTemplates: HealthcarePromptTemplate[] = [
    {
      specialty: 'gp',
      contentType: 'patient_education',
      promptStructure: `Create patient education content for a General Practice setting that:
        - Uses clear, accessible language appropriate for general public
        - Focuses on evidence-based health information
        - Encourages patients to seek professional medical advice
        - Maintains appropriate professional boundaries
        - Includes preventive health messaging where relevant`,
      complianceInstructions: [
        'Do not make therapeutic claims without evidence',
        'Include disclaimer about seeking professional medical advice',
        'Avoid patient testimonials or success stories',
        'Use person-first language',
        'Maintain professional doctor-patient boundaries'
      ],
      toneGuidelines: 'Professional yet approachable, educational, empathetic',
      specialtySpecificRequirements: [
        'Focus on whole-person health approach',
        'Include preventive care messaging',
        'Reference Medicare items where appropriate',
        'Mention the importance of regular health checks'
      ]
    },
    {
      specialty: 'allied_health',
      contentType: 'patient_education',
      promptStructure: `Create allied health content that:
        - Explains treatment approaches clearly and simply
        - Emphasizes patient participation in recovery
        - Provides realistic expectations about outcomes
        - Encourages compliance with treatment plans
        - Supports patient self-management where appropriate`,
      complianceInstructions: [
        'Avoid guaranteeing treatment outcomes',
        'Include realistic recovery timeframes',
        'Emphasize importance of professional assessment',
        'Reference evidence-based treatment approaches',
        'Maintain scope of practice boundaries'
      ],
      toneGuidelines: 'Encouraging, supportive, professional, solution-focused',
      specialtySpecificRequirements: [
        'Include information about treatment duration',
        'Mention importance of home exercise compliance',
        'Reference multidisciplinary care approaches',
        'Highlight patient education and self-management'
      ]
    },
    {
      specialty: 'psychology',
      contentType: 'mental_health_education',
      promptStructure: `Create mental health education content that:
        - Reduces stigma around mental health seeking help
        - Provides accurate information about mental health conditions
        - Encourages professional help-seeking when appropriate
        - Respects cultural and individual differences
        - Promotes mental health literacy and self-care`,
      complianceInstructions: [
        'Avoid diagnostic language or self-diagnosis encouragement',
        'Include crisis support information where appropriate',
        'Emphasize importance of professional assessment',
        'Respect cultural considerations in mental health',
        'Include content warnings for sensitive topics'
      ],
      toneGuidelines: 'Empathetic, non-judgmental, hopeful, validating',
      specialtySpecificRequirements: [
        'Include mental health first aid information',
        'Reference Medicare mental health plans',
        'Mention importance of therapeutic relationship',
        'Address common myths about mental health treatment'
      ]
    },
    {
      specialty: 'specialist',
      contentType: 'specialist_education',
      promptStructure: `Create specialist healthcare content that:
        - Provides detailed condition-specific information
        - Explains complex medical procedures clearly
        - Prepares patients for specialist consultations
        - Clarifies referral processes and expectations
        - Supports informed consent and decision-making`,
      complianceInstructions: [
        'Use evidence-based medical information only',
        'Include appropriate medical disclaimers',
        'Reference peer-reviewed research where applicable',
        'Maintain specialist scope of practice',
        'Include risks and benefits of treatments'
      ],
      toneGuidelines: 'Authoritative, detailed, professional, reassuring',
      specialtySpecificRequirements: [
        'Include information about specialist consultation process',
        'Explain common procedures and investigations',
        'Reference specialist medical organisations',
        'Mention multidisciplinary team approaches'
      ]
    }
  ];

  // Generate AHPRA-compliant content
  const generateCompliantContent = useCallback(async (request: ContentGenerationRequest) => {
    setIsGenerating(true);
    
    try {
      // Get appropriate prompt template
      const promptTemplate = getPromptTemplate(request.specialty, request.contentType);
      
      // Build AHPRA-compliant prompt
      const compliantPrompt = buildCompliantPrompt(request, promptTemplate);
      
      // Generate content using OpenAI with healthcare-specific instructions
      const response = await fetch('/api/generate-healthcare-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: compliantPrompt,
          specialty: request.specialty,
          contentType: request.contentType,
          maxTokens: calculateTokens(request.wordCount),
          temperature: 0.3, // Lower temperature for consistent, professional content
          complianceMode: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const generatedText = await response.json();
      
      // Apply healthcare specialty formatting
      const formattedContent = applySpecialtyFormatting(
        generatedText.content,
        request.specialty,
        request.contentType
      );
      
      // Validate AHPRA compliance
      const complianceValidation = await validateContent(
        formattedContent,
        request.specialty,
        request.contentType
      );
      
      // Generate appropriate disclaimer
      const disclaimer = generateHealthcareDisclaimer(
        request.specialty,
        request.contentType,
        request.practiceSpecifics
      );
      
      // Generate healthcare-appropriate hashtags
      const hashtags = generateHealthcareHashtags(
        request.topic,
        request.specialty,
        request.targetPlatform
      );
      
      // Create final content object
      const finalContent: GeneratedContent = {
        id: `content_${Date.now()}`,
        title: generateTitle(request.topic, request.specialty),
        content: formattedContent,
        specialtyFormatted: true,
        ahpraCompliant: complianceValidation.isCompliant,
        tgaCompliant: complianceValidation.tgaCompliant,
        disclaimer,
        hashtags,
        professionalTone: promptTemplate.toneGuidelines,
        complianceScore: complianceValidation.score,
        suggestedImprovements: complianceValidation.suggestions,
        generatedAt: new Date().toISOString(),
        contentMetadata: {
          wordCount: formattedContent.split(' ').length,
          readabilityScore: calculateReadabilityScore(formattedContent),
          professionalLanguageScore: calculateProfessionalScore(formattedContent),
          patientAppropriateScore: calculatePatientAppropriateScore(formattedContent, request.specialty)
        }
      };
      
      // Store content for compliance audit
      await storeGeneratedContent(finalContent, request);
      
      setGeneratedContent(finalContent);
      setGenerationHistory(prev => [finalContent, ...prev.slice(0, 9)]); // Keep last 10
      
      return { success: true, content: finalContent };
    } catch (error) {
      console.error('Error generating AHPRA-compliant content:', error);
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  }, [validateContent]);

  // Get content variations for A/B testing
  const generateContentVariations = useCallback(async (
    baseRequest: ContentGenerationRequest,
    variationCount: number = 3
  ) => {
    const variations: GeneratedContent[] = [];
    
    for (let i = 0; i < variationCount; i++) {
      const variationRequest = {
        ...baseRequest,
        contentStyle: getVariationStyle(i),
        professionalTone: getVariationTone(i)
      };
      
      const result = await generateCompliantContent(variationRequest);
      if (result.success && result.content) {
        variations.push(result.content);
      }
    }
    
    return variations;
  }, [generateCompliantContent]);

  // Regenerate with improvements
  const regenerateWithImprovements = useCallback(async (
    originalContent: GeneratedContent,
    improvements: string[]
  ) => {
    const enhancedRequest = {
      topic: originalContent.title,
      contentType: 'blog_post' as const,
      specialty: 'gp' as const, // Would be passed from original request
      wordCount: originalContent.contentMetadata.wordCount,
      includeDisclaimer: true,
      improvements: improvements
    };
    
    return await generateCompliantContent(enhancedRequest);
  }, [generateCompliantContent]);

  return {
    // State
    isGenerating,
    generatedContent,
    generationHistory,
    
    // Actions
    generateCompliantContent,
    generateContentVariations,
    regenerateWithImprovements,
    
    // Utilities
    getAvailableTemplates: () => healthcarePromptTemplates,
    clearGenerationHistory: () => setGenerationHistory([])
  };
}

// Helper functions

function getPromptTemplate(specialty: string, contentType: string): HealthcarePromptTemplate {
  const template = healthcarePromptTemplates.find(
    t => t.specialty === specialty && 
    (t.contentType === contentType || t.contentType.includes(contentType))
  );
  
  return template || healthcarePromptTemplates[0]; // Default to GP template
}

function buildCompliantPrompt(
  request: ContentGenerationRequest,
  template: HealthcarePromptTemplate
): string {
  return `
You are an AHPRA-compliant healthcare content generator specializing in ${request.specialty} content.

TOPIC: ${request.topic}
CONTENT TYPE: ${request.contentType}
TARGET AUDIENCE: Healthcare consumers/patients
WORD COUNT: Approximately ${request.wordCount} words

HEALTHCARE SPECIALTY REQUIREMENTS:
${template.specialtySpecificRequirements.map(req => `- ${req}`).join('\n')}

PROMPT STRUCTURE:
${template.promptStructure}

COMPLIANCE INSTRUCTIONS (MANDATORY):
${template.complianceInstructions.map(instruction => `- ${instruction}`).join('\n')}

TONE GUIDELINES:
${template.toneGuidelines}

AHPRA ADVERTISING GUIDELINES:
- No patient testimonials or success stories
- No misleading or exaggerated claims
- Include appropriate disclaimers
- Maintain professional boundaries
- Use evidence-based information only
- Include AHPRA registration number if practice-specific

TGA THERAPEUTIC ADVERTISING REQUIREMENTS:
- No therapeutic claims without evidence
- No mention of specific drug brand names
- No guarantees of treatment outcomes
- Include appropriate risk information

Please generate content that strictly adheres to these guidelines while being engaging and informative for patients.
  `.trim();
}

function applySpecialtyFormatting(
  content: string,
  specialty: string,
  contentType: string
): string {
  // Apply specialty-specific formatting
  let formatted = content;
  
  // Add specialty-specific headers and structure
  switch (specialty) {
    case 'gp':
      formatted = addGPFormatting(formatted, contentType);
      break;
    case 'allied_health':
      formatted = addAlliedHealthFormatting(formatted, contentType);
      break;
    case 'psychology':
      formatted = addPsychologyFormatting(formatted, contentType);
      break;
    case 'specialist':
      formatted = addSpecialistFormatting(formatted, contentType);
      break;
  }
  
  return formatted;
}

function addGPFormatting(content: string, contentType: string): string {
  // Add GP-specific formatting like preventive care sections
  if (contentType === 'patient_education') {
    return `${content}\n\n**When to See Your GP:**\nIf you have concerns about your health, please book an appointment with your GP for professional medical advice tailored to your individual circumstances.`;
  }
  return content;
}

function addAlliedHealthFormatting(content: string, contentType: string): string {
  // Add allied health-specific formatting like treatment timelines
  if (contentType === 'patient_education') {
    return `${content}\n\n**Important Note:**\nTreatment outcomes vary between individuals. Your allied health practitioner will develop a treatment plan specific to your needs and circumstances.`;
  }
  return content;
}

function addPsychologyFormatting(content: string, contentType: string): string {
  // Add psychology-specific formatting like crisis resources
  return `${content}\n\n**Mental Health Support:**\nIf you need immediate support, contact Lifeline 13 11 14 or your local mental health crisis service.`;
}

function addSpecialistFormatting(content: string, contentType: string): string {
  // Add specialist-specific formatting like referral information
  if (contentType === 'patient_education') {
    return `${content}\n\n**Specialist Consultation:**\nThis information is general in nature. Your specialist will provide advice specific to your condition and circumstances.`;
  }
  return content;
}

function generateHealthcareDisclaimer(
  specialty: string,
  contentType: string,
  practiceSpecifics?: any
): string {
  const baseDisclaimer = "This information is general in nature and should not replace professional medical advice.";
  
  const specialtyDisclaimers = {
    gp: "Always consult with your GP for advice tailored to your individual health circumstances.",
    psychology: "If you're experiencing mental health concerns, please seek professional psychological or psychiatric assessment.",
    allied_health: "Treatment outcomes vary. Please consult with your allied health practitioner for personalised advice.",
    specialist: "This information should not replace specialist medical consultation and advice.",
    dentistry: "Dental treatment recommendations vary. Please consult with your dentist for personalised oral health advice."
  };
  
  let disclaimer = baseDisclaimer + " " + (specialtyDisclaimers[specialty] || specialtyDisclaimers.gp);
  
  if (practiceSpecifics?.ahpraNumber) {
    disclaimer += ` AHPRA Registration: ${practiceSpecifics.ahpraNumber}`;
  }
  
  return disclaimer;
}

function generateHealthcareHashtags(
  topic: string,
  specialty: string,
  platform?: string
): string[] {
  const baseHashtags = ['#HealthEducation', '#AustralianHealthcare', '#PatientCare'];
  
  const specialtyHashtags = {
    gp: ['#GeneralPractice', '#FamilyHealth', '#PreventiveCare', '#HealthyLiving'],
    psychology: ['#MentalHealth', '#MentalWellbeing', '#PsychologicalHealth', '#MentalHealthAwareness'],
    allied_health: ['#AlliedHealth', '#Rehabilitation', '#PhysicalTherapy', '#HealthRecovery'],
    specialist: ['#SpecialistCare', '#MedicalSpecialist', '#HealthcareExcellence'],
    dentistry: ['#OralHealth', '#DentalCare', '#DentalHealth', '#SmileHealth']
  };
  
  const platformHashtags = {
    instagram: ['#HealthTips', '#Wellness', '#HealthyAustralia'],
    facebook: ['#CommunityHealth', '#HealthAwareness'],
    linkedin: ['#HealthcareProfessional', '#MedicalEducation']
  };
  
  let hashtags = [
    ...baseHashtags,
    ...(specialtyHashtags[specialty] || []),
    ...(platform ? platformHashtags[platform] || [] : [])
  ];
  
  // Limit to 10 hashtags for optimal performance
  return hashtags.slice(0, 10);
}

function generateTitle(topic: string, specialty: string): string {
  const specialtyPrefixes = {
    gp: "Understanding",
    psychology: "Mental Health Guide:",
    allied_health: "Treatment Guide:",
    specialist: "Medical Information:",
    dentistry: "Oral Health:"
  };
  
  const prefix = specialtyPrefixes[specialty] || "Healthcare Information:";
  return `${prefix} ${topic}`;
}

function calculateTokens(wordCount: number): number {
  // Approximate tokens needed (1 token ≈ 0.75 words)
  return Math.ceil(wordCount / 0.75);
}

function calculateReadabilityScore(content: string): number {
  // Simplified readability calculation
  const sentences = content.split(/[.!?]+/).length;
  const words = content.split(/\s+/).length;
  const averageWordsPerSentence = words / sentences;
  
  // Ideal: 15-20 words per sentence for healthcare content
  if (averageWordsPerSentence >= 15 && averageWordsPerSentence <= 20) {
    return 9;
  } else if (averageWordsPerSentence >= 10 && averageWordsPerSentence <= 25) {
    return 7;
  } else {
    return 5;
  }
}

function calculateProfessionalScore(content: string): number {
  // Check for professional language indicators
  const professionalIndicators = [
    'evidence-based', 'research shows', 'studies indicate', 'clinical', 
    'healthcare professional', 'medical advice', 'consultation'
  ];
  
  const score = professionalIndicators.reduce((acc, indicator) => {
    return acc + (content.toLowerCase().includes(indicator) ? 1 : 0);
  }, 0);
  
  return Math.min(10, score + 5); // Base score of 5, up to 10
}

function calculatePatientAppropriateScore(content: string, specialty: string): number {
  // Check for patient-appropriate language
  const patientFriendlyIndicators = [
    'easy to understand', 'simple terms', 'what this means', 'for example',
    'you may experience', 'it\'s normal to', 'many people find'
  ];
  
  const score = patientFriendlyIndicators.reduce((acc, indicator) => {
    return acc + (content.toLowerCase().includes(indicator) ? 1 : 0);
  }, 0);
  
  return Math.min(10, score + 6); // Base score of 6, up to 10
}

async function storeGeneratedContent(content: GeneratedContent, request: ContentGenerationRequest) {
  try {
    await supabase
      .from('healthcare_generated_content_audit')
      .insert([{
        content_id: content.id,
        title: content.title,
        content_text: content.content,
        specialty: request.specialty,
        content_type: request.contentType,
        ahpra_compliant: content.ahpraCompliant,
        tga_compliant: content.tgaCompliant,
        compliance_score: content.complianceScore,
        generated_at: content.generatedAt,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);
  } catch (error) {
    console.error('Error storing generated content for audit:', error);
  }
}

function getVariationStyle(index: number): any {
  const styles = ['educational', 'conversational', 'empathetic'];
  return styles[index % styles.length];
}

function getVariationTone(index: number): any {
  const tones = ['formal', 'conversational', 'empathetic'];
  return tones[index % tones.length];
} 