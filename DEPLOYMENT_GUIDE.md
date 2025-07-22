# JBSAAS Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Vercel account
- Supabase account with project created
- OpenAI API key
- Stripe account (for payments)

## Step 1: Supabase Setup

1. Create a new Supabase project or use existing: `qdjscrevewcuqotkzcrm`
2. Run database migrations:
   ```bash
   cd /Users/jb-downscale/Downloads/brand-burst-blitz-main
   npx supabase db push
   ```

3. Deploy Edge Functions:
   ```bash
   npx supabase functions deploy
   ```

4. Set Edge Function secrets:
   ```bash
   npx supabase secrets set OPENAI_API_KEY=your_key
   npx supabase secrets set STRIPE_SECRET_KEY=your_key
   npx supabase secrets set ABR_API_KEY=your_key
   ```

## Step 2: Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your actual values:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

## Step 3: Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Step 4: Vercel Deployment

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
```

### Option B: Using GitHub Integration
1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel project settings
4. Deploy

## Step 5: Post-Deployment

1. Update your Supabase project settings:
   - Add your Vercel domain to allowed URLs
   - Configure authentication providers
   - Set up Row Level Security policies

2. Configure Stripe webhooks:
   - Add webhook endpoint: `https://your-domain.vercel.app/api/stripe-webhook`
   - Set webhook secret in Vercel environment variables

3. Test all features:
   - User registration/login
   - Content generation
   - Blog publishing
   - Payment processing
   - Australian business services

## Environment Variables Reference

### Frontend (Vite)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_OPENAI_API_KEY`: OpenAI API key
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

### Edge Functions (Supabase)
- `OPENAI_API_KEY`: OpenAI API key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `ABR_API_KEY`: Australian Business Register API key

## Troubleshooting

### Common Issues

1. **Build fails**: Check Node version (18+) and dependencies
2. **Supabase connection error**: Verify environment variables
3. **Edge functions not working**: Check Supabase function logs
4. **Payment issues**: Verify Stripe configuration

### Debug Commands

```bash
# Check build locally
npm run build

# Test Supabase connection
npx supabase status

# View function logs
npx supabase functions logs <function-name>
```

## Support

For issues or questions:
- Check the README.md for detailed feature documentation
- Review PROJECT_TODO.md for known issues
- Contact support at support@jbsaas.com