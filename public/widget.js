/**
 * JBSAAS Universal Embed Widget v1.0.0
 * Universal widget for embedding JBSAAS content on any website
 */
(function(window) {
  'use strict';
  
  const JBSAAS = {
    apiBase: 'https://api.jbsaas.com',
    
    init: function(config) {
      const container = document.getElementById(config.containerId);
      if (!container) return;
      
      switch(config.type || 'blog') {
        case 'blog':
          this.initBlog(container, config);
          break;
        case 'faq-chatbot':
          this.initChatbot(container, config);
          break;
      }
    },
    
    initBlog: function(container, config) {
      container.innerHTML = `
        <div class="jbsaas-blog-widget">
          <div class="jbsaas-loading">Loading blog posts...</div>
        </div>
      `;
      
      // Simulate loading posts
      setTimeout(() => {
        container.innerHTML = `
          <div class="jbsaas-blog-widget">
            <h3>Latest Posts</h3>
            <div class="jbsaas-post">
              <h4>Welcome to Our Blog</h4>
              <p>This is a sample blog post from your JBSAAS blog.</p>
            </div>
          </div>
        `;
      }, 1000);
    },
    
    initChatbot: function(container, config) {
      container.innerHTML = `
        <div class="jbsaas-chatbot">
          <button class="jbsaas-chat-toggle">💬 Chat</button>
          <div class="jbsaas-chat-window" style="display:none;">
            <div class="jbsaas-chat-header">FAQ Assistant</div>
            <div class="jbsaas-chat-messages">
              <div class="jbsaas-message">Hi! How can I help you?</div>
            </div>
            <input type="text" placeholder="Ask a question..." class="jbsaas-chat-input">
          </div>
        </div>
      `;
    }
  };
  
  window.JBSAAS = JBSAAS;
  window.JBSAASBlog = JBSAAS;
})(window);