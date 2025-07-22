import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Check, Download, ExternalLink, Code, FileText, Zap } from 'lucide-react';
import { PlatformDefinition } from '@/data/platformDefinitions';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useAHPRACompliance } from '@/hooks/useAHPRACompliance';

interface UniversalCodeGeneratorProps {
  platform: PlatformDefinition;
  blogContent?: {
    title: string;
    content: string;
    keywords: string;
  };
}

interface GeneratedCode {
  [key: string]: {
    content: string;
    language: string;
    filename?: string;
    downloadable?: boolean;
  };
}

export const UniversalCodeGenerator: React.FC<UniversalCodeGeneratorProps> = ({
  platform,
  blogContent
}) => {
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  
  const { businessProfiles } = useBusinessProfile();
  const { validateContent } = useAHPRACompliance();
  const { toast } = useToast();
  
  const businessProfile = businessProfiles?.[0];

  // WordPress Plugin Generator
  const generateWordPressPlugin = (): GeneratedCode => {
    const pluginMainFile = `<?php
/**
 * Plugin Name: JBSAAS Healthcare Blog
 * Plugin URI: https://jbsaas.com
 * Description: AHPRA-compliant healthcare blog integration for Australian practices
 * Version: 1.0.0
 * Author: JBSAAS
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class JBSAASHealthcareBlog {
    private $api_key;
    private $business_id;
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('jbsaas_blog', array($this, 'blog_shortcode'));
        add_action('admin_menu', array($this, 'admin_menu'));
    }
    
    public function init() {
        $this->api_key = get_option('jbsaas_api_key');
        $this->business_id = get_option('jbsaas_business_id', '${businessProfile?.id}');
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script(
            'jbsaas-blog-widget',
            plugin_dir_url(__FILE__) . 'assets/widget.js',
            array('jquery'),
            '1.0.0',
            true
        );
        
        wp_localize_script('jbsaas-blog-widget', 'jbsaas_params', array(
            'api_url' => 'https://api.jbsaas.com',
            'business_id' => $this->business_id,
            'nonce' => wp_create_nonce('jbsaas_nonce')
        ));
    }
    
    public function blog_shortcode($atts) {
        $atts = shortcode_atts(array(
            'posts' => '6',
            'theme' => 'healthcare',
            'layout' => 'grid',
            'show_excerpt' => 'true',
            'show_date' => 'true',
            'show_author' => 'true',
            'ahpra_compliance' => 'true'
        ), $atts);
        
        $widget_id = 'jbsaas-blog-' . uniqid();
        
        ob_start();
        ?>
        <div id="<?php echo esc_attr($widget_id); ?>" 
             data-jbsaas-widget="blog"
             data-business-id="<?php echo esc_attr($this->business_id); ?>"
             data-theme="<?php echo esc_attr($atts['theme']); ?>"
             data-posts="<?php echo esc_attr($atts['posts']); ?>"
             data-layout="<?php echo esc_attr($atts['layout']); ?>"
             data-show-excerpt="<?php echo esc_attr($atts['show_excerpt']); ?>"
             data-show-date="<?php echo esc_attr($atts['show_date']); ?>"
             data-show-author="<?php echo esc_attr($atts['show_author']); ?>"
             data-ahpra-compliance="<?php echo esc_attr($atts['ahpra_compliance']); ?>"
             style="min-height: 400px;">
            <div class="jbsaas-loading">Loading healthcare blog posts...</div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function admin_menu() {
        add_options_page(
            'JBSAAS Blog Settings',
            'JBSAAS Blog',
            'manage_options',
            'jbsaas-blog',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('jbsaas_api_key', sanitize_text_field($_POST['api_key']));
            update_option('jbsaas_business_id', sanitize_text_field($_POST['business_id']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $api_key = get_option('jbsaas_api_key', '');
        $business_id = get_option('jbsaas_business_id', '${businessProfile?.id}');
        ?>
        <div class="wrap">
            <h1>JBSAAS Healthcare Blog Settings</h1>
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">API Key</th>
                        <td>
                            <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description">Get your API key from your JBSAAS dashboard</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Business ID</th>
                        <td>
                            <input type="text" name="business_id" value="<?php echo esc_attr($business_id); ?>" class="regular-text" />
                            <p class="description">Your practice business ID from JBSAAS</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <h2>Usage</h2>
            <p>Use the shortcode <code>[jbsaas_blog]</code> in any post or page to display your healthcare blog.</p>
            
            <h3>Shortcode Options</h3>
            <ul>
                <li><code>posts="6"</code> - Number of posts to display</li>
                <li><code>theme="healthcare"</code> - Display theme (healthcare, modern, minimal)</li>
                <li><code>layout="grid"</code> - Layout style (grid, list, cards)</li>
                <li><code>show_excerpt="true"</code> - Show post excerpts</li>
                <li><code>show_date="true"</code> - Show publication dates</li>
                <li><code>show_author="true"</code> - Show author information</li>
                <li><code>ahpra_compliance="true"</code> - Include AHPRA compliance disclaimers</li>
            </ul>
            
            <h3>Example</h3>
            <code>[jbsaas_blog posts="8" theme="healthcare" layout="grid" ahpra_compliance="true"]</code>
        </div>
        <?php
    }
}

// Initialize the plugin
new JBSAASHealthcareBlog();

// Plugin activation hook
register_activation_hook(__FILE__, function() {
    // Set default options
    add_option('jbsaas_business_id', '${businessProfile?.id}');
    add_option('jbsaas_api_key', '');
});

// Plugin deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Cleanup if needed
});
?>`;

    const pluginCSS = `/* JBSAAS Healthcare Blog Plugin Styles */
.jbsaas-blog-widget {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
}

.jbsaas-blog-widget .jbsaas-loading {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.jbsaas-blog-widget article {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    background: white;
    transition: box-shadow 0.2s;
}

.jbsaas-blog-widget article:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.jbsaas-blog-widget .grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.jbsaas-blog-widget .healthcare-disclaimer {
    background: #f8f9fa;
    border-left: 4px solid #007bff;
    padding: 1rem;
    margin-top: 1rem;
    font-size: 0.9em;
    color: #666;
}

.jbsaas-blog-widget .ahpra-info {
    background: #e3f2fd;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.8em;
    margin-top: 0.5rem;
}

@media (max-width: 768px) {
    .jbsaas-blog-widget .grid-layout {
        grid-template-columns: 1fr;
    }
    
    .jbsaas-blog-widget article {
        padding: 1rem;
    }
}`;

    const readmeFile = `=== JBSAAS Healthcare Blog ===
Contributors: jbsaas
Tags: healthcare, blog, ahpra, medical, australia
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AHPRA-compliant healthcare blog integration for Australian medical practices.

== Description ==

The JBSAAS Healthcare Blog plugin allows Australian healthcare practices to seamlessly integrate their JBSAAS blog content into their WordPress websites while maintaining full AHPRA compliance.

**Key Features:**

* **AHPRA Compliant** - Automatic medical disclaimers and practice registration display
* **Easy Integration** - Simple shortcode implementation
* **Responsive Design** - Mobile-optimized display
* **SEO Optimized** - Schema.org markup for healthcare content
* **Australian Focus** - Designed specifically for Australian healthcare practices
* **Multiple Layouts** - Grid, list, and card display options
* **Customizable** - Theme and styling options

**Perfect for:**

* Medical practices
* Dental clinics
* Allied health professionals
* Healthcare specialists
* Physiotherapy clinics
* Psychology practices

== Installation ==

1. Upload the plugin files to the '/wp-content/plugins/jbsaas-healthcare-blog' directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Go to Settings → JBSAAS Blog to configure your API settings
4. Get your API key and Business ID from your JBSAAS dashboard
5. Use the [jbsaas_blog] shortcode in any post or page

== Frequently Asked Questions ==

= Is this plugin AHPRA compliant? =

Yes, the plugin automatically includes required medical disclaimers and AHPRA registration information as per Australian healthcare advertising guidelines.

= Do I need a JBSAAS account? =

Yes, you need an active JBSAAS account and API credentials to use this plugin.

= Can I customize the appearance? =

Yes, the plugin includes multiple themes and layout options, plus you can add custom CSS.

= Is it mobile responsive? =

Yes, all blog layouts are fully responsive and mobile-optimized.

== Changelog ==

= 1.0.0 =
* Initial release
* AHPRA compliant blog integration
* Shortcode implementation
* Admin settings panel
* Multiple layout options
* Mobile responsive design

== Upgrade Notice ==

= 1.0.0 =
Initial release of the JBSAAS Healthcare Blog plugin.`;

    return {
      'plugin-main': {
        content: pluginMainFile,
        language: 'php',
        filename: 'jbsaas-healthcare-blog.php',
        downloadable: true
      },
      'plugin-css': {
        content: pluginCSS,
        language: 'css',
        filename: 'assets/style.css',
        downloadable: true
      },
      'readme': {
        content: readmeFile,
        language: 'text',
        filename: 'readme.txt',
        downloadable: true
      }
    };
  };

  // Shopify App Generator
  const generateShopifyApp = (): GeneratedCode => {
    const liquidTemplate = `{% comment %} JBSAAS Healthcare Blog Integration {% endcomment %}
{% assign business_id = '${businessProfile?.id}' %}
{% assign api_key = settings.jbsaas_api_key %}

<div class="jbsaas-healthcare-blog-section">
  <div id="jbsaas-blog-{{ business_id }}" 
       data-jbsaas-widget="blog"
       data-business-id="{{ business_id }}"
       data-theme="shopify-healthcare"
       data-posts="6"
       data-show-excerpt="true"
       data-show-date="true"
       data-show-author="true"
       data-ahpra-compliance="true"
       class="jbsaas-blog-container">
    <div class="jbsaas-loading">
      <div class="loading-spinner"></div>
      <p>Loading healthcare blog posts...</p>
    </div>
  </div>
</div>

<style>
.jbsaas-healthcare-blog-section {
  padding: 2rem 0;
  background: #f9fafb;
}

.jbsaas-blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.jbsaas-loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid {{ settings.accent_color | default: '#007bff' }};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Healthcare-specific styling */
.jbsaas-blog-widget article {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid {{ settings.accent_color | default: '#007bff' }};
}

.jbsaas-blog-widget .healthcare-disclaimer {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9em;
  color: #6c757d;
}

.jbsaas-blog-widget .ahpra-registration {
  background: #e3f2fd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.8em;
  margin-top: 0.5rem;
  color: #1976d2;
}

@media (max-width: 768px) {
  .jbsaas-healthcare-blog-section {
    padding: 1rem 0;
  }
  
  .jbsaas-blog-container {
    padding: 0 0.5rem;
  }
  
  .jbsaas-blog-widget article {
    padding: 1rem;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Load JBSAAS widget script
  var script = document.createElement('script');
  script.src = 'https://cdn.jbsaas.com/widget.js';
  script.async = true;
  script.onload = function() {
    if (window.JBSAAS) {
      window.JBSAAS.init({
        containerId: 'jbsaas-blog-{{ business_id }}',
        businessId: '{{ business_id }}',
        theme: 'shopify-healthcare',
        postsPerPage: 6,
        showExcerpt: true,
        showDate: true,
        showAuthor: true,
        ahpraCompliance: true,
        customStyles: {
          primaryColor: '{{ settings.accent_color | default: "#007bff" }}',
          fontFamily: '{{ settings.type_body_font.family | default: "Arial, sans-serif" }}'
        }
      });
    }
  };
  document.head.appendChild(script);
});
</script>`;

    const appConfig = `{
  "name": "JBSAAS Healthcare Blog",
  "description": "AHPRA-compliant healthcare blog integration for Australian medical practices",
  "version": "1.0.0",
  "author": "JBSAAS",
  "homepage": "https://jbsaas.com",
  "support_url": "https://support.jbsaas.com",
  "privacy_policy_url": "https://jbsaas.com/privacy",
  "app_url": "https://apps.jbsaas.com/shopify",
  "redirection_url": "https://apps.jbsaas.com/shopify/auth/callback",
  "webhooks": {
    "api_version": "2023-10",
    "subscriptions": [
      {
        "topic": "app/uninstalled",
        "uri": "https://apps.jbsaas.com/shopify/webhooks/uninstall"
      }
    ]
  },
  "application_url": "https://apps.jbsaas.com/shopify/install",
  "embedded": true,
  "pos": {
    "embedded": false
  },
  "preferences_url": "https://apps.jbsaas.com/shopify/preferences",
  "gdpr_webhooks": {
    "customer_data_request": "https://apps.jbsaas.com/shopify/gdpr/customer-data",
    "customer_redact": "https://apps.jbsaas.com/shopify/gdpr/customer-redact",
    "shop_redact": "https://apps.jbsaas.com/shopify/gdpr/shop-redact"
  }
}`;

    return {
      'liquid-template': {
        content: liquidTemplate,
        language: 'liquid',
        filename: 'sections/jbsaas-healthcare-blog.liquid'
      },
      'app-config': {
        content: appConfig,
        language: 'json',
        filename: 'shopify-app.json'
      }
    };
  };

  // Generate appropriate code based on platform type
  const generatePlatformCode = async (): Promise<GeneratedCode> => {
    if (!businessProfile) {
      throw new Error('Business profile required');
    }

    // Validate content if provided
    if (blogContent?.content) {
      const complianceCheck = validateContent(blogContent.content + ' ' + blogContent.title);
      if (!complianceCheck.isCompliant) {
        throw new Error(`AHPRA Compliance Issues: ${complianceCheck.issues.join(', ')}`);
      }
    }

    const baseApiUrl = window.location.origin;
    const businessId = businessProfile.id;

    switch (platform.integrationType) {
      case 'plugin':
        if (platform.id === 'wordpress') {
          return generateWordPressPlugin();
        } else if (platform.id === 'joomla') {
          return generateJoomlaModule();
        }
        break;

      case 'app':
        if (platform.id === 'shopify') {
          return generateShopifyApp();
        }
        break;

      case 'copy-paste':
        return generateCopyPasteContent();

      case 'embed':
        return generateEmbedCode();

      case 'code-injection':
        return generateCodeInjection();

      case 'api':
        return generateAPIIntegration();

      case 'module':
        return generateModuleCode();

      default:
        return generateGenericIntegration();
    }

    return generateGenericIntegration();
  };

  // Copy-paste content generator (for GoDaddy, etc.)
  const generateCopyPasteContent = (): GeneratedCode => {
    if (!blogContent || !businessProfile) {
      throw new Error('Blog content and business profile required');
    }

    const cleanContent = blogContent.content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '');

    const seoTitle = blogContent.title.length > 60 ? blogContent.title.substring(0, 57) + '...' : blogContent.title;
    const metaDescription = cleanContent.substring(0, 155).replace(/\n/g, ' ').trim() + '...';
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": blogContent.title,
      "description": metaDescription,
      "author": {
        "@type": "Organization",
        "name": businessProfile.practice_name,
        "url": businessProfile.website_url
      },
      "publisher": {
        "@type": "Organization",
        "name": businessProfile.practice_name
      },
      "datePublished": new Date().toISOString(),
      "articleSection": "Healthcare",
      "keywords": blogContent.keywords.split(',').map(k => k.trim()).filter(Boolean)
    };

    const htmlContent = `<!-- JBSAAS Generated Healthcare Blog Post -->
<article itemscope itemtype="https://schema.org/Article">
  <header>
    <h1 itemprop="headline">${blogContent.title}</h1>
    <div class="post-meta" style="color: #666; font-size: 0.9em; margin-bottom: 1.5em;">
      <span itemprop="author" itemscope itemtype="https://schema.org/Organization">
        By <span itemprop="name">${businessProfile.practice_name}</span>
      </span>
      <time itemprop="datePublished" datetime="${new Date().toISOString()}">
        ${new Date().toLocaleDateString('en-AU', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </time>
    </div>
  </header>
  
  <div itemprop="articleBody" style="line-height: 1.6; color: #333;">
    ${cleanContent.split('\n').map(paragraph => 
      paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
    ).filter(Boolean).join('\n    ')}
  </div>
  
  <!-- AHPRA Compliance Footer -->
  <footer style="margin-top: 2em; padding: 1em; background: #f8f9fa; border-left: 4px solid #007bff; font-size: 0.9em;">
    <p><strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical advice specific to your situation.</p>
    ${businessProfile.ahpra_registration ? `<p><strong>AHPRA Registration:</strong> ${businessProfile.ahpra_registration}</p>` : ''}
  </footer>
</article>

<!-- Schema.org Structured Data -->
<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;

    const seoMeta = `<!-- SEO Meta Tags - Add to your page <head> section -->
