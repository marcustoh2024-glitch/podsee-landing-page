# Design Document: Tuition Search Backend

## Overview

This design outlines a backend API and database system for searching and filtering tuition centres. The system will be built using Next.js 14 App Router API routes with Prisma ORM and PostgreSQL database. The architecture follows a Backend-for-Frontend pattern, providing RESTful endpoints for tuition centre search, filtering, and retrieval operations.

The system stores tuition centre information including contact details, location, and educational offerings, and provides efficient search and filtering capabilities through indexed database queries.

## Architecture

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma
- **API Pattern**: RESTful API using Next.js Route Handlers
- **Deployment**: Vercel (or similar serverless platform)

### System Components

```
┌─────────────────┐
│   Frontend      │
│  (React/Next)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  API Routes     │
│  (Route         │
│   Handlers)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Layer  │
│  (Business      │
│   Logic)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma Client  │
│  (ORM)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  Database       │
└─────────────────┘
```

### Directory Structure

```
src/
├── app/
│   └── api/
│       └── tuition-centres/
│           ├── route.js          # GET /api/tuition-centres (search & filter)
│           └── [id]/
│               └── route.js      # GET /api/tuition-centres/:id
├── lib/
│   ├── prisma.js                 # Prisma client singleton
│   └── services/
│       └── tuitionCentreService.js  # Business logic
└── prisma/
    ├── schema.prisma             # Database schema
    └── seed.js                   # Seed data
```

## Components and Interfaces

### Database Schema

The database uses a relational model with three main tables:

