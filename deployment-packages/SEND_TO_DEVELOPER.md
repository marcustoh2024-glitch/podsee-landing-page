# For Your Developer - Quick Deployment Guide

## Package Information

**File**: `podsee-deployment-XXXXXXXX_XXXXXX.tar.gz`  
**Size**: ~49 MB (without node_modules)  
**Application**: Podsee - Tuition Centre Discovery Platform  
**Framework**: Next.js 14 (React)  

## What's Inside

This is a production-ready Next.js application with:
- Pre-built optimized code (`.next/` folder)
- Database schema (Prisma ORM)
- All configuration files
- Complete deployment documentation

## Quick Deployment (5 minutes)

### Prerequisites
- Node.js v18.17.0 or higher
- PostgreSQL 12+ (or SQLite for testing)
- 512 MB RAM minimum

### Steps

```bash
# 1. Extract package
tar -xzf podsee-deployment-*.tar.gz
cd podsee-deployment-*

# 2. Install dependencies
npm install --production

# 3. Configure environment
cp .env.example .env
nano .env  # Add your DATABASE_URL

# 4. Setup database
npx prisma generate
npx prisma migrate deploy

# 5. Start application
npm start
```

Application will run on **http://localhost:3001**

## Deployment Options

### Option 1: PM2 (Recommended)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 2: Docker
```bash
docker-compose up -d
```

### Option 3: Systemd Service
See `DEPLOYMENT_INSTRUCTIONS.md` for systemd configuration.

## Environment Variables Required

```env
DATABASE_URL="postgresql://user:password@localhost:5432/podsee?schema=public"
NODE_ENV="production"
PORT=3001
```

## Database Setup

### PostgreSQL (Production)
```sql
CREATE DATABASE podsee;
CREATE USER podsee_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE podsee TO podsee_user;
```

Then update `.env`:
```env
DATABASE_URL="postgresql://podsee_user:secure_password@localhost:5432/podsee?schema=public"
```

### SQLite (Testing Only)
```env
DATABASE_URL="file:./dev.db"
```

## Nginx Reverse Proxy

Use the included `nginx.conf` file:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/podsee
sudo ln -s /etc/nginx/sites-available/podsee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/HTTPS Setup

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Health Check

```bash
# Check if running
curl http://localhost:3001

# Check API
curl http://localhost:3001/api/tuition-centres
```

## Troubleshooting

### Port 3001 already in use
```bash
lsof -i :3001
kill -9 <PID>
```

### Database connection failed
- Verify DATABASE_URL in `.env`
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql -U podsee_user -d podsee`

### Application crashes
```bash
# Check logs
pm2 logs podsee

# Or if using npm directly
npm start 2>&1 | tee app.log
```

## Performance Tips

1. **Use PM2** for process management and auto-restart
2. **Enable Nginx** for reverse proxy and caching
3. **Setup SSL** with Let's Encrypt (free)
4. **Database pooling** - add to DATABASE_URL:
   ```
   ?connection_limit=10&pool_timeout=20
   ```
5. **Monitor resources** with `pm2 monit`

## Scaling

- **Vertical**: Increase server RAM/CPU
- **Horizontal**: Use load balancer + multiple instances
- **Database**: Use managed PostgreSQL (AWS RDS, DigitalOcean)

## Backup

### Database
```bash
# Backup
pg_dump -U podsee_user podsee > backup.sql

# Restore
psql -U podsee_user podsee < backup.sql
```

### Application
```bash
tar -czf podsee-backup-$(date +%Y%m%d).tar.gz /path/to/podsee
```

## Monitoring Recommendations

- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Performance**: New Relic, DataDog
- **Logs**: Papertrail, Loggly

## Security Checklist

- [ ] Strong database password
- [ ] HTTPS enabled (SSL certificate)
- [ ] Firewall configured (UFW/iptables)
- [ ] Regular backups scheduled
- [ ] Keep Node.js updated
- [ ] Environment variables secured
- [ ] Nginx security headers enabled

## Support

For detailed instructions, see **DEPLOYMENT_INSTRUCTIONS.md** included in the package.

## Application Details

- **Port**: 3001 (configurable)
- **Database**: PostgreSQL (recommended) or SQLite (testing)
- **Memory**: ~200-500 MB typical usage
- **CPU**: Low usage, scales with traffic
- **Storage**: ~500 MB for application + database

## Common Hosting Providers

Works great on:
- DigitalOcean Droplets ($6/month)
- AWS EC2 (t3.micro free tier)
- Linode ($5/month)
- Railway (free tier available)
- Render (free tier available)
- Fly.io (free tier available)

## Questions?

Refer to `DEPLOYMENT_INSTRUCTIONS.md` for comprehensive documentation covering:
- Detailed setup steps
- Multiple deployment methods
- Database configuration
- Nginx setup
- Docker deployment
- PM2 configuration
- Troubleshooting guide
- Security best practices
- Monitoring setup
- Backup strategies

---

**Ready to deploy!** Extract the package and follow the quick steps above. 🚀
