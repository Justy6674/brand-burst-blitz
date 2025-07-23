import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

async function transcribeWithOpenAI(audioBlob: string): Promise<string> {
  const formData = new FormData();
  const binaryAudio = atob(audioBlob);
  const bytes = new Uint8Array(binaryAudio.length);
  for (let i = 0; i < binaryAudio.length; i++) {
    bytes[i] = binaryAudio.charCodeAt(i);
  }
  
  const blob = new Blob([bytes], { type: 'audio/webm' });
  formData.append('file', blob, 'audio.webm');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OpenAI transcription failed: ${await response.text()}`);
  }

  const result = await response.json();
  return result.text;
}

async function generateContentWithOpenAI(text: string, contentType: string): Promise<any> {
  const systemPrompt = `You are JB, an AI assistant that helps create engaging content for healthcare professionals. 
  Generate ${contentType} content based on the user's idea. Always maintain AHPRA compliance for Australian healthcare.
  
  Return a JSON object with:
  {
    "analysis": "Brief analysis of the idea",
    "facebook_post": "Engaging Facebook post with emojis",
    "linkedin_post": "Professional LinkedIn post",
    "blog_post": "Complete blog post with markdown formatting",
    "hashtags": ["relevant", "hashtags"],
    "compliance_score": 95
  }`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate content for this healthcare idea: ${text}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI content generation failed: ${await response.text()}`);
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

async function generateContentWithGemini(text: string, contentType: string): Promise<any> {
  const prompt = `You are JB, an AI assistant for healthcare professionals. Generate ${contentType} content based on this idea: ${text}
  
  Return ONLY a valid JSON object with:
  {
    "analysis": "Brief analysis of the idea",
    "facebook_post": "Engaging Facebook post with emojis", 
    "linkedin_post": "Professional LinkedIn post",
    "blog_post": "Complete blog post with markdown formatting",
    "hashtags": ["relevant", "hashtags"],
    "compliance_score": 95
  }`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini content generation failed: ${await response.text()}`);
  }

  const result = await response.json();
  const content = result.candidates[0].content.parts[0].text;
  
  // Clean up the response to extract JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from Gemini');
  }
  
  return JSON.parse(jsonMatch[0]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, text, contentType = 'both' } = await req.json();
    
    let finalText = text;
    
    // If audio is provided, transcribe it first
    if (audio && !text) {
      console.log('Transcribing audio...');
      try {
        finalText = await transcribeWithOpenAI(audio);
        console.log('Transcription successful:', finalText);
      } catch (error) {
        console.error('OpenAI transcription failed:', error);
        return new Response(JSON.stringify({ 
          error: 'Transcription failed',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (!finalText) {
      return new Response(JSON.stringify({ 
        error: 'No text or audio provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate content with OpenAI first, fallback to Gemini
    let generatedContent;
    try {
      console.log('Generating content with OpenAI...');
      generatedContent = await generateContentWithOpenAI(finalText, contentType);
      generatedContent.provider = 'openai';
      console.log('OpenAI content generation successful');
    } catch (error) {
      console.error('OpenAI failed, trying Gemini:', error);
      try {
        generatedContent = await generateContentWithGemini(finalText, contentType);
        generatedContent.provider = 'gemini';
        console.log('Gemini content generation successful');
      } catch (geminiError) {
        console.error('Both OpenAI and Gemini failed:', geminiError);
        return new Response(JSON.stringify({ 
          error: 'Content generation failed',
          details: 'Both OpenAI and Gemini are unavailable'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const result = {
      success: true,
      originalText: finalText,
      transcribed: !!audio,
      content: generatedContent,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in quick-idea-capture function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Unexpected error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});