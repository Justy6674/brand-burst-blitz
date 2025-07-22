# 🚀 MANUAL COMMIT STEPS - COPY & PASTE

Since Git locks are preventing automated commits, here are the exact steps to deploy:

## 1. Use Replit's Git Panel (Bypasses Locks)

**Go to:** Replit > Version Control tab (left sidebar)

**Files to Stage:** 
- `api/health.js` (converted to ES module)
- `api/blog.js` (converted to ES module) 
- `api/package.json` (added "type": "module")
- `vercel.json` (fixed builds configuration)
- `API_INTEGRATION_GUIDE.md` (updated with your domains)
- `DEPLOYMENT_FIX.md` (complete deployment guide)
- `replit.md` (project updates)

## 2. Commit Message (Copy This Exactly):

```
Fix Vercel deployment: Convert to ES modules and working configuration

- Convert CommonJS to ES modules for Vercel compatibility
- Update vercel.json with proper builds configuration  
- Add comprehensive debug logging for environment variables
- Update API integration guide with actual domains (www.jbsaas.com, jbsaas.ai)
- Ready for production deployment

Fixes FUNCTION_INVOCATION_FAILED errors by using proper ES module format
and @vercel/node builder configuration.
```

## 3. Push to GitHub

Click "Push" in Replit's Version Control panel

## 4. Wait for Vercel Auto-Deploy

Vercel will automatically detect the changes and redeploy

## 5. Test Your Fixed API

```bash
curl https://www.jbsaas.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "environment": "vercel",
  "debug": {
    "hasSupabaseUrl": true,
    "hasSupabaseKey": true
  }
}
```

## 6. Test Blog API

```bash
curl https://www.jbsaas.com/api/blog?limit=1
```

---

**The ES module conversion and proper Vercel configuration should fix the FUNCTION_INVOCATION_FAILED errors.**