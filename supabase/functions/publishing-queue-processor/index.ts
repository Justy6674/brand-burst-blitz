import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending publishing queue items that are ready to be processed
    const now = new Date().toISOString();
    const { data: queueItems, error: queueError } = await supabase
      .from('publishing_queue')
      .select(`
        *,
        posts (*),
        social_accounts (*)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .lt('attempt_count', 3); // Max 3 attempts

    if (queueError) {
      console.error('Error fetching queue items:', queueError);
      throw queueError;
    }

    const results = [];

    for (const item of queueItems) {
      try {
        console.log(`Processing queue item ${item.id} for platform ${item.social_accounts.platform}`);

        // Update attempt count
        await supabase
          .from('publishing_queue')
          .update({ 
            attempt_count: item.attempt_count + 1,
            status: 'processing'
          })
          .eq('id', item.id);

        // Call the appropriate social media publisher
        const publishResult = await supabase.functions.invoke('social-media-publisher', {
          body: {
            queueItemId: item.id,
            platform: item.social_accounts.platform,
            postData: item.posts,
            accountData: item.social_accounts
          }
        });

        if (publishResult.error) {
          console.error(`Publishing failed for item ${item.id}:`, publishResult.error);
          
          // Update queue item with error
          await supabase
            .from('publishing_queue')
            .update({ 
              status: 'failed',
              last_error: publishResult.error.message
            })
            .eq('id', item.id);

          // Create status record
          await supabase
            .from('publishing_queue_status')
            .insert({
              queue_item_id: item.id,
              status: 'failed',
              error_message: publishResult.error.message,
              retry_count: item.attempt_count + 1,
              processed_at: new Date().toISOString()
            });
        } else {
          // Success - update queue item
          await supabase
            .from('publishing_queue')
            .update({ 
              status: 'published',
              published_post_id: publishResult.data?.publishedPostId || `pub_${Date.now()}`
            })
            .eq('id', item.id);

          // Create success status record
          await supabase
            .from('publishing_queue_status')
            .insert({
              queue_item_id: item.id,
              status: 'published',
              published_url: publishResult.data?.publishedUrl,
              platform_response: publishResult.data,
              processed_at: new Date().toISOString()
            });

          console.log(`Successfully published item ${item.id}`);
        }

        results.push({
          itemId: item.id,
          success: !publishResult.error,
          error: publishResult.error?.message
        });

      } catch (error: any) {
        console.error(`Error processing queue item ${item.id}:`, error);
        
        // Update queue item with error
        await supabase
          .from('publishing_queue')
          .update({ 
            status: 'failed',
            last_error: error.message
          })
          .eq('id', item.id);

        results.push({
          itemId: item.id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedItems: queueItems.length,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in publishing queue processor:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});