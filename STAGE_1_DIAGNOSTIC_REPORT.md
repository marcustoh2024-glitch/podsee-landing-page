# Stage 1 — Diagnostic Report: Level + Subject Filters

**Date:** February 5, 2026  
**Status:** ✅ Diagnosis Complete — No Changes Made

---

## 🔍 Root Cause Summary

**Filters disabled because the Offering table is empty (0 rows).**

The database has 60 tuition centres but **zero** Level, Subject, and Offering records. The Excel file contains 1,099 offerings with level-subject combinations, but this data has **not been imported** into the database.

---

## 📊 Database Current State

### Hard Counts

| Table | Count | Status |
|-------|-------|--------|
| **TuitionCentre** | 60 | ✅ Populated |
| **Level** | 0 | ❌ Empty |
| **Subject** | 0 | ❌ Empty |
| **Offering** | 0 | ❌ Empty |
| **TuitionCentreLevel** (join) | 0 | ❌ Empty |
| **TuitionCentreSubject** (join) | 0 | ❌ Empty |

### Sample Tuition Centres
- Aspen Learning Centre (Main) — 0 levels, 0 subjects, 0 offerings
- SmartLab (Main) — 0 levels, 0 subjects, 0 offerings
- AM Academy (Main) — 0 levels, 0 subjects, 0 offerings

**All 60 centres exist but have no associated level/subject/offering data.**

---

## 📁 Excel File Data Available

**File:** `database_ready (1) copy.xlsx`

### Sheets
1. **centres** — 61 rows (60 centres + 1 header)
2. **offerings** — 1,099 rows (1,098 offerings + 1 header)

### Sample Offerings Data
```
Centre: AM Academy | Branch: Main | Level: S3 | Subject: Physics
Centre: AM Academy | Branch: Main | Level: S4 | Subject: Physics
Centre: AM Academy | Branch: Main | Level: S3 | Subject: English
Centre: AM Academy | Branch: Main | Level: S4 | Subject: English
```

**The offerings sheet contains level-subject combinations ready to be imported.**

---

## 🔌 API Configuration

### `/api/tuition-centres` (Search Endpoint)

**Query Parameters:**
- `levels` or `level` (comma-separated) — ✅ Supported but ignored
- `subjects` or `subject` (comma-separated) — ✅ Supported but ignored
- `search` (text) — ✅ Working
- `page` (number) — ✅ Working
- `limit` (number) — ✅ Working

**Current Behavior:**
- Level and subject filters are **explicitly ignored** in the service layer
- Only search and pagination are functional
- Returns ALL centres (with optional search filter)

### `/api/filter-options` (Filter Options Endpoint)

**Current Response:**
```json
{
  "enabled": false,
  "levels": [],
  "subjects": [],
  "reason": "Filters temporarily disabled. No offerings data yet."
}
```

**Hardcoded to return disabled state** — does not check database.

---

## 🎨 UI Filter Disabled Logic

### Where Banner is Triggered

**Component:** `FilterWizard.jsx` (lines 50-70)

**Condition:**
```javascript
if (!filtersEnabled) {
  // Show "Filters temporarily disabled" banner
}
```

**Trigger:** `filtersEnabled` is set to `false` when `/api/filter-options` returns `enabled: false`

### Banner Locations

1. **FilterWizard.jsx** — Shows info banner with "No offerings data yet"
2. **results/page.jsx** — Shows blue notice banner when filters are attempted

---

## 🔧 Service Layer Filter Logic

**File:** `src/lib/services/tuitionCentreService.js`

**Current Implementation:**
```javascript
/**
 * @param {string[]} filters.levels - IGNORED - Filters are disabled
 * @param {string[]} filters.subjects - IGNORED - Filters are disabled
 */
async searchTuitionCentres(filters = {}) {
  const { search, page = 1, limit = 20 } = filters;
  // levels and subjects are NOT used in where clause
  
  const where = {};
  // Only search filter is applied
  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim() } },
      { location: { contains: search.trim() } }
    ];
  }
  // NO level/subject filtering
}
```

**The service explicitly ignores level and subject parameters.**

---

## 📋 What's Missing

1. **Level records** — Need to extract unique levels from offerings sheet and insert into Level table
2. **Subject records** — Need to extract unique subjects from offerings sheet and insert into Subject table
3. **Offering records** — Need to create Offering rows linking centres to level-subject combinations
4. **Join table records** — TuitionCentreLevel and TuitionCentreSubject (optional, depends on filter strategy)

---

## ✅ Verification Complete

- ✅ Database has 60 tuition centres
- ✅ Excel file has 1,099 offerings ready to import
- ✅ API expects `levels` and `subjects` query params (plural or singular)
- ✅ Service layer ignores filter params (hardcoded disabled state)
- ✅ Filter-options API returns `enabled: false` (hardcoded)
- ✅ UI shows "Filters temporarily disabled" banner when `enabled: false`
- ✅ Root cause: **Offering table is empty (0 rows)**

---

## 🎯 Next Steps (Stage 2)

To enable filters, we need to:
1. Import Level records from offerings sheet
2. Import Subject records from offerings sheet
3. Import Offering records (centre + level + subject combinations)
4. Update `/api/filter-options` to check database and return enabled: true
5. Update service layer to apply level/subject filters using Offering table
6. Test filter combinations

**Ready for Stage 2 implementation.**
