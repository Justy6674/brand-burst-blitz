import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
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
      case 'optimize_seo':
        return await optimizeForSEO(requestBody);
      case 'platform_variations':
        return await generatePlatformVariations(requestBody);
      default:
        throw new Error('Invalid action specified');
    }
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// AI Provider utility functions
async function callOpenAI(messages: any[], model = 'gpt-4o-mini', requireJSON = false) {
  if (!openAIApiKey) throw new Error('OpenAI API key not configured');
  
  const body: any = {
    model,
    messages,
  };
  
  if (requireJSON) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(messages: any[], requireJSON = false) {
  if (!geminiApiKey) throw new Error('Gemini API key not configured');
  
  // Convert OpenAI format to Gemini format
  const parts = messages.map(msg => ({ text: msg.content }));
  
  const body: any = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
    }
  };
  
  if (requireJSON) {
    body.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callClaude(messages: any[], requireJSON = false) {
  if (!anthropicApiKey) throw new Error('Anthropic API key not configured');
  
  // Convert messages format for Claude
  const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
  const userMessages = messages.filter(msg => msg.role !== 'system');
  
  let prompt = '';
  if (requireJSON) {
    prompt = `${systemMessage}\n\nPlease respond with valid JSON only.\n\n${userMessages.map(msg => msg.content).join('\n')}`;
  } else {
    prompt = `${systemMessage}\n\n${userMessages.map(msg => msg.content).join('\n')}`;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anthropicApiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function generateWithAI(messages: any[], requireJSON = false, preferredModel?: string) {
  // Try preferred model first if specified
  if (preferredModel === 'claude') {
    try {
      console.log('Using Claude as requested...');
      return await callClaude(messages, requireJSON);
    } catch (error) {
      console.error('Claude failed, falling back to other providers:', error.message);
    }
  }
  
  // Try OpenAI first, then fallback to Claude, then Gemini
  try {
    console.log('Attempting OpenAI generation...');
    return await callOpenAI(messages, 'gpt-4o-mini', requireJSON);
  } catch (error) {
    console.error('OpenAI failed, trying Claude:', error.message);
    try {
      return await callClaude(messages, requireJSON);
    } catch (claudeError) {
      console.error('Claude failed, trying Gemini:', claudeError.message);
      try {
        return await callGemini(messages, requireJSON);
      } catch (geminiError) {
        console.error('All AI providers failed:', geminiError.message);
        throw new Error(`All AI providers failed. OpenAI: ${error.message}, Claude: ${claudeError.message}, Gemini: ${geminiError.message}`);
      }
    }
  }
}

async function generateContent(requestBody: any, req: Request) {
  const { 
    prompt, 
    templateId, 
    tone = 'professional', 
    type = 'blog',
    businessContext,
    businessProfileId,
    target_audience,
    keywords = []
  } = requestBody;

  // Get auth header
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Get user from auth header
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required');
  }

  // Build system prompt with business context
  let systemPrompt = `You are an expert content creator specializing in ${type} content.
  Create high-quality, engaging content with the tone: ${tone}.
  
  Target Audience: ${target_audience}
  Keywords to include: ${keywords.join(', ')}
  Business Context: ${businessContext}
  
  Respond with a JSON object containing:
  - title: Compelling title
  - content: Main content body
  - excerpt: Brief summary (150 chars)
  - tags: Array of relevant tags
  - seo_data: { meta_title, meta_description, keywords }`;

  // Load template if specified
  let templateContent = '';
  if (templateId) {
    const { data: template } = await supabase
      .from('content_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (template) {
      templateContent = template.template_content;
      if (template.ai_prompt_template) {
        systemPrompt += ` Use this template structure: ${template.ai_prompt_template}`;
      }
    }
  }

  // Generate content with AI (with fallback)
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `${prompt}\n\nTemplate reference: ${templateContent}` }
  ];
  
  const aiResponse = await generateWithAI(messages, true);
  const generatedContent = JSON.parse(aiResponse);

  // Create post draft if generating new content
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      business_profile_id: businessProfileId || null,
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
        generated_at: new Date().toISOString(),
        business_context: businessContext
      }
    })
    .select()
    .single();

  if (postError) {
    throw postError;
  }

  return new Response(
    JSON.stringify({ ...generatedContent, post_id: post.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function enhanceContent(requestBody: any) {
  const { content, enhancements = ['readability', 'engagement', 'seo'] } = requestBody;

  const systemPrompt = `You are an expert content editor. Enhance the following content by: ${enhancements.join(', ')}.
  
  Respond with a JSON object containing:
  - content: The enhanced content
  - improvements_made: Array of improvements applied
  - quality_score: Score from 1-10 for content quality`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: content }
  ];
  
  const aiResponse = await generateWithAI(messages, true);
  const enhancedContent = JSON.parse(aiResponse);

  return new Response(
    JSON.stringify(enhancedContent),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function optimizeForSEO(requestBody: any) {
  const { content } = requestBody;
  
  const systemPrompt = `You are an SEO expert. Optimize this content for search engines while maintaining readability.
  
  Respond with a JSON object containing:
  - optimized_content: SEO-optimized version of the content
  - seo_score: Score from 1-100 for SEO optimization
  - suggestions: Array of additional SEO improvement suggestions
  - keyword_density: Object showing keyword usage percentages
  - meta_data: { title, description, keywords }`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: content }
  ];
  
  const aiResponse = await generateWithAI(messages, true);
  const seoData = JSON.parse(aiResponse);

  return new Response(
    JSON.stringify(seoData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generatePlatformVariations(requestBody: any) {
  const { base_content, target_platforms = ['facebook', 'twitter', 'linkedin', 'instagram'] } = requestBody;
  
  const platformSpecs = {
    facebook: 'Facebook post (max 2200 chars, engaging, can include hashtags)',
    twitter: 'Twitter post (max 280 chars, concise, relevant hashtags)',
    linkedin: 'LinkedIn post (professional tone, max 3000 chars, industry-relevant)',
    instagram: 'Instagram caption (visual focus, max 2200 chars, hashtag-heavy)'
  };

  const systemPrompt = `Create platform-specific variations of this content for:
  ${target_platforms.map(platform => `${platform}: ${platformSpecs[platform] || 'standard social media format'}`).join('\n')}
  
  Respond with a JSON object where each platform is a key containing:
  - content: Platform-optimized content
  - hashtags: Relevant hashtags array (if applicable)
  - character_count: Number of characters used
  - engagement_tips: Tips for maximizing engagement on this platform`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: base_content }
  ];
  
  const aiResponse = await generateWithAI(messages, true);
  const variations = JSON.parse(aiResponse);

  return new Response(
    JSON.stringify(variations),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}