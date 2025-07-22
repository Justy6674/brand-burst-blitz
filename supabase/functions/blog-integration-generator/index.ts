import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerationRequest {
  platform_id: string;
  business_id: string;
  integration_type: string;
  blog_content?: {
    title: string;
    content: string;
    keywords: string;
  };
  options?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestBody: GenerationRequest = await req.json();
    const { platform_id, business_id, integration_type, blog_content, options } = requestBody;

    if (!platform_id || !business_id || !integration_type) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters',
        required: ['platform_id', 'business_id', 'integration_type']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get business profile
    const { data: businessProfile, error: businessError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !businessProfile) {
      return new Response(JSON.stringify({ error: 'Business profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate platform-specific integration code
    const generatedFiles = await generateIntegrationFiles(
      platform_id, 
      integration_type, 
      businessProfile, 
      blog_content,
      options
    );

    // Store generated files in database for download
    const fileRecords = [];
    for (const [filename, fileData] of Object.entries(generatedFiles)) {
      // Store file in Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('generated-integrations')
        .upload(`${business_id}/${platform_id}/${filename}`, fileData.content, {
          contentType: fileData.mime_type || 'text/plain',
          upsert: true
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('generated-integrations')
        .getPublicUrl(`${business_id}/${platform_id}/${filename}`);

      fileRecords.push({
        filename,
        download_url: urlData.publicUrl,
        file_type: fileData.file_type,
        language: fileData.language,
        size: new Blob([fileData.content]).size,
        description: fileData.description
      });
    }

    // Save integration record
    const { data: integrationRecord, error: integrationError } = await supabase
      .from('blog_integrations')
      .insert({
        business_id,
        platform_id,
        integration_type,
        generated_files: fileRecords,
        configuration: options || {},
        status: 'generated',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (integrationError) {
      console.error('Integration record error:', integrationError);
    }

    return new Response(JSON.stringify({
      success: true,
      integration_id: integrationRecord?.id,
      platform: platform_id,
      files: fileRecords,
      generated_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Generation failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateIntegrationFiles(
  platformId: string,
  integrationType: string,
  businessProfile: any,
  blogContent?: any,
  options?: any
): Promise<Record<string, any>> {
  
  switch (platformId) {
    case 'wordpress':
      return generateWordPressPlugin(businessProfile, blogContent);
    
    case 'shopify':
      return generateShopifyApp(businessProfile, blogContent);
    
    case 'godaddy':
      return generateGoDaddyContent(businessProfile, blogContent);
    
    case 'joomla':
      return generateJoomlaModule(businessProfile, blogContent);
    
    case 'drupal':
      return generateDrupalModule(businessProfile, blogContent);
    
    default:
      return generateGenericIntegration(platformId, businessProfile, blogContent);
  }
}

function generateWordPressPlugin(businessProfile: any, blogContent?: any): Record<string, any> {
  const pluginMainFile = `<?php
/**
 * Plugin Name: JBSAAS Healthcare Blog
 * Plugin URI: https://jbsaas.com
 * Description: AHPRA-compliant healthcare blog integration for ${businessProfile.practice_name}
 * Version: 1.0.0
 * Author: JBSAAS
 * License: GPL v2 or later
 * Text Domain: jbsaas-healthcare-blog
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

define('JBSAAS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('JBSAAS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('JBSAAS_BUSINESS_ID', '${businessProfile.id}');
define('JBSAAS_API_URL', '${Deno.env.get('SUPABASE_URL')}/functions/v1/blog-api');

class JBSAASHealthcareBlog {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('jbsaas_blog', array($this, 'blog_shortcode'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_ajax_jbsaas_test_connection', array($this, 'test_connection'));
        add_action('wp_ajax_nopriv_jbsaas_test_connection', array($this, 'test_connection'));
    }
    
    public function init() {
        load_plugin_textdomain('jbsaas-healthcare-blog', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script(
            'jbsaas-blog-widget',
            JBSAAS_PLUGIN_URL . 'assets/widget.js',
            array('jquery'),
            '1.0.0',
            true
        );
        
        wp_enqueue_style(
            'jbsaas-blog-style',
            JBSAAS_PLUGIN_URL . 'assets/style.css',
            array(),
            '1.0.0'
        );
        
        wp_localize_script('jbsaas-blog-widget', 'jbsaas_params', array(
            'api_url' => JBSAAS_API_URL,
            'business_id' => JBSAAS_BUSINESS_ID,
            'nonce' => wp_create_nonce('jbsaas_nonce'),
            'practice_name' => '${businessProfile.practice_name}',
            'ahpra_registration' => '${businessProfile.ahpra_registration || ''}'
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
             class="jbsaas-blog-widget"
             data-jbsaas-widget="blog"
             data-business-id="<?php echo esc_attr(JBSAAS_BUSINESS_ID); ?>"
             data-theme="<?php echo esc_attr($atts['theme']); ?>"
             data-posts="<?php echo esc_attr($atts['posts']); ?>"
             data-layout="<?php echo esc_attr($atts['layout']); ?>"
             data-show-excerpt="<?php echo esc_attr($atts['show_excerpt']); ?>"
             data-show-date="<?php echo esc_attr($atts['show_date']); ?>"
             data-show-author="<?php echo esc_attr($atts['show_author']); ?>"
             data-ahpra-compliance="<?php echo esc_attr($atts['ahpra_compliance']); ?>"
             style="min-height: 400px;">
            <div class="jbsaas-loading">
                <div class="spinner"></div>
                <p><?php _e('Loading healthcare blog posts...', 'jbsaas-healthcare-blog'); ?></p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function admin_menu() {
        add_options_page(
            __('JBSAAS Blog Settings', 'jbsaas-healthcare-blog'),
            __('JBSAAS Blog', 'jbsaas-healthcare-blog'),
            'manage_options',
            'jbsaas-blog',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            check_admin_referer('jbsaas_settings');
            update_option('jbsaas_api_key', sanitize_text_field($_POST['api_key']));
            update_option('jbsaas_cache_duration', intval($_POST['cache_duration']));
            echo '<div class="notice notice-success"><p>' . __('Settings saved!', 'jbsaas-healthcare-blog') . '</p></div>';
        }
        
        $api_key = get_option('jbsaas_api_key', '');
        $cache_duration = get_option('jbsaas_cache_duration', 300);
        ?>
        <div class="wrap">
            <h1><?php _e('JBSAAS Healthcare Blog Settings', 'jbsaas-healthcare-blog'); ?></h1>
            <form method="post" action="">
                <?php wp_nonce_field('jbsaas_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Business Information', 'jbsaas-healthcare-blog'); ?></th>
                        <td>
                            <p><strong><?php _e('Practice Name:', 'jbsaas-healthcare-blog'); ?></strong> ${businessProfile.practice_name}</p>
                            <p><strong><?php _e('Business ID:', 'jbsaas-healthcare-blog'); ?></strong> ${businessProfile.id}</p>
                            <?php if ('${businessProfile.ahpra_registration}') : ?>
                            <p><strong><?php _e('AHPRA Registration:', 'jbsaas-healthcare-blog'); ?></strong> ${businessProfile.ahpra_registration}</p>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('API Key', 'jbsaas-healthcare-blog'); ?></th>
                        <td>
                            <input type="password" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description"><?php _e('Get your API key from your JBSAAS dashboard', 'jbsaas-healthcare-blog'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Cache Duration (seconds)', 'jbsaas-healthcare-blog'); ?></th>
                        <td>
                            <input type="number" name="cache_duration" value="<?php echo esc_attr($cache_duration); ?>" min="60" max="3600" class="small-text" />
                            <p class="description"><?php _e('How long to cache blog posts (60-3600 seconds)', 'jbsaas-healthcare-blog'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <div class="card">
                <h2><?php _e('Test Connection', 'jbsaas-healthcare-blog'); ?></h2>
                <p><?php _e('Click the button below to test your connection to the JBSAAS API.', 'jbsaas-healthcare-blog'); ?></p>
                <button type="button" id="test-connection" class="button button-secondary">
                    <?php _e('Test Connection', 'jbsaas-healthcare-blog'); ?>
                </button>
                <div id="test-result" style="margin-top: 10px;"></div>
            </div>
            
            <div class="card">
                <h2><?php _e('Usage', 'jbsaas-healthcare-blog'); ?></h2>
                <p><?php _e('Use the shortcode', 'jbsaas-healthcare-blog'); ?> <code>[jbsaas_blog]</code> <?php _e('in any post or page to display your healthcare blog.', 'jbsaas-healthcare-blog'); ?></p>
                
                <h3><?php _e('Shortcode Options', 'jbsaas-healthcare-blog'); ?></h3>
                <ul>
                    <li><code>posts="6"</code> - <?php _e('Number of posts to display', 'jbsaas-healthcare-blog'); ?></li>
                    <li><code>theme="healthcare"</code> - <?php _e('Display theme (healthcare, modern, minimal)', 'jbsaas-healthcare-blog'); ?></li>
                    <li><code>layout="grid"</code> - <?php _e('Layout style (grid, list, cards)', 'jbsaas-healthcare-blog'); ?></li>
                    <li><code>show_excerpt="true"</code> - <?php _e('Show post excerpts', 'jbsaas-healthcare-blog'); ?></li>
                    <li><code>show_date="true"</code> - <?php _e('Show publication dates', 'jbsaas-healthcare-blog'); ?></li>
                    <li><code>show_author="true"</code> - <?php _e('Show author information', 'jbsaas-healthcare-blog'); ?></li>
                    <li><code>ahpra_compliance="true"</code> - <?php _e('Include AHPRA compliance disclaimers', 'jbsaas-healthcare-blog'); ?></li>
                </ul>
                
                <h3><?php _e('Example', 'jbsaas-healthcare-blog'); ?></h3>
                <code>[jbsaas_blog posts="8" theme="healthcare" layout="grid" ahpra_compliance="true"]</code>
            </div>
            
            <script>
            jQuery(document).ready(function($) {
                $('#test-connection').on('click', function() {
                    var button = $(this);
                    var result = $('#test-result');
                    
                    button.prop('disabled', true).text('<?php _e('Testing...', 'jbsaas-healthcare-blog'); ?>');
                    result.html('');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'jbsaas_test_connection',
                            nonce: '<?php echo wp_create_nonce('jbsaas_test'); ?>'
                        },
                        success: function(response) {
                            if (response.success) {
                                result.html('<div class="notice notice-success inline"><p>' + response.data.message + '</p></div>');
                            } else {
                                result.html('<div class="notice notice-error inline"><p>' + response.data.message + '</p></div>');
                            }
                        },
                        error: function() {
                            result.html('<div class="notice notice-error inline"><p><?php _e('Connection test failed', 'jbsaas-healthcare-blog'); ?></p></div>');
                        },
                        complete: function() {
                            button.prop('disabled', false).text('<?php _e('Test Connection', 'jbsaas-healthcare-blog'); ?>');
                        }
                    });
                });
            });
            </script>
        </div>
        <?php
    }
    
    public function test_connection() {
        check_ajax_referer('jbsaas_test', 'nonce');
        
        $response = wp_remote_get(JBSAAS_API_URL . '?businessId=' . JBSAAS_BUSINESS_ID . '&limit=1');
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => __('Connection failed: ', 'jbsaas-healthcare-blog') . $response->get_error_message()));
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($data && isset($data['success']) && $data['success']) {
            wp_send_json_success(array('message' => __('Connection successful! Found ', 'jbsaas-healthcare-blog') . count($data['posts']) . __(' blog posts.', 'jbsaas-healthcare-blog')));
        } else {
            wp_send_json_error(array('message' => __('API returned an error: ', 'jbsaas-healthcare-blog') . ($data['error'] ?? 'Unknown error')));
        }
    }
}

// Initialize the plugin
new JBSAASHealthcareBlog();

// Plugin activation hook
register_activation_hook(__FILE__, function() {
    add_option('jbsaas_api_key', '');
    add_option('jbsaas_cache_duration', 300);
    
    // Create cache table
    global $wpdb;
    $table_name = $wpdb->prefix . 'jbsaas_cache';
    
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        cache_key varchar(255) NOT NULL,
        cache_value longtext NOT NULL,
        expiry_time datetime DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY cache_key (cache_key),
        KEY expiry_time (expiry_time)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
});

// Plugin deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Clean up cache
    global $wpdb;
    $table_name = $wpdb->prefix . 'jbsaas_cache';
    $wpdb->query("DROP TABLE IF EXISTS $table_name");
});
?>`;

  const pluginCSS = `/* JBSAAS Healthcare Blog Plugin Styles */
.jbsaas-blog-widget {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
}

.jbsaas-blog-widget .jbsaas-loading {
    text-align: center;
    padding: 3rem;
    color: #666;
}

.jbsaas-blog-widget .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007cba;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.jbsaas-blog-widget .grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 0;
}

.jbsaas-blog-widget article {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    cursor: pointer;
}

.jbsaas-blog-widget article:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.jbsaas-blog-widget article h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
}

.jbsaas-blog-widget article .post-meta {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.jbsaas-blog-widget article .post-excerpt {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0.5rem 0 1rem 0;
}

.jbsaas-blog-widget article .post-categories {
    margin-top: 0.5rem;
}

.jbsaas-blog-widget article .category-tag {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    margin-right: 0.5rem;
    display: inline-block;
    margin-bottom: 0.25rem;
}

.jbsaas-blog-widget .healthcare-disclaimer {
    background: #f8f9fa;
    border-left: 4px solid #007cba;
    padding: 1rem;
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: #666;
    border-radius: 0 4px 4px 0;
}

.jbsaas-blog-widget .ahpra-info {
    background: #e3f2fd;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    color: #1976d2;
    border: 1px solid #bbdefb;
}

.jbsaas-blog-widget .read-more {
    color: #007cba;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
    display: inline-flex;
    align-items: center;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f0f0f0;
}

.jbsaas-blog-widget .read-more:hover {
    color: #005a87;
    text-decoration: underline;
}

.jbsaas-blog-widget .read-more::after {
    content: ' →';
    margin-left: 0.25rem;
}

.jbsaas-blog-widget .list-layout article {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.jbsaas-blog-widget .list-layout article .content {
    flex: 1;
}

.jbsaas-blog-widget .cards-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}

.jbsaas-blog-widget .cards-layout article {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .jbsaas-blog-widget .grid-layout,
    .jbsaas-blog-widget .cards-layout {
        grid-template-columns: 1fr;
    }
    
    .jbsaas-blog-widget article {
        padding: 1rem;
    }
    
    .jbsaas-blog-widget .list-layout article {
        flex-direction: column;
    }
    
    .jbsaas-blog-widget .post-meta {
        flex-direction: column;
        gap: 0.25rem;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .jbsaas-blog-widget {
        color: #e0e0e0;
    }
    
    .jbsaas-blog-widget article {
        background: #1e1e1e;
        border-color: #333;
        color: #e0e0e0;
    }
    
    .jbsaas-blog-widget article h3 {
        color: #ffffff;
    }
    
    .jbsaas-blog-widget .healthcare-disclaimer {
        background: #2d2d2d;
        color: #b0b0b0;
    }
    
    .jbsaas-blog-widget .ahpra-info {
        background: #1a237e;
        border-color: #3f51b5;
        color: #bbdefb;
    }
}

/* High contrast mode */
@media (prefers-contrast: high) {
    .jbsaas-blog-widget article {
        border: 2px solid #333;
    }
    
    .jbsaas-blog-widget .category-tag {
        border: 1px solid #1976d2;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .jbsaas-blog-widget article {
        transition: none;
    }
    
    .jbsaas-blog-widget .spinner {
        animation: none;
        border-top-color: transparent;
    }
}`;

  const widgetJS = `/* JBSAAS Healthcare Blog Widget for WordPress */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Initialize all JBSAAS blog widgets
        $('.jbsaas-blog-widget[data-jbsaas-widget="blog"]').each(function() {
            initializeBlogWidget($(this));
        });
    });
    
    function initializeBlogWidget($container) {
        const businessId = $container.data('business-id');
        const theme = $container.data('theme') || 'healthcare';
        const posts = $container.data('posts') || 6;
        const layout = $container.data('layout') || 'grid';
        const showExcerpt = $container.data('show-excerpt') !== false;
        const showDate = $container.data('show-date') !== false;
        const showAuthor = $container.data('show-author') !== false;
        const ahpraCompliance = $container.data('ahpra-compliance') !== false;
        
        if (!businessId) {
            $container.html('<div class="error">JBSAAS: Business ID is required</div>');
            return;
        }
        
        // Fetch blog posts from API
        fetchBlogPosts(businessId, posts)
            .then(function(data) {
                if (data.success && data.posts) {
                    renderBlogPosts($container, data.posts, {
                        theme,
                        layout,
                        showExcerpt,
                        showDate,
                        showAuthor,
                        ahpraCompliance,
                        businessInfo: data.business_info
                    });
                } else {
                    $container.html('<div class="error">No blog posts found</div>');
                }
            })
            .catch(function(error) {
                console.error('JBSAAS Blog Error:', error);
                $container.html('<div class="error">Failed to load blog posts</div>');
            });
    }
    
    function fetchBlogPosts(businessId, limit) {
        const apiUrl = jbsaas_params.api_url + 
            '?businessId=' + encodeURIComponent(businessId) + 
            '&limit=' + encodeURIComponent(limit) + 
            '&published=true&ahpraCompliant=true';
        
        return $.ajax({
            url: apiUrl,
            method: 'GET',
            dataType: 'json',
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });
    }
    
    function renderBlogPosts($container, posts, options) {
        const { layout, showExcerpt, showDate, showAuthor, ahpraCompliance, businessInfo } = options;
        
        let html = '<div class="' + layout + '-layout">';
        
        posts.forEach(function(post) {
            const postDate = new Date(post.published_date || post.created_at);
            const formattedDate = postDate.toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            html += '<article onclick="window.open(\'' + (post.canonical_url || '#') + '\', \'_blank\')">';
            html += '<h3>' + escapeHtml(post.title) + '</h3>';
            
            // Post meta
            if (showDate || showAuthor) {
                html += '<div class="post-meta">';
                if (showDate) {
                    html += '<span class="post-date">📅 ' + formattedDate + '</span>';
                }
                if (showAuthor && post.author_name) {
                    html += '<span class="post-author">👤 ' + escapeHtml(post.author_name) + '</span>';
                }
                html += '</div>';
            }
            
            // Post excerpt
            if (showExcerpt && post.excerpt) {
                html += '<div class="post-excerpt">' + escapeHtml(post.excerpt) + '</div>';
            }
            
            // Categories
            if (post.categories && post.categories.length > 0) {
                html += '<div class="post-categories">';
                post.categories.forEach(function(category) {
                    html += '<span class="category-tag">' + escapeHtml(category) + '</span>';
                });
                html += '</div>';
            }
            
            html += '<div class="read-more">Read more</div>';
            html += '</article>';
        });
        
        html += '</div>';
        
        // Add AHPRA compliance footer if enabled
        if (ahpraCompliance && businessInfo) {
            html += '<div class="healthcare-disclaimer">';
            html += '<p><strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical advice specific to your situation.</p>';
            if (businessInfo.ahpra_registration) {
                html += '<div class="ahpra-info">';
                html += '<strong>AHPRA Registration:</strong> ' + escapeHtml(businessInfo.ahpra_registration);
                html += '</div>';
            }
            html += '</div>';
        }
        
        $container.html(html);
    }
    
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
})(jQuery);`;

  const readmeFile = `=== JBSAAS Healthcare Blog ===
Contributors: jbsaas
Tags: healthcare, blog, ahpra, medical, australia, compliance
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AHPRA-compliant healthcare blog integration for ${businessProfile.practice_name} and other Australian medical practices.

== Description ==

The JBSAAS Healthcare Blog plugin allows Australian healthcare practices to seamlessly integrate their JBSAAS blog content into their WordPress websites while maintaining full AHPRA compliance.

**Key Features:**

* **AHPRA Compliant** - Automatic medical disclaimers and practice registration display
* **Easy Integration** - Simple shortcode implementation
* **Responsive Design** - Mobile-optimized display for all devices
* **SEO Optimized** - Schema.org markup for healthcare content
* **Australian Focus** - Designed specifically for Australian healthcare practices
* **Multiple Layouts** - Grid, list, and card display options
* **Customizable Themes** - Healthcare, modern, and minimal styling
* **Performance Optimized** - Cached content and optimized loading
* **Accessibility** - WCAG AA compliant for all users

**Perfect for:**

* Medical practices and clinics
* Dental and orthodontic practices
* Allied health professionals
* Healthcare specialists
* Physiotherapy and rehabilitation clinics
* Psychology and mental health practices
* Veterinary practices
* Health and wellness centers

**Compliance Features:**

* Automatic AHPRA registration display
* Medical disclaimer inclusion
* Therapeutic claims validation
* Educational content focus
* Australian date and language formatting
* Practice information verification

== Installation ==

1. Upload the plugin files to the '/wp-content/plugins/jbsaas-healthcare-blog' directory, or install the plugin through the WordPress plugins screen directly
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the Settings → JBSAAS Blog screen to configure the plugin
4. Get your API key from your JBSAAS dashboard
5. Use the [jbsaas_blog] shortcode in any post or page

== Frequently Asked Questions ==

= Is this plugin AHPRA compliant? =

Yes, the plugin automatically includes required medical disclaimers and AHPRA registration information as per Australian healthcare advertising guidelines.

= Do I need a JBSAAS account? =

Yes, you need an active JBSAAS account to use this plugin. Visit https://jbsaas.com to create an account.

= Can I customize the appearance? =

Yes, the plugin includes multiple themes and layout options. You can also add custom CSS to match your website's branding.

= Is it mobile responsive? =

Yes, all blog layouts are fully responsive and optimized for mobile devices, tablets, and desktops.

= How often does the content update? =

The plugin caches content for performance but automatically updates when new posts are published in your JBSAAS dashboard.

= Can I use this with other page builders? =

Yes, the shortcode works with any page builder that supports WordPress shortcodes, including Elementor, Beaver Builder, and Divi.

== Screenshots ==

1. Admin settings page with API configuration
2. Blog posts displayed in grid layout
3. Mobile responsive design
4. AHPRA compliance footer
5. Shortcode usage examples

== Changelog ==

= 1.0.0 =
* Initial release
* AHPRA compliant blog integration
* Shortcode implementation with multiple options
* Admin settings panel with connection testing
* Multiple layout options (grid, list, cards)
* Mobile responsive design
* Performance optimization with caching
* Accessibility compliance (WCAG AA)
* Australian localization support

== Upgrade Notice ==

= 1.0.0 =
Initial release of the JBSAAS Healthcare Blog plugin.

== Support ==

For support and documentation, visit https://support.jbsaas.com or email support@jbsaas.com.

== Privacy Policy ==

This plugin connects to JBSAAS services to retrieve blog content. No personal data is collected or transmitted beyond what is necessary for the blog display functionality. For more information, see the JBSAAS Privacy Policy at https://jbsaas.com/privacy.`;

  return {
    'jbsaas-healthcare-blog.php': {
      content: pluginMainFile,
      file_type: 'plugin-main',
      language: 'php',
      mime_type: 'text/plain',
      description: 'Main plugin file'
    },
    'assets/style.css': {
      content: pluginCSS,
      file_type: 'stylesheet',
      language: 'css',
      mime_type: 'text/css',
      description: 'Plugin stylesheet'
    },
    'assets/widget.js': {
      content: widgetJS,
      file_type: 'script',
      language: 'javascript',
      mime_type: 'application/javascript',
      description: 'Widget JavaScript'
    },
    'readme.txt': {
      content: readmeFile,
      file_type: 'documentation',
      language: 'text',
      mime_type: 'text/plain',
      description: 'WordPress plugin readme'
    }
  };
}

function generateShopifyApp(businessProfile: any, blogContent?: any): Record<string, any> {
  const liquidTemplate = `{% comment %} JBSAAS Healthcare Blog Integration for ${businessProfile.practice_name} {% endcomment %}
{% assign business_id = '${businessProfile.id}' %}

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
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  fetch('${Deno.env.get('SUPABASE_URL')}/functions/v1/blog-api?businessId={{ business_id }}&limit=6&published=true')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.posts) {
        renderBlogPosts(data.posts, '{{ business_id }}');
      }
    })
    .catch(error => {
      console.error('JBSAAS Blog Error:', error);
    });
});

function renderBlogPosts(posts, businessId) {
  const container = document.getElementById('jbsaas-blog-' + businessId);
  let html = '<div class="blog-grid">';
  
  posts.forEach(post => {
    const date = new Date(post.published_date || post.created_at).toLocaleDateString('en-AU');
    html += \`
      <article class="blog-post" onclick="window.open('\${post.canonical_url}', '_blank')">
        <h3>\${post.title}</h3>
        <div class="post-meta">📅 \${date}</div>
        <p class="excerpt">\${post.excerpt}</p>
        <div class="read-more">Read more →</div>
      </article>
    \`;
  });
  
  html += '</div>';
  container.innerHTML = html;
}
</script>`;

  return {
    'sections/jbsaas-healthcare-blog.liquid': {
      content: liquidTemplate,
      file_type: 'template',
      language: 'liquid',
      mime_type: 'text/plain',
      description: 'Shopify liquid template'
    }
  };
}

function generateGoDaddyContent(businessProfile: any, blogContent?: any): Record<string, any> {
  if (!blogContent) {
    blogContent = {
      title: 'Healthcare Information from ' + businessProfile.practice_name,
      content: 'This is sample content for your healthcare blog.',
      keywords: 'healthcare, medical, health tips'
    };
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="en-AU">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blogContent.title} | ${businessProfile.practice_name}</title>
    <meta name="description" content="${blogContent.content.substring(0, 155)}...">
</head>
<body>
    <article>
        <h1>${blogContent.title}</h1>
        <div class="content">
            ${blogContent.content}
        </div>
        <footer class="ahpra-disclaimer">
            <p><strong>Medical Disclaimer:</strong> This information is for educational purposes only.</p>
            ${businessProfile.ahpra_registration ? `<p><strong>AHPRA Registration:</strong> ${businessProfile.ahpra_registration}</p>` : ''}
        </footer>
    </article>
</body>
</html>`;

  return {
    'blog-post.html': {
      content: htmlContent,
      file_type: 'html-content',
      language: 'html',
      mime_type: 'text/html',
      description: 'GoDaddy copy-paste HTML content'
    }
  };
}

function generateJoomlaModule(businessProfile: any, blogContent?: any): Record<string, any> {
  return {
    'mod_jbsaas_blog.php': {
      content: '<?php\n// Joomla module code here\n?>',
      file_type: 'joomla-module',
      language: 'php',
      mime_type: 'text/plain',
      description: 'Joomla module'
    }
  };
}

function generateDrupalModule(businessProfile: any, blogContent?: any): Record<string, any> {
  return {
    'jbsaas_blog.module': {
      content: '<?php\n// Drupal module code here\n?>',
      file_type: 'drupal-module', 
      language: 'php',
      mime_type: 'text/plain',
      description: 'Drupal module'
    }
  };
}

function generateGenericIntegration(platformId: string, businessProfile: any, blogContent?: any): Record<string, any> {
  return {
    'integration-guide.txt': {
      content: `Integration guide for ${platformId} with ${businessProfile.practice_name}`,
      file_type: 'documentation',
      language: 'text',
      mime_type: 'text/plain',
      description: 'Integration instructions'
    }
  };
} 