<title>${seoTitle} | ${businessProfile.practice_name}</title>
<meta name="description" content="${metaDescription}">
<meta name="keywords" content="${blogContent.keywords}">
<meta name="robots" content="index, follow">
<meta name="author" content="${businessProfile.practice_name}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="article">
<meta property="og:title" content="${blogContent.title}">
<meta property="og:description" content="${metaDescription}">
<meta property="og:url" content="${businessProfile.website_url}">
<meta property="og:site_name" content="${businessProfile.practice_name}">
${businessProfile.website_url ? `<meta property="og:image" content="${businessProfile.website_url}/blog-image.jpg">` : ''}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${blogContent.title}">
<meta name="twitter:description" content="${metaDescription}">

<!-- Healthcare-specific meta -->
<meta name="medical-disclaimer" content="true">
<meta name="ahpra-compliant" content="true">`;

    const socialContent = `🏥 New blog post from ${businessProfile.practice_name}!

📖 ${blogContent.title}

${metaDescription}

💡 Key topics: ${blogContent.keywords}

🔗 Read more: ${businessProfile.website_url}

#Healthcare #${businessProfile.profession_type || 'Medical'} #PatientEducation #Australia
${businessProfile.ahpra_registration ? '#AHPRA' : ''}

---
Medical Disclaimer: This information is educational only. Always consult your healthcare provider for personalized medical advice.`;

    return {
      'html-content': {
        content: htmlContent,
        language: 'html'
      },
      'seo-meta': {
        content: seoMeta,
        language: 'html'
      },
      'social-content': {
        content: socialContent,
        language: 'text'
      }
    };
  };

  // Embed code generator
  const generateEmbedCode = (): GeneratedCode => {
    const embedCode = `<!-- JBSAAS Healthcare Blog Widget -->
