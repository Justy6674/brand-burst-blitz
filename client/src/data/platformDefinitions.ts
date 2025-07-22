export interface PlatformDefinition {
  id: string;
  name: string;
  description: string;
  marketShare: string;
  icon: string;
  category: 'traditional' | 'ecommerce' | 'developer' | 'cms' | 'modern-dev';
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  setupTime: string;
  integrationType: 'copy-paste' | 'embed' | 'plugin' | 'app' | 'api' | 'module' | 'code-injection';
  features: string[];
  codeTypes: string[];
  instructions: {
    summary: string;
    steps: string[];
    screenshots: string[];
    verification: string[];
  };
  detectionPatterns: string[];
  supportedContentTypes: string[];
  complianceFeatures: string[];
}

export const AUSTRALIAN_PLATFORMS: PlatformDefinition[] = [
  // Top 20 Australian Website Builders
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Most popular CMS worldwide, dominant in Australian healthcare',
    marketShare: '43%',
    icon: '🔷',
    category: 'cms',
    difficulty: 'Easy',
    setupTime: '10 minutes',
    integrationType: 'plugin',
    features: ['Plugin installation', 'Shortcodes', 'SEO tools', 'Mobile themes', 'Auto-updates'],
    codeTypes: ['plugin-zip', 'shortcode', 'widget', 'php-code'],
    instructions: {
      summary: 'Install JBSAAS plugin and use shortcodes to display blog content',
      steps: [
        'Download JBSAAS WordPress plugin ZIP file',
        'Go to WordPress Admin → Plugins → Add New → Upload Plugin',
        'Upload and activate the JBSAAS plugin',
        'Go to JBSAAS Settings and enter your API key',
        'Add shortcode [jbsaas_blog] to any page or post',
        'Customize display options in plugin settings'
      ],
      screenshots: ['wp-admin-plugins.png', 'upload-plugin.png', 'activate-plugin.png', 'shortcode-example.png'],
      verification: ['Check shortcode renders blog posts', 'Verify mobile responsiveness', 'Test AHPRA compliance display']
    },
    detectionPatterns: ['wp-content', 'wordpress', '/wp-admin/', 'wp-includes'],
    supportedContentTypes: ['blog-posts', 'patient-education', 'health-tips', 'practice-updates'],
    complianceFeatures: ['AHPRA disclaimers', 'Medical advice warnings', 'Practice registration display']
  },
  {
    id: 'wix',
    name: 'Wix Australia',
    description: 'Visual website builder popular with Australian small businesses',
    marketShare: '8%',
    icon: '🎨',
    category: 'traditional',
    difficulty: 'Easy',
    setupTime: '5 minutes',
    integrationType: 'embed',
    features: ['Drag-drop embed', 'Auto-updating', 'Responsive design', 'Analytics integration'],
    codeTypes: ['iframe-embed', 'html-widget'],
    instructions: {
      summary: 'Add JBSAAS blog widget using Wix\'s HTML embed element',
      steps: [
        'Open Wix Editor for your site',
        'Click the "+" button to add elements',
        'Select "More" then "HTML iframe"',
        'Click "Enter Code" in the HTML element',
        'Paste the provided JBSAAS embed code',
        'Adjust size and position as needed',
        'Click "Apply" and publish your site'
      ],
      screenshots: ['wix-add-element.png', 'wix-html-iframe.png', 'wix-enter-code.png', 'wix-preview.png'],
      verification: ['Test embed loads correctly', 'Check mobile display', 'Verify content updates']
    },
    detectionPatterns: ['wix.com', 'wixstatic.com', 'wix-code'],
    supportedContentTypes: ['blog-posts', 'health-articles', 'patient-resources'],
    complianceFeatures: ['Auto AHPRA disclaimers', 'Medical content warnings']
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    description: 'Design-focused platform for professional healthcare practices',
    marketShare: '3%',
    icon: '⬛',
    category: 'traditional',
    difficulty: 'Easy',
    setupTime: '5 minutes',
    integrationType: 'code-injection',
    features: ['Code injection', 'Beautiful templates', 'SEO built-in', 'Mobile optimized'],
    codeTypes: ['header-injection', 'footer-injection', 'code-block'],
    instructions: {
      summary: 'Inject JBSAAS blog code into Squarespace site header or footer',
      steps: [
        'Log into your Squarespace account',
        'Go to Settings → Advanced → Code Injection',
        'Paste JBSAAS script in Site Header section',
        'Or add Code Block to specific page',
        'Paste the provided embed code',
        'Click "Save" and preview your site'
      ],
      screenshots: ['squarespace-settings.png', 'code-injection.png', 'code-block.png', 'preview-blog.png'],
      verification: ['Confirm blog posts display', 'Test responsive design', 'Check loading speed']
    },
    detectionPatterns: ['squarespace.com', 'sqsp.com', 'squarespace-cdn'],
    supportedContentTypes: ['blog-posts', 'practice-news', 'health-education'],
    complianceFeatures: ['AHPRA compliance checking', 'Medical disclaimer automation']
  },
  {
    id: 'godaddy',
    name: 'GoDaddy Website Builder',
    description: 'Popular website builder for Australian businesses',
    marketShare: '15%',
    icon: '🚀',
    category: 'traditional',
    difficulty: 'Easy',
    setupTime: '5 minutes',
    integrationType: 'copy-paste',
    features: ['Copy-paste HTML', 'SEO optimization', 'Mobile responsive', 'AHPRA compliant'],
    codeTypes: ['html-content', 'seo-meta', 'social-snippets'],
    instructions: {
      summary: 'Copy and paste generated HTML content directly into GoDaddy posts',
      steps: [
        'Generate content in JBSAAS platform',
        'Copy the HTML content provided',
        'Log into GoDaddy Website Builder',
        'Go to Blog section → Create New Post',
        'Switch to HTML view in editor',
        'Paste the generated HTML content',
        'Add SEO meta tags in post settings',
        'Publish your post'
      ],
      screenshots: ['godaddy-blog.png', 'html-editor.png', 'seo-settings.png', 'publish-post.png'],
      verification: ['Check post displays correctly', 'Verify SEO tags present', 'Test mobile view']
    },
    detectionPatterns: ['godaddy.com', 'secureserver.net', 'websitebuilder'],
    supportedContentTypes: ['blog-posts', 'health-tips', 'patient-education', 'practice-updates'],
    complianceFeatures: ['Built-in AHPRA disclaimers', 'Medical advice warnings', 'Practice info display']
  },
  {
    id: 'shopify',
    name: 'Shopify Australia',
    description: 'E-commerce platform for practices selling health products',
    marketShare: '4%',
    icon: '🛍️',
    category: 'ecommerce',
    difficulty: 'Medium',
    setupTime: '20 minutes',
    integrationType: 'app',
    features: ['App integration', 'Theme customization', 'Product integration', 'Analytics'],
    codeTypes: ['shopify-app', 'liquid-template', 'theme-injection'],
    instructions: {
      summary: 'Install JBSAAS Shopify app for seamless blog integration',
      steps: [
        'Visit Shopify App Store',
        'Search for "JBSAAS Healthcare Blog"',
        'Click "Install" and authorize permissions',
        'Configure blog settings in app dashboard',
        'Choose blog page template in theme editor',
        'Customize display options',
        'Activate blog integration'
      ],
      screenshots: ['shopify-app-store.png', 'install-app.png', 'app-config.png', 'theme-settings.png'],
      verification: ['Test app functionality', 'Check blog page display', 'Verify product integration']
    },
    detectionPatterns: ['shopify.com', 'myshopify.com', 'shopifycdn.com'],
    supportedContentTypes: ['product-education', 'health-tips', 'usage-guides'],
    complianceFeatures: ['TGA compliance for products', 'AHPRA practice info', 'Medical disclaimers']
  },
  {
    id: 'weebly',
    name: 'Weebly',
    description: 'Simple drag-and-drop website builder',
    marketShare: '1%',
    icon: '🔶',
    category: 'traditional',
    difficulty: 'Easy',
    setupTime: '5 minutes',
    integrationType: 'embed',
    features: ['Drag-drop widgets', 'HTML embed', 'Mobile responsive'],
    codeTypes: ['iframe-embed', 'html-widget'],
    instructions: {
      summary: 'Add JBSAAS blog using Weebly\'s embed code element',
      steps: [
        'Open Weebly site editor',
        'From "More" tab, drag "Embed Code" element',
        'Click "Edit Custom HTML"',
        'Paste JBSAAS embed code',
        'Adjust element size and position',
        'Click "Publish" to save changes'
      ],
      screenshots: ['weebly-elements.png', 'embed-code.png', 'custom-html.png'],
      verification: ['Check blog loads correctly', 'Test mobile responsiveness']
    },
    detectionPatterns: ['weebly.com', 'weeblysite.com'],
    supportedContentTypes: ['blog-posts', 'health-articles'],
    complianceFeatures: ['AHPRA disclaimers', 'Medical warnings']
  },
  {
    id: 'webflow',
    name: 'Webflow',
    description: 'Designer-friendly platform for custom healthcare websites',
    marketShare: '1%',
    icon: '🌊',
    category: 'developer',
    difficulty: 'Medium',
    setupTime: '15 minutes',
    integrationType: 'embed',
    features: ['Visual design', 'Custom code', 'CMS integration', 'Responsive'],
    codeTypes: ['embed-widget', 'custom-code', 'cms-integration'],
    instructions: {
      summary: 'Use Webflow\'s embed element to add JBSAAS blog functionality',
      steps: [
        'Open Webflow Designer',
        'Drag "Embed" element to desired location',
        'Double-click embed element',
        'Paste JBSAAS embed code',
        'Configure responsive settings',
        'Click "Save & Close"',
        'Publish your site'
      ],
      screenshots: ['webflow-elements.png', 'embed-element.png', 'responsive-settings.png'],
      verification: ['Test across devices', 'Check CMS integration', 'Verify styling']
    },
    detectionPatterns: ['webflow.io', 'webflow.com'],
    supportedContentTypes: ['blog-posts', 'case-studies', 'patient-resources'],
    complianceFeatures: ['AHPRA integration', 'Compliance monitoring']
  },
  {
    id: 'bigcommerce',
    name: 'BigCommerce',
    description: 'Enterprise e-commerce platform',
    marketShare: '2%',
    icon: '🏪',
    category: 'ecommerce',
    difficulty: 'Medium',
    setupTime: '15 minutes',
    integrationType: 'code-injection',
    features: ['Stencil framework', 'Script injection', 'API integration'],
    codeTypes: ['stencil-template', 'footer-script', 'api-integration'],
    instructions: {
      summary: 'Integrate JBSAAS blog using BigCommerce Stencil framework',
      steps: [
        'Access BigCommerce control panel',
        'Go to Storefront → Script Manager',
        'Create new script with JBSAAS code',
        'Set placement to "Footer"',
        'Configure page targeting',
        'Save and apply changes'
      ],
      screenshots: ['bigcommerce-scripts.png', 'script-manager.png', 'placement-settings.png'],
      verification: ['Test script loading', 'Check blog display', 'Verify e-commerce integration']
    },
    detectionPatterns: ['bigcommerce.com', 'mybigcommerce.com'],
    supportedContentTypes: ['product-education', 'health-guides'],
    complianceFeatures: ['TGA compliance', 'Product safety info']
  },
  {
    id: 'joomla',
    name: 'Joomla!',
    description: 'Flexible CMS popular with Australian organizations',
    marketShare: '2%',
    icon: '🔧',
    category: 'cms',
    difficulty: 'Medium',
    setupTime: '20 minutes',
    integrationType: 'module',
    features: ['Custom modules', 'Extension system', 'Template integration'],
    codeTypes: ['joomla-module', 'component-integration', 'template-code'],
    instructions: {
      summary: 'Install JBSAAS Joomla module for blog integration',
      steps: [
        'Download JBSAAS Joomla module ZIP',
        'Go to Extensions → Manage → Install',
        'Upload module ZIP file',
        'Go to Extensions → Modules',
        'Find and publish JBSAAS Blog module',
        'Configure module settings',
        'Assign to desired menu positions'
      ],
      screenshots: ['joomla-extensions.png', 'module-install.png', 'module-config.png'],
      verification: ['Check module displays', 'Test position assignments', 'Verify functionality']
    },
    detectionPatterns: ['joomla', '/administrator/', 'joomla.org'],
    supportedContentTypes: ['blog-posts', 'news-articles', 'health-updates'],
    complianceFeatures: ['AHPRA compliance', 'Medical disclaimers']
  },
  {
    id: 'drupal',
    name: 'Drupal',
    description: 'Powerful CMS for complex healthcare websites',
    marketShare: '1%',
    icon: '💧',
    category: 'cms',
    difficulty: 'Advanced',
    setupTime: '30 minutes',
    integrationType: 'module',
    features: ['Custom modules', 'Block system', 'API integration'],
    codeTypes: ['drupal-module', 'custom-block', 'twig-template'],
    instructions: {
      summary: 'Create custom Drupal block for JBSAAS blog content',
      steps: [
        'Access Drupal admin panel',
        'Go to Structure → Block Layout',
        'Click "Add custom block"',
        'Set block type to "Custom HTML"',
        'Paste JBSAAS embed code',
        'Configure block settings',
        'Place block in desired region',
        'Save configuration and clear cache'
      ],
      screenshots: ['drupal-blocks.png', 'custom-block.png', 'block-placement.png'],
      verification: ['Check block renders', 'Test cache clearing', 'Verify permissions']
    },
    detectionPatterns: ['drupal', '/admin/', 'drupal.org'],
    supportedContentTypes: ['research-articles', 'patient-education', 'policy-updates'],
    complianceFeatures: ['Advanced AHPRA integration', 'Compliance workflows']
  }
];

