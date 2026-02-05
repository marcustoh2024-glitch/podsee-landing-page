# Vercel Deployment Guide

## Prerequisites
- GitHub account (you already have this ✓)
- Vercel account (free) - sign up at https://vercel.com

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

## Step 2: Deploy via Vercel Dashboard (Easiest Method)

### A. Sign up/Login to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### B. Import Your Project
1. Click "Add New..." → "Project"
2. Find your repository: `podsee-landing-page`
3. Click "Import"

### C. Configure Your Project
Vercel will auto-detect Next.js. Configure these settings:

**Framework Preset:** Next.js (auto-detected)

**Build Command:** `npm run vercel-build` (or leave default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### D. Set Environment Variables
Click "Environment Variables" and add:

```
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=<generate-a-random-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
DATABASE_URL=<your-postgres-connection-string>
ENABLE_OFFERING_FILTERS=true
```

**Important Notes:**
- Generate NEXTAUTH_SECRET: Run `openssl rand -base64 32` in terminal
- You'll need a production database (see Step 3)

### E. Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your site will be live at `https://your-project-name.vercel.app`

## Step 3: Set Up Production Database

Vercel doesn't support SQLite in production. You need a PostgreSQL database.

### Option A: Vercel Postgres (Recommended)
1. In your Vercel project dashboard
2. Go to "Storage" tab
3. Click "Create Database" → "Postgres"
4. Follow the setup wizard
5. Vercel will automatically add DATABASE_URL to your environment variables

### Option B: External Postgres (Supabase - Free Tier)
1. Go to https://supabase.com
2. Create a new project
3. Get your connection string from Settings → Database
4. Add it as DATABASE_URL in Vercel environment variables

## Step 4: Update Google OAuth Settings

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Navigate to your OAuth credentials
3. Add to "Authorized JavaScript origins":
   ```
   https://your-project-name.vercel.app
   ```
4. Add to "Authorized redirect URIs":
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```

## Step 5: Migrate Your Database

After setting up Postgres, you need to run migrations:

### Using Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Or manually seed data:
You'll need to re-import your tuition centre data to the production database.

## Alternative: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy (from your project directory)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? podsee-landing-page
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add DATABASE_URL

# Deploy to production
vercel --prod
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Make sure DATABASE_URL points to a valid Postgres database

### Database Connection Issues
- Verify DATABASE_URL format: `postgresql://user:password@host:5432/database`
- Check if database allows connections from Vercel IPs
- Run `prisma generate` locally to test schema

### OAuth Not Working
- Verify redirect URIs in Google Cloud Console
- Check NEXTAUTH_URL matches your Vercel domain
- Ensure NEXTAUTH_SECRET is set

## Post-Deployment

1. Test your live site
2. Check all features work (search, filters, auth, comments)
3. Monitor logs in Vercel dashboard
4. Set up custom domain (optional)

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch auto-deploys to production
- Pull requests get preview deployments
- Rollback to previous deployments anytime

## Your Live URL

After deployment, share this URL with your friend:
```
https://your-project-name.vercel.app
```

You can also add a custom domain in Vercel settings!
