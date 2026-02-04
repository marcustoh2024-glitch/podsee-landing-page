# Filter Verification Checklist

**Date:** February 5, 2026  
**Status:** Debug Strip Added - Ready for Testing

---

## 🎯 What Changed

### 1. Visible Debug Strip on Results Page

**Yellow strip at top shows:**
- Current URL with query params
- Parsed params: levels, subjects, search, page, limit
- Exact API URL being fetched
- Response: returned count, total, page, totalPages
- **Filters Applied: YES/NO** (in green/red)
- Timestamp of last fetch

**This makes it IMPOSSIBLE to hide whether filters are applied.**

### 2. Filter Selection Debug in FilterWizard

**Blue box shows:**
- Current selected level and subject
- Preview of URL it will navigate to
- Green confirmation when navigation happens

### 3. Standardized to PLURAL everywhere

- URL params: `levels` and `subjects` (plural)
- API expects: `levels` and `subjects` (plural)
- FilterWizard sends: `levels` and `subjects` (plural)

---

## ✅ Verification Test (MUST PASS)

### Test 1: JC1 + Economics

**Steps:**
1. Go to http://localhost:3001
2. Click on "Level" → Select "JC1"
3. Click on "Subject" → Select "Economics"
4. **Check blue debug box** - Should show:
   ```
   Level: JC1 | Subject: Economics
   Will navigate to: /results?levels=JC1&subjects=Economics
   ```
5. Click "Apply filters"
6. **Check green confirmation** - Should show:
   ```
   ✅ Navigating to: /results?levels=JC1&subjects=Economics
   ```
7. **On results page, check yellow debug strip:**

**Expected:**
```
URL: /results?levels=JC1&subjects=Economics
Parsed Params: levels=[JC1] subjects=[Economics] search=[none] page=1 limit=100
API URL: /api/tuition-centres?levels=JC1&subjects=Economics&page=1&limit=100
Response: returned=13 total=13 page=1 totalPages=1
Filters Applied: YES
```

**If you see:**
- `total=60` → Filters NOT applied (BUG)
- `total=13` → Filters WORKING ✅

### Test 2: S3 + Physics

**Steps:**
1. Go back to home
2. Select "S3" and "Physics"
3. Click "Apply filters"

**Expected yellow strip:**
```
URL: /results?levels=S3&subjects=Physics
Response: total=15
Filters Applied: YES
```

### Test 3: Browse All (No Filters)

**Steps:**
1. Go to home
2. Click "Browse all centres" (without selecting filters)

**Expected yellow strip:**
```
URL: /results
Parsed Params: levels=[none] subjects=[none]
Response: total=60
Filters Applied: NO
```

---

## 🐛 Debugging Guide

### If "Filters Applied: NO" but you selected filters

**Check:**
1. Blue box on filter page - Does it show your selections?
2. Green confirmation - Did it show the navigation URL?
3. Yellow strip URL - Does it have query params?

**If URL is just `/results` with no params:**
- FilterWizard is not navigating correctly
- Check browser console for errors

### If "Filters Applied: YES" but total=60

**Check:**
1. Yellow strip "Parsed Params" - Are levels/subjects shown?
2. Yellow strip "API URL" - Does it include the filters?
3. Server console - Check API logs

**If API URL doesn't include filters:**
- Results page is not building URL correctly
- Check the useEffect dependencies

### If total is correct but no centres shown

**Check:**
1. Yellow strip "returned" count
2. Scroll down - centres might be below fold
3. Check for JavaScript errors in console

---

## 📊 Expected Results Reference

| Filter Combination | Expected Total | Filters Applied |
|-------------------|----------------|-----------------|
| JC1 + Economics | 13 | YES |
| S3 + Physics | 15 | YES |
| P1 + English | 20 | YES |
| JC2 + General Paper | ~10 | YES |
| No filters (Browse all) | 60 | NO |

---

## 🔧 Quick API Tests

Test the API directly to confirm it works:

```bash
# JC1 + Economics (should return 13)
curl "http://localhost:3001/api/tuition-centres?levels=JC1&subjects=Economics&limit=100"

# S3 + Physics (should return 15)
curl "http://localhost:3001/api/tuition-centres?levels=S3&subjects=Physics&limit=100"

# No filters (should return 60)
curl "http://localhost:3001/api/tuition-centres?limit=100"
```

---

## ✅ Success Criteria

**Test PASSES if:**
1. Yellow debug strip shows `Filters Applied: YES`
2. URL contains `?levels=...&subjects=...`
3. API URL contains the same filters
4. `total` matches expected count (13 for JC1+Economics)
5. Centres displayed match the filter criteria

**Test FAILS if:**
1. `Filters Applied: NO` when filters were selected
2. URL has no query params after clicking "Apply filters"
3. `total=60` when specific filters were applied
4. API URL doesn't include the selected filters

---

## 🎯 What to Screenshot

If filters still don't work, take a screenshot showing:
1. The entire yellow debug strip
2. The filter selection (blue box if visible)
3. The URL bar
4. The "X centres found" text

This will show exactly where the pipeline breaks.

---

## 🚀 Next Steps

1. **Refresh the page** (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
2. **Test JC1 + Economics** following steps above
3. **Check the yellow debug strip** - it tells you everything
4. **If total=60**, screenshot the debug strip and share it

The debug strip makes it impossible to hide what's happening. It will show exactly where filters break.
