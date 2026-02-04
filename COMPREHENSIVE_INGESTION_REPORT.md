# Comprehensive Tuition Centre Ingestion Report

**Date:** February 3, 2026  
**Excel File:** `Offerings_MarineParade_Encoded.xlsx`  
**Ingestion Script:** `scripts/ingest-all-centres.js`

---

## Executive Summary

Successfully ingested **ALL 60 centres** from the Excel file using the new policy that inserts all centres with data quality flags instead of blocking insertion.

### Key Changes from Previous Policy

**OLD POLICY (20 centres inserted):**
- ❌ Skipped centres flagged for review
- ❌ Skipped centres with UNKNOWN levels
- ❌ Skipped centres with no valid subjects
- ❌ Blocked insertion on data quality issues

**NEW POLICY (60 centres inserted):**
- ✅ Insert ALL centres regardless of quality issues
- ✅ Track quality status in `dataQualityStatus` field (OK / NEEDS_REVIEW)
- ✅ Document issues in `dataQualityNotes` field
- ✅ Flag for review but don't block insertion

---

## Ingestion Statistics

### Overall Counts

| Metric | Count | Notes |
|--------|-------|-------|
| **Total rows read from Excel** | 60 | All rows in the spreadsheet |
| **Unique centres detected** | 60 | Uniqueness defined by centre name only |
| **Centres created successfully** | 60 | 100% success rate |
| **Centres skipped** | 0 | No centres blocked |
| **Centres failed (DB errors)** | 0 | No database errors |

### Uniqueness Definition

**Primary Key:** Centre name (case-insensitive)
- By name only: 60 unique centres
- By name + URL: 60 unique centres (no duplicates found)

---

## Skip Reasons Breakdown

| Skip Reason | Count | Details |
|-------------|-------|---------|
| Missing centre name | 0 | All rows had valid centre names |
| Duplicate centre name | 0 | No duplicate names detected |
| Database/Prisma errors | 0 | All inserts succeeded |
| **TOTAL SKIPPED** | **0** | **All centres inserted** |

---

## Data Quality Analysis

### Quality Status Distribution

| Status | Count | Percentage |
|--------|-------|------------|
| **OK** | 20 | 33.3% |
| **NEEDS_REVIEW** | 40 | 66.7% |

### Quality Issues Breakdown

| Issue Type | Count | Description |
|------------|-------|-------------|
| **Flagged in source data** | 38 | Marked with `needs_review=TRUE` in Excel |
| **Contains UNKNOWN levels** | 21 | Level ranges could not be parsed (e.g., "UNKNOWN") |
| **Has invalid subjects** | 12 | Subjects that don't map to canonical subjects |
| **No valid subjects** | 9 | All subjects filtered out after normalization |
| **Missing website** | 0 | All centres have source URLs |

**Note:** Some centres have multiple quality issues, so the sum exceeds 40.

---

## Detailed Quality Issues

### 1. Centres Flagged in Source Data (38 centres)

These centres were marked `needs_review=TRUE` in the original Excel file due to:
- Ambiguous level ranges
- Missing H1/H2 indicators for JC subjects
- Unclear distinction between enrichment vs tuition
- Subjects extracted from images or incomplete data

**Examples:**
- Altitude Tuition Centre: "Secondary subjects 'Mathematics' and 'Science (Chem/Physics)' have UNKNOWN ranges"
- Aspen Learning Centre: "Secondary subject 'IP/Express Science' has an UNKNOWN range"
- Augustine's English Classes: "JC subject 'General Paper English' has no H1/H2 indicator"

### 2. Centres with UNKNOWN Levels (21 centres)

These centres have subjects but level information could not be determined:
- Level ranges marked as "UNKNOWN" in the data
- Ambiguous level specifications (e.g., "O level/IP context")
- Missing level details in source

**Impact:** Subjects are stored but without level associations in the database.

### 3. Centres with Invalid Subjects (12 centres)

These centres have subjects that don't map to canonical academic subjects:
- Enrichment programs (e.g., "Chinese Enrichment", "Chinese 4Cs")
- Skill-based programs (e.g., "Creative Writing", "Oral", "Problem Solving")
- Non-standard subject names (e.g., "Sciences/Maths", "PSLE A* Writer")

**Examples:**
- Lil But Mighty English: 12 invalid subjects (all skill-based components)
- Mathnasium: 9 invalid subjects (all skill-based topics)
- MathNous: 11 invalid subjects (all topic-based programs)

### 4. Centres with No Valid Subjects (9 centres)

These centres have NO subjects after normalization:
- Chinese Wonderland Learning Centre
- Crestar Learning Centre
- Eye Level @ Katong
- Kumon
- Lil But Mighty English
- Mathnasium
- MindSpace @ The Flow
- Moyuan Culture Education Centre
- Novel Learning Centre

**Reason:** All subjects were either enrichment programs or could not be extracted from source.

---

## Sample Centres by Quality Status

