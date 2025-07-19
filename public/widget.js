// JBSAAS Blog Widget - Embeddable JavaScript Widget
(function() {
  'use strict';
  
  // Prevent multiple initialization
  if (window.JBSAASBlog) return;
  
  const JBSAASBlog = {
    version: '1.0.0',
    baseUrl: window.location.origin.includes('localhost') 
      ? 'http://localhost:5173' 
      : 'https://your-jbsaas-domain.com',
    
    init: function(config) {
      this.config = {
        container: 'jbsaas-blog-widget',
        blogUrl: '',
        style: 'modern',
        maxPosts: 10,
        showAuthor: true,
        showDate: true,
        showExcerpt: true,
        showTags: true,
        ...config
      };
      
      this.loadCSS();
      this.loadBlog();
    },
    
    loadCSS: function() {
      // Inject basic styles for the widget
      const css = `
        .jbsaas-blog-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .jbsaas-blog-post {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .jbsaas-blog-post:last-child {
          border-bottom: none;
        }
        .jbsaas-blog-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        .jbsaas-blog-title a {
          color: inherit;
          text-decoration: none;
        }
        .jbsaas-blog-title a:hover {
          color: #3b82f6;
        }
        .jbsaas-blog-meta {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }
        .jbsaas-blog-excerpt {
          color: #4b5563;
          margin-bottom: 1rem;
        }
        .jbsaas-blog-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .jbsaas-blog-tag {
          background: #f3f4f6;
          color: #374151;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
        .jbsaas-blog-read-more {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .jbsaas-blog-read-more:hover {
          color: #1d4ed8;
        }
        .jbsaas-blog-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          color: #6b7280;
        }
        .jbsaas-blog-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
        }
        .jbsaas-powered-by {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .jbsaas-powered-by a {
          color: #3b82f6;
          text-decoration: none;
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    },
    
    loadBlog: function() {
      const container = document.getElementById(this.config.container);
      if (!container) {
        console.error('JBSAAS Blog: Container element not found');
        return;
      }
      
      container.innerHTML = '<div class="jbsaas-blog-loading">Loading blog posts...</div>';
      
      this.fetchPosts()
        .then(posts => this.renderPosts(posts, container))
        .catch(error => this.renderError(error, container));
    },
    
    fetchPosts: async function() {
      try {
        const response = await fetch(`${this.baseUrl}/api/blog/posts?limit=${this.config.maxPosts}`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        return await response.json();
      } catch (error) {
        throw new Error('Unable to load blog posts. Please try again later.');
      }
    },
    
    renderPosts: function(posts, container) {
      if (!posts || posts.length === 0) {
        container.innerHTML = `
          <div class="jbsaas-blog-error">
            No blog posts available at this time.
          </div>
        `;
        return;
      }
      
      const postsHTML = posts.map(post => this.renderPost(post)).join('');
      const poweredBy = `
        <div class="jbsaas-powered-by">
          Powered by <a href="https://jbsaas.com" target="_blank">JBSAAS</a>
        </div>
      `;
      
      container.innerHTML = `
        <div class="jbsaas-blog-widget">
          ${postsHTML}
          ${poweredBy}
        </div>
      `;
    },
    
    renderPost: function(post) {
      const title = this.escapeHtml(post.title);
      const excerpt = this.config.showExcerpt ? this.escapeHtml(post.excerpt || '') : '';
      const author = this.config.showAuthor && post.author ? this.escapeHtml(post.author) : '';
      const date = this.config.showDate ? this.formatDate(post.created_at) : '';
      const tags = this.config.showTags && post.tags ? post.tags.map(tag => 
        `<span class="jbsaas-blog-tag">${this.escapeHtml(tag)}</span>`
      ).join('') : '';
      
      const meta = [];
      if (author) meta.push(author);
      if (date) meta.push(date);
      const metaText = meta.join(' • ');
      
      const postUrl = `${this.config.blogUrl || this.baseUrl}/blog/${post.id}`;
      
      return `
        <article class="jbsaas-blog-post">
          <h2 class="jbsaas-blog-title">
            <a href="${postUrl}" target="_blank">${title}</a>
          </h2>
          ${metaText ? `<div class="jbsaas-blog-meta">${metaText}</div>` : ''}
          ${excerpt ? `<div class="jbsaas-blog-excerpt">${excerpt}</div>` : ''}
          ${tags ? `<div class="jbsaas-blog-tags">${tags}</div>` : ''}
          <a href="${postUrl}" target="_blank" class="jbsaas-blog-read-more">
            Read more →
          </a>
        </article>
      `;
    },
    
    renderError: function(error, container) {
      container.innerHTML = `
        <div class="jbsaas-blog-error">
          ${this.escapeHtml(error.message)}
        </div>
      `;
    },
    
    formatDate: function(dateString) {
      try {
        return new Date(dateString).toLocaleDateString('en-AU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (e) {
        return '';
      }
    },
    
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };
  
  // Auto-initialize if config is available
  if (window.jbsaasBlogConfig) {
    document.addEventListener('DOMContentLoaded', function() {
      JBSAASBlog.init(window.jbsaasBlogConfig);
    });
  }
  
  // Expose to global scope
  window.JBSAASBlog = JBSAASBlog;
  
})();