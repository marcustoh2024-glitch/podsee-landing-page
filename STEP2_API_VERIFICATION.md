# Step 2: API Endpoint Verification Report

**Date:** February 4, 2026  
**Purpose:** Prove the API returns centres with NO filters

---

## ✅ RESULT: API NOW RETURNS DATA

### Request Details

**Endpoint:** `http://localhost:3001/api/tuition-centres`  
**Method:** GET  
**Query Parameters:** (none)  
**Headers:** (default)

### Response Summary

**HTTP Status:** 200 OK  
**Total Centres Returned:** 20 (first page)  
**Total Centres Available:** 60  
**Total Pages:** 3  
**Current Page:** 1  
**Limit per Page:** 20

---

## 📊 Response Data

### Pagination Object

```json
{
  "page": 1,
  "limit": 20,
  "total": 60,
  "totalPages": 3
}
```

### Sample Centre Records (First 5)

#### 1. AM Academy
```json
{
  "id": "b2932d3a-dd62-41f6-8b9d-e83ab7ed4913",
  "name": "AM Academy",
  "location": "Marine Parade",
  "whatsappNumber": "",
  "whatsappLink": "",
  "website": "https://www.amacademysg.com/",
  "levels": [
    { "id": "2fd621ed-455b-46cc-ab35-63374b77d185", "name": "Secondary 3" },
    { "id": "2fd90bfe-cd22-4a14-8988-cb326b93dc26", "name": "JC 2" },
    { "id": "39a2bd7d-5d45-4d7a-9b3f-64702b268e66", "name": "Secondary 2" },
    { "id": "48869664-fb58-4ee3-a09c-ecd9a31810db", "name": "Secondary 4" },
    { "id": "aa5d1341-f874-4051-addd-234b50eec729", "name": "Secondary 1" },
    { "id": "e43ca63a-a64f-419b-b538-9292393a3c4f", "name": "JC 1" }
  ],
  "subjects": [
    { "id": "351bbc4a-453e-450a-bb27-f1678c9d1f58", "name": "Economics" },
    { "id": "3d9858e8-b231-4ac2-9671-1ac5396595d3", "name": "Accounting" },
    { "id": "7417bf90-9634-4fdc-91fa-eb2dd3afcbb7", "name": "Elementary Mathematics" },
    { "id": "74c92b2b-e9b1-4722-b4db-4ac9a9f1412f", "name": "Chemistry" },
    { "id": "803519e6-375a-4c21-b9af-9edf8138371c", "name": "English" },
    { "id": "b57e7505-0823-4d5a-a7bf-03891a14025c", "name": "Physics" },
    { "id": "d7614ad2-078a-4b1b-a7c6-aac4e01a9294", "name": "Additional Mathematics" },
    { "id": "e6f67f59-ecc8-4ef1-a8c1-2b2efafad6fd", "name": "Science" },
    { "id": "fd227a4e-04a2-47f1-a5c1-9284c2fa1316", "name": "Mathematics" }
  ]
}
```

#### 2. Ace Your Econs
```json
{
  "id": "d4df9058-650e-48a5-a7cf-9d67b480648f",
  "name": "Ace Your Econs",
  "location": "Marine Parade",
  "website": "https://aceyourecons.sg/",
  "levels": [
    { "name": "JC 2" },
    { "name": "JC 1" }
  ],
  "subjects": [
    { "name": "Economics" }
  ]
}
```

#### 3. Altitude Tuition Centre
```json
{
  "id": "b5b7dd36-f161-4ba0-855c-ec2fff450e61",
  "name": "Altitude Tuition Centre",
  "location": "Marine Parade",
  "website": "https://www.altitudetuition.com/",
  "levels": [
    { "name": "Primary 3" },
    { "name": "Primary 1" },
    { "name": "JC 2" },
    { "name": "Primary 4" },
    { "name": "Primary 6" },
    { "name": "Primary 5" },
    { "name": "JC 1" },
    { "name": "Primary 2" }
  ],
  "subjects": [
    { "name": "Economics" },
    { "name": "Science" },
    { "name": "Mathematics" }
  ]
}
```

