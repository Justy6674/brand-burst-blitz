import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationRequest {
  website_url: string;
  integration_id?: string;
  business_id: string;
  platform_id: string;
  expected_elements?: string[];
}

interface VerificationCheck {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

interface PerformanceMetrics {
  loadTime: number;
  seoScore: number;
  mobileScore: number;
  size: number;
  requests: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestBody: VerificationRequest = await req.json();
    const { website_url, integration_id, business_id, platform_id, expected_elements } = requestBody;

    if (!website_url || !business_id || !platform_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters',
        required: ['website_url', 'business_id', 'platform_id']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(website_url);
    } catch {
      return new Response(JSON.stringify({ 
        error: 'Invalid URL format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get business profile for AHPRA checking
    const { data: businessProfile, error: businessError } = await supabase
      .from('business_profiles')
      .select('practice_name, ahpra_registration, profession_type')
      .eq('id', business_id)
      .single();

    if (businessError || !businessProfile) {
      return new Response(JSON.stringify({ error: 'Business profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Perform comprehensive verification
    const startTime = Date.now();
    const verificationResults = await performUrlVerification(
      url, 
      platform_id, 
      businessProfile,
      expected_elements
    );
    const endTime = Date.now();

    // Calculate performance metrics
    const performanceMetrics: PerformanceMetrics = {
      loadTime: (endTime - startTime) / 1000,
      seoScore: calculateSEOScore(verificationResults.checks),
      mobileScore: calculateMobileScore(verificationResults.checks),
      size: verificationResults.pageSize || 0,
      requests: verificationResults.requestCount || 1
    };

    // Determine overall status
    const errorCount = verificationResults.checks.filter(c => c.status === 'error').length;
    const warningCount = verificationResults.checks.filter(c => c.status === 'warning').length;
    
    let overallStatus: 'success' | 'warning' | 'error';
    if (errorCount > 0) {
      overallStatus = 'error';
    } else if (warningCount > 2) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'success';
    }

    // Store verification results
    const verificationRecord = {
      integration_id,
      website_url,
      verification_type: 'integration',
      checks_performed: verificationResults.checks,
      overall_status: overallStatus,
      performance_metrics: performanceMetrics,
      error_details: verificationResults.errors || {},
      verified_at: new Date().toISOString(),
      next_verification_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    const { data: savedResult, error: saveError } = await supabase
      .from('url_verification_results')
      .insert(verificationRecord)
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save verification results:', saveError);
    }

    // Update integration status if integration_id provided
    if (integration_id) {
      await supabase
        .from('blog_integrations')
        .update({ 
          status: overallStatus === 'success' ? 'verified' : 'error',
          last_verified_at: new Date().toISOString(),
          verification_results: verificationRecord
        })
        .eq('id', integration_id);
    }

    // Log the verification attempt
    await supabase
      .from('api_usage_logs')
      .insert({
        endpoint: 'url-verification-crawler',
        business_id,
        request_params: { website_url, platform_id },
        response_count: verificationResults.checks.length,
        response_time_ms: endTime - startTime,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });

    return new Response(JSON.stringify({
      success: overallStatus !== 'error',
      overall_status: overallStatus,
      message: getStatusMessage(overallStatus, errorCount, warningCount),
      checks: verificationResults.checks,
      performance: performanceMetrics,
      verification_id: savedResult?.id,
      next_verification_at: verificationRecord.next_verification_at,
      verified_at: verificationRecord.verified_at
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('URL verification error:', error);
    return new Response(JSON.stringify({ 
      error: 'Verification failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function performUrlVerification(
  url: URL, 
  platformId: string, 
  businessProfile: any,
  expectedElements?: string[]
): Promise<{
  checks: VerificationCheck[];
  pageSize?: number;
  requestCount?: number;
  errors?: any;
}> {
  const checks: VerificationCheck[] = [];
  let pageContent = '';
  let pageSize = 0;
  const errors: any = {};

  try {
    // Fetch the webpage
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'JBSAAS-BlogVerification/1.0 (+https://jbsaas.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      checks.push({
        name: 'Website Accessibility',
        status: 'error',
        message: `Website returned HTTP ${response.status}: ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText }
      });
      return { checks, errors: { http_error: response.status } };
    }

    pageContent = await response.text();
    pageSize = new Blob([pageContent]).size;

    checks.push({
      name: 'Website Accessibility',
      status: 'success',
      message: 'Website is accessible and loads correctly'
    });

  } catch (error) {
    checks.push({
      name: 'Website Accessibility',
      status: 'error',
      message: `Failed to access website: ${error.message}`,
      details: { error: error.name }
    });
    return { checks, errors: { fetch_error: error.message } };
  }

  // Check for JBSAAS widget presence
  const widgetChecks = checkForJBSAASWidget(pageContent, platformId);
  checks.push(...widgetChecks);

  // Check for AHPRA compliance
  const ahpraChecks = checkAHPRACompliance(pageContent, businessProfile);
  checks.push(...ahpraChecks);

  // Check mobile responsiveness
  const mobileChecks = checkMobileResponsiveness(pageContent);
  checks.push(...mobileChecks);

  // Check SEO elements
  const seoChecks = checkSEOElements(pageContent);
  checks.push(...seoChecks);

  // Check performance indicators
  const performanceChecks = checkPerformanceIndicators(pageContent, pageSize);
  checks.push(...performanceChecks);

  // Check for expected elements if provided
  if (expectedElements && expectedElements.length > 0) {
    const customChecks = checkCustomElements(pageContent, expectedElements);
    checks.push(...customChecks);
  }

  return { checks, pageSize, requestCount: 1 };
}

function checkForJBSAASWidget(content: string, platformId: string): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  // Check for JBSAAS widget presence
  const widgetPatterns = [
    /data-jbsaas-widget/i,
    /jbsaas-blog-widget/i,
    /jbsaas[_-]blog/i,
    /jbsaas[_-]healthcare[_-]blog/i
  ];

  const hasWidget = widgetPatterns.some(pattern => pattern.test(content));

  if (hasWidget) {
    checks.push({
      name: 'JBSAAS Widget Detection',
      status: 'success',
      message: 'JBSAAS blog widget detected on page'
    });
  } else {
    checks.push({
      name: 'JBSAAS Widget Detection',
      status: 'error',
      message: 'JBSAAS blog widget not found on page. Please verify the integration code is properly installed.'
    });
  }

  // Check for widget.js loading
  const scriptPatterns = [
    /widget\.js/i,
    /jbsaas.*\.js/i
  ];

  const hasScript = scriptPatterns.some(pattern => pattern.test(content));

  if (hasScript) {
    checks.push({
      name: 'Widget Script Loading',
      status: 'success',
      message: 'JBSAAS widget script detected'
    });
  } else {
    checks.push({
      name: 'Widget Script Loading',
      status: 'warning',
      message: 'JBSAAS widget script not found. Widget may not load properly.'
    });
  }

  return checks;
}

function checkAHPRACompliance(content: string, businessProfile: any): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  // Check for medical disclaimer
  const disclaimerPatterns = [
    /medical disclaimer/i,
    /educational purposes only/i,
    /consult.*healthcare provider/i,
    /professional medical advice/i
  ];

  const hasDisclaimer = disclaimerPatterns.some(pattern => pattern.test(content));

  if (hasDisclaimer) {
    checks.push({
      name: 'Medical Disclaimer',
      status: 'success',
      message: 'Medical disclaimer found on page'
    });
  } else {
    checks.push({
      name: 'Medical Disclaimer',
      status: 'error',
      message: 'Medical disclaimer not found. This is required for AHPRA compliance.'
    });
  }

  // Check for AHPRA registration display
  if (businessProfile.ahpra_registration) {
    const ahpraPattern = new RegExp(businessProfile.ahpra_registration, 'i');
    
    if (ahpraPattern.test(content)) {
      checks.push({
        name: 'AHPRA Registration Display',
        status: 'success',
        message: 'AHPRA registration number displayed on page'
      });
    } else {
      checks.push({
        name: 'AHPRA Registration Display',
        status: 'warning',
        message: 'AHPRA registration number not found on page'
      });
    }
  }

  // Check for practice name
  if (businessProfile.practice_name) {
    const practicePattern = new RegExp(businessProfile.practice_name, 'i');
    
    if (practicePattern.test(content)) {
      checks.push({
        name: 'Practice Information',
        status: 'success',
        message: 'Practice name found on page'
      });
    } else {
      checks.push({
        name: 'Practice Information',
        status: 'warning',
        message: 'Practice name not found on page'
      });
    }
  }

  return checks;
}

function checkMobileResponsiveness(content: string): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  // Check for viewport meta tag
  const viewportPattern = /<meta[^>]+name=["']viewport["'][^>]*>/i;
  
  if (viewportPattern.test(content)) {
    checks.push({
      name: 'Mobile Viewport',
      status: 'success',
      message: 'Viewport meta tag found for mobile responsiveness'
    });
  } else {
    checks.push({
      name: 'Mobile Viewport',
      status: 'warning',
      message: 'Viewport meta tag not found. Mobile display may be affected.'
    });
  }

  // Check for responsive CSS indicators
  const responsivePatterns = [
    /@media/i,
    /responsive/i,
    /mobile/i,
    /grid-template-columns/i
  ];

  const hasResponsive = responsivePatterns.some(pattern => pattern.test(content));

  if (hasResponsive) {
    checks.push({
      name: 'Responsive Design',
      status: 'success',
      message: 'Responsive design indicators found'
    });
  } else {
    checks.push({
      name: 'Responsive Design',
      status: 'warning',
      message: 'Limited responsive design indicators found'
    });
  }

  return checks;
}

function checkSEOElements(content: string): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  // Check for title tag
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  
  if (titleMatch && titleMatch[1].trim().length > 0) {
    checks.push({
      name: 'Page Title',
      status: 'success',
      message: `Page title found: "${titleMatch[1].trim().substring(0, 50)}..."`
    });
  } else {
    checks.push({
      name: 'Page Title',
      status: 'error',
      message: 'Page title not found or empty'
    });
  }

  // Check for meta description
  const metaDescPattern = /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const metaDescMatch = content.match(metaDescPattern);
  
  if (metaDescMatch && metaDescMatch[1].trim().length > 0) {
    checks.push({
      name: 'Meta Description',
      status: 'success',
      message: 'Meta description found'
    });
  } else {
    checks.push({
      name: 'Meta Description',
      status: 'warning',
      message: 'Meta description not found'
    });
  }

  // Check for structured data
  const structuredDataPatterns = [
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i,
    /itemscope/i,
    /itemtype/i
  ];

  const hasStructuredData = structuredDataPatterns.some(pattern => pattern.test(content));

  if (hasStructuredData) {
    checks.push({
      name: 'Structured Data',
      status: 'success',
      message: 'Structured data markup found'
    });
  } else {
    checks.push({
      name: 'Structured Data',
      status: 'warning',
      message: 'No structured data markup found'
    });
  }

  return checks;
}

function checkPerformanceIndicators(content: string, pageSize: number): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  // Check page size
  const pageSizeKB = pageSize / 1024;
  
  if (pageSizeKB < 500) {
    checks.push({
      name: 'Page Size',
      status: 'success',
      message: `Page size is optimal (${pageSizeKB.toFixed(1)}KB)`
    });
  } else if (pageSizeKB < 1000) {
    checks.push({
      name: 'Page Size',
      status: 'warning',
      message: `Page size is moderate (${pageSizeKB.toFixed(1)}KB)`
    });
  } else {
    checks.push({
      name: 'Page Size',
      status: 'error',
      message: `Page size is large (${pageSizeKB.toFixed(1)}KB). Consider optimization.`
    });
  }

  // Check for performance optimization indicators
  const optimizationPatterns = [
    /defer/i,
    /async/i,
    /preload/i,
    /critical/i
  ];

  const hasOptimization = optimizationPatterns.some(pattern => pattern.test(content));

  if (hasOptimization) {
    checks.push({
      name: 'Performance Optimization',
      status: 'success',
      message: 'Performance optimization techniques detected'
    });
  } else {
    checks.push({
      name: 'Performance Optimization',
      status: 'warning',
      message: 'Limited performance optimization detected'
    });
  }

  return checks;
}

function checkCustomElements(content: string, expectedElements: string[]): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  expectedElements.forEach(element => {
    const pattern = new RegExp(element, 'i');
    
    if (pattern.test(content)) {
      checks.push({
        name: `Custom Element: ${element}`,
        status: 'success',
        message: `Expected element "${element}" found`
      });
    } else {
      checks.push({
        name: `Custom Element: ${element}`,
        status: 'warning',
        message: `Expected element "${element}" not found`
      });
    }
  });

  return checks;
}

function calculateSEOScore(checks: VerificationCheck[]): number {
  const seoChecks = checks.filter(c => 
    ['Page Title', 'Meta Description', 'Structured Data'].includes(c.name)
  );
  
  const successCount = seoChecks.filter(c => c.status === 'success').length;
  const totalChecks = seoChecks.length;
  
  return totalChecks > 0 ? Math.round((successCount / totalChecks) * 100) : 0;
}

function calculateMobileScore(checks: VerificationCheck[]): number {
  const mobileChecks = checks.filter(c => 
    ['Mobile Viewport', 'Responsive Design'].includes(c.name)
  );
  
  const successCount = mobileChecks.filter(c => c.status === 'success').length;
  const totalChecks = mobileChecks.length;
  
  return totalChecks > 0 ? Math.round((successCount / totalChecks) * 100) : 0;
}

function getStatusMessage(status: string, errorCount: number, warningCount: number): string {
  switch (status) {
    case 'success':
      return 'Integration verified successfully! All critical checks passed.';
    case 'warning':
      return `Integration is working but has ${warningCount} warnings that should be addressed.`;
    case 'error':
      return `Integration has ${errorCount} critical errors that need immediate attention.`;
    default:
      return 'Verification completed with unknown status.';
  }
} 