#!/usr/bin/env node

/**
 * Comprehensive Filter Logic Verification
 * Verifies:
 * 1. location + level + subject are combined using AND logic
 * 2. multiple selections within the same filter type use OR logic
 * 3. empty filters return all centres
 * 4. impossible combinations return zero centres (and do not crash)
 */

const { PrismaClient } = require('@prisma/client');
const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(70));
}

function logTest(testName, testNumber) {
  console.log(`\n${testNumber}. ${testName}`);
  console.log('-'.repeat(70));
}

function logPass(message) {
  log(`   ✓ PASS: ${message}`, 'green');
}

function logFail(message, expected, actual) {
  log(`   ✗ FAIL: ${message}`, 'red');
  log(`     Expected: ${expected}`, 'yellow');
  log(`     Actual: ${actual}`, 'yellow');
}

let testsPassed = 0;
let testsFailed = 0;

function recordPass() {
  testsPassed++;
}

function recordFail() {
  testsFailed++;
}

async function verifyFilterLogic() {
  try {
    log('\n🔍 COMPREHENSIVE FILTER LOGIC VERIFICATION\n', 'magenta');

    // ========================================================================
    // REQUIREMENT 1: Empty filters return all centres
    // ========================================================================
    logSection('REQUIREMENT 1: Empty Filters Return All Centres');

    logTest('No filters provided', '1.1');
    const allCentres = await service.searchTuitionCentres({});
    if (allCentres.data.length === 10) {
      logPass(`Returns all 10 centres`);
      recordPass();
    } else {
      logFail('Should return all centres', '10 centres', `${allCentres.data.length} centres`);
      recordFail();
    }
    log(`   Found: ${allCentres.data.map(c => c.name).join(', ')}`);

    logTest('Empty arrays for filters', '1.2');
    const emptyArrays = await service.searchTuitionCentres({ 
      levels: [], 
      subjects: [] 
    });
    if (emptyArrays.data.length === 10) {
      logPass(`Returns all 10 centres with empty arrays`);
      recordPass();
    } else {
      logFail('Should return all centres', '10 centres', `${emptyArrays.data.length} centres`);
      recordFail();
    }

    logTest('Empty search string', '1.3');
    const emptySearch = await service.searchTuitionCentres({ search: '' });
    if (emptySearch.data.length === 10) {
      logPass(`Returns all 10 centres with empty search`);
      recordPass();
    } else {
      logFail('Should return all centres', '10 centres', `${emptySearch.data.length} centres`);
      recordFail();
    }

    // ========================================================================
    // REQUIREMENT 2: Multiple selections within same filter type use OR logic
    // ========================================================================
    logSection('REQUIREMENT 2: Multiple Selections Within Same Filter Use OR Logic');

    logTest('Multiple levels: Primary OR Secondary', '2.1');
    const multiLevels = await service.searchTuitionCentres({ 
      levels: ['Primary', 'Secondary'] 
    });
    log(`   Found ${multiLevels.data.length} centres:`);
    multiLevels.data.forEach(c => {
      const levelNames = c.levels.map(l => l.name).join(', ');
      log(`     - ${c.name} (${levelNames})`);
    });
    // Should return centres that have Primary OR Secondary (or both)
    // Expected: 9 centres (all except Prime Education Centre which only has JC/IB/IGCSE)
    const hasCorrectLevels = multiLevels.data.every(c => 
      c.levels.some(l => l.name === 'Primary' || l.name === 'Secondary')
    );
    if (hasCorrectLevels && multiLevels.data.length === 9) {
      logPass(`Returns 9 centres with Primary OR Secondary`);
      recordPass();
    } else {
      logFail('Should use OR logic', '9 centres with Primary OR Secondary', `${multiLevels.data.length} centres`);
      recordFail();
    }

    logTest('Multiple subjects: Physics OR Chemistry', '2.2');
    const multiSubjects = await service.searchTuitionCentres({ 
      subjects: ['Physics', 'Chemistry'] 
    });
    log(`   Found ${multiSubjects.data.length} centres:`);
    multiSubjects.data.forEach(c => {
      const subjectNames = c.subjects.map(s => s.name).join(', ');
      log(`     - ${c.name} (${subjectNames})`);
    });
    const hasCorrectSubjects = multiSubjects.data.every(c => 
      c.subjects.some(s => s.name === 'Physics' || s.name === 'Chemistry')
    );
    if (hasCorrectSubjects && multiSubjects.data.length === 4) {
      logPass(`Returns 4 centres with Physics OR Chemistry`);
      recordPass();
    } else {
      logFail('Should use OR logic', '4 centres with Physics OR Chemistry', `${multiSubjects.data.length} centres`);
      recordFail();
    }

    logTest('Multiple subjects: English OR Chinese', '2.3');
    const englishOrChinese = await service.searchTuitionCentres({ 
      subjects: ['English', 'Chinese'] 
    });
    log(`   Found ${englishOrChinese.data.length} centres:`);
    englishOrChinese.data.forEach(c => {
      const subjectNames = c.subjects.map(s => s.name).join(', ');
      log(`     - ${c.name} (${subjectNames})`);
    });
    // Expected: 7 centres that have English OR Chinese
    // (Bright Minds, Future Scholars, Prime Education don't have English or Chinese)
    const hasEnglishOrChinese = englishOrChinese.data.every(c => 
      c.subjects.some(s => s.name === 'English' || s.name === 'Chinese')
    );
    if (hasEnglishOrChinese && englishOrChinese.data.length === 7) {
      logPass(`Returns 7 centres with English OR Chinese`);
      recordPass();
    } else {
      logFail('Should use OR logic', '7 centres', `${englishOrChinese.data.length} centres`);
      recordFail();
    }

    // ========================================================================
    // REQUIREMENT 3: location + level + subject combined using AND logic
    // ========================================================================
    logSection('REQUIREMENT 3: Location + Level + Subject Combined Using AND Logic');

    logTest('Search (location) AND Level', '3.1');
    const searchAndLevel = await service.searchTuitionCentres({ 
      search: 'Bishan',  // Excel Tuition Hub is in Bishan
      levels: ['Primary'] 
    });
    log(`   Found ${searchAndLevel.data.length} centres:`);
    searchAndLevel.data.forEach(c => {
      log(`     - ${c.name} (${c.location}) - Levels: ${c.levels.map(l => l.name).join(', ')}`);
    });
    // Should only return centres in Bishan that have Primary level
    // Expected: Excel Tuition Hub (Bishan, Primary)
    const correctSearchLevel = searchAndLevel.data.every(c => 
      (c.location.includes('Bishan') || c.name.includes('Bishan')) &&
      c.levels.some(l => l.name === 'Primary')
    );
    if (correctSearchLevel && searchAndLevel.data.length === 1) {
      logPass(`Returns 1 centre matching Bishan AND Primary`);
      recordPass();
    } else {
      logFail('Should use AND logic', '1 centre', `${searchAndLevel.data.length} centres`);
      recordFail();
    }

    logTest('Level AND Subject', '3.2');
    const levelAndSubject = await service.searchTuitionCentres({ 
      levels: ['Junior College'],
      subjects: ['Physics'] 
    });
    log(`   Found ${levelAndSubject.data.length} centres:`);
    levelAndSubject.data.forEach(c => {
      log(`     - ${c.name} - Levels: ${c.levels.map(l => l.name).join(', ')} - Subjects: ${c.subjects.map(s => s.name).join(', ')}`);
    });
    const correctLevelSubject = levelAndSubject.data.every(c => 
      c.levels.some(l => l.name === 'Junior College') &&
      c.subjects.some(s => s.name === 'Physics')
    );
    if (correctLevelSubject && levelAndSubject.data.length === 4) {
      logPass(`Returns 4 centres with JC AND Physics`);
      recordPass();
    } else {
      logFail('Should use AND logic', '4 centres with JC AND Physics', `${levelAndSubject.data.length} centres`);
      recordFail();
    }

    logTest('Search (location) AND Level AND Subject', '3.3');
    const allThree = await service.searchTuitionCentres({ 
      search: 'Tampines',  // ABC Learning Centre
      levels: ['Secondary'],
      subjects: ['Mathematics'] 
    });
    log(`   Found ${allThree.data.length} centres:`);
    allThree.data.forEach(c => {
      log(`     - ${c.name} (${c.location}) - Levels: ${c.levels.map(l => l.name).join(', ')} - Subjects: ${c.subjects.map(s => s.name).join(', ')}`);
    });
    // Expected: ABC Learning Centre (Tampines, Secondary, Mathematics)
    const correctAllThree = allThree.data.every(c => 
      (c.location.includes('Tampines') || c.name.includes('Tampines')) &&
      c.levels.some(l => l.name === 'Secondary') &&
      c.subjects.some(s => s.name === 'Mathematics')
    );
    if (correctAllThree && allThree.data.length === 1) {
      logPass(`Returns 1 centre matching Tampines AND Secondary AND Mathematics`);
      recordPass();
    } else {
      logFail('Should use AND logic', '1 centre', `${allThree.data.length} centres`);
      recordFail();
    }

    logTest('Complex: (Primary OR Secondary) AND (Math OR English)', '3.4');
    const complex = await service.searchTuitionCentres({ 
      levels: ['Primary', 'Secondary'],
      subjects: ['Mathematics', 'English'] 
    });
    log(`   Found ${complex.data.length} centres:`);
    complex.data.forEach(c => {
      log(`     - ${c.name} - Levels: ${c.levels.map(l => l.name).join(', ')} - Subjects: ${c.subjects.map(s => s.name).join(', ')}`);
    });
    // Expected: 9 centres (all except Prime Education Centre)
    // All centres with Primary OR Secondary that also have Math OR English
    const correctComplex = complex.data.every(c => 
      c.levels.some(l => l.name === 'Primary' || l.name === 'Secondary') &&
      c.subjects.some(s => s.name === 'Mathematics' || s.name === 'English')
    );
    if (correctComplex && complex.data.length === 9) {
      logPass(`Returns 9 centres with (Primary OR Secondary) AND (Math OR English)`);
      recordPass();
    } else {
      logFail('Should use AND between filter types, OR within', '9 centres', `${complex.data.length} centres`);
      recordFail();
    }

    // ========================================================================
    // REQUIREMENT 4: Impossible combinations return zero centres (no crash)
    // ========================================================================
    logSection('REQUIREMENT 4: Impossible Combinations Return Zero Centres (No Crash)');

    logTest('Non-existent level', '4.1');
    try {
      const noLevel = await service.searchTuitionCentres({ 
        levels: ['University'] 
      });
      if (noLevel.data.length === 0) {
        logPass(`Returns 0 centres for non-existent level (no crash)`);
        recordPass();
      } else {
        logFail('Should return 0 centres', '0 centres', `${noLevel.data.length} centres`);
        recordFail();
      }
    } catch (error) {
      logFail('Should not crash', 'No error', `Error: ${error.message}`);
      recordFail();
    }

    logTest('Non-existent subject', '4.2');
    try {
      const noSubject = await service.searchTuitionCentres({ 
        subjects: ['Quantum Mechanics'] 
      });
      if (noSubject.data.length === 0) {
        logPass(`Returns 0 centres for non-existent subject (no crash)`);
        recordPass();
      } else {
        logFail('Should return 0 centres', '0 centres', `${noSubject.data.length} centres`);
        recordFail();
      }
    } catch (error) {
      logFail('Should not crash', 'No error', `Error: ${error.message}`);
      recordFail();
    }

    logTest('Non-existent location', '4.3');
    try {
      const noLocation = await service.searchTuitionCentres({ 
        search: 'Antarctica' 
      });
      if (noLocation.data.length === 0) {
        logPass(`Returns 0 centres for non-existent location (no crash)`);
        recordPass();
      } else {
        logFail('Should return 0 centres', '0 centres', `${noLocation.data.length} centres`);
        recordFail();
      }
    } catch (error) {
      logFail('Should not crash', 'No error', `Error: ${error.message}`);
      recordFail();
    }

    logTest('Impossible combination: Primary + Physics', '4.4');
    try {
      const impossible = await service.searchTuitionCentres({ 
        levels: ['Primary'],
        subjects: ['Physics'] 
      });
      log(`   Found ${impossible.data.length} centres`);
      if (impossible.data.length === 0) {
        logPass(`Returns 0 centres for impossible combination (no crash)`);
        recordPass();
      } else {
        logFail('Should return 0 centres (Primary schools don\'t teach Physics)', '0 centres', `${impossible.data.length} centres`);
        recordFail();
      }
    } catch (error) {
      logFail('Should not crash', 'No error', `Error: ${error.message}`);
      recordFail();
    }

    logTest('Impossible combination: Non-existent location + valid filters', '4.5');
    try {
      const impossibleCombo = await service.searchTuitionCentres({ 
        search: 'Mars',
        levels: ['Secondary'],
        subjects: ['Mathematics'] 
      });
      if (impossibleCombo.data.length === 0) {
        logPass(`Returns 0 centres for impossible location combination (no crash)`);
        recordPass();
      } else {
        logFail('Should return 0 centres', '0 centres', `${impossibleCombo.data.length} centres`);
        recordFail();
      }
    } catch (error) {
      logFail('Should not crash', 'No error', `Error: ${error.message}`);
      recordFail();
    }

    logTest('Multiple impossible values', '4.6');
    try {
      const multiImpossible = await service.searchTuitionCentres({ 
        levels: ['Kindergarten', 'University', 'Graduate School'],
        subjects: ['Rocket Science', 'Time Travel'] 
      });
      if (multiImpossible.data.length === 0) {
        logPass(`Returns 0 centres for multiple non-existent values (no crash)`);
        recordPass();
      } else {
        logFail('Should return 0 centres', '0 centres', `${multiImpossible.data.length} centres`);
        recordFail();
      }
    } catch (error) {
      logFail('Should not crash', 'No error', `Error: ${error.message}`);
      recordFail();
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    logSection('TEST SUMMARY');
    const totalTests = testsPassed + testsFailed;
    log(`\nTotal Tests: ${totalTests}`, 'cyan');
    log(`Passed: ${testsPassed}`, 'green');
    log(`Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
    
    if (testsFailed === 0) {
      log('\n✅ ALL FILTER LOGIC REQUIREMENTS VERIFIED!', 'green');
      log('   ✓ Empty filters return all centres', 'green');
      log('   ✓ Multiple selections within same filter use OR logic', 'green');
      log('   ✓ Different filter types combined using AND logic', 'green');
      log('   ✓ Impossible combinations return zero centres without crashing', 'green');
    } else {
      log('\n❌ SOME TESTS FAILED - REVIEW REQUIRED', 'red');
    }

    console.log('='.repeat(70));

    process.exit(testsFailed > 0 ? 1 : 0);

  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyFilterLogic();
