#!/usr/bin/env node

/**
 * Filter Logic Validation Script
 * 
 * This script validates the tuition centre filter logic by testing:
 * 1. AND logic across filter types (location + level + subject)
 * 2. OR logic within the same filter type
 * 3. Empty filters return all centres
 * 4. Impossible combinations return zero centres without errors
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}━━━ ${testName} ━━━${colors.reset}`);
}

function logPass(message) {
  log(`✓ ${message}`, 'green');
}

function logFail(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ${message}`, 'blue');
}

/**
 * Build Prisma where clause (same logic as tuitionCentreService)
 */
function buildWhereClause(filters = {}) {
  const { search, levels, subjects } = filters;
  const whereConditions = [];

  if (search && search.trim()) {
    whereConditions.push({
      OR: [
        { name: { contains: search.trim() } },
        { location: { contains: search.trim() } }
      ]
    });
  }

  if (levels && levels.length > 0) {
    whereConditions.push({
      levels: {
        some: {
          level: {
            OR: levels.flatMap(level => [
              { id: level },
              { name: { equals: level } }
            ])
          }
        }
      }
    });
  }

  if (subjects && subjects.length > 0) {
    whereConditions.push({
      subjects: {
        some: {
          subject: {
            OR: subjects.flatMap(subject => [
              { id: subject },
              { name: { equals: subject } }
            ])
          }
        }
      }
    });
  }

  return whereConditions.length > 0 ? { AND: whereConditions } : {};
}

/**
 * Execute a filter test
 */
