import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TGAComplianceRequest {
  content: string;
  advertisingType: 'healthcare_service' | 'therapeutic_goods' | 'medicine' | 'device';
  targetAudience: 'general_public' | 'healthcare_professionals';
  practiceType?: string;
}

interface TGAViolation {
  ruleCode: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  regulatoryReference: string;
}

interface TGAComplianceResponse {
  isCompliant: boolean;
  complianceScore: number;
  violations: TGAViolation[];
  warnings: string[];
  recommendations: string[];
  regulatoryRequirements: string[];
}

// TGA Prohibited Therapeutic Claims (Comprehensive List)
const TGA_PROHIBITED_CLAIMS = [
  // Direct therapeutic claims
  'treats', 'cures', 'heals', 'eliminates', 'prevents', 'reverses',
  'fixes', 'stops', 'reduces symptoms of', 'relieves pain from',
  
  // Disease-specific claims
  'arthritis relief', 'diabetes treatment', 'cancer cure', 'depression treatment',
  'anxiety relief', 'heart disease prevention', 'stroke prevention',
  
  // Outcome guarantees
  'guaranteed results', 'proven to work', 'clinically proven', 'medically proven',
  'scientifically proven', '100% effective', 'guaranteed to cure',
  
  // Superlative medical claims
  'miracle cure', 'breakthrough treatment', 'revolutionary medicine',
  'wonder drug', 'magical healing', 'instant relief'
];

// TGA Restricted Medicine/Device Brand Names
const TGA_RESTRICTED_BRANDS = [
  // Prescription medicines
  'botox', 'dysport', 'xeomin', 'azzalure', 'juvederm', 'restylane',
  'teosyal', 'belotero', 'sculptra', 'radiesse',
  
  // Medical devices
  'coolsculpting', 'ultherapy', 'thermage', 'fraxel', 'picoway',
  
  // Therapeutic goods
  'medical grade', 'prescription strength', 'pharmaceutical grade'
];

