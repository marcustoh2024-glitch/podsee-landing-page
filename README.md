# Podsee - Mobile Web Experience

A calm, parent-first tuition discovery website for Singapore.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see [Environment Variables](#environment-variables))

3. Set up the database (see [Database Setup](#database-setup))

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TailwindCSS 3
- Prisma ORM
- PostgreSQL (production) / SQLite (development)
- CSS animations (GPU-optimized)

## Project Structure

- `/src/app` - Next.js app router pages and layouts
  - `/src/app/api` - API route handlers
- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and services
  - `/src/lib/services` - Business logic layer
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Development (SQLite)

```env
# Database
DATABASE_URL="file:./dev.db"

# Node Environment
NODE_ENV="development"
```

### Production (PostgreSQL)

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Node Environment
NODE_ENV="production"
```

### Optional Variables

```env
# Prisma
PRISMA_HIDE_UPDATE_MESSAGE="true"
```

See `.env.example` for a template.

## Database Setup

### Initial Setup

1. **Generate Prisma Client**:
```bash
npx prisma generate
```

2. **Run Migrations**:
```bash
# Development (SQLite)
npx prisma migrate dev

# Production (PostgreSQL)
npx prisma migrate deploy
```

3. **Seed the Database** (optional):
```bash
npm run seed
```

### Common Database Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## API Documentation

The backend provides RESTful API endpoints for searching and filtering tuition centres.

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Endpoints

#### 1. Search and Filter Tuition Centres

**GET** `/api/tuition-centres`

Search and filter tuition centres by name, location, educational level, and subject.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `search` | string | No | Search term for name or location (case-insensitive) | `?search=tampines` |
| `levels` | string | No | Comma-separated level names or IDs | `?levels=Primary,Secondary` |
| `subjects` | string | No | Comma-separated subject names or IDs | `?subjects=Mathematics,Science` |
| `page` | number | No | Page number for pagination (default: 1) | `?page=2` |
| `limit` | number | No | Results per page (default: 20, max: 100) | `?limit=50` |

**Example Requests:**

```bash
# Search by name or location
GET /api/tuition-centres?search=tampines

# Filter by educational level
GET /api/tuition-centres?levels=Primary,Secondary

# Filter by subject
GET /api/tuition-centres?subjects=Mathematics

# Combined search and filters
GET /api/tuition-centres?search=learning&levels=Primary&subjects=Mathematics,Science

# With pagination
GET /api/tuition-centres?search=centre&page=2&limit=10
```

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "ABC Learning Centre",
      "location": "Tampines",
      "whatsappNumber": "+6591234567",
      "whatsappLink": "https://wa.me/6591234567",
      "website": "https://abclearning.com",
      "levels": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440000",
          "name": "Primary"
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440000",
          "name": "Secondary"
        }
      ],
      "subjects": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440000",
          "name": "Mathematics"
        },
        {
          "id": "990e8400-e29b-41d4-a716-446655440000",
          "name": "Science"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid parameters
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Page must be greater than 0"
  }
}

// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

#### 2. Get Tuition Centre by ID

**GET** `/api/tuition-centres/:id`

Retrieve detailed information about a specific tuition centre.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Tuition centre ID |

**Example Request:**

```bash
GET /api/tuition-centres/550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Learning Centre",
  "location": "Tampines",
  "whatsappNumber": "+6591234567",
  "whatsappLink": "https://wa.me/6591234567",
  "website": "https://abclearning.com",
  "levels": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Primary"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Secondary"
    }
  ],
  "subjects": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "name": "Mathematics"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "name": "Science"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Tuition centre not found"
  }
}

// 400 Bad Request - Invalid ID format
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid tuition centre ID format"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Tuition centre name |
| `location` | string | Location/area in Singapore |
| `whatsappNumber` | string | WhatsApp contact number with country code |
| `whatsappLink` | string | Direct WhatsApp chat link |
| `website` | string \| null | Centre website URL (null if not available) |
| `levels` | array | Educational levels offered |
| `subjects` | array | Subjects taught |
| `createdAt` | string | ISO 8601 timestamp (only in detail view) |
| `updatedAt` | string | ISO 8601 timestamp (only in detail view) |

### Filter Logic

- **Search**: Matches centres where the search term appears in either the name OR location (case-insensitive)
- **Levels**: Returns centres offering ANY of the specified levels (OR logic)
- **Subjects**: Returns centres offering ANY of the specified subjects (OR logic)
- **Combined**: When multiple filter types are used, centres must match ALL filter types (AND logic between types)

**Example:**
```
?search=tampines&levels=Primary&subjects=Mathematics,Science
```
Returns centres that:
- Have "tampines" in name OR location, AND
- Offer Primary level, AND
- Offer Mathematics OR Science

## Testing

### Run All Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Property-Based Tests**: Test universal properties with randomized inputs (100+ iterations)
- **Integration Tests**: Test full API flows with real database

### Property-Based Testing

This project uses property-based testing to verify correctness properties. Each property test:
- Runs a minimum of 100 iterations with randomized inputs
- Validates universal properties that should hold for all inputs
- Is tagged with the feature and property number from the design document

## Deployment

### Vercel (Recommended)

#### PostgreSQL Migration Required

⚠️ **Important**: Vercel doesn't support SQLite. You must migrate to PostgreSQL before deploying.

**Quick Migration (5 minutes):**

```bash
# 1. Create Vercel Postgres database (via dashboard)
# 2. Pull environment variables
vercel env pull .env.local

# 3. Run automated migration
npm run migrate:postgres

# 4. Test locally
npm run dev

# 5. Deploy
git push
```

📚 **Full Documentation**: See `START_HERE.md` for complete migration guide.

#### Deployment Steps

1. Migrate to PostgreSQL (see above)
2. Push your code to GitHub
3. Import project in Vercel
4. Vercel automatically creates environment variables when you add Postgres storage
5. Deploy

Vercel will automatically:
- Install dependencies
- Run Prisma generate
- Run migrations
- Build the Next.js application

### Manual Deployment

1. Set environment variables
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma migrate deploy`
5. Build application: `npm run build`
6. Start server: `npm start`

## Development Workflow

1. Make changes to code
2. Run tests: `npm test`
3. Check for type errors: `npx prisma validate`
4. Commit changes
5. Push to repository

## Troubleshooting

### Database Connection Issues

```bash
# Check if database file exists (SQLite)
ls -la dev.db

# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Prisma Client Not Found

```bash
# Generate Prisma client
npx prisma generate
```

### Migration Errors

```bash
# Check migration status
npx prisma migrate status

# Resolve migration issues
npx prisma migrate resolve

# Reset and start fresh (WARNING: deletes all data)
npx prisma migrate reset
```

## Stage 1 Complete

✅ Next.js + TailwindCSS setup
✅ Responsive layout (mobile-first)
✅ Header component (centered, clean)
✅ Background drift animation (respects reduced-motion)
✅ Placeholder components for Stage 2

## Stage 2 Complete

✅ Backend API with search and filtering
✅ Database schema with Prisma ORM
✅ Property-based testing implementation
✅ Comprehensive test coverage
✅ API documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

Private project - All rights reserved
