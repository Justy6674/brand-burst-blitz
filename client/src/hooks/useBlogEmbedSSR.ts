import { useState, useCallback } from 'react';
import { useHealthcareAuth } from './useHealthcareAuth';
import { useAHPRACompliance } from './useAHPRACompliance';
import { useToast } from './use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  categories: string[];
  tags: string[];
  author: {
    name: string;
    ahpra_registration?: string;
    specialty: string;
  };
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

interface SSRBlogHTML {
  html: string;
  css: string;
  meta_tags: string;
  structured_data: string;
  performance_metrics: {
    html_size: number;
    css_size: number;
    javascript_size: number;
    total_size: number;
  };
}

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

export const useBlogEmbedSSR = () => {
  const { user } = useHealthcareAuth();
  const { validateContent } = useAHPRACompliance();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [embedConfig, setEmbedConfig] = useState<BlogEmbedConfig | null>(null);

  // Generate Schema.org structured data for healthcare organization
  const generateOrganizationSchema = useCallback((config: BlogEmbedConfig) => {
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
  }, []);

  // Generate Schema.org structured data for blog posts
  const generateBlogPostSchema = useCallback((post: BlogPost, config: BlogEmbedConfig) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.featured_image,
      "author": {
        "@type": "Person",
        "name": post.author.name,
        "jobTitle": post.author.specialty
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

    if (post.author.ahpra_registration) {
      schema.author["identifier"] = {
        "@type": "PropertyValue",
        "name": "AHPRA Registration",
        "value": post.author.ahpra_registration
      };
    }

    return JSON.stringify(schema, null, 2);
  }, []);

  // Generate meta tags for SEO
  const generateMetaTags = useCallback((post: BlogPost, config: BlogEmbedConfig) => {
    const metaTags = [
      `<title>${post.seo_meta.title}</title>`,
      `<meta name="description" content="${post.seo_meta.description}">`,
      `<meta name="keywords" content="${post.seo_meta.keywords.join(', ')}">`,
      `<meta name="author" content="${post.author.name}">`,
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
      `<meta name="healthcare:specialty" content="${post.author.specialty}">`,
      `<meta name="healthcare:audience" content="${post.healthcare_metadata.target_audience}">`,
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

    if (post.author.ahpra_registration) {
      metaTags.push(`<meta name="healthcare:ahpra" content="${post.author.ahpra_registration}">`);
    }

    return metaTags.join('\n    ');
  }, []);

  // Generate healthcare-specific CSS with accessibility
  const generateHealthcareCSS = useCallback((config: BlogEmbedConfig) => {
    const css = `
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

    return css.trim();
  }, []);

  // Generate server-side rendered HTML for blog posts
  const generateSSRHTML = useCallback(async (posts: BlogPost[], config: BlogEmbedConfig): Promise<SSRBlogHTML> => {
    setIsGenerating(true);

    try {
      // Validate all posts for AHPRA compliance
      for (const post of posts) {
        const practiceType: any = { type: 'gp', ahpra_registration: 'mock' };
        const complianceResult = await validateContent(post.content, practiceType, 'blog');
        if (!complianceResult.isCompliant) {
          throw new Error(`Post "${post.title}" is not AHPRA compliant: ${complianceResult.violations.map(v => v.message).join(', ')}`);
        }
      }

      const css = generateHealthcareCSS(config);
      const organizationSchema = generateOrganizationSchema(config);

      // Generate HTML for each post
      const postsHTML = posts.map(post => {
        const postSchema = generateBlogPostSchema(post, config);
        
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
                  By <span itemprop="name">${post.author.name}</span>
                  ${post.author.specialty ? `, <span itemprop="jobTitle">${post.author.specialty}</span>` : ''}
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
            
            ${config.compliance_settings.practice_registration_display && post.author.ahpra_registration ? 
              `<div class="jbsaas-blog-ahpra">
                AHPRA Registration: ${post.author.ahpra_registration}
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

      const metaTags = posts.length > 0 ? generateMetaTags(posts[0], config) : '';

      // Calculate performance metrics
      const htmlSize = new Blob([fullHTML]).size;
      const cssSize = new Blob([css]).size;
      const totalSize = htmlSize + cssSize;

      const result: SSRBlogHTML = {
        html: fullHTML,
        css: css,
        meta_tags: metaTags,
        structured_data: organizationSchema,
        performance_metrics: {
          html_size: htmlSize,
          css_size: cssSize,
          javascript_size: 0, // No JS for SEO version
          total_size: totalSize
        }
      };

      toast({
        title: "Blog Embed Generated",
        description: `Generated SEO-optimized blog embed (${Math.round(totalSize / 1024)}KB total)`,
      });

      return result;

    } catch (error: any) {
      toast({
        title: "Blog Generation Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [validateContent, generateHealthcareCSS, generateOrganizationSchema, generateBlogPostSchema, generateMetaTags, toast]);

  // Generate embeddable script for external sites
  const generateEmbedScript = useCallback((config: BlogEmbedConfig, posts: BlogPost[]) => {
    const embedUrl = `${process.env.REACT_APP_API_URL}/api/blog-embed/${config.widget_id}`;
    
    const script = `
    <!-- JBSAAS Healthcare Blog Embed -->
    <div id="jbsaas-blog-${config.widget_id}"></div>
    <script>
      (function() {
        var script = document.createElement('script');
        script.src = '${embedUrl}/widget.js';
        script.async = true;
        script.setAttribute('data-widget-id', '${config.widget_id}');
        document.head.appendChild(script);
      })();
    </script>
    <!-- End JBSAAS Healthcare Blog Embed -->
    `.trim();

    return script;
  }, []);

  return {
    generateSSRHTML,
    generateEmbedScript,
    generateOrganizationSchema,
    generateBlogPostSchema,
    generateMetaTags,
    generateHealthcareCSS,
    isGenerating,
    embedConfig,
    setEmbedConfig,
    HEALTHCARE_CATEGORIES
  };
}; 