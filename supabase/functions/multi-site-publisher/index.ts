import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishRequest {
  postId: string;
  businessId: string;
  integrations: {
    id: string;
    type: 'wordpress' | 'webhook' | 'api';
    configuration: any;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { postId, businessId, integrations }: PublishRequest = await req.json();

    // Get the post content
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      throw new Error('Post not found');
    }

    const publishResults = [];

    // Process each integration
    for (const integration of integrations) {
      try {
        let result;
        
        switch (integration.type) {
          case 'wordpress':
            result = await publishToWordPress(post, integration.configuration);
            break;
          case 'webhook':
            result = await publishViaWebhook(post, integration.configuration);
            break;
          case 'api':
            result = await publishViaAPI(post, integration.configuration);
            break;
          default:
            throw new Error(`Unsupported integration type: ${integration.type}`);
        }

        // Record successful publication
        await supabase.from('multi_site_publishing').insert({
          post_id: postId,
          business_profile_id: businessId,
          user_id: post.user_id,
          integration_id: integration.id,
          platform_name: integration.type,
          platform_post_id: result.platformPostId,
          publish_status: 'published',
          published_url: result.url,
          published_at: new Date().toISOString()
        });

        publishResults.push({
          integration: integration.id,
          status: 'success',
          url: result.url,
          platformPostId: result.platformPostId
        });

      } catch (error) {
        console.error(`Failed to publish to ${integration.type}:`, error);
        
        // Record failed publication
        await supabase.from('multi_site_publishing').insert({
          post_id: postId,
          business_profile_id: businessId,
          user_id: post.user_id,
          integration_id: integration.id,
          platform_name: integration.type,
          publish_status: 'failed',
          error_message: error.message
        });

        publishResults.push({
          integration: integration.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      results: publishResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in multi-site publisher:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function publishToWordPress(post: any, config: any) {
  const { url, username, password } = config;
  
  const authHeader = btoa(`${username}:${password}`);
  
  const wpPost = {
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    status: 'publish',
    categories: [], // TODO: Map tags to categories
    tags: post.tags || []
  };

  const response = await fetch(`${url}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authHeader}`
    },
    body: JSON.stringify(wpPost)
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status}`);
  }

  const result = await response.json();
  
  return {
    platformPostId: result.id.toString(),
    url: result.link
  };
}

async function publishViaWebhook(post: any, config: any) {
  const { url, secret } = config;
  
  const payload = {
    event: 'post.published',
    post: {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags,
      published_at: new Date().toISOString()
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-JBSAAS-Signature': secret // Simple signature for now
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Webhook error: ${response.status}`);
  }

  return {
    platformPostId: post.id,
    url: url // Return webhook URL as confirmation
  };
}

async function publishViaAPI(post: any, config: any) {
  const { endpoint, apiKey } = config;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();
  
  return {
    platformPostId: result.id || post.id,
    url: result.url || endpoint
  };
}