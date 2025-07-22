module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'vercel'
  });
};