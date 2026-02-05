# Deployment Diagnosis: Filter Mismatch Between Local and Vercel

## Problem Summary
Filters work perfectly on localhost but don't work on Vercel - all centres are shown regardless of filter selection.

## Root Cause
**The code is identical. The database is not.**

### What's Working ✅
- Latest code (commit `d2e64fc`) is on GitHub
- Vercel is deploying the correct code
- Filter logic is correct and tested
- Localhost has 1,088 offerings in SQLite database

### What's Broken ❌
- **Vercel's database has 0 offerings** (or database not configured)
- Filter API checks offering count and disables filters when count = 0
- This is working as designed - filters gracefully degrade when no data exists

## Technical Details

### Filter Fallback Logic (by design)
```javascript
// src/app/api/filter-options/route.js
const offeringsCount = await prisma.offering.count();

if (offeringsCount === 0) {
  return NextResponse.json({
    enabled: false,
    reason: 'Filters temporarily disabled. No offerings data yet.'
  });
}
```

When `enabled: false`, the frontend shows all centres without applying filters.

### Database Comparison

| Environment | Database Type | Offerings Count | Filters Work? |
|------------|---------------|-----------------|---------------|
| Localhost  | SQLite        | 1,088           | ✅ Yes        |
| Vercel     | Unknown/Empty | 0 (likely)      | ❌ No         |

## Solution: Set Up Production Database

Vercel doesn't support SQLite. You need PostgreSQL with your data.

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to "Storage" tab
3. Click "Create Database" → "Postgres"
4. Vercel auto-adds `DATABASE_URL` to environment variables

### Option 2: External Postgres (Supabase - Free)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Add as `DATABASE_URL` in Vercel environment variables

### After Database Setup

1. **Run migrations:**
   ```bash
   # Pull production env vars
   vercel env pull .env.production
   
   # Run migrations against production DB
   DATABASE_URL="<your-postgres-url>" npx prisma migrate deploy
   ```

2. **Import data:**
   ```bash
   # Option A: Re-run ingestion script against production
   DATABASE_URL="<your-postgres-url>" node scripts/ingest-all-centres.js
   
   # Option B: Export from SQLite, import to Postgres
   # (More complex, requires pg_dump/restore)
   ```

3. **Verify offerings:**
   ```bash
   DATABASE_URL="<your-postgres-url>" node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.offering.count().then(c => { console.log('Offerings:', c); p.\$disconnect(); })"
   ```

4. **Redeploy Vercel:**
   - Vercel auto-deploys on push, or
   - Manually trigger redeploy in Vercel dashboard

## Verification Steps

After setup, test on Vercel:

1. **Check filter options API:**
   ```bash
   curl https://your-app.vercel.app/api/filter-options
   ```
   Should return: `{"enabled": true, "levels": [...], "subjects": [...]}`

2. **Test filtered query:**
   ```bash
   curl "https://your-app.vercel.app/api/tuition-centres?levels=S1&subjects=Physics"
   ```
   Should return filtered results, not all centres

3. **Test in browser:**
   - Visit your Vercel URL
   - Select filters
   - Verify results are filtered

## Why This Wasn't Obvious

1. No error messages - the fallback is silent and intentional
2. Code is identical - the issue is data, not logic
3. SQLite works locally but isn't supported on Vercel
4. The deployment guide mentioned this, but it's easy to miss

## Next Steps

1. Choose database option (Vercel Postgres or Supabase)
2. Set up database and get connection string
3. Add `DATABASE_URL` to Vercel environment variables
4. Run migrations
5. Import data
6. Verify filters work on Vercel

## Files to Reference

- `VERCEL_DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `scripts/ingest-all-centres.js` - Data import script
- `prisma/schema.prisma` - Database schema
