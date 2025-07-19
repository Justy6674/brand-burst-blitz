import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, industry, faqCount = 10 } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating FAQ for industry:', industry);

    // Generate industry-specific FAQ
    const faqData = await generateIndustryFAQ(industry, faqCount, openaiKey);
    
    // Generate chatbot training data
    const chatbotData = await generateChatbotTraining(industry, faqData, openaiKey);
    
    // Create embeddable widget code
    const widgetCode = generateEmbedCode(userId, industry);

    // Store FAQ data
    const { data: faqResult, error: faqError } = await supabase
      .from('content_templates')
      .insert({
        user_id: userId,
        name: `${industry} FAQ Collection`,
        template_content: JSON.stringify(faqData),
        type: 'faq',
        tags: [industry, 'faq', 'chatbot', 'customer_service'],
        is_public: false,
        ai_prompt_template: `Industry-specific FAQ for ${industry} businesses in Australia`,
        metadata: {
          industry,
          faq_count: faqData.faqs.length,
          generated_at: new Date().toISOString(),
          chatbot_training: chatbotData,
          widget_code: widgetCode
        }
      })
      .select()
      .single();

    if (faqError) {
      console.error('Database error:', faqError);
      throw faqError;
    }

    return new Response(JSON.stringify({
      success: true,
      faq: faqData,
      chatbot: chatbotData,
      widget: widgetCode,
      templateId: faqResult.id,
      summary: `Generated ${faqData.faqs.length} FAQs and chatbot training data for ${industry} industry`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('FAQ generation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateIndustryFAQ(industry: string, count: number, openaiKey: string) {
  try {
    const industryContext = getIndustryContext(industry);
    
    const prompt = `Generate ${count} frequently asked questions and comprehensive answers for a ${industry} business in Australia. 

Industry Context: ${industryContext.description}
Common Services: ${industryContext.services.join(', ')}
Typical Customer Concerns: ${industryContext.concerns.join(', ')}

Requirements:
1. Questions should be realistic and commonly asked by Australian customers
2. Answers should be professional, helpful, and specific to the industry
3. Include relevant Australian regulations, standards, or practices where applicable
4. Add clear calls-to-action where appropriate
5. Use Australian English and terminology

Format as JSON:
{
  "faqs": [
    {
      "question": "Question text",
      "answer": "Comprehensive answer with call-to-action",
      "category": "category_name",
      "tags": ["tag1", "tag2"],
      "priority": 1-10
    }
  ],
  "categories": ["category1", "category2"],
  "industry_specific_notes": "Any special considerations for this industry"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert in Australian business customer service and FAQ creation. You understand industry-specific needs and create professional, helpful content. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse FAQ response:', content);
      return generateFallbackFAQ(industry);
    }

  } catch (error) {
    console.error('FAQ generation error:', error);
    return generateFallbackFAQ(industry);
  }
}

async function generateChatbotTraining(industry: string, faqData: any, openaiKey: string) {
  try {
    const prompt = `Create chatbot training data for a ${industry} business based on these FAQs:

${JSON.stringify(faqData.faqs.slice(0, 5), null, 2)}

Generate training data including:
1. Intent recognition patterns
2. Response templates
3. Follow-up question suggestions
4. Escalation triggers
5. Greeting and closing messages

Format as JSON with chatbot configuration.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert in chatbot design and natural language processing. Create comprehensive training data for customer service chatbots. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse chatbot training response:', content);
      return generateFallbackChatbotData(industry);
    }

  } catch (error) {
    console.error('Chatbot training generation error:', error);
    return generateFallbackChatbotData(industry);
  }
}

function getIndustryContext(industry: string) {
  const contexts: { [key: string]: any } = {
    retail: {
      description: 'Retail and e-commerce businesses selling products to consumers',
      services: ['Product sales', 'Returns/exchanges', 'Delivery', 'Customer support', 'Warranties'],
      concerns: ['Product quality', 'Shipping times', 'Return policies', 'Pricing', 'Product availability']
    },
    hospitality: {
      description: 'Restaurants, cafes, hotels, and food service businesses',
      services: ['Dining', 'Accommodation', 'Events', 'Catering', 'Takeaway/delivery'],
      concerns: ['Food safety', 'Allergies', 'Booking policies', 'Pricing', 'Special dietary requirements']
    },
    trades: {
      description: 'Construction, electrical, plumbing, and skilled trade services',
      services: ['Installations', 'Repairs', 'Maintenance', 'Consultations', 'Emergency services'],
      concerns: ['Licensing', 'Insurance', 'Quotes', 'Timeframes', 'Quality guarantees']
    },
    professional: {
      description: 'Legal, accounting, consulting, and professional service providers',
      services: ['Consultations', 'Document preparation', 'Advice', 'Compliance', 'Representation'],
      concerns: ['Fees', 'Confidentiality', 'Expertise', 'Timeframes', 'Qualifications']
    },
    wellness: {
      description: 'Health, fitness, beauty, and wellness service providers',
      services: ['Treatments', 'Training', 'Consultations', 'Products', 'Programs'],
      concerns: ['Qualifications', 'Safety', 'Results', 'Pricing', 'Booking policies']
    },
    education: {
      description: 'Training, tutoring, and educational service providers',
      services: ['Courses', 'Tutoring', 'Workshops', 'Certifications', 'Online learning'],
      concerns: ['Accreditation', 'Course content', 'Scheduling', 'Pricing', 'Success rates']
    }
  };

  return contexts[industry] || {
    description: 'General business services',
    services: ['Consultations', 'Products', 'Services', 'Support'],
    concerns: ['Quality', 'Pricing', 'Reliability', 'Communication']
  };
}

function generateFallbackFAQ(industry: string) {
  const industryContext = getIndustryContext(industry);
  
  return {
    faqs: [
      {
        question: "What services do you offer?",
        answer: `We specialize in ${industryContext.services.join(', ')}. Contact us to discuss your specific needs and how we can help.`,
        category: "services",
        tags: ["services", "offerings"],
        priority: 10
      },
      {
        question: "How much do your services cost?",
        answer: "Pricing varies based on your specific requirements. We offer competitive rates and can provide a detailed quote after understanding your needs. Contact us for a free consultation.",
        category: "pricing",
        tags: ["pricing", "cost", "quote"],
        priority: 9
      },
      {
        question: "Are you licensed and insured?",
        answer: "Yes, we are fully licensed and insured to operate in Australia. We maintain all necessary certifications and insurance coverage for your peace of mind.",
        category: "credentials",
        tags: ["licensing", "insurance", "credentials"],
        priority: 8
      }
    ],
    categories: ["services", "pricing", "credentials"],
    industry_specific_notes: `Basic FAQ template for ${industry} industry`
  };
}

function generateFallbackChatbotData(industry: string) {
  return {
    intents: [
      {
        name: "greeting",
        patterns: ["hello", "hi", "good morning", "hey"],
        responses: [`Hello! Welcome to our ${industry} business. How can I help you today?`]
      },
      {
        name: "services_inquiry",
        patterns: ["what do you do", "what services", "what do you offer"],
        responses: ["We provide comprehensive services in the " + industry + " industry. Would you like me to tell you more about a specific service?"]
      }
    ],
    fallback_response: "I'm sorry, I didn't understand that. Could you please rephrase your question or contact our team directly?",
    escalation_triggers: ["speak to human", "talk to someone", "manager", "complaint"]
  };
}

function generateEmbedCode(userId: string, industry: string) {
  return `<!-- AI FAQ Chatbot Widget -->
<div id="ai-faq-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;"></div>
<script>
  (function() {
    var widget = document.createElement('div');
    widget.innerHTML = '<button id="faq-toggle" style="background: #2563eb; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">💬</button>';
    document.getElementById('ai-faq-widget').appendChild(widget);
    
    var chatOpen = false;
    var chatContainer = null;
    
    document.getElementById('faq-toggle').onclick = function() {
      if (!chatOpen) {
        openChat();
      } else {
        closeChat();
      }
    };
    
    function openChat() {
      chatContainer = document.createElement('div');
      chatContainer.style.cssText = 'position: fixed; bottom: 90px; right: 20px; width: 350px; height: 450px; background: white; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); z-index: 1001; border: 1px solid #e5e7eb;';
      chatContainer.innerHTML = \`
        <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; border-radius: 10px 10px 0 0;">
          <h3 style="margin: 0; color: #1f2937;">${industry.charAt(0).toUpperCase() + industry.slice(1)} FAQ Assistant</h3>
          <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Ask me anything about our services!</p>
        </div>
        <div id="chat-messages" style="height: 300px; overflow-y: auto; padding: 20px;"></div>
        <div style="padding: 20px; border-top: 1px solid #e5e7eb;">
          <input type="text" id="chat-input" placeholder="Type your question..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
        </div>
      \`;
      document.body.appendChild(chatContainer);
      chatOpen = true;
      
      // Add initial message
      addMessage('Hello! I can help answer questions about our ${industry} services. What would you like to know?', 'bot');
      
      // Handle enter key
      document.getElementById('chat-input').onkeypress = function(e) {
        if (e.key === 'Enter') {
          var message = this.value.trim();
          if (message) {
            addMessage(message, 'user');
            this.value = '';
            // Simulate bot response
            setTimeout(function() {
              addMessage('Thank you for your question! For detailed information about our services, please contact us directly.', 'bot');
            }, 1000);
          }
        }
      };
    }
    
    function closeChat() {
      if (chatContainer) {
        document.body.removeChild(chatContainer);
        chatContainer = null;
        chatOpen = false;
      }
    }
    
    function addMessage(text, sender) {
      var messagesDiv = document.getElementById('chat-messages');
      var messageDiv = document.createElement('div');
      messageDiv.style.cssText = 'margin-bottom: 15px; ' + (sender === 'user' ? 'text-align: right;' : '');
      messageDiv.innerHTML = '<div style="display: inline-block; padding: 10px 15px; border-radius: 18px; max-width: 80%; font-size: 14px; ' + 
        (sender === 'user' ? 'background: #2563eb; color: white;' : 'background: #f3f4f6; color: #1f2937;') + '">' + text + '</div>';
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  })();
</script>
<!-- End AI FAQ Chatbot Widget -->`;
}