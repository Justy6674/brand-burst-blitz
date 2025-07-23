import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  plan_id: string;
  customer_email: string;
  user_id: string;
  custom_data?: Record<string, any>;
  success_url: string;
  cancel_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paddleApiKey = Deno.env.get('PADDLE_API_KEY');
    const paddleEnvironment = Deno.env.get('PADDLE_ENVIRONMENT') || 'sandbox';
    
    if (!paddleApiKey) {
      throw new Error('Paddle API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData: CheckoutRequest = await req.json();
    const { plan_id, customer_email, user_id, custom_data, success_url, cancel_url } = requestData;

    // Healthcare plan configurations
    const healthcarePlans = {
      'healthcare_starter_monthly': {
        name: 'Healthcare Starter',
        price: 4900, // $49.00 in cents
        currency: 'AUD',
        billing_cycle: 'month',
        trial_days: 14
      },
      'healthcare_professional_monthly': {
        name: 'Healthcare Professional',
        price: 9900, // $99.00 in cents
        currency: 'AUD',
        billing_cycle: 'month',
        trial_days: 14
      },
      'healthcare_enterprise_monthly': {
        name: 'Healthcare Enterprise',
        price: 19900, // $199.00 in cents
        currency: 'AUD',
        billing_cycle: 'month',
        trial_days: 14
      }
    };

    const selectedPlan = healthcarePlans[plan_id as keyof typeof healthcarePlans];
    if (!selectedPlan) {
      throw new Error('Invalid plan selected');
    }

    // Create Paddle checkout session
    const paddleBaseUrl = paddleEnvironment === 'production' 
      ? 'https://api.paddle.com' 
      : 'https://sandbox-api.paddle.com';

    const checkoutData = {
      items: [{
        quantity: 1,
        price: {
          description: selectedPlan.name,
          name: selectedPlan.name,
          billing_cycle: {
            interval: selectedPlan.billing_cycle,
            frequency: 1
          },
          trial_period: {
            interval: 'day',
            frequency: selectedPlan.trial_days
          },
          unit_price: {
            amount: selectedPlan.price.toString(),
            currency_code: selectedPlan.currency
          },
          product: {
            name: selectedPlan.name,
            description: `Healthcare marketing platform subscription - ${selectedPlan.name}`,
            type: 'service'
          }
        }
      }],
      customer: {
        email: customer_email
      },
      settings: {
        success_url: success_url,
        cancel_url: cancel_url,
        locale: 'en'
      },
      custom_data: {
        user_id,
        plan_id,
        ...custom_data
      }
    };

    console.log('Creating Paddle checkout with data:', JSON.stringify(checkoutData, null, 2));

    const paddleResponse = await fetch(`${paddleBaseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData)
    });

    if (!paddleResponse.ok) {
      const errorText = await paddleResponse.text();
      console.error('Paddle API error:', paddleResponse.status, errorText);
      throw new Error(`Paddle API error: ${paddleResponse.status} - ${errorText}`);
    }

    const checkoutResult = await paddleResponse.json();
    console.log('Paddle checkout created:', checkoutResult);

    // Store checkout session in database for tracking
    const { error: dbError } = await supabase
      .from('paddle_checkout_sessions')
      .insert({
        user_id,
        checkout_id: checkoutResult.data?.id,
        plan_id,
        customer_email,
        status: 'pending',
        checkout_url: checkoutResult.data?.url,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Error storing checkout session:', dbError);
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutResult.data?.url,
        checkout_id: checkoutResult.data?.id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Paddle checkout error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create checkout session' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
};

serve(handler);