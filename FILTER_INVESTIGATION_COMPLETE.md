# Filter Investigation - Complete Report

## Investigation Summary

✅ **Investigation Complete** - Comprehensive debugging added and root causes identified.

## What Was Done

### 1. Database Analysis
- Verified all 60 centres are in the database
- Confirmed 1,980 offerings exist
- Validated NEEDS_REVIEW centres are NOT being excluded
- Tested specific filter combinations at database level

### 2. Debug Logging Added

Added comprehensive debug logging to `src/lib/services/tuitionCentreService.js`:

```javascript
// Logs show:
🔍 FILTER DEBUG - Incoming filters
📊 Total centres before filtering
📝 Level expansion (e.g., "JC" → ["JC 1", "JC 2"])
🔗 Filter strategy (AND/OR logic)
🔎 Final Prisma where clause
✅ Query results (total + page count)
📊 Data quality status breakdown
```

### 3. Test Scripts Created

Created multiple test scripts to validate behavior:
- `scripts/debug-filter-execution.js` - Database-level filter testing
- `scripts/test-api-with-debug.js` - Service layer testing
- `scripts/test-ui-flow.js` - UI flow simulation (requires dev server)

## Key Findings

### ✅ Filter Logic is Working Correctly

All filter combinations return accurate results:

| Filter | Expected Behavior | Actual Result | Status |
|--------|------------------|---------------|--------|
| No filters | All 60 centres | 60 | ✅ |
| JC only | Centres with JC offerings | 25 | ✅ |
| English only | Centres with English offerings | 21 | ✅ |
| JC + English | Centres with English AT JC level | 11 | ✅ |
| Secondary + Math | Centres with Math AT Secondary | 17 | ✅ |
| Primary + English | Centres with English AT Primary | 18 | ✅ |

### ✅ NEEDS_REVIEW Status is NOT Excluded

- 40 out of 60 centres have NEEDS_REVIEW status
- These centres appear in all search results
- Example: 10 out of 11 JC + English results have NEEDS_REVIEW status
- The status is informational only and doesn't affect filtering

### ✅ Level Expansion Works Correctly

The service properly expands grouped level names:
- "Primary" → ["Primary 1", "Primary 2", ..., "Primary 6"]
- "Secondary" → ["Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4"]
- "JC" → ["JC 1", "JC 2"]
- "Junior College" → ["JC 1", "JC 2"]

## Why Users See "Fewer" Results

### Reason 1: Accurate Filtering (Not a Bug!)

When users select **JC + English**, they get 11 results because:
- Only 11 centres actually offer English specifically at JC level
- The filter requires BOTH level AND subject to match on the same offering
- This is semantically correct: "Show me centres where I can study English at JC level"

### Reason 2: Data Reality

The Excel file has 60 centres, but:
- Not all centres offer all subjects at all levels
- Some centres specialize in specific combinations
- Example: A centre might offer JC (Physics, Chemistry, Math) but NOT JC English

### Reason 3: Filter Logic (By Design)

Current implementation uses **AND logic on same offering**:
```
Centre matches IF:
  Has offering WHERE (level = JC) AND (subject = English)
```

Alternative would be **OR logic on separate offerings**:
```
Centre matches IF:
  (Has ANY offering with level = JC) AND (Has ANY offering with subject = English)
```

The current approach is more accurate for the use case.

## Recommendations

### 1. Add UI Clarity (High Priority) ⭐

**Problem:** Users might not understand why they get "few" results.

**Solution:** Add explanatory text in the UI:

```jsx
// In FilterWizard.jsx, add after subject selection:
<div className="p-3 bg-surface-container-low rounded-lg text-body-small text-on-surface-variant">
  <p className="font-medium mb-1">How filtering works:</p>
  <p>Results show centres that offer your selected subject at your selected level.</p>
  <p className="mt-1 text-label-small">
    Example: "JC + English" shows centres that teach English at JC level specifically.
  </p>
</div>
```

**In results page, when count is low:**

