export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  type: 'social_post' | 'blog_article' | 'email_campaign' | 'ad_copy' | 'product_description';
  prompts: {
    title: string;
    content: string;
    meta_description?: string;
  };
  variables: string[];
  tone_options: string[];
  examples: {
    input: Record<string, string>;
    output: string;
  }[];
}

export const AUSSIE_TRADIE_TEMPLATE: ContentTemplate = {
  id: 'aussie_tradie_showcase',
  name: 'Australian Tradie Job Showcase',
  description: 'Professional before/after job posts that build trust and showcase expertise',
  industry: ['construction', 'plumbing', 'electrical', 'landscaping'],
  type: 'social_post',
  prompts: {
    title: 'Generate an engaging title for this {job_type} project in {location}',
    content: `Create a professional social media post for an Australian tradie showcasing a {job_type} project. 
    
    Context:
    - Location: {location}
    - Project details: {project_details}
    - Customer satisfaction: {customer_feedback}
    - Business name: {business_name}
    
    Include:
    - Brief description of the work completed
    - Professional language that builds trust
    - Call-to-action for similar services
    - Relevant Australian tradie hashtags
    - Mention of local area/suburb
    
    Tone: {tone} - professional yet approachable
    Keep it authentic and avoid overselling.`
  },
  variables: ['job_type', 'location', 'project_details', 'customer_feedback', 'business_name'],
  tone_options: ['professional', 'friendly', 'confident', 'helpful'],
  examples: [
    {
      input: {
        job_type: 'bathroom renovation',
        location: 'Bondi, Sydney',
        project_details: 'Complete bathroom makeover with new tiles and fixtures',
        customer_feedback: 'Very happy with the quality work',
        business_name: 'Elite Plumbing Solutions'
      },
      output: 'Just wrapped up this stunning bathroom renovation in Bondi! 🔧✨\n\nComplete makeover featuring premium tiles and modern fixtures. Our clients are thrilled with the transformation!\n\n"Very happy with the quality work" - satisfied customer\n\nNeed a bathroom renovation in the Eastern Suburbs? Get in touch!\n\n#SydneyPlumber #BondiRenovations #BathroomReno #QualityWork #EasternSuburbs #TradieLife'
    }
  ]
};

export const LOCAL_BUSINESS_TEMPLATE: ContentTemplate = {
  id: 'local_business_storytelling',
  name: 'Local Business Story Content',
  description: 'Engaging storytelling content that connects with local Australian communities',
  industry: ['retail', 'hospitality', 'services', 'health'],
  type: 'social_post',
  prompts: {
    title: 'Create an engaging title for {business_name} story about {story_topic}',
    content: `Write a compelling local business story for {business_name} in {location}.

    Story elements:
    - Topic: {story_topic}
    - Business focus: {business_focus}
    - Community connection: {community_impact}
    - Personal touch: {personal_story}
    
    Include:
    - Local references and landmarks
    - Community-focused messaging
    - Authentic Australian voice
    - Call-to-action for local engagement
    - Relevant local hashtags
    
    Tone: {tone} - warm, community-focused, authentic
    Connect with local values and community spirit.`
  },
  variables: ['business_name', 'location', 'story_topic', 'business_focus', 'community_impact', 'personal_story'],
  tone_options: ['warm', 'community-focused', 'authentic', 'inspiring'],
  examples: [
    {
      input: {
        business_name: 'Corner Cafe Melbourne',
        location: 'South Yarra, Melbourne',
        story_topic: 'Supporting local artists',
        business_focus: 'Coffee and community',
        community_impact: 'Monthly art exhibitions featuring local artists',
        personal_story: 'Started by former art teacher'
      },
      output: 'From classroom to coffee shop - our journey continues! ☕🎨\n\nAs a former art teacher, I dreamed of creating a space where South Yarra locals could discover amazing talent right in their backyard.\n\nThis month we\'re featuring Sarah\'s stunning botanical paintings - each piece inspired by the Royal Botanic Gardens just down the road!\n\nPop by for your morning flat white and discover your next favorite local artist.\n\n#SouthYarraLocal #MelbourneCoffee #LocalArtists #CommunityFirst #RoyalBotanicGardens'
    }
  ]
};

