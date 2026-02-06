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
