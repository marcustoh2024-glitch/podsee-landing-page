# Data Source Verification Report
**Date:** February 4, 2026  
**Status:** ✅ VERIFIED - All data from Excel ingestion only

---

## Executive Summary

✅ **CONFIRMED:** All tuition centre data comes exclusively from Excel ingestion  
✅ **NO SEED DATA:** Zero seed/mock/test centres found in database  
✅ **SINGLE SOURCE:** `Offerings_MarineParade_Encoded.xlsx` via `scripts/ingest-all-centres.js`

---

## 1. Database Contents

### Tuition Centres
- **Total centres:** 60
- **All from:** Marine Parade Excel file
- **Location:** All centres are in "Marine Parade"
- **Data quality:**
  - OK: 20 centres (33%)
  - NEEDS_REVIEW: 40 centres (67%)

### Levels (12 total)
```
Primary 1, Primary 2, Primary 3, Primary 4, Primary 5, Primary 6
Secondary 1, Secondary 2, Secondary 3, Secondary 4
JC 1, JC 2
```

### Subjects (19 total)
```
Accounting, Additional Mathematics, Biology, Chemistry, China Studies, 
Chinese, Combined Science, Economics, Elementary Mathematics, English, 
General Paper, Geography, History, Literature, Mathematics, Physics, 
Science, Social Studies, Tamil
```

---

## 2. Seed Data Check

**Result:** ✅ NO SEED DATA FOUND

Checked for these seed centre names from `prisma/seed.js`:
- ABC Learning Centre
- Bright Minds Education
- Excel Tuition Hub
- Future Scholars Academy
- Knowledge Hub
- Prime Education Centre
- Smart Learning Studio
- Top Achievers Tuition
- Victory Learning Centre
- Wisdom Education Hub

**None of these exist in the database.**

---

## 3. Data Source: Excel Ingestion

### Source File
- **File:** `Offerings_MarineParade_Encoded.xlsx`
- **Script:** `scripts/ingest-all-centres.js`
- **Policy:** Insert ALL centres with data quality flags

### Ingestion Process
1. Reads Excel file with encoded subject-level data
2. Parses subject-level combinations (e.g., "Math|P1-P6")
3. Normalizes subjects to canonical names
4. Creates tuition centres with quality flags
5. Links centres to subjects and levels via junction tables

### Data Quality Tracking
- `dataQualityStatus`: "OK" or "NEEDS_REVIEW"
- `dataQualityNotes`: Detailed issues (UNKNOWN levels, invalid subjects, etc.)

---

## 4. Search API Query Flow

### API Endpoint
**File:** `src/app/api/tuition-centres/route.js`

### Service Layer
**File:** `src/lib/services/tuitionCentreService.js`

### Tables Queried
1. **TuitionCentre** (main table)
   - Filters: name, location, dataQualityStatus
   
2. **TuitionCentreLevel** (junction table)
   - Links centres to levels
   - Supports level expansion (e.g., "Secondary" → "Secondary 1-4")
   
3. **TuitionCentreSubject** (junction table)
   - Links centres to subjects
   
4. **Level** (reference table)
   - Stores level names (Primary 1-6, Secondary 1-4, JC 1-2)
   
5. **Subject** (reference table)
   - Stores canonical subject names

### Filter Logic
- **Search:** Name OR Location (case-insensitive)
- **Levels:** OR within levels, AND with other filters
- **Subjects:** OR within subjects, AND with other filters
- **Level expansion:** "Secondary" expands to "Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4"

---

## 5. Sample Centre Data

**Example:** AM Academy
```json
{
  "name": "AM Academy",
  "location": "Marine Parade",
  "whatsappNumber": "",
  "website": "https://www.amacademysg.com/",
  "dataQualityStatus": "OK",
  "levels": ["Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4", "JC 1", "JC 2"],
  "subjects": [
    "Economics", "Accounting", "Elementary Mathematics", "Chemistry",
    "English", "Physics", "Additional Mathematics", "Science", "Mathematics"
  ]
}
```

---

## 6. Recommendations

### ✅ Current State is Correct
- No seed data contamination
- Single source of truth (Excel file)
- Proper data quality tracking
- Clean separation of concerns

### 🔧 Optional Improvements
1. **Seed file:** Consider removing or commenting out the 10 test centres in `prisma/seed.js` to prevent accidental seeding
2. **Data quality:** Review the 40 centres marked "NEEDS_REVIEW" to improve data completeness
3. **WhatsApp numbers:** Most centres have empty WhatsApp numbers - consider enriching this data
4. **Location diversity:** All centres are "Marine Parade" - consider ingesting other locations

---

## 7. Verification Commands

### Check total centres
```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.tuitionCentre.count().then(c=>console.log('Total:',c)).finally(()=>p.\$disconnect())"
```

### Check for seed data
```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.tuitionCentre.findMany({where:{name:{in:['ABC Learning Centre','Bright Minds Education']}}}).then(r=>console.log('Seed centres:',r.length)).finally(()=>p.\$disconnect())"
```

### Check data quality
```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.tuitionCentre.groupBy({by:['dataQualityStatus'],_count:true}).then(r=>console.log(r)).finally(()=>p.\$disconnect())"
```

---

## Conclusion

✅ **Data integrity confirmed**  
✅ **Single source of truth established**  
✅ **No seed/mock/test data in production database**  
✅ **Search API queries correct tables with proper filters**

The system is correctly configured with Excel-ingested data only.
