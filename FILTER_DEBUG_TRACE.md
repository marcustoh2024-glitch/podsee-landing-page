# Filter Debug Trace - Complete Analysis

**Date:** February 5, 2026  
**Status:** ✅ Backend Working - UI Needs Testing

---

## 🔍 Root Cause Analysis

### Backend Status: ✅ WORKING PERFECTLY

**Test Results:**
1. **JC1 + Economics:** 13 centres ✅
2. **S3 + Physics:** 15 centres ✅  
3. **P1 + English:** 20 centres ✅

**API Endpoints Tested:**
- `GET /api/tuition-centres?levels=JC1&subjects=Economics` → 13 centres ✅
- `GET /api/tuition-centres?level=JC1&subject=Economics` → 13 centres ✅ (backwards compatible)
- `GET /api/tuition-centres` → 60 centres ✅ (no filters)

### Issue Identified: UI Not Sending Filters

**Evidence from Screenshot:**
- URL shown: `/results` (no query parameters visible)
- Result: "60 centres found" (= ALL centres, no filtering)
- **Conclusion:** Filters are NOT being applied

---

## 🧪 How to Test Properly

### ❌ WRONG: Clicking "Browse all centres"
This button bypasses filters and shows all 60 centres.

### ✅ CORRECT: Using the filter wizard

**Step-by-Step:**

1. **Go to homepage:** http://localhost:3001

2. **Select a Level:**
   - Click on "Level" step
   - Choose one level (e.g., "JC1")
   - Step 2 should auto-expand

3. **Select a Subject:**
   - Click on "Subject" step
   - Choose one subject (e.g., "Economics")
   - "Apply filters" button should become enabled and pulsate

4. **Click "Apply filters"** (NOT "Browse all centres")

5. **Check the URL:**
   - Should be: `/results?levels=JC1&subjects=Economics`
   - NOT just: `/results`

6. **Check the results:**
   - Should show: "13 centres found" (for JC1 + Economics)
   - NOT: "60 centres found"

---

## 📊 Expected Results by Filter Combination

| Level | Subject | Expected Count | Sample Centres |
|-------|---------|----------------|----------------|
| JC1 | Economics | 13 | AM Academy, Ace Your Econs, Altitude Tuition |
| S3 | Physics | 15 | AM Academy, Focus Education, SmartLab |
| P1 | English | 20 | Aspire Hub, Augustine's English, Camelot Educare |
| JC2 | General Paper | ~10 | (varies) |
| S4 | Chemistry | ~15 | (varies) |

---

## 🔧 Debug Logging Added

### API Route (`src/app/api/tuition-centres/route.js`)
Now logs:
- Raw request URL
- Raw searchParams (levels, subjects, page, limit)
- Parsed filters array
- Result count

**Check server console for:**
```
🔍 API Request: http://localhost:3001/api/tuition-centres?levels=JC1&subjects=Economics&limit=100
📋 Raw searchParams: { levels: 'JC1', subjects: 'Economics', ... }
📊 Parsed filters: { levels: ['JC1'], subjects: ['Economics'], ... }
✅ Result: { total: 13, page: 1, returned: 13 }
```

### Results Page (`src/app/results/page.jsx`)
Now logs:
- URL params from searchParams
- API URL being called
- API response

**Check browser console for:**
```
🔍 Results Page - Fetching centres
📋 URL params from searchParams: { levels: 'JC1', subjects: 'Economics' }
🌐 API URL: /api/tuition-centres?levels=JC1&subjects=Economics&limit=100
✅ API Response: { total: 13, returned: 13 }
```

### FilterWizard (`src/components/FilterWizard.jsx`)
Now logs:
- Selected filters
- Navigation URL

**Check browser console for:**
```
🔍 FilterWizard - Applying filters
📋 Selected filters: { level: 'JC1', subject: 'Economics' }
🌐 Navigating to: /results?levels=JC1&subjects=Economics
```

---

## 🎯 Testing Checklist