export const SEASONAL_STRATEGY_TEMPLATE: ContentTemplate = {
  id: 'australian_seasonal_strategy',
  name: 'Australian Seasonal Business Strategy',
  description: 'Strategic content that aligns with Australian seasons and cultural events',
  industry: ['retail', 'hospitality', 'tourism', 'services'],
  type: 'blog_article',
  prompts: {
    title: 'Create a strategic title for {business_type} preparing for {season} in Australia',
    content: `Write a strategic business article about {business_type} preparing for {season} in Australia.

    Context:
    - Season: {season}
    - Business type: {business_type}
    - Key challenges: {seasonal_challenges}
    - Opportunities: {seasonal_opportunities}
    - Target market: {target_market}
    
    Include:
    - Australian seasonal considerations
    - Practical business strategies
    - Market timing insights
    - Cultural events and holidays
    - Regional variations across Australia
    
    Tone: {tone} - strategic, informative, actionable
    Provide genuine value for Australian business owners.`,
    meta_description: 'Strategic guide for {business_type} businesses to maximize {season} opportunities in Australia'
  },
  variables: ['business_type', 'season', 'seasonal_challenges', 'seasonal_opportunities', 'target_market'],
  tone_options: ['strategic', 'informative', 'actionable', 'expert'],
  examples: [
    {
      input: {
        business_type: 'restaurant',
        season: 'summer',
        seasonal_challenges: 'Increased competition from outdoor dining',
        seasonal_opportunities: 'Tourist influx and longer dining hours',
        target_market: 'Tourists and locals seeking al fresco dining'
      },
      output: '**Summer Restaurant Strategy: Maximizing the Australian Tourist Season**\n\nAs temperatures rise across Australia, restaurant owners have a golden opportunity to capitalize on increased foot traffic and the great Aussie tradition of outdoor dining...\n\n**Key Summer Opportunities:**\n- Extended daylight hours mean longer service times\n- Tourist influx from December to February\n- Increased demand for fresh, light menu options\n- Outdoor seating becomes a major drawcard\n\n**Strategic Considerations:**\n- Book outdoor furniture and shade solutions early\n- Develop a summer menu featuring local, seasonal ingredients\n- Partner with local tourism operators\n- Extend trading hours to capture evening diners...'
    }
  ]
};

export const INDUSTRY_EXPERTISE_TEMPLATE: ContentTemplate = {
  id: 'australian_industry_expertise',
  name: 'Australian Industry Expertise Showcase',
  description: 'Professional content that demonstrates deep industry knowledge and local expertise',
  industry: ['professional_services', 'consulting', 'finance', 'legal', 'technology'],
  type: 'blog_article',
  prompts: {
    title: 'Create an expert title about {industry_topic} trends in Australia',
    content: `Write an authoritative article about {industry_topic} in the Australian market.

    Expertise areas:
    - Industry topic: {industry_topic}
    - Market trends: {current_trends}
    - Regulatory environment: {regulatory_changes}
    - Business impact: {business_implications}
    - Expert insights: {expert_perspective}
    
    Include:
    - Australian market context
    - Regulatory considerations (ACCC, ASIC, etc.)
    - Industry statistics and data
    - Practical business implications
    - Forward-looking insights
    
    Tone: {tone} - authoritative, analytical, professional
    Establish credibility while remaining accessible.`,
    meta_description: 'Expert analysis of {industry_topic} trends and implications for Australian businesses'
  },
  variables: ['industry_topic', 'current_trends', 'regulatory_changes', 'business_implications', 'expert_perspective'],
  tone_options: ['authoritative', 'analytical', 'professional', 'insightful'],
  examples: [
    {
      input: {
        industry_topic: 'Open Banking implementation',
        current_trends: 'Increased API adoption and fintech partnerships',
        regulatory_changes: 'ACCC oversight and compliance requirements',
        business_implications: 'New opportunities for customer data insights',
        expert_perspective: '15 years in Australian financial services'
      },
      output: '**Open Banking in Australia: Strategic Implications for Financial Services**\n\nThree years into Australia\'s Open Banking journey, we\'re seeing fundamental shifts in how financial institutions approach customer data and service delivery...\n\n**Current Market Dynamics:**\nThe ACCC\'s phased rollout has created both opportunities and challenges. Financial institutions are increasingly partnering with fintechs to deliver enhanced customer experiences, while grappling with new compliance obligations...\n\n**Regulatory Landscape:**\nWith Treasury\'s recent consultation on expanding Open Banking to additional sectors, institutions must prepare for broader data sharing requirements...'
    }
  ]
};

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  AUSSIE_TRADIE_TEMPLATE,
  LOCAL_BUSINESS_TEMPLATE,
  SEASONAL_STRATEGY_TEMPLATE,
  INDUSTRY_EXPERTISE_TEMPLATE
];

export const getTemplateById = (id: string): ContentTemplate | undefined => {
  return CONTENT_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByIndustry = (industry: string): ContentTemplate[] => {
  return CONTENT_TEMPLATES.filter(template => 
    template.industry.includes(industry.toLowerCase())
  );
};

export const getTemplatesByType = (type: ContentTemplate['type']): ContentTemplate[] => {
  return CONTENT_TEMPLATES.filter(template => template.type === type);
};

export const getAllTemplates = (): ContentTemplate[] => {
  return CONTENT_TEMPLATES;
};