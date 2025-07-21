import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentGenerationRequest {
  businessId: string;
  businessName: string;
  industry: string;
  suggestion: {
    title: string;
    topic: string;
    contentType: string;
    priority: string;
    reasoning: string;
  };
  platform: string;
  ahpraCompliant: boolean;
  generateImage: boolean;
  copyPasteFormat: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      businessId,
      businessName,
      industry,
      suggestion,
      platform,
      ahpraCompliant,
      generateImage,
      copyPasteFormat
    }: ContentGenerationRequest = await req.json();

    // Get business profile for context
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', businessId)
      .single();

    if (profileError || !businessProfile) {
      throw new Error('Business profile not found');
    }

    const isHealthcare = industry.toLowerCase().includes('health') || 
                        industry.toLowerCase().includes('medical') ||
                        industry.toLowerCase().includes('dental');

    // Generate platform-specific content
    const content = generatePlatformContent({
      businessName,
      industry,
      suggestion,
      platform,
      isHealthcare,
      ahpraCompliant,
      businessProfile
    });

    // Generate hashtags
    const hashtags = generatePlatformHashtags(platform, industry, suggestion.topic);

    // Generate call to action
    const callToAction = generateCallToAction(platform, businessName, suggestion.contentType);

    // Generate image prompt if requested
    const imagePrompt = generateImage ? generateImagePrompt(suggestion, businessName, industry) : null;

    // Format for copy-paste
    const copyPasteReady = formatForCopyPaste(content, hashtags, callToAction, platform);

    // Calculate character count
    const characterCount = copyPasteReady.length;

    // Validate platform limits
    const platformLimits = getPlatformLimits(platform);
    const withinLimits = characterCount <= platformLimits.maxChars;

    if (!withinLimits) {
      // Shorten content if needed
      const shortenedContent = shortenContent(content, platformLimits.maxChars - hashtags.join(' ').length - callToAction.length - 10);
      const shortenedCopyPaste = formatForCopyPaste(shortenedContent, hashtags, callToAction, platform);
      
      return new Response(JSON.stringify({
        success: true,
        title: suggestion.title,
        content: shortenedContent,
        hashtags,
        callToAction,
        imagePrompt,
        characterCount: shortenedCopyPaste.length,
        ahpraCompliant,
        platform,
        copyPasteReady: shortenedCopyPaste,
        bestPostTime: getBestPostTime(platform),
        platformOptimized: true,
        contentTrimmed: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log content generation
    await supabase
      .from('ai_content_generation_log')
      .insert({
        user_id: businessProfile.user_id,
        business_id: businessId,
        content_type: 'social_media_post',
        platform: platform,
        generated_content: copyPasteReady,
        character_count: characterCount,
        ahpra_compliant: ahpraCompliant,
        generation_context: {
          suggestion: suggestion.title,
          topic: suggestion.topic,
          industry: industry
        }
      });

    return new Response(JSON.stringify({
      success: true,
      title: suggestion.title,
      content,
      hashtags,
      callToAction,
      imagePrompt,
      characterCount,
      ahpraCompliant,
      platform,
      copyPasteReady,
      bestPostTime: getBestPostTime(platform),
      platformOptimized: true,
      generatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate platform content',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generatePlatformContent(context: {
  businessName: string;
  industry: string;
  suggestion: any;
  platform: string;
  isHealthcare: boolean;
  ahpraCompliant: boolean;
  businessProfile: any;
}): string {
  const { businessName, industry, suggestion, platform, isHealthcare, ahpraCompliant } = context;

  let content = '';

  // Platform-specific content structure
  switch (platform) {
    case 'facebook':
      content = generateFacebookContent(businessName, industry, suggestion, isHealthcare);
      break;
    case 'instagram':
      content = generateInstagramContent(businessName, industry, suggestion, isHealthcare);
      break;
    case 'linkedin':
      content = generateLinkedInContent(businessName, industry, suggestion, isHealthcare);
      break;
    case 'twitter':
      content = generateTwitterContent(businessName, industry, suggestion, isHealthcare);
      break;
    default:
      content = generateGenericContent(businessName, industry, suggestion, isHealthcare);
  }

  // Add AHPRA compliance disclaimer if healthcare
  if (isHealthcare && ahpraCompliant) {
    content += '\n\n' + getAHPRADisclaimer(suggestion.contentType);
  }

  return content;
}

function generateFacebookContent(businessName: string, industry: string, suggestion: any, isHealthcare: boolean): string {
  const opening = getContentOpening(suggestion.topic, businessName);
  const body = getContentBody(suggestion, industry, 'facebook', isHealthcare);
  const engagement = '💬 What are your thoughts? Share in the comments below!';
  
  return `${opening}\n\n${body}\n\n${engagement}`;
}

function generateInstagramContent(businessName: string, industry: string, suggestion: any, isHealthcare: boolean): string {
  const opening = getContentOpening(suggestion.topic, businessName);
  const body = getContentBody(suggestion, industry, 'instagram', isHealthcare);
  const engagement = '📸 Double tap if you agree!\n👇 Tell us your experience in the comments';
  
  return `${opening}\n\n${body}\n\n${engagement}`;
}

function generateLinkedInContent(businessName: string, industry: string, suggestion: any, isHealthcare: boolean): string {
  const opening = `Professional insight from ${businessName}:`;
  const body = getContentBody(suggestion, industry, 'linkedin', isHealthcare);
  const engagement = 'What has been your experience with this? I\'d love to hear your thoughts in the comments.';
  
  return `${opening}\n\n${body}\n\n${engagement}`;
}

function generateTwitterContent(businessName: string, industry: string, suggestion: any, isHealthcare: boolean): string {
  const body = getContentBody(suggestion, industry, 'twitter', isHealthcare);
  return body; // Twitter content is typically shorter and more direct
}

function generateGenericContent(businessName: string, industry: string, suggestion: any, isHealthcare: boolean): string {
  const opening = getContentOpening(suggestion.topic, businessName);
  const body = getContentBody(suggestion, industry, 'generic', isHealthcare);
  
  return `${opening}\n\n${body}`;
}

function getContentOpening(topic: string, businessName: string): string {
  const openings = [
    `At ${businessName}, we're passionate about ${topic.toLowerCase()}.`,
    `Here's what we've learned about ${topic.toLowerCase()} at ${businessName}:`,
    `${topic} is something we take seriously at ${businessName}.`,
    `Let's talk about ${topic.toLowerCase()} - a topic close to our hearts at ${businessName}.`
  ];
  
  return openings[Math.floor(Math.random() * openings.length)];
}

function getContentBody(suggestion: any, industry: string, platform: string, isHealthcare: boolean): string {
  const maxLength = platform === 'twitter' ? 180 : 300;
  
  let body = '';
  
  switch (suggestion.contentType) {
    case 'story':
      body = generateStoryContent(suggestion, industry, isHealthcare);
      break;
    case 'carousel':
      body = generateCarouselContent(suggestion, industry, isHealthcare);
      break;
    case 'post':
    default:
      body = generatePostContent(suggestion, industry, isHealthcare);
      break;
  }
  
  // Trim if too long
  if (body.length > maxLength) {
    body = body.substring(0, maxLength - 3) + '...';
  }
  
  return body;
}

function generateStoryContent(suggestion: any, industry: string, isHealthcare: boolean): string {
  if (isHealthcare) {
    return `Today we're sharing insights about ${suggestion.topic.toLowerCase()}. Our team believes in transparency and education. ${suggestion.reasoning} We're here to provide quality ${industry.toLowerCase()} services with professionalism and care.`;
  } else {
    return `Behind the scenes: ${suggestion.topic}. ${suggestion.reasoning} We love sharing what goes into delivering excellent ${industry.toLowerCase()} services to our community.`;
  }
}

function generateCarouselContent(suggestion: any, industry: string, isHealthcare: boolean): string {
  if (isHealthcare) {
    return `📚 Educational Series: ${suggestion.topic}

Swipe through to learn more about this important topic. We believe informed patients make better healthcare decisions.

🔍 Key Points:
• Evidence-based information
• Professional insights
• Practical guidance

Remember: This is educational content only. Always consult with qualified healthcare professionals for personalized advice.`;
  } else {
    return `📋 ${suggestion.topic} Guide

Swipe to discover valuable insights about ${suggestion.topic.toLowerCase()}. ${suggestion.reasoning}

✨ What you'll learn:
• Industry best practices
• Professional tips
• Real-world applications`;
  }
}

function generatePostContent(suggestion: any, industry: string, isHealthcare: boolean): string {
  if (isHealthcare) {
    return `${suggestion.reasoning} At our practice, we prioritize evidence-based approaches and patient education. ${suggestion.topic} is an important aspect of quality healthcare delivery. We're committed to maintaining the highest professional standards while serving our community.`;
  } else {
    return `${suggestion.reasoning} In the ${industry.toLowerCase()} industry, ${suggestion.topic.toLowerCase()} plays a crucial role in delivering value to our clients. We're committed to sharing our expertise and insights with the community.`;
  }
}

function generatePlatformHashtags(platform: string, industry: string, topic: string): string[] {
  const industryTag = industry.replace(/\s+/g, '').toLowerCase();
  const topicTags = topic.toLowerCase().split(' ').map(word => word.replace(/[^a-z0-9]/g, ''));
  
  const baseHashtags = [industryTag, 'professional', 'quality', 'australia'];
  const platformSpecific = getPlatformSpecificHashtags(platform);
  
  return [...baseHashtags, ...topicTags, ...platformSpecific]
    .filter(tag => tag.length > 2)
    .slice(0, platform === 'twitter' ? 3 : 8);
}

function getPlatformSpecificHashtags(platform: string): string[] {
  switch (platform) {
    case 'instagram':
      return ['instagood', 'local', 'community'];
    case 'linkedin':
      return ['business', 'professional', 'industry'];
    case 'facebook':
      return ['local', 'community', 'family'];
    case 'twitter':
      return ['news', 'tips'];
    default:
      return ['business', 'local'];
  }
}

function generateCallToAction(platform: string, businessName: string, contentType: string): string {
  const ctas = {
    facebook: [
      `Contact ${businessName} today to learn more!`,
      `Book your appointment with ${businessName}!`,
      `Visit our website for more information!`,
      `Call us today to discuss your needs!`
    ],
    instagram: [
      `DM us for more info! 📩`,
      `Link in bio for bookings! ✨`,
      `Tag a friend who needs to see this! 👇`,
      `Save this post for later! 💾`
    ],
    linkedin: [
      `Connect with ${businessName} for professional insights.`,
      `Visit our company page for more updates.`,
      `Message us to discuss your business needs.`,
      `Follow for more industry insights.`
    ],
    twitter: [
      `Learn more at our website!`,
      `RT if you found this helpful!`,
      `Follow for more tips!`,
      `DM us for information!`
    ]
  };
  
  const platformCTAs = ctas[platform as keyof typeof ctas] || ctas.facebook;
  return platformCTAs[Math.floor(Math.random() * platformCTAs.length)];
}

function generateImagePrompt(suggestion: any, businessName: string, industry: string): string {
  const basePrompt = `Professional ${industry.toLowerCase()} image`;
  const topicPrompt = `showing ${suggestion.topic.toLowerCase()}`;
  const stylePrompt = 'clean, modern, high-quality photography';
  const brandPrompt = `representing ${businessName}`;
  
  return `${basePrompt} ${topicPrompt}, ${stylePrompt}, ${brandPrompt}, Australian setting, natural lighting`;
}

function formatForCopyPaste(content: string, hashtags: string[], callToAction: string, platform: string): string {
  let formatted = content;
  
  // Add call to action
  formatted += '\n\n' + callToAction;
  
  // Add hashtags
  if (hashtags.length > 0) {
    if (platform === 'instagram') {
      // Instagram: hashtags on new lines
      formatted += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
    } else {
      // Other platforms: hashtags inline
      formatted += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
    }
  }
  
  return formatted;
}

function getPlatformLimits(platform: string): { maxChars: number; maxHashtags: number } {
  const limits = {
    facebook: { maxChars: 63206, maxHashtags: 30 },
    instagram: { maxChars: 2200, maxHashtags: 30 },
    linkedin: { maxChars: 3000, maxHashtags: 5 },
    twitter: { maxChars: 280, maxHashtags: 3 }
  };
  
  return limits[platform as keyof typeof limits] || limits.facebook;
}

function shortenContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  
  // Find last complete sentence within limit
  const truncated = content.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.7) {
    return content.substring(0, lastSentence + 1);
  } else {
    return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
  }
}

function getBestPostTime(platform: string): string {
  const times = {
    facebook: '1:00 PM - 3:00 PM',
    instagram: '11:00 AM - 1:00 PM',
    linkedin: '8:00 AM - 10:00 AM',
    twitter: '9:00 AM - 12:00 PM'
  };
  
  return times[platform as keyof typeof times] || '12:00 PM';
}

function getAHPRADisclaimer(contentType: string): string {
  const disclaimers = {
    'educational': 'This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider.',
    'story': 'The information shared is general in nature. For specific health concerns, please consult with your healthcare provider.',
    'default': 'This content is for informational purposes only. Please consult with qualified healthcare professionals for personalized advice.'
  };
  
  return disclaimers[contentType as keyof typeof disclaimers] || disclaimers.default;
} 