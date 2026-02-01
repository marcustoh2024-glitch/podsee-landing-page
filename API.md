# Tuition Search Backend API

Complete API documentation for the Podsee tuition centre search and filtering system.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

The Tuition Search Backend API provides RESTful endpoints for searching and filtering tuition centres in Singapore. The API supports:

- Full-text search by name and location
- Filtering by educational level (Primary, Secondary, JC, etc.)
- Filtering by subject (Mathematics, Science, English, etc.)
- Pagination for large result sets
- Detailed centre information retrieval

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Base URL

### Development
```
http://localhost:3000/api
```

### Production
```
https://your-domain.com/api
```

## Endpoints

### 1. Search and Filter Tuition Centres

Search for tuition centres with optional filters.

**Endpoint:** `GET /tuition-centres`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Search term for name or location (case-insensitive) |
| `levels` | string | No | - | Comma-separated level names or IDs |
| `subjects` | string | No | - | Comma-separated subject names or IDs |
| `page` | integer | No | 1 | Page number (must be ≥ 1) |
| `limit` | integer | No | 20 | Results per page (max: 100) |

**Filter Logic:**

- **Search**: Matches centres where search term appears in name OR location
- **Levels**: Returns centres offering ANY of the specified levels (OR logic)
- **Subjects**: Returns centres offering ANY of the specified subjects (OR logic)
- **Combined**: All filter types must match (AND logic between types)

**Example Requests:**

```bash
# Basic search
curl "http://localhost:3000/api/tuition-centres?search=tampines"

# Filter by level
curl "http://localhost:3000/api/tuition-centres?levels=Primary,Secondary"

# Filter by subject
curl "http://localhost:3000/api/tuition-centres?subjects=Mathematics"

# Combined filters
curl "http://localhost:3000/api/tuition-centres?search=learning&levels=Primary&subjects=Mathematics,Science"

# With pagination
curl "http://localhost:3000/api/tuition-centres?page=2&limit=10"
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
        }
      ],
      "subjects": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440000",
          "name": "Mathematics"
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
// 400 Bad Request
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

### 2. Get Tuition Centre by ID

Retrieve detailed information about a specific tuition centre.

**Endpoint:** `GET /tuition-centres/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Tuition centre unique identifier |

**Example Request:**

```bash
curl "http://localhost:3000/api/tuition-centres/550e8400-e29b-41d4-a716-446655440000"
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

// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid tuition centre ID format"
  }
}
```

## Response Fields

### Tuition Centre Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID format) |
| `name` | string | Tuition centre name |
| `location` | string | Location/area in Singapore |
| `whatsappNumber` | string | WhatsApp contact number with country code |
| `whatsappLink` | string | Direct WhatsApp chat link (wa.me format) |
| `website` | string \| null | Centre website URL (null if not available) |
| `levels` | Level[] | Array of educational levels offered |
| `subjects` | Subject[] | Array of subjects taught |
| `createdAt` | string | ISO 8601 timestamp (only in detail endpoint) |
| `updatedAt` | string | ISO 8601 timestamp (only in detail endpoint) |

### Level Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID format) |
| `name` | string | Level name (e.g., "Primary", "Secondary") |

### Subject Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID format) |
| `name` | string | Subject name (e.g., "Mathematics", "Science") |

### Pagination Object

| Field | Type | Description |
|-------|------|-------------|
| `page` | integer | Current page number |
| `limit` | integer | Results per page |
| `total` | integer | Total number of matching results |
| `totalPages` | integer | Total number of pages |

## Error Handling

All errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional additional context
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database connection or query error |

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

## Examples

### Example 1: Search for centres in Tampines

**Request:**
```bash
curl "http://localhost:3000/api/tuition-centres?search=tampines"
```

**Response:**
```json
{
  "data": [
    {
      "id": "abc-123",
      "name": "Tampines Learning Hub",
      "location": "Tampines Central",
      "whatsappNumber": "+6591234567",
      "whatsappLink": "https://wa.me/6591234567",
      "website": "https://tampineshub.com",
      "levels": [{"id": "1", "name": "Primary"}],
      "subjects": [{"id": "1", "name": "Mathematics"}]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Example 2: Find Primary level centres teaching Mathematics

**Request:**
```bash
curl "http://localhost:3000/api/tuition-centres?levels=Primary&subjects=Mathematics"
```

**Response:**
```json
{
  "data": [
    {
      "id": "def-456",
      "name": "Math Masters",
      "location": "Jurong East",
      "whatsappNumber": "+6598765432",
      "whatsappLink": "https://wa.me/6598765432",
      "website": null,
      "levels": [{"id": "1", "name": "Primary"}],
      "subjects": [{"id": "1", "name": "Mathematics"}]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Example 3: Get specific centre details

**Request:**
```bash
curl "http://localhost:3000/api/tuition-centres/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Excellence Academy",
  "location": "Orchard",
  "whatsappNumber": "+6587654321",
  "whatsappLink": "https://wa.me/6587654321",
  "website": "https://excellence.edu.sg",
  "levels": [
    {"id": "1", "name": "Primary"},
    {"id": "2", "name": "Secondary"}
  ],
  "subjects": [
    {"id": "1", "name": "Mathematics"},
    {"id": "2", "name": "Science"},
    {"id": "3", "name": "English"}
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

### Example 4: Pagination

**Request:**
```bash
curl "http://localhost:3000/api/tuition-centres?page=2&limit=5"
```

**Response:**
```json
{
  "data": [
    // 5 tuition centres (items 6-10)
  ],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 23,
    "totalPages": 5
  }
}
```

## Integration Examples

### JavaScript/TypeScript (fetch)

```javascript
// Search for centres
async function searchCentres(searchTerm, levels, subjects) {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (levels) params.append('levels', levels.join(','));
  if (subjects) params.append('subjects', subjects.join(','));
  
  const response = await fetch(`/api/tuition-centres?${params}`);
  const data = await response.json();
  return data;
}

// Get centre by ID
async function getCentreById(id) {
  const response = await fetch(`/api/tuition-centres/${id}`);
  if (!response.ok) {
    throw new Error('Centre not found');
  }
  const data = await response.json();
  return data;
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useTuitionCentres(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/tuition-centres?${params}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters]);

  return { data, loading, error };
}
```

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
