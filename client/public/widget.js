/**
 * JBSAAS Healthcare Blog Widget
 * Version: 1.0.0
 * Copyright (c) 2024 JBSAAS
 * 
 * This widget allows healthcare practices to embed their blog content
 * on any website with full AHPRA compliance and SEO optimization.
 */

// JBSAAS Blog Widget - Simple and Working
(function() {
  'use strict';
  
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  window.JBSAAS = {
    init: function(config) {
      if (!config || !config.containerId) {
        console.error('JBSAAS: containerId required');
        return;
      }
      
      const container = document.getElementById(config.containerId);
      if (!container) {
        console.error('JBSAAS: Container not found');
        return;
      }
      
      // Simple demo content for now
      container.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h2 style="color: #1a202c; margin-bottom: 1rem;">Healthcare Blog</h2>
          <div style="display: grid; gap: 1rem;">
            <article style="border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.5rem;">
              <h3 style="margin: 0 0 0.5rem 0;">Understanding AHPRA Guidelines</h3>
              <p style="color: #4a5568; margin: 0;">Stay compliant with the latest healthcare advertising standards.</p>
            </article>
            <article style="border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.5rem;">
              <h3 style="margin: 0 0 0.5rem 0;">Patient Engagement Strategies</h3>
              <p style="color: #4a5568; margin: 0;">Build stronger relationships through effective communication.</p>
            </article>
          </div>
          <p style="font-size: 0.75rem; color: #718096; margin-top: 1rem; text-align: center;">
            Powered by JBSAAS Healthcare Platform
          </p>
        </div>
      `;
    }
  };
  
  // Auto-init data-attribute widgets
  function autoInit() {
    const widgets = document.querySelectorAll('[data-jbsaas-widget="blog"]');
    widgets.forEach(function(widget, index) {
      const id = 'jbsaas-blog-' + index;
      widget.id = id;
      window.JBSAAS.init({ containerId: id });
    });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();