# Browser Testing Checklist

## Quick Start
```bash
npm run dev
```
Then navigate to: http://localhost:3000

---

## Test Scenario 1: Normal Pagination Flow

### Step 1: Initial Load
1. Go to homepage
2. Select filters: "Primary 1" + "Math"
3. Click search button
4. Navigate to results page

**Expected:**
- [ ] See "Showing 20 of 60 centres" (or actual total)
- [ ] See debug line: `Active query: page=1, filters={"level":"Primary 1","subject":"Math"}`
- [ ] See "Load more centres" button
- [ ] See "Loads 20 more" subtext under button
- [ ] See 20 centre cards

### Step 2: First Load More
1. Scroll to bottom
2. Click "Load more centres" button

**Expected:**
- [ ] Button shows "Loading..." (briefly)
- [ ] Counter updates to "Showing 40 of 60 centres"
- [ ] Debug line shows: `page=2`
- [ ] See 40 centre cards total (scroll up to verify)
- [ ] Button still visible with "Loads 20 more"

### Step 3: Second Load More
1. Scroll to bottom
2. Click "Load more centres" button again

**Expected:**
- [ ] Button shows "Loading..." (briefly)
- [ ] Counter updates to "Showing 60 of 60 centres"
- [ ] Debug line shows: `page=3`
- [ ] See 60 centre cards total
- [ ] Button disappears
- [ ] See "All centres loaded" message

---

## Test Scenario 2: Filter Change Reset

### Step 1: From Loaded State
1. After completing Scenario 1 (at 60/60)
2. Click "← Back to filters"
3. Select different filters: "Secondary 1" + "Science"
4. Click search

**Expected:**
- [ ] Counter resets to "Showing 20 of X centres"
- [ ] Debug line shows: `page=1` (RESET!)
- [ ] Debug line shows new filters
- [ ] See fresh set of 20 centres (different from before)
- [ ] "Load more centres" button visible (if more results exist)

---

## Test Scenario 3: Small Result Set

### Step 1: Filters with Few Results
1. Go to homepage
2. Select filters that return < 20 results (try different combinations)
3. Click search

**Expected:**
- [ ] Counter shows "Showing X of X centres" (same number)
- [ ] No "Load more centres" button
- [ ] See "All centres loaded" message immediately
- [ ] Debug line shows: `page=1`

---

## Test Scenario 4: Loading States

### Step 1: Initial Loading
1. Go to homepage
2. Select filters
3. Click search
4. Watch the loading state

**Expected:**
- [ ] See loading spinner/animation
- [ ] No counter visible during loading
- [ ] No results visible during loading

### Step 2: Load More Loading
1. On results page with more to load
2. Click "Load more centres"
3. Watch the button

**Expected:**
- [ ] Button text changes to "Loading..."
- [ ] Button is disabled (grayed out)
- [ ] Subtext disappears during loading
- [ ] Can't click button again while loading

---

## Test Scenario 5: Visual Verification

### Check These Elements:
- [ ] Counter is prominent and easy to read
- [ ] Counter is positioned directly under "Tuition Centres" title
- [ ] Button is full-width and easy to click
- [ ] Button has clear two-line layout (label + subtext)
- [ ] "All centres loaded" message is centered and visible
- [ ] Debug line is at the top, easy to spot
- [ ] Filter badges are visible
- [ ] Centre cards are properly spaced

---

## Test Scenario 6: Edge Cases

### Case 1: Exactly 20 Results
1. Find filters that return exactly 20 results
2. Check results page

**Expected:**
- [ ] Counter shows "Showing 20 of 20 centres"
- [ ] No "Load more" button
- [ ] "All centres loaded" message visible

### Case 2: 0 Results
1. Select filters with no matches
2. Check results page

**Expected:**
- [ ] See "No Centres Found" empty state
- [ ] No counter visible
- [ ] No "Load more" button
- [ ] Helpful suggestions shown

### Case 3: Network Error
1. Turn off network (or simulate)
2. Try to load more

**Expected:**
- [ ] Error handled gracefully
- [ ] User can still see loaded centres
- [ ] No crash or blank screen

---

## Test Scenario 7: Mobile Responsiveness

### On Mobile Device or Narrow Browser:
1. Repeat Scenario 1 on mobile
2. Check all elements

**Expected:**
- [ ] Counter is readable
- [ ] Button is full-width and easy to tap
- [ ] Subtext is visible
- [ ] Debug line wraps properly
- [ ] Centre cards are properly sized

---

## Debug Line Removal Test

### After All Tests Pass:
1. Open `src/app/results/page.jsx`
2. Find and delete this block (around line 138):
```javascript
{/* DEBUG INFO - TEMPORARY - REMOVABLE */}
<div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-700">
  Active query: page={currentPage}, filters={JSON.stringify({ level: level || 'none', subject: subject || 'none' })}
</div>
```
3. Save file
4. Refresh browser

**Expected:**
- [ ] Debug line disappears
- [ ] Everything else still works
- [ ] Counter still updates
- [ ] Button still works

---

## Performance Check

### Monitor These:
- [ ] Page loads quickly (< 2 seconds)
- [ ] "Load more" responds quickly (< 1 second)
- [ ] No lag when scrolling through results
- [ ] No duplicate centres in the list
- [ ] No console errors in browser DevTools

---

## Browser Compatibility

### Test in Multiple Browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Final Verification

### All Features Working:
- [ ] Counter updates live (20 → 40 → 60)
- [ ] Button shows/hides correctly
- [ ] "All centres loaded" appears at end
- [ ] Filter changes reset properly
- [ ] No duplicates in results
- [ ] Loading states work
- [ ] Empty states work
- [ ] Mobile responsive
- [ ] No console errors

---

## Screenshot Checklist

### Take Screenshots of:
1. Initial load: "Showing 20 of 60 centres"
2. After 1 click: "Showing 40 of 60 centres"
3. After 2 clicks: "Showing 60 of 60 centres" + "All centres loaded"
4. Debug line showing page numbers
5. Filter change reset

**These screenshots will serve as proof of implementation!**

---

## If Something Doesn't Work

### Troubleshooting:
1. Check browser console for errors
2. Verify API is returning data correctly
3. Check network tab for API calls
4. Verify database has 60+ centres
5. Try different filter combinations
6. Clear browser cache and reload

### Common Issues:
- **Counter doesn't update:** Check `results.length` in React DevTools
- **Button doesn't appear:** Check `hasMore` calculation
- **Duplicates appear:** Check deduplication logic
- **Filter reset fails:** Check useEffect dependencies

---

## Success Criteria

✅ All checkboxes above are checked  
✅ Screenshots taken showing 20 → 40 → 60 progression  
✅ No console errors  
✅ Smooth user experience  
✅ Clear and unambiguous at every stage  

**When all tests pass, the implementation is complete!** 🎉
