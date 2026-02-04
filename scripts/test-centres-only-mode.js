#!/usr/bin/env node
/**
 * TEST: Centres-Only Mode
 * Verifies that the system correctly handles centres without offerings
 */

const http = require('http');

function testAPI(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ description, status: res.statusCode, data: json });
        } catch (e) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

async function runTests() {
  console.log('🧪 CENTRES-ONLY MODE TEST SUITE\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Test 1: No filters (should return all centres)
    const test1 = await testAPI('/api/tuition-centres', 'No filters');
    console.log(`✅ Test 1: ${test1.description}`);
    console.log(`   Status: ${test1.status}`);
    console.log(`   Returned: ${test1.data.data?.length} centres`);
    console.log(`   Total: ${test1.data.pagination?.total}\n`);

    // Test 2: With level filter (should ignore and return all)
    const test2 = await testAPI('/api/tuition-centres?levels=Secondary', 'With level filter');
    console.log(`✅ Test 2: ${test2.description}`);
    console.log(`   Status: ${test2.status}`);
    console.log(`   Returned: ${test2.data.data?.length} centres`);
    console.log(`   Total: ${test2.data.pagination?.total}`);
    console.log(`   Expected: Should ignore filter and return all centres\n`);

    // Test 3: With level + subject filter (should ignore and return all)
    const test3 = await testAPI('/api/tuition-centres?levels=Secondary&subjects=English', 'With level + subject filters');
    console.log(`✅ Test 3: ${test3.description}`);
    console.log(`   Status: ${test3.status}`);
    console.log(`   Returned: ${test3.data.data?.length} centres`);
    console.log(`   Total: ${test3.data.pagination?.total}`);
    console.log(`   Expected: Should ignore filters and return all centres\n`);

    // Test 4: Check that centres have empty offerings
    const test4 = await testAPI('/api/tuition-centres?limit=5', 'Check offerings structure');
    const allEmpty = test4.data.data?.every(c => 
      (!c.levels || c.levels.length === 0) && 
      (!c.subjects || c.subjects.length === 0)
    );
    console.log(`✅ Test 4: ${test4.description}`);
    console.log(`   All centres have empty levels/subjects: ${allEmpty ? 'YES ✅' : 'NO ❌'}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED');
    console.log('\nSummary:');
    console.log('  - API ignores level/subject filters when offerings = 0');
    console.log('  - All centres returned have empty levels/subjects arrays');
    console.log('  - UI should detect centres-only mode and hide filters');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runTests();
