# Offering-Based Filters Implementation Guide

## Overview

This document describes the staged rollout of Level + Subject filters for the tuition centre search, ensuring correctness, testability, and honest UX.

## Architecture

### Data Model

```
Centre ──┬── Offering ──┬── Level
         │              └── Subject
         ├── TuitionCentreLevel (legacy)
         └── TuitionCentreSubject (legacy)
```

The `Offering` table represents explicit level-subject combinations:
- Each row = one centre offers one level + one subject
- Enables exact intersection filtering (Level AND Subject)
- Prevents false positives (claiming availability without proof)

### Filtering Logic

**No filters**: Returns all centres (including those without offerings)

**Level only**: Returns centres with `offerings.some(level matches)`

**Subject only**: Returns centres with `offerings.some(subject matches)`

**Level + Subject**: Returns centres with `offerings.some(level AND subject match on SAME row)`

**Centres without offerings**: 
- Included when no filters applied
- Excluded when any filter applied (can't claim they match)

### Exact Matching Rules

1. **String equality**: Subject names must match exactly (no fuzzy matching)
   - ❌ "Biology" ≠ "Science"
   - ❌ "Economics" ≠ "Humanities"
   - ✅ "Mathematics" = "Mathematics"

2. **Level expansion**: Grouped names expand explicitly
   - "Secondary" → ["Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4"]
   - "Primary" → ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"]
   - "JC" or "Junior College" → ["JC 1", "JC 2"]

3. **No hidden normalization**: What you see is what you get

## Staged Rollout

### Stage 0: Baseline Fallback ✅

**Status**: Implemented

**Behavior**:
- If `ENABLE_OFFERING_FILTERS=false` OR offerings table is empty
- Show info banner: "Filters temporarily disabled"
- Show all centres (ignore level/subject filters)
- Keep search working

**Files**:
- `src/lib/services/tuitionCentreService.js` (fallback logic)
- `src/app/results/page.jsx` (centres-only mode detection)

### Stage 1: UI Restored + Gated ✅

**Status**: Implemented

**Features**:
- Filter UI components restored (level dropdown, subject dropdown)
- Disabled state when `ENABLE_OFFERING_FILTERS=false` OR no offerings
- Feature flag: `ENABLE_OFFERING_FILTERS` in `.env`
- Dynamic filter options from `/api/filter-options`
- "Browse all centres" button when filters disabled

**Files**:
- `src/components/FilterWizard.jsx` (dynamic options, disabled state)
- `src/app/api/filter-options/route.js` (options endpoint)
- `.env` (feature flag)

**Testing**:
```bash
# Test with filters disabled
ENABLE_OFFERING_FILTERS=false npm run dev

# Test with filters enabled (requires offerings data)
ENABLE_OFFERING_FILTERS=true npm run dev
```

### Stage 2: Real Offerings Data Model + API ✅

**Status**: Implemented

**Schema**:
```prisma
model Offering {
  id              String        @id @default(uuid())
  tuitionCentreId String
  levelId         String
  subjectId       String
  tuitionCentre   TuitionCentre @relation(...)
  level           Level         @relation(...)
  subject         Subject       @relation(...)
  
  @@unique([tuitionCentreId, levelId, subjectId])
  @@index([tuitionCentreId])
  @@index([levelId])
  @@index([subjectId])
}
```

**API Endpoints**:
- `GET /api/tuition-centres` - Search with filters
- `GET /api/filter-options` - Get available options

**Query Logic**:
- Implemented in `TuitionCentreService.searchTuitionCentres()`
- Uses Prisma `offerings.some()` for filtering
- Respects feature flag and data availability
- Correct pagination totals

**Files**:
- `prisma/schema.prisma` (Offering model)
- `src/lib/services/tuitionCentreService.js` (query logic)
- `src/app/api/tuition-centres/route.js` (API endpoint)

### Stage 3: Enable Filters Progressively 🚧

**Status**: Ready to enable (requires data population)

**Steps to Enable**:

1. **Populate offerings data**:
   ```bash
   node scripts/populate-offerings.js
   ```
   This creates offerings from existing centre-level-subject relationships.

2. **Verify data**:
   ```bash
   node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.offering.count().then(c => console.log('Offerings:', c))"
   ```

3. **Enable feature flag**:
   ```bash
   # In .env
   ENABLE_OFFERING_FILTERS="true"
   ```

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

5. **Test in browser**:
   - Visit homepage
   - Filters should be enabled
   - Select level + subject
   - Verify results match expectations

**Features When Enabled**:
- ✅ Dynamic filter options (only show levels/subjects that exist in offerings)
- ✅ Active filter chips
- ✅ Clear filters button
- ✅ Immediate results refresh on filter change
- ✅ Helpful empty state when no results
- ✅ Correct pagination totals

## Testing

### Unit Tests

```bash
# Service layer tests
npm test src/lib/services/tuitionCentreService.offering-filters.test.js

# API endpoint tests
npm test src/app/api/filter-options/route.test.js
```

### Integration Tests

```bash
# Full API + database flow
npm test src/app/api/tuition-centres/offering-filters.integration.test.js
```

**Test Coverage**:
- ✅ No filters → all centres returned
- ✅ Level only → correct centres returned
- ✅ Subject only → correct centres returned
- ✅ Level + subject → correct intersection
- ✅ Pagination totals match filtered count
- ✅ Feature flag disabled → filters ignored
- ✅ No offerings → filters ignored
- ✅ Exact matching (no fuzzy logic)
- ✅ Level expansion works correctly

### Manual Testing Checklist

**With filters disabled** (`ENABLE_OFFERING_FILTERS=false`):
- [ ] Homepage shows "Filters temporarily disabled" banner
- [ ] "Browse all centres" button works
- [ ] Results page shows all centres
- [ ] No filter chips shown

**With filters enabled** (`ENABLE_OFFERING_FILTERS=true` + offerings exist):
- [ ] Homepage shows filter dropdowns
- [ ] Dropdowns populated with real data
- [ ] Selecting level auto-expands subject step
- [ ] "Apply filters" button enabled when both selected
- [ ] "Clear filters" button appears when filters selected
- [ ] Results page shows filtered centres
- [ ] Active filter chips displayed
- [ ] "Showing X of Y centres" correct
- [ ] Empty state helpful when no results
- [ ] Pagination works with filters

## UX States

### Filters Disabled
```
┌─────────────────────────────────────┐
│ ℹ️ Filters temporarily disabled     │
│ Level and subject filters are being │
│ prepared. For now, browse all       │
│ centres.                            │
│                                     │
│ [Browse all centres]                │
└─────────────────────────────────────┘
```

### Filters Enabled
```
┌─────────────────────────────────────┐
│ Step 1: Level                       │
│ ✓ Secondary 1                       │
│                                     │
│ Step 2: Subject                     │
│ ✓ Mathematics                       │
│                                     │
│ [Clear filters]                     │
│ [Apply filters]                     │
└─────────────────────────────────────┘
```

### Empty Results
```
┌─────────────────────────────────────┐
│ 🔍 No Centres Found                 │
│                                     │
│ We couldn't find any tuition centres│
│ matching your selected filters.     │
│                                     │
│ Try:                                │
│ • Removing some filters             │
│ • Selecting different levels        │
│ • Checking back later               │
│                                     │
│ [← Adjust Filters]                  │
└─────────────────────────────────────┘
```

## Data Population

### From Existing Data

Use `scripts/populate-offerings.js` to create offerings from existing centre-level-subject relationships:

```bash
node scripts/populate-offerings.js
```

**Strategy**: Creates offerings for ALL combinations of a centre's levels and subjects.

**Example**:
- Centre A offers: [Primary 1, Primary 2] × [Math, English]
- Creates 4 offerings: P1+Math, P1+English, P2+Math, P2+English

### From Excel/CSV

If you have structured data:

1. Parse the data to extract centre-level-subject combinations
2. Create Level and Subject records (if not exist)
3. Create Offering records linking them

See `scripts/ingest-centres-only.js` for reference.

### Manual Entry

For testing or small datasets:

```javascript
await prisma.offering.create({
  data: {
    tuitionCentre: { connect: { id: centreId } },
    level: { connect: { name: 'Secondary 1' } },
    subject: { connect: { name: 'Mathematics' } }
  }
});
```

## Configuration

### Environment Variables

```bash
# .env
ENABLE_OFFERING_FILTERS="false"  # Set to "true" to enable filters
```

### Feature Flag Behavior

| Flag Value | Offerings Exist | Behavior |
|------------|----------------|----------|
| `false` | No | Filters disabled, show all centres |
| `false` | Yes | Filters disabled, show all centres |
| `true` | No | Filters disabled, show all centres |
| `true` | Yes | **Filters enabled** ✅ |

## Troubleshooting

### Filters not showing

1. Check feature flag: `echo $ENABLE_OFFERING_FILTERS`
2. Check offerings count: `node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.offering.count().then(c => console.log(c))"`
3. Check browser console for errors
4. Verify `/api/filter-options` returns `enabled: true`

### Wrong results

1. Check query logs in terminal (service logs Prisma queries)
2. Verify offerings data is correct
3. Run integration tests
4. Check for duplicate offerings

### Empty filter dropdowns

1. Verify offerings exist: `node scripts/populate-offerings.js`
2. Check `/api/filter-options` response
3. Ensure levels/subjects have at least one offering

## Future Enhancements

### Potential Additions

1. **Subject synonyms/grouping**: Add a mapping table for "Biology" → "Science"
2. **Offering metadata**: Add `sourceType`, `confidence`, `lastVerifiedAt`
3. **Multi-select filters**: Allow selecting multiple levels/subjects
4. **Location filter**: Add area/region filtering
5. **Sort options**: By name, location, relevance
6. **Save filters**: Remember user's last search

### Migration Path

When adding new features:
1. Keep exact matching as default
2. Add opt-in fuzzy matching if needed
3. Document all mapping rules
4. Add tests for new behavior
5. Update this guide

## API Reference

### GET /api/tuition-centres

**Query Parameters**:
- `levels` (string): Comma-separated level names (e.g., "Secondary 1,Secondary 2")
- `subjects` (string): Comma-separated subject names (e.g., "Mathematics,English")
- `search` (string): Search term for name or location
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20, max: 100)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Centre Name",
      "location": "Location",
      "whatsappNumber": "12345678",
      "whatsappLink": "https://wa.me/12345678",
      "website": "https://...",
      "levels": [{ "id": "uuid", "name": "Secondary 1" }],
      "subjects": [{ "id": "uuid", "name": "Mathematics" }]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### GET /api/filter-options

**Response**:
```json
{
  "enabled": true,
  "levels": ["Primary 1", "Secondary 1", "JC 1"],
  "subjects": ["Mathematics", "English", "Physics"]
}
```

Or when disabled:
```json
{
  "enabled": false,
  "levels": [],
  "subjects": [],
  "reason": "Feature flag disabled"
}
```

## Deployment Checklist

Before enabling in production:

- [ ] Run all tests: `npm test`
- [ ] Populate offerings data
- [ ] Verify data quality (no duplicates, correct relationships)
- [ ] Test with real user scenarios
- [ ] Monitor API performance
- [ ] Set up error tracking
- [ ] Document rollback plan
- [ ] Enable feature flag
- [ ] Monitor for issues
- [ ] Gather user feedback

## Support

For questions or issues:
1. Check this guide
2. Review test files for examples
3. Check service layer logs
4. Run verification scripts
