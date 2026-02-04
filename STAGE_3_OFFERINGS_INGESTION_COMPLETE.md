# Stage 3 — Offerings Ingestion Complete ✅

**Date:** February 5, 2026  
**Status:** ✅ Data Successfully Imported — Filters Ready to Enable

---

## 🎉 Summary

Successfully ingested **1,088 offerings** from Excel file into the database. All required data for filters is now present.

---

## 📊 Ingestion Results

### Data Imported

| Entity | Count | Status |
|--------|-------|--------|
| **Levels** | 13 | ✅ Complete |
| **Subjects** | 13 | ✅ Complete |
| **Offerings** | 1,088 | ✅ Complete |
| **Centre-Level joins** | 458 | ✅ Complete |
| **Centre-Subject joins** | 196 | ✅ Complete |

### Available Levels (13)
```
JC1, JC2, P1, P2, P3, P4, P5, P6, S1, S2, S3, S4, UNKNOWN
```

### Available Subjects (13)
```
Biology, Chemistry, Chinese, Economics, English, General Paper, 
Geography, Higher Chinese, History, Literature, Mathematics, 
Physics, Science
```

---

## 🔧 Ingestion Pipeline Details

### Script Created
**File:** `scripts/ingest-offerings-data.js`

**Features:**
- ✅ Idempotent (safe to re-run)
- ✅ Upserts levels and subjects (no duplicates)
- ✅ Matches centres by name + branch
- ✅ Creates explicit level-subject combinations
- ✅ Populates optional join tables for display
- ✅ Comprehensive error reporting

### Data Source
**File:** `database_ready (1) copy.xlsx`  
**Sheet:** `offerings` (1,098 data rows + 1 header)

### Matching Strategy
Centres matched by: `centre_name + "|" + branch_name`

Example:
- Excel: `AM Academy | Main`
- Database: `AM Academy (Main)`
- Match: ✅

### Processing Results
- ✅ **1,088 offerings created** (99.1% success rate)
- ⏭️ **0 rows skipped** (no missing data)
- ⚠️ **10 rows failed** (1 centre not found in database)

**Failed Centre:**
- `S.A.M (Seriously Addictive Maths)` — Not in centres table (10 offerings lost)

---

## 📋 Sample Data

### Sample Offerings
```
• Mind Stretcher (Main): P3 + Chinese
• Augustine's English Classes (Main): JC2 + General Paper
• Wordsmiths Learning Centre (Main): P5 + Science
• Aspire Hub (Main): P5 + Chinese
• Zenith Education Studio (Main): P5 + Science
• Mathematical Sciences Learning Centre (Main): JC2 + Physics
• Aspen Learning Centre (Main): UNKNOWN + Science
• Thought & Words Learning Centre (Main): P6 + English
```

### Centres with Most Offerings
```
• Aspire Hub (Main): 45 offerings
• Mathematical Sciences Learning Centre (Main): 42 offerings
• SmartLab (Main): 20 offerings
• Altitude Tuition Centre (Main): 20 offerings
• AM Academy (Main): 19 offerings
```

---

## ✅ Verification Complete

### Database State After Ingestion

| Table | Before | After | Change |
|-------|--------|-------|--------|
| TuitionCentre | 60 | 60 | — |
| Level | 0 | 13 | +13 |
| Subject | 0 | 13 | +13 |
| Offering | 0 | 1,088 | +1,088 |
| TuitionCentreLevel | 0 | 458 | +458 |
| TuitionCentreSubject | 0 | 196 | +196 |

### Filters Ready ✅

All required data is present:
- ✓ 13 levels available
- ✓ 13 subjects available
- ✓ 1,088 offerings created
- ✓ 60 centres with offerings

**Filters can now be enabled!**

---

## 🔍 Data Quality Notes

### Known Issues

1. **UNKNOWN Level** — Some offerings have "UNKNOWN" as the level
   - Example: `Aspen Learning Centre (Main): UNKNOWN + Science`
   - Impact: May appear in filter results
   - Recommendation: Clean up or filter out in UI

2. **Missing Centre** — 1 centre from Excel not in database
   - Centre: `S.A.M (Seriously Addictive Maths)`
   - Lost offerings: 10
   - Recommendation: Add centre to database and re-run ingestion

### Data Coverage

- **60 centres** in database
- **59 centres** have offerings (98.3% coverage)
- **1 centre** has no offerings (1.7%)

---

## 📝 Scripts Created

### 1. Ingestion Script
**File:** `scripts/ingest-offerings-data.js`

**Usage:**
```bash
node scripts/ingest-offerings-data.js
```

**What it does:**
1. Reads offerings from Excel
2. Upserts levels and subjects
3. Creates offering records
4. Populates join tables
5. Reports results

### 2. Verification Script
**File:** `scripts/verify-offerings-ingestion.js`

**Usage:**
```bash
node scripts/verify-offerings-ingestion.js
```

**What it does:**
1. Counts all entities
2. Lists available levels/subjects
3. Shows sample offerings
4. Checks if filters can be enabled

---

## 🚀 Next Steps (Stage 4)

Now that data is imported, we need to enable filters in the application:

### Backend Changes Required

1. **Update `/api/filter-options`**
   - Change from hardcoded `enabled: false`
   - Query database for available levels/subjects
   - Return `enabled: true` with actual options

2. **Update `tuitionCentreService.js`**
   - Remove "FILTERS DISABLED" comments
   - Implement offering-based filtering
   - Use Prisma query with `offerings.some()`

3. **Test filter combinations**
   - Single level filter
   - Single subject filter
   - Multiple levels + multiple subjects
   - Edge cases (no results, all results)

### Frontend Changes (None Required)

The UI already handles:
- ✅ Dynamic filter options from API
- ✅ Enabling/disabling based on API response
- ✅ Displaying filter results
- ✅ Empty states

**No frontend changes needed — just enable the backend!**

---

## 🎯 Success Criteria Met

- ✅ Offerings file found and processed
- ✅ Idempotent ingestion script created
- ✅ Levels and subjects extracted and stored
- ✅ Offerings linked to centres by stable key
- ✅ Join tables populated for display
- ✅ Verification script confirms data integrity
- ✅ 1,088 offerings successfully imported
- ✅ All required data present for filters

**Stage 3 Complete — Ready for Stage 4 (Enable Filters)**
