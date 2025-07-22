import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsEvent {
  event_type: 'load' | 'view' | 'click' | 'error';
  widget_data: {
    businessId?: string;
    containerId?: string;
    theme?: string;
    userAgent?: string;
    postsLoaded?: number;
    postId?: string;
    url?: string;
    error?: string;
  };
  page_url: string;
  referrer_url?: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const eventData: AnalyticsEvent = await req.json();
    const { event_type, widget_data, page_url, referrer_url, timestamp } = eventData;

    if (!event_type || !widget_data || !page_url) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['event_type', 'widget_data', 'page_url']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract IP and user agent from headers
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Generate visitor ID from IP + User Agent (basic fingerprinting)
    const visitorId = await generateVisitorId(ipAddress, userAgent);

    // Get widget ID from business ID if available
    let widgetId = null;
    if (widget_data.businessId) {
      const { data: embedConfig } = await supabase
        .from('blog_embed_configs')
        .select('widget_id')
        .eq('business_id', widget_data.businessId)
        .eq('is_active', true)
        .single();
      
      widgetId = embedConfig?.widget_id;
    }

    // Create analytics record
    const analyticsRecord = {
      widget_id: widgetId,
      business_id: widget_data.businessId,
      event_type: event_type,
      post_id: widget_data.postId || null,
      visitor_id: visitorId,
      user_agent: userAgent,
      ip_address: ipAddress,
      referrer_url: referrer_url || null,
      page_url: page_url,
      session_duration: null,
      metadata: {
        theme: widget_data.theme,
        container_id: widget_data.containerId,
        posts_loaded: widget_data.postsLoaded,
        error_message: widget_data.error,
        click_url: widget_data.url,
        timestamp: timestamp
      },
      created_at: new Date().toISOString()
    };

    // Insert analytics record
    const { data: insertedRecord, error: insertError } = await supabase
      .from('blog_widget_analytics')
      .insert(analyticsRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert analytics record:', insertError);
      
      // Still return success for widget functionality
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Event received but not stored',
        error: insertError.message
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update widget usage count for load events
    if (event_type === 'load' && widgetId) {
      await supabase
        .from('blog_embed_configs')
        .update({ 
          usage_count: supabase.sql`usage_count + 1`,
          last_accessed_at: new Date().toISOString()
        })
        .eq('widget_id', widgetId);
    }

    // Aggregate daily stats for performance
    if (event_type === 'view') {
      await updateDailyStats(supabase, widget_data.businessId, page_url);
    }

    return new Response(JSON.stringify({
      success: true,
      event_id: insertedRecord.id,
      visitor_id: visitorId,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Blog widget analytics error:', error);
    
    // Return success to avoid breaking widget functionality
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Event received',
      error: 'Analytics processing failed'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateVisitorId(ipAddress: string, userAgent: string): Promise<string> {
  // Simple hash function for visitor identification
  const data = `${ipAddress}:${userAgent}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return first 16 characters for visitor ID
  return hashHex.substring(0, 16);
}

async function updateDailyStats(supabase: any, businessId: string, pageUrl: string) {
  if (!businessId) return;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    // Upsert daily stats
    const { error } = await supabase.rpc('upsert_daily_widget_stats', {
      p_business_id: businessId,
      p_date: today,
      p_page_url: pageUrl
    });

    if (error) {
      console.error('Failed to update daily stats:', error);
    }
  } catch (error) {
    console.error('Daily stats update error:', error);
  }
} 