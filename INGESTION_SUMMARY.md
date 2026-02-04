# Ingestion Summary - Quick Reference

## The Problem

- Excel file has **60 centres** (not 61 as initially thought)
- Old importer only inserted **22 centres** (36.7%)
- **38 centres were skipped** (63.3%) due to quality issues

## The Solution

✅ **New Policy: Insert ALL centres with quality flags**

### Schema Changes

Added two new fields to `TuitionCentre` model:
- `dataQualityStatus` - "OK" or "NEEDS_REVIEW"
- `dataQualityNotes` - Detailed description of issues

### Results

| Metric | Count |
|--------|-------|
| **Total rows in Excel** | 60 |
| **Centres inserted** | 60 (100%) |
| **Centres skipped** | 0 |
| **Centres failed** | 0 |

## Quality Breakdown

| Status | Count | % |
|--------|-------|---|
| OK | 20 | 33.3% |
| NEEDS_REVIEW | 40 | 66.7% |

### Quality Issues (40 centres flagged)

| Issue | Count | Description |
|-------|-------|-------------|
| Flagged in source | 38 | Marked `needs_review=TRUE` in Excel |
| UNKNOWN levels | 21 | Level ranges couldn't be parsed |
| Invalid subjects | 12 | Subjects don't map to canonical list |
| No valid subjects | 9 | All subjects filtered out |

**Note:** Some centres have multiple issues, so counts overlap.

## Uniqueness Definition

**Primary key:** Centre name (case-insensitive)
- No duplicates found in the 60 rows
- Each centre name is unique

## Skip Reasons (0 total)

| Reason | Count |
|--------|-------|
| Missing name | 0 |
| Duplicate name | 0 |
| DB errors | 0 |

## Key Changes from Old Policy

| Aspect | Old | New |
|--------|-----|-----|
| Centres inserted | 22 (36.7%) | 60 (100%) |
| Flagged centres | ❌ Skip | ✅ Insert with flag |
| UNKNOWN levels | ❌ Skip | ✅ Insert with flag |
| Invalid subjects | ❌ Skip | ✅ Insert with flag |
| No subjects | ❌ Skip | ✅ Insert with flag |
| Quality tracking | ❌ None | ✅ Status + Notes |

## Improvement Metrics

- **Additional centres inserted:** +38 centres (+172% increase)
- **Coverage improvement:** 22/60 → 60/60
- **Success rate:** 36.7% → 100%

## Files Created

1. **`scripts/generate-ingestion-report.js`** - Analysis script
2. **`scripts/ingest-all-centres.js`** - New ingestion script
3. **`scripts/verify-all-centres.js`** - Verification script
4. **`scripts/old-vs-new-policy-comparison.js`** - Policy comparison
5. **`COMPREHENSIVE_INGESTION_REPORT.md`** - Full detailed report
6. **`INGESTION_SUMMARY.md`** - This quick reference

## Database State

- **Total centres:** 70 (60 from Excel + 10 from seed)
- **With OK status:** 30
- **With NEEDS_REVIEW status:** 40
- **With no subjects:** 9
- **With no levels:** 9

## Next Steps

1. ✅ All centres inserted
2. ⏳ Review 40 flagged centres
3. ⏳ Fix 9 centres with no subjects
4. ⏳ Resolve 21 centres with UNKNOWN levels
5. ⏳ Update search UI to handle quality flags

## How to Query

```javascript
// Get all centres needing review
const needsReview = await prisma.tuitionCentre.findMany({
  where: { dataQualityStatus: 'NEEDS_REVIEW' }
});

// Get centres with no subjects
const noSubjects = await prisma.tuitionCentre.findMany({
  where: { subjects: { none: {} } }
});

// Get OK centres only
const okCentres = await prisma.tuitionCentre.findMany({
  where: { dataQualityStatus: 'OK' }
});
```

## Migration Applied

```
20260203185906_add_data_quality_fields
```

Status: ✅ Successfully applied to dev.db
