import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateStatusRequest {
  serviceId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  completionNotes?: string;
  connectedAccounts?: any;
  qaChecklist?: any;
}

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-SETUP-STATUS] ${step}${detailsStr}`);
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
    if (!user) throw new Error("User not authenticated");
    
    // Check if user is admin
    const { data: isUserAdmin, error: adminError } = await supabaseClient
      .rpc('is_admin', { _user_id: user.id });
    
    if (adminError || !isUserAdmin) {
      throw new Error("Access denied: Admin privileges required");
    }
    
    logStep("Admin user authenticated", { userId: user.id });

    const { serviceId, status, assignedTo, completionNotes, connectedAccounts, qaChecklist }: UpdateStatusRequest = await req.json();
    
    if (!serviceId || !status) {
      throw new Error("Missing required fields: serviceId, status");
    }

    // Prepare update data
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    };

    // Add status-specific fields
    switch (status) {
      case 'in_progress':
        updateData.started_at = new Date().toISOString();
        if (assignedTo) updateData.assigned_to = assignedTo;
        break;
      case 'completed':
        updateData.completed_at = new Date().toISOString();
        if (completionNotes) updateData.completion_notes = completionNotes;
        if (connectedAccounts) updateData.connected_accounts = connectedAccounts;
        if (qaChecklist) updateData.qa_checklist = qaChecklist;
        updateData.qa_approved_by = user.id;
        updateData.qa_approved_at = new Date().toISOString();
        break;
    }

    logStep("Updating service status", { serviceId, status, updateData });

    // Update the service record
    const { data: updatedService, error: updateError } = await supabaseClient
      .from('social_setup_services')
      .update(updateData)
      .eq('id', serviceId)
      .select(`
        *,
        business_profiles (business_name),
        users (email, name)
      `)
      .single();

    if (updateError) throw new Error(`Failed to update service: ${updateError.message}`);
    
    logStep("Service updated successfully", { serviceId, newStatus: status });

    // TODO: Send notification emails based on status change
    // This would integrate with email service for customer notifications

    return new Response(JSON.stringify({ 
      success: true,
      service: updatedService
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in update setup status", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});