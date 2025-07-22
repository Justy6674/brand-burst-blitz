// Platform capability definitions
export interface PlatformCapability {
  embed: boolean;
  api: boolean;
  rss: boolean;
  manual: boolean;
  webhooks: boolean;
  custom_css: boolean;
}

export interface PlatformInfo {
  name: string;
  logo?: string;
  capabilities: PlatformCapability;
  difficulty: 'easy' | 'medium' | 'hard';
  setup_time: string;
  instructions_url?: string;
  notes?: string;
}

export interface IntegrationOption {
  type: string;
  name: string;
  description: string;
  difficulty: string;
  icon: string;
}

export const PLATFORM_CAPABILITIES: Record<string, PlatformInfo> = {
  wordpress: {
    name: 'WordPress',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true,
      webhooks: true,
      custom_css: true
    },
    difficulty: 'easy',
    setup_time: '5-10 minutes',
    notes: 'Full integration support with plugins and API access'
  },
  wix: {
    name: 'Wix',
    capabilities: {
      embed: true,
      api: false,
      rss: false,
      manual: true,
      webhooks: false,
      custom_css: false
    },
    difficulty: 'medium',
    setup_time: '10-15 minutes',
    notes: 'Embed widgets work, but limited API access'
  },
  shopify: {
    name: 'Shopify',
    capabilities: {
      embed: false,
      api: true,
      rss: false,
      manual: true,
      webhooks: true,
      custom_css: true
    },
    difficulty: 'medium',
    setup_time: '15-20 minutes',
    notes: 'API access available, embeds restricted by theme'
  },
  godaddy: {
    name: 'GoDaddy Website Builder',
    capabilities: {
      embed: false,
      api: false,
      rss: false,
      manual: true,
      webhooks: false,
      custom_css: false
    },
    difficulty: 'hard',
    setup_time: '20-30 minutes',
    notes: 'Very limited - manual copy/paste only'
  },
  webflow: {
    name: 'Webflow',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true,
      webhooks: true,
      custom_css: true
    },
    difficulty: 'easy',
    setup_time: '5-10 minutes',
    notes: 'Excellent integration support'
  },
  squarespace: {
    name: 'Squarespace',
    capabilities: {
      embed: true,
      api: false,
      rss: true,
      manual: true,
      webhooks: false,
      custom_css: true
    },
    difficulty: 'medium',
    setup_time: '10-15 minutes',
    notes: 'Embed blocks available, limited API'
  },
  ghost: {
    name: 'Ghost',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true,
      webhooks: true,
      custom_css: true
    },
    difficulty: 'easy',
    setup_time: '5-10 minutes',
    notes: 'Full API access and webhook support'
  },
  drupal: {
    name: 'Drupal',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true,
      webhooks: true,
      custom_css: true
    },
    difficulty: 'hard',
    setup_time: '20-30 minutes',
    notes: 'Powerful but requires technical knowledge'
  },
  joomla: {
    name: 'Joomla',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true,
      webhooks: false,
      custom_css: true
    },
    difficulty: 'medium',
    setup_time: '15-20 minutes',
    notes: 'Good integration with extensions'
  },
  custom: {
    name: 'Custom Website',
    capabilities: {
      embed: true,
      api: true,
      rss: true,
      manual: true,
      webhooks: true,
      custom_css: true
    },
    difficulty: 'easy',
    setup_time: '5-10 minutes',
    notes: 'Full control over implementation'
  }
};

export const getAvailableIntegrations = (platformKey: string): IntegrationOption[] => {
  const platform = PLATFORM_CAPABILITIES[platformKey];
  if (!platform) return [];

  const integrations: IntegrationOption[] = [];
  
  if (platform.capabilities.embed) {
    integrations.push({
      type: 'embed',
      name: 'Widget Embed',
      description: 'Add a JavaScript widget to your website',
      difficulty: 'Easy',
      icon: '🔌'
    });
  }
  
  if (platform.capabilities.api) {
    integrations.push({
      type: 'api',
      name: 'API Integration',
      description: 'Connect directly via REST API',
      difficulty: 'Medium',
      icon: '🔗'
    });
  }
  
  if (platform.capabilities.rss) {
    integrations.push({
      type: 'rss',
      name: 'RSS Feed',
      description: 'Automatic content syndication',
      difficulty: 'Easy',
      icon: '📡'
    });
  }
  
  if (platform.capabilities.manual) {
    integrations.push({
      type: 'manual',
      name: 'Manual Export',
      description: 'Copy and paste content',
      difficulty: 'Easy',
      icon: '📋'
    });
  }

  return integrations;
};

export const getUnavailableReasons = (platformKey: string) => {
  const platform = PLATFORM_CAPABILITIES[platformKey];
  if (!platform) return [];

  const reasons = [];
  
  if (!platform.capabilities.embed) {
    reasons.push({
      feature: 'Widget Embed',
      reason: `${platform.name} doesn't support third-party JavaScript widgets`
    });
  }
  
  if (!platform.capabilities.api) {
    reasons.push({
      feature: 'API Integration',
      reason: `${platform.name} doesn't provide public API access`
    });
  }
  
  if (!platform.capabilities.rss) {
    reasons.push({
      feature: 'RSS Feed',
      reason: `${platform.name} doesn't support custom RSS feed integration`
    });
  }

  return reasons;
};

export const getPlatformCapabilities = (platformKey: string): PlatformInfo | null => {
  return PLATFORM_CAPABILITIES[platformKey] || null;
};

export const getAllPlatforms = (): Record<string, PlatformInfo> => {
  return PLATFORM_CAPABILITIES;
};