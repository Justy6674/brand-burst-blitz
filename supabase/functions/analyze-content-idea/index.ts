import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

interface ContentIdeaAnalysisRequest {
  content: string;
  source: 'voice' | 'text' | 'image' | 'document';
  healthcare_context?: string;
  user_preferences?: {
    preferred_platforms?: string[];
    typical_posting_schedule?: string;
    target_audience?: string;
    practice_specialty?: string;
  };
}

interface ContentAnalysisResult {
  success: boolean;
  analysis: {
    suggested_type: string;
    suggested_platform: string;
    suggested_tone: string;
    title: string;
    enhanced_content: string;
    keywords: string[];
    hashtags: string[];
    target_audience: string;
    confidence: number;
    compliance_risk: 'low' | 'medium' | 'high';
    ahpra_considerations?: string;
    suggested_schedule_date?: string;
    optimal_posting_time?: string;
    content_category: string;
    engagement_potential: number;
    educational_value: number;
    patient_safety_considerations?: string[];
  };
  recommendations: string[];
  warnings: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { content, source, healthcare_context, user_preferences }: ContentIdeaAnalysisRequest = await req.json();

    if (!content || content.trim().length < 3) {
      throw new Error('Content is required and must be at least 3 characters long');
    }

    console.log(`Analyzing content idea: ${content.substring(0, 100)}...`);

