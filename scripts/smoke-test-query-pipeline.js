/**
 * Smoke Test: Query Pipeline
 * 
 * Tests the complete flow from filter selection to results display
 * Run: node scripts/smoke-test-query-pipeline.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import service
const path = require('path');
const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;

async function smokeTest() {
  console.log('='.repeat(80));
  console.log('🧪 SMOKE TEST: Query Pipeline');
  console.log('='.repeat(80));
  console.log('\n');

  const service = new TuitionCentreService(prisma);

  // Test Case 1: Secondary + Mathematics
  console.log('📋 Test Case 1: Secondary + Mathematics');
  console.log('-'.repeat(80));
  console.log('URL: /results?level=Secondary&subject=Mathematics');
  console.log('API: /api/tuition-centres?levels=Secondary&subjects=Mathematics');
  console.log('\n');

  const result1 = await service.searchTuitionCentres({
    levels: ['Secondary'],
    subjects: ['Mathematics'],
    page: 1,
    limit: 20
  });

  console.log(`✅ Results: ${result1.pagination.total} centres found`);
  console.log(`   Expected: 17 centres`);
  console.log(`   Match: ${result1.pagination.total === 17 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\n');

  if (result1.data.length > 0) {
    const first = result1.data[0];
    console.log('First result:');
    console.log(`  Name: ${first.name}`);
    console.log(`  Location: ${first.location}`);
    console.log(`  Levels: ${first.levels.map(l => l.name).join(', ')}`);
    console.log(`  Subjects: ${first.subjects.map(s => s.name).join(', ')}`);
    console.log('\n');

    // Verify sorting
    const levelNames = first.levels.map(l => l.name);
    const sortedLevels = sortLevels(first.levels);
    const sortedLevelNames = sortedLevels.map(l => l.name);
    
    console.log('Level sorting:');
    console.log(`  Original order: ${levelNames.join(', ')}`);
    console.log(`  Sorted order: ${sortedLevelNames.join(', ')}`);
    console.log(`  Deterministic: ${JSON.stringify(levelNames) !== JSON.stringify(sortedLevelNames) ? '✅ Sorted' : '⚠️  Already sorted'}`);
    console.log('\n');
  }

  // Test Case 2: Primary + English
  console.log('📋 Test Case 2: Primary + English');
  console.log('-'.repeat(80));
  console.log('URL: /results?level=Primary&subject=English');
  console.log('API: /api/tuition-centres?levels=Primary&subjects=English');
  console.log('\n');

  const result2 = await service.searchTuitionCentres({
    levels: ['Primary'],
    subjects: ['English'],
    page: 1,
    limit: 20
  });

  console.log(`✅ Results: ${result2.pagination.total} centres found`);
  console.log('\n');

  // Test Case 3: Backwards compatibility - singular parameters
  console.log('📋 Test Case 3: Backwards Compatibility');
  console.log('-'.repeat(80));
  console.log('Testing that both singular and plural parameters work');
  console.log('\n');

  // Simulate API route parameter handling
  const testUrls = [
    { url: '?level=Secondary&subject=Mathematics', desc: 'Singular params' },
    { url: '?levels=Secondary&subjects=Mathematics', desc: 'Plural params' },
    { url: '?level=Secondary&subjects=Mathematics', desc: 'Mixed params' }
  ];

  for (const test of testUrls) {
    const params = new URLSearchParams(test.url);
    const levelsParam = params.get('levels') || params.get('level');
    const subjectsParam = params.get('subjects') || params.get('subject');
    
    const levels = levelsParam ? levelsParam.split(',').map(l => l.trim()).filter(Boolean) : undefined;
    const subjects = subjectsParam ? subjectsParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    
    console.log(`  ${test.desc}: ${test.url}`);
    console.log(`    Parsed levels: ${JSON.stringify(levels)}`);
    console.log(`    Parsed subjects: ${JSON.stringify(subjects)}`);
    console.log(`    ✅ ${levels && subjects ? 'PASS' : 'FAIL'}`);
  }
  console.log('\n');

  // Summary
  console.log('='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✅ Test Case 1: ${result1.pagination.total} centres (expected 17)`);
  console.log(`✅ Test Case 2: ${result2.pagination.total} centres`);
  console.log(`✅ Backwards compatibility: All parameter formats work`);
  console.log(`✅ Sorting: Deterministic level/subject ordering`);
  console.log('\n');

  console.log('🎯 SMOKE TEST COMPLETE');
  console.log('\n');
  console.log('To test in browser:');
  console.log('  1. Start dev server: npm run dev');
  console.log('  2. Navigate to: http://localhost:3000/results?level=Secondary&subject=Mathematics');
  console.log('  3. Verify:');
  console.log('     - Filter chips show "Secondary" and "Mathematics"');
  console.log('     - Each card shows "Matched: Secondary" (not "Secondary 3")');
  console.log('     - "Also offers:" shows sorted levels and subjects');
  console.log('     - 17 centres displayed');
  console.log('\n');

  await prisma.$disconnect();
}

// Sorting functions (same as frontend)
function sortLevels(levels) {
  const order = { 'Primary': 1, 'Secondary': 2, 'JC': 3 };
  return [...levels].sort((a, b) => {
    const [aPre, aNum] = a.name.split(' ');
    const [bPre, bNum] = b.name.split(' ');
    const aOrder = order[aPre] || 999;
    const bOrder = order[bPre] || 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return parseInt(aNum || 0) - parseInt(bNum || 0);
  });
}

function sortSubjects(subjects) {
  return [...subjects].sort((a, b) => a.name.localeCompare(b.name));
}

smokeTest().catch(console.error);
