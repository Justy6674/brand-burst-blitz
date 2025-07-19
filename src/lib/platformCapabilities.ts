export interface PlatformCapability {
  id: string;
  name: string;
  description: string;
  marketShare: string;
  capabilities: {
    embed: boolean;
    api: boolean;
    rss: boolean;
    manual: boolean;
  };
  limitations: string[];
  instructions: {
    embed?: string[];
    api?: string[];
    manual: string[];
  };
  codeExamples: {
    embed?: string;
    api?: string;
    manual?: string;
  };
}

export const PLATFORM_CAPABILITIES: Record<string, PlatformCapability> = {
  wordpress: {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Most popular CMS worldwide - full integration support',
    marketShare: '43%',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true
    },
    limitations: [],
    instructions: {
      embed: [
        'Install our WordPress plugin',
        'Add shortcode [jbsaas-blog] to any page',
        'Customize display options in plugin settings'
      ],
      api: [
        'Generate application password in WordPress admin',
        'Enter your WordPress URL and credentials',
        'Test connection and start auto-publishing'
      ],
      manual: [
        'Copy the generated HTML content',
        'Paste into WordPress post editor',
        'Upload images via WordPress media library'
      ]
    },
    codeExamples: {
      embed: '[jbsaas-blog business-id="USER_ID" theme="modern" posts="10"]',
      api: 'Full REST API integration available'
    }
  },
  
  godaddy: {
    id: 'godaddy',
    name: 'GoDaddy Website Builder',
    description: 'Popular website builder with limited integration options',
    marketShare: '15%',
    capabilities: {
      embed: false,
      api: false,
      rss: false,
      manual: true
    },
    limitations: [
      'No custom JavaScript support',
      'No API access to blog system',
      'No third-party embed capabilities'
    ],
    instructions: {
      manual: [
        'Copy the formatted HTML content',
        'Go to GoDaddy Website Builder',
        'Add a new blog post or page',
        'Paste content in the editor',
        'Upload images manually to GoDaddy media library'
      ]
    },
    codeExamples: {
      manual: 'Clean HTML export optimized for GoDaddy editor'
    }
  },
  
  wix: {
    id: 'wix',
    name: 'Wix',
    description: 'Drag & drop builder with HTML embed support',
    marketShare: '8%',
    capabilities: {
      embed: true,
      api: false,
      rss: false,
      manual: true
    },
    limitations: [
      'No API access to Wix blog system',
      'Embed requires HTML element'
    ],
    instructions: {
      embed: [
        'In Wix Editor, click "+ Add"',
        'Select "More" then "HTML iframe"',
        'Paste the provided embed code',
        'Adjust size and positioning'
      ],
      manual: [
        'Copy the blog content',
        'Create new blog post in Wix',
        'Paste content and format',
        'Upload images to Wix media library'
      ]
    },
    codeExamples: {
      embed: '<iframe src="https://api.jbsaas.com/embed/blog?user=USER_ID" width="100%" height="800"></iframe>'
    }
  },
  
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce platform with limited blog integration',
    marketShare: '4%',
    capabilities: {
      embed: false,
      api: false, // Limited API access
      rss: false,
      manual: true
    },
    limitations: [
      'No JavaScript embed support in templates',
      'Blog API requires app development',
      'Limited customization options'
    ],
    instructions: {
      manual: [
        'Copy the blog content',
        'Go to Shopify Admin > Online Store > Blog posts',
        'Create new blog post',
        'Paste content and adjust formatting',
        'Upload images through Shopify admin'
      ]
    },
    codeExamples: {
      manual: 'E-commerce optimized HTML with product integration hooks'
    }
  },
  
  squarespace: {
    id: 'squarespace',
    name: 'Squarespace',
    description: 'Design-focused platform with code block support',
    marketShare: '5%',
    capabilities: {
      embed: true,
      api: false,
      rss: false,
      manual: true
    },
    limitations: [
      'No direct API access',
      'Embed requires code block'
    ],
    instructions: {
      embed: [
        'Edit your Squarespace page',
        'Add a "Code" block where you want the blog',
        'Paste the provided embed code',
        'Save and publish changes'
      ],
      manual: [
        'Copy the formatted content',
        'Create new blog post in Squarespace',
        'Paste and adjust styling',
        'Upload images via Squarespace media library'
      ]
    },
    codeExamples: {
      embed: '<div id="jbsaas-blog"></div><script src="https://api.jbsaas.com/embed.js" data-user="USER_ID"></script>'
    }
  },
  
  webflow: {
    id: 'webflow',
    name: 'Webflow',
    description: 'Professional web design platform with full integration support',
    marketShare: '2%',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true
    },
    limitations: [],
    instructions: {
      embed: [
        'In Webflow Designer, drag an "Embed" element',
        'Paste the provided embed code',
        'Style the container as needed',
        'Publish your site'
      ],
      api: [
        'Generate Webflow API token',
        'Connect your Webflow site',
        'Map blog collection fields',
        'Enable auto-publishing'
      ],
      manual: [
        'Copy the structured content',
        'Create new blog post in Webflow CMS',
        'Paste content into rich text fields',
        'Upload images to Webflow assets'
      ]
    },
    codeExamples: {
      embed: '<div class="w-embed"><script>/* JBSAAS embed code */</script></div>',
      api: 'Full Webflow CMS API integration'
    }
  },
  
  custom: {
    id: 'custom',
    name: 'Custom HTML Website',
    description: 'Any HTML-based website with full control',
    marketShare: '20%',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true
    },
    limitations: [],
    instructions: {
      embed: [
        'Copy the JavaScript embed code',
        'Paste it where you want the blog to appear',
        'Customize styling with CSS',
        'Upload and test'
      ],
      api: [
        'Use our REST API endpoints',
        'Implement custom integration',
        'Handle authentication and updates',
        'Build your own UI'
      ],
      manual: [
        'Copy the raw HTML content',
        'Paste into your HTML files',
        'Download and host images',
        'Update navigation and links'
      ]
    },
    codeExamples: {
      embed: `<div id="jbsaas-blog"></div>
<script>
window.jbsaasConfig = { userId: 'USER_ID', theme: 'modern' };
</script>
<script src="https://api.jbsaas.com/embed.js"></script>`,
      api: 'GET https://api.jbsaas.com/v1/businesses/{id}/posts'
    }
  }
};

export const getPlatformCapabilities = (platformId: string): PlatformCapability | null => {
  return PLATFORM_CAPABILITIES[platformId] || null;
};

export const getAvailableIntegrations = (platformId: string): string[] => {
  const platform = getPlatformCapabilities(platformId);
  if (!platform) return ['manual'];
  
  const integrations: string[] = [];
  if (platform.capabilities.embed) integrations.push('embed');
  if (platform.capabilities.api) integrations.push('api');
  if (platform.capabilities.rss) integrations.push('rss');
  if (platform.capabilities.manual) integrations.push('manual');
  
  return integrations;
};

export const getPlatformLimitations = (platformId: string): string[] => {
  const platform = getPlatformCapabilities(platformId);
  return platform?.limitations || [];
};