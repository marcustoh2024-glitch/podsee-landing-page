# PostgreSQL Migration Checklist

Use this checklist to track your migration progress.

## Pre-Migration

- [ ] Read `POSTGRES_MIGRATION_GUIDE.md`
- [ ] Commit all current changes to git
- [ ] Ensure local app is working with SQLite

## Vercel Setup

- [ ] Go to Vercel Dashboard
- [ ] Navigate to your project → Storage tab
- [ ] Create new Postgres database (powered by Neon)
- [ ] Note the database region you selected
- [ ] Verify environment variables were added to Vercel

## Local Setup

- [ ] Install Vercel CLI: `npm i -g vercel@latest`
- [ ] Pull environment variables: `vercel env pull .env.local`
- [ ] Verify `.env.local` contains `POSTGRES_PRISMA_URL`

## Migration (Option A: Automated)

- [ ] Run: `./scripts/migrate-to-postgres.sh`
- [ ] Follow the script prompts
- [ ] Verify no errors in output

## Migration (Option B: Manual)

- [ ] Export SQLite data: `node scripts/export-sqlite-data.js`
- [ ] Backup schema: `cp prisma/schema.prisma prisma/schema.sqlite.prisma`
- [ ] Update schema: `cp prisma/schema.postgres.prisma prisma/schema.prisma`
- [ ] Install pg: `npm install pg`
- [ ] Generate client: `npx prisma generate`
- [ ] Push schema: `npx prisma db push`
- [ ] Import data: `node scripts/import-to-postgres.js`

## Verification

- [ ] Open Prisma Studio: `npx prisma studio`
- [ ] Verify tuition centres exist
- [ ] Verify levels and subjects exist
- [ ] Verify offerings exist
- [ ] Verify users exist (if any)
- [ ] Check discussion threads and comments

## Local Testing

- [ ] Start dev server: `npm run dev`
- [ ] Test homepage loads
- [ ] Test search functionality
- [ ] Test filters (levels, subjects, locations)
- [ ] Test tuition centre details page
- [ ] Test user authentication (if applicable)
- [ ] Test discussion/comments (if applicable)

## Update Environment Variables

- [ ] Update `.env` to use PostgreSQL URL
- [ ] Add `.env.local` to `.gitignore` (should already be there)
- [ ] Verify Vercel project has correct DATABASE_URL

## Deployment

- [ ] Commit changes: `git add .`
- [ ] Commit: `git commit -m "Migrate to PostgreSQL for Vercel deployment"`
- [ ] Push: `git push`
- [ ] Wait for Vercel deployment
- [ ] Check deployment logs for errors

## Post-Deployment Testing

- [ ] Visit production URL
- [ ] Test homepage loads
- [ ] Test search functionality
- [ ] Test filters work correctly
- [ ] Test tuition centre details
- [ ] Test API endpoints
- [ ] Check Vercel logs for any errors

## Cleanup (Optional)

- [ ] Remove `data-export.json` (keep as backup for now)
- [ ] Keep `prisma/schema.sqlite.prisma` as backup
- [ ] Keep `dev.db` as local backup
- [ ] Document the migration in your README

## Rollback (If Needed)

If something goes wrong:

- [ ] Restore SQLite schema: `cp prisma/schema.sqlite.prisma prisma/schema.prisma`
- [ ] Regenerate client: `npx prisma generate`
- [ ] Restart dev server
- [ ] Your SQLite data is still in `dev.db`

## Success Criteria

✅ All data migrated successfully  
✅ Local development works with PostgreSQL  
✅ Vercel deployment successful  
✅ Production app fully functional  
✅ No errors in Vercel logs  

## Notes

- SQLite database (`dev.db`) remains as backup
- Migration scripts use `upsert` - safe to re-run
- Vercel Postgres uses Neon (serverless PostgreSQL)
- Free tier: 0.5 GB storage, 3 GB transfer
- Connection pooling handled automatically

## Support

If you encounter issues:
1. Check `POSTGRES_MIGRATION_GUIDE.md` troubleshooting section
2. Verify DATABASE_URL is correct
3. Check Vercel function logs
4. Ensure using POSTGRES_PRISMA_URL (not POSTGRES_URL)