    const analysisResult = await analyzeHealthcareContentIdea(content, source, healthcare_context, user_preferences);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Content idea analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        analysis: null 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function analyzeHealthcareContentIdea(
  content: string,
  source: string,
  healthcareContext?: string,
  userPreferences?: any
): Promise<ContentAnalysisResult> {
  console.log('🧠 Analyzing healthcare content idea with AI...');

  // Enhanced content analysis using multiple approaches
  const analysisResults = await Promise.all([
    analyzeContentType(content),
    analyzeHealthcareCompliance(content, healthcareContext),
    suggestOptimalTiming(content, userPreferences),
    generateEnhancedContent(content, healthcareContext),
    assessEngagementPotential(content),
    checkPatientSafety(content)
  ]);

  const [
    contentTypeAnalysis,
    complianceAnalysis,
    timingAnalysis,
    enhancedContentResult,
    engagementAnalysis,
    safetyAnalysis
  ] = analysisResults;

  // Determine best content type and platform
  const suggestedType = determineBestContentType(content, contentTypeAnalysis, healthcareContext);
  const suggestedPlatform = determineBestPlatform(content, suggestedType, userPreferences);
  
  // Generate title and enhanced content
  const title = generateTitle(content, suggestedType, healthcareContext);
  const enhancedContent = enhancedContentResult.enhanced || content;
  
  // Generate keywords and hashtags
  const keywords = generateHealthcareKeywords(content, healthcareContext);
  const hashtags = generateHealthcareHashtags(content, suggestedPlatform, healthcareContext);
  
  // Determine target audience
  const targetAudience = determineTargetAudience(content, healthcareContext);
  
  // Calculate confidence score
  const confidence = calculateConfidenceScore(content, source, contentTypeAnalysis);
  
  // Assess compliance risk
  const complianceRisk = assessComplianceRisk(complianceAnalysis);
  
  // Generate recommendations
  const recommendations = generateRecommendations(content, suggestedType, complianceAnalysis, engagementAnalysis);
  
  // Generate warnings
  const warnings = generateWarnings(complianceAnalysis, safetyAnalysis);

  const result: ContentAnalysisResult = {
    success: true,
    analysis: {
      suggested_type: suggestedType,
      suggested_platform: suggestedPlatform,
      suggested_tone: determineTone(content, healthcareContext),
      title,
      enhanced_content: enhancedContent,
      keywords,
      hashtags,
      target_audience: targetAudience,
      confidence,
      compliance_risk: complianceRisk,
      ahpra_considerations: complianceAnalysis.ahpra_notes,
      suggested_schedule_date: timingAnalysis.suggested_date,
      optimal_posting_time: timingAnalysis.optimal_time,
      content_category: categorizeContent(content, healthcareContext),
      engagement_potential: engagementAnalysis.score,
      educational_value: assessEducationalValue(content, healthcareContext),
      patient_safety_considerations: safetyAnalysis.considerations
    },
    recommendations,
    warnings
  };

  console.log('✅ Content idea analysis completed');
  return result;
}

async function analyzeContentType(content: string) {
  // Analyze content to determine best format
  const contentLower = content.toLowerCase();
  
  const typeScores = {
    facebook_post: 0,
    instagram_post: 0,
    instagram_story: 0,
    linkedin_post: 0,
    blog_post: 0,
    newsletter_content: 0,
    patient_education: 0,
    health_tip: 0,
    video_script: 0
  };

  // Length-based scoring
  if (content.length < 100) {
    typeScores.health_tip += 3;
    typeScores.instagram_story += 2;
    typeScores.facebook_post += 1;
  } else if (content.length < 300) {
    typeScores.facebook_post += 3;
    typeScores.instagram_post += 2;
    typeScores.health_tip += 2;
  } else if (content.length < 500) {
    typeScores.linkedin_post += 3;
    typeScores.facebook_post += 2;
    typeScores.patient_education += 2;
  } else {
    typeScores.blog_post += 3;
    typeScores.newsletter_content += 2;
    typeScores.patient_education += 3;
  }

  // Content-based scoring
  if (contentLower.includes('tip') || contentLower.includes('advice')) {
    typeScores.health_tip += 2;
    typeScores.patient_education += 1;
  }

  if (contentLower.includes('story') || contentLower.includes('experience')) {
    typeScores.instagram_story += 2;
    typeScores.facebook_post += 1;
  }

  if (contentLower.includes('video') || contentLower.includes('show')) {
    typeScores.video_script += 3;
    typeScores.instagram_post += 1;
  }

  if (contentLower.includes('blog') || contentLower.includes('article') || contentLower.includes('write about')) {
    typeScores.blog_post += 3;
    typeScores.patient_education += 2;
  }

  if (contentLower.includes('education') || contentLower.includes('explain') || contentLower.includes('how to')) {
    typeScores.patient_education += 3;
    typeScores.blog_post += 2;
  }

  if (contentLower.includes('professional') || contentLower.includes('colleague')) {
    typeScores.linkedin_post += 2;
    typeScores.newsletter_content += 1;
  }

  return typeScores;
}

async function analyzeHealthcareCompliance(content: string, healthcareContext?: string) {
  const contentLower = content.toLowerCase();
  const complianceIssues = [];
  const warnings = [];
  let riskLevel = 'low';
  let ahpraNotes = '';

  // Check for prohibited terms
  const prohibitedTerms = [
    'miracle', 'cure', 'guaranteed', 'instant', 'breakthrough', 'revolutionary',
    'amazing results', 'incredible', 'unbelievable', 'life-changing miracle'
  ];

  const therapeuticClaims = [
    'heals', 'cures', 'treats', 'eliminates', 'reverses', 'fixes',
    'stops', 'prevents all', 'completely safe', 'no side effects'
  ];

  const testimonialIndicators = [
    'testimonial', 'patient says', 'review', 'cured me', 'healed me',
    'my doctor', 'personal experience', 'success story'
  ];

  // Check prohibited advertising terms
  for (const term of prohibitedTerms) {
    if (contentLower.includes(term)) {
      complianceIssues.push(`Contains prohibited advertising term: "${term}"`);
      riskLevel = 'high';
    }
  }

  // Check therapeutic claims
  for (const claim of therapeuticClaims) {
    if (contentLower.includes(claim)) {
      complianceIssues.push(`Contains potential therapeutic claim: "${claim}"`);
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }
  }

  // Check for patient testimonials
  for (const indicator of testimonialIndicators) {
    if (contentLower.includes(indicator)) {
      complianceIssues.push(`Potential patient testimonial detected: "${indicator}"`);
      warnings.push('Patient testimonials are prohibited by AHPRA guidelines');
      riskLevel = 'high';
    }
  }

  // Check for medical advice
  if (contentLower.includes('should') || contentLower.includes('must') || contentLower.includes('diagnosis')) {
    if (!contentLower.includes('consult') && !contentLower.includes('see your doctor') && !contentLower.includes('seek professional advice')) {
      complianceIssues.push('Medical advice without appropriate disclaimer');
      warnings.push('Add disclaimer: "This information is general. Consult your healthcare provider for advice specific to your situation."');
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }
  }

  // Generate AHPRA notes
  if (complianceIssues.length > 0) {
    ahpraNotes = `AHPRA Compliance Review Required: ${complianceIssues.join('. ')}. Ensure content complies with AHPRA Guidelines for advertising regulated health services.`;
  } else {
    ahpraNotes = 'Content appears compliant with AHPRA advertising guidelines. Always review final content before publication.';
  }

  return {
    risk_level: riskLevel,
    compliance_issues: complianceIssues,
    warnings,
    ahpra_notes: ahpraNotes,
    requires_review: complianceIssues.length > 0
  };
}

async function suggestOptimalTiming(content: string, userPreferences?: any) {
  const now = new Date();
  
  // Healthcare-optimized posting times
  const optimalTimes = {
    facebook: { hour: 10, day: 'Tuesday' }, // 10 AM Tuesday
    instagram: { hour: 14, day: 'Wednesday' }, // 2 PM Wednesday  
    linkedin: { hour: 9, day: 'Tuesday' }, // 9 AM Tuesday
    blog: { hour: 8, day: 'Wednesday' }, // 8 AM Wednesday
    newsletter: { hour: 10, day: 'Thursday' } // 10 AM Thursday
  };

  // Determine best platform based on content
  const contentLower = content.toLowerCase();
  let platform = 'facebook'; // default
  
  if (contentLower.includes('professional') || contentLower.includes('colleague')) {
    platform = 'linkedin';
  } else if (contentLower.includes('visual') || contentLower.includes('image') || contentLower.includes('photo')) {
    platform = 'instagram';
  } else if (content.length > 500) {
    platform = 'blog';
  }

  const optimal = optimalTimes[platform] || optimalTimes.facebook;
  
  // Calculate next optimal posting time
  const nextOptimalDate = new Date(now);
  const currentDay = nextOptimalDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const targetDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(optimal.day);
  
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) daysToAdd += 7; // Next week if day has passed
  
