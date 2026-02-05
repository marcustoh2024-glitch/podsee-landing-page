# 🚀 Vercel PostgreSQL Migration - START HERE

## The Problem

Vercel doesn't support SQLite because it's a serverless platform without persistent file storage.

## The Solution

Migrate to PostgreSQL (fully supported by Vercel, powered by Neon).

## Quick Start (Choose One)

### Option 1: Automated Migration (Recommended) ⚡

```bash
# 1. Create Vercel Postgres database (via dashboard)
# 2. Pull environment variables
vercel env pull .env.local

# 3. Run migration (does everything automatically)
npm run migrate:postgres

# 4. Test
npm run dev

# 5. Deploy
git push
```

**Time: ~5 minutes**

### Option 2: Manual Migration (Step by Step) 📋

Follow the detailed guide: `POSTGRES_MIGRATION_GUIDE.md`

**Time: ~10 minutes**

## Documentation

| File | Purpose |
|------|---------|
| `VERCEL_POSTGRES_SETUP.md` | Quick setup guide (start here) |
| `POSTGRES_MIGRATION_GUIDE.md` | Detailed step-by-step instructions |
| `MIGRATION_CHECKLIST.md` | Track your progress |
| `MIGRATION_FLOW.md` | Visual flow diagrams |
| `START_HERE.md` | This file - overview |

## Migration Scripts

| Command | Description |
|---------|-------------|
| `npm run migrate:postgres` | Full automated migration |
| `npm run db:export` | Export SQLite data |
| `npm run db:import` | Import to PostgreSQL |
| `npm run verify:migration` | Verify migration success |
| `npm run db:studio` | View database in browser |

## What Gets Migrated?

✅ All tuition centres  
✅ All levels and subjects  
✅ All offerings (level-subject combinations)  
✅ All users  
✅ All discussion threads and comments  
✅ All relationships and indexes  

## What Changes?

### Changed
- Database provider: SQLite → PostgreSQL
- Database location: Local file → Cloud (Vercel/Neon)
- Connection string: `file:./dev.db` → `postgresql://...`

### Unchanged
- ✅ Your code (no changes needed!)
- ✅ Your Prisma schema models (same structure)
- ✅ Your API routes (work as-is)
- ✅ Your frontend (no changes)
- ✅ Your SQLite backup (dev.db preserved)

## Prerequisites

1. ✅ Vercel account
2. ✅ Project pushed to GitHub
3. ✅ Vercel CLI installed: `npm i -g vercel@latest`
4. ✅ Working local development environment

## Step-by-Step

### 1. Create Vercel Postgres Database

1. Go to https://vercel.com/dashboard
2. Select your project (or create one)
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose region (closest to your users)
7. Click **Create**

### 2. Get Environment Variables

```bash
vercel env pull .env.local
```

This downloads your database connection strings.

### 3. Run Migration

```bash
npm run migrate:postgres
```

The script will:
- Export your SQLite data
- Update Prisma schema
- Install dependencies
- Create PostgreSQL tables
- Import all data
- Verify success

### 4. Verify

```bash
# Check migration
npm run verify:migration

# View data
npm run db:studio

# Test app
npm run dev
```

### 5. Deploy

```bash
git add .
git commit -m "Migrate to PostgreSQL for Vercel"
git push
```

Vercel automatically deploys with PostgreSQL!

## Verification Checklist

After migration, verify:

- [ ] `npm run verify:migration` shows PostgreSQL ✅
- [ ] All data counts match your SQLite database
- [ ] `npm run dev` works locally
- [ ] Homepage loads
- [ ] Search works
- [ ] Filters work
- [ ] Tuition centre details load
- [ ] No errors in console

## Troubleshooting

### "Can't reach database server"
```bash
# Check your .env.local has POSTGRES_PRISMA_URL
cat .env.local | grep POSTGRES

# Re-pull if needed
vercel env pull .env.local
```

### "No data after migration"
```bash
# Re-run import (safe to run multiple times)
npm run db:import
```

### "Still using SQLite"
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Should start with postgresql://
# If not, check .env.local
```

## Rollback

If you need to rollback:

```bash
# Restore SQLite schema
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Regenerate Prisma Client
npx prisma generate

# Your dev.db is still intact
npm run dev
```

## Cost

**Vercel Postgres (Neon) Free Tier:**
- 0.5 GB storage
- 3 GB data transfer/month
- Shared compute
- Automatic backups
- Connection pooling

**Perfect for your app!** 🎉

## Support

### Need Help?

1. Check troubleshooting in `POSTGRES_MIGRATION_GUIDE.md`
2. Run `npm run verify:migration` for diagnostics
3. Check Vercel logs: https://vercel.com/dashboard
4. Verify DATABASE_URL is correct

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect | Check DATABASE_URL in .env.local |
| No data | Run `npm run db:import` |
| Still SQLite | Update DATABASE_URL to PostgreSQL |
| Tables missing | Run `npx prisma db push` |

## Next Steps

After successful migration:

1. ✅ Test thoroughly in production
2. ✅ Monitor Vercel logs for errors
3. ✅ Keep `dev.db` as backup (for now)
4. ✅ Update your README with new setup instructions
5. ✅ Celebrate! 🎉

## Benefits

✅ **Works on Vercel** - Serverless compatible  
✅ **Better performance** - Connection pooling  
✅ **More reliable** - ACID compliance  
✅ **Automatic backups** - Neon handles it  
✅ **Scales automatically** - No manual intervention  
✅ **Free tier** - Perfect for hobby projects  

## Questions?

- Full guide: `POSTGRES_MIGRATION_GUIDE.md`
- Visual flow: `MIGRATION_FLOW.md`
- Checklist: `MIGRATION_CHECKLIST.md`
- Vercel docs: https://vercel.com/docs/storage/vercel-postgres

---

**Ready to migrate?** Run: `npm run migrate:postgres` 🚀
