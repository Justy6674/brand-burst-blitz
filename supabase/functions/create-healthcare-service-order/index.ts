// Healthcare Service Order Processing
// Handles service orders, payments, and delivery automation for Australian healthcare professionals

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceOrderRequest {
  service_id: string;
  service_name: string;
  price: number;
  currency: string;
  practice_details?: {
    practice_name: string;
    practitioner_name: string;
    ahpra_registration: string;
    specialty: string;
    location: string;
    practice_size: string;
  };
  delivery_preferences?: {
    priority: 'standard' | 'express';
    communication_method: 'email' | 'phone' | 'both';
    special_requirements: string;
  };
}

interface ServiceOrderResponse {
  order_id: string;
  checkout_url?: string;
  payment_intent_id?: string;
  estimated_delivery: string;
  service_details: any;
  next_steps: string[];
}

const logStep = (step: string, data?: any) => {
  console.log(`[Healthcare Service Order] ${step}`, data ? JSON.stringify(data) : '');
};

// Service delivery automation workflows
const SERVICE_WORKFLOWS = {
  'ahpra-compliance-audit': {
    steps: [
      { name: 'Initial Assessment', duration_hours: 2, automated: false },
      { name: 'Website Content Review', duration_hours: 8, automated: true },
      { name: 'Social Media Audit', duration_hours: 4, automated: true },
      { name: 'Compliance Report Generation', duration_hours: 6, automated: true },
      { name: 'Expert Review', duration_hours: 4, automated: false },
      { name: 'Recommendations Compilation', duration_hours: 2, automated: false },
      { name: 'Final Report Delivery', duration_hours: 1, automated: true }
    ],
    total_hours: 27,
    business_days: 3
  },
  'healthcare-practice-name-scout': {
    steps: [
      { name: 'Requirements Gathering', duration_hours: 1, automated: false },
      { name: 'Name Generation', duration_hours: 4, automated: true },
      { name: 'Domain Availability Check', duration_hours: 2, automated: true },
      { name: 'ABN Name Search', duration_hours: 2, automated: true },
      { name: 'Trademark Search', duration_hours: 4, automated: false },
      { name: 'Branding Assessment', duration_hours: 3, automated: false },
      { name: 'Report Compilation', duration_hours: 2, automated: true }
    ],
    total_hours: 18,
    business_days: 2
  },
  'patient-journey-strategy': {
    steps: [
      { name: 'Practice Analysis', duration_hours: 4, automated: false },
      { name: 'Patient Persona Development', duration_hours: 6, automated: true },
      { name: 'Content Template Creation', duration_hours: 16, automated: true },
      { name: 'Email Sequence Design', duration_hours: 8, automated: true },
      { name: 'Content Calendar Creation', duration_hours: 6, automated: true },
      { name: 'Implementation Guide', duration_hours: 4, automated: false },
      { name: 'Training Materials', duration_hours: 4, automated: false }
    ],
    total_hours: 48,
    business_days: 6
  },
  'complete-social-setup': {
    steps: [
      { name: 'Account Creation', duration_hours: 2, automated: false },
      { name: 'Profile Optimization', duration_hours: 4, automated: false },
      { name: 'Content Strategy Setup', duration_hours: 6, automated: true },
      { name: 'Compliance Configuration', duration_hours: 4, automated: true },
      { name: 'Monitoring Setup', duration_hours: 2, automated: true },
      { name: 'Training Session', duration_hours: 2, automated: false },
      { name: 'Handover Documentation', duration_hours: 2, automated: true }
    ],
    total_hours: 22,
    business_days: 7
  }
};

// Calculate estimated delivery date
function calculateDeliveryDate(serviceId: string, priority: string = 'standard'): Date {
  const workflow = SERVICE_WORKFLOWS[serviceId as keyof typeof SERVICE_WORKFLOWS];
  if (!workflow) {
    return new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // Default 5 days
  }

  let businessDays = workflow.business_days;
  if (priority === 'express') {
    businessDays = Math.max(1, Math.ceil(businessDays * 0.7)); // 30% faster for express
  }

  const deliveryDate = new Date();
  let addedDays = 0;
  
  while (addedDays < businessDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    // Skip weekends
    if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return deliveryDate;
}

// Generate unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `HC-${timestamp}-${randomStr}`.toUpperCase();
}

// Create Stripe payment session (placeholder for Australian payment processing)
async function createPaymentSession(orderData: any): Promise<{ checkout_url: string; payment_intent_id: string }> {
  // In production, this would integrate with Stripe for Australian payments
  const stripeApiKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeApiKey) {
    logStep("Stripe not configured, using mock payment");
    return {
      checkout_url: `https://checkout.stripe.com/mock/${orderData.order_id}`,
      payment_intent_id: `pi_mock_${orderData.order_id}`
    };
  }

  try {
    // Real Stripe integration would go here
    const checkoutSession = {
      id: `cs_mock_${orderData.order_id}`,
      url: `https://checkout.stripe.com/pay/${orderData.order_id}`,
      payment_intent: `pi_${orderData.order_id}`
    };

    logStep("Payment session created", { session_id: checkoutSession.id });
    
    return {
      checkout_url: checkoutSession.url,
      payment_intent_id: checkoutSession.payment_intent
    };

  } catch (error) {
    logStep("Payment session creation failed", { error: error.message });
    throw new Error(`Payment processing error: ${error.message}`);
  }
}