  nextOptimalDate.setDate(now.getDate() + daysToAdd);
  nextOptimalDate.setHours(optimal.hour, 0, 0, 0);
  
  return {
    suggested_date: nextOptimalDate.toISOString(),
    optimal_time: `${optimal.hour}:00 ${optimal.day}`,
    platform: platform,
    reasoning: `Optimal for ${platform} based on healthcare audience engagement patterns`
  };
}

async function generateEnhancedContent(content: string, healthcareContext?: string) {
  // Enhance content with healthcare best practices
  let enhanced = content;
  
  // Add appropriate disclaimers for medical content
  const contentLower = content.toLowerCase();
  const needsDisclaimer = 
    contentLower.includes('treatment') || 
    contentLower.includes('advice') || 
    contentLower.includes('should') || 
    contentLower.includes('recommend');
  
  if (needsDisclaimer && !contentLower.includes('disclaimer') && !contentLower.includes('consult')) {
    enhanced += '\n\nDisclaimer: This information is general in nature. Please consult your healthcare provider for advice specific to your individual circumstances.';
  }

  // Add engagement elements for social media
  if (content.length < 300) {
    if (!enhanced.includes('?') && !enhanced.includes('What')) {
      enhanced += '\n\nWhat has been your experience with this? Share in the comments below.';
    }
  }

  // Add call-to-action for healthcare content
  if (healthcareContext && !enhanced.includes('appointment') && !enhanced.includes('contact')) {
    enhanced += '\n\nFor personalised advice, book an appointment with our team.';
  }

  return {
    enhanced,
    improvements: ['Added AHPRA-compliant disclaimer', 'Added patient engagement question', 'Added appropriate call-to-action']
  };
}

