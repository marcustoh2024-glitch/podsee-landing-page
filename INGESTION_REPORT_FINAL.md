# Final Ingestion Report - Executive Summary

**Date:** February 3, 2026  
**Task:** Analyze and fix tuition centre data ingestion  
**Status:** ✅ COMPLETE

---

## Executive Summary

Successfully analyzed the Excel ingestion discrepancy and implemented a new policy that inserts **ALL 60 centres** (up from 22) with comprehensive data quality tracking.

---

## Hard Counts - As Requested

### Total Rows and Uniqueness

| Metric | Count | Definition |
|--------|-------|------------|
| **Total rows read from Excel** | 60 | All rows in `Offerings_MarineParade_Encoded.xlsx` |
| **Unique centres detected** | 60 | Uniqueness: by centre name only (case-insensitive) |
| **Centres created successfully** | 60 | 100% insertion success rate |
| **Centres skipped** | 0 | No centres blocked under new policy |
| **Centres attempted but failed** | 0 | No database/Prisma errors |

### Skip Reasons Breakdown (Under New Policy)

| Skip Reason | Count | Notes |
|-------------|-------|-------|
| Missing centre name | 0 | All rows had valid names |
| Duplicate centre name | 0 | No duplicates detected |
| Unique constraint collision | 0 | No database conflicts |
| Database/Prisma errors | 0 | All inserts succeeded |
| **TOTAL SKIPPED** | **0** | **All centres inserted** |

### What WOULD Have Been Skipped (Old Policy)

| Skip Reason | Count | Notes |
|-------------|-------|-------|
| Flagged for review | 38 | Marked `needs_review=TRUE` in Excel |
| No valid subjects | 9 | All subjects filtered during normalization |
| **TOTAL WOULD SKIP** | **38** | **Under old blocking policy** |

---

## Data Quality Status

### Status Distribution

| Status | Count | Percentage |
|--------|-------|------------|
| **OK** | 20 | 33.3% |
| **NEEDS_REVIEW** | 40 | 66.7% |
| **TOTAL** | **60** | **100%** |

### Quality Issues Breakdown

| Issue Type | Count | Description |
|------------|-------|-------------|
| **Flagged in source data** | 38 | Marked for review in original Excel |
| **UNKNOWN levels** | 21 | Level ranges couldn't be parsed |
| **Invalid subjects** | 12 | Subjects don't map to canonical list |
| **No valid subjects** | 9 | All subjects filtered out |
| **Missing fields** | 0 | All required fields present |

**Note:** Centres can have multiple issues, so counts overlap.

---

## Policy Changes Confirmed

### ✅ Old Policy (CONFIRMED - Was Skipping)

The current importer **WAS skipping flagged centres**:
- ❌ Blocked centres with `needs_review=TRUE`
- ❌ Blocked centres with UNKNOWN levels
- ❌ Blocked centres with no valid subjects
- ❌ No quality tracking
- **Result:** Only 22/60 centres inserted (36.7%)

### ✅ New Policy (IMPLEMENTED)

**Insert ALL centres** with quality flags:
- ✅ Insert centres even if flagged for review
- ✅ Insert centres with UNKNOWN levels (levels dropped, centre kept)
- ✅ Insert centres with messy subjects (subjects filtered, centre kept)
- ✅ Insert centres with no subjects (flagged for manual review)
- ✅ Store `dataQualityStatus` field (OK / NEEDS_REVIEW)
- ✅ Store `dataQualityNotes` field with detailed issues
- **Result:** 60/60 centres inserted (100%)

---

## Schema Changes

### New Fields Added

```prisma
model TuitionCentre {
  // ... existing fields ...
  dataQualityStatus   String    @default("OK")  // "OK" or "NEEDS_REVIEW"
  dataQualityNotes    String?                   // Detailed issue description
  
  @@index([dataQualityStatus])
}
```

### Migration

- **Migration ID:** `20260203185906_add_data_quality_fields`
- **Status:** ✅ Successfully applied
- **Database:** SQLite (dev.db)

---

## Improvement Metrics

