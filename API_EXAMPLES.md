# API Query Examples

## Base URL
```
http://localhost:3000/api/tuition-centres
```

## Example Queries

### 1. Get All Centres (Paginated)
```bash
GET /api/tuition-centres
```
**Response:** 50 centres (20 per page by default)

### 2. Filter by Subject
```bash
GET /api/tuition-centres?subjects=Mathematics
```
**Response:** 26 centres offering Mathematics

### 3. Filter by Level
```bash
GET /api/tuition-centres?levels=Primary 6
```
**Response:** 41 centres offering Primary 6

### 4. Filter by Subject AND Level
```bash
GET /api/tuition-centres?subjects=Mathematics&levels=Primary 6
```
**Response:** 22 centres offering Mathematics at Primary 6

**Centres returned:**
- Altitude Tuition Centre
- Aspire Hub
- Focus Education Centre
- Indigo Education Group
- Inspire Education Centre
- Math Mavens
- Mathathon
- Mathematical Sciences Learning Centre
- Mind Stretcher
- New Cambridge Education Centre
- Oasis Learning Centre
- Raymond's Math Science Studio
- S.A.M (Seriously Addictive Maths)
- SuperMath
- The Impact Academy
- The Learning Lab
- The Prime Circle Learning Academy
- Tutor Next Door Tuition Center
- Ultimate Learning Hub
- Wordsmiths Learning Centre
- Zenith Education Studio
- in:genius Student Care

### 5. Multiple Subjects (OR Logic)
```bash
GET /api/tuition-centres?subjects=Physics,Chemistry
```
**Response:** 19 centres offering Physics OR Chemistry

### 6. Multiple Levels (OR Logic)
```bash
GET /api/tuition-centres?levels=JC 1,JC 2
```
**Response:** 25 centres offering JC 1 OR JC 2

### 7. Search by Name or Location
```bash
GET /api/tuition-centres?search=Science
```
**Response:** 5 centres with "Science" in their name
- Mathematical Sciences Learning Centre
- Raymond's Math Science Studio
- Science Masterclass
- Science Solutions
- Science Studios Learning Centre

### 8. Pagination
```bash
GET /api/tuition-centres?page=2&limit=10
```
**Response:** Page 2 of 5 (10 results per page)

### 9. Complex Query
```bash
GET /api/tuition-centres?subjects=Physics,Chemistry&levels=JC 1,JC 2&page=1&limit=5
```
**Response:** First 5 centres offering Physics or Chemistry at JC 1 or JC 2

### 10. Get Specific Centre by ID
```bash
GET /api/tuition-centres/[centre-id]
```
**Response:** Full details of a specific centre

## Available Subjects (28)

1. Accounting
2. Additional Mathematics
3. Biology
4. Biology (IB)
5. Chemistry
6. Chemistry (IB)
7. China Studies in English
8. Chinese
9. Combined Science
10. Combined Science (Physics / Chemistry)
11. Economics
12. Elementary Mathematics
13. English
14. General Paper
15. Geography
16. Higher Chinese
17. History
18. Literature
19. Literature in English
20. Mathematics
21. Mathematics (IB)
22. Physics
23. Physics (IB)
24. Principles of Accounting
25. Science
26. Science (IB)
27. Social Studies
28. Tamil

## Available Levels (12)

1. JC 1
2. JC 2
3. Primary 1
4. Primary 2
5. Primary 3
6. Primary 4
7. Primary 5
8. Primary 6
9. Secondary 1
10. Secondary 2
11. Secondary 3
12. Secondary 4

## Popular Queries

### PSLE Preparation (Primary 6)
```bash
# Mathematics
GET /api/tuition-centres?subjects=Mathematics&levels=Primary 6
# Result: 22 centres

# Science
GET /api/tuition-centres?subjects=Science&levels=Primary 6
# Result: 29 centres

# English
GET /api/tuition-centres?subjects=English&levels=Primary 6
# Result: 20 centres

# Chinese
GET /api/tuition-centres?subjects=Chinese&levels=Primary 6
# Result: 15 centres
```

### O-Level Preparation (Secondary 4)
```bash
# Additional Mathematics
GET /api/tuition-centres?subjects=Additional Mathematics&levels=Secondary 4
# Result: 14 centres

# Physics
GET /api/tuition-centres?subjects=Physics&levels=Secondary 4
# Result: 15 centres

# Chemistry
GET /api/tuition-centres?subjects=Chemistry&levels=Secondary 4
# Result: 16 centres
```

### A-Level Preparation (JC)
```bash
# H2 Mathematics
GET /api/tuition-centres?subjects=Mathematics&levels=JC 1,JC 2
# Result: 16 centres

# H2 Physics
GET /api/tuition-centres?subjects=Physics&levels=JC 1,JC 2
# Result: 18 centres

# H2 Economics
GET /api/tuition-centres?subjects=Economics&levels=JC 1,JC 2
# Result: 17 centres

# General Paper
GET /api/tuition-centres?subjects=General Paper&levels=JC 1,JC 2
# Result: 11 centres
```

## Response Format

### List Response
```json
{
  "data": [
    {
      "id": "091e63bd-7407-4ff5-9818-8b23ff401701",
      "name": "Mind Stretcher",
      "location": "Marine Parade",
      "whatsappNumber": "Not Available",
      "whatsappLink": "",
      "website": "https://www.tutorly.sg/app/blog/Mind-Stretcher-Punggol-2025",
      "subjects": [
        { "id": "uuid", "name": "Mathematics" },
        { "id": "uuid", "name": "Science" }
      ],
      "levels": [
        { "id": "uuid", "name": "Primary 6" },
        { "id": "uuid", "name": "Secondary 4" }
      ],
      "createdAt": "2026-02-04T...",
      "updatedAt": "2026-02-04T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Single Centre Response
```json
{
  "id": "091e63bd-7407-4ff5-9818-8b23ff401701",
  "name": "Mind Stretcher",
  "location": "Marine Parade",
  "whatsappNumber": "Not Available",
  "whatsappLink": "",
  "website": "https://www.tutorly.sg/app/blog/Mind-Stretcher-Punggol-2025",
  "subjects": [
    { "id": "uuid", "name": "Mathematics" },
    { "id": "uuid", "name": "Science" },
    { "id": "uuid", "name": "English" }
  ],
  "levels": [
    { "id": "uuid", "name": "Primary 1" },
    { "id": "uuid", "name": "Primary 2" },
    { "id": "uuid", "name": "Primary 6" }
  ],
  "createdAt": "2026-02-04T...",
  "updatedAt": "2026-02-04T..."
}
```

## Error Responses

### Invalid Page
```json
{
  "error": {
    "code": "INVALID_PAGE",
    "message": "Page parameter must be a positive integer",
    "details": { "page": "abc" }
  }
}
```

### Limit Exceeded
```json
{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Limit parameter cannot exceed 100",
    "details": { "limit": 200, "max": 100 }
  }
}
```

### Centre Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Tuition centre not found"
  }
}
```
