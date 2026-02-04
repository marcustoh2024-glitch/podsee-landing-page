# Centres-Only Mode Implementation ✅

**Date:** February 4, 2026  
**Status:** All 4 stages complete

---

## Summary

The system now gracefully handles centres-only datasets (no offerings/levels/subjects). When offerings = 0:
- API defensively ignores level/subject filters
- UI detects centres-only mode and hides filter UI
- Users see all 60 centres with clear messaging

---

## Stage 1: Debug Display ✅

**Location:** `src/app/results/page.jsx`

Added temporary debug panel showing:
- URL query params (level, subject)
- Exact API request URL
- Number of centres returned vs total
- Centres-only mode status
- Request timestamp

**How to see it:** Visit `/results?levels=Secondary&subjects=English`

---

## Stage 2: API Defensive Logic ✅

**Location:** `src/lib/services/tuitionCentreService.js`

**Changes:**
```javascript
// Check if offerings exist system-wide
const offeringsCount = await this.prisma.offering.count();

if (offeringsCount === 0 && (levels || subjects)) {
  console.log('⚠️  CENTRES-ONLY MODE: Ignoring level/subject filters');
  // Clear filters to show all centres
  filters.levels = undefined;
  filters.subjects = undefined;
}
```

**Behavior:**
- Before applying filters, check if ANY offerings exist
- If offerings = 0, ignore level/subject filters entirely
- Still respects search/pagination parameters
- Logs warning to console for debugging

**Test:**
```bash
curl "http://localhost:3001/api/tuition-centres?levels=Secondary&subjects=English"
# Returns all 60 centres (ignores filters)
```

---

## Stage 3: UI Resilience ✅

**Location:** `src/app/results/page.jsx`

**Changes:**

### 1. Centres-Only Mode Detection
```javascript
const allCentresHaveNoOfferings = data.data?.every(
  centre => (!centre.levels || centre.levels.length === 0) && 
            (!centre.subjects || centre.subjects.length === 0)
)
setCentresOnlyMode(allCentresHaveNoOfferings && data.data?.length > 0)
```

### 2. Notice Banner
When filters are applied but offerings = 0:
```
ℹ️ Filters temporarily disabled
No offerings data yet, so filters are temporarily disabled. 
Showing all centres for now.
```

### 3. Hide Filter Chips
- Filter chips (level/subject badges) hidden in centres-only mode
- "Matched on" section hidden
- "All levels/subjects offered" section hidden

**Result:** Clean UI that doesn't show misleading filter information

---

## Stage 4: Verification Script ✅

**Script:** `scripts/system-status.js`

**Usage:**
```bash
node scripts/system-status.js
```

**Output:**
```
🔍 SYSTEM STATUS CHECK

📊 Database Counts:
   Total centres: 60
   Total offerings: 0
   Distinct levels: 0
   Distinct subjects: 0

🎯 Filter Status:
   ❌ FILTERS DISABLED
   Reason: No offerings data in database
   Action: UI must ignore level/subject filters
   Display: Show all centres, hide filter UI
```

**Exit Codes:**
- `0` = Filters enabled (offerings exist)
- `1` = Filters disabled (no offerings)
- `2` = Error

---

## Test Suite ✅

**Script:** `scripts/test-centres-only-mode.js`

**Tests:**
1. ✅ No filters → Returns all 60 centres
2. ✅ With level filter → Ignores filter, returns all 60
3. ✅ With level + subject → Ignores filters, returns all 60
4. ✅ Centres have empty offerings → All have `levels: []`, `subjects: []`

**Run:**
```bash
node scripts/test-centres-only-mode.js
```

---

## Current System State

### Database
- **Centres:** 60 (from database_ready_v1)
- **Offerings:** 0
- **Levels:** 0
- **Subjects:** 0

### API Behavior
- `/api/tuition-centres` → Returns all 60 centres
- `/api/tuition-centres?levels=X` → Ignores filter, returns all 60
- `/api/tuition-centres?subjects=Y` → Ignores filter, returns all 60
- `/api/tuition-centres?levels=X&subjects=Y` → Ignores filters, returns all 60

### UI Behavior
- `/results` → Shows all 60 centres
- `/results?levels=X&subjects=Y` → Shows all 60 centres + notice banner
- Debug panel shows: "Centres-Only Mode: YES"
- Filter chips hidden
- Offerings sections hidden

---

## User Experience

### Before Offerings Ingestion
1. User visits homepage
2. Selects "Secondary" + "English" (if filters visible)
3. Clicks search
4. Sees notice: "Filters temporarily disabled"
5. Sees all 60 centres (not 0)
6. Can browse and contact centres normally

### After Offerings Ingestion
1. Run offerings import script
2. System automatically enables filters
3. `node scripts/system-status.js` shows "FILTERS ENABLED"
4. UI shows filter chips and offerings
5. Filters work as expected

---

## Next Steps

### To Enable Filters
1. Obtain offerings dataset (level + subject combinations per centre)
2. Run offerings ingestion script
3. Verify with `node scripts/system-status.js`
4. Filters automatically activate

### To Remove Debug Panel
Once verified working, remove the debug panel from `src/app/results/page.jsx`:
```javascript
// Remove this block:
{debugInfo && (
  <div className="mb-4 p-4 bg-yellow-50...">
    ...
  </div>
)}
```

---

## Verification Checklist

✅ API ignores filters when offerings = 0  
✅ API returns all centres regardless of filter params  
✅ UI detects centres-only mode  
✅ UI hides filter chips in centres-only mode  
✅ UI shows notice banner when filters applied  
✅ UI hides offerings sections  
✅ Debug panel shows correct info  
✅ System status script works  
✅ Test suite passes  
✅ 60 centres visible in browser  

---

## Files Modified

### Backend
- `src/lib/services/tuitionCentreService.js` - Added defensive filter logic

### Frontend
- `src/app/results/page.jsx` - Added centres-only detection + UI changes

### Scripts
- `scripts/system-status.js` - One-command status check
- `scripts/test-centres-only-mode.js` - Automated test suite

---

**Status:** ✅ System is production-ready for centres-only datasets. Filters will automatically activate when offerings are added.
