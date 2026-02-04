# Centre Name Display Fix - Remove "(Main)" Suffix

**Date:** February 5, 2026  
**Status:** ✅ Fixed - Display Only

---

## 🔍 Investigation Results

### Where "(Main)" Comes From

**Source:** Database `name` field  
**Storage:** `TuitionCentre.name` contains the full name with branch suffix

**Examples from database:**
```
- Aspen Learning Centre (Main)
- SmartLab (Main)
- AM Academy (Main)
- VitamindzTM Education (Main)
- Mathematical Sciences Learning Centre (Main)
```

**Conclusion:** The branch suffix is **stored in the database**, not appended in the frontend.

---

## ✅ Solution Implemented

### Approach: Display-Only Fix

- ✅ Keep data in database unchanged (don't modify DB)
- ✅ Extract clean centre name for display
- ✅ Show branch only if it's NOT "Main" (subtle grey text)
- ✅ Keep full name in data for modal/details

### Helper Functions Added

**File:** `src/app/results/page.jsx`

```javascript
// Extract centre name without branch suffix
function getCentreName(fullName) {
  // Remove branch suffix like "(Main)", "(Branch Name)", etc.
  const match = fullName.match(/^(.+?)\s*\([^)]+\)$/)
  return match ? match[1].trim() : fullName
}

// Extract branch name
function getBranchName(fullName) {
  const match = fullName.match(/\(([^)]+)\)$/)
  return match ? match[1] : null
}
```

---

## 📝 Changes Made

### File: `src/app/results/page.jsx`

**Before (Line ~222):**
```jsx
<h3 className="text-title-medium font-semibold text-[#2C3E2F] mb-3">
  {result.name}
</h3>
```

**After:**
```jsx
// Extract clean centre name and branch
const centreName = getCentreName(result.name)
const branchName = getBranchName(result.name)

<h3 className="text-title-medium font-semibold text-[#2C3E2F] mb-3">
  {centreName}
</h3>

{/* Branch name - subtle display if not "Main" */}
{branchName && branchName !== 'Main' && (
  <div className="mb-2 text-label-small text-[#8B9586]">
    Branch: {branchName}
  </div>
)}
```

---

## 📊 Display Examples

### Before:
```
┌─────────────────────────────────────┐
│ AM Academy (Main)                   │
│ 📍 225A East Coast Road...          │
│ Levels offered: S2, JC2, S4...      │
└─────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────┐
│ AM Academy                          │
│ 📍 225A East Coast Road...          │
│ Levels offered: S2, JC2, S4...      │
└─────────────────────────────────────┘
```

### If Branch is NOT "Main":
```
┌─────────────────────────────────────┐
│ SmartLab                            │
│ Branch: Tampines                    │ ← Shown in grey
│ 📍 1 Marine Parade Central...       │
│ Levels offered: S2, P6, P3...       │
└─────────────────────────────────────┘
```

---

## 🎯 Behavior

### Main Branch (Most Common)
- **Display:** Centre name only
- **Branch info:** Hidden (since "Main" is default)
- **Example:** "AM Academy" (not "AM Academy (Main)")

### Other Branches (Rare)
- **Display:** Centre name + subtle branch line
- **Branch info:** Shown in small grey text
- **Example:** "SmartLab" with "Branch: Tampines" below

### Data Preservation
- **Full name:** Still passed to modal/details
- **Database:** Unchanged
- **API:** Returns full name as before

---

## ✅ Verification

### Test Cases

1. **Centre with "(Main)" branch:**
   - Before: "AM Academy (Main)"
   - After: "AM Academy"
   - Branch line: Not shown

2. **Centre with other branch:**
   - Before: "SmartLab (Tampines)"
   - After: "SmartLab" + "Branch: Tampines" (grey)
   - Branch line: Shown

3. **Centre without branch suffix:**
   - Before: "Some Centre"
   - After: "Some Centre"
   - Branch line: Not shown

---

## 📁 Files Modified

1. **`src/app/results/page.jsx`**
   - Added `getCentreName()` helper function
   - Added `getBranchName()` helper function
   - Updated card title to use `centreName`
   - Added conditional branch display (only if not "Main")

**Lines changed:** ~20-30 (added helpers + updated render)

---

## 🎨 Design Notes

### Typography
- **Centre name:** `text-title-medium font-semibold text-[#2C3E2F]`
- **Branch (if shown):** `text-label-small text-[#8B9586]` (subtle grey)

### Spacing
- Branch line has `mb-2` (small margin below)
- Maintains existing card layout

### Conditional Display
- Branch shown only if: `branchName && branchName !== 'Main'`
- Most centres won't show branch line (cleaner)

---

## ✅ Summary

**Problem:** Centre names displayed with "(Main)" suffix  
**Source:** Stored in database `name` field  
**Solution:** Display-only fix using helper functions  
**Result:** Clean centre names, branch info preserved but hidden for "Main"

**Examples:**
- ✅ "AM Academy" (was "AM Academy (Main)")
- ✅ "SmartLab" (was "SmartLab (Main)")
- ✅ "Aspen Learning Centre" (was "Aspen Learning Centre (Main)")

**Data unchanged, display improved.**
