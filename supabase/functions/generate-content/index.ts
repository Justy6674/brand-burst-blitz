import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { action = 'generate' } = requestBody;

    switch (action) {
      case 'generate':
        return await generateContent(requestBody, req);
      case 'enhance':
        return await enhanceContent(requestBody);
      case 'seo_optimize':
        return await optimizeForSEO(requestBody);
      case 'platform_variations':
        return await generatePlatformVariations(requestBody);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateContent(requestBody: any, req: Request) {
  const { 
    prompt, 
    templateId, 
    tone = 'professional', 
    type = 'blog',
    businessContext,
    target_audience,
    keywords = []
  } = requestBody;

  // Get auth header
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Get user from auth
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Build system prompt based on type and tone
  let systemPrompt = `You are an expert content creator. Create ${type} content with a ${tone} tone.`;
  
  if (businessContext) {
    systemPrompt += ` Business context: ${businessContext}`;
  }
  
  if (target_audience) {
    systemPrompt += ` Target audience: ${target_audience}`;
  }
  
  if (keywords.length > 0) {
    systemPrompt += ` Include these keywords naturally: ${keywords.join(', ')}`;
  }

  systemPrompt += ` Respond with a JSON object containing:
  - title: A compelling title (under 60 characters for SEO)
  - content: The main content (well-structured with proper formatting)
  - excerpt: A brief summary (under 160 characters)
  - tags: Relevant tags array (5-10 tags)
  - seo_data: { meta_title, meta_description, keywords }`;

  // If template is provided, get template content
  let templateContent = '';
  if (templateId) {
    const { data: template } = await supabase
      .from('content_templates')
      .select('template_content, ai_prompt_template')
      .eq('id', templateId)
      .single();
    
    if (template) {
      templateContent = template.template_content;
      if (template.ai_prompt_template) {
        systemPrompt += ` Use this template structure: ${template.ai_prompt_template}`;
      }
    }
  }

  // Generate content with OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${prompt}\n\nTemplate reference: ${templateContent}` }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedContent = JSON.parse(data.choices[0].message.content);

  // Create post draft if generating new content
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      type,
      content: generatedContent.content,
      title: generatedContent.title,
      excerpt: generatedContent.excerpt,
      tags: generatedContent.tags,
      ai_prompt: prompt,
      ai_tone: tone,
      status: 'draft',
      metadata: {
        seo_data: generatedContent.seo_data,
        generated_at: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (postError) {
    throw postError;
  }

  return new Response(JSON.stringify({ 
    ...generatedContent,
    postId: post.id 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function enhanceContent(requestBody: any) {
  const { content, enhancement_options = {} } = requestBody;
  
  if (!content) {
    return new Response(
      JSON.stringify({ error: 'Content is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const enhancements = [];
  if (enhancement_options.improve_readability) enhancements.push('improve readability and flow');
  if (enhancement_options.add_seo_keywords) enhancements.push(`incorporate SEO keywords: ${enhancement_options.add_seo_keywords.join(', ')}`);
  if (enhancement_options.adjust_tone) enhancements.push(`adjust tone to be more ${enhancement_options.adjust_tone}`);
  if (enhancement_options.target_platform) enhancements.push(`optimize for ${enhancement_options.target_platform} platform`);

  const systemPrompt = `You are an expert content editor. Enhance the following content by: ${enhancements.join(', ')}.
  
  Respond with a JSON object containing:
  - content: The enhanced content
  - improvements_made: Array of improvements applied
  - quality_score: Score from 1-10 for content quality`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const enhancedContent = JSON.parse(data.choices[0].message.content);

  return new Response(
    JSON.stringify(enhancedContent),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function optimizeForSEO(requestBody: any) {
  const { content, target_keywords = [] } = requestBody;
  
  if (!content) {
    return new Response(
      JSON.stringify({ error: 'Content is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const systemPrompt = `You are an SEO expert. Optimize the following content for search engines.
  Target keywords: ${target_keywords.join(', ')}
  
  Respond with a JSON object containing:
  - optimized_content: SEO-optimized version of the content
  - seo_score: Score from 1-100 for SEO optimization
  - suggestions: Array of additional SEO improvement suggestions
  - keyword_density: Object showing keyword usage percentages
  - meta_data: { title, description, keywords }`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const seoData = JSON.parse(data.choices[0].message.content);

  return new Response(
    JSON.stringify(seoData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generatePlatformVariations(requestBody: any) {
  const { base_content, target_platforms = [] } = requestBody;
  
  if (!base_content) {
    return new Response(
      JSON.stringify({ error: 'Base content is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const platformSpecs = {
    twitter: 'max 280 characters, use hashtags, engaging and conversational',
    linkedin: 'professional tone, up to 3000 characters, include call-to-action',
    facebook: 'engaging and personal, up to 2000 characters, encourage interaction',
    instagram: 'visual-focused caption, use emojis and hashtags, storytelling approach'
  };

  const systemPrompt = `You are a social media expert. Create platform-specific variations of the following content for: ${target_platforms.join(', ')}.
  
  Platform specifications:
  ${target_platforms.map(platform => `${platform}: ${platformSpecs[platform] || 'standard social media format'}`).join('\n')}
  
  Respond with a JSON object where each platform is a key containing:
  - content: Platform-optimized content
  - hashtags: Relevant hashtags array (if applicable)
  - character_count: Number of characters used
  - engagement_tips: Tips for maximizing engagement on this platform`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: base_content }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const variations = JSON.parse(data.choices[0].message.content);

  return new Response(
    JSON.stringify(variations),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}