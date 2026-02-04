#!/usr/bin/env node

/**
 * Filter Logic Validation Script
 * Tests the tuition centre search and filter functionality with the seed data
 */

const { PrismaClient } = require('@prisma/client');
const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

// ANSI color codes for output
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
  console.log('\n' + '='.repeat(60));
  log(`TEST: ${testName}`, 'cyan');
  console.log('='.repeat(60));
}

function logResult(passed, expected, actual) {
  if (passed) {
    log(`✓ PASS`, 'green');
  } else {
    log(`✗ FAIL`, 'red');
    log(`  Expected: ${expected}`, 'yellow');
    log(`  Actual: ${actual}`, 'yellow');
  }
}

async function validateFilters() {
  try {
    log('\n🔍 Starting Filter Validation Tests\n', 'blue');

    // Test 1: No filters - should return all centres
    logTest('No filters - return all centres');
    const allCentres = await service.searchTuitionCentres({});
    log(`Found ${allCentres.data.length} centres`);
    logResult(allCentres.data.length === 10, '10 centres', `${allCentres.data.length} centres`);
    allCentres.data.forEach(c => log(`  - ${c.name} (${c.location})`));

    // Test 2: Filter by single level - Primary
    logTest('Filter by level: Primary');
    const primaryCentres = await service.searchTuitionCentres({ levels: ['Primary'] });
    log(`Found ${primaryCentres.data.length} centres`);
    const expectedPrimary = ['ABC Learning Centre', 'Excel Tuition Hub', 'Knowledge Hub', 'Smart Learning Studio', 'Victory Learning Centre', 'Wisdom Education Hub'];
    const actualPrimary = primaryCentres.data.map(c => c.name).sort();
    const primaryMatch = expectedPrimary.sort().every((name, i) => actualPrimary[i] === name);
    logResult(primaryMatch && primaryCentres.data.length === 6, '6 centres with Primary', `${primaryCentres.data.length} centres`);
    primaryCentres.data.forEach(c => log(`  - ${c.name} (${c.levels.map(l => l.name).join(', ')})`));

    // Test 3: Filter by single level - Secondary
    logTest('Filter by level: Secondary');
    const secondaryCentres = await service.searchTuitionCentres({ levels: ['Secondary'] });
    log(`Found ${secondaryCentres.data.length} centres`);
    const expectedSecondary = ['ABC Learning Centre', 'Bright Minds Education', 'Future Scholars Academy', 'Knowledge Hub', 'Smart Learning Studio', 'Top Achievers Tuition', 'Wisdom Education Hub'];
    const actualSecondary = secondaryCentres.data.map(c => c.name).sort();
    const secondaryMatch = expectedSecondary.sort().every((name, i) => actualSecondary[i] === name);
    logResult(secondaryMatch && secondaryCentres.data.length === 7, '7 centres with Secondary', `${secondaryCentres.data.length} centres`);
    secondaryCentres.data.forEach(c => log(`  - ${c.name} (${c.levels.map(l => l.name).join(', ')})`));

    // Test 4: Filter by single level - Junior College
    logTest('Filter by level: Junior College');
    const jcCentres = await service.searchTuitionCentres({ levels: ['Junior College'] });
    log(`Found ${jcCentres.data.length} centres`);
    const expectedJC = ['Bright Minds Education', 'Future Scholars Academy', 'Prime Education Centre', 'Top Achievers Tuition'];
    const actualJC = jcCentres.data.map(c => c.name).sort();
    const jcMatch = expectedJC.sort().every((name, i) => actualJC[i] === name);
    logResult(jcMatch && jcCentres.data.length === 4, '4 centres with JC', `${jcCentres.data.length} centres`);
    jcCentres.data.forEach(c => log(`  - ${c.name} (${c.levels.map(l => l.name).join(', ')})`));

    // Test 5: Filter by single subject - Mathematics
    logTest('Filter by subject: Mathematics');
    const mathCentres = await service.searchTuitionCentres({ subjects: ['Mathematics'] });
    log(`Found ${mathCentres.data.length} centres`);
    logResult(mathCentres.data.length === 10, '10 centres (all have Math)', `${mathCentres.data.length} centres`);
    mathCentres.data.forEach(c => log(`  - ${c.name} (${c.subjects.map(s => s.name).join(', ')})`));

    // Test 6: Filter by single subject - Physics
    logTest('Filter by subject: Physics');
    const physicsCentres = await service.searchTuitionCentres({ subjects: ['Physics'] });
    log(`Found ${physicsCentres.data.length} centres`);
    const expectedPhysics = ['Bright Minds Education', 'Future Scholars Academy', 'Prime Education Centre', 'Top Achievers Tuition'];
    const actualPhysics = physicsCentres.data.map(c => c.name).sort();
    const physicsMatch = expectedPhysics.sort().every((name, i) => actualPhysics[i] === name);
    logResult(physicsMatch && physicsCentres.data.length === 4, '4 centres with Physics', `${physicsCentres.data.length} centres`);
    physicsCentres.data.forEach(c => log(`  - ${c.name} (${c.subjects.map(s => s.name).join(', ')})`));

    // Test 7: Filter by single subject - Chinese
    logTest('Filter by subject: Chinese');
    const chineseCentres = await service.searchTuitionCentres({ subjects: ['Chinese'] });
    log(`Found ${chineseCentres.data.length} centres`);
    const expectedChinese = ['Excel Tuition Hub', 'Knowledge Hub', 'Victory Learning Centre'];
    const actualChinese = chineseCentres.data.map(c => c.name).sort();
    const chineseMatch = expectedChinese.sort().every((name, i) => actualChinese[i] === name);
    logResult(chineseMatch && chineseCentres.data.length === 3, '3 centres with Chinese', `${chineseCentres.data.length} centres`);
    chineseCentres.data.forEach(c => log(`  - ${c.name} (${c.subjects.map(s => s.name).join(', ')})`));

    // Test 8: Combined filter - Primary + Mathematics
    logTest('Combined filter: Primary AND Mathematics');
    const primaryMath = await service.searchTuitionCentres({ 
      levels: ['Primary'], 
      subjects: ['Mathematics'] 
    });
    log(`Found ${primaryMath.data.length} centres`);
    const expectedPrimaryMath = ['ABC Learning Centre', 'Excel Tuition Hub', 'Knowledge Hub', 'Smart Learning Studio', 'Victory Learning Centre', 'Wisdom Education Hub'];
    const actualPrimaryMath = primaryMath.data.map(c => c.name).sort();
    const primaryMathMatch = expectedPrimaryMath.sort().every((name, i) => actualPrimaryMath[i] === name);
    logResult(primaryMathMatch && primaryMath.data.length === 6, '6 centres with Primary AND Math', `${primaryMath.data.length} centres`);
    primaryMath.data.forEach(c => log(`  - ${c.name} (${c.levels.map(l => l.name).join(', ')}) - (${c.subjects.map(s => s.name).join(', ')})`));

    // Test 9: Combined filter - Secondary + Physics
    logTest('Combined filter: Secondary AND Physics');
    const secondaryPhysics = await service.searchTuitionCentres({ 
      levels: ['Secondary'], 
      subjects: ['Physics'] 
    });
    log(`Found ${secondaryPhysics.data.length} centres`);
    const expectedSecPhysics = ['Bright Minds Education', 'Future Scholars Academy', 'Top Achievers Tuition'];
    const actualSecPhysics = secondaryPhysics.data.map(c => c.name).sort();
    const secPhysicsMatch = expectedSecPhysics.sort().every((name, i) => actualSecPhysics[i] === name);
    logResult(secPhysicsMatch && secondaryPhysics.data.length === 3, '3 centres with Secondary AND Physics', `${secondaryPhysics.data.length} centres`);
    secondaryPhysics.data.forEach(c => log(`  - ${c.name} (${c.levels.map(l => l.name).join(', ')}) - (${c.subjects.map(s => s.name).join(', ')})`));

    // Test 10: Combined filter - Junior College + Chemistry
    logTest('Combined filter: Junior College AND Chemistry');
    const jcChemistry = await service.searchTuitionCentres({ 
      levels: ['Junior College'], 
      subjects: ['Chemistry'] 
    });
    log(`Found ${jcChemistry.data.length} centres`);
    const expectedJCChem = ['Bright Minds Education', 'Future Scholars Academy', 'Prime Education Centre', 'Top Achievers Tuition'];
    const actualJCChem = jcChemistry.data.map(c => c.name).sort();
    const jcChemMatch = expectedJCChem.sort().every((name, i) => actualJCChem[i] === name);
    logResult(jcChemMatch && jcChemistry.data.length === 4, '4 centres with JC AND Chemistry', `${jcChemistry.data.length} centres`);
    jcChemistry.data.forEach(c => log(`  - ${c.name} (${c.levels.map(l => l.name).join(', ')}) - (${c.subjects.map(s => s.name).join(', ')})`));

    // Test 11: Search by location
    logTest('Search by location: Tampines');
    const tampinesCentres = await service.searchTuitionCentres({ search: 'Tampines' });
    log(`Found ${tampinesCentres.data.length} centres`);
    logResult(tampinesCentres.data.length === 1 && tampinesCentres.data[0].name === 'ABC Learning Centre', '1 centre in Tampines', `${tampinesCentres.data.length} centres`);
    tampinesCentres.data.forEach(c => log(`  - ${c.name} (${c.location})`));

    // Test 12: Search by name
    logTest('Search by name: "Learning"');
    const learningCentres = await service.searchTuitionCentres({ search: 'Learning' });
    log(`Found ${learningCentres.data.length} centres`);
    const expectedLearning = ['ABC Learning Centre', 'Smart Learning Studio', 'Victory Learning Centre'];
    const actualLearning = learningCentres.data.map(c => c.name).sort();
    const learningMatch = expectedLearning.sort().every((name, i) => actualLearning[i] === name);
    logResult(learningMatch && learningCentres.data.length === 3, '3 centres with "Learning" in name', `${learningCentres.data.length} centres`);
    learningCentres.data.forEach(c => log(`  - ${c.name}`));

    // Test 13: Combined search + filter
    logTest('Combined: Search "Education" AND Primary level');
    const eduPrimary = await service.searchTuitionCentres({ 
      search: 'Education',
      levels: ['Primary']
    });
    log(`Found ${eduPrimary.data.length} centres`);
    const expectedEduPrimary = ['Wisdom Education Hub'];
    const actualEduPrimary = eduPrimary.data.map(c => c.name).sort();
    const eduPrimaryMatch = expectedEduPrimary.sort().every((name, i) => actualEduPrimary[i] === name);
    logResult(eduPrimaryMatch && eduPrimary.data.length === 1, '1 centre with "Education" AND Primary', `${eduPrimary.data.length} centres`);
    eduPrimary.data.forEach(c => log(`  - ${c.name} (${c.location}) - (${c.levels.map(l => l.name).join(', ')})`));

    // Test 14: Pagination
    logTest('Pagination: Page 1, Limit 3');
    const page1 = await service.searchTuitionCentres({ page: 1, limit: 3 });
    log(`Found ${page1.data.length} centres on page 1`);
    log(`Total: ${page1.pagination.total}, Pages: ${page1.pagination.totalPages}`);
    logResult(
      page1.data.length === 3 && 
      page1.pagination.page === 1 && 
      page1.pagination.total === 10 && 
      page1.pagination.totalPages === 4,
      '3 centres, page 1/4',
      `${page1.data.length} centres, page ${page1.pagination.page}/${page1.pagination.totalPages}`
    );
    page1.data.forEach(c => log(`  - ${c.name}`));

    // Test 15: WhatsApp link validation
    logTest('WhatsApp link format validation');
    const centresWithWhatsApp = await service.searchTuitionCentres({ limit: 3 });
    let allLinksValid = true;
    centresWithWhatsApp.data.forEach(c => {
      const isValid = /^https:\/\/wa\.me\/\d+$/.test(c.whatsappLink);
      log(`  ${isValid ? '✓' : '✗'} ${c.name}: ${c.whatsappLink}`, isValid ? 'green' : 'red');
      if (!isValid) allLinksValid = false;
    });
    logResult(allLinksValid, 'All WhatsApp links valid', allLinksValid ? 'All valid' : 'Some invalid');

    // Summary
    log('\n' + '='.repeat(60), 'blue');
    log('✅ Filter Validation Complete!', 'green');
    log('='.repeat(60), 'blue');

  } catch (error) {
    log(`\n❌ Error during validation: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation
validateFilters();
