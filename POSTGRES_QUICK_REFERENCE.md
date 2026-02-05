# PostgreSQL Migration - Quick Reference Card

## One-Line Migration

```bash
npm run migrate:postgres
```

## Essential Commands

```bash
# Setup
vercel env pull .env.local          # Get database credentials

# Migration
npm run db:export                   # Export SQLite data
npm run db:import                   # Import to PostgreSQL
npm run migrate:postgres            # Full automated migration

# Verification
npm run verify:migration            # Check migration status
npm run db:studio                   # View database
npm run dev                         # Test locally

# Deployment
git push                            # Deploy to Vercel
```

## Environment Variables

```bash
# .env.local (from Vercel)
DATABASE_URL="${POSTGRES_PRISMA_URL}"

# Use POSTGRES_PRISMA_URL (with connection pooling)
# NOT POSTGRES_URL (without pooling)
```

## Vercel Dashboard Steps

1. Dashboard → Your Project
2. Storage → Create Database
3. Select: Postgres
4. Create

## Schema Change

```prisma
# Before (SQLite)
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# After (PostgreSQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Verification Checklist

```bash
✅ npm run verify:migration shows "PostgreSQL"
✅ Data counts match SQLite
✅ npm run dev works
✅ All features work locally
✅ git push deploys successfully
✅ Production app works
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect | Check DATABASE_URL in .env.local |
| No data | Run `npm run db:import` |
| Tables missing | Run `npx prisma db push` |
| Still SQLite | Update DATABASE_URL |

## Rollback

```bash
cp prisma/schema.sqlite.prisma prisma/schema.prisma
npx prisma generate
# dev.db is still intact
```

## Files Created

- `prisma/schema.postgres.prisma` - PostgreSQL schema
- `prisma/schema.sqlite.prisma` - SQLite backup
- `data-export.json` - Data backup
- `scripts/export-sqlite-data.js` - Export script
- `scripts/import-to-postgres.js` - Import script
- `scripts/migrate-to-postgres.sh` - Migration script
- `scripts/verify-postgres-migration.js` - Verification

## Documentation

- `START_HERE.md` - Overview
- `VERCEL_POSTGRES_SETUP.md` - Quick setup
- `POSTGRES_MIGRATION_GUIDE.md` - Detailed guide
- `MIGRATION_FLOW.md` - Visual diagrams
- `MIGRATION_CHECKLIST.md` - Progress tracker

## Cost

**Free Tier (Neon):**
- 0.5 GB storage
- 3 GB transfer/month
- Shared compute
- Automatic backups

## Timeline

- Create DB: 2 min
- Migration: 2 min
- Testing: 1 min
- Deploy: 2 min
- **Total: ~7 minutes**

## Key Points

✅ No code changes needed  
✅ No schema model changes  
✅ SQLite backup preserved  
✅ Safe to re-run scripts  
✅ Free tier available  
✅ Automatic backups  

## Support Links

- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Prisma PostgreSQL: https://www.prisma.io/docs/concepts/database-connectors/postgresql
- Neon: https://neon.tech/docs

---

**Quick Start:** `npm run migrate:postgres` 🚀
