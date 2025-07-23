import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paddle-signature',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paddleWebhookSecret = Deno.env.get('PADDLE_WEBHOOK_SECRET');
    if (!paddleWebhookSecret) {
      throw new Error('Paddle webhook secret not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature
    const signature = req.headers.get('paddle-signature');
    const body = await req.text();
    
    if (!signature || !verifyWebhookSignature(body, signature, paddleWebhookSecret)) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }

    const webhookData = JSON.parse(body);
    const eventType = webhookData.event_type;
    const data = webhookData.data;

    console.log(`Processing Paddle webhook: ${eventType}`, data);

    // Log webhook for debugging
    await supabase
      .from('paddle_webhook_logs')
      .insert({
        event_type: eventType,
        event_data: webhookData,
        processed_at: new Date().toISOString()
      });

    switch (eventType) {
      case 'subscription.created':
        await handleSubscriptionCreated(supabase, data);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(supabase, data);
        break;
        
      case 'subscription.canceled':
        await handleSubscriptionCanceled(supabase, data);
        break;
        
      case 'transaction.completed':
        await handleTransactionCompleted(supabase, data);
        break;
        
      case 'transaction.payment_failed':
        await handlePaymentFailed(supabase, data);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Paddle webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  try {
    // Extract timestamp and signature from header
    const parts = signature.split(';');
    const timestamp = parts.find(part => part.startsWith('ts='))?.substring(3);
    const sig = parts.find(part => part.startsWith('h1='))?.substring(3);

    if (!timestamp || !sig) {
      return false;
    }

    // Create expected signature
    const payload = `${timestamp}:${body}`;
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const data = encoder.encode(payload);
    
    return crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(cryptoKey => 
      crypto.subtle.sign('HMAC', cryptoKey, data)
    ).then(signature => {
      const expectedSig = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      return expectedSig === sig;
    }).catch(() => false);

  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function handleSubscriptionCreated(supabase: any, data: any) {
  try {
    const customData = data.custom_data || {};
    const userId = customData.user_id;
    
    if (!userId) {
      console.error('No user_id in subscription custom_data');
      return;
    }

    // Create subscription record
    const { error: subError } = await supabase
      .from('paddle_subscriptions')
      .insert({
        user_id: userId,
        paddle_subscription_id: data.id,
        paddle_customer_id: data.customer_id,
        product_id: customData.plan_id,
        status: data.status,
        current_period_start: data.current_billing_period?.starts_at,
        current_period_end: data.current_billing_period?.ends_at,
        trial_end: data.trial_dates?.ends_at,
        created_at: data.created_at
      });

    if (subError) {
      console.error('Error creating subscription:', subError);
      return;
    }

    // Send welcome Slack notification
    await supabase
      .from('notification_queue')
      .insert({
        user_id: userId,
        notification_type: 'slack',
        message_data: {
          type: 'general',
          message: `🎉 Welcome to your Healthcare Marketing Platform! Your ${customData.plan_name || 'subscription'} is now active.`,
          channel: '#general'
        },
        scheduled_for: new Date().toISOString(),
        status: 'pending',
        attempts: 0
      });

    console.log('Subscription created successfully for user:', userId);
    
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('paddle_subscriptions')
      .update({
        status: data.status,
        current_period_start: data.current_billing_period?.starts_at,
        current_period_end: data.current_billing_period?.ends_at,
        trial_end: data.trial_dates?.ends_at,
        updated_at: new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id);

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('Subscription updated:', data.id);
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCanceled(supabase: any, data: any) {
  try {
    const { data: subscription, error: fetchError } = await supabase
      .from('paddle_subscriptions')
      .select('user_id')
      .eq('paddle_subscription_id', data.id)
      .single();

    if (fetchError) {
      console.error('Error fetching subscription for cancellation:', fetchError);
      return;
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from('paddle_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: data.canceled_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id);

    if (updateError) {
      console.error('Error updating canceled subscription:', updateError);
      return;
    }

    // Send cancellation notification
    if (subscription.user_id) {
      await supabase
        .from('notification_queue')
        .insert({
          user_id: subscription.user_id,
          notification_type: 'slack',
          message_data: {
            type: 'general',
            message: '📋 Your subscription has been canceled. You can continue using the platform until your current billing period ends.',
            channel: '#general'
          },
          scheduled_for: new Date().toISOString(),
          status: 'pending',
          attempts: 0
        });
    }

    console.log('Subscription canceled:', data.id);
    
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleTransactionCompleted(supabase: any, data: any) {
  try {
    const customData = data.custom_data || {};
    const userId = customData.user_id;

    // Record transaction
    const { error: transError } = await supabase
      .from('paddle_transactions')
      .insert({
        user_id: userId,
        paddle_transaction_id: data.id,
        paddle_subscription_id: data.subscription_id,
        amount: data.details?.totals?.total,
        currency: data.currency_code,
        status: data.status,
        created_at: data.created_at
      });

    if (transError) {
      console.error('Error recording transaction:', transError);
    }

    // Send payment confirmation if user_id available
    if (userId) {
      await supabase
        .from('notification_queue')
        .insert({
          user_id: userId,
          notification_type: 'slack',
          message_data: {
            type: 'general',
            message: `💳 Payment successful! Your healthcare marketing platform subscription is active.`,
            channel: '#general'
          },
          scheduled_for: new Date().toISOString(),
          status: 'pending',
          attempts: 0
        });
    }

    console.log('Transaction completed:', data.id);
    
  } catch (error) {
    console.error('Error handling transaction completion:', error);
  }
}

async function handlePaymentFailed(supabase: any, data: any) {
  try {
    const customData = data.custom_data || {};
    const userId = customData.user_id;

    // Record failed transaction
    const { error: transError } = await supabase
      .from('paddle_transactions')
      .insert({
        user_id: userId,
        paddle_transaction_id: data.id,
        paddle_subscription_id: data.subscription_id,
        amount: data.details?.totals?.total,
        currency: data.currency_code,
        status: 'failed',
        created_at: data.created_at
      });

    if (transError) {
      console.error('Error recording failed transaction:', transError);
    }

    // Send payment failure notification
    if (userId) {
      await supabase
        .from('notification_queue')
        .insert({
          user_id: userId,
          notification_type: 'slack',
          message_data: {
            type: 'general',
            message: '⚠️ Payment failed for your healthcare platform subscription. Please update your payment method to avoid service interruption.',
            channel: '#general'
          },
          scheduled_for: new Date().toISOString(),
          status: 'pending',
          attempts: 0
        });
    }

    console.log('Payment failed for transaction:', data.id);
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

serve(handler);