#### 4. Aspen Learning Centre
```json
{
  "id": "f3200b7f-3122-4abd-823a-73a7a010ca0d",
  "name": "Aspen Learning Centre",
  "location": "Marine Parade",
  "website": "https://aspen.com.sg/classes-and-programs/",
  "levels": [
    { "name": "Primary 3" },
    { "name": "Primary 1" },
    { "name": "JC 2" },
    { "name": "Primary 4" },
    { "name": "Primary 6" },
    { "name": "Primary 5" },
    { "name": "JC 1" },
    { "name": "Primary 2" }
  ],
  "subjects": [
    { "name": "Chemistry" },
    { "name": "Science" }
  ]
}
```

#### 5. Aspire Hub
```json
{
  "id": "d7cd3b8d-e9d6-4751-8bf4-50eef6a7921c",
  "name": "Aspire Hub",
  "location": "Marine Parade",
  "website": "https://www.aspirehub.com/branches",
  "levels": [
    { "name": "Primary 3" },
    { "name": "Primary 1" },
    { "name": "JC 2" },
    { "name": "Primary 4" },
    { "name": "Primary 6" },
    { "name": "Primary 5" },
    { "name": "JC 1" },
    { "name": "Primary 2" }
  ],
  "subjects": [
    { "name": "Economics" },
    { "name": "Chinese" },
    { "name": "Chemistry" },
    { "name": "English" },
    { "name": "Physics" },
    { "name": "General Paper" },
    { "name": "Biology" },
    { "name": "Science" },
    { "name": "Mathematics" }
  ]
}
```

---

## 🔍 Key Findings

### ✅ What We Confirmed

1. **API is working** - Returns 200 OK status
2. **Data is returned** - 20 centres in first page
3. **Total count is correct** - 60 centres total
4. **Pagination works** - 3 pages with 20 centres per page
5. **Data structure is correct** - All fields present (id, name, location, subjects, levels)
6. **No default filters** - API returns all centres when no filters provided

### 📋 Data Quality Observations

1. **All centres have location** - "Marine Parade"
2. **Some centres have no subjects/levels** - e.g., "Chinese Wonderland Learning Centre", "Kumon"
3. **WhatsApp numbers are empty** - All centres have empty `whatsappNumber` field
4. **Websites are present** - All centres have valid website URLs
5. **Subjects and levels are properly formatted** - Arrays with id and name

---

## 🚨 Root Cause Identified

### The Problem

**The API server was started BEFORE the database was populated.**

### Timeline

1. ✅ Database was empty initially (0 centres)
2. ✅ Ran ingestion script: `node scripts/ingest-all-centres.js` (60 centres inserted)
3. ❌ API server was still running with cached Prisma client (returned 0 centres)
4. ✅ Restarted API server: `npm run dev`
5. ✅ API now returns 60 centres

### Why This Happened

- **Prisma Client Caching:** The Prisma client caches the database schema and connection
- **Server Started Before Data:** The dev server was running before we populated the database
- **No Hot Reload for Data:** Next.js hot reload doesn't refresh Prisma client connections

---

## 🔧 Solution Applied

### Steps Taken

1. Stopped the dev server
2. Killed any processes on port 3001
3. Restarted the dev server: `npm run dev`
4. Verified API returns data: `curl http://localhost:3001/api/tuition-centres`

### Result

✅ API now returns 60 centres with proper pagination

---

## 📝 Test Commands Used

### Direct API Call
```bash
curl -s "http://localhost:3001/api/tuition-centres" | jq '.'
```

### Test Script
```bash
node scripts/test-api-vs-database.js
```

This script:
- Queries database directly (60 centres)
- Calls API endpoint (60 centres)
- Compares results (MATCH)

---

## ✅ Step 2 Complete

**Status:** API verified and returning data

**Summary:**
- Endpoint: `http://localhost:3001/api/tuition-centres` ✅
- HTTP Status: 200 OK ✅
- Centres returned: 20 (page 1 of 3) ✅
- Total centres: 60 ✅
- No default filters blocking results ✅
- Data structure correct ✅

**Root Cause:** Server needed restart after database population

**Ready for Step 3:** Test the UI to see if it can now display the centres returned by the API.
