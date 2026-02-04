#!/usr/bin/env node

/**
 * Test API Endpoints
 * 
 * Tests the actual HTTP API endpoints to ensure they work correctly
 */

const http = require('http');

// Start a simple test by checking if we can import the route handlers
async function testEndpoints() {
  console.log('🌐 Testing API Endpoints\n');
  
  try {
    // Test 1: Filter Options API
    console.log('Test 1: GET /api/filter-options');
    const filterOptionsModule = await import('../src/app/api/filter-options/route.js');
    const mockRequest = { url: 'http://localhost:3000/api/filter-options' };
    const response1 = await filterOptionsModule.GET(mockRequest);
    const data1 = await response1.json();
    
    console.log(`   Enabled: ${data1.enabled}`);
    console.log(`   Levels: ${data1.levels?.length || 0} (${data1.levels?.slice(0, 5).join(', ')}...)`);
    console.log(`   Subjects: ${data1.subjects?.length || 0} (${data1.subjects?.slice(0, 5).join(', ')}...)`);
    console.log(`   Status: ${data1.enabled && data1.levels?.length > 0 && data1.subjects?.length > 0 ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 2: Tuition Centres API - No filters
    console.log('Test 2: GET /api/tuition-centres (no filters)');
    const centresModule = await import('../src/app/api/tuition-centres/route.js');
    const mockRequest2 = { url: 'http://localhost:3000/api/tuition-centres' };
    const response2 = await centresModule.GET(mockRequest2);
    const data2 = await response2.json();
    
    console.log(`   Total centres: ${data2.pagination?.total}`);
    console.log(`   Page: ${data2.pagination?.page}`);
    console.log(`   Limit: ${data2.pagination?.limit}`);
    console.log(`   Total pages: ${data2.pagination?.totalPages}`);
    console.log(`   Status: ${data2.pagination?.total === 60 ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 3: Tuition Centres API - Level filter
    console.log('Test 3: GET /api/tuition-centres?levels=S3');
    const mockRequest3 = { url: 'http://localhost:3000/api/tuition-centres?levels=S3' };
    const response3 = await centresModule.GET(mockRequest3);
    const data3 = await response3.json();
    
    console.log(`   Total centres: ${data3.pagination?.total}`);
    console.log(`   Sample: ${data3.data?.slice(0, 3).map(c => c.name).join(', ')}`);
    console.log(`   Status: ${data3.pagination?.total < 60 && data3.pagination?.total > 0 ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 4: Tuition Centres API - Subject filter
    console.log('Test 4: GET /api/tuition-centres?subjects=Physics');
    const mockRequest4 = { url: 'http://localhost:3000/api/tuition-centres?subjects=Physics' };
    const response4 = await centresModule.GET(mockRequest4);
    const data4 = await response4.json();
    
    console.log(`   Total centres: ${data4.pagination?.total}`);
    console.log(`   Sample: ${data4.data?.slice(0, 3).map(c => c.name).join(', ')}`);
    console.log(`   Status: ${data4.pagination?.total < 60 && data4.pagination?.total > 0 ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 5: Tuition Centres API - Level + Subject filter
    console.log('Test 5: GET /api/tuition-centres?levels=S3&subjects=Physics');
    const mockRequest5 = { url: 'http://localhost:3000/api/tuition-centres?levels=S3&subjects=Physics' };
    const response5 = await centresModule.GET(mockRequest5);
    const data5 = await response5.json();
    
    console.log(`   Total centres: ${data5.pagination?.total}`);
    console.log(`   Sample: ${data5.data?.slice(0, 3).map(c => c.name).join(', ')}`);
    console.log(`   Status: ${data5.pagination?.total <= Math.min(data3.pagination?.total, data4.pagination?.total) ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 6: Verify response includes levels and subjects
    console.log('Test 6: Response includes levels and subjects');
    if (data5.data && data5.data.length > 0) {
      const firstCentre = data5.data[0];
      console.log(`   Centre: ${firstCentre.name}`);
      console.log(`   Levels: ${firstCentre.levels?.map(l => l.name).join(', ')}`);
      console.log(`   Subjects: ${firstCentre.subjects?.map(s => s.name).join(', ')}`);
      console.log(`   Status: ${firstCentre.levels?.length > 0 && firstCentre.subjects?.length > 0 ? '✅ PASS' : '❌ FAIL'}\n`);
    }
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 API Test Summary');
    console.log('═══════════════════════════════════════');
    console.log(`Test 1 (Filter options): ${data1.enabled ? '✅' : '❌'}`);
    console.log(`Test 2 (No filters): ${data2.pagination?.total === 60 ? '✅' : '❌'}`);
    console.log(`Test 3 (Level filter): ${data3.pagination?.total < 60 && data3.pagination?.total > 0 ? '✅' : '❌'}`);
    console.log(`Test 4 (Subject filter): ${data4.pagination?.total < 60 && data4.pagination?.total > 0 ? '✅' : '❌'}`);
    console.log(`Test 5 (Level+Subject): ${data5.pagination?.total <= Math.min(data3.pagination?.total, data4.pagination?.total) ? '✅' : '❌'}`);
    console.log(`Test 6 (Response structure): ${data5.data?.[0]?.levels?.length > 0 ? '✅' : '❌'}`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testEndpoints();