| Metric | Old Policy | New Policy | Improvement |
|--------|-----------|------------|-------------|
| Centres inserted | 22 | 60 | +38 (+172%) |
| Coverage | 36.7% | 100% | +63.3% |
| Centres skipped | 38 | 0 | -38 (-100%) |
| Quality tracking | No | Yes | New feature |

---

## Centres Requiring Manual Review

### 9 Centres with No Valid Subjects

These centres need manual data entry:

1. Chinese Wonderland Learning Centre
2. Crestar Learning Centre
3. Eye Level @ Katong
4. Kumon
5. Lil But Mighty English
6. Mathnasium
7. MindSpace @ The Flow
8. Moyuan Culture Education Centre
9. Novel Learning Centre

**Reason:** All subjects were either enrichment programs or couldn't be extracted.

### 21 Centres with UNKNOWN Levels

These centres have subjects but missing level information:
- Altitude Tuition Centre
- Aspen Learning Centre
- Aspire Hub
- Augustine's English Classes
- Fang Cao Yuan Chinese Learning
- HESS Education Centre
- Indigo Education Group
- Inspire Education Centre
- Jolly Chinese Learning Centre
- Learning Point
- Mathathon
- Mathematical Sciences Learning Centre
- Matrix Math
- Mind Stretcher
- My Chinese Steps Learning Centre
- New Cambridge Education Centre
- Overmugged
- The Prime Circle Learning Academy
- Tutor Next Door Tuition Center
- Ultimate Learning Hub
- Zenith Education Studio

**Action needed:** Review source websites or contact centres for level details.

---

## Files Created

### Scripts

1. **`scripts/generate-ingestion-report.js`** - Analysis and reporting
2. **`scripts/ingest-all-centres.js`** - New ingestion with quality flags
3. **`scripts/verify-all-centres.js`** - Database verification
4. **`scripts/old-vs-new-policy-comparison.js`** - Policy comparison
5. **`scripts/final-ingestion-report.js`** - Hard counts report

### Documentation

1. **`COMPREHENSIVE_INGESTION_REPORT.md`** - Full detailed analysis
2. **`INGESTION_SUMMARY.md`** - Quick reference guide
3. **`INGESTION_REPORT_FINAL.md`** - This executive summary

---

## How to Use the New System

### Query Centres by Quality Status

```javascript
// Get all centres needing review
const needsReview = await prisma.tuitionCentre.findMany({
  where: { dataQualityStatus: 'NEEDS_REVIEW' },
  include: { subjects: true, levels: true }
});

// Get only clean centres
const okCentres = await prisma.tuitionCentre.findMany({
  where: { dataQualityStatus: 'OK' }
});

// Get centres with no subjects
const noSubjects = await prisma.tuitionCentre.findMany({
  where: { subjects: { none: {} } }
});
```

### Filter in Search Results

```javascript
// Option 1: Show all centres, mark quality issues
const allCentres = await prisma.tuitionCentre.findMany({
  include: { subjects: true, levels: true }
});

// Option 2: Show only OK centres by default
const cleanCentres = await prisma.tuitionCentre.findMany({
  where: { dataQualityStatus: 'OK' },
  include: { subjects: true, levels: true }
});
```

---

## Next Steps

### Immediate (Done)
- ✅ Analyze Excel data and identify skip reasons
- ✅ Add data quality fields to schema
- ✅ Implement new ingestion policy
- ✅ Insert all 60 centres
- ✅ Generate comprehensive reports

### Short Term (To Do)
- ⏳ Review 40 centres with NEEDS_REVIEW status
- ⏳ Add manual data for 9 centres with no subjects
- ⏳ Resolve UNKNOWN levels for 21 centres
- ⏳ Update search UI to show/filter by quality status

### Long Term (To Do)
- ⏳ Implement admin panel for data quality review
- ⏳ Add bulk edit functionality for quality issues
- ⏳ Create data quality dashboard
- ⏳ Set up automated quality checks

---

## Conclusion

✅ **Mission Accomplished**

- Excel has **60 centres** (not 61)
- Old policy inserted **22 centres** (36.7%)
- New policy inserts **60 centres** (100%)
- **38 additional centres** now available (+172% increase)
- All quality issues tracked systematically
- Zero database errors
- Zero centres skipped

The new system provides complete data coverage while maintaining data quality visibility for future review and improvement.
