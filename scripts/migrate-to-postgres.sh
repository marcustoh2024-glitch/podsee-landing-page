#!/bin/bash

echo "🚀 PostgreSQL Migration Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists (from vercel env pull)
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Run: vercel env pull .env.local"
    echo ""
    read -p "Have you created a Vercel Postgres database? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please create a Vercel Postgres database first:"
        echo "1. Go to https://vercel.com/dashboard"
        echo "2. Select your project"
        echo "3. Go to Storage tab"
        echo "4. Create a Postgres database"
        exit 1
    fi
    
    echo "Run this command to get your environment variables:"
    echo "  vercel env pull .env.local"
    exit 1
fi

echo -e "${GREEN}✅ Found .env.local${NC}"
echo ""

# Step 1: Export SQLite data
echo "📦 Step 1: Exporting SQLite data..."
node scripts/export-sqlite-data.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Export failed${NC}"
    exit 1
fi
echo ""

# Step 2: Backup current schema
echo "💾 Step 2: Backing up current schema..."
cp prisma/schema.prisma prisma/schema.sqlite.prisma
echo -e "${GREEN}✅ Backup created: prisma/schema.sqlite.prisma${NC}"
echo ""

# Step 3: Switch to PostgreSQL schema
echo "🔄 Step 3: Switching to PostgreSQL schema..."
cp prisma/schema.postgres.prisma prisma/schema.prisma
echo -e "${GREEN}✅ Schema updated${NC}"
echo ""

# Step 4: Install dependencies
echo "📦 Step 4: Installing PostgreSQL dependencies..."
npm install pg
echo ""

# Step 5: Generate Prisma Client
echo "🔧 Step 5: Generating Prisma Client..."
npx prisma generate
echo ""

# Step 6: Push schema to database
echo "🗄️  Step 6: Creating database tables..."
echo "Using DATABASE_URL from .env.local"
npx prisma db push --skip-generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database push failed${NC}"
    echo "Check your DATABASE_URL in .env.local"
    exit 1
fi
echo ""

# Step 7: Import data
echo "📥 Step 7: Importing data to PostgreSQL..."
node scripts/import-to-postgres.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Import failed${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Verify data: npx prisma studio"
echo "3. Deploy: git add . && git commit -m 'Migrate to PostgreSQL' && git push"
echo ""
echo "Rollback (if needed):"
echo "  cp prisma/schema.sqlite.prisma prisma/schema.prisma"
echo "  npx prisma generate"
