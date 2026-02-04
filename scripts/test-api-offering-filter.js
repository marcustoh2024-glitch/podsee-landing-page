#!/usr/bin/env node

/**
 * Test the API endpoint to verify level + subject filtering works correctly
 */

async function testAPIOfferingFilter() {
  console.log('🧪 Testing API Offering Filter Logic\n');
  console.log('=' .repeat(80));

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Filter by level only
    console.log('\n🔍 Test 1: Filter by level only (Secondary 3)');
    const levelOnlyResponse = await fetch(`${baseUrl}/api/tuition-centres?levels=Secondary 3`);
    const levelOnlyData = await levelOnlyResponse.json();
    console.log(`   ✓ Found ${levelOnlyData.data.length} centres`);
    console.log(`   Sample: ${levelOnlyData.data[0]?.name || 'N/A'}`);

    // Test 2: Filter by subject only
    console.log('\n🔍 Test 2: Filter by subject only (Economics)');
    const subjectOnlyResponse = await fetch(`${baseUrl}/api/tuition-centres?subjects=Economics`);
    const subjectOnlyData = await subjectOnlyResponse.json();
    console.log(`   ✓ Found ${subjectOnlyData.data.length} centres`);
    console.log(`   Sample: ${subjectOnlyData.data[0]?.name || 'N/A'}`);

    // Test 3: Filter by both level and subject (must match on same offering)
    console.log('\n🔍 Test 3: Filter by level + subject (Secondary 3 + Economics)');
    const bothResponse = await fetch(`${baseUrl}/api/tuition-centres?levels=Secondary 3&subjects=Economics`);
    const bothData = await bothResponse.json();
    console.log(`   ✓ Found ${bothData.data.length} centres`);
    
    if (bothData.data.length > 0) {
      console.log(`   Centres found:`);
      bothData.data.forEach(c => {
        const hasLevel = c.levels.some(l => l.name === 'Secondary 3');
        const hasSubject = c.subjects.some(s => s.name === 'Economics');
        console.log(`   - ${c.name} (Level: ${hasLevel ? '✓' : '✗'}, Subject: ${hasSubject ? '✓' : '✗'})`);
      });
    }

    // Test 4: Verify the count makes sense
    console.log('\n🔍 Test 4: Verify filtering logic');
    const levelCount = levelOnlyData.pagination.total;
    const subjectCount = subjectOnlyData.pagination.total;
    const bothCount = bothData.pagination.total;

    console.log(`   Centres with "Secondary 3": ${levelCount}`);
    console.log(`   Centres with "Economics": ${subjectCount}`);
    console.log(`   Centres with "Secondary 3 + Economics": ${bothCount}`);
    
    if (bothCount <= Math.min(levelCount, subjectCount)) {
      console.log('   ✅ PASS: Combined filter count is less than or equal to individual filters');
    } else {
      console.log('   ❌ FAIL: Combined filter count is greater than individual filters');
    }

    // Test 5: Test with non-existent combination
    console.log('\n🔍 Test 5: Test non-existent combination (JC 1 + Tamil)');
    const nonExistentResponse = await fetch(`${baseUrl}/api/tuition-centres?levels=JC 1&subjects=Tamil`);
    const nonExistentData = await nonExistentResponse.json();
    console.log(`   ✓ Found ${nonExistentData.data.length} centres (should be 0 or very few)`);

    // Test 6: Test with multiple levels and subjects
    console.log('\n🔍 Test 6: Multiple levels and subjects (Primary 1,Primary 2 + English,Math)');
    const multipleResponse = await fetch(`${baseUrl}/api/tuition-centres?levels=Primary 1,Primary 2&subjects=English,Math`);
    const multipleData = await multipleResponse.json();
    console.log(`   ✓ Found ${multipleData.data.length} centres`);
    console.log(`   This should return centres that offer ANY of these combinations:`);
    console.log(`   - Primary 1 + English`);
    console.log(`   - Primary 1 + Math`);
    console.log(`   - Primary 2 + English`);
    console.log(`   - Primary 2 + Math`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ All API tests completed!');
    console.log('\nNote: Make sure the dev server is running on http://localhost:3000');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Error: Could not connect to API server');
      console.error('   Please start the dev server with: npm run dev');
    } else {
      console.error('\n❌ Error during testing:', error.message);
    }
  }
}

// Run the test
testAPIOfferingFilter().catch(console.error);
