# Fix Vercel Filters: Step-by-Step Guide

## The Problem
Filters work on localhost but not on Vercel because **Vercel's database has no offerings data**.

## The Solution
Set up a PostgreSQL database on Vercel and import your data.

---

## Step 1: Verify the Problem

Test your Vercel deployment:

```bash
# Check if filters are enabled
curl https://your-app.vercel.app/api/filter-options

# Expected (broken): {"enabled": false, "reason": "..."}
# Desired: {"enabled": true, "levels": [...], "subjects": [...]}
```

---

## Step 2: Set Up PostgreSQL on Vercel

### Option A: Vercel Postgres (Easiest)

1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Follow the setup wizard
6. Vercel automatically adds `DATABASE_URL` to your environment variables

### Option B: Supabase (Free Alternative)

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - Name: `podsee-production`
   - Database Password: (generate strong password)
   - Region: Singapore (closest to Vercel)
5. Wait for project to be created (~2 minutes)
6. Go to Settings → Database
7. Copy the "Connection string" (URI format)
8. In Vercel:
   - Go to your project → Settings → Environment Variables
   - Add new variable:
     - Name: `DATABASE_URL`
     - Value: `<your-supabase-connection-string>`
     - Environment: Production

---

## Step 3: Run Database Migrations

This creates the tables in your production database.

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Login to Vercel
vercel login

# Pull production environment variables
vercel env pull .env.production

# Run migrations against production database
# (Use the DATABASE_URL from .env.production)
npx prisma migrate deploy
```

Or manually:

```bash
# Set the production DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run migrations
npx prisma migrate deploy

# Verify tables were created
npx prisma studio
```

---

## Step 4: Import Your Data

You have 1,088 offerings locally. Import them to production:

```bash
# Make sure you're using the production DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run the ingestion script
node scripts/ingest-all-centres.js

# This will:
# - Import all tuition centres
# - Import all levels and subjects
# - Create 1,088 offerings
```

**Important:** Make sure you have the Excel file `database_ready (1) copy.xlsx` in your project root.

---

## Step 5: Verify Data Import

```bash
# Check offerings count
node scripts/check-vercel-database.js

# Expected output:
# 📦 Offerings Count: 1088
# ✅ Offerings exist - filters should work
```

Or manually:

```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"

node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.offering.count().then(c => { console.log('Offerings:', c); p.\$disconnect(); })"

# Expected: Offerings: 1088
```

---

## Step 6: Redeploy Vercel

Vercel needs to restart with the new DATABASE_URL:

### Option A: Automatic (Recommended)
```bash
# Just push to GitHub - Vercel auto-deploys
git commit --allow-empty -m "Trigger Vercel redeploy with database"
git push origin main
```

### Option B: Manual
1. Go to Vercel dashboard
2. Click "Deployments" tab
3. Click "..." on latest deployment
4. Click "Redeploy"

---

## Step 7: Verify Filters Work on Vercel

### Test 1: Check Filter Options API
```bash
curl https://your-app.vercel.app/api/filter-options
```

**Expected:**
```json
{
  "enabled": true,
  "levels": ["P1", "P2", "P3", "P4", "P5", "P6", "S1", "S2", "S3", "S4", "JC1", "JC2"],
  "subjects": ["English", "Math", "Science", "Physics", "Chemistry", "Biology", ...]
}
```

### Test 2: Test Filtered Query
```bash
curl "https://your-app.vercel.app/api/tuition-centres?levels=S1&subjects=Physics&limit=5"
```

**Expected:**
- Should return 5 or fewer centres
- Each centre should have offerings for S1 Physics
- Should NOT return all centres

### Test 3: Test in Browser
1. Visit `https://your-app.vercel.app`
2. Select filters (e.g., Secondary 1, Physics)
3. Click "Find Tuition Centres"
4. Verify:
   - Results are filtered (not showing all centres)
   - Each result has the selected level and subject
   - Result count is reasonable (not 100+)

---

## Troubleshooting

### "No offerings in database"
- Verify DATABASE_URL is set in Vercel environment variables
- Check if migrations ran successfully
- Re-run ingestion script

### "Database connection error"
- Verify DATABASE_URL format: `postgresql://user:password@host:5432/database`
- Check if database allows connections from external IPs
- For Supabase: Make sure you're using the "Connection string" not "Connection pooling"

### "Filters still not working"
- Clear Vercel cache: Redeploy with "Clear cache" option
- Check Vercel logs for errors
- Verify environment variables are set for "Production" environment

### "Build fails on Vercel"
- Check build logs in Vercel dashboard
- Ensure `prisma generate` runs before `next build`
- Verify `vercel.json` has correct build command

---

## Quick Reference

### Local Database (SQLite)
```bash
DATABASE_URL="file:./dev.db"
node scripts/check-vercel-database.js
# Offerings: 1088 ✅
```

### Production Database (PostgreSQL)
```bash
export DATABASE_URL="postgresql://..."
node scripts/check-vercel-database.js
# Offerings: 1088 ✅
```

### Environment Variables Needed on Vercel
```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<random-secret>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

---

## Summary

The issue is **not** with your code or deployment process. The issue is:

1. ✅ Code is correct and deployed
2. ❌ Database has no offerings data
3. ✅ Filter logic correctly falls back when no data exists

Once you set up PostgreSQL and import your data, filters will work exactly like localhost.

**Estimated time:** 15-30 minutes
