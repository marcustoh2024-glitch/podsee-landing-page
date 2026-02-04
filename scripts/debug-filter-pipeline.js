#!/usr/bin/env node

/**
 * Debug Filter Pipeline
 * 
 * Traces the entire filter pipeline to identify where it breaks
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugPipeline() {
  console.log('🔍 DEBUGGING FILTER PIPELINE\n');
  console.log('═══════════════════════════════════════\n');
  
  try {
    // Test Case 1: JC1 + Economics (should return results)
    console.log('📋 TEST CASE 1: JC1 + Economics');
    console.log('─────────────────────────────────────');
    await testFilterCombo('JC1', 'Economics');
    console.log('\n');
    
    // Test Case 2: S3 + Physics (should return results)
    console.log('📋 TEST CASE 2: S3 + Physics');
    console.log('─────────────────────────────────────');
    await testFilterCombo('S3', 'Physics');
    console.log('\n');
    
    // Test Case 3: P1 + English (should return results)
    console.log('📋 TEST CASE 3: P1 + English');
    console.log('─────────────────────────────────────');
    await testFilterCombo('P1', 'English');
    console.log('\n');
    
    // Check what the UI actually sends
    console.log('📋 CHECKING UI FILTER OPTIONS');
    console.log('─────────────────────────────────────');
    const [levels, subjects] = await Promise.all([
      prisma.level.findMany({
        where: { offerings: { some: {} } },
        select: { name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.subject.findMany({
        where: { offerings: { some: {} } },
        select: { name: true },
        orderBy: { name: 'asc' }
      })
    ]);
    
    console.log('Available levels in DB:');
    console.log(levels.map(l => l.name).join(', '));
    console.log('\nAvailable subjects in DB:');
    console.log(subjects.map(s => s.name).join(', '));
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

async function testFilterCombo(levelName, subjectName) {
  console.log(`Testing: level="${levelName}", subject="${subjectName}"\n`);
  
  // Step 1: Check if level exists
  console.log('Step 1: Check if level exists in DB');
  const level = await prisma.level.findFirst({
    where: { name: levelName }
  });
  
  if (!level) {
    console.log(`❌ Level "${levelName}" NOT FOUND in database`);
    console.log('   Available levels:');
    const allLevels = await prisma.level.findMany({ select: { name: true } });
    console.log('   ' + allLevels.map(l => l.name).join(', '));
    return;
  }
  console.log(`✅ Level found: ${level.name} (ID: ${level.id})`);
  
  // Step 2: Check if subject exists
  console.log('\nStep 2: Check if subject exists in DB');
  const subject = await prisma.subject.findFirst({
    where: { name: subjectName }
  });
  
  if (!subject) {
    console.log(`❌ Subject "${subjectName}" NOT FOUND in database`);
    console.log('   Available subjects:');
    const allSubjects = await prisma.subject.findMany({ select: { name: true } });
    console.log('   ' + allSubjects.map(s => s.name).join(', '));
    return;
  }
  console.log(`✅ Subject found: ${subject.name} (ID: ${subject.id})`);
  
  // Step 3: Count centres with this level
  console.log('\nStep 3: Count centres offering this level');
  const centresWithLevel = await prisma.tuitionCentre.count({
    where: {
      offerings: {
        some: {
          levelId: level.id
        }
      }
    }
  });
  console.log(`   Centres with ${levelName}: ${centresWithLevel}`);
  
  // Step 4: Count centres with this subject
  console.log('\nStep 4: Count centres offering this subject');
  const centresWithSubject = await prisma.tuitionCentre.count({
    where: {
      offerings: {
        some: {
          subjectId: subject.id
        }
      }
    }
  });
  console.log(`   Centres with ${subjectName}: ${centresWithSubject}`);
  
  // Step 5: Count centres with BOTH (AND logic)
  console.log('\nStep 5: Count centres offering BOTH (AND logic)');
  const centresWithBoth = await prisma.tuitionCentre.count({
    where: {
      AND: [
        { offerings: { some: { levelId: level.id } } },
        { offerings: { some: { subjectId: subject.id } } }
      ]
    }
  });
  console.log(`   Centres with ${levelName} AND ${subjectName}: ${centresWithBoth}`);
  
  // Step 6: Get sample centres
  if (centresWithBoth > 0) {
    console.log('\nStep 6: Sample centres (first 5)');
    const sampleCentres = await prisma.tuitionCentre.findMany({
      where: {
        AND: [
          { offerings: { some: { levelId: level.id } } },
          { offerings: { some: { subjectId: subject.id } } }
        ]
      },
      select: {
        id: true,
        name: true
      },
      take: 5
    });
    
    sampleCentres.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (ID: ${c.id})`);
    });
  } else {
    console.log('\n❌ NO CENTRES FOUND with both filters');
    
    // Debug: Check if there are any offerings with this combination
    console.log('\nDebug: Check offerings table directly');
    const offerings = await prisma.offering.findMany({
      where: {
        levelId: level.id,
        subjectId: subject.id
      },
      include: {
        tuitionCentre: true
      },
      take: 5
    });
    
    if (offerings.length > 0) {
      console.log(`   Found ${offerings.length} offerings with this combo:`);
      offerings.forEach(o => {
        console.log(`   - ${o.tuitionCentre.name}`);
      });
    } else {
      console.log('   ❌ No offerings found with this level-subject combination');
    }
  }
  
  // Step 7: Simulate what the service layer does
  console.log('\nStep 7: Simulate service layer query');
  const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;
  const service = new TuitionCentreService(prisma);
  
  const result = await service.searchTuitionCentres({
    levels: [levelName],
    subjects: [subjectName]
  });
  
  console.log(`   Service returned: ${result.pagination.total} centres`);
  if (result.pagination.total > 0) {
    console.log(`   Sample: ${result.data.slice(0, 3).map(c => c.name).join(', ')}`);
  }
}

debugPipeline();
