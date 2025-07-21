import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AHPRAValidationRequest {
  registrationNumber: string;
  profession: string;
  practitionerName?: string;
}

interface AHPRAValidationResponse {
  isValid: boolean;
  practitionerName?: string;
  profession?: string;
  speciality?: string;
  registrationStatus?: 'current' | 'expired' | 'suspended' | 'cancelled';
  registrationExpiry?: string;
  conditions?: string[];
  practiceLocation?: string;
  endorsements?: string[];
  qualifications?: string[];
  error?: string;
  source?: 'ahpra_api' | 'cached' | 'fallback';
  lastUpdated?: string;
  registrationNumber?: string;
}

interface AHPRASearchResult {
  RegistrationNumber: string;
  GivenName: string;
  FamilyName: string;
  Profession: string;
  RegistrationSubType: string;
  PrincipalPlaceOfPractice: {
    State: string;
    Postcode: string;
  };
  RegistrationStatus: string;
  RegistrationExpiryDate: string;
  Conditions: Array<{
    ConditionCode: string;
    ConditionDescription: string;
  }>;
  Endorsements: Array<{
    EndorsementCode: string;
    EndorsementDescription: string;
  }>;
  Qualifications: Array<{
    QualificationCode: string;
    QualificationDescription: string;
    Institution: string;
    Year: string;
  }>;
}

const logStep = (step: string, data?: any) => {
  console.log(`[AHPRA Validation] ${step}`, data ? JSON.stringify(data) : '');
};

// AHPRA API configuration
const AHPRA_API_BASE = 'https://www.ahpra.gov.au/api/practitioners/search';
const AHPRA_PUBLIC_REGISTER = 'https://www.ahpra.gov.au/api/practitioners/register-search';

// AHPRA registration number format validation
const AHPRA_REGISTRATION_PATTERNS = {
  'medical': /^MED\d{10}$/,
  'nursing': /^NMW\d{10}$/,
  'dental': /^DEN\d{10}$/,
  'pharmacy': /^PHA\d{10}$/,
  'physiotherapy': /^PHY\d{10}$/,
  'psychology': /^PSY\d{10}$/,
  'optometry': /^OPT\d{10}$/,
  'osteopathy': /^OST\d{10}$/,
  'chiropractic': /^CHI\d{10}$/,
  'podiatry': /^POD\d{10}$/,
  'occupational_therapy': /^OCC\d{10}$/,
  'chinese_medicine': /^CMR\d{10}$/,
  'aboriginal_health': /^AHP\d{10}$/,
  'paramedicine': /^PAR\d{10}$/
};

// Validate AHPRA registration number format
function validateAHPRAFormat(registrationNumber: string, profession: string): boolean {
  const pattern = AHPRA_REGISTRATION_PATTERNS[profession as keyof typeof AHPRA_REGISTRATION_PATTERNS];
  if (!pattern) {
    return false;
  }
  return pattern.test(registrationNumber.toUpperCase());
}

// Cache AHPRA details to reduce API calls
async function cacheAHPRADetails(supabaseClient: any, registrationNumber: string, details: AHPRAValidationResponse): Promise<void> {
  try {
    await supabaseClient
      .from('ahpra_validation_cache')
      .upsert({
        registration_number: registrationNumber,
        practitioner_name: details.practitionerName,
        profession: details.profession,
        speciality: details.speciality,
        registration_status: details.registrationStatus,
        registration_expiry: details.registrationExpiry,
        practice_location: details.practiceLocation,
        conditions: details.conditions || [],
        endorsements: details.endorsements || [],
        qualifications: details.qualifications || [],
        cached_at: new Date().toISOString(),
        source: details.source,
        raw_data: details
      });
  } catch (error) {
    logStep("AHPRA cache write failed", { error: error.message });
    // Don't fail the request if caching fails
  }
}

