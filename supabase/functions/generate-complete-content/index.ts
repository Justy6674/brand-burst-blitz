import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentGenerationRequest {
  businessName: string;
  industry: string;
  location?: string;
  contentType: string;
  topicIdea?: string;
  targetAudience?: string;
  generateImages?: boolean;
  generateSocial?: boolean;
  generateSEO?: boolean;
}

interface ContentPackage {
  blogPost: {
    title: string;
    content: string;
    excerpt: string;
    metaDescription: string;
    keywords: string[];
  };
  images?: {
    heroImage: string;
    socialImage: string;
    quoteCard: string;
  };
  socialPosts?: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
  seoData?: {
    schema: string;
    metaTags: string;
    altTexts: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestData: ContentGenerationRequest = await req.json();
    const { 
      businessName, 
      industry, 
      location, 
      contentType, 
      topicIdea, 
      targetAudience,
      generateImages = true,
      generateSocial = true,
      generateSEO = true
    } = requestData;

    console.log('Generating complete content package for:', businessName, industry, contentType);

    // Generate comprehensive blog content
    const blogPrompt = `As an expert content marketer for Australian businesses, create a comprehensive blog post for "${businessName}", a ${industry} business located in ${location || 'Australia'}.

Content Type: ${contentType}
Topic: ${topicIdea || 'industry-relevant topic that showcases expertise'}
Target Audience: ${targetAudience || 'potential customers in Australia'}

Requirements:
1. Write a compelling, professional blog post (800-1200 words)
2. Include Australian context, local insights, and regional considerations
3. Add practical tips and actionable advice
4. Reference Australian regulations, standards, or market conditions where relevant
5. Use a professional but approachable tone
6. Include 5-8 relevant keywords naturally
7. Write an engaging meta description (150-160 characters)
8. Create an excerpt (100-150 words)

Structure:
- Engaging headline
- Introduction that hooks the reader
- 3-4 main sections with practical content
- Conclusion with clear call-to-action
- Meta description and excerpt

Industry focus: ${industry}
Local context: Australian business environment, seasonal considerations, compliance where relevant

Return as JSON with: title, content, excerpt, metaDescription, keywords`;

    let contentResponse;
    
    try {
      // Try OpenAI first
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert Australian business content creator. Always return valid JSON with the requested structure.' 
            },
            { role: 'user', content: blogPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!openAIResponse.ok) {
        throw new Error(`OpenAI API error: ${openAIResponse.status}`);
      }

      const openAIData = await openAIResponse.json();
      const rawContent = openAIData.choices[0].message.content;
      
      // Try to parse as JSON, fallback to structured parsing
      try {
        contentResponse = JSON.parse(rawContent);
      } catch {
        // Parse structured content if JSON parsing fails
        contentResponse = parseStructuredContent(rawContent, contentType, businessName);
      }
      
    } catch (openAIError) {
      console.error('OpenAI failed, trying Gemini:', openAIError);
      
      if (!geminiApiKey) {
        throw new Error('Both OpenAI and Gemini APIs unavailable');
      }

      // Fallback to Gemini
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: blogPrompt
            }]
          }]
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const rawContent = geminiData.candidates[0].content.parts[0].text;
      
      try {
        contentResponse = JSON.parse(rawContent);
      } catch {
        contentResponse = parseStructuredContent(rawContent, contentType, businessName);
      }
    }

    const result: ContentPackage = {
      blogPost: contentResponse
    };

    // Generate images if requested
    if (generateImages && openAIApiKey) {
      try {
        const imagePrompts = {
          hero: `Professional hero image for ${industry} business blog post about ${contentType}. Australian business context. Clean, modern, high-quality. No text overlay.`,
          social: `Social media image for ${businessName} - ${industry} business. Professional Australian business style. Space for text overlay. Clean design.`,
          quote: `Quote card background for customer testimonial. ${industry} themed. Professional design with space for text and logo. Australian business style.`
        };

        const imagePromises = Object.entries(imagePrompts).map(async ([type, prompt]) => {
          try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'dall-e-3',
                prompt,
                size: '1024x1024',
                quality: 'standard',
                n: 1
              })
            });
            
            if (response.ok) {
              const imageData = await response.json();
              return [type, imageData.data[0].url];
            } else {
              console.error(`Image generation failed for ${type}:`, response.status);
              return [type, `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(businessName + ' ' + type)}`];
            }
          } catch (error) {
            console.error(`Image generation error for ${type}:`, error);
            return [type, `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(businessName + ' ' + type)}`];
          }
        });

        const images = Object.fromEntries(await Promise.all(imagePromises));
        result.images = {
          heroImage: images.hero,
          socialImage: images.social,
          quoteCard: images.quote
        };
      } catch (error) {
        console.error('Image generation failed:', error);
        // Provide placeholder images
        result.images = {
          heroImage: `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(businessName + ' Hero')}`,
          socialImage: `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(businessName + ' Social')}`,
          quoteCard: `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(businessName + ' Quote')}`
        };
      }
    }

    // Generate social posts if requested
    if (generateSocial) {
      try {
        const socialPrompt = `Create engaging social media posts for ${businessName} (${industry}) promoting the blog post: "${contentResponse.title}".

Business: ${businessName}
Industry: ${industry}
Location: ${location || 'Australia'}
Content: ${contentResponse.excerpt}

Create 4 different posts optimized for each platform:

FACEBOOK: Engaging post with question to drive comments (150-200 words)
INSTAGRAM: Visual-focused post with relevant hashtags (100-150 words, include 8-12 hashtags)
LINKEDIN: Professional post showcasing expertise (200-250 words)
TWITTER: Concise post with key insight (200-280 characters)

Include relevant hashtags, local references, and call-to-actions.
Return as JSON with facebook, instagram, linkedin, twitter fields.`;

        let socialResponse;
        
        try {
          const socialOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a social media expert. Return valid JSON with facebook, instagram, linkedin, twitter fields.' },
                { role: 'user', content: socialPrompt }
              ],
              temperature: 0.8,
              max_tokens: 1000,
            }),
          });

          const socialData = await socialOpenAI.json();
          const rawSocial = socialData.choices[0].message.content;
          
          try {
            socialResponse = JSON.parse(rawSocial);
          } catch {
            // Create fallback social posts
            socialResponse = createFallbackSocialPosts(businessName, contentResponse.title, industry);
          }
        } catch {
          socialResponse = createFallbackSocialPosts(businessName, contentResponse.title, industry);
        }

        result.socialPosts = socialResponse;
      } catch (error) {
        console.error('Social media generation failed:', error);
        result.socialPosts = createFallbackSocialPosts(businessName, contentResponse.title, industry);
      }
    }

    // Generate SEO data if requested
    if (generateSEO) {
      result.seoData = {
        schema: generateLocalBusinessSchema(businessName, industry, location || 'Australia'),
        metaTags: generateMetaTags(contentResponse.title, contentResponse.metaDescription, result.images?.heroImage),
        altTexts: [
          `${businessName} - ${contentType} hero image`,
          `${businessName} social media graphic`,
          `Customer testimonial quote card for ${businessName}`
        ]
      };
    }

    console.log('Content generation completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-complete-content function:', error);
    return new Response(JSON.stringify({ 
      error: 'Content generation failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseStructuredContent(content: string, contentType: string, businessName: string) {
  // Fallback parser for when AI doesn't return JSON
  const lines = content.split('\n');
  const result = {
    title: `${contentType} Guide for ${businessName}`,
    content: content,
    excerpt: content.substring(0, 150) + '...',
    metaDescription: `Professional ${contentType.toLowerCase()} advice from ${businessName}. Expert guidance for Australian businesses.`,
    keywords: [contentType.toLowerCase(), businessName.toLowerCase(), 'australian business', 'professional advice', 'expert guidance']
  };

  // Try to extract title from content
  const titleMatch = content.match(/^#\s*(.+)$/m) || content.match(/^Title:\s*(.+)$/m);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  return result;
}

function createFallbackSocialPosts(businessName: string, title: string, industry: string) {
  return {
    facebook: `Check out our latest insight: "${title}" 💡\n\nWhat's your experience with this? Share your thoughts in the comments below!\n\n#AustralianBusiness #${industry.replace(/\s+/g, '')} #BusinessTips`,
    instagram: `New blog post is live! 📚✨\n\n"${title}"\n\nSwipe up in our stories for the full read!\n\n#${businessName.replace(/\s+/g, '')} #AustralianBusiness #${industry.replace(/\s+/g, '')} #BusinessGrowth #ExpertAdvice #LocalBusiness #BusinessTips #EntrepreneurLife`,
    linkedin: `We've just published a comprehensive guide: "${title}"\n\nThis article covers key insights that every ${industry.toLowerCase()} business should consider in today's Australian market.\n\nRead the full article on our website and let us know your thoughts in the comments.\n\n#AustralianBusiness #${industry.replace(/\s+/g, '')} #BusinessStrategy`,
    twitter: `New post: "${title}" - Essential insights for Australian ${industry.toLowerCase()} businesses. Read more: [link] #AusBiz #${industry.replace(/\s+/g, '')}`
  };
}

function generateLocalBusinessSchema(name: string, industry: string, location: string) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "description": `Professional ${industry} services in ${location}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location.split(',')[0],
      "addressRegion": location.split(',')[1]?.trim() || location,
      "addressCountry": "AU"
    },
    "telephone": "+61-xxx-xxx-xxx",
    "priceRange": "$$",
    "openingHours": "Mo-Fr 09:00-17:00"
  }, null, 2);
}

function generateMetaTags(title: string, description: string, image?: string) {
  return `<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
${image ? `<meta property="og:image" content="${image}" />` : ''}
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
${image ? `<meta name="twitter:image" content="${image}" />` : ''}`;
}