#!/bin/bash

echo "🚀 Creating Deployment Package for Podsee"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Package name with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="podsee-deployment-${TIMESTAMP}"
PACKAGE_DIR="deployment-packages/${PACKAGE_NAME}"

# Create package directory
echo "📦 Creating package directory..."
mkdir -p "${PACKAGE_DIR}"

# Copy necessary files
echo "📋 Copying application files..."

# Copy build files
echo "  - Copying .next build..."
cp -r .next "${PACKAGE_DIR}/"

# Copy source files (needed for some runtime features)
echo "  - Copying public assets..."
cp -r public "${PACKAGE_DIR}/"

# Copy Prisma files
echo "  - Copying Prisma schema..."
mkdir -p "${PACKAGE_DIR}/prisma"
cp -r prisma/schema.prisma "${PACKAGE_DIR}/prisma/"
cp -r prisma/migrations "${PACKAGE_DIR}/prisma/" 2>/dev/null || echo "  (No migrations to copy)"

# Copy configuration files
echo "  - Copying configuration files..."
cp package.json "${PACKAGE_DIR}/"
cp package-lock.json "${PACKAGE_DIR}/" 2>/dev/null || echo "  (No package-lock.json)"
cp next.config.js "${PACKAGE_DIR}/"
cp postcss.config.js "${PACKAGE_DIR}/" 2>/dev/null
cp tailwind.config.js "${PACKAGE_DIR}/" 2>/dev/null
cp jsconfig.json "${PACKAGE_DIR}/" 2>/dev/null

# Copy deployment files
echo "  - Copying deployment configuration..."
cp deployment-package/DEPLOYMENT_INSTRUCTIONS.md "${PACKAGE_DIR}/"
cp deployment-package/Dockerfile "${PACKAGE_DIR}/"
cp deployment-package/docker-compose.yml "${PACKAGE_DIR}/"
cp deployment-package/.env.example "${PACKAGE_DIR}/"
cp deployment-package/ecosystem.config.js "${PACKAGE_DIR}/"
cp deployment-package/nginx.conf "${PACKAGE_DIR}/"

# Create logs directory
mkdir -p "${PACKAGE_DIR}/logs"

# Create README
cat > "${PACKAGE_DIR}/README.md" << 'EOF'
# Podsee Deployment Package

This package contains everything needed to deploy the Podsee application.

## Quick Start

1. Extract this package on your server
2. Read `DEPLOYMENT_INSTRUCTIONS.md` for detailed setup
3. Install dependencies: `npm install --production`
4. Configure `.env` file with your database
5. Run migrations: `npx prisma migrate deploy`
6. Start the app: `npm start`

## What's Included

- `.next/` - Production build
- `public/` - Static assets
- `prisma/` - Database schema and migrations
- `package.json` - Dependencies
- `Dockerfile` - Docker configuration
- `docker-compose.yml` - Docker Compose setup
- `ecosystem.config.js` - PM2 configuration
- `nginx.conf` - Nginx reverse proxy config
- `DEPLOYMENT_INSTRUCTIONS.md` - Complete deployment guide

## Support

For deployment assistance, refer to DEPLOYMENT_INSTRUCTIONS.md or contact your development team.
EOF

# Option to include node_modules (makes package larger but easier to deploy)
echo ""
read -p "Include node_modules? (makes package larger but easier to deploy) [y/N]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  - Copying node_modules (this may take a while)..."
    cp -r node_modules "${PACKAGE_DIR}/"
else
    echo "  - Skipping node_modules (will need to run npm install on server)"
fi

# Create archive
echo ""
echo "📦 Creating compressed archive..."
cd deployment-packages
tar -czf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}"
ZIP_SIZE=$(du -h "${PACKAGE_NAME}.tar.gz" | cut -f1)

echo ""
echo -e "${GREEN}✅ Deployment package created successfully!${NC}"
echo ""
echo "📦 Package Details:"
echo "  - Name: ${PACKAGE_NAME}.tar.gz"
echo "  - Size: ${ZIP_SIZE}"
echo "  - Location: deployment-packages/${PACKAGE_NAME}.tar.gz"
echo ""
echo "📋 Next Steps:"
echo "  1. Send deployment-packages/${PACKAGE_NAME}.tar.gz to your developer"
echo "  2. They should extract it on the server"
echo "  3. Follow instructions in DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo -e "${YELLOW}Note: Make sure to configure the .env file with production database credentials${NC}"
echo ""
