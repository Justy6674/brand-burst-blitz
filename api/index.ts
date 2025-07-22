import { createClient } from '@supabase/supabase-js';

// Vercel serverless function handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ 
      error: 'Missing Supabase configuration',
      debug: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      }
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Parse the request path
    const path = req.query.path || [];
    const route = Array.isArray(path) ? path.join('/') : path;

    // Health check endpoint
    if (route === 'health') {
      return res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: 'vercel'
      });
    }

    // Blog list endpoint
    if (route === 'public/blog' || route === '') {
      const { limit = 10, category, featured } = req.query;
      
      let query = supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('published', true);
      
      if (category) {
        query = query.eq('category', category);
      }
      if (featured === 'true') {
        query = query.eq('featured', true);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-API-Version', '1.0');
      res.setHeader('X-Crawlable', 'true');
      
      const posts = (data || []).map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        author: post.author,
        category: post.category,
        tags: post.tags,
        featuredImage: post.featured_image,
        publishedAt: post.created_at,
        url: `/blog/${post.slug}`
      }));
      
      return res.json({
        success: true,
        data: posts,
        meta: {
          total: posts.length,
          limit: parseInt(limit),
          api_type: 'public_read_only',
          crawlable: true
        }
      });
    }

    // Single blog post endpoint
    if (route.startsWith('public/blog/')) {
      const slug = route.replace('public/blog/', '');
      
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      res.setHeader('Cache-Control', 'public, max-age=600');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type', 'healthcare-blog-post');
      
      return res.json({
        success: true,
        data: {
          id: data.id,
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          author: data.author,
          category: data.category,
          tags: data.tags,
          featuredImage: data.featured_image,
          metaDescription: data.meta_description,
          publishedAt: data.created_at,
          featured: data.featured
        },
        meta: {
          canonical_url: `/blog/${data.slug}`,
          crawlable: true,
          api_type: 'public_read_only'
        }
      });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}