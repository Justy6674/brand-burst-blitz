export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Debug environment
  const envCheck = {
    nodeVersion: process.version,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    envCount: Object.keys(process.env).length,
    vercelEnv: process.env.VERCEL_ENV || 'unknown'
  };

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'vercel',
    debug: envCheck
  });
}