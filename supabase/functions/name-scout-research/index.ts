import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NAME-SCOUT-RESEARCH] ${step}${detailsStr}`);
};

// Mock ASIC search function
const mockAsicSearch = async (businessName: string) => {
  logStep("Running ASIC search", { businessName });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock results based on business name
  const isAvailable = !businessName.toLowerCase().includes('telstra') && 
                     !businessName.toLowerCase().includes('commonwealth');
  
  return {
    available: isAvailable,
    exactMatches: isAvailable ? 0 : 1,
    similarNames: isAvailable ? [] : [`${businessName} PTY LTD`, `${businessName} GROUP`],
    searchDate: new Date().toISOString(),
    source: 'ASIC Register'
  };
};

// Mock WHOIS domain search
const mockWhoisSearch = async (domainName: string, extensions: string[]) => {
  logStep("Running WHOIS search", { domainName, extensions });
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const results: Record<string, any> = {};
  
  for (const ext of extensions) {
    const fullDomain = `${domainName.toLowerCase().replace(/\s+/g, '')}${ext}`;
    // Mock availability - some common domains are taken
    const isTaken = domainName.toLowerCase().includes('google') || 
                   domainName.toLowerCase().includes('facebook') ||
                   Math.random() > 0.7; // 30% chance of being taken
    
    results[fullDomain] = {
      available: !isTaken,
      registrar: isTaken ? 'Example Registrar' : null,
      expiryDate: isTaken ? '2025-12-31' : null,
      status: isTaken ? 'registered' : 'available',
      estimatedCost: {
        '.com.au': 25,
        '.com': 15,
        '.io': 65,
        '.net.au': 25
      }[ext] || 20
    };
  }
  
  return results;
};

// Mock trademark search
const mockTrademarkSearch = async (businessName: string) => {
  logStep("Running trademark search", { businessName });
  
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const hasConflict = businessName.toLowerCase().includes('apple') ||
                     businessName.toLowerCase().includes('microsoft') ||
                     Math.random() > 0.8; // 20% chance of conflict
  
  return {
    conflicts: hasConflict ? 1 : 0,
    exactMatches: hasConflict ? [`${businessName.toUpperCase()} TECHNOLOGIES`] : [],
    similarMarks: hasConflict ? [`${businessName} CORP`, `${businessName} SOLUTIONS`] : [],
    riskLevel: hasConflict ? 'HIGH' : 'LOW',
    searchDate: new Date().toISOString(),
    source: 'IP Australia',
    recommendation: hasConflict ? 
      'Consider alternative names due to potential trademark conflicts' : 
      'No significant trademark conflicts found'
  };
};

// Generate AI summary
const generateAISummary = (asicResults: any, domainResults: any, trademarkResults?: any) => {
  const businessName = Object.keys(domainResults)[0]?.split('.')[0] || 'your business';
  
  let summary = `## Business Name Analysis for "${businessName}"\n\n`;
  
  // ASIC Analysis
  if (asicResults.available) {
    summary += `✅ **Business Name**: Available for registration with ASIC. No exact matches found.\n\n`;
  } else {
    summary += `⚠️ **Business Name**: Similar businesses already registered. Consider variations.\n\n`;
  }
  
  // Domain Analysis
  const availableDomains = Object.entries(domainResults)
    .filter(([_, data]: [string, any]) => data.available)
    .map(([domain, _]) => domain);
    
  const takenDomains = Object.entries(domainResults)
    .filter(([_, data]: [string, any]) => !data.available)
    .map(([domain, _]) => domain);
  
  if (availableDomains.length > 0) {
    summary += `🌐 **Available Domains**: ${availableDomains.join(', ')}\n\n`;
  }
  
  if (takenDomains.length > 0) {
    summary += `❌ **Unavailable Domains**: ${takenDomains.join(', ')}\n\n`;
  }
  
  // Trademark Analysis
  if (trademarkResults) {
    if (trademarkResults.riskLevel === 'LOW') {
      summary += `🛡️ **Trademark Status**: Low risk of conflicts. Recommended to proceed.\n\n`;
    } else {
      summary += `⚠️ **Trademark Status**: Potential conflicts detected. Legal review recommended.\n\n`;
    }
  }
  
  // Recommendations
  summary += `## Recommendations\n\n`;
  
  if (asicResults.available && availableDomains.length > 0) {
    summary += `1. **Proceed with registration** - Business name and key domains available\n`;
    summary += `2. **Secure domains quickly** - Register ${availableDomains[0]} as priority\n`;
  } else {
    summary += `1. **Consider variations** - Explore alternative business names\n`;
    summary += `2. **Check alternatives** - Try adding location or industry descriptors\n`;
  }
  
  if (trademarkResults?.riskLevel === 'HIGH') {
    summary += `3. **Legal consultation** - Seek trademark attorney advice before proceeding\n`;
  }
  
  summary += `\n*Analysis completed on ${new Date().toLocaleDateString('en-AU')}*`;
  
  return summary;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { requestId } = await req.json();
    logStep("Request data received", { requestId });

    // Create Supabase client with service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get request details
    const { data: request, error: requestError } = await supabaseService
      .from('name_scout_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error(`Request not found: ${requestError?.message}`);
    }

    logStep("Request found", { 
      requestId, 
      businessName: request.requested_name,
      status: request.request_status 
    });

    // Update status to processing
    await supabaseService
      .from('name_scout_requests')
      .update({ 
        request_status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', requestId);

    logStep("Status updated to processing");

    // Perform research
    const businessName = request.requested_name;
    const domainExtensions = request.domain_extensions;
    const includeTrademarks = request.include_trademark_screening;

    // Run searches in parallel for faster results
    const [asicResults, domainResults, trademarkResults] = await Promise.all([
      mockAsicSearch(businessName),
      mockWhoisSearch(businessName, domainExtensions),
      includeTrademarks ? mockTrademarkSearch(businessName) : Promise.resolve(null)
    ]);

    logStep("All searches completed", { 
      asicAvailable: asicResults.available,
      domainsChecked: Object.keys(domainResults).length,
      trademarkRisk: trademarkResults?.riskLevel 
    });

    // Generate AI summary
    const aiSummary = generateAISummary(asicResults, domainResults, trademarkResults);

    // Update request with results
    const { error: updateError } = await supabaseService
      .from('name_scout_requests')
      .update({
        asic_availability: asicResults,
        domain_availability: domainResults,
        trademark_results: trademarkResults,
        ai_summary: aiSummary,
        request_status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      throw new Error(`Failed to update results: ${updateError.message}`);
    }

    logStep("Results saved successfully", { requestId });

    return new Response(JSON.stringify({
      success: true,
      requestId,
      results: {
        asic: asicResults,
        domains: domainResults,
        trademarks: trademarkResults,
        summary: aiSummary
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in name-scout-research", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});