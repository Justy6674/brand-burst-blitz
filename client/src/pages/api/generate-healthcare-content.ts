import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ContentGenerationRequest {
  prompt: string;
  specialty: string;
  contentType: string;
  maxTokens: number;
  temperature: number;
  complianceMode: boolean;
}

interface ContentGenerationResponse {
  success: boolean;
  content?: string;
  complianceScore?: number;
  warnings?: string[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContentGenerationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      prompt,
      specialty,
      contentType,
      maxTokens = 800,
      temperature = 0.3,
      complianceMode = true
    }: ContentGenerationRequest = req.body;

    if (!prompt || !specialty || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prompt, specialty, contentType'
      });
    }

    // Enhance prompt with AHPRA compliance instructions
    const enhancedPrompt = buildAHPRACompliantPrompt(prompt, specialty, contentType);

    // Generate content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(specialty, complianceMode)
        },
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      frequency_penalty: 0.3, // Reduce repetition
      presence_penalty: 0.2   // Encourage diverse content
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate content'
      });
    }

    // Perform post-generation compliance check
    const complianceCheck = performComplianceCheck(generatedContent, specialty);

    // Apply healthcare-specific formatting
    const formattedContent = applyHealthcareFormatting(generatedContent, specialty, contentType);

    res.status(200).json({
      success: true,
      content: formattedContent,
      complianceScore: complianceCheck.score,
      warnings: complianceCheck.warnings
    });

  } catch (error) {
    console.error('Error generating healthcare content:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during content generation'
    });
  }
}

function getSystemPrompt(specialty: string, complianceMode: boolean): string {
  const basePrompt = `You are an expert healthcare content writer specializing in Australian healthcare communications. You have deep knowledge of AHPRA (Australian Health Practitioner Regulation Agency) advertising guidelines and TGA (Therapeutic Goods Administration) regulations.`;

  const compliancePrompt = complianceMode ? `
  
CRITICAL COMPLIANCE REQUIREMENTS:

AHPRA ADVERTISING GUIDELINES:
- NEVER include patient testimonials, reviews, or success stories
- NEVER make comparative claims (best, top, leading, number one)
- NEVER guarantee outcomes or use words like "cure", "miracle", "100% effective"
- NEVER use exaggerated claims like "painless", "risk-free", "completely safe"
- ALWAYS maintain professional boundaries between practitioner and patient
- ALWAYS include appropriate disclaimers about seeking professional medical advice
- ALWAYS use evidence-based information only

TGA THERAPEUTIC ADVERTISING:
- NEVER mention specific drug brand names (Botox, Dysport, Juvederm, Restylane, etc.)
- NEVER mention generic drug names in promotional context
- NEVER make therapeutic claims without proper evidence
- NEVER guarantee medical device outcomes
- ALWAYS include appropriate risk information for medical procedures

PROFESSIONAL STANDARDS:
- Use person-first language (person with diabetes, not diabetic person)
- Maintain respectful, empathetic tone throughout
- Focus on patient education and empowerment
- Encourage professional consultation for individual circumstances
- Include cultural sensitivity considerations
- Use Australian English spelling and terminology
` : '';

  const specialtyPrompt = getSpecialtySystemPrompt(specialty);

  return basePrompt + compliancePrompt + specialtyPrompt;
}

function getSpecialtySystemPrompt(specialty: string): string {
  const specialtyPrompts = {
    gp: `
    
GENERAL PRACTICE SPECIALIZATION:
- Focus on whole-person health and preventive care
- Emphasize the importance of regular health checks and screenings
- Include information about Medicare services where appropriate
- Address common health concerns across all age groups
- Promote health literacy and patient empowerment
- Reference the importance of ongoing doctor-patient relationships`,

    psychology: `
    
PSYCHOLOGY SPECIALIZATION:
- Focus on mental health literacy and reducing stigma
- Emphasize the importance of professional psychological assessment
- Include crisis support information (Lifeline 13 11 14) where appropriate
- Address common mental health misconceptions
- Promote help-seeking behavior and therapeutic relationships
- Reference Medicare mental health plans and psychological services
- Use trauma-informed and culturally sensitive language`,

    allied_health: `
    
ALLIED HEALTH SPECIALIZATION:
- Focus on rehabilitation and functional improvement
- Emphasize patient participation in treatment and recovery
- Include realistic timeframes for treatment outcomes
- Promote adherence to treatment plans and home exercise programs
- Reference multidisciplinary care approaches
- Address the importance of early intervention and prevention`,

    specialist: `
    
SPECIALIST HEALTHCARE:
- Provide detailed, evidence-based medical information
- Explain complex medical procedures in accessible language
- Prepare patients for specialist consultations and procedures
- Include information about referral processes
- Reference specialist medical organizations and guidelines
- Balance technical accuracy with patient understanding`,

    dentistry: `
    
DENTAL HEALTHCARE:
- Focus on oral health education and prevention
- Emphasize the connection between oral and overall health
- Include information about regular dental check-ups and cleanings
- Address common dental concerns and treatments
- Promote good oral hygiene practices
- Reference Australian dental health guidelines`
  };

  return specialtyPrompts[specialty] || specialtyPrompts.gp;
}