### Test 1: JC1 + Economics
- [ ] Select "JC1" from Level dropdown
- [ ] Select "Economics" from Subject dropdown
- [ ] Click "Apply filters"
- [ ] URL should be: `/results?levels=JC1&subjects=Economics`
- [ ] Should show: "13 centres found"
- [ ] Should see: AM Academy, Ace Your Econs, etc.

### Test 2: S3 + Physics
- [ ] Select "S3" from Level dropdown
- [ ] Select "Physics" from Subject dropdown
- [ ] Click "Apply filters"
- [ ] URL should be: `/results?levels=S3&subjects=Physics`
- [ ] Should show: "15 centres found"
- [ ] Should see: AM Academy, Focus Education, SmartLab, etc.

### Test 3: P1 + English
- [ ] Select "P1" from Level dropdown
- [ ] Select "English" from Subject dropdown
- [ ] Click "Apply filters"
- [ ] URL should be: `/results?levels=P1&subjects=English`
- [ ] Should show: "20 centres found"
- [ ] Should see: Aspire Hub, Augustine's English, etc.

### Test 4: Browse All (No Filters)
- [ ] Click "Browse all centres" button
- [ ] URL should be: `/results` (no query params)
- [ ] Should show: "60 centres found"
- [ ] This is EXPECTED behavior for "Browse all"

---

## 🐛 Common Issues & Solutions

### Issue 1: Shows 60 centres instead of filtered count
**Cause:** Clicked "Browse all centres" instead of "Apply filters"  
**Solution:** Use the filter wizard and click "Apply filters"

### Issue 2: URL doesn't have query parameters
**Cause:** Not selecting both level AND subject before clicking apply  
**Solution:** Select BOTH filters, then click "Apply filters"

### Issue 3: "Apply filters" button is disabled
**Cause:** Need to select BOTH level and subject  
**Solution:** Select both filters to enable the button

### Issue 4: Filters show "Loading filters..."
**Cause:** API not responding or offerings not in database  
**Solution:** Check that offerings were ingested (run `node scripts/verify-offerings-ingestion.js`)

---

## 📝 Verification Commands

### Check Backend Works
```bash
# Test API directly
node scripts/test-ui-request.js

# Should show:
# Test 1: 13 centres (JC1 + Economics)
# Test 2: 13 centres (singular format)
# Test 3: 60 centres (no filters)
```

### Check Database Has Data
```bash
# Verify offerings exist
node scripts/verify-offerings-ingestion.js

# Should show:
# ✅ 13 levels available
# ✅ 13 subjects available
# ✅ 1088 offerings created
```

### Check Filter Logic
```bash
# Test filter combinations
node scripts/debug-filter-pipeline.js

# Should show:
# JC1 + Economics: 13 centres ✅
# S3 + Physics: 15 centres ✅
# P1 + English: 20 centres ✅
```

---

## ✅ Conclusion

**Backend:** ✅ Working perfectly  
**API:** ✅ Returns correct filtered results  
**Database:** ✅ Has 1,088 offerings  
**Service Layer:** ✅ Filter logic correct  

**Next Step:** Test in browser following the correct steps above.

**Key Point:** Make sure to click "Apply filters" AFTER selecting both level and subject, NOT "Browse all centres".

---

## 🌐 Quick Test URLs

Open these directly in browser to verify API works:

1. **JC1 + Economics:**  
   http://localhost:3001/api/tuition-centres?levels=JC1&subjects=Economics&limit=100  
   Expected: 13 centres

2. **S3 + Physics:**  
   http://localhost:3001/api/tuition-centres?levels=S3&subjects=Physics&limit=100  
   Expected: 15 centres

3. **P1 + English:**  
   http://localhost:3001/api/tuition-centres?levels=P1&subjects=English&limit=100  
   Expected: 20 centres

4. **No filters:**  
   http://localhost:3001/api/tuition-centres?limit=100  
   Expected: 60 centres

If these URLs work (they should), then the issue is in the UI flow, not the backend.