```jsx
{results.length > 0 && results.length < 5 && (
  <div className="mb-4 p-3 bg-tertiary-container rounded-lg text-body-small">
    <p className="font-medium text-on-tertiary-container mb-1">
      Limited results?
    </p>
    <p className="text-on-tertiary-container/80">
      This combination is specialized. Try adjusting your filters to see more options.
    </p>
  </div>
)}
```

### 2. Add Real-Time Result Count (Medium Priority)

**Problem:** Users don't know how many results they'll get before clicking "Apply".

**Solution:** Show live count as they select filters:

```jsx
// In FilterWizard.jsx
const [resultCount, setResultCount] = useState(null);

useEffect(() => {
  if (filters.level && filters.subject) {
    // Fetch count without navigating
    fetch(`/api/tuition-centres?levels=${filters.level}&subjects=${filters.subject}`)
      .then(r => r.json())
      .then(data => setResultCount(data.pagination.total));
  }
}, [filters]);

// Show in button:
<button>
  Apply filters {resultCount !== null && `(${resultCount} centres)`}
</button>
```

### 3. Add "Broaden Search" Option (Low Priority)

**Problem:** Users with 0 results might want to see related centres.

**Solution:** Add a toggle for "flexible matching":

```jsx
// Option to switch between:
// - Exact match: Level + Subject on same offering (current)
// - Flexible match: Has level offerings AND has subject offerings (separate)
```

### 4. Improve Empty State (Low Priority)

Current empty state is good, but could add:
- "Similar centres" that match one filter
- "Popular combinations" that have more results
- Direct link to remove one filter

## Testing the Debug Logs

### To see debug logs in action:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Make a search in the UI** or **run test script:**
   ```bash
   node scripts/test-api-with-debug.js
   ```

3. **Check the console** for detailed filter execution trace:
   ```
   🔍 FILTER DEBUG - Incoming filters: { levels: ['JC'], subjects: ['English'] }
   📊 Total centres before filtering: 60
   📝 Level expansion: { original: ['JC'], expanded: ['JC 1', 'JC 2'] }
   🔗 Using AND logic: level + subject must match on SAME offering row
   ✅ Query results: { totalMatching: 11, returnedInPage: 11 }
   📊 Data quality status in results: { OK: 1, NEEDS_REVIEW: 10 }
   ```

## Conclusion

### ✅ No Bugs Found

The filter system is working exactly as designed:
- All 60 centres are searchable
- NEEDS_REVIEW centres are included
- Filter logic is semantically correct
- Results accurately reflect the data

### 📊 Data Reality

"Low" result counts for specific combinations (like JC + English = 11) are accurate:
- Not a bug in the code
- Not centres being excluded
- Simply reflects that few centres offer that specific combination

### 🎯 Next Steps

1. **Keep debug logging** - Helpful for future troubleshooting
2. **Add UI clarity** - Help users understand the filtering behavior
3. **Consider result count preview** - Show count before applying filters
4. **Monitor user feedback** - See if users find the results helpful

## Files Modified

- ✅ `src/lib/services/tuitionCentreService.js` - Added debug logging
- ✅ `scripts/debug-filter-execution.js` - Database-level tests
- ✅ `scripts/test-api-with-debug.js` - Service-level tests
- ✅ `scripts/test-ui-flow.js` - UI flow simulation
- ✅ `FILTER_DEBUG_FINDINGS.md` - Detailed findings
- ✅ `FILTER_INVESTIGATION_COMPLETE.md` - This report

## Debug Logs Can Be Removed

If the debug logs are too verbose for production, you can:

1. **Keep them** - They're helpful and don't impact performance
2. **Make them conditional:**
   ```javascript
   const DEBUG = process.env.NODE_ENV === 'development';
   if (DEBUG) console.log(...);
   ```
3. **Remove them** - The investigation is complete and documented

---

**Investigation completed:** February 4, 2026
**Status:** ✅ All systems working correctly
**Action required:** Consider UI improvements for user clarity
