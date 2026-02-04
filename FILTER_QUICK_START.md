# Filter System Quick Start

## Current Status: Disabled ❌

Filters are implemented but disabled until offerings data is populated.

## Enable Filters (3 Steps)

### 1. Check Current Status
```bash
node scripts/check-filter-status.js
```

### 2. Populate Offerings Data
```bash
node scripts/populate-offerings.js
```

This creates offerings from existing centre-level-subject relationships.

### 3. Enable Feature Flag
Edit `.env`:
```bash
ENABLE_OFFERING_FILTERS="true"
```

Then restart:
```bash
npm run dev
```

## Verify It Works

### In Browser
1. Visit `http://localhost:3001`
2. You should see filter dropdowns (not disabled)
3. Select a level and subject
4. Click "Apply filters"
5. Results should be filtered correctly

### Run Tests
```bash
# Unit tests
npm test src/lib/services/tuitionCentreService.offering-filters.test.js

# API tests
npm test src/app/api/filter-options/route.test.js

# Integration tests (requires offerings data)
npm test src/app/api/tuition-centres/offering-filters.integration.test.js
```

## Disable Filters

If you need to disable filters:

1. Edit `.env`: `ENABLE_OFFERING_FILTERS="false"`
2. Restart: `npm run dev`

Filters will be disabled and all centres will be shown.

## Key Files

- **Service**: `src/lib/services/tuitionCentreService.js`
- **API**: `src/app/api/tuition-centres/route.js`
- **Options API**: `src/app/api/filter-options/route.js`
- **UI**: `src/components/FilterWizard.jsx`
- **Results**: `src/app/results/page.jsx`

## Troubleshooting

### Filters not showing?
```bash
# Check status
node scripts/check-filter-status.js

# Check API response
curl http://localhost:3001/api/filter-options
```

### Wrong results?
- Check terminal logs (service logs all queries)
- Verify offerings data is correct
- Run integration tests

### Empty dropdowns?
- Ensure offerings exist
- Check `/api/filter-options` returns data
- Verify levels/subjects have offerings

## Documentation

- **Full Guide**: `OFFERING_FILTERS_GUIDE.md`
- **Status**: `FILTER_ROLLOUT_STATUS.md`
- **This File**: Quick reference

## Support Commands

```bash
# Check status
node scripts/check-filter-status.js

# Populate data
node scripts/populate-offerings.js

# Count offerings
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.offering.count().then(c => console.log('Offerings:', c))"

# Run all filter tests
npm test -- --grep "offering"
```
