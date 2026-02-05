# PostgreSQL Migration Guide

This guide will help you migrate from SQLite to PostgreSQL for Vercel deployment.

## Prerequisites

✅ Vercel fully supports PostgreSQL with Prisma  
✅ Your schema is compatible (no changes needed)  
✅ Backup scripts are ready

## Step 1: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create one if needed)
3. Navigate to **Storage** tab
4. Click **Create Database**
5. Select **Postgres** (powered by Neon)
6. Choose your preferred region
7. Click **Create**

Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` (use this one for Prisma)
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Step 2: Get Environment Variables Locally

Install/update Vercel CLI:
```bash
npm i -g vercel@latest
```

Pull environment variables from Vercel:
```bash
vercel env pull .env.local
```

This creates `.env.local` with your Postgres connection strings.

## Step 3: Update Your .env File

Add to your `.env` file (or create `.env.production`):
```env
# Use POSTGRES_PRISMA_URL for Prisma (connection pooling)
DATABASE_URL="your-postgres-prisma-url-from-vercel"
```

**Important:** Use `POSTGRES_PRISMA_URL` not `POSTGRES_URL` for Prisma!

## Step 4: Export Current SQLite Data

```bash
node scripts/export-sqlite-data.js
```

This creates `data-export.json` with all your current data.

## Step 5: Install PostgreSQL Dependencies

```bash
npm install pg
```

## Step 6: Update Prisma Schema

Replace `prisma/schema.prisma` with the PostgreSQL version:

```bash
# Backup current schema
cp prisma/schema.prisma prisma/schema.sqlite.prisma

# Use PostgreSQL schema
cp prisma/schema.postgres.prisma prisma/schema.prisma
```

Or manually change line 7 in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

## Step 7: Generate Prisma Client

```bash
npx prisma generate
```

## Step 8: Create Database Tables

Push the schema to your new PostgreSQL database:

```bash
npx prisma db push
```

Or create a migration:
```bash
npx prisma migrate dev --name init_postgres
```

## Step 9: Import Your Data

```bash
node scripts/import-to-postgres.js
```

This will import all your data from the export file.

## Step 10: Verify the Migration

Check your data in Prisma Studio:
```bash
npx prisma studio
```

Or run a verification script:
```bash
node scripts/system-status.js
```

## Step 11: Test Locally

```bash
npm run dev
```

Visit http://localhost:3001 and verify:
- ✅ Tuition centres load
- ✅ Filters work
- ✅ Search works
- ✅ User authentication works
- ✅ Comments/discussions work

## Step 12: Deploy to Vercel

```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

Vercel will automatically deploy with the PostgreSQL database.

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

```bash
# Restore SQLite schema
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Regenerate Prisma Client
npx prisma generate

# Your SQLite database (dev.db) is still intact
```

## Environment Variables Summary

### Local Development (.env)
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### Vercel Production
Automatically set by Vercel when you create the Postgres database.

Use `POSTGRES_PRISMA_URL` as your `DATABASE_URL` in Vercel environment variables.

## Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Ensure you're using POSTGRES_PRISMA_URL (with connection pooling)
- Verify your IP isn't blocked (Neon allows all IPs by default)

### "Relation does not exist"
- Run `npx prisma db push` again
- Or run `npx prisma migrate deploy`

### "Connection pool timeout"
- Use POSTGRES_PRISMA_URL (not POSTGRES_URL)
- Check Vercel function timeout limits

### Data didn't import
- Check `data-export.json` exists
- Verify DATABASE_URL points to Postgres
- Run import script again (it uses upsert, safe to re-run)

## Benefits of PostgreSQL

✅ Works on Vercel serverless  
✅ Better concurrent user support  
✅ ACID compliance  
✅ Better for production  
✅ Automatic backups (Neon)  
✅ Connection pooling  
✅ Scales automatically  

## Cost

Vercel Postgres (Neon) Free Tier:
- 0.5 GB storage
- 3 GB data transfer
- Shared compute
- Perfect for hobby projects

Your app should fit comfortably in the free tier.
