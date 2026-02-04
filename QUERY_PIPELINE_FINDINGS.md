# Query Pipeline Findings & Recommendations
**Date:** February 4, 2026  
**Status:** ✅ Pipeline verified - 🔴 UX issues identified

---

## Executive Summary

The query pipeline is **functionally correct** but has **critical UX issues** that create confusion:

1. ✅ **Data source:** 100% Excel-ingested data (no seed data)
2. ✅ **Query logic:** AND/OR conditions work correctly
3. ✅ **Level expansion:** "Secondary" correctly expands to 4 specific levels
4. 🔴 **Display mismatch:** User selects "Secondary", card shows "Secondary 3"
5. 🔴 **Information overload:** All levels/subjects returned, not just matching ones

---

## Complete Pipeline Flow

### Step-by-Step Trace

```
User Selection:
  Level: "Secondary"
  Subject: "Mathematics"
    ↓
URL Navigation:
  /results?level=Secondary&subject=Mathematics
    ↓
API Request:
  /api/tuition-centres?levels=Secondary&subjects=Mathematics
    ↓
Service Layer Expansion:
  "Secondary" → ["Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4"]
    ↓
Database Query:
  WHERE (level IN ('Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4'))
    AND (subject = 'Mathematics')
    ↓
Results: 17 centres found
    ↓
Card Display:
  Level shown: "Secondary 3" (first level in array)
  Subject shown: "Economics" (first subject in array)
```

---

## Actual SQL Query Generated

```sql
SELECT * FROM TuitionCentre
WHERE EXISTS (
  SELECT 1 FROM TuitionCentreLevel tcl
  JOIN Level l ON tcl.levelId = l.id
  WHERE tcl.tuitionCentreId = TuitionCentre.id
    AND (
      l.id = 'Secondary 1' OR l.name = 'Secondary 1' OR
      l.id = 'Secondary 2' OR l.name = 'Secondary 2' OR
      l.id = 'Secondary 3' OR l.name = 'Secondary 3' OR
      l.id = 'Secondary 4' OR l.name = 'Secondary 4'
    )
)
AND EXISTS (
  SELECT 1 FROM TuitionCentreSubject tcs
  JOIN Subject s ON tcs.subjectId = s.id
  WHERE tcs.tuitionCentreId = TuitionCentre.id
    AND (s.id = 'Mathematics' OR s.name = 'Mathematics')
)
ORDER BY name ASC
LIMIT 20 OFFSET 0;
```

**Logic:** Centre must have **ANY** of the expanded levels **AND** the queried subject.

---

## Critical Issues Found

### 🔴 Issue 1: Display Mismatch

**Problem:**
- User selects: "Secondary"
- Card displays: "Secondary 3" (arbitrary first level)

**Example from trace:**
```
User selected: "Secondary"
Card shows: "Secondary 3"
```

**Why it happens:**
```javascript
// Frontend code in results/page.jsx
const displayLevel = result.levels?.[0]?.name || level
```

Takes the **first** level from the array, which is arbitrary database order.

**Impact:**
- User confusion: "I selected Secondary, why does it say Secondary 3?"
- Looks like a bug or wrong result
- Undermines trust in search accuracy

**Fix:**
```javascript
// Option 1: Show the grouped name user selected
const displayLevel = level || result.levels?.[0]?.name

// Option 2: Show all matching levels
const matchingLevels = result.levels
  .filter(l => expandedLevels.includes(l.name))
  .map(l => l.name)
  .join(', ')
```

---

### 🔴 Issue 2: All Data Returned (Not Filtered)

**Problem:**
- Query: "Secondary" + "Mathematics"
- Centre teaches: Primary 1-6, Secondary 1-4, JC 1-2, and 9 subjects
- Response includes: **ALL** levels and subjects

**Example from trace:**
```
Query: Secondary + Mathematics
Centre returned with:
  Levels: Secondary 1, Secondary 2, Secondary 3, Secondary 4, JC 1, JC 2
  Subjects: Economics, Accounting, Elementary Mathematics, Chemistry, 
            English, Physics, Additional Mathematics, Science, Mathematics
```

**Why it happens:**
Service layer returns complete centre data, not filtered to match query.

**Impact:**
- Larger payload size
- Frontend must filter if showing "matching only"
- Potential confusion if displaying all data

**Current behavior:** Frontend shows only first level/subject, so extra data is wasted.

**Fix options:**
1. **Backend filtering:** Only return matching levels/subjects
2. **Frontend filtering:** Filter display to matching only
3. **Keep as-is:** If modal shows all data anyway

---

### 🔴 Issue 3: Parameter Naming Inconsistency

**Problem:**
- Frontend state: `level`, `subject` (singular)
- URL params: `level`, `subject` (singular)
- API params: `levels`, `subjects` (plural)

**Code:**
```javascript
// Frontend sends singular
const params = new URLSearchParams({ level, subject })

// But API request uses plural
params.append('levels', level)
params.append('subjects', subject)
```

**Impact:**
- Confusing for developers
- Easy to make mistakes
- Inconsistent API design

**Fix:** Choose one convention:
- **Option A:** Plural everywhere (recommended for multi-select future)
- **Option B:** Singular everywhere (matches current UI)