async function testFilter(testName, filters, expectedCondition) {
  logTest(testName);
  
  try {
    const where = buildWhereClause(filters);
    
    const results = await prisma.tuitionCentre.findMany({
      where,
      include: {
        levels: { include: { level: true } },
        subjects: { include: { subject: true } }
      },
      orderBy: { name: 'asc' }
    });

    const count = results.length;
    logInfo(`Filters: ${JSON.stringify(filters)}`);
    logInfo(`Results: ${count} centres found`);
    
    if (count > 0) {
      results.forEach(centre => {
        const levelNames = centre.levels.map(l => l.level.name).join(', ');
        const subjectNames = centre.subjects.map(s => s.subject.name).join(', ');
        logInfo(`  - ${centre.name} (${centre.location}) | Levels: ${levelNames} | Subjects: ${subjectNames}`);
      });
    }

    // Validate expected condition
    const passed = expectedCondition(results, count);
    
    if (passed) {
      logPass('Test passed');
      return true;
    } else {
      logFail('Test failed: Expected condition not met');
      return false;
    }
  } catch (error) {
    logFail(`Test failed with error: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Main validation function
 */
async function validateFilterLogic() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     TUITION CENTRE FILTER LOGIC VALIDATION            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const recordResult = (passed) => {
    results.total++;
    if (passed) results.passed++;
    else results.failed++;
  };

  // Test 1: Empty filters return all centres
  recordResult(await testFilter(
    'Test 1: Empty Filters (Should Return All Centres)',
    {},
    (centres, count) => count > 0
  ));

  // Test 2: Single location filter
  recordResult(await testFilter(
    'Test 2: Single Location Filter (Tampines)',
    { search: 'Tampines' },
    (centres, count) => {
      return count > 0 && centres.every(c => 
        c.location.includes('Tampines') || c.name.includes('Tampines')
      );
    }
  ));

  // Test 3: Single level filter (OR logic within levels)
  recordResult(await testFilter(
    'Test 3: Single Level Filter (Primary)',
    { levels: ['Primary'] },
    (centres, count) => {
      return count > 0 && centres.every(c => 
        c.levels.some(l => l.level.name === 'Primary')
      );
    }
  ));

  // Test 4: Multiple levels filter (OR logic within levels)
  recordResult(await testFilter(
    'Test 4: Multiple Levels Filter (Primary OR Secondary)',
    { levels: ['Primary', 'Secondary'] },
    (centres, count) => {
      return count > 0 && centres.every(c => 
        c.levels.some(l => l.level.name === 'Primary' || l.level.name === 'Secondary')
      );
    }
  ));

  // Test 5: Single subject filter
  recordResult(await testFilter(
    'Test 5: Single Subject Filter (Mathematics)',
    { subjects: ['Mathematics'] },
    (centres, count) => {
      return count > 0 && centres.every(c => 
        c.subjects.some(s => s.subject.name === 'Mathematics')
      );
    }
  ));

  // Test 6: Multiple subjects filter (OR logic within subjects)
  recordResult(await testFilter(
    'Test 6: Multiple Subjects Filter (Physics OR Chemistry)',
    { subjects: ['Physics', 'Chemistry'] },
    (centres, count) => {
      return count > 0 && centres.every(c => 
        c.subjects.some(s => s.subject.name === 'Physics' || s.subject.name === 'Chemistry')
      );
    }
  ));

  // Test 7: AND logic - Level + Subject
  recordResult(await testFilter(
    'Test 7: AND Logic - Level + Subject (Primary AND Mathematics)',
    { levels: ['Primary'], subjects: ['Mathematics'] },
    (centres, count) => {
      return centres.every(c => 
        c.levels.some(l => l.level.name === 'Primary') &&
        c.subjects.some(s => s.subject.name === 'Mathematics')
      );
    }
  ));

  // Test 8: AND logic - Location + Level
  recordResult(await testFilter(
    'Test 8: AND Logic - Location + Level (Tampines AND Primary)',
    { search: 'Tampines', levels: ['Primary'] },
    (centres, count) => {
      return centres.every(c => 
        (c.location.includes('Tampines') || c.name.includes('Tampines')) &&
        c.levels.some(l => l.level.name === 'Primary')
      );
    }
  ));

  // Test 9: AND logic - All three filters
  recordResult(await testFilter(
    'Test 9: AND Logic - Location + Level + Subject (Jurong East AND Secondary AND Physics)',
    { search: 'Jurong East', levels: ['Secondary'], subjects: ['Physics'] },
    (centres, count) => {
      return centres.every(c => 
        (c.location.includes('Jurong East') || c.name.includes('Jurong East')) &&
        c.levels.some(l => l.level.name === 'Secondary') &&
        c.subjects.some(s => s.subject.name === 'Physics')
      );
    }
  ));

  // Test 10: Complex OR within, AND across
  recordResult(await testFilter(
    'Test 10: Complex Filter - (Primary OR Secondary) AND (Mathematics OR English)',
    { levels: ['Primary', 'Secondary'], subjects: ['Mathematics', 'English'] },
    (centres, count) => {
      return centres.every(c => 
        c.levels.some(l => l.level.name === 'Primary' || l.level.name === 'Secondary') &&
        c.subjects.some(s => s.subject.name === 'Mathematics' || s.subject.name === 'English')
      );
    }
  ));

  // Test 11: Impossible combination (should return 0 without error)
  recordResult(await testFilter(
    'Test 11: Impossible Combination (NonExistentLocation AND NonExistentLevel)',
    { search: 'NonExistentLocation123', levels: ['NonExistentLevel456'] },
    (centres, count) => count === 0
  ));

  // Test 12: Partial match on location
  recordResult(await testFilter(
    'Test 12: Partial Location Match (Search: "Jurong")',
    { search: 'Jurong' },
    (centres, count) => {
      return centres.every(c => 
        c.location.toLowerCase().includes('jurong') || 
        c.name.toLowerCase().includes('jurong')
      );
    }
  ));

  // Test 13: Junior College specific
  recordResult(await testFilter(
    'Test 13: Junior College Filter',
    { levels: ['Junior College'] },
    (centres, count) => {
      return count > 0 && centres.every(c => 
        c.levels.some(l => l.level.name === 'Junior College')
      );
    }
  ));

  // Test 14: IB and IGCSE (less common levels)
  recordResult(await testFilter(
    'Test 14: IB OR IGCSE Filter',
    { levels: ['IB', 'IGCSE'] },
    (centres, count) => {
      return centres.every(c => 
        c.levels.some(l => l.level.name === 'IB' || l.level.name === 'IGCSE')
      );
    }
  ));

  // Test 15: Science subjects combination
  recordResult(await testFilter(
    'Test 15: Science Subjects (Physics OR Chemistry OR Biology)',
    { subjects: ['Physics', 'Chemistry', 'Biology'] },
    (centres, count) => {
      return count > 0 && centres.every(c => 
        c.subjects.some(s => 
          s.subject.name === 'Physics' || 
          s.subject.name === 'Chemistry' || 
          s.subject.name === 'Biology'
        )
      );
    }
  ));

  // Print summary
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TEST SUMMARY                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nTotal Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n🎉 All filter logic tests passed!', 'green');
  } else {
    log(`\n⚠️  ${results.failed} test(s) failed. Please review the output above.`, 'red');
  }

  return results.failed === 0;
}

// Run validation
validateFilterLogic()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
