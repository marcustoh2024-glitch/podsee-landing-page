const { PrismaClient } = require('@prisma/client');
const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;

const prisma = new PrismaClient();
const service = new TuitionCentreService();

async function testBypassFilters() {
  try {
    console.log('🔍 Testing with filters bypassed...\n');

    // Test 1: No filters
    console.log('Test 1: No filters at all');
    const result1 = await service.searchTuitionCentres({
      page: 1,
      limit: 5
    });
    console.log(`  Total: ${result1.pagination.total}`);
    console.log(`  Returned: ${result1.data.length} centres`);
    console.log(`  First 3: ${result1.data.slice(0, 3).map(c => c.name).join(', ')}\n`);

    // Test 2: With level filter (to see if it reduces results)
    console.log('Test 2: With level=Primary filter');
    const result2 = await service.searchTuitionCentres({
      levels: ['Primary'],
      page: 1,
      limit: 5
    });
    console.log(`  Total: ${result2.pagination.total}`);
    console.log(`  Returned: ${result2.data.length} centres`);
    console.log(`  First 3: ${result2.data.slice(0, 3).map(c => c.name).join(', ')}\n`);

    // Test 3: With subject filter
    console.log('Test 3: With subjects=Mathematics filter');
    const result3 = await service.searchTuitionCentres({
      subjects: ['Mathematics'],
      page: 1,
      limit: 5
    });
    console.log(`  Total: ${result3.pagination.total}`);
    console.log(`  Returned: ${result3.data.length} centres`);
    console.log(`  First 3: ${result3.data.slice(0, 3).map(c => c.name).join(', ')}\n`);

    console.log('📊 Summary:');
    console.log(`  No filters: ${result1.pagination.total} centres`);
    console.log(`  Primary filter: ${result2.pagination.total} centres`);
    console.log(`  Mathematics filter: ${result3.pagination.total} centres`);
    
    if (result2.total === 0 || result3.total === 0) {
      console.log('\n⚠️  WARNING: Filters are returning 0 results!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBypassFilters();
