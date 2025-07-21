import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const fileId = pathParts[pathParts.length - 1];

    if (!fileId) {
      return new Response(JSON.stringify({ error: 'File ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get file information
    const { data: fileRecord, error: fileError } = await supabase
      .from('generated_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !fileRecord) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if file has expired
    if (fileRecord.expires_at && new Date(fileRecord.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'File has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('generated-integrations')
      .download(fileRecord.storage_path);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: 'Failed to download file' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update download count
    await supabase
      .from('generated_files')
      .update({ download_count: fileRecord.download_count + 1 })
      .eq('id', fileId);

    // Log download
    await supabase
      .from('api_usage_logs')
      .insert({
        endpoint: 'download-integration-file',
        business_id: null, // Can't easily get business_id from file_id
        request_params: { file_id: fileId, filename: fileRecord.filename },
        response_size: fileRecord.file_size,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });

    // Set appropriate headers for download
    const headers = new Headers({
      ...corsHeaders,
      'Content-Type': fileRecord.mime_type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileRecord.filename}"`,
      'Content-Length': fileRecord.file_size?.toString() || '',
      'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      'X-Download-Count': fileRecord.download_count.toString()
    });

    return new Response(fileData, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    console.error('File download error:', error);
    return new Response(JSON.stringify({ 
      error: 'Download failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 