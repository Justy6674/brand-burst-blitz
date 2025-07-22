import express, { type Request, Response, NextFunction } from "express";
import { createClient } from '@supabase/supabase-js';

// Vercel serverless function for blog API
const app = express();

// Check for environment variables (Vercel uses different names)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  console.error("URL found:", !!supabaseUrl, "Key found:", !!supabaseServiceKey);
}

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Blog API endpoints
app.get('/api/public/blog', async (req, res) => {
  try {
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
      .limit(parseInt(limit as string));
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.set({
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/json; charset=utf-8',
      'X-API-Version': '1.0',
      'X-Crawlable': 'true'
    });
    
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
    
    res.json({
      success: true,
      data: posts,
      meta: {
        total: posts.length,
        limit: parseInt(limit as string),
        api_type: 'public_read_only',
        crawlable: true
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/blog/:slug', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    res.set({
      'Cache-Control': 'public, max-age=600',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type': 'healthcare-blog-post'
    });
    
    res.json({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'vercel'
  });
});

export default app;