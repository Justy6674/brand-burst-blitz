import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InterestFormData {
  name: string;
  email: string;
  businessName: string;
  industry: string;
  isAustralian: boolean;
  currentChallenges: string[];
  monthlyMarketingSpend: string;
  teamSize: string;
  primaryGoals: string[];
  wantsUpdates: boolean;
  heardAboutUs: string;
  additionalNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: InterestFormData = await req.json();

    // Create Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the interest registration directly into the database
    const { error } = await supabase
      .from('interest_registrations')
      .insert([{
        name: formData.name,
        email: formData.email,
        business_name: formData.businessName,
        industry: formData.industry,
        is_australian: formData.isAustralian,
        current_challenges: formData.currentChallenges,
        monthly_marketing_spend: formData.monthlyMarketingSpend,
        team_size: formData.teamSize,
        primary_goals: formData.primaryGoals,
        wants_updates: formData.wantsUpdates,
        heard_about_us: formData.heardAboutUs,
        additional_notes: formData.additionalNotes,
      }]);

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    console.log("Interest registration saved successfully for:", formData.email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in save-interest function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);