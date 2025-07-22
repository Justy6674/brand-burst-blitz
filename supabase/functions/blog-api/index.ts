import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published_date: string;
  created_at: string;
  canonical_url: string;
  categories: string[];
  author_name: string;
  ahpra_compliant: boolean;
  business_profile_id: string;
  featured_image?: string;
  meta_description?: string;
  seo_keywords?: string;
  published: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const businessId = url.searchParams.get('businessId');
    const limit = parseInt(url.searchParams.get('limit') || '6');
    const published = url.searchParams.get('published') !== 'false';
    const ahpraCompliant = url.searchParams.get('ahpraCompliant') !== 'false';

    if (!businessId) {
      return new Response(JSON.stringify({ 
        error: 'Business ID required',
        message: 'Please provide a valid businessId parameter' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify business profile exists and get practice info
    const { data: businessProfile, error: businessError } = await supabase
      .from('business_profiles')
      .select('id, practice_name, ahpra_registration, profession_type, website_url')
      .eq('id', businessId)
      .single();

    if (businessError || !businessProfile) {
      return new Response(JSON.stringify({ 
        error: 'Business not found',
        message: 'Invalid business ID or business not accessible' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build query for blog posts
    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        content,
        excerpt,
        published_date,
        created_at,
        canonical_url,
        categories,
        author_name,
        ahpra_compliant,
        business_profile_id,
        featured_image,
        meta_description,
        seo_keywords,
        published
      `)
      .eq('business_profile_id', businessId)
      .order('published_date', { ascending: false })
      .limit(Math.min(limit, 20)); // Cap at 20 posts max

    // Apply filters
    if (published) {
      query = query.eq('published', true);
    }
    
    if (ahpraCompliant) {
      query = query.eq('ahpra_compliant', true);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      console.error('Error fetching blog posts:', postsError);
      return new Response(JSON.stringify({ 
        error: 'Database error',
        message: 'Failed to fetch blog posts' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process posts to ensure they have required fields and AHPRA compliance
    const processedPosts = (posts || []).map(post => {
      // Ensure AHPRA compliance footer is present if missing
      let processedContent = post.content || '';
      
      if (post.ahpra_compliant && !processedContent.includes('Medical Disclaimer')) {
        processedContent += `

<div class="ahpra-compliance-footer" style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-left: 4px solid #007bff; font-size: 0.9em;">
  <p><strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical advice specific to your situation.</p>
  ${businessProfile.ahpra_registration ? `<p><strong>AHPRA Registration:</strong> ${businessProfile.ahpra_registration}</p>` : ''}
  <p><strong>Practice:</strong> ${businessProfile.practice_name}</p>
</div>`;
      }

      // Ensure canonical URL exists
      const canonicalUrl = post.canonical_url || 
        `${businessProfile.website_url}/blog/${post.id}` || 
        `https://jbsaas.com/blog/${post.id}`;

      // Ensure excerpt exists
      const excerpt = post.excerpt || 
        (post.content ? post.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...' : '');

      // Ensure categories array
      const categories = Array.isArray(post.categories) ? post.categories : [];

      return {
        ...post,
        content: processedContent,
        canonical_url: canonicalUrl,
        excerpt: excerpt,
        categories: categories,
        author_name: post.author_name || businessProfile.practice_name,
        published_date: post.published_date || post.created_at
      };
    });

    // Log successful API call
    await supabase
      .from('api_usage_logs')
      .insert({
        endpoint: 'blog-api',
        business_id: businessId,
        request_params: { limit, published, ahpraCompliant },
        response_count: processedPosts.length,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });

    // Return successful response
    return new Response(JSON.stringify({
      success: true,
      posts: processedPosts,
      business_info: {
        practice_name: businessProfile.practice_name,
        ahpra_registration: businessProfile.ahpra_registration,
        profession_type: businessProfile.profession_type
      },
      metadata: {
        total_returned: processedPosts.length,
        limit_applied: limit,
        filters: { published, ahpraCompliant },
        generated_at: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Blog API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});