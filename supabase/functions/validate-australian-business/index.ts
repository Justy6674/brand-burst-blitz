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

    // Simulate ABN validation (in production, integrate with ATO ABN Lookup API)
    // For demo purposes, we'll validate format and return mock data
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

    // Mock validation logic (in production, call ATO API)
    const mockValidABNs = [
      "12345678901", "98765432109", "11111111111", 
      "22222222222", "33333333333", "44444444444"
    ];
    
    const isValid = mockValidABNs.includes(abn);
    
    let response: ABNValidationResponse;
    
    if (isValid) {
      // Mock business data (in production, from ATO API response)
      const mockBusinessNames = {
        "12345678901": "Sydney Digital Solutions Pty Ltd",
        "98765432109": "Melbourne Marketing Co",
        "11111111111": "Brisbane Business Hub",
        "22222222222": "Perth Tech Services",
        "33333333333": "Adelaide Consulting Group",
        "44444444444": "Canberra Creative Agency"
      };

      response = {
        isValid: true,
        businessName: mockBusinessNames[abn as keyof typeof mockBusinessNames] || "Australian Business Pty Ltd",
        abn: abn,
        gstRegistered: true,
        status: "Active"
      };
      
      logStep("ABN validation successful", response);
    } else {
      response = {
        isValid: false,
        error: "ABN not found in Australian Business Register"
      };
      
      logStep("ABN validation failed", { abn });
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