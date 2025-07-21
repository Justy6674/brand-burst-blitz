import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AHPRAValidationRequest {
  registrationNumber: string;
  practiceType?: string;
}

interface AHPRAValidationResponse {
  isValid: boolean;
  practitionerName?: string;
  registrationNumber?: string;
  profession?: string;
  speciality?: string;
  registrationStatus?: string;
  registrationExpiry?: string;
  conditions?: string[];
  practiceLocation?: string;
  error?: string;
}

// Helper function to validate AHPRA registration number format
const validateAHPRAFormat = (regNumber: string): boolean => {
  // AHPRA registration numbers typically follow format: ABC1234567890
  // Where ABC is profession code (e.g., MED, DEN, PSY, etc.) followed by 10 digits
  const ahpraPattern = /^[A-Z]{3}\d{10}$/;
  return ahpraPattern.test(regNumber.toUpperCase());
};

// Helper function to extract profession from AHPRA number
const extractProfession = (regNumber: string): string => {
  const professionCodes: { [key: string]: string } = {
    'MED': 'Medical Practitioner',
    'DEN': 'Dentist',
    'PSY': 'Psychologist',
    'NUR': 'Nurse',
    'PHA': 'Pharmacist',
    'PHY': 'Physiotherapist',
    'OCC': 'Occupational Therapist',
    'OPT': 'Optometrist',
    'POD': 'Podiatrist',
    'CHI': 'Chiropractor',
    'OST': 'Osteopath'
  };
  
  const prefix = regNumber.substring(0, 3).toUpperCase();
  return professionCodes[prefix] || 'Unknown Profession';
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AHPRA-VALIDATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("AHPRA validation function started");

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

    const { registrationNumber, practiceType }: AHPRAValidationRequest = await req.json();
    
    if (!registrationNumber) {
      throw new Error("AHPRA registration number is required");
    }

    logStep("Validating AHPRA registration", { registrationNumber });

    // Validate format first
    if (!validateAHPRAFormat(registrationNumber)) {
      const response: AHPRAValidationResponse = {
        isValid: false,
        error: "Invalid AHPRA registration number format. Should be ABC1234567890 (3 letters + 10 digits)"
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // In production, this would integrate with AHPRA's public register API
    // For now, we'll use mock validation with some realistic test numbers
    const mockValidRegistrations = {
      "MED0001234567": {
        practitionerName: "Dr. Sarah Johnson",
        profession: "Medical Practitioner",
        speciality: "General Practice",
        registrationStatus: "Active",
        registrationExpiry: "2025-12-31",
        conditions: [],
        practiceLocation: "NSW"
      },
      "DEN0002345678": {
        practitionerName: "Dr. Michael Chen",
        profession: "Dentist",
        speciality: "General Dentistry",
        registrationStatus: "Active",
        registrationExpiry: "2026-03-15",
        conditions: [],
        practiceLocation: "VIC"
      },
      "PSY0003456789": {
        practitionerName: "Dr. Emma Thompson",
        profession: "Psychologist",
        speciality: "Clinical Psychology",
        registrationStatus: "Active",
        registrationExpiry: "2025-08-20",
        conditions: ["Supervision required for certain practices"],
        practiceLocation: "QLD"
      },
      "NUR0004567890": {
        practitionerName: "Jane Smith",
        profession: "Registered Nurse",
        speciality: "Adult Health",
        registrationStatus: "Active",
        registrationExpiry: "2025-11-10",
        conditions: [],
        practiceLocation: "SA"
      },
      "PHY0005678901": {
        practitionerName: "David Wilson",
        profession: "Physiotherapist",
        speciality: "Musculoskeletal",
        registrationStatus: "Active",
        registrationExpiry: "2026-01-25",
        conditions: [],
        practiceLocation: "WA"
      }
    };

    const registrationData = mockValidRegistrations[registrationNumber.toUpperCase() as keyof typeof mockValidRegistrations];
    
    let response: AHPRAValidationResponse;
    
    if (registrationData) {
      // Log successful validation for audit
      await supabaseClient
        .from('ahpra_validation_audit')
        .insert([{
          user_id: user.id,
          registration_number: registrationNumber,
          validation_result: 'valid',
          practitioner_name: registrationData.practitionerName,
          profession: registrationData.profession,
          validated_at: new Date().toISOString()
        }]);

      response = {
        isValid: true,
        practitionerName: registrationData.practitionerName,
        registrationNumber: registrationNumber,
        profession: registrationData.profession,
        speciality: registrationData.speciality,
        registrationStatus: registrationData.registrationStatus,
        registrationExpiry: registrationData.registrationExpiry,
        conditions: registrationData.conditions,
        practiceLocation: registrationData.practiceLocation
      };
      
      logStep("AHPRA validation successful", response);
    } else {
      // Log failed validation attempt
      await supabaseClient
        .from('ahpra_validation_audit')
        .insert([{
          user_id: user.id,
          registration_number: registrationNumber,
          validation_result: 'invalid',
          validated_at: new Date().toISOString()
        }]);

      response = {
        isValid: false,
        error: "AHPRA registration number not found in public register"
      };
      
      logStep("AHPRA validation failed", { registrationNumber });
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in AHPRA validation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      isValid: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 