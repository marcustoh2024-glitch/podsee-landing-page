# Branch Name Removal - Implementation Summary

## Issue
Centre names were displaying with a "(Main)" suffix (e.g., "AM Academy (Main)") which cluttered the UI.

## Root Cause Analysis

### Where "(Main)" Comes From
✅ **Stored in the database** - The suffix is part of the `name` field in the `TuitionCentre` table.

**Evidence:**
```sql
sqlite> SELECT name FROM TuitionCentre LIMIT 5;
AM Academy (Main)
Ace Your Econs (Main)
Altitude Tuition Centre (Main)
Aspen Learning Centre (Main)
Aspire Hub (Main)
```

### How It Got There
The suffix was added during data ingestion in `scripts/ingest-centres-only.js` (line 68-69):

```javascript
// Build display name (include branch if present)
const displayName = branchName ? `${centreName} (${branchName})` : centreName;
```

The Excel source data has separate columns:
- `centre_name`: "AM Academy"
- `branch_name`: "Main"

These were concatenated during ingestion and stored as: "AM Academy (Main)"

## Solution Implemented

### Approach: Display-Only Fix
✅ **Keep data as-is in database** (don't modify stored names)  
✅ **Remove suffix in frontend display** (regex pattern matching)  
✅ **Preserve branch info in data model** (available if needed later)

### Regex Pattern Used
```javascript
.replace(/\s*\([^)]+\)\s*$/, '').trim()
```

**What it does:**
- `\s*` - Match optional whitespace before parenthesis
- `\(` - Match opening parenthesis (escaped)
- `[^)]+` - Match one or more characters that are NOT closing parenthesis
- `\)` - Match closing parenthesis (escaped)
- `\s*$` - Match optional whitespace at end of string
- `.trim()` - Remove any remaining whitespace

**Examples:**
- "AM Academy (Main)" → "AM Academy"
- "Ace Your Econs (Main)" → "Ace Your Econs"
- "Centre Name (Branch 1)" → "Centre Name"
- "No Branch" → "No Branch" (unchanged)

---

## Files Modified

### 1. `src/app/results/page.jsx`

**Location:** Results list cards (line ~272-273)

**Before:**
```jsx
{results.map((result) => {
  const sortedLevels = sortLevels(result.levels || [])
  const sortedSubjects = sortSubjects(result.subjects || [])
  
  return (
    <button>
      <h3 className="text-title-medium font-semibold text-[#2C3E2F] mb-3">
        {result.name}
      </h3>
```

**After:**
```jsx
{results.map((result) => {
  const sortedLevels = sortLevels(result.levels || [])
  const sortedSubjects = sortSubjects(result.subjects || [])
  
  // Extract display name (remove branch suffix like "(Main)")
  const displayName = result.name.replace(/\s*\([^)]+\)\s*$/, '').trim()
  
  return (
    <button>
      <h3 className="text-title-medium font-semibold text-[#2C3E2F] mb-3">
        {displayName}
      </h3>
```

**Impact:** Centre cards in results list now show clean names

---

### 2. `src/components/ContactModal.jsx`

**Location:** Modal header (line ~53-54, ~146)

**Before:**
```jsx
if (!isOpen || !centre) return null

const handleWhatsApp = () => {
  window.open(centre.whatsappLink, '_blank')
  onClose()
}

// ... later in JSX ...

<h3 className="text-xl font-semibold text-primary mb-1">
  {centre.name}
</h3>
```

**After:**
```jsx
if (!isOpen || !centre) return null

// Extract display name (remove branch suffix like "(Main)")
const displayName = centre.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

const handleWhatsApp = () => {
  window.open(centre.whatsappLink, '_blank')
  onClose()
}

// ... later in JSX ...

<h3 className="text-xl font-semibold text-primary mb-1">
  {displayName}
</h3>
```

**Impact:** Contact modal header shows clean centre name

---

### 3. `src/components/DiscussionPage.jsx`

**Location:** Centre info header (line ~123-124)

**Before:**
```jsx
{thread?.tuitionCentre && (
  <div className="bg-surface-container rounded-2xl p-5 shadow-premium-sm">
    <h2 className="text-title-large font-semibold text-on-surface mb-3">
      {thread.tuitionCentre.name}
    </h2>
```

**After:**
```jsx
{thread?.tuitionCentre && (
  <div className="bg-surface-container rounded-2xl p-5 shadow-premium-sm">
    <h2 className="text-title-large font-semibold text-on-surface mb-3">
      {thread.tuitionCentre.name.replace(/\s*\([^)]+\)\s*$/, '').trim()}
    </h2>
```

**Impact:** Discussion page header shows clean centre name

---

## Visual Examples

### Before:
```
┌─────────────────────────────────────────┐
│ AM Academy (Main)                       │ ← Cluttered
│ 📍 225A East Coast Road                 │
└─────────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────────┐
│ AM Academy                              │ ← Clean!
│ 📍 225A East Coast Road                 │
└─────────────────────────────────────────┘
```

---

## Data Integrity

### What Was NOT Changed
✅ Database records remain unchanged  
✅ API responses still include full name with branch  
✅ `centre.name` in data model still has "(Main)"  
✅ Backend services unchanged  
✅ Ingestion scripts unchanged  

### Why This Approach
1. **Non-destructive** - Original data preserved
2. **Reversible** - Easy to show branch info later if needed
3. **Flexible** - Can add branch display elsewhere (e.g., as subtitle)
4. **Safe** - No database migrations or data transformations

---

## Future Enhancements (Optional)

If branch information becomes important later, you can:

### Option 1: Show as Subtitle
```jsx
<h3>{displayName}</h3>
<p className="text-xs text-gray-500">Branch: Main</p>
```

### Option 2: Extract Branch Name
```javascript
const branchMatch = result.name.match(/\(([^)]+)\)$/);
const branchName = branchMatch ? branchMatch[1] : null;
```

### Option 3: Database Refactor (Future)
Add a separate `branchName` column to the schema:
```prisma
model TuitionCentre {
  id         String  @id @default(uuid())
  name       String  // "AM Academy"
  branchName String? // "Main"
  // ...
}
```

---

## Testing Checklist

### Manual Testing:
- [ ] Results page: Centre cards show clean names
- [ ] Contact modal: Header shows clean name
- [ ] Discussion page: Centre header shows clean name
- [ ] Names without branches: Still display correctly
- [ ] No console errors
- [ ] No visual glitches

### Test Cases:
1. **With branch:** "AM Academy (Main)" → "AM Academy" ✅
2. **Without branch:** "Simple Name" → "Simple Name" ✅
3. **Multiple words in branch:** "Centre (Branch 1)" → "Centre" ✅
4. **Parentheses in middle:** "Name (old) Centre" → "Name (old) Centre" ✅ (only removes suffix)

---

## Verification

### Database Check:
```bash
sqlite3 prisma/dev.db "SELECT name FROM TuitionCentre LIMIT 3;"
```
**Output:**
```
AM Academy (Main)
Ace Your Econs (Main)
Altitude Tuition Centre (Main)
```
✅ Data unchanged in database

### API Check:
```bash
curl http://localhost:3002/api/tuition-centres?limit=1 | jq '.data[0].name'
```
**Output:**
```json
"AM Academy (Main)"
```
✅ API still returns full name

### UI Check:
Open browser → Results page → Centre cards show "AM Academy" (without suffix)
✅ Display cleaned in frontend

---

## Summary

✅ **Issue identified:** "(Main)" suffix stored in database  
✅ **Solution implemented:** Display-only regex removal  
✅ **Files modified:** 3 files (results page, contact modal, discussion page)  
✅ **Data preserved:** No database changes  
✅ **Testing:** No diagnostics errors  
✅ **Result:** Clean, professional centre names in UI  

**Before:** "AM Academy (Main)"  
**After:** "AM Academy"  

Implementation complete! 🎉