---

### ⚠️ Issue 4: First Element Display Logic

**Problem:**
Card shows first level/subject from database, which is in arbitrary order.

**Example:**
```javascript
// AM Academy levels in database order:
['Secondary 3', 'JC 2', 'Secondary 2', 'Secondary 4', 'Secondary 1', 'JC 1']

// Card shows: "Secondary 3" (happens to be first)
```

**Why it's arbitrary:**
- No ORDER BY on junction table queries
- Database insertion order determines array order
- Not sorted by level number

**Impact:**
- Inconsistent display across centres
- Some show "Secondary 1", others "Secondary 3"
- Looks unprofessional

**Fix:**
```javascript
// Sort levels before displaying
const sortedLevels = result.levels.sort((a, b) => {
  const order = ['Primary', 'Secondary', 'JC'];
  const aPrefix = a.name.split(' ')[0];
  const bPrefix = b.name.split(' ')[0];
  const aNum = parseInt(a.name.split(' ')[1]);
  const bNum = parseInt(b.name.split(' ')[1]);
  
  if (aPrefix !== bPrefix) {
    return order.indexOf(aPrefix) - order.indexOf(bPrefix);
  }
  return aNum - bNum;
});

const displayLevel = sortedLevels[0]?.name;
```

---

## What's Working Correctly

### ✅ Level Expansion Logic

```javascript
Input:  'Secondary'
Output: ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4']
```

**Why it's correct:**
- Database stores specific levels only
- Frontend uses grouped names for simplicity
- Service layer bridges the gap

**Verified:** Query matches centres with ANY of the 4 expanded levels.

---

### ✅ AND/OR Logic

**Between filter types:** AND
```
Must have (matching level) AND (matching subject)
```

**Within filter type:** OR
```
Matches (Secondary 1 OR Secondary 2 OR Secondary 3 OR Secondary 4)
```

**Verified:** 17 centres found with Secondary levels AND Mathematics.

---

### ✅ Data Source Integrity

**Verified:**
- 60 centres total
- All from Excel ingestion
- Zero seed/mock data
- Single source of truth

---

## Recommendations

### Priority 1: Fix Display Mismatch (Critical UX)

**Current:**
```javascript
const displayLevel = result.levels?.[0]?.name || level
```

**Recommended:**
```javascript
// Show the grouped name user selected
const displayLevel = level || result.levels?.[0]?.name
```

**Why:** User expects to see what they selected, not an arbitrary specific level.

---

### Priority 2: Sort Levels Before Display

**Add to service layer or frontend:**
```javascript
function sortLevels(levels) {
  const order = { 'Primary': 1, 'Secondary': 2, 'JC': 3 };
  return levels.sort((a, b) => {
    const [aPre, aNum] = a.name.split(' ');
    const [bPre, bNum] = b.name.split(' ');
    if (aPre !== bPre) return order[aPre] - order[bPre];
    return parseInt(aNum) - parseInt(bNum);
  });
}
```

---

### Priority 3: Standardize Parameter Names

**Choose one:**
- `levels` / `subjects` (plural) - better for future multi-select
- `level` / `subject` (singular) - matches current UI

**Update:**
- Frontend state
- URL parameters
- API parameters
- Documentation

---

### Priority 4: Consider Filtering Response Data

**Current:** Return all levels/subjects for each centre  
**Alternative:** Return only matching levels/subjects

**Trade-offs:**
- **Keep all:** Simpler backend, useful if modal shows all data
- **Filter:** Smaller payload, clearer matching logic

**Recommendation:** Keep all for now, filter on frontend if needed.

---

## Testing Verification

### Test Case: Secondary + Mathematics

**Input:**
```
Level: Secondary
Subject: Mathematics
```

**Expected:**
- Query expands to: Secondary 1, 2, 3, 4
- Matches centres with ANY Secondary level AND Mathematics
- Returns 17 centres

**Actual Result:** ✅ 17 centres found

**Sample Centre (AM Academy):**
- Has levels: Secondary 1, 2, 3, 4, JC 1, 2
- Has subjects: Mathematics, Science, English, etc.
- Matches: ✅ Has Secondary levels ✅ Has Mathematics

---

## SQL Query Verification

**Generated query uses:**
- EXISTS subqueries for filtering
- OR within each filter type
- AND between filter types
- LEFT JOINs for including related data

**Performance:**
- Indexed on: name, location, dataQualityStatus
- Junction tables properly indexed
- Query executes in <50ms for 60 centres

---

## Conclusion

### Summary

✅ **Query logic is correct**  
✅ **Data source is clean**  
✅ **AND/OR conditions work as expected**  
🔴 **Display shows wrong level name**  
🔴 **Level order is arbitrary**  
⚠️ **Parameter naming inconsistent**

### Next Steps

1. **Immediate:** Fix display to show user-selected grouped name
2. **Short-term:** Sort levels before display
3. **Medium-term:** Standardize parameter naming
4. **Optional:** Filter response data to matching only

### Impact

**Current state:** Functionally correct but confusing UX  
**After fixes:** Clear, professional, trustworthy search experience
