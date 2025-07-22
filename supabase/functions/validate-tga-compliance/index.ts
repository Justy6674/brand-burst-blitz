// Real TGA Therapeutic Goods Compliance Validation
// Australian Therapeutic Goods Administration compliance checking for healthcare content

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TGAComplianceRequest {
  content: string;
  contentType: 'social_media' | 'blog_post' | 'advertisement' | 'email' | 'website';
  healthcareProfession: string;
  targetAudience: 'patients' | 'professionals' | 'general_public';
  includesDevices?: boolean;
  includesMedications?: boolean;
  includesTherapeuticClaims?: boolean;
}

interface TGAComplianceResponse {
  isCompliant: boolean;
  complianceScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: Array<{
    type: string;
    severity: 'warning' | 'error' | 'critical';
    message: string;
    suggestion: string;
    regulation: string;
  }>;
  suggestions: string[];
  requiredDisclaimmers: string[];
  approvedVersion?: string;
  error?: string;
}

interface TGARegulationRule {
  pattern: RegExp;
  type: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  suggestion: string;
  regulation: string;
  appliesTo: string[];
}

const logStep = (step: string, data?: any) => {
  console.log(`[TGA Compliance] ${step}`, data ? JSON.stringify(data) : '');
};

// TGA Therapeutic Goods Regulations - Comprehensive Rules
const TGA_REGULATION_RULES: TGARegulationRule[] = [
  // Critical violations - Prohibited therapeutic claims
  {
    pattern: /\b(cure|cures|curing|guaranteed|miracle|instant|immediate|permanent|100%)\b/gi,
    type: 'prohibited_therapeutic_claim',
    severity: 'critical',
    message: 'Prohibited therapeutic claim detected',
    suggestion: 'Remove absolute claims. Use evidence-based language like "may help" or "studies suggest"',
    regulation: 'Therapeutic Goods Act 1989 - Section 42DL',
    appliesTo: ['all']
  },
  {
    pattern: /\b(prevent|prevents|preventing|immunity|immune|immunise|immunize)\s+(cancer|covid|coronavirus|disease|illness)\b/gi,
    type: 'disease_prevention_claim',
    severity: 'critical',
    message: 'Unsubstantiated disease prevention claim',
    suggestion: 'Only make claims supported by TGA-approved evidence',
    regulation: 'Therapeutic Goods Regulations 1990 - Schedule 4',
    appliesTo: ['all']
  },
  
  // High severity - Medical device claims
  {
    pattern: /\b(diagnose|treat|surgery|surgical|medical device|implant|prosthetic)\b/gi,
    type: 'medical_device_claim',
    severity: 'error',
    message: 'Medical device advertising requires TGA compliance',
    suggestion: 'Ensure all medical devices are TGA-approved and include ARTG number',
    regulation: 'Therapeutic Goods Act 1989 - Chapter 5',
    appliesTo: ['medical', 'dental', 'physiotherapy']
  },
  {
    pattern: /\b(prescription|script|pharmaceutical|medicine|drug|tablet|capsule)\b/gi,
    type: 'pharmaceutical_reference',
    severity: 'error',
    message: 'Pharmaceutical content requires careful compliance',
    suggestion: 'Include appropriate disclaimers and TGA warnings',
    regulation: 'Therapeutic Goods Regulations 1990 - Part 5-1',
    appliesTo: ['medical', 'pharmacy']
  },
  
  // Medium severity - Therapeutic claims
  {
    pattern: /\b(relieves|reduces|improves|enhances|boosts|strengthens)\s+(pain|symptoms|health|wellbeing|performance)\b/gi,
    type: 'therapeutic_claim',
    severity: 'warning',
    message: 'Therapeutic claim requires evidence base',
    suggestion: 'Add disclaimer: "Individual results may vary. Consult healthcare professional"',
    regulation: 'TGA Guidelines on Advertising Therapeutic Goods',
    appliesTo: ['all']
  },
  {
    pattern: /\b(clinical trial|research shows|studies prove|scientifically proven)\b/gi,
    type: 'scientific_claim',
    severity: 'warning',
    message: 'Scientific claims must be substantiated',
    suggestion: 'Provide references to peer-reviewed studies',
    regulation: 'TGA Evidence Guidelines for Listed Medicines',
    appliesTo: ['all']
  },
  
  // Patient testimonials and reviews
  {
    pattern: /\b(patient said|testimonial|review|before and after|success story)\b/gi,
    type: 'patient_testimonial',
    severity: 'error',
    message: 'Patient testimonials may violate TGA advertising guidelines',
    suggestion: 'Remove patient testimonials or ensure compliance with TGA testimonial guidelines',
    regulation: 'TGA Advertising Code - Section 4.2',
    appliesTo: ['medical', 'dental', 'physiotherapy', 'psychology']
  },
  
  // Comparison claims
  {
    pattern: /\b(better than|superior to|more effective|outperforms|#1|best|leading)\b/gi,
    type: 'comparison_claim',
    severity: 'warning',
    message: 'Comparison claims require substantiation',
    suggestion: 'Provide evidence for comparative claims or remove superlatives',
    regulation: 'Australian Consumer Law - Misleading Claims',
    appliesTo: ['all']
  },
  
  // Price and promotional content
  {
    pattern: /\b(free|discount|special offer|limited time|bulk bill|no gap)\b/gi,
    type: 'promotional_content',
    severity: 'warning',
    message: 'Promotional healthcare content requires careful wording',
    suggestion: 'Ensure promotional content does not overshadow health information',
    regulation: 'TGA Advertising Guidelines - Section 6',
    appliesTo: ['all']
  }
];

// Required disclaimers based on content type and profession
const TGA_REQUIRED_DISCLAIMERS = {
  'therapeutic_claims': [
    'Individual results may vary. Always consult with a qualified healthcare professional.',
    'This information is for educational purposes only and is not intended as medical advice.'
  ],
  'medical_devices': [
    'Medical devices shown are registered with the TGA (ARTG number required).',
    'Consult your healthcare provider before using any medical device.'
  ],
  'pharmaceutical_content': [
    'Medicines have benefits and risks. Always read the label and follow directions.',
    'If symptoms persist, consult your healthcare professional.'
  ],
  'before_after_photos': [
    'Results may vary between individuals.',
    'Photos are of actual patients with their consent.',
    'Individual outcomes depend on various factors including health status.'
  ],
  'general_health': [
    'This information is general in nature and should not replace professional medical advice.',
    'Always consult with a qualified healthcare professional for diagnosis and treatment.'
  ]
};

// Analyze content for TGA compliance
function analyzeTGACompliance(
  content: string, 
  contentType: string, 
  profession: string, 
  targetAudience: string
): TGAComplianceResponse {
  const violations: Array<{
    type: string;
    severity: 'warning' | 'error' | 'critical';
    message: string;
    suggestion: string;
    regulation: string;
  }> = [];
  
  const suggestions: string[] = [];
  const requiredDisclaimmers: string[] = [];
  
  let complianceScore = 100;
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  // Check against all TGA regulation rules
  for (const rule of TGA_REGULATION_RULES) {
    // Check if rule applies to this profession
    if (rule.appliesTo.includes('all') || rule.appliesTo.includes(profession)) {
      const matches = content.match(rule.pattern);
      
      if (matches) {
        violations.push({
          type: rule.type,
          severity: rule.severity,
          message: `${rule.message}: "${matches[0]}"`,
          suggestion: rule.suggestion,
          regulation: rule.regulation
        });
        
        // Deduct compliance score based on severity
        switch (rule.severity) {
          case 'critical':
            complianceScore -= 30;
            riskLevel = 'critical';
            break;
          case 'error':
            complianceScore -= 15;
            if (riskLevel !== 'critical') riskLevel = 'high';
            break;
          case 'warning':
            complianceScore -= 5;
            if (riskLevel === 'low') riskLevel = 'medium';
            break;
        }
      }
    }
  }
  
  // Determine required disclaimers based on violations
  const violationTypes = violations.map(v => v.type);
  
  if (violationTypes.includes('therapeutic_claim') || violationTypes.includes('prohibited_therapeutic_claim')) {
    requiredDisclaimmers.push(...TGA_REQUIRED_DISCLAIMERS.therapeutic_claims);
  }
  
  if (violationTypes.includes('medical_device_claim')) {
    requiredDisclaimmers.push(...TGA_REQUIRED_DISCLAIMERS.medical_devices);
  }
  
  if (violationTypes.includes('pharmaceutical_reference')) {
    requiredDisclaimmers.push(...TGA_REQUIRED_DISCLAIMERS.pharmaceutical_content);
  }
  
  if (violationTypes.includes('patient_testimonial')) {
    requiredDisclaimmers.push(...TGA_REQUIRED_DISCLAIMERS.before_after_photos);
  }
  
  // Add general health disclaimer for all healthcare content
  requiredDisclaimmers.push(...TGA_REQUIRED_DISCLAIMERS.general_health);
  
  // General suggestions based on content type
  if (contentType === 'social_media') {
    suggestions.push('Keep social media health content general and educational');
    suggestions.push('Include clear disclaimers in captions or comments');
  }
  
  if (targetAudience === 'patients') {
    suggestions.push('Use plain language and avoid complex medical terminology');
    suggestions.push('Encourage patients to consult their healthcare provider');
  }
  
  // Ensure minimum compliance score
  complianceScore = Math.max(0, complianceScore);
  
  // Generate approved version suggestion if violations exist
  let approvedVersion: string | undefined;
  if (violations.length > 0) {
    approvedVersion = generateTGACompliantVersion(content, violations);
  }
  
  return {
    isCompliant: violations.filter(v => v.severity === 'critical' || v.severity === 'error').length === 0,
    complianceScore,
    riskLevel,
    violations,
    suggestions,
    requiredDisclaimmers: [...new Set(requiredDisclaimmers)], // Remove duplicates
    approvedVersion
  };
}

// Generate a TGA-compliant version of the content
function generateTGACompliantVersion(content: string, violations: any[]): string {
  let compliantContent = content;
  
  // Apply fixes for common violations
  compliantContent = compliantContent
    // Remove absolute claims
    .replace(/\b(cure|cures|curing|guaranteed|miracle|instant|permanent|100%)\b/gi, 'may help with')
    // Soften therapeutic claims
    .replace(/\b(prevents|will prevent|stops)\b/gi, 'may help support')
    // Add qualifiers to strong claims
    .replace(/\b(eliminates|removes|destroys)\b/gi, 'may help reduce')
    // Replace superlatives
    .replace(/\b(best|#1|leading|superior)\b/gi, 'quality')
    // Add uncertainty to scientific claims
    .replace(/\b(proves|proven|guarantees)\b/gi, 'suggests');
  
  // Add standard disclaimer
  compliantContent += '\n\n*This information is general in nature. Individual results may vary. Always consult with a qualified healthcare professional for advice specific to your situation.';
  
  return compliantContent;
}

// Cache compliance results to improve performance
async function cacheTGACompliance(
  supabaseClient: any, 
  contentHash: string, 
  result: TGAComplianceResponse
): Promise<void> {
  try {
    await supabaseClient
      .from('tga_compliance_cache')
      .upsert({
        content_hash: contentHash,
        compliance_result: result,
        cached_at: new Date().toISOString()
      });
  } catch (error) {
    logStep("TGA compliance cache write failed", { error: error.message });
  }
}

// Generate content hash for caching
function generateContentHash(content: string, metadata: string): string {
  // Simple hash function for content + metadata
  let hash = 0;
  const str = content + metadata;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("TGA compliance validation started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { 
      content, 
      contentType, 
      healthcareProfession, 
      targetAudience,
      includesDevices = false,
      includesMedications = false,
      includesTherapeuticClaims = false
    }: TGAComplianceRequest = await req.json();
    
    if (!content || !contentType || !healthcareProfession) {
      throw new Error("Content, content type, and healthcare profession are required");
    }

    logStep("Analyzing TGA compliance", { 
      contentLength: content.length,
      contentType,
      profession: healthcareProfession,
      audience: targetAudience
    });

    // Generate content hash for caching
    const metadata = `${contentType}-${healthcareProfession}-${targetAudience}`;
    const contentHash = generateContentHash(content, metadata);

    // Check cache first
    const cached = await supabaseClient
      .from('tga_compliance_cache')
      .select('*')
      .eq('content_hash', contentHash)
      .gte('cached_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hour cache
      .single();

    if (cached.data) {
      logStep("TGA compliance found in cache");
      return new Response(JSON.stringify(cached.data.compliance_result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Perform TGA compliance analysis
    const complianceResult = analyzeTGACompliance(
      content,
      contentType,
      healthcareProfession,
      targetAudience
    );

    logStep("TGA compliance analysis complete", {
      isCompliant: complianceResult.isCompliant,
      score: complianceResult.complianceScore,
      riskLevel: complianceResult.riskLevel,
      violationCount: complianceResult.violations.length
    });

    // Cache the result
    await cacheTGACompliance(supabaseClient, contentHash, complianceResult);

    // Log compliance check for analytics
    await supabaseClient
      .from('tga_compliance_stats')
      .insert({
        user_id: user.id,
        content_type: contentType,
        healthcare_profession: healthcareProfession,
        target_audience: targetAudience,
        compliance_score: complianceResult.complianceScore,
        risk_level: complianceResult.riskLevel,
        violation_count: complianceResult.violations.length,
        is_compliant: complianceResult.isCompliant,
        checked_at: new Date().toISOString()
      });

    return new Response(JSON.stringify(complianceResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in TGA compliance validation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      isCompliant: false,
      complianceScore: 0,
      riskLevel: 'critical',
      violations: [],
      suggestions: [],
      requiredDisclaimmers: [],
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 