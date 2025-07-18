import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  error?: string;
}

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ABN-VALIDATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { abn }: ABNValidationRequest = await req.json();
    
    if (!abn || abn.length !== 11) {
      throw new Error("ABN must be exactly 11 digits");
    }

    logStep("Validating ABN", { abn });

    // Real ABN validation using ATO ABN Lookup Web Services
    const isValidFormat = /^\d{11}$/.test(abn);
    
    if (!isValidFormat) {
      const response: ABNValidationResponse = {
        isValid: false,
        error: "Invalid ABN format. Must be 11 digits."
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Real ATO ABN Lookup API call
    const atoApiUrl = `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${abn}&callback=`;
    logStep("Calling ATO ABN Lookup API", { url: atoApiUrl });
    
    try {
      const atoResponse = await fetch(atoApiUrl, {
        headers: {
          'User-Agent': 'JBSAAS ABN Validation Service',
          'Accept': 'application/json'
        }
      });
      
      if (!atoResponse.ok) {
        throw new Error(`ATO API returned ${atoResponse.status}: ${atoResponse.statusText}`);
      }
      
      const responseText = await atoResponse.text();
      logStep("ATO API raw response", { response: responseText.substring(0, 200) });
      
      // Parse JSONP response (remove callback wrapper if present)
      const jsonString = responseText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      const atoData = JSON.parse(jsonString);
      
      logStep("Parsed ATO data", atoData);
      
      // Check if ABN is valid and active
      const isActive = atoData?.Abn?.AbnStatus === '1'; // '1' means active
      const businessName = atoData?.Abn?.EntityName?.[0]?.OrganisationName || 
                          atoData?.Abn?.EntityName?.[0]?.PersonNameDetails?.GivenName + ' ' + 
                          atoData?.Abn?.EntityName?.[0]?.PersonNameDetails?.FamilyName;
      
      // Check GST registration
      const gstRegistered = atoData?.Abn?.Goods_and_Services_Tax?.[0]?.EffectiveTo === '0001-01-01T00:00:00+00:00';
      
      let response: ABNValidationResponse;
      
      if (isActive && businessName) {
        response = {
          isValid: true,
          businessName: businessName.trim(),
          abn: abn,
          gstRegistered: gstRegistered,
          status: "Active"
        };
        
        logStep("ABN validation successful", response);
      } else if (!isActive) {
        response = {
          isValid: false,
          error: "ABN exists but is not currently active"
        };
        
        logStep("ABN inactive", { abn });
      } else {
        response = {
          isValid: false,
          error: "ABN not found in Australian Business Register"
        };
        
        logStep("ABN not found", { abn });
      }
      
    } catch (apiError) {
      logStep("ATO API error", { error: apiError });
      
      // Fallback to basic validation if ATO API fails
      response = {
        isValid: false,
        error: "Unable to verify ABN at this time. Please try again later."
      };
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ABN validation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      isValid: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});