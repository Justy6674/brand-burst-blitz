import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { events } = await req.json();

    if (!Array.isArray(events)) {
      return new Response(
        JSON.stringify({ error: 'Events must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    const errors = [];

    for (const eventData of events) {
      try {
        if (eventData.operation === 'create') {
          const { data: newEvent, error } = await supabase
            .from('calendar_events')
            .insert({
              ...eventData.data,
              user_id: user.id,
            })
            .select()
            .single();

          if (error) throw error;
          results.push({ operation: 'create', event: newEvent });
          
        } else if (eventData.operation === 'update') {
          const { data: updatedEvent, error } = await supabase
            .from('calendar_events')
            .update(eventData.data)
            .eq('id', eventData.id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;
          results.push({ operation: 'update', event: updatedEvent });
          
        } else if (eventData.operation === 'delete') {
          const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', eventData.id)
            .eq('user_id', user.id);

          if (error) throw error;
          results.push({ operation: 'delete', id: eventData.id });
        }
      } catch (error) {
        errors.push({ 
          operation: eventData.operation, 
          id: eventData.id, 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: results.length, 
        errors: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk calendar operations error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);