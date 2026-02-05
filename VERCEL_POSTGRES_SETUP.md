# Quick Start: Vercel PostgreSQL Setup

## Why PostgreSQL?

Vercel doesn't support SQLite (file-based database) because it's a serverless platform. PostgreSQL is the recommended solution and is fully supported.

## Quick Migration (5 minutes)

### 1. Create Vercel Postgres Database

```bash
# Go to: https://vercel.com/dashboard
# → Select your project
# → Storage tab
# → Create Database → Postgres
```

### 2. Get Environment Variables

```bash
npm i -g vercel@latest
vercel env pull .env.local
```

### 3. Run Migration Script

```bash
npm run migrate:postgres
```

That's it! The script will:
- ✅ Export your SQLite data
- ✅ Update Prisma schema to PostgreSQL
- ✅ Create tables in Postgres
- ✅ Import all your data
- ✅ Verify everything works

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:3001 and verify everything works.

### 5. Deploy

```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

Vercel will automatically deploy with PostgreSQL!

## Manual Migration

If you prefer step-by-step control, see `POSTGRES_MIGRATION_GUIDE.md`

## Verification

```bash
# View your data
npm run db:studio

# Check system status
node scripts/system-status.js
```

## Rollback

If needed, your SQLite database is backed up:

```bash
cp prisma/schema.sqlite.prisma prisma/schema.prisma
npx prisma generate
# Your dev.db file is still intact
```

## Helpful Commands

```bash
npm run db:export        # Export SQLite data
npm run db:import        # Import to Postgres
npm run db:studio        # View database
npm run migrate:postgres # Full migration
```

## What Changed?

- ✅ Database provider: SQLite → PostgreSQL
- ✅ Database location: Local file → Vercel/Neon cloud
- ✅ Connection: Direct → Connection pooling
- ❌ No code changes needed!
- ❌ No schema changes needed!

## Cost

**Free Tier (Neon via Vercel):**
- 0.5 GB storage
- 3 GB data transfer/month
- Shared compute
- Perfect for your app!

## Support

- Full guide: `POSTGRES_MIGRATION_GUIDE.md`
- Checklist: `MIGRATION_CHECKLIST.md`
- Vercel Docs: https://vercel.com/docs/storage/vercel-postgres
