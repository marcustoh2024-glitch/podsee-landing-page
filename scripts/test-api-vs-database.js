/**
 * Test API vs Database
 * 
 * This script:
 * 1. Queries the database directly
 * 2. Calls the API endpoint
 * 3. Compares the results
 */

import { prisma } from '../src/lib/prisma.js';

async function testApiVsDatabase() {
  console.log('═'.repeat(80));
  console.log('API vs DATABASE COMPARISON TEST');
  console.log('═'.repeat(80));
  console.log('\n');
  
  try {
    // ========================================================================
    // TEST 1: Direct database query
    // ========================================================================
    console.log('📊 TEST 1: DIRECT DATABASE QUERY\n');
    console.log('─'.repeat(80));
    
    const dbCentres = await prisma.tuitionCentre.findMany({
      take: 20,
      include: {
        subjects: { include: { subject: true } },
        levels: { include: { level: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`Database Query Result: ${dbCentres.length} centres`);
    
    if (dbCentres.length > 0) {
      console.log('\nFirst 3 centres from database:');
      dbCentres.slice(0, 3).forEach((centre, i) => {
        console.log(`  ${i + 1}. ${centre.name} (${centre.subjects.length} subjects, ${centre.levels.length} levels)`);
      });
    }
    
    console.log('\n');
    
    // ========================================================================
    // TEST 2: API endpoint call
    // ========================================================================
    console.log('🌐 TEST 2: API ENDPOINT CALL\n');
    console.log('─'.repeat(80));
    
    const apiUrl = 'http://localhost:3001/api/tuition-centres';
    console.log(`Calling: ${apiUrl}`);
    console.log('Method: GET');
    console.log('Query Params: (none)\n');
    
    const response = await fetch(apiUrl);
    const apiData = await response.json();
    
    console.log(`HTTP Status: ${response.status}`);
    console.log(`API Response:`);
    console.log(JSON.stringify(apiData, null, 2));
    
    console.log('\n');
    
    // ========================================================================
    // TEST 3: Comparison
    // ========================================================================
    console.log('🔍 TEST 3: COMPARISON\n');
    console.log('─'.repeat(80));
    
    const dbCount = dbCentres.length;
    const apiCount = apiData.data?.length || 0;
    
    console.log(`Database returned: ${dbCount} centres`);
    console.log(`API returned: ${apiCount} centres`);
    
    if (dbCount === apiCount && dbCount > 0) {
      console.log('\n✅ MATCH: API and database return the same count');
    } else if (dbCount > 0 && apiCount === 0) {
      console.log('\n❌ MISMATCH: Database has data but API returns 0');
      console.log('\nPossible causes:');
      console.log('  1. API server is using a different database');
      console.log('  2. API server needs to be restarted');
      console.log('  3. Prisma client cache issue');
      console.log('  4. Default filters are blocking results');
    } else if (dbCount === 0 && apiCount === 0) {
      console.log('\n⚠️  BOTH EMPTY: Neither database nor API have data');
    } else {
      console.log('\n⚠️  PARTIAL MISMATCH: Different counts');
    }
    
    console.log('\n');
    
    // ========================================================================
    // TEST 4: Check Prisma client
    // ========================================================================
    console.log('🔧 TEST 4: PRISMA CLIENT CHECK\n');
    console.log('─'.repeat(80));
    
    console.log('Database URL:', process.env.DATABASE_URL);
    console.log('Node Environment:', process.env.NODE_ENV || 'development');
    
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('✅ TEST COMPLETE');
    console.log('═'.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testApiVsDatabase();