// Modern Development Platforms
export const MODERN_DEV_PLATFORMS: PlatformDefinition[] = [
  {
    id: 'windsurf',
    name: 'Windsurf IDE',
    description: 'AI-powered development environment for modern web apps',
    marketShare: '0.5%',
    icon: '🌪️',
    category: 'modern-dev',
    difficulty: 'Advanced',
    setupTime: '30 minutes',
    integrationType: 'api',
    features: ['React components', 'TypeScript support', 'AI integration', 'Real-time sync'],
    codeTypes: ['react-component', 'typescript-types', 'api-client', 'webhook-handlers'],
    instructions: {
      summary: 'Integrate JBSAAS using React components and TypeScript definitions',
      steps: [
        'Install JBSAAS SDK: npm install @jbsaas/react-healthcare',
        'Import BlogComponent from package',
        'Add component to your React app',
        'Configure with your API credentials',
        'Set up TypeScript types for healthcare data',
        'Implement AHPRA compliance hooks',
        'Deploy with Windsurf\'s AI assistance'
      ],
      screenshots: ['windsurf-install.png', 'component-integration.png', 'ai-assistance.png'],
      verification: ['Test component rendering', 'Verify TypeScript compilation', 'Check AI features']
    },
    detectionPatterns: ['windsurf', 'ai-dev-env'],
    supportedContentTypes: ['dynamic-content', 'ai-generated-posts', 'patient-interactions'],
    complianceFeatures: ['AI-powered AHPRA checking', 'Real-time compliance scoring']
  },
  {
    id: 'cursor',
    name: 'Cursor IDE',
    description: 'AI-first code editor for healthcare development',
    marketShare: '1%',
    icon: '🎯',
    category: 'modern-dev',
    difficulty: 'Advanced',
    setupTime: '25 minutes',
    integrationType: 'api',
    features: ['AI code completion', 'React integration', 'Healthcare templates'],
    codeTypes: ['react-hooks', 'api-integration', 'ai-components'],
    instructions: {
      summary: 'Build healthcare blog integration with AI-assisted development',
      steps: [
        'Open Cursor IDE with React project',
        'Use AI to generate JBSAAS integration code',
        'Install healthcare-specific dependencies',
        'Implement blog components with AI assistance',
        'Set up AHPRA compliance validation',
        'Configure real-time data synchronization',
        'Deploy with CI/CD pipeline'
      ],
      screenshots: ['cursor-ai.png', 'healthcare-templates.png', 'integration-code.png'],
      verification: ['Test AI-generated code', 'Verify healthcare compliance', 'Check performance']
    },
    detectionPatterns: ['cursor.sh', 'cursor-ide'],
    supportedContentTypes: ['ai-content', 'code-generated-posts', 'dynamic-healthcare-info'],
    complianceFeatures: ['AI compliance validation', 'Automated AHPRA checks']
  },
  {
    id: 'firebase-studio',
    name: 'Firebase App Hosting',
    description: 'Google\'s platform for healthcare web applications',
    marketShare: '3%',
    icon: '🔥',
    category: 'modern-dev',
    difficulty: 'Medium',
    setupTime: '20 minutes',
    integrationType: 'api',
    features: ['Serverless functions', 'Real-time database', 'Authentication'],
    codeTypes: ['cloud-functions', 'firestore-rules', 'web-components'],
    instructions: {
      summary: 'Deploy JBSAAS blog integration using Firebase serverless architecture',
      steps: [
        'Initialize Firebase project',
        'Deploy JBSAAS Cloud Functions',
        'Configure Firestore for blog data',
        'Set up authentication for healthcare users',
        'Implement real-time blog updates',
        'Configure AHPRA compliance rules',
        'Deploy to Firebase Hosting'
      ],
      screenshots: ['firebase-init.png', 'cloud-functions.png', 'firestore-setup.png'],
      verification: ['Test serverless functions', 'Verify real-time updates', 'Check security rules']
    },
    detectionPatterns: ['firebase.google.com', 'firebaseapp.com'],
    supportedContentTypes: ['real-time-posts', 'patient-updates', 'practice-announcements'],
    complianceFeatures: ['Firebase security rules for AHPRA', 'Audit logging']
  },
  {
    id: 'vercel',
    name: 'Vercel Platform',
    description: 'Modern deployment platform for React healthcare apps',
    marketShare: '2%',
    icon: '▲',
    category: 'modern-dev',
    difficulty: 'Medium',
    setupTime: '15 minutes',
    integrationType: 'api',
    features: ['Edge functions', 'SSR/SSG', 'Performance optimization'],
    codeTypes: ['next-js-api', 'edge-functions', 'static-generation'],
    instructions: {
      summary: 'Deploy JBSAAS blog with Vercel\'s edge computing and SSG',
      steps: [
        'Connect GitHub repo to Vercel',
        'Configure Next.js for healthcare blog',
        'Set up API routes for JBSAAS integration',
        'Implement static generation for SEO',
        'Configure edge functions for real-time data',
        'Add AHPRA compliance middleware',
        'Deploy with automatic optimization'
      ],
      screenshots: ['vercel-deploy.png', 'edge-functions.png', 'performance-optimization.png'],
      verification: ['Test edge function performance', 'Verify SSG generation', 'Check SEO optimization']
    },
    detectionPatterns: ['vercel.app', 'vercel.com'],
    supportedContentTypes: ['static-optimized-posts', 'edge-cached-content'],
    complianceFeatures: ['Edge-computed AHPRA validation', 'Performance-optimized compliance']
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'JAMstack platform for modern healthcare websites',
    marketShare: '2%',
    icon: '🌐',
    category: 'modern-dev',
    difficulty: 'Medium',
    setupTime: '15 minutes',
    integrationType: 'api',
    features: ['Serverless functions', 'Build automation', 'Edge computing'],
    codeTypes: ['netlify-functions', 'build-hooks', 'edge-handlers'],
    instructions: {
      summary: 'Deploy JBSAAS blog using Netlify\'s JAMstack architecture',
      steps: [
        'Connect repository to Netlify',
        'Configure build settings for healthcare site',
        'Deploy JBSAAS serverless functions',
        'Set up build hooks for content updates',
        'Configure edge handlers for performance',
        'Implement AHPRA compliance functions',
        'Deploy with continuous integration'
      ],
      screenshots: ['netlify-build.png', 'serverless-functions.png', 'edge-handlers.png'],
      verification: ['Test function deployment', 'Verify build automation', 'Check edge performance']
    },
    detectionPatterns: ['netlify.app', 'netlify.com'],
    supportedContentTypes: ['jamstack-posts', 'build-generated-content'],
    complianceFeatures: ['Serverless AHPRA validation', 'Build-time compliance checks']
  },
  {
    id: 'replit',
    name: 'Replit',
    description: 'Collaborative coding platform for rapid healthcare prototyping',
    marketShare: '0.5%',
    icon: '🔄',
    category: 'modern-dev',
    difficulty: 'Easy',
    setupTime: '10 minutes',
    integrationType: 'api',
    features: ['Instant deployment', 'Collaborative editing', 'Multiple languages'],
    codeTypes: ['web-app', 'api-endpoints', 'database-integration'],
    instructions: {
      summary: 'Build and deploy JBSAAS blog integration directly in Replit',
      steps: [
        'Create new Replit project',
        'Choose React or Next.js template',
        'Install JBSAAS dependencies',
        'Build blog components in browser',
        'Configure database connection',
        'Add AHPRA compliance checks',
        'Deploy instantly with Replit hosting'
      ],
      screenshots: ['replit-project.png', 'browser-coding.png', 'instant-deploy.png'],
      verification: ['Test in-browser development', 'Verify instant deployment', 'Check collaboration features']
    },
    detectionPatterns: ['replit.com', 'repl.it'],
    supportedContentTypes: ['prototype-posts', 'collaborative-content'],
    complianceFeatures: ['Rapid AHPRA prototyping', 'Collaborative compliance review']
  },
  {
    id: 'lovable',
    name: 'Lovable',
    description: 'AI-powered website builder for modern healthcare practices',
    marketShare: '0.3%',
    icon: '💜',
    category: 'modern-dev',
    difficulty: 'Easy',
    setupTime: '10 minutes',
    integrationType: 'api',
    features: ['AI website generation', 'React components', 'Healthcare templates'],
    codeTypes: ['ai-components', 'healthcare-templates', 'react-integration'],
    instructions: {
      summary: 'Integrate JBSAAS blog using Lovable\'s AI-powered healthcare templates',
      steps: [
        'Create Lovable project with healthcare template',
        'Use AI to generate blog section',
        'Connect JBSAAS API for content',
        'Customize with healthcare branding',
        'Configure AHPRA compliance features',
        'Deploy with one-click publishing',
        'Set up automatic content updates'
      ],
      screenshots: ['lovable-ai.png', 'healthcare-template.png', 'api-integration.png'],
      verification: ['Test AI generation', 'Verify healthcare templates', 'Check API connection']
    },
    detectionPatterns: ['lovable.dev', 'lovable.com'],
    supportedContentTypes: ['ai-generated-healthcare-posts', 'template-based-content'],
    complianceFeatures: ['AI-powered AHPRA compliance', 'Template-based medical disclaimers']
  }
];

