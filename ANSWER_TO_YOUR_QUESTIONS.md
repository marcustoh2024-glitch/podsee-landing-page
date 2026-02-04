# Direct Answers to Your Questions

## Question 1: Why only 20 centres when Excel has 61?

**Answer:**
- Excel actually has **60 rows** (not 61)
- Old importer inserted **22 centres** (not 20)
- **38 centres were skipped** due to quality issues

## Question 2: Hard Counts Report

### Total Rows Read from Excel
**60 rows**

### Number of Unique Centres Detected
**60 unique centres**

**Uniqueness Definition:** By centre name only (case-insensitive)
- No duplicates found
- Each centre has a unique name

### Centres Created Successfully
**60 centres** (100% success rate)

### Centres Skipped (with breakdown)
**0 centres skipped** under new policy

**Breakdown of what WOULD have been skipped under old policy:**
- Flagged for review: 38 centres
- No valid subjects: 9 centres
- Unknown levels: 21 centres (but these were inserted with subjects only)
- Invalid subjects: 12 centres (but centres were inserted with valid subjects only)
- Missing fields: 0 centres
- Unique constraint collision: 0 centres

### Centres Attempted but Failed Insert
**0 centres failed**
- No Prisma errors
- No database errors
- 100% insertion success

## Question 3: Was the importer skipping flagged centres?

**YES** - Confirmed

The old importer (`scripts/ingest-tuition-centres.js`) was skipping centres that:
1. Had `needs_review=TRUE` in the Excel file (38 centres)
2. Had no valid subjects after normalization (9 centres)

**Evidence:** Running the comparison script shows 22 centres would be inserted under old policy vs 60 under new policy.

## Question 4: Policy Change Implemented

### ✅ Changes Made

1. **Insert ALL centres** - No blocking on quality issues
2. **Added `dataQualityStatus` field** - Values: "OK" or "NEEDS_REVIEW"
3. **Added `dataQualityNotes` field** - Stores detailed issue descriptions
4. **Do not block on UNKNOWN levels** - Insert centre, flag for review
5. **Do not block on messy subjects** - Filter invalid subjects, insert centre with valid ones

### Schema Migration

```prisma
model TuitionCentre {
  // ... existing fields ...
  dataQualityStatus   String    @default("OK")
  dataQualityNotes    String?
  
  @@index([dataQualityStatus])
}
```

Migration: `20260203185906_add_data_quality_fields` ✅ Applied

### Results

| Metric | Old Policy | New Policy |
|--------|-----------|------------|
| Centres inserted | 22 | 60 |
| Centres skipped | 38 | 0 |
| Success rate | 36.7% | 100% |

## Summary Table

| Question | Answer |
|----------|--------|
| **Total rows in Excel** | 60 |
| **Unique centres** | 60 (by name) |
| **Centres created** | 60 |
| **Centres skipped** | 0 |
| **Centres failed** | 0 |
| **Was skipping flagged?** | YES (old policy) |
| **Policy changed?** | YES ✅ |
| **Quality tracking added?** | YES ✅ |

## Data Quality Breakdown

| Status | Count | % |
|--------|-------|---|
| OK | 20 | 33.3% |
| NEEDS_REVIEW | 40 | 66.7% |

### Issues in NEEDS_REVIEW centres:
- 38 flagged in source data
- 21 with UNKNOWN levels
- 12 with invalid subjects
- 9 with no valid subjects

## Files to Review

1. **`INGESTION_REPORT_FINAL.md`** - Complete executive summary
2. **`COMPREHENSIVE_INGESTION_REPORT.md`** - Detailed analysis
3. **`INGESTION_SUMMARY.md`** - Quick reference
4. **`scripts/ingest-all-centres.js`** - New ingestion script
5. **`scripts/old-vs-new-policy-comparison.js`** - Policy comparison

## Run the New Ingestion

```bash
# Clear database and re-run with new policy
npx prisma migrate reset --force
node scripts/ingest-all-centres.js

# Verify results
node scripts/verify-all-centres.js
node scripts/old-vs-new-policy-comparison.js
```

---

**Status:** ✅ ALL REQUIREMENTS COMPLETED