<div data-jbsaas-widget="blog" 
     data-business-id="${businessProfile?.id}"
     data-theme="healthcare"
     data-posts="6"
     data-show-excerpt="true"
     data-show-date="true"
     data-show-author="true"
     data-ahpra-compliance="true"
     style="width: 100%; min-height: 400px;">
</div>
<script src="https://brand-burst-blitz.vercel.app/widget.js" async></script>
<!-- End JBSAAS Widget -->`;

    const iframeEmbed = `<!-- JBSAAS Healthcare Blog iFrame -->
<iframe 
  src="https://brand-burst-blitz.vercel.app/embed/blog?businessId=${businessProfile?.id}&theme=healthcare&posts=6" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border: none; border-radius: 8px;"
  title="Healthcare Blog Posts">
</iframe>`;

    return {
      'embed-widget': {
        content: embedCode,
        language: 'html'
      },
      'iframe-embed': {
        content: iframeEmbed,
        language: 'html'
      }
    };
  };

  // Generic integration fallback
  const generateGenericIntegration = (): GeneratedCode => {
    return {
      'instructions': {
        content: `Platform integration instructions for ${platform.name} will be generated here.`,
        language: 'text'
      }
    };
  };

  // Add stub functions for other integration types
  const generateJoomlaModule = (): GeneratedCode => ({ 'joomla-module': { content: 'Joomla module code here', language: 'php' } });
  const generateCodeInjection = (): GeneratedCode => ({ 'code-injection': { content: 'Code injection snippet here', language: 'html' } });
  const generateAPIIntegration = (): GeneratedCode => ({ 'api-integration': { content: 'API integration code here', language: 'javascript' } });
  const generateModuleCode = (): GeneratedCode => ({ 'module-code': { content: 'Module code here', language: 'text' } });

  // Generate code when platform changes
  useEffect(() => {
    if (platform && businessProfile) {
      setIsGenerating(true);
      generatePlatformCode()
        .then(setGeneratedCode)
        .catch(error => {
          toast({
            title: "Generation Failed",
            description: error.message,
            variant: "destructive"
          });
        })
        .finally(() => setIsGenerating(false));
    }
  }, [platform, businessProfile, blogContent]);

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
      toast({
        title: "Copied!",
        description: `${type} content copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy manually",
        variant: "destructive"
      });
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${filename} has been downloaded`,
    });
  };

  if (!businessProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please complete your business profile setup first.</p>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Zap className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Generating {platform.name} integration code...</p>
        </CardContent>
      </Card>
    );
  }

  const codeEntries = Object.entries(generatedCode);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            {platform.name} Integration Code
          </CardTitle>
          <CardDescription>
            Platform-specific, AHPRA-compliant integration code ready for deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-600">{platform.integrationType}</Badge>
              <Badge variant="outline">{platform.difficulty}</Badge>
              <Badge variant="outline">{platform.setupTime}</Badge>
            </div>
            <p className="text-sm">{platform.description}</p>
          </div>

          {codeEntries.length > 0 && (
            <Tabs defaultValue={codeEntries[0][0]} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${codeEntries.length}, 1fr)` }}>
                {codeEntries.map(([key, code]) => (
                  <TabsTrigger key={key} value={key} className="text-sm">
                    {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TabsTrigger>
                ))}
              </TabsList>

              {codeEntries.map(([key, code]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {code.filename || key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code.content, key)}
                      >
                        {copiedStates[key] ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {copiedStates[key] ? 'Copied!' : 'Copy'}
                      </Button>
                      {code.downloadable && code.filename && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(code.content, code.filename!)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={code.content}
                    readOnly
                    rows={Math.min(Math.max(code.content.split('\n').length, 10), 30)}
                    className="font-mono text-sm"
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 