import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const businessId = url.searchParams.get('business_id');
    const postId = url.searchParams.get('post_id');
    const widget = url.searchParams.get('widget');
    const theme = url.searchParams.get('theme') || 'light';
    const limit = parseInt(url.searchParams.get('limit') || '5');

    if (!businessId) {
      return new Response('Business ID required', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Generate different embed widgets
    switch (widget) {
      case 'post':
        return await generateSinglePostEmbed(supabase, businessId, postId, theme);
      case 'list':
        return await generatePostListEmbed(supabase, businessId, theme, limit);
      case 'js':
        return generateJavaScriptEmbed(businessId, theme);
      default:
        return await generatePostListEmbed(supabase, businessId, theme, limit);
    }

  } catch (error) {
    console.error('Blog Embed Error:', error);
    return new Response(
      `console.error('JBSAAS Blog Widget Error: ${error.message}');`,
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/javascript' } 
      }
    );
  }
});

async function generateSinglePostEmbed(
  supabase: any, 
  businessId: string, 
  postId: string | null, 
  theme: string
) {
  if (!postId) {
    return new Response('Post ID required for single post widget', { 
      status: 400, 
      headers: corsHeaders 
    });
  }

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .eq('business_profile_id', businessId)
    .eq('published', true)
    .single();

  if (error || !post) {
    return generateErrorWidget('Post not found', theme);
  }

  const { data: business } = await supabase
    .from('business_profiles')
    .select('business_name, website_url')
    .eq('id', businessId)
    .single();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)}</title>
  <style>
    ${getWidgetCSS(theme)}
    .jbsaas-single-post {
      max-width: 100%;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }
    .post-header {
      margin-bottom: 1rem;
    }
    .post-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    .post-meta {
      font-size: 0.875rem;
      opacity: 0.7;
      margin-bottom: 1rem;
    }
    .post-content {
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .tag {
      padding: 0.25rem 0.5rem;
      background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
      border-radius: 0.25rem;
      font-size: 0.75rem;
    }
    .powered-by {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.75rem;
      opacity: 0.6;
    }
    .powered-by a {
      color: inherit;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="jbsaas-single-post jbsaas-widget-${theme}">
    <article>
      <header class="post-header">
        <h1 class="post-title">${escapeHtml(post.title)}</h1>
        <div class="post-meta">
          By ${escapeHtml(post.author)} • ${formatDate(post.published_at)}
        </div>
      </header>
      
      ${post.featured_image ? `<img src="${escapeHtml(post.featured_image)}" alt="${escapeHtml(post.title)}" style="width: 100%; height: auto; border-radius: 0.5rem; margin-bottom: 1rem;">` : ''}
      
      <div class="post-content">
        ${post.content.replace(/\n/g, '<br>')}
      </div>
      
      ${post.tags.length > 0 ? `
      <div class="post-tags">
        ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
      ` : ''}
    </article>
    
    <div class="powered-by">
      <a href="https://jbsaas.com" target="_blank">Powered by JBSAAS</a>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
  });
}

async function generatePostListEmbed(
  supabase: any, 
  businessId: string, 
  theme: string, 
  limit: number
) {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, excerpt, slug, published_at, tags, featured_image, author')
    .eq('business_profile_id', businessId)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    return generateErrorWidget('Failed to load posts', theme);
  }

  const { data: business } = await supabase
    .from('business_profiles')
    .select('business_name, website_url')
    .eq('id', businessId)
    .single();

  const businessUrl = business?.website_url || '#';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Latest Blog Posts</title>
  <style>
    ${getWidgetCSS(theme)}
    .jbsaas-post-list {
      max-width: 100%;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }
    .post-item {
      display: block;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 0.5rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      border: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};
    }
    .post-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
    }
    .post-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    .post-excerpt {
      font-size: 0.875rem;
      opacity: 0.8;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .post-meta {
      font-size: 0.75rem;
      opacity: 0.6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .post-tags {
      display: flex;
      gap: 0.25rem;
    }
    .tag {
      padding: 0.125rem 0.375rem;
      background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
      border-radius: 0.25rem;
      font-size: 0.625rem;
    }
    .powered-by {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.75rem;
      opacity: 0.6;
    }
    .powered-by a {
      color: inherit;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="jbsaas-post-list jbsaas-widget-${theme}">
    ${posts && posts.length > 0 ? posts.map(post => `
      <a href="${businessUrl}/blog/${post.slug}" class="post-item" target="_parent">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        ${post.excerpt ? `<p class="post-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        <div class="post-meta">
          <span>${escapeHtml(post.author)} • ${formatDate(post.published_at)}</span>
          ${post.tags.length > 0 ? `
          <div class="post-tags">
            ${post.tags.slice(0, 2).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
          ` : ''}
        </div>
      </a>
    `).join('') : '<p>No blog posts found.</p>'}
    
    <div class="powered-by">
      <a href="https://jbsaas.com" target="_blank">Powered by JBSAAS</a>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function generateJavaScriptEmbed(businessId: string, theme: string) {
  const script = `
(function() {
  // JBSAAS Blog Widget
  var widgetId = document.currentScript.getAttribute('data-widget-id') || 'jbsaas-blog-widget';
  var postId = document.currentScript.getAttribute('data-post-id');
  var widget = document.currentScript.getAttribute('data-widget') || 'list';
  var limit = document.currentScript.getAttribute('data-limit') || '5';
  var theme = document.currentScript.getAttribute('data-theme') || '${theme}';
  
  var container = document.getElementById(widgetId);
  if (!container) {
    console.error('JBSAAS Blog Widget: Container element not found:', widgetId);
    return;
  }
  
  // Create iframe
  var iframe = document.createElement('iframe');
  var src = 'https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/blog-embed' +
    '?business_id=${businessId}' +
    '&widget=' + encodeURIComponent(widget) +
    '&theme=' + encodeURIComponent(theme) +
    '&limit=' + encodeURIComponent(limit);
    
  if (postId) {
    src += '&post_id=' + encodeURIComponent(postId);
  }
  
  iframe.src = src;
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '0.5rem';
  iframe.scrolling = 'no';
  
  // Auto-resize iframe
  iframe.onload = function() {
    try {
      var height = iframe.contentWindow.document.body.scrollHeight;
      iframe.style.height = height + 'px';
    } catch (e) {
      iframe.style.height = '400px'; // Fallback height
    }
  };
  
  container.appendChild(iframe);
})();
`;

  return new Response(script, {
    headers: { ...corsHeaders, 'Content-Type': 'application/javascript' }
  });
}

function generateErrorWidget(message: string, theme: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${getWidgetCSS(theme)}
    .error-widget {
      padding: 1rem;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <div class="error-widget jbsaas-widget-${theme}">
    <p>❌ ${escapeHtml(message)}</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function getWidgetCSS(theme: string) {
  return `
    .jbsaas-widget-light {
      background: #ffffff;
      color: #1f2937;
    }
    .jbsaas-widget-dark {
      background: #1f2937;
      color: #f9fafb;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      padding: 1rem;
    }
  `;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}