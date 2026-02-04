/**
 * Verify API Fix
 * Test all filter combinations to ensure the fix works
 */

async function verifyFix() {
  console.log('═'.repeat(80));
  console.log('API FIX VERIFICATION');
  console.log('═'.repeat(80));
  console.log('\n');
  
  const tests = [
    { name: 'No filters (baseline)', url: 'http://localhost:3001/api/tuition-centres', expected: 60 },
    { name: 'levels=Secondary (FIXED)', url: 'http://localhost:3001/api/tuition-centres?levels=Secondary', expected: 31 },
    { name: 'levels=Primary', url: 'http://localhost:3001/api/tuition-centres?levels=Primary', expected: '>0' },
    { name: 'levels=JC', url: 'http://localhost:3001/api/tuition-centres?levels=JC', expected: '>0' },
    { name: 'subjects=English', url: 'http://localhost:3001/api/tuition-centres?subjects=English', expected: 21 },
    { name: 'subjects=Mathematics', url: 'http://localhost:3001/api/tuition-centres?subjects=Mathematics', expected: '>0' },
    { name: 'levels=Secondary&subjects=English (FIXED)', url: 'http://localhost:3001/api/tuition-centres?levels=Secondary&subjects=English', expected: 12 },
    { name: 'levels=Primary&subjects=Mathematics', url: 'http://localhost:3001/api/tuition-centres?levels=Primary&subjects=Mathematics', expected: '>0' },
    { name: 'levels=JC&subjects=Economics', url: 'http://localhost:3001/api/tuition-centres?levels=JC&subjects=Economics', expected: '>0' },
    { name: 'Multiple levels: Primary,Secondary', url: 'http://localhost:3001/api/tuition-centres?levels=Primary,Secondary', expected: '>0' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      const total = data.pagination?.total || 0;
      
      let status = '✅';
      if (typeof test.expected === 'number') {
        if (total !== test.expected) {
          status = '❌';
          failed++;
        } else {
          passed++;
        }
      } else if (test.expected === '>0') {
        if (total === 0) {
          status = '❌';
          failed++;
        } else {
          passed++;
        }
      }
      
      console.log(`${status} ${test.name}`);
      console.log(`   Expected: ${test.expected}, Got: ${total}`);
      
      if (total > 0 && data.data && data.data.length > 0) {
        console.log(`   Sample: ${data.data[0].name}`);
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      failed++;
    }
  }
  
  console.log('═'.repeat(80));
  console.log('SUMMARY');
  console.log('═'.repeat(80));
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  console.log('');
  
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED - FIX IS WORKING!');
  } else {
    console.log('⚠️  SOME TESTS FAILED - REVIEW NEEDED');
  }
  console.log('');
}

verifyFix();
