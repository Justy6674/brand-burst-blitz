import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title, metaDescription, targetKeywords } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing SEO content...');

    // Analyze content metrics
    const wordCount = content.split(/\s+/).length;
    const characterCount = content.length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0;

    // Calculate readability score (simplified Flesch Reading Ease)
    const avgSentenceLength = avgWordsPerSentence;
    const syllableCount = content.split(/\s+/).reduce((total, word) => {
      return total + Math.max(1, word.replace(/[^aeiouAEIOU]/g, '').length);
    }, 0);
    const avgSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;
    
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
    ));

    // Extract keywords from content
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFrequency: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    const detectedKeywords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // SEO Score calculation
    let seoScore = 0;
    const suggestions: string[] = [];

    // Title optimization
    if (!title || title.length === 0) {
      suggestions.push("Add a title to improve SEO");
    } else if (title.length < 30) {
      suggestions.push("Title is too short - aim for 30-60 characters");
      seoScore += 5;
    } else if (title.length > 60) {
      suggestions.push("Title is too long - keep it under 60 characters");
      seoScore += 10;
    } else {
      seoScore += 20;
    }

    // Meta description optimization
    if (!metaDescription || metaDescription.length === 0) {
      suggestions.push("Add a meta description to improve click-through rates");
    } else if (metaDescription.length < 120) {
      suggestions.push("Meta description is too short - aim for 120-160 characters");
      seoScore += 5;
    } else if (metaDescription.length > 160) {
      suggestions.push("Meta description is too long - keep it under 160 characters");
      seoScore += 10;
    } else {
      seoScore += 15;
    }

    // Content length optimization
    if (wordCount < 300) {
      suggestions.push("Content is too short - aim for at least 300 words");
      seoScore += 5;
    } else if (wordCount >= 300 && wordCount < 1000) {
      seoScore += 15;
    } else {
      seoScore += 20;
    }

    // Keyword optimization
    if (targetKeywords && targetKeywords.length > 0) {
      const keywordMatches = targetKeywords.filter((keyword: string) => 
        content.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length === 0) {
        suggestions.push("Include your target keywords in the content");
      } else if (keywordMatches.length === targetKeywords.length) {
        seoScore += 20;
      } else {
        seoScore += 10;
        suggestions.push("Include all target keywords in your content");
      }

      // Check keyword in title
      const titleKeywordMatches = targetKeywords.filter((keyword: string) => 
        title?.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (titleKeywordMatches.length === 0) {
        suggestions.push("Include primary keywords in your title");
      } else {
        seoScore += 10;
      }
    }

    // Readability score
    if (readabilityScore >= 60) {
      seoScore += 10;
    } else {
      suggestions.push("Improve readability by using shorter sentences and simpler words");
      seoScore += 5;
    }

    // Additional SEO suggestions
    if (content.includes('http://') || content.includes('https://')) {
      seoScore += 5;
    } else {
      suggestions.push("Consider adding relevant internal and external links");
    }

    if (suggestions.length === 0) {
      suggestions.push("Great job! Your content is well-optimized for SEO");
    }

    const analysis = {
      score: Math.min(100, seoScore),
      keywords: detectedKeywords,
      suggestions,
      readability: Math.round(readabilityScore),
      contentLength: wordCount,
      metaDescription: metaDescription || '',
      titleOptimization: title || '',
      metrics: {
        wordCount,
        characterCount,
        sentences,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        readabilityScore: Math.round(readabilityScore)
      }
    };

    console.log('SEO analysis completed:', analysis);

    return new Response(
      JSON.stringify(analysis),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-seo-content function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});