// Legacy/Specialized Platforms
export const LEGACY_PLATFORMS: PlatformDefinition[] = [
  {
    id: 'magento',
    name: 'Magento',
    description: 'Enterprise e-commerce platform for health product retailers',
    marketShare: '1%',
    icon: '🛒',
    category: 'ecommerce',
    difficulty: 'Advanced',
    setupTime: '45 minutes',
    integrationType: 'module',
    features: ['Enterprise modules', 'PHTML templates', 'Advanced e-commerce'],
    codeTypes: ['magento-module', 'phtml-template', 'xml-layout'],
    instructions: {
      summary: 'Install JBSAAS Magento module for enterprise blog integration',
      steps: [
        'Download JBSAAS Magento extension',
        'Upload to app/code/JBSAAS/Blog',
        'Run setup:upgrade command',
        'Configure module in admin panel',
        'Create PHTML template for blog display',
        'Add widget to CMS pages',
        'Configure TGA compliance settings'
      ],
      screenshots: ['magento-module.png', 'phtml-template.png', 'widget-config.png'],
      verification: ['Test module installation', 'Verify PHTML rendering', 'Check admin configuration']
    },
    detectionPatterns: ['magento', '/admin/', 'magentocommerce'],
    supportedContentTypes: ['product-education', 'health-product-guides'],
    complianceFeatures: ['TGA product compliance', 'Advanced medical disclaimers']
  },
  {
    id: 'hubspot',
    name: 'HubSpot CMS',
    description: 'Marketing-focused CMS for healthcare marketing',
    marketShare: '2%',
    icon: '🧲',
    category: 'cms',
    difficulty: 'Medium',
    setupTime: '25 minutes',
    integrationType: 'module',
    features: ['Drag-drop modules', 'Marketing automation', 'CRM integration'],
    codeTypes: ['hubspot-module', 'hubl-template', 'css-js-assets'],
    instructions: {
      summary: 'Create HubSpot module for JBSAAS blog integration',
      steps: [
        'Access HubSpot Design Manager',
        'Create new custom module',
        'Upload JBSAAS module files',
        'Configure module settings',
        'Add module to page templates',
        'Set up marketing automation triggers',
        'Activate lead capture forms'
      ],
      screenshots: ['hubspot-design-manager.png', 'custom-module.png', 'module-settings.png'],
      verification: ['Test module functionality', 'Verify marketing integration', 'Check lead capture']
    },
    detectionPatterns: ['hubspot.com', 'hs-sites.com'],
    supportedContentTypes: ['marketing-focused-health-content', 'lead-generation-posts'],
    complianceFeatures: ['Marketing compliance for healthcare', 'AHPRA-compliant lead capture']
  },
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Modern publishing platform for healthcare content creators',
    marketShare: '0.5%',
    icon: '👻',
    category: 'cms',
    difficulty: 'Medium',
    setupTime: '20 minutes',
    integrationType: 'code-injection',
    features: ['Clean publishing', 'Handlebars templates', 'Membership features'],
    codeTypes: ['handlebars-template', 'ghost-integration', 'membership-hooks'],
    instructions: {
      summary: 'Integrate JBSAAS content using Ghost\'s injection and API features',
      steps: [
        'Access Ghost admin panel',
        'Go to Settings → Code Injection',
        'Add JBSAAS script to site header',
        'Create custom Handlebars template',
        'Configure membership integration',
        'Set up webhook for content sync',
        'Customize healthcare content display'
      ],
      screenshots: ['ghost-code-injection.png', 'handlebars-template.png', 'membership-config.png'],
      verification: ['Test code injection', 'Verify template rendering', 'Check membership features']
    },
    detectionPatterns: ['ghost.org', '/ghost/', 'ghost.io'],
    supportedContentTypes: ['published-healthcare-articles', 'membership-gated-content'],
    complianceFeatures: ['Publishing compliance', 'Member-specific AHPRA info']
  },
  {
    id: 'blogger',
    name: 'Blogger',
    description: 'Google\'s free blogging platform for healthcare practices',
    marketShare: '1%',
    icon: '📝',
    category: 'traditional',
    difficulty: 'Easy',
    setupTime: '10 minutes',
    integrationType: 'embed',
    features: ['Simple widgets', 'Google integration', 'Free hosting'],
    codeTypes: ['html-gadget', 'blogger-widget'],
    instructions: {
      summary: 'Add JBSAAS blog content using Blogger\'s HTML gadget',
      steps: [
        'Access Blogger dashboard',
        'Go to Layout section',
        'Click "Add a Gadget"',
        'Select "HTML/JavaScript"',
        'Paste JBSAAS embed code',
        'Configure gadget title and settings',
        'Save and preview blog'
      ],
      screenshots: ['blogger-layout.png', 'html-gadget.png', 'gadget-config.png'],
      verification: ['Test gadget display', 'Check mobile compatibility', 'Verify Google integration']
    },
    detectionPatterns: ['blogger.com', 'blogspot.com'],
    supportedContentTypes: ['simple-health-posts', 'patient-education-basics'],
    complianceFeatures: ['Basic AHPRA disclaimers', 'Simple medical warnings']
  },
  {
    id: 'jimdo',
    name: 'Jimdo',
    description: 'AI-powered website builder popular in Australia',
    marketShare: '0.5%',
    icon: '🤖',
    category: 'traditional',
    difficulty: 'Easy',
    setupTime: '5 minutes',
    integrationType: 'embed',
    features: ['AI website creation', 'Embed elements', 'Mobile optimization'],
    codeTypes: ['html-embed', 'ai-integration'],
    instructions: {
      summary: 'Embed JBSAAS blog using Jimdo\'s HTML element',
      steps: [
        'Open Jimdo website editor',
        'Click "Add Element"',
        'Select "Embed HTML"',
        'Paste JBSAAS embed code',
        'Adjust element sizing',
        'Preview and publish changes'
      ],
      screenshots: ['jimdo-elements.png', 'html-embed.png', 'element-sizing.png'],
      verification: ['Test embed functionality', 'Check AI integration', 'Verify mobile display']
    },
    detectionPatterns: ['jimdo.com', 'jimdosite.com'],
    supportedContentTypes: ['ai-optimized-health-content'],
    complianceFeatures: ['AI-assisted AHPRA compliance']
  }
];

// Combine all platforms
export const ALL_PLATFORMS: PlatformDefinition[] = [
  ...AUSTRALIAN_PLATFORMS,
  ...MODERN_DEV_PLATFORMS,
  ...LEGACY_PLATFORMS
];

// Platform categories for organization
export const PLATFORM_CATEGORIES = {
  'Most Popular Australian Platforms': AUSTRALIAN_PLATFORMS.slice(0, 4),
  'E-commerce Platforms': [...AUSTRALIAN_PLATFORMS, ...LEGACY_PLATFORMS].filter(p => p.category === 'ecommerce'),
  'Modern Development Platforms': MODERN_DEV_PLATFORMS,
  'Traditional CMS Platforms': [...AUSTRALIAN_PLATFORMS, ...LEGACY_PLATFORMS].filter(p => p.category === 'cms'),
  'Specialized Platforms': LEGACY_PLATFORMS
};

export default ALL_PLATFORMS; 