// TGA Requirements by Advertising Type
const TGA_REQUIREMENTS = {
  healthcare_service: [
    'Include practitioner qualifications and registration',
    'Provide balanced information about risks and benefits',
    'Include disclaimer about individual results varying',
    'Mention consultation requirement for treatment decisions'
  ],
  therapeutic_goods: [
    'Include ARTG number if applicable',
    'Provide balanced risk/benefit information',
    'Include appropriate warnings and precautions',
    'Reference product information or consumer medicine information'
  ],
  medicine: [
    'Must not advertise prescription medicines to general public',
    'Include active ingredients for over-the-counter medicines',
    'Provide clear dosage and usage instructions',
    'Include all mandatory warnings and contraindications'
  ],
  device: [
    'Include TGA device classification if applicable',
    'Provide clear instructions for use',
    'Include safety warnings and contraindications',
    'Reference manufacturer information'
  ]
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TGA-COMPLIANCE] ${step}${detailsStr}`);
};

// Analyze therapeutic claims in content
const analyzeTherapeuticClaims = (content: string): TGAViolation[] => {
  const violations: TGAViolation[] = [];
  const contentLower = content.toLowerCase();
  
  // Check for prohibited therapeutic claims
  const prohibitedFound = TGA_PROHIBITED_CLAIMS.filter(claim => 
    contentLower.includes(claim.toLowerCase())
  );
  
  if (prohibitedFound.length > 0) {
    violations.push({
      ruleCode: 'TGA-4.2',
      severity: 'critical',
      description: `Prohibited therapeutic claims detected: ${prohibitedFound.join(', ')}`,
      suggestion: 'Remove direct therapeutic claims. Use educational language about general health benefits instead.',
      regulatoryReference: 'Therapeutic Goods Advertising Code Section 4.2 - Prohibited Representations'
    });
  }
  
  return violations;
};

// Analyze medicine/device brand name mentions
const analyzeBrandNameMentions = (content: string): TGAViolation[] => {
  const violations: TGAViolation[] = [];
  const contentLower = content.toLowerCase();
  
  const brandsFound = TGA_RESTRICTED_BRANDS.filter(brand => 
    contentLower.includes(brand.toLowerCase())
  );
  
  if (brandsFound.length > 0) {
    violations.push({
      ruleCode: 'TGA-5.1',
      severity: 'critical',
      description: `Prescription medicine/device brand names mentioned: ${brandsFound.join(', ')}`,
      suggestion: 'Replace brand names with generic therapeutic descriptions or remove entirely.',
      regulatoryReference: 'Therapeutic Goods Advertising Code Section 5.1 - Prescription Medicine Advertising'
    });
  }
  
  return violations;
};

// Check for mandatory disclaimers and warnings
const checkMandatoryDisclamers = (
  content: string, 
  advertisingType: string,
  targetAudience: string
): TGAViolation[] => {
  const violations: TGAViolation[] = [];
  const contentLower = content.toLowerCase();
  
  // Check for treatment/health advice without disclaimers
  const hasHealthAdvice = /treatment|therapy|medicine|medication|procedure|diagnosis/i.test(content);
  const hasDisclaimer = /consult|seek advice|individual results|professional guidance/i.test(content);
  
  if (hasHealthAdvice && !hasDisclaimer && targetAudience === 'general_public') {
    violations.push({
      ruleCode: 'TGA-3.1',
      severity: 'high',
      description: 'Health advice provided without appropriate consumer disclaimers',
      suggestion: 'Add disclaimer: "Individual results may vary. Consult a healthcare professional for advice specific to your situation."',
      regulatoryReference: 'Therapeutic Goods Advertising Code Section 3.1 - Consumer Protection'
    });
  }
  
  // Check for missing risk information
  const mentionsBenefits = /benefit|improve|enhance|better|help/i.test(content);
  const mentionsRisks = /risk|side effect|complication|contraindication|warning/i.test(content);
  
  if (mentionsBenefits && !mentionsRisks && advertisingType !== 'healthcare_service') {
    violations.push({
      ruleCode: 'TGA-4.3',
      severity: 'medium',
      description: 'Benefits mentioned without balanced risk information',
      suggestion: 'Include appropriate risk information and contraindications alongside benefits.',
      regulatoryReference: 'Therapeutic Goods Advertising Code Section 4.3 - Balanced Information'
    });
  }
  
  return violations;
};

// Check for evidence and substantiation requirements
const checkEvidenceRequirements = (content: string): TGAViolation[] => {
  const violations: TGAViolation[] = [];
  const contentLower = content.toLowerCase();
  
  // Check for unsubstantiated claims
  const scientificClaims = /clinically proven|scientifically proven|studies show|research proves/i.test(content);
  const hasEvidence = /study|trial|research|clinical data|peer-reviewed/i.test(content);
  
  if (scientificClaims && !hasEvidence) {
    violations.push({
      ruleCode: 'TGA-4.1',
      severity: 'high',
      description: 'Scientific claims made without adequate evidence substantiation',
      suggestion: 'Provide specific references to clinical studies or remove unsubstantiated scientific claims.',
      regulatoryReference: 'Therapeutic Goods Advertising Code Section 4.1 - Substantiation'
    });
  }
  
  return violations;
};

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    const { 
      content, 
      advertisingType, 
      targetAudience, 
      practiceType 
    }: TGAComplianceRequest = await req.json();
    
    if (!content || !advertisingType || !targetAudience) {
      throw new Error("Content, advertising type, and target audience are required");
    }

    logStep("Analyzing TGA compliance", { 
      advertisingType, 
      targetAudience, 
      contentLength: content.length 
    });

    // Perform comprehensive TGA compliance analysis
    const violations: TGAViolation[] = [
      ...analyzeTherapeuticClaims(content),
      ...analyzeBrandNameMentions(content),
      ...checkMandatoryDisclamers(content, advertisingType, targetAudience),
      ...checkEvidenceRequirements(content)
    ];

    // Generate warnings and recommendations
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Add advertising-type specific recommendations
    const requirements = TGA_REQUIREMENTS[advertisingType as keyof typeof TGA_REQUIREMENTS] || [];
    recommendations.push(...requirements);

    // Calculate compliance score
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;
    const mediumViolations = violations.filter(v => v.severity === 'medium').length;
    const lowViolations = violations.filter(v => v.severity === 'low').length;

    let complianceScore = 100;
    complianceScore -= criticalViolations * 40;
    complianceScore -= highViolations * 25;
    complianceScore -= mediumViolations * 15;
    complianceScore -= lowViolations * 5;
    complianceScore = Math.max(0, complianceScore);

    const isCompliant = criticalViolations === 0 && highViolations === 0;

    // Store compliance check for audit
    await supabaseClient
      .from('tga_compliance_audit')
      .insert([{
        user_id: user.id,
        content_hash: btoa(content).substring(0, 50), // First 50 chars of base64 hash
        advertising_type: advertisingType,
        target_audience: targetAudience,
        compliance_score: complianceScore,
        is_compliant: isCompliant,
        violations_count: violations.length,
        checked_at: new Date().toISOString()
      }]);

    const response: TGAComplianceResponse = {
      isCompliant,
      complianceScore: Math.round(complianceScore),
      violations,
      warnings,
      recommendations,
      regulatoryRequirements: requirements
    };

    logStep("TGA compliance analysis completed", { 
      isCompliant, 
      complianceScore: response.complianceScore,
      violationsCount: violations.length 
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in TGA compliance validation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      isCompliant: false,
      complianceScore: 0,
      violations: [],
      warnings: [errorMessage],
      recommendations: [],
      regulatoryRequirements: []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 