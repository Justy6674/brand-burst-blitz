/**
 * JBSAAS Healthcare Blog Widget
 * Version: 1.0.0
 * Copyright (c) 2024 JBSAAS
 * 
 * This widget allows healthcare practices to embed their blog content
 * on any website with full AHPRA compliance and SEO optimization.
 */

(function(window, document) {
  'use strict';

  // Widget namespace
  window.JBSAAS = window.JBSAAS || {};
  
  // Widget configuration
  const config = {
    apiUrl: 'https://brand-burst-blitz.vercel.app/functions/v1/blog-api',
    cdnUrl: 'https://brand-burst-blitz.vercel.app',
    version: '1.0.0',
    defaultOptions: {
      theme: 'healthcare',
      layout: 'grid',
      postsPerPage: 6,
      showExcerpt: true,
      showDate: true,
      showAuthor: true,
      showCategories: true,
      ahpraCompliance: true,
      customStyles: {
        primaryColor: '#3b82f6',
        fontFamily: 'inherit'
      }
    }
  };

  // Main widget initialization
  window.JBSAAS.init = function(options) {
    const settings = Object.assign({}, config.defaultOptions, options);
    
    if (!settings.businessId) {
      console.error('JBSAAS Blog Widget: businessId is required');
      return;
    }

    if (!settings.containerId) {
      console.error('JBSAAS Blog Widget: containerId is required');
      return;
    }

    const container = document.getElementById(settings.containerId);
    if (!container) {
      console.error('JBSAAS Blog Widget: Container element not found:', settings.containerId);
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="jbsaas-loading">Loading healthcare blog posts...</div>';
    
    // Inject CSS
    injectStyles(settings);
    
    // Fetch and render blog posts
    fetchBlogPosts(settings)
      .then(data => {
        if (data.posts && data.posts.length > 0) {
          renderBlogPosts(container, data.posts, settings);
        } else {
          container.innerHTML = '<div class="jbsaas-no-posts">No blog posts available yet.</div>';
        }
      })
      .catch(error => {
        console.error('JBSAAS Blog Widget Error:', error);
        container.innerHTML = '<div class="jbsaas-error">Unable to load blog posts. Please try again later.</div>';
      });
  };

  // Auto-initialize widgets with data attributes
  window.JBSAAS.autoInit = function() {
    const widgets = document.querySelectorAll('[data-jbsaas-widget="blog"]');
    widgets.forEach(widget => {
      const businessId = widget.getAttribute('data-business-id');
      const theme = widget.getAttribute('data-theme') || 'healthcare';
      const posts = parseInt(widget.getAttribute('data-posts') || '6');
      const layout = widget.getAttribute('data-layout') || 'grid';
      const showExcerpt = widget.getAttribute('data-show-excerpt') !== 'false';
      const showDate = widget.getAttribute('data-show-date') !== 'false';
      const showAuthor = widget.getAttribute('data-show-author') !== 'false';
      const ahpraCompliance = widget.getAttribute('data-ahpra-compliance') !== 'false';
      
      if (!businessId) {
        console.error('JBSAAS Blog Widget: data-business-id is required');
        return;
      }
      
      // Generate unique container ID
      const containerId = 'jbsaas-blog-' + Math.random().toString(36).substr(2, 9);
      widget.id = containerId;
      
      JBSAAS.init({
        businessId: businessId,
        containerId: containerId,
        theme: theme,
        layout: layout,
        postsPerPage: posts,
        showExcerpt: showExcerpt,
        showDate: showDate,
        showAuthor: showAuthor,
        ahpraCompliance: ahpraCompliance
      });
    });
  };

  // Fetch blog posts from API
  function fetchBlogPosts(settings) {
    const params = new URLSearchParams({
      businessId: settings.businessId,
      limit: settings.postsPerPage.toString(),
      published: 'true',
      ahpraCompliant: settings.ahpraCompliance.toString()
    });

    return fetch(config.apiUrl + '?' + params.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    });
  }

  // Render blog posts
  function renderBlogPosts(container, posts, settings) {
    let html = '<div class="jbsaas-blog-widget jbsaas-' + settings.layout + '-layout">';
    
    posts.forEach(post => {
      const postDate = new Date(post.published_date || post.created_at);
      const formattedDate = postDate.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      html += '<article class="jbsaas-blog-post">';
      
      // Featured image
      if (post.featured_image && settings.layout !== 'list') {
        html += '<div class="jbsaas-post-image">';
        html += '<img src="' + escapeHtml(post.featured_image) + '" alt="' + escapeHtml(post.title) + '" loading="lazy">';
        html += '</div>';
      }
      
      html += '<div class="jbsaas-post-content">';
      
      // Categories
      if (settings.showCategories && post.categories && post.categories.length > 0) {
        html += '<div class="jbsaas-post-categories">';
        post.categories.forEach(category => {
          html += '<span class="jbsaas-category">' + escapeHtml(category) + '</span>';
        });
        html += '</div>';
      }
      
      // Title
      html += '<h3 class="jbsaas-post-title">';
      html += '<a href="' + escapeHtml(post.canonical_url || '#') + '" target="_blank" rel="noopener">';
      html += escapeHtml(post.title);
      html += '</a>';
      html += '</h3>';
      
      // Excerpt
      if (settings.showExcerpt && post.excerpt) {
        html += '<p class="jbsaas-post-excerpt">' + escapeHtml(post.excerpt) + '</p>';
      }
      
      // Meta info
      html += '<div class="jbsaas-post-meta">';
      
      if (settings.showAuthor && post.author_name) {
        html += '<span class="jbsaas-author">By ' + escapeHtml(post.author_name) + '</span>';
      }
      
      if (settings.showDate) {
        html += '<span class="jbsaas-date">' + formattedDate + '</span>';
      }
      
      html += '</div>';
      
      // AHPRA compliance badge
      if (settings.ahpraCompliance && post.ahpra_compliant) {
        html += '<div class="jbsaas-compliance">';
        html += '<span class="jbsaas-ahpra-badge">✓ AHPRA Compliant</span>';
        html += '</div>';
      }
      
      html += '</div>'; // .jbsaas-post-content
      html += '</article>';
    });
    
    html += '</div>';
    
    // Add healthcare disclaimer if enabled
    if (settings.ahpraCompliance) {
      html += '<div class="jbsaas-healthcare-disclaimer">';
      html += '<p>This information is for educational purposes only and should not replace professional medical advice. ';
      html += 'Always consult with a qualified healthcare provider for medical concerns.</p>';
      html += '</div>';
    }
    
    container.innerHTML = html;
  }

  // Inject widget styles
  function injectStyles(settings) {
    const styleId = 'jbsaas-blog-widget-styles';
    
    // Check if styles already exist
    if (document.getElementById(styleId)) {
      return;
    }
    
    const styles = `
      .jbsaas-blog-widget {
        font-family: ${settings.customStyles.fontFamily};
        color: #1a202c;
        line-height: 1.6;
      }
      
      .jbsaas-loading {
        text-align: center;
        padding: 2rem;
        color: #718096;
      }
      
      .jbsaas-error,
      .jbsaas-no-posts {
        text-align: center;
        padding: 2rem;
        color: #718096;
        background: #f7fafc;
        border-radius: 0.5rem;
      }
      
      /* Grid Layout */
      .jbsaas-grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      
      /* List Layout */
      .jbsaas-list-layout .jbsaas-blog-post {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .jbsaas-list-layout .jbsaas-blog-post:last-child {
        border-bottom: none;
      }
      
      /* Card Layout */
      .jbsaas-cards-layout {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
      }
      
      /* Blog Post Styles */
      .jbsaas-blog-post {
        background: white;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        transition: box-shadow 0.3s ease;
      }
      
      .jbsaas-blog-post:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .jbsaas-post-image {
        aspect-ratio: 16/9;
        overflow: hidden;
      }
      
      .jbsaas-post-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .jbsaas-post-content {
        padding: 1.5rem;
      }
      
      .jbsaas-post-categories {
        margin-bottom: 0.5rem;
      }
      
      .jbsaas-category {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        margin-right: 0.5rem;
        background: #edf2f7;
        color: #4a5568;
        font-size: 0.875rem;
        border-radius: 9999px;
      }
      
      .jbsaas-post-title {
        margin: 0 0 0.75rem 0;
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1.4;
      }
      
      .jbsaas-post-title a {
        color: #2d3748;
        text-decoration: none;
        transition: color 0.2s;
      }
      
      .jbsaas-post-title a:hover {
        color: ${settings.customStyles.primaryColor};
      }
      
      .jbsaas-post-excerpt {
        margin: 0 0 1rem 0;
        color: #4a5568;
        font-size: 0.9375rem;
      }
      
      .jbsaas-post-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.875rem;
        color: #718096;
      }
      
      .jbsaas-compliance {
        margin-top: 0.75rem;
      }
      
      .jbsaas-ahpra-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #c6f6d5;
        color: #22543d;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 0.25rem;
      }
      
      .jbsaas-healthcare-disclaimer {
        margin-top: 2rem;
        padding: 1rem;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        color: #4a5568;
      }
      
      @media (max-width: 768px) {
        .jbsaas-grid-layout,
        .jbsaas-cards-layout {
          grid-template-columns: 1fr;
        }
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // Utility function to escape HTML
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.JBSAAS.autoInit();
    });
  } else {
    window.JBSAAS.autoInit();
  }

})(window, document);