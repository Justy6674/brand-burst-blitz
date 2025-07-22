import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Environment variables - Debug mode
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Add debug logging for Vercel
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey,
    urlLength: supabaseUrl ? supabaseUrl.length : 0,
    keyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
  });

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      error: 'Missing Supabase configuration',
      debug: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
        envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      }
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { limit = 10, category, featured, slug } = req.query;

    // Single blog post by slug
    if (slug) {
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

    // Blog list
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

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}