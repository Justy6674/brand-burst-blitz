import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupPaymentRequest {
  abn: string;
  businessName: string;
  businessAddress: any;
  planType: 'starter' | 'professional' | 'enterprise';
}

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SETUP-PAYMENT] ${step}${detailsStr}`);
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

    const { abn, businessName, businessAddress, planType }: SetupPaymentRequest = await req.json();
    
    // Validate required fields
    if (!abn || !businessName || !planType) {
      throw new Error("Missing required fields: abn, businessName, planType");
    }

    // Determine pricing based on plan type
    const pricing = {
      starter: { amount: 29900, originalAmount: 39900, description: "Starter Setup Service" },
      professional: { amount: 19900, originalAmount: 39900, description: "Professional Setup Service" },
      enterprise: { amount: 0, originalAmount: 0, description: "Enterprise Setup Service (Included)" }
    };

    const planPricing = pricing[planType];
    logStep("Plan pricing determined", { planType, pricing: planPricing });

    // For enterprise plans, create the service record without payment
    if (planType === 'enterprise') {
      const { data: serviceRecord, error: serviceError } = await supabaseClient
        .from('social_setup_services')
        .insert({
          user_id: user.id,
          abn: abn,
          business_address: businessAddress,
          amount_paid: 0,
          status: 'pending'
        })
        .select()
        .single();

      if (serviceError) throw new Error(`Failed to create service record: ${serviceError.message}`);
      
      logStep("Enterprise service record created", { serviceId: serviceRecord.id });
      
      return new Response(JSON.stringify({ 
        success: true,
        serviceId: serviceRecord.id,
        message: "Enterprise setup service included - no payment required"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For paid plans, create Stripe checkout session
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") || "https://app.lovable.dev";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: { 
              name: `${planPricing.description} - Australian Business Setup`,
              description: `Professional social media setup for Australian businesses (ABN: ${abn})`
            },
            unit_amount: planPricing.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/aussie-setup-service?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/aussie-setup-service?cancelled=true`,
      metadata: {
        user_id: user.id,
        abn: abn,
        business_name: businessName,
        plan_type: planType,
        service_type: 'aussie_social_setup'
      }
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Create pending service record
    const { data: serviceRecord, error: serviceError } = await supabaseClient
      .from('social_setup_services')
      .insert({
        user_id: user.id,
        abn: abn,
        business_address: businessAddress,
        stripe_payment_intent_id: session.id,
        amount_paid: planPricing.amount,
        status: 'pending'
      })
      .select()
      .single();

    if (serviceError) throw new Error(`Failed to create service record: ${serviceError.message}`);
    
    logStep("Service record created", { serviceId: serviceRecord.id });

    return new Response(JSON.stringify({ 
      url: session.url,
      serviceId: serviceRecord.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in setup payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});