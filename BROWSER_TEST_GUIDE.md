# 🌐 Browser Testing Guide - Rollback Verification

**Quick guide to manually verify the rollback in your browser**

---

## ✅ Pre-Test Checklist

1. **Dev server is running:** `npm run dev` (already running on port 3001)
2. **Database has data:** 60 centres confirmed ✓
3. **No console errors:** Server logs are clean ✓

---

## 🧪 Test Scenarios

### Test 1: Home Page - Filter Wizard Disabled

**URL:** `http://localhost:3001/`

**Expected:**
- ✅ Page loads without errors
- ✅ Filter wizard shows disabled banner:
  > "Filters temporarily disabled. No offerings data yet, so filters are disabled. Showing all centres for now."
- ✅ "Browse all centres" button is visible
- ✅ No filter options are selectable (greyed out)

**Actions:**
1. Open browser console (F12)
2. Navigate to home page
3. Check for any red errors in console
4. Verify banner is visible
5. Click "Browse all centres" button

**Result:** Should navigate to `/results` showing all 60 centres

---

### Test 2: Results Page - No Filters

**URL:** `http://localhost:3001/results`

**Expected:**
- ✅ Shows "60 centres found"
- ✅ Displays 20 centres per page (first page)
- ✅ Pagination shows correct info
- ✅ Each centre card shows:
  - Centre name
  - Location with pin icon
  - NO "Matched on" section
  - NO levels/subjects (since no offerings data)
- ✅ No errors in console

**Actions:**
1. Navigate to `/results`
2. Count centres on page (should be 20)
3. Check pagination info
4. Scroll through centres
5. Click a centre card to open modal

**Result:** All 60 centres accessible, no errors

---

### Test 3: Results Page - With Filters (Should Be Ignored)

**URL:** `http://localhost:3001/results?level=Secondary&subject=Mathematics`

**Expected:**
- ✅ Shows disabled banner at top:
  > "Filters temporarily disabled. No offerings data yet, so filters are disabled. Showing all centres for now."
- ✅ Still shows "60 centres found" (filters ignored!)
- ✅ Displays all centres, not filtered subset
- ✅ No "0 centres found" message
- ✅ No errors in console

**Actions:**
1. Navigate to URL with filter params
2. Verify banner is visible
3. Verify count is still 60
4. Verify centres are displayed
5. Check console for errors

**Result:** Filters are ignored, all centres shown with clear messaging

---

### Test 4: Pagination

**URLs:**
- Page 1: `http://localhost:3001/results?page=1`
- Page 2: `http://localhost:3001/results?page=2`
- Page 3: `http://localhost:3001/results?page=3`

**Expected:**
- ✅ Page 1: Shows centres 1-20
- ✅ Page 2: Shows centres 21-40
- ✅ Page 3: Shows centres 41-60
- ✅ Total always shows 60
- ✅ No duplicates across pages
- ✅ Pagination controls work

**Actions:**
1. Navigate through pages
2. Note first centre name on each page
3. Verify no duplicates
4. Check total count remains 60

**Result:** Pagination works correctly

---

### Test 5: Search (Should Still Work)

**URL:** `http://localhost:3001/results?search=Academy`

**Expected:**
- ✅ Shows only centres with "Academy" in name or location
- ✅ Count is less than 60 (filtered by search)
- ✅ No errors in console

**Actions:**
1. Navigate with search param
2. Verify results contain search term
3. Check count is accurate

**Result:** Search works independently of disabled filters

---

## 🔍 Console Checks

Open browser console (F12) and verify:

### No Errors
- ❌ No red error messages
- ❌ No 404s or failed requests
- ❌ No React warnings

### Expected Logs (Optional)
- API requests to `/api/tuition-centres`
- API requests to `/api/filter-options`
- All should return 200 status

---

## ✅ Success Criteria

All of the following must be true:

- [ ] Home page loads without errors
- [ ] Filter wizard shows disabled banner
- [ ] Results page shows all 60 centres
- [ ] Filters are ignored (still shows 60 centres)
- [ ] Disabled banner appears when filters attempted
- [ ] Pagination works (3 pages, 20 per page)
- [ ] No "0 centres found" messages
- [ ] No console errors
- [ ] Centre cards display correctly
- [ ] Contact modal opens on click

---

## 🐛 If You Find Issues

1. **Check console for errors** - Note the exact error message
2. **Check server logs** - Look for API errors
3. **Verify database** - Run `node scripts/verify-rollback.js`
4. **Check .env file** - Ensure `ENABLE_OFFERING_FILTERS="false"`
5. **Restart dev server** - Stop and run `npm run dev` again

---

## 📊 Quick Verification Commands

```bash
# Check database
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.tuitionCentre.count().then(c=>console.log('Centres:',c))"

# Test API
curl -s "http://localhost:3001/api/tuition-centres?page=1&limit=5" | grep -o '"total":[0-9]*'

# Run full verification
node scripts/verify-rollback.js
```

---

## ✅ Expected Final State

After all tests:
- **Database:** 60 centres, 0 offerings
- **API:** Returns all centres regardless of filters
- **UI:** Shows disabled banner, all centres visible
- **Console:** No errors
- **Status:** ✅ STABLE AND READY

---

**Last Updated:** February 5, 2026  
**Status:** Ready for browser testing
