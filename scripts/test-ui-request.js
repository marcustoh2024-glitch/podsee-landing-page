#!/usr/bin/env node

/**
 * Test UI Request
 * 
 * Simulates what the UI sends to the API
 */

async function testUIRequest() {
  console.log('🧪 Testing UI Request Simulation\n');
  
  // Test Case 1: What the UI SHOULD send
  console.log('Test 1: Correct format (levels=JC1&subjects=Economics)');
  const url1 = 'http://localhost:3001/api/tuition-centres?levels=JC1&subjects=Economics&limit=100';
  console.log(`URL: ${url1}`);
  
  try {
    const response1 = await fetch(url1);
    const data1 = await response1.json();
    console.log(`Result: ${data1.pagination?.total || 0} centres`);
    if (data1.data && data1.data.length > 0) {
      console.log(`Sample: ${data1.data.slice(0, 3).map(c => c.name).join(', ')}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log('');
  
  // Test Case 2: What if UI sends singular?
  console.log('Test 2: Singular format (level=JC1&subject=Economics)');
  const url2 = 'http://localhost:3001/api/tuition-centres?level=JC1&subject=Economics&limit=100';
  console.log(`URL: ${url2}`);
  
  try {
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    console.log(`Result: ${data2.pagination?.total || 0} centres`);
    if (data2.data && data2.data.length > 0) {
      console.log(`Sample: ${data2.data.slice(0, 3).map(c => c.name).join(', ')}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log('');
  
  // Test Case 3: No filters
  console.log('Test 3: No filters');
  const url3 = 'http://localhost:3001/api/tuition-centres?limit=100';
  console.log(`URL: ${url3}`);
  
  try {
    const response3 = await fetch(url3);
    const data3 = await response3.json();
    console.log(`Result: ${data3.pagination?.total || 0} centres`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log('');
}

testUIRequest();
