import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PlatformLimits {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'website' | 'email';
  limits: {
    postText: number;
    postTitle?: number;
    hashtags: number;
    hashtagCharacters?: number;
    caption?: number;
    bio?: number;
    firstComment?: number;
    stories?: number;
  };
  healthcareOptimal: {
    postText: number;
    explanation: string;
    complianceNote: string;
  };
  specialConsiderations: string[];
}

interface ContentValidation {
  platform: string;
  isWithinLimits: boolean;
  characterCount: number;
  characterLimit: number;
  utilizationPercentage: number;
  healthcareOptimalRange: { min: number; max: number };
  isHealthcareOptimal: boolean;
  warnings: ContentWarning[];
  suggestions: ContentSuggestion[];
  truncatedContent?: string;
}

interface ContentWarning {
  type: 'approaching_limit' | 'exceeds_limit' | 'too_short' | 'disclaimer_space' | 'hashtag_limit';
  severity: 'info' | 'warning' | 'error';
  message: string;
  charactersOver?: number;
  recommendation: string;
}

interface ContentSuggestion {
  type: 'optimization' | 'healthcare_compliance' | 'engagement' | 'platform_specific';
  suggestion: string;
  expectedSavings?: number;
  priority: 'low' | 'medium' | 'high';
}

interface HealthcareContentStructure {
  introduction: number; // percentage
  mainContent: number;
  disclaimer: number;
  callToAction: number;
  hashtags: number;
}

