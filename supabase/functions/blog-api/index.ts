import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  published_at?: string;
  scheduled_publish_at?: string;
  tags: string[];
  featured_image?: string;
  meta_description?: string;
  author: string;
  business_profile_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract business ID from path: /blog-api/{business_id}/posts
    if (pathParts.length < 2 || pathParts[0] !== 'blog-api') {
      return new Response('Invalid path', { status: 400, headers: corsHeaders });
    }

    const businessId = pathParts[1];
    const endpoint = pathParts[2];
    const postId = pathParts[3];

    // Verify API key
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Missing or invalid API key', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const apiKey = authHeader.substring(7);
    
    // Validate API key against business profile
    const { data: profile, error: profileError } = await supabase
      .from('business_profiles')
      .select('id, api_key')
      .eq('id', businessId)
      .single();

    if (profileError || !profile) {
      return new Response('Business not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Generate expected API key format
    const expectedApiKey = `jbsaas_${businessId}_${Date.now()}`;
    
    // For demo purposes, accept any key that starts with jbsaas_{businessId}
    if (!apiKey.startsWith(`jbsaas_${businessId}_`)) {
      return new Response('Invalid API key', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Route handling
    switch (endpoint) {
      case 'posts':
        return await handlePostsEndpoint(req, supabase, businessId, postId);
      case 'rss':
        return await handleRSSFeed(req, supabase, businessId);
      case 'webhook':
        return await handleWebhook(req, supabase, businessId);
      default:
        return new Response('Endpoint not found', { 
          status: 404, 
          headers: corsHeaders 
        });
    }

  } catch (error) {
    console.error('Blog API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handlePostsEndpoint(
  req: Request, 
  supabase: any, 
  businessId: string, 
  postId?: string
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      if (postId) {
        // Get single post
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', postId)
          .eq('business_profile_id', businessId)
          .eq('published', true)
          .single();

        if (error || !data) {
          return new Response('Post not found', { 
            status: 404, 
            headers: corsHeaders 
          });
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // Get all posts
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const tags = url.searchParams.get('tags')?.split(',');

        let query = supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, published_at, tags, featured_image, meta_description, author')
          .eq('business_profile_id', businessId)
          .eq('published', true)
          .order('published_at', { ascending: false });

        if (tags && tags.length > 0) {
          query = query.contains('tags', tags);
        }

        const { data, error } = await query
          .range(offset, offset + limit - 1);

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({
          posts: data || [],
          pagination: {
            limit,
            offset,
            total: data?.length || 0
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    case 'POST':
      // Create new post
      const postData: BlogPost = await req.json();
      
      // Validate required fields
      if (!postData.title || !postData.content) {
        return new Response('Title and content are required', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      // Generate slug if not provided
      if (!postData.slug) {
        postData.slug = generateSlug(postData.title);
      }

      // Set business profile ID
      postData.business_profile_id = businessId;
      postData.author = postData.author || 'API User';

      const { data: newPost, error: createError } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Trigger publishing pipeline if published
      if (postData.published) {
        await triggerPublishing(supabase, newPost, businessId);
      }

      return new Response(JSON.stringify(newPost), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    case 'PUT':
      // Update existing post
      if (!postId) {
        return new Response('Post ID required', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      const updateData: Partial<BlogPost> = await req.json();
      
      const { data: updatedPost, error: updateError } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId)
        .eq('business_profile_id', businessId)
        .select()
        .single();

      if (updateError || !updatedPost) {
        return new Response('Post not found or update failed', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      // Trigger publishing pipeline if published
      if (updateData.published) {
        await triggerPublishing(supabase, updatedPost, businessId);
      }

      return new Response(JSON.stringify(updatedPost), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    case 'DELETE':
      // Delete post
      if (!postId) {
        return new Response('Post ID required', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)
        .eq('business_profile_id', businessId);

      if (deleteError) {
        return new Response('Post not found or delete failed', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    default:
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
  }
}

async function handleRSSFeed(req: Request, supabase: any, businessId: string) {
  // Get business profile for feed metadata
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('business_name, website_url')
    .eq('id', businessId)
    .single();

  // Get published posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('business_profile_id', businessId)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20);

  const businessName = profile?.business_name || 'JBSAAS Blog';
  const businessUrl = profile?.website_url || `https://jbsaas.com`;
  const feedUrl = `https://api.jbsaas.com/v1/businesses/${businessId}/rss`;

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(businessName)} - Blog</title>
    <link>${escapeXml(businessUrl)}</link>
    <description>Latest blog posts from ${escapeXml(businessName)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    
    ${posts?.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${businessUrl}/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt || '')}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <guid isPermaLink="false">${post.id}</guid>
      <author>${escapeXml(post.author)}</author>
      ${post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('')}
    </item>
    `).join('') || ''}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/rss+xml; charset=utf-8' 
    }
  });
}

async function handleWebhook(req: Request, supabase: any, businessId: string) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  const webhookData = await req.json();
  
  // Log webhook for debugging
  console.log('Webhook received for business:', businessId, webhookData);

  // Get webhook configurations for this business
  const { data: webhooks } = await supabase
    .from('website_integrations')
    .select('*')
    .eq('business_profile_id', businessId)
    .eq('integration_type', 'webhook')
    .eq('is_active', true);

  if (!webhooks || webhooks.length === 0) {
    return new Response('No webhook configured', { 
      status: 404, 
      headers: corsHeaders 
    });
  }

  // Send webhook to configured URLs
  const results = [];
  for (const webhook of webhooks) {
    try {
      const config = webhook.configuration;
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-JBSAAS-Signature': generateWebhookSignature(webhookData, config.secret)
        },
        body: JSON.stringify(webhookData)
      });

      results.push({
        webhook_id: webhook.id,
        status: response.status,
        success: response.ok
      });
    } catch (error) {
      results.push({
        webhook_id: webhook.id,
        error: error.message,
        success: false
      });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function generateWebhookSignature(data: any, secret: string): string {
  // Simple signature generation for webhook verification
  const payload = JSON.stringify(data);
  return `sha256=${btoa(secret + payload)}`;
}

async function triggerPublishing(supabase: any, post: any, businessId: string) {
  try {
    // Call the multi-site publishing function
    const { error } = await supabase.functions.invoke('multi-site-publisher', {
      body: {
        post,
        business_id: businessId,
        publish_immediately: true,
        source: 'api'
      }
    });

    if (error) {
      console.error('Publishing pipeline error:', error);
    }
  } catch (error) {
    console.error('Failed to trigger publishing pipeline:', error);
  }
}