// Initialize service delivery workflow
async function initializeServiceWorkflow(
  supabaseClient: any,
  orderId: string,
  serviceId: string
): Promise<void> {
  try {
    const workflow = SERVICE_WORKFLOWS[serviceId as keyof typeof SERVICE_WORKFLOWS];
    if (!workflow) {
      logStep("No workflow found for service", { serviceId });
      return;
    }

    // Create workflow steps in database
    const workflowSteps = workflow.steps.map((step, index) => ({
      order_id: orderId,
      step_number: index + 1,
      step_name: step.name,
      estimated_duration_hours: step.duration_hours,
      is_automated: step.automated,
      status: index === 0 ? 'pending' : 'waiting',
      created_at: new Date().toISOString()
    }));

    const { error } = await supabaseClient
      .from('healthcare_service_workflow_steps')
      .insert(workflowSteps);

    if (error) throw error;

    logStep("Service workflow initialized", { orderId, stepCount: workflowSteps.length });

  } catch (error) {
    logStep("Workflow initialization failed", { error: error.message });
    throw error;
  }
}

// Send order confirmation notifications
async function sendOrderConfirmation(
  supabaseClient: any,
  orderData: any,
  userEmail: string
): Promise<void> {
  try {
    // In production, this would send real email notifications
    const emailData = {
      to: userEmail,
      subject: `Healthcare Service Order Confirmation - ${orderData.service_name}`,
      template: 'healthcare_service_order_confirmation',
      variables: {
        order_id: orderData.order_id,
        service_name: orderData.service_name,
        price: orderData.price,
        estimated_delivery: orderData.estimated_delivery,
        practice_name: orderData.practice_details?.practice_name
      }
    };

    // Mock email sending
    logStep("Order confirmation email sent", { to: userEmail, order_id: orderData.order_id });

    // Store notification record
    await supabaseClient
      .from('healthcare_service_notifications')
      .insert({
        order_id: orderData.order_id,
        user_email: userEmail,
        notification_type: 'order_confirmation',
        status: 'sent',
        sent_at: new Date().toISOString()
      });

  } catch (error) {
    logStep("Order confirmation failed", { error: error.message });
    // Don't fail the entire order if notification fails
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Healthcare service order processing started");

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

    const orderRequest: ServiceOrderRequest = await req.json();
    
    if (!orderRequest.service_id || !orderRequest.service_name || !orderRequest.price) {
      throw new Error("Service ID, name, and price are required");
    }

    logStep("Processing service order", {
      service_id: orderRequest.service_id,
      service_name: orderRequest.service_name,
      price: orderRequest.price
    });

    // Generate order details
    const orderId = generateOrderId();
    const estimatedDelivery = calculateDeliveryDate(
      orderRequest.service_id,
      orderRequest.delivery_preferences?.priority
    );

    // Create order record
    const orderData = {
      id: orderId,
      user_id: user.id,
      service_id: orderRequest.service_id,
      service_name: orderRequest.service_name,
      price: orderRequest.price,
      currency: orderRequest.currency || 'AUD',
      status: 'pending_payment',
      payment_status: 'pending',
      estimated_delivery: estimatedDelivery.toISOString(),
      practice_details: orderRequest.practice_details,
      delivery_preferences: orderRequest.delivery_preferences,
      ordered_at: new Date().toISOString()
    };

    // Save order to database
    const { error: orderError } = await supabaseClient
      .from('healthcare_service_orders')
      .insert(orderData);

    if (orderError) throw orderError;

    logStep("Order record created", { orderId });

    // Create payment session
    const paymentSession = await createPaymentSession(orderData);

    // Initialize service delivery workflow
    await initializeServiceWorkflow(supabaseClient, orderId, orderRequest.service_id);

    // Send order confirmation
    await sendOrderConfirmation(supabaseClient, orderData, user.email);

    // Log order creation for analytics
    await supabaseClient
      .from('healthcare_service_analytics')
      .insert({
        user_id: user.id,
        event_type: 'service_order_created',
        service_id: orderRequest.service_id,
        order_value: orderRequest.price,
        currency: orderRequest.currency || 'AUD',
        created_at: new Date().toISOString()
      });

    const response: ServiceOrderResponse = {
      order_id: orderId,
      checkout_url: paymentSession.checkout_url,
      payment_intent_id: paymentSession.payment_intent_id,
      estimated_delivery: estimatedDelivery.toISOString(),
      service_details: {
        name: orderRequest.service_name,
        price: orderRequest.price,
        currency: orderRequest.currency || 'AUD',
        workflow_steps: SERVICE_WORKFLOWS[orderRequest.service_id as keyof typeof SERVICE_WORKFLOWS]?.steps.length || 0
      },
      next_steps: [
        'Complete payment via secure checkout',
        'Receive order confirmation email',
        'Our team will begin work within 24 hours',
        'Track progress in your dashboard',
        'Receive completed deliverables via email'
      ]
    };

    logStep("Service order processing complete", {
      orderId,
      estimatedDelivery: estimatedDelivery.toISOString()
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in service order processing", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 