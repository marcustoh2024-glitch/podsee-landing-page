#!/usr/bin/env node

/**
 * Test Filter Logic
 * 
 * Verifies that filtering works correctly with the following tests:
 * 1. No filters returns all centres (total 60)
 * 2. Level filter returns subset (total < 60)
 * 3. Subject filter returns subset (total < 60)
 * 4. Level+Subject returns intersection (total <= either subset)
 */

const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

async function runTests() {
  console.log('🧪 Testing Filter Logic\n');
  
  try {
    // Test 1: No filters
    console.log('Test 1: No filters (should return all centres)');
    const test1 = await service.searchTuitionCentres({});
    console.log(`   Result: ${test1.pagination.total} centres`);
    console.log(`   Expected: 60 centres`);
    console.log(`   Status: ${test1.pagination.total === 60 ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 2: Level filter only
    console.log('Test 2: Level filter (S3 only)');
    const test2 = await service.searchTuitionCentres({
      levels: ['S3']
    });
    console.log(`   Result: ${test2.pagination.total} centres`);
    console.log(`   Expected: < 60 centres`);
    console.log(`   Status: ${test2.pagination.total < 60 && test2.pagination.total > 0 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Sample centres: ${test2.data.slice(0, 3).map(c => c.name).join(', ')}\n`);
    
    // Test 3: Subject filter only
    console.log('Test 3: Subject filter (Physics only)');
    const test3 = await service.searchTuitionCentres({
      subjects: ['Physics']
    });
    console.log(`   Result: ${test3.pagination.total} centres`);
    console.log(`   Expected: < 60 centres`);
    console.log(`   Status: ${test3.pagination.total < 60 && test3.pagination.total > 0 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Sample centres: ${test3.data.slice(0, 3).map(c => c.name).join(', ')}\n`);
    
    // Test 4: Level + Subject filter (intersection)
    console.log('Test 4: Level + Subject filter (S3 + Physics)');
    const test4 = await service.searchTuitionCentres({
      levels: ['S3'],
      subjects: ['Physics']
    });
    console.log(`   Result: ${test4.pagination.total} centres`);
    console.log(`   Expected: <= ${Math.min(test2.pagination.total, test3.pagination.total)} centres (intersection)`);
    console.log(`   Status: ${test4.pagination.total <= Math.min(test2.pagination.total, test3.pagination.total) ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Sample centres: ${test4.data.slice(0, 3).map(c => c.name).join(', ')}\n`);
    
    // Test 5: Multiple levels (OR logic)
    console.log('Test 5: Multiple levels (S3 OR S4)');
    const test5 = await service.searchTuitionCentres({
      levels: ['S3', 'S4']
    });
    console.log(`   Result: ${test5.pagination.total} centres`);
    console.log(`   Expected: >= ${test2.pagination.total} centres (OR logic)`);
    console.log(`   Status: ${test5.pagination.total >= test2.pagination.total ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 6: Multiple subjects (OR logic)
    console.log('Test 6: Multiple subjects (Physics OR Chemistry)');
    const test6 = await service.searchTuitionCentres({
      subjects: ['Physics', 'Chemistry']
    });
    console.log(`   Result: ${test6.pagination.total} centres`);
    console.log(`   Expected: >= ${test3.pagination.total} centres (OR logic)`);
    console.log(`   Status: ${test6.pagination.total >= test3.pagination.total ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 7: Level expansion (Secondary -> S1-S4)
    console.log('Test 7: Level expansion (Secondary -> S1, S2, S3, S4)');
    const test7 = await service.searchTuitionCentres({
      levels: ['Secondary']
    });
    console.log(`   Result: ${test7.pagination.total} centres`);
    console.log(`   Expected: >= ${test2.pagination.total} centres (expansion)`);
    console.log(`   Status: ${test7.pagination.total >= test2.pagination.total ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Test 8: Verify response structure
    console.log('Test 8: Response structure');
    const test8 = await service.searchTuitionCentres({ levels: ['P1'] });
    const hasData = Array.isArray(test8.data);
    const hasPagination = test8.pagination && 
                          typeof test8.pagination.total === 'number' &&
                          typeof test8.pagination.page === 'number' &&
                          typeof test8.pagination.limit === 'number' &&
                          typeof test8.pagination.totalPages === 'number';
    const hasLevelsSubjects = test8.data.length > 0 && 
                              Array.isArray(test8.data[0].levels) &&
                              Array.isArray(test8.data[0].subjects);
    
    console.log(`   Has data array: ${hasData ? '✅' : '❌'}`);
    console.log(`   Has pagination metadata: ${hasPagination ? '✅' : '❌'}`);
    console.log(`   Centres include levels/subjects: ${hasLevelsSubjects ? '✅' : '❌'}`);
    console.log(`   Status: ${hasData && hasPagination && hasLevelsSubjects ? '✅ PASS' : '❌ FAIL'}\n`);
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 Test Summary');
    console.log('═══════════════════════════════════════');
    console.log(`Test 1 (No filters): ${test1.pagination.total === 60 ? '✅' : '❌'}`);
    console.log(`Test 2 (Level filter): ${test2.pagination.total < 60 && test2.pagination.total > 0 ? '✅' : '❌'}`);
    console.log(`Test 3 (Subject filter): ${test3.pagination.total < 60 && test3.pagination.total > 0 ? '✅' : '❌'}`);
    console.log(`Test 4 (Level+Subject): ${test4.pagination.total <= Math.min(test2.pagination.total, test3.pagination.total) ? '✅' : '❌'}`);
    console.log(`Test 5 (Multiple levels): ${test5.pagination.total >= test2.pagination.total ? '✅' : '❌'}`);
    console.log(`Test 6 (Multiple subjects): ${test6.pagination.total >= test3.pagination.total ? '✅' : '❌'}`);
    console.log(`Test 7 (Level expansion): ${test7.pagination.total >= test2.pagination.total ? '✅' : '❌'}`);
    console.log(`Test 8 (Response structure): ${hasData && hasPagination && hasLevelsSubjects ? '✅' : '❌'}`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
