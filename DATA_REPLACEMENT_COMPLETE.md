# Data Replacement Complete ✅

**Date:** February 4, 2026  
**Source:** `database_ready (1).xlsx`  
**Type:** Full replacement (centres-only)

---

## Execution Summary

### A) Database Environment Confirmed
- **Active DB:** `prisma/dev.db` (SQLite)
- **Connection:** `DATABASE_URL="file:./dev.db"` (relative to prisma folder)
- ✅ App queries the same database we're importing into

### B) Hard Reset Completed
All tuition-related data wiped before import:
- TuitionCentres: 0
- Offerings: 0
- Levels: 0
- Subjects: 0
- Join tables: 0

### C) Data Inspection
**File:** `database_ready (1).xlsx`
- **Sheet:** "centres"
- **Structure:** Row 0 = empty, Row 1 = headers, Row 2+ = data
- **Columns:** 10 non-empty columns
  1. centre_name
  2. branch_name
  3. address
  4. postal_code
  5. area
  6. website_url
  7. whatsapp_number
  8. source_url
  9. verification_status
  10. notes

**Key Finding:** Centres-only metadata. No levels/subjects in this file.

### D) Dry Run Analysis
- **Total rows:** 60
- **Valid rows:** 60
- **Invalid rows:** 0
- **Unique centres:** 60
- **Distinct areas:** 1 (Marine Parade)
- **All centres have:** Name, area, WhatsApp number

### E) Real Ingestion
**Script:** `scripts/ingest-centres-only.js`
- **Inserted:** 60 centres
- **Skipped:** 0 duplicates
- **Errors:** 0 (fixed WhatsApp type coercion)
- **Idempotent:** Re-running skips existing centres
- **Source tag:** All centres tagged with `sourceDataset=database_ready_v1` in `dataQualityNotes`

### F) Verification Results

#### Database Counts
- **Total centres:** 60
- **From database_ready_v1:** 60
- **Distinct locations:** 60 (each centre has unique address)
- **Offerings:** 0 ✅
- **Levels:** 0 ✅
- **Subjects:** 0 ✅

#### Sample Centres
1. **AM Academy (Main)**
   - Location: 225A East Coast Road, Singapore 428922
   - WhatsApp: +6598752843
   - Website: https://www.amacademysg.com/

2. **Ace Your Econs (Main)**
   - Location: 1 Marine Parade Centre, Parkway Centre, #02-04, Singapore 449408
   - WhatsApp: +6588910336
   - Website: https://aceyourecons.sg/

3. **Altitude Tuition Centre (Main)**
   - Location: 86 Marine Parade Central, #04-313, Singapore 440086
   - WhatsApp: +6598320764
   - Website: https://www.altitudetuition.com/

#### API Verification
- **Endpoint:** `GET /api/tuition-centres`
- **Default limit:** 20 centres
- **With limit=100:** All 60 centres returned
- **Response structure:** ✅ Correct
  - Each centre has `levels: []` and `subjects: []`
  - WhatsApp links properly formatted
  - All metadata present

#### UI Compatibility
- ✅ API returns centres with empty levels/subjects arrays
- ✅ No seed/demo/proxy data in results
- ✅ All centres are from `database_ready_v1` source

---

## Data Quality Notes

All centres include:
- **Verification status:** "unverified" (as per source data)
- **Source tracking:** Tagged with `sourceDataset=database_ready_v1`
- **Complete contact info:** WhatsApp numbers, websites, addresses
- **Geographic scope:** All centres in Marine Parade area

---

## Next Steps

### Offerings/Levels/Subjects Ingestion
The current dataset contains **centres-only metadata**. To enable filtering by level/subject:

1. **Obtain offerings dataset** (separate file or sheet)
2. **Expected structure:** Centre ID/name + level + subject combinations
3. **Ingestion approach:**
   - Match centres by name/location
   - Create Level and Subject records
   - Create Offering records (centre + level + subject)
   - Update join tables

### Current System Behavior
- **Search without filters:** Returns all 60 centres ✅
- **Search with level/subject filters:** Returns 0 centres (expected - no offerings yet)
- **UI filter dropdowns:** Will be empty (no levels/subjects in DB)

---

## Scripts Created

### Data Management
- `scripts/wipe-tuition-data.js` - Hard reset tuition data
- `scripts/inspect-new-data-fixed.js` - Inspect Excel structure
- `scripts/dry-run-centres-ingestion.js` - Analyze before import
- `scripts/ingest-centres-only.js` - Import centres (idempotent)
- `scripts/verify-centres-ingestion.js` - Post-import verification

### Deprecated Files
The following old Excel file is now obsolete:
- ❌ `Offerings_MarineParade_Encoded.xlsx` (can be archived/deleted)

---

## Compliance Checklist

✅ No old Excel data referenced  
✅ No logic depending on old dataset  
✅ No merge of old and new data  
✅ Full data replacement (not incremental)  
✅ Clean database before import  
✅ Explicit header mapping (no assumptions)  
✅ No schema changes required  
✅ Source dataset tagged for auditability  
✅ Idempotent ingestion (safe to re-run)  
✅ API returns results with no filters  
✅ No seed/demo/proxy data in search results  
✅ No hidden normalization at query time  

---

**Status:** ✅ Centres ingestion complete. Ready for offerings dataset.
