# Filter Logic Verification Results

## ✅ All Requirements Verified

Date: February 4, 2026

### Summary

All filter behavior requirements have been verified and confirmed working correctly:

1. ✅ **Empty filters return all centres**
2. ✅ **Multiple selections within same filter type use OR logic**
3. ✅ **Location + Level + Subject combined using AND logic**
4. ✅ **Impossible combinations return zero centres (no crash)**

---

## Test Results (16/16 Passed)

### Requirement 1: Empty Filters Return All Centres

| Test | Status | Result |
|------|--------|--------|
| 1.1 No filters provided | ✅ PASS | Returns all 10 centres |
| 1.2 Empty arrays for filters | ✅ PASS | Returns all 10 centres |
| 1.3 Empty search string | ✅ PASS | Returns all 10 centres |

**Verification:** When no filters are applied, the API correctly returns all 10 tuition centres in the database.

---

### Requirement 2: Multiple Selections Within Same Filter Use OR Logic

| Test | Status | Result |
|------|--------|--------|
| 2.1 Multiple levels: Primary OR Secondary | ✅ PASS | Returns 9 centres with Primary OR Secondary |
| 2.2 Multiple subjects: Physics OR Chemistry | ✅ PASS | Returns 4 centres with Physics OR Chemistry |
| 2.3 Multiple subjects: English OR Chinese | ✅ PASS | Returns 7 centres with English OR Chinese |

**Verification:** When multiple values are provided for the same filter type (e.g., `levels: ['Primary', 'Secondary']`), the system correctly uses OR logic, returning centres that match ANY of the specified values.

**Examples:**
- `levels: ['Primary', 'Secondary']` → Returns centres with Primary OR Secondary (9 centres)
- `subjects: ['Physics', 'Chemistry']` → Returns centres with Physics OR Chemistry (4 centres)

---

### Requirement 3: Location + Level + Subject Combined Using AND Logic

| Test | Status | Result |
|------|--------|--------|
| 3.1 Search (location) AND Level | ✅ PASS | Returns 1 centre matching Bishan AND Primary |
| 3.2 Level AND Subject | ✅ PASS | Returns 4 centres with JC AND Physics |
| 3.3 Search + Level + Subject | ✅ PASS | Returns 1 centre matching Tampines AND Secondary AND Mathematics |
| 3.4 Complex: (Primary OR Secondary) AND (Math OR English) | ✅ PASS | Returns 9 centres correctly |

**Verification:** Different filter types are combined using AND logic. A centre must satisfy ALL filter types to be included in results.

**Examples:**
- `search: 'Bishan', levels: ['Primary']` → Only centres in Bishan that have Primary level (1 centre)
- `levels: ['Junior College'], subjects: ['Physics']` → Only centres with JC that teach Physics (4 centres)
- `search: 'Tampines', levels: ['Secondary'], subjects: ['Mathematics']` → Only centres in Tampines with Secondary level teaching Math (1 centre)

**Complex Logic:**
- `levels: ['Primary', 'Secondary'], subjects: ['Mathematics', 'English']`
- Translates to: (Primary OR Secondary) AND (Mathematics OR English)
- Returns 9 centres that have at least one of the levels AND at least one of the subjects

---

### Requirement 4: Impossible Combinations Return Zero Centres (No Crash)

| Test | Status | Result |
|------|--------|--------|
| 4.1 Non-existent level | ✅ PASS | Returns 0 centres, no crash |
| 4.2 Non-existent subject | ✅ PASS | Returns 0 centres, no crash |
| 4.3 Non-existent location | ✅ PASS | Returns 0 centres, no crash |
| 4.4 Impossible: Primary + Physics | ✅ PASS | Returns 0 centres, no crash |
| 4.5 Impossible: Non-existent location + valid filters | ✅ PASS | Returns 0 centres, no crash |
| 4.6 Multiple impossible values | ✅ PASS | Returns 0 centres, no crash |

**Verification:** The system gracefully handles impossible or non-existent filter combinations without crashing, returning an empty result set.

**Examples:**
- `levels: ['University']` → 0 centres (level doesn't exist)
- `subjects: ['Quantum Mechanics']` → 0 centres (subject doesn't exist)
- `search: 'Antarctica'` → 0 centres (location doesn't exist)
- `levels: ['Primary'], subjects: ['Physics']` → 0 centres (Primary schools don't teach Physics in our data)

---

## Implementation Details

### Filter Logic in Code

The filter logic is implemented in `src/lib/services/tuitionCentreService.js`:

```javascript
// Build where clause with AND logic between filter types
const whereConditions = [];

// Search filter (name OR location)
if (search && search.trim()) {
  whereConditions.push({
    OR: [
      { name: { contains: search.trim() } },
      { location: { contains: search.trim() } }
    ]
  });
}

// Level filter (OR logic within levels)
if (levels && levels.length > 0) {
  whereConditions.push({
    levels: {
      some: {
        level: {
          OR: levels.flatMap(level => [
            { id: level },
            { name: { equals: level } }
          ])
        }
      }
    }
  });
}

// Subject filter (OR logic within subjects)
if (subjects && subjects.length > 0) {
  whereConditions.push({
    subjects: {
      some: {
        subject: {
          OR: subjects.flatMap(subject => [
            { id: subject },
            { name: { equals: subject } }
          ])
        }
      }
    }
  });
}

// Combine all filters with AND logic
const where = whereConditions.length > 0 ? { AND: whereConditions } : {};
```

### Key Points

1. **Empty filters:** When `whereConditions` array is empty, the query returns all records
2. **OR within filter type:** Multiple values for the same filter use Prisma's `OR` operator
3. **AND between filter types:** Different filter types are combined in the `whereConditions` array, which uses Prisma's `AND` operator
4. **Graceful handling:** Non-existent values simply don't match any records, returning empty results without errors

---

## Running the Verification

To run the comprehensive verification script:

```bash
node scripts/verify-filter-logic.js
```

This script tests all 16 scenarios and provides detailed output for each test case.

---

## Conclusion

The filter implementation correctly handles all specified requirements:

- ✅ Empty filters return all centres
- ✅ Multiple selections within same filter type use OR logic
- ✅ Different filter types (location, level, subject) are combined using AND logic
- ✅ Impossible combinations return zero centres without crashing

The system is robust, handles edge cases gracefully, and implements the expected boolean logic correctly.
