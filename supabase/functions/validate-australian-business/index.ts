// Real Australian Business Number (ABN) Validation via ATO Business Register API
// Replaces mock validation with authentic government data verification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ABNValidationRequest {
  abn: string;
}

interface ABNValidationResponse {
  isValid: boolean;
  businessName?: string;
  abn?: string;
  gstRegistered?: boolean;
  status?: string;
  entityType?: string;
  postcodeState?: string;
  gstStatusEffectiveFrom?: string;
  businessRegistrationDate?: string;
  error?: string;
  source?: 'ato_api' | 'cached' | 'fallback';
  lastUpdated?: string;
}

interface ATOBusinessDetails {
  Abn: string;
  AbnStatus: string;
  AbnStatusFromDate: string;
  EntityName: string;
  EntityTypeCode: string;
  EntityTypeName: string;
  GstStatus?: string;
  GstStatusFromDate?: string;
  BusinessName?: Array<{
    OrganisationName: string;
    IsCurrentIndicator: string;
  }>;
  AddressPostcode?: string;
  AddressState?: string;
  IsCurrentIndicator: string;
}

const logStep = (step: string, data?: any) => {
  console.log(`[ABN Validation] ${step}`, data ? JSON.stringify(data) : '');
};

// ATO Business Register API configuration
const ATO_ABN_API_BASE = 'https://abr.business.gov.au/json/AbnDetails.aspx';
const ATO_GUID = Deno.env.get('ATO_ABN_LOOKUP_GUID') || 'f8e9f7f4-8c7b-4e5d-a2b3-1f2e3d4c5b6a'; // Register at business.gov.au

// ABN checksum validation (Australian standard algorithm)
function validateABNChecksum(abn: string): boolean {
  if (!abn || abn.length !== 11 || !/^\d{11}$/.test(abn)) {
    return false;
  }
  
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = abn.split('').map(Number);
  
  // Subtract 1 from the first digit (ATO algorithm requirement)
  digits[0] = digits[0] - 1;
  
  // Calculate weighted sum
  const sum = digits.reduce((total, digit, index) => total + (digit * weights[index]), 0);
  
  // Check if divisible by 89 (ATO validation rule)
  return sum % 89 === 0;
}

// Cache ABN details to reduce API calls and improve performance
async function cacheABNDetails(supabaseClient: any, abn: string, details: ABNValidationResponse): Promise<void> {
  try {
    await supabaseClient
      .from('abn_validation_cache')
      .upsert({
        abn: abn,
        business_name: details.businessName,
        entity_type: details.entityType,
        status: details.status,
        gst_registered: details.gstRegistered,
        postcode_state: details.postcodeState,
        cached_at: new Date().toISOString(),
        source: details.source,
        raw_data: details
      });
  } catch (error) {
    logStep("Cache write failed", { error: error.message });
    // Don't fail the request if caching fails
  }
}

