/**
 * Test script to simulate exact UI filter flow
 * Tests the combinations users would select in the FilterWizard
 */

async function testUIFlow() {
  console.log('═'.repeat(80));
  console.log('UI FLOW SIMULATION TEST');
  console.log('Testing exact filter combinations from FilterWizard component');
  console.log('═'.repeat(80));
  console.log('\n');

  const testCases = [
    {
      name: 'Primary + Mathematics',
      level: 'Primary',
      subject: 'Mathematics'
    },
    {
      name: 'Primary + English',
      level: 'Primary',
      subject: 'English'
    },
    {
      name: 'Primary + Science',
      level: 'Primary',
      subject: 'Science'
    },
    {
      name: 'Secondary + Mathematics',
      level: 'Secondary',
      subject: 'Mathematics'
    },
    {
      name: 'Secondary + English',
      level: 'Secondary',
      subject: 'English'
    },
    {
      name: 'Secondary + Physics',
      level: 'Secondary',
      subject: 'Physics'
    },
    {
      name: 'Junior College + Mathematics',
      level: 'Junior College',
      subject: 'Mathematics'
    },
    {
      name: 'Junior College + English',
      level: 'Junior College',
      subject: 'English'
    },
    {
      name: 'Junior College + Physics',
      level: 'Junior College',
      subject: 'Physics'
    }
  ];

  const results = [];

  for (const testCase of testCases) {
    // Simulate API call
    const params = new URLSearchParams({
      levels: testCase.level,
      subjects: testCase.subject
    });

    try {
      const response = await fetch(`http://localhost:3000/api/tuition-centres?${params.toString()}`);
      const data = await response.json();

      const result = {
        name: testCase.name,
        level: testCase.level,
        subject: testCase.subject,
        count: data.pagination?.total || 0,
        status: response.ok ? '✅' : '❌'
      };

      results.push(result);

      console.log(`${result.status} ${result.name}`);
      console.log(`   Query: levels=${testCase.level}&subjects=${testCase.subject}`);
      console.log(`   Results: ${result.count} centres`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${testCase.name}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('═'.repeat(80));
  console.log('SUMMARY');
  console.log('═'.repeat(80));
  console.log('\n');
  console.log('Filter Combination                          | Results');
  console.log('─'.repeat(80));
  results.forEach(r => {
    const name = r.name.padEnd(43);
    console.log(`${name} | ${r.count}`);
  });
  console.log('\n');

  // Identify problematic combinations
  const zeroResults = results.filter(r => r.count === 0);
  if (zeroResults.length > 0) {
    console.log('⚠️  COMBINATIONS WITH ZERO RESULTS:');
    zeroResults.forEach(r => {
      console.log(`   - ${r.name}`);
    });
    console.log('\n   This is expected if no centres offer that specific combination.');
  } else {
    console.log('✅ All filter combinations returned results!');
  }
  console.log('\n');
}

// Check if server is running
console.log('Note: This test requires the Next.js dev server to be running.');
console.log('If you see connection errors, start the server with: npm run dev\n');

testUIFlow().catch(error => {
  console.error('Test failed:', error.message);
  console.log('\nMake sure the Next.js development server is running (npm run dev)');
  process.exit(1);
});