function buildAHPRACompliantPrompt(prompt: string, specialty: string, contentType: string): string {
  const disclaimerInstructions = `
  
Please ensure the content includes an appropriate medical disclaimer that advises readers to consult with their healthcare professional for personalized medical advice.`;

  const formatInstructions = getFormatInstructions(contentType);

  return `${prompt}

Content Type: ${contentType}
Healthcare Specialty: ${specialty}

${formatInstructions}${disclaimerInstructions}

Remember to follow all AHPRA and TGA compliance requirements while creating engaging, educational content that empowers patients and promotes health literacy.`;
}

function getFormatInstructions(contentType: string): string {
  const formatInstructions = {
    blog_post: `
Format as a well-structured blog post with:
- Engaging title
- Clear introduction that sets context
- Well-organized sections with subheadings
- Conclusion that summarizes key points
- Call-to-action encouraging professional consultation`,

    social_media: `
Format for social media with:
- Engaging opening that captures attention
- Concise, scannable content
- Clear key takeaways
- Appropriate tone for social media engagement
- Include space for relevant hashtags`,

    patient_education: `
Format as patient education material with:
- Clear, accessible language
- Logical flow of information
- Key points highlighted
- Practical takeaways for patients
- Resources for further information`,

    newsletter: `
Format for newsletter content with:
- Newsletter-appropriate sections
- Engaging subject line suggestion
- Brief, informative content
- Clear call-to-action
- Professional yet personable tone`,

    website_content: `
Format for website content with:
- SEO-friendly structure
- Clear headings and subheadings
- Scannable paragraphs
- Professional presentation
- Contact/consultation encouragement`
  };

  return formatInstructions[contentType] || formatInstructions.blog_post;
}

function performComplianceCheck(content: string, specialty: string): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 100;

  // Check for AHPRA violations
  const prohibitedTerms = [
    { terms: ['testimonial', 'review', 'patient said', 'client said', 'success story'], penalty: 20, warning: 'Contains potential patient testimonials' },
    { terms: ['cure', 'miracle', 'guarantee', '100% effective', 'painless', 'risk-free'], penalty: 25, warning: 'Contains exaggerated or misleading claims' },
    { terms: ['best doctor', 'top specialist', 'number one', 'leading practitioner'], penalty: 15, warning: 'Contains comparative or superlative claims' },
    { terms: ['botox', 'dysport', 'juvederm', 'restylane', 'brotox'], penalty: 30, warning: 'Contains prohibited drug brand names' }
  ];

  const contentLower = content.toLowerCase();

  prohibitedTerms.forEach(({ terms, penalty, warning }) => {
    if (terms.some(term => contentLower.includes(term))) {
      score -= penalty;
      warnings.push(warning);
    }
  });

  // Check for missing disclaimer
  if (!contentLower.includes('disclaimer') && !contentLower.includes('medical advice') && !contentLower.includes('consult')) {
    score -= 10;
    warnings.push('Consider including a medical disclaimer');
  }

  return {
    score: Math.max(0, score),
    warnings
  };
}

function applyHealthcareFormatting(content: string, specialty: string, contentType: string): string {
  let formatted = content;

  // Add specialty-specific formatting
  if (specialty === 'psychology' && !formatted.includes('Lifeline')) {
    formatted += '\n\n**Mental Health Support:** If you need immediate support, contact Lifeline 13 11 14 or your local mental health crisis service.';
  }

  if (specialty === 'gp' && contentType === 'patient_education') {
    formatted += '\n\n**When to See Your GP:** If you have concerns about your health, please book an appointment with your GP for professional medical advice tailored to your individual circumstances.';
  }

  if (specialty === 'allied_health' && contentType === 'patient_education') {
    formatted += '\n\n**Important Note:** Treatment outcomes vary between individuals. Your allied health practitioner will develop a treatment plan specific to your needs and circumstances.';
  }

  // Ensure proper paragraph spacing for readability
  formatted = formatted.replace(/\n\n\n+/g, '\n\n');

  return formatted;
} 