// Retrieve cached ABN details
async function getCachedABNDetails(supabaseClient: any, abn: string): Promise<ABNValidationResponse | null> {
  try {
    const { data, error } = await supabaseClient
      .from('abn_validation_cache')
      .select('*')
      .eq('abn', abn)
      .gte('cached_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Cache for 7 days
      .single();

    if (error || !data) {
      return null;
    }

    return {
      isValid: true,
      businessName: data.business_name,
      abn: data.abn,
      entityType: data.entity_type,
      status: data.status,
      gstRegistered: data.gst_registered,
      postcodeState: data.postcode_state,
      source: 'cached',
      lastUpdated: data.cached_at
    };
  } catch (error) {
    logStep("Cache read failed", { error: error.message });
    return null;
  }
}

// Call real ATO Business Register API
async function validateABNWithATO(abn: string): Promise<ABNValidationResponse> {
  try {
    logStep("Calling ATO Business Register API", { abn });

    const atoUrl = `${ATO_ABN_API_BASE}?abn=${abn}&guid=${ATO_GUID}&callback=`;
    
    const response = await fetch(atoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'JB-SaaS Healthcare Platform ABN Validation',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`ATO API returned ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    
    // ATO returns JSONP, need to extract JSON
    let jsonData: ATOBusinessDetails;
    try {
      // Remove JSONP callback wrapper if present
      const jsonText = responseText.replace(/^\w+\(/, '').replace(/\);?$/, '');
      jsonData = JSON.parse(jsonText);
    } catch (parseError) {
      // If not JSONP, try parsing as direct JSON
      jsonData = JSON.parse(responseText);
    }

    logStep("ATO API Response", jsonData);

    // Check if ABN exists and is active
    if (!jsonData.Abn || jsonData.AbnStatus !== 'Active') {
      return {
        isValid: false,
        error: jsonData.AbnStatus === 'Cancelled' 
          ? 'ABN has been cancelled and is no longer valid'
          : 'ABN not found or inactive in Australian Business Register',
        source: 'ato_api'
      };
    }

    // Extract business name (prioritize current business name)
    let businessName = jsonData.EntityName;
    if (jsonData.BusinessName && jsonData.BusinessName.length > 0) {
      const currentBusinessName = jsonData.BusinessName.find(bn => bn.IsCurrentIndicator === 'Y');
      if (currentBusinessName) {
        businessName = currentBusinessName.OrganisationName;
      }
    }

    // Process GST status
    const gstRegistered = jsonData.GstStatus === 'Current';
    
    return {
      isValid: true,
      businessName: businessName,
      abn: jsonData.Abn,
      gstRegistered: gstRegistered,
      status: jsonData.AbnStatus,
      entityType: jsonData.EntityTypeName,
      postcodeState: jsonData.AddressState,
      gstStatusEffectiveFrom: jsonData.GstStatusFromDate,
      businessRegistrationDate: jsonData.AbnStatusFromDate,
      source: 'ato_api',
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    logStep("ATO API Error", { error: error.message });
    throw new Error(`ATO Business Register API error: ${error.message}`);
  }
}

// Enhanced rate limiting for ATO API compliance
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(clientId);
  
  if (!limit || now > limit.resetTime) {
    // Reset or initialize rate limit (10 requests per minute per client)
    rateLimitMap.set(clientId, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 10) {
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
    logStep("Real ABN validation started");

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

    const { abn }: ABNValidationRequest = await req.json();
    
    if (!abn) {
      throw new Error("ABN is required");
    }

    // Clean ABN input (remove spaces, hyphens)
    const cleanABN = abn.replace(/[^0-9]/g, '');
    
    if (cleanABN.length !== 11) {
      return new Response(JSON.stringify({
        isValid: false,
        error: "ABN must be exactly 11 digits"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Validating ABN", { abn: cleanABN });

    // Rate limiting check
    const clientId = user.id;
    if (!checkRateLimit(clientId)) {
      return new Response(JSON.stringify({
        isValid: false,
        error: "Rate limit exceeded. Please wait before making another request."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // 1. Validate ABN checksum first (quick local validation)
    if (!validateABNChecksum(cleanABN)) {
      return new Response(JSON.stringify({
        isValid: false,
        error: "Invalid ABN format. Checksum validation failed."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("ABN checksum valid");

    // 2. Check cache first to reduce API calls
    const cachedResult = await getCachedABNDetails(supabaseClient, cleanABN);
    if (cachedResult) {
      logStep("ABN found in cache", cachedResult);
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 3. Call real ATO API for fresh validation
    let validationResult: ABNValidationResponse;
    
    try {
      validationResult = await validateABNWithATO(cleanABN);
      
      // Cache successful results
      if (validationResult.isValid) {
        await cacheABNDetails(supabaseClient, cleanABN, validationResult);
      }
      
    } catch (atoError) {
      logStep("ATO API failed, falling back", { error: atoError.message });
      
      // Fallback: Check for any cached data (even if expired)
      const expiredCache = await supabaseClient
        .from('abn_validation_cache')
        .select('*')
        .eq('abn', cleanABN)
        .single();

      if (expiredCache.data) {
        logStep("Using expired cache as fallback");
        validationResult = {
          isValid: true,
          businessName: expiredCache.data.business_name,
          abn: expiredCache.data.abn,
          entityType: expiredCache.data.entity_type,
          status: expiredCache.data.status,
          gstRegistered: expiredCache.data.gst_registered,
          postcodeState: expiredCache.data.postcode_state,
          source: 'fallback',
          lastUpdated: expiredCache.data.cached_at,
          error: 'ATO API temporarily unavailable - using cached data'
        };
      } else {
        // Complete fallback - basic format validation only
        validationResult = {
          isValid: false,
          error: 'Unable to verify ABN with Australian Business Register. Please try again later.',
          source: 'fallback'
        };
      }
    }

    logStep("ABN validation complete", validationResult);

    return new Response(JSON.stringify(validationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ABN validation", { message: errorMessage });
    
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