# Prisma Database Setup

## Overview

This directory contains the Prisma schema and configuration for the Tuition Search Backend.

## Database Configuration

### Development (SQLite)
The default configuration uses SQLite for local development:
- Database file: `prisma/dev.db`
- Configuration: `prisma/schema.prisma` with `provider = "sqlite"`

### Production (PostgreSQL)
For production deployment:
1. Copy `prisma/schema.production.prisma` to `prisma/schema.prisma`
2. Update `.env` with PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   ```

## Schema Overview

The database schema includes:

### Models
- **TuitionCentre**: Stores tuition centre information (name, location, contact details)
- **Level**: Educational levels (Primary, Secondary, JC, etc.)
- **Subject**: Academic subjects (Mathematics, Science, English, etc.)
- **TuitionCentreLevel**: Many-to-many join table for centres and levels
- **TuitionCentreSubject**: Many-to-many join table for centres and subjects

### Indexes
- `name` field on TuitionCentre (for search optimization)
- `location` field on TuitionCentre (for search optimization)

## Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Create Migration
```bash
npx prisma migrate dev --name init
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Seed Database
```bash
npx prisma db seed
```

### Reset Database
```bash
npx prisma migrate reset
```

### Open Prisma Studio
```bash
npx prisma studio
```

## Requirements Validation

This schema satisfies the following requirements:
- 1.1: Stores tuition centre name (required text field)
- 1.2: Stores location information (required text field)
- 1.3: Stores WhatsApp contact number (required text field)
- 1.4: Stores website URL (optional text field)
- 1.5: Stores multiple educational levels per tuition centre
- 1.6: Stores multiple subjects per tuition centre
- 1.7: Maintains referential integrity with foreign keys and cascade deletes
