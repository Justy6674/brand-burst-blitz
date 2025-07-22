import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Healthcare-specific blog categories
const HEALTHCARE_CATEGORIES = [
  'Patient Education',
  'General Health',
  'Mental Health',
  'Preventive Care',
  'Chronic Disease Management',
  'Medical Procedures',
  'Health Screening',
  'Nutrition & Diet',
  'Exercise & Fitness',
  'Healthcare Updates',
  'Practice News',
  'AHPRA Compliance',
  'TGA Updates',
  'Medicare Information',
  'Health Insurance',
  'Telehealth',
  'Women\'s Health',
  'Men\'s Health',
  'Children\'s Health',
  'Senior Health',
  'Indigenous Health',
  'Allied Health',
  'Specialist Referrals'
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  categories: string[];
  tags: string[];
  author_id: string;
  practice_id: string;
  published_date: string;
  updated_date?: string;
  seo_meta: {
    title: string;
    description: string;
    keywords: string[];
    canonical_url: string;
  };
  compliance_status: {
    ahpra_compliant: boolean;
    tga_compliant: boolean;
    compliance_score: number;
    disclaimers: string[];
  };
  healthcare_metadata: {
    target_audience: 'patients' | 'professionals' | 'general';
    medical_accuracy_verified: boolean;
    evidence_based: boolean;
    specialty_specific: string[];
  };
}

interface HealthcareAuthor {
  id: string;
  practice_name: string;
  ahpra_registration?: string;
  profession_type: string;
  specialty: string;
}

interface BlogEmbedConfig {
  practice_id: string;
  widget_id: string;
  style: {
    theme: 'professional' | 'modern' | 'minimal' | 'healthcare';
    primary_color: string;
    accent_color: string;
    font_family: string;
    layout: 'grid' | 'list' | 'card';
  };
  seo_settings: {
    site_name: string;
    base_url: string;
    logo_url?: string;
    organization_schema: {
      name: string;
      type: 'MedicalOrganization' | 'HealthcareProvider';
      address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: 'AU';
      };
      phone: string;
      website: string;
      ahpra_registration?: string;
    };
  };
  display_options: {
    posts_per_page: number;
    show_featured_image: boolean;
    show_excerpt: boolean;
    show_author: boolean;
    show_date: boolean;
    show_categories: boolean;
    show_reading_time: boolean;
    enable_pagination: boolean;
    enable_search: boolean;
    enable_categories_filter: boolean;
  };
  compliance_settings: {
    show_ahpra_disclaimers: boolean;
    show_medical_disclaimers: boolean;
    auto_add_disclaimers: boolean;
    practice_registration_display: boolean;
  };
}

// Generate Schema.org structured data for healthcare organization
function generateOrganizationSchema(config: BlogEmbedConfig) {
  const schema = {
    "@context": "https://schema.org",
    "@type": config.seo_settings.organization_schema.type,
    "name": config.seo_settings.organization_schema.name,
    "url": config.seo_settings.base_url,
    "logo": config.seo_settings.logo_url,
    "telephone": config.seo_settings.organization_schema.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.seo_settings.organization_schema.address.street,
      "addressLocality": config.seo_settings.organization_schema.address.city,
      "addressRegion": config.seo_settings.organization_schema.address.state,
      "postalCode": config.seo_settings.organization_schema.address.postal_code,
      "addressCountry": "AU"
    },
    "areaServed": "Australia",
    "availableLanguage": "en-AU"
  };

  if (config.seo_settings.organization_schema.ahpra_registration) {
    schema["identifier"] = {
      "@type": "PropertyValue",
      "name": "AHPRA Registration",
      "value": config.seo_settings.organization_schema.ahpra_registration
    };
  }

  return JSON.stringify(schema, null, 2);
}

// Generate Schema.org structured data for blog posts
function generateBlogPostSchema(post: BlogPost, author: HealthcareAuthor, config: BlogEmbedConfig) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featured_image,
    "author": {
      "@type": "Person",
      "name": author.practice_name,
      "jobTitle": author.specialty
    },
    "publisher": {
      "@type": config.seo_settings.organization_schema.type,
      "name": config.seo_settings.organization_schema.name,
      "logo": {
        "@type": "ImageObject",
        "url": config.seo_settings.logo_url
      }
    },
    "datePublished": post.published_date,
    "dateModified": post.updated_date || post.published_date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": post.seo_meta.canonical_url
    },
    "keywords": post.seo_meta.keywords.join(", "),
    "articleSection": post.categories.join(", "),
    "about": post.healthcare_metadata.specialty_specific.map(specialty => ({
      "@type": "MedicalCondition",
      "name": specialty
    })),
    "audience": {
      "@type": "Audience",
      "audienceType": post.healthcare_metadata.target_audience
    }
  };

  if (author.ahpra_registration) {
    schema.author["identifier"] = {
      "@type": "PropertyValue",
      "name": "AHPRA Registration",
      "value": author.ahpra_registration
    };
  }

  return JSON.stringify(schema, null, 2);
}

