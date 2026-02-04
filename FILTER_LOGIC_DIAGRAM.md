# Filter Logic Diagram

## Visual Explanation of the Fix

### Example Centre: "ABC Tuition"

```
┌─────────────────────────────────────────────────────────────┐
│                      ABC Tuition Centre                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Offerings (Explicit Level-Subject Combinations):           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Offering 1: Primary 1 + Math                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Offering 2: Primary 1 + English                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Offering 3: Secondary 1 + Math                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Offering 4: Secondary 1 + Science                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Search Scenarios

### ✅ Scenario 1: Level Filter Only
**Query:** `?levels=Primary 1`

```
Check: Does the centre have ANY offering with "Primary 1"?

┌──────────────────────────────────────────────────────┐
│ Offering 1: Primary 1 + Math          ← MATCH! ✓    │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ Offering 2: Primary 1 + English       ← MATCH! ✓    │
└──────────────────────────────────────────────────────┘

Result: ✅ RETURN THIS CENTRE
```

---

### ✅ Scenario 2: Subject Filter Only
**Query:** `?subjects=Math`

```
Check: Does the centre have ANY offering with "Math"?

┌──────────────────────────────────────────────────────┐
│ Offering 1: Primary 1 + Math          ← MATCH! ✓    │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ Offering 3: Secondary 1 + Math        ← MATCH! ✓    │
└──────────────────────────────────────────────────────┘

Result: ✅ RETURN THIS CENTRE
```

---

### ✅ Scenario 3: Both Filters - Existing Combination
**Query:** `?levels=Primary 1&subjects=Math`

```
Check: Does the centre have ANY offering with BOTH "Primary 1" AND "Math"?
       (Must be on the SAME offering row)

┌──────────────────────────────────────────────────────┐
│ Offering 1: Primary 1 + Math          ← MATCH! ✓    │
│             ─────────   ────                         │
│                 ↓         ↓                           │
│             Level ✓   Subject ✓                      │
│             SAME ROW = VALID MATCH                   │
└──────────────────────────────────────────────────────┘

Result: ✅ RETURN THIS CENTRE
```

---

### ❌ Scenario 4: Both Filters - Non-Existent Combination
**Query:** `?levels=Primary 1&subjects=Science`

```
Check: Does the centre have ANY offering with BOTH "Primary 1" AND "Science"?
       (Must be on the SAME offering row)

┌──────────────────────────────────────────────────────┐
│ Offering 1: Primary 1 + Math          ← Level ✓     │
│                         ────             Subject ✗   │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ Offering 2: Primary 1 + English       ← Level ✓     │
│                         ───────          Subject ✗   │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ Offering 3: Secondary 1 + Math        ← Level ✗     │
│             ───────────                  Subject ✗   │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ Offering 4: Secondary 1 + Science     ← Level ✗     │
│             ───────────   ───────        Subject ✓   │
└──────────────────────────────────────────────────────┘

No offering has BOTH conditions on the SAME row!

Result: ❌ DO NOT RETURN THIS CENTRE
```

---

## The Key Difference

### ❌ OLD LOGIC (INCORRECT)
```
Query: Primary 1 + Science

Step 1: Does centre have "Primary 1"?
        → Check TuitionCentreLevel table
        → YES (from Offering 1 or 2)

Step 2: Does centre have "Science"?
        → Check TuitionCentreSubject table
        → YES (from Offering 4)

Step 3: Combine with AND
        → Has Primary 1? YES
        → Has Science? YES
        → RETURN CENTRE ❌ WRONG!

Problem: Checked different tables, didn't verify same offering row
```

### ✅ NEW LOGIC (CORRECT)
```
Query: Primary 1 + Science

Step 1: Does centre have ANY offering where:
        - level = "Primary 1" AND
        - subject = "Science"
        (on the SAME offering row)

Step 2: Check Offering table
        → Offering 1: Primary 1 + Math (no match)
        → Offering 2: Primary 1 + English (no match)
        → Offering 3: Secondary 1 + Math (no match)
        → Offering 4: Secondary 1 + Science (no match)

Step 3: No matching offering found
        → DO NOT RETURN CENTRE ✅ CORRECT!

Solution: Single table with explicit combinations ensures same-row matching
```

---

## Database Structure

### OLD (Separate Tables)
```
TuitionCentreLevel          TuitionCentreSubject
┌────────┬─────────┐        ┌────────┬──────────┐
│ Centre │ Level   │        │ Centre │ Subject  │
├────────┼─────────┤        ├────────┼──────────┤
│ ABC    │ Prim 1  │        │ ABC    │ Math     │
│ ABC    │ Sec 1   │        │ ABC    │ English  │
└────────┴─────────┘        │ ABC    │ Science  │
                             └────────┴──────────┘

Problem: No link between level and subject!
```

### NEW (Offering Table)
```
Offering
┌────────┬─────────┬──────────┐
│ Centre │ Level   │ Subject  │
├────────┼─────────┼──────────┤
│ ABC    │ Prim 1  │ Math     │  ← Explicit combination
│ ABC    │ Prim 1  │ English  │  ← Explicit combination
│ ABC    │ Sec 1   │ Math     │  ← Explicit combination
│ ABC    │ Sec 1   │ Science  │  ← Explicit combination
└────────┴─────────┴──────────┘

Solution: Each row is an explicit level-subject combination!
```

---

## SQL Query Comparison

### OLD (Incorrect)
```sql
SELECT * FROM TuitionCentre
WHERE id IN (
  SELECT tuitionCentreId FROM TuitionCentreLevel
  WHERE levelId IN ('Primary 1')
)
AND id IN (
  SELECT tuitionCentreId FROM TuitionCentreSubject
  WHERE subjectId IN ('Science')
)
-- Problem: Separate subqueries, no same-row guarantee
```

### NEW (Correct)
```sql
SELECT * FROM TuitionCentre
WHERE id IN (
  SELECT tuitionCentreId FROM Offering
  WHERE levelId IN ('Primary 1')
    AND subjectId IN ('Science')
)
-- Solution: Single query with AND ensures same row
```

---

## Summary

The fix ensures that when both level and subject filters are applied, they must match on the **same offering row**, preventing false positives from matching level and subject across different offerings.

**Key Principle:** 
> An offering is an atomic unit representing a specific level-subject combination that a centre provides. Filters must respect this atomicity.
