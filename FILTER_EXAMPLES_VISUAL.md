# Filter Examples - Visual Demonstration

## Example 1: Primary + Math

### User Action:
1. Select "Primary" level
2. Select "Math" subject
3. Click "Apply filters"

### URL Generated:
```
/results?levels=Primary&subjects=Math
```

### Filter Logic:
```javascript
// Show centres that have BOTH:
// - "Primary" in their levels array
// - "Math" in their subjects array

centres.filter(centre =>
  centre.levels.includes('Primary') &&
  centre.subjects.includes('Math')
)
```

### Results:
**46 centres found**

Sample results:
```
✓ AM Academy (Main)
  Levels: Primary, Secondary, JC
  Subjects: Math, English, Science
  → Matches: Has Primary ✓ Has Math ✓

✓ Ikigai Math (Main)
  Levels: Primary, Secondary, JC
  Subjects: Math
  → Matches: Has Primary ✓ Has Math ✓

✓ Matrix Math (Main)
  Levels: Primary, Secondary, JC
  Subjects: Math
  → Matches: Has Primary ✓ Has Math ✓
```

---

## Example 2: (Primary OR Secondary) + (Math OR Science)

### User Action:
1. Select "Primary" level
2. Select "Secondary" level (multi-select)
3. Select "Math" subject
4. Select "Science" subject (multi-select)
5. Click "Apply filters"

### URL Generated:
```
/results?levels=Primary,Secondary&subjects=Math,Science
```

### Filter Logic:
```javascript
// Show centres that have:
// - At least ONE of: Primary OR Secondary
// - AND at least ONE of: Math OR Science

centres.filter(centre =>
  centre.levels.some(level => ['Primary', 'Secondary'].includes(level)) &&
  centre.subjects.some(subject => ['Math', 'Science'].includes(subject))
)
```

### Results:
**49 centres found**

Sample results:
```
✓ AM Academy (Main)
  Levels: Primary, Secondary, JC
  Subjects: Math, English, Science
  → Matches: Has Primary ✓ Has Math ✓ Has Science ✓

✓ Science Masterclass (Main)
  Levels: Primary, Secondary, JC
  Subjects: Science
  → Matches: Has Primary ✓ Has Secondary ✓ Has Science ✓

✓ Mathematical Sciences Learning Centre (Main)
  Levels: Primary, Secondary, JC
  Subjects: Math, Science
  → Matches: Has Primary ✓ Has Math ✓ Has Science ✓

✗ Ace Your Econs (Main)
  Levels: Primary, Secondary, JC
  Subjects: Economics
  → Doesn't match: Has Primary ✓ but NO Math or Science ✗
```

---

## Filter Logic Summary

### Within a Category (OR Logic)
```
levels=Primary,Secondary
→ Show centres with Primary OR Secondary
```

### Between Categories (AND Logic)
```
levels=Primary&subjects=Math
→ Show centres with Primary AND Math
```

### Combined (OR within, AND between)
```
levels=Primary,Secondary&subjects=Math,Science
→ Show centres with (Primary OR Secondary) AND (Math OR Science)
```

---

## UI Display

When filters are applied, the results page shows:

```
┌─────────────────────────────────────────┐
│ Tuition Centres                         │
│                                         │
│ [📚 Levels: Primary, Secondary]         │
│ [📝 Subjects: Math, Science]            │
│                                         │
│ 49 centres found                        │
└─────────────────────────────────────────┘
```

Each chip is clickable to remove that filter (future enhancement).

---

## ✅ Verification

Both examples work correctly:
- ✓ Filters are applied client-side (no API calls)
- ✓ Results update instantly
- ✓ Count is accurate
- ✓ URL reflects selected filters
- ✓ Can share URL with filters
- ✓ Works offline (static data)