**TuitionCentre Table**
- `id`: String (UUID, primary key)
- `name`: String (required, indexed)
- `location`: String (required, indexed)
- `whatsappNumber`: String (required)
- `website`: String (optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Level Table**
- `id`: String (UUID, primary key)
- `name`: String (required, unique) - e.g., "Primary", "Secondary", "Junior College"
- `createdAt`: DateTime

**Subject Table**
- `id`: String (UUID, primary key)
- `name`: String (required, unique) - e.g., "Mathematics", "Science", "English"
- `createdAt`: DateTime

**Many-to-Many Relationships**
- `TuitionCentre` ↔ `Level` (via `TuitionCentreLevels` join table)
- `TuitionCentre` ↔ `Subject` (via `TuitionCentreSubjects` join table)

### Prisma Schema

```prisma
model TuitionCentre {
  id              String   @id @default(uuid())
  name            String
  location        String
  whatsappNumber  String
  website         String?
  levels          TuitionCentreLevel[]
  subjects        TuitionCentreSubject[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([name])
  @@index([location])
}

model Level {
  id              String   @id @default(uuid())
  name            String   @unique
  tuitionCentres  TuitionCentreLevel[]
  createdAt       DateTime @default(now())
}

model Subject {
  id              String   @id @default(uuid())
  name            String   @unique
  tuitionCentres  TuitionCentreSubject[]
  createdAt       DateTime @default(now())
}

model TuitionCentreLevel {
  tuitionCentreId String
  levelId         String
  tuitionCentre   TuitionCentre @relation(fields: [tuitionCentreId], references: [id], onDelete: Cascade)
  level           Level         @relation(fields: [levelId], references: [id], onDelete: Cascade)

  @@id([tuitionCentreId, levelId])
}

model TuitionCentreSubject {
  tuitionCentreId String
  subjectId       String
  tuitionCentre   TuitionCentre @relation(fields: [tuitionCentreId], references: [id], onDelete: Cascade)
  subject         Subject       @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@id([tuitionCentreId, subjectId])
}
```

### API Endpoints

#### 1. Search and Filter Tuition Centres

**Endpoint**: `GET /api/tuition-centres`

**Query Parameters**:
- `search` (optional): String - Search term for name or location
- `levels` (optional): String - Comma-separated level IDs or names
- `subjects` (optional): String - Comma-separated subject IDs or names
- `page` (optional): Number - Page number for pagination (default: 1)
- `limit` (optional): Number - Results per page (default: 20, max: 100)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "ABC Learning Centre",
      "location": "Tampines",
      "whatsappNumber": "+6591234567",
      "whatsappLink": "https://wa.me/6591234567",
      "website": "https://abclearning.com",
      "levels": [
        { "id": "uuid", "name": "Primary" },
        { "id": "uuid", "name": "Secondary" }
      ],
      "subjects": [
        { "id": "uuid", "name": "Mathematics" },
        { "id": "uuid", "name": "Science" }
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

**Error Responses**:
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Database or server error

#### 2. Get Tuition Centre by ID

**Endpoint**: `GET /api/tuition-centres/:id`

**Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "ABC Learning Centre",
  "location": "Tampines",
  "whatsappNumber": "+6591234567",
  "whatsappLink": "https://wa.me/6591234567",
  "website": "https://abclearning.com",
  "levels": [
    { "id": "uuid", "name": "Primary" },
    { "id": "uuid", "name": "Secondary" }
  ],
  "subjects": [
    { "id": "uuid", "name": "Mathematics" },
    { "id": "uuid", "name": "Science" }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Tuition centre not found
- `500 Internal Server Error`: Database or server error

### Service Layer

The service layer encapsulates business logic and database operations:

**TuitionCentreService**

```javascript
class TuitionCentreService {
  // Search and filter tuition centres
  async searchTuitionCentres(filters) {
    // Build Prisma query with where clauses
    // Apply search on name and location
    // Filter by levels (OR logic)
    // Filter by subjects (OR logic)
    // Include related levels and subjects
    // Apply pagination
    // Return formatted results with WhatsApp links
  }

  // Get tuition centre by ID
  async getTuitionCentreById(id) {
    // Query by ID with includes
    // Format WhatsApp link
    // Return result or throw not found error
  }

  // Helper: Format WhatsApp link
  formatWhatsAppLink(phoneNumber) {
    // Strip non-digit characters except +
    // Return wa.me link
  }

  // Helper: Build search filter
  buildSearchFilter(searchTerm) {
    // Return OR condition for name and location
    // Case-insensitive matching
  }

  // Helper: Build level filter
  buildLevelFilter(levelIds) {
    // Return filter for levels relationship
  }

  // Helper: Build subject filter
  buildSubjectFilter(subjectIds) {
    // Return filter for subjects relationship
  }
}
```

## Data Models

### TuitionCentre Model

```typescript
interface TuitionCentre {
  id: string;
  name: string;
  location: string;
  whatsappNumber: string;
  website: string | null;
  levels: Level[];
  subjects: Subject[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Level Model

```typescript
interface Level {
  id: string;
  name: string;
  createdAt: Date;
}
```

### Subject Model

```typescript
interface Subject {
  id: string;
  name: string;
  createdAt: Date;
}
```

### API Response Models

```typescript
interface SearchResponse {
  data: TuitionCentreWithLinks[];
  pagination: PaginationInfo;
}

interface TuitionCentreWithLinks extends TuitionCentre {
  whatsappLink: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Search returns matching centres

*For any* search query string, all returned tuition centres should have either their name or location containing the search term (case-insensitive).

**Validates: Requirements 2.1, 2.3**

### Property 2: Empty search returns all centres

*For any* database state, when no search query is provided, the API should return all tuition centres (subject to pagination limits).

**Validates: Requirements 2.2**

### Property 3: Level filter returns only matching centres

*For any* set of level IDs, all returned tuition centres should offer at least one of the specified levels.

**Validates: Requirements 3.1, 3.2**

### Property 4: Subject filter returns only matching centres

*For any* set of subject IDs, all returned tuition centres should offer at least one of the specified subjects.

**Validates: Requirements 4.1, 4.2**

### Property 5: Combined filters use AND logic between types

*For any* combination of search query, level filters, and subject filters, all returned centres should match ALL filter types simultaneously (search AND levels AND subjects).

**Validates: Requirements 5.1, 5.2**

### Property 6: WhatsApp link format is valid

*For any* tuition centre with a WhatsApp number, the generated WhatsApp link should follow the format `https://wa.me/{digits_only}` where digits_only contains only numeric characters.

**Validates: Requirements 7.1, 7.2, 7.4**

### Property 7: Website URL validation

*For any* tuition centre with a website field, if the website is not null, it should start with either "http://" or "https://".

**Validates: Requirements 8.2**

### Property 8: Pagination consistency

*For any* valid page number and limit, the number of returned results should not exceed the specified limit, and the pagination metadata should accurately reflect the total count and page information.

**Validates: Requirements 2.4**

### Property 9: ID lookup returns single or none

*For any* tuition centre ID, querying by that ID should return either exactly one matching centre or a 404 error, never multiple centres.

**Validates: Requirements 6.1, 6.3**

### Property 10: Required fields are always present

*For any* tuition centre returned by the API, the fields name, location, and whatsappNumber should always be non-null and non-empty strings.

**Validates: Requirements 1.1, 1.2, 1.3, 10.1**

### Property 11: Filter with no matches returns empty array

*For any* filter combination that matches no centres, the API should return an empty data array with pagination total of 0, not an error.

**Validates: Requirements 2.5, 5.4**

### Property 12: Phone number sanitization

*For any* phone number stored in the database, it should contain only digits and optionally a leading '+' character, with all formatting characters removed.

**Validates: Requirements 7.4, 10.2**

## Error Handling

### Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional context
  }
}
```

### Error Scenarios

1. **Validation Errors (400)**
   - Invalid query parameters (negative page, limit > 100)
   - Invalid UUID format for ID lookups
   - Invalid phone number format
   - Invalid URL format

2. **Not Found Errors (404)**
   - Tuition centre ID does not exist

3. **Server Errors (500)**
   - Database connection failures
   - Unexpected Prisma errors
   - Unhandled exceptions

4. **Service Unavailable (503)**
   - Database is down or unreachable

### Error Handling Strategy

- All route handlers wrapped in try-catch blocks
- Prisma errors mapped to appropriate HTTP status codes
- Validation errors caught early with descriptive messages
- All errors logged with context for debugging
- No sensitive information exposed in error messages

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Service Layer Tests**
   - Test search with specific terms
   - Test filter combinations with known data
   - Test WhatsApp link formatting with various phone formats
   - Test URL validation with valid and invalid URLs
   - Test pagination calculations
   - Test error handling for invalid inputs

2. **API Route Tests**
   - Test endpoint responses with mock service layer
   - Test query parameter parsing
   - Test error response formatting
   - Test HTTP status codes

### Property-Based Tests

Property-based tests will verify universal properties across randomized inputs using a PBT library (e.g., fast-check for JavaScript):

**Configuration**: Each property test runs a minimum of 100 iterations with randomized inputs.

**Test Tags**: Each test includes a comment: `// Feature: tuition-search-backend, Property {N}: {property text}`

1. **Property 1 Test**: Generate random search terms and verify all results contain the term
2. **Property 2 Test**: Verify empty search returns all centres
3. **Property 3 Test**: Generate random level sets and verify all results have matching levels
4. **Property 4 Test**: Generate random subject sets and verify all results have matching subjects
5. **Property 5 Test**: Generate random filter combinations and verify AND logic
6. **Property 6 Test**: Generate random phone numbers and verify WhatsApp link format
7. **Property 7 Test**: Generate random URLs and verify validation
8. **Property 8 Test**: Generate random pagination parameters and verify consistency
9. **Property 9 Test**: Verify ID lookups return single or none
10. **Property 10 Test**: Verify required fields are always present
11. **Property 11 Test**: Verify empty results for non-matching filters
12. **Property 12 Test**: Verify phone number sanitization

### Integration Tests

- Test full API flow from HTTP request to database and back
- Test with real database (test instance)
- Test concurrent requests
- Test performance under load

### Test Database

- Use SQLite for local development and testing
- Use separate PostgreSQL instance for integration tests
- Seed test data before each test suite
- Clean up test data after tests

## Implementation Notes

### Prisma Client Singleton

To avoid multiple Prisma client instances in development (hot reload), use a singleton pattern:

```javascript
// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### WhatsApp Link Generation

Strip all non-digit characters except the leading '+', then format as `https://wa.me/{number}`:

```javascript
function formatWhatsAppLink(phoneNumber) {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/^\+/, '');
  return `https://wa.me/${digits}`;
}
```

### Search Query Optimization

Use Prisma's `contains` mode with `insensitive` for case-insensitive search:

```javascript
where: {
  OR: [
    { name: { contains: searchTerm, mode: 'insensitive' } },
    { location: { contains: searchTerm, mode: 'insensitive' } }
  ]
}
```

### Filter Combination

Combine filters using Prisma's nested where conditions:

```javascript
where: {
  AND: [
    searchFilter,
    levelFilter,
    subjectFilter
  ]
}
```

### Performance Considerations

- Add database indexes on `name` and `location` fields
- Use `select` to limit returned fields when appropriate
- Implement pagination to limit result set size
- Consider caching for frequently accessed data (future enhancement)
- Use connection pooling for database connections

### Deployment

- Environment variables for database connection
- Prisma migrations run during deployment
- Seed script for initial data population
- Health check endpoint for monitoring

## Future Enhancements

1. **Caching Layer**: Redis for frequently accessed searches
2. **Full-Text Search**: PostgreSQL full-text search or Elasticsearch
3. **Geolocation**: Distance-based search using coordinates
4. **Admin API**: CRUD operations for managing tuition centres
5. **Rate Limiting**: Protect API from abuse
6. **Analytics**: Track popular searches and filters
