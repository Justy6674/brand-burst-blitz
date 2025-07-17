import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      templateId, 
      tone = 'professional', 
      type = 'blog',
      businessContext 
    } = await req.json();

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
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Create post draft
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        type,
        content: generatedContent,
        ai_prompt: prompt,
        ai_tone: tone,
        status: 'draft',
        title: type === 'blog' ? 'Generated Blog Post' : 'Generated Content'
      })
      .select()
      .single();

    if (postError) {
      throw postError;
    }

    return new Response(JSON.stringify({ 
      content: generatedContent,
      postId: post.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});