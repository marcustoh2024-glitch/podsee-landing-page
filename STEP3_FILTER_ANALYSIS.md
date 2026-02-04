# Step 3: Filter Combination Analysis Report

**Date:** February 4, 2026  
**Purpose:** Identify what filter combination is causing 0 results

---

## 🚨 ROOT CAUSE IDENTIFIED

### The Problem

**The UI is sending `levels=Secondary` but the database has `Secondary 1`, `Secondary 2`, `Secondary 3`, `Secondary 4`**

---

## 📊 Database Verification

### Test 1: Location Values

| Query | Result |
|-------|--------|
| Exact match "Marine Parade" | 60 centres ✅ |
| Contains "Marine Parade" | 60 centres ✅ |

**Conclusion:** Location filter works correctly

### Test 2: Level Values in Database

**Levels in database:**
- Primary 1, Primary 2, Primary 3, Primary 4, Primary 5, Primary 6
- Secondary 1, Secondary 2, Secondary 3, Secondary 4
- JC 1, JC 2

**Critical Finding:**
- ❌ No level named "Secondary" exists
- ✅ Only "Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4" exist
- 31 centres have at least one Secondary level

### Test 3: Subject Values in Database

**Subjects in database:** 19 total

**English subject:**
- ✅ EXISTS (ID: 803519e6-375a-4c21-b9af-9edf8138371c)
- 21 centres offer English

### Test 4: Combined Filter (Marine Parade + Secondary + English)

**Query:** Location="Marine Parade" + Levels=["Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4"] + Subject="English"

**Result:** 12 centres found ✅

**Matching centres:**
1. AM Academy
2. Focus Education Centre
3. Inspire Education Centre
4. Learning Point
5. Mind Stretcher
6. Oasis Learning Centre
7. Simply English
8. The Alternative Story
9. The Humanities Clinic
10. The Impact Academy
11. The Learning Lab
12. Wordsmiths Learning Centre

---

## 🌐 API Testing with Different Parameters

### Test Results

| API Call | Total Results | Status |
|----------|---------------|--------|
| `?levels=Secondary` | 0 | ❌ FAILS |
| `?levels=Secondary 1` | 29 | ✅ WORKS |
| `?levels=Secondary 1,Secondary 2,Secondary 3,Secondary 4` | (not tested) | Should work |
| `?subjects=English` | 21 | ✅ WORKS |
| `?levels=Secondary 1&subjects=English` | 12 | ✅ WORKS |

### Exact API Responses

#### 1. levels=Secondary (FAILS)
```bash
curl "http://localhost:3001/api/tuition-centres?levels=Secondary"
```

**Response:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

#### 2. levels=Secondary 1 (WORKS)
```bash
curl "http://localhost:3001/api/tuition-centres?levels=Secondary%201"
```

**Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 29,
    "totalPages": 2
  }
}
```

#### 3. subjects=English (WORKS)
```bash
curl "http://localhost:3001/api/tuition-centres?subjects=English"
```

**Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 21,
    "totalPages": 2
  }
}
```

#### 4. levels=Secondary 1&subjects=English (WORKS)
```bash
curl "http://localhost:3001/api/tuition-centres?levels=Secondary%201&subjects=English"
```

**Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

## 🔍 UI Code Analysis

### What the UI Sends

From `src/app/results/page.jsx`:

```javascript
// Build query parameters
const params = new URLSearchParams()
if (level) params.append('levels', level)
if (subject) params.append('subjects', subject)

const response = await fetch(`/api/tuition-centres?${params.toString()}`)
```

**The UI sends:**
- `levels` parameter with the exact value from the URL query string
- `subjects` parameter with the exact value from the URL query string

### Example URL Flow

1. User selects "Secondary" in filter wizard
2. UI navigates to: `/results?level=Secondary&subject=English`
3. UI calls API: `/api/tuition-centres?levels=Secondary&subjects=English`
4. API returns 0 results because "Secondary" doesn't match any level in DB

---

## 🎯 The Mismatch

### What the UI Sends
- `levels=Secondary`

### What the Database Has
- `Secondary 1`
- `Secondary 2`
- `Secondary 3`
- `Secondary 4`

### Why It Fails

The API service uses this query:

```javascript
{
  levels: {
    some: {
      level: {
        OR: levels.flatMap(level => [
          { id: level },           // Try to match by ID
          { name: { equals: level } }  // Try to match by exact name
        ])
      }
    }
  }
}
```

When `level = "Secondary"`:
- ❌ No level has ID = "Secondary"
- ❌ No level has name = "Secondary" (exact match)
- ✅ Levels "Secondary 1", "Secondary 2", etc. exist but don't match

---

## 💡 Solutions

### Option 1: Fix the UI to send specific levels

Change the filter wizard to send:
- `levels=Secondary 1,Secondary 2,Secondary 3,Secondary 4` instead of `levels=Secondary`

### Option 2: Fix the API to handle grouped levels

Update the API service to recognize "Secondary" and expand it to all Secondary levels:

```javascript
// Map generic level names to specific levels
const levelMapping = {
  'Primary': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
  'Secondary': ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4'],
  'JC': ['JC 1', 'JC 2']
}
```

### Option 3: Add grouped levels to database

Add "Primary", "Secondary", "JC" as actual levels in the database and link them to centres.

---

## ✅ Step 3 Complete

**Status:** Root cause identified

**Summary:**
- Database has: "Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4" ✅
- UI sends: "Secondary" ❌
- API does exact match: "Secondary" ≠ "Secondary 1" ❌
- Result: 0 centres returned ❌

**The filter combination that causes 0 results:**
- Any query with `levels=Secondary` (or `levels=Primary`, `levels=JC`)
- Because these grouped level names don't exist in the database

**Next Step:** Fix either the UI to send specific levels OR the API to handle grouped level names.
