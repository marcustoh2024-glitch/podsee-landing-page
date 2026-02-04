# Data Ingestion Summary

## Overview
Successfully ingested 60 tuition centres from Marine Parade into the database with strict subject normalization.

## Results

### Data Imported
- **Tuition Centres**: 60 centres from Marine Parade
- **Canonical Subjects**: 19 academic subjects (normalized from 134 raw entries)
- **Education Levels**: 12 levels (Primary 1-6, Secondary 1-4, JC 1-2)

### Normalization Statistics
- **Subjects Normalized**: 441 subject-level pairs processed
- **Subjects Filtered Out**: 65 non-academic entries removed
- **Centres with UNKNOWN Levels**: 21 centres (35%)

## Subject Normalization

### Canonical Subjects Created
The following 19 academic subjects are now available for filtering:

1. Accounting
2. Additional Mathematics
3. Biology
4. Chemistry
5. China Studies
6. Chinese
7. Combined Science
8. Economics
9. Elementary Mathematics
10. English
11. General Paper
12. Geography
13. History
14. Literature
15. Mathematics
16. Physics
17. Science
18. Social Studies
19. Tamil

### Normalization Rules Applied

**Consolidated Variations:**
- Math/Maths/Mathematics → Mathematics
- E-Math/E Math/Elementary Math → Elementary Mathematics
- A-Math/A Math/Additional Math → Additional Mathematics
- Pure Physics/Physics → Physics
- Pure Chemistry/Chemistry → Chemistry

**Removed Qualifiers:**
- "(O Level)", "(IP)", "(IB)", "(H1/H2)" qualifiers stripped
- Example: "Mathematics (IP)" → "Mathematics"

**Filtered Out (65 entries):**
- Program names: "PSLE A* Writer", "Chinese 4Cs"
- Marketing labels: "Excellence in Writing"
- Revision packages: "S4 AMath Intensive Revision"
- Skill components: "Creative Writing", "Comprehension"
- Math topics: "Fractions", "Algebra", "Statistics"
- Category labels: "Primary", "Secondary", "H1", "H2"

## UNKNOWN Level Handling

**21 centres have UNKNOWN level ranges**, meaning the source data didn't specify which grades the subject is offered for.

**Behavior:**
- ✅ Centres are inserted into the database
- ✅ Centres appear in location + subject searches
- ❌ Centres are excluded from level-specific filters
- ✅ This is the correct behavior - we don't want to show centres that might not actually offer the level

**Examples of centres with UNKNOWN levels:**
- Eye Level @ Katong (no levels specified)
- Aspire Hub (some subjects have UNKNOWN levels)
- Altitude Tuition Centre (some subjects have UNKNOWN levels)

## Verification Results

### API Tests Passed ✅

**Test 1: Subject + Location Filter**
```
Mathematics in Marine Parade: 53 centres
Physics in Marine Parade: 36 centres
Chinese in Marine Parade: 38 centres
Economics in Marine Parade: 26 centres
```

**Test 2: Level Filter**
```
Primary 1: 68 centres
Primary 6: 84 centres
Secondary 3: 59 centres
JC 1: 50 centres
```

**Test 3: Combined Filter (Subject + Level)**
```
Mathematics at Primary 6: 46 centres
Physics at Secondary 4: 28 centres
Economics at JC 2: 26 centres
```

**Test 4: UNKNOWN Level Exclusion**
```
Centres with no levels: 10 centres
These centres exist but don't match level filters ✅
```

## Data Quality

### Strengths
- ✅ Strict normalization ensures trustworthy filters
- ✅ Only academic subjects (no marketing fluff)
- ✅ Consistent naming across all centres
- ✅ UNKNOWN levels handled gracefully

### Known Issues
- ⚠️ WhatsApp numbers missing (field exists but empty)
- ⚠️ 21 centres have incomplete level information
- ⚠️ 10 centres have no level information at all
- ⚠️ Database contains 29 subjects (vs 19 canonical) due to previous imports with qualifiers

### Recommendations
1. **WhatsApp Numbers**: Collect separately or scrape from websites
2. **UNKNOWN Levels**: Manual review of flagged centres to fill in missing data
3. **Subject Cleanup**: Consider merging duplicate subjects from previous imports:
   - "Biology (IB)" → "Biology"
   - "Chemistry (IB)" → "Chemistry"
   - "Physics (IB)" → "Physics"
   - "Mathematics (IB)" → "Mathematics"
   - "Science (IB)" → "Science"
   - "China Studies in English" → "China Studies"
   - "Literature in English" → "Literature"
   - "Combined Science (Physics / Chemistry)" → "Combined Science"
   - "Principles of Accounting" → "Accounting"
   - "Higher Chinese" → "Chinese"
4. **Duplicate Centres**: Some centres appear twice (e.g., "AM Academy") - from previous imports

## Files Created

### Scripts
- `scripts/subject-normalization.js` - Subject normalization map
- `scripts/ingest-tuition-centres.js` - Main ingestion script
- `scripts/verify-ingestion.js` - Verification tests
- `scripts/dry-run-ingestion.js` - Dry run analysis
- `scripts/analyze-excel-data.js` - Excel data analyzer

### Documentation
- `DATA_INGESTION_SUMMARY.md` - This file

## Next Steps

1. ✅ Data is live and working in the UI
2. ✅ Filters are functioning correctly
3. ⏭️ Collect WhatsApp numbers for centres
4. ⏭️ Review and fix centres with UNKNOWN levels
5. ⏭️ Remove duplicate centres if needed
6. ⏭️ Expand to other locations beyond Marine Parade

## Usage

To re-run the ingestion (will create duplicates):
```bash
node scripts/ingest-tuition-centres.js
```

To verify the data:
```bash
node scripts/verify-ingestion.js
```

To analyze new Excel files:
```bash
node scripts/analyze-excel-data.js
```
