# Deployment Instructions for Production Server

## Package Contents

This deployment package contains everything needed to host the Podsee application on your own server.

## What's Included

- `.next/` - Production build files
- `public/` - Static assets (images, logos)
- `prisma/` - Database schema and migrations
- `node_modules/` - All dependencies (or package.json to install)
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variables template
- This deployment guide

## Server Requirements

### Minimum Requirements
- **Node.js**: v18.17.0 or higher
- **RAM**: 512 MB minimum, 1 GB recommended
- **Storage**: 500 MB minimum
- **Database**: PostgreSQL 12+ or SQLite (for testing)

### Recommended Hosting Options
- VPS (DigitalOcean, Linode, AWS EC2)
- Platform-as-a-Service (Railway, Render, Fly.io)
- Dedicated server
- Docker container

## Quick Start Deployment

### Option 1: With Node.js Directly

```bash
# 1. Extract the deployment package
unzip deployment-package.zip
cd deployment-package

# 2. Install dependencies (if not included)
npm install --production

# 3. Set up environment variables
cp .env.example .env
nano .env  # Edit with your database URL

# 4. Set up database
npx prisma generate
npx prisma migrate deploy

# 5. Start the application
npm start
```

The app will run on port 3001 by default.

### Option 2: With PM2 (Recommended for Production)

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Extract and setup (steps 1-4 from Option 1)

# 3. Start with PM2
pm2 start npm --name "podsee" -- start

# 4. Save PM2 configuration
pm2 save

# 5. Setup PM2 to start on boot
pm2 startup
```

### Option 3: With Docker

```bash
# Use the provided Dockerfile
docker build -t podsee-app .
docker run -p 3001:3001 --env-file .env podsee-app
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/podsee?schema=public"

# Or for SQLite (testing only)
# DATABASE_URL="file:./dev.db"

# Node Environment
NODE_ENV="production"

# Optional: Prisma
PRISMA_HIDE_UPDATE_MESSAGE="true"

# Optional: NextAuth (if using authentication)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Database Setup

### PostgreSQL (Recommended)

1. **Create Database**:
```sql
CREATE DATABASE podsee;
CREATE USER podsee_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE podsee TO podsee_user;
```

2. **Update .env**:
```env
DATABASE_URL="postgresql://podsee_user:your_password@localhost:5432/podsee?schema=public"
```

3. **Run Migrations**:
```bash
npx prisma migrate deploy
```

4. **Seed Data** (optional):
```bash
npm run seed
```

### SQLite (Testing Only)

SQLite is included for testing but NOT recommended for production.

```env
DATABASE_URL="file:./dev.db"
```

## Nginx Reverse Proxy Setup

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable HTTPS with Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Port Configuration

By default, the app runs on port 3001. To change:

**Option 1: Environment Variable**
```env
PORT=8080
```

**Option 2: Modify package.json**
```json
"start": "next start -p 8080"
```

## Health Check

Test if the application is running:

```bash
# Check if server is responding
curl http://localhost:3001

# Check API endpoint
curl http://localhost:3001/api/tuition-centres
```

## Monitoring & Logs

### With PM2
```bash
# View logs
pm2 logs podsee

# Monitor resources
pm2 monit

# Restart application
pm2 restart podsee

# Stop application
pm2 stop podsee
```

### With systemd
Create `/etc/systemd/system/podsee.service`:

```ini
[Unit]
Description=Podsee Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/podsee
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable podsee
sudo systemctl start podsee
sudo systemctl status podsee
```

## Performance Optimization

### 1. Enable Compression
Already enabled in Next.js build.

### 2. Use CDN for Static Assets
Configure your CDN to cache `/public/*` and `/_next/static/*`

### 3. Database Connection Pooling
For PostgreSQL, use connection pooling:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=10&pool_timeout=20"
```

### 4. Memory Limits
Set Node.js memory limits:
```bash
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

## Backup Strategy

### Database Backups

**PostgreSQL**:
```bash
# Backup
pg_dump -U podsee_user podsee > backup_$(date +%Y%m%d).sql

# Restore
psql -U podsee_user podsee < backup_20240205.sql
```

**Automated Daily Backups**:
```bash
# Add to crontab
0 2 * * * pg_dump -U podsee_user podsee > /backups/podsee_$(date +\%Y\%m\%d).sql
```

### Application Files
```bash
# Backup entire application
tar -czf podsee-backup-$(date +%Y%m%d).tar.gz /var/www/podsee
```

## Troubleshooting

### Application Won't Start

1. **Check Node.js version**:
```bash
node --version  # Should be v18.17.0+
```

2. **Check dependencies**:
```bash
npm install
```

3. **Check environment variables**:
```bash
cat .env
```

4. **Check database connection**:
```bash
npx prisma db pull
```

### Database Connection Errors

1. **Verify DATABASE_URL** is correct
2. **Check database is running**:
```bash
# PostgreSQL
sudo systemctl status postgresql

# Check connection
psql -U podsee_user -d podsee -h localhost
```

3. **Check firewall rules**:
```bash
sudo ufw status
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Out of Memory

Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## Security Checklist

- [ ] Use strong database passwords
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set up firewall (UFW, iptables)
- [ ] Keep Node.js and dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting (if needed)
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Monitor logs for suspicious activity

## Updating the Application

```bash
# 1. Stop the application
pm2 stop podsee

# 2. Backup current version
cp -r /var/www/podsee /var/www/podsee-backup

# 3. Extract new deployment package
unzip new-deployment-package.zip

# 4. Install dependencies
npm install --production

# 5. Run database migrations
npx prisma migrate deploy

# 6. Restart application
pm2 restart podsee
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple application instances
- Shared PostgreSQL database
- Redis for session storage

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Enable caching

## Support & Maintenance

### Regular Maintenance Tasks
- Weekly: Check logs for errors
- Monthly: Update dependencies
- Monthly: Review database performance
- Quarterly: Security audit

### Monitoring Recommendations
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- Log aggregation (Papertrail, Loggly)

## Contact

For deployment support or issues, contact your development team.

## Additional Resources

- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Production: https://www.prisma.io/docs/guides/deployment
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx Configuration: https://nginx.org/en/docs/
