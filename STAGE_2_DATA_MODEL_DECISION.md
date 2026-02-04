# Stage 2 — Data Model Decision & Verification

**Date:** February 5, 2026  
**Status:** ✅ Schema Already Complete — No Changes Needed

---

## 🎯 Decision: Use Existing Offering Table (Option B)

The schema **already has the optimal data model** in place. No migrations needed.

### Why Offering Table?

The existing schema uses **Option B: Single Offering table** which is the best choice because:

1. **Explicit level-subject combinations** — Each row represents a real offering (e.g., "S3 Physics")
2. **Prevents false positives** — Filters match on the same offering row (not Cartesian product)
3. **Matches our data source** — Excel has 1,099 explicit offerings, not separate level/subject lists
4. **Better query performance** — Single table join vs multiple join tables
5. **Already implemented** — Migration exists from Feb 4, 2026

---

## 📋 Final Schema Summary

### Core Tables

#### 1. TuitionCentre (Main Entity)
```prisma
model TuitionCentre {
  id                String                 @id @default(uuid())
  name              String
  location          String
  whatsappNumber    String
  website           String?
  dataQualityStatus String                 @default("OK")
  dataQualityNotes  String?
  
  // Relations
  levels            TuitionCentreLevel[]   // Join table (optional)
  subjects          TuitionCentreSubject[] // Join table (optional)
  offerings         Offering[]             // PRIMARY: Explicit combinations
  
  createdAt         DateTime               @default(now())
  updatedAt         DateTime               @updatedAt
}
```

#### 2. Level (Lookup Table)
```prisma
model Level {
  id             String               @id @default(uuid())
  name           String               @unique
  tuitionCentres TuitionCentreLevel[] // Join table
  offerings      Offering[]           // PRIMARY: Used for filtering
  createdAt      DateTime             @default(now())
}
```

#### 3. Subject (Lookup Table)
```prisma
model Subject {
  id             String                 @id @default(uuid())
  name           String                 @unique
  tuitionCentres TuitionCentreSubject[] // Join table
  offerings      Offering[]             // PRIMARY: Used for filtering
  createdAt      DateTime               @default(now())
}
```

#### 4. Offering (Level-Subject Combinations) ⭐ PRIMARY
```prisma
model Offering {
  id              String        @id @default(uuid())
  tuitionCentreId String
  levelId         String
  subjectId       String
  
  tuitionCentre   TuitionCentre @relation(...)
  level           Level         @relation(...)
  subject         Subject       @relation(...)
  
  createdAt       DateTime      @default(now())
  
  @@unique([tuitionCentreId, levelId, subjectId])
  @@index([tuitionCentreId])
  @@index([levelId])
  @@index([subjectId])
}
```

### Join Tables (Optional — For Display Only)

#### 5. TuitionCentreLevel
```prisma
model TuitionCentreLevel {
  tuitionCentreId String
  levelId         String
  tuitionCentre   TuitionCentre @relation(...)
  level           Level         @relation(...)
  
  @@id([tuitionCentreId, levelId])
}
```

#### 6. TuitionCentreSubject
```prisma
model TuitionCentreSubject {
  tuitionCentreId String
  subjectId       String
  tuitionCentre   TuitionCentre @relation(...)
  subject         Subject       @relation(...)
  
  @@id([tuitionCentreId, subjectId])
}
```

---

## 🔍 Schema Verification Results

### All Tables Exist ✅

| Table | Rows | Status |
|-------|------|--------|
| TuitionCentre | 60 | ✅ Populated |
| Level | 0 | ⚠️ Empty (needs data) |
| Subject | 0 | ⚠️ Empty (needs data) |
| Offering | 0 | ⚠️ Empty (needs data) |
| TuitionCentreLevel | 0 | ⚠️ Empty (optional) |
| TuitionCentreSubject | 0 | ⚠️ Empty (optional) |

### Migration History ✅

```
✅ 20260131135813_init
✅ 20260203072024_add_community_forum_models
✅ 20260203162152_add_username
✅ 20260203175352_fix_cascade_delete
✅ 20260203185906_add_data_quality_fields
✅ 20260204065621_add_offering_model ⭐ (This one!)
```

---

## 🎨 Filter Logic Design

### Query Strategy: Use Offering Table

**Filter Requirements:**
- OR within selected levels (e.g., "S3" OR "S4")
- OR within selected subjects (e.g., "Physics" OR "Chemistry")
- AND between level vs subject (e.g., centres with (S3 OR S4) AND (Physics OR Chemistry))

**Prisma Query Pattern:**
```javascript
where: {
  offerings: {
    some: {
      AND: [
        { levelId: { in: selectedLevelIds } },
        { subjectId: { in: selectedSubjectIds } }
      ]
    }
  }
}
```

This ensures:
- ✅ Centres must have at least one offering matching BOTH a selected level AND a selected subject
- ✅ No false positives (e.g., centre with "S3 Math" + "S4 Physics" won't match "S3 Physics")
- ✅ Efficient single-table join

---

## 📊 Data Population Strategy

### What Needs to Be Imported

From `database_ready (1) copy.xlsx` → `offerings` sheet (1,098 rows):

1. **Extract unique levels** → Insert into `Level` table
   - Example: "S3", "S4", "P1", "P2", "JC1", etc.

2. **Extract unique subjects** → Insert into `Subject` table
   - Example: "Physics", "Chemistry", "English", "Math", etc.

3. **Create offering records** → Insert into `Offering` table
   - Match centre by name + branch
   - Link to levelId and subjectId
   - Example: AM Academy (Main) + S3 + Physics

4. **Optional: Populate join tables** → For display purposes
   - TuitionCentreLevel: Unique centre-level pairs
   - TuitionCentreSubject: Unique centre-subject pairs

---

## ✅ Schema Decision Summary

**Route Chosen:** Option B — Single Offering Table (Already Implemented)

**Why This Works:**
- ✅ Schema already exists with all necessary tables
- ✅ Offering table has proper indexes for efficient filtering
- ✅ Unique constraint prevents duplicate offerings
- ✅ Cascade deletes ensure data integrity
- ✅ Matches our Excel data structure (explicit combinations)

**No Schema Changes Required** — Ready to proceed with data import.

---

## 🚀 Next Steps (Stage 3)

1. Import Level records from Excel
2. Import Subject records from Excel
3. Import Offering records from Excel
4. Update `/api/filter-options` to return enabled: true
5. Update service layer to use Offering table for filtering
6. Test filter combinations

**Schema is ready. Moving to data import phase.**
