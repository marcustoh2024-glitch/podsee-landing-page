# Filter Debug Findings

## Executive Summary

✅ **The filter logic is working correctly!** The system is returning accurate results based on the data in the database.

## Key Findings

### 1. Database State
- **Total centres in database:** 60
- **Centres with OK status:** 20
- **Centres with NEEDS_REVIEW status:** 40
- **Total offerings:** 1,980

### 2. Filter Results (All Correct)

| Filter Combination | Expected | Actual | Status |
|-------------------|----------|--------|--------|
| No filters | 60 | 60 | ✅ |
| JC only | 25 | 25 | ✅ |
| English only | 21 | 21 | ✅ |
| JC + English | 11 | 11 | ✅ |
| Secondary + Math | 17 | 17 | ✅ |
| Primary + English | 18 | 18 | ✅ |

### 3. Why JC + English Returns Only 11 Centres

**This is correct behavior!** The filter requires centres to have offerings that match BOTH:
- Level: JC 1 or JC 2
- Subject: English
- **On the same offering row**

Out of 60 centres:
- 25 centres offer JC (any subject)
- 21 centres offer English (any level)
- **Only 11 centres offer English specifically at JC level**

The 11 centres that match are:
1. AM Academy (OK)
2. Aspire Hub (NEEDS_REVIEW)
3. Augustine's English Classes (NEEDS_REVIEW)
4. HESS Education Centre (NEEDS_REVIEW)
5. Inspire Education Centre (NEEDS_REVIEW)
6. Mind Stretcher (NEEDS_REVIEW)
7. New Cambridge Education Centre (NEEDS_REVIEW)
8. The Alternative Story (NEEDS_REVIEW)
9. The Humanities Clinic (NEEDS_REVIEW)
10. The Impact Academy (NEEDS_REVIEW)
11. Zenith Education Studio (NEEDS_REVIEW)

### 4. NEEDS_REVIEW Status is NOT Excluded

**Important:** Centres with `NEEDS_REVIEW` status are **NOT** being filtered out:
- 10 out of 11 JC + English results have NEEDS_REVIEW status
- NEEDS_REVIEW centres appear in all filter results
- The status is purely informational and doesn't affect search results

## Debug Logging Added

The following debug logs have been added to `tuitionCentreService.js`:

1. **Incoming filters** - Shows what the API received
2. **Total centres before filtering** - Baseline count (always 60)
3. **Level expansion** - Shows how grouped levels (e.g., "JC") expand to specific levels
4. **Filter strategy** - Indicates whether using level-only, subject-only, or combined filtering
5. **Final Prisma query** - The exact database query being executed
6. **Query results** - Total matching centres and how many returned in current page
7. **Data quality breakdown** - Shows OK vs NEEDS_REVIEW distribution in results

## Example Debug Output

```
🔍 FILTER DEBUG - Incoming filters: {
  levels: [ 'JC' ],
  subjects: [ 'English' ]
}
📊 Total centres before filtering: 60
📝 Level expansion: { original: [ 'JC' ], expanded: [ 'JC 1', 'JC 2' ] }
🔗 Using AND logic: level + subject must match on SAME offering row
✅ Query results: { totalMatching: 11, returnedInPage: 11 }
📊 Data quality status in results: { OK: 1, NEEDS_REVIEW: 10 }
```

## Why Users Might See "Fewer" Results

### Scenario 1: Specific Combinations
If users select JC + English, they get 11 results because only 11 centres actually offer English at JC level. This is not a bug - it's accurate filtering.

### Scenario 2: Pagination
With default limit of 20 per page:
- No filters: Shows 20 of 60 (need to paginate)
- JC only: Shows 20 of 25 (need to paginate)
- JC + English: Shows all 11 (fits in one page)

### Scenario 3: User Expectations
Users might expect:
- "Show me centres that offer JC AND centres that offer English" (OR logic)
- But the system provides: "Show me centres that offer English AT JC level" (AND logic)

The current implementation is correct for the use case: "Find centres where I can study [subject] at [level]"

## Recommendations

### Option 1: Keep Current Behavior (Recommended)
The current logic is semantically correct for the use case. Users searching for "JC + English" want centres that teach English at JC level, not centres that teach JC (any subject) OR English (any level).

**Action:** Add UI clarity to explain the filter behavior.

### Option 2: Add Alternative Filter Mode
Provide a toggle for users to choose:
- "Exact match" (current): Level + Subject on same offering
- "Any match": Has level offerings AND has subject offerings (separate)

**Action:** Would require UI changes and additional API parameter.

### Option 3: Show Filter Preview
Display count of matching centres as users select filters, before they click search.

**Action:** Add real-time count API endpoint.

## Conclusion

✅ **No bugs found in filter logic**
✅ **NEEDS_REVIEW centres are included in results**
✅ **All 60 centres are searchable**
✅ **Filter combinations return accurate results**

The system is working as designed. The "low" result counts for specific combinations (like JC + English = 11) reflect the actual data: not many centres offer English specifically at JC level.
