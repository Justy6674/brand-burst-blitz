import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  id?: string;
  business_id?: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  all_day?: boolean;
  status?: 'confirmed' | 'tentative' | 'cancelled' | 'draft';
  event_type?: 'general' | 'post' | 'blog' | 'campaign' | 'meeting' | 'deadline' | 'review' | 'analysis';
  related_post_id?: string;
  related_blog_id?: string;
  platform?: 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'reddit' | 'blog' | 'email' | 'youtube' | 'twitter';
  priority?: number;
  color?: string;
  location?: string;
  attendees?: any[];
  reminders?: any[];
  recurrence_rule?: any;
  metadata?: any;
}

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

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/');
    const eventId = pathParts[pathParts.length - 1];

    console.log(`Calendar API: ${method} ${url.pathname}`);

    // GET /calendar/events - List events
    if (method === 'GET' && !eventId) {
      const businessId = url.searchParams.get('business_id');
      const startDate = url.searchParams.get('start');
      const endDate = url.searchParams.get('end');
      const platform = url.searchParams.get('platform');
      const status = url.searchParams.get('status');

      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          posts(title, content, target_platforms),
          blog_posts(title, content),
          business_profiles(business_name)
        `)
        .eq('user_id', user.id);

      if (businessId) query = query.eq('business_id', businessId);
      if (platform) query = query.eq('platform', platform);
      if (status) query = query.eq('status', status);
      if (startDate) query = query.gte('start_datetime', startDate);
      if (endDate) query = query.lte('start_datetime', endDate);

      const { data: events, error } = await query.order('start_datetime', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch events' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ events }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /calendar/events/:id - Get single event
    if (method === 'GET' && eventId) {
      const { data: event, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          posts(title, content, target_platforms),
          blog_posts(title, content),
          business_profiles(business_name)
        `)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return new Response(
          JSON.stringify({ error: 'Event not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ event }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /calendar/events - Create event
    if (method === 'POST') {
      const eventData: CalendarEvent = await req.json();
      
      const { data: newEvent, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create event' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Trigger automation rules if any
      await triggerAutomationRules(supabase, user.id, newEvent, 'created');

      return new Response(
        JSON.stringify({ event: newEvent }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PATCH /calendar/events/:id - Update event
    if (method === 'PATCH' && eventId) {
      const updates: Partial<CalendarEvent> = await req.json();
      
      const { data: updatedEvent, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update event' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Trigger automation rules
      await triggerAutomationRules(supabase, user.id, updatedEvent, 'updated');

      return new Response(
        JSON.stringify({ event: updatedEvent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /calendar/events/:id - Delete event
    if (method === 'DELETE' && eventId) {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting event:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete event' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Calendar API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Helper function to trigger automation rules
async function triggerAutomationRules(supabase: any, userId: string, event: any, action: string) {
  try {
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!rules || rules.length === 0) return;

    for (const rule of rules) {
      const conditions = rule.conditions || {};
      const actions = rule.actions || [];

      // Check if event matches rule conditions
      let conditionsMet = true;
      
      if (conditions.event_type && event.event_type !== conditions.event_type) {
        conditionsMet = false;
      }
      
      if (conditions.platform && event.platform !== conditions.platform) {
        conditionsMet = false;
      }
      
      if (conditions.action && action !== conditions.action) {
        conditionsMet = false;
      }

      if (conditionsMet && actions.length > 0) {
        // Execute automation actions
        console.log(`Executing automation rule: ${rule.name}`);
        
        // Update execution count
        await supabase
          .from('automation_rules')
          .update({
            execution_count: (rule.execution_count || 0) + 1,
            last_executed_at: new Date().toISOString()
          })
          .eq('id', rule.id);

        // Process each action
        for (const ruleAction of actions) {
          await executeAutomationAction(supabase, userId, event, ruleAction);
        }
      }
    }
  } catch (error) {
    console.error('Error triggering automation rules:', error);
  }
}

// Helper function to execute individual automation actions
async function executeAutomationAction(supabase: any, userId: string, event: any, action: any) {
  try {
    switch (action.type) {
      case 'create_notification':
        await supabase
          .from('notification_queue')
          .insert({
            user_id: userId,
            event_id: event.id,
            notification_type: action.notification_type || 'in_app',
            scheduled_for: new Date().toISOString(),
            message_data: {
              title: action.title || `Event: ${event.title}`,
              message: action.message || `Event ${event.title} has been ${action.trigger}`,
              event_id: event.id
            }
          });
        break;
        
      case 'generate_content':
        // This would trigger content generation
        console.log('Content generation triggered for event:', event.id);
        break;
        
      case 'update_external_calendar':
        // This would sync to external calendars
        console.log('External calendar sync triggered for event:', event.id);
        break;
        
      default:
        console.log('Unknown automation action type:', action.type);
    }
  } catch (error) {
    console.error('Error executing automation action:', error);
  }
}

serve(handler);