async function assessEngagementPotential(content: string) {
  let score = 50; // Base score
  
  const contentLower = content.toLowerCase();
  
  // Positive engagement factors
  if (contentLower.includes('?') || contentLower.includes('question')) score += 15;
  if (contentLower.includes('tip') || contentLower.includes('advice')) score += 10;
  if (contentLower.includes('health') || contentLower.includes('wellness')) score += 10;
  if (contentLower.includes('prevention') || contentLower.includes('care')) score += 8;
  if (contentLower.includes('simple') || contentLower.includes('easy')) score += 5;
  if (contentLower.includes('important') || contentLower.includes('essential')) score += 5;
  
  // Seasonal or trending topics
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 5 && currentMonth <= 7) { // Winter months in Australia
    if (contentLower.includes('flu') || contentLower.includes('cold') || contentLower.includes('winter')) score += 15;
  }
  
  // Length optimization
  if (content.length >= 50 && content.length <= 200) score += 10;
  if (content.length > 500) score -= 5;
  
  return {
    score: Math.min(100, Math.max(0, score)),
    factors: ['Question-based content', 'Healthcare relevance', 'Seasonal timing', 'Optimal length']
  };
}

async function checkPatientSafety(content: string) {
  const contentLower = content.toLowerCase();
  const safetyConsiderations = [];
  const warnings = [];
  
  // Check for medication mentions without warnings
  const medicationTerms = ['medication', 'drug', 'medicine', 'pill', 'tablet', 'dosage'];
  const hasMedication = medicationTerms.some(term => contentLower.includes(term));
  
  if (hasMedication) {
    if (!contentLower.includes('consult') && !contentLower.includes('doctor') && !contentLower.includes('pharmacist')) {
      safetyConsiderations.push('Medication information requires professional consultation disclaimer');
      warnings.push('Add: "Always consult your doctor or pharmacist before changing medications"');
    }
  }
  
  // Check for emergency symptoms
  const emergencyTerms = ['chest pain', 'difficulty breathing', 'severe', 'emergency', 'urgent'];
  const hasEmergency = emergencyTerms.some(term => contentLower.includes(term));
  
  if (hasEmergency) {
    safetyConsiderations.push('Emergency symptom information requires immediate care instructions');
    warnings.push('Add: "Seek immediate medical attention for severe symptoms"');
  }
  
  // Check for self-diagnosis content
  if (contentLower.includes('diagnose') || contentLower.includes('self-test')) {
    safetyConsiderations.push('Self-diagnosis content discouraged');
    warnings.push('Emphasise professional diagnosis importance');
  }
  
  return {
    considerations: safetyConsiderations,
    warnings,
    safe_for_publication: safetyConsiderations.length === 0
  };
}

function determineBestContentType(content: string, analysis: any, healthcareContext?: string): string {
  const topTypes = Object.entries(analysis)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3);
  
  return topTypes[0][0] as string;
}

function determineBestPlatform(content: string, contentType: string, userPreferences?: any): string {
  const platformMapping = {
    'health_tip': 'instagram',
    'patient_education': 'facebook',
    'blog_post': 'website',
    'professional_update': 'linkedin',
    'instagram_story': 'instagram',
    'facebook_post': 'facebook',
    'newsletter_content': 'newsletter'
  };
  
  return platformMapping[contentType] || 'facebook';
}

