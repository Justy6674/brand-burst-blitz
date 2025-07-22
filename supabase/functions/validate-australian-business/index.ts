import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

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
  entityType?: string;
  postcodeState?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { abn }: ABNValidationRequest = await req.json();

    if (!abn) {
      throw new Error('ABN is required');
    }

    // Clean ABN (remove spaces and non-numeric characters)
    const cleanABN = abn.replace(/\s/g, '').replace(/[^0-9]/g, '');

    // Basic ABN validation (11 digits)
    if (cleanABN.length !== 11) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          error: 'ABN must be 11 digits' 
        } as ABNValidationResponse),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mock validation for development (replace with real ATO API)
    const mockBusinessData: ABNValidationResponse = {
      isValid: true,
      businessName: "Sample Australian Healthcare Practice",
      abn: cleanABN,
      gstRegistered: true,
      status: "Active",
      entityType: "Individual/Sole Trader",
      postcodeState: "NSW"
    };

    return new Response(
      JSON.stringify(mockBusinessData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('ABN validation error:', error);
    
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        error: error.message 
      } as ABNValidationResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});