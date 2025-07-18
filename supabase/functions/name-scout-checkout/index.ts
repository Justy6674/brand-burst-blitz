import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NAME-SCOUT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Parse request body
    const { 
      businessName, 
      domainExtensions, 
      includeTrademarkScreening,
      userTier 
    } = await req.json();

    logStep("Request data received", { 
      businessName, 
      domainExtensions, 
      includeTrademarkScreening, 
      userTier 
    });

    // Create Supabase client with anon key for user auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Calculate pricing based on tier
    let basePrice = 9900; // AU$99 default
    if (userTier === 'Professional') {
      basePrice = 7900; // AU$79 for Professional plan
    } else if (userTier === 'Enterprise') {
      basePrice = 0; // Free for Enterprise plan
    }

    // Add trademark screening cost if selected and not Professional/Enterprise
    let trademarkPrice = 0;
    if (includeTrademarkScreening && userTier !== 'Professional' && userTier !== 'Enterprise') {
      trademarkPrice = 5000; // AU$50 extra
    }

    const totalPrice = basePrice + trademarkPrice;
    logStep("Pricing calculated", { basePrice, trademarkPrice, totalPrice, userTier });

    // If Enterprise plan (free), create request directly
    if (totalPrice === 0) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data: request, error: insertError } = await supabaseService
        .from('name_scout_requests')
        .insert({
          user_id: user.id,
          requested_name: businessName,
          domain_extensions: domainExtensions,
          include_trademark_screening: includeTrademarkScreening,
          trademark_screening_paid: includeTrademarkScreening,
          amount_paid: 0,
          payment_status: 'completed',
          request_status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to create request: ${insertError.message}`);
      
      logStep("Enterprise request created", { requestId: request.id });
      
      return new Response(JSON.stringify({ 
        success: true,
        requestId: request.id,
        message: "Request created successfully - included in your Enterprise plan" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For paid plans, create Stripe checkout
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    logStep("Stripe customer check", { customerId });

    // Create line items
    const lineItems = [{
      price_data: {
        currency: "aud",
        product_data: { 
          name: "Aussie Name & Domain Scout",
          description: `Business name: "${businessName}" | Domains: ${domainExtensions.join(', ')}`
        },
        unit_amount: basePrice,
      },
      quantity: 1,
    }];

    if (trademarkPrice > 0) {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: { 
            name: "Trademark Screening Add-on",
            description: "IP Australia trademark search and analysis"
          },
          unit_amount: trademarkPrice,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?name-scout=success`,
      cancel_url: `${req.headers.get("origin")}/dashboard?name-scout=cancelled`,
      metadata: {
        user_id: user.id,
        business_name: businessName,
        domain_extensions: JSON.stringify(domainExtensions),
        include_trademark_screening: includeTrademarkScreening.toString(),
        service_type: 'name_scout'
      }
    });

    logStep("Stripe checkout session created", { sessionId: session.id, amount: totalPrice });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in name-scout-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});