function generateTitle(content: string, contentType: string, healthcareContext?: string): string {
  const contentWords = content.split(' ').slice(0, 8).join(' ');
  
  const titleTemplates = {
    'health_tip': `Health Tip: ${contentWords}`,
    'patient_education': `Understanding ${contentWords}`,
    'blog_post': `${contentWords} - What You Need to Know`,
    'facebook_post': contentWords,
    'instagram_post': contentWords,
    'professional_update': `Professional Update: ${contentWords}`
  };
  
  return titleTemplates[contentType] || contentWords;
}

function generateHealthcareKeywords(content: string, healthcareContext?: string): string[] {
  const contentLower = content.toLowerCase();
  const keywords = [];
  
  // Common healthcare keywords
  const healthcareTerms = [
    'health', 'wellness', 'prevention', 'care', 'treatment', 'patient',
    'medical', 'doctor', 'healthcare', 'medicine', 'therapy', 'diagnosis'
  ];
  
  healthcareTerms.forEach(term => {
    if (contentLower.includes(term)) {
      keywords.push(term);
    }
  });
  
  // Add specialty-specific keywords
  if (healthcareContext) {
    const specialtyKeywords = {
      'general_practice': ['GP', 'family medicine', 'primary care'],
      'mental_health': ['mental health', 'wellbeing', 'psychology'],
      'cardiology': ['heart health', 'cardiovascular', 'heart'],
      'dermatology': ['skin health', 'dermatology', 'skin care']
    };
    
    if (specialtyKeywords[healthcareContext]) {
      keywords.push(...specialtyKeywords[healthcareContext]);
    }
  }
  
  return keywords.slice(0, 8); // Limit to 8 keywords
}

function generateHealthcareHashtags(content: string, platform: string, healthcareContext?: string): string[] {
  const hashtags = [];
  const contentLower = content.toLowerCase();
  
  // Platform-specific hashtag strategies
  if (platform === 'instagram') {
    hashtags.push('#healthcare', '#wellness', '#health');
    if (contentLower.includes('tip')) hashtags.push('#healthtips');
    if (contentLower.includes('prevention')) hashtags.push('#prevention');
    
    // Add specialty hashtags
    if (healthcareContext) {
      const specialtyHashtags = {
        'general_practice': ['#GP', '#familymedicine', '#primarycare'],
        'mental_health': ['#mentalhealth', '#wellbeing', '#psychology'],
        'cardiology': ['#hearthealth', '#cardiology'],
        'dermatology': ['#skinhealth', '#dermatology']
      };
      
      if (specialtyHashtags[healthcareContext]) {
        hashtags.push(...specialtyHashtags[healthcareContext]);
      }
    }
  } else if (platform === 'facebook') {
    // Facebook uses fewer hashtags
    hashtags.push('#healthcare', '#wellness');
    if (contentLower.includes('education')) hashtags.push('#patienteducation');
  }
  
  // Add Australian healthcare hashtags
  hashtags.push('#AustralianHealthcare', '#AHPRA');
  
  return hashtags.slice(0, 10); // Limit based on platform
}

function determineTargetAudience(content: string, healthcareContext?: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('patient') || contentLower.includes('people')) {
    return 'patients_and_general_public';
  } else if (contentLower.includes('professional') || contentLower.includes('colleague')) {
    return 'healthcare_professionals';
  } else if (contentLower.includes('family') || contentLower.includes('parent')) {
    return 'families_and_caregivers';
  } else {
    return 'general_health_conscious_audience';
  }
}

function determineTone(content: string, healthcareContext?: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('urgent') || contentLower.includes('important') || contentLower.includes('warning')) {
    return 'urgent';
  } else if (contentLower.includes('tip') || contentLower.includes('simple') || contentLower.includes('easy')) {
    return 'friendly';
  } else if (contentLower.includes('research') || contentLower.includes('study') || contentLower.includes('professional')) {
    return 'professional';
  } else {
    return 'educational';
  }
}