### ✅ OK Status (20 centres)

**Example: AM Academy**
- Subjects: 9 (Physics, English, Elementary Mathematics, Additional Mathematics, Chemistry, Biology, Combined Science, Economics, Principles of Accounting)
- Levels: 6 (Secondary 2, 3, 4, JC 1, 2)
- Quality: Clean data, all subjects and levels parsed successfully

**Example: Oasis Learning Centre**
- Subjects: 9 (English, Mathematics, Science, Chinese, Physics, Chemistry, Biology, Elementary Mathematics, Additional Mathematics)
- Levels: 10 (Primary 1-6, Secondary 1-4)
- Quality: Complete data with clear level ranges

### ⚠️ NEEDS_REVIEW Status (40 centres)

**Example: Altitude Tuition Centre**
- Subjects: 3 (Mathematics, Science, Chemistry)
- Levels: 8 (Primary 1-6, Secondary 1-2)
- Issues: Flagged for review, contains UNKNOWN levels
- Notes: "Secondary subjects 'Mathematics' and 'Science (Chem/Physics)' have UNKNOWN ranges"

**Example: Kumon**
- Subjects: 0
- Levels: 0
- Issues: Flagged for review, no valid subjects
- Notes: "The website explicitly states that Kumon offers 'enrichment programmes'"

---

## Database Schema Changes

### New Fields Added to `TuitionCentre` Model

```prisma
model TuitionCentre {
  // ... existing fields ...
  dataQualityStatus   String    @default("OK")  // "OK" or "NEEDS_REVIEW"
  dataQualityNotes    String?                   // Details about quality issues
  
  @@index([dataQualityStatus])
}
```

### Migration Applied

- Migration: `20260203185906_add_data_quality_fields`
- Status: Successfully applied
- Database: SQLite (dev.db)

---

## Comparison: Old vs New Policy

| Metric | Old Policy | New Policy | Change |
|--------|-----------|------------|--------|
| Centres inserted | 20 | 60 | +40 (+200%) |
| Centres skipped | 40 | 0 | -40 (-100%) |
| Data quality tracking | ❌ No | ✅ Yes | New feature |
| Quality notes | ❌ No | ✅ Yes | New feature |
| UNKNOWN levels | Blocked | Flagged | Policy change |
| Invalid subjects | Blocked | Flagged | Policy change |

---

## Recommendations

### 1. Review Flagged Centres

Query centres needing review:
```javascript
const needsReview = await prisma.tuitionCentre.findMany({
  where: { dataQualityStatus: 'NEEDS_REVIEW' },
  include: { subjects: true, levels: true }
});
```

### 2. Handle Centres with No Subjects

9 centres have no valid subjects. Options:
- Manual data entry from source websites
- Mark as "enrichment only" centres
- Remove from search results until data is complete

### 3. Resolve UNKNOWN Levels

21 centres have UNKNOWN levels. Actions:
- Review source websites for level information
- Contact centres directly for clarification
- Use heuristics (e.g., if subject is "PSLE Math", assume Primary 5-6)

### 4. Validate Invalid Subjects

12 centres have invalid subjects filtered out. Consider:
- Expanding canonical subject list
- Creating subject aliases/mappings
- Manual review of filtered subjects

---

## Next Steps

1. ✅ **COMPLETED:** Insert all 60 centres with quality flags
2. ✅ **COMPLETED:** Add `dataQualityStatus` and `dataQualityNotes` fields
3. ⏳ **TODO:** Review and fix centres with `NEEDS_REVIEW` status
4. ⏳ **TODO:** Add manual data for centres with no subjects
5. ⏳ **TODO:** Resolve UNKNOWN level ranges
6. ⏳ **TODO:** Update search/filter logic to handle quality flags

---

## Technical Details

### Scripts Used

1. **`scripts/generate-ingestion-report.js`** - Analysis script
2. **`scripts/ingest-all-centres.js`** - New ingestion script with quality flags

### Canonical Subjects (19 total)

- Mathematics
- English
- Science
- Chinese
- Physics
- Chemistry
- Biology
- Elementary Mathematics
- Additional Mathematics
- Combined Science
- Economics
- Geography
- History
- Literature
- Principles of Accounting
- Social Studies
- General Paper
- Higher Chinese
- Malay

### Levels (12 total)

- Primary 1, 2, 3, 4, 5, 6
- Secondary 1, 2, 3, 4
- JC 1, 2

---

## Conclusion

The new ingestion policy successfully inserted **all 60 centres** from the Excel file, compared to only 20 centres with the old policy. Data quality issues are now tracked systematically using the `dataQualityStatus` and `dataQualityNotes` fields, allowing for:

- Complete data coverage
- Systematic quality tracking
- Prioritized manual review
- Better user experience (more results)

**Success Rate:** 100% (60/60 centres inserted)  
**Quality Rate:** 33.3% (20/60 centres with OK status)  
**Review Queue:** 40 centres flagged for manual review