// Generate meta tags for SEO
function generateMetaTags(post: BlogPost, config: BlogEmbedConfig) {
  const metaTags = [
    `<title>${post.seo_meta.title}</title>`,
    `<meta name="description" content="${post.seo_meta.description}">`,
    `<meta name="keywords" content="${post.seo_meta.keywords.join(', ')}">`,
    `<meta name="author" content="${config.seo_settings.organization_schema.name}">`,
    `<link rel="canonical" href="${post.seo_meta.canonical_url}">`,
    
    // Open Graph tags
    `<meta property="og:title" content="${post.seo_meta.title}">`,
    `<meta property="og:description" content="${post.seo_meta.description}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:url" content="${post.seo_meta.canonical_url}">`,
    `<meta property="og:site_name" content="${config.seo_settings.site_name}">`,
    
    // Twitter Card tags
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${post.seo_meta.title}">`,
    `<meta name="twitter:description" content="${post.seo_meta.description}">`,
    
    // Healthcare-specific meta tags
    `<meta name="healthcare:specialty" content="${config.seo_settings.organization_schema.type}">`,
    `<meta name="healthcare:audience" content="patients,healthcare_professionals">`,
    `<meta name="healthcare:compliance" content="AHPRA,TGA">`,
    
    // Accessibility and mobile
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    `<meta name="robots" content="index, follow">`,
    `<meta http-equiv="Content-Language" content="en-AU">`
  ];

  if (post.featured_image) {
    metaTags.push(
      `<meta property="og:image" content="${post.featured_image}">`,
      `<meta name="twitter:image" content="${post.featured_image}">`
    );
  }

  return metaTags.join('\n    ');
}

// Generate healthcare-specific CSS with accessibility
function generateHealthcareCSS(config: BlogEmbedConfig) {
  return `
  .jbsaas-blog-embed {
    --primary-color: ${config.style.primary_color};
    --accent-color: ${config.style.accent_color};
    --text-color: #1f2937;
    --text-light: #6b7280;
    --border-color: #e5e7eb;
    --bg-color: #ffffff;
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    
    font-family: ${config.style.font_family}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    max-width: 100%;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .jbsaas-blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .jbsaas-blog-post {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .jbsaas-blog-post:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
  }
  
  .jbsaas-blog-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-bottom: 1px solid var(--border-color);
  }
  
  .jbsaas-blog-content {
    padding: 1.5rem;
  }
  
  .jbsaas-blog-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
    text-decoration: none;
    display: block;
  }
  
  .jbsaas-blog-title:hover {
    color: var(--accent-color);
  }
  
  .jbsaas-blog-excerpt {
    color: var(--text-light);
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .jbsaas-blog-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-light);
    margin-bottom: 1rem;
  }
  
  .jbsaas-blog-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .jbsaas-blog-category {
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    text-decoration: none;
  }
  
  .jbsaas-blog-disclaimer {
    background: #fef3c7;
    border: 1px solid #fbbf24;
    padding: 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    margin-top: 1rem;
  }
  
  .jbsaas-blog-ahpra {
    color: var(--text-light);
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }
  
  /* Accessibility improvements */
  .jbsaas-blog-embed *:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .jbsaas-blog-embed {
      padding: 0.5rem;
    }
    
    .jbsaas-blog-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .jbsaas-blog-content {
      padding: 1rem;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .jbsaas-blog-embed {
      --border-color: #000000;
      --text-color: #000000;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .jbsaas-blog-post {
      transition: none;
    }
    
    .jbsaas-blog-post:hover {
      transform: none;
    }
  }
  `;
}

