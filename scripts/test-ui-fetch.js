#!/usr/bin/env node
/**
 * Test the exact API call the UI makes
 */

const http = require('http');

function testFetch(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    console.log(`\n🔍 Testing: GET http://localhost:3001${path}`);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        
        try {
          const json = JSON.parse(data);
          console.log(`Response:`, {
            dataCount: json.data?.length,
            total: json.pagination?.total,
            error: json.error
          });
          resolve(json);
        } catch (e) {
          console.log(`Raw response (first 500 chars):`, data.substring(0, 500));
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Request failed:`, error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing UI API calls\n');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // Test 1: No filters (what UI does on /results with no query params)
    await testFetch('/api/tuition-centres');
    
    // Test 2: With filters
    console.log('\n═══════════════════════════════════════════════════════════');
    await testFetch('/api/tuition-centres?levels=Primary&subjects=Math');
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ All tests completed');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