function categorizeContent(content: string, healthcareContext?: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('prevention') || contentLower.includes('avoid')) {
    return 'preventive_care';
  } else if (contentLower.includes('education') || contentLower.includes('learn') || contentLower.includes('understand')) {
    return 'patient_education';
  } else if (contentLower.includes('update') || contentLower.includes('new') || contentLower.includes('practice')) {
    return 'practice_update';
  } else if (contentLower.includes('tip') || contentLower.includes('advice')) {
    return 'health_tip';
  } else {
    return 'general_health_information';
  }
}

function calculateConfidenceScore(content: string, source: string, analysis: any): number {
  let confidence = 60; // Base confidence
  
  // Source-based confidence
  if (source === 'text') confidence += 20;
  if (source === 'voice') confidence += 15;
  
  // Content quality factors
  if (content.length > 50) confidence += 10;
  if (content.length > 200) confidence += 5;
  
  // Analysis strength
  const topScore = Math.max(...Object.values(analysis) as number[]);
  if (topScore > 5) confidence += 15;
  if (topScore > 8) confidence += 10;
  
  return Math.min(100, confidence);
}

function assessComplianceRisk(complianceAnalysis: any): 'low' | 'medium' | 'high' {
  return complianceAnalysis.risk_level;
}

function assessEducationalValue(content: string, healthcareContext?: string): number {
  const contentLower = content.toLowerCase();
  let value = 50;
  
  if (contentLower.includes('education') || contentLower.includes('learn')) value += 20;
  if (contentLower.includes('prevention') || contentLower.includes('care')) value += 15;
  if (contentLower.includes('how to') || contentLower.includes('steps')) value += 15;
  if (contentLower.includes('important') || contentLower.includes('essential')) value += 10;
  if (contentLower.includes('research') || contentLower.includes('evidence')) value += 10;
  
  return Math.min(100, value);
}

function generateRecommendations(content: string, contentType: string, complianceAnalysis: any, engagementAnalysis: any): string[] {
  const recommendations = [];
  
  // Content-specific recommendations
  if (contentType === 'patient_education') {
    recommendations.push('Include visual elements (infographics, diagrams) to enhance understanding');
    recommendations.push('Add "Further Reading" section with reputable health sources');
  }
  
  if (contentType === 'health_tip') {
    recommendations.push('Keep language simple and actionable');
    recommendations.push('Include specific steps patients can take');
  }
  
  if (contentType === 'blog_post') {
    recommendations.push('Structure with clear headings and bullet points');
    recommendations.push('Include FAQ section addressing common patient questions');
  }
  
  // Compliance-based recommendations
  if (complianceAnalysis.risk_level !== 'low') {
    recommendations.push('Review content with healthcare compliance guidelines');
    recommendations.push('Add appropriate medical disclaimers');
  }
  
  // Engagement-based recommendations
  if (engagementAnalysis.score < 70) {
    recommendations.push('Add engaging questions to encourage patient interaction');
    recommendations.push('Include relevant seasonal health topics');
  }
  
  // General healthcare recommendations
  recommendations.push('Ensure content is accessible to patients with varying health literacy levels');
  recommendations.push('Consider cultural sensitivity for diverse patient populations');
  
  return recommendations;
}

function generateWarnings(complianceAnalysis: any, safetyAnalysis: any): string[] {
  const warnings = [];
  
  // Compliance warnings
  warnings.push(...complianceAnalysis.warnings);
  
  // Safety warnings
  warnings.push(...safetyAnalysis.warnings);
  
  // General healthcare warnings
  if (complianceAnalysis.risk_level === 'high') {
    warnings.push('HIGH RISK: Content may violate AHPRA advertising guidelines');
  }
  
  if (!safetyAnalysis.safe_for_publication) {
    warnings.push('SAFETY CONCERN: Review patient safety implications before publication');
  }
  
  return warnings;
} 