// Generate server-side rendered HTML for blog posts
function generateSSRHTML(posts: BlogPost[], authors: HealthcareAuthor[], config: BlogEmbedConfig): string {
  const css = generateHealthcareCSS(config);
  const organizationSchema = generateOrganizationSchema(config);

  // Generate HTML for each post
  const postsHTML = posts.map(post => {
    const author = authors.find(a => a.id === post.author_id);
    if (!author) return '';
    
    const postSchema = generateBlogPostSchema(post, author, config);
    
    return `
    <article class="jbsaas-blog-post" itemscope itemtype="https://schema.org/Article">
      ${post.featured_image && config.display_options.show_featured_image ? 
        `<img src="${post.featured_image}" alt="${post.title}" class="jbsaas-blog-image" itemprop="image" loading="lazy">` 
        : ''
      }
      
      <div class="jbsaas-blog-content">
        <h2 class="jbsaas-blog-title" itemprop="headline">
          <a href="${post.seo_meta.canonical_url}" itemprop="url">${post.title}</a>
        </h2>
        
        ${config.display_options.show_excerpt ? 
          `<p class="jbsaas-blog-excerpt" itemprop="description">${post.excerpt}</p>` 
          : ''
        }
        
        <div class="jbsaas-blog-meta">
          ${config.display_options.show_author ? 
            `<span itemprop="author" itemscope itemtype="https://schema.org/Person">
              By <span itemprop="name">${author.practice_name}</span>
              ${author.specialty ? `, <span itemprop="jobTitle">${author.specialty}</span>` : ''}
            </span>` 
            : ''
          }
          
          ${config.display_options.show_date ? 
            `<time datetime="${post.published_date}" itemprop="datePublished">
              ${new Date(post.published_date).toLocaleDateString('en-AU')}
            </time>` 
            : ''
          }
          
          ${config.display_options.show_reading_time ? 
            `<span>${Math.ceil(post.content.split(' ').length / 200)} min read</span>` 
            : ''
          }
        </div>
        
        ${config.display_options.show_categories && post.categories.length > 0 ? 
          `<div class="jbsaas-blog-categories">
            ${post.categories.map(category => 
              `<span class="jbsaas-blog-category" itemprop="about">${category}</span>`
            ).join('')}
          </div>` 
          : ''
        }
        
        ${config.compliance_settings.show_ahpra_disclaimers && post.compliance_status.disclaimers.length > 0 ? 
          `<div class="jbsaas-blog-disclaimer">
            <strong>Healthcare Disclaimer:</strong> ${post.compliance_status.disclaimers.join(' ')}
          </div>` 
          : ''
        }
        
        ${config.compliance_settings.practice_registration_display && author.ahpra_registration ? 
          `<div class="jbsaas-blog-ahpra">
            AHPRA Registration: ${author.ahpra_registration}
          </div>` 
          : ''
        }
      </div>
      
      <script type="application/ld+json">
        ${postSchema}
      </script>
    </article>
    `;
  }).join('\n      ');

  const fullHTML = `
  <div class="jbsaas-blog-embed" role="main" aria-label="Healthcare Blog Posts">
    <style>
      ${css}
    </style>
    
    <script type="application/ld+json">
      ${organizationSchema}
    </script>
    
    <div class="jbsaas-blog-grid" role="feed" aria-label="Blog posts">
      ${postsHTML}
    </div>
    
    ${config.compliance_settings.show_medical_disclaimers ? 
      `<div class="jbsaas-blog-disclaimer">
        <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. 
        Always consult your healthcare provider for medical concerns.
      </div>` 
      : ''
    }
  </div>
  `.trim();

  return fullHTML;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const widgetId = pathParts[pathParts.length - 1];

    if (!widgetId) {
      return new Response(JSON.stringify({ error: 'Widget ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is a widget.js request (for script injection)
    if (url.pathname.endsWith('/widget.js')) {
      const jsContent = `
      (function() {
        const widgetId = document.currentScript.getAttribute('data-widget-id');
        const container = document.getElementById('jbsaas-blog-' + widgetId);
        
        if (!container) {
          console.error('JBSAAS Blog: Container not found for widget ID:', widgetId);
          return;
        }
        
        // Fetch the SSR content
        fetch('${supabaseUrl}/functions/v1/blog-embed/' + widgetId, {
          method: 'GET',
          headers: {
            'Accept': 'text/html'
          }
        })
        .then(response => response.text())
        .then(html => {
          container.innerHTML = html;
        })
        .catch(error => {
          console.error('JBSAAS Blog: Failed to load content:', error);
          container.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">Unable to load blog content. Please try again later.</div>';
        });
      })();
      `;

      return new Response(jsContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      });
    }

    // Get widget configuration
    const { data: widgetConfig, error: configError } = await supabase
      .from('blog_embed_configs')
      .select('*')
      .eq('widget_id', widgetId)
      .single();

    if (configError || !widgetConfig) {
      return new Response(JSON.stringify({ error: 'Widget configuration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get published blog posts for this practice
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('practice_id', widgetConfig.practice_id)
      .eq('status', 'published')
      .eq('ahpra_compliant', true)
      .order('published_date', { ascending: false })
      .limit(widgetConfig.display_options.posts_per_page || 6);

    if (postsError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch blog posts' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get author information
    const { data: authors, error: authorsError } = await supabase
      .from('healthcare_users')
      .select('id, practice_name, ahpra_registration, profession_type, specialty')
      .in('id', posts?.map(p => p.author_id) || []);

    if (authorsError) {
      console.error('Failed to fetch authors:', authorsError);
    }

    // Generate SSR HTML
    const htmlContent = generateSSRHTML(
      posts || [], 
      authors || [], 
      widgetConfig as BlogEmbedConfig
    );

    // Return HTML content for search engines and direct access
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
        'X-Robots-Tag': 'index, follow'
      }
    });

  } catch (error) {
    console.error('Blog embed error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});