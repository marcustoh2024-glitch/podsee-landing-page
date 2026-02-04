#!/usr/bin/env node

/**
 * API Endpoint Validation Script
 * Tests the API routes with the seed data
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(60));
  log(`TEST: ${testName}`, 'cyan');
  console.log('='.repeat(60));
}

async function testAPI() {
  const baseUrl = 'http://localhost:3001';
  
  log('\n🌐 Starting API Validation Tests', 'blue');
  log('Make sure the dev server is running on port 3001\n', 'yellow');

  try {
    // Test 1: Get all centres
    logTest('GET /api/tuition-centres - No filters');
    const res1 = await fetch(`${baseUrl}/api/tuition-centres`);
    const data1 = await res1.json();
    log(`Status: ${res1.status}`);
    log(`Found: ${data1.data?.length || 0} centres`);
    log(`Total: ${data1.pagination?.total || 0}`);
    if (data1.data?.length === 10) {
      log('✓ PASS', 'green');
    } else {
      log('✗ FAIL - Expected 10 centres', 'red');
    }

    // Test 2: Filter by level
    logTest('GET /api/tuition-centres?levels=Primary');
    const res2 = await fetch(`${baseUrl}/api/tuition-centres?levels=Primary`);
    const data2 = await res2.json();
    log(`Status: ${res2.status}`);
    log(`Found: ${data2.data?.length || 0} centres`);
    data2.data?.forEach(c => log(`  - ${c.name}`));
    if (data2.data?.length === 6) {
      log('✓ PASS', 'green');
    } else {
      log('✗ FAIL - Expected 6 centres', 'red');
    }

    // Test 3: Filter by subject
    logTest('GET /api/tuition-centres?subjects=Physics');
    const res3 = await fetch(`${baseUrl}/api/tuition-centres?subjects=Physics`);
    const data3 = await res3.json();
    log(`Status: ${res3.status}`);
    log(`Found: ${data3.data?.length || 0} centres`);
    data3.data?.forEach(c => log(`  - ${c.name}`));
    if (data3.data?.length === 4) {
      log('✓ PASS', 'green');
    } else {
      log('✗ FAIL - Expected 4 centres', 'red');
    }

    // Test 4: Combined filters
    logTest('GET /api/tuition-centres?levels=Secondary&subjects=Physics');
    const res4 = await fetch(`${baseUrl}/api/tuition-centres?levels=Secondary&subjects=Physics`);
    const data4 = await res4.json();
    log(`Status: ${res4.status}`);
    log(`Found: ${data4.data?.length || 0} centres`);
    data4.data?.forEach(c => log(`  - ${c.name}`));
    if (data4.data?.length === 3) {
      log('✓ PASS', 'green');
    } else {
      log('✗ FAIL - Expected 3 centres', 'red');
    }

    // Test 5: Search by location
    logTest('GET /api/tuition-centres?search=Tampines');
    const res5 = await fetch(`${baseUrl}/api/tuition-centres?search=Tampines`);
    const data5 = await res5.json();
    log(`Status: ${res5.status}`);
    log(`Found: ${data5.data?.length || 0} centres`);
    data5.data?.forEach(c => log(`  - ${c.name} (${c.location})`));
    if (data5.data?.length === 1 && data5.data[0].name === 'ABC Learning Centre') {
      log('✓ PASS', 'green');
    } else {
      log('✗ FAIL - Expected 1 centre (ABC Learning Centre)', 'red');
    }

    // Test 6: Pagination
    logTest('GET /api/tuition-centres?page=1&limit=3');
    const res6 = await fetch(`${baseUrl}/api/tuition-centres?page=1&limit=3`);
    const data6 = await res6.json();
    log(`Status: ${res6.status}`);
    log(`Found: ${data6.data?.length || 0} centres`);
    log(`Page: ${data6.pagination?.page}, Total Pages: ${data6.pagination?.totalPages}`);
    if (data6.data?.length === 3 && data6.pagination?.totalPages === 4) {
      log('✓ PASS', 'green');
    } else {
      log('✗ FAIL - Expected 3 centres, 4 pages', 'red');
    }

    // Test 7: Get by ID
    if (data1.data && data1.data.length > 0) {
      const centreId = data1.data[0].id;
      logTest(`GET /api/tuition-centres/${centreId}`);
      const res7 = await fetch(`${baseUrl}/api/tuition-centres/${centreId}`);
      const data7 = await res7.json();
      log(`Status: ${res7.status}`);
      log(`Centre: ${data7.name}`);
      log(`Location: ${data7.location}`);
      log(`Levels: ${data7.levels?.map(l => l.name).join(', ')}`);
      log(`Subjects: ${data7.subjects?.map(s => s.name).join(', ')}`);
      log(`WhatsApp: ${data7.whatsappLink}`);
      if (res7.status === 200 && data7.id === centreId) {
        log('✓ PASS', 'green');
      } else {
        log('✗ FAIL', 'red');
      }
    }

    // Test 8: Invalid ID format
    logTest('GET /api/tuition-centres/invalid-id (should return 400)');
    const res8 = await fetch(`${baseUrl}/api/tuition-centres/invalid-id`);
    const data8 = await res8.json();
    log(`Status: ${res8.status}`);
    log(`Error: ${data8.error?.message}`);
    if (res8.status === 400) {
      log('✓ PASS', 'green');
    } else {
      log('✗ FAIL - Expected 400 status', 'red');
    }

    // Test 9: Non-existent ID
    logTest('GET /api/tuition-centres/00000000-0000-0000-0000-000000000000 (should return 404)');
    const res9 = await fetch(`${baseUrl}/api/tuition-centres/00000000-0000-0000-0000-000000000000`);
    const data9 = await res9.json();
    log(`Status: ${res9.status}`);
    log(`Error: ${data9.error?.message}`);
    if (res9.status === 404) {
      log('✓ PASS', 'green');
    } else {
      log('✗ FAIL - Expected 404 status', 'red');
    }

    log('\n' + '='.repeat(60), 'blue');
    log('✅ API Validation Complete!', 'green');
    log('='.repeat(60), 'blue');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('Make sure the dev server is running: npm run dev', 'yellow');
    process.exit(1);
  }
}

testAPI();
