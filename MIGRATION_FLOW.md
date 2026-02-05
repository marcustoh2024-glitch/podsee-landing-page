# PostgreSQL Migration Flow

## Current State (SQLite)
```
┌─────────────────────────────────────┐
│   Your App (Local Development)     │
│                                     │
│   Next.js + Prisma + SQLite        │
│                                     │
│   Database: dev.db (local file)    │
└─────────────────────────────────────┘
                  │
                  ▼
         ❌ Cannot deploy to Vercel
         (Vercel doesn't support SQLite)
```

## Target State (PostgreSQL)
```
┌─────────────────────────────────────┐
│   Your App (Local Development)     │
│                                     │
│   Next.js + Prisma + PostgreSQL    │
│           │                         │
│           ▼                         │
│   ┌─────────────────────┐          │
│   │ PostgreSQL Database │          │
│   │  (Vercel/Neon)      │          │
│   └─────────────────────┘          │
└─────────────────────────────────────┘
                  │
                  ▼
         ✅ Deploys to Vercel
         (Full PostgreSQL support)
```

## Migration Steps

```
Step 1: Create Vercel Postgres Database
┌──────────────────────────────────────┐
│  Vercel Dashboard                    │
│  → Storage → Create Database         │
│  → Select PostgreSQL (Neon)          │
└──────────────────────────────────────┘
                  │
                  ▼
Step 2: Get Environment Variables
┌──────────────────────────────────────┐
│  $ vercel env pull .env.local        │
│                                      │
│  Downloads:                          │
│  - POSTGRES_PRISMA_URL              │
│  - POSTGRES_URL                     │
│  - Other connection details         │
└──────────────────────────────────────┘
                  │
                  ▼
Step 3: Export SQLite Data
┌──────────────────────────────────────┐
│  $ npm run db:export                 │
│                                      │
│  Creates: data-export.json           │
│  Contains all your current data      │
└──────────────────────────────────────┘
                  │
                  ▼
Step 4: Update Prisma Schema
┌──────────────────────────────────────┐
│  Change: provider = "sqlite"         │
│  To:     provider = "postgresql"     │
│                                      │
│  (Automated by migration script)     │
└──────────────────────────────────────┘
                  │
                  ▼
Step 5: Create PostgreSQL Tables
┌──────────────────────────────────────┐
│  $ npx prisma db push                │
│                                      │
│  Creates all tables in PostgreSQL    │
└──────────────────────────────────────┘
                  │
                  ▼
Step 6: Import Data
┌──────────────────────────────────────┐
│  $ npm run db:import                 │
│                                      │
│  Imports data-export.json            │
│  → PostgreSQL database               │
└──────────────────────────────────────┘
                  │
                  ▼
Step 7: Verify & Test
┌──────────────────────────────────────┐
│  $ npm run verify:migration          │
│  $ npm run dev                       │
│                                      │
│  Test all functionality locally      │
└──────────────────────────────────────┘
                  │
                  ▼
Step 8: Deploy
┌──────────────────────────────────────┐
│  $ git push                          │
│                                      │
│  Vercel automatically deploys        │
│  with PostgreSQL database            │
└──────────────────────────────────────┘
```

## Data Flow

### Before Migration
```
┌──────────────┐
│   dev.db     │  ← SQLite file (local only)
│  (SQLite)    │
└──────────────┘
       │
       ▼
┌──────────────┐
│  Your App    │
└──────────────┘
```

### During Migration
```
┌──────────────┐
│   dev.db     │  ← Original data (preserved)
│  (SQLite)    │
└──────────────┘
       │
       │ Export
       ▼
┌──────────────────┐
│ data-export.json │  ← Temporary backup
└──────────────────┘
       │
       │ Import
       ▼
┌──────────────────┐
│   PostgreSQL     │  ← New database (cloud)
│  (Vercel/Neon)   │
└──────────────────┘
       │
       ▼
┌──────────────┐
│  Your App    │
└──────────────┘
```

### After Migration
```
┌──────────────────┐
│   PostgreSQL     │  ← Production database
│  (Vercel/Neon)   │
└──────────────────┘
       │
       ▼
┌──────────────┐
│  Your App    │  ← Works locally & on Vercel
└──────────────┘

┌──────────────┐
│   dev.db     │  ← Kept as backup
│  (SQLite)    │
└──────────────┘
```

## Automated vs Manual

### Automated (Recommended)
```bash
npm run migrate:postgres
```
One command does everything!

### Manual (Step by Step)
```bash
npm run db:export              # Export data
cp prisma/schema.postgres.prisma prisma/schema.prisma  # Update schema
npm install pg                 # Install PostgreSQL driver
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Create tables
npm run db:import              # Import data
npm run verify:migration       # Verify
```

## Rollback Plan

If something goes wrong:

```
┌──────────────────────┐
│ Restore SQLite       │
│ schema.prisma        │
└──────────────────────┘
          │
          ▼
┌──────────────────────┐
│ npx prisma generate  │
└──────────────────────┘
          │
          ▼
┌──────────────────────┐
│ Back to SQLite       │
│ (dev.db intact)      │
└──────────────────────┘
```

## Environment Variables

### Local Development
```
.env.local (from Vercel)
├── POSTGRES_PRISMA_URL  ← Use this for DATABASE_URL
├── POSTGRES_URL
├── POSTGRES_HOST
├── POSTGRES_USER
├── POSTGRES_PASSWORD
└── POSTGRES_DATABASE
```

### Vercel Production
```
Automatically set when you create
the Postgres database in Vercel
```

## Key Points

✅ **No code changes needed** - Only database provider changes  
✅ **No schema changes needed** - Same models work with PostgreSQL  
✅ **SQLite backup preserved** - dev.db stays intact  
✅ **Safe to re-run** - Import uses upsert (idempotent)  
✅ **Free tier available** - 0.5 GB storage on Neon  
✅ **Automatic backups** - Neon handles backups  
✅ **Connection pooling** - Built into POSTGRES_PRISMA_URL  

## Timeline

- **Setup Vercel DB**: 2 minutes
- **Run migration**: 2 minutes  
- **Test locally**: 1 minute
- **Deploy**: 2 minutes

**Total: ~7 minutes** ⚡
