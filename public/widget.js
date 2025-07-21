/**
 * JBSAAS Universal Blog Widget v2.0.0
 * Real-time blog content delivery for external websites
 * Connects to Supabase for live data, no placeholders
 */
(function(window) {
  'use strict';
  
  const JBSAAS = {
    apiBase: window.location.hostname === 'localhost' 
      ? 'http://localhost:54321/functions/v1'
      : 'https://ijpzunqmsqvgzwshglfl.supabase.co/functions/v1',
    
    init: function(config) {
      if (!config.containerId && !config.container) {
        console.error('JBSAAS: Container ID or element required');
        return;
      }
      
      const container = typeof config.container === 'string' 
        ? document.getElementById(config.container)
        : config.container || document.getElementById(config.containerId);
        
      if (!container) {
        console.error('JBSAAS: Container element not found');
        return;
      }
      
      // Track widget analytics
      this.trackEvent('load', {
        businessId: config.businessId,
        containerId: config.containerId || container.id,
        theme: config.theme,
        userAgent: navigator.userAgent
      });
      
      switch(config.type || 'blog') {
        case 'blog':
          this.initBlog(container, config);
          break;
        case 'faq-chatbot':
          this.initChatbot(container, config);
          break;
        default:
          this.initBlog(container, config);
      }
    },
    
    initBlog: function(container, config) {
      // Show loading state with healthcare styling
      container.innerHTML = `
        <div class="jbsaas-blog-widget" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div class="jbsaas-loading" style="text-align: center; padding: 2rem; color: #666;">
            <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #007bff; border-radius: 50%; animation: jbsaas-spin 1s linear infinite;"></div>
            <p style="margin-top: 1rem;">Loading healthcare blog posts...</p>
          </div>
        </div>
        <style>
          @keyframes jbsaas-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      
      // Fetch real blog posts from Supabase
      this.fetchBlogPosts(config)
        .then(data => {
          if (data.success && data.posts) {
            this.renderBlogPosts(container, data.posts, data.business_info, config);
            this.trackEvent('view', {
              businessId: config.businessId,
              postsLoaded: data.posts.length
            });
          } else {
            this.renderError(container, 'No blog posts available', config);
          }
        })
        .catch(error => {
          console.error('JBSAAS: Failed to load blog posts:', error);
          this.renderError(container, 'Failed to load blog posts. Please try again later.', config);
          this.trackEvent('error', {
            businessId: config.businessId,
            error: error.message
          });
        });
    },
    
    fetchBlogPosts: async function(config) {
      const businessId = config.businessId || config.blog_id || config.blogId;
      const postsPerPage = config.postsPerPage || config.posts || 6;
      
      if (!businessId) {
        throw new Error('Business ID required for blog widget');
      }
      
      const apiUrl = `${this.apiBase}/blog-api?businessId=${encodeURIComponent(businessId)}&limit=${postsPerPage}&published=true&ahpraCompliant=true`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'omit'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Use default error message
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    },
    
    renderBlogPosts: function(container, posts, businessInfo, config) {
      const theme = config.theme || 'modern';
      const layout = config.layout || 'grid';
      const showExcerpt = config.showExcerpt !== false;
      const showDate = config.showDate !== false;
      const showAuthor = config.showAuthor !== false;
      const showCategories = config.showCategories !== false;
      const ahpraCompliance = config.ahpraCompliance !== false;
      
      if (!posts || posts.length === 0) {
        this.renderError(container, 'No blog posts available at this time.', config);
        return;
      }
      
      const gridClass = layout === 'list' ? '' : 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;';
      const themeStyles = this.getThemeStyles(theme);
      
      const postsHTML = posts.map(post => {
        const postDate = new Date(post.published_date || post.created_at).toLocaleDateString('en-AU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const excerpt = showExcerpt && post.excerpt ? `<p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0.5rem 0;">${this.escapeHtml(post.excerpt)}</p>` : '';
        const dateDisplay = showDate ? `<span style="color: #888; font-size: 12px;">📅 ${postDate}</span>` : '';
        const authorDisplay = showAuthor && post.author_name ? `<span style="color: #888; font-size: 12px;">👤 ${this.escapeHtml(post.author_name)}</span>` : '';
        const categoriesDisplay = showCategories && post.categories && post.categories.length > 0 ? 
          `<div style="margin-top: 0.5rem;">${post.categories.map(cat => `<span style="background: #e3f2fd; color: #1976d2; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 11px; margin-right: 0.5rem;">${this.escapeHtml(cat)}</span>`).join('')}</div>` : '';
        
        const metadata = [dateDisplay, authorDisplay].filter(Boolean).join(' • ');
        
        return `
          <article style="${themeStyles.article}" 
                   onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)'" 
                   onmouseout="this.style.boxShadow='${themeStyles.articleShadow}'; this.style.transform='translateY(0)'"
                   onclick="this.handlePostClick('${post.canonical_url || '#'}', '${post.id}', '${config.businessId}')">
            <h3 style="${themeStyles.title}">
              ${this.escapeHtml(post.title)}
            </h3>
            ${metadata ? `<div style="margin-bottom: 1rem; font-size: 12px; color: #888;">${metadata}</div>` : ''}
            ${excerpt}
            ${categoriesDisplay}
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f0f0f0;">
              <span style="color: #1976d2; font-size: 13px; font-weight: 500;">Read more →</span>
            </div>
          </article>
        `;
      }).join('');
      
      // AHPRA compliance footer
      const complianceFooter = ahpraCompliance && businessInfo ? `
        <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-left: 4px solid #007bff; font-size: 0.9em; color: #666; border-radius: 0 4px 4px 0;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical advice specific to your situation.</p>
          ${businessInfo.ahpra_registration ? `<p style="margin: 0; color: #1976d2; font-size: 0.8em;"><strong>AHPRA Registration:</strong> ${this.escapeHtml(businessInfo.ahpra_registration)}</p>` : ''}
          <p style="margin: 0.5rem 0 0 0; color: #1976d2; font-size: 0.8em;"><strong>Practice:</strong> ${this.escapeHtml(businessInfo.practice_name)}</p>
        </div>
      ` : '';
      
      container.innerHTML = `
        <div class="jbsaas-blog-widget" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="${gridClass}">
            ${postsHTML}
          </div>
          ${complianceFooter}
          <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
            <a href="${businessInfo.website_url || '#'}" target="_blank" 
               style="color: #1976d2; text-decoration: none; font-size: 14px; font-weight: 500;">
              View All Posts →
            </a>
          </div>
        </div>
      `;
      
      // Add click handlers
      this.addPostClickHandlers(container, config);
    },
    
    renderError: function(container, message, config) {
      container.innerHTML = `
        <div class="jbsaas-blog-widget" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="padding: 2rem; text-align: center; color: #666; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
            <h3 style="margin: 0 0 1rem 0; color: #333;">Healthcare Blog</h3>
            <p style="margin: 0; font-size: 14px;">${this.escapeHtml(message)}</p>
            <p style="margin: 1rem 0 0 0; font-size: 12px; color: #999;">
              Powered by JBSAAS Healthcare Platform
            </p>
          </div>
        </div>
      `;
    },
    
    getThemeStyles: function(theme) {
      const themes = {
        modern: {
          article: 'border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; background: white; transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; margin-bottom: 1.5rem;',
          articleShadow: 'none',
          title: 'margin: 0 0 0.5rem 0; color: #333; font-size: 18px; font-weight: 600; line-height: 1.3;'
        },
        healthcare: {
          article: 'border: 1px solid #e3f2fd; border-radius: 12px; padding: 1.5rem; background: linear-gradient(to bottom, #ffffff, #f8fffe); transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; margin-bottom: 1.5rem; border-left: 4px solid #007bff;',
          articleShadow: '0 2px 4px rgba(0,123,255,0.1)',
          title: 'margin: 0 0 0.5rem 0; color: #1976d2; font-size: 18px; font-weight: 600; line-height: 1.3;'
        },
        minimal: {
          article: 'border-bottom: 1px solid #f0f0f0; padding: 1.5rem 0; transition: opacity 0.2s; cursor: pointer;',
          articleShadow: 'none',
          title: 'margin: 0 0 0.5rem 0; color: #333; font-size: 16px; font-weight: 500; line-height: 1.4;'
        }
      };
      
      return themes[theme] || themes.modern;
    },
    
    addPostClickHandlers: function(container, config) {
      // Handle post clicks properly
      container.addEventListener('click', (event) => {
        const article = event.target.closest('article');
        if (article && article.onclick) {
          // Extract URL from onclick attribute
          const onclickStr = article.getAttribute('onclick');
          const urlMatch = onclickStr.match(/handlePostClick\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/);
          
          if (urlMatch) {
            const [, url, postId, businessId] = urlMatch;
            this.handlePostClick(url, postId, businessId);
          }
        }
      });
    },
    
    handlePostClick: function(url, postId, businessId) {
      // Track click event
      this.trackEvent('click', {
        businessId: businessId,
        postId: postId,
        url: url
      });
      
      // Open post in new tab
      if (url && url !== '#') {
        window.open(url, '_blank');
      }
    },
    
    trackEvent: function(eventType, data) {
      // Send analytics to Supabase
      try {
        fetch(`${this.apiBase}/blog-widget-analytics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_type: eventType,
            widget_data: data,
            page_url: window.location.href,
            referrer_url: document.referrer,
            timestamp: new Date().toISOString()
          })
        }).catch(error => {
          // Silently fail analytics
          console.debug('JBSAAS Analytics:', error);
        });
      } catch (error) {
        // Silently fail analytics
        console.debug('JBSAAS Analytics:', error);
      }
    },
    
    initChatbot: function(container, config) {
      // Real chatbot implementation would go here
      container.innerHTML = `
        <div class="jbsaas-chatbot" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: #1976d2; color: white; padding: 1rem; border-radius: 8px 8px 0 0;">
            <h4 style="margin: 0; font-size: 16px;">Healthcare FAQ Assistant</h4>
          </div>
          <div style="background: white; border: 1px solid #e0e0e0; border-top: none; padding: 1rem; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Chat functionality requires integration setup. Contact support for activation.
            </p>
          </div>
        </div>
      `;
    },
    
    escapeHtml: function(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  };
  
  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', function() {
    const widgets = document.querySelectorAll('[data-jbsaas-widget]');
    widgets.forEach(function(widget) {
      const config = {
        container: widget,
        type: widget.getAttribute('data-jbsaas-widget') || 'blog',
        businessId: widget.getAttribute('data-business-id'),
        theme: widget.getAttribute('data-theme') || 'modern',
        layout: widget.getAttribute('data-layout') || 'grid',
        postsPerPage: parseInt(widget.getAttribute('data-posts')) || 6,
        showExcerpt: widget.getAttribute('data-show-excerpt') !== 'false',
        showDate: widget.getAttribute('data-show-date') !== 'false',
        showAuthor: widget.getAttribute('data-show-author') !== 'false',
        showCategories: widget.getAttribute('data-show-categories') !== 'false',
        ahpraCompliance: widget.getAttribute('data-ahpra-compliance') !== 'false'
      };
      JBSAAS.init(config);
    });
  });
  
  // Global API
  window.JBSAAS = JBSAAS;
  window.JBSAASBlog = JBSAAS;
  
})(window);