export function usePlatformCharacterLimits() {
  const [platformLimits, setPlatformLimits] = useState<PlatformLimits[]>([]);
  const [validationResults, setValidationResults] = useState<ContentValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Platform-specific limits optimized for healthcare content
  const healthcarePlatformLimits: PlatformLimits[] = [
    {
      platform: 'facebook',
      limits: {
        postText: 63206, // Technical limit
        hashtags: 30,
        hashtagCharacters: 100
      },
      healthcareOptimal: {
        postText: 400,
        explanation: 'Facebook posts perform best at 400-500 characters for healthcare content',
        complianceNote: 'Allows space for AHPRA disclaimers and professional language'
      },
      specialConsiderations: [
        'Include medical disclaimer within first 400 characters',
        'Reserve 100 characters for hashtags and practice information',
        'Use line breaks for readability in health education content',
        'Facebook favors informative posts that generate discussion'
      ]
    },
    {
      platform: 'instagram',
      limits: {
        postText: 2200,
        caption: 2200,
        hashtags: 30,
        hashtagCharacters: 700,
        bio: 150,
        stories: 2200
      },
      healthcareOptimal: {
        postText: 300,
        explanation: 'Instagram healthcare posts work best at 300-400 characters with visual focus',
        complianceNote: 'Short, engaging text with detailed compliance info in first comment'
      },
      specialConsiderations: [
        'Use first comment for detailed medical disclaimers',
        'Keep main post concise and visually appealing',
        'Healthcare hashtags should be front-loaded in caption',
        'Stories allow for longer educational content with disclaimer overlays'
      ]
    },
    {
      platform: 'linkedin',
      limits: {
        postText: 1300,
        postTitle: 150,
        hashtags: 5,
        hashtagCharacters: 100
      },
      healthcareOptimal: {
        postText: 800,
        explanation: 'LinkedIn healthcare content performs well with detailed, professional posts',
        complianceNote: 'Professional audience allows for more detailed medical information'
      },
      specialConsiderations: [
        'Professional audience expects detailed, evidence-based content',
        'Include AHPRA registration number for credibility',
        'Use professional healthcare hashtags (#HealthcareProfessional)',
        'Longer posts acceptable for educational medical content'
      ]
    },
    {
      platform: 'twitter',
      limits: {
        postText: 280,
        hashtags: 10,
        hashtagCharacters: 50
      },
      healthcareOptimal: {
        postText: 220,
        explanation: 'Twitter requires concise healthcare messages with link to detailed content',
        complianceNote: 'Limited space requires careful AHPRA compliance consideration'
      },
      specialConsiderations: [
        'Use thread format for complex healthcare topics',
        'Include disclaimer link in bio or thread',
        'Focus on one key health message per tweet',
        'Use Twitter for health awareness, not detailed medical advice'
      ]
    },
    {
      platform: 'tiktok',
      limits: {
        postText: 2200,
        caption: 2200,
        hashtags: 20,
        hashtagCharacters: 300
      },
      healthcareOptimal: {
        postText: 200,
        explanation: 'TikTok healthcare content should be brief with video carrying main message',
        complianceNote: 'Video content must include visual disclaimers for AHPRA compliance'
      },
      specialConsiderations: [
        'Video content requires visual disclaimer overlays',
        'Brief, engaging captions that complement video',
        'Healthcare content must be age-appropriate',
        'Use trending healthcare hashtags for visibility'
      ]
    },
    {
      platform: 'website',
      limits: {
        postText: 50000, // Essentially unlimited
        postTitle: 60,
        bio: 500
      },
      healthcareOptimal: {
        postText: 1200,
        explanation: 'Website content can be comprehensive with full medical disclaimers',
        complianceNote: 'Ideal platform for complete AHPRA and TGA compliance information'
      },
      specialConsiderations: [
        'Include full medical disclaimers and AHPRA registration',
        'Structure content with clear headings for readability',
        'SEO optimization important for healthcare content discovery',
        'Can include comprehensive patient education information'
      ]
    },
    {
      platform: 'email',
      limits: {
        postText: 20000,
        postTitle: 50
      },
      healthcareOptimal: {
        postText: 800,
        explanation: 'Email newsletters should be comprehensive but scannable',
        complianceNote: 'Direct patient communication requires careful compliance consideration'
      },
      specialConsiderations: [
        'Subject line must be clear and non-promotional',
        'Include unsubscribe and practice contact information',
        'Segment content for different patient groups',
        'Ensure content is mobile-responsive for health information access'
      ]
    }
  ];

  // Healthcare content structure recommendations
  const healthcareContentStructures: Record<string, HealthcareContentStructure> = {
    facebook: { introduction: 15, mainContent: 60, disclaimer: 15, callToAction: 5, hashtags: 5 },
    instagram: { introduction: 20, mainContent: 50, disclaimer: 10, callToAction: 10, hashtags: 10 },
    linkedin: { introduction: 10, mainContent: 70, disclaimer: 10, callToAction: 5, hashtags: 5 },
    twitter: { introduction: 10, mainContent: 70, disclaimer: 0, callToAction: 20, hashtags: 0 },
    tiktok: { introduction: 25, mainContent: 50, disclaimer: 5, callToAction: 15, hashtags: 5 },
    website: { introduction: 5, mainContent: 80, disclaimer: 10, callToAction: 3, hashtags: 2 },
    email: { introduction: 10, mainContent: 75, disclaimer: 10, callToAction: 5, hashtags: 0 }
  };

  // Validate content against platform limits
  const validateContent = useCallback(async (
    content: string, 
    platform: string, 
    hashtags: string[] = []
  ): Promise<ContentValidation> => {
    setIsValidating(true);
    
    try {
      const platformLimit = healthcarePlatformLimits.find(p => p.platform === platform);
      if (!platformLimit) {
        throw new Error(`Platform ${platform} not supported`);
      }

      const characterCount = content.length;
      const characterLimit = platformLimit.limits.postText;
      const hashtagCharacters = hashtags.join(' ').length;
      const utilizationPercentage = Math.round((characterCount / characterLimit) * 100);
      
      const healthcareOptimalRange = {
        min: Math.round(platformLimit.healthcareOptimal.postText * 0.8),
        max: platformLimit.healthcareOptimal.postText
      };
      
      const isWithinLimits = characterCount <= characterLimit;
      const isHealthcareOptimal = characterCount >= healthcareOptimalRange.min && 
                                  characterCount <= healthcareOptimalRange.max;

      // Generate warnings
      const warnings: ContentWarning[] = [];
      
      if (characterCount > characterLimit) {
        warnings.push({
          type: 'exceeds_limit',
          severity: 'error',
          message: `Content exceeds ${platform} limit by ${characterCount - characterLimit} characters`,
          charactersOver: characterCount - characterLimit,
          recommendation: 'Shorten content or split into multiple posts with proper medical disclaimers'
        });
      } else if (characterCount > characterLimit * 0.9) {
        warnings.push({
          type: 'approaching_limit',
          severity: 'warning',
          message: `Approaching ${platform} character limit`,
          recommendation: 'Consider leaving space for medical disclaimers and hashtags'
        });
      }
      
      if (characterCount < healthcareOptimalRange.min) {
        warnings.push({
          type: 'too_short',
          severity: 'info',
          message: `Content may be too brief for effective healthcare communication on ${platform}`,
          recommendation: 'Consider adding educational context or patient-friendly explanations'
        });
      }
      
      // Check hashtag limits
      if (hashtags.length > platformLimit.limits.hashtags) {
        warnings.push({
          type: 'hashtag_limit',
          severity: 'warning',
          message: `Too many hashtags for ${platform} (${hashtags.length}/${platformLimit.limits.hashtags})`,
          recommendation: `Reduce to ${platformLimit.limits.hashtags} most relevant healthcare hashtags`
        });
      }
      
      // Check disclaimer space
      if (!content.toLowerCase().includes('disclaimer') && 
          !content.toLowerCase().includes('medical advice') &&
          characterCount > healthcareOptimalRange.max * 0.8) {
        warnings.push({
          type: 'disclaimer_space',
          severity: 'warning',
          message: 'No medical disclaimer detected in content',
          recommendation: 'Ensure space is reserved for required AHPRA medical disclaimers'
        });
      }

      // Generate suggestions
      const suggestions = generateHealthcareContentSuggestions(
        content, 
        platform, 
        characterCount, 
        platformLimit
      );

      // Generate truncated content if needed
      let truncatedContent: string | undefined;
      if (characterCount > characterLimit) {
        truncatedContent = generateHealthcareTruncatedContent(
          content, 
          characterLimit, 
          platform
        );
      }

      const validation: ContentValidation = {
        platform,
        isWithinLimits,
        characterCount,
        characterLimit,
        utilizationPercentage,
        healthcareOptimalRange,
        isHealthcareOptimal,
        warnings,
        suggestions,
        truncatedContent
      };

      setValidationResults(prev => [validation, ...prev.slice(0, 9)]); // Keep last 10
      
      return validation;
    } catch (error) {
      console.error('Error validating content:', error);
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Get platform-specific recommendations
  const getPlatformRecommendations = useCallback((platform: string) => {
    const platformLimit = healthcarePlatformLimits.find(p => p.platform === platform);
    return platformLimit || null;
  }, []);

  // Optimize content for specific platform
  const optimizeForPlatform = useCallback(async (
    content: string, 
    targetPlatform: string,
    includeHashtags: boolean = true
  ) => {
    const platformLimit = healthcarePlatformLimits.find(p => p.platform === targetPlatform);
    if (!platformLimit) {
      throw new Error(`Platform ${targetPlatform} not supported`);
    }

    const targetLength = platformLimit.healthcareOptimal.postText;
    const structure = healthcareContentStructures[targetPlatform];
    
    let optimizedContent = content;
    
    // If content is too long, intelligent truncation
    if (content.length > targetLength) {
      optimizedContent = await intelligentHealthcareTruncation(
        content, 
        targetLength, 
        structure
      );
    }
    
    // Add platform-specific healthcare formatting
    optimizedContent = addPlatformHealthcareFormatting(
      optimizedContent, 
      targetPlatform
    );
    
    return {
      originalLength: content.length,
      optimizedLength: optimizedContent.length,
      optimizedContent,
      platformOptimal: optimizedContent.length <= platformLimit.healthcareOptimal.postText,
      savings: content.length - optimizedContent.length
    };
  }, []);

  // Load platform limits
  useEffect(() => {
    setPlatformLimits(healthcarePlatformLimits);
  }, []);

  return {
    // State
    platformLimits,
    validationResults,
    isValidating,
    
    // Actions
    validateContent,
    getPlatformRecommendations,
    optimizeForPlatform,
    
    // Utilities
    getHealthcareContentStructure: (platform: string) => healthcareContentStructures[platform],
    getAllPlatforms: () => healthcarePlatformLimits.map(p => p.platform),
    getCharacterCount: (text: string) => text.length,
    getWordCount: (text: string) => text.trim().split(/\s+/).length
  };
}

// Helper functions

function generateHealthcareContentSuggestions(
  content: string, 
  platform: string, 
  characterCount: number,
  platformLimit: PlatformLimits
): ContentSuggestion[] {
  const suggestions: ContentSuggestion[] = [];
  
  if (characterCount > platformLimit.healthcareOptimal.postText) {
    suggestions.push({
      type: 'optimization',
      suggestion: 'Consider splitting into multiple posts or moving detailed information to comments/bio',
      expectedSavings: characterCount - platformLimit.healthcareOptimal.postText,
      priority: 'high'
    });
  }
  
  if (!content.toLowerCase().includes('disclaimer')) {
    suggestions.push({
      type: 'healthcare_compliance',
      suggestion: 'Add appropriate medical disclaimer for AHPRA compliance',
      priority: 'high'
    });
  }
  
  if (platform === 'instagram' && characterCount > 300) {
    suggestions.push({
      type: 'platform_specific',
      suggestion: 'Move detailed information to first comment for better Instagram engagement',
      priority: 'medium'
    });
  }
  
  if (platform === 'linkedin' && characterCount < 400) {
    suggestions.push({
      type: 'engagement',
      suggestion: 'LinkedIn healthcare content can be more detailed - consider expanding with evidence or examples',
      priority: 'low'
    });
  }
  
  return suggestions;
}

function generateHealthcareTruncatedContent(
  content: string, 
  limit: number, 
  platform: string
): string {
  // Reserve space for disclaimer and hashtags
  const reserveSpace = platform === 'twitter' ? 50 : 100;
  const availableSpace = limit - reserveSpace;
  
  if (content.length <= availableSpace) {
    return content;
  }
  
  // Intelligent truncation - try to keep complete sentences
  const sentences = content.split(/[.!?]+/);
  let truncated = '';
  
  for (const sentence of sentences) {
    if ((truncated + sentence).length <= availableSpace) {
      truncated += sentence + '.';
    } else {
      break;
    }
  }
  
  // If no complete sentences fit, truncate at word boundary
  if (!truncated.trim()) {
    const words = content.split(' ');
    truncated = words.slice(0, Math.floor(words.length * 0.7)).join(' ');
    if (truncated.length > availableSpace) {
      truncated = content.substring(0, availableSpace - 3) + '...';
    }
  }
  
  // Add appropriate continuation indicator
  if (platform === 'twitter') {
    truncated += ' (1/2)';
  } else {
    truncated += ' [Read more...]';
  }
  
  return truncated;
}

async function intelligentHealthcareTruncation(
  content: string, 
  targetLength: number, 
  structure: HealthcareContentStructure
): Promise<string> {
  // This would integrate with AI to intelligently summarize while preserving medical accuracy
  // For now, we'll do rule-based truncation
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Prioritize: Introduction -> Main Content -> Call to Action -> Disclaimer
  const totalSentences = sentences.length;
  const keepSentences = Math.floor(totalSentences * (targetLength / content.length));
  
  const selectedSentences = sentences.slice(0, Math.max(1, keepSentences));
  
  let result = selectedSentences.join('. ') + '.';
  
  // Ensure we have space for disclaimer
  if (!result.toLowerCase().includes('disclaimer')) {
    result += ' Please consult your healthcare professional for personalized advice.';
  }
  
  return result;
}

function addPlatformHealthcareFormatting(
  content: string, 
  platform: string
): string {
  switch (platform) {
    case 'instagram':
      // Add line breaks for readability
      return content.replace(/\. /g, '.\n\n');
    
    case 'linkedin':
      // Professional formatting with clear sections
      return content.replace(/\. /g, '.\n\n');
    
    case 'facebook':
      // Readable paragraphs
      return content.replace(/(\. .{50,}?\. )/g, '$1\n\n');
    
    case 'twitter':
      // Concise, no extra formatting needed
      return content;
    
    default:
      return content;
  }
} 