// Retrieve cached AHPRA details
async function getCachedAHPRADetails(supabaseClient: any, registrationNumber: string): Promise<AHPRAValidationResponse | null> {
  try {
    const { data, error } = await supabaseClient
      .from('ahpra_validation_cache')
      .select('*')
      .eq('registration_number', registrationNumber)
      .gte('cached_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()) // Cache for 3 days
      .single();

    if (error || !data) {
      return null;
    }

    return {
      isValid: true,
      practitionerName: data.practitioner_name,
      profession: data.profession,
      speciality: data.speciality,
      registrationStatus: data.registration_status,
      registrationExpiry: data.registration_expiry,
      practiceLocation: data.practice_location,
      conditions: data.conditions || [],
      endorsements: data.endorsements || [],
      qualifications: data.qualifications || [],
      registrationNumber: data.registration_number,
      source: 'cached',
      lastUpdated: data.cached_at
    };
  } catch (error) {
    logStep("AHPRA cache read failed", { error: error.message });
    return null;
  }
}

// Call real AHPRA Public Register API
async function validateAHPRAWithAPI(registrationNumber: string, profession: string): Promise<AHPRAValidationResponse> {
  try {
    logStep("Calling AHPRA Public Register API", { registrationNumber, profession });

    // AHPRA Public Register Search
    const searchParams = new URLSearchParams({
      'RegistrationNumber': registrationNumber,
      'Profession': profession,
      'format': 'json'
    });

    const response = await fetch(`${AHPRA_PUBLIC_REGISTER}?${searchParams}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'JB-SaaS Healthcare Platform AHPRA Validation',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`AHPRA API returned ${response.status}: ${response.statusText}`);
    }

    const searchResults: AHPRASearchResult[] = await response.json();
    logStep("AHPRA API Response", { resultCount: searchResults.length });

    if (!searchResults || searchResults.length === 0) {
      return {
        isValid: false,
        error: 'AHPRA registration number not found in Australian Health Practitioner Register',
        source: 'ahpra_api'
      };
    }

    const practitioner = searchResults[0]; // Take first match

    // Check registration status
    if (practitioner.RegistrationStatus !== 'Current') {
      return {
        isValid: false,
        error: `AHPRA registration is ${practitioner.RegistrationStatus.toLowerCase()}. Only current registrations are accepted.`,
        source: 'ahpra_api'
      };
    }

    // Check registration expiry
    const expiryDate = new Date(practitioner.RegistrationExpiryDate);
    const currentDate = new Date();
    
    if (expiryDate < currentDate) {
      return {
        isValid: false,
        error: 'AHPRA registration has expired. Please renew your registration.',
        source: 'ahpra_api'
      };
    }

    // Process conditions and endorsements
    const conditions = practitioner.Conditions?.map(c => `${c.ConditionCode}: ${c.ConditionDescription}`) || [];
    const endorsements = practitioner.Endorsements?.map(e => `${e.EndorsementCode}: ${e.EndorsementDescription}`) || [];
    const qualifications = practitioner.Qualifications?.map(q => 
      `${q.QualificationDescription} (${q.Institution}, ${q.Year})`
    ) || [];

    // Determine practice location
    const practiceLocation = practitioner.PrincipalPlaceOfPractice?.State || 'Unknown';

    return {
      isValid: true,
      practitionerName: `${practitioner.GivenName} ${practitioner.FamilyName}`,
      profession: practitioner.Profession,
      speciality: practitioner.RegistrationSubType,
      registrationStatus: 'current',
      registrationExpiry: practitioner.RegistrationExpiryDate,
      practiceLocation: practiceLocation,
      conditions: conditions,
      endorsements: endorsements,
      qualifications: qualifications,
      registrationNumber: practitioner.RegistrationNumber,
      source: 'ahpra_api',
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    logStep("AHPRA API Error", { error: error.message });
    throw new Error(`AHPRA Public Register API error: ${error.message}`);
  }
}

// Enhanced rate limiting for AHPRA API compliance
const ahpraRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkAHPRARateLimit(clientId: string): boolean {
  const now = Date.now();
  const limit = ahpraRateLimitMap.get(clientId);
  
  if (!limit || now > limit.resetTime) {
    // Reset or initialize rate limit (5 requests per minute per client for AHPRA)
    ahpraRateLimitMap.set(clientId, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 5) {
    return false; // Rate limit exceeded
  }
  
  limit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Real AHPRA validation started");

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

    const { registrationNumber, profession, practitionerName }: AHPRAValidationRequest = await req.json();
    
    if (!registrationNumber || !profession) {
      throw new Error("AHPRA registration number and profession are required");
    }

    // Clean registration number (remove spaces, convert to uppercase)
    const cleanRegistrationNumber = registrationNumber.replace(/\s/g, '').toUpperCase();
    const cleanProfession = profession.toLowerCase().replace(/\s+/g, '_');

    logStep("Validating AHPRA registration", { 
      registrationNumber: cleanRegistrationNumber, 
      profession: cleanProfession 
    });

    // Rate limiting check
    const clientId = user.id;
    if (!checkAHPRARateLimit(clientId)) {
      return new Response(JSON.stringify({
        isValid: false,
        error: "Rate limit exceeded. Please wait before making another AHPRA validation request."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // 1. Validate AHPRA registration format first
    if (!validateAHPRAFormat(cleanRegistrationNumber, cleanProfession)) {
      return new Response(JSON.stringify({
        isValid: false,
        error: `Invalid AHPRA registration format for ${profession}. Expected format: ${cleanProfession.toUpperCase().substring(0,3)}XXXXXXXXXX`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("AHPRA registration format valid");

    // 2. Check cache first to reduce API calls
    const cachedResult = await getCachedAHPRADetails(supabaseClient, cleanRegistrationNumber);
    if (cachedResult) {
      logStep("AHPRA registration found in cache", cachedResult);
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 3. Call real AHPRA API for fresh validation
    let validationResult: AHPRAValidationResponse;
    
    try {
      validationResult = await validateAHPRAWithAPI(cleanRegistrationNumber, cleanProfession);
      
      // Cache successful results
      if (validationResult.isValid) {
        await cacheAHPRADetails(supabaseClient, cleanRegistrationNumber, validationResult);
      }
      
      // Log validation for analytics
      await supabaseClient
        .from('ahpra_validation_stats')
        .insert({
          user_id: user.id,
          registration_number: cleanRegistrationNumber,
          profession: cleanProfession,
          validation_result: validationResult.isValid,
          source: validationResult.source,
          error_message: validationResult.error,
          validated_at: new Date().toISOString()
        });
      
    } catch (ahpraError) {
      logStep("AHPRA API failed, checking fallback options", { error: ahpraError.message });
      
      // Fallback: Check for any cached data (even if expired)
      const expiredCache = await supabaseClient
        .from('ahpra_validation_cache')
        .select('*')
        .eq('registration_number', cleanRegistrationNumber)
        .single();

      if (expiredCache.data) {
        logStep("Using expired AHPRA cache as fallback");
        validationResult = {
          isValid: true,
          practitionerName: expiredCache.data.practitioner_name,
          profession: expiredCache.data.profession,
          speciality: expiredCache.data.speciality,
          registrationStatus: 'current', // Assume current for expired cache
          registrationExpiry: expiredCache.data.registration_expiry,
          practiceLocation: expiredCache.data.practice_location,
          conditions: expiredCache.data.conditions || [],
          endorsements: expiredCache.data.endorsements || [],
          qualifications: expiredCache.data.qualifications || [],
          registrationNumber: cleanRegistrationNumber,
          source: 'fallback',
          lastUpdated: expiredCache.data.cached_at,
          error: 'AHPRA API temporarily unavailable - using cached data'
        };
      } else {
        // Complete fallback - format validation only
        validationResult = {
          isValid: false,
          error: 'Unable to verify AHPRA registration with Australian Health Practitioner Regulation Agency. Please try again later.',
          source: 'fallback'
        };
      }

      // Log failed validation for analytics
      await supabaseClient
        .from('ahpra_validation_stats')
        .insert({
          user_id: user.id,
          registration_number: cleanRegistrationNumber,
          profession: cleanProfession,
          validation_result: false,
          source: 'fallback',
          error_message: validationResult.error,
          validated_at: new Date().toISOString()
        });
    }

    logStep("AHPRA validation complete", validationResult);

    return new Response(JSON.stringify(validationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in AHPRA validation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      isValid: false, 
      error: errorMessage,
      source: 'error'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 