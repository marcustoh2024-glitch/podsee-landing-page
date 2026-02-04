const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;

async function testFilters() {
  const service = new TuitionCentreService();

  console.log('═'.repeat(80));
  console.log('API FILTER DEBUG TEST');
  console.log('═'.repeat(80));
  console.log('\n');

  // Test 1: No filters
  console.log('TEST 1: No filters');
  console.log('─'.repeat(80));
  const test1 = await service.searchTuitionCentres({});
  console.log('API Response:', {
    total: test1.pagination.total,
    returned: test1.data.length
  });
  console.log('\n');

  // Test 2: JC only
  console.log('TEST 2: JC filter only');
  console.log('─'.repeat(80));
  const test2 = await service.searchTuitionCentres({
    levels: ['JC']
  });
  console.log('API Response:', {
    total: test2.pagination.total,
    returned: test2.data.length
  });
  console.log('\n');

  // Test 3: English only
  console.log('TEST 3: English filter only');
  console.log('─'.repeat(80));
  const test3 = await service.searchTuitionCentres({
    subjects: ['English']
  });
  console.log('API Response:', {
    total: test3.pagination.total,
    returned: test3.data.length
  });
  console.log('\n');

  // Test 4: JC + English
  console.log('TEST 4: JC + English (the problematic case)');
  console.log('─'.repeat(80));
  const test4 = await service.searchTuitionCentres({
    levels: ['JC'],
    subjects: ['English']
  });
  console.log('API Response:', {
    total: test4.pagination.total,
    returned: test4.data.length
  });
  console.log('Centres returned:', test4.data.map(c => c.name).join(', '));
  console.log('\n');

  // Test 5: Secondary + Mathematics
  console.log('TEST 5: Secondary + Mathematics');
  console.log('─'.repeat(80));
  const test5 = await service.searchTuitionCentres({
    levels: ['Secondary'],
    subjects: ['Mathematics']
  });
  console.log('API Response:', {
    total: test5.pagination.total,
    returned: test5.data.length
  });
  console.log('\n');

  // Test 6: Primary + English
  console.log('TEST 6: Primary + English');
  console.log('─'.repeat(80));
  const test6 = await service.searchTuitionCentres({
    levels: ['Primary'],
    subjects: ['English']
  });
  console.log('API Response:', {
    total: test6.pagination.total,
    returned: test6.data.length
  });
  console.log('\n');

  console.log('═'.repeat(80));
  console.log('SUMMARY');
  console.log('═'.repeat(80));
  console.log('All tests completed. Check debug logs above for detailed execution trace.');
  console.log('');
}

testFilters().catch(console.error);
