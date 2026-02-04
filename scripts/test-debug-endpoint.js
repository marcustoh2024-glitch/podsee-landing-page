const fetch = require('node-fetch');

async function testDebugEndpoint() {
  try {
    console.log('🔍 Testing endpoint with filters bypassed...\n');

    // Test 1: No filters at all
    console.log('Test 1: No filters');
    const response1 = await fetch('http://localhost:3000/api/tuition-centres');
    const data1 = await response1.json();
    console.log(`  Total: ${data1.total}`);
    console.log(`  Returned: ${data1.data.length} centres`);
    console.log(`  First 3: ${data1.data.slice(0, 3).map(c => c.name).join(', ')}\n`);

    // Test 2: With level filter (should be ignored)
    console.log('Test 2: With level=Primary (should be bypassed)');
    const response2 = await fetch('http://localhost:3000/api/tuition-centres?levels=Primary');
    const data2 = await response2.json();
    console.log(`  Total: ${data2.total}`);
    console.log(`  Returned: ${data2.data.length} centres`);
    console.log(`  Should match Test 1: ${data1.total === data2.total ? '✅' : '❌'}\n`);

    // Test 3: With subject filter (should be ignored)
    console.log('Test 3: With subjects=Mathematics (should be bypassed)');
    const response3 = await fetch('http://localhost:3000/api/tuition-centres?subjects=Mathematics');
    const data3 = await response3.json();
    console.log(`  Total: ${data3.total}`);
    console.log(`  Returned: ${data3.data.length} centres`);
    console.log(`  Should match Test 1: ${data1.total === data3.total ? '✅' : '❌'}\n`);

    console.log('✅ Debug test complